import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localUploadsDir = path.resolve(__dirname, 'server', 'uploads');
const publicUploadsDir = path.resolve(__dirname, 'public', 'uploads');
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');

if (!fs.existsSync(localUploadsDir)) fs.mkdirSync(localUploadsDir, { recursive: true });
if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });

const articles = [
  {
    slug: 'ai-is-creating-new-fortunes-where-will-the-money-go-next',
    localFile: path.join(localUploadsDir, 'ai_creating_new_fortunes_where_money_goes_switzerland.jpg'),
    cleanName: 'ai_wealth_creation_switzerland.jpg'
  },
  {
    slug: 'archer-aviation-boeing-businesses-acquisition-autonomous-flight-switzerland',
    localFile: path.join(localUploadsDir, 'archer_aviation_boeing_autonomous_flight.jpg'),
    cleanName: 'archer_aviation_boeing_autonomous_flight.jpg'
  },
  {
    slug: 'thoma-bravo-4b-accelerant-acquisition-insurance-platform-switzerland',
    localFile: path.join(localUploadsDir, 'thoma_bravo_accelerant_insurance_platform.jpg'),
    cleanName: 'thoma_bravo_accelerant_insurance_platform.jpg'
  },
  {
    slug: 'mastercard-bvnk-acquisition-traditional-digital-money-bridge-switzerland',
    localFile: path.join(localUploadsDir, 'mastercard_bvnk_digital_bridge.jpg'),
    cleanName: 'mastercard_bvnk_digital_bridge.jpg'
  },
  {
    slug: 'tesla-texas-10b-solar-factory-supply-chain-staubli',
    localFile: path.join(localUploadsDir, 'tesla_texas_solar_factory_supply_chain_1786718650717_f9ceu.jpg'),
    cleanName: 'tesla_texas_solar_factory_supply_chain.jpg'
  },
  {
    slug: 'apple-houston-manufacturing-ecosystem-swiss-industry',
    localFile: path.join(localUploadsDir, 'apple_houston_manufacturing_ecosystem_1786718649053_ipe4z.jpg'),
    cleanName: 'apple_houston_manufacturing_ecosystem.jpg'
  },
  {
    slug: 'us-drone-tariffs-switzerland-15-percent-impact-supply-chain',
    localFile: path.join(localUploadsDir, 'us_drone_tariffs_swiss_precision_1786718646989_q3ljn.jpg'),
    cleanName: 'us_drone_tariffs_swiss_precision.jpg'
  },
  {
    slug: 'swiss-pharma-building-north-carolina-power-base-who-could-follow',
    localFile: path.resolve(__dirname, 'public', 'swiss-pharma-nc-power-base.jpg'),
    cleanName: 'swiss_pharma_nc_power_base.jpg'
  }
];

async function uploadToCatbox(fileBuf, filename) {
  const blob = new Blob([fileBuf], { type: 'image/jpeg' });
  const fd = new FormData();
  fd.append('reqtype', 'fileupload');
  fd.append('fileToUpload', blob, filename);

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: fd
  });
  const txt = await res.text();
  if (txt.startsWith('http')) {
    return txt.trim();
  }
  throw new Error(`Catbox error: ${txt}`);
}

async function updateSQLite(slug, url) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, () => {
      db.run('UPDATE news SET image_url = ? WHERE slug = ?', [url, slug], function (err) {
        if (err) console.error(`[SQLite Error] ${slug}:`, err.message);
        else console.log(`  [SQLite] Updated ${slug} -> ${url}`);
        db.close();
        resolve();
      });
    });
  });
}

async function main() {
  console.log('=== UPLOADING TO PERMANENT CDN & UPDATING DATABASES ===\n');

  // Fetch live articles list
  const liveRes = await fetch('https://privatesector.ch/api/news');
  const liveArticles = await liveRes.json();

  for (const item of articles) {
    console.log(`Processing: ${item.slug}`);
    if (!fs.existsSync(item.localFile)) {
      console.warn(`  File not found: ${item.localFile}`);
      continue;
    }

    const fileBuf = fs.readFileSync(item.localFile);
    console.log(`  Local size: ${fileBuf.length} bytes`);

    // 1. Save locally with clean filename
    fs.writeFileSync(path.join(publicUploadsDir, item.cleanName), fileBuf);
    fs.writeFileSync(path.join(localUploadsDir, item.cleanName), fileBuf);

    // 2. Upload to permanent Catbox CDN
    console.log(`  Uploading to permanent CDN...`);
    const cdnUrl = await uploadToCatbox(fileBuf, item.cleanName);
    console.log(`  CDN URL: ${cdnUrl}`);

    // Verify CDN URL
    const vRes = await fetch(cdnUrl);
    console.log(`  CDN Verify: Status ${vRes.status}, Content-Type: ${vRes.headers.get('content-type')}`);

    // 3. Update SQLite
    await updateSQLite(item.slug, cdnUrl);

    // 4. Update Live API
    const matchingLive = liveArticles.find(a => a.slug === item.slug);
    if (matchingLive) {
      console.log(`  Updating Live API News Article ID ${matchingLive.id}...`);
      const payload = {
        ...matchingLive,
        image_url: cdnUrl
      };
      const putRes = await fetch(`https://privatesector.ch/api/news/${matchingLive.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const putData = await putRes.json();
      console.log(`  Live API Update:`, putData);
    }
    console.log('');
  }

  console.log('\n=== FINAL VERIFICATION OF ALL 13 ARTICLES ON LIVE API ===');
  const finalRes = await fetch('https://privatesector.ch/api/news');
  const allLive = await finalRes.json();

  for (const art of allLive) {
    const res = await fetch(art.image_url);
    const ct = res.headers.get('content-type') || '';
    const ok = res.status === 200 && ct.startsWith('image/');
    console.log(`${ok ? '✅' : '❌'} [ID ${art.id}] ${art.title.slice(0, 45)}...`);
    console.log(`   Image URL: ${art.image_url}`);
    console.log(`   Status: ${res.status}, Type: ${ct}\n`);
  }
}

main().catch(console.error);
