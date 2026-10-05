import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('server/database.sqlite');
for (const table of ['news', 'companies', 'interviews', 'jobs', 'blogs', 'morning_briefings']) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  console.log(`\nTable ${table}:`);
  console.log(cols.map(c => `${c.name} (${c.type})`).join(', '));
}
