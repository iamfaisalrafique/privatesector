import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');

const title = "Nvidia Agrees to Acquire Hugging Face for $12.93 Billion — What Is Nvidia Really Buying?";
const subtitle = "Nvidia has agreed to acquire Hugging Face for $12.93 billion, making a major move beyond the chips and computing infrastructure that helped make Nvidia one of the world's most valuable technology companies.";
const category = "Artificial Intelligence";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-09-04";
const read_time_mins = 3;
const pull_quote = "The important question isn't whether alternatives exist. It is whether Hugging Face remains as open and neutral as the community expects.";
const tags = [
  "Artificial Intelligence",
  "AI",
  "Nvidia",
  "Hugging Face",
  "ETH Zurich",
  "EPFL",
  "Apertus",
  "Switzerland",
  "United States"
];
const focus_keyword = "Nvidia Hugging Face acquisition 12.93 billion Apertus ETH Zurich EPFL Swiss AI";
const meta_title = "Nvidia Agrees to Acquire Hugging Face for $12.93 Billion — What Is Nvidia Really Buying? — PrivateSector";
const meta_description = "Nvidia has agreed to acquire Hugging Face for $12.93 billion. What does this mean for developers and Switzerland's Apertus AI model at ETH Zurich and EPFL?";
const slug = "nvidia-agrees-to-acquire-hugging-face-for-12-93-billion-what-is-nvidia-really-buying";
const image_url = "/uploads/nvidia_acquires_hugging_face_12_93_billion.jpg";

// 100% exact word-by-word content formatted with clean Markdown headings and paragraph separation
const content_body = `Nvidia has agreed to acquire Hugging Face for $12.93 billion, making a major move beyond the chips and computing infrastructure that helped make Nvidia one of the world's most valuable technology companies.

The agreement is real, but there is an important distinction: the transaction still has to be completed.

According to the announced structure, approximately **$11.9 billion** will go to Hugging Face investors, while up to **$1 billion** is planned in equity-based retention incentives for employees.

---

## 🔎 So what exactly is happening?

### 1. Who is buying?

Nvidia.

Nvidia is not abandoning its chip business. Quite the opposite: it is building on top of an already extremely strong AI computing business.

### 2. Who is selling?

The owners and shareholders of Hugging Face, including its investors.

Hugging Face was founded in 2016 and was valued at approximately **$4.5 billion in 2023**.

### 3. What does Hugging Face actually do?

Hugging Face is a major platform where developers can access, share and work with AI models, datasets and development tools.

Think about it simply:
- **Nvidia** provides much of the computing power underneath AI.
- **Hugging Face** sits much closer to the people actually building with AI.

### 4. Why is Nvidia paying so much?

This is where the deal becomes interesting.

Nvidia already has a powerful foundation in AI chips and infrastructure. Now it is adding another important piece around that foundation: the developer ecosystem.

It isn't leaving chips for AI.

It is building its AI business around the strength of its existing chip business.

### 5. What happens to Hugging Face employees?

The transaction includes up to approximately **$1 billion in equity-based retention incentives**, designed to encourage employees to remain with the business. — *Reuters*

That makes sense. Hugging Face's technology matters, but so do the engineers and people who built its community.

### 6. Will Hugging Face remain open?

This may be the biggest question for the AI community.

**Nvidia says yes.**

The company says Hugging Face will remain an open platform and developers will continue to have choices over their models, chips and cloud providers. — *Reuters*

But the AI community will naturally watch what happens over time.

A platform that was independent will become part of one of the world's most powerful technology companies.

### 7. Should developers be worried?

There is no reason to conclude today that Hugging Face will suddenly become closed.

Nvidia has explicitly said the opposite.

But it is reasonable to watch carefully:
- Management can change.
- Strategies can change.
- Business priorities can change.

And developers still have other AI platforms and tools available.

> The important question isn't whether alternatives exist. It is whether Hugging Face remains as open and neutral as the community expects.

### 8. Why should Switzerland care?

Here we have a real, documented Swiss connection.

Researchers at **ETH Zurich** and **EPFL**, together with the **Swiss National Supercomputing Centre**, developed Switzerland's open language model **Apertus**.

And **Apertus is available through Hugging Face**. *(ETH Zürich +1)*

That means this isn't an artificial Switzerland connection we're adding to an American story.

Parts of Switzerland's own AI research ecosystem already use Hugging Face as a distribution platform.

### 9. What happens next?

The AI community will be watching what Nvidia does with Hugging Face:
- Will it remain open?
- Will competing chips continue to receive equal access?
- Will developers continue to trust the platform?
- And can Nvidia provide more resources without damaging what made Hugging Face valuable in the first place?

Those questions matter more than simply looking at the **$12.93 billion** price.

---

## 🇨🇭 PrivateSector Analysis

Nvidia already has the foundation.

Chips made Nvidia extraordinarily powerful in artificial intelligence.

Now the company has the capital to build around that foundation.

Hugging Face gives Nvidia something different: access to a huge community of developers building and experimenting with AI.

That makes this less about Nvidia entering an entirely new business and more about expanding the ecosystem surrounding its existing AI business.

There is naturally some uncertainty.

When an independent platform becomes part of a giant technology company, developers will watch carefully.

But PrivateSector sees no reason to assume the outcome will be negative.

The positive scenario is equally important.

If Nvidia invests heavily in Hugging Face while genuinely protecting its openness, Hugging Face could become stronger, better funded and more useful to the global AI community.

For Switzerland, that could matter directly.

ETH Zurich and EPFL helped create Apertus, and the model is distributed through Hugging Face. Switzerland therefore has an interest in seeing open AI infrastructure continue to develop.

### Our position is simple:

**Stay positive, but keep watching.**

Nvidia says Hugging Face will remain open.

Now the AI community will see whether one of the world's richest technology companies can make an open platform stronger without taking away the independence that helped make it valuable.

---

**PrivateSector | United States × Switzerland**  
*Sources: Reuters; ETH Zurich; EPFL.*`;

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

// 1. Update SQLite local DB
function updateSQLite() {
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
          console.log(`[SQLite] Article exists (ID: ${row.id}). Updating with exact text...`);
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
    const listRes = await fetch('https://privatesector.ch/api/news');
    const existingList = await listRes.json();
    const existing = Array.isArray(existingList) ? existingList.find(a => a.slug === slug || a.title === title) : null;

    if (existing && existing.id) {
      console.log(`[Live API] Updating existing article ID: ${existing.id} with exact text...`);
      const res = await fetch(`https://privatesector.ch/api/news/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      console.log('[Live API] Update Result:', result);
      return existing.id;
    }
  } catch (err) {
    console.error('[Live API] Error updating article:', err.message);
  }
}

async function main() {
  console.log('=== Updating Nvidia / Hugging Face Article to Exact User Text ===\n');
  const sqliteId = await updateSQLite();
  const liveId = await updateLiveApi();
  console.log(`\n=== Verification ===`);
  console.log(`SQLite ID: ${sqliteId}`);
  console.log(`Live API ID: ${liveId}`);

  // Fetch from live API
  const testRes = await fetch(`https://privatesector.ch/api/news/${slug}`);
  if (testRes.ok) {
    const testData = await testRes.json();
    console.log('✅ Successfully verified on Live API!');
    console.log('Title:', testData.article.title);
    console.log('First 200 chars of body:\n', testData.article.content_body.slice(0, 200));
  }
  console.log('\n=== Done! ===');
}

main().catch(console.error);
