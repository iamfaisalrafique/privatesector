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

const ubsTitle = "UBS Strengthens Its Position with Strong Quarterly Results and a New USD 3 Billion Share Buyback";

db.serialize(() => {
  db.run('DELETE FROM news WHERE title != ?', [ubsTitle], function(err) {
    if (err) {
      console.error('Error removing other articles:', err);
    } else {
      console.log(`Successfully deleted ${this.changes} legacy articles from news table.`);
    }
  });

  db.all('SELECT id, title FROM news', [], (err, rows) => {
    if (err) {
      console.error('Error querying remaining news:', err);
    } else {
      console.log('Remaining articles in news table:', rows);
    }
    db.close();
  });
});
