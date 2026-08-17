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

const imageMap = [
  {
    slug: 'ai-is-creating-new-fortunes-where-will-the-money-go-next',
    localFile: path.join(localUploadsDir, 'ai_creating_new_fortunes_where_money_goes_switzerland.jpg'),
    baseName: 'ai_creating_new_fortunes_where_money_goes_switzerland'
  },
  {
    slug: 'archer-aviation-boeing-businesses-acquisition-autonomous-flight-switzerland',
    localFile: path.join(localUploadsDir, 'archer_aviation_boeing_autonomous_flight.jpg'),
    baseName: 'archer_aviation_boeing_autonomous_flight'
  },
  {
    slug: 'thoma-bravo-4b-accelerant-acquisition-insurance-platform-switzerland',
    localFile: path.join(localUploadsDir, 'thoma_bravo_accelerant_insurance_platform.jpg'),
    baseName: 'thoma_bravo_accelerant_insurance_platform'
  },
  {
    slug: 'mastercard-bvnk-acquisition-traditional-digital-money-bridge-switzerland',
    localFile: path.join(localUploadsDir, 'mastercard_bvnk_digital_bridge.jpg'),
    baseName: 'mastercard_bvnk_digital_bridge'
  },
  {
    slug: 'tesla-texas-10b-solar-factory-supply-chain-staubli',
    localFile: path.join(localUploadsDir, 'tesla_texas_solar_factory_supply_chain_1786718650717_f9ceu.jpg'),
    baseName: 'tesla_texas_solar_factory_supply_chain'
  },
  {
    slug: 'apple-houston-manufacturing-ecosystem-swiss-industry',
    localFile: path.join(localUploadsDir, 'apple_houston_manufacturing_ecosystem_1786718649053_ipe4z.jpg'),
    baseName: 'apple_houston_manufacturing_ecosystem'
  },
  {
    slug: 'us-drone-tariffs-switzerland-15-percent-impact-supply-chain',
    localFile: path.join(localUploadsDir, 'us_drone_tariffs_swiss_precision_1786718646989_q3ljn.jpg'),
    baseName: 'us_drone_tariffs_swiss_precision'
  },
  {
    slug: 'swiss-pharma-building-north-carolina-power-base-who-could-follow',
    localFile: path.resolve(__dirname, 'public', 'swiss-pharma-nc-power-base.jpg'),
    baseName: 'swiss_pharma_nc_power_base'
  }
];

async function updateLocalDb(slug, newImageUrl) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, () => {
      db.run('UPDATE news SET image_url = ? WHERE slug = ?', [newImageUrl, slug], function (err) {
        if (err) console.error(`[SQLite Error] ${slug}:`, err.message);
        else console.log(`[SQLite Updated] ${slug} -> ${newImageUrl}`);
        db.close();
        resolve();
      });
    });
  });
}

async function fixAllImages() {
  console.log('=== FIXING & RE-UPLOADING ALL NEWS ARTICLE IMAGES ===\n');

  // 1. Fetch live articles
  const liveRes = await fetch('https://privatesector.ch/api/news');
  const liveArticles = await liveRes.json();
  console.log(`Found ${liveArticles.length} articles on live API.\n`);

  for (const item of imageMap) {
    console.log(`Processing: ${item.slug}`);
    if (!fs.existsSync(item.localFile)) {
      console.warn(`  [Warning] Local file not found: ${item.localFile}`);
      continue;
    }

    const fileBuf = fs.readFileSync(item.localFile);
    console.log(`  File size: ${fileBuf.length} bytes`);

    // Ensure local copies exist with clean name in public/uploads and server/uploads
    fs.writeFileSync(path.join(publicUploadsDir, `${item.baseName}.jpg`), fileBuf);
    fs.writeFileSync(path.join(localUploadsDir, `${item.baseName}.jpg`), fileBuf);

    // Upload to live API
    const b64 = 'data:image/jpeg;base64,' + fileBuf.toString('base64');
    console.log(`  Uploading to https://privatesector.ch/api/upload ...`);
    const uploadRes = await fetch('https://privatesector.ch/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: b64, filename: item.baseName })
    });
    const uploadData = await uploadRes.json();
    console.log(`  Upload Response:`, uploadData);

    if (!uploadData.url) {
      console.error(`  [Failed] Could not upload image for ${item.slug}`);
      continue;
    }

    const newUrl = uploadData.url;

    // Verify live URL
    const verifyRes = await fetch('https://privatesector.ch' + newUrl);
    console.log(`  Verification Fetch (${newUrl}): Status ${verifyRes.status}, Content-Type: ${verifyRes.headers.get('content-type')}`);

    // Update live article
    const matchingLive = liveArticles.find(a => a.slug === item.slug);
    if (matchingLive) {
      console.log(`  Updating Live API News Article ID: ${matchingLive.id}...`);
      const updatedPayload = {
        ...matchingLive,
        image_url: newUrl
      };
      const putRes = await fetch(`https://privatesector.ch/api/news/${matchingLive.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });
      const putData = await putRes.json();
      console.log(`  Live API Update Response:`, putData);
    } else {
      console.warn(`  [Warning] Article with slug ${item.slug} not found on live API!`);
    }

    // Update SQLite
    await updateLocalDb(item.slug, newUrl);
    console.log('');
  }

  console.log('=== VERIFYING ALL LIVE NEWS ARTICLE IMAGES ===\n');
  const checkRes = await fetch('https://privatesector.ch/api/news');
  const updatedLive = await checkRes.json();

  for (const art of updatedLive) {
    const fullUrl = art.image_url.startsWith('http') ? art.image_url : 'https://privatesector.ch' + art.image_url;
    try {
      const r = await fetch(fullUrl);
      const ct = r.headers.get('content-type') || '';
      const isOk = r.status === 200 && ct.startsWith('image/');
      console.log(`${isOk ? '✅' : '❌'} [ID ${art.id}] ${art.title.substring(0, 45)}...`);
      console.log(`   URL: ${fullUrl}`);
      console.log(`   Status: ${r.status}, Content-Type: ${ct}\n`);
    } catch (err) {
      console.error(`❌ [ID ${art.id}] Fetch failed for ${fullUrl}:`, err.message);
    }
  }

  console.log('=== DONE ===');
}

fixAllImages().catch(console.error);
