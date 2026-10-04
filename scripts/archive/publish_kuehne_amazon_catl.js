import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');

// Article details
const title = "Three Days, Two Giants: What Amazon and CATL Reveal About Kuehne+Nagel";
const subtitle = "In 1890, August Kuehne and Friedrich Nagel founded a freight-forwarding company in Bremen. The early business moved goods such as cotton, cereals, wood and sugar. More than 130 years later, the company is headquartered in Switzerland, operates across close to 100 countries and serves around 400,000 customers. The goods have changed. More importantly, the work around those goods is changing too.";
const category = "Swiss Economics";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-10-01";
const read_time_mins = 3;
const pull_quote = "Kuehne+Nagel is moving deeper into logistics ecosystems where transporting the product is only one part of the customer's need.";
const tags = [
  "Kuehne+Nagel",
  "Amazon",
  "AWS",
  "CATL",
  "Logistics",
  "Supply Chain",
  "Data Centers",
  "Batteries",
  "Electrification",
  "Switzerland",
  "Swiss Economics"
];
const focus_keyword = "Kuehne+Nagel Amazon AWS CATL battery logistics cloud infrastructure data centers Switzerland";
const slug = "three-days-two-giants-what-amazon-and-catl-reveal-about-kuehne-nagel";
const meta_title = "Three Days, Two Giants: What Amazon and CATL Reveal About Kuehne+Nagel — PrivateSector";
const meta_description = "How strategic deals with Amazon AWS and battery giant CATL reveal Kuehne+Nagel's transformation from traditional freight forwarding into specialized infrastructure ecosystems.";

// Image handling
const uploadedImageName = 'what_amazon_and_catl_reveal_about_kuehne_nagel_1790867629725_5k07l.jpg';
const image_url = `/uploads/${uploadedImageName}`;

const content_body = `In 1890, August Kuehne and Friedrich Nagel founded a freight-forwarding company in Bremen. The early business moved goods such as cotton, cereals, wood and sugar. More than 130 years later, the company is headquartered in Switzerland, operates across close to 100 countries and serves around 400,000 customers. The goods have changed. More importantly, the work around those goods is changing too. *(Kuehne + Nagel +2)*

The first important clue came before Amazon or CATL entered this story.

In November 2024, Kuehne+Nagel launched a specialised global logistics service for servers and data centres. The company explicitly connected the opportunity to the rapid expansion of cloud infrastructure and artificial intelligence. Moving this equipment required more than ordinary freight: secure handling, trained specialists, real-time monitoring, chain-of-custody controls and white-glove delivery of sensitive and oversized servers into data centres. *(Kuehne+Nagel)*

By 2026, this was no longer only a new service on a corporate website.

In June, Kuehne+Nagel disclosed that it was handling a key set of Google Cloud infrastructure shipments in 2026. The agreement included the purchase of up to 5.2 million litres of sustainable aviation fuel. Then in July, Kuehne+Nagel reported significant new Contract Logistics business from technology customers. New warehouse space dedicated to cloud providers would exceed 300,000 square metres. *(Kuehne+Nagel +1)*

The sequence matters. Kuehne+Nagel built a specialised capability, won business and committed physical capacity to the sector. Then came Amazon.

On 21 September, Kuehne+Nagel announced a long-term strategic collaboration with Amazon. The announcement was made as an ad-hoc disclosure under SIX Listing Rules. It builds on an existing relationship and includes Amazon Web Services. *(Kuehne+Nagel)*

The scope is what makes the agreement interesting.

Kuehne+Nagel's work around AWS infrastructure can stretch from construction and equipment deployment to maintenance, upgrades and later expansion projects. The relationship is also supported by a call option on existing Kuehne+Nagel shares, with vesting linked to commercial milestones and services over a period of up to seven years. *(Kuehne+Nagel)*

This takes logistics beyond a simple journey from A to B. A data centre has to be built. Equipment has to arrive. Servers have to be deployed. Infrastructure has to be maintained, upgraded and eventually expanded. Kuehne+Nagel can potentially participate at several points in that lifecycle.

Then, only three days after its Amazon announcement, another name appeared: CATL.

Kuehne+Nagel and the Chinese battery manufacturer announced a memorandum of understanding covering battery logistics and transport electrification. The initial work includes electrifying CATL's European transport flows and testing CATL's Qiji battery-swapping system for heavy trucks in China. The companies also identified battery recycling, after-sales support, energy storage and charging solutions at logistics sites as areas for collaboration. *(CATL +1)*

Amazon and CATL operate in very different industries. One sits at the centre of global cloud infrastructure; the other is a major force in batteries and electrification. There is no evidence that Kuehne+Nagel itself treats the two agreements as parts of one formal strategy.

But placed beside the developments that came before them, a pattern is becoming visible.

Kuehne+Nagel is moving deeper into logistics ecosystems where transporting the product is only one part of the customer's need.

With AWS, the opportunity can continue through deployment, maintenance, upgrades and expansion. With CATL, the proposed cooperation can continue into swapping, recycling, after-sales services, storage and charging.

Healthcare provides another example of the company's investment in specialised logistics, although it should not be confused with the Amazon-CATL story. On 16 September, Kuehne+Nagel opened a 3,505-square-metre healthcare logistics centre at Frankfurt Airport for temperature-sensitive pharmaceutical and healthcare products. The facility strengthened a global network of more than 270 HealthChain-certified locations. *(Kuehne+Nagel)*

Complexity appears to matter.

A conventional shipment can become a price-driven transaction. But servers worth large sums, temperature-sensitive medicine or batteries that require specialised handling, recycling and after-sales support create additional problems for customers. Solving more of those problems can put a logistics provider closer to the customer's operations.

That does not mean Kuehne+Nagel owns these markets.

CATL, for example, also works with other major logistics groups. Nor does the Amazon agreement tell investors how much revenue or profit Kuehne+Nagel will ultimately generate from AWS infrastructure. Kuehne+Nagel has not disclosed the financial value of the Amazon collaboration, and the CATL agreement remains an MoU.

There are encouraging numbers around the broader business. In the second quarter of 2026, Contract Logistics EBIT increased 21% to CHF 51 million while Kuehne+Nagel reported the significant technology-sector wins and cloud-provider warehouse expansion. But the company does not disclose enough information to attribute that profit growth specifically to cloud infrastructure. *(Kuehne+Nagel)*

That distinction is important.

The evidence can show us where Kuehne+Nagel is building capabilities and where customers are giving it business. It cannot yet tell us whether these new areas will permanently improve the group's economics.

That may be the most interesting part of the story.

A company that began by moving cotton, cereals, wood and sugar is now moving some of the physical building blocks behind cloud computing and exploring a role inside the battery ecosystem. The Amazon agreement gives the cloud strategy considerable weight. CATL opens another door.

The direction is becoming clearer. The financial outcome is still being written.

---

## Sources

- Kuehne+Nagel — company history and profile
- Kuehne+Nagel — server and data-centre logistics, November 2024
- Kuehne+Nagel — Google Cloud infrastructure shipments, June 2026
- Kuehne+Nagel — Q2 2026 results and cloud-provider expansion
- Kuehne+Nagel — Amazon/AWS strategic collaboration
- CATL — Kuehne+Nagel battery partnership
- Kuehne+Nagel — Frankfurt healthcare logistics centre`;

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

// Ensure local image file exists across public, server, and dist
function syncLocalImages() {
  const sourceImg = path.resolve('C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\28ade540-73de-4649-ae3d-8f02809b9505\\.user_uploaded\\media_1790867208185.jpg');
  const buf = fs.readFileSync(sourceImg);

  const targets = [
    path.resolve(__dirname, 'public', 'uploads', uploadedImageName),
    path.resolve(__dirname, 'server', 'uploads', uploadedImageName),
    path.resolve(__dirname, 'dist', 'uploads', uploadedImageName)
  ];

  for (const t of targets) {
    const parent = path.dirname(t);
    if (fs.existsSync(parent)) {
      fs.writeFileSync(t, buf);
      console.log(`[Image] Synced locally to ${t}`);
    }
  }
}

// 1. Sync to local SQLite
function saveArticleSQLite() {
  return new Promise((resolve, reject) => {
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
          console.log(`[SQLite News] Article exists (ID: ${row.id}). Updating...`);
          const stmt = db.prepare(`
            UPDATE news SET 
              title = ?, subtitle = ?, category = ?, author_name = ?, author_avatar = ?, date_published = ?,
              read_time_mins = ?, content_body = ?, pull_quote = ?, tags = ?, image_url = ?,
              focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?
            WHERE id = ?
          `);
          stmt.run([
            title, subtitle, category, author_name, author_avatar, date_published,
            read_time_mins, content_body, pull_quote, JSON.stringify(tags), image_url,
            focus_keyword, meta_title, meta_description, slug, schema_markup, row.id
          ], function(uErr) {
            stmt.finalize();
            db.close();
            if (uErr) reject(uErr);
            else {
              console.log(`[SQLite News] Updated successfully!`);
              resolve(row.id);
            }
          });
        } else {
          console.log(`[SQLite News] Inserting new article...`);
          const stmt = db.prepare(`
            INSERT INTO news (
              title, subtitle, category, author_name, author_avatar, date_published,
              read_time_mins, content_body, pull_quote, tags, image_url,
              focus_keyword, meta_title, meta_description, slug, schema_markup
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run([
            title, subtitle, category, author_name, author_avatar, date_published,
            read_time_mins, content_body, pull_quote, JSON.stringify(tags), image_url,
            focus_keyword, meta_title, meta_description, slug, schema_markup
          ], function(iErr) {
            const newId = this.lastID;
            stmt.finalize();
            db.close();
            if (iErr) reject(iErr);
            else {
              console.log(`[SQLite News] Inserted successfully with ID: ${newId}`);
              resolve(newId);
            }
          });
        }
      });
    });
  });
}

// 2. Sync to Live API
async function saveArticleLiveApi() {
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
      console.log(`[Live API News] Updating existing article ID: ${existing.id}...`);
      const res = await fetch(`https://privatesector.ch/api/news/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      console.log('[Live API News] Update Result:', result);
      return existing.id;
    } else {
      console.log(`[Live API News] Creating new article...`);
      const res = await fetch(`https://privatesector.ch/api/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      console.log('[Live API News] Create Result:', result);
      return result.id || (result.article && result.article.id);
    }
  } catch (err) {
    console.error('[Live API News] Error saving article:', err.message);
  }
}

async function main() {
  console.log('=== Publishing Kuehne+Nagel / Amazon / CATL Article ===\n');

  syncLocalImages();

  const localId = await saveArticleSQLite();
  const liveId = await saveArticleLiveApi();

  console.log(`\nLocal SQLite ID: ${localId}`);
  console.log(`Live API ID: ${liveId}`);

  console.log('\n=== Verifying Live Endpoints ===');
  const newsRes = await fetch(`https://privatesector.ch/api/news/${slug}`);
  console.log(`News Article API (${slug}): status ${newsRes.status}`);
  if (newsRes.ok) {
    const data = await newsRes.json();
    console.log('✅ Title verified on Live API:', data.article?.title);
    console.log('✅ Image URL:', data.article?.image_url);
    console.log('✅ Body excerpt (first 250 chars):\n', data.article?.content_body?.slice(0, 250));
  } else {
    console.error('❌ Failed to fetch live article!');
  }

  const imgRes = await fetch(`https://privatesector.ch${image_url}`);
  console.log(`Image URL (${image_url}): status ${imgRes.status}, type: ${imgRes.headers.get('content-type')}`);
  if (imgRes.status === 200) {
    console.log('✅ Image verified HTTP 200 on live server!');
  } else {
    console.error('❌ Image failed on live server!');
  }

  console.log('\n=== Publication Process Complete ===');
}

main().catch(console.error);
