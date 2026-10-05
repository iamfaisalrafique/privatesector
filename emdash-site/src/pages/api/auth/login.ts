import type { APIRoute } from 'astro';
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 1. Query legacy SQLite database (server/database.sqlite)
    const legacyDbPath = resolve(process.cwd(), '../server/database.sqlite');
    const legacyDb = new DatabaseSync(legacyDbPath);

    const user = legacyDb.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user || user.password_hash !== password) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. If admin, ensure user exists in EmDash data.db with role 50
    if (user.role === 'admin') {
      try {
        const emdashDbPath = resolve(process.cwd(), 'data.db');
        const emdashDb = new DatabaseSync(emdashDbPath);
        
        const emdashUser = emdashDb.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
        if (!emdashUser) {
          const userId = 'usr_' + Buffer.from(email).toString('hex').slice(0, 16);
          emdashDb.prepare(`
            INSERT INTO users (id, email, name, role, email_verified, disabled, created_at, updated_at)
            VALUES (?, ?, ?, 50, 1, 0, datetime('now'), datetime('now'))
          `).run(userId, email, email.split('@')[0]);
        }
      } catch (err) {
        console.error('Failed to sync admin to EmDash DB:', err);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile_id: user.profile_id
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
