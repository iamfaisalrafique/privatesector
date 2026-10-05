import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const legacyDb = new DatabaseSync('server/database.sqlite');

async function getAllMedia() {
  const mediaSet = new Set();

  // News (local)
  const localNews = legacyDb.prepare('SELECT image_url FROM news').all();
  localNews.forEach(n => { if (n.image_url) mediaSet.add(n.image_url); });

  // Missing prod news
  try {
    const prodRes = await fetch('https://privatesector.ch/api/news');
    const prodNews = await prodRes.json();
    prodNews.forEach(n => { if (n.image_url) mediaSet.add(n.image_url); });
  } catch(e) {}

  // Companies
  const companies = legacyDb.prepare('SELECT website FROM companies').all();

  // Interviews
  const interviews = legacyDb.prepare('SELECT interviewee_avatar, audio_url FROM interviews').all();
  interviews.forEach(i => {
    if (i.interviewee_avatar) mediaSet.add(i.interviewee_avatar);
    if (i.audio_url) mediaSet.add(i.audio_url);
  });

  // Blogs
  const blogs = legacyDb.prepare('SELECT image_url FROM blogs').all();
  blogs.forEach(b => { if (b.image_url) mediaSet.add(b.image_url); });

  // Briefings
  const briefings = legacyDb.prepare('SELECT image_url, audio_url FROM morning_briefings').all();
  briefings.forEach(b => {
    if (b.image_url) mediaSet.add(b.image_url);
    if (b.audio_url) mediaSet.add(b.audio_url);
  });

  // Logo
  mediaSet.add('/logo.png');

  console.log(`Total unique media references found: ${mediaSet.size}`);
  
  const results = [];
  for (const ref of mediaSet) {
    let localPath = null;
    let cleanRef = ref.replace(/^\//, '');
    
    // Check possible local paths
    const candidates = [
      path.resolve('public', cleanRef),
      path.resolve('public/uploads', path.basename(cleanRef)),
      path.resolve('public/uploads/audio', path.basename(cleanRef)),
      path.resolve(cleanRef)
    ];

    for (const c of candidates) {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) {
        localPath = c;
        break;
      }
    }

    results.push({ ref, localPath, exists: !!localPath });
  }

  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists);

  console.log(`Found locally: ${existing.length}`);
  console.log(`Missing locally: ${missing.length}`);
  if (missing.length > 0) {
    console.log('Missing refs:', missing.map(m => m.ref));
  }

  fs.writeFileSync('scripts/media-inventory.json', JSON.stringify(results, null, 2));
}

getAllMedia();
