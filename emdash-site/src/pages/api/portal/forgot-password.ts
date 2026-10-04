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

  // 4. Asynchronous Background Dispatch:
  // Decouple DB lookup & token generation from the HTTP request/response cycle so that
  // the HTTP response is returned immediately and cannot leak timing information.
  setImmediate(async () => {
    try {
      await ensurePortalAuthTables();
      const user = await dbGet<{ id: any; email: string }>(
        'SELECT id, email FROM users WHERE LOWER(email) = LOWER(?)',
        [email.trim()]
      );
      if (user) {
        await createPasswordResetRequest(user.email);
        // Outbound email dispatched asynchronously here
      }
    } catch (err) {
      console.error('[BACKGROUND RESET DISPATCH ERROR]:', err);
    }
  });

  // Anti-enumeration guarantee: exact identical JSON body, status 200, and flat constant timing
  // Password reset token is NEVER returned in response.
  return new Response(
    JSON.stringify({
      success: true,
      message: 'If the account exists, password reset instructions have been dispatched.'
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
