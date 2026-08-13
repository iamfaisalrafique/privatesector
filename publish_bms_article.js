import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
    process.exit(1);
  }
});

const title = "BMS Is Building a $2.3 Billion Pharma Campus in Houston. Where Could Swiss Industry Fit?";
const subtitle = "Bristol Myers Squibb has chosen Houston for a major advanced-manufacturing campus. The investment is confirmed. For Switzerland, the commercial opportunity may only be beginning.";
const category = "Pharmaceuticals";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-10";
const read_time_mins = 3;
const pull_quote = "We don't stop at the news. We find where the opportunity lies.";
const tags = JSON.stringify(["Bristol Myers Squibb", "BMS", "Houston", "Pharmaceuticals", "Advanced Manufacturing", "SKAN", "Aseptic Manufacturing"]);
const image_url = "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=600";
const focus_keyword = "Bristol Myers Squibb Houston campus Swiss industry";
const meta_title = "BMS $2.3B Houston Pharma Campus: Where Could Swiss Industry Fit?";
const meta_description = "Bristol Myers Squibb invests $2.3 billion in a new Houston advanced manufacturing campus. PrivateSector explores how Swiss isolator and aseptic production technology could fit.";
const slug = "bms-building-2-3b-pharma-campus-houston-swiss-opportunity";

const content_body = `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 10 AUGUST 2026 ◆ 3 MIN READ ◆ PHARMA ◆ ADVANCED MANUFACTURING

Bristol Myers Squibb has chosen Houston for a major advanced-manufacturing campus. The investment is confirmed. For Switzerland, the commercial opportunity may only be beginning.

Bristol Myers Squibb is investing $2.3 billion in a new pharmaceutical manufacturing campus at Generation Park in Houston, Texas. The approximately 600,000-square-foot facility is expected to manufacture small-molecule medicines, biologics and antibody-drug conjugates. Construction is planned to begin in 2027, with operations targeted for 2030 and nearly 500 permanent skilled jobs expected.

For most readers, that's the story. For us, that's where the story begins. A pharmaceutical campus of this scale requires sophisticated manufacturing technology, automation, sterile-production systems, testing, validation and specialist engineering — areas where Swiss industrial capabilities could become relevant.

---

## THE SWISS OPPORTUNITY

One company worth watching is SKAN, the Allschwil-based specialist in isolators and aseptic pharmaceutical-production technology.

**SKAN — HIGH FIT ◆ SIMILAR CASE — VERIFIED ◆ U.S. EXPERIENCE — VERIFIED ◆ BMS CONTRACT — UNCONFIRMED**

SKAN and filling-equipment specialist groninger previously supplied integrated filling and isolator systems for Civica's pharmaceutical manufacturing facility in Petersburg, Virginia. That does not mean SKAN will work on the BMS project. It does, however, provide documented evidence that its technology has already been deployed in sophisticated U.S. pharmaceutical manufacturing.

**POTENTIAL AREAS ◆ ASEPTIC MANUFACTURING ◆ AUTOMATION ◆ CLEANROOMS ◆ TESTING ◆ VALIDATION ◆ PRODUCTION EQUIPMENT ◆ ENGINEERING**

---

## OPPORTUNITY & RISK

**OPPORTUNITY — HIGH ◆ COMPETITION — HIGH ◆ TIMING — EARLY ◆ PROCUREMENT — NOT YET CLEAR**

A $2.3 billion pharmaceutical campus could generate meaningful demand for specialist technology and long-term supplier relationships. But global competition will be intense, and BMS has not yet made the relevant supplier landscape publicly clear. Construction is expected to begin in 2027, with operations targeted for 2030. This is an early commercial signal — not an available contract.

---

## OUR VIEW

The conventional headline is BMS invests $2.3 billion in Houston. The more interesting question for Switzerland is: What will that $2.3 billion need to buy — and which Swiss companies have already demonstrated that they could potentially deliver part of it?

SKAN gives us an early example because the capability match is supported by previous U.S. experience. We're not predicting a contract; we're identifying a credible signal early and following it as the project develops.

**SWISS FIT — STRONG ◆ EVIDENCE — VERIFIED ◆ CONTRACT — UNCONFIRMED ◆ NEXT SIGNAL — PROCUREMENT ◆ VERDICT — MONITOR CLOSELY**

- Engineering appointments
- Equipment orders
- Automation contracts
- Supplier announcements

**We don't stop at the news. We find where the opportunity lies.**`;

const schema_markup = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": title,
  "description": meta_description,
  "image": image_url,
  "datePublished": date_published,
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

db.serialize(() => {
  db.get('SELECT id FROM news WHERE title = ? OR slug = ?', [title, slug], (err, row) => {
    if (err) {
      console.error('Error querying database:', err);
      process.exit(1);
    }
    if (row) {
      console.log(`Article already exists with ID: ${row.id}. Updating content...`);
      const updateStmt = db.prepare(`
        UPDATE news SET 
          subtitle = ?, category = ?, author_name = ?, author_avatar = ?, date_published = ?,
          read_time_mins = ?, content_body = ?, pull_quote = ?, tags = ?, image_url = ?,
          focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?
        WHERE id = ?
      `);
      updateStmt.run([
        subtitle, category, author_name, author_avatar, date_published,
        read_time_mins, content_body, pull_quote, tags, image_url,
        focus_keyword, meta_title, meta_description, slug, schema_markup, row.id
      ], function(uErr) {
        if (uErr) console.error('Error updating article:', uErr);
        else console.log(`Article updated successfully with ID: ${row.id}`);
        updateStmt.finalize(() => db.close());
      });
    } else {
      const stmt = db.prepare(`
        INSERT INTO news (
          title, subtitle, category, author_name, author_avatar, date_published, 
          read_time_mins, content_body, pull_quote, tags, image_url, 
          focus_keyword, meta_title, meta_description, slug, schema_markup
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([
        title, subtitle, category, author_name, author_avatar, date_published,
        read_time_mins, content_body, pull_quote, tags, image_url,
        focus_keyword, meta_title, meta_description, slug, schema_markup
      ], function(iErr) {
        if (iErr) {
          console.error('Error inserting article:', iErr);
        } else {
          console.log(`Article inserted successfully with ID: ${this.lastID}`);
        }
        stmt.finalize(() => db.close());
      });
    }
  });
});
