import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localUploadsDir = path.resolve(__dirname, 'server', 'uploads');
const publicUploadsDir = path.resolve(__dirname, 'public', 'uploads');
const distUploadsDir = path.resolve(__dirname, 'dist', 'uploads');
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');

if (!fs.existsSync(localUploadsDir)) fs.mkdirSync(localUploadsDir, { recursive: true });
if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });
if (fs.existsSync(path.resolve(__dirname, 'dist')) && !fs.existsSync(distUploadsDir)) {
  fs.mkdirSync(distUploadsDir, { recursive: true });
}

async function uploadImage(baseName) {
  const filePath = path.join(publicUploadsDir, `${baseName}.jpg`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Source image not found at ${filePath}`);
  }

  const fileBuf = fs.readFileSync(filePath);
  const b64 = 'data:image/jpeg;base64,' + fileBuf.toString('base64');
  
  // Ensure copies
  fs.writeFileSync(path.join(localUploadsDir, `${baseName}.jpg`), fileBuf);
  fs.writeFileSync(path.join(publicUploadsDir, `${baseName}.jpg`), fileBuf);
  if (fs.existsSync(distUploadsDir)) {
    fs.writeFileSync(path.join(distUploadsDir, `${baseName}.jpg`), fileBuf);
  }
  console.log(`[Local Upload] Verified local image copies as ${baseName}.jpg`);

  // Upload to live site
  try {
    console.log(`[Upload] Uploading ${baseName} to live API (https://privatesector.ch/api/upload)...`);
    const res = await fetch('https://privatesector.ch/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: b64, filename: baseName })
    });
    const data = await res.json();
    console.log(`[Upload] Result for ${baseName}:`, data);
    if (data && data.url) {
      return data.url;
    }
  } catch (err) {
    console.error(`[Upload] Error uploading to live server:`, err.message);
  }

  return `/uploads/${baseName}.jpg`;
}

const articlesData = [
  // ARTICLE 1: MODERNA + MERCK PERSONALIZED CANCER TREATMENT
  {
    baseName: 'moderna_merck_personalized_cancer_treatment_intismeran_autogene',
    title: "Moderna + Merck: Is Personalized Cancer Treatment Getting Closer?",
    subtitle: "Moderna and Merck report positive Phase 3 INTerpath-001 results for individualized mRNA therapy intismeran autogene combined with Keytruda in high-risk melanoma. Why Switzerland's pharma ecosystem and Roche are watching.",
    category: "Biotechnology",
    author_name: "PrivateSector Intelligence",
    author_avatar: "https://i.pravatar.cc/100?img=33",
    date_published: "2026-08-20",
    read_time_mins: 3,
    pull_quote: "If personalized cancer treatment becomes widely used, the opportunity could become much bigger than the medicine itself. Sequencing, diagnostics, AI, laboratory technology, manufacturing and specialized logistics could all benefit. Switzerland is strong in many of these areas.",
    tags: [
      "Moderna",
      "Merck",
      "Roche",
      "Intismeran Autogene",
      "Keytruda",
      "Melanoma",
      "mRNA",
      "Personalized Medicine",
      "Cancer Vaccines",
      "Phase 3 INTerpath-001",
      "Oncology",
      "Biotechnology",
      "Switzerland",
      "United States",
      "Basel"
    ],
    focus_keyword: "Moderna Merck personalized cancer treatment intismeran autogene Keytruda Phase 3 Roche mRNA Switzerland",
    meta_title: "Moderna + Merck: Is Personalized Cancer Treatment Getting Closer? — PrivateSector",
    meta_description: "Moderna & Merck report positive Phase 3 results for individualized mRNA cancer therapy intismeran autogene with Keytruda. Discover why Switzerland and Roche are watching.",
    slug: "moderna-merck-personalized-cancer-treatment-intismeran-autogene-melanoma-roche",
    content_body: `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 20 AUGUST 2026 ◆ 3 MIN READ ◆ BIOTECHNOLOGY ◆ ONCOLOGY ◆ mRNA ◆ PERSONALIZED MEDICINE

Imagine a cancer treatment designed around your own tumor.

Moderna and Merck have moved that idea another important step forward.

Their individualized mRNA therapy, **intismeran autogene**, combined with **Keytruda**, delivered positive Phase 3 results in patients with high-risk melanoma after surgery.

The study met both of its main endpoints.

---

## WHAT MAKES IT DIFFERENT?

**TUMOR ANALYSIS ◆ MUTATION IDENTIFICATION ◆ INDIVIDUALIZED mRNA DESIGN**

Traditional cancer therapies are often built around general tumor classifications: one standardized medicine for thousands of patients.

Individualized mRNA oncology takes the opposite approach:

1. **Tumor Biopsy & Sequencing:** Doctors analyze a patient's surgically resected tumor and identify its unique genetic mutations.
2. **Computational Design:** That information is synthesized to design a patient-specific mRNA sequence targeting unique neoantigens.
3. **Personalized mRNA Therapy:** The customized therapy is manufactured and administered to train the patient's immune system to recognize and attack residual cancer cells.

In simple words: **different patient, different tumor, personalized treatment.**

---

## 🇨🇭 WHY SWITZERLAND SHOULD WATCH

**ROCHE ◆ BASEL BIOTECH ECOSYSTEM ◆ INDIVIDUALIZED CANCER VACCINE TECHNOLOGY**

Roche is already developing its own individually tailored mRNA cancer-vaccine technology and next-generation immunotherapy platforms.

So this is not simply exciting news from America.

It is a direct technology signal for **Basel and Switzerland's pharmaceutical industry**.

When global titans like Moderna and Merck validate Phase 3 efficacy for personalized mRNA in oncology, it proves that individualized manufacturing and regulatory pathways are viable at scale.

---

## THE BIGGER PICTURE: A NEW HEALTHCARE ECOSYSTEM

**BEYOND THE DRUG ◆ 6 STRATEGIC PILLARS**

If personalized cancer treatment grows, the opportunity will not stop with the pharmaceutical compound itself. An entirely new infrastructure becomes essential:

- 🧬 **Sequencing:** High-throughput genomic sequencing of patient biopsies.
- 🔬 **Diagnostics:** Ultra-sensitive companion diagnostic tools and liquid biopsy monitoring.
- 🧠 **AI & Data:** Algorithmic neoantigen prediction and bioinformatics pipelines.
- ⚙️ **Manufacturing:** Rapid-turnaround, decentralized, sterile mRNA batch production.
- 🚚 **Logistics:** Temperature-controlled, time-critical "vein-to-vein" cold-chain delivery.
- 🏥 **Clinical Infrastructure:** Specialized oncology centers capable of administering individualized regimens.

---

## 🔎 PRIVATESECTOR VIEW

**THE ADJACENT OPPORTUNITY ◆ SWISS COMPETITIVE ADVANTAGE**

If personalized cancer treatment becomes widely used, the opportunity could become **much bigger than the medicine itself**.

Sequencing, diagnostics, AI, laboratory technology, manufacturing and specialized logistics could all benefit.

Switzerland is exceptionally strong in many of these areas:
- **Global diagnostic dominance** (Roche Diagnostics)
- **Advanced laboratory automation & fluidics** (Tecan, Hamilton)
- **Precision manufacturing and specialized pharmaceutical logistics**

The strategic play for Swiss industry is to supply and power the infrastructure that makes personalized medicine possible worldwide.

---

## PRIVATESECTOR INTELLIGENCE CARD

**MODERNA & MERCK ◆ INTISMERAN AUTOGENE + KEYTRUDA ◆ PHASE 3 INTERPATH-001**

- 🏢 **Companies:** Moderna, Inc. & Merck & Co., Inc. (United States 🇺🇸)
- 💊 **Therapy:** Intismeran Autogene (Individualized Neoantigen mRNA) + Keytruda (pembrolizumab)
- 🔬 **Trial:** Phase 3 INTerpath-001
- 📊 **Key Outcome:** Met both primary endpoints in adjuvant high-risk melanoma post-surgery
- 🎯 **Mechanism:** Tumor mutation identification ➔ Custom mRNA neoantigen vaccine
- 🇨🇭 **Swiss Relevance:** Roche personalized mRNA programs ★ Basel pharma cluster ★ Diagnostics & AI supply chain
- 🌐 **Official Links:** [Moderna](https://www.modernatx.com/) | [Merck](https://www.merck.com/) | [Roche](https://www.roche.com/)

---

## PRIVATESECTOR INTELLIGENCE SCORE

**9.8/10 — TOP SIGNAL 🔴**

- **Clinical Breakthrough:** ★★★★★
- **Technological Innovation:** ★★★★★
- **Swiss Pharma & Ecosystem Relevance:** ★★★★★
- **Market & Supply Chain Impact:** ★★★★★
- **Long-term Strategic Significance:** ★★★★★

**Bottom Line:**
Personalized cancer medicine is moving closer to reality. Moderna and Merck are pushing forward in America. Roche is already in the race from Switzerland.

This could become one of the most interesting pharmaceutical competitions to watch.

---

*Disclaimer: Intismeran autogene remains investigational and is not yet an approved personalized melanoma therapy. Always refer to official regulatory filings and company clinical disclosures.*`
  },

  // ARTICLE 2: ROCHE HOLLY SPRINGS $2 BILLION + YPSOMED
  {
    baseName: 'roche_genentech_ypsomed_holly_springs_north_carolina',
    title: "Roche Is Putting $2 Billion Into One American Town — Then Another Swiss Company Arrived",
    subtitle: "Roche-owned Genentech is investing ~$2 billion in an East Coast manufacturing hub in Holly Springs, NC, while Swiss injection-systems specialist Ypsomed invests ~CHF 200M. How a small American town is becoming a powerhouse Swiss pharma cluster.",
    category: "Pharmaceuticals",
    author_name: "PrivateSector Intelligence",
    author_avatar: "https://i.pravatar.cc/100?img=33",
    date_published: "2026-08-20",
    read_time_mins: 3,
    pull_quote: "Don't only watch Roche's $2 billion. Watch what grows around it. Pharmaceutical factories need automation, machinery, packaging, clean-room technology, engineering, logistics, software and specialist suppliers. Swiss companies are strong in many of these fields. The opportunity may be to follow Swiss customers into America.",
    tags: [
      "Roche",
      "Genentech",
      "Ypsomed",
      "Holly Springs",
      "North Carolina",
      "Pharmaceuticals",
      "Advanced Manufacturing",
      "Injection Systems",
      "Medtech",
      "Switzerland",
      "United States",
      "Supply Chain",
      "Metabolic Therapies",
      "FDI"
    ],
    focus_keyword: "Roche Genentech Holly Springs North Carolina 2 billion Ypsomed 200 million Swiss pharmaceutical manufacturing",
    meta_title: "Roche Puts $2B Into Holly Springs, NC — Then Ypsomed Arrived — PrivateSector",
    meta_description: "Roche/Genentech invests $2B and Ypsomed invests CHF 200M in Holly Springs, North Carolina. Discover how this small American town is becoming a powerhouse Swiss pharma cluster.",
    slug: "roche-putting-2-billion-holly-springs-ypsomed-swiss-pharma-cluster",
    content_body: `SWISS EXPANSION 🇨🇭 ➔ 🇺🇸 ◆ 20 AUGUST 2026 ◆ 3 MIN READ ◆ PHARMACEUTICALS ◆ ADVANCED MANUFACTURING ◆ SUPPLY CHAIN

Remember this name: **Holly Springs, North Carolina**.

Roche-owned **Genentech** is building an approximately **$2 billion** pharmaceutical manufacturing facility there.

It is expected to:
- Become Genentech's **first East Coast manufacturing site**
- Create more than **500 permanent jobs**
- Support more than **1,500 construction jobs**
- Begin commercial operations around **2029** (producing next-generation medicines including metabolic therapies)

---

## THEN ANOTHER SWISS COMPANY ARRIVED: YPSOMED

**CHF 200 MILLION ◆ FIRST U.S. MANUFACTURING SITE ◆ SELFCARE SOLUTIONS**

This is where the story becomes even more interesting.

Another Swiss company is going to Holly Springs: **Ypsomed**.

The Burgdorf-based injection-systems specialist plans around **CHF 200 million** of first-phase investment for its first U.S. manufacturing facility.

Look at the combination:
- **Roche / Genentech** ➔ Advanced medicines & biologics
- **Ypsomed** ➔ Precision auto-injectors & delivery systems
- **Holly Springs** ➔ Advanced transatlantic manufacturing hub

Suddenly, a relatively small American town starts looking like an integrated **Swiss-American pharmaceutical cluster**.

---

## THE SUPPLY CHAIN MULTIPLIER

**AUTOMATION ◆ CLEAN-ROOMS ◆ PACKAGING ◆ SPECIALIST SUPPLIERS**

Why does this matter for the broader Swiss business ecosystem?

Because pharmaceutical mega-factories do not operate in isolation. They require an expansive network of tier-1 and tier-2 suppliers:

- 🤖 **Automation & Robotics:** High-precision robotics for aseptic filling and vial handling (Stäubli, ABB).
- 🔬 **Clean-Room & Facility Engineering:** High-containment ventilation and sterile environments.
- 📦 **Specialized Packaging & Inspection:** Optical inspection and cold-chain primary packaging (Körber/Swiss divisions, Bosch/Syntegon).
- 🧪 **Process Analytics & Laboratory Software:** Real-time batch release and quality assurance monitoring.
- 🚚 **Specialized Logistics:** Ultra-low temperature transport and secure transatlantic distribution.

---

## 🔎 PRIVATESECTOR VIEW

**FOLLOWING SWISS CUSTOMERS INTO AMERICA ◆ AN INDUSTRIAL ROADMAP**

Don't only watch Roche's $2 billion. **Watch what grows around it.**

Pharmaceutical factories need automation, machinery, packaging, clean-room technology, engineering, logistics, software and specialist suppliers.

Swiss companies are globally renowned leaders in many of these fields.

The major commercial opportunity for Swiss SMEs, engineering houses, and equipment makers may be to **follow their Swiss corporate customers directly into America**.

When Basel and Burgdorf invest billions in North Carolina, they create an immediate, trusted gateway for Swiss precision suppliers.

---

## PRIVATESECTOR INTELLIGENCE CARD

**HOLLY SPRINGS, NORTH CAROLINA ◆ ROCHE / GENENTECH & YPSOMED EXPANSION**

- 🏢 **Anchor 1:** Roche / Genentech (~$2 Billion Manufacturing Facility)
- 🏢 **Anchor 2:** Ypsomed (~CHF 200 Million Injection Systems Facility)
- 📍 **Location:** Holly Springs, North Carolina (United States 🇺🇸)
- 👷 **Employment:** 500+ permanent high-tech jobs | 1,500+ construction jobs
- 📅 **Timeline:** Operational target around 2029
- 💊 **Focus:** Next-generation biologics, metabolic therapies, and advanced auto-injector systems
- 🇨🇭 **Swiss Relevance:** Transatlantic FDI ★ Supply Chain ★ Industrial Automation ★ Medical Technology
- 🌐 **Official Links:** [Roche](https://www.roche.com/) | [Genentech](https://www.gene.com/) | [Ypsomed](https://www.ypsomed.com/)

---

## PRIVATESECTOR INTELLIGENCE SCORE

**9.6/10 — TOP SIGNAL 🔴**

- **Capital Commitment:** ★★★★★
- **Cluster Synergy:** ★★★★★
- **Swiss Supply Chain Upside:** ★★★★★
- **Transatlantic Trade Strategic Fit:** ★★★★★
- **Execution Viability:** ★★★★★

**Bottom Line:**
Roche is there. Ypsomed is coming.

Now our question is simple: **Which Swiss company will be next?** →

---

*Source: Roche, Genentech, and Ypsomed corporate announcements regarding North Carolina capital investments and manufacturing site developments.*`
  }
];

// SQLite Updater
async function updateSQLite(article, imgUrl, schemaMarkup) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);

      db.get('SELECT id FROM news WHERE slug = ? OR title = ?', [article.slug, article.title], (sErr, row) => {
        if (sErr) {
          db.close();
          return reject(sErr);
        }

        if (row && row.id) {
          console.log(`[SQLite] Article exists (ID: ${row.id}). Updating: ${article.title}`);
          const sql = `
            UPDATE news SET 
              subtitle = ?, category = ?, author_name = ?, author_avatar = ?, date_published = ?,
              read_time_mins = ?, content_body = ?, pull_quote = ?, tags = ?, image_url = ?,
              focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?
            WHERE id = ?
          `;
          db.run(sql, [
            article.subtitle, article.category, article.author_name, article.author_avatar, article.date_published,
            article.read_time_mins, article.content_body, article.pull_quote, JSON.stringify(article.tags), imgUrl,
            article.focus_keyword, article.meta_title, article.meta_description, article.slug, schemaMarkup, row.id
          ], function (uErr) {
            db.close();
            if (uErr) reject(uErr);
            else {
              console.log(`[SQLite] Updated successfully ID: ${row.id}`);
              resolve(row.id);
            }
          });
        } else {
          console.log(`[SQLite] Inserting new article: ${article.title}`);
          const sql = `
            INSERT INTO news (
              title, subtitle, category, author_name, author_avatar, date_published, 
              read_time_mins, content_body, pull_quote, tags, image_url, 
              focus_keyword, meta_title, meta_description, slug, schema_markup
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const stmt = db.prepare(sql);
          stmt.run([
            article.title, article.subtitle, article.category, article.author_name, article.author_avatar, article.date_published,
            article.read_time_mins, article.content_body, article.pull_quote, JSON.stringify(article.tags), imgUrl,
            article.focus_keyword, article.meta_title, article.meta_description, article.slug, schemaMarkup
          ], function (iErr) {
            const id = this.lastID;
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

// Live Postgres Updater
async function updateLivePostgres(article, imgUrl, schemaMarkup) {
  const connectionString = "postgres://postgres:edcKM0253QrFib0sSl2JYZoj5If8DxbKVxgzmsBpQVI5HBHyQ9UBZ6gMi79z0AFD@62.72.44.254:1127/postgres";
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const resCheck = await client.query('SELECT id FROM news WHERE slug = $1 OR title = $2', [article.slug, article.title]);

    if (resCheck.rows.length > 0) {
      const id = resCheck.rows[0].id;
      console.log(`[Postgres] Article exists (ID: ${id}). Updating: ${article.title}`);
      await client.query(`
        UPDATE news SET 
          subtitle = $1, category = $2, author_name = $3, author_avatar = $4, date_published = $5,
          read_time_mins = $6, content_body = $7, pull_quote = $8, tags = $9, image_url = $10,
          focus_keyword = $11, meta_title = $12, meta_description = $13, slug = $14, schema_markup = $15
        WHERE id = $16
      `, [
        article.subtitle, article.category, article.author_name, article.author_avatar, article.date_published,
        article.read_time_mins, article.content_body, article.pull_quote, JSON.stringify(article.tags), imgUrl,
        article.focus_keyword, article.meta_title, article.meta_description, article.slug, schemaMarkup, id
      ]);
      console.log(`[Postgres] Article ID ${id} updated successfully!`);
    } else {
      console.log(`[Postgres] Inserting article: ${article.title}`);
      const resIns = await client.query(`
        INSERT INTO news (
          title, subtitle, category, author_name, author_avatar, date_published, 
          read_time_mins, content_body, pull_quote, tags, image_url, 
          focus_keyword, meta_title, meta_description, slug, schema_markup
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id
      `, [
        article.title, article.subtitle, article.category, article.author_name, article.author_avatar, article.date_published,
        article.read_time_mins, article.content_body, article.pull_quote, JSON.stringify(article.tags), imgUrl,
        article.focus_keyword, article.meta_title, article.meta_description, article.slug, schemaMarkup
      ]);
      console.log(`[Postgres] Article inserted successfully with ID: ${resIns.rows[0].id}`);
    }
  } catch (err) {
    console.error(`[Postgres] Error publishing ${article.slug}:`, err.message);
  } finally {
    await client.end();
  }
}

// Live API Poster
async function postToLiveApi(article, imgUrl, schemaMarkup) {
  try {
    const getRes = await fetch('https://privatesector.ch/api/news');
    const existingList = await getRes.json();
    const existing = Array.isArray(existingList) ? existingList.find(a => a.slug === article.slug || a.title === article.title) : null;

    const payload = {
      title: article.title,
      subtitle: article.subtitle,
      category: article.category,
      author_name: article.author_name,
      author_avatar: article.author_avatar,
      date_published: article.date_published,
      read_time_mins: article.read_time_mins,
      content_body: article.content_body,
      pull_quote: article.pull_quote,
      tags: article.tags,
      image_url: imgUrl,
      focus_keyword: article.focus_keyword,
      meta_title: article.meta_title,
      meta_description: article.meta_description,
      slug: article.slug,
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
      console.log(`[Live API] Update response for ${article.slug}:`, data.id || data);
    } else {
      console.log(`[Live API] Inserting new article into https://privatesector.ch/api/news: ${article.slug}...`);
      const res = await fetch('https://privatesector.ch/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log(`[Live API] Insert response for ${article.slug}:`, data.id || data);
    }
  } catch (err) {
    console.error(`[Live API] Error posting ${article.slug}:`, err.message);
  }
}

async function main() {
  console.log('===============================================================');
  console.log('PUBLISHING 2 ARTICLES (AUGUST 20, 2026)');
  console.log('1. Moderna + Merck: Is Personalized Cancer Treatment Getting Closer?');
  console.log('2. Roche Is Putting $2 Billion Into One American Town — Then Another Swiss Company Arrived');
  console.log('===============================================================\n');

  for (let i = 0; i < articlesData.length; i++) {
    const article = articlesData[i];
    console.log(`\n---------------------------------------------------------------`);
    console.log(`[${i + 1}/${articlesData.length}] Processing: "${article.title}"`);
    console.log(`---------------------------------------------------------------`);

    // 1. Upload feature image
    const imgUrl = await uploadImage(article.baseName);
    console.log(`Feature Image URL: ${imgUrl}`);

    // 2. Generate Schema Markup
    const schemaMarkup = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "description": article.meta_description,
      "image": imgUrl.startsWith('http') ? imgUrl : `https://privatesector.ch${imgUrl}`,
      "datePublished": article.date_published,
      "dateModified": article.date_published,
      "inLanguage": "en",
      "mainEntityOfPage": `https://privatesector.ch/news/${article.slug}`,
      "keywords": `${article.focus_keyword}, ${article.tags.join(', ')}`,
      "articleSection": article.category,
      "author": {
        "@type": "Organization",
        "name": article.author_name,
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

    // 3. SQLite
    await updateSQLite(article, imgUrl, schemaMarkup);

    // 4. Postgres
    await updateLivePostgres(article, imgUrl, schemaMarkup);

    // 5. Live API
    await postToLiveApi(article, imgUrl, schemaMarkup);
  }

  console.log('\n===============================================================');
  console.log('ALL ARTICLES PROCESSED! VERIFYING LIVE PLATFORM...');
  console.log('===============================================================\n');

  try {
    const verifyRes = await fetch('https://privatesector.ch/api/news');
    const allLive = await verifyRes.json();
    console.log(`Total live articles count: ${allLive.length}`);
    articlesData.forEach(art => {
      const found = allLive.find(a => a.slug === art.slug || a.title === art.title);
      if (found) {
        console.log(`[VERIFIED LIVE] ID: ${found.id} | Slug: ${found.slug} | Image: ${found.image_url}`);
      } else {
        console.warn(`[NOT FOUND IN LIVE API] ${art.slug}`);
      }
    });
  } catch (e) {
    console.error('Verification error:', e.message);
  }
}

main().catch(console.error);
