import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../server', 'database.sqlite');
const publicUploadsDir = path.resolve(__dirname, '../public/uploads');
const serverUploadsDir = path.resolve(__dirname, '../server/uploads');
const distUploadsDir = path.resolve(__dirname, '../dist/uploads');

const baseImageName = 'texas_4_2_billion_data_center_swiss_companies';
const imageFileName = `${baseImageName}.jpg`;
const localImagePath = path.join(publicUploadsDir, imageFileName);

const title = "$4.2 Billion Is Moving Into Texas — Could Swiss Companies Capture a Piece?";
const subtitle = "A major technology infrastructure buildout is quietly taking shape in Temple, Texas.";
const category = "Energy & Infrastructure";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-09-07";
const read_time_mins = 2;
const pull_quote = "There is another enormous business developing underneath it: supplying the physical infrastructure that makes AI possible.";
const tags = [
  "Artificial Intelligence",
  "AI",
  "Data Centers",
  "Energy & Infrastructure",
  "Energy",
  "Infrastructure",
  "Power Grid",
  "ABB",
  "Hitachi Energy",
  "Belimo",
  "Rowan Digital Infrastructure",
  "Texas",
  "Switzerland",
  "United States"
];
const focus_keyword = "Rowan Digital Infrastructure Texas data center 4.2 billion ABB Hitachi Energy Belimo Swiss companies";
const meta_title = "$4.2 Billion Is Moving Into Texas — Could Swiss Companies Capture a Piece? — PrivateSector";
const meta_description = "Rowan Digital Infrastructure plans at least $4.2B in data-center investment in Temple, Texas. Can Swiss leaders like ABB, Hitachi Energy, and Belimo capture a piece?";
const slug = "4-2-billion-is-moving-into-texas-could-swiss-companies-capture-a-piece";
const image_url = `/uploads/${imageFileName}`;

// 1000% exact word-by-word content from user
const content_body = `A major technology infrastructure buildout is quietly taking shape in Temple, Texas.

Rowan Digital Infrastructure plans six data-center buildings representing at least $4.2 billion in private investment. Five are already approved or under construction, while the sixth and final proposed building would add another $700 million.

The development is aimed at the enormous computing demand behind cloud services and AI. Rowan has also secured nearly $3 billion in debt financing to support a 300-megawatt data-center campus in Temple — the largest financing transaction in the company's history.

---

## 🇨🇭 Why Should Switzerland Care?

AI infrastructure needs much more than chips and servers. It requires enormous amounts of power infrastructure, transformers, cooling, electrification and building automation.

That puts Swiss industrial expertise in an interesting position.

ABB has major capabilities in electrification and data-center power infrastructure. Hitachi Energy, headquartered in Switzerland, operates in transformers and grid infrastructure. Belimo specializes in HVAC control technology.

There is no confirmed evidence that any of these companies has a contract with Rowan's Temple developments. They are companies to watch because their technologies fit the infrastructure requirements created by the expansion of hyperscale data centers.

---

## ☀️ Bright Side

This is physical, long-term infrastructure investment. Rowan says its six Temple buildings will represent at least $4.2 billion in private investment and approximately $45 million in annual direct tax revenue once operational.

---

## 🚩 Red Flag

Projects of this scale put pressure on electricity, water and surrounding infrastructure. Rowan says its final proposed building will use a fully closed-loop cooling system that does not require a continuous supply of water.

The challenge will be expanding America's AI infrastructure without transferring excessive infrastructure costs or environmental pressure to surrounding communities.

---

## 📚 Similar Case

Temple is part of a much larger Texas trend. Rowan is also developing another 300-megawatt hyperscale campus in Medina County, showing how AI and cloud infrastructure investment is spreading across the state.

---

## 🔭 PrivateSector View

The opportunity is not only in building AI.

There is another enormous business developing underneath it: supplying the physical infrastructure that makes AI possible.

As billions of dollars move into American data centers, Swiss companies could find opportunities in power systems, transformers, cooling and industrial automation.

The question for Switzerland is simple:

How much of America's AI infrastructure boom can Swiss industry capture?

### PrivateSector Score: 9/10

---

## Original Sources

- Rowan Digital Infrastructure — Temple Projects
- Rowan Digital Infrastructure — $3B Green Financing for Texas Campus
- Rowan Digital Infrastructure — Temple 300 MW Project`;

const schema_markup = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": title,
  "description": meta_description,
  "image": `https://privatesector.ch${image_url}`,
  "datePublished": date_published,
  "dateModified": date_published,
  "inLanguage": "en",
  "mainEntityOfPage": `https://privatesector.ch/news/${slug}`,
  "keywords": focus_keyword,
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

// Step 1: Upload Image to Live API
async function uploadImageToLive() {
  console.log(`\n--- Step 1: Image Upload to Live Server ---`);
  if (!fs.existsSync(localImagePath)) {
    throw new Error(`Local image does not exist at ${localImagePath}`);
  }

  const fileBuf = fs.readFileSync(localImagePath);
  const b64 = 'data:image/jpeg;base64,' + fileBuf.toString('base64');

  // Verify local destination paths
  fs.writeFileSync(path.join(serverUploadsDir, imageFileName), fileBuf);
  fs.writeFileSync(path.join(publicUploadsDir, imageFileName), fileBuf);
  if (fs.existsSync(distUploadsDir)) {
    fs.writeFileSync(path.join(distUploadsDir, imageFileName), fileBuf);
  }
  console.log(`[Local Upload] Verified copies in server/uploads, public/uploads, dist/uploads`);

  try {
    console.log(`[Live Upload] Uploading ${baseImageName} to https://privatesector.ch/api/upload...`);
    const res = await fetch('https://privatesector.ch/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: b64, filename: baseImageName, exactName: true })
    });
    const data = await res.json();
    console.log(`[Live Upload] Response:`, data);
  } catch (err) {
    console.error(`[Live Upload] Error:`, err.message);
  }

  // Verify image on live server
  try {
    const liveImgUrl = `https://privatesector.ch/uploads/${imageFileName}`;
    console.log(`[Verify Live Image] Checking ${liveImgUrl}...`);
    const imgRes = await fetch(liveImgUrl);
    console.log(`[Verify Live Image] HTTP Status: ${imgRes.status}, Content-Type: ${imgRes.headers.get('content-type')}`);
    if (imgRes.status !== 200) {
      console.warn(`⚠️ Warning: Image returned status ${imgRes.status}`);
    } else {
      console.log(`✅ Image verified on live server!`);
    }
  } catch (err) {
    console.error(`[Verify Live Image] Verification failed:`, err.message);
  }
}

// Step 2: Update local SQLite
function syncSQLite() {
  return new Promise((resolve, reject) => {
    console.log(`\n--- Step 2: Sync with Local SQLite ---`);
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
    });

    db.serialize(() => {
      db.get('SELECT id FROM news WHERE slug = ? OR title = ?', [slug, title], (err, row) => {
        if (err) {
          db.close();
          return reject(err);
        }

        if (row) {
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
            read_time_mins, content_body, pull_quote, JSON.stringify(tags), image_url,
            focus_keyword, meta_title, meta_description, slug, schema_markup, row.id
          ], function(uErr) {
            updateStmt.finalize();
            db.close();
            if (uErr) reject(uErr);
            else {
              console.log(`[SQLite] Updated successfully! ID: ${row.id}`);
              resolve(row.id);
            }
          });
        } else {
          db.get('SELECT COALESCE(MAX(id), 0) + 1 AS nextId FROM news', (mErr, mRow) => {
            if (mErr) {
              db.close();
              return reject(mErr);
            }
            const newId = mRow.nextId;
            console.log(`[SQLite] Inserting new article with ID: ${newId}...`);
            const stmt = db.prepare(`
              INSERT INTO news (
                id, title, subtitle, category, author_name, author_avatar, date_published, 
                read_time_mins, content_body, pull_quote, tags, image_url, 
                focus_keyword, meta_title, meta_description, slug, schema_markup
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            stmt.run([
              newId, title, subtitle, category, author_name, author_avatar, date_published,
              read_time_mins, content_body, pull_quote, JSON.stringify(tags), image_url,
              focus_keyword, meta_title, meta_description, slug, schema_markup
            ], function(iErr) {
              stmt.finalize();
              db.close();
              if (iErr) reject(iErr);
              else {
                console.log(`[SQLite] Inserted successfully! ID: ${newId}`);
                resolve(newId);
              }
            });
          });
        }
      });
    });
  });
}

// Step 3: Sync with Live API
async function syncLiveApi() {
  console.log(`\n--- Step 3: Sync with Live Site API ---`);
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
    tags,
    image_url,
    focus_keyword,
    meta_title,
    meta_description,
    slug,
    schema_markup
  };

  try {
    const listRes = await fetch('https://privatesector.ch/api/news');
    const existingList = await listRes.json();
    const existing = Array.isArray(existingList) ? existingList.find(a => a.slug === slug || a.title === title) : null;

    if (existing && existing.id) {
      console.log(`[Live API] Updating existing article ID: ${existing.id} via PUT...`);
      const res = await fetch(`https://privatesector.ch/api/news/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      console.log(`[Live API] Update response:`, result);
      return existing.id;
    } else {
      console.log(`[Live API] Posting new article via POST...`);
      const res = await fetch(`https://privatesector.ch/api/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      console.log(`[Live API] Create response:`, result);
      return result.id || result.article?.id;
    }
  } catch (err) {
    console.error(`[Live API] Error syncing article:`, err.message);
  }
}

// Step 4: Verification
async function verifyPublication() {
  console.log(`\n--- Step 4: Verification ---`);
  try {
    const res = await fetch(`https://privatesector.ch/api/news/${slug}`);
    if (res.ok) {
      const data = await res.json();
      const art = data.article || data;
      console.log(`✅ Live Article Verified Successfully!`);
      console.log(`Title: ${art.title}`);
      console.log(`Category: ${art.category}`);
      console.log(`Date Published: ${art.date_published}`);
      console.log(`Image URL: ${art.image_url}`);
      console.log(`Slug: ${art.slug}`);
      console.log(`Content length: ${art.content_body?.length} chars`);
    } else {
      console.error(`❌ Live Article Verification Failed! Status: ${res.status}`);
    }
  } catch (err) {
    console.error(`❌ Live Article Verification Error:`, err.message);
  }
}

async function main() {
  console.log(`=======================================================`);
  console.log(`Publishing: "${title}"`);
  console.log(`=======================================================`);
  await uploadImageToLive();
  const sqliteId = await syncSQLite();
  const liveId = await syncLiveApi();
  await verifyPublication();
  console.log(`\n=======================================================`);
  console.log(`Done! SQLite ID: ${sqliteId}, Live API ID: ${liveId}`);
  console.log(`=======================================================`);
}

main().catch(console.error);
