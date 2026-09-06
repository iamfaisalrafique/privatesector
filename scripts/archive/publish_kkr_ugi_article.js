import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\83ddafed-2f02-44f7-95e8-2eff525c3f8b\\.user_uploaded';
const srcImageName = 'media_1787130443362.jpg';
const baseName = 'kkr_reportedly_makes_9_billion_bid_ugi_swiss_connection';

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

const title = "KKR Reportedly Makes $9 Billion Bid for UGI — And There's a Swiss Connection";
const subtitle = "KKR has reportedly made an approximately $9 billion takeover bid for UGI Corporation ($42.50/share, ~21% premium). Beyond the American energy infrastructure story lies a direct Swiss connection via Flaga Suisse and Zurich.";
const category = "Energy & Infrastructure";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-18";
const read_time_mins = 3;
const pull_quote = "AI companies receive enormous attention, but the physical infrastructure underneath the technology boom is becoming increasingly strategic. KKR's reported $9B interest in UGI highlights the rising value of electricity, pipelines, and transatlantic distribution.";
const tags = JSON.stringify([
  "KKR",
  "UGI Corporation",
  "Flaga Suisse GmbH",
  "Energy & Infrastructure",
  "M&A",
  "Private Equity",
  "Switzerland",
  "United States",
  "AmeriGas",
  "Natural Gas",
  "Electricity",
  "Zurich",
  "Propane",
  "Data Centers"
]);
const focus_keyword = "KKR UGI Corporation bid 9 billion Swiss connection Flaga Suisse energy infrastructure";
const meta_title = "KKR Reportedly Makes $9B Bid for UGI — And There's a Swiss Connection — PrivateSector Intelligence";
const meta_description = "KKR reportedly bids ~$9 billion ($42.50/share) for UGI Corporation. Discover the energy infrastructure angle and the direct Swiss connection through Flaga Suisse and Zurich.";
const slug = "kkr-reportedly-makes-9-billion-bid-ugi-swiss-connection";

const content_body = `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 18 AUGUST 2026 ◆ 3 MIN READ ◆ ENERGY & INFRASTRUCTURE ◆ M&A ◆ PRIVATE EQUITY

KKR has reportedly made an approximately $9 billion takeover bid for UGI Corporation, putting one of America's diversified energy companies into the M&A spotlight.

The reported offer values UGI at $42.50 per share, approximately 21% above its previous Monday closing price.

But for PrivateSector, there is another reason this transaction deserves attention:

**The story reaches Switzerland.**

---

## THE TRANSACTION SNAPSHOT

**$9 BILLION REPORTED BID ◆ $42.50 PER SHARE (21% PREMIUM) ◆ PENNSYLVANIA HEADQUARTERS**

- 🇺🇸 **Buyer:** KKR
- 🏢 **Target:** UGI Corporation
- 💰 **Reported Bid:** ~$9 billion
- 📈 **Offer:** $42.50 per share (~21% premium over Monday closing)
- ⚡ **Sector:** Energy & infrastructure
- 📍 **UGI Headquarters:** Pennsylvania, United States

The proposal remains reported rather than an announced acquisition. Investors should therefore treat the terms as preliminary until the companies make formal disclosures.

---

## WHY UGI MATTERS

**NATURAL GAS ◆ ELECTRICITY ◆ ENERGY INFRASTRUCTURE ◆ PROPANE ◆ MIDSTREAM ◆ EUROPEAN DISTRIBUTION**

UGI operates across several critical segments of the modern energy economy, including:

- **Natural Gas & Electricity:** Powering core industrial and residential markets.
- **Energy Infrastructure & Midstream:** Essential transport, storage, and pipeline infrastructure.
- **Propane Distribution:** Its AmeriGas business is a major U.S. propane distributor.
- **European Energy Distribution:** Extensive operations distributing LPG and energy solutions across Europe.

Energy infrastructure is attracting increasing attention as America's electricity and power requirements expand rapidly alongside artificial intelligence, high-density data centers, industrial onshoring, and broad electrification.

---

## 🇨🇭 THE SWISS CONNECTION

**FLAGA SUISSE GMBH ◆ KKR ZURICH PRESENCE ◆ TRANSATLANTIC CAPITAL SYNERGY**

UGI's international corporate structure has included **Flaga Suisse GmbH**, connecting its European liquefied petroleum gas (LPG) operations directly with Switzerland.

At the same time, **KKR maintains an established corporate presence in Zurich** and a rich history of direct investing in Swiss businesses and European market leaders.

That gives PrivateSector a genuine **Switzerland 🇨🇭 ↔ United States 🇺🇸** angle on what initially appears to be a purely domestic American takeover story.

---

## 🔎 PRIVATESECTOR VIEW

**THE POWER UNDERNEATH THE AI BOOM ◆ PIPELINES & GRIDS ◆ EUROPEAN ASSET STRATEGY**

The headline is $9 billion.

The bigger story may be what that capital is chasing.

AI and technology giants receive enormous public attention, but the physical infrastructure underneath the technology boom is becoming increasingly strategic:

- **Who supplies the electricity?**
- **Who owns the pipelines and infrastructure?**
- **Who distributes the energy?**

KKR's reported interest in UGI is another clear signal that major private equity capital is looking closely at real, physical infrastructure assets.

For Switzerland, the question becomes particularly interesting if ownership of UGI ultimately changes:

- **What happens to its European portfolio?**
- **Will we see expansion, restructuring, asset carve-outs, or further regional capital deployment?**

For now, those remain strategic possibilities — not final conclusions.

---

## PRIVATESECTOR INTELLIGENCE SCORE

**10/10 — TOP SIGNAL 🔴**

- **Scale:** ★★★★★
- **Freshness:** ★★★★★
- **U.S. Relevance:** ★★★★★
- **Swiss Connection:** ★★★★☆
- **Strategic Importance:** ★★★★★

**PrivateSector Verdict:** **WATCH CLOSELY.**

A formal confirmation, rejection, revised offer, or competing bidder could quickly move this transatlantic energy story forward.

---

Source: Reuters reporting; UGI corporate and investor materials; KKR corporate information. The reported proposal has not been presented here as a completed acquisition.`;

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
  console.log('=== Publishing Article: KKR Reportedly Makes $9 Billion Bid for UGI ===\n');

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
    "keywords": `${focus_keyword}, KKR, UGI Corporation, Flaga Suisse GmbH, Energy & Infrastructure, M&A, Private Equity, Switzerland, United States, AmeriGas, Zurich`,
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
