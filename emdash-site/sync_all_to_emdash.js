import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const legacyDbPath = path.resolve(process.cwd(), '../server/database.sqlite');
const emdashDbPath = path.resolve(process.cwd(), 'data.db');

const legacyDb = new DatabaseSync(legacyDbPath);
const emdashDb = new DatabaseSync(emdashDbPath);

console.log('--- Starting EmDash Full Sync ---');

// 1. Sync User: faisalr.gfx@gmail.com
try {
  // Into legacy db
  const existingLegacy = legacyDb.prepare("SELECT * FROM users WHERE email = ?").get('faisalr.gfx@gmail.com');
  if (!existingLegacy) {
    legacyDb.prepare(`
      INSERT INTO users (email, role, password_hash)
      VALUES (?, ?, ?)
    `).run('faisalr.gfx@gmail.com', 'admin', 'Admin2026');
    console.log('Added faisalr.gfx@gmail.com to server/database.sqlite');
  } else {
    legacyDb.prepare(`UPDATE users SET role = 'admin', password_hash = 'Admin2026' WHERE email = ?`).run('faisalr.gfx@gmail.com');
    console.log('Updated faisalr.gfx@gmail.com in server/database.sqlite');
  }

  // Into EmDash data.db
  const existingEmdash = emdashDb.prepare("SELECT * FROM users WHERE email = ?").get('faisalr.gfx@gmail.com');
  if (!existingEmdash) {
    const userId = 'usr_faisalr_admin_01';
    emdashDb.prepare(`
      INSERT INTO users (id, email, name, role, email_verified, disabled, created_at, updated_at)
      VALUES (?, ?, ?, 50, 1, 0, datetime('now'), datetime('now'))
    `).run(userId, 'faisalr.gfx@gmail.com', 'Faisal Rafique');
    console.log('Added faisalr.gfx@gmail.com to EmDash data.db');
  } else {
    emdashDb.prepare(`UPDATE users SET role = 50, email_verified = 1 WHERE email = ?`).run('faisalr.gfx@gmail.com');
    console.log('Updated faisalr.gfx@gmail.com to role 50 in EmDash data.db');
  }
} catch (e) {
  console.error('Error syncing user:', e);
}

// Helper: Text to Portable Text Blocks
function textToPortableText(text) {
  if (!text) return JSON.stringify([]);
  const blocks = [];
  let keyIndex = 1;
  const paragraphs = text.split(/\r?\n\r?\n/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('### ')) {
      blocks.push({
        _type: 'block',
        _key: `key-${keyIndex++}`,
        style: 'h3',
        children: [{ _type: 'span', _key: `span-${keyIndex++}`, text: trimmed.replace(/^###\s+/, '') }]
      });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({
        _type: 'block',
        _key: `key-${keyIndex++}`,
        style: 'h2',
        children: [{ _type: 'span', _key: `span-${keyIndex++}`, text: trimmed.replace(/^##\s+/, '') }]
      });
    } else if (trimmed.startsWith('- ')) {
      const items = trimmed.split(/\r?\n/);
      for (const item of items) {
        if (item.trim().startsWith('- ')) {
          blocks.push({
            _type: 'block',
            _key: `key-${keyIndex++}`,
            style: 'normal',
            listItem: 'bullet',
            level: 1,
            children: [{ _type: 'span', _key: `span-${keyIndex++}`, text: item.trim().replace(/^-\s+/, '') }]
          });
        }
      }
    } else {
      blocks.push({
        _type: 'block',
        _key: `key-${keyIndex++}`,
        style: 'normal',
        children: [{ _type: 'span', _key: `span-${keyIndex++}`, text: trimmed }]
      });
    }
  }
  return JSON.stringify(blocks);
}

// 2. Sync News -> ec_posts
try {
  const newsRows = legacyDb.prepare("SELECT * FROM news").all();
  console.log(`Syncing ${newsRows.length} news articles to ec_posts...`);
  
  const insertPost = emdashDb.prepare(`
    INSERT OR REPLACE INTO ec_posts (
      id, slug, status, author_id, created_at, updated_at, published_at, locale,
      title, subtitle, featured_image, content, pull_quote, read_time_mins,
      author_name, author_avatar, focus_keyword, meta_title, meta_description, schema_markup
    ) VALUES (
      ?, ?, 'published', 'usr_faisalr_admin_01', datetime('now'), datetime('now'), ?, 'en',
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `);

  let postCount = 0;
  for (const n of newsRows) {
    const postId = `post_${n.id}`;
    const slug = n.slug || `news-${n.id}`;
    const publishedAt = n.date_published ? `${n.date_published} 12:00:00` : new Date().toISOString();
    const contentJson = textToPortableText(n.content_body);
    
    insertPost.run(
      postId,
      slug,
      publishedAt,
      n.title || '',
      n.subtitle || null,
      n.image_url || null,
      contentJson,
      n.pull_quote || null,
      n.read_time_mins || 5,
      n.author_name || 'PrivateSector Editorial',
      n.author_avatar || '/logo.png',
      n.focus_keyword || null,
      n.meta_title || n.title,
      n.meta_description || n.subtitle,
      n.schema_markup || null
    );
    postCount++;
  }
  console.log(`Successfully synced ${postCount} posts to ec_posts`);
} catch (e) {
  console.error('Error syncing posts:', e);
}

// 3. Sync Companies -> ec_companies
try {
  const compRows = legacyDb.prepare("SELECT * FROM companies").all();
  console.log(`Syncing ${compRows.length} companies to ec_companies...`);

  const insertComp = emdashDb.prepare(`
    INSERT OR REPLACE INTO ec_companies (
      id, slug, status, author_id, created_at, updated_at, published_at, locale,
      name, logo_bg, canton, industry, size_class, description, premium, verified,
      founded, employees, revenue_band, website, linkedin, contact_email, about_text,
      structured_data, esg_rating, sustainability_summary, meta_title, meta_description
    ) VALUES (
      ?, ?, 'published', 'usr_faisalr_admin_01', datetime('now'), datetime('now'), datetime('now'), 'en',
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  let compCount = 0;
  for (const c of compRows) {
    const compId = `comp_${c.id}`;
    const slug = c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    insertComp.run(
      compId,
      slug,
      c.name,
      c.logo_bg || '#1A365D',
      c.canton || 'ZH',
      c.industry || 'General',
      c.size_class || 'Large',
      c.description || null,
      c.premium ? 1 : 0,
      c.verified ? 1 : 0,
      c.founded || 2000,
      c.employees || 100,
      c.revenue_band || null,
      c.website || null,
      c.linkedin || null,
      c.contact_email || null,
      c.about_text || null,
      c.structured_data || null,
      c.esg_rating || 80,
      c.sustainability_summary || null,
      c.meta_title || c.name,
      c.meta_description || c.description
    );
    compCount++;
  }
  console.log(`Successfully synced ${compCount} companies to ec_companies`);
} catch (e) {
  console.error('Error syncing companies:', e);
}

// 4. Sync Interviews -> ec_interviews
try {
  const intRows = legacyDb.prepare("SELECT * FROM interviews").all();
  console.log(`Syncing ${intRows.length} interviews to ec_interviews...`);

  const insertInt = emdashDb.prepare(`
    INSERT OR REPLACE INTO ec_interviews (
      id, slug, status, author_id, created_at, updated_at, published_at, locale,
      title, subtitle, interviewee_name, interviewee_title, interviewee_avatar,
      company_name, audio_url, read_time_mins, qa_content, student_author_id, category
    ) VALUES (
      ?, ?, 'published', 'usr_faisalr_admin_01', datetime('now'), datetime('now'), datetime('now'), 'en',
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `);

  let intCount = 0;
  for (const i of intRows) {
    const intId = `interview_${i.id}`;
    const slug = i.slug || i.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50).replace(/^-|-$/g, '');
    
    insertInt.run(
      intId,
      slug,
      i.title,
      i.subtitle || null,
      i.interviewee_name || null,
      i.interviewee_title || null,
      i.interviewee_avatar || null,
      i.company_name || null,
      i.audio_url || null,
      i.read_time_mins || 6,
      i.qa_content || null,
      i.student_author_id || null,
      i.category || 'Executive Briefing'
    );
    intCount++;
  }
  console.log(`Successfully synced ${intCount} interviews to ec_interviews`);
} catch (e) {
  console.error('Error syncing interviews:', e);
}

// 5. Sync Blogs -> ec_blogs
try {
  const blogRows = legacyDb.prepare("SELECT * FROM blogs").all();
  console.log(`Syncing ${blogRows.length} blogs to ec_blogs...`);

  const insertBlog = emdashDb.prepare(`
    INSERT OR REPLACE INTO ec_blogs (
      id, slug, status, author_id, created_at, updated_at, published_at, locale,
      title, subtitle, featured_image, content, pull_quote, read_time_mins,
      author_name, author_avatar, focus_keyword, meta_title, meta_description, schema_markup
    ) VALUES (
      ?, ?, 'published', 'usr_faisalr_admin_01', datetime('now'), datetime('now'), datetime('now'), 'en',
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `);

  let blogCount = 0;
  for (const b of blogRows) {
    const blogId = `blog_${b.id}`;
    const slug = b.slug || b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50).replace(/^-|-$/g, '');
    const contentJson = textToPortableText(b.content_body);
    
    insertBlog.run(
      blogId,
      slug,
      b.title,
      b.subtitle || null,
      b.image_url || null,
      contentJson,
      b.pull_quote || null,
      b.read_time_mins || 5,
      b.author_name || 'PrivateSector Editorial',
      b.author_avatar || '/logo.png',
      b.focus_keyword || null,
      b.meta_title || b.title,
      b.meta_description || b.subtitle,
      b.schema_markup || null
    );
    blogCount++;
  }
  console.log(`Successfully synced ${blogCount} blogs to ec_blogs`);
} catch (e) {
  console.error('Error syncing blogs:', e);
}

// 6. Sync Morning Briefings -> ec_briefings
try {
  const briefingRows = legacyDb.prepare("SELECT * FROM morning_briefings").all();
  console.log(`Syncing ${briefingRows.length} briefings to ec_briefings...`);

  const insertBriefing = emdashDb.prepare(`
    INSERT OR REPLACE INTO ec_briefings (
      id, slug, status, author_id, created_at, updated_at, published_at, locale,
      title, date, audio_url, audio_duration, transcript, featured_image
    ) VALUES (
      ?, ?, 'published', 'usr_faisalr_admin_01', datetime('now'), datetime('now'), datetime('now'), 'en',
      ?, ?, ?, ?, ?, ?
    )
  `);

  let briefCount = 0;
  for (const br of briefingRows) {
    const briefId = `briefing_${br.id}`;
    const slug = `briefing-${br.id}`;
    
    insertBriefing.run(
      briefId,
      slug,
      br.title,
      br.date,
      br.audio_url || null,
      br.audio_duration || 0,
      br.transcript || null,
      br.image_url || null
    );
    briefCount++;
  }
  console.log(`Successfully synced ${briefCount} briefings to ec_briefings`);
} catch (e) {
  console.error('Error syncing briefings:', e);
}

console.log('--- EmDash Full Sync Completed Successfully! ---');
