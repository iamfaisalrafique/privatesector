import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('emdash-site/data.db');
const BASE_URL = 'http://localhost:4321';

async function testSlugImmutability() {
  console.log('=== Test 4: Edit Published Post Title and Confirm Slug Remains Immutable ===');

  const bypassRes = await fetch(`${BASE_URL}/_emdash/api/auth/dev-bypass`, { redirect: 'manual' });
  const cookie = bypassRes.headers.get('set-cookie') || '';
  const headers = {
    'Content-Type': 'application/json',
    'Origin': BASE_URL,
    'X-EmDash-Request': '1',
    cookie
  };

  const post = db.prepare('SELECT id, slug, title FROM ec_posts LIMIT 1').get();
  const originalSlug = post.slug;
  const originalTitle = post.title;
  console.log(`Original Post ID: ${post.id}`);
  console.log(`Original Slug:    ${originalSlug}`);
  console.log(`Original Title:   ${originalTitle}`);

  // Fetch API item
  const getRes = await fetch(`${BASE_URL}/_emdash/api/content/posts/${post.id}`, { headers });
  const itemData = (await getRes.json()).data;

  // Edit the title significantly
  const newTitle = originalTitle + ' [Updated Editorial Revision]';
  const updatedData = { ...itemData.item.data, title: newTitle };

  console.log('\nSending PUT with modified title and unchanged slug...');
  const putRes = await fetch(`${BASE_URL}/_emdash/api/content/posts/${post.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      slug: originalSlug,
      data: updatedData,
      _rev: itemData._rev
    })
  });
  const putResult = await putRes.json();
  if (!putResult.success) throw new Error('PUT failed: ' + JSON.stringify(putResult));

  // Verify slug in database
  const afterRow = db.prepare('SELECT slug, title FROM ec_posts WHERE id = ?').get(post.id);
  console.log(`Slug after title update: ${afterRow.slug}`);
  console.log(`Title after update:      ${afterRow.title}`);

  const slugUnchanged = afterRow.slug === originalSlug;
  console.log(`- Slug matches original exactly: ${slugUnchanged ? 'PASS ✓' : 'FAIL ✗'}`);

  // Restore original title
  const revRes = await fetch(`${BASE_URL}/_emdash/api/content/posts/${post.id}`, { headers });
  const revItemData = (await revRes.json()).data;
  await fetch(`${BASE_URL}/_emdash/api/content/posts/${post.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      slug: originalSlug,
      data: { ...revItemData.item.data, title: originalTitle },
      _rev: revItemData._rev
    })
  });

  // Re-publish to keep in clean published state
  await fetch(`${BASE_URL}/_emdash/api/content/posts/${post.id}/publish`, {
    method: 'POST',
    headers
  });

  if (slugUnchanged) {
    console.log('\nPASS: Modifying title preserved the exact slug and URL without regression! ✓');
  } else {
    console.error('\nFAIL: Slug changed upon title edit!');
    process.exit(1);
  }
}

testSlugImmutability().catch(console.error);
