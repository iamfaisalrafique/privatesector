import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('server/database.sqlite');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in server/database.sqlite:', tables.map(t => t.name));

for (const t of tables) {
  const count = db.prepare(`SELECT count(*) as c FROM ${t.name}`).get();
  console.log(`- ${t.name}: ${count.c} rows`);
}
