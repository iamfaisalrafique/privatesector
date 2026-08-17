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

const targetMap = [
  { slug: 'ai-is-creating-new-fortunes-where-will-the-money-go-next', url: '/uploads/ai_wealth_creation_switzerland.jpg' },
  { slug: 'archer-aviation-boeing-businesses-acquisition-autonomous-flight-switzerland', url: '/uploads/archer_aviation_boeing_autonomous_flight.jpg' },
  { slug: 'thoma-bravo-4b-accelerant-acquisition-insurance-platform-switzerland', url: '/uploads/thoma_bravo_accelerant_insurance_platform.jpg' },
  { slug: 'mastercard-bvnk-acquisition-traditional-digital-money-bridge-switzerland', url: '/uploads/mastercard_bvnk_digital_bridge.jpg' },
  { slug: 'tesla-texas-10b-solar-factory-supply-chain-staubli', url: '/uploads/tesla_texas_solar_factory_supply_chain.jpg' },
  { slug: 'apple-houston-manufacturing-ecosystem-swiss-industry', url: '/uploads/apple_houston_manufacturing_ecosystem.jpg' },
  { slug: 'us-drone-tariffs-switzerland-15-percent-impact-supply-chain', url: '/uploads/us_drone_tariffs_swiss_precision.jpg' },
  { slug: 'swiss-pharma-building-north-carolina-power-base-who-could-follow', url: '/uploads/swiss_pharma_nc_power_base.jpg' }
];

async function main() {
  console.log('=== SETTING CLEAN IMAGE URLS IN SQLITE AND LIVE API ===\n');

  // 1. Update SQLite
  const db = new sqlite3.Database(dbPath);
  for (const item of targetMap) {
    await new Promise((resolve) => {
      db.run('UPDATE news SET image_url = ? WHERE slug = ?', [item.url, item.slug], function(err) {
        if (err) console.error(`[SQLite Error] ${item.slug}:`, err.message);
        else console.log(`[SQLite] Updated ${item.slug} -> ${item.url}`);
        resolve();
      });
    });
  }
  db.close();

  // 2. Update Live API
  try {
    const liveRes = await fetch('https://privatesector.ch/api/news');
    const liveArticles = await liveRes.json();

    for (const item of targetMap) {
      const match = liveArticles.find(a => a.slug === item.slug);
      if (match) {
        const payload = { ...match, image_url: item.url };
        const putRes = await fetch(`https://privatesector.ch/api/news/${match.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const putData = await putRes.json();
        console.log(`[Live API] ID ${match.id} (${item.slug}) updated -> ${item.url}:`, putData);
      }
    }
  } catch (err) {
    console.error('Live API update error:', err.message);
  }

  // 3. Ensure files exist in public/uploads and server/uploads
  console.log('\nVerifying local files in public/uploads:');
  targetMap.forEach(item => {
    const filename = path.basename(item.url);
    const pubFile = path.join(publicUploadsDir, filename);
    const srvFile = path.join(localUploadsDir, filename);
    console.log(`  ${filename}: public=${fs.existsSync(pubFile)}, server=${fs.existsSync(srvFile)}`);
  });

  console.log('\n=== DONE ===');
}

main().catch(console.error);
