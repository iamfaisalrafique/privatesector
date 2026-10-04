# EmDash CMS Migration Plan: PrivateSector.ch

**Target Stack:** Astro (>= 7.3.5) + EmDash CMS (>= 1.1.0)  
**Adapter:** `@astrojs/node` (standalone mode, Node.js 22 runtime)  
**Database Adapter:** PostgreSQL via `import { postgres } from "emdash/db"`  
**Storage Adapter:** Local persistent storage (`./data/uploads`) with S3 compatibility option  
**Security:** Passkey-based Admin at `/_emdash/admin`, strict CSP, encryption key rotation, sandboxed plugins  

---

## 1. Table-to-EmDash Collection Mapping

| Source Table | EmDash Collection Slug | Routable URL Pattern | Key Fields & Types | Taxonomies & Relations |
| :--- | :--- | :--- | :--- | :--- |
| **`news`** (44 rows) | `posts` | `/{slug}` or `/news/{slug}` | - `title`: `string` (required, searchable)<br>- `subtitle`: `string`<br>- `content`: `portableText` (rich body)<br>- `pull_quote`: `text`<br>- `read_time_mins`: `integer`<br>- `image_url`: `image` / `string`<br>- `date_published`: `datetime`<br>- `focus_keyword`, `meta_title`, `meta_description`, `schema_markup`: `string` | - Taxonomy: `category` (*Executive Briefing*, *University Perspective*, etc.)<br>- Taxonomy: `tag` (*Deal Radar*, *M&A*, etc.)<br>- Relation: `student_author` -> `student_profiles` |
| **`blogs`** (4 rows) | `blogs` | `/blogs/{slug}` | - `title`: `string` (required)<br>- `subtitle`: `string`<br>- `content`: `portableText`<br>- `pull_quote`: `text`<br>- `read_time_mins`: `integer`<br>- `image_url`: `image` / `string`<br>- SEO fields | - Taxonomy: `category` (*Guides*, *Analysis*)<br>- Taxonomy: `tag` |
| **`companies`** (17 rows) | `companies` | `/unternehmen/{slug}` | - `name`: `string` (required, searchable)<br>- `logo_bg`: `string`<br>- `canton`: `select` (26 Swiss cantons: ZH, BE, VD, BS, ZG, JU, etc.)<br>- `industry`: `string` / `select`<br>- `size_class`: `select` (*Small*, *Medium*, *Large*)<br>- `description`: `text`<br>- `premium`: `boolean`<br>- `verified`: `boolean` (Zefix verified)<br>- `founded`: `integer`<br>- `employees`: `integer`<br>- `revenue_band`: `string`<br>- `website`: `url`<br>- `linkedin`: `url`<br>- `contact_email`: `string`<br>- `about_text`: `text`<br>- `structured_data`: `json`<br>- `esg_rating`: `integer`<br>- `sustainability_summary`: `text`<br>- SEO fields | - Taxonomy: `industry`<br>- Field: `canton` (indexed) |
| **`interviews`** (6 rows) | `interviews` | `/interviews/{slug}` | - `title`: `string` (required)<br>- `subtitle`: `string`<br>- `interviewee_name`: `string`<br>- `interviewee_title`: `string`<br>- `interviewee_avatar`: `image` / `string`<br>- `company_name`: `string`<br>- `audio_url`: `file` / `string`<br>- `qa_content`: `portableText` / `json`<br>- `read_time_mins`: `integer`<br>- SEO fields | - Relation: `company` -> `companies`<br>- Relation: `student_author` -> `student_profiles` |
| **`morning_briefings`** (2 rows) | `briefings` | None (rendered on `/` and `/podcasts`) | - `title`: `string` (required)<br>- `date`: `datetime`<br>- `audio_url`: `file` / `string`<br>- `audio_duration`: `integer`<br>- `transcript`: `text`<br>- `image_url`: `image` / `string`<br>- `status`: `select` (*draft*, *published*) | - Relation: `linked_articles` -> `posts[]` (multi-reference) |
| **`student_profiles`** (3 rows) | `student_profiles` | `/student/{id}` | - `name`: `string` (required)<br>- `university`: `string`<br>- `study_field`: `string`<br>- `avatar`: `image` / `string`<br>- `grad_year`: `integer`<br>- `portfolio_url`: `url`<br>- `bio`: `text`<br>- `email`, `phone_number`, `birth_date`: `string`<br>- `skills`: `json`<br>- `experience`: `json` | Reusable author/contributor byline entity |
| **`pages`** (4 rows) | Built-in `pages` | `/{path}` | - `title`: `string`<br>- `meta_description`: `string`<br>- `blocks_layout`: `json`<br>- `ads_enabled`: `boolean` | Standard EmDash pages collection |

---

## 2. Application Data Handled Outside EmDash CMS

The following operational application tables do not belong in an editorial CMS collection and will be retained in a dedicated PostgreSQL application schema (`app_schema`):

1. **`ads` (8 rows):**
   - Active ad campaigns, positions (`leaderboard`, `rectangle`, `spotlight`), and real-time impression and click tracking (`POST /api/admin/ads/:id/impression`, `POST /api/admin/ads/:id/click`).
   - Served via high-performance Astro endpoints (`src/pages/api/ads/*.ts`) that perform direct, lightweight SQL counter updates without CMS overhead.
2. **`jobs` (4 rows):**
   - Careers board listings and external application links. Handled via Astro endpoints or an EmDash custom collection.
3. **`users` (4 rows):**
   - Portal accounts for student contributors and enterprise profile claimers (`student@privatesector.ch`, `company@privatesector.ch`).
   - EmDash CMS editors will use EmDash's passkey-based authentication at `/_emdash/admin`. Student/company front-end users will authenticate against the isolated `users` table via Astro API endpoints.
4. **`translations` (5,498 rows):**
   - UI dictionary for static multi-language text. Embedded as static JSON caches in the Astro build or queried via cached memory helper in `LanguageContext`.

---

## 3. Route-by-Route Migration & Rendering Mode

All pages in Astro will run in **`output: "server"`** mode to deliver real-time data from EmDash via **Live Content Collections** (`getEmDashCollection` and `getEmDashEntry`), ensuring immediate reflection of editorial changes without full site rebuilds.

| URL Route | Next.js/Vite Equivalent | Astro Target File | Rendering Mode | Data Fetching Pattern |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `src/App.jsx` (`home`) | `src/pages/index.astro` | SSR (Live) | `getEmDashCollection("briefings", { limit: 2 })`<br>`getEmDashCollection("posts", { limit: 12 })`<br>`getEmDashCollection("companies", { where: { premium: "1" }, limit: 3 })` |
| `/unternehmen` | `Directory.jsx` | `src/pages/unternehmen/index.astro` | SSR (Live) | `getEmDashCollection("companies")` with filter params from `Astro.url.searchParams` |
| `/unternehmen/[id]` | `Profile.jsx` | `src/pages/unternehmen/[id].astro` | SSR (Live) | `getEmDashEntry("companies", Astro.params.id)` (by slug or fallback ID) + related news |
| `/news` | `News.jsx` | `src/pages/news/index.astro` | SSR (Live) | `getEmDashCollection("posts", { status: "published" })` |
| `/news/[id]` | `News.jsx` (detail) | `src/pages/news/[id].astro` | SSR (Live) | `getEmDashEntry("posts", Astro.params.id)` + PortableText renderer + related posts |
| `/swiss` | `News.jsx` (tag) | `src/pages/swiss.astro` | SSR (Live) | `getEmDashCollection("posts", { where: { tag: "Hidden Swiss" } })` |
| `/blogs` | `Blogs.jsx` | `src/pages/blogs/index.astro` | SSR (Live) | `getEmDashCollection("blogs")` |
| `/blogs/[id]` | `Blogs.jsx` (detail) | `src/pages/blogs/[id].astro` | SSR (Live) | `getEmDashEntry("blogs", Astro.params.id)` |
| `/statistiken` | `Statistics.jsx` | `src/pages/statistiken.astro` | SSR (Static data + Chart Island) | Astro SSR page with interactive React charts (`client:visible`) |
| `/interviews` | `Interviews.jsx` | `src/pages/interviews/index.astro` | SSR (Live) | `getEmDashCollection("interviews")` |
| `/interviews/[id]` | `Interviews.jsx` (detail) | `src/pages/interviews/[id].astro` | SSR (Live) | `getEmDashEntry("interviews", Astro.params.id)` + Audio player |
| `/podcasts` | `Interviews.jsx` | `src/pages/podcasts.astro` | SSR (Live) | `getEmDashCollection("briefings")` + `getEmDashCollection("interviews")` |
| `/karriere` | `Careers.jsx` | `src/pages/karriere/index.astro` | SSR (Live) | Application database query for jobs + `getEmDashCollection("student_profiles")` |
| `/karriere/[id]` | `Careers.jsx` | `src/pages/karriere/[id].astro` | SSR (Live) | Single job listing |
| `/ranking` | `Rankings.jsx` | `src/pages/ranking.astro` | SSR (Live) | `getEmDashCollection("companies")` sorted by revenue / employees |
| `/student/[id]` | `StudentProfile.jsx` | `src/pages/student/[id].astro` | SSR (Live) | `getEmDashEntry("student_profiles", Astro.params.id)` + student articles |
| `/student-dashboard` | `StudentDashboard.jsx` | `src/pages/student-dashboard.astro` | SSR (Client Auth Island) | Contributor portal island (`client:load`) |
| `/translatic-transcript` | `TranslaticTranscript.jsx` | `src/pages/translatic-transcript.astro` | SSR (Live) | `getEmDashCollection("posts", { where: { category: "Transatlantic Transcript" } })` |
| `/socal-gateway` | `SoCalGateway.jsx` | `src/pages/socal-gateway.astro` | SSR (Live) | `getEmDashCollection("posts", { where: { category: "SoCal Gateway" } })` |
| `/trade-policy-pulse` | `TradePolicyPulse.jsx` | `src/pages/trade-policy-pulse.astro` | SSR (Live) | `getEmDashCollection("posts", { where: { category: "Trade Policy Pulse" } })` |
| `/cross-border-ranking` | `CrossBorderRanking.jsx` | `src/pages/cross-border-ranking.astro` | SSR (Live) | `getEmDashCollection("companies", { where: { industry: "CrossBorder" } })` |
| `/about` | `About.jsx` | `src/pages/about.astro` | Prerendered | Static corporate overview |
| `/contact` | `Contact.jsx` | `src/pages/contact.astro` | SSR (Form action) | Contact page with CSRF-protected Astro form action |
| `/login` | `Auth.jsx` | `src/pages/login.astro` | SSR (Island) | Contributor authentication |
| `/register` | `Auth.jsx` | `src/pages/register.astro` | SSR (Island) | Contributor signup |
| `/_emdash/admin` | Custom React SPA Admin | Native EmDash Admin | Native EmDash | Built-in Passkey authenticated editorial panel |
| `/sitemap.xml` | Express handler | `src/pages/sitemap.xml.ts` | SSR Endpoint | Dynamic XML sitemap with Google News extensions |
| `/health` | New | `src/pages/health.ts` | SSR Endpoint | Returns `200 OK` for Coolify liveness checks |
| `/uploads/*` | Static Express directory | Astro Endpoint / Static serve | Static / Stream | Preserves exact URL mapping to all images and audio files |

---

## 4. Rich Content & Portable Text Strategy

- In the current system, `news.content_body` and `blogs.content_body` store editorial Markdown containing:
  - Standard headers (`## ` and `### `)
  - Paragraphs and line breaks (`\n\n`)
  - Pull quotes (`> `)
  - Lists (`- `)
  - Tables and dividers (`---`)
- **Migration Pipeline (`scripts/migrate-content.ts`):**
  - Parses Markdown AST into Sanity/EmDash-compliant **Portable Text** blocks.
  - Converts block images into EmDash media references while maintaining original URLs.
  - Generates zero loss of formatting, strictly respecting the *1000% Exact Same-to-Same Words Rule*.
  - Frontend Astro pages render Portable Text using `astro-portabletext` (already bundled in EmDash).

---

## 5. Media Migration Strategy

1. **Storage Location:** EmDash configured with Node.js local storage in `./data/uploads` or `./public/uploads`.
2. **File Migration:** All 40+ images in `server/uploads/` and audio recordings in `server/uploads/audio/` will be copied into EmDash's storage directory.
3. **Reference Rewriting:** Existing database image paths (e.g. `/uploads/what_amazon_and_catl_reveal_...jpg`) remain 100% valid.
4. An Astro endpoint `src/pages/uploads/[...path].ts` will act as a fallback server to ensure backwards compatibility with any existing external or social media links.

---

## 6. Project Layout Strategy: Scaffolding Directory

We recommend scaffolding the EmDash project in an isolated `/emdash-site` folder or directly replacing root files after backing up.
- **Recommended Approach:** Scaffold in `/emdash-site` first:
  - Keeps the existing application code completely untouched and running side-by-side during development and verification.
  - Enables zero-risk testing and running verification crawls against both old and new sites on different ports.
  - Can be easily promoted to root or built by Dockerfile directly.

---

## 7. Resolution for the 8 Migration Conditions

### Condition 1: Production Postgres Verification & Discrepancies
- The production database was audited via read-only live querying.
- **Discrepancies identified:**
  - `news`: 48 articles on live production vs 44 in local SQLite (+4 new articles).
  - `blogs`: 24 blog posts on live production vs 4 in local SQLite (+20 new posts).
  - `morning_briefings`: 1 active briefing on production vs 2 in local SQLite.
  - `companies` (17), `jobs` (4), `students` (3), `pages` (4) are identical.
- **Action:** Migration scripts will pull data directly from production endpoints/read-only database connection so zero production articles are lost.

### Condition 2: `pages` Table & Page-Builder Mapping
The 4 rows in `pages` (`/`, `/unternehmen`, `/news`, `/statistiken`) store identical default block layout definitions (`[hero, ticker, sponsored_carousel, companies_grid, news_section]`). In the current SPA, the public frontend never queries `/api/pages`—the layout is statically composed in React views.
- **Mapping Proposal:**
  1. `/` -> `src/pages/index.astro` (Astro SSR page composing Hero, Audio Briefing, News Grid, and Company Spotlights).
  2. `/unternehmen` -> `src/pages/unternehmen/index.astro` (Astro SSR page with directory filters).
  3. `/news` -> `src/pages/news/index.astro` (Astro SSR page with category tabs).
  4. `/statistiken` -> `src/pages/statistiken.astro` (Astro SSR page with macroeconomic KPI cards and Chart island).
- **Recommendation:** **Retire the `pages` SQL table** (Option A). Statically defining these four foundational layouts as idiomatic Astro pages adheres to the Ponytail simplicity standard (YAGNI, zero bloat, native speed) while keeping all metadata and ad settings configurable in page frontmatter or site configuration.

### Condition 3: Students & Companies RBAC vs Application Schema
- **Audit:** Students actively draft articles (`student_author_id`) and edit profiles via `/student-dashboard`. Companies register via `/register`.
- **EmDash RBAC Limitation:** EmDash offers 5 internal CMS roles (`Subscriber` to `Admin`) with full studio access at `/_emdash/admin`. It does not support consumer-facing tenant-isolated portal authentication or external student/company user dashboards.
- **Recommendation:**
  - Retain `users`, `student_profiles`, `companies`, `jobs`, and `leads` in the **PostgreSQL application schema (`app_schema`)**.
  - Astro server endpoints manage student login, profile updates, and article draft submissions.
  - Editorial staff review and publish student submissions in the EmDash studio.

### Condition 4: Multi-Language & Translations Architecture
- **Editorial Content:** All 48 news and 24 blog posts are in English.
- **UI Strings:** The `translations` table contains 5,498 UI strings (`de`, `fr`, `en`, `ar`).
- **Plan:**
  - Export the translations dictionary into a cached JSON dictionary (`translations_cache.json`).
  - Astro layout supports bidirectional rendering: `<html dir="rtl">` for Arabic (`ar`) and standard `ltr` for `de`, `fr`, `en`.
  - Future editorial translations will utilize EmDash's translation groups when multilingual articles are created.

### Condition 5: Security Hardening Specification
1. **Authentication:** Argon2/Bcrypt password hashing with automatic transparent rehashing upon successful login for any existing legacy hashes.
2. **Session Cookies:** Issue `httpOnly; Secure; SameSite=Lax` authentication cookies for the student/company portal.
3. **Rate Limiting:** Protect login, signup, and ad impression/click endpoints (`POST /api/admin/ads/:id/*`) with in-memory/Redis rate limiting and IP/cookie deduplication.
4. **Validated Uploads:** Replace raw 50MB Base64 endpoints with multipart uploads enforcing strict MIME type validation (magic number inspection), file size caps (max 5MB for images, 25MB for audio), and sanitized filenames.
5. **Storage:** Support S3-compatible object storage (e.g., Cloudflare R2, MinIO, or AWS S3) for audio and images.

### Condition 6: EmDash Dedicated Schema / Database
- EmDash will be configured to operate within its own dedicated PostgreSQL schema (`emdash_core`) or separate database.
- Existing production tables remain untouched in their existing schema. All migration extraction is executed in strict read-only mode (`SET default_transaction_read_only = on`).

### Condition 7: Git Hygiene Verification
- Confirmed that `.env` was never committed in git history.
- Added `.env`, `.env.*`, and `.sqlite` to `.gitignore`.
- Media uploads will be stored outside git tracking in persistent Docker volumes or S3.

### Condition 8: 100% URL & Google News Sitemap Preservation
- All URLs preserved exactly: `/unternehmen/:slug`, `/news/:slug`, `/blogs/:slug`, `/interviews/:slug`, `/karriere/:id`, `/student/:id`.
- Dynamic XML sitemap endpoint `/sitemap.xml` will generate the standard sitemap and Google News sitemap (`<news:news>`, `<news:publication>`, `<news:title>`).

