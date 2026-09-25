import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./server/database.sqlite');

async function syncLocalDb() {
  const res = await fetch('https://privatesector.ch/api/news');
  const liveNews = await res.json();
  console.log('Fetched', liveNews.length, 'articles from live.');

  for (const n of liveNews) {
    await new Promise((resolve, reject) => {
      db.get('SELECT id FROM news WHERE id = ? OR slug = ?', [n.id, n.slug], (err, row) => {
        if (err) return reject(err);
        const tagsStr = typeof n.tags === 'string' ? n.tags : JSON.stringify(n.tags || []);
        if (row) {
          const sql = 'UPDATE news SET title = ?, subtitle = ?, category = ?, author_name = ?, author_avatar = ?, date_published = ?, read_time_mins = ?, content_body = ?, pull_quote = ?, tags = ?, image_url = ?, student_author_id = ?, focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ? WHERE id = ?';
          db.run(sql, [
            n.title, n.subtitle, n.category, n.author_name, n.author_avatar,
            n.date_published, n.read_time_mins, n.content_body, n.pull_quote || '',
            tagsStr, n.image_url, n.student_author_id || null, n.focus_keyword || '',
            n.meta_title || '', n.meta_description || '', n.slug, n.schema_markup || '',
            row.id
          ], (updateErr) => {
            if (updateErr) return reject(updateErr);
            resolve();
          });
        } else {
          const sql = 'INSERT INTO news (id, title, subtitle, category, author_name, author_avatar, date_published, read_time_mins, content_body, pull_quote, tags, image_url, student_author_id, focus_keyword, meta_title, meta_description, slug, schema_markup) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
          db.run(sql, [
            n.id, n.title, n.subtitle, n.category, n.author_name, n.author_avatar,
            n.date_published, n.read_time_mins, n.content_body, n.pull_quote || '',
            tagsStr, n.image_url, n.student_author_id || null, n.focus_keyword || '',
            n.meta_title || '', n.meta_description || '', n.slug, n.schema_markup || ''
          ], (insertErr) => {
            if (insertErr) return reject(insertErr);
            resolve();
          });
        }
      });
    });
  }

  db.all('SELECT COUNT(*) as count FROM news', (err, rows) => {
    if (err) console.error(err);
    else console.log('Local DB sync complete. Total rows in local SQLite:', rows[0].count);
    db.close();
  });
}

syncLocalDb();
