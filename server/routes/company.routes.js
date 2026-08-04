import { Router } from 'express';
import { dbQuery, dbGet, dbRun } from '../db.js';

const router = Router();

// Companies List API
router.get('/', async (req, res) => {
  try {
    const { search, canton, industry, size, verified, premium } = req.query;
    let query = 'SELECT id, name, logo_bg, canton, industry, size_class, description, premium, verified, founded, employees, revenue_band, esg_rating FROM companies WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR industry LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (canton) {
      const cantonsList = canton.split(',');
      query += ` AND canton IN (${cantonsList.map(() => '?').join(',')})`;
      params.push(...cantonsList);
    }
    if (industry) {
      const industriesList = industry.split(',');
      query += ` AND industry IN (${industriesList.map(() => '?').join(',')})`;
      params.push(...industriesList);
    }
    if (size && size !== 'All') {
      query += ' AND size_class = ?';
      params.push(size);
    }
    if (verified === 'true') {
      query += ' AND verified = 1';
    }
    if (premium === 'true') {
      query += ' AND premium = 1';
    }

    query += ' ORDER BY premium DESC, name ASC';
    const rows = await dbQuery(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Single Company Detail
router.get('/:id', async (req, res) => {
  try {
    const company = await dbGet('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    company.structured_data = JSON.parse(company.structured_data || '{}');
    
    const keyMetrics = {
      esgRating: company.esg_rating || 'AA',
      cantonHeadquarters: company.canton,
      foundedYear: company.founded,
      employeesCount: company.employees,
      revenueBand: company.revenue_band
    };
    
    res.json({ ...company, keyMetrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Company
router.post('/', async (req, res) => {
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

// Update Company
router.put('/:id', async (req, res) => {
  try {
    const { name, logo_bg, canton, industry, size_class, description, premium, verified, founded, employees, revenue_band, website, linkedin, contact_email, about_text, structured_data, focus_keyword, meta_title, meta_description, slug, schema_markup, tags } = req.body;
    const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await dbRun(
      `UPDATE companies 
       SET name = ?, logo_bg = ?, canton = ?, industry = ?, size_class = ?, description = ?, premium = ?, verified = ?, founded = ?, employees = ?, revenue_band = ?, website = ?, linkedin = ?, contact_email = ?, about_text = ?, structured_data = ?, focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?, tags = ?
       WHERE id = ?`,
      [
        name, logo_bg, canton, industry, size_class, description,
        premium ? 1 : 0, verified ? 1 : 0, founded, employees, revenue_band,
        website, linkedin, contact_email, about_text, structured_data,
        focus_keyword, meta_title, meta_description, cleanSlug, schema_markup,
        JSON.stringify(tags || []), req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Company
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM companies WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
