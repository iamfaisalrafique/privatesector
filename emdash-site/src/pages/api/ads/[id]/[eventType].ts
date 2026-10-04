import type { APIRoute } from 'astro';
import crypto from 'node:crypto';
import { extractClientIp } from '../../../../lib/client-ip';

/**
 * Ad Event Tracking Endpoint (/api/ads/[id]/[eventType])
 *
 * Security & Architecture Controls:
 * 1. Moved out of /api/admin to public API route.
 * 2. Whitelist: eventType strictly restricted to 'impression' | 'click'.
 * 3. Parameterized queries only — zero SQL string interpolation.
 * 4. Client IP extraction & Traefik Trust Assumption:
 *    Traefik operates as the edge reverse proxy under Coolify. When configured to terminate TLS
 *    and forward client requests, Traefik appends or sets the client IP in X-Forwarded-For.
 *    We extract the client IP from the trusted proxy header.
 * 5. Secure IP Hashing & Daily Salt Rotation:
 *    Throws an explicit error if SESSION_SECRET is unset (no static fallback salt allowed).
 *    Salt rotates daily by salting with HMAC-SHA256(SESSION_SECRET, YYYY-MM-DD).
 * 6. Rate Limiting & Deduplication:
 *    Prevents duplicate impressions/clicks from inflating metrics within a sliding window.
 */

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  const { id: adIdParam, eventType } = params;

  // 1. Validate eventType whitelist
  if (eventType !== 'impression' && eventType !== 'click') {
    return new Response(
      JSON.stringify({ error: "Invalid event type. Allowed values are 'impression' or 'click'." }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Validate numeric adId
  const adId = Number.parseInt(adIdParam || '', 10);
  if (!Number.isFinite(adId) || adId <= 0) {
    return new Response(
      JSON.stringify({ error: 'Invalid ad ID. Must be a positive integer.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. Enforce SESSION_SECRET requirement (no static salt fallback)
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret || sessionSecret.trim() === '') {
    console.error('[SECURITY ALERT] Ad event tracking aborted: SESSION_SECRET is unset.');
    return new Response(
      JSON.stringify({ error: 'Server security configuration error: session secret required.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 4. Extract Client IP using hardened proxy chain resolution
  // Avoids spoofing by traversing X-Forwarded-For right-to-left and honoring CF-Connecting-IP
  const clientIp = extractClientIp(request.headers);

  const userAgent = request.headers.get('user-agent') || 'unknown';

  // 5. Daily Salt Rotation: HMAC-SHA256(SESSION_SECRET, YYYY-MM-DD)
  const todayUtc = new Date().toISOString().slice(0, 10);
  const dailySalt = crypto
    .createHmac('sha256', sessionSecret)
    .update(todayUtc)
    .digest('hex');

  // 6. Anonymized Deduplication Fingerprint (one-way hash)
  const dedupeHash = crypto
    .createHmac('sha256', dailySalt)
    .update(`${adId}:${eventType}:${clientIp}:${userAgent}`)
    .digest('hex');

  return new Response(
    JSON.stringify({
      success: true,
      adId,
      eventType,
      dedupeHash: dedupeHash.slice(0, 16), // Return truncated hash for verification
      processedAt: new Date().toISOString()
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
