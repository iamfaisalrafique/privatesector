import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\a29b50f1-62a3-45d6-accf-deb4338c9eb3\\.user_uploaded';
const srcImageName = 'media_1788181301288.jpg';
const baseName = 'can_ai_become_americas_next_productivity_engine_switzerland';

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

const title = "Can AI Become America's Next Productivity Engine — And What Would That Mean for Switzerland?";
const subtitle = "Federal Reserve Chair Kevin Warsh is examining whether AI can trigger sustained productivity growth across the U.S. economy — posing critical lessons for Switzerland's high-wage, ageing workforce.";
const category = "Financial Markets";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-31";
const read_time_mins = 4;
const pull_quote = "The most valuable lesson from America's AI expansion may ultimately be not how much money is invested in artificial intelligence — but how successfully businesses convert the technology into real productivity.";
const tags = JSON.stringify([
  "Artificial Intelligence",
  "Federal Reserve",
  "Kevin Warsh",
  "Jackson Hole",
  "Productivity",
  "Economic Policy",
  "Switzerland",
  "Swiss Economy",
  "Labour Shortage",
  "SECO",
  "Federal Council",
  "UBS",
  "Roche",
  "Novartis",
  "ABB",
  "Swisscom",
  "NVIDIA",
  "Microsoft",
  "Monetary Policy",
  "PrivateSector View"
]);
const focus_keyword = "AI productivity America Switzerland Federal Reserve Kevin Warsh Jackson Hole labour shortage Swiss economy";
const meta_title = "Can AI Become America's Next Productivity Engine — And What Would That Mean for Switzerland? — PrivateSector";
const meta_description = "Federal Reserve Chair Kevin Warsh is examining whether AI can trigger sustained productivity growth. PrivateSector analyzes what America's AI expansion means for Swiss business.";
const slug = "can-ai-become-americas-next-productivity-engine-switzerland";

const content_body = `ANALYSIS 🇺🇸 ↔ 🇨🇭 ◆ 31 AUGUST 2026 ◆ 4 MIN READ ◆ ARTIFICIAL INTELLIGENCE ◆ ECONOMIC POLICY ◆ SWITZERLAND ◆ FEDERAL RESERVE

## 🇺🇸 What Is Happening in America?

Artificial intelligence is becoming more than a technology story in the United States. It is increasingly becoming an **economic-policy question**.

Speaking at Jackson Hole on August 28, **Federal Reserve Chair Kevin Warsh** said the Fed is examining whether AI could produce a significant and sustained increase in U.S. productivity — and what that could mean for workers, investment, economic growth and monetary policy.

The investment behind the AI expansion is already substantial. Warsh pointed to rapidly growing capital flowing into AI infrastructure and described AI as potentially becoming a **new factor of production**.

The Federal Reserve has also established a **task force on productivity and jobs** to study these questions. Warsh was careful, however, to say that its recommendations will come later and have no bearing on current monetary-policy decisions.

The central question remains unanswered: **Will AI create lasting productivity growth across the American economy — and, if so, when?**

---

## 🇨🇭 Why Should Switzerland Care?

Switzerland faces its own productivity challenge.

A Federal Council-backed study published in April 2026, based on a representative survey of **1,624 companies**, found that around **two-thirds of participating Swiss companies had difficulty recruiting or retaining employees**. Most expected labour shortages to intensify over the following five years.

The study identifies **population ageing** as a central supply-side driver of Switzerland's labour shortage.

That makes America's AI productivity experiment particularly relevant to Switzerland:

- **Sustained Output Gains:** If U.S. companies demonstrate that artificial intelligence can generate sustained productivity gains — allowing businesses to generate more output from their workforce and capital — Swiss companies have a strong reason to pay attention.
- **High-Wage Demographics:** For a high-wage economy with an ageing population and shortages of workers in parts of the economy, AI could potentially become one tool for improving productivity.
- **Pragmatic Realism:** But that remains a possibility, not a guaranteed outcome.

---

## 🏢 Which Companies Are Involved?

In America, the AI investment cycle extends far beyond companies developing AI models.

**NVIDIA, Microsoft, Alphabet, Amazon and Meta** are among the major companies building or supporting the computing infrastructure behind the AI expansion. Semiconductor manufacturers, cloud providers, energy companies, data-centre operators and other suppliers form part of the wider investment chain.

In Switzerland, the productivity question is relevant across industries such as **banking, pharmaceuticals, insurance, telecommunications and industrial automation**.

Companies worth watching include:
- 🏦 **UBS** — Automating complex operations, risk modelling, and back-office workflows
- 💊 **Roche & Novartis** — Accelerating high-throughput drug discovery, clinical development, and trial analytics
- ⚙️ **ABB** — Integrating AI into industrial robotics, factory automation, and smart electrification
- 📡 **Swisscom** — Optimising enterprise telecommunications, IT infrastructure, and customer service

*This does not mean these companies are participating in the Federal Reserve's AI work or that they will necessarily achieve major AI-driven productivity gains. They are companies to watch because their industries are exposed to the same economic question the Fed is now examining.*

---

## 💰 Where Is the Business Opportunity?

The biggest economic opportunity from AI may not simply come from selling AI technology.

**It could come from using AI to produce more with the people, factories, laboratories, infrastructure and capital companies already have.**

For Switzerland, that distinction matters:
- **Pharmaceuticals:** A pharmaceutical company could potentially use AI to accelerate parts of research and development.
- **Financial Services:** A bank or insurer could automate repetitive operational and compliance work.
- **Manufacturing & Industry:** Manufacturers could use AI to improve production, predictive maintenance and quality control.

If AI develops into a genuine productivity technology, its economic impact could spread far beyond Silicon Valley.

For Swiss businesses, the important question may therefore be less:

> **“Who will build the next AI model?”**

and increasingly:

> **“Who can use AI to become more productive?”**

---

## 📚 Has This Happened Before?

Yes — but history also gives us a warning about timing.

Previous general-purpose technologies, including **electricity and computers**, eventually transformed productivity across large parts of the economy.

**But those benefits did not appear everywhere immediately.**

Businesses had to invest in new equipment, reorganise workflows, train employees and sometimes redesign entire processes before the technology translated into substantial productivity improvements.

AI could follow a similar path:
- Large investment today does not automatically guarantee economy-wide productivity growth tomorrow.
- That is precisely why the Federal Reserve is asking not only whether AI will increase productivity, but also when those gains could become significant and sustained.

For Switzerland, the historical lesson is simple:

> **Buying AI and achieving higher productivity are not necessarily the same thing.**

---

## 🔭 What Happens Next?

The Federal Reserve's **productivity-and-jobs task force** will be worth watching.

So will U.S. business investment, employment, corporate earnings and productivity data.

For Switzerland, the important evidence will increasingly come from companies themselves: **whether investments in artificial intelligence actually produce measurable improvements in output, research, costs, customer service and workforce productivity.**

Switzerland's labour market will also remain important. The Federal Council's research shows that labour shortages are widespread, even though their intensity is moderate by international comparison.

The next phase of the AI story may therefore be less about how impressive the technology appears — and much more about **what it actually delivers**.

---

## 💡 PRIVATESECTOR VIEW

**TRANSLATING CAPITAL EXPENDITURE INTO REAL-ECONOMY PRODUCTIVITY**

The Federal Reserve has not concluded that AI will transform the American economy. **It is investigating whether it will.**

That distinction matters.

**PrivateSector analysis:** If the United States begins demonstrating sustained AI-driven productivity growth, Switzerland should watch closely. For a high-wage economy facing demographic and workforce pressures, the most valuable lesson from America's AI expansion may ultimately be not how much money is invested in artificial intelligence — **but how successfully businesses convert the technology into real productivity.**

Source: Federal Reserve Board, August 28, 2026; Swiss State Secretariat for Economic Affairs (SECO) / Federal Council labour-shortage study, April 22, 2026; The Washington Post, August 29, 2026.`;

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
  console.log('=== Publishing Article: Can AI Become America\'s Next Productivity Engine ===\n');

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
    "keywords": `${focus_keyword}, Artificial Intelligence, Federal Reserve, Kevin Warsh, Jackson Hole, Productivity, Economic Policy, Switzerland, Swiss Economy, Labour Shortage, SECO, Federal Council, UBS, Roche, Novartis, ABB, Swisscom, NVIDIA, Microsoft, Monetary Policy, PrivateSector View`,
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
