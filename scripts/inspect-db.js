import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../server/database.sqlite');

const db = new sqlite3.Database(dbPath);

db.all("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence'", async (err, tables) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  for (const t of tables) {
    await new Promise(resolve => {
      db.all(`PRAGMA table_info(${t.name})`, (err, cols) => {
        db.get(`SELECT COUNT(*) as count FROM ${t.name}`, (err, countRes) => {
          console.log(`\n### Table: \`${t.name}\` (Rows: ${countRes ? countRes.count : 'ERR'})`);
          console.log('| Column | Type | Not Null | Primary Key | Default |');
          console.log('| --- | --- | --- | --- | --- |');
          for (const c of cols) {
            console.log(`| \`${c.name}\` | \`${c.type || 'TEXT'}\` | ${c.notnull ? 'YES' : 'NO'} | ${c.pk ? 'YES' : 'NO'} | ${c.dflt_value !== null ? `\`${c.dflt_value}\`` : 'NULL'} |`);
          }
          resolve();
        });
      });
    });
  }
  db.close();
});
