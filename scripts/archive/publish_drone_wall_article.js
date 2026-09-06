import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\d251b12c-7d04-434d-801c-1b6be86effa0\\.user_uploaded';
const srcImageName = 'media_1787056543550.jpg';
const baseName = 'us_raises_drone_wall_switzerland_15_percent_door';

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
  
  // Save local copy in server/uploads, public/uploads & dist/uploads
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
      body: JSON.stringify({ image: b64, filename: baseName })
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

const title = "U.S. Raises the Drone Wall — Switzerland Gets a 15% Door";
const subtitle = "The United States is changing the economics of the drone industry with tariffs up to 100%. Qualifying Swiss products receive an all-in ceiling of 15% — opening a strategic door for Swiss robotics and supply chains.";
const category = "Aerospace & Technology";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-18";
const read_time_mins = 3;
const pull_quote = "Washington is redesigning the drone supply chain — and Switzerland has been given a door into the preferred network. The biggest opportunity may not even be exporting more drones, but Swiss Technology + American Production.";
const tags = JSON.stringify([
  "Wingtra",
  "Auterion",
  "Flyability",
  "Fotokite",
  "U.S. Drone Tariffs",
  "Switzerland",
  "Drones",
  "Robotics",
  "Sensors",
  "Supply Chain",
  "ETH Zurich",
  "Aerospace & Technology",
  "Onshoring"
]);
const focus_keyword = "US drone tariffs Switzerland Wingtra 15 percent door supply chain";
const meta_title = "U.S. Raises the Drone Wall — Switzerland Gets a 15% Door — PrivateSector Intelligence";
const meta_description = "Washington reshapes the drone industry with 25% to 100% tariffs while qualifying Swiss products receive a 15% ceiling. In-depth analysis on Wingtra, supply chains, and Swiss tech.";
const slug = "us-raises-drone-wall-switzerland-gets-15-percent-door";

const content_body = `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 18 AUGUST 2026 ◆ 3 MIN READ ◆ DRONES ◆ ROBOTICS & SENSORS ◆ SUPPLY CHAIN

The United States is changing the economics of the drone industry. New tariffs announced by Washington can reach 25% or even 100% on selected drones and critical components. But Switzerland sits in a different position: qualifying Swiss products can benefit from an all-in tariff ceiling of 15%, provided strict supply-chain requirements are met.

This is more than another tariff story. Washington wants to reduce dependence on foreign drone technology and build a trusted supply chain around the United States and selected partner countries. For Swiss drone and robotics companies, that creates both a warning and an opportunity.

---

## 1. LEADERSHIP

**MAXIMILIAN BOOSFELD — CEO ◆ ETH ZURICH HERITAGE ◆ EXPANDING U.S. PRESENCE**

One Swiss company worth watching is Wingtra. The Zurich drone manufacturer is led by co-founder and CEO Maximilian Boosfeld and grew out of ETH Zurich. Wingtra already has a U.S. presence, making the company's next decisions particularly interesting.

---

## 2. 10-YEAR PERFORMANCE

**ETH SPIN-OFF — GLOBAL EXPANSION ◆ $22M SERIES B ◆ PROVEN COMMERCIAL TRACTION**

Wingtra is too young and privately held to provide the kind of ten-year public financial history available for a listed multinational. What we can see is its development from an ETH project into an international drone company. It raised $22 million in Series B funding in 2023 and has continued developing its position in the U.S. market.

---

## 3. CAPITAL ALLOCATION

**WASHINGTON ONSHORING INCENTIVES ◆ TARIFF RELIEF UNTIL 2029 ◆ U.S. PRODUCTION HUBS**

This is where Washington's decision becomes interesting. The U.S. has created an onshoring program that can provide temporary tariff relief to companies building or expanding qualifying American drone-production facilities before January 20, 2029.

For Swiss manufacturers, the calculation could change: continue exporting everything from Switzerland — or move part of production and assembly to America?

---

## 4. ACQUISITIONS & DISPOSALS

**TRANSATLANTIC JVs ◆ U.S. SUBSIDIARIES ◆ SUPPLY CHAIN RESTRUCTURING**

There is no major acquisition driving today's story. But this policy could encourage future transactions: Swiss companies buying American suppliers, establishing U.S. subsidiaries, entering joint ventures or restructuring supply chains around approved countries.

For now, that is a possibility to watch — not a confirmed development.

---

## 5. REGULATORY RECORD

**NATIONAL SECURITY COMPLIANCE ◆ COMPONENT ORIGIN AUDITS ◆ BEYOND "MADE IN SWITZERLAND"**

The measures are not specifically aimed at Switzerland. Washington argues that excessive dependence on imported drones, batteries, motors, electronics and other critical components creates national-security and supply-chain risks.

The important question for a Swiss manufacturer is therefore not simply “Was this drone made in Switzerland?”

It is: “Where did every critical component come from?”

---

## 6. EXECUTION RECORD

**PENTAGON APPROVAL TRACK RECORD ◆ WINGTRA & AUTERION RECOGNITION ◆ DEFENSE-GRADE TRUST**

Wingtra already has useful U.S. regulatory positioning. Earlier in 2026, certain foreign drone models associated with Wingtra and Swiss-founded Auterion were among products receiving temporary U.S. approval treatment following Pentagon recommendations.

America's drone market is increasingly becoming about security approval + component origin + manufacturing location — not simply product quality.

---

## 7. 🟢 THE BRIGHT SIDE

**15% PREFERRED CEILING ◆ SWISS PRECISION ENGINEERING ◆ SENSORS & INDUSTRIAL ROBOTICS**

Switzerland is inside an important preferred group. Qualifying Swiss products can receive the 15% ceiling rather than simply facing the headline 25% or 100% rates.

Swiss engineering could fit America's demand for trusted alternatives particularly well. That could benefit drone manufacturers, robotics businesses and Swiss suppliers of sensors, electronics and precision components.

---

## 8. ☎️ RED FLAGS

**SUPPLY CHAIN SUB-TIER RISK ◆ NON-ALLIED MOTORS & BATTERIES ◆ DYNAMIC COMPONENT LISTS**

There is a catch: “Made in Switzerland” alone may not be enough.

A Swiss drone could contain critical motors, batteries, controllers or electronics sourced outside the approved group. If so, preferential treatment may not apply.

Swiss manufacturers therefore need visibility much deeper into their supply chains. Washington can also expand the list of covered components, meaning what qualifies today may need to be monitored tomorrow.

---

## 9. COMPARABLE CASES

**2025 FOREIGN DRONE RESTRICTIONS ◆ SELECTIVE EXEMPTIONS ◆ TRUSTED ALLIED ECOSYSTEMS**

America was already moving in this direction. U.S. authorities restricted approvals for new foreign-made drones and components in late 2025 before subsequently granting temporary exemptions to selected suppliers.

The direction is becoming clearer: America still wants foreign technology — but increasingly from companies and supply chains it considers trusted.

---

## 10. 💡 PRIVATESECTOR INSIGHT

**🇨🇭 SWISS TECHNOLOGY + 🇺🇸 AMERICAN PRODUCTION = THE TRANSATLANTIC WINNING FORMULA**

At first glance, this looks like another American tariff wall.

Look closer.

Washington is redesigning the drone supply chain — and Switzerland has been given a door into the preferred network.

That could matter to Wingtra, Flyability, Fotokite and Swiss component manufacturers.

And the biggest opportunity may not even be exporting more drones from Switzerland.

It could eventually be:

**🇨🇭 SWISS TECHNOLOGY + 🇺🇸 AMERICAN PRODUCTION**

- **THE SIGNAL:** America wants trusted drone technology.
- **THE RISK:** Swiss branding alone does not guarantee preferential treatment.
- **THE OPPORTUNITY:** Switzerland may have an opening inside America's new drone supply chain.

PrivateSector will watch what happens next.

---

## EXECUTIVE CONCLUSION

**THE SIGNAL — AMERICA WANTS TRUSTED DRONE TECH ◆ THE RISK — ORIGIN AUDITS REQUIRED ◆ THE OPPORTUNITY — 15% CEILING & ONSHORING PARTNERSHIPS**

**PRIVATESECTOR INTELLIGENCE | 🇨🇭 Switzerland ↔ United States 🇺🇸**

**🇨🇭 Swiss insight. American signals. 🇺🇸**`;

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
  console.log('=== Publishing Article: U.S. Raises the Drone Wall — Switzerland Gets a 15% Door ===\n');

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
    "keywords": `${focus_keyword}, Wingtra, Auterion, Flyability, Fotokite, U.S. Drone Tariffs, Switzerland, Drones, Robotics, Sensors, Supply Chain, ETH Zurich`,
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
    console.log('Published Article on Live API:', found);
  } catch (e) {
    console.error('Verification error:', e.message);
  }
}

main().catch(console.error);
