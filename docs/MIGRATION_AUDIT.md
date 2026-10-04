# Migration Audit: PrivateSector.ch to EmDash CMS (Astro)

**Date:** October 2026  
**Auditor:** Senior Full-Stack Migration Engineer  
**Target Platform:** EmDash CMS (>= 1.1.0) on Astro (>= 7.3.5) with Node.js runtime (v22.18+ / v22-alpine), PostgreSQL database adapter, and local/S3-compatible media storage.  
**Git Branch:** `emdash-migration`  

---

## 1. Architectural Reality Check

> [!IMPORTANT]
> **Framework Discovery:** The prompt references a "Next.js + PostgreSQL project". The audit reveals the current codebase is actually a **React 19 + Vite 8 Single-Page Application (SPA)** with an **Express 5 backend** (`server/server.js`) backed by **raw SQL (PostgreSQL `pg` with SQLite `sqlite3` fallback)**.
>
> There is no Next.js App Router or Pages Router in this repository. Routing is handled via the HTML5 History API in React (`src/App.jsx`) coupled with REST endpoints in Express. 
> 
> Migrating to **EmDash CMS (Astro-native)** provides immense architectural advantages:
> - Replaces client-side SPA fetching and blank initial HTML with server-side rendered (SSR) Astro pages using Live Content Collections.
> - Preserves 100% of existing URLs, SEO tags, responsive styling, and React interactive components.
> - Replaces custom SQLite/PostgreSQL syncing logic with EmDash's official PostgreSQL database adapter, draft/revisions system, passkey-secured admin at `/_emdash/admin`, and media management.

---

## 2. Router & Route Inventory

### Router Architecture
- **Type:** Client-side HTML5 History API Router (`window.history.pushState` + `popstate` listener in `src/App.jsx`).
- **Production Server Delivery:** Express catches all unmatched routes (`app.get(/^\/(.*)$/, ...)`) and serves `dist/index.html`.
- **Layout System:** Global `Navbar` (with real-time financial market ticker and language switcher), Page Content container, and Global Editorial `Footer` (with cantonal flags, directory links, and language toggles).

### Complete Route Map & Data Sources

| Public Route | Route Component | Data Source / API Endpoint | Notes & Parameters |
| :--- | :--- | :--- | :--- |
| `/` | `src/App.jsx` + `HomepageGraphics`, `DailyAudioNews`, `Hero`, `AdSlot` | `GET /api/morning-briefings/active?limit=2`<br>`GET /api/companies?premium=true`<br>`GET /api/news`<br>`GET /api/markets/ticker` | Main portal homepage: Audio Morning Briefing, Market Ticker, 12-article news grid, 3 featured company spotlights, and Swiss Trust Index. |
| `/unternehmen` | `src/features/company/views/Directory.jsx` | `GET /api/companies?search=&canton=&industry=&size=&verified=&premium=` | Swiss B2B directory with multi-faceted filtering (cantons, industries, company size classes, Zefix verified status). |
| `/unternehmen/:id` | `src/features/company/views/Profile.jsx` | `GET /api/companies/:id` (queries by numeric `id` or string `slug`) | Company profile dossier: Headcount, Founding year, Revenue band, ESG rating, sustainability summary, executive management, revenue/employee history charts, related news. |
| `/news` | `src/features/news/views/News.jsx` | `GET /api/news?category=&tag=&search=&student_author_id=` | Editorial and intelligence stream with category filters and search. |
| `/news/:id` | `src/features/news/views/News.jsx` | `GET /api/news/:id` (queries by `id` or `slug`) | Deep-dive news analysis: Markdown body rendering, pull quotes, image hero, table of contents, student author bio card, related 3 articles. |
| `/swiss` | `src/features/news/views/News.jsx` | `GET /api/news?tag=Hidden Swiss` | Filtered editorial view showcasing hidden champions and Swiss family-owned manufacturers. |
| `/blogs` | `src/features/blog/views/Blogs.jsx` | `GET /api/blogs` | Market commentary and opinion blog stream. |
| `/blogs/:id` | `src/features/blog/views/Blogs.jsx` | `GET /api/blogs/:id` (queries by `id` or `slug`) | Single blog article view with related posts and author metadata. |
| `/statistiken` | `src/features/company-ranking/views/Statistics.jsx` | `GET /api/stats` | Swiss macroeconomic dashboard: GDP trends (2018–2026), employment metrics, sector breakdown (Finance, Pharma, Luxury, Tech), Cantonal economic weight index. |
| `/interviews` | `src/features/news/views/Interviews.jsx` | `GET /api/interviews` (via `dbQuery`) | Executive Briefings and audio podcasts featuring Swiss CEOs and founders. |
| `/interviews/:id` | `src/features/news/views/Interviews.jsx` | `GET /api/interviews/:id` | Q&A structured interview with embedded HTML5 audio player and transcript. |
| `/podcasts` | `src/features/news/views/Interviews.jsx` | `GET /api/interviews?category=Executive Briefing` | Dedicated audio briefing hub. |
| `/karriere` | `src/features/students/views/Careers.jsx` | `GET /api/jobs`<br>`GET /api/students` | Swiss University talent forum & job board (HSG, ETH, UZH) connecting students with private sector employers. |
| `/karriere/:id` | `src/features/students/views/Careers.jsx` | `GET /api/jobs/:id` | Job posting detail view. |
| `/ranking` | `src/features/company-ranking/views/Rankings.jsx` | `GET /api/companies` | Cross-border enterprise rankings based on revenue and headcount. |
| `/student/:id` | `src/features/students/views/StudentProfile.jsx` | `GET /api/students/:id` | Academic contributor portfolio, publications, and audio appearances. |
| `/student-dashboard` | `src/features/students/views/StudentDashboard.jsx` | `GET /api/students/:id`<br>`PUT /api/students/:id` | Authenticated student portal for managing academic profile and drafting articles. |
| `/translatic-transcript` | `src/features/news/views/TranslaticTranscript.jsx` | `GET /api/news?category=Transatlantic Transcript` | Specialized trade & cross-border editorial stream. |
| `/socal-gateway` | `src/features/news/views/SoCalGateway.jsx` | `GET /api/news?category=SoCal Gateway` | US-Swiss regional trade corridor dossier. |
| `/trade-policy-pulse` | `src/features/news/views/TradePolicyPulse.jsx` | `GET /api/news?category=Trade Policy Pulse` | Regulatory and trade policy briefings. |
| `/cross-border-ranking` | `src/features/news/views/CrossBorderRanking.jsx` | `GET /api/companies?industry=CrossBorder` | Dedicated cross-border enterprise ranking view. |
| `/about` | `src/features/system/views/About.jsx` | Static React + Translation dictionary | Corporate background, editorial standards, and mission statement. |
| `/contact` | `src/features/system/views/Contact.jsx` | Static React + Form | Contact and editorial inquiry form. |
| `/login` | `src/features/system/views/Auth.jsx` | `POST /api/auth/login` | Multi-role portal authentication (admin, student, company). |
| `/register` | `src/features/system/views/Auth.jsx` | `POST /api/auth/signup` | Contributor and enterprise registration. |
| `/admin` | `src/features/system/views/Admin.jsx` | `GET /api/admin/*`, `POST /api/news`, `POST /api/companies`, etc. | Custom bespoke SPA admin panel for managing news, blogs, companies, interviews, ads, and translations. |

---

## 3. Database Architecture & Table Audit

### Driver & Production Reconciliation
- **Driver:** Dual adapter (`pg.Pool` for PostgreSQL when `DATABASE_URL` is set; `sqlite3.Database` using local `server/database.sqlite` as fallback).
- **ORM:** None. Pure parameterized SQL (`dbQuery`, `dbGet`, `dbRun` in `server/db.js`). A custom converter translates `?` into `$1, $2` for PostgreSQL.
- **Production Safety:** All reads from the production database during migration MUST use a strict read-only connection. EmDash will use a NEW separate schema or separate PostgreSQL database.

### Production (Live) vs. Local SQLite Row Counts

| Entity / Table | Local SQLite Count | Live Production Count | Variance & Analysis |
| :--- | :---: | :---: | :--- |
| **`news`** | 44 | **48** | **+4 new articles on Production** (IDs 49, 50, 52, 53, 54 added on live site). Must migrate from live production source. |
| **`blogs`** | 4 | **24** | **+20 blog articles on Production** (Extensive editorial content on live). |
| **`companies`** | 17 | **17** | **Exact match.** |
| **`morning_briefings`** | 2 | **1** | Production currently serves 1 active briefing. |
| **`jobs`** | 4 | **4** | **Exact match.** |
| **`student_profiles`** | 3 | **3** | **Exact match.** |
| **`pages`** | 4 | **4** | **Exact match** (`/`, `/unternehmen`, `/news`, `/statistiken`). |
| **`ads`** | 8 | **4** | 4 active ad slots on production. |
| **`translations`** | 5,498 | 5,498 | UI localization dictionary (`de`, `fr`, `en`, `ar`). |

> [!IMPORTANT]
> **Production Discrepancy Alert:** The local `server/database.sqlite` is outdated compared to live production. The data migration script (`scripts/migrate-content.ts`) MUST pull directly from the production environment / read-only live API to ensure all 48 news articles and 24 blog posts are captured without data loss.

### Full Table Schema & Inventory

#### 1. `news` (Local: 44, Production: 48) — Editorial Content
- `id`: `INTEGER` (PK, Auto-increment)
- `title`: `TEXT NOT NULL`
- `subtitle`: `TEXT NOT NULL`
- `category`: `TEXT NOT NULL` (e.g. *Executive Briefing*, *University Perspective*, *Transatlantic Transcript*, *Deal Radar*)
- `author_name`: `TEXT NOT NULL`
- `author_avatar`: `TEXT NOT NULL`
- `date_published`: `TEXT NOT NULL` (ISO format `YYYY-MM-DD`)
- `read_time_mins`: `INTEGER NOT NULL`
- `content_body`: `TEXT NOT NULL` (Rich Markdown content with headings, lists, quotes, tables)
- `pull_quote`: `TEXT NOT NULL`
- `tags`: `TEXT NOT NULL` (JSON array of string tags, e.g. `["Deal Radar", "M&A", "Switzerland"]`)
- `image_url`: `TEXT` (Relative path e.g. `/uploads/what_amazon_and_catl_reveal_...jpg` or external URL)
- `student_author_id`: `INTEGER` (Foreign key referencing `student_profiles.id`)
- `focus_keyword`: `TEXT` (SEO focus keyword)
- `meta_title`: `TEXT` (SEO custom title tag)
- `meta_description`: `TEXT` (SEO meta description)
- `slug`: `TEXT` (URL slug, e.g. `what-amazon-and-catl-reveal-about-kuehne-nagel`)
- `schema_markup`: `TEXT` (JSON-LD structured data)

#### 2. `blogs` (Rows: 4) — Editorial Content
- `id`: `INTEGER` (PK, Auto-increment)
- `title`: `TEXT NOT NULL`
- `subtitle`: `TEXT NOT NULL`
- `category`: `TEXT NOT NULL`
- `author_name`: `TEXT NOT NULL`
- `author_avatar`: `TEXT NOT NULL`
- `date_published`: `TEXT NOT NULL`
- `read_time_mins`: `INTEGER NOT NULL`
- `content_body`: `TEXT NOT NULL` (Markdown)
- `pull_quote`: `TEXT NOT NULL`
- `tags`: `TEXT NOT NULL` (JSON array)
- `image_url`: `TEXT`
- `focus_keyword`: `TEXT`
- `meta_title`: `TEXT`
- `meta_description`: `TEXT`
- `slug`: `TEXT`
- `schema_markup`: `TEXT`

#### 3. `companies` (Rows: 17) — Editorial Directory Content
- `id`: `INTEGER` (PK, Auto-increment)
- `name`: `TEXT NOT NULL`
- `logo_bg`: `TEXT NOT NULL` (Hex color for company badge)
- `canton`: `TEXT NOT NULL` (2-letter cantonal code: ZH, BE, VD, BS, ZG, JU, etc.)
- `industry`: `TEXT NOT NULL` (e.g. *Manufacturing*, *Pharmaceuticals*, *Consumer Goods*, *Financial Services*)
- `size_class`: `TEXT NOT NULL` (*Large*, *Medium*, *Small*)
- `description`: `TEXT NOT NULL`
- `premium`: `INTEGER` (`0` or `1`)
- `verified`: `INTEGER` (`0` or `1` — Zefix commercial registry verification)
- `founded`: `INTEGER NOT NULL`
- `employees`: `INTEGER NOT NULL`
- `revenue_band`: `TEXT NOT NULL` (e.g. *CHF 10M - 25M*, *CHF > 1B*)
- `website`: `TEXT NOT NULL`
- `linkedin`: `TEXT NOT NULL`
- `contact_email`: `TEXT NOT NULL`
- `about_text`: `TEXT NOT NULL`
- `structured_data`: `TEXT NOT NULL` (JSON blob of subsidiaries, leadership, certifications)
- `esg_rating`: `INTEGER` (1–100 score)
- `sustainability_summary`: `TEXT`
- `focus_keyword`: `TEXT`
- `meta_title`: `TEXT`
- `meta_description`: `TEXT`
- `slug`: `TEXT`
- `schema_markup`: `TEXT`
- `tags`: `TEXT` (JSON array)

#### 4. `interviews` (Rows: 6) — Editorial Content
- `id`: `INTEGER` (PK, Auto-increment)
- `title`: `TEXT NOT NULL`
- `subtitle`: `TEXT NOT NULL`
- `interviewee_name`: `TEXT NOT NULL`
- `interviewee_title`: `TEXT NOT NULL`
- `interviewee_avatar`: `TEXT NOT NULL`
- `company_id`: `INTEGER` (FK referencing `companies.id`)
- `company_name`: `TEXT NOT NULL`
- `date_published`: `TEXT NOT NULL`
- `read_time_mins`: `INTEGER NOT NULL`
- `audio_url`: `TEXT` (Audio file path, e.g. `/uploads/audio/...`)
- `qa_content`: `TEXT NOT NULL` (Structured JSON array or Markdown of interview questions & answers)
- `student_author_id`: `INTEGER` (FK to `student_profiles.id`)
- `category`: `TEXT` (Default: *Executive Briefing*)
- `focus_keyword`, `meta_title`, `meta_description`, `slug`, `schema_markup`, `tags`

#### 5. `morning_briefings` (Rows: 2) — Editorial Audio Briefings
- `id`: `INTEGER` (PK, Auto-increment)
- `title`: `TEXT NOT NULL`
- `date`: `TEXT NOT NULL` (`YYYY-MM-DD`)
- `image_url`: `TEXT`
- `audio_url`: `TEXT NOT NULL` (Path in `/uploads/audio/...`)
- `audio_duration`: `INTEGER` (Duration in seconds)
- `transcript`: `TEXT` (Full text transcript of morning podcast)
- `linked_articles`: `TEXT` (JSON array of article IDs featured in the briefing)
- `status`: `TEXT` (*published* or *draft*)
- `created_at`: `TEXT NOT NULL`
- `updated_at`: `TEXT NOT NULL`

#### 6. `student_profiles` (Rows: 3) — Academic Editorial Contributor Data
- `id`: `INTEGER` (PK, Auto-increment)
- `name`: `TEXT NOT NULL`
- `university`: `TEXT NOT NULL` (e.g. *University of St. Gallen (HSG)*, *ETH Zurich*)
- `study_field`: `TEXT NOT NULL`
- `avatar`: `TEXT NOT NULL`
- `grad_year`: `INTEGER NOT NULL`
- `portfolio_url`: `TEXT NOT NULL`
- `bio`: `TEXT NOT NULL`
- `email`: `TEXT`
- `phone_number`: `TEXT`
- `birth_date`: `TEXT`
- `skills`: `TEXT` (JSON array)
- `experience`: `TEXT` (JSON array)

#### 7. `jobs` (Rows: 4) — Application / Directory Listings
- `id`: `INTEGER` (PK, Auto-increment)
- `title`: `TEXT NOT NULL`
- `type`: `TEXT NOT NULL` (*Praktikum*, *Full-time*, *Trainee Program*)
- `description`: `TEXT NOT NULL`
- `company_id`: `INTEGER` (FK to `companies.id`)
- `company_name`: `TEXT NOT NULL`
- `location`: `TEXT NOT NULL`
- `apply_url`: `TEXT NOT NULL`
- `date_posted`: `TEXT NOT NULL`
- `focus_keyword`, `meta_title`, `meta_description`, `slug`, `schema_markup`, `category`, `tags`

#### 8. `pages` (Rows: 4) — Editorial Layout Settings
- `id`: `INTEGER` (PK, Auto-increment)
- `path`: `TEXT UNIQUE NOT NULL` (e.g. `/`, `/unternehmen`, `/news`)
- `title`: `TEXT NOT NULL`
- `meta_description`: `TEXT NOT NULL`
- `blocks_layout`: `TEXT NOT NULL` (JSON array of block identifiers)
- `ads_enabled`: `INTEGER` (0 or 1)

#### 9. `ads` (Rows: 8) — Commercial Ad Campaigns
- `id`: `INTEGER` (PK, Auto-increment)
- `name`: `TEXT NOT NULL`
- `type`: `TEXT NOT NULL` (*leaderboard*, *rectangle*, *spotlight*)
- `position`: `TEXT NOT NULL` (*top*, *sidebar*, *inline*)
- `company_id`: `INTEGER` (FK to `companies.id`)
- `status`: `TEXT NOT NULL` (*active*, *paused*)
- `impressions`: `INTEGER DEFAULT 0`
- `clicks`: `INTEGER DEFAULT 0`
- `image_url`: `TEXT`
- `start_date`: `TEXT NOT NULL`
- `end_date`: `TEXT NOT NULL`
- `geo_swiss_only`: `INTEGER DEFAULT 1`

#### 10. `translations` (Rows: 5,498) — Localization Dictionary
- `language_code`: `TEXT NOT NULL` (`de`, `fr`, `en`, `ar`)
- `key_hash`: `TEXT NOT NULL` (MD5 hash of UI string key)
- `key`: `TEXT NOT NULL` (Original string)
- `translated_text`: `TEXT NOT NULL`
- `status`: `TEXT NOT NULL` (*reviewed*, *auto-only*)

#### 11. `users` (Rows: 4) — Application Authentication Data
- `id`: `INTEGER` (PK, Auto-increment)
- `email`: `TEXT UNIQUE NOT NULL`
- `password_hash`: `TEXT NOT NULL` (Plain text / simple hash in existing app)
- `role`: `TEXT NOT NULL` (`admin`, `student`, `company`)
- `profile_id`: `INTEGER`

---

## 4. Content vs. Application Data Classification

| Data Category | Tables | Destination Strategy in EmDash / Astro Migration |
| :--- | :--- | :--- |
| **Editorial Content** | `news`<br>`blogs`<br>`companies`<br>`interviews`<br>`morning_briefings`<br>`pages` | **EmDash Collections:**<br>- `posts` (news + blogs with category & tag taxonomies)<br>- `companies` (custom collection with cantonal and industry fields)<br>- `interviews` (custom collection with audio & Q&A fields)<br>- `briefings` (custom collection for daily podcasts)<br>- `pages` (EmDash built-in pages) |
| **Editorial Taxonomies** | Categories, Tags, Cantons, Industries | **EmDash Taxonomies & Collections:**<br>- `category` taxonomy<br>- `tag` taxonomy<br>- `canton` select field or taxonomy |
| **Editorial Contributors** | `student_profiles` | **EmDash Authors / Guest Bylines:**<br>- Mapped to EmDash users or reusable author bylines with university & bio fields. |
| **Application / Non-CMS Data** | `ads` (impressions/clicks counters)<br>`jobs`<br>`users` (portal accounts) | **Astro Endpoints + Postgres Application Schema:**<br>- Kept in isolated PostgreSQL application tables (separate from EmDash core schema).<br>- Admin management can either be custom Astro endpoints or an EmDash native admin plugin. |
| **Localization Data** | `translations` (5,498 rows) | **Astro i18n / EmDash i18n:**<br>- Leveraged for static Astro UI localization (`de`, `fr`, `en`, `ar`) via JSON dictionary. |

---

## 5. API Routes, Middleware, Forms & Integrations

### API Routes in Current Server
1. **News & Blogs:**
   - `GET /api/news`, `GET /api/news/:id`, `POST /api/news`, `PUT /api/news/:id`, `DELETE /api/news/:id`
   - `GET /api/blogs`, `GET /api/blogs/:id`, `POST /api/blogs`, `PUT /api/blogs/:id`, `DELETE /api/blogs/:id`
2. **Companies:**
   - `GET /api/companies`, `GET /api/companies/:id`, `POST /api/companies`, `PUT /api/companies/:id`, `DELETE /api/companies/:id`
3. **Morning Briefings:**
   - `GET /api/morning-briefings/active`, `GET /api/morning-briefings`, `GET /api/morning-briefings/:id`, `POST /api/morning-briefings`, `PUT /api/morning-briefings/:id`, `DELETE /api/morning-briefings/:id`
   - `POST /api/morning-briefings/upload-audio`
   - `POST /api/morning-briefings/transcribe`
4. **Students & Jobs:**
   - `GET /api/jobs`, `POST /api/jobs`, `PUT /api/jobs/:id`, `DELETE /api/jobs/:id`
   - `GET /api/students`, `GET /api/students/:id`, `PUT /api/students/:id`
5. **System & Analytics:**
   - `GET /api/stats` (Macroeconomic data)
   - `GET /api/markets/ticker` (Yahoo Finance & FX exchange rates live feed with 60s cache)
   - `GET /api/pages`, `GET /api/pages/by-path`
   - `GET /api/translations`
   - `POST /api/upload` (Base64 image upload)
   - `POST /api/admin/ads/:id/impression`, `POST /api/admin/ads/:id/click`
6. **Authentication:**
   - `POST /api/auth/login`
   - `POST /api/auth/signup`
7. **Sitemap:**
   - `GET /sitemap.xml` (Generates real-time XML sitemap with Google News schema)

### Middleware & Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- CORS enabled for client
- Express JSON body parser with 50MB limit (for base64 image/audio uploads)

### External Integrations & APIs
- **Google Analytics 4:** Measurement ID `G-419KS1C39Z` in `index.html`.
- **Yahoo Finance API:** Queried server-side for `^SSMI`, `^GSPC`, `^IXIC`, `GC=F`, `BZ=F`, `^TNX`.
- **Open Exchange Rates API:** `https://open.er-api.com/v6/latest/USD` for USD/CHF and EUR/CHF.
- **OpenAI Whisper API (optional):** Referenced in `server/routes/morning-briefing.routes.js` for audio transcription if `OPENAI_API_KEY` is provided.

---

## 6. Media & Static Assets

- **Image Storage Locations:**
  - `server/uploads/` (Contains 40+ high-res JPEG/PNG images for articles and corporate logos)
  - `public/uploads/` (Mirrored static copy)
  - `dist/uploads/` (Build output)
- **Audio Storage Location:**
  - `server/uploads/audio/` (Contains `.mp3` and `.webm` morning briefing recordings)
- **How Media is Referenced:**
  - URL paths stored in DB: `/uploads/<filename>.jpg` or `/uploads/audio/<filename>.mp3`
  - Served via Express static middleware at mount `/uploads`.
- **Target Migration to EmDash:**
  - EmDash provides native media management (`directory: "./data/uploads"`, `baseUrl: "/_emdash/api/media/file"` or S3-compatible bucket).
  - Existing `/uploads/*` URLs can be kept with an Astro static/endpoint handler or rewritten cleanly without breaking external links.

---

## 7. SEO & Metadata Audit

- **Canonical URLs:** Handled dynamically via `https://privatesector.ch/` + clean path.
- **Title & Descriptions:** Defined per article in `meta_title` and `meta_description`.
- **Open Graph / Twitter Cards:** Present in `index.html` and overridden dynamically per route.
- **JSON-LD Schema Markup:** Stored per article in `schema_markup` column (`NewsArticle`, `Organization`, `FAQPage`).
- **Sitemap:** Custom real-time endpoint `/sitemap.xml` combining static routes, custom pages, companies, news, blogs, interviews, jobs, and morning briefings.
- **Robots:** `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`.

---

## 8. Frontend UI, Styling & Component Library

- **Styling System:** Pure CSS with Modern CSS Custom Properties (Variables) defined in `src/index.css`.
- **Theme:** Prestige Editorial Swiss Theme (Swiss Flag Red `#D52B1E`, Off-White Ivory `#FFFFFF`, Dark Borders `#000000`, Warm Surfaces `#F9F9F9`).
- **Fonts:**
  - Display: `Playfair Display` (Serif)
  - Sans-Serif: `Inter`
  - Monospace: `JetBrains Mono`
- **Icon Library:** `lucide-react`
- **Reusable Components:**
  - Navigation: `Navbar.jsx` (with real-time ticker bar, desktop nav, mobile slideout, language dropdown)
  - Layout: `SidebarLayout.jsx`, `Breadcrumbs.jsx`, `Footer`
  - Media & Visuals: `Hero.jsx`, `HomepageGraphics.jsx`, `DailyAudioNews.jsx`
  - Editorial: `CompanyCard.jsx`, `KnowledgePanel.jsx`, `TableOfContents.jsx`, `renderArticleContent.jsx`
  - SEO & Utilities: `SeoHead.jsx`, `RankMathSeoBox.jsx`, `SeoAnalyzer.jsx`, `CookieBanner.jsx`, `AdSlot.jsx`, `LanguageSwitcher.jsx`

---

## 9. Environment Variables Inventory

*(Names only, values never stored or printed)*
- `DATABASE_URL` (PostgreSQL connection string)
- `PORT` (Application HTTP port, default `5000` / `4321`)
- `NODE_ENV` (`production` / `development`)
- `OPENAI_API_KEY` (Optional transcription key for morning briefings)

*(New required EmDash environment variables for Phase 2):*
- `EMDASH_ENCRYPTION_KEY` (Generated via `npx emdash secrets generate`)
- `EMDASH_PREVIEW_SECRET` (Optional HMAC preview override)
- `EMDASH_IP_SALT` (Optional commenter hash salt)

---

## 10. Git Hygiene & Sensitive Artifacts Audit (Condition 7)

A rigorous audit of git tracking and repository history was executed:

1. **`.env` and `.env*` Files:**
   - **Git History Check:** `git log --all --full-history -- ".env*"` returned 0 commits.
   - **Current Disk Check:** No `.env` files are tracked in git history or currently committed.
   - **Vulnerability Found:** `.env` was **not present** in `.gitignore`. Anyone creating a `.env` locally risked accidentally committing it.
   - **Remediation:** `.env`, `.env.*`, and `.env.local` must be strictly added to `.gitignore`.
2. **`server/database.sqlite`:**
   - **Git Tracking Status:** `server/database.sqlite` **IS currently tracked** in git and has been committed historically (e.g. commits `e4f16fa`, `1e3ab9e`, `29004cc`).
   - In `.gitignore`, line 27 `# *.sqlite` is commented out.
   - **Remediation:** For the new Astro/EmDash site, all `.sqlite` files are strictly git-ignored.
3. **`server/uploads/` & `public/uploads/`:**
   - **Git Tracking Status:** Over 40 image files and audio recordings in `server/uploads/` are currently tracked in git.
   - **Remediation:** In the new EmDash site, all uploaded media will reside in dedicated media volumes (`/data/uploads` or S3 bucket) and are strictly git-ignored.

---

## 11. Multi-Language & Translations Audit (Condition 4)

1. **Editorial Articles (`news`, `blogs`, `interviews`):**
   - An exhaustive review of all 48 news articles and 24 blog posts confirmed that **editorial content exists in English only**.
   - There are no language columns, translation groups, or localized duplicate records in the database.
2. **UI Strings (`translations` Table):**
   - The `translations` table contains **5,498 UI dictionary rows** across four language codes:
     - `de` (German - reviewed)
     - `fr` (French - reviewed)
     - `en` (English - reviewed)
     - `ar` (Arabic - auto-only)
   - **Architectural Decision:** This table is strictly a UI localization dictionary, not content articles. It will be exported to a high-speed cached JSON dictionary (`translations_cache.json`) used by Astro's UI layout and React islands.
   - **RTL Support:** Full bidirectional styling support will be implemented: the root layout sets `<html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>` and CSS handles right-to-left alignment for Arabic viewers.

---

## 12. External Portals vs. EmDash CMS RBAC Audit (Condition 3)

1. **Student Contributor Workflow:**
   - University students (from HSG, ETH, UZH) log in to `/student-dashboard` via `src/features/students/views/StudentDashboard.jsx`.
   - Students update their personal academic profile (`PUT /api/students/:id`) and draft/submit news articles (`POST /api/news` with `student_author_id`).
2. **Company Directory Workflow:**
   - Companies register at `/register` (`POST /api/auth/signup` with role `company`).
   - Profile editing is currently controlled via administrative review.
3. **EmDash RBAC Evaluation:**
   - EmDash CMS has 5 built-in internal roles: `Subscriber (10)`, `Contributor (20)`, `Author (30)`, `Editor (40)`, and `Admin (50)`.
   - All 5 roles grant access to the internal CMS studio at `/_emdash/admin` via WebAuthn/Passkeys.
   - EmDash does **not** support row-level tenant isolation or public-facing student/company portal profiles out of the box. Giving students CMS Contributor accounts would expose the internal CMS interface and cross-student draft lists.
4. **Recommendation:**
   - Keep `users`, `student_profiles`, `companies`, `jobs`, and `leads` in the **PostgreSQL application schema (`app_schema`)**.
   - Use secure Astro API endpoints (`src/pages/api/students/[id].ts`, `src/pages/api/auth/*.ts`) with session cookies to manage student profile updates and article drafting.
   - Internal editors use `/_emdash/admin` with Passkey authentication to review and publish content.

