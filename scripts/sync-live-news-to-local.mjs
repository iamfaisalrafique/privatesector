import { DatabaseSync } from 'node:sqlite';

async function checkAndSync() {
  const db = new DatabaseSync('server/database.sqlite');
  const localRows = db.prepare('SELECT id, slug, title FROM news').all();
  const localSlugs = new Set(localRows.map(r => r.slug));

  const res = await fetch('https://privatesector.ch/api/news');
  const liveRows = await res.json();

  const missing = liveRows.filter(r => !localSlugs.has(r.slug));
  console.log('Live total:', liveRows.length);
  console.log('Local total:', localRows.length);
  console.log('Missing from local count:', missing.length);

  const insertStmt = db.prepare(`
    INSERT INTO news (
      id, title, subtitle, category, author_name, author_avatar,
      date_published, read_time_mins, content_body, pull_quote,
      tags, image_url, student_author_id, focus_keyword,
      meta_title, meta_description, slug, schema_markup
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  for (const m of missing) {
    console.log(`Syncing ID ${m.id}: ${m.slug} - ${m.title}`);
    insertStmt.run(
      m.id,
      m.title || '',
      m.subtitle || '',
      m.category || 'Business',
      m.author_name || 'PrivateSector Intelligence',
      m.author_avatar || '/assets/logo_highres.png',
      m.date_published || m.published_at || new Date().toISOString(),
      m.read_time_mins || 5,
      m.content_body || m.content || '',
      m.pull_quote || '',
      m.tags ? (typeof m.tags === 'string' ? m.tags : JSON.stringify(m.tags)) : '[]',
      m.image_url || null,
      m.student_author_id || null,
      m.focus_keyword || null,
      m.meta_title || m.title || null,
      m.meta_description || m.subtitle || null,
      m.slug,
      m.schema_markup ? (typeof m.schema_markup === 'string' ? m.schema_markup : JSON.stringify(m.schema_markup)) : null
    );
  }


  const newCount = db.prepare('SELECT count(*) as c FROM news').get();
  console.log('Sync complete. New local news count:', newCount.c);
}

checkAndSync().catch(console.error);
