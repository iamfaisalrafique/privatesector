import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgres://postgres:edcKM0253QrFib0sSl2JYZoj5If8DxbKVxgzmsBpQVI5HBHyQ9UBZ6gMi79z0AFD@62.72.44.254:1127/postgres";

async function main() {
  const client = new Client({ connectionString });
  
  try {
    console.log("Connecting to live PostgreSQL database...");
    await client.connect();
    console.log("Connected successfully!");

    const title = "KKR's $5.7 Billion Integer Acquisition Puts a U.S.–Swiss Medtech Connection in the Spotlight";
    const subtitle = "A major American private-equity transaction reaches directly into Switzerland's medical-technology ecosystem — and PrivateSector sees more than an acquisition.";
    const category = "Medical Technology";
    const author_name = "PrivateSector Intelligence";
    const author_avatar = "https://i.pravatar.cc/100?img=33";
    const date_published = "2026-08-09";
    const read_time_mins = 6;
    const pull_quote = "Something significant has changed. Switzerland is already inside the story. Pay attention to what happens next.";
    const tags = ["Integer Holdings", "KKR", "Medical Technology", "Biel/Bienne", "Private Equity", "Acquisition"];
    const image_url = "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600";
    const focus_keyword = "KKR Integer Holdings acquisition";
    const meta_title = "KKR's $5.7B Integer Acquisition & Swiss Medtech Connection";
    const meta_description = "KKR acquires Integer Holdings for $5.7 billion. Analyze the strategic impact on Integer's European headquarters in Biel/Bienne, Switzerland.";
    const slug = "kkr-integer-holdings-acquisition-swiss-medtech";

    const filePath = 'C:\\Users\\Faisal\\Downloads\\privatesector Radar .txt';
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at ${filePath}`);
      process.exit(1);
    }

    const rawText = fs.readFileSync(filePath, 'utf8');
    const lines = rawText.split(/\r?\n/);
    let startIndex = lines.findIndex(line => line.trim() === "EXECUTIVE SUMMARY");
    if (startIndex === -1) {
      startIndex = 16;
    }
    const contentBody = lines.slice(startIndex).join('\n').trim();

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

    // 1. Check existing news articles count and items in live Postgres
    const resCount = await client.query('SELECT count(*) FROM news');
    console.log("Current total news count in live database:", resCount.rows[0].count);

    const resCheck = await client.query('SELECT id, title, slug FROM news WHERE slug = $1 OR title = $2', [slug, title]);
    
    if (resCheck.rows.length > 0) {
      console.log("Article already exists in live database with ID:", resCheck.rows[0].id, "Updating...");
      await client.query(`
        UPDATE news SET
          title = $1, subtitle = $2, category = $3, author_name = $4, author_avatar = $5,
          date_published = $6, read_time_mins = $7, content_body = $8, pull_quote = $9,
          tags = $10, image_url = $11, focus_keyword = $12, meta_title = $13,
          meta_description = $14, schema_markup = $15
        WHERE id = $16
      `, [
        title, subtitle, category, author_name, author_avatar,
        date_published, read_time_mins, contentBody, pull_quote,
        JSON.stringify(tags), image_url, focus_keyword, meta_title,
        meta_description, schema_markup, resCheck.rows[0].id
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
        date_published, read_time_mins, contentBody, pull_quote,
        JSON.stringify(tags), image_url, focus_keyword, meta_title,
        meta_description, slug, schema_markup
      ]);
      console.log("Successfully inserted article with ID:", insertRes.rows[0].id);
    }

    // List all articles in live database
    const allArticles = await client.query('SELECT id, title, slug, date_published FROM news ORDER BY id DESC');
    console.log("Live News Articles List:");
    console.log(allArticles.rows);

  } catch (err) {
    console.error("Database operation failed:", err);
  } finally {
    await client.end();
  }
}

main();
