# Project Rules for PrivateSector

## 1. 1000% Exact Same-to-Same Words Rule
Whenever the user provides an article to post, publish, or edit:
- **Never change, add, or delete any words.**
- **Never add extra sentences, commentary, or paragraphs from your side.**
- **The article content MUST be 1000% word-by-word identical to the user's input.**

## 2. Formatting Structure (Without Changing Words)
- **Top-Level Sections (`## `):** Use `## ` ONLY for main sections.
- **Questions & Subsections (`### `):** Use `### ` for individual questions (e.g. `### 1. Who is buying?`, `### 2. Who is selling?`) so they do not render with heavy underline borders.
- **Mandatory Blank Line Spacing (`\n\n`):** Always place a blank line between any heading and its body text, and between paragraphs.
- **Lists & Dividers:** Format lists with `- ` and dividers with `---` with empty lines before and after.

## 3. Image / Infographic Processing
- When an image or infographic is uploaded by the user, save it to `public/uploads/` and `server/uploads/` with a clean snake_case filename.
- Upload it to `https://privatesector.ch/api/upload` (`exactName: true`) and verify it returns HTTP 200 at `/uploads/<name>.jpg`.

## 4. Database Sync & Verification
- Synchronize both local SQLite (`server/database.sqlite`) and the live site (`https://privatesector.ch/api/news`).
- Verify the live URL and image after every publication.
