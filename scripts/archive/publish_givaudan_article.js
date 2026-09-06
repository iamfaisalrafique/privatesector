import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\472db47c-b6ac-4fd7-bcd6-61ca75e71f32\\.user_uploaded';
const srcImageName = 'media_1787341688543.jpg';
const baseName = 'givaudan_first_plan_300m_cincinnati_expansion';

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

const title = "The First Plan Didn't Work. Givaudan Came Back With Around $300 Million.";
const subtitle = "Swiss giant Givaudan revamps its American expansion with two Greater Cincinnati-area projects totaling around $300 million and ~338 jobs after canceling a previous $215M facility. Why resilience in U.S. investment matters for the transatlantic ecosystem.";
const category = "Consumer Goods";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-21";
const read_time_mins = 3;
const pull_quote = "Good business isn't always about having a perfect Plan A. Sometimes it is about what happens when Plan A fails. Givaudan changed the plan — not the goal.";
const tags = JSON.stringify([
  "Givaudan",
  "Taste & Wellbeing",
  "Cincinnati",
  "Ohio",
  "Switzerland",
  "United States",
  "Consumer Goods",
  "Advanced Manufacturing",
  "Food & Beverage",
  "Foreign Direct Investment",
  "Business Expansion",
  "Swiss Innovation"
]);
const focus_keyword = "Givaudan 300 million Cincinnati Ohio expansion Taste and Wellbeing Swiss investment America";
const meta_title = "The First Plan Didn't Work. Givaudan Came Back With Around $300M — PrivateSector";
const meta_description = "Givaudan unveils two Greater Cincinnati projects totaling ~$300M and 338 jobs after canceling a prior $215M Reading site. Discover why Swiss investment ambition didn't stop.";
const slug = "first-plan-didnt-work-givaudan-came-back-with-around-300-million";

const content_body = `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 21 AUGUST 2026 ◆ 3 MIN READ ◆ CONSUMER GOODS ◆ MANUFACTURING ◆ TASTE & WELLBEING ◆ U.S. EXPANSION

This is a business story we like.

Swiss giant **Givaudan** had a big plan in Ohio. The company had previously planned a **$215 million facility in Reading**. Problems with the site changed everything, and Givaudan eventually canceled that project.

You might think the American expansion was over.

**It wasn't.**

New reporting says Givaudan has now unveiled **two Greater Cincinnati-area projects totaling around $300 million**, with approximately **338 jobs expected**.

That is what makes this story interesting.

**The location changed. The ambition didn't.**

---

## THE PIVOT: FROM CANCELLED SITE TO EXPANDED AMBITION

**$215M CANCELLED PLAN ➔ ~$300M REGIONAL STRATEGY ◆ 338 JOBS EXPECTED**

- 🏢 **Company:** Givaudan SA (Vernier, Switzerland 🇨🇭)
- 📍 **Focus Region:** Greater Cincinnati Area, Ohio 🇺🇸
- ❌ **Previous Plan:** $215 Million project in Reading, Ohio (Cancelled due to site constraints)
- 💰 **New Commitment:** ~$300 Million across two regional projects
- 👷 **Workforce Growth:** Approximately 338 expected jobs
- 🧪 **Division:** Taste & Wellbeing Innovation & Production

Givaudan could have walked away after the first project became difficult. Instead, the company changed the plan and continued investing in the region.

And Cincinnati already matters to Givaudan. The area is an important U.S. base for its **Taste & Wellbeing** business, anchored by its Innovation Center and established technical footprint.

---

## 🇨🇭 WHY SWITZERLAND SHOULD CARE

**SUPPLY CHAINS ◆ SPECIALIZED LOGISTICS ◆ TRANSATLANTIC ECOSYSTEM OPPORTUNITIES**

Givaudan is another prime example of a major Swiss company putting serious capital into America.

More manufacturing and regional scale means:
- **Equipment & Engineering:** Expanding demand for precision manufacturing systems and processing equipment.
- **Logistics & Distribution:** Specialized supply chains moving raw ingredients, flavor compounds, and specialized nutrition formulations across transatlantic corridors.
- **Technology & R&D:** Deepening integration between Swiss headquarters in Vernier/Kemptthal and American commercial application labs.
- **Local Partnerships:** Potential new opportunities for other Swiss suppliers and service partners surrounding that burgeoning industrial ecosystem.

---

## 🔎 PRIVATESECTOR VIEW

**GOOD BUSINESS IS NOT ALWAYS ABOUT PLAN A ◆ KNOWING WHAT TO DO WHEN PLAN A FAILS**

Good business isn't always about having a perfect Plan A.

Sometimes it is about what happens when Plan A fails.

**Givaudan changed the plan — not the goal.**

That agility and commitment may tell us more about the enduring strategic importance of the American market than the original investment ever did.

---

## PRIVATESECTOR INTELLIGENCE CARD

**GIVAUDAN SA ◆ GREATER CINCINNATI EXPANSION ◆ TASTE & WELLBEING HUB**

- 🏢 **Company:** Givaudan SA (SIX: GIVN)
- 📍 **Headquarters:** Vernier, Switzerland 🇨🇭
- 🇺🇸 **U.S. Destination:** Greater Cincinnati, Ohio
- 📊 **Capital Allocation:** ~$300 Million (Two Facilities)
- 💼 **Employment Target:** 338 New & Retained Positions
- 🏆 **Core Focus:** Taste & Wellbeing Innovation Center & Flavor Manufacturing
- 🌐 **Official Links:** [Givaudan](https://www.givaudan.com)

---

## PRIVATESECTOR INTELLIGENCE SCORE

**9.6/10 — STRONG SIGNAL 🟢**

- **Scale:** ★★★★★
- **Resilience:** ★★★★★
- **U.S. Relevance:** ★★★★★
- **Swiss Economic Connection:** ★★★★★
- **Strategic Agility:** ★★★★★

**Bottom line:** First came the $215 million plan. It didn't work. Now the reported regional plan is around $300 million. Givaudan didn't leave America. It came back with another strategy.

---

Source: Cincinnati Business Courier reporting, August 20, 2026, with Givaudan corporate information for background.

PrivateSector note: The latest ~$300M and 338-job figures come from current specialist reporting; we have not yet seen a matching newly indexed Givaudan corporate announcement.`;

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
  console.log('=== Publishing Article: The First Plan Didn\'t Work. Givaudan Came Back With Around $300 Million. ===\n');

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
    "keywords": `${focus_keyword}, Givaudan, Taste & Wellbeing, Cincinnati, Ohio, Switzerland, United States, Consumer Goods, Manufacturing`,
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
