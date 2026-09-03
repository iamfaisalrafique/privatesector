import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');

const id = 34;
const title = "AI Needs Power — Vertiv Is Paying Up to $2.6 Billion to Get It Faster";
const subtitle = "America’s AI boom is creating a new problem: electricity.";
const category = "Energy & Infrastructure";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-09-03";
const read_time_mins = 2;
const pull_quote = "The next AI bottleneck may not only be computing power. It may be electrical power.";
const tags = [
  "Artificial Intelligence",
  "AI",
  "Data Centers",
  "Energy",
  "Infrastructure",
  "Power Grid",
  "Vertiv",
  "UIG",
  "Switzerland",
  "United States"
];
const focus_keyword = "Vertiv UIG acquisition AI data center power microgrids Swiss industrial opportunity";
const meta_title = "AI Needs Power — Vertiv Is Paying Up to $2.6 Billion to Get It Faster — PrivateSector";
const meta_description = "Vertiv agrees to acquire UtilityInnovation Group for up to $2.6B to help AI data centers secure power faster. Discover what this means for Swiss grid and cooling leaders.";
const slug = "ai-needs-power-vertiv-is-paying-up-to-2-6-billion-to-get-it-faster";
const image_url = "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=1200";

const content_body = `USA INSIGHT 🇺🇸 ↔ 🇨🇭 ◆ 3 SEPTEMBER 2026 ◆ 2 MIN READ ◆ ARTIFICIAL INTELLIGENCE ◆ ENERGY & INFRASTRUCTURE ◆ DATA CENTERS

America’s AI boom is creating a new problem: **electricity**.

Vertiv has agreed to acquire UtilityInnovation Group (UIG) for approximately **$1.45 billion upfront**, with up to another **$1.15 billion** if agreed performance targets are reached, representing a potential total value of **$2.6 billion**.

UIG specializes in power infrastructure that can help data centers secure and manage electricity, including microgrids and advanced power-control systems.

But the bigger story is not simply the acquisition. As AI data centers expand, getting enough electricity — and getting it quickly — is becoming a major business challenge.

---

## 🔎 The Questions

- **Who is buying?** Vertiv, a U.S. company specializing in power, cooling and critical infrastructure for data centers.
- **Who is being bought?** UtilityInnovation Group, a North Carolina company specializing in microgrids and advanced power systems.
- **How much?** Approximately **$1.45 billion upfront**, potentially rising to **$2.6 billion** if performance targets are reached.
- **Why is Vertiv buying?** To strengthen its ability to help AI data centers obtain and manage the electricity they need.
- **Why is UIG selling?** No detailed financial reason has been publicly disclosed. UIG has emphasized the strategic fit with Vertiv.
- **What is Vertiv really buying?** Technology and expertise that could help data centers secure reliable power faster.

---

## 🇨🇭 Why Should Switzerland Care?

AI investment is moving beyond chips and software into **electricity, grids, cooling, automation and energy infrastructure**.

Switzerland has industrial expertise in several of these areas.

That creates an important question:
**How much of America’s AI infrastructure boom could Swiss industry capture?**

---

## 💡 PrivateSector View

This potential **$2.6 billion deal** tells us something bigger about where AI investment is heading.

The next AI bottleneck may not only be computing power — **it may be electrical power**.

---

Source: Vertiv — Original acquisition announcement | Reuters — Independent reporting`;

const schema_markup = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": title,
  "description": meta_description,
  "image": image_url,
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

// 1. Update SQLite local DB
function updateSQLite() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
    });

    db.serialize(() => {
      db.get('SELECT id FROM news WHERE id = ? OR slug = ?', [id, slug], (err, row) => {
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
              console.log(`[SQLite] Updated successfully!`);
              resolve(row.id);
            }
          });
        } else {
          console.log(`[SQLite] Inserting into local DB...`);
          const stmt = db.prepare(`
            INSERT INTO news (
              id, title, subtitle, category, author_name, author_avatar, date_published, 
              read_time_mins, content_body, pull_quote, tags, image_url, 
              focus_keyword, meta_title, meta_description, slug, schema_markup
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run([
            id, title, subtitle, category, author_name, author_avatar, date_published,
            read_time_mins, content_body, pull_quote, JSON.stringify(tags), image_url,
            focus_keyword, meta_title, meta_description, slug, schema_markup
          ], function(iErr) {
            stmt.finalize();
            db.close();
            if (iErr) reject(iErr);
            else {
              console.log(`[SQLite] Inserted successfully!`);
              resolve(id);
            }
          });
        }
      });
    });
  });
}

// 2. Update Live API
async function updateLiveApi() {
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
    console.log(`[Live API] Updating article ${id} via PUT https://privatesector.ch/api/news/${id}...`);
    const res = await fetch(`https://privatesector.ch/api/news/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    console.log('[Live API] Result:', result);
  } catch (err) {
    console.error('[Live API] Error updating article:', err.message);
  }
}

async function main() {
  console.log('=== Updating Vertiv Article ===');
  await updateSQLite();
  await updateLiveApi();
  console.log('=== Done! ===');
}

main().catch(console.error);
