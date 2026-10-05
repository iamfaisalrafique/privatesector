import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

// Point directly to server/database.sqlite in root
const dbPath = path.resolve(process.cwd(), '../server/database.sqlite');
let dbInstance: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(dbPath);
  }
  return dbInstance;
}

export function getNews(limit = 50) {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM news ORDER BY date_published DESC, id DESC LIMIT ?').all(limit);
  } catch (err) {
    console.error('Error fetching news:', err);
    return [];
  }
}

export function getNewsBySlug(slug: string) {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM news WHERE slug = ? OR id = ? LIMIT 1').get(slug, slug);
  } catch (err) {
    console.error('Error fetching news by slug:', err);
    return null;
  }
}

export function getCompanies(premiumOnly = false, limit = 50) {
  try {
    const db = getDb();
    if (premiumOnly) {
      return db.prepare('SELECT * FROM companies WHERE premium = 1 LIMIT ?').all(limit);
    }
    return db.prepare('SELECT * FROM companies LIMIT ?').all(limit);
  } catch (err) {
    console.error('Error fetching companies:', err);
    return [];
  }
}

export function getCompanyById(idOrSlug: string | number) {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM companies WHERE id = ? OR slug = ? LIMIT 1').get(idOrSlug, idOrSlug);
  } catch (err) {
    console.error('Error fetching company:', err);
    return null;
  }
}

export function getActiveMorningBriefings(limit = 2) {
  try {
    const db = getDb();
    const rows: any[] = db.prepare("SELECT * FROM morning_briefings WHERE status = 'published' OR status = 'active' ORDER BY date DESC, id DESC LIMIT ?").all(limit);
    return rows.map(b => {
      let articleIds: any[] = [];
      try {
        articleIds = typeof b.linked_articles === 'string' ? JSON.parse(b.linked_articles) : (b.linked_articles || []);
      } catch {}
      let articles: any[] = [];
      if (Array.isArray(articleIds) && articleIds.length > 0) {
        const placeholders = articleIds.map(() => '?').join(',');
        const newsRows = db.prepare(`SELECT id, title, subtitle, category, image_url, date_published, read_time_mins, slug FROM news WHERE id IN (${placeholders})`).all(...articleIds);
        articles = newsRows;
      }
      return {
        ...b,
        linked_articles: articleIds,
        articles
      };
    });
  } catch (err) {
    console.error('Error fetching morning briefings:', err);
    return [];
  }
}

export function getInterviews(limit = 20) {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM interviews ORDER BY date_published DESC LIMIT ?').all(limit);
  } catch (err) {
    console.error('Error fetching interviews:', err);
    return [];
  }
}

export function getBlogs(limit = 20) {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM blogs ORDER BY date_published DESC LIMIT ?').all(limit);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    return [];
  }
}

export function getJobs(limit = 20) {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM jobs ORDER BY id DESC LIMIT ?').all(limit);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    return [];
  }
}
