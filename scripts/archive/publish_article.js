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

const title = "UBS Strengthens Its Position with Strong Quarterly Results and a New USD 3 Billion Share Buyback";
const subtitle = "UBS reports solid Q2 profit of USD 2.8B, announces new share buyback, and advances Credit Suisse integration.";
const category = "Financial Services";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-01";
const read_time_mins = 5;
const pull_quote = "A financially healthy UBS reinforces Switzerland's position as a trusted location for international business, cross-border investment and corporate banking services.";
const tags = JSON.stringify(["UBS", "Banking", "Share Buyback", "Credit Suisse", "Financial Services"]);
const image_url = "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600";
const focus_keyword = "UBS quarterly results";
const meta_title = "UBS Q2 Results & USD 3B Share Buyback — PrivateSector Intelligence";
const meta_description = "UBS delivers Q2 net profit of USD 2.8 billion, announces a new USD 3B share buyback, and advances Credit Suisse integration.";
const slug = "ubs-quarterly-results-3b-share-buyback";

const content_body = `UBS has delivered a stronger-than-expected second quarter, reporting solid financial performance driven by its wealth management and investment banking businesses. Alongside the results, the bank announced a new USD 3 billion share buyback programme and confirmed continued progress in integrating Credit Suisse.

### A Strong Quarter for Switzerland's Largest Bank

UBS reported quarterly net profit of USD 2.8 billion, exceeding market expectations. Revenue reached USD 13.7 billion, supported by strong client activity, continued growth in Global Wealth Management and resilient investment banking performance.

The bank also announced a new USD 3 billion share buyback programme, with at least USD 1 billion expected to be completed during the coming months. The announcement reflects management's confidence in the bank's capital position while continuing to invest in future growth.

### Credit Suisse Integration Continues

The integration of Credit Suisse remains one of UBS's most important strategic priorities.

According to the bank, the integration is progressing well, with significant cost savings already achieved and the majority of legacy systems being retired. UBS expects the integration programme to continue delivering operational efficiencies while strengthening the organisation for long-term growth.

### Why This Matters

UBS is not just Switzerland's largest bank—it is one of the country's most influential global companies.

Its performance affects:
- International investor confidence
- Corporate financing
- Global wealth management
- Switzerland's financial sector
- The country's reputation as a leading international business centre

Strong financial performance from UBS is therefore important not only for shareholders but also for the broader Swiss economy.

### Switzerland ↔ Southern California Perspective

For companies in Southern California considering expansion into Europe, Switzerland continues to provide one of the world's strongest financial ecosystems.

A financially healthy UBS reinforces Switzerland's position as a trusted location for international business, cross-border investment and corporate banking services.

### PrivateSector Insight

The most important message from these results is not simply higher quarterly profit.

UBS is demonstrating that it can simultaneously strengthen profitability, return capital to shareholders, complete one of Europe's largest banking integrations and continue investing in technology, including artificial intelligence.

For business leaders, investors and international companies, these developments reinforce Switzerland's position as a stable and innovative global financial centre.

---

Source: UBS quarterly results announcement and company statements, supported by reporting from major international financial news organisations.`;

db.serialize(() => {
  db.get('SELECT id FROM news WHERE title = ?', [title], (err, row) => {
    if (err) {
      console.error('Error querying database:', err);
      process.exit(1);
    }
    if (row) {
      console.log(`Article already exists with ID: ${row.id}`);
      db.close();
    } else {
      const stmt = db.prepare(`
        INSERT INTO news (
          title, subtitle, category, author_name, author_avatar, date_published, 
          read_time_mins, content_body, pull_quote, tags, image_url, 
          focus_keyword, meta_title, meta_description, slug
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([
        title, subtitle, category, author_name, author_avatar, date_published,
        read_time_mins, content_body, pull_quote, tags, image_url,
        focus_keyword, meta_title, meta_description, slug
      ], function(err) {
        if (err) {
          console.error('Error inserting article:', err);
        } else {
          console.log(`Article inserted successfully with ID: ${this.lastID}`);
        }
        stmt.finalize(() => {
          db.close();
        });
      });
    }
  });
});
