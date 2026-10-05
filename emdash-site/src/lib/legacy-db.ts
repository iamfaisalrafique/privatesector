import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

// EmDash primary database & Legacy SQLite database
const emdashDbPath = path.resolve(process.cwd(), 'data.db');
const legacyDbPath = path.resolve(process.cwd(), '../server/database.sqlite');

let emdashDb: DatabaseSync | null = null;
let legacyDb: DatabaseSync | null = null;

function getEmdashDb(): DatabaseSync | null {
  try {
    if (!emdashDb) {
      emdashDb = new DatabaseSync(emdashDbPath);
    }
    return emdashDb;
  } catch (err) {
    console.error('Error opening EmDash DB:', err);
    return null;
  }
}

function getLegacyDb(): DatabaseSync {
  if (!legacyDb) {
    legacyDb = new DatabaseSync(legacyDbPath);
  }
  return legacyDb;
}

// Helper: Convert Portable Text JSON blocks or strings to clean markdown/prose
function portableTextToString(content: any): string {
  if (!content) return '';
  if (typeof content !== 'string') {
    if (Array.isArray(content)) {
      return renderBlocks(content);
    }
    return String(content);
  }
  if (!content.trim().startsWith('[')) return content;
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return renderBlocks(parsed);
  } catch {}
  return content;
}

function renderBlocks(blocks: any[]): string {
  return blocks.map((b: any) => {
    const text = (b.children || []).map((c: any) => c.text || '').join('');
    if (b.style === 'h2') return `## ${text}\n\n`;
    if (b.style === 'h3') return `### ${text}\n\n`;
    if (b.listItem === 'bullet') return `- ${text}\n`;
    return `${text}\n\n`;
  }).join('');
}

export function getNews(limit = 50) {
  try {
    const edb = getEmdashDb();
    if (edb) {
      const rows = edb.prepare(`
        SELECT 
          id, slug, title, subtitle, 
          'Swiss Intelligence' as category, 
          author_name, author_avatar, 
          published_at as date_published, 
          read_time_mins, 
          featured_image as image_url, 
          pull_quote, 
          content as content_body, 
          meta_title, meta_description, focus_keyword, schema_markup
        FROM ec_posts 
        WHERE status = 'published' AND deleted_at IS NULL
        ORDER BY published_at DESC, id DESC 
        LIMIT ?
      `).all(limit) as any[];

      if (rows && rows.length > 0) {
        return rows.map(r => ({
          ...r,
          content_body: portableTextToString(r.content_body)
        }));
      }
    }
  } catch (err) {
    console.error('Error fetching news from EmDash DB:', err);
  }

  try {
    const ldb = getLegacyDb();
    return ldb.prepare('SELECT * FROM news ORDER BY date_published DESC, id DESC LIMIT ?').all(limit);
  } catch (err) {
    console.error('Error fetching legacy news:', err);
    return [];
  }
}

export function getNewsBySlug(slug: string) {
  try {
    const edb = getEmdashDb();
    if (edb) {
      const row = edb.prepare(`
        SELECT 
          id, slug, title, subtitle, 
          'Swiss Intelligence' as category, 
          author_name, author_avatar, 
          published_at as date_published, 
          read_time_mins, 
          featured_image as image_url, 
          pull_quote, 
          content as content_body, 
          meta_title, meta_description, focus_keyword, schema_markup
        FROM ec_posts 
        WHERE (slug = ? OR id = ? OR id = ?) AND deleted_at IS NULL
        LIMIT 1
      `).get(slug, slug, `post_${slug}`) as any;

      if (row) {
        return {
          ...row,
          content_body: portableTextToString(row.content_body)
        };
      }
    }
  } catch (err) {
    console.error('Error fetching news by slug from EmDash DB:', err);
  }

  try {
    const ldb = getLegacyDb();
    return ldb.prepare('SELECT * FROM news WHERE slug = ? OR id = ? LIMIT 1').get(slug, slug);
  } catch (err) {
    console.error('Error fetching legacy news by slug:', err);
    return null;
  }
}

export function getCompanies(premiumOnly = false, limit = 50) {
  try {
    const edb = getEmdashDb();
    if (edb) {
      const sql = premiumOnly 
        ? "SELECT * FROM ec_companies WHERE premium = 1 AND status = 'published' LIMIT ?" 
        : "SELECT * FROM ec_companies WHERE status = 'published' LIMIT ?";
      const rows = edb.prepare(sql).all(limit) as any[];
      if (rows && rows.length > 0) return rows;
    }
  } catch (err) {
    console.error('Error fetching companies from EmDash DB:', err);
  }

  try {
    const ldb = getLegacyDb();
    if (premiumOnly) {
      return ldb.prepare('SELECT * FROM companies WHERE premium = 1 LIMIT ?').all(limit);
    }
    return ldb.prepare('SELECT * FROM companies LIMIT ?').all(limit);
  } catch (err) {
    console.error('Error fetching legacy companies:', err);
    return [];
  }
}

export function getCompanyById(idOrSlug: string | number) {
  try {
    const edb = getEmdashDb();
    if (edb) {
      const row = edb.prepare("SELECT * FROM ec_companies WHERE id = ? OR slug = ? OR id = ? LIMIT 1").get(idOrSlug, idOrSlug, `comp_${idOrSlug}`);
      if (row) return row;
    }
  } catch (err) {}

  try {
    const ldb = getLegacyDb();
    return ldb.prepare('SELECT * FROM companies WHERE id = ? OR slug = ? LIMIT 1').get(idOrSlug, idOrSlug);
  } catch (err) {
    return null;
  }
}

export function getActiveMorningBriefings(limit = 2) {
  try {
    const edb = getEmdashDb();
    if (edb) {
      const rows = edb.prepare("SELECT * FROM ec_briefings WHERE status = 'published' ORDER BY date DESC, id DESC LIMIT ?").all(limit) as any[];
      if (rows && rows.length > 0) {
        return rows.map(b => ({
          ...b,
          image_url: b.featured_image,
          linked_articles: [],
          articles: []
        }));
      }
    }
  } catch (err) {}

  try {
    const ldb = getLegacyDb();
    const rows: any[] = ldb.prepare("SELECT * FROM morning_briefings WHERE status = 'published' OR status = 'active' ORDER BY date DESC, id DESC LIMIT ?").all(limit);
    return rows.map(b => {
      let articleIds: any[] = [];
      try {
        articleIds = typeof b.linked_articles === 'string' ? JSON.parse(b.linked_articles) : (b.linked_articles || []);
      } catch {}
      let articles: any[] = [];
      if (Array.isArray(articleIds) && articleIds.length > 0) {
        const placeholders = articleIds.map(() => '?').join(',');
        const newsRows = ldb.prepare(`SELECT id, title, subtitle, category, image_url, date_published, read_time_mins, slug FROM news WHERE id IN (${placeholders})`).all(...articleIds);
        articles = newsRows;
      }
      return {
        ...b,
        linked_articles: articleIds,
        articles
      };
    });
  } catch (err) {
    return [];
  }
}

export function getInterviews(limit = 20) {
  try {
    const edb = getEmdashDb();
    if (edb) {
      const rows = edb.prepare("SELECT * FROM ec_interviews WHERE status = 'published' LIMIT ?").all(limit) as any[];
      if (rows && rows.length > 0) return rows;
    }
  } catch (err) {}

  try {
    const ldb = getLegacyDb();
    return ldb.prepare('SELECT * FROM interviews ORDER BY date_published DESC LIMIT ?').all(limit);
  } catch (err) {
    return [];
  }
}

export function getBlogs(limit = 20) {
  try {
    const edb = getEmdashDb();
    if (edb) {
      const rows = edb.prepare("SELECT * FROM ec_blogs WHERE status = 'published' LIMIT ?").all(limit) as any[];
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          ...r,
          image_url: r.featured_image,
          content_body: portableTextToString(r.content)
        }));
      }
    }
  } catch (err) {}

  try {
    const ldb = getLegacyDb();
    return ldb.prepare('SELECT * FROM blogs ORDER BY date_published DESC LIMIT ?').all(limit);
  } catch (err) {
    return [];
  }
}

export function getJobs(limit = 20) {
  try {
    const ldb = getLegacyDb();
    return ldb.prepare('SELECT * FROM jobs ORDER BY id DESC LIMIT ?').all(limit);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    return [];
  }
}
