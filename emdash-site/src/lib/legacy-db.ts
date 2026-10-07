import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { isPostgres, dbQuery, dbGet, dbRun } from './db.ts';

let emdashDb: DatabaseSync | null = null;
let legacyDb: DatabaseSync | null = null;

function resolveFirstExisting(paths: string[]): string | null {
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {}
  }
  return null;
}

function getEmdashDb(): DatabaseSync | null {
  try {
    if (!emdashDb) {
      const target = resolveFirstExisting([
        path.resolve(process.cwd(), 'data.db'),
        path.resolve(process.cwd(), 'emdash-site/data.db'),
        path.resolve(process.cwd(), '../data.db'),
      ]);
      if (target) {
        emdashDb = new DatabaseSync(target);
      }
    }
    return emdashDb;
  } catch (err) {
    return null;
  }
}

function getLegacyDb(): DatabaseSync | null {
  try {
    if (!legacyDb) {
      const target = resolveFirstExisting([
        path.resolve(process.cwd(), '../server/database.sqlite'),
        path.resolve(process.cwd(), 'server/database.sqlite'),
        path.resolve(process.cwd(), '../../server/database.sqlite'),
      ]);
      if (target) {
        legacyDb = new DatabaseSync(target);
      }
    }
    return legacyDb;
  } catch (err) {
    return null;
  }
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

function resolveMediaUrl(rawImage: any): string | null {
  if (!rawImage) return null;
  if (typeof rawImage === 'string') {
    if (rawImage.startsWith('/') || rawImage.startsWith('http')) return rawImage;
    if (rawImage.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(rawImage);
        if (parsed.meta?.storageKey) {
          return `/_emdash/api/media/file/${parsed.meta.storageKey}`;
        }
        if (parsed.filename) {
          return `/_emdash/api/media/file/${parsed.filename}`;
        }
      } catch {}
    }
    return rawImage;
  }
  if (typeof rawImage === 'object') {
    if (rawImage.meta?.storageKey) {
      return `/_emdash/api/media/file/${rawImage.meta.storageKey}`;
    }
    if (rawImage.filename) {
      return `/_emdash/api/media/file/${rawImage.filename}`;
    }
  }
  return null;
}

export interface NewsFilters {
  category?: string;
  tag?: string;
  search?: string;
  student_author_id?: number | string;
}

export async function getNews(limit = 50, filters?: NewsFilters) {
  if (isPostgres()) {
    try {
      let sql = 'SELECT * FROM news WHERE 1=1';
      const params: any[] = [];
      if (filters?.category) {
        sql += ' AND category = ?';
        params.push(filters.category);
      }
      if (filters?.student_author_id) {
        sql += ' AND student_author_id = ?';
        params.push(Number(filters.student_author_id));
      }
      if (filters?.search) {
        sql += ' AND (title ILIKE ? OR subtitle ILIKE ? OR content_body ILIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
      }
      sql += ' ORDER BY date_published DESC, id DESC LIMIT ?';
      params.push(limit);

      const rows = await dbQuery(sql, params);
      let parsed = rows.map((r: any) => ({
        ...r,
        tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : (r.tags || [])
      }));

      if (filters?.tag) {
        const normTag = filters.tag.trim().toLowerCase();
        parsed = parsed.filter((r: any) =>
          Array.isArray(r.tags) && r.tags.some((t: string) => String(t).toLowerCase() === normTag)
        );
      }
      return parsed;
    } catch (err) {
      console.error('Error querying news from PostgreSQL:', err);
      return [];
    }
  }

  // SQLite fallback
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
          image_url: resolveMediaUrl(r.image_url),
          content_body: portableTextToString(r.content_body)
        }));
      }
    }
  } catch (err) {}

  try {
    const ldb = getLegacyDb();
    if (ldb) {
      return ldb.prepare('SELECT * FROM news ORDER BY date_published DESC, id DESC LIMIT ?').all(limit);
    }
  } catch (err) {}

  return [];
}

export async function getNewsBySlug(slug: string) {
  if (isPostgres()) {
    try {
      const isNum = !isNaN(Number(slug));
      const row = isNum
        ? await dbGet('SELECT * FROM news WHERE slug = ? OR id = ? LIMIT 1', [slug, Number(slug)])
        : await dbGet('SELECT * FROM news WHERE slug = ? LIMIT 1', [slug]);
      if (row) {
        return {
          ...row,
          tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : (row.tags || [])
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching news by slug from PostgreSQL:', err);
      return null;
    }
  }

  // SQLite fallback
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
          image_url: resolveMediaUrl(row.image_url),
          content_body: portableTextToString(row.content_body)
        };
      }
    }
  } catch (err) {}

  try {
    const ldb = getLegacyDb();
    if (ldb) {
      return ldb.prepare('SELECT * FROM news WHERE slug = ? OR id = ? LIMIT 1').get(slug, slug);
    }
  } catch (err) {}

  return null;
}

export interface CompanyFilters {
  search?: string;
  canton?: string;
  industry?: string;
  size?: string;
  verified?: boolean;
}

export async function getCompanies(premiumOnly = false, limit = 50, filters?: CompanyFilters) {
  if (isPostgres()) {
    try {
      let sql = 'SELECT * FROM companies WHERE 1=1';
      const params: any[] = [];
      if (premiumOnly) {
        sql += ' AND premium = 1';
      }
      if (filters?.verified) {
        sql += ' AND verified = 1';
      }
      if (filters?.search) {
        sql += ' AND (name ILIKE ? OR description ILIKE ? OR industry ILIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
      }
      if (filters?.canton) {
        sql += ' AND canton = ?';
        params.push(filters.canton);
      }
      if (filters?.industry) {
        sql += ' AND industry = ?';
        params.push(filters.industry);
      }
      if (filters?.size && filters.size !== 'All') {
        sql += ' AND size_class = ?';
        params.push(filters.size);
      }

      sql += ' ORDER BY premium DESC, name ASC LIMIT ?';
      params.push(limit);

      const rows = await dbQuery(sql, params);
      return rows || [];
    } catch (err) {
      console.error('Error fetching companies from PostgreSQL:', err);
      return [];
    }
  }

  // SQLite fallback
  try {
    const edb = getEmdashDb();
    if (edb) {
      const sql = premiumOnly 
        ? "SELECT * FROM ec_companies WHERE premium = 1 AND status = 'published' LIMIT ?" 
        : "SELECT * FROM ec_companies WHERE status = 'published' LIMIT ?";
      const rows = edb.prepare(sql).all(limit) as any[];
      if (rows && rows.length > 0) return rows;
    }
  } catch (err) {}

  try {
    const ldb = getLegacyDb();
    if (ldb) {
      const sql = premiumOnly
        ? 'SELECT * FROM companies WHERE premium = 1 LIMIT ?'
        : 'SELECT * FROM companies LIMIT ?';
      return ldb.prepare(sql).all(limit);
    }
  } catch (err) {}

  return [];
}

export async function getCompanyById(idOrSlug: string | number) {
  if (isPostgres()) {
    try {
      const isNum = !isNaN(Number(idOrSlug));
      const row = isNum
        ? await dbGet('SELECT * FROM companies WHERE slug = ? OR id = ? LIMIT 1', [String(idOrSlug), Number(idOrSlug)])
        : await dbGet('SELECT * FROM companies WHERE slug = ? LIMIT 1', [String(idOrSlug)]);
      return row || null;
    } catch (err) {
      console.error('Error fetching company from PostgreSQL:', err);
      return null;
    }
  }

  try {
    const edb = getEmdashDb();
    if (edb) {
      const row = edb.prepare("SELECT * FROM ec_companies WHERE id = ? OR slug = ? OR id = ? LIMIT 1").get(idOrSlug, idOrSlug, `comp_${idOrSlug}`);
      if (row) return row;
    }
  } catch (err) {}

  try {
    const ldb = getLegacyDb();
    if (ldb) {
      return ldb.prepare('SELECT * FROM companies WHERE id = ? OR slug = ? LIMIT 1').get(idOrSlug, idOrSlug);
    }
  } catch (err) {}

  return null;
}

export async function getActiveMorningBriefings(limit = 2) {
  if (isPostgres()) {
    try {
      const rows = await dbQuery(
        "SELECT * FROM morning_briefings WHERE status = 'published' OR status = 'active' ORDER BY date DESC, id DESC LIMIT ?",
        [limit]
      );
      if (rows && rows.length > 0) {
        return Promise.all(rows.map(async (b: any) => {
          let articleIds: any[] = [];
          try {
            articleIds = typeof b.linked_articles === 'string' ? JSON.parse(b.linked_articles) : (b.linked_articles || []);
          } catch {}
          let articles: any[] = [];
          if (Array.isArray(articleIds) && articleIds.length > 0) {
            const placeholders = articleIds.map(() => '?').join(',');
            articles = await dbQuery(
              `SELECT id, title, subtitle, category, image_url, date_published, read_time_mins, slug FROM news WHERE id IN (${placeholders})`,
              articleIds
            );
          }
          return {
            ...b,
            image_url: b.featured_image || b.image_url,
            linked_articles: articleIds,
            articles
          };
        }));
      }
      return [];
    } catch (err) {
      console.error('Error fetching morning briefings from PostgreSQL:', err);
      return [];
    }
  }

  // SQLite fallback
  try {
    const edb = getEmdashDb();
    if (edb) {
      const rows = edb.prepare("SELECT * FROM ec_briefings WHERE status = 'published' ORDER BY date DESC, id DESC LIMIT ?").all(limit) as any[];
      if (rows && rows.length > 0) {
        return rows.map(b => ({
          ...b,
          image_url: resolveMediaUrl(b.featured_image),
          linked_articles: [],
          articles: []
        }));
      }
    }
  } catch (err) {}

  try {
    const ldb = getLegacyDb();
    if (ldb) {
      const rows: any[] = ldb.prepare("SELECT * FROM morning_briefings WHERE status = 'published' OR status = 'active' ORDER BY date DESC, id DESC LIMIT ?").all(limit);
      return rows.map(b => {
        let articleIds: any[] = [];
        try {
          articleIds = typeof b.linked_articles === 'string' ? JSON.parse(b.linked_articles) : (b.linked_articles || []);
        } catch {}
        let articles: any[] = [];
        if (Array.isArray(articleIds) && articleIds.length > 0) {
          const placeholders = articleIds.map(() => '?').join(',');
          articles = ldb.prepare(`SELECT id, title, subtitle, category, image_url, date_published, read_time_mins, slug FROM news WHERE id IN (${placeholders})`).all(...articleIds);
        }
        return {
          ...b,
          linked_articles: articleIds,
          articles
        };
      });
    }
  } catch (err) {}

  return [];
}

export async function getInterviews(limit = 20) {
  if (isPostgres()) {
    try {
      const rows = await dbQuery('SELECT * FROM interviews ORDER BY date_published DESC, id DESC LIMIT ?', [limit]);
      return rows || [];
    } catch (err) {
      console.error('Error fetching interviews from PostgreSQL:', err);
      return [];
    }
  }

  try {
    const edb = getEmdashDb();
    if (edb) {
      const rows = edb.prepare("SELECT * FROM ec_interviews WHERE status = 'published' LIMIT ?").all(limit) as any[];
      if (rows && rows.length > 0) return rows;
    }
  } catch (err) {}

  try {
    const ldb = getLegacyDb();
    if (ldb) {
      return ldb.prepare('SELECT * FROM interviews ORDER BY date_published DESC LIMIT ?').all(limit);
    }
  } catch (err) {}

  return [];
}

export async function getInterviewById(idOrSlug: string | number) {
  if (isPostgres()) {
    try {
      const isNum = !isNaN(Number(idOrSlug));
      const row = isNum
        ? await dbGet('SELECT * FROM interviews WHERE slug = ? OR id = ? LIMIT 1', [String(idOrSlug), Number(idOrSlug)])
        : await dbGet('SELECT * FROM interviews WHERE slug = ? LIMIT 1', [String(idOrSlug)]);
      return row || null;
    } catch (err) {
      console.error('Error fetching interview from PostgreSQL:', err);
      return null;
    }
  }

  try {
    const edb = getEmdashDb();
    if (edb) {
      const isNum = !isNaN(Number(idOrSlug));
      const row = isNum
        ? edb.prepare('SELECT * FROM ec_interviews WHERE slug = ? OR legacy_id = ? OR id = ? LIMIT 1').get(String(idOrSlug), Number(idOrSlug), String(idOrSlug))
        : edb.prepare('SELECT * FROM ec_interviews WHERE slug = ? OR id = ? LIMIT 1').get(String(idOrSlug), String(idOrSlug));
      if (row) return row;
    }
  } catch (err) {}

  try {
    const ldb = getLegacyDb();
    if (ldb) {
      const isNum = !isNaN(Number(idOrSlug));
      return isNum
        ? ldb.prepare('SELECT * FROM interviews WHERE slug = ? OR id = ? LIMIT 1').get(String(idOrSlug), Number(idOrSlug))
        : ldb.prepare('SELECT * FROM interviews WHERE slug = ? LIMIT 1').get(String(idOrSlug));
    }
  } catch (err) {}

  return null;
}

export async function getBlogs(limit = 20) {
  if (isPostgres()) {
    try {
      const rows = await dbQuery('SELECT * FROM blogs ORDER BY date_published DESC, id DESC LIMIT ?', [limit]);
      if (rows && rows.length > 0) {
        return rows.map((r: any) => ({
          ...r,
          tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : (r.tags || [])
        }));
      }
      return [];
    } catch (err) {
      console.error('Error fetching blogs from PostgreSQL:', err);
      return [];
    }
  }

  try {
    const edb = getEmdashDb();
    if (edb) {
      const rows = edb.prepare("SELECT * FROM ec_blogs WHERE status = 'published' LIMIT ?").all(limit) as any[];
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          ...r,
          image_url: resolveMediaUrl(r.featured_image),
          content_body: portableTextToString(r.content)
        }));
      }
    }
  } catch (err) {}

  try {
    const ldb = getLegacyDb();
    if (ldb) {
      return ldb.prepare('SELECT * FROM blogs ORDER BY date_published DESC LIMIT ?').all(limit);
    }
  } catch (err) {}

  return [];
}

export async function getBlogBySlug(slug: string) {
  if (isPostgres()) {
    try {
      const isNum = !isNaN(Number(slug));
      const row = isNum
        ? await dbGet('SELECT * FROM blogs WHERE slug = ? OR id = ? LIMIT 1', [slug, Number(slug)])
        : await dbGet('SELECT * FROM blogs WHERE slug = ? LIMIT 1', [slug]);
      if (row) {
        return {
          ...row,
          tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : (row.tags || [])
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching blog from PostgreSQL:', err);
      return null;
    }
  }

  try {
    const edb = getEmdashDb();
    if (edb) {
      const isNum = !isNaN(Number(slug));
      const row: any = isNum
        ? edb.prepare('SELECT * FROM ec_blogs WHERE slug = ? OR legacy_id = ? OR id = ? LIMIT 1').get(String(slug), Number(slug), String(slug))
        : edb.prepare('SELECT * FROM ec_blogs WHERE slug = ? OR id = ? LIMIT 1').get(String(slug), String(slug));
      if (row) {
        return {
          ...row,
          image_url: resolveMediaUrl(row.featured_image),
          content_body: portableTextToString(row.content),
          tags: []
        };
      }
    }
  } catch (err) {}

  try {
    const ldb = getLegacyDb();
    if (ldb) {
      return ldb.prepare('SELECT * FROM blogs WHERE slug = ? OR id = ? LIMIT 1').get(slug, slug);
    }
  } catch (err) {}

  return null;
}

export async function getJobs(limit = 20) {
  if (isPostgres()) {
    try {
      const rows = await dbQuery('SELECT * FROM jobs ORDER BY id DESC LIMIT ?', [limit]);
      return rows || [];
    } catch (err) {
      console.error('Error fetching jobs from PostgreSQL:', err);
      return [];
    }
  }

  try {
    const ldb = getLegacyDb();
    if (ldb) {
      return ldb.prepare('SELECT * FROM jobs ORDER BY id DESC LIMIT ?').all(limit);
    }
  } catch (err) {}

  return [];
}

export async function createNews(data: any) {
  const {
    title, subtitle, category, author_name, author_avatar,
    content_body, pull_quote, tags, image_url,
    student_author_id, focus_keyword, meta_title, meta_description, slug, schema_markup
  } = data;

  const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const readTime = Math.max(1, Math.round((content_body || '').split(/\s+/).length / 200));
  const datePublished = data.date_published || new Date().toISOString().split('T')[0];
  const tagsStr = typeof tags === 'string' ? tags : JSON.stringify(tags || []);

  const sql = `INSERT INTO news (
    title, subtitle, category, author_name, author_avatar, date_published, 
    read_time_mins, content_body, pull_quote, tags, image_url, 
    student_author_id, focus_keyword, meta_title, meta_description, slug, schema_markup
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    title, subtitle || '', category || 'University Perspective',
    author_name || 'Editorial Team', author_avatar || 'https://i.pravatar.cc/100?img=33',
    datePublished, readTime, content_body, pull_quote || '', tagsStr,
    image_url || '', student_author_id || null, focus_keyword || '',
    meta_title || '', meta_description || '', cleanSlug, schema_markup || ''
  ];

  if (isPostgres()) {
    const res = await dbRun(sql, params);
    return { id: res.id, slug: cleanSlug };
  }

  const ldb = getLegacyDb();
  if (ldb) {
    const res = (ldb.prepare(sql) as any).run(...params);
    return { id: res.lastInsertRowid, slug: cleanSlug };
  }

  return { slug: cleanSlug };
}

export async function updateNews(id: number | string, data: any) {
  const {
    title, subtitle, category, author_name, author_avatar,
    content_body, pull_quote, tags, image_url,
    student_author_id, focus_keyword, meta_title, meta_description, slug, schema_markup
  } = data;

  const cleanSlug = slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : undefined);
  const tagsStr = typeof tags === 'string' ? tags : (tags ? JSON.stringify(tags) : undefined);

  const sql = `UPDATE news SET 
    title = COALESCE(?, title),
    subtitle = COALESCE(?, subtitle),
    category = COALESCE(?, category),
    author_name = COALESCE(?, author_name),
    author_avatar = COALESCE(?, author_avatar),
    content_body = COALESCE(?, content_body),
    pull_quote = COALESCE(?, pull_quote),
    tags = COALESCE(?, tags),
    image_url = COALESCE(?, image_url),
    student_author_id = COALESCE(?, student_author_id),
    focus_keyword = COALESCE(?, focus_keyword),
    meta_title = COALESCE(?, meta_title),
    meta_description = COALESCE(?, meta_description),
    slug = COALESCE(?, slug),
    schema_markup = COALESCE(?, schema_markup)
  WHERE id = ? OR slug = ?`;

  const params = [
    title ?? null, subtitle ?? null, category ?? null, author_name ?? null, author_avatar ?? null,
    content_body ?? null, pull_quote ?? null, tagsStr ?? null, image_url ?? null, student_author_id ?? null,
    focus_keyword ?? null, meta_title ?? null, meta_description ?? null, cleanSlug ?? null, schema_markup ?? null,
    Number(id) || 0, String(id)
  ];

  if (isPostgres()) {
    return await dbRun(sql, params);
  }

  const ldb = getLegacyDb();
  if (ldb) {
    return (ldb.prepare(sql) as any).run(...params);
  }

  return { changes: 0 };
}
