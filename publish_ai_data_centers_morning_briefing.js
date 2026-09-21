import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');

// Article Details
const title = "America Wants More AI Data Centers — But Communities Are Pushing Back";
const subtitle = "America’s AI boom is creating a new infrastructure challenge: technology companies need more data centers, while opposition to some projects is growing in communities across the country.";
const category = "Energy & Infrastructure";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-09-08";
const read_time_mins = 4;
const pull_quote = "For Switzerland, one of the biggest opportunities from America’s AI boom may therefore be hiding one level below AI itself: Not building the intelligence — but helping America power it.";
const tags = [
  "Artificial Intelligence",
  "AI",
  "Energy & Infrastructure",
  "Data Centers",
  "Electricity Grid",
  "ABB",
  "Hitachi Energy",
  "Belimo",
  "Switzerland",
  "United States",
  "Morning Briefing"
];
const focus_keyword = "America AI data centers communities pushback ABB Hitachi Energy Belimo Swiss infrastructure";
const meta_title = "America Wants More AI Data Centers — But Communities Are Pushing Back — PrivateSector";
const meta_description = "America’s AI boom is creating a new infrastructure challenge as communities push back on data centers. What does this mean for ABB, Hitachi Energy, and Belimo?";
const slug = "america-wants-more-ai-data-centers-but-communities-are-pushing-back";
const image_url = "/uploads/america_wants_more_ai_data_centers_communities_pushing_back.jpg";

// 1000% exact word-by-word content formatted with clean Markdown headings and paragraph separation
const content_body = `America’s AI boom is creating a new infrastructure challenge: technology companies need more data centers, while opposition to some projects is growing in communities across the country.

Data centers are essential to modern AI because they house the servers and specialized chips needed to train and operate AI systems. But large facilities also require substantial electricity, grid connections and cooling infrastructure, creating concerns in some communities about power, water, noise and land use.

The Wall Street Journal reports that at least 15 states and more than 100 localities have taken steps involving restrictions or moratoriums on data-center development.

---

## 🇺🇸 What Is Happening?

First, major technology companies are investing heavily in computing infrastructure. AI requires enormous computing capacity, which means more servers, more data centers and substantially more electricity.

Second, some communities hosting or considering these projects are questioning the impact. Concerns include electricity demand, water consumption, noise, land use and whether the economic benefits justify the local costs.

Third, the debate is expanding beyond individual projects. Data-center development is increasingly becoming a wider discussion about America’s electricity infrastructure, local planning and how quickly the country can expand AI computing capacity.

---

## ⚔️ Who Wants Them — And Who Is Against Them?

On one side are major technology companies, data-center developers and supporters of rapid U.S. AI infrastructure expansion.

They argue that America needs substantially more computing capacity if it wants to remain a global leader in artificial intelligence.

On the other side are residents, community organizations, environmental advocates and some local and national political figures who are questioning individual projects or the speed of data-center expansion.

Their reasons are not always the same. Concerns can include electricity costs and availability, water use, noise, land development and pressure on existing infrastructure.

This is therefore becoming more than a technology story. It is increasingly an energy and infrastructure story.

---

## 🇨🇭 Why This Matters to Switzerland

The challenge could create opportunities for Swiss industry.

If America continues expanding AI computing capacity, it will also need enormous investment in the infrastructure underneath those data centers.

That includes transformers, substations, power distribution, cooling, automation and technologies that can improve energy efficiency.

Switzerland has significant industrial expertise in several of these areas.

---

## 🏢 Swiss Companies With Potential Exposure

ABB operates in electrification, power distribution and technologies used in data-center infrastructure.

Hitachi Energy, headquartered in Switzerland, supplies transformers, substations and grid technologies — equipment that becomes increasingly important as large electricity users connect to power networks.

Belimo specializes in HVAC controls and building automation, making its technology relevant to efficient cooling and building operation.

There is currently no confirmed evidence that ABB, Hitachi Energy or Belimo is involved in the specific projects or communities discussed in the latest U.S. reporting.

They are companies to watch because their technologies address parts of the broader infrastructure challenge created by expanding data-center capacity.

---

## 🔭 PrivateSector View

America’s AI boom is increasingly becoming an infrastructure challenge underneath AI.

The first wave of attention focused heavily on chips, AI models and software.

But as computing capacity expands, another market is becoming increasingly important: electricity, transformers, cooling, substations, grid connections and efficient infrastructure.

That is where Switzerland could have an opportunity.

Swiss companies do not need to build the next major AI model to participate in America’s AI expansion.

They can potentially help build and improve the physical infrastructure that makes that expansion possible.

For Switzerland, one of the biggest opportunities from America’s AI boom may therefore be hiding one level below AI itself:

Not building the intelligence — but helping America power it.

---

## Original Sources

- The Wall Street Journal — Upset About Data Centers? Big Tech and Trump Think You’re a Socialist Dupe
- The Wall Street Journal — Big Tech Can Build Data Centers People Won’t Hate
- Reuters — U.S. data-center electricity and infrastructure reporting
- Reuters — Texas data-center power-demand reporting`;

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

// Morning Briefing Details
const briefing_title = "America Wants More AI Data Centers — But Communities Are Pushing Back";
const briefing_date = date_published;
const briefing_audio_url = "/uploads/audio/morning_briefing_america_wants_more_ai_data_centers_1788819392485.mp3";
const briefing_audio_duration = 370;
const briefing_image_url = image_url;
const briefing_transcript = `Welcome to the PrivateSector Morning Briefing. While Switzerland was sleeping, business continued to move across the United States. Every weekday morning, we bring you the most important business developments from Washington, America's states, and its leading industries, and explain why they matter for Switzerland. Our mission is simple: honest reporting, accurate facts, clear analysis, and real business opportunities connecting Switzerland and the United States. Whether you are a business leader, an entrepreneur, an investor, or simply interested in the economic relationship between our two countries, this briefing is designed to keep you informed in just 10 minutes.

Let's begin with today's top story: America Wants More AI Data Centers — But Communities Are Pushing Back.

America’s AI boom is creating a new infrastructure challenge: technology companies need more data centers, while opposition to some projects is growing in communities across the country. Data centers are essential to modern AI because they house the servers and specialized chips needed to train and operate AI systems. But large facilities also require substantial electricity, grid connections and cooling infrastructure, creating concerns in some communities about power, water, noise and land use. The Wall Street Journal reports that at least 15 states and more than 100 localities have taken steps involving restrictions or moratoriums on data-center development.

What is happening? First, major technology companies are investing heavily in computing infrastructure. AI requires enormous computing capacity, which means more servers, more data centers and substantially more electricity. Second, some communities hosting or considering these projects are questioning the impact. Concerns include electricity demand, water consumption, noise, land use and whether the economic benefits justify the local costs. Third, the debate is expanding beyond individual projects. Data-center development is increasingly becoming a wider discussion about America’s electricity infrastructure, local planning and how quickly the country can expand AI computing capacity.

Who wants them — and who is against them? On one side are major technology companies, data-center developers and supporters of rapid U.S. AI infrastructure expansion. They argue that America needs substantially more computing capacity if it wants to remain a global leader in artificial intelligence. On the other side are residents, community organizations, environmental advocates and some local and national political figures who are questioning individual projects or the speed of data-center expansion. Their reasons are not always the same. Concerns can include electricity costs and availability, water use, noise, land development and pressure on existing infrastructure. This is therefore becoming more than a technology story. It is increasingly an energy and infrastructure story.

Why this matters to Switzerland: The challenge could create opportunities for Swiss industry. If America continues expanding AI computing capacity, it will also need enormous investment in the infrastructure underneath those data centers. That includes transformers, substations, power distribution, cooling, automation and technologies that can improve energy efficiency. Switzerland has significant industrial expertise in several of these areas.

Swiss companies with potential exposure: ABB operates in electrification, power distribution and technologies used in data-center infrastructure. Hitachi Energy, headquartered in Switzerland, supplies transformers, substations and grid technologies — equipment that becomes increasingly important as large electricity users connect to power networks. Belimo specializes in HVAC controls and building automation, making its technology relevant to efficient cooling and building operation. There is currently no confirmed evidence that ABB, Hitachi Energy or Belimo is involved in the specific projects or communities discussed in the latest U.S. reporting. They are companies to watch because their technologies address parts of the broader infrastructure challenge created by expanding data-center capacity.

PrivateSector View: America’s AI boom is increasingly becoming an infrastructure challenge underneath AI. The first wave of attention focused heavily on chips, AI models and software. But as computing capacity expands, another market is becoming increasingly important: electricity, transformers, cooling, substations, grid connections and efficient infrastructure. That is where Switzerland could have an opportunity. Swiss companies do not need to build the next major AI model to participate in America’s AI expansion. They can potentially help build and improve the physical infrastructure that makes that expansion possible. For Switzerland, one of the biggest opportunities from America’s AI boom may therefore be hiding one level below AI itself: Not building the intelligence — but helping America power it.

As this story continues to develop, we'll be watching what happens next and what it could mean for Switzerland. Join us again tomorrow morning for the developments that matter, the Swiss perspective, and the PrivateSector analysis. Thank you for listening, have a productive day. This is PrivateSector.`;

// 1. Save Article in Local SQLite
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

// 2. Save Article in Live API
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

// 3. Save Morning Briefing in Local SQLite
function saveBriefingSQLite(articleId) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
    });

    const nowStr = new Date().toISOString();
    const linkedArticles = JSON.stringify([articleId]);

    db.serialize(() => {
      db.get('SELECT id FROM morning_briefings WHERE date = ? OR title = ?', [briefing_date, briefing_title], (err, row) => {
        if (err) {
          db.close();
          return reject(err);
        }

        if (row) {
          console.log(`[SQLite Briefing] Briefing exists (ID: ${row.id}). Updating...`);
          const stmt = db.prepare(`
            UPDATE morning_briefings SET
              title = ?, date = ?, image_url = ?, audio_url = ?, audio_duration = ?,
              transcript = ?, linked_articles = ?, status = ?, updated_at = ?
            WHERE id = ?
          `);
          stmt.run([
            briefing_title, briefing_date, briefing_image_url, briefing_audio_url,
            briefing_audio_duration, briefing_transcript, linkedArticles, 'published', nowStr, row.id
          ], function(uErr) {
            stmt.finalize();
            db.close();
            if (uErr) reject(uErr);
            else {
              console.log(`[SQLite Briefing] Updated successfully!`);
              resolve(row.id);
            }
          });
        } else {
          console.log(`[SQLite Briefing] Inserting new briefing...`);
          const stmt = db.prepare(`
            INSERT INTO morning_briefings (
              title, date, image_url, audio_url, audio_duration,
              transcript, linked_articles, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run([
            briefing_title, briefing_date, briefing_image_url, briefing_audio_url,
            briefing_audio_duration, briefing_transcript, linkedArticles, 'published', nowStr, nowStr
          ], function(iErr) {
            const newId = this.lastID;
            stmt.finalize();
            db.close();
            if (iErr) reject(iErr);
            else {
              console.log(`[SQLite Briefing] Inserted successfully with ID: ${newId}`);
              resolve(newId);
            }
          });
        }
      });
    });
  });
}

// 4. Save Morning Briefing in Live API
async function saveBriefingLiveApi(articleId) {
  const payload = {
    title: briefing_title,
    date: briefing_date,
    image_url: briefing_image_url,
    audio_url: briefing_audio_url,
    audio_duration: briefing_audio_duration,
    transcript: briefing_transcript,
    linked_articles: [articleId],
    status: 'published'
  };

  try {
    const listRes = await fetch('https://privatesector.ch/api/morning-briefings');
    const existingList = await listRes.json();
    const existing = Array.isArray(existingList) ? existingList.find(b => b.date === briefing_date || b.title === briefing_title) : null;

    if (existing && existing.id) {
      console.log(`[Live API Briefing] Updating existing briefing ID: ${existing.id}...`);
      const res = await fetch(`https://privatesector.ch/api/morning-briefings/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      console.log('[Live API Briefing] Update Result:', result);
      return existing.id;
    } else {
      console.log(`[Live API Briefing] Creating new briefing...`);
      const res = await fetch(`https://privatesector.ch/api/morning-briefings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      console.log('[Live API Briefing] Create Result:', result);
      return result.id;
    }
  } catch (err) {
    console.error('[Live API Briefing] Error saving briefing:', err.message);
  }
}

async function main() {
  console.log('=== Publishing Article & Morning Briefing ===\n');

  // Step 1: Article Sync
  const localArticleId = await saveArticleSQLite();
  const liveArticleId = await saveArticleLiveApi();

  console.log(`\nArticle Synced: Local ID = ${localArticleId}, Live ID = ${liveArticleId}\n`);

  // Step 2: Morning Briefing Sync
  const localBriefingId = await saveBriefingSQLite(localArticleId);
  const liveBriefingId = await saveBriefingLiveApi(liveArticleId || localArticleId);

  console.log(`\nBriefing Synced: Local ID = ${localBriefingId}, Live ID = ${liveBriefingId}\n`);

  // Step 3: Verification
  console.log('=== Verifying Live Endpoints ===');
  
  // Verify News Article
  const newsRes = await fetch(`https://privatesector.ch/api/news/${slug}`);
  console.log(`News Article API (${slug}): status ${newsRes.status}`);
  if (newsRes.ok) {
    const data = await newsRes.json();
    console.log('✅ News Article Title:', data.article?.title);
  }

  // Verify Image
  const imgRes = await fetch(`https://privatesector.ch${image_url}`);
  console.log(`Image URL (${image_url}): status ${imgRes.status} ${imgRes.headers.get('content-type')}`);

  // Verify Audio
  const audioRes = await fetch(`https://privatesector.ch${briefing_audio_url}`);
  console.log(`Audio URL (${briefing_audio_url}): status ${audioRes.status} ${audioRes.headers.get('content-type')}`);

  // Verify Active Morning Briefings
  const activeRes = await fetch('https://privatesector.ch/api/morning-briefings/active');
  console.log(`Active Briefings API: status ${activeRes.status}`);
  if (activeRes.ok) {
    const activeData = await activeRes.json();
    console.log(`Active Briefings count: ${activeData.length}`);
    if (activeData.length > 0) {
      console.log('Latest Active Briefing:', {
        id: activeData[0].id,
        title: activeData[0].title,
        date: activeData[0].date,
        audio_duration: activeData[0].audio_duration,
        linked_articles: activeData[0].linked_articles,
        articles_count: activeData[0].articles?.length
      });
    }
  }

  console.log('\n=== All Operations Completed Successfully! ===');
}

main().catch(console.error);
