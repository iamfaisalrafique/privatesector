import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('emdash-site/data.db');
const BASE_URL = 'http://localhost:4321';

async function testRoundtrip() {
  console.log('=== Test 2: Round-Trip Save Without Changes ===');

  // Authenticate
  const bypassRes = await fetch(`${BASE_URL}/_emdash/api/auth/dev-bypass`, { redirect: 'manual' });
  const cookie = bypassRes.headers.get('set-cookie') || '';
  if (!cookie) throw new Error('No cookie');

  const headers = {
    'Content-Type': 'application/json',
    'Origin': BASE_URL,
    'X-EmDash-Request': '1',
    cookie
  };

  // Pick first post
  const beforeRow = db.prepare('SELECT * FROM ec_posts LIMIT 1').get();
  console.log(`Testing entry ID: ${beforeRow.id} (slug: ${beforeRow.slug})`);

  // Fetch current item via API
  const getRes = await fetch(`${BASE_URL}/_emdash/api/content/posts/${beforeRow.id}`, { headers });
  const getData = await getRes.json();
  if (!getData.success) throw new Error('Failed to get item via API: ' + JSON.stringify(getData));

  const item = getData.data.item;
  const rev = getData.data._rev;

  // Save without changing any data fields
  const putPayload = {
    slug: item.slug,
    data: item.data,
    seo: item.seo,
    _rev: rev
  };

  const putRes = await fetch(`${BASE_URL}/_emdash/api/content/posts/${beforeRow.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(putPayload)
  });
  const putData = await putRes.json();
  if (!putData.success) throw new Error('PUT save failed: ' + JSON.stringify(putData));

  // Fetch row after save
  const afterRow = db.prepare('SELECT * FROM ec_posts WHERE id = ?').get(beforeRow.id);

  console.log('\nComparing database columns before and after save:');
  const ignoreCols = new Set(['updated_at', 'draft_revision_id', 'version']);
  let diffCount = 0;

  for (const key of Object.keys(beforeRow)) {
    const valBefore = beforeRow[key];
    const valAfter = afterRow[key];
    if (valBefore !== valAfter) {
      if (ignoreCols.has(key)) {
        console.log(`- ${key}: changed expectedly (${valBefore} -> ${valAfter}) ✓`);
      } else {
        console.error(`- DIFF IN COLUMN ${key}: "${valBefore}" !== "${valAfter}" ✗`);
        diffCount++;
      }
    } else {
      // Column matches perfectly
    }
  }

  if (diffCount === 0) {
    console.log('\nPASS: Round-trip save produced 0 unexpected column diffs! Title, slug, content, images remain 100% identical. ✓');
  } else {
    console.error(`\nFAIL: Found ${diffCount} unexpected diffs!`);
    process.exit(1);
  }
}

testRoundtrip().catch(console.error);
