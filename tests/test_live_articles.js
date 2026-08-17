async function verify() {
  const slugs = [
    'us-drone-tariffs-switzerland-15-percent-impact-supply-chain',
    'apple-houston-manufacturing-ecosystem-swiss-industry',
    'tesla-texas-10b-solar-factory-supply-chain-staubli'
  ];

  console.log('=== Verifying Live News Articles on https://privatesector.ch ===\n');

  for (const s of slugs) {
    const res = await fetch(`https://privatesector.ch/api/news/${s}`);
    if (!res.ok) {
      console.error(`Failed to fetch ${s}: status ${res.status}`);
      continue;
    }
    const data = await res.json();
    const art = data.article;
    console.log('--------------------------------------------');
    console.log('Title:', art.title);
    console.log('Slug:', art.slug);
    console.log('Category:', art.category);
    console.log('Date:', art.date_published);
    console.log('Image URL:', art.image_url);
    console.log('Focus Keyword:', art.focus_keyword);
    console.log('Meta Title:', art.meta_title);
    console.log('Meta Description:', art.meta_description);
    console.log('Tags:', art.tags);
    console.log('Schema Markup Valid JSON?:', Boolean(JSON.parse(art.schema_markup)));
    
    // Verify image HTTP status on live server
    const imgRes = await fetch(`https://privatesector.ch${art.image_url}`);
    console.log('Image live HTTP status:', imgRes.status, imgRes.headers.get('content-type'));
  }
}
verify();
