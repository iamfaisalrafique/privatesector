# EmDash Backend Diagnosis

## 1. Database Resolution

- **Adapter & Database Used:** The EmDash CMS dev server, admin UI, migration scripts, tests, and astro build are all reading from and writing to **SQLite** (`file:./data.db`) located at `d:\privatesector\emdash-site\data.db`.
- **Environment:** `EMDASH_DATABASE_URL` is completely empty in `.env`.
- **Processes:** `npm run dev` is running the Astro dev server on port 4321, using the local environment without Postgres flags.
- **Physical Locations & Counts:** 
  - `data.db` (`ec_posts`): 49 entries (including `post_1` through `post_43`, and a few ULIDs like `01M46JVR4JPE53E38MZDEMFNK8`).
  - `data.db` (`revisions`): Only 10 entries, none of which correspond to our target posts.
  - **Local PostgreSQL:** A local PostgreSQL 18 instance *is* running, containing a `privatesector_test` DB (created by a test script), but it does not contain EmDash tables like `ec_posts`.
- **Finding:** All processes are using the exact same database (`data.db`). H1 is false.

## 2. Headless Browser Reproduction

Using a Playwright trace script (`trace-editor.mjs`), we simulated a session logging in via the dev-bypass and accessing the editor for `01M46JVR4JPE53E38MZDEMFNK8`.
- **API Calls:** The frontend content API responds with `200 OK` and returns JSON containing `status: "draft"`, `liveRevisionId: null`, `draftRevisionId: null`, and the document `data` (with the article title "PostgreSQL Real-Time Swiss Market Liquidity" - this explains the user seeing "SQL/PostgreSQL-related text").
- **Editor Render:** The HTML renders with missing field bindings. React DevTools warnings fire.

## 3. Field-by-Field View

### Entry 1: Target Post (`01M46JVR4JPE53E38MZDEMFNK8`)
*(Created by `scripts/test-postgres-portal-suite.mjs` via the Student Submit API)*
- **(a) Database (`ec_posts`):** `status` = draft, `slug` = postgresql-real..., `locale` = en, `translation_group` = 01M..., **`live_revision_id` = null**, **`draft_revision_id` = null**, `featured_image` = null, `content` = valid PortableText JSON.
- **(b) API Response:** Returns the data payload successfully, but explicitly shows `liveRevisionId: null` and `draftRevisionId: null`.
- **(c) Editor Render:** Editor form is empty because EmDash relies on a valid revision to populate the interactive block editor.

### Entry 2: Synced Legacy Post (`post_1`)
*(Created by `sync_all_to_emdash.js` via raw SQL)*
- **(a) Database (`ec_posts`):** `status` = published, `slug` = news-1, `locale` = en, **`translation_group` = null**, **`live_revision_id` = null**, **`draft_revision_id` = null**, `featured_image` = `"/uploads/image.jpg"` (STRING).
- **(b) API Response:** Shows the same null revision references and missing translation group.
- **(c) Editor Render:** Empty/crashes because `featured_image` is a plain string instead of an EmDash media reference object, and because it has no revisions.

## 4. Hypothesis Testing & Root Causes

- **H1 (Different Database): FAIL.** Everything is correctly using SQLite (`data.db`).
- **H2 (Inserted Outside API / No Revisions): PASS.** The legacy migration script used raw `INSERT INTO ec_posts`, bypassing EmDash's revision system. The student submit API script also created documents that resulted in no revisions attached. 
- **H3 (Migrated Data Keys Mismatch): PASS (Partial).** The keys mostly match the schema, but fields like `translation_group` were entirely omitted by the raw SQL script.
- **H4 (Value Shapes are Wrong): PASS.** The `featured_image` was inserted as a plain URL string (e.g., `/uploads/...`). The `seed.json` schema defines it as an `image` type, which strictly expects an EmDash media library reference object (`{ _type: "reference", ref: "..." }`).
- **H5 (Missing Locale/Translation Group): PASS.** Synced legacy entries (like `post_1`) have a `null` `translation_group`. 
- **H6 (Editor Regenerates Slug): PASS.** Because the editor fails to load the content correctly (due to missing revisions or shape validation failures), the fields appear empty. If an editor interacts with the empty form, the slug auto-generation overrides the real slug.
- **H7 (Postgres Errors): FAIL.** The system is running on SQLite, not Postgres. The "PostgreSQL" text seen was just the literal title of the article `01M46JVR4JPE53E38MZDEMFNK8`.

## 5. Proposed Repair Plan (Part B)

1. **Purge Corrupt Data:** Truncate `ec_posts`, `ec_companies`, `ec_blogs`, etc. in `data.db` since the previous raw SQL sync permanently bypassed the revision history and polluted the system with invalid shapes.
2. **Use EmDash Import API/CLI:** We must rewrite the migration script to use EmDash's official TypeScript client (`@emdash-cms/client`) or CLI importer instead of raw SQL `DatabaseSync`.
3. **Fix Shapes:** Ensure images are first uploaded to EmDash's Media Library, retrieving their Media IDs, and then assigned to `featured_image` as `{ _type: "reference", _ref: "<MEDIA_ID>" }`.
4. **Preserve Legacy IDs:** Use a `legacy_id` field to maintain mappings if needed, while allowing EmDash to manage native ULIDs.
