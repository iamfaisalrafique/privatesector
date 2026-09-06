import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\f5890e40-036b-4072-a36b-7614fa1cfc16\\.user_uploaded';
const srcImageName = 'media_1788244715660.jpg';
const baseName = 'america_securing_power_grid_switzerland_hitachi_energy';

const localUploadsDir = path.resolve(__dirname, 'server', 'uploads');
const publicUploadsDir = path.resolve(__dirname, 'public', 'uploads');
const distUploadsDir = path.resolve(__dirname, 'dist', 'uploads');
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');

if (!fs.existsSync(localUploadsDir)) fs.mkdirSync(localUploadsDir, { recursive: true });
if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });
if (fs.existsSync(path.resolve(__dirname, 'dist')) && !fs.existsSync(distUploadsDir)) {
  fs.mkdirSync(distUploadsDir, { recursive: true });
}

async function uploadImage() {
  const filePath = path.join(uploadDir, srcImageName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Source image not found at ${filePath}`);
  }

  const fileBuf = fs.readFileSync(filePath);
  const b64 = 'data:image/jpeg;base64,' + fileBuf.toString('base64');
  
  // Save local copies in server/uploads, public/uploads & dist/uploads
  fs.writeFileSync(path.join(localUploadsDir, `${baseName}.jpg`), fileBuf);
  fs.writeFileSync(path.join(publicUploadsDir, `${baseName}.jpg`), fileBuf);
  if (fs.existsSync(distUploadsDir)) {
    fs.writeFileSync(path.join(distUploadsDir, `${baseName}.jpg`), fileBuf);
  }
  console.log(`[Local Upload] Saved local image copies as ${baseName}.jpg`);

  // Upload to live site
  try {
    console.log(`[Upload] Uploading ${baseName} to live API (https://privatesector.ch/api/upload)...`);
    const res = await fetch('https://privatesector.ch/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: b64, filename: baseName, exactName: true })
    });
    const data = await res.json();
    console.log(`[Upload] Result:`, data);
    if (data && data.url) {
      return data.url;
    }
  } catch (err) {
    console.error(`[Upload] Error uploading to live server:`, err.message);
  }

  return `/uploads/${baseName}.jpg`;
}

const title = "America Is Securing Its Power Grid — Where Could Switzerland Fit In?";
const subtitle = "The United States is tightening security around its bulk-power system against foreign supply-chain risks just as electricity demand surges from AI and manufacturing. Here is why Switzerland's grid-equipment giant Hitachi Energy is uniquely positioned.";
const category = "Energy & Infrastructure";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-09-01";
const read_time_mins = 3;
const pull_quote = "America wants a more secure and resilient electricity system, while a Switzerland-headquartered company is already expanding U.S. production of equipment essential to that system.";
const tags = JSON.stringify([
  "Energy & Infrastructure",
  "Power Grid",
  "Hitachi Energy",
  "White House",
  "Executive Order",
  "Electricity Grid",
  "Transformers",
  "Bulk-Power System",
  "Supply Chain",
  "National Security",
  "AI Infrastructure",
  "Advanced Manufacturing",
  "Switzerland",
  "United States",
  "Transatlantic Investment",
  "PrivateSector Analysis"
]);
const focus_keyword = "America power grid security Switzerland Hitachi Energy bulk power system electricity infrastructure transformers";
const meta_title = "America Is Securing Its Power Grid — Where Could Switzerland Fit In? — PrivateSector";
const meta_description = "As the White House moves to protect the U.S. bulk-power system from foreign supply-chain risks, Switzerland-headquartered Hitachi Energy is investing over $1B in American transformer manufacturing.";
const slug = "america-securing-power-grid-switzerland-hitachi-energy";

const content_body = `ANALYSIS 🇺🇸 ↔ 🇨🇭 ◆ 1 SEPTEMBER 2026 ◆ 3 MIN READ ◆ ENERGY & INFRASTRUCTURE ◆ POWER GRID ◆ SUPPLY CHAIN ◆ NATIONAL SECURITY

## ⚡ America Moves to Protect Its Electricity System

The United States is tightening security around its electricity grid.

A new White House executive order targets risks linked to certain foreign-made equipment used in the country’s bulk-power system, as Washington seeks to protect critical infrastructure from supply-chain and national security vulnerabilities.

The issue comes at a critical time when America’s dependence on reliable electricity is growing rapidly, driven by **artificial intelligence, data centers, and advanced domestic manufacturing**.

---

## 🎯 Why Does America Need This?

The strategic shift is driven by two converging pressures:

- **1. More Power:** AI workloads, hyperscale data centers, and manufacturing are driving U.S. electricity demand to multi-decade highs.
- **2. More Security:** America wants its bulk-power system and critical grid equipment insulated from high-risk foreign supply chains and cybersecurity threats.

---

## 🇨🇭 Where Switzerland Enters the Story

**Hitachi Energy**, headquartered in Zurich, Switzerland, is already expanding the production of critical grid equipment directly inside the United States.

The company is investing **more than $1 billion** in U.S. grid-equipment manufacturing to strengthen America's energy infrastructure:

- **Virginia Transformer Facility:** In South Boston, Virginia, Hitachi Energy has broken ground on a **$457 million** large power-transformer facility, expected to create approximately **825 jobs**.
- **Critical Grid Hardware:** The new facility will produce large power transformers essential for transmission grids, substation resilience, and clean energy integration.
- **Onshoring Capability:** Producing critical electrical hardware domestically matches Washington’s objective to secure domestic supply lines without sacrificing scale.

---

## 💡 PRIVATESECTOR ANALYSIS

**RISING DEMAND ◆ SECURITY CONCERNS ◆ STRATEGIC SWISS FIT**

The White House action does not mean Hitachi Energy has received a new contract or special government advantage.

**However, the timing is highly significant:**
America wants a more secure, resilient electricity system — and a Switzerland-headquartered engineering leader is already investing heavily to manufacture essential equipment on American soil.

The bigger question for Switzerland is therefore:

> **As America strengthens and insulates its power grid, could more opportunities emerge for Swiss engineering, technology, and specialised manufacturing?**

PrivateSector will follow where the investment, technology partnerships, and supply-chain opportunities go next.

---

Source: [White House — Executive Order on Securing the U.S. Bulk-Power System (26 August 2026)](https://www.whitehouse.gov/presidential-actions/2026/08/declaring-a-national-emergency-to-secure-the-united-states-bulk-power-system/); [Hitachi Energy — Virginia Transformer Facility Groundbreaking (29 June 2026)](https://www.hitachienergy.com/news-and-events/press-releases/2026/06/hitachi-energy-breaks-ground-on-the-nation-s-largest-facility-for-the-production-of-large-power-transformers-in-south-boston-virginia); [Hitachi Energy — $1 Billion U.S. Manufacturing Investment](https://www.hitachienergy.com/news-and-events/press-releases/2025/09/hitachi-announces-historic-1-billion-usd-manufacturing-investment-to-power-america-s-energy-future-through-production-of-critical-grid-infrastructure).`;

// 1. Update SQLite Database
async function updateSQLite(imgUrl, schemaMarkup) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      
      db.get('SELECT id FROM news WHERE slug = ? OR title = ?', [slug, title], (sErr, row) => {
        if (sErr) {
          db.close();
          return reject(sErr);
        }

        if (row && row.id) {
          console.log(`[SQLite] Article exists (ID: ${row.id}). Updating...`);
          const updateStmt = db.prepare(`
            UPDATE news SET 
              title = ?, subtitle = ?, category = ?, author_name = ?, author_avatar = ?, date_published = ?,
              read_time_mins = ?, content_body = ?, pull_quote = ?, tags = ?, image_url = ?,
              focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?
            WHERE id = ?
          `);
          updateStmt.run([
            title, subtitle, category, author_name, author_avatar, date_published,
            read_time_mins, content_body, pull_quote, tags, imgUrl,
            focus_keyword, meta_title, meta_description, slug, schemaMarkup, row.id
          ], function(uErr) {
            updateStmt.finalize();
            db.close();
            if (uErr) reject(uErr);
            else {
              console.log(`[SQLite] Updated successfully!`);
              resolve(row.id);
            }
          });
        } else {
          console.log(`[SQLite] Inserting new article...`);
          const stmt = db.prepare(`
            INSERT INTO news (
              title, subtitle, category, author_name, author_avatar, date_published, 
              read_time_mins, content_body, pull_quote, tags, image_url, 
              focus_keyword, meta_title, meta_description, slug, schema_markup
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run([
            title, subtitle, category, author_name, author_avatar, date_published,
            read_time_mins, content_body, pull_quote, tags, imgUrl,
            focus_keyword, meta_title, meta_description, slug, schemaMarkup
          ], function(iErr) {
            const id = this ? this.lastID : null;
            stmt.finalize();
            db.close();
            if (iErr) reject(iErr);
            else {
              console.log(`[SQLite] Inserted successfully with ID: ${id}`);
              resolve(id);
            }
          });
        }
      });
    });
  });
}

// 2. Update Live Postgres Database
async function updateLivePostgres(imgUrl, schemaMarkup) {
  const connectionString = "postgres://postgres:edcKM0253QrFib0sSl2JYZoj5If8DxbKVxgzmsBpQVI5HBHyQ9UBZ6gMi79z0AFD@62.72.44.254:1127/postgres";
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('[Postgres] Connected to live database!');
    const tagsArray = JSON.parse(tags);
    const resCheck = await client.query('SELECT id FROM news WHERE slug = $1 OR title = $2', [slug, title]);

    if (resCheck.rows.length > 0) {
      const id = resCheck.rows[0].id;
      console.log(`[Postgres] Article exists (ID: ${id}). Updating...`);
      await client.query(`
        UPDATE news SET 
          title = $1, subtitle = $2, category = $3, author_name = $4, author_avatar = $5, date_published = $6,
          read_time_mins = $7, content_body = $8, pull_quote = $9, tags = $10, image_url = $11,
          focus_keyword = $12, meta_title = $13, meta_description = $14, slug = $15, schema_markup = $16
        WHERE id = $17
      `, [
        title, subtitle, category, author_name, author_avatar, date_published,
        read_time_mins, content_body, pull_quote, JSON.stringify(tagsArray), imgUrl,
        focus_keyword, meta_title, meta_description, slug, schemaMarkup, id
      ]);
      console.log('[Postgres] Article updated successfully!');
    } else {
      console.log('[Postgres] Inserting article...');
      const resIns = await client.query(`
        INSERT INTO news (
          title, subtitle, category, author_name, author_avatar, date_published, 
          read_time_mins, content_body, pull_quote, tags, image_url, 
          focus_keyword, meta_title, meta_description, slug, schema_markup
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id
      `, [
        title, subtitle, category, author_name, author_avatar, date_published,
        read_time_mins, content_body, pull_quote, JSON.stringify(tagsArray), imgUrl,
        focus_keyword, meta_title, meta_description, slug, schemaMarkup
      ]);
      console.log(`[Postgres] Article inserted successfully with ID: ${resIns.rows[0].id}`);
    }
  } catch (err) {
    console.error('[Postgres] Error publishing to live postgres:', err.message);
  } finally {
    await client.end();
  }
}

// 3. Post / Update Live API
async function postToLiveApi(imgUrl, schemaMarkup) {
  try {
    const getRes = await fetch('https://privatesector.ch/api/news');
    const existingList = await getRes.json();
    const existing = Array.isArray(existingList) ? existingList.find(a => a.slug === slug || a.title === title) : null;

    const payload = {
      title,
      subtitle,
      category,
      author_name,
      author_avatar,
      date_published,
      read_time_mins,
      content_body,
      pull_quote,
      tags: JSON.parse(tags),
      image_url: imgUrl,
      focus_keyword,
      meta_title,
      meta_description,
      slug,
      schema_markup: schemaMarkup
    };

    if (existing && existing.id) {
      console.log(`[Live API] Updating existing article ID: ${existing.id} on https://privatesector.ch/api/news/${existing.id}...`);
      const res = await fetch(`https://privatesector.ch/api/news/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log(`[Live API] Update response:`, data);
    } else {
      console.log(`[Live API] Inserting new article into https://privatesector.ch/api/news...`);
      const res = await fetch('https://privatesector.ch/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log(`[Live API] Insert response:`, data);
    }
  } catch (err) {
    console.error(`[Live API] Error posting to live API:`, err.message);
  }
}

async function main() {
  console.log('=== Publishing Article: America Is Securing Its Power Grid ===\n');

  // 1. Upload feature image
  const imgUrl = await uploadImage();
  console.log(`\nFeature Image URL: ${imgUrl}`);

  // 2. Generate schema markup
  const schemaMarkup = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": title,
    "description": meta_description,
    "image": imgUrl.startsWith('http') ? imgUrl : `https://privatesector.ch${imgUrl}`,
    "datePublished": date_published,
    "dateModified": date_published,
    "inLanguage": "en",
    "mainEntityOfPage": `https://privatesector.ch/news/${slug}`,
    "keywords": `${focus_keyword}, Energy & Infrastructure, Power Grid, Hitachi Energy, White House, Executive Order, Electricity Grid, Transformers, Supply Chain, National Security, Switzerland, United States, Transatlantic Investment, PrivateSector Analysis`,
    "articleSection": category,
    "author": {
      "@type": "Organization",
      "name": author_name,
      "url": "https://privatesector.ch"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PrivateSector",
      "logo": {
        "@type": "ImageObject",
        "url": "https://privatesector.ch/assets/logo_highres.png"
      }
    }
  }, null, 2);

  // 3. Update SQLite
  await updateSQLite(imgUrl, schemaMarkup);

  // 4. Update Live Postgres
  await updateLivePostgres(imgUrl, schemaMarkup);

  // 5. Update Live API
  await postToLiveApi(imgUrl, schemaMarkup);

  console.log('\n=== Article Published! Verifying live site... ===');
  try {
    const verifyRes = await fetch('https://privatesector.ch/api/news');
    const allLive = await verifyRes.json();
    console.log(`Total live articles: ${allLive.length}`);
    const found = allLive.find(a => a.slug === slug || a.title === title);
    console.log('Published Article on Live API:', found ? `SUCCESS (ID: ${found.id}, Slug: ${found.slug}, Image: ${found.image_url})` : 'NOT FOUND');
  } catch (e) {
    console.error('Verification error:', e.message);
  }
}

main().catch(console.error);
