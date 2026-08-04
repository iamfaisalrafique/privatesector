import { Router } from 'express';
import { dbQuery, dbGet, dbRun } from '../db.js';

const router = Router();

// Ads Campaigns
router.get('/ads', async (req, res) => {
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

router.post('/ads', async (req, res) => {
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

router.post('/ads/:id/impression', async (req, res) => {
  try {
    await dbRun('UPDATE ads SET impressions = impressions + 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ads/:id/click', async (req, res) => {
  try {
    await dbRun('UPDATE ads SET clicks = clicks + 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Translations Manager
router.get('/translations', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT language_code, key, translated_text, status FROM translations');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/translations', async (req, res) => {
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

router.post('/translations/auto-translate-all', async (req, res) => {
  try {
    const rows = await dbQuery("SELECT language_code, key, translated_text FROM translations WHERE status != 'reviewed'");
    for (const row of rows) {
      const engRow = await dbGet('SELECT translated_text FROM translations WHERE language_code = "en" AND key = ?', [row.key]);
      const engText = engRow ? engRow.translated_text : row.translated_text;
      
      if (row.translated_text && row.translated_text !== engText) {
        continue;
      }
      
      let translated = engText;
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

export default router;
