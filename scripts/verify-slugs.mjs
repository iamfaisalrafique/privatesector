import fs from 'node:fs';
import path from 'node:path';

async function verifySlugs() {
  console.log('='.repeat(80));
  console.log('VERIFYING NEWS SLUGS & REDIRECT MAP INTEGRITY');
  console.log('='.repeat(80));

  // 1. Fetch live production news
  const res = await fetch('https://privatesector.ch/api/news');
  const news = await res.json();
  console.log(`Fetched ${news.length} news items from live API (PROVISIONAL until Postgres connection).`);

  const slugSet = new Set();
  const slugCounts = new Map();
  const emptySlugs = [];
  const duplicateSlugs = [];

  for (const n of news) {
    const slug = n.slug ? String(n.slug).trim() : '';
    if (!slug) {
      emptySlugs.push({ id: n.id, title: n.title });
    } else {
      const count = (slugCounts.get(slug) || 0) + 1;
      slugCounts.set(slug, count);
      if (count === 2) {
        duplicateSlugs.push(slug);
      }
    }
  }

  console.log('\n[1] Slug Quality Audit:');
  console.log(`  Total Articles:     ${news.length}`);
  console.log(`  Unique Slugs:       ${slugCounts.size}`);
  console.log(`  Empty Slugs:        ${emptySlugs.length} ${emptySlugs.length === 0 ? '✓ (None)' : 'FAILED'}`);
  console.log(`  Duplicate Slugs:    ${duplicateSlugs.length} ${duplicateSlugs.length === 0 ? '✓ (None)' : 'FAILED'}`);

  if (emptySlugs.length > 0) {
    console.error('  Empty slug items:', emptySlugs);
  }
  if (duplicateSlugs.length > 0) {
    console.error('  Duplicate slugs:', duplicateSlugs);
  }

  // 2. Verify redirect map file
  const mapPath = path.resolve('emdash-site/src/data/news-redirects.json');
  if (!fs.existsSync(mapPath)) {
    console.error('Redirect map file missing!');
    return;
  }

  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const mapIds = Object.keys(map);
  const mapSlugs = Object.values(map);

  console.log('\n[2] Redirect Map Integrity:');
  console.log(`  Total Map Entries:  ${mapIds.length}`);
  console.log(`  Unique Numeric IDs: ${new Set(mapIds).size}`);
  console.log(`  Unique Target Slugs:${new Set(mapSlugs).size}`);

  // Check collision between IDs and Slugs
  const idCollisions = mapIds.length !== new Set(mapIds).size;
  const slugCollisions = mapSlugs.length !== new Set(mapSlugs).size;
  console.log(`  ID Collisions:      ${idCollisions ? 'FAILED' : 'None ✓'}`);
  console.log(`  Slug Collisions:    ${slugCollisions ? 'FAILED' : 'None ✓'}`);

  // Check exclusion of local-only IDs
  const forbiddenIds = ['6', '43', '47'];
  const foundForbidden = forbiddenIds.filter(id => id in map);
  console.log(`  Forbidden local IDs (6, 43, 47) in map: ${foundForbidden.length > 0 ? foundForbidden.join(', ') : 'None ✓'}`);

  console.log('\n' + '='.repeat(80));
  if (emptySlugs.length === 0 && duplicateSlugs.length === 0 && !idCollisions && !slugCollisions && foundForbidden.length === 0) {
    console.log('VERDICT: SLUGS AND REDIRECT MAP ARE 100% UNIQUE, NON-EMPTY, AND COLLISION-FREE.');
  } else {
    console.log('VERDICT: FAILED AUDIT CHECKS.');
  }
  console.log('='.repeat(80));
}

verifySlugs();
