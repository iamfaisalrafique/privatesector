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

const baseName = 'under_the_radar_trial_failed_investors_put_66_million_abcuro_ulviprubart';

async function uploadImage() {
  const filePath = path.join(publicUploadsDir, `${baseName}.jpg`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Source image not found at ${filePath}`);
  }

  const fileBuf = fs.readFileSync(filePath);
  const b64 = 'data:image/jpeg;base64,' + fileBuf.toString('base64');
  
  // Ensure local copies
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

const article = {
  baseName: baseName,
  title: "UNDER THE RADAR: The Trial Failed — Investors Still Put $66 Million Into Abcuro",
  subtitle: "Massachusetts-based Abcuro raised $66M after a Phase 2/3 trial missed its primary endpoint for ulviprubart in inclusion body myositis. How a 50% slowing signal in less severe patients earned a high-risk second chance, and why Roche & Novartis watch.",
  category: "Biotechnology",
  author_name: "PrivateSector Intelligence",
  author_avatar: "https://i.pravatar.cc/100?img=33",
  date_published: "2026-08-20",
  read_time_mins: 3,
  pull_quote: "Investors aren't putting $66 million behind a successful trial. They're putting $66 million behind the possibility that the first trial didn't tell the whole story. That's what makes Abcuro interesting.",
  tags: [
    "Abcuro",
    "Ulviprubart",
    "KLRG1",
    "Inclusion Body Myositis",
    "IBM",
    "Biotechnology",
    "Clinical Trials",
    "Phase 2/3",
    "Venture Capital",
    "Series D",
    "Roche",
    "Novartis",
    "Switzerland",
    "United States",
    "Massachusetts",
    "High Risk Biotech"
  ],
  focus_keyword: "Abcuro ulviprubart inclusion body myositis 66 million trial failed KLRG1 Roche Novartis Swiss biotech",
  meta_title: "The Trial Failed — Investors Still Put $66M Into Abcuro — PrivateSector",
  meta_description: "Abcuro raises $66M after missing Phase 2/3 primary endpoints for ulviprubart in inclusion body myositis. Discover why a 50% signal earned a second shot and why Swiss pharma watches.",
  slug: "under-the-radar-trial-failed-investors-put-66-million-into-abcuro-ulviprubart",
  content_body: `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 20 AUGUST 2026 ◆ 3 MIN READ ◆ BIOTECHNOLOGY ◆ CLINICAL TRIALS ◆ VENTURE CAPITAL ◆ HIGH RISK

This is an unusual biotech story.

Massachusetts-based **Abcuro** tested its experimental medicine **ulviprubart** in a Phase 2/3 study for **inclusion body myositis (IBM)**.

The study did not meet its main endpoints.

Normally, that is the kind of headline that closes laboratories, craters valuations, and scares investors away.

**But then something unexpected happened: investors put another $66 million into the company.**

---

## WHY DID INVESTORS WRITE A $66M CHECK?

**SIGNAL IN LESS SEVERE DISEASE ◆ ~50% SLOWING OF PROGRESSION ◆ TARGET: KLRG1**

Why would venture capital double down after missing a primary trial endpoint?

Abcuro reports that researchers discovered an interesting clinical signal in a **prespecified subgroup of patients with less severe disease**.

In that cohort:
- **Efficacy Signal:** The company reported approximately a **50% slowing of disease progression** across both dosing levels.
- **Biological Target:** Ulviprubart specifically targets **KLRG1** (killer cell lectin-like receptor G1) to deplete pathogenic effector memory T cells and NK cells driving autoimmune muscle destruction.
- **The Pivot:** Instead of abandoning the molecule, Abcuro secured a **$66M Series D** to design and execute a newly focused, potentially registrational clinical study expected in **Q4 2026**.

In short: investors believe the medicine works — if administered to the right patient segment before severe, irreversible muscle damage takes hold.

---

## 🇨🇭 WHY WE'RE WATCHING FROM SWITZERLAND

**ROCHE ◆ NOVARTIS ◆ BASEL PHARMA CLUSTER ◆ GLOBAL ASSET SCOUTING**

There is no announced deal between Abcuro and Swiss pharmaceutical giants such as **Roche** or **Novartis** — yet.

However, Basel's pharmaceutical scouting teams constantly scour the global biotech landscape for promising scientific mechanisms in rare diseases and autoimmune disorders.

In biotechnology:
- **Today:** Mixed or ambiguous trial data creates valuation discounts and heightened perceived risk.
- **Tomorrow:** If the upcoming focused clinical study replicates that 50% slowing signal with statistical rigor, Abcuro could transform overnight into a prime **licensing, partnership, or transatlantic acquisition candidate**.

Swiss companies possess the capital, regulatory muscle, and global commercial infrastructure to turn late-stage rare disease assets into standard-of-care treatments.

---

## 🔎 PRIVATESECTOR VIEW

**BACKING THE POSSIBILITY ◆ ASYMMETRIC BIOTECH RISK**

Investors aren't putting $66 million behind a successful trial.

**They're putting $66 million behind the possibility that the first trial didn't tell the whole story.**

That distinction is what makes early-to-mid stage biotechnology so uniquely compelling. The risk profile is undeniably elevated, but so is the potential asymmetry if the target subpopulation validates the underlying biology.

---

## PRIVATESECTOR INTELLIGENCE CARD

**ABCURO BIOSCIENCES ◆ ULVIPRUBART (ANTI-KLRG1) ◆ INCLUSION BODY MYOSITIS**

- 🏢 **Company:** Abcuro Biosciences (Newton, Massachusetts 🇺🇸)
- 💊 **Drug Candidate:** Ulviprubart
- 🎯 **Mechanism of Action:** Anti-KLRG1 monoclonal antibody
- 🔬 **Condition:** Inclusion Body Myositis (IBM) — Rare autoimmune muscle-wasting disease
- 📊 **Trial Status:** Missed primary endpoint overall; demonstrated ~50% progression slowing in less severe subgroup
- 💰 **New Financing:** $66 Million Series D
- 📅 **Next Catalyst:** New focused study planned for Q4 2026
- 🇨🇭 **Swiss Relevance:** Roche & Novartis rare disease pipelines ★ External innovation scouting ★ Licensing potential
- 🌐 **Official Links:** [Abcuro](https://abcuro.com/) | [Roche](https://www.roche.com/) | [Novartis](https://www.novartis.com/)

---

## PRIVATESECTOR INTELLIGENCE SCORE

**8.8/10 — HIGH RISK / HIGH REWARD ⚠️**

- **Scientific Rationale:** ★★★★☆
- **Clinical Evidence to Date:** ★★★☆☆ (Mixed / Subgroup only)
- **Investor Conviction ($66M):** ★★★★★
- **Swiss Strategic Relevance:** ★★★★☆
- **Risk Profile:** **HIGH** 🔴

**Bottom Line:**
The medicine may still fail. Subgroup analyses in failed clinical trials are notoriously fraught with risk.

**But $66 million says serious biotech investors believe the question is worth asking again.**

Abcuro officially goes onto the **PrivateSector Radar watchlist**.

---

*Source: Abcuro corporate disclosures & clinical trial releases (Aug 18, 2026). Ulviprubart is an investigational agent and is not approved by regulatory authorities.*`
};

// SQLite Updater
async function updateSQLite(imgUrl, schemaMarkup) {
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
async function updateLivePostgres(imgUrl, schemaMarkup) {
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
async function postToLiveApi(imgUrl, schemaMarkup) {
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
  console.log('PUBLISHING ABCURO BIOTECH RADAR ARTICLE (AUGUST 20, 2026)');
  console.log('===============================================================\n');

  // 1. Upload feature image
  const imgUrl = await uploadImage();
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
  await updateSQLite(imgUrl, schemaMarkup);

  // 4. Postgres
  await updateLivePostgres(imgUrl, schemaMarkup);

  // 5. Live API
  await postToLiveApi(imgUrl, schemaMarkup);

  console.log('\n===============================================================');
  console.log('VERIFYING LIVE PLATFORM...');
  console.log('===============================================================\n');

  try {
    const verifyRes = await fetch('https://privatesector.ch/api/news');
    const allLive = await verifyRes.json();
    console.log(`Total live articles count: ${allLive.length}`);
    const found = allLive.find(a => a.slug === article.slug || a.title === article.title);
    if (found) {
      console.log(`[VERIFIED LIVE] ID: ${found.id} | Slug: ${found.slug} | Image: ${found.image_url}`);
    } else {
      console.warn(`[NOT FOUND IN LIVE API] ${article.slug}`);
    }
  } catch (e) {
    console.error('Verification error:', e.message);
  }
}

main().catch(console.error);
