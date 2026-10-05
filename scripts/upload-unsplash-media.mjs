import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const files = [
  'photo-1559526324-4b87b5e36e44.jpg',
  'photo-1554224155-8d04cb21cd6c.jpg',
  'photo-1576086213369-97a306d36557.jpg',
  'photo-1584308666744-24d5c474f2ae.jpg',
  'photo-1532187863486-abf9dbad1b69.jpg'
];

const mediaMap = JSON.parse(fs.readFileSync('scripts/emdash-media-map.json', 'utf-8'));

for (const f of files) {
  const filePath = path.resolve('public/uploads/external', f);
  const out = execSync(`node ./node_modules/emdash/dist/cli/index.mjs media upload --json "${filePath}"`, {
    cwd: 'emdash-site',
    encoding: 'utf-8'
  });
  const res = JSON.parse(out);
  console.log('Uploaded:', f, res.id);
  mediaMap[f] = res;
}

fs.writeFileSync('scripts/emdash-media-map.json', JSON.stringify(mediaMap, null, 2));
console.log('Updated mediaMap with Unsplash images. Total media entries:', Object.keys(mediaMap).length);
