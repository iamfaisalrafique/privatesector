# PrivateSector.ch — Comprehensive Site Redesign Inventory

**Document:** `docs/REDESIGN_INVENTORY.md`  
**Step:** Part C — Step C1: Learn the Site  
**Branch:** `astro-redesign`  
**Date:** October 6, 2026  
**Tools Active:** Impeccable Skill (v4.4.0), Stitch MCP, Tailwind CSS  
**Target Design Standard:** Apple & Google-grade UX/UI craftsmanship, clean spatial rhythm, refined micro-shadows, zero AI slop, Swiss precision.

---

## 1. Executive Summary & Audit Overview

A comprehensive audit was performed across the codebase (`src/` React SPA and `emdash-site/src/` Astro SSR) and live production (`https://privatesector.ch`) using headless browser automation across three standard viewports:
- **Mobile:** 360 × 800 px
- **Tablet:** 768 × 1024 px
- **Desktop:** 1280 × 900 px

### Design Transformation Mandate
- **The old design is completely rejected:** The dated "Swiss editorial" styling, heavy borders, serif headline overload (Playfair Display), and flat borders are cancelled.
- **New Target Aesthetic:** **Apple & Google-grade minimalist digital excellence**:
  - **Apple-grade refinement:** Fluid visual hierarchy, subtle multi-layered elevation shadows (`shadow-sm`, `shadow-md`, `shadow-lg` with soft ambient diffusion), rounded card radiuses (12px–16px), crisp typography (Inter / SF Pro-inspired modern geometric sans), glassmorphic subtle backdrops (`backdrop-blur-md bg-white/80`).
  - **Google-grade clarity:** Instant scanability, high accessibility contrast, clean interactive states, intuitive tactile affordances, robust data tables, and effortless mobile responsiveness.
  - **Brand Colors Kept:** Swiss Red (`#D52B1E` / `#E60000`), Pure White (`#FFFFFF`), Slate Neutral (`#F8FAFC` to `#0B0F19`), and deep charcoal ink (`#0F172A`).
  - **Zero Word / Slug Alterations:** 1000% exact fidelity on article texts, existing URLs, slugs, redirects, SEO meta tags, and auth logic.

---

## 2. Logo Contrast & Dark Surface Analysis

- **Asset Inspected:** `public/logo.png` (8550 × 3392 px, transparent background PNG).
- **Color Profile:** Swiss Red cross icon (`#D52B1E`) + Dark charcoal/black lettering (`#000000` / `#1E293B`).
- **Surface Testing:**
  - **Light Surfaces (`#FFFFFF`, `#F8FAFC`):** Superb legibility, crisp contrast, premium branding.
  - **Dark Surfaces (`#0B0F19`, `#1E293B`):** The dark text lettering has insufficient contrast against dark backgrounds.
- **Resolution & Action:**
  - On light surfaces: Render `public/logo.png` directly.
  - On dark surfaces: Provide a dark-mode variant with white lettering (`public/logo_dark.png` or CSS filter `brightness(0) invert(1)` masking the lettering while preserving the Swiss red cross emblem).

---

## 3. Comprehensive Inventory: Pages in Scope

### 1. Homepage (`/` or `index.astro`)
- **Content Blocks:**
  - Global Header & Navigation (Ticker bar + Primary Navigation + Search trigger + Language Switcher + User Login button).
  - Live Market Ticker: Transatlantic indices (SMI, S&P 500, USD/CHF, EUR/CHF, Top Swiss Stock Movers).
  - Daily Morning Audio Briefing Player: Today's briefing title, audio duration, custom player controls (Play/Pause, scrub bar, volume, speed).
  - Hero Section: Editorial spotlight / breaking intelligence banner.
  - Featured Market Analysis & Top Stories: Primary lead article with large photography + secondary card grid (category badge, title, subtitle, read time, byline).
  - Company Directory Spotlight: Quick-filter company badges (Nestlé, Novartis, Roche, UBS, Rolex, Bühler) with status indicators.
  - Executive Interviews & Podcasts Carousel: Audio interview cards with interviewee portrait, role, and direct listen link.
  - Swiss Career Opportunities Grid: Latest mandates and student trainee listings.
  - Global Footer: Navigation columns, language switcher, copyright, Swiss flag emblem, student portal link.
- **Interactive Elements:**
  - Audio play/pause & scrubber, category tab switcher, live search bar, newsletter subscribe box, sticky navigation bar.

### 2. News Index & Category Feeds (`/news`, `/posts`, `/category/[slug]`, `/tag/[slug]`)
- **Content Blocks:**
  - Category / Topic Header (e.g., Executive Briefing, Deal Radar, Transatlantic Transcript, SoCal Gateway, Trade Policy Pulse).
  - Filter / Search Bar: Search input with instant filtering by keyword, sector, and date.
  - Article Grid: Responsive 3-column desktop / 2-column tablet / 1-column mobile card layout.
  - Pagination / Load More: Infinite scroll or numbered pagination.
- **Content Types:** News articles, market briefs, regulatory updates.
- **Interactive Elements:** Category pills, tag badges, search input, sort dropdown (Newest, Most Read).

### 3. Article Detail Template (`/news/[slug]`, `/posts/[slug]`)
- **Content Blocks:**
  - Breadcrumbs navigation (`Home > News > Category > Title`).
  - Article Header: Eyebrow category, published date, read time (mins), byline badge (`PrivateSector Intelligence`).
  - Title & Subtitle.
  - Featured Media Container: High-resolution photography with caption and alt text.
  - Article Body: Rendered Portable Text blocks (H2, H3, paragraphs, blockquotes, bullet lists, data tables, callouts).
  - Pull Quote Card: Prominent quote container with red accent border.
  - Share Bar: Copy link, LinkedIn, Twitter/X, WhatsApp share triggers.
  - Knowledge Panel / Related Entities: Associated Swiss companies with links to profiles.
  - Related Stories: 3-card grid of contextually relevant articles.
- **Interactive Elements:** Reading progress indicator, social share buttons, table of contents scroll-spy.

### 4. Company Directory (`/companies`, `/unternehmen`)
- **Content Blocks:**
  - Header: Directory statistics summary (e.g., "17 Leading Swiss Enterprises, CHF 380B+ Combined Transatlantic Revenue").
  - Filter Panel: Canton filter (ZH, BS, VD, GE, BE, SG, ZG), Industry filter (Pharma, Finance, Food & Ag, Precision Engineering, Tech), Size class, Premium/Verified toggles.
  - Company Card Grid: Company logo/color-mark, legal name, canton badge, industry tag, employee count, founded year, revenue band, verified badge.
- **Interactive Elements:** Search by company name, multi-select filters, sort by employees / founding year.

### 5. Company Profile (`/companies/[id]`, `/unternehmen/[id]`)
- **Content Blocks:**
  - Header Banner: Brand color background, company name, verification checkmark, headquarters, founded year, website link.
  - Quick Metric Chips: Canton, Industry, Headcount, Revenue band, ESG rating.
  - About Section: Deep narrative overview of transatlantic operations and US market footprint.
  - Structured Data & Financial Highlights.
  - Related News & Intelligence: Live feed of news articles tagging this company.
  - Career Listings: Active job postings originating from this company.
- **Interactive Elements:** Contact email trigger, external website link, tab switcher (Overview, News, Careers, ESG).

### 6. Interviews & Podcasts Directory (`/interviews`)
- **Content Blocks:**
  - Header: "Transatlantic Dialogues: Swiss Executive Perspectives".
  - Audio Player Spotlight: Featured executive episode with streaming audio player.
  - Interview Grid: Executive portrait avatar, name, title, company badge, date, read time.
- **Interactive Elements:** In-card audio preview play button, filter by industry.

### 7. Interview Detail (`/interviews/[id]`)
- **Content Blocks:**
  - Hero Profile: Interviewee photo, name, title, company name, publication date.
  - Streaming Audio Player: Integrated waveform, play/pause, timecode, playback speed (1x, 1.25x, 1.5x).
  - Transcript / Q&A Content: Formatted questions (`### Q`) and executive answers with high typographic legibility.
- **Interactive Elements:** Audio scrubber, jump-to-timestamp links, download/share audio.

### 8. Podcasts & Morning Briefing Player (`/api/morning-briefings/active`, Modal/Widget)
- **Content Blocks:**
  - Daily Briefing Title & Date.
  - Audio waveform and scrubbing controls.
  - Executive Summary transcript.
  - Linked News Articles: Direct cards linking to the stories covered in the briefing.
- **Interactive Elements:** Persistent bottom audio bar / floating mini-player across pages.

### 9. Careers / Jobs Board (`/careers`, `/karriere`)
- **Content Blocks:**
  - Header: "Swiss Executive & Commercial Career Board".
  - Search & Filters: Canton, Department (Operations, Finance, R&D), Type (Full-time, Internship, Trainee).
  - Job Listing Rows / Cards: Job title, company name, location, employment type pill, date posted, "Apply" CTA.
  - Job Detail View: Responsibilities, qualifications, company overview, apply external URL link.
- **Interactive Elements:** Search input, filter dropdowns, external application redirect.

### 10. Cross-Border Rankings (`/ranking`, `/cross-border-ranking`)
- **Content Blocks:**
  - Header: Methodology overview & index criteria.
  - Interactive Ranking Table: Rank (#1..#17), Company name, Canton, Market Cap / Revenue, US Investment Score, Growth %, Verified badge.
- **Interactive Elements:** Column sortable headers, export/share data, search within table.

### 11. Statistics & Macro Dashboard (`/statistics`, `/statistiken`)
- **Content Blocks:**
  - Macro KPI Cards: Transatlantic trade volume, Swiss FDI in the US, Bilateral workforce, Currency exchange index.
  - Chart Containers: Clean SVG/Canvas data visualizations (Trade flow trends, Canton distribution).
- **Interactive Elements:** Time range selector (1Y, 3Y, 5Y), metric toggle.

### 12. Student Profile & Portal Dashboard (`/student/profile`, `/features/students`)
- **Content Blocks:**
  - Student Byline Header: Student journalist name, university affiliation (ETH Zurich, HSG, EPFL, Uni Basel), bio.
  - Published Articles Counter & List.
  - Mandate / Submission Status.
- **Interactive Elements:** Edit profile form, avatar upload, draft submissions list.

### 13. Student Article Submit Form (`/api/student/submit`, `/student/submit`)
- **Content Blocks:**
  - Submission Form: Title, Subtitle, Category select, Body editor / Markdown input, University email validation, File upload for draft infographic.
  - Guidelines callout: Editorial integrity guidelines, word count meter.
- **Interactive Elements:** Live character/word count, draft save, submit for editorial review.

### 14. Authentication & Portal Login (`/login`, `/api/portal/...`)
- **Content Blocks:**
  - Clean card container with brand logo.
  - Email & Password inputs.
  - "Forgot password?" modal trigger.
  - Student / Corporate portal toggle.
- **Interactive Elements:** Form validation, password visibility toggle, error toast notification, CSRF-protected submit.

### 15. Static Editorial Pages (`/about`, `/contact`)
- **About:** Mission statement, Swiss-US business focus, editorial board, editorial standards and ethics.
- **Contact:** Editorial inquiry form, press office email, Zurich headquarters address, response SLA.
- **Interactive Elements:** Contact submission form with validation.

### 16. Blogs Index (`/blogs`, `/blogs/[...slug]`)
- **Content Blocks:**
  - Header: "Market Perspectives & Strategic Commentary".
  - Clean 2-column card layout displaying the 2 unique in-depth analysis articles.
  - Read time, author byline, featured media preview.
- **Interactive Elements:** Article navigation.

### 17. 404 Error Page (`/404`)
- **Content Blocks:**
  - Clean minimalist layout: "Page Not Found", helpful search bar, quick links back to News, Companies, or Homepage.

---

## 4. Interactive Components & States in Scope

| Component | Interaction States | Accessibility (a11y) & Edge Cases |
| :--- | :--- | :--- |
| **Navigation Bar** | Sticky on scroll, mobile hamburger drawer, desktop dropdowns, active link pill indicator. | `aria-expanded`, keyboard tab navigation, focus rings (`focus-visible:ring-2 ring-red-500`). |
| **Language Switcher** | Dropdown / pill selector for `en`, `de`, `fr`, `ar`. | Preserves current page path with `?lang=` or route prefix; triggers `dir="rtl"` when `ar` is selected. |
| **Audio Player** | Play, Pause, 10s skip backward/forward, scrub bar drag, speed toggle (1x, 1.25x, 1.5x), persistent mini-bar. | Keyboard spacebar toggle, `aria-label`, handles audio error / offline graceful state. |
| **Article Cards** | Hover elevation lift (`hover:-translate-y-1 hover:shadow-lg transition-all duration-200`), image zoom. | Whole-card clickable via stretched link or semantic anchor, image fallback `onerror`. |
| **Search & Filters** | Debounced instant text filter, multi-select canton/industry pills with count badges. | Clear-all button, empty state ("No articles found matching criteria"), mobile drawer. |
| **Data Tables** | Column sort (asc/desc), hover row highlight, sticky column headers. | Responsive horizontal scroll with shadow indicators, mobile card fallback. |
| **Forms (Login/Contact)** | Floating label or crisp placeholder, inline validation errors, disabled submit button while loading. | `autocomplete`, `aria-describedby` error messages, high-contrast inputs. |

---

## 5. Responsive Behavior Matrix (Mobile, Tablet, Desktop)

1. **Mobile (360px–639px):**
   - Single-column linear flow with 16px lateral padding (`px-4`).
   - Sticky top bar with logo and mobile drawer menu trigger.
   - Horizontal swipeable pills for categories and cantons.
   - Compact audio player bar docked to the bottom of the screen.
   - Long German compound words (e.g., *Unternehmenssteuerreform*, *Präzisionsmechanik*) handled with `hyphens-auto break-words`.
2. **Tablet (768px–1023px):**
   - 2-column grid for articles and companies.
   - Expanded top header with direct primary links.
   - Side drawer for advanced filters on directory and rankings pages.
3. **Desktop (1280px+):**
   - 1200px / 1440px max-width container with generous whitespace (`py-12 px-8`).
   - 3-column article grid, sticky sidebar for knowledge panels and market tickers.
   - Full expanded data tables with sortable columns.

---

## 6. Target Design System Tokens (Apple & Google Standard)

- **Typography:** Modern Swiss Sans system font stack (`Inter`, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif).
- **Elevation & Shadows:**
  - Subtle Apple-grade card shadow: `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)`
  - Elevated hover shadow: `box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)`
  - Floating player shadow: `box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)`
- **Borders & Radiuses:**
  - Card radius: `12px` (`rounded-xl`)
  - Pill / Button radius: `9999px` (`rounded-full`) or `8px` (`rounded-lg`)
  - Subtle borders: `border border-slate-200/80 dark:border-slate-800`
- **Surface Palette:**
  - Light mode canvas: `#F8FAFC` (Slate 50)
  - Card surface: `#FFFFFF` (Pure White)
  - Dark mode canvas: `#0B0F19` (Deep Charcoal Navy)
  - Dark mode card: `#151D2F`
  - Accent Red: `#D52B1E` / `#DC2626` (Swiss Federal Red)
  - Accent Blue: `#2563EB` (for financial and verified metrics)

---

## 7. Next Step: Step C2 Design Brief & Plan

With the site thoroughly inventoried, the next step is **STEP C2: DESIGN BRIEF**, establishing the concrete component system, Tailwind configuration, layout blueprints, and page-by-page transformation plan.
