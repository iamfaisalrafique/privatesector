import type { APIRoute } from 'astro';
import {
  verifyAndConsumeResetToken,
  hashPassword,
  verifyCsrfOrigin
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

  const { token, newPassword } = body || {};
  if (!token || typeof token !== 'string' || !newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return new Response(
      JSON.stringify({ error: 'Token and a valid password (minimum 8 characters) are required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. Verify & Consume Token
  await ensurePortalAuthTables();
  const email = await verifyAndConsumeResetToken(token);
  if (!email) {
    return new Response(
      JSON.stringify({ error: 'Invalid or expired password reset token.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 4. Update Password with Argon2id hash
  const newHash = await hashPassword(newPassword);
  await dbRun('UPDATE users SET password_hash = ? WHERE LOWER(email) = LOWER(?)', [newHash, email]);

  // Invalidate any active sessions for this user
  await dbRun('UPDATE portal_sessions SET revoked = 1 WHERE LOWER(email) = LOWER(?)', [email]);

  return new Response(
    JSON.stringify({ success: true, message: 'Password has been successfully updated. You may now log in.' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
