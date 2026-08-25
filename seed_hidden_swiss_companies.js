import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');

const hiddenSwissCompanies = [
  {
    name: 'Crevoisier SA',
    logo_bg: '#1A365D',
    canton: 'JU',
    industry: 'Manufacturing',
    size_class: 'Small',
    description: 'Family-owned precision machinery builder in Les Genevez since 1966. Over 6,000 C501 polishing machines installed across 65+ countries.',
    premium: 1,
    verified: 1,
    founded: 1966,
    employees: 45,
    revenue_band: 'CHF 10M - 25M',
    website: 'https://crevoisier.ch',
    linkedin: 'https://linkedin.com/company/crevoisier-sa',
    contact_email: 'contact@crevoisier.ch',
    about_text: 'Crevoisier SA has engineered and manufactured high-precision finishing and polishing machines in Les Genevez (Canton Jura) for three generations. Renowned globally in watchmaking, medical technology, aerospace, and robotics.',
    structured_data: JSON.stringify({
      foundingLocation: 'Les Genevez, Canton Jura',
      ceo: 'Laurent Crevoisier',
      chairman: 'Philippe Crevoisier',
      founder: 'René Crevoisier',
      flagshipProduct: 'C501 Polishing & Grinding Machine',
      globalInstallations: '6,000+ machines in 65+ countries'
    }),
    focus_keyword: 'Crevoisier SA Jura precision polishing machinery watchmaking',
    meta_title: 'Crevoisier SA — Precision Machine Builder in Canton Jura',
    meta_description: 'Crevoisier SA in Les Genevez, Canton Jura: Family-owned precision machine builder with over 6,000 machines across 65+ countries in watchmaking, MedTech, and robotics.',
    slug: 'crevoisier-sa',
    schema_markup: '',
    tags: JSON.stringify(['Crevoisier SA', 'Hidden Swiss', 'Canton Jura', 'Precision Machinery', 'Watchmaking', 'Robotics'])
  },
  {
    name: 'Yalosys AG',
    logo_bg: '#0F766E',
    canton: 'ZG',
    industry: 'Technology',
    size_class: 'Small',
    description: 'Pioneering laser microprocessing of glass, quartz, and sapphire in Hünenberg (Canton Zug) for MedTech, photonics, and semiconductors.',
    premium: 1,
    verified: 1,
    founded: 2022,
    employees: 15,
    revenue_band: 'CHF 5M - 10M',
    website: 'https://yalosys.ch',
    linkedin: 'https://linkedin.com/company/yalosys-ag',
    contact_email: 'info@yalosys.ch',
    about_text: 'Yalosys AG specializes in automated ultrafast laser micromachining for brittle transparent materials including glass, sapphire, and fused silica, enabling microscopic fluidic and optical devices.',
    structured_data: JSON.stringify({
      foundingLocation: 'Hünenberg, Canton Zug',
      ceo: 'Dr. Luigi Calabrese',
      technology: 'Ultrafast Laser Microprocessing',
      materials: 'Glass, Sapphire, Quartz, Fused Silica',
      sectors: 'MedTech, Microfluidics, Photonics, Semiconductors'
    }),
    focus_keyword: 'Yalosys AG Zug laser micromachining glass sapphire medtech',
    meta_title: 'Yalosys AG — Laser Glass Microprocessing in Canton Zug',
    meta_description: 'Yalosys AG in Hünenberg, Canton Zug: Advanced ultrafast laser micromachining of glass and sapphire for microfluidics, photonics, and MedTech.',
    slug: 'yalosys-ag',
    schema_markup: '',
    tags: JSON.stringify(['Yalosys AG', 'Hidden Swiss', 'Canton Zug', 'Laser Microprocessing', 'MedTech', 'Photonics'])
  }
];

// 1. Seed into SQLite
async function seedSQLite() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
    });

    db.serialize(() => {
      for (const comp of hiddenSwissCompanies) {
        db.get('SELECT id FROM companies WHERE name = ? OR slug = ?', [comp.name, comp.slug], (err, row) => {
          if (err) console.error('SQLite check error:', err);
          if (row) {
            console.log(`[SQLite] Company ${comp.name} already exists (ID: ${row.id}). Updating...`);
            const updateStmt = db.prepare(`
              UPDATE companies SET
                logo_bg = ?, canton = ?, industry = ?, size_class = ?, description = ?,
                premium = ?, verified = ?, founded = ?, employees = ?, revenue_band = ?,
                website = ?, linkedin = ?, contact_email = ?, about_text = ?, structured_data = ?,
                focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, tags = ?
              WHERE id = ?
            `);
            updateStmt.run([
              comp.logo_bg, comp.canton, comp.industry, comp.size_class, comp.description,
              comp.premium, comp.verified, comp.founded, comp.employees, comp.revenue_band,
              comp.website, comp.linkedin, comp.contact_email, comp.about_text, comp.structured_data,
              comp.focus_keyword, comp.meta_title, comp.meta_description, comp.slug, comp.tags, row.id
            ], (uErr) => {
              if (uErr) console.error('SQLite update error:', uErr);
            });
            updateStmt.finalize();
          } else {
            console.log(`[SQLite] Inserting ${comp.name}...`);
            const insertStmt = db.prepare(`
              INSERT INTO companies (
                name, logo_bg, canton, industry, size_class, description,
                premium, verified, founded, employees, revenue_band,
                website, linkedin, contact_email, about_text, structured_data,
                focus_keyword, meta_title, meta_description, slug, schema_markup, tags
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            insertStmt.run([
              comp.name, comp.logo_bg, comp.canton, comp.industry, comp.size_class, comp.description,
              comp.premium, comp.verified, comp.founded, comp.employees, comp.revenue_band,
              comp.website, comp.linkedin, comp.contact_email, comp.about_text, comp.structured_data,
              comp.focus_keyword, comp.meta_title, comp.meta_description, comp.slug, comp.schema_markup, comp.tags
            ], (iErr) => {
              if (iErr) console.error('SQLite insert error:', iErr);
            });
            insertStmt.finalize();
          }
        });
      }
    });

    setTimeout(() => {
      db.close();
      console.log('[SQLite] Finished syncing Hidden Swiss companies.');
      resolve();
    }, 1000);
  });
}

// 2. Seed into Live Postgres
async function seedPostgres() {
  const connectionString = "postgres://postgres:edcKM0253QrFib0sSl2JYZoj5If8DxbKVxgzmsBpQVI5HBHyQ9UBZ6gMi79z0AFD@62.72.44.254:1127/postgres";
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('[PostgreSQL] Connected to live database!');

    for (const comp of hiddenSwissCompanies) {
      const checkRes = await client.query('SELECT id FROM companies WHERE name = $1 OR slug = $2', [comp.name, comp.slug]);
      if (checkRes.rows.length > 0) {
        console.log(`[PostgreSQL] Company ${comp.name} exists (ID: ${checkRes.rows[0].id}). Updating...`);
        await client.query(`
          UPDATE companies SET
            logo_bg = $1, canton = $2, industry = $3, size_class = $4, description = $5,
            premium = $6, verified = $7, founded = $8, employees = $9, revenue_band = $10,
            website = $11, linkedin = $12, contact_email = $13, about_text = $14, structured_data = $15,
            focus_keyword = $16, meta_title = $17, meta_description = $18, slug = $19, tags = $20
          WHERE id = $21
        `, [
          comp.logo_bg, comp.canton, comp.industry, comp.size_class, comp.description,
          comp.premium, comp.verified, comp.founded, comp.employees, comp.revenue_band,
          comp.website, comp.linkedin, comp.contact_email, comp.about_text, comp.structured_data,
          comp.focus_keyword, comp.meta_title, comp.meta_description, comp.slug, comp.tags, checkRes.rows[0].id
        ]);
      } else {
        console.log(`[PostgreSQL] Inserting ${comp.name}...`);
        await client.query(`
          INSERT INTO companies (
            name, logo_bg, canton, industry, size_class, description,
            premium, verified, founded, employees, revenue_band,
            website, linkedin, contact_email, about_text, structured_data,
            focus_keyword, meta_title, meta_description, slug, schema_markup, tags
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        `, [
          comp.name, comp.logo_bg, comp.canton, comp.industry, comp.size_class, comp.description,
          comp.premium, comp.verified, comp.founded, comp.employees, comp.revenue_band,
          comp.website, comp.linkedin, comp.contact_email, comp.about_text, comp.structured_data,
          comp.focus_keyword, comp.meta_title, comp.meta_description, comp.slug, comp.schema_markup, comp.tags
        ]);
      }
    }

    await client.end();
    console.log('[PostgreSQL] Finished syncing Hidden Swiss companies.');
  } catch (err) {
    console.error('[PostgreSQL] Error syncing companies:', err.message);
  }
}

// 3. Post to Live API
async function postToLiveApi() {
  try {
    const res = await fetch('https://privatesector.ch/api/companies');
    const existingList = await res.json();
    for (const comp of hiddenSwissCompanies) {
      const existing = Array.isArray(existingList) ? existingList.find(c => c.name === comp.name || c.slug === comp.slug) : null;
      if (existing) {
        console.log(`[Live API] Updating ${comp.name} (ID: ${existing.id})...`);
        await fetch(`https://privatesector.ch/api/companies/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(comp)
        });
      } else {
        console.log(`[Live API] Creating ${comp.name}...`);
        await fetch('https://privatesector.ch/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(comp)
        });
      }
    }
    console.log('[Live API] Finished syncing companies with live site.');
  } catch (err) {
    console.error('[Live API] Error syncing with live API:', err.message);
  }
}

async function main() {
  await seedSQLite();
  await seedPostgres();
  await postToLiveApi();
  console.log('=== Complete Hidden Swiss Companies Seeding Finished ===');
}

main().catch(console.error);
