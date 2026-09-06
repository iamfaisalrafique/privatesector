---
trigger: always_on
---

# PrivateSector Strict Publishing Rules

## 1. 1000% Exact Same-to-Same Words Rule
Whenever the user provides an article to post, publish, or update:
- **DO NOT change, substitute, or remove words.**
- **DO NOT add sentences, commentary, or paragraphs from your own side.**
- **The text MUST be 1000% identical to the user's provided input.**

## 2. Formatting Structure Standards (Without Adding Words)
- **Top-Level Sections (`## `):** Use `## ` ONLY for main sections (e.g. `## 🔎 The Questions`, `## 🇨🇭 PrivateSector Analysis`).
- **Questions & Subsections (`### `):** Use `### ` for individual questions (e.g. `### 1. Who is buying?`, `### 2. Who is selling?`) to keep the page clean without bottom divider lines.
- **Mandatory Blank Lines (`\n\n`):** ALWAYS separate headings from paragraphs and paragraphs from each other with a blank line (`\n\n`). Never place paragraph text on the immediately next line after a heading.
- **Lists:** Format bullet points with `- ` and empty lines before/after.
- **Dividers:** Use `---` with blank lines before/after.

## 3. Accompanying Infographic / Image Handling
- Save the user's attached image with a clean snake_case filename to:
  - `public/uploads/`
  - `server/uploads/`
  - `dist/uploads/` (if present)
- Upload to the live server via `POST https://privatesector.ch/api/upload` (`exactName: true`).
- Set `image_url` to `/uploads/<name>.jpg`.

## 4. Dual Database & Live Synchronization
- Always update both:
  1. Local SQLite (`server/database.sqlite`)
  2. Live API (`https://privatesector.ch/api/news` via POST for new or PUT for update)
- Verify that both the live API and image URL respond with HTTP 200.
