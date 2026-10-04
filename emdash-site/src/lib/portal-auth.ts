/**
 * Student Portal Authentication Helper (app_schema)
 *
 * Students are portal users stored in app_schema.
 * They do NOT possess EmDash CMS accounts and have zero access to /_emdash/admin.
 */

export interface PortalUser {
  id: number | string;
  profile_id?: number | string;
  email: string;
  name: string;
  role: 'student' | 'company' | 'admin';
}

/**
 * Resolves the authenticated portal user from the session cookie or authorization header.
 */
export async function getPortalSession(request: Request): Promise<PortalUser | null> {
  // 1. Check Authorization Bearer header (for portal API calls / test harness)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token.startsWith('portal_session_')) {
      try {
        const decoded = JSON.parse(Buffer.from(token.replace('portal_session_', ''), 'base64url').toString('utf8'));
        if (decoded && decoded.role) {
          return decoded as PortalUser;
        }
      } catch (e) {
        // invalid token
      }
    }
  }

  // 2. Check portal session cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/portal_session=([^;]+)/);
  if (match) {
    try {
      const decoded = JSON.parse(Buffer.from(match[1], 'base64url').toString('utf8'));
      if (decoded && decoded.role) {
        return decoded as PortalUser;
      }
    } catch (e) {
      // invalid cookie
    }
  }

  return null;
}
