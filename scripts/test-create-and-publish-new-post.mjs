import fs from 'node:fs';

const BASE_URL = 'http://localhost:4321';
const mediaMap = JSON.parse(fs.readFileSync('scripts/emdash-media-map.json', 'utf-8'));
const firstMedia = Object.values(mediaMap)[0];

async function testCreateAndPublish() {
  console.log('=== Test 3: Create New Post in Admin, Publish, and Verify Public Site ===');

  const bypassRes = await fetch(`${BASE_URL}/_emdash/api/auth/dev-bypass`, { redirect: 'manual' });
  const cookie = bypassRes.headers.get('set-cookie') || '';
  const headers = {
    'Content-Type': 'application/json',
    'Origin': BASE_URL,
    'X-EmDash-Request': '1',
    cookie
  };

  const testSlug = `e2e-live-verification-article-${Date.now()}`;
  const testTitle = `Exclusive: Swiss Quantum Hub Launches in Basel — E2E Verification ${Date.now()}`;

  const payload = {
    slug: testSlug,
    publishedAt: new Date().toISOString(),
    seo: {
      title: testTitle,
      description: 'Verification article confirming end-to-end admin creation to public render.'
    },
    primaryBylineId: '01M475RNAS48EE9APPEHNTZJ4X',
    data: {
      title: testTitle,
      subtitle: 'A milestone transatlantic initiative linking ETH Zurich and US research hubs.',
      featured_image: firstMedia,
      content: [
        {
          _type: 'block',
          _key: 'b1',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 's1',
              text: 'Basel has officially inaugurated a state-of-the-art quantum computing facility.'
            }
          ]
        }
      ],
      read_time_mins: 4,
      author_name: 'PrivateSector Intelligence',
      author_avatar: '/assets/logo_highres.png'
    }
  };

  // 1. Create post
  console.log(`Creating post with slug: ${testSlug}`);
  const createRes = await fetch(`${BASE_URL}/_emdash/api/content/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  const createData = await createRes.json();
  if (!createData.success) throw new Error('Create failed: ' + JSON.stringify(createData));
  const newId = createData.data.item.id;
  console.log(`Created new post ID: ${newId}`);

  // 2. Publish post
  console.log('Publishing post...');
  const pubRes = await fetch(`${BASE_URL}/_emdash/api/content/posts/${newId}/publish`, {
    method: 'POST',
    headers
  });
  const pubData = await pubRes.json();
  if (!pubData.success) throw new Error('Publish failed: ' + JSON.stringify(pubData));
  console.log('Published successfully.');

  // 3. Confirm it appears on public site
  console.log('Verifying on public site routes (/posts/[slug] and /news/[slug])...');
  const publicRes = await fetch(`${BASE_URL}/posts/${testSlug}`);
  console.log(`Status for /posts/${testSlug}: ${publicRes.status}`);
  const html = await publicRes.text();
  const containsTitle = html.includes(testTitle);
  const containsBody = html.includes('Basel has officially inaugurated');

  console.log(`- Contains published title: ${containsTitle ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log(`- Contains published body: ${containsBody ? 'PASS ✓' : 'FAIL ✗'}`);

  if (publicRes.status === 200 && containsTitle) {
    console.log('\nPASS: New post created in admin immediately rendered on public site! ✓');
  } else {
    // Also check /news/[slug]
    const newsRes = await fetch(`${BASE_URL}/news/${testSlug}`);
    console.log(`Status for /news/${testSlug}: ${newsRes.status}`);
    const newsHtml = await newsRes.text();
    if (newsRes.status === 200 && newsHtml.includes(testTitle)) {
      console.log('\nPASS: New post rendered on /news/[slug]! ✓');
    } else {
      console.error('\nFAIL: Could not locate post on public routes.');
      process.exit(1);
    }
  }

  // Clean up test post
  console.log('Cleaning up test post...');
  await fetch(`${BASE_URL}/_emdash/api/content/posts/${newId}`, {
    method: 'DELETE',
    headers
  });
  console.log('Cleaned up test post.');
}

testCreateAndPublish().catch(console.error);
