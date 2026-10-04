/**
 * Database client for Application Schema (Portal Users, Sessions, Rate Limits, Reset Tokens)
 *
 * Supports PostgreSQL in production (via pg.Pool) and SQLite locally (via sqlite3).
 */

import pg from 'pg';
import path from 'node:path';
import fs from 'node:fs';

const connectionString = process.env.DATABASE_URL || process.env.EMDASH_DATABASE_URL;
const isPg = Boolean(
  connectionString &&
  (connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://'))
);

let pgPool: pg.Pool | null = null;
let sqliteDb: any = null;

if (isPg) {
  pgPool = new pg.Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30000,
  });
}

async function getSqliteDb() {
  if (sqliteDb) return sqliteDb;

  // Prefer server/database.sqlite for application schema (users, profiles, etc.)
  // or fall back to data.db
  const candidates = [
    path.resolve(process.cwd(), '../server/database.sqlite'),
    path.resolve(process.cwd(), 'server/database.sqlite'),
    path.resolve(process.cwd(), '../server/database.sqlite'),
    'D:/privatesector/server/database.sqlite',
    path.resolve(process.cwd(), 'data.db')
  ];

  let dbFile = candidates.find(f => fs.existsSync(f)) || path.resolve(process.cwd(), 'data.db');

  const sqlite3Module = await import('sqlite3');
  const sqlite3 = sqlite3Module.default || sqlite3Module;
  sqliteDb = new sqlite3.Database(dbFile);
  return sqliteDb;
}

// Convert SQLite '?' placeholders to Postgres '$1, $2, ...'
function convertToPgPlaceholders(sql: string): string {
  let idx = 1;
  return sql.replace(/\?/g, () => `$${idx++}`);
}

export async function dbQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (isPg && pgPool) {
    const pgSql = convertToPgPlaceholders(sql);
    const res = await pgPool.query(pgSql, params);
    return res.rows;
  }

  const db = await getSqliteDb();
  return new Promise<T[]>((resolve, reject) => {
    db.all(sql, params, (err: any, rows: T[]) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

export async function dbGet<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  if (isPg && pgPool) {
    const pgSql = convertToPgPlaceholders(sql);
    const res = await pgPool.query(pgSql, params);
    return (res.rows[0] as T) || null;
  }

  const db = await getSqliteDb();
  return new Promise<T | null>((resolve, reject) => {
    db.get(sql, params, (err: any, row: T) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

export async function dbRun(sql: string, params: any[] = []): Promise<{ id?: number | string; changes: number }> {
  if (isPg && pgPool) {
    let pgSql = convertToPgPlaceholders(sql);
    const isInsert = pgSql.trim().toUpperCase().startsWith('INSERT');
    if (isInsert && !pgSql.toUpperCase().includes('RETURNING')) {
      pgSql = `${pgSql} RETURNING id`;
    }
    const res = await pgPool.query(pgSql, params);
    return {
      id: isInsert && res.rows[0] ? res.rows[0].id : undefined,
      changes: res.rowCount || 0
    };
  }

  const db = await getSqliteDb();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (this: any, err: any) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Initializes required tables for portal authentication:
 * - portal_sessions
 * - portal_login_attempts
 * - portal_password_resets
 * - portal_users (if users table does not exist)
 */
let tablesInitialized = false;

export async function ensurePortalAuthTables(): Promise<void> {
  if (tablesInitialized) return;

  if (isPg && pgPool) {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS portal_sessions (
        session_id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL,
        name VARCHAR(255),
        profile_id VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS portal_login_attempts (
        lockout_key VARCHAR(128) PRIMARY KEY,
        attempts INTEGER DEFAULT 0,
        locked_until BIGINT DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS portal_password_resets (
        token_hash VARCHAR(128) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        expires_at BIGINT NOT NULL,
        consumed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } else {
    const db = await getSqliteDb();
    await new Promise<void>((resolve, reject) => {
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS portal_sessions (
            session_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT NOT NULL,
            name TEXT,
            profile_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at INTEGER NOT NULL,
            revoked INTEGER DEFAULT 0
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS portal_login_attempts (
            lockout_key TEXT PRIMARY KEY,
            attempts INTEGER DEFAULT 0,
            locked_until INTEGER DEFAULT 0,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS portal_password_resets (
            token_hash TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            consumed INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  tablesInitialized = true;
}
