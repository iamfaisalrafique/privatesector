import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\50bd8c21-2f5d-49f8-918a-284519b305fa\\.user_uploaded';
const srcImageName = 'media_1787663138328.jpg';
const baseName = 'swiss_industry_has_an_american_problem_tariffs_swissmem';

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

const title = "Swiss Industry Has an American Problem — And the Real Story Is What Happens Next";
const subtitle = "While Swiss tech exports to the U.S. fell 5.3% following a 12.5% import tariff, the real transatlantic shift isn't just about duties — it's about whether Swiss industrial leaders will accelerate U.S. localization and M&A.";
const category = "Advanced Manufacturing";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-25";
const read_time_mins = 4;
const pull_quote = "The tariff is today's headline. What Swiss industry does next — acquiring U.S. manufacturers, establishing local assembly, and building closer to American customers — is the real story.";
const tags = JSON.stringify([
  "Swissmem",
  "Swiss Industry",
  "United States",
  "Section 301",
  "Tariffs",
  "Trade Policy",
  "Advanced Manufacturing",
  "Machinery",
  "Precision Engineering",
  "SME Competitiveness",
  "Martin Hirzel",
  "SECO",
  "Transatlantic Trade",
  "Localization",
  "M&A",
  "Industrial Technology"
]);
const focus_keyword = "Swiss industry American problem Swissmem tariffs Section 301 US exports localization Martin Hirzel SECO";
const meta_title = "Swiss Industry Has an American Problem — And What Happens Next — PrivateSector";
const meta_description = "Swiss tech exports to the US fell 5.3% after a 12.5% tariff. PrivateSector analyzes Swissmem data, SME margin pressure, and the strategic push toward US localization and M&A.";
const slug = "swiss-industry-has-an-american-problem-tariffs-swissmem";

const content_body = `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 25 AUGUST 2026 ◆ 4 MIN READ ◆ ADVANCED MANUFACTURING ◆ TRADE POLICY ◆ SWISSMEM ◆ LOCALIZATION

Switzerland's technology industry has begun to recover. Orders increased **12.1%** in the first half of 2026, sales rose **2.5%**, and overall exports increased **1.7%**.

But one critically important market moved in the opposite direction: **exports to the United States fell 5.3%**.

For Switzerland's industrial economy, that number deserves immediate attention. The United States is not simply another export destination. It is one of the world's largest markets for advanced machinery, precision components, electrical equipment, medical technology and specialized industrial products — precisely the areas in which Swiss manufacturers have built their international reputation.

---

## THE 12.5% PROBLEM

**SECTION 301 INVESTIGATION ◆ 2.5% TARIFF DISADVANTAGE VS EU ◆ EXEMPTIONS & TARIFF EXPOSURE**

Since **24 July 2026**, many Swiss goods entering the United States have faced a total U.S. import duty of **12.5%**, depending on the existing MFN tariff and with numerous product exemptions. The measure followed a U.S. Section 301 investigation concerning trade in goods produced using forced labour.

The problem for Swiss manufacturers is not simply the tariff itself. Switzerland competes directly with industrial producers in Germany, France, Italy and elsewhere in the European Union.

According to **Swissmem**, Swiss technology products currently face a **2.5-percentage-point tariff disadvantage** against competing EU products.

For a manufacturer exporting a highly specialized machine or a large volume of precision components, a difference of several percentage points can quickly become decisive.

And that raises an uncomfortable question:

**Who pays for it?**

---

## SWISS COMPANIES FACE A DIFFICULT CHOICE

**MARGIN PRESSURE VS PRICE COMPETITIVENESS ◆ 50%+ ABSORBING COSTS ◆ SME SALES DROP 3.8%**

More than half of the Swiss companies surveyed by Swissmem are reportedly absorbing the additional tariff costs themselves rather than fully transferring them to American customers. Another **42%** are passing the additional costs on.

Neither option is particularly attractive:
- **Absorb the tariff:** Profit margins come under immediate pressure.
- **Pass it to the customer:** The Swiss product becomes more expensive against a European competitor.

The pressure appears particularly acute for smaller manufacturers. Swissmem's first-half figures show that while large multinational companies helped drive the industry's recovery, **SME sales declined 3.8%**.

For Switzerland's smaller industrial exporters, therefore, the tariff discussion is not merely diplomatic. **It can become an existential question of competitiveness.**

---

## THE AMERICAN MARKET IS STILL TOO IMPORTANT TO IGNORE

**DATA CENTERS ◆ SEMICONDUCTORS ◆ AUTOMATION ◆ PHARMACEUTICALS ◆ TRADE AGREEMENT TALKS**

None of this means the United States has suddenly become unattractive. For many Swiss industrial companies, the opposite is true.

America's enormous industrial investment cycle — spanning data centers, energy infrastructure, semiconductor manufacturing, automation, pharmaceuticals and advanced manufacturing — continues to create sustained demand for precisely the kind of technology Switzerland produces best.

Furthermore:
- **Trade Negotiations:** Switzerland and the United States are continuing negotiations toward a comprehensive trade agreement, which could change the competitive picture again.
- **Exemptions:** Numerous product categories are already exempt from the additional tariffs.
- **Sector Specifics:** Sector-specific rules mean individual companies need to understand their actual exposure rather than assuming every Swiss product entering America faces identical treatment.

That makes the current situation uncomfortable, **but not necessarily permanent**.

---

## THE BIGGER RISK IS UNCERTAINTY

**OVERCAPACITY INVESTIGATION ◆ SECO MONITORING ◆ STRONG FRANC ◆ LONG-TERM CAPITAL PLANNING**

There is another issue hanging over the transatlantic relationship.

A separate **U.S. Section 301 investigation concerning alleged industrial overcapacity**, involving Switzerland alongside other economies, has yet to produce publicly known final recommendations, according to **SECO** (State Secretariat for Economic Affairs).

Swiss exporters are simultaneously navigating other headwinds:
- **Currency Headwinds:** The sustained structural strength of the Swiss Franc (CHF).
- **Tight Industrial Margins:** Ongoing cost pressure across supply chains.
- **Sector-Specific Trade Measures:** American trade regulations affecting key areas such as metals and pharmaceuticals.

The most difficult variable, therefore, may not be today's tariff rate.

**It is the inability to know what the trading environment will look like several years from now**, precisely when leadership teams are making long-term decisions about factories, suppliers, acquisitions and production capacity.

---

## 💡 PRIVATESECTOR INSIGHT

**WHAT HAPPENS WHEN EXPORTING STRUCTURALLY SHIFTS? ◆ THE LOCALIZATION ACCELERATION**

This is where the story becomes more interesting than the tariff itself.

What happens when exporting directly from Switzerland becomes structurally more expensive than supplying the same American customer from somewhere closer?

**Companies begin examining more than price.** They examine:
- Supply chain architecture
- Local U.S. partnerships
- Strategic bolt-on acquisitions
- American component sourcing
- Final assembly on U.S. soil
- Where the next production facility should be built

That does not mean Swiss manufacturers are preparing to relocate factories wholesale to America. Swissmem chairman **Martin Hirzel** has pushed back against expectations of widespread relocation and has pointed, among other factors, to labor constraints in the United States.

**But companies do not need to relocate Switzerland to increase their American footprint.** They can:
- **Acquire a U.S. manufacturer** to gain immediate domestic capacity.
- **Establish final assembly operations** inside the United States.
- **Build dedicated local service and maintenance networks**.
- **Find trusted American production partners**.
- **Localize selected high-tariff components**.
- **Expand existing U.S. production facilities**.
- **Place the next capital investment closer to the end customer**.

That creates a much more profound question for PrivateSector:

**Could tariffs unintentionally accelerate the localization of Swiss industry inside the United States?**

We don't know yet. But that is what we should watch.

Not simply which tariff Washington announces next, but which Swiss companies adapt, which protect their margins, which invest locally, which acquire American businesses and which decide that the best way to continue selling into America is to become slightly more American themselves.

**The tariff is today's headline. What Swiss industry does next is the real story.**

---

## PRIVATESECTOR INTELLIGENCE CARD

**SWISS INDUSTRY & TRANSATLANTIC TRADE ◆ SWISSMEM & U.S. TARIFF MONITOR**

- 🇨🇭 **Origin Market:** Switzerland (MEM Industry / Swissmem)
- 🇺🇸 **Destination Market:** United States
- 📊 **H1 2026 Swiss Export Trends:** Global Exports +1.7% | U.S. Exports -5.3% | SME Sales -3.8%
- ⚖️ **U.S. Tariff Level:** 12.5% (Section 301 forced labour investigation baseline)
- 📉 **Disadvantage vs EU Competitors:** ~2.5 percentage points
- 🏢 **Key Corporate Strategy:** 50%+ Absorbing tariffs | 42% Passing on costs | Accelerating U.S. localization
- 🤝 **Strategic Alternatives:** U.S. M&A, joint ventures, final assembly, local footprint expansion
- 🧭 **Key Leadership Voices:** Swissmem (Chairman Martin Hirzel), SECO

---

## PRIVATESECTOR INTELLIGENCE SCORE

**9.6/10 — TOP STRATEGIC SIGNAL 🔴**

- **Macroeconomic Impact:** ★★★★★
- **Transatlantic Relevance (CH ↔ US):** ★★★★★
- **Swiss SME & Industrial Exposure:** ★★★★★
- **M&A & Localization Potential:** ★★★★★
- **Policy Watch Value:** ★★★★★

**Executive Verdict:**
While tariff headlines dominate the political news cycle, forward-thinking Swiss industrial leaders are focusing on the structural endgame: deepening U.S. partnerships, acquiring local manufacturing capabilities, and securing market share in the world's most lucrative industrial investment boom.

---

## PRIVATESECTOR ◆ TRANSATLANTIC RADAR

**🇨🇭 Swiss precision. American scale. 🇺🇸**

[privatesector.ch](https://privatesector.ch/) — Intelligence That Connects Opportunities

---

Source: Swissmem H1 2026 industry reporting and member survey; SECO (State Secretariat for Economic Affairs) trade policy disclosures; U.S. Section 301 regulatory filings.`;

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
  console.log('=== Publishing Article: Swiss Industry Has an American Problem ===\n');

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
    "keywords": `${focus_keyword}, Swissmem, Swiss Industry, United States, Section 301, Tariffs, Trade Policy, Advanced Manufacturing, Machinery, Precision Engineering, SME Competitiveness, Martin Hirzel, SECO, Transatlantic Trade, Localization, M&A`,
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
    console.log('Published Article on Live API:', found ? `SUCCESS (ID: ${found.id}, Slug: ${found.slug})` : 'NOT FOUND');
  } catch (e) {
    console.error('Verification error:', e.message);
  }
}

main().catch(console.error);
