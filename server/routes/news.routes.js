import { Router } from 'express';
import { dbQuery, dbGet, dbRun } from '../db.js';

const router = Router();

// News List API
router.get('/', async (req, res) => {
  try {
    const { category, tag, search, student_author_id } = req.query;
    let query = 'SELECT * FROM news WHERE 1=1';
    const params = [];
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (student_author_id) {
      query += ' AND student_author_id = ?';
      params.push(parseInt(student_author_id));
    }
    if (search) {
      query += ' AND (title LIKE ? OR subtitle LIKE ? OR content_body LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY date_published DESC, id DESC';
    const rows = await dbQuery(query, params);

    const parsedRows = rows.map(item => ({
      ...item,
      tags: JSON.parse(item.tags || '[]')
    }));

    res.json(parsedRows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Single Article Detail
router.get('/:id', async (req, res) => {
  try {
    const isNumeric = !isNaN(Number(req.params.id)) && !isNaN(parseInt(req.params.id));
    let article;
    if (isNumeric) {
      article = await dbGet('SELECT * FROM news WHERE id = ? OR slug = ?', [parseInt(req.params.id), req.params.id]);
    } else {
      article = await dbGet('SELECT * FROM news WHERE slug = ?', [req.params.id]);
    }

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    article.tags = JSON.parse(article.tags || '[]');
    
    let studentAuthor = null;
    if (article.student_author_id) {
      studentAuthor = await dbGet('SELECT id, name, university, avatar FROM student_profiles WHERE id = ?', [article.student_author_id]);
    }
    
    const related = await dbQuery(
      'SELECT id, title, category, date_published, read_time_mins, image_url, slug FROM news WHERE id != ? LIMIT 3',
      [article.id]
    );
    
    res.json({
      article,
      related,
      studentAuthor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create News
router.post('/', async (req, res) => {
  try {
    const { title, subtitle, category, author_name, author_avatar, content_body, pull_quote, tags, image_url, student_author_id, focus_keyword, meta_title, meta_description, slug, schema_markup } = req.body;
    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const result = await dbRun(
      `INSERT INTO news (title, subtitle, category, author_name, author_avatar, date_published, read_time_mins, content_body, pull_quote, tags, image_url, student_author_id, focus_keyword, meta_title, meta_description, slug, schema_markup)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, subtitle, category || 'University Perspective',
        author_name || 'Editorial Team', author_avatar || 'https://i.pravatar.cc/100?img=33',
        new Date().toISOString().split('T')[0],
        Math.max(1, Math.round((content_body || '').split(/\s+/).length / 200)),
        content_body, pull_quote || '', JSON.stringify(tags || []),
        image_url || 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600',
        student_author_id || null, focus_keyword || '', meta_title || '', meta_description || '', cleanSlug, schema_markup || ''
      ]
    );
    res.json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update News
router.put('/:id', async (req, res) => {
  try {
    const { title, subtitle, category, author_name, author_avatar, content_body, pull_quote, tags, image_url, student_author_id, focus_keyword, meta_title, meta_description, slug, schema_markup } = req.body;
    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await dbRun(
      `UPDATE news 
       SET title = ?, subtitle = ?, category = ?, author_name = ?, author_avatar = ?, read_time_mins = ?, content_body = ?, pull_quote = ?, tags = ?, image_url = ?, student_author_id = ?, focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?
       WHERE id = ?`,
      [
        title, subtitle, category, author_name, author_avatar,
        Math.max(1, Math.round((content_body || '').split(/\s+/).length / 200)),
        content_body, pull_quote, JSON.stringify(tags || []), image_url,
        student_author_id || null, focus_keyword, meta_title, meta_description, cleanSlug, schema_markup, req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete News
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
