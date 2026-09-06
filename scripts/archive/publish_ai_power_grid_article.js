import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\7d536a9a-7d48-4c75-afef-a0a309f7399f\\.user_uploaded';
const srcImageName = 'media_1787564705087.jpg';
const baseName = 'americas_ai_boom_has_6_billion_power_problem_swiss_opportunity';

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

const title = "America's AI Boom Has a $6 Billion Power Problem";
const subtitle = "America is building AI data centers at extraordinary speed, but the electricity grid is emerging as a critical bottleneck. With PJM congestion costs surging 43% to $6B, Switzerland's industrial heavyweights in transformers, cooling, and grid automation are positioned for the transatlantic power buildout.";
const category = "Energy & Infrastructure";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-24";
const read_time_mins = 3;
const pull_quote = "AI needs more than chips. It needs power — and infrastructure capable of moving that power. The next investment chain is AI → Power → Grid → Transformers → Cooling → Connectivity. That is where Switzerland becomes interesting.";
const tags = JSON.stringify([
  "Artificial Intelligence",
  "Energy & Infrastructure",
  "Power Grid",
  "PJM Interconnection",
  "Data Centers",
  "Hitachi Energy",
  "ABB",
  "Landis+Gyr",
  "Belimo",
  "HUBER+SUHNER",
  "VAT Group",
  "Comet Group",
  "INFICON",
  "Burckhardt Compression",
  "Schindler",
  "Switzerland",
  "United States",
  "Grid Modernization"
]);
const focus_keyword = "Americas AI boom 6 billion power problem PJM grid congestion Swiss industrial opportunity Hitachi Energy ABB";
const meta_title = "America's AI Boom Has a $6 Billion Power Problem — PrivateSector";
const meta_description = "PJM grid congestion costs hit $6B (+43% YoY) as AI data centers surge in Northern Virginia. Discover why the race for electrical power opens a massive opportunity for Swiss grid leaders.";
const slug = "americas-ai-boom-has-a-6-billion-power-problem";

const content_body = `USA 🇺🇸 ★ AI ★ ENERGY ★ SWISS OPPORTUNITY 🇨🇭 | 24 AUGUST 2026 | 3 MIN READ

America is building AI data centers at extraordinary speed. But a less visible bottleneck is emerging: **the electricity grid**.

In the first half of 2026, congestion costs across **PJM** — America’s largest electricity market — reached approximately **$6 billion**, according to its independent market monitor.

That is up **43% year-on-year**.

PJM serves around 67 million people across all or parts of 13 states and Washington, D.C. One important pressure point is **Northern Virginia** — the world’s largest data-center cluster.

The signal is simple:
**AI needs more than chips. It needs power — and infrastructure capable of moving that power.**

---

## 🇨🇭 WHY THIS MATTERS FOR SWITZERLAND

**America’s grid problem could become a Swiss industrial opportunity.**

Switzerland has major expertise across exactly the technologies the U.S. increasingly needs:

⚡ **Transformers** ★ **Switchgear** ★ **Grid Automation** ★ **Cooling** ★ **Connectivity** ★ **Semiconductor Equipment**

### The Hitachi Energy Signal
The clearest example is **Hitachi Energy**, headquartered in the Zurich region.

The company is investing **more than $1 billion in U.S. grid-equipment manufacturing**, including a **$457 million large-power-transformer factory in Virginia**.

That connection matters:
$$\\text{AI expansion} \\longrightarrow \\text{electricity demand} \\longrightarrow \\text{grid investment} \\longrightarrow \\text{Swiss technology}$$

- **ABB** is another important player through electrification, automation, and data-center power infrastructure.
- **Landis+Gyr** brings smart-grid and grid-intelligence technology.
- **Swiss semiconductor suppliers** can benefit further upstream as America expands domestic chip manufacturing.

---

## 🏆 PRIVATESECTOR.CH TOP 10
### Swiss Companies Positioned Around America's AI Infrastructure Buildout

1. ⚡ **Hitachi Energy** — Transformers & transmission
2. 🔌 **ABB** — Electrification & switchgear
3. 📊 **Landis+Gyr** — Smart grids & grid intelligence
4. ❄️ **Belimo** — Data-center cooling controls
5. 📡 **HUBER+SUHNER** — High-speed connectivity
6. 🔬 **VAT Group** — Semiconductor manufacturing
7. ⚡ **Comet** — Semiconductor equipment
8. 🛰️ **INFICON** — Sensors & vacuum technology
9. 🏭 **Burckhardt Compression** — Energy infrastructure
10. 🏢 **Schindler** — Building infrastructure

*Important: This is a PrivateSector.ch opportunity watchlist — not a claim that these companies have received contracts related to PJM.*

---

## 💡 THE OPPORTUNITY

For years, investors followed:
$$\\text{AI} \\longrightarrow \\text{Nvidia} \\longrightarrow \\text{Chips} \\longrightarrow \\text{Data Centers}$$

The next investment chain could increasingly be:
$$\\text{AI} \\longrightarrow \\text{Power} \\longrightarrow \\text{Grid} \\longrightarrow \\text{Transformers} \\longrightarrow \\text{Cooling} \\longrightarrow \\text{Connectivity}$$

**That is where Switzerland becomes interesting.**

America needs enormous physical infrastructure to support its AI ambitions — and several Swiss industrial companies already operate inside that supply chain.

---

## ⚠️ THE RISK

AI did not cause the entire $6 billion congestion bill. Weather and existing transmission constraints were major contributors, and PJM has disputed parts of the independent monitor’s analysis.

But the broader trend is difficult to ignore:
**Electricity demand is rising while critical grid infrastructure takes years to build.**

---

## 🎯 PRIVATESECTOR SIGNAL

- 🔴 **Problem:** ~$6B grid congestion costs
- 📈 **Driver to watch:** AI & data-center electricity demand
- 🇨🇭 **Swiss opportunity:** Grid technology, electrification, cooling, connectivity and semiconductor equipment
- 🥇 **Top 3:** Hitachi Energy ★ ABB ★ Landis+Gyr
- 📍 **Hotspot:** Northern Virginia / PJM

---

**The AI boom isn't only creating a race for computing power.**
**It is creating a race for electrical power.**

*PrivateSector.ch ×*
*You find the signal. You find the opportunity.*`;

// 1. Update SQLite Local Database
function updateSQLite(imgUrl, schemaMarkup) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
    });

    db.serialize(() => {
      db.get('SELECT id FROM news WHERE title = ? OR slug = ?', [title, slug], (err, row) => {
        if (err) {
          db.close();
          return reject(err);
        }

        if (row) {
          console.log(`[SQLite] Article exists (ID: ${row.id}). Updating...`);
          const updateStmt = db.prepare(`
            UPDATE news SET 
              subtitle = ?, category = ?, author_name = ?, author_avatar = ?, date_published = ?,
              read_time_mins = ?, content_body = ?, pull_quote = ?, tags = ?, image_url = ?,
              focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?
            WHERE id = ?
          `);
          updateStmt.run([
            subtitle, category, author_name, author_avatar, date_published,
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
          subtitle = $1, category = $2, author_name = $3, author_avatar = $4, date_published = $5,
          read_time_mins = $6, content_body = $7, pull_quote = $8, tags = $9, image_url = $10,
          focus_keyword = $11, meta_title = $12, meta_description = $13, slug = $14, schema_markup = $15
        WHERE id = $16
      `, [
        subtitle, category, author_name, author_avatar, date_published,
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
  console.log("=== Publishing Article: America's AI Boom Has a $6 Billion Power Problem ===\n");

  // 1. Upload feature image
  const imgUrl = await uploadImage();
  console.log(`\nFeature Image URL: ${imgUrl}`);

  // 2. Generate schema markup
  const schemaMarkup = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": title,
    "description": meta_description,
    "image": imgUrl.startsWith('http') ? imgUrl : "https://privatesector.ch" + imgUrl,
    "datePublished": date_published,
    "dateModified": date_published,
    "inLanguage": "en",
    "mainEntityOfPage": `https://privatesector.ch/news/${slug}`,
    "keywords": `${focus_keyword}, Hitachi Energy, ABB, Landis+Gyr, Belimo, HUBER+SUHNER, VAT Group, Comet, INFICON, Burckhardt Compression, Schindler, PJM, AI Power Grid`,
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
    console.log('Published Article on Live API:', found ? `Found ID: ${found.id}, Slug: ${found.slug}` : 'Not found');
  } catch (e) {
    console.error('Verification error:', e.message);
  }
}

main().catch(console.error);
