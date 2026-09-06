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

const title = "Nestlé Accelerates Its Growth Strategy as Organic Sales Improve and Portfolio Transformation Advances";
const subtitle = "Helping executives, investors and entrepreneurs understand the business developments that matter between Switzerland and Southern California.";
const category = "Consumer Goods";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-08";
const read_time_mins = 5;
const pull_quote = "The planned water-business joint venture shows that Nestlé is prepared to make substantial structural changes rather than depend only on incremental improvements.";
const tags = JSON.stringify(["Nestlé", "Food & Beverages", "Platinum Equity", "Southern California", "Organic Sales", "Portfolio Transformation"]);
const image_url = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600";
const focus_keyword = "Nestlé growth strategy";
const meta_title = "Nestlé Accelerates Growth Strategy & Portfolio Transformation — PrivateSector Intelligence";
const meta_description = "Nestlé reports organic sales growth of 3.6% for H1 2026 and announces €4.9B water business joint venture with LA-based Platinum Equity.";
const slug = "nestle-accelerates-growth-strategy-organic-sales-improve";

const content_body = `Nestlé reported CHF 43.1 billion in sales for the first half of 2026, with organic growth of 3.6%. Real internal growth improved during the period, rising from 1.2% in the first quarter to 1.8% in the second quarter, while foreign-exchange movements reduced reported sales. The company also advanced a major portfolio transformation by agreeing to establish a joint venture for its water and premium beverages business with Platinum Equity.

### Main Story

Nestlé is combining stronger underlying sales momentum with a broad effort to simplify its portfolio and sharpen its strategic focus.

During the first half of 2026, the Swiss consumer-goods group generated 3.6% organic growth, including pricing growth of 2.1% and real internal growth of 1.5%. Real internal growth improved during the second quarter and was positive across all product categories, with particularly strong performance in emerging markets.

Reported sales reached CHF 43.1 billion, although adverse currency movements had a negative impact of 6.2%. Nestlé stated that it remained on track with its 2026 guidance as it continued investing in growth, operational execution and stronger brand performance.

At the same time, Nestlé announced a significant restructuring of its water and premium beverages operations. The company agreed to establish a joint venture called Peranel with U.S.-based investment firm Platinum Equity. The transaction values the new business at approximately €4.9 billion, with Nestlé expecting around €3 billion in cash proceeds.

The new venture will include internationally recognised brands such as Perrier, S.Pellegrino, Acqua Panna and Nestlé Pure Life. The move is intended to give the water business greater strategic flexibility while allowing Nestlé to concentrate resources on priority areas such as coffee, pet care, nutrition and food.

### Why This Matters

Nestlé is one of Switzerland’s most important global companies and one of the world’s largest food and beverage businesses.

Its performance influences:
- Global consumer markets
- Food and nutrition innovation
- International supply chains
- Agricultural sourcing
- Employment and investment
- Confidence in Swiss multinational companies

The latest results show that Nestlé is not relying only on price increases. Improving real internal growth indicates that underlying consumer demand and sales volumes are becoming more important contributors to performance.

The water-business transaction also demonstrates how a mature global company can reshape its portfolio, release capital and concentrate management attention on areas where it believes it can create stronger long-term growth.

### Executive Takeaway

For executives and investors, Nestlé’s current strategy offers an important lesson:

Large companies can protect long-term competitiveness by combining operational improvement with decisive portfolio transformation.

Nestlé is working to strengthen underlying demand, focus resources on its most strategic businesses and reduce complexity across the organisation.

### Switzerland ↔ Southern California Perspective

Southern California has strong ecosystems in food technology, consumer brands, nutrition science, sustainability, digital commerce and private investment.

Nestlé’s strategic transformation creates several areas of potential relevance for the region:
- Food-technology partnerships
- Nutrition and health innovation
- Sustainable packaging
- Digital consumer engagement
- Supply-chain technology
- Brand development and market testing
- Private-equity and corporate investment relationships

The partnership with Platinum Equity also provides a direct California connection. Platinum Equity is based in Los Angeles, making the water-business transaction a notable example of major corporate cooperation between a Swiss multinational and a Southern California investment firm.

### PrivateSector Insight

The most important message is not simply that Nestlé achieved 3.6% organic growth.

The deeper story is that the company is trying to improve three areas simultaneously:
- Underlying consumer demand
- Operational execution
- Strategic portfolio focus

The planned water-business joint venture shows that Nestlé is prepared to make substantial structural changes rather than depend only on incremental improvements.

For executives, the strategy demonstrates that scale alone does not guarantee future leadership. Even the world’s largest companies must continually simplify, invest, adapt and decide where they can create the greatest value.

For PrivateSector, the partnership with Los Angeles-based Platinum Equity is especially significant because it provides a concrete example of capital and strategic expertise moving between Switzerland and Southern California.

### Executive Conclusion

Nestlé’s first-half performance indicates improving underlying momentum, while its water-business transaction signals a broader effort to create a more focused and agile company.

For business leaders and investors, the central lesson is clear: sustainable growth requires both disciplined execution inside the company and the willingness to reshape the company when market conditions demand it.

---

Source: Nestlé official half-year results, investor materials and corporate announcements, supported by independent business reporting on the company's water and premium beverages transaction.`;

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
          focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?
        WHERE id = ?
      `);
      updateStmt.run([
        subtitle, category, author_name, author_avatar, date_published,
        read_time_mins, content_body, pull_quote, tags, image_url,
        focus_keyword, meta_title, meta_description, slug, row.id
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
          focus_keyword, meta_title, meta_description, slug
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([
        title, subtitle, category, author_name, author_avatar, date_published,
        read_time_mins, content_body, pull_quote, tags, image_url,
        focus_keyword, meta_title, meta_description, slug
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
