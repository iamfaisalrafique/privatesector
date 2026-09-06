import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\68b88b4e-b6fa-4f6a-9bbc-39ba718e89fb\\.user_uploaded';
const srcImageName = 'media_1787907647671.jpg';
const baseName = 'markets_wait_for_the_fed_jackson_hole_kevin_warsh';

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

const title = "Markets Wait for the Fed — Why Today's Jackson Hole Speech Matters";
const subtitle = "Financial markets are waiting for Federal Reserve Chair Kevin Warsh to speak at Jackson Hole — with U.S. inflation above target, borrowing costs elevated, and key implications for the Swiss franc, exporters, and transatlantic investment.";
const category = "Financial Markets";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-28";
const read_time_mins = 3;
const pull_quote = "Markets can move on expectations. Our analysis moves on facts. First the facts. Then the analysis.";
const tags = JSON.stringify([
  "Federal Reserve",
  "Kevin Warsh",
  "Jackson Hole",
  "Monetary Policy",
  "Interest Rates",
  "Inflation",
  "Swiss Franc",
  "CHF",
  "Swiss National Bank",
  "Financial Markets",
  "Central Banking",
  "Transatlantic Economy",
  "Swiss Exporters",
  "PrivateSector View"
]);
const focus_keyword = "Federal Reserve Kevin Warsh Jackson Hole speech monetary policy inflation interest rates Swiss franc Switzerland";
const meta_title = "Markets Wait for the Fed — Why Today's Jackson Hole Speech Matters — PrivateSector";
const meta_description = "Markets await Federal Reserve Chair Kevin Warsh's speech at Jackson Hole. PrivateSector explains what we know and why U.S. rate policy matters for Switzerland.";
const slug = "markets-wait-for-fed-jackson-hole-speech-matters-kevin-warsh";

const content_body = `DEVELOPING STORY 🇺🇸 ↔ 🇨🇭 ◆ 28 AUGUST 2026 ◆ 3 MIN READ ◆ FINANCIAL MARKETS ◆ MONETARY POLICY ◆ JACKSON HOLE ◆ FEDERAL RESERVE

Financial markets are waiting for **Federal Reserve Chair Kevin Warsh** to speak today at the annual **Jackson Hole Economic Policy Symposium**.

His speech comes at an important moment for the U.S. economy. Inflation remains above the Federal Reserve's **2% target**, government borrowing costs are elevated, and investors are trying to understand where American interest rates could go next.

For now, however, there is no new interest-rate decision.

Warsh has not yet delivered today's speech.

That matters because markets often try to anticipate central-bank decisions before policymakers actually make them. **PrivateSector prefers to separate those expectations from what has been confirmed.**

---

## WHAT WE KNOW

**10:00 AM ET (16:00 CEST) ◆ JACKSON HOLE SYMPOSIUM ◆ POLICY RATE UNCHANGED**

Here is what has been confirmed as markets await the symposium address:

- **Speaking Schedule:** Federal Reserve Chair Kevin Warsh is scheduled to speak at **10:00 a.m. Eastern Time (16:00 CEST)** today.
- **Current Policy Stance:** The Federal Reserve has kept its policy rate unchanged at its latest meeting, while inflation remains above target.
- **Market Focus:** Markets will listen carefully to what Warsh says about inflation, interest rates and the broader direction of monetary policy.

Until the address is delivered, market movements represent positioning and expectations rather than confirmed policy adjustments.

---

## WHY THIS MATTERS FOR SWITZERLAND

**U.S. INTEREST RATES ◆ CHF DYNAMICS ◆ TRANSATLANTIC CAPITAL FLOWS**

U.S. interest rates extend far beyond America.

Changes in expectations around Federal Reserve policy can influence the dollar, the Swiss franc, global borrowing costs, bond markets and investment decisions:

- **Currency & Franc Strength:** Shifts in interest rate expectations influence the exchange rate between the U.S. dollar and the Swiss franc (CHF), impacting Swiss export pricing.
- **Global Borrowing Costs:** Federal Reserve monetary decisions act as a benchmark for international financing, credit spreads, and corporate bond yields.
- **Swiss Corporate Exposure:** Today's speech is directly relevant to Swiss banks, exporters, institutional investors and companies with significant U.S. exposure.

**But there is nothing for Swiss companies to act on yet.**

The sensible approach is simply to listen first.

---

## 💡 PRIVATESECTOR VIEW

**FOCUS AREAS: INFLATION, INTEREST RATES AND THE ECONOMIC OUTLOOK**

Today's important development is not a prediction about what Kevin Warsh will do.

It is that one of the world's most influential central bankers is about to explain his thinking at a time when inflation and borrowing costs remain important questions for businesses and investors.

We will look at what he actually says before drawing conclusions for Switzerland.

**First the facts. Then the analysis.**`;

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
  console.log('=== Publishing Article: Markets Wait for the Fed ===\n');

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
    "keywords": `${focus_keyword}, Federal Reserve, Kevin Warsh, Jackson Hole, Monetary Policy, Interest Rates, Inflation, Swiss Franc, CHF, Swiss National Bank, Financial Markets, Central Banking, Transatlantic Economy, Swiss Exporters, PrivateSector View`,
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
