import { Router } from 'express';
import { dbQuery, dbGet, dbRun } from '../db.js';

const router = Router();

// GET all jobs
router.get('/jobs', async (req, res) => {
  try {
    const { type, location, company_id } = req.query;
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }
    if (company_id) {
      query += ' AND company_id = ?';
      params.push(parseInt(company_id));
    }
    
    query += ' ORDER BY date_posted DESC';
    const rows = await dbQuery(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all students
router.get('/students', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT * FROM student_profiles ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single student
router.get('/students/:id', async (req, res) => {
  try {
    const student = await dbGet('SELECT * FROM student_profiles WHERE id = ?', [req.params.id]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const articles = await dbQuery('SELECT id, title, category, date_published FROM news WHERE student_author_id = ?', [req.params.id]);
    const podcasts = await dbQuery('SELECT id, title, subtitle, date_published, category, audio_url FROM interviews WHERE student_author_id = ?', [req.params.id]);
    
    res.json({
      ...student,
      articles,
      podcasts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update student profile
router.put('/students/:id', async (req, res) => {
  try {
    const { bio, university, study_field, grad_year, email, phone_number, birth_date, skills, experience, portfolio_url, avatar } = req.body;
    await dbRun(
      `UPDATE student_profiles SET bio = ?, university = ?, study_field = ?, grad_year = ?, email = ?, phone_number = ?, birth_date = ?, skills = ?, experience = ?, portfolio_url = ?, avatar = ? WHERE id = ?`,
      [bio, university, study_field, parseInt(grad_year), email, phone_number, birth_date, JSON.stringify(skills), JSON.stringify(experience), portfolio_url, avatar, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create job
router.post('/jobs', async (req, res) => {
  try {
    const { title, type, description, company_id, company_name, location, apply_url, focus_keyword, meta_title, meta_description, slug, schema_markup, category, tags } = req.body;
    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const result = await dbRun(
      `INSERT INTO jobs (title, type, description, company_id, company_name, location, apply_url, date_posted, focus_keyword, meta_title, meta_description, slug, schema_markup, category, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, type || 'Full-time', description, company_id || null,
        company_name || 'Confidential', location || 'Switzerland', apply_url || '',
        new Date().toISOString().split('T')[0], focus_keyword || '', meta_title || '',
        meta_description || '', cleanSlug, schema_markup || '', category || 'Engineering', JSON.stringify(tags || [])
      ]
    );
    res.json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update job
router.put('/jobs/:id', async (req, res) => {
  try {
    const { title, type, description, company_id, company_name, location, apply_url, focus_keyword, meta_title, meta_description, slug, schema_markup, category, tags } = req.body;
    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await dbRun(
      `UPDATE jobs 
       SET title = ?, type = ?, description = ?, company_id = ?, company_name = ?, location = ?, apply_url = ?, focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?, category = ?, tags = ?
       WHERE id = ?`,
      [
        title, type, description, company_id || null, company_name, location, apply_url,
        focus_keyword, meta_title, meta_description, cleanSlug, schema_markup, category,
        JSON.stringify(tags || []), req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE job
router.delete('/jobs/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
