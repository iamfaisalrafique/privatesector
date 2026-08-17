import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\7b9416d1-da62-48ff-890c-82e7c7ee0bac\\.user_uploaded';
const srcImageName = 'media_1786960431453.jpg';
const baseName = 'ai_creating_new_fortunes_where_money_goes_switzerland';

const localUploadsDir = path.resolve(__dirname, 'server', 'uploads');
const publicUploadsDir = path.resolve(__dirname, 'public', 'uploads');
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');

if (!fs.existsSync(localUploadsDir)) fs.mkdirSync(localUploadsDir, { recursive: true });
if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });

async function uploadImage() {
  const filePath = path.join(uploadDir, srcImageName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Source image not found at ${filePath}`);
  }

  const fileBuf = fs.readFileSync(filePath);
  const b64 = 'data:image/jpeg;base64,' + fileBuf.toString('base64');
  
  // Save local copy in server/uploads & public/uploads
  fs.writeFileSync(path.join(localUploadsDir, `${baseName}.jpg`), fileBuf);
  fs.writeFileSync(path.join(publicUploadsDir, `${baseName}.jpg`), fileBuf);
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

const title = "AI Is Creating New Fortunes. Where Will the Money Go Next?";
const subtitle = "America's AI boom is creating a new generation of wealthy founders and investors. For Switzerland, that could open opportunities far beyond technology.";
const category = "Wealth Management";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-17";
const read_time_mins = 3;
const pull_quote = "America is creating a new generation of technology wealth. Switzerland already has generations of experience managing and serving wealth. Those two worlds may increasingly meet.";
const tags = JSON.stringify([
  "Artificial Intelligence",
  "Wealth Management",
  "Private Banking",
  "Luxury Watches",
  "UBS",
  "Julius Baer",
  "Pictet",
  "Lombard Odier",
  "Rolex",
  "Patek Philippe",
  "Audemars Piguet",
  "Richemont",
  "Family Offices",
  "Switzerland",
  "Silicon Valley"
]);
const focus_keyword = "AI wealth creation Switzerland wealth management luxury private banking";
const meta_title = "AI Is Creating New Fortunes: Where Will the Money Go Next? — PrivateSector Intelligence";
const meta_description = "America's AI boom creates unprecedented fortunes for founders and investors. Explore how Swiss private banking, luxury watchmakers, and family offices are positioned to capture this transatlantic capital wave.";
const slug = "ai-is-creating-new-fortunes-where-will-the-money-go-next";

const content_body = `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 17 AUGUST 2026 ◆ 3 MIN READ ◆ ARTIFICIAL INTELLIGENCE ◆ WEALTH MANAGEMENT ◆ SWISS LUXURY

America's AI boom is creating a new generation of wealthy founders and investors. For Switzerland, that could open opportunities far beyond technology.

---

## AI IS CREATING MORE THAN TECHNOLOGY

**CHIPS & DATA CENTERS — VISIBLE ◆ FOUNDER EQUITY — SOARING ◆ PERSONAL WEALTH — UNPRECEDENTED**

When we talk about America's AI boom, we normally talk about chips, data centers, software and billion-dollar startups. But something else is happening at the same time: AI is creating enormous personal wealth.

Founders, early employees and investors who entered these companies early are seeing the value of their stakes rise dramatically. Some are becoming multimillionaires. Others are becoming billionaires.

And this raises an interesting question: what happens to that money next?

---

## THE SECOND ECONOMY OF AI

**NEW STARTUPS — INVESTING ◆ PRIVATE BANKING — EXPANDING ◆ LUXURY GOODS — CRAFTSMANSHIP ◆ WEALTH MANAGEMENT — SWISS OPPORTUNITY**

Wealth doesn't simply sit inside a technology company forever. Eventually some of it moves. It gets invested, managed and spent.

That can mean new startups, investment funds and property. But it can also mean private banking, watches, travel, luxury services and wealth management.

This is where the AI story suddenly becomes interesting for Switzerland.

America may be creating much of this new wealth, but Switzerland already has some of the world's strongest businesses for managing, investing and serving wealth.

---

## SWISS BANKING COULD BE ONE WINNER

**CONCENTRATED EQUITY — HIGH RISK ◆ DIVERSIFICATION — CRITICAL ◆ CROSS-BORDER ESTATE PLANNING — SWISS EXPERTISE**

Imagine an American AI founder whose company becomes worth billions. Much of that person's wealth may still be tied to one company. As that wealth grows, so does the complexity around investments, taxes, currencies, estate planning and diversification.

That is familiar territory for Swiss wealth managers.

UBS, Julius Baer, Pictet and Lombard Odier all operate in a world where wealthy entrepreneurs and families need more than a normal bank account.

The opportunity isn't simply attracting someone after they become a billionaire. It is building a relationship while a new generation of technology entrepreneurs is still creating its wealth.

---

## THEN COME THE WATCHES

**DIGITAL SPEED — TRANSIENT ◆ MECHANICAL HOROLOGY — GENERATIONAL ◆ AMERICAN DEMAND — STRONG ACCELERATION**

There is an interesting contrast here.

AI is digital, fast and constantly changing. A Swiss mechanical watch is physical, carefully made and designed to last for generations.

Yet America's new technology wealth can create new customers for exactly that kind of craftsmanship.

That puts names such as Rolex, Patek Philippe, Audemars Piguet and Richemont's watch and jewellery houses in an interesting position.

Richemont's latest results already showed strong growth in the Americas. We cannot say AI wealth caused that growth, but it shows something important: wealthy American consumers already matter greatly to Swiss luxury.

If AI creates thousands more wealthy entrepreneurs and investors, that customer base could become even more interesting.

---

## IT GOES BEYOND WATCHES AND BANKS

**PRIVATE BANKING ★ WATCHES ★ LUXURY HOTELS ★ WEALTH MANAGEMENT ★ ASSET MANAGEMENT ★ FAMILY OFFICES ★ PRIVATE AVIATION ★ ALPINE TOURISM ★ PREMIUM HEALTHCARE**

Switzerland has another advantage: many industries serving wealthy people already exist close together.

Think about places such as Zurich, Geneva, Gstaad and St. Moritz. They aren't technology centers competing with Silicon Valley. They offer something different: financial expertise, discretion, craftsmanship, international connections and premium services.

That means Switzerland doesn't need to compete with America for the AI company itself to benefit from the wealth AI creates.

---

## THE NEW CUSTOMER MAY ALSO BE DIFFERENT

**TIME & PRIVACY — FIRST ◆ CRAFTSMANSHIP OVER STATUS ◆ CONCENTRATION RISK — MITIGATION ◆ WELLNESS & LONGEVITY**

Swiss businesses should not assume the new technology millionaire looks exactly like the traditional wealthy customer.

A younger founder may care less about obvious luxury and more about time, privacy, quality, health and personalization:

- **Private Aviation** — Can save irreplaceable executive time.
- **Rare Mechanical Watches** — Represent timeless craftsmanship and engineering rather than simply status.
- **Private Banking** — Helps diversify immense wealth concentrated in a single technology company.
- **Swiss Alpine Resorts** — Provide privacy, restoration and wellness rather than just conventional luxury.

Understanding that customer will matter.

---

## SWISS COMPANIES THAT SHOULD WATCH

**UBS — GLOBAL WEALTH MANAGEMENT ◆ PRIVATE BANKS — JULIUS BAER, PICTET, LOMBARD ODIER ◆ LUXURY HOUSES — RICHEMONT, ROLEX, PATEK PHILIPPE, AUDEMARS PIGUET**

- **UBS** — Sits particularly close to this opportunity because of its large wealth-management presence and its expansive reach in the United States.
- **Julius Baer, Pictet & Lombard Odier** — Should watch how America's technology wealth develops and how younger entrepreneurs want their capital managed and structured.
- **Richemont, Rolex, Patek Philippe & Audemars Piguet** — Sit on another side of the opportunity: highly valuable Swiss products built around craftsmanship, heritage and scarcity.
- **Swiss Hospitality, Aviation & Family Offices** — Luxury hotels, private aviation businesses, multi-family offices and premium service companies positioned around Swiss discretion.

---

## BUT THE BIGGEST OPPORTUNITY MAY COME LATER

Today's AI founder doesn't only become tomorrow's luxury customer.

They can become tomorrow's investor.

Someone who makes $100 million from an AI company might create another startup, establish a family office, invest in biotech, fund a Swiss technology company or acquire a European business.

That makes this much bigger than watches and hotels.

The real opportunity is creating a long-term relationship between America's new technology wealth and Switzerland's financial and business ecosystem.

---

## PRIVATESECTOR INSIGHT

**FIRST AI ECONOMY — CHIPS & SOFTWARE ◆ SECOND AI ECONOMY — WEALTH & CAPITAL FLOWS ◆ SWISS ECOSYSTEM — STRATEGIC DESTINATION**

The first AI economy is easy to see: chips, software, models and data centers.

The second is quieter.

It begins when the people behind those businesses become wealthy and start deciding where to invest, where to bank, what to buy and which companies to back next.

America is creating a new generation of technology wealth. Switzerland already has generations of experience managing and serving wealth.

Those two worlds may increasingly meet.

Swiss companies don't necessarily need to build the next AI model to benefit from the AI revolution.

Sometimes the better opportunity is understanding what happens after somebody builds it.

---

## EXECUTIVE CONCLUSION

**SIGNAL — STRONG ◆ SECTOR — WEALTH MANAGEMENT & LUXURY ◆ IMPACT — TRANSATLANTIC CAPITAL INFLOW ◆ OUTLOOK — MONITOR CAPITAL ALLOCATION**

**PRIVATESECTOR INTELLIGENCE | 🇨🇭 Switzerland ↔ United States 🇺🇸**

**We find the signal. You find the opportunity.**`;

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
  console.log('=== Publishing Article: AI Is Creating New Fortunes ===\n');

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
