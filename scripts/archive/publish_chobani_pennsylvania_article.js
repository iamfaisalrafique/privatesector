import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\78a16576-3088-46ea-b74c-d71e0593f7eb\\.user_uploaded';
const srcImageName = 'media_1788358070889.jpg';
const baseName = 'chobani_pennsylvania_swiss_suppliers_sig_abb_buhler';

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

const title = "Chobani Is Putting $1.2B Into Pennsylvania — Which Swiss Companies Could Get a Piece?";
const subtitle = "Chobani is investing $1.2 billion over five years in a massive 1.5M sq ft Allentown manufacturing campus. But for Switzerland, the interesting question is: Who will supply the packaging, automation, robotics, and processing technology behind it?";
const category = "Advanced Manufacturing";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-09-02";
const read_time_mins = 3;
const pull_quote = "Switzerland doesn't need to make Chobani's yogurt. It could help build the machines that make it.";
const tags = JSON.stringify([
  "Advanced Manufacturing",
  "Food & Beverage",
  "Chobani",
  "Pennsylvania",
  "Allentown",
  "SIG Group",
  "ABB",
  "Bühler",
  "Automation & Robotics",
  "Packaging Systems",
  "Food Processing",
  "Supply Chain",
  "Transatlantic Investment",
  "Switzerland",
  "United States",
  "PrivateSector Analysis"
]);
const focus_keyword = "Chobani Pennsylvania 1.2 billion investment Swiss companies SIG ABB Buhler food manufacturing automation packaging";
const meta_title = "Chobani Is Putting $1.2B Into Pennsylvania — Which Swiss Companies Could Get a Piece? — PrivateSector";
const meta_description = "Chobani's $1.2B manufacturing expansion in Allentown, Pennsylvania creates massive opportunities across processing, packaging, and automation. Could Swiss industrial leaders SIG, ABB, or Bühler benefit?";
const slug = "chobani-putting-1-2b-into-pennsylvania-swiss-companies";

const content_body = `USA INSIGHT 🇺🇸 ↔ 🇨🇭 ◆ 2 SEPTEMBER 2026 ◆ 3 MIN READ ◆ ADVANCED MANUFACTURING ◆ FOOD & BEVERAGE ◆ AUTOMATION & ROBOTICS ◆ SUPPLY CHAIN

**Chobani is investing approximately $1.2 billion over five years in a massive manufacturing and warehouse campus in Allentown, Pennsylvania.**

The roughly **1.5-million-square-foot facility** is expected to create more than **900 jobs** and eventually process over **3 billion pounds of Pennsylvania milk** annually.

But for Switzerland, the interesting question isn’t how much yogurt Chobani will produce.

> **It is: Who will supply the technology behind a $1.2 billion manufacturing operation?**

---

## 🇨🇭 WHERE SWITZERLAND COULD FIT

A manufacturing and packaging operation of this scale requires advanced processing technology, high-speed aseptic packaging lines, and industrial automation. Several Swiss industrial heavyweights lead these sectors globally:

- **SIG (Neuhausen):** Specializes in advanced aseptic carton packaging and high-speed filling systems for food and beverages.
- **ABB (Zurich):** Provides automation, electrification, precision motors, variable frequency drives, robotics, and process-control technologies used throughout modern food and beverage manufacturing.
- **Bühler (Uzwil):** Develops sophisticated industrial food-processing technology, ingredient handling systems, and specialized equipment used across global food-production chains.

*There is currently no evidence that SIG, ABB, or Bühler have secured contracts for this Chobani project. They are companies worth watching because their technologies fit areas where a manufacturing expansion of this scale could create substantial procurement opportunities.*

---

## 🟢 THE BRIGHT SIDE

This isn't simply another yogurt factory.

- **Broader Innovation:** Chobani says the Pennsylvania facility will support new food and beverage innovation beyond yogurt, potentially widening procurement opportunities across processing, packaging, automation, utilities, and logistics.
- **Historic Investment:** Pennsylvania describes the project as the **largest single private investment** in the state's agriculture industry.

---

## 🔴 RED FLAGS

- **Phased Capital Deployment:** The $1.2 billion will be invested over five years, not immediately in a single procurement wave.
- **Brownfield Acquisition:** Chobani is acquiring an existing facility rather than constructing everything from scratch, meaning some infrastructure and equipment are already in place.
- **No Guarantees:** Global competition from U.S., European, and Asian machinery builders is intense, and there is no guarantee Swiss suppliers will win contracts.

---

## 🔁 THIS IS BIGGER THAN PENNSYLVANIA

Chobani has been building a much larger American manufacturing network across several states:

- **Rome, New York:** In 2025, Chobani announced another **$1.2 billion plant**.
- **Twin Falls, Idaho:** A roughly **$500 million expansion** was also launched.

That means Swiss suppliers shouldn't necessarily look at Pennsylvania as one isolated opportunity. They should watch Chobani's broader **multi-billion-dollar U.S. manufacturing expansion**.

---

## 💡 PRIVATESECTOR VIEW

Most headlines will focus on $1.2 billion, 900 jobs, and Pennsylvania dairy farmers.

PrivateSector asks a different question:

> **Who equips the factory?**

- Someone will supply the high-speed filling systems.
- Someone will provide industrial robotics and line automation.
- Someone will manufacture the specialized processing equipment.
- Someone will supply motors, drives, sensors, and process controls.

And some of those opportunities could fit Swiss industrial expertise.

**Switzerland doesn't need to make Chobani's yogurt.**  
**It could help build the machines that make it.**

---

### 📊 PRIVATESECTOR SCORE: 9.3 / 10

| Metric | Score | Assessment |
| :--- | :--- | :--- |
| **Investment Scale** | **9.5 / 10** | Massive $1.2B capital commitment across 1.5M sq ft facility |
| **Swiss Opportunity** | **9.0 / 10** | Strong alignment with Swiss aseptic filling, automation & food processing tech |
| **Execution Certainty** | **9.5 / 10** | Established market leader with active state support and site acquisition |
| **Long-Term Potential** | **10.0 / 10** | Part of multi-billion U.S. network expansion (PA, NY, ID) |

**Verdict:** *Watch the industrial equipment and technology providers behind the $1.2 billion investment.*`;

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
  console.log('=== Publishing Article: Chobani $1.2B in Pennsylvania ===\n');

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
    "keywords": `${focus_keyword}, Advanced Manufacturing, Food & Beverage, Chobani, Pennsylvania, Allentown, SIG Group, ABB, Bühler, Automation & Robotics, Packaging Systems, Food Processing, Supply Chain, Transatlantic Investment, Switzerland, United States, PrivateSector Analysis`,
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
