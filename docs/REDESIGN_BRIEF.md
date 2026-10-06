# PrivateSector.ch — Redesign Brief & Design System Specification
**Branch:** `astro-redesign` | **Standard:** Impeccable v4.4.0 & Ponytail Senior-Dev | **Inspiration:** Apple News & Google Material Design 3

---

## 1. Executive Summary & Aesthetic Direction

The old PrivateSector.ch layout relied on a 19th-century newspaper styling with Playfair Display serifs, rigid black/grey horizontal dividers, flat zero-elevation boxes, and cramped mobile spacing.

The new design completely rejects the old styling and embraces an **Apple & Google-grade modern digital media platform**:
- **Clarity & Focus (Apple):** Content takes center stage. Ultra-crisp neo-grotesque sans-serif typography (`Inter`), high-contrast body text, generous whitespace, smooth card corner radii (`rounded-2xl`), and subtle glassmorphic app-shell surfaces (`backdrop-blur-md bg-white/90`).
- **Tactile Depth & Hierarchy (Google):** Multi-layered ambient micro-shadows instead of flat borders, soft hover lifts, cohesive chip pills for categories and cantons, and structured information cards for Swiss corporate intelligence.
- **Strict Brand Continuity:** Preserves Swiss Red (`#D52B1E` / `#DC2626`), pure white (`#FFFFFF`), neutral slate dark canvas (`#0B0F19`), and deep charcoal ink (`#0F172A`).
- **1000% Content & URL Immutability:** 0 word changes, 0 slug alterations, 0 URL changes, preserved SEO tags, canonical URLs, and structured JSON-LD.

---

## 2. Design Directions Considered

| Direction | Typography | Surface & Elevation | Verdict |
| :--- | :--- | :--- | :--- |
| **Direction 1: Apple & Google Modern Digital Media (Chosen)** | Modern neo-grotesque (`Inter` / system-ui), fluid responsive scale | Multi-layered ambient shadows, soft `rounded-2xl` cards, frosted glass navigation, generous padding | **Selected (10/10):** Maximizes readability, modern premium feel, rapid scanability across mobile & desktop. |
| **Direction 2: Financial Terminal (Bloomberg/FT Hybrid)** | Compact monospace/sans mix | Dense grids, high contrast borders, zero shadow, small badges | **Rejected:** Overwhelming for casual readers, lacks visual warmth, poor mobile touch targets. |
| **Direction 3: Scandinavian Minimalist Magazine** | Editorial serif + ultra-thin grotesque | Pure flat whitespace, no shadows, low contrast muted grays | **Rejected:** Fails WCAG contrast standards, doesn't convey live financial/market urgency. |

---

## 3. Design Tokens

### 3.1 Color Palette
```css
/* Core Brand & Accents */
--color-swiss-red: #D52B1E;       /* Official Swiss Federal Red */
--color-swiss-red-hover: #B91C1C; /* Darkened for active/hover */
--color-swiss-red-light: #FEE2E2; /* Tinted for active tag chips */

/* Light Surfaces */
--color-bg-base: #F8FAFC;         /* Slate-50: ambient neutral background */
--color-bg-surface: #FFFFFF;      /* Pure white card elevation */
--color-bg-subtle: #F1F5F9;       /* Slate-100: interactive hovers & inputs */
--color-border-subtle: #E2E8F0;   /* Slate-200: subtle component outlines */
--color-border-strong: #CBD5E1;   /* Slate-300: input focus & active tabs */

/* Dark Surfaces (Dark Mode) */
--color-dark-bg: #0B0F19;         /* Slate-950: deep neutral slate background */
--color-dark-surface: #131B2E;    /* Slate-900: raised card surface */
--color-dark-subtle: #1E293B;     /* Slate-800: chip badges & divider lines */
--color-dark-border: #334155;     /* Slate-700: card borders */

/* Typography & Contrast (WCAG AAA compliant on white) */
--color-text-primary: #0F172A;    /* Slate-900: Headlines & lead body (contrast 15.8:1) */
--color-text-secondary: #334155;  /* Slate-700: Article body & descriptions (contrast 7.5:1) */
--color-text-muted: #64748B;      /* Slate-500: Metadata, timestamps, bylines (contrast 4.6:1) */
```

### 3.2 Elevation & Shadow System (Apple/Google Ambient Depth)
```css
/* Ambient soft multi-tier shadows */
--shadow-card-sm: 0 1px 3px 0 rgb(15 23 42 / 0.05), 0 1px 2px -1px rgb(15 23 42 / 0.05);
--shadow-card-md: 0 4px 6px -1px rgb(15 23 42 / 0.06), 0 2px 4px -2px rgb(15 23 42 / 0.04);
--shadow-card-lg: 0 10px 15px -3px rgb(15 23 42 / 0.07), 0 4px 6px -4px rgb(15 23 42 / 0.03);
--shadow-card-hover: 0 14px 24px -4px rgb(15 23 42 / 0.10), 0 6px 12px -4px rgb(15 23 42 / 0.05);
--shadow-glass-nav: 0 4px 20px -2px rgb(15 23 42 / 0.05);
```

### 3.3 Typography Hierarchy
- **Font Family:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Arabic Fallback:** `Noto Sans Arabic, "Segoe UI Arabic", Tahoma, sans-serif`
- **Scale:**
  - `Hero Headline / Title`: `2.25rem - 3rem` (36px–48px), bold (`font-bold`), tracking `-0.025em`, line-height `1.15`
  - `Section Heading (H2)`: `1.5rem - 1.875rem` (24px–30px), semibold (`font-semibold`), tracking `-0.02em`
  - `Subheading (H3)`: `1.125rem - 1.25rem` (18px–20px), medium (`font-medium`)
  - `Lead Paragraph`: `1.125rem` (18px), regular (`font-normal`), line-height `1.75`
  - `Body Text`: `1rem` (16px), regular (`font-normal`), line-height `1.65`, optimal measure `68ch`
  - `Metadata / Badges / Chips`: `0.75rem - 0.875rem` (12px–14px), medium (`font-medium`), tracking `0.02em`

---

## 4. Component Library Architecture

### 4.1 Shell (Navbar & Footer)
- **Navbar:** Sticky glassmorphic bar (`sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200/70 dark:border-slate-800/80`).
- **Logo:** `public/logo.png` with automatic dark-mode handling (light surface renders native dark text; dark surface applies brightness & inversion filter for crisp white lettering).
- **Navigation Links:** Horizontal pill links with soft hover backgrounds (`hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-3 py-1.5 transition-colors`).
- **Header Actions:** Quick Search trigger (Cmd+K style), Language Selector dropdown (`DE`, `FR`, `EN`, `AR`), and Dark Mode toggle.
- **Footer:** Multi-column clean footer with Swiss cross insignia, editorial mission statement, quick navigation links, compliance & contact info, and copyright notice.

### 4.2 Home Page Modules
1. **Market Ticker:** Sleek horizontal ticker showing key Swiss market indices (SMI, EUR/CHF, USD/CHF, Gold) with subtle trend arrows (green up, red down) and smooth hover-pause scrolling.
2. **Audio Briefing Player:** Prominent, beautifully styled daily briefing bar with Play/Pause button, audio waveform indicator, timestamp, and episode title.
3. **Hero Lead Story:** Split layout with large high-resolution featured image (`rounded-2xl shadow-md`), category badge chip, bold title, excerpt, and author byline.
4. **Editor's Choice / Top Stories Grid:** 3-column responsive card grid (`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all`).
5. **Swiss Companies Intelligence Bar:** Horizontal scrollable dossier cards featuring Swiss icons (Nestlé, Roche, Novartis, UBS, ABB) with headquarters canton, sector, and quick links.
6. **Executive Interviews:** Distinctive slate/indigo tinted cards highlighting exclusive Q&A discussions with leading Swiss business leaders.
7. **Latest News Stream:** Infinite-feel chronological stream with date markers and reading time indicators.

### 4.3 Article Detail Page (`/news/[slug]` & `/posts/[slug]`)
- **Breadcrumb Navigation:** Crisp breadcrumb with category link and home icon.
- **Header:** Category badge, title (`text-3xl md:text-4xl font-extrabold tracking-tight`), published date, reading time estimate, and author byline card.
- **Audio Briefing Player (inline):** If article has associated audio or daily briefing, inline audio player with scrubber.
- **Featured Image & Infographic:** Full-width responsive container (`rounded-2xl overflow-hidden shadow-md mb-8`) with subtle caption.
- **Article Body:** Markdown content styled with generous paragraph spacing (`mb-6`), clear `###` subsection questions, callout boxes for Swiss sector data, and zero word modification.
- **Sidebar Knowledge Panel:** Quick company dossier card (canton, industry, ticker) when relevant, related articles, and share buttons.

### 4.4 Company Directory (`/companies` & `/companies/[id]`)
- **Filters:** Canton filter (ZH, GE, BS, VD, ZG, etc.) and Industry filter (Banking, Pharma, Luxury, Tech).
- **Cards:** Clean card elevation displaying company name, logo placeholder/icon, canton badge, industry badge, employee scale, and website.
- **Detail Dossier:** Comprehensive company profile with key facts, related news coverage, and executive leadership notes.

### 4.5 Executive Interviews (`/interviews`)
- **Visuals:** Portrait photography containers with elegant vignette and quote highlight callouts.

### 4.6 Careers & Jobs (`/karriere`)
- **Cards:** Clean listing cards with company name, position title, location/canton, contract type, and direct "Bewerben / Apply" button.

### 4.7 Internationalization & RTL (DE, FR, EN, AR)
- Default direction `ltr`, switching to `dir="rtl"` for Arabic (`locale === 'ar'`).
- Fluid layouts avoiding hardcoded `left`/`right` in favor of logical properties (`ms-`, `me-`, `ps-`, `pe-` or responsive flex).
- German compound word safety: `hyphens-auto break-words` on all heading elements to prevent container blowouts.

---

## 5. Implementation Roadmap
- **Phase 1:** Design system tokens in `src/styles/index.css` & Global base layout (`Base.astro`, `Navbar.astro`, `Footer.astro`).
- **Phase 2:** Homepage complete redesign (`index.astro`, `NewsCard.astro`, `MarketTicker.astro`, `AudioPlayer.astro`).
- **Phase 3:** Article detail template (`[slug].astro` in `/news` and `/posts`).
- **Phase 4:** Directory templates (`/companies`, `/interviews`, `/karriere`, `/blogs`, `/ranking`, `/statistics`).
- **Phase 5:** Impeccable review pass (`audit`, `typeset`, `layout`, `polish`), browser screenshots, and verification.
