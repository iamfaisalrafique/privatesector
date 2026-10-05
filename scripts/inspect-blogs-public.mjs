async function checkBlogsHtml() {
  const res = await fetch('http://localhost:4321/blogs');
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Has blog title 1:', text.includes('How to Navigate the Swiss B2B Compliance Landscape'));
  console.log('Has blog title 2:', text.includes('The Rise of Green Tech Startups in Zurich'));
  const links = text.match(/href="[^"]*"/g) || [];
  console.log('Sample links in blogs page:\n', links.slice(0, 15).join('\n'));
}

checkBlogsHtml().catch(console.error);
