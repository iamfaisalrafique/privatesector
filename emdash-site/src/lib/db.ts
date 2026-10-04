/**
 * Database client for Application Schema (Portal Users, Sessions, Rate Limits, Reset Tokens)
 *
 * Supports PostgreSQL (via pg.Pool) and isolated SQLite (via sqlite3).
 * Dialect-safe: Parameterized queries, boolean mapping, timestamptz handling.
 */

import pg from 'pg';
import path from 'node:path';
import fs from 'node:fs';

let pgPool: pg.Pool | null = null;
let sqliteDb: any = null;

export function isPostgres(): boolean {
  const conn = process.env.DATABASE_URL || process.env.EMDASH_DATABASE_URL;
  return Boolean(conn && (conn.startsWith('postgres://') || conn.startsWith('postgresql://')));
}

function getPgPool(): pg.Pool | null {
  if (pgPool) return pgPool;
  const conn = process.env.DATABASE_URL || process.env.EMDASH_DATABASE_URL;
  if (conn && (conn.startsWith('postgres://') || conn.startsWith('postgresql://'))) {
    pgPool = new pg.Pool({
      connectionString: conn,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pgPool;
}

async function getSqliteDb() {
  if (sqliteDb) return sqliteDb;

  // Use explicit TEST_SQLITE_PATH if provided, else temp file outside tracked paths,
  // NEVER write to server/database.sqlite
  let dbFile = process.env.TEST_SQLITE_PATH;
  if (!dbFile) {
    dbFile = path.resolve(process.cwd(), 'temp-portal.sqlite');
  }

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

// Translate boolean expressions for dialect compatibility if needed
function adaptSqlForDialect(sql: string): string {
  if (isPostgres()) {
    let pgSql = convertToPgPlaceholders(sql);
    // Replace integer boolean comparisons with true/false for Postgres
    pgSql = pgSql.replace(/revoked\s*=\s*0/gi, 'revoked = FALSE');
    pgSql = pgSql.replace(/revoked\s*=\s*1/gi, 'revoked = TRUE');
    pgSql = pgSql.replace(/consumed\s*=\s*0/gi, 'consumed = FALSE');
    pgSql = pgSql.replace(/consumed\s*=\s*1/gi, 'consumed = TRUE');
    return pgSql;
  } else {
    // In SQLite, boolean columns are stored as 0 or 1
    let sqliteSql = sql;
    sqliteSql = sqliteSql.replace(/revoked\s*=\s*FALSE/gi, 'revoked = 0');
    sqliteSql = sqliteSql.replace(/revoked\s*=\s*TRUE/gi, 'revoked = 1');
    sqliteSql = sqliteSql.replace(/consumed\s*=\s*FALSE/gi, 'consumed = 0');
    sqliteSql = sqliteSql.replace(/consumed\s*=\s*TRUE/gi, 'consumed = 1');
    return sqliteSql;
  }
}

export async function dbQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const adaptedSql = adaptSqlForDialect(sql);
  const pool = getPgPool();
  if (pool) {
    const res = await pool.query(adaptedSql, params);
    return res.rows;
  }

  const db = await getSqliteDb();
  return new Promise<T[]>((resolve, reject) => {
    db.all(adaptedSql, params, (err: any, rows: T[]) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

export async function dbGet<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const adaptedSql = adaptSqlForDialect(sql);
  const pool = getPgPool();
  if (pool) {
    const res = await pool.query(adaptedSql, params);
    return (res.rows[0] as T) || null;
  }

  const db = await getSqliteDb();
  return new Promise<T | null>((resolve, reject) => {
    db.get(adaptedSql, params, (err: any, row: T) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

export async function dbRun(sql: string, params: any[] = []): Promise<{ id?: number | string; changes: number }> {
  let adaptedSql = adaptSqlForDialect(sql);
  const pool = getPgPool();
  if (pool) {
    // Note: Do not blindly append RETURNING id to tables without an 'id' column (like portal_sessions, portal_login_attempts, portal_password_resets)
    const res = await pool.query(adaptedSql, params);
    return {
      id: undefined,
      changes: res.rowCount || 0
    };
  }

  const db = await getSqliteDb();
  return new Promise((resolve, reject) => {
    db.run(adaptedSql, params, function (this: any, err: any) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export async function ensurePortalAuthTables(): Promise<void> {
  const pool = getPgPool();
  if (pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS portal_sessions (
        session_id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL,
        name VARCHAR(255),
        profile_id VARCHAR(64),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked BOOLEAN NOT NULL DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS portal_login_attempts (
        lockout_key VARCHAR(128) PRIMARY KEY,
        attempts INTEGER NOT NULL DEFAULT 0,
        locked_until BIGINT NOT NULL DEFAULT 0,
        action_required VARCHAR(32) NOT NULL DEFAULT 'none',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS portal_password_resets (
        token_hash VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        expires_at BIGINT NOT NULL,
        consumed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
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
            action_required TEXT DEFAULT 'none',
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
}
