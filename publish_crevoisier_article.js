import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\bd109ed3-28ea-47d0-ae36-0fac023a3079\\.user_uploaded';
const srcImageName = 'media_1787688148209.jpg';
const baseName = 'crevoisier_sa_jura_swiss_precision_machinery_c501';

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

const title = "Hidden in the Jura: The Family Building the Machines Behind Swiss Precision";
const subtitle = "In Les Genevez, Canton Jura, family-owned Crevoisier SA has built precision machinery since 1966 — with over 6,000 C501 machines across 65+ countries, now transitioning to its third generation with collaborative robotics.";
const category = "Advanced Manufacturing";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-26";
const read_time_mins = 4;
const pull_quote = "Swiss industry isn't always about creating something everybody sees. Sometimes it is about creating the tool, component or machine that allows somebody else to create something extraordinary.";
const tags = JSON.stringify([
  "Crevoisier SA",
  "Hidden Swiss",
  "Canton Jura",
  "Les Genevez",
  "Precision Machinery",
  "Polishing Machine C501",
  "Watchmaking",
  "Medical Technology",
  "Robotics & Automation",
  "Collaborative Polishing",
  "Laurent Crevoisier",
  "Philippe Crevoisier",
  "René Crevoisier",
  "Advanced Manufacturing",
  "CNC Technology",
  "Microtechnology",
  "Aerospace",
  "Swiss Precision"
]);
const focus_keyword = "Crevoisier SA Jura precision machinery C501 polishing machines robotics watchmaking Swiss industry Les Genevez";
const meta_title = "Hidden in the Jura: The Family Building the Machines Behind Swiss Precision — PrivateSector";
const meta_description = "Discover Crevoisier SA in Les Genevez, Canton Jura — the family-owned machine builder behind Swiss precision watchmaking, MedTech, and collaborative robotics across 65+ countries.";
const slug = "hidden-in-the-jura-the-family-building-machines-behind-swiss-precision-crevoisier";

const content_body = `HIDDEN SWISS 🇨🇭 ◆ 26 AUGUST 2026 ◆ 4 MIN READ ◆ ADVANCED MANUFACTURING ◆ PRECISION MACHINERY ◆ CANTON JURA ◆ ROBOTICS & AUTOMATION

In **Les Genevez**, a small municipality in **Canton Jura**, there is a family-owned engineering company whose machines have travelled considerably farther than its name.

**Crevoisier SA** was founded here in 1966 by **René Crevoisier**. Almost six decades later, the company remains in Les Genevez, remains connected to the same family, and is now entering its **third generation** of leadership.

Today, **Laurent Crevoisier** is CEO, while his father, **Philippe Crevoisier**, serves as Chairman of the Board.

It is a quintessential Swiss industrial story: a small place, a family business, highly specialized machinery — and customers far beyond Switzerland.

---

## FROM A SMALL JURA WORKSHOP TO 65 COUNTRIES

**THREE GENERATIONS OF LEADERSHIP ◆ 6,000+ C501 MACHINES ◆ GLOBAL INDUSTRIAL FOOTPRINT**

René Crevoisier began the business in **1966**. His son Philippe later joined the company as an apprentice, worked his way through the business and eventually became CEO in **1998**.

In **2025**, another transition took place. Philippe handed operational leadership to his son **Laurent**, bringing the third generation of the family to the head of the company.

But one machine tells the scale of Crevoisier's journey particularly well.

In **1974**, the company introduced the **C501 polishing machine**.

Crevoisier says **more than 6,000 C501 machines** have since been produced and installed across **more than 65 countries**.

For a company based in a small Jura municipality, that's quite a footprint.

---

## THE MACHINES BEHIND THE PRODUCTS WE KNOW

**THE INVISIBLE INFRASTRUCTURE ◆ WATCHMAKING TO MEDTECH & AEROSPACE**

Crevoisier doesn't manufacture the famous Swiss watch sitting in a boutique window.

It manufactures something further behind the scenes: **the precision machines that help manufacturers create and finish high-tolerance components.**

Its equipment is engineered for critical finishing processes including:
- **Surface Finishing:** Polishing, satin-finishing, lapping, and brushing
- **Subtractive Machining:** Grinding, drilling, and high-precision milling
- **Aesthetic Finishing:** Specialized component decorating

That places Crevoisier inside an industrial ecosystem extending well beyond luxury watches. The company actively serves key high-tech sectors:
- **Watchmaking & Fine Jewellery**
- **Microtechnology & Precision Mechanics**
- **Medical Technology & Surgical Implants**
- **Aerospace & Defence Components**
- **Automotive & High-End Luxury Goods**

And this is where companies such as Crevoisier become vital to understanding the Swiss economy.

The international customer may know the famous Swiss watch brand. The patient may recognize the medical-device company. The passenger may know the aircraft manufacturer.

**But behind those finished products are layers of specialized suppliers, machine builders and precision engineers that most consumers will never encounter.**

Crevoisier operates inside that less visible layer.

---

## WHERE CRAFTSMANSHIP MEETS ROBOTICS

**MOTION CAPTURE ◆ COLLABORATIVE POLISHING ◆ PRESERVE KNOWLEDGE, AUTOMATE REPETITION**

The company's history is not only about maintaining traditional mechanical machinery. Crevoisier has gradually moved deeper into **CNC technology, automation, machine vision, and robotics**.

- **2005:** Introduced a **six-axis robotic loading system** equipped with machine vision to enable fully autonomous production cycles.
- **2013:** Developed a breakthrough robotic polishing concept using **motion-capture technology**, which earned an Innovation Award at the prestigious **EPHJ exhibition in Geneva**.

That idea continued developing into Crevoisier's proprietary **collaborative polishing technology**:

An experienced operator physically guides a robotic arm through an intricate hand-polishing movement. The system records critical tactile parameters — including exact 3D trajectories, angles, and applied forces — allowing the craftsman's technique to be reproduced with robotic repeatability.

The objective is not simply to remove human expertise from the process.

**It is to allow automation to handle repetitive operations while skilled specialists concentrate on the work where experience, judgement, and craftsmanship remain indispensable.**

For a company deeply rooted in Swiss precision manufacturing, that represents a defining philosophy:

> **"Preserve the knowledge — automate the repetition."**

---

## A SMALL COMPANY INSIDE A MUCH BIGGER ECONOMY

**SWISS INDUSTRIAL BACKBONE ◆ GLOBAL VALUE CHAINS ◆ HIGH-COST RESILIENCE**

Crevoisier is a reminder that Switzerland's industrial strength cannot be understood simply by looking at its largest corporations.

Companies such as this form part of the foundational infrastructure underneath them:
- **Specialized machinery** enables watchmakers to finish microscopic components.
- **Precision equipment** supports tight-tolerance medical device manufacturing.
- **Automation** allows Swiss factories to remain globally competitive despite domestic cost pressures.

These businesses may employ far fewer people than Switzerland's industrial conglomerates, but the technology they produce sits deep inside supply chains reaching around the globe.

Crevoisier's own C501 story — **6,000 machines across more than 65 countries** — demonstrates how a highly specialized Swiss manufacturer can build formidable international reach without ever needing to become a household consumer name.

---

## THE NEXT GENERATION

**TRANSITION TO GENERATION THREE ◆ DIGITALIZATION ◆ SMART MANUFACTURING**

Now the responsibility belongs increasingly to the third generation.

**Laurent Crevoisier** inherits a company operating in a manufacturing environment changing rapidly through robotics, digitalization, automation, and increasingly intelligent production systems.

That creates a compelling challenge:

Crevoisier has spent almost 60 years building machines around precision and craftsmanship. Its future will depend on how successfully it combines that accumulated mechanical knowledge with next-generation smart automation.

But the company's multi-generational trajectory provides a clear blueprint:
- **1966:** Founded by **René Crevoisier**
- **1998:** Operational leadership assumed by **Philippe Crevoisier** (Apprentice → CEO → Chairman)
- **2025:** Leadership transitioned to **Laurent Crevoisier** (Third Generation CEO)

**Three generations — while the machines themselves evolved from traditional polishing benches toward CNC systems and AI-assisted collaborative robotics.**

---

## 💡 PRIVATESECTOR VIEW

**THE BEAUTY OF UNDERSTATED EXCELLENCE ◆ CREATING THE TOOLS BEHIND PERFECTION**

There is something beautifully understated about this company.

Drive through Les Genevez and there is little on the surface to suggest that machines engineered in this quiet Jura village have powered production lines across more than 65 countries.

And there's another detail we appreciate:

The company's archives record that one of René Crevoisier's earliest innovations was a simple **mechanical clamping handle**. It was hardly the glamorous product people associate with Swiss luxury. Yet variations of that core mechanism would eventually be adopted worldwide.

That is the essence of this Hidden Swiss story:

**Swiss industry isn't always about creating something everybody sees.**

**Sometimes it is about creating the tool, component or machine that allows somebody else to create something extraordinary.**

For almost 60 years, the Crevoisier family has been doing exactly that from a quiet corner of the Jura.

**Crevoisier SA — Les Genevez, Canton Jura.**

---

## PRIVATESECTOR INTELLIGENCE CARD

**CREVOISIER SA ◆ LES GENEVEZ, CANTON JURA ◆ PRECISION MACHINERY & ROBOTICS**

- 🏢 **Company:** Crevoisier SA
- 📍 **Location:** Les Genevez, Canton Jura, Switzerland 🇨🇭
- 🗓️ **Founded:** 1966 (by René Crevoisier)
- 👥 **Ownership & Leadership:** 100% Family-Owned | 3rd Generation (Laurent Crevoisier, CEO; Philippe Crevoisier, Chairman)
- ⚙️ **Flagship Machine:** Crevoisier C501 Polishing Machine (6,000+ units across 65+ countries)
- 🔬 **Core Technologies:** Polishing, Grinding, Milling, Satin-finishing, 6-Axis Robotics, Machine Vision, Collaborative Motion-Capture
- 🎯 **Target Industries:** Watchmaking, Jewellery, Microtechnology, MedTech, Aerospace, Automotive, Luxury Goods
- 🌐 **Official Website:** [crevoisier.ch](https://crevoisier.ch)

---

## PRIVATESECTOR INTELLIGENCE SCORE

**9.5/10 — SWISS INDUSTRIAL EXCELLENCE 🔴**

- **Precision Engineering Heritage:** ★★★★★
- **Global Footprint (65+ Countries):** ★★★★★
- **Automation & Collaborative Robotics:** ★★★★★
- **Multi-Generational Continuity:** ★★★★★
- **Cross-Industry Versatility:** ★★★★★

**Executive Verdict:**
Crevoisier SA exemplifies why Swiss industrial precision remains unassailable. By translating six decades of tactile craftsmanship into robotic algorithms while preserving family ownership, this Jura machine builder secures its place in the world's most demanding manufacturing supply chains.

---

## PRIVATESECTOR ★ HIDDEN SWISS

**We know the famous Swiss names. We're looking for the ones behind them.**

[privatesector.ch](https://privatesector.ch/) — Intelligence That Connects Opportunities

---

Source: Crevoisier SA corporate documentation, historical archives, Swiss commercial register (Canton Jura), and EPHJ innovation records, August 2026.`;

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
  console.log('=== Publishing Article: Hidden in the Jura: Crevoisier SA ===\n');

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
    "keywords": `${focus_keyword}, Crevoisier SA, Hidden Swiss, Canton Jura, Les Genevez, Precision Machinery, Polishing Machine C501, Watchmaking, Medical Technology, Robotics & Automation, Collaborative Polishing, Laurent Crevoisier, Philippe Crevoisier, René Crevoisier`,
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
