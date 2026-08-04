import { Router } from 'express';
import { dbQuery, dbGet, dbRun } from '../db.js';

const router = Router();

// GET all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await dbQuery('SELECT id, title, subtitle, category, author_name, author_avatar, date_published, read_time_mins, pull_quote, tags, image_url FROM blogs ORDER BY date_published DESC');
    const parsedBlogs = blogs.map(item => ({
      ...item,
      tags: JSON.parse(item.tags || '[]')
    }));
    res.json(parsedBlogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single blog
router.get('/:id', async (req, res) => {
  try {
    const article = await dbGet('SELECT * FROM blogs WHERE id = ?', [req.params.id]);
    if (!article) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    article.tags = JSON.parse(article.tags || '[]');
    
    const related = await dbQuery(
      'SELECT id, title, category, date_published, read_time_mins, image_url FROM blogs WHERE id != ? LIMIT 3',
      [article.id]
    );
    
    res.json({
      article,
      related
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new blog
router.post('/', async (req, res) => {
  try {
    const { title, subtitle, category, author_name, author_avatar, date_published, read_time_mins, content_body, pull_quote, tags, image_url, focus_keyword, meta_title, meta_description, slug, schema_markup } = req.body;
    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const result = await dbRun(`
      INSERT INTO blogs (title, subtitle, category, author_name, author_avatar, date_published, read_time_mins, content_body, pull_quote, tags, image_url, focus_keyword, meta_title, meta_description, slug, schema_markup)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, subtitle, category || 'Guides', author_name || 'Editorial Team',
      author_avatar || 'https://i.pravatar.cc/100?img=11',
      date_published || new Date().toISOString().split('T')[0],
      read_time_mins || Math.max(1, Math.round((content_body || '').split(/\s+/).length / 200)),
      content_body, pull_quote || '', JSON.stringify(tags || []),
      image_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
      focus_keyword || '', meta_title || '', meta_description || '', cleanSlug, schema_markup || ''
    ]);
    res.json({ success: true, id: result.id, message: 'Blog created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update blog
router.put('/:id', async (req, res) => {
  try {
    const { title, subtitle, category, author_name, author_avatar, date_published, read_time_mins, content_body, pull_quote, tags, image_url, focus_keyword, meta_title, meta_description, slug, schema_markup } = req.body;
    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await dbRun(`
      UPDATE blogs SET 
        title = ?, subtitle = ?, category = ?, author_name = ?, author_avatar = ?, 
        date_published = ?, read_time_mins = ?, content_body = ?, pull_quote = ?, tags = ?, image_url = ?,
        focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?
      WHERE id = ?
    `, [
      title, subtitle, category, author_name, author_avatar, date_published,
      read_time_mins || Math.max(1, Math.round((content_body || '').split(/\s+/).length / 200)),
      content_body, pull_quote, JSON.stringify(tags || []), image_url,
      focus_keyword, meta_title, meta_description, cleanSlug, schema_markup, req.params.id
    ]);
    res.json({ success: true, message: 'Blog updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE blog
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM blogs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
