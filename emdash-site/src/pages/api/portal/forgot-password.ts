import type { APIRoute } from 'astro';
import nodeCrypto from 'node:crypto';
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

  // 3. Multi-tier Rate Limit Check
  const rateLimitStatus = await checkLoginRateLimit(clientIp, email);
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

  const startTime = performance.now();
  const MIN_RESPONSE_DURATION_MS = 300;

  // 4. Equal Work on Request Path & Constant-Time Response:
  // Both known and unknown accounts execute a DB read and dummy work on the request path
  // to avoid side-channel timing discrepancies.
  try {
    await ensurePortalAuthTables();
    const user = await dbGet<{ id: any; email: string }>(
      'SELECT id, email FROM users WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );

    if (user) {
      // Create password reset request token
      await createPasswordResetRequest(user.email);
      // Real email dispatch is decoupled to background/queue
    } else {
      // Execute equivalent cryptographic work for unknown accounts
      nodeCrypto.randomBytes(32).toString('hex');
      nodeCrypto.createHash('sha256').update(email).digest('hex');
    }
  } catch (err) {
    console.error('[RESET REQUEST ERROR]:', err);
  }

  // 5. Constant-Time Padding:
  // Pad the total response time to a fixed minimum of 300ms
  const elapsed = performance.now() - startTime;
  if (elapsed < MIN_RESPONSE_DURATION_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_RESPONSE_DURATION_MS - elapsed));
  }

  // Anti-enumeration guarantee: exact identical JSON body, status 200, and identical padded timing
  return new Response(
    JSON.stringify({
      success: true,
      message: 'If the account exists, password reset instructions have been dispatched.'
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
