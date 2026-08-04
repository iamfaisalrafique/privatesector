import { Router } from 'express';
import { dbGet, dbRun } from '../db.js';

const router = Router();

// Login
router.post('/login', async (req, res) => {
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

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, role, name, extraData } = req.body;
    
    const existing = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    let profile_id = null;

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

export default router;
