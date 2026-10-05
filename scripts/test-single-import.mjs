import fs from 'node:fs';

async function testSingle() {
  const bypassRes = await fetch('http://localhost:4321/_emdash/api/auth/dev-bypass', { redirect: 'manual' });
  const cookie = bypassRes.headers.get('set-cookie') || '';

  const mediaMap = JSON.parse(fs.readFileSync('scripts/emdash-media-map.json', 'utf-8'));
  const firstMedia = Object.values(mediaMap)[0];

  const payload = {
    slug: 'test-single-post-import',
    publishedAt: new Date().toISOString(),
    seo: {
      title: 'Test Single Post Import Title',
      description: 'Test SEO description for single post import'
    },
    data: {
      title: 'Test Single Post Import',
      subtitle: 'A verification subtitle',
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
              text: 'This is the verified test content.'
            }
          ]
        }
      ],
      legacy_id: 9999
    }
  };

  const res = await fetch('http://localhost:4321/_emdash/api/content/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:4321',
      'X-EmDash-Request': '1',
      cookie
    },
    body: JSON.stringify(payload)
  });

  const resData = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(resData, null, 2));
}

testSingle().catch(console.error);
