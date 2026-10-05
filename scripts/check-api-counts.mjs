import fs from 'node:fs';

async function checkApi() {
  const bypassRes = await fetch('http://localhost:4321/_emdash/api/auth/dev-bypass', { redirect: 'manual' });
  const cookie = bypassRes.headers.get('set-cookie') || '';

  const collections = ['posts', 'companies', 'interviews', 'blogs', 'briefings', 'jobs'];

  console.log('=== EMDASH CONTENT API LIST AUDIT ===\n');
  for (const col of collections) {
    try {
      const res = await fetch(`http://localhost:4321/_emdash/api/content/${col}?limit=100`, {
        headers: { cookie }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const items = data.data.items || [];
        const published = items.filter(i => i.status === 'published').length;
        const drafts = items.filter(i => i.status === 'draft').length;
        console.log(`${col.padEnd(15)} | Total: ${String(items.length).padEnd(4)} | Published: ${String(published).padEnd(4)} | Drafts: ${drafts}`);
      } else {
        console.log(`${col.padEnd(15)} | Status: ${res.status} | Error: ${JSON.stringify(data.error || data)}`);
      }
    } catch(e) {
      console.log(`${col.padEnd(15)} | Fetch failed: ${e.message}`);
    }
  }
}

checkApi();
