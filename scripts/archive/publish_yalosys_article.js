import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\84cb2565-5dcc-44d7-bc76-76b8b650cdc3\\.user_uploaded';
const srcImageName = 'media_1787604721785.jpg';
const baseName = 'yalosys_ag_zug_ultrafast_laser_glass_microprocessing';

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

const title = "A Tiny Company in Zug Is Doing Something Remarkable With Glass";
const subtitle = "In Hünenberg, Canton Zug, 2022-founded Yalosys AG operates with just 2–10 employees — using ultrafast laser technology and ISO 5 cleanrooms to transform glass, quartz, and sapphire into microscopic precision systems.";
const category = "Advanced Manufacturing";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-25";
const read_time_mins = 3;
const pull_quote = "Swiss precision doesn't always come from a giant factory. Sometimes it comes from a small building most of us weren't looking at in Hünenberg, where a handful of people work with lasers, glass and sapphire.";
const tags = JSON.stringify([
  "Yalosys AG",
  "Hidden Swiss",
  "Zug",
  "Hünenberg",
  "Laser Microprocessing",
  "Ultrafast Laser",
  "Glass Manufacturing",
  "Sapphire",
  "Quartz",
  "Fused Silica",
  "Micro Components",
  "Microsystems",
  "MedTech",
  "Photonics",
  "Optics",
  "Semiconductors",
  "Swiss Precision",
  "Advanced Manufacturing",
  "Dr Luigi Calabrese"
]);
const focus_keyword = "Yalosys AG Zug glass ultrafast laser microprocessing Hünenberg sapphire quartz microsystems Swiss precision";
const meta_title = "A Tiny Company in Zug Is Doing Something Remarkable With Glass — PrivateSector";
const meta_description = "In Hünenberg, Canton Zug, Yalosys AG uses ultrafast lasers and ISO 5 cleanrooms to process glass, quartz, and sapphire into precision microsystems for MedTech and photonics.";
const slug = "tiny-company-in-zug-doing-something-remarkable-with-glass-yalosys";

const content_body = `HIDDEN SWISS 🇨🇭 ◆ 25 AUGUST 2026 ◆ 3 MIN READ ◆ ADVANCED MANUFACTURING ◆ LASER MICROPROCESSING ◆ CANTON ZUG ◆ MEDTECH & PHOTONICS

In **Hünenberg, Canton Zug**, there is a young Swiss company most people have probably never heard of. Its name is **Yalosys AG**.

Founded in **2022**, Yalosys is a privately owned Swiss SME specializing in **laser microprocessing and advanced glass manufacturing**. Its public LinkedIn profile lists just **2–10 employees**.

But don't let the size fool you.

Yalosys works with **glass, quartz, fused silica and even sapphire**, using ultrafast laser technology for precision cutting, drilling and welding. Its work can begin with a microscopic glass component and extend toward a fully packaged microsystem.

---

## ★ SMALL TEAM. SERIOUS TECHNOLOGY.

**ULTRAFAST LASER PRECISION ◆ ISO 7 TO ISO 5 CLEANROOMS ◆ FULL PACKAGED MICROSYSTEMS**

- 🏢 **Company:** Yalosys AG (Hünenberg, Canton Zug 🇨🇭)
- 📅 **Founded:** 2022
- 👥 **Team Size:** 2–10 employees (Specialist SME)
- 🔬 **Core Materials:** Glass, Quartz, Fused Silica, Sapphire
- ⚡ **Core Tech:** Ultrafast laser micromachining (cutting, drilling, welding)
- 🛡️ **Cleanroom Environment:** ISO 7 to ISO 5 cleanroom conditions
- 🧪 **Capabilities:** Component assembly, die & wire bonding, metallic-layer deposition, cleaning, clean packaging

The company says its ultrafast laser processing takes place under **ISO 7 to ISO 5 cleanroom conditions**. Its capabilities extend beyond laser processing into component assembly, die and wire bonding, metallic-layer deposition, cleaning and clean packaging.

In other words, **Yalosys isn't simply cutting pieces of glass**. It is developing capabilities for turning highly specialized glass components into functional microsystems.

---

## THE ENGINEER BEHIND IT

**DR. LUIGI CALABRESE ◆ ULTRASHORT-PULSE LASER EXPERTISE ◆ MEDTECH & MATERIALS SCIENCE**

- 👤 **Leadership:** Dr. Luigi Calabrese, CEO & Board Member
- 🎓 **Expertise:** Ultrashort-pulse laser processing, materials engineering, process development & R&D management
- 🎯 **Focus Areas:** Automated laser-micromachining processes for applications in MedTech and materials science

Yalosys is led by **Dr. Luigi Calabrese**, CEO and board member. His background includes ultrashort-pulse laser processing, materials engineering, process development and R&D management.

Yalosys says he has worked on automated laser-micromachining processes for applications in MedTech and materials science.

That's where this little company becomes particularly interesting: a company founded only in 2022, a very small public team, a facility in Hünenberg — and **technology operating at microscopic scale**.

---

## 🟢 THE BRIGHT SIDE

**SWISS SPECIALIST DEPTH ◆ ADVANCED MATERIALS SCIENCE ◆ CROSS-INDUSTRY APPLICABILITY**

Switzerland's industrial strength isn't represented only by the giants everybody knows. Companies such as Yalosys reveal another side of the Swiss economy: **small specialist teams combining engineering, materials science and advanced manufacturing**.

Its official corporate purpose includes laser micromachining for industries such as **semiconductors, medical technology and automotive**, while the company publicly presents capabilities across:
- **Medical Devices & Microfluidics:** Biocompatible glass and quartz channels for diagnostic and analytical systems.
- **Optics & Photonics:** Sub-micron precision optical components, specialized sapphire windows, and waveguides.
- **Glass Microsystems:** Integrated micro-electro-mechanical components packaged in pristine cleanroom environments.
- **Automotive & High-Reliability Sensors:** Ruggedized, high-durability transparent substrate components.

---

## ⚠️ RED FLAGS

**CAPITAL INTENSITY ◆ TECHNOLOGICAL DEMANDS ◆ EARLY COMMERCIAL VISIBILITY**

Yalosys remains a young and small company operating in technologically demanding markets. Advanced manufacturing requires expensive equipment, specialized talent and continuous technological development.

PrivateSector also does not currently have enough independently verified information about its revenues, major customers, exports or international market share to make claims about how commercially large the business has become.

And that's important: **Hidden doesn't automatically mean the next billion-franc company.**

---

## 💡 PRIVATESECTOR INSIGHT

**SWISS PRECISION BEYOND THE FACTORY GIANTS ◆ HIDDEN SWISS CAPABILITY**

That's actually why Yalosys caught our attention.

We're not looking only for Switzerland's biggest companies. We're looking for something different:

**Serious Swiss capability operating with relatively little public attention.**

- **Small team.**
- **Young company.**
- **Highly specialized technology.**

And somewhere in Hünenberg, a handful of people are working with lasers, glass and sapphire for industries where microscopic precision matters.

**Swiss precision doesn't always come from a giant factory. Sometimes it comes from a small building most of us weren't looking at.**

This week, PrivateSector found one in Zug.

---

## PRIVATESECTOR INTELLIGENCE CARD

**YALOSYS AG ◆ HÜNENBERG, CANTON ZUG ◆ ULTRAFAST LASER MICROPROCESSING**

- 🏢 **Company:** Yalosys AG
- 📍 **Location:** Hünenberg, Canton Zug, Switzerland 🇨🇭
- 🗓️ **Founded:** 2022
- 👥 **Team:** 2–10 Employees
- 🔬 **Core Materials:** Glass, Quartz, Sapphire, Fused Silica
- 🏭 **Infrastructure:** ISO 7 to ISO 5 Cleanrooms
- 🎯 **Target Markets:** MedTech, Medical Devices, Optics, Photonics, Semiconductors
- 🌐 **Official Website:** [yalosys.com](https://yalosys.com)

---

## PRIVATESECTOR INTELLIGENCE SCORE

**9.4/10 — HIGH POTENTIAL SPECIALIST 🟢**

- **Technological Precision:** ★★★★★
- **Specialized Materials (Sapphire/Quartz):** ★★★★★
- **Swiss Engineering Depth:** ★★★★★
- **MedTech & Photonics Relevance:** ★★★★★
- **Early-Stage SME Agility:** ★★★★☆

**Bottom line:** A company founded in 2022 with a single-digit team in Hünenberg, operating cleanroom laser machining on glass, quartz and sapphire. That is the essence of Switzerland's hidden technological backbone.

---

## PRIVATESECTOR ★ HIDDEN SWISS

**Discovering remarkable Swiss companies, one story at a time.**

[privatesector.ch](https://privatesector.ch/)

---

Source: Yalosys AG corporate registry, public disclosures, LinkedIn company profile, and Swiss commercial register data, August 2026.`;

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
  console.log('=== Publishing Article: A Tiny Company in Zug Is Doing Something Remarkable With Glass ===\n');

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
    "keywords": `${focus_keyword}, Yalosys AG, Hidden Swiss, Zug, Hünenberg, Laser Microprocessing, Glass Manufacturing, Sapphire, Quartz, MedTech, Photonics`,
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
