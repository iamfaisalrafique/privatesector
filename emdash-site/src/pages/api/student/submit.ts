import type { APIRoute } from 'astro';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { htmlToPortableText } from '@emdash-cms/gutenberg-to-portable-text';
import { getPortalSession, verifyCsrfOrigin } from '../../../lib/portal-auth.ts';

/**
 * Student Article Submission Endpoint (/api/student/submit)
 *
 * Architecture & Security Specification:
 * 1. Students are portal users in app_schema. They do NOT get EmDash CMS accounts,
 *    cannot log into EmDash, and have zero access to /_emdash/admin.
 * 2. Authenticates the student strictly from the portal session cookie.
 * 3. Enforces CSRF Origin/Referer verification on state-changing submission.
 * 4. Author identity (student_author_id, author_name) is derived strictly from the portal session.
 * 5. Calls EmDash content API using ONE dedicated internal service token (EMDASH_STUDENT_SERVICE_PAT),
 *    which belongs to a single system-level Contributor user in EmDash.
 * 6. Submissions are strictly created in 'draft' status for editorial review.
 * 7. Any client-supplied student_id, student_author_id, author_name, status, publishedAt,
 *    or authorId in the request body is strictly ignored.
 */

export const prerender = false;

function normalizeHtmlForPortableText(html: string): string {
  const preBlocks: string[] = [];
  const withoutPre = html.replace(/<pre[\s\S]*?<\/pre>/gi, (match) => {
    preBlocks.push(match);
    return `___PRE_BLOCK_${preBlocks.length - 1}___`;
  });
  let normalized = withoutPre.replace(/\n+/g, ' ');
  normalized = normalized.replace(/___PRE_BLOCK_(\d+)___/g, (_, idx) => preBlocks[Number(idx)]);
  return normalized;
}

export const POST: APIRoute = async ({ request }) => {
  // 1. CSRF Protection: Verify request Origin matches Host
  if (!verifyCsrfOrigin(request)) {
    return new Response(
      JSON.stringify({ error: 'Forbidden: CSRF origin validation failed.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Authenticate student strictly from portal session cookie (app_schema)
  // Students are portal users, NOT EmDash CMS users. They never get CMS accounts or admin access.
  const portalStudent = await getPortalSession(request);

  if (!portalStudent) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Valid student portal session required.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (portalStudent.role !== 'student') {
    return new Response(
      JSON.stringify({ error: 'Forbidden: Student portal access required.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Author identity strictly derived from portal session
  const serverStudentAuthorId = portalStudent.profile_id ?? portalStudent.id;
  const serverAuthorName = portalStudent.name || portalStudent.email;

  // 2. Safe JSON Parse
  let payload: any;
  try {
    const rawBody = await request.text();
    if (!rawBody || rawBody.length > 500_000) {
      return new Response(
        JSON.stringify({ error: 'Payload exceeds maximum allowed size (500 KB)' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }
    payload = JSON.parse(rawBody);
  } catch {
    return new Response(
      JSON.stringify({ error: 'Malformed JSON payload' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. Strict Payload Validation (Client overrides on author or status are ignored)
  const { title, subtitle, content_body, category } = payload || {};

  if (!title || typeof title !== 'string' || title.trim().length < 5 || title.length > 200) {
    return new Response(
      JSON.stringify({ error: 'Validation failed: title must be a string between 5 and 200 characters.' }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (subtitle && (typeof subtitle !== 'string' || subtitle.length > 300)) {
    return new Response(
      JSON.stringify({ error: 'Validation failed: subtitle cannot exceed 300 characters.' }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!content_body || typeof content_body !== 'string' || content_body.trim().length < 20 || content_body.length > 100_000) {
    return new Response(
      JSON.stringify({ error: 'Validation failed: content_body must be between 20 and 100,000 characters.' }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 4. Proper Markdown -> HTML -> Portable Text Pipeline
  const markedHtml = marked.parse(content_body.trim()) as string;
  const sanitizedHtml = sanitizeHtml(markedHtml, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'b', 'em', 'i',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr', 'a', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td'
    ],
    allowedAttributes: {
      '*': ['class', 'id'],
      'a': ['href', 'target', 'rel', 'title'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'th': ['colspan', 'rowspan'],
      'td': ['colspan', 'rowspan']
    }
  });

  const normalizedHtml = normalizeHtmlForPortableText(sanitizedHtml);
  const portableTextBlocks = htmlToPortableText(normalizedHtml);

  // 5. Fixed Internal Origin & Low-Privilege PAT
  const internalBaseUrl = process.env.EMDASH_INTERNAL_URL || 'http://127.0.0.1:4321';
  const token = process.env.EMDASH_STUDENT_SERVICE_PAT || process.env.EMDASH_STUDENT_PAT;

  if (!token) {
    console.error('[SECURITY CONFIG ERROR] EMDASH_STUDENT_SERVICE_PAT is not set in environment.');
    return new Response(
      JSON.stringify({ error: 'Server configuration error: submission token unavailable.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 6. Post to EmDash Content API as DRAFT with session-derived author info
  try {
    const response = await fetch(`${internalBaseUrl}/_emdash/api/content/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: title.trim(),
        status: 'draft', // Strictly forced to draft
        data: {
          title: title.trim(),
          subtitle: subtitle?.trim() || '',
          student_author_id: typeof serverStudentAuthorId === 'number' ? serverStudentAuthorId : (parseInt(String(serverStudentAuthorId).replace(/\D/g, ''), 10) || 1),
          author_name: serverAuthorName,
          content: portableTextBlocks
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error || 'EmDash creation rejected' }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Draft submitted successfully for editorial review.',
        id: data.id || data.data?.item?.id,
        author: {
          student_author_id: serverStudentAuthorId,
          author_name: serverAuthorName
        }
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Error forwarding submission to internal EmDash API:', err);
    return new Response(
      JSON.stringify({ error: 'Internal communication failure with content repository.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

