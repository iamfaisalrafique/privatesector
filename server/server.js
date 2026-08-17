import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, dbQuery } from './db.js';

// Import Modular Route Handlers
import authRoutes from './routes/auth.routes.js';
import companyRoutes from './routes/company.routes.js';
import newsRoutes from './routes/news.routes.js';
import blogsRoutes from './routes/blogs.routes.js';
import studentsRoutes from './routes/students.routes.js';
import adminRoutes from './routes/admin.routes.js';

import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers & Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../dist/uploads')));

// 404 handler for missing uploads so it doesn't return HTML
app.use('/uploads', (req, res) => {
  res.status(404).type('text/plain').send('Image not found');
});

// Initialize Database on startup
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
});

// Image Upload Endpoint
app.post('/api/upload', (req, res) => {
  try {
    const { image, filename, exactName } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    let ext = 'jpg';
    let buffer;

    if (matches && matches.length === 3) {
      ext = matches[1] === 'jpeg' ? 'jpg' : (matches[1] === 'svg+xml' ? 'svg' : matches[1]);
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image, 'base64');
    }

    const cleanBase = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase() : 'upload';
    const uniqueName = exactName ? `${cleanBase}.${ext}` : `${cleanBase}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    // Also write to public/uploads if available locally
    const pubUploads = path.join(__dirname, '../public/uploads');
    if (fs.existsSync(pubUploads)) {
      try { fs.writeFileSync(path.join(pubUploads, uniqueName), buffer); } catch(e){}
    }

    const publicUrl = `/uploads/${uniqueName}`;
    res.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// ================= MODULAR API ROUTE MOUNTS =================
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api', studentsRoutes); // /api/jobs, /api/students
app.use('/api/admin', adminRoutes); // /api/admin/ads, /api/admin/translations

// Translations Dictionary API (For language switcher)
app.get('/api/translations', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const rows = await dbQuery('SELECT key, translated_text FROM translations WHERE language_code = ?', [lang]);
    const dictionary = {};
    rows.forEach(row => {
      dictionary[row.key] = row.translated_text;
    });
    res.json(dictionary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistics API
app.get('/api/stats', async (req, res) => {
  try {
    const gdpTrend = [
      { year: 2018, value: 710 }, { year: 2019, value: 725 }, { year: 2020, value: 702 },
      { year: 2021, value: 735 }, { year: 2022, value: 750 }, { year: 2023, value: 765 },
      { year: 2024, value: 780 }, { year: 2025, value: 792 }, { year: 2026, value: 805 }
    ];
    const employmentTrend = [
      { year: 2018, value: 4.95 }, { year: 2019, value: 5.02 }, { year: 2020, value: 4.98 },
      { year: 2021, value: 5.08 }, { year: 2022, value: 5.15 }, { year: 2023, value: 5.22 },
      { year: 2024, value: 5.28 }, { year: 2025, value: 5.34 }, { year: 2026, value: 5.40 }
    ];
    const sectors = [
      { name: 'Financial Services', share: 10 }, { name: 'Pharmaceuticals', share: 9 },
      { name: 'Luxury Goods', share: 4 }, { name: 'Manufacturing & Tech', share: 18 },
      { name: 'Retail & Wholesale', share: 12 }, { name: 'Tourism & Hospitality', share: 6 },
      { name: 'Other Sectors', share: 41 }
    ];
    const cantonWeights = {
      ZH: 95, BE: 80, SG: 60, BS: 88, GE: 90, VD: 85, TI: 50, AG: 70, LU: 55, SZ: 65,
      TG: 45, GR: 30, FR: 40, SO: 38, BL: 58, SH: 35, AR: 25, AI: 15, WY: 10, NW: 48,
      OW: 28, UR: 18, GL: 22, ZG: 92, JU: 20, NE: 42, VS: 35
    };
    res.json({ gdpTrend, employmentTrend, sectors, cantonWeights });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pages Builder Endpoints
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

// Dynamic Real-Time XML Sitemap Generator (Supports Companies, News, Blogs, Interviews, Jobs, Students & Custom Builder Pages)
app.get('/sitemap.xml', async (req, res) => {
  try {
    const companies = await dbQuery('SELECT id, slug, name FROM companies');
    const news = await dbQuery('SELECT id, slug, title, date_published FROM news');
    const blogs = await dbQuery('SELECT id, slug, title, date_published FROM blogs');
    const interviews = await dbQuery('SELECT id, slug, title, date_published FROM interviews');
    const jobs = await dbQuery('SELECT id, slug, title, date_posted FROM jobs');
    const students = await dbQuery('SELECT id, name FROM student_profiles');
    const customPages = await dbQuery('SELECT path FROM pages');

    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

    // 1. Core Platform Static Pages
    const staticPages = [
      { path: '', priority: '1.0', freq: 'daily' },
      { path: '/unternehmen', priority: '0.9', freq: 'daily' },
      { path: '/news', priority: '0.9', freq: 'daily' },
      { path: '/blogs', priority: '0.8', freq: 'daily' },
      { path: '/statistiken', priority: '0.8', freq: 'weekly' },
      { path: '/interviews', priority: '0.8', freq: 'weekly' },
      { path: '/podcasts', priority: '0.7', freq: 'weekly' },
      { path: '/karriere', priority: '0.8', freq: 'daily' },
      { path: '/ranking', priority: '0.8', freq: 'weekly' },
      { path: '/about', priority: '0.5', freq: 'monthly' },
      { path: '/contact', priority: '0.5', freq: 'monthly' },
      { path: '/login', priority: '0.3', freq: 'monthly' },
      { path: '/register', priority: '0.3', freq: 'monthly' }
    ];

    staticPages.forEach(p => {
      xml += `  <url>\n    <loc>https://privatesector.ch${p.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.freq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    });

    // 2. Custom Page Builder Pages
    (customPages || []).forEach(cp => {
      if (cp.path && !staticPages.some(s => s.path === cp.path)) {
        xml += `  <url>\n    <loc>https://privatesector.ch${cp.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }
    });

    // 3. Dynamic Company Listings
    (companies || []).forEach(c => {
      const targetSlug = c.slug || c.id;
      xml += `  <url>\n    <loc>https://privatesector.ch/unternehmen/${targetSlug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // 4. Dynamic News & Press Releases (with Google News extensions)
    (news || []).forEach(n => {
      const targetSlug = n.slug || n.id;
      const pubDate = n.date_published || today;
      xml += `  <url>\n    <loc>https://privatesector.ch/news/${targetSlug}</loc>\n    <lastmod>${pubDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // 5. Dynamic Blogs & Market Insights
    (blogs || []).forEach(b => {
      const targetSlug = b.slug || b.id;
      const pubDate = b.date_published || today;
      xml += `  <url>\n    <loc>https://privatesector.ch/blogs/${targetSlug}</loc>\n    <lastmod>${pubDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    // 6. Dynamic Interviews & Executive Briefings
    (interviews || []).forEach(i => {
      const targetSlug = i.slug || i.id;
      const pubDate = i.date_published || today;
      xml += `  <url>\n    <loc>https://privatesector.ch/interviews/${targetSlug}</loc>\n    <lastmod>${pubDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    // 7. Dynamic Job Listings & Careers
    (jobs || []).forEach(j => {
      const targetSlug = j.slug || j.id;
      const pubDate = j.date_posted || today;
      xml += `  <url>\n    <loc>https://privatesector.ch/karriere/${targetSlug}</loc>\n    <lastmod>${pubDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    // 8. Dynamic Student Talent Profiles
    (students || []).forEach(s => {
      xml += `  <url>\n    <loc>https://privatesector.ch/student/${s.id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
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
