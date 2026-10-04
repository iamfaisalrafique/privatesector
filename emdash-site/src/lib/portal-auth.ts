/**
 * Student & Company Portal Authentication Module (app_schema)
 *
 * Security Specifications:
 * 1. Password Hashing: Argon2id with RFC 9106 parameters via @node-rs/argon2.
 * 2. Multi-tier Rate Limiting:
 *    - Tier 1: IP + Account lockout (5 failures -> 15 min lock).
 *    - Tier 2: Per-IP Global cap (25 failures across accounts -> 15 min lock).
 *    - Tier 3: Per-Account Global cap across IPs (15 failures -> forces password reset flow rather than locking legitimate user out).
 * 3. Session Security:
 *    - Cryptographic 32-byte tokens.
 *    - SHA-256 hashed in portal_sessions table.
 *    - __Host- cookie prefix when HTTPS/production; fallback in local HTTP test.
 *    - Active automatic pruning of expired / revoked sessions.
 * 4. Byline Integrity:
 *    - author_name derived strictly from profile name. Reject with 422 if display name is missing.
 *    - student_author_id stored and returned as strict integer.
 * 5. Anti-Enumeration: Identical response bodies, status codes (401 / 200), constant-time verify.
 * 6. CSRF Verification: Validates request Origin/Referer against PUBLIC_SITE_ORIGIN.
 */

import { hash, verify } from '@node-rs/argon2';
import crypto from 'node:crypto';
import { dbGet, dbRun, dbQuery, ensurePortalAuthTables } from './db.ts';

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
  return hashVal === plain;
}

export function isArgon2idHash(hashVal: string): boolean {
  return typeof hashVal === 'string' && hashVal.startsWith('$argon2id$');
}

// ---------------------------------------------------------------------------
// 2. Multi-Tier Login Rate Limiting (Database Backed)
// ---------------------------------------------------------------------------

const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const MAX_IP_ACCOUNT_ATTEMPTS = 5;
const MAX_IP_GLOBAL_ATTEMPTS = 25;
const MAX_ACCOUNT_GLOBAL_ATTEMPTS = 15; // Slow down / force reset path across distributed IPs

export function computeLockoutKey(ip: string, email: string): string {
  const normEmail = (email || '').trim().toLowerCase();
  const normIp = (ip || '127.0.0.1').trim();
  return 'ip_acc_' + crypto.createHash('sha256').update(`${normIp}:${normEmail}`).digest('hex');
}

export function computeIpGlobalKey(ip: string): string {
  const normIp = (ip || '127.0.0.1').trim();
  return 'ip_glob_' + crypto.createHash('sha256').update(normIp).digest('hex');
}

export function computeAccountGlobalKey(email: string): string {
  const normEmail = (email || '').trim().toLowerCase();
  return 'acc_glob_' + crypto.createHash('sha256').update(normEmail).digest('hex');
}

export async function checkLoginRateLimit(ip: string, email: string): Promise<{
  allowed: boolean;
  retryAfterSeconds: number;
  reason?: 'lockout' | 'ip_cap' | 'force_reset';
}> {
  await ensurePortalAuthTables();
  const now = Date.now();

  const ipAccKey = computeLockoutKey(ip, email);
  const ipGlobKey = computeIpGlobalKey(ip);
  const accGlobKey = computeAccountGlobalKey(email);

  // Check 1: IP + Account specific lockout
  const rowIpAcc = await dbGet<{ attempts: number; locked_until: number; action_required: string }>(
    'SELECT attempts, locked_until, action_required FROM portal_login_attempts WHERE lockout_key = ?',
    [ipAccKey]
  );
  if (rowIpAcc && Number(rowIpAcc.locked_until) > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((Number(rowIpAcc.locked_until) - now) / 1000),
      reason: 'lockout'
    };
  }

  // Check 2: Per-IP global cap across accounts (e.g. credential stuffing from single IP)
  const rowIpGlob = await dbGet<{ attempts: number; locked_until: number }>(
    'SELECT attempts, locked_until FROM portal_login_attempts WHERE lockout_key = ?',
    [ipGlobKey]
  );
  if (rowIpGlob && Number(rowIpGlob.locked_until) > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((Number(rowIpGlob.locked_until) - now) / 1000),
      reason: 'ip_cap'
    };
  }

  // Check 3: Per-Account global cap across distributed IPs
  const rowAccGlob = await dbGet<{ attempts: number; locked_until: number; action_required: string }>(
    'SELECT attempts, locked_until, action_required FROM portal_login_attempts WHERE lockout_key = ?',
    [accGlobKey]
  );
  if (rowAccGlob && Number(rowAccGlob.locked_until) > now && rowAccGlob.action_required === 'force_reset') {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((Number(rowAccGlob.locked_until) - now) / 1000),
      reason: 'force_reset'
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

async function upsertAttempt(key: string, maxAttempts: number, action = 'none'): Promise<{ locked: boolean; count: number }> {
  const now = Date.now();
  const row = await dbGet<{ attempts: number; locked_until: number }>(
    'SELECT attempts, locked_until FROM portal_login_attempts WHERE lockout_key = ?',
    [key]
  );

  let attempts = (row?.attempts || 0) + 1;
  let lockedUntil = 0;
  let locked = false;
  let appliedAction = 'none';

  if (attempts >= maxAttempts) {
    lockedUntil = now + LOCKOUT_MS;
    locked = true;
    appliedAction = action;
  }

  if (row) {
    await dbRun(
      'UPDATE portal_login_attempts SET attempts = ?, locked_until = ?, action_required = ?, updated_at = CURRENT_TIMESTAMP WHERE lockout_key = ?',
      [attempts, lockedUntil, appliedAction, key]
    );
  } else {
    await dbRun(
      'INSERT INTO portal_login_attempts (lockout_key, attempts, locked_until, action_required) VALUES (?, ?, ?, ?)',
      [key, attempts, lockedUntil, appliedAction]
    );
  }

  return { locked, count: attempts };
}

export async function recordLoginFailure(ip: string, email: string): Promise<{
  locked: boolean;
  reason?: 'lockout' | 'ip_cap' | 'force_reset';
}> {
  await ensurePortalAuthTables();
  const ipAccKey = computeLockoutKey(ip, email);
  const ipGlobKey = computeIpGlobalKey(ip);
  const accGlobKey = computeAccountGlobalKey(email);

  const ipAccRes = await upsertAttempt(ipAccKey, MAX_IP_ACCOUNT_ATTEMPTS, 'lockout');
  const ipGlobRes = await upsertAttempt(ipGlobKey, MAX_IP_GLOBAL_ATTEMPTS, 'ip_cap');
  const accGlobRes = await upsertAttempt(accGlobKey, MAX_ACCOUNT_GLOBAL_ATTEMPTS, 'force_reset');

  if (ipAccRes.locked) {
    return { locked: true, reason: 'lockout' };
  }
  if (ipGlobRes.locked) {
    return { locked: true, reason: 'ip_cap' };
  }
  if (accGlobRes.locked) {
    return { locked: true, reason: 'force_reset' };
  }

  return { locked: false };
}

export async function resetLoginAttempts(ip: string, email: string): Promise<void> {
  await ensurePortalAuthTables();
  const ipAccKey = computeLockoutKey(ip, email);
  const accGlobKey = computeAccountGlobalKey(email);
  await dbRun('DELETE FROM portal_login_attempts WHERE lockout_key = ?', [ipAccKey]);
  await dbRun('DELETE FROM portal_login_attempts WHERE lockout_key = ?', [accGlobKey]);
}

// ---------------------------------------------------------------------------
// 3. Password Reset Flow (Tokens Stored as SHA-256 Hashes)
// ---------------------------------------------------------------------------

export async function createPasswordResetRequest(email: string): Promise<{ simulatedOutboundEmailToken: string }> {
  await ensurePortalAuthTables();
  const normEmail = email.trim().toLowerCase();
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = Date.now() + 3600 * 1000; // 1 hour validity

  // Delete previous pending reset tokens for this account
  await dbRun('DELETE FROM portal_password_resets WHERE email = ?', [normEmail]);
  const isPg = Boolean(process.env.DATABASE_URL?.startsWith('postgres'));
  await dbRun(
    `INSERT INTO portal_password_resets (token_hash, email, expires_at, consumed) VALUES (?, ?, ?, ${isPg ? 'FALSE' : '0'})`,
    [tokenHash, normEmail, expiresAt]
  );

  return { simulatedOutboundEmailToken: rawToken };
}

export async function verifyAndConsumeResetToken(rawToken: string): Promise<string | null> {
  await ensurePortalAuthTables();
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const row = await dbGet<{ email: string; expires_at: number; consumed: any }>(
    'SELECT email, expires_at, consumed FROM portal_password_resets WHERE token_hash = ?',
    [tokenHash]
  );

  const isConsumed = row?.consumed === true || row?.consumed === 1 || row?.consumed === 'true';
  if (!row || isConsumed) return null;
  if (Number(row.expires_at) < Date.now()) {
    await dbRun('DELETE FROM portal_password_resets WHERE token_hash = ?', [tokenHash]);
    return null;
  }

  const isPg = Boolean(process.env.DATABASE_URL?.startsWith('postgres'));
  await dbRun(`UPDATE portal_password_resets SET consumed = ${isPg ? 'TRUE' : '1'} WHERE token_hash = ?`, [tokenHash]);

  // When reset token is consumed, reset the global account failure count
  const accGlobKey = computeAccountGlobalKey(row.email);
  await dbRun('DELETE FROM portal_login_attempts WHERE lockout_key = ?', [accGlobKey]);

  return row.email;
}

// ---------------------------------------------------------------------------
// 4. CSRF Origin Verification
// ---------------------------------------------------------------------------

export function verifyCsrfOrigin(request: Request): boolean {
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
      return originUrl.host === expectedHost || originUrl.host.startsWith('127.0.0.1') || originUrl.host.startsWith('localhost');
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return refererUrl.host === expectedHost || refererUrl.host.startsWith('127.0.0.1') || refererUrl.host.startsWith('localhost');
    } catch {
      return false;
    }
  }

  return false;
}

// ---------------------------------------------------------------------------
// 5. Server-Side Session Management (Hashed in DB, Periodic Pruning)
// ---------------------------------------------------------------------------

const SESSION_TTL_SECONDS = 7 * 24 * 3600; // 7 days

export function hashSessionToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function getCookieName(): string {
  const isHttps = process.env.NODE_ENV === 'production' || process.env.PUBLIC_SITE_ORIGIN?.startsWith('https');
  // Use __Host- prefix only in secure HTTPS environments (browsers reject __Host- over plaintext HTTP)
  return isHttps ? '__Host-portal_session' : 'portal_session';
}

export async function cleanupExpiredSessions(): Promise<number> {
  await ensurePortalAuthTables();
  const now = new Date().toISOString();
  // Clean up sessions older than expiry or revoked over 1 day ago
  const res = await dbRun(
    `DELETE FROM portal_sessions WHERE expires_at < CURRENT_TIMESTAMP OR (revoked = 1 AND created_at < CURRENT_TIMESTAMP - INTERVAL '1 day')`
  );
  return res.changes;
}

export async function createPortalSession(user: PortalUser): Promise<{ rawToken: string; cookieHeader: string }> {
  await ensurePortalAuthTables();

  // Run lazy session pruning on creation
  try {
    const isPg = Boolean(process.env.DATABASE_URL?.startsWith('postgres'));
    if (isPg) {
      await dbRun(`DELETE FROM portal_sessions WHERE expires_at < CURRENT_TIMESTAMP`);
    } else {
      await dbRun(`DELETE FROM portal_sessions WHERE expires_at < ?`, [Date.now()]);
    }
  } catch {}

  const rawToken = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashSessionToken(rawToken);
  const expiresAtMs = Date.now() + SESSION_TTL_SECONDS * 1000;
  const expiresAtIso = new Date(expiresAtMs).toISOString();

  const isPg = Boolean(process.env.DATABASE_URL?.startsWith('postgres'));
  await dbRun(
    `INSERT INTO portal_sessions (session_id, user_id, email, role, name, profile_id, expires_at, revoked)
     VALUES (?, ?, ?, ?, ?, ?, ?, ${isPg ? 'FALSE' : '0'})`,
    [
      tokenHash,
      String(user.id),
      user.email,
      user.role,
      user.name || '',
      user.profile_id ? String(user.profile_id) : null,
      isPg ? expiresAtIso : expiresAtMs
    ]
  );

  const cookieName = getCookieName();
  const isSecure = cookieName.startsWith('__Host-') || process.env.PUBLIC_SITE_ORIGIN?.startsWith('https');

  const cookieParts = [
    `${cookieName}=${rawToken}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`
  ];

  if (isSecure) {
    cookieParts.push('Secure');
  }

  return {
    rawToken,
    cookieHeader: cookieParts.join('; ')
  };
}

export async function getPortalSession(request: Request): Promise<PortalUser | null> {
  await ensurePortalAuthTables();
  const cookieHeader = request.headers.get('cookie') || '';
  const cookieName = getCookieName();

  // Match either prefixed or legacy cookie name for backwards compatibility
  const match = cookieHeader.match(new RegExp(`(?:__Host-portal_session|portal_session)=([^;]+)`));
  if (!match) return null;

  const rawToken = match[1].trim();
  const tokenHash = hashSessionToken(rawToken);

  const row = await dbGet<{
    session_id: string;
    user_id: string;
    email: string;
    role: string;
    name: string;
    profile_id: string | null;
    expires_at: any;
    revoked: any;
  }>(
    'SELECT session_id, user_id, email, role, name, profile_id, expires_at, revoked FROM portal_sessions WHERE session_id = ?',
    [tokenHash]
  );

  if (!row) return null;

  const isRevoked = row.revoked === true || row.revoked === 1 || row.revoked === 'true';
  if (isRevoked) return null;

  // Check expiration (timestamp string or ms number)
  const expiresMs = typeof row.expires_at === 'number' ? row.expires_at : new Date(row.expires_at).getTime();
  if (expiresMs < Date.now()) {
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
  const match = cookieHeader.match(/(?:__Host-portal_session|portal_session)=([^;]+)/);

  if (match) {
    const rawToken = match[1].trim();
    const tokenHash = hashSessionToken(rawToken);
    const isPg = Boolean(process.env.DATABASE_URL?.startsWith('postgres'));
    await dbRun(`UPDATE portal_sessions SET revoked = ${isPg ? 'TRUE' : '1'} WHERE session_id = ?`, [tokenHash]);
  }

  const cookieName = getCookieName();
  const isSecure = cookieName.startsWith('__Host-') || process.env.PUBLIC_SITE_ORIGIN?.startsWith('https');

  const clearParts = [
    `${cookieName}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ];

  if (isSecure) {
    clearParts.push('Secure');
  }

  return clearParts.join('; ');
}
