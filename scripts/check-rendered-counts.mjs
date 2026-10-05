async function checkRenderedCounts() {
  const pages = [
    { name: 'News List', url: 'http://localhost:4321/news', regex: /<article|class="[^"]*news-card|class="[^"]*card/g },
    { name: 'Companies List', url: 'http://localhost:4321/companies', regex: /href="\/companies\/|href="\/unternehmen\//g },
    { name: 'Interviews List', url: 'http://localhost:4321/interviews', regex: /href="\/interviews\//g },
    { name: 'Blogs List', url: 'http://localhost:4321/blogs', regex: /href="\/blogs\//g },
    { name: 'Careers List', url: 'http://localhost:4321/careers', regex: /href="\/careers\/|class="[^"]*job-card/g }
  ];

  console.log('=== PUBLIC PAGE RENDERED ITEM COUNTS ===\n');
  for (const p of pages) {
    try {
      const res = await fetch(p.url);
      const text = await res.text();
      const matches = text.match(p.regex) || [];
      console.log(`${p.name.padEnd(18)} | Matches: ${matches.length}`);
    } catch(e) {
      console.log(`${p.name.padEnd(18)} | Failed: ${e.message}`);
    }
  }
}

checkRenderedCounts();
