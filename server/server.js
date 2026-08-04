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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(express.json({ limit: '5mb' }));

// Initialize Database on startup
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
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

// XML Sitemap Generator
app.get('/sitemap.xml', async (req, res) => {
  try {
    const companies = await dbQuery('SELECT id, slug FROM companies');
    const news = await dbQuery('SELECT id, slug FROM news');
    const interviews = await dbQuery('SELECT id, slug FROM interviews');
    const jobs = await dbQuery('SELECT id, slug FROM jobs');

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const staticPages = ['', '/unternehmen', '/news', '/statistiken', '/interviews', '/podcasts', '/karriere', '/ranking', '/login', '/register'];
    staticPages.forEach(p => {
      xml += `  <url>\n    <loc>https://privatesector.ch/#${p}</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    companies.forEach(c => {
      const slug = c.slug || `company-${c.id}`;
      xml += `  <url>\n    <loc>https://privatesector.ch/#/unternehmen/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    news.forEach(n => {
      const slug = n.slug || `news-${n.id}`;
      xml += `  <url>\n    <loc>https://privatesector.ch/#/news/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    interviews.forEach(i => {
      const slug = i.slug || `interview-${i.id}`;
      xml += `  <url>\n    <loc>https://privatesector.ch/#/interviews/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    jobs.forEach(j => {
      const slug = j.slug || `job-${j.id}`;
      xml += `  <url>\n    <loc>https://privatesector.ch/#/karriere/${slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
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
