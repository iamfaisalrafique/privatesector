import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('emdash-site/data.db');
const tables = [
  { slug: 'posts', table: 'ec_posts', label: 'News Articles' },
  { slug: 'companies', table: 'ec_companies', label: 'Companies' },
  { slug: 'interviews', table: 'ec_interviews', label: 'Interviews' },
  { slug: 'blogs', table: 'ec_blogs', label: 'Blogs' },
  { slug: 'jobs', table: 'ec_jobs', label: 'Careers & Jobs' },
  { slug: 'briefings', table: 'ec_briefings', label: 'Morning Briefings' }
];

console.log('=== Database Verification Table ===');
console.log('Collection | Total DB Rows | Published | Draft | Trashed');
console.log('-----------|---------------|-----------|-------|--------');

for (const t of tables) {
  const total = db.prepare(`SELECT count(*) as c FROM ${t.table}`).get().c;
  const published = db.prepare(`SELECT count(*) as c FROM ${t.table} WHERE status = 'published' AND deleted_at IS NULL`).get().c;
  const draft = db.prepare(`SELECT count(*) as c FROM ${t.table} WHERE status = 'draft' AND deleted_at IS NULL`).get().c;
  const trashed = db.prepare(`SELECT count(*) as c FROM ${t.table} WHERE deleted_at IS NOT NULL`).get().c;
  console.log(`${t.slug.padEnd(10)} | ${String(total).padStart(13)} | ${String(published).padStart(9)} | ${String(draft).padStart(5)} | ${String(trashed).padStart(7)}`);
}

// Revisions count
const revCount = db.prepare('SELECT count(*) as c FROM revisions').get().c;
console.log(`\nTotal revisions in database: ${revCount}`);
