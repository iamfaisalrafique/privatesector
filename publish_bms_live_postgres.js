import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgres://postgres:edcKM0253QrFib0sSl2JYZoj5If8DxbKVxgzmsBpQVI5HBHyQ9UBZ6gMi79z0AFD@62.72.44.254:1127/postgres";

async function publishBmsToLivePostgres() {
  const client = new Client({ connectionString });
  
  try {
    console.log("Connecting to live PostgreSQL database...");
    await client.connect();
    console.log("Connected successfully!");

    const title = "BMS Is Building a $2.3 Billion Pharma Campus in Houston. Where Could Swiss Industry Fit?";
    const subtitle = "Bristol Myers Squibb has chosen Houston for a major advanced-manufacturing campus. The investment is confirmed. For Switzerland, the commercial opportunity may only be beginning.";
    const category = "Pharmaceuticals";
    const author_name = "PrivateSector Intelligence";
    const author_avatar = "https://i.pravatar.cc/100?img=33";
    const date_published = "2026-08-10";
    const read_time_mins = 3;
    const pull_quote = "We don't stop at the news. We find where the opportunity lies.";
    const tags = ["Bristol Myers Squibb", "BMS", "Houston", "Pharmaceuticals", "Advanced Manufacturing", "SKAN", "Aseptic Manufacturing"];
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

    const resCheck = await client.query('SELECT id, title, slug FROM news WHERE slug = $1 OR title = $2', [slug, title]);

    if (resCheck.rows.length > 0) {
      console.log("Article already exists in live database with ID:", resCheck.rows[0].id, "Updating...");
      await client.query(`
        UPDATE news SET
          title = $1, subtitle = $2, category = $3, author_name = $4, author_avatar = $5,
          date_published = $6, read_time_mins = $7, content_body = $8, pull_quote = $9,
          tags = $10, image_url = $11, focus_keyword = $12, meta_title = $13,
          meta_description = $14, schema_markup = $15, slug = $16
        WHERE id = $17
      `, [
        title, subtitle, category, author_name, author_avatar,
        date_published, read_time_mins, content_body, pull_quote,
        JSON.stringify(tags), image_url, focus_keyword, meta_title,
        meta_description, schema_markup, slug, resCheck.rows[0].id
      ]);
      console.log("Updated article ID:", resCheck.rows[0].id);
    } else {
      console.log("Inserting new article into live database...");
      const insertRes = await client.query(`
        INSERT INTO news (
          title, subtitle, category, author_name, author_avatar,
          date_published, read_time_mins, content_body, pull_quote,
          tags, image_url, focus_keyword, meta_title, meta_description, slug, schema_markup
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) RETURNING id
      `, [
        title, subtitle, category, author_name, author_avatar,
        date_published, read_time_mins, content_body, pull_quote,
        JSON.stringify(tags), image_url, focus_keyword, meta_title,
        meta_description, slug, schema_markup
      ]);
      console.log("Successfully inserted article with ID:", insertRes.rows[0].id);
    }

    const allArticles = await client.query('SELECT id, title, slug, date_published FROM news ORDER BY id DESC LIMIT 10');
    console.log("Live News Articles List:");
    console.log(allArticles.rows);

  } catch (err) {
    console.error("Database operation failed:", err);
  } finally {
    await client.end();
  }
}

publishBmsToLivePostgres();
