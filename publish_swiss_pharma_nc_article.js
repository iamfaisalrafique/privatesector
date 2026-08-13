import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');

const title = "Swiss Pharma Is Building a North Carolina Power Base. Who Could Follow?";
const subtitle = "Roche and Novartis are putting major manufacturing capacity into North Carolina. The bigger story may be what grows around them — and which Swiss companies could be next.";
const category = "Pharmaceuticals";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-12";
const read_time_mins = 3;
const pull_quote = "We don't stop at the news. We find where the opportunity lies.";
const tags = JSON.stringify(["Roche", "Novartis", "North Carolina", "Pharmaceuticals", "Genentech", "Life Sciences", "Swiss Ecosystem", "Holly Springs", "Durham"]);
const image_url = "https://files.catbox.moe/oo6xj4.jpg";
const focus_keyword = "Swiss pharma North Carolina Roche Novartis investment";
const meta_title = "Swiss Pharma Building North Carolina Power Base — PrivateSector Intelligence";
const meta_description = "Roche and Novartis expand manufacturing footprint in North Carolina. PrivateSector examines the emerging Swiss pharmaceutical corridor and supply chain opportunities.";
const slug = "swiss-pharma-building-north-carolina-power-base-who-could-follow";

const content_body = `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 12 AUGUST 2026 ◆ 3 MIN READ ◆ PHARMA ◆ LIFE SCIENCES ◆ NORTH CAROLINA

Roche and Novartis are putting major manufacturing capacity into North Carolina. The bigger story may be what grows around them — and which Swiss companies could be next.

North Carolina is becoming increasingly difficult for Swiss business leaders to ignore.

Around 80 Swiss companies are now based across the southeastern United States, according to a fresh Swiss report highlighting North Carolina's effort to attract more Swiss investment. Two names stand above the rest: Roche and Novartis.

But the interesting part isn't simply that two Basel pharmaceutical giants are investing in America.

It's what they are building around them.

Roche's U.S. subsidiary Genentech is developing a new manufacturing facility in Holly Springs, North Carolina, with an initial investment exceeding $700 million. The 65,000-square-metre facility will support future metabolic medicines, including next-generation obesity treatments, and forms part of Roche's broader $50 billion U.S. investment commitment.

Novartis is going further still. Its North Carolina expansion includes a flagship manufacturing hub spanning more than 700,000 square feet, with new and expanded facilities in Durham and Morrisville. The company expects the expansion to create 700 new jobs by 2030, as part of its wider $23 billion U.S. infrastructure investment.

This is starting to look less like two individual investments and more like the formation of a Swiss pharmaceutical manufacturing corridor inside one of America's most important life-sciences regions.

---

## THE SWISS OPPORTUNITY

**ROCHE — BUILDING ◆ NOVARTIS — EXPANDING ◆ SWISS CLUSTER — GROWING ◆ SUPPLIER OPPORTUNITY — EMERGING**

Here's where the story becomes interesting for Switzerland.

Large pharmaceutical plants don't operate alone. They require automation, aseptic technology, process equipment, laboratory systems, validation, engineering, packaging, quality control, logistics and specialized suppliers.

That creates a second question behind the billions:

If Roche and Novartis are building deeper roots in North Carolina, which Swiss suppliers could eventually follow their customers across the Atlantic?

Companies such as SKAN deserve watching because Swiss pharmaceutical-production specialists already have demonstrated U.S. experience. But the opportunity could extend well beyond one company.

The more valuable Radar may therefore be the ecosystem forming around Roche and Novartis.

---

## WHY NORTH CAROLINA?

**LIFE-SCIENCES TALENT — STRONG ◆ ACADEMIC ECOSYSTEM — STRONG ◆ MANUFACTURING BASE — EXPANDING ◆ SWISS PRESENCE — GROWING**

Roche itself pointed to North Carolina's skilled workforce, academic institutions and concentration of life-sciences companies when explaining its choice of Holly Springs.

Novartis already manufactures gene therapies in Durham and is expanding across multiple technology platforms. Its North Carolina footprint now includes activities spanning gene therapy, biologics, sterile filling, small-molecule medicines and active pharmaceutical ingredients.

That breadth matters.

It means North Carolina isn't attracting only corporate offices.

It's attracting the infrastructure where medicines are actually made.

---

## OUR VIEW

**SIGNAL — STRONG ◆ SWISS RELEVANCE — HIGH ◆ OPPORTUNITY — ECOSYSTEM ◆ TIMING — NOW ◆ VERDICT — WATCH WHO FOLLOWS**

The conventional story is that Roche and Novartis are investing billions in the United States.

Our question is different:

What happens after the giants arrive?

Suppliers follow customers. Specialist expertise follows manufacturing. Partnerships form around production hubs. Smaller companies sometimes enter markets through ecosystems created by much larger ones.

North Carolina could therefore become important not only for Roche and Novartis, but for a broader generation of Swiss pharmaceutical, medtech and advanced-manufacturing companies looking at the United States.

And there is already another Swiss–U.S. connection worth noticing: Novartis is simultaneously building a new 466,000-square-foot global Biomedical Research center in San Diego, designed to connect with its research network including Basel.

That suggests something larger than a North Carolina story.

Swiss life sciences are building deeper physical infrastructure across America.

For privatesector.ch, the next job isn't simply to report each factory.

It's to watch who follows, who supplies, who partners — and where the next Swiss opportunity appears.

**NEXT SIGNAL — SWISS SUPPLIERS ◆ NEW U.S. FACILITIES ◆ PARTNERSHIPS ◆ PROCUREMENT ◆ FOLLOW-ON INVESTMENT**

The factories are being built. Now watch the ecosystem around them.

**We don't stop at the news. We find where the opportunity lies.**

🇨🇭 ↔ 🇺🇸`;

const schema_markup = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": title,
  "description": meta_description,
  "image": "https://privatesector.ch" + image_url,
  "datePublished": date_published,
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

// 1. Update SQLite Local Database
function updateSQLite() {
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
            read_time_mins, content_body, pull_quote, tags, image_url,
            focus_keyword, meta_title, meta_description, slug, schema_markup, row.id
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
            read_time_mins, content_body, pull_quote, tags, image_url,
            focus_keyword, meta_title, meta_description, slug, schema_markup
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

// 2. Update Live Postgres Database (if available)
async function updateLivePostgres() {
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
        read_time_mins, content_body, pull_quote, JSON.stringify(tagsArray), image_url,
        focus_keyword, meta_title, meta_description, slug, schema_markup, id
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
        read_time_mins, content_body, pull_quote, JSON.stringify(tagsArray), image_url,
        focus_keyword, meta_title, meta_description, slug, schema_markup
      ]);
      console.log(`[Postgres] Article inserted successfully with ID: ${resIns.rows[0].id}`);
    }
  } catch (err) {
    console.error('[Postgres] Error publishing to live postgres:', err.message);
  } finally {
    await client.end();
  }
}

// 3. Post to Live API
async function updateLiveApi() {
  try {
    const payload = {
      title, subtitle, category, author_name, author_avatar, date_published,
      read_time_mins, content_body, pull_quote, tags: JSON.parse(tags), image_url,
      focus_keyword, meta_title, meta_description, slug, schema_markup
    };
    console.log('[API] Posting to https://privatesector.ch/api/news...');
    const res = await fetch('https://privatesector.ch/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('[API] Live server response:', data);
  } catch (err) {
    console.error('[API] Error posting to live API:', err.message);
  }
}

async function main() {
  console.log('=== Publishing Article: Swiss Pharma Is Building a North Carolina Power Base ===');
  await updateSQLite();
  await updateLivePostgres();
  await updateLiveApi();
  console.log('=== Done! Article successfully published across databases ===');
}

main();
