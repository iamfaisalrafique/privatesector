async function checkPublicPages() {
  const pages = [
    { name: 'News List', url: 'http://localhost:4321/news' },
    { name: 'Companies List', url: 'http://localhost:4321/companies' },
    { name: 'Unternehmen List', url: 'http://localhost:4321/unternehmen' },
    { name: 'Interviews List', url: 'http://localhost:4321/interviews' },
    { name: 'Blogs List', url: 'http://localhost:4321/blogs' },
    { name: 'Briefings (Podcasts)', url: 'http://localhost:4321/podcasts' },
    { name: 'Careers (Karriere)', url: 'http://localhost:4321/careers' }
  ];

  console.log('=== PUBLIC PAGE STATUS & COUNTS ===\n');
  for (const p of pages) {
    try {
      const res = await fetch(p.url);
      const text = await res.text();
      console.log(`${p.name.padEnd(22)} | Status: ${res.status} | Length: ${text.length}`);
    } catch(e) {
      console.log(`${p.name.padEnd(22)} | Failed: ${e.message}`);
    }
  }
}

checkPublicPages();
