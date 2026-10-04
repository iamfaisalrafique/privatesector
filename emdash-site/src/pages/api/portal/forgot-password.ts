import type { APIRoute } from 'astro';
import { extractClientIp } from '../../../lib/client-ip.ts';
import {
  computeLockoutKey,
  checkLoginRateLimit,
  createPasswordResetRequest,
  verifyCsrfOrigin
} from '../../../lib/portal-auth.ts';
import { dbGet, ensurePortalAuthTables } from '../../../lib/db.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // 1. CSRF Protection
  if (!verifyCsrfOrigin(request)) {
    return new Response(
      JSON.stringify({ error: 'Invalid origin or referer' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Parse request
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

  const { email } = body || {};
  if (!email || typeof email !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Email is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const clientIp = extractClientIp(request.headers);
  const lockoutKey = computeLockoutKey(clientIp, email);

  // 3. Rate Limit Check
  const rateLimitStatus = await checkLoginRateLimit(lockoutKey);
  if (!rateLimitStatus.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please try again later.',
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

  // 4. Check if user exists (Anti-enumeration: identical response regardless)
  await ensurePortalAuthTables();
  const user = await dbGet<{ id: any; email: string }>(
    'SELECT id, email FROM users WHERE LOWER(email) = LOWER(?)',
    [email.trim()]
  );

  if (user) {
    // Generate secure reset token stored in DB; simulated outbound email dispatcher
    await createPasswordResetRequest(user.email);
  }

  // Anti-enumeration guarantee: exact identical JSON body and HTTP 200 status
  // Password reset token is NEVER returned in response.
  return new Response(
    JSON.stringify({
      success: true,
      message: 'If the account exists, password reset instructions have been dispatched.'
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
