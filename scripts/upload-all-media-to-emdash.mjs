import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

const emdashDb = new DatabaseSync('emdash-site/data.db');
const cli = 'node ./node_modules/emdash/dist/cli/index.mjs';
const url = 'http://localhost:4321';

// 1. Get existing media in EmDash
const existingRows = emdashDb.prepare('SELECT id, filename, storage_key, width, height, alt FROM media').all();
const mediaByFilename = new Map();
existingRows.forEach(r => {
  mediaByFilename.set(r.filename, {
    id: r.id,
    src: `/_emdash/api/media/file/${r.storage_key}`,
    alt: r.alt || r.filename,
    width: r.width,
    height: r.height
  });
});

console.log(`Existing media records in EmDash: ${existingRows.length}`);

// 2. Discover all local files
const searchDirs = [
  path.resolve('public/uploads'),
  path.resolve('public/uploads/audio'),
  path.resolve('public/uploads/external'),
  path.resolve('public')
];

const filesToUpload = new Map();

for (const dir of searchDirs) {
  if (!fs.existsSync(dir)) continue;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (!fs.statSync(fullPath).isFile()) continue;
    const ext = path.extname(entry).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.svg', '.mp3', '.webm', '.mp4'].includes(ext)) continue;
    if (!filesToUpload.has(entry)) {
      filesToUpload.set(entry, fullPath);
    }
  }
}

console.log(`Discovered ${filesToUpload.size} media files on disk.`);

// 3. Upload missing files
let uploadedCount = 0;
for (const [filename, filePath] of filesToUpload.entries()) {
  if (mediaByFilename.has(filename)) {
    continue;
  }

  const alt = filename.replace(/[_-]+/g, ' ').replace(/\.[a-z0-9]+$/i, '');
  console.log(`Uploading ${filename}...`);
  try {
    const stdout = execSync(`${cli} media upload "${filePath}" --alt "${alt}" --url ${url} --json`, {
      cwd: 'd:/privatesector/emdash-site',
      encoding: 'utf-8'
    });
    // Parse json from stdout
    const jsonStr = stdout.substring(stdout.indexOf('{'));
    const item = JSON.parse(jsonStr);
    mediaByFilename.set(filename, {
      id: item.id,
      src: item.url,
      alt: item.alt || alt,
      width: item.width,
      height: item.height
    });
    uploadedCount++;
  } catch (err) {
    console.error(`Failed to upload ${filename}: ${err.message}`);
  }
}

console.log(`Successfully uploaded ${uploadedCount} new media files.`);
console.log(`Total media library entries available: ${mediaByFilename.size}`);

// 4. Save media map
const mapObj = Object.fromEntries(mediaByFilename.entries());
fs.writeFileSync('scripts/emdash-media-map.json', JSON.stringify(mapObj, null, 2));
console.log('Saved scripts/emdash-media-map.json');
