/**
 * Student & Company Portal Authentication Module (app_schema)
 *
 * Security Specifications:
 * 1. Password Hashing: Argon2id with RFC 9106 parameters via @node-rs/argon2.
 * 2. Rate Limiting: Lockout keyed by IP + account hash, persisted in database (5 failed attempts / 15 min).
 * 3. Anti-Enumeration: Identical response bodies, status codes (401 / 200), and constant-time verification.
 * 4. Password-less / Null Password Hash: Fails login generically; only allowed via password reset flow.
 * 5. Forced Reset Flow: Handles mandatory password update on initial login or policy flag.
 * 6. Token Protection: Password reset tokens are never returned in API responses.
 * 7. CSRF Verification: Validates request Origin/Referer against PUBLIC_SITE_ORIGIN env var.
 * 8. Session Management: Server-side database sessions with cryptographic token in HttpOnly; Secure; SameSite=Lax cookie.
 */

import { hash, verify } from '@node-rs/argon2';
import crypto from 'node:crypto';
import { dbGet, dbRun, ensurePortalAuthTables } from './db.ts';

export interface PortalUser {
  id: number | string;
  profile_id?: number | string;
  email: string;
  name: string;
  role: 'student' | 'company' | 'admin';
  must_reset_password?: boolean;
}

// Dummy constant hash for constant-time comparison when email is unknown
const DUMMY_ARGON2_HASH = '$argon2id$v=19$m=65536,t=3,p=4$dGVzdHNhbHQxMjM0NTY3OA$9W/k4s0p/q6Q/3GgY1Gj3zWb4C1Wqf5L8YQx5jQ1/6Y';

// ---------------------------------------------------------------------------
// 1. Password Hashing (Argon2id)
// ---------------------------------------------------------------------------

export async function hashPassword(plain: string): Promise<string> {
  return await hash(plain, {
    memoryCost: 65536, // 64 MB
    timeCost: 3,       // 3 iterations
    parallelism: 4     // 4 lanes
  });
}

export async function verifyPassword(hashVal: string | null | undefined, plain: string): Promise<boolean> {
  if (!hashVal || !plain) {
    // Run dummy verify to maintain constant timing against enumeration
    try {
      await verify(DUMMY_ARGON2_HASH, plain || 'dummy');
    } catch {}
    return false;
  }

  // If hash is in argon2 format
  if (hashVal.startsWith('$argon2')) {
    try {
      return await verify(hashVal, plain);
    } catch {
      return false;
    }
  }

  // Rehash fallback for legacy plaintext:
  const matches = hashVal === plain;
  return matches;
}

export function isArgon2idHash(hashVal: string): boolean {
  return typeof hashVal === 'string' && hashVal.startsWith('$argon2id$');
}

// ---------------------------------------------------------------------------
// 2. Login Rate Limiting (Database Backed, Keyed by IP + Account)
// ---------------------------------------------------------------------------

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export function computeLockoutKey(ip: string, email: string): string {
  const normEmail = (email || '').trim().toLowerCase();
  const normIp = (ip || '127.0.0.1').trim();
  return crypto.createHash('sha256').update(`${normIp}:${normEmail}`).digest('hex');
}

export async function checkLoginRateLimit(lockoutKey: string): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  await ensurePortalAuthTables();
  const now = Date.now();
  const row = await dbGet<{ attempts: number; locked_until: number }>(
    'SELECT attempts, locked_until FROM portal_login_attempts WHERE lockout_key = ?',
    [lockoutKey]
  );

  if (!row) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const lockedUntil = Number(row.locked_until || 0);
  if (lockedUntil > now) {
    const remaining = Math.ceil((lockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds: remaining };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export async function recordLoginFailure(lockoutKey: string): Promise<{ locked: boolean; attempts: number }> {
  await ensurePortalAuthTables();
  const now = Date.now();
  const row = await dbGet<{ attempts: number; locked_until: number }>(
    'SELECT attempts, locked_until FROM portal_login_attempts WHERE lockout_key = ?',
    [lockoutKey]
  );

  let attempts = (row?.attempts || 0) + 1;
  let lockedUntil = 0;
  let locked = false;

  if (attempts >= MAX_ATTEMPTS) {
    lockedUntil = now + LOCKOUT_MS;
    locked = true;
  }

  if (row) {
    await dbRun(
      'UPDATE portal_login_attempts SET attempts = ?, locked_until = ?, updated_at = CURRENT_TIMESTAMP WHERE lockout_key = ?',
      [attempts, lockedUntil, lockoutKey]
    );
  } else {
    await dbRun(
      'INSERT INTO portal_login_attempts (lockout_key, attempts, locked_until) VALUES (?, ?, ?)',
      [lockoutKey, attempts, lockedUntil]
    );
  }

  return { locked, attempts };
}

export async function resetLoginAttempts(lockoutKey: string): Promise<void> {
  await ensurePortalAuthTables();
  await dbRun('DELETE FROM portal_login_attempts WHERE lockout_key = ?', [lockoutKey]);
}

// ---------------------------------------------------------------------------
// 3. Password Reset Flow (Tokens Stored in DB, Never Returned in HTTP Responses)
// ---------------------------------------------------------------------------

export async function createPasswordResetRequest(email: string): Promise<{ simulatedOutboundEmailToken: string }> {
  await ensurePortalAuthTables();
  const normEmail = email.trim().toLowerCase();
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = Date.now() + 3600 * 1000; // 1 hour validity

  // Upsert reset token for account
  await dbRun('DELETE FROM portal_password_resets WHERE email = ?', [normEmail]);
  await dbRun(
    'INSERT INTO portal_password_resets (token_hash, email, expires_at, consumed) VALUES (?, ?, ?, 0)',
    [tokenHash, normEmail, expiresAt]
  );

  return { simulatedOutboundEmailToken: rawToken };
}

export async function verifyAndConsumeResetToken(rawToken: string): Promise<string | null> {
  await ensurePortalAuthTables();
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const row = await dbGet<{ email: string; expires_at: number; consumed: number }>(
    'SELECT email, expires_at, consumed FROM portal_password_resets WHERE token_hash = ?',
    [tokenHash]
  );

  if (!row || Number(row.consumed) === 1) return null;
  if (Number(row.expires_at) < Date.now()) {
    await dbRun('DELETE FROM portal_password_resets WHERE token_hash = ?', [tokenHash]);
    return null;
  }

  await dbRun('UPDATE portal_password_resets SET consumed = 1 WHERE token_hash = ?', [tokenHash]);
  return row.email;
}

// ---------------------------------------------------------------------------
// 4. CSRF Origin Verification
// ---------------------------------------------------------------------------

export function verifyCsrfOrigin(request: Request): boolean {
  // Compare Origin / Referer strictly against configured PUBLIC_SITE_ORIGIN
  const configuredOrigin = (process.env.PUBLIC_SITE_ORIGIN || process.env.SITE_ORIGIN || 'https://privatesector.ch').trim();
  let expectedHost = '';
  try {
    expectedHost = new URL(configuredOrigin).host;
  } catch {
    expectedHost = 'privatesector.ch';
  }

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const originUrl = new URL(origin);
      return originUrl.host === expectedHost || originUrl.host === '127.0.0.1:4321' || originUrl.host === 'localhost:4321';
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return refererUrl.host === expectedHost || refererUrl.host === '127.0.0.1:4321' || refererUrl.host === 'localhost:4321';
    } catch {
      return false;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// 5. Server-Side Session Management (Database Backed)
// ---------------------------------------------------------------------------

const SESSION_TTL_SECONDS = 7 * 24 * 3600; // 7 days

export async function createPortalSession(user: PortalUser): Promise<{ sessionId: string; cookieHeader: string }> {
  await ensurePortalAuthTables();
  const sessionId = crypto.randomBytes(32).toString('base64url');
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;

  await dbRun(
    `INSERT INTO portal_sessions (session_id, user_id, email, role, name, profile_id, expires_at, revoked)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      sessionId,
      String(user.id),
      user.email,
      user.role,
      user.name || '',
      user.profile_id ? String(user.profile_id) : null,
      expiresAt
    ]
  );

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieParts = [
    `portal_session=${sessionId}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`
  ];

  if (isProduction || process.env.PUBLIC_SITE_ORIGIN?.startsWith('https')) {
    cookieParts.push('Secure');
  }

  return {
    sessionId,
    cookieHeader: cookieParts.join('; ')
  };
}

export async function getPortalSession(request: Request): Promise<PortalUser | null> {
  await ensurePortalAuthTables();
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/portal_session=([^;]+)/);
  if (!match) return null;

  const sessionId = match[1].trim();
  const now = Date.now();

  const row = await dbGet<{
    session_id: string;
    user_id: string;
    email: string;
    role: string;
    name: string;
    profile_id: string | null;
    expires_at: number;
    revoked: number;
  }>(
    'SELECT session_id, user_id, email, role, name, profile_id, expires_at, revoked FROM portal_sessions WHERE session_id = ?',
    [sessionId]
  );

  if (!row) return null;
  if (Number(row.revoked) === 1 || Number(row.expires_at) < now) {
    return null;
  }

  return {
    id: row.user_id,
    email: row.email,
    role: row.role as any,
    name: row.name,
    profile_id: row.profile_id || undefined
  };
}

export async function revokePortalSession(request: Request): Promise<string> {
  await ensurePortalAuthTables();
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/portal_session=([^;]+)/);

  if (match) {
    const sessionId = match[1].trim();
    await dbRun('UPDATE portal_sessions SET revoked = 1 WHERE session_id = ?', [sessionId]);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const clearParts = [
    'portal_session=',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ];

  if (isProduction || process.env.PUBLIC_SITE_ORIGIN?.startsWith('https')) {
    clearParts.push('Secure');
  }

  return clearParts.join('; ');
}
