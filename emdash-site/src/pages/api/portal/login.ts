import type { APIRoute } from 'astro';
import { extractClientIp } from '../../../lib/client-ip.ts';
import {
  computeLockoutKey,
  checkLoginRateLimit,
  recordLoginFailure,
  resetLoginAttempts,
  verifyPassword,
  createPortalSession,
  verifyCsrfOrigin,
  type PortalUser
} from '../../../lib/portal-auth.ts';
import { dbGet, dbRun, ensurePortalAuthTables } from '../../../lib/db.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // 1. CSRF Protection
  if (!verifyCsrfOrigin(request)) {
    return new Response(
      JSON.stringify({ error: 'Invalid origin or referer' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Parse body
  let body: any;
  try {
    const rawText = await request.text();
    body = rawText ? JSON.parse(rawText) : {};
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON payload' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { email, password } = body || {};
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Invalid email or password' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const clientIp = extractClientIp(request.headers);
  const lockoutKey = computeLockoutKey(clientIp, email);

  // 3. Rate Limit Check
  const rateLimitStatus = await checkLoginRateLimit(lockoutKey);
  if (!rateLimitStatus.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many failed login attempts. Please try again later.',
        retryAfterSeconds: rateLimitStatus.retryAfterSeconds
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimitStatus.retryAfterSeconds)
        }
      }
    );
  }

  // 4. Query user from app_schema / users
  await ensurePortalAuthTables();
  const user = await dbGet<{
    id: number | string;
    email: string;
    password_hash: string | null;
    role: string;
    profile_id?: number | string;
    name?: string;
  }>('SELECT id, email, password_hash, role, profile_id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);

  // If user does not exist OR password_hash is null/empty -> run constant-time dummy verification and fail generically
  const isValid = await verifyPassword(user?.password_hash, password);

  if (!user || !isValid) {
    const failResult = await recordLoginFailure(lockoutKey);
    if (failResult.locked) {
      return new Response(
        JSON.stringify({
          error: 'Too many failed login attempts. Account temporarily locked.',
          retryAfterSeconds: 900
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900'
          }
        }
      );
    }
    // Anti-enumeration: exact identical error message and status code
    return new Response(
      JSON.stringify({ error: 'Invalid email or password' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Successful login: reset attempts
  await resetLoginAttempts(lockoutKey);

  // Retrieve display name if student profile exists
  let displayName = user.email;
  if (user.role === 'student' && user.profile_id) {
    const st = await dbGet<{ name: string }>('SELECT name FROM student_profiles WHERE id = ?', [user.profile_id]);
    if (st?.name) displayName = st.name;
  }

  const portalUser: PortalUser = {
    id: user.id,
    profile_id: user.profile_id,
    email: user.email,
    role: user.role as any,
    name: displayName
  };

  const { cookieHeader } = await createPortalSession(portalUser);

  return new Response(
    JSON.stringify({
      success: true,
      user: {
        id: portalUser.id,
        email: portalUser.email,
        role: portalUser.role,
        name: portalUser.name,
        profile_id: portalUser.profile_id
      }
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieHeader
      }
    }
  );
};
