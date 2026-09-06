---
name: privatesector-article-publisher
description: Publishes and updates news articles on PrivateSector.ch with 1000% exact word-by-word fidelity to the user's provided text, perfect editorial Markdown formatting, and automated sync with local SQLite and live API.
---

# PrivateSector Article Publisher Workflow

This skill enforces strict, verbatim publication of news articles and analyses for **PrivateSector.ch**.

---

## 🚨 CARDINAL RULE: 1000% Same-to-Same Content Fidelity

When the user provides an article:
1. **NEVER change, replace, or reword any words.**
2. **NEVER add new sentences, commentary, or paragraphs from your side.**
3. **NEVER inject external company names, people, or facts not present in the user's text.**
4. **The text MUST be 1000% identical to what the user provided.**
5. **ONLY correct and polish the structural formatting (headings, paragraph spacing, lists, dividers).**

---

## 📐 Formatting Standards (How to Format Without Changing Words)

### 1. Heading Hierarchy
- **Major Section Headers (`## `):**
  - Use `## ` ONLY for top-level thematic sections (e.g., `## 🔎 So what exactly is happening?`, `## 🇨🇭 PrivateSector Analysis`, `## 🇨🇭 Why should Switzerland care?`).
  - *Note: `## ` renders with a full-width bottom border line.*
- **Questions & Subsections (`### `):**
  - Use `### ` for individual questions and smaller subsections (e.g., `### 1. Who is buying?`, `### 2. Who is selling?`, `### Our position is simple:`).
  - *Note: `### ` renders without a bottom border line, preventing page clutter.*

### 2. Mandatory Double-Newline Spacing (`\n\n`)
- **CRITICAL:** ALWAYS put a blank line (`\n\n`) between a heading and its answer paragraph:
  ```markdown
  ### 2. Who is selling?

  The owners and shareholders of Hugging Face, including its investors.
  ```
  *(Never put the answer on the next line without an empty line in between, as that can cause the parser to merge the answer into the heading.)*
- ALWAYS separate paragraphs with an empty line (`\n\n`).

### 3. Lists & Bullet Points
- Use `- ` for bullet points.
- Ensure an empty line (`\n\n`) exists before the first bullet item and after the last bullet item.

### 4. Visual Dividers
- Use `---` surrounded by empty lines (`\n\n---\n\n`) to clearly separate major sections.

### 5. Quotes & Citations
- Use `> ` for blockquotes or pull quotes.
- Italicize sources at the very end: `*Sources: Reuters; ETH Zurich; EPFL.*`

---

## 🚀 Standard Publishing Steps

### Step 1: Process User Infographic / Image
1. Find the uploaded image in:
   `C:\Users\Faisal\.gemini\antigravity-ide\brain\<conversation-id>\.user_uploaded\`
2. Name the image with a clean, lowercase snake_case filename (e.g., `nvidia_acquires_hugging_face_12_93_billion.jpg`).
3. Save the image to local directories:
   - `d:/privatesector/public/uploads/<clean_name>.jpg`
   - `d:/privatesector/server/uploads/<clean_name>.jpg`
   - `d:/privatesector/dist/uploads/<clean_name>.jpg` (if `dist/` exists)
4. Upload to the live server via the upload API:
   ```javascript
   const res = await fetch('https://privatesector.ch/api/upload', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ 
       image: 'data:image/jpeg;base64,' + fileBuf.toString('base64'), 
       filename: cleanBaseName, 
       exactName: true 
     })
   });
   ```
5. Verify `https://privatesector.ch/uploads/<clean_name>.jpg` returns HTTP 200 `image/jpeg`.

---

### Step 2: Prepare Exact Metadata
- **Title:** Exact title from user.
- **Subtitle:** First introductory paragraph from user.
- **Category:** Industry category (e.g., `Artificial Intelligence`, `Energy & Infrastructure`, `Advanced Manufacturing`).
- **Author:** `PrivateSector Intelligence` (`https://i.pravatar.cc/100?img=33`).
- **Date Published:** Current date (`YYYY-MM-DD`).
- **Slug:** Lowercase URL-friendly slug.
- **Image URL:** `/uploads/<clean_name>.jpg`.
- **Content Body:** User's 1000% verbatim text formatted cleanly with `## `, `### `, and `\n\n` spacing.
- **Schema Markup:** Standard Schema.org `NewsArticle` JSON-LD.

---

### Step 3: Dual Database & Live API Sync
1. **Local SQLite (`server/database.sqlite`):**
   - Check if record exists by `slug` or `title`.
   - Update existing or insert new record.
2. **Live Site API (`https://privatesector.ch/api/news`):**
   - If article exists: `PUT https://privatesector.ch/api/news/${id}`
   - If new article: `POST https://privatesector.ch/api/news`

---

### Step 4: Verification
Always run verification confirming:
1. `GET https://privatesector.ch/api/news/<slug>` returns 200 with the exact article.
2. `GET https://privatesector.ch/uploads/<clean_name>.jpg` returns 200 `image/jpeg`.
3. Blocks preview confirms every question is `H3` and every answer is a clean `P` (paragraph).
