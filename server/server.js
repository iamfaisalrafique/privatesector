import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  initializeDatabase, 
  dbQuery, 
  dbRun, 
  dbGet 
} from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trigger database seeder reload for missing translation keys
app.use(cors());
app.use(express.json());

// Initialize Database on startup
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
});

// API Routes

// 1. Translations API (For language selector)
app.get('/api/translations', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const rows = await dbQuery('SELECT key, translated_text FROM translations WHERE language_code = ?', [lang]);
    
    // Convert array to key-value dictionary
    const dictionary = {};
    rows.forEach(row => {
      dictionary[row.key] = row.translated_text;
    });
    
    res.json(dictionary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Companies List API (with filtering)
app.get('/api/companies', async (req, res) => {
  try {
    const { search, canton, industry, size, verified, premium } = req.query;
    
    let query = 'SELECT id, name, logo_bg, canton, industry, size_class, description, premium, verified, founded, employees, revenue_band, esg_rating FROM companies WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR industry LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (canton) {
      const cantonList = canton.split(',');
      query += ` AND canton IN (${cantonList.map(() => '?').join(',')})`;
      params.push(...cantonList);
    }
    
    if (industry) {
      const industryList = industry.split(',');
      query += ` AND industry IN (${industryList.map(() => '?').join(',')})`;
      params.push(...industryList);
    }
    
    if (size) {
      const sizeList = size.split(',');
      query += ` AND size_class IN (${sizeList.map(() => '?').join(',')})`;
      params.push(...sizeList);
    }
    
    if (verified === 'true') {
      query += ' AND verified = 1';
    }
    
    if (premium === 'true') {
      query += ' AND premium = 1';
    }
    
    // Sort premium companies first, then by name
    query += ' ORDER BY premium DESC, name ASC';
    
    const companies = await dbQuery(query, params);
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Single Company API (with tabs detail)
app.get('/api/companies/:id', async (req, res) => {
  try {
    const company = await dbGet('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    // Parse JSON strings
    company.structured_data = JSON.parse(company.structured_data || '{}');
    
    // Add mock related news
    const relatedNews = await dbQuery(
      'SELECT id, title, category, date_published FROM news WHERE tags LIKE ? OR category = ? LIMIT 3',
      [`%${company.name}%`, company.industry]
    );
    
    // Add mock charts history
    const baseRevenue = company.revenue_band.includes('90B') ? 95000000000 : 
                        company.revenue_band.includes('50B') ? 62000000000 :
                        company.revenue_band.includes('40B') ? 44000000000 :
                        company.revenue_band.includes('30B') ? 34000000000 :
                        company.revenue_band.includes('20B') ? 22000000000 :
                        company.revenue_band.includes('10B') ? 12000000000 : 4500000000;
                        
    const revenueHistory = [
      { year: 2022, revenue: Math.round(baseRevenue * 0.92) },
      { year: 2023, revenue: Math.round(baseRevenue * 0.95) },
      { year: 2024, revenue: Math.round(baseRevenue * 0.98) },
      { year: 2025, revenue: baseRevenue },
      { year: 2026, revenue: Math.round(baseRevenue * 1.04) }
    ];
    
    const employeeHistory = [
      { year: 2022, count: Math.round(company.employees * 0.96) },
      { year: 2023, count: Math.round(company.employees * 0.98) },
      { year: 2024, count: company.employees },
      { year: 2025, count: Math.round(company.employees * 1.01) },
      { year: 2026, count: Math.round(company.employees * 1.03) }
    ];
    
    res.json({
      ...company,
      relatedNews,
      charts: {
        revenueHistory,
        employeeHistory
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. News List API
app.get('/api/news', async (req, res) => {
  try {
    const news = await dbQuery('SELECT id, title, subtitle, category, author_name, author_avatar, date_published, read_time_mins, pull_quote, tags, image_url FROM news ORDER BY date_published DESC');
    const parsedNews = news.map(item => ({
      ...item,
      tags: JSON.parse(item.tags || '[]')
    }));
    res.json(parsedNews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Single News API
app.get('/api/news/:id', async (req, res) => {
  try {
    const article = await dbGet('SELECT * FROM news WHERE id = ?', [req.params.id]);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    article.tags = JSON.parse(article.tags || '[]');
    
    let studentAuthor = null;
    if (article.student_author_id) {
      studentAuthor = await dbGet('SELECT id, name, university, avatar FROM student_profiles WHERE id = ?', [article.student_author_id]);
    }
    
    const related = await dbQuery(
      'SELECT id, title, category, date_published, read_time_mins, image_url FROM news WHERE id != ? LIMIT 3',
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

// GET all blogs
app.get('/api/blogs', async (req, res) => {
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
app.get('/api/blogs/:id', async (req, res) => {
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
app.post('/api/blogs', async (req, res) => {
  try {
    const { title, subtitle, category, author_name, author_avatar, date_published, read_time_mins, content_body, pull_quote, tags, image_url, focus_keyword, meta_title, meta_description, slug, schema_markup } = req.body;
    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const result = await dbRun(`
      INSERT INTO blogs (title, subtitle, category, author_name, author_avatar, date_published, read_time_mins, content_body, pull_quote, tags, image_url, focus_keyword, meta_title, meta_description, slug, schema_markup)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, 
      subtitle, 
      category || 'Guides', 
      author_name || 'Editorial Team', 
      author_avatar || 'https://i.pravatar.cc/100?img=11', 
      date_published || new Date().toISOString().split('T')[0], 
      read_time_mins || Math.max(1, Math.round(content_body.split(/\s+/).length / 200)), 
      content_body, 
      pull_quote || '', 
      JSON.stringify(tags || []), 
      image_url || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
      focus_keyword || '',
      meta_title || '',
      meta_description || '',
      cleanSlug,
      schema_markup || ''
    ]);
    res.json({ success: true, id: result.id, message: 'Blog created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update blog
app.put('/api/blogs/:id', async (req, res) => {
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
      title, 
      subtitle, 
      category, 
      author_name, 
      author_avatar, 
      date_published, 
      read_time_mins || Math.max(1, Math.round(content_body.split(/\s+/).length / 200)), 
      content_body, 
      pull_quote, 
      JSON.stringify(tags || []), 
      image_url,
      focus_keyword,
      meta_title,
      meta_description,
      cleanSlug,
      schema_markup,
      req.params.id
    ]);
    res.json({ success: true, message: 'Blog updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE blog
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM blogs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5b. Interviews API
app.get('/api/interviews', async (req, res) => {
  try {
    const { has_audio } = req.query;
    let query = 'SELECT id, title, subtitle, interviewee_name, interviewee_title, interviewee_avatar, company_id, company_name, date_published, read_time_mins, audio_url, category, student_author_id FROM interviews';
    const params = [];
    
    if (has_audio === 'true') {
      query += ' WHERE audio_url IS NOT NULL AND audio_url != ""';
    }
    
    query += ' ORDER BY date_published DESC';
    const rows = await dbQuery(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/interviews/:id', async (req, res) => {
  try {
    const row = await dbGet('SELECT * FROM interviews WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    row.qa_content = JSON.parse(row.qa_content || '[]');
    
    let studentAuthor = null;
    if (row.student_author_id) {
      studentAuthor = await dbGet('SELECT id, name, university, avatar FROM student_profiles WHERE id = ?', [row.student_author_id]);
    }
    
    res.json({
      ...row,
      studentAuthor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Statistics API
app.get('/api/stats', async (req, res) => {
  try {
    const gdpTrend = [
      { year: 2018, value: 710 },
      { year: 2019, value: 725 },
      { year: 2020, value: 702 }, // covid dip
      { year: 2021, value: 735 },
      { year: 2022, value: 750 },
      { year: 2023, value: 765 },
      { year: 2024, value: 780 },
      { year: 2025, value: 792 },
      { year: 2026, value: 805 }
    ];
    
    const employmentTrend = [
      { year: 2018, value: 4.95 },
      { year: 2019, value: 5.02 },
      { year: 2020, value: 4.98 },
      { year: 2021, value: 5.08 },
      { year: 2022, value: 5.15 },
      { year: 2023, value: 5.22 },
      { year: 2024, value: 5.28 },
      { year: 2025, value: 5.34 },
      { year: 2026, value: 5.40 }
    ];
    
    const sectors = [
      { name: 'Financial Services', share: 10 },
      { name: 'Pharmaceuticals', share: 9 },
      { name: 'Luxury Goods', share: 4 },
      { name: 'Manufacturing & Tech', share: 18 },
      { name: 'Retail & Wholesale', share: 12 },
      { name: 'Tourism & Hospitality', share: 6 },
      { name: 'Other Sectors', share: 41 }
    ];
    
    // Canton weights for Swiss map (0 to 100 density)
    const cantonWeights = {
      ZH: 95, BE: 80, SG: 60, BS: 88, GE: 90, VD: 85, TI: 50, AG: 70, LU: 55, SZ: 65,
      TG: 45, GR: 30, FR: 40, SO: 38, BL: 58, SH: 35, AR: 25, AI: 15, SG: 52, WY: 10,
      NW: 48, OW: 28, UR: 18, GL: 22, ZG: 92, JU: 20, NE: 42, VS: 35
    };
    
    res.json({
      gdpTrend,
      employmentTrend,
      sectors,
      cantonWeights
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Pages Builder Endpoints
app.get('/api/pages', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT id, path, title, meta_description, ads_enabled FROM pages');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pages/by-path', async (req, res) => {
  try {
    const pathQuery = req.query.path || '/';
    const page = await dbGet('SELECT * FROM pages WHERE path = ?', [pathQuery]);
    if (!page) {
      return res.status(404).json({ error: 'Page config not found' });
    }
    page.blocks_layout = JSON.parse(page.blocks_layout || '[]');
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/pages/:id', async (req, res) => {
  try {
    const { title, meta_description, blocks_layout, ads_enabled } = req.body;
    await dbRun(
      'UPDATE pages SET title = ?, meta_description = ?, blocks_layout = ?, ads_enabled = ? WHERE id = ?',
      [title, meta_description, JSON.stringify(blocks_layout), ads_enabled ? 1 : 0, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. Ad Management Endpoints
app.get('/api/admin/ads', async (req, res) => {
  try {
    const rows = await dbQuery(`
      SELECT a.*, c.name as company_name 
      FROM ads a 
      LEFT JOIN companies c ON a.company_id = c.id
      ORDER BY a.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/ads', async (req, res) => {
  try {
    const { name, type, position, company_id, image_url, start_date, end_date, geo_swiss_only } = req.body;
    const result = await dbRun(
      `INSERT INTO ads (name, type, position, company_id, status, impressions, clicks, image_url, start_date, end_date, geo_swiss_only) 
        VALUES (?, ?, ?, ?, 'active', 0, 0, ?, ?, ?, ?)`,
      [name, type, position, company_id || null, image_url || '', start_date, end_date, geo_swiss_only ? 1 : 0]
    );
    res.json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/ads/:id/impression', async (req, res) => {
  try {
    await dbRun('UPDATE ads SET impressions = impressions + 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/ads/:id/click', async (req, res) => {
  try {
    await dbRun('UPDATE ads SET clicks = clicks + 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Translations Manager Endpoints
app.get('/api/admin/translations', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT language_code, key, translated_text, status FROM translations');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/translations', async (req, res) => {
  try {
    const { language_code, key, translated_text, status } = req.body;
    await dbRun(
      'UPDATE translations SET translated_text = ?, status = ? WHERE language_code = ? AND key = ?',
      [translated_text, status, language_code, key]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simulated DeepL Auto-Translate All
app.post('/api/admin/translations/auto-translate-all', async (req, res) => {
  try {
    // Select all translations that are not 'reviewed'
    const rows = await dbQuery("SELECT language_code, key, translated_text FROM translations WHERE status != 'reviewed'");
    
    // We mock translation: prepend flag/language code to the default English value to show changes, or translate logically
    for (const row of rows) {
      // Find the English text for this key
      const engRow = await dbGet('SELECT translated_text FROM translations WHERE language_code = "en" AND key = ?', [row.key]);
      const engText = engRow ? engRow.translated_text : row.translated_text;
      
      // Skip if we already have a real translation (different from English fallback)
      if (row.translated_text && row.translated_text !== engText) {
        continue;
      }
      
      let translated = engText;
      // Mock translations to look realistic
      if (row.language_code === 'ar') translated = `[ar-auto] ${engText}`;
      else if (row.language_code === 'fr') translated = `[fr-auto] ${engText}`;
      else if (row.language_code === 'de') translated = `[de-auto] ${engText}`;
      else translated = `[${row.language_code.toUpperCase()}-auto] ${engText}`;

      await dbRun(
        'UPDATE translations SET translated_text = ?, status = "auto-only" WHERE language_code = ? AND key = ?',
        [translated, row.language_code, row.key]
      );
    }
    
    res.json({ success: true, count: rows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 10. Student Talents & Careers Hub API
app.get('/api/jobs', async (req, res) => {
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

app.get('/api/students', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT * FROM student_profiles ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await dbGet('SELECT * FROM student_profiles WHERE id = ?', [req.params.id]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Get articles written by student
    const articles = await dbQuery('SELECT id, title, category, date_published FROM news WHERE student_author_id = ?', [req.params.id]);
    
    // Get interviews/podcasts done by student
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

// Update student profile
app.put('/api/students/:id', async (req, res) => {
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

// ================= AUTHENTICATION ENDPOINTS =================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || user.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile_id: user.profile_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, role, name, extraData } = req.body;
    
    // Check if user exists
    const existing = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    let profile_id = null;

    // Create profile depending on role
    if (role === 'student') {
      const studentResult = await dbRun(
        `INSERT INTO student_profiles (name, university, study_field, avatar, grad_year, portfolio_url, bio, email)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          extraData?.university || 'University of Zurich',
          extraData?.study_field || 'Business Administration',
          'https://i.pravatar.cc/150?img=12',
          extraData?.grad_year || 2027,
          extraData?.portfolio_url || '',
          extraData?.bio || 'Swiss private sector analyst student.',
          email
        ]
      );
      profile_id = studentResult.id;
    } else if (role === 'company') {
      const companyResult = await dbRun(
        `INSERT INTO companies (name, logo_bg, canton, industry, size_class, description, founded, employees, revenue_band, website, linkedin, contact_email, about_text, structured_data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          '#1F2937',
          extraData?.canton || 'ZH',
          extraData?.industry || 'Services',
          extraData?.size_class || 'Medium',
          extraData?.description || 'Registered Swiss business enterprise.',
          extraData?.founded || 2020,
          extraData?.employees || 10,
          extraData?.revenue_band || 'CHF 1M - 5M',
          extraData?.website || '',
          extraData?.linkedin || '',
          email,
          extraData?.description || 'Registered Swiss business enterprise.',
          '{}'
        ]
      );
      profile_id = companyResult.id;
    }

    // Insert user
    const userResult = await dbRun(
      'INSERT INTO users (email, password_hash, role, profile_id) VALUES (?, ?, ?, ?)',
      [email, password, role, profile_id]
    );

    res.json({
      success: true,
      user: {
        id: userResult.id,
        email,
        role,
        profile_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= CRUD ENDPOINTS FOR NEWS/BLOGS =================

// Create
app.post('/api/news', async (req, res) => {
  try {
    const { title, subtitle, category, author_name, author_avatar, content_body, pull_quote, tags, image_url, student_author_id, focus_keyword, meta_title, meta_description, slug, schema_markup } = req.body;
    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const result = await dbRun(
      `INSERT INTO news (title, subtitle, category, author_name, author_avatar, date_published, read_time_mins, content_body, pull_quote, tags, image_url, student_author_id, focus_keyword, meta_title, meta_description, slug, schema_markup)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, 
        subtitle, 
        category || 'University Perspective', 
        author_name || 'Editorial Team', 
        author_avatar || 'https://i.pravatar.cc/100?img=33', 
        new Date().toISOString().split('T')[0], 
        Math.max(1, Math.round(content_body.split(/\s+/).length / 200)), 
        content_body, 
        pull_quote || '', 
        JSON.stringify(tags || []), 
        image_url || 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600',
        student_author_id || null,
        focus_keyword || '',
        meta_title || '',
        meta_description || '',
        cleanSlug,
        schema_markup || ''
      ]
    );
    res.json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
app.put('/api/news/:id', async (req, res) => {
  try {
    const { title, subtitle, category, author_name, author_avatar, content_body, pull_quote, tags, image_url, student_author_id, focus_keyword, meta_title, meta_description, slug, schema_markup } = req.body;
    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await dbRun(
      `UPDATE news 
       SET title = ?, subtitle = ?, category = ?, author_name = ?, author_avatar = ?, read_time_mins = ?, content_body = ?, pull_quote = ?, tags = ?, image_url = ?, student_author_id = ?, focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?
       WHERE id = ?`,
      [
        title,
        subtitle,
        category,
        author_name,
        author_avatar,
        Math.max(1, Math.round(content_body.split(/\s+/).length / 200)),
        content_body,
        pull_quote,
        JSON.stringify(tags || []),
        image_url,
        student_author_id || null,
        focus_keyword,
        meta_title,
        meta_description,
        cleanSlug,
        schema_markup,
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
app.delete('/api/news/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM news WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= CRUD ENDPOINTS FOR COMPANIES =================

// Create
app.post('/api/companies', async (req, res) => {
  try {
    const { name, logo_bg, canton, industry, size_class, description, premium, verified, founded, employees, revenue_band, website, linkedin, contact_email, about_text, structured_data, focus_keyword, meta_title, meta_description, slug, schema_markup, tags } = req.body;
    const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const result = await dbRun(
      `INSERT INTO companies (name, logo_bg, canton, industry, size_class, description, premium, verified, founded, employees, revenue_band, website, linkedin, contact_email, about_text, structured_data, focus_keyword, meta_title, meta_description, slug, schema_markup, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        logo_bg || '#1A365D',
        canton,
        industry,
        size_class,
        description,
        premium ? 1 : 0,
        verified ? 1 : 0,
        founded || 2026,
        employees || 0,
        revenue_band || 'N/A',
        website || '',
        linkedin || '',
        contact_email || '',
        about_text || '',
        structured_data || '{}',
        focus_keyword || '',
        meta_title || '',
        meta_description || '',
        cleanSlug,
        schema_markup || '',
        JSON.stringify(tags || [])
      ]
    );
    res.json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
app.put('/api/companies/:id', async (req, res) => {
  try {
    const { name, logo_bg, canton, industry, size_class, description, premium, verified, founded, employees, revenue_band, website, linkedin, contact_email, about_text, structured_data, focus_keyword, meta_title, meta_description, slug, schema_markup, tags } = req.body;
    const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await dbRun(
      `UPDATE companies 
       SET name = ?, logo_bg = ?, canton = ?, industry = ?, size_class = ?, description = ?, premium = ?, verified = ?, founded = ?, employees = ?, revenue_band = ?, website = ?, linkedin = ?, contact_email = ?, about_text = ?, structured_data = ?, focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?, tags = ?
       WHERE id = ?`,
      [
        name,
        logo_bg,
        canton,
        industry,
        size_class,
        description,
        premium ? 1 : 0,
        verified ? 1 : 0,
        founded,
        employees,
        revenue_band,
        website,
        linkedin,
        contact_email,
        about_text,
        structured_data,
        focus_keyword,
        meta_title,
        meta_description,
        cleanSlug,
        schema_markup,
        JSON.stringify(tags || []),
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
app.delete('/api/companies/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM companies WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= CRUD ENDPOINTS FOR INTERVIEWS/PODCASTS =================

// Create
app.post('/api/interviews', async (req, res) => {
  try {
    const { title, subtitle, interviewee_name, interviewee_title, interviewee_avatar, company_id, company_name, read_time_mins, audio_url, qa_content, student_author_id, category, focus_keyword, meta_title, meta_description, slug, schema_markup, tags } = req.body;
    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const result = await dbRun(
      `INSERT INTO interviews (title, subtitle, interviewee_name, interviewee_title, interviewee_avatar, company_id, company_name, date_published, read_time_mins, audio_url, qa_content, student_author_id, category, focus_keyword, meta_title, meta_description, slug, schema_markup, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        subtitle,
        interviewee_name,
        interviewee_title,
        interviewee_avatar || 'https://i.pravatar.cc/100?img=59',
        company_id || null,
        company_name || 'Independent',
        new Date().toISOString().split('T')[0],
        read_time_mins || 5,
        audio_url || '',
        qa_content || '[]',
        student_author_id || null,
        category || 'Executive Briefing',
        focus_keyword || '',
        meta_title || '',
        meta_description || '',
        cleanSlug,
        schema_markup || '',
        JSON.stringify(tags || [])
      ]
    );
    res.json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
app.put('/api/interviews/:id', async (req, res) => {
  try {
    const { title, subtitle, interviewee_name, interviewee_title, interviewee_avatar, company_id, company_name, read_time_mins, audio_url, qa_content, student_author_id, category, focus_keyword, meta_title, meta_description, slug, schema_markup, tags } = req.body;
    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await dbRun(
      `UPDATE interviews 
       SET title = ?, subtitle = ?, interviewee_name = ?, interviewee_title = ?, interviewee_avatar = ?, company_id = ?, company_name = ?, read_time_mins = ?, audio_url = ?, qa_content = ?, student_author_id = ?, category = ?, focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?, tags = ?
       WHERE id = ?`,
      [
        title,
        subtitle,
        interviewee_name,
        interviewee_title,
        interviewee_avatar,
        company_id || null,
        company_name,
        read_time_mins,
        audio_url,
        qa_content,
        student_author_id || null,
        category,
        focus_keyword,
        meta_title,
        meta_description,
        cleanSlug,
        schema_markup,
        JSON.stringify(tags || []),
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
app.delete('/api/interviews/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM interviews WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= CRUD ENDPOINTS FOR JOBS/TALENT =================

// Create
app.post('/api/jobs', async (req, res) => {
  try {
    const { title, type, description, company_id, company_name, location, apply_url, focus_keyword, meta_title, meta_description, slug, schema_markup, category, tags } = req.body;
    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const result = await dbRun(
      `INSERT INTO jobs (title, type, description, company_id, company_name, location, apply_url, date_posted, focus_keyword, meta_title, meta_description, slug, schema_markup, category, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        type || 'Full-time',
        description,
        company_id || null,
        company_name || 'Confidential',
        location || 'Switzerland',
        apply_url || '',
        new Date().toISOString().split('T')[0],
        focus_keyword || '',
        meta_title || '',
        meta_description || '',
        cleanSlug,
        schema_markup || '',
        category || 'Engineering',
        JSON.stringify(tags || [])
      ]
    );
    res.json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { title, type, description, company_id, company_name, location, apply_url, focus_keyword, meta_title, meta_description, slug, schema_markup, category, tags } = req.body;
    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await dbRun(
      `UPDATE jobs 
       SET title = ?, type = ?, description = ?, company_id = ?, company_name = ?, location = ?, apply_url = ?, focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?, category = ?, tags = ?
       WHERE id = ?`,
      [
        title,
        type,
        description,
        company_id || null,
        company_name,
        location,
        apply_url,
        focus_keyword,
        meta_title,
        meta_description,
        cleanSlug,
        schema_markup,
        category,
        JSON.stringify(tags || []),
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ================= SITEMAP XML GENERATOR =================

app.get('/sitemap.xml', async (req, res) => {
  try {
    const companies = await dbQuery('SELECT id, slug FROM companies');
    const news = await dbQuery('SELECT id, slug FROM news');
    const interviews = await dbQuery('SELECT id, slug FROM interviews');
    const jobs = await dbQuery('SELECT id, slug FROM jobs');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const staticPages = ['', '/unternehmen', '/news', '/statistiken', '/interviews', '/podcasts', '/karriere', '/ranking', '/login', '/register'];
    staticPages.forEach(p => {
      xml += `  <url>\n    <loc>https://privatesector.vitalswiss.ch/#${p}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Companies
    companies.forEach(c => {
      const slug = c.slug || `company-${c.id}`;
      xml += `  <url>\n    <loc>https://privatesector.vitalswiss.ch/#/unternehmen/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // News
    news.forEach(n => {
      const slug = n.slug || `news-${n.id}`;
      xml += `  <url>\n    <loc>https://privatesector.vitalswiss.ch/#/news/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    // Interviews & Podcasts
    interviews.forEach(i => {
      const slug = i.slug || `interview-${i.id}`;
      xml += `  <url>\n    <loc>https://privatesector.vitalswiss.ch/#/interviews/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    // Jobs
    jobs.forEach(j => {
      const slug = j.slug || `job-${j.id}`;
      xml += `  <url>\n    <loc>https://privatesector.vitalswiss.ch/#/karriere/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    res.status(500).send(`<error>${error.message}</error>`);
  }
});

// Serve frontend assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get(/^\/(.*)$/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Express API Server listening on port ${PORT}`);
});
