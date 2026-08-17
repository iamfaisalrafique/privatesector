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

const imageSyncPlan = [
  {
    slug: 'ai-is-creating-new-fortunes-where-will-the-money-go-next',
    src: path.join(localUploadsDir, 'ai_creating_new_fortunes_where_money_goes_switzerland.jpg'),
    filename: 'ai_wealth_creation_switzerland'
  },
  {
    slug: 'archer-aviation-boeing-businesses-acquisition-autonomous-flight-switzerland',
    src: path.join(localUploadsDir, 'archer_aviation_boeing_autonomous_flight.jpg'),
    filename: 'archer_aviation_boeing_autonomous_flight'
  },
  {
    slug: 'thoma-bravo-4b-accelerant-acquisition-insurance-platform-switzerland',
    src: path.join(localUploadsDir, 'thoma_bravo_accelerant_insurance_platform.jpg'),
    filename: 'thoma_bravo_accelerant_insurance_platform'
  },
  {
    slug: 'mastercard-bvnk-acquisition-traditional-digital-money-bridge-switzerland',
    src: path.join(localUploadsDir, 'mastercard_bvnk_digital_bridge.jpg'),
    filename: 'mastercard_bvnk_digital_bridge'
  },
  {
    slug: 'tesla-texas-10b-solar-factory-supply-chain-staubli',
    src: path.join(localUploadsDir, 'tesla_texas_solar_factory_supply_chain_1786718650717_f9ceu.jpg'),
    filename: 'tesla_texas_solar_factory_supply_chain'
  },
  {
    slug: 'apple-houston-manufacturing-ecosystem-swiss-industry',
    src: path.join(localUploadsDir, 'apple_houston_manufacturing_ecosystem_1786718649053_ipe4z.jpg'),
    filename: 'apple_houston_manufacturing_ecosystem'
  },
  {
    slug: 'us-drone-tariffs-switzerland-15-percent-impact-supply-chain',
    src: path.join(localUploadsDir, 'us_drone_tariffs_swiss_precision_1786718646989_q3ljn.jpg'),
    filename: 'us_drone_tariffs_swiss_precision'
  },
  {
    slug: 'swiss-pharma-building-north-carolina-power-base-who-could-follow',
    src: path.resolve(__dirname, 'public', 'swiss-pharma-nc-power-base.jpg'),
    filename: 'swiss_pharma_nc_power_base'
  }
];

async function updateSQLite(slug, url) {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, () => {
      db.run('UPDATE news SET image_url = ? WHERE slug = ?', [url, slug], function(err) {
        if (err) console.error(`[SQLite Error] ${slug}:`, err.message);
        else console.log(`  [SQLite] Updated ${slug} -> ${url}`);
        db.close();
        resolve();
      });
    });
  });
}

async function main() {
  console.log('=== DEPLOYING CLEAN ASSETS & SYNCING BOTH LOCAL & LIVE ===\n');

  // Fetch live articles
  let liveArticles = [];
  try {
    const liveRes = await fetch('https://privatesector.ch/api/news');
    liveArticles = await liveRes.json();
  } catch (e) {
    console.error('Could not fetch live articles:', e.message);
  }

  for (const item of imageSyncPlan) {
    const cleanFile = `${item.filename}.jpg`;
    const targetUrl = `/uploads/${cleanFile}`;
    console.log(`Processing: ${cleanFile} (${item.slug})`);

    if (!fs.existsSync(item.src)) {
      console.warn(`  [Warning] Source not found: ${item.src}`);
      continue;
    }

    const fileBuf = fs.readFileSync(item.src);
    
    // Save to public/uploads & server/uploads
    fs.writeFileSync(path.join(publicUploadsDir, cleanFile), fileBuf);
    fs.writeFileSync(path.join(localUploadsDir, cleanFile), fileBuf);
    console.log(`  Saved to public/uploads/${cleanFile} and server/uploads/${cleanFile}`);

    // Upload to live API with exact name
    const b64 = 'data:image/jpeg;base64,' + fileBuf.toString('base64');
    try {
      const upRes = await fetch('https://privatesector.ch/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: b64, filename: item.filename, exactName: true })
      });
      const upData = await upRes.json();
      console.log(`  Live Upload Response:`, upData);
      
      const liveUploadedUrl = upData.url || targetUrl;

      // Update SQLite
      await updateSQLite(item.slug, liveUploadedUrl);

      // Update Live API News record
      const match = liveArticles.find(a => a.slug === item.slug);
      if (match) {
        const payload = { ...match, image_url: liveUploadedUrl };
        const putRes = await fetch(`https://privatesector.ch/api/news/${match.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const putData = await putRes.json();
        console.log(`  Live API News ID ${match.id} Updated with ${liveUploadedUrl}:`, putData);
      }
    } catch (err) {
      console.error(`  Live API sync error:`, err.message);
    }
    console.log('');
  }

  console.log('=== VERIFYING FINAL LIVE IMAGES ===');
  try {
    const finalRes = await fetch('https://privatesector.ch/api/news');
    const all = await finalRes.json();
    for (const art of all) {
      const url = art.image_url.startsWith('http') ? art.image_url : 'https://privatesector.ch' + art.image_url;
      const r = await fetch(url);
      const ct = r.headers.get('content-type') || '';
      console.log(`${r.status === 200 && ct.startsWith('image/') ? '✅' : '❌'} [${art.id}] ${art.title.slice(0, 40)} -> ${url} (${r.status} ${ct})`);
    }
  } catch (err) {
    console.error('Final verification error:', err.message);
  }
}

main().catch(console.error);
