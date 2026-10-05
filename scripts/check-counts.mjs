import { DatabaseSync } from 'node:sqlite';

const legacyDb = new DatabaseSync('server/database.sqlite');
const emdashDb = new DatabaseSync('emdash-site/data.db');

const collections = [
  { name: 'News (posts)', legacyTable: 'news', emdashTable: 'ec_posts', expected: 43 },
  { name: 'Companies', legacyTable: 'companies', emdashTable: 'ec_companies', expected: 17 },
  { name: 'Interviews', legacyTable: 'interviews', emdashTable: 'ec_interviews', expected: 6 },
  { name: 'Blogs', legacyTable: 'blogs', emdashTable: 'ec_blogs', expected: 4 },
  { name: 'Careers (jobs)', legacyTable: 'jobs', emdashTable: 'ec_jobs', expected: 4 },
  { name: 'Briefings', legacyTable: 'morning_briefings', emdashTable: 'ec_briefings', expected: 2 }
];

console.log('=== DATABASE COUNTS AUDIT ===\n');
for (const c of collections) {
  let legCount = 0;
  try { legCount = legacyDb.prepare(`SELECT count(*) as cnt FROM ${c.legacyTable}`).get().cnt; } catch(e) { legCount = 'N/A'; }
  let emPub = 0, emDraft = 0, emTotal = 0;
  try {
    emTotal = emdashDb.prepare(`SELECT count(*) as cnt FROM ${c.emdashTable}`).get().cnt;
    emPub = emdashDb.prepare(`SELECT count(*) as cnt FROM ${c.emdashTable} WHERE status = 'published' AND deleted_at IS NULL`).get().cnt;
    emDraft = emdashDb.prepare(`SELECT count(*) as cnt FROM ${c.emdashTable} WHERE status = 'draft' AND deleted_at IS NULL`).get().cnt;
  } catch(e) {
    emTotal = 'table missing';
    emPub = 'N/A';
    emDraft = 'N/A';
  }
  console.log(`${c.name.padEnd(18)} | Expected: ${String(c.expected).padEnd(3)} | Legacy: ${String(legCount).padEnd(4)} | EmDash Total: ${String(emTotal).padEnd(5)} | EmDash Pub: ${String(emPub).padEnd(4)} | EmDash Draft: ${String(emDraft)}`);
}
