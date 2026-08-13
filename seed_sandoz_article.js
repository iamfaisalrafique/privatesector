import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');
const mdPath = "C:\\Users\\Faisal\\Downloads\\America's Push to Bring Drug Production Home Puts Sandoz at a Strategic Crossroads.md";

const rawContent = fs.readFileSync(mdPath, 'utf8');

// Extract body after line 15 (after header tags and executive summary intro)
const lines = rawContent.split('\n');
const title = "America's Push to Bring Drug Production Home Puts Sandoz at a Strategic Crossroads";
const subtitle = "Sandoz is discussing potential U.S. manufacturing investment. PrivateSector examines what could come next — and where proven Swiss pharmaceutical capabilities may fit.";
const category = "Pharmaceuticals";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-09";
const read_time_mins = 7;
const pull_quote = "We don't stop at the news. We find where the opportunity lies.";
const tags = JSON.stringify(["Sandoz", "Pharmaceuticals", "Biosimilars", "U.S.-Swiss Industry", "SKAN", "SGS", "Manufacturing"]);
const image_url = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600";
const focus_keyword = "Sandoz US drug production manufacturing";
const meta_title = "America's Push for Drug Production Home Puts Sandoz at Crossroads";
const meta_description = "Sandoz discusses potential U.S. manufacturing investment. PrivateSector analyzes biosimilar growth, Swiss industrial capabilities (SKAN, SGS), and key risks.";
const slug = "americas-push-drug-production-home-puts-sandoz-strategic-crossroads";

// Find where content body starts (around line 17 "## EXECUTIVE SUMMARY")
const bodyStartIndex = lines.findIndex(line => line.trim().startsWith('## EXECUTIVE SUMMARY'));
const content_body = lines.slice(bodyStartIndex >= 0 ? bodyStartIndex : 16).join('\n');

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

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.get('SELECT id FROM news WHERE slug = ?', [slug], (err, row) => {
    if (err) {
      console.error('Error querying news:', err);
      return;
    }
    if (row) {
      console.log(`Article already exists in SQLite database with ID ${row.id}. Updating content...`);
      db.run(`
        UPDATE news SET 
          title = ?, subtitle = ?, category = ?, author_name = ?, author_avatar = ?, 
          date_published = ?, read_time_mins = ?, content_body = ?, pull_quote = ?, 
          tags = ?, image_url = ?, focus_keyword = ?, meta_title = ?, 
          meta_description = ?, schema_markup = ?
        WHERE slug = ?
      `, [
        title, subtitle, category, author_name, author_avatar, date_published,
        read_time_mins, content_body, pull_quote, tags, image_url,
        focus_keyword, meta_title, meta_description, schema_markup, slug
      ], function(uErr) {
        if (uErr) console.error('Error updating article:', uErr);
        else console.log('Article updated successfully.');
        db.close();
      });
    } else {
      console.log('Inserting new Sandoz article into SQLite database...');
      db.run(`
        INSERT INTO news (
          title, subtitle, category, author_name, author_avatar, date_published, 
          read_time_mins, content_body, pull_quote, tags, image_url, 
          focus_keyword, meta_title, meta_description, slug, schema_markup
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        title, subtitle, category, author_name, author_avatar, date_published,
        read_time_mins, content_body, pull_quote, tags, image_url,
        focus_keyword, meta_title, meta_description, slug, schema_markup
      ], function(iErr) {
        if (iErr) console.error('Error inserting article:', iErr);
        else console.log(`Article inserted successfully with ID ${this.lastID}.`);
        db.close();
      });
    }
  });
});
