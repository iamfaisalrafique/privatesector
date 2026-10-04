import type { APIRoute } from 'astro';
import { revokePortalSession, verifyCsrfOrigin } from '../../../lib/portal-auth.ts';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  // 1. CSRF Protection
  if (!verifyCsrfOrigin(request)) {
    return new Response(
      JSON.stringify({ error: 'Invalid origin or referer' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Revoke session server-side in DB and clear cookie
  const clearCookieHeader = await revokePortalSession(request);

  return new Response(
    JSON.stringify({ success: true, message: 'Successfully logged out.' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearCookieHeader
      }
    }
  );
};
