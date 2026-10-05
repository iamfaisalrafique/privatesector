import fs from 'node:fs';

const seed = JSON.parse(fs.readFileSync('emdash-site/seed/seed.json', 'utf-8'));
for (const col of seed.collections) {
  console.log(`\nCollection: ${col.slug} (${col.label})`);
  console.log('Fields:', col.fields.map(f => `${f.slug} (${f.type})`).join(', '));
}
