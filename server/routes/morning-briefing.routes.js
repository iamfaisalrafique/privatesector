import { Router } from 'express';
import { dbQuery, dbGet, dbRun } from '../db.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const audioDir = path.join(__dirname, '../uploads/audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const router = Router();

// Helper: Hydrate linked articles for a briefing
async function hydrateBriefingArticles(briefing) {
  if (!briefing) return null;
  let articleIds = [];
  try {
    articleIds = typeof briefing.linked_articles === 'string' 
      ? JSON.parse(briefing.linked_articles || '[]') 
      : (briefing.linked_articles || []);
  } catch (e) {
    articleIds = [];
  }

  let articles = [];
  if (Array.isArray(articleIds) && articleIds.length > 0) {
    const validIds = articleIds.map(id => parseInt(id)).filter(id => !isNaN(id));
    if (validIds.length > 0) {
      const placeholders = validIds.map(() => '?').join(',');
      const newsRows = await dbQuery(
        `SELECT id, title, subtitle, category, image_url, date_published, read_time_mins, slug 
         FROM news 
         WHERE id IN (${placeholders})`,
        validIds
      );

      // Preserve the order specified in articleIds
      const newsMap = new Map(newsRows.map(n => [n.id, { ...n, type: 'news' }]));
      articles = validIds.map(id => newsMap.get(id)).filter(Boolean);

      // If any IDs weren't in news, check blogs
      const missingIds = validIds.filter(id => !newsMap.has(id));
      if (missingIds.length > 0) {
        const blogPlaceholders = missingIds.map(() => '?').join(',');
        const blogRows = await dbQuery(
          `SELECT id, title, subtitle, category, image_url, date_published, read_time_mins, slug 
           FROM blogs 
           WHERE id IN (${blogPlaceholders})`,
          missingIds
        );
        blogRows.forEach(b => {
          articles.push({ ...b, type: 'blog' });
        });
      }
    }
  }

  return {
    ...briefing,
    linked_articles: articleIds,
    articles
  };
}

// 1. GET Active Briefings for Homepage (default limit: 2)
router.get('/active', async (req, res) => {
  try {
    const limit = Math.min(6, parseInt(req.query.limit) || 2);
    const rows = await dbQuery(
      `SELECT * FROM morning_briefings 
       WHERE status = 'published' 
       ORDER BY date DESC, id DESC 
       LIMIT ?`,
      [limit]
    );

    const hydrated = await Promise.all(rows.map(hydrateBriefingArticles));
    res.json(hydrated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET All Briefings (Admin list)
router.get('/', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT * FROM morning_briefings ORDER BY date DESC, id DESC');
    const hydrated = await Promise.all(rows.map(hydrateBriefingArticles));
    res.json(hydrated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET Single Briefing Detail
router.get('/:id', async (req, res) => {
  try {
    const briefing = await dbGet('SELECT * FROM morning_briefings WHERE id = ?', [req.params.id]);
    if (!briefing) {
      return res.status(404).json({ error: 'Morning briefing not found' });
    }
    const hydrated = await hydrateBriefingArticles(briefing);
    res.json(hydrated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. POST Create Briefing
router.post('/', async (req, res) => {
  try {
    const { title, date, image_url, audio_url, audio_duration, transcript, linked_articles, status } = req.body;
    
    if (!title || !audio_url) {
      return res.status(400).json({ error: 'Title and audio URL are required' });
    }

    const nowStr = new Date().toISOString();
    const briefingDate = date || nowStr.split('T')[0];
    const articlesJson = JSON.stringify(Array.isArray(linked_articles) ? linked_articles : []);

    const result = await dbRun(
      `INSERT INTO morning_briefings (title, date, image_url, audio_url, audio_duration, transcript, linked_articles, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        briefingDate,
        image_url || '',
        audio_url,
        parseInt(audio_duration) || 0,
        transcript || '',
        articlesJson,
        status || 'published',
        nowStr,
        nowStr
      ]
    );

    res.json({ success: true, id: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. PUT Update Briefing
router.put('/:id', async (req, res) => {
  try {
    const { title, date, image_url, audio_url, audio_duration, transcript, linked_articles, status } = req.body;
    const nowStr = new Date().toISOString();
    const articlesJson = JSON.stringify(Array.isArray(linked_articles) ? linked_articles : []);

    await dbRun(
      `UPDATE morning_briefings
       SET title = ?, date = ?, image_url = ?, audio_url = ?, audio_duration = ?, transcript = ?, linked_articles = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [
        title,
        date,
        image_url || '',
        audio_url,
        parseInt(audio_duration) || 0,
        transcript || '',
        articlesJson,
        status || 'published',
        nowStr,
        req.params.id
      ]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. DELETE Briefing
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM morning_briefings WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. POST Audio Upload (Accepts base64 audio payload)
router.post('/upload-audio', (req, res) => {
  try {
    const { audio, filename } = req.body;
    if (!audio) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    // Determine extension and buffer from base64 data URI or raw base64
    const matches = audio.match(/^data:audio\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    let ext = 'mp3';
    let buffer;

    if (matches && matches.length === 3) {
      const mimeSub = matches[1].toLowerCase();
      if (mimeSub.includes('wav')) ext = 'wav';
      else if (mimeSub.includes('ogg')) ext = 'ogg';
      else if (mimeSub.includes('webm')) ext = 'webm';
      else if (mimeSub.includes('m4a') || mimeSub.includes('mp4')) ext = 'm4a';
      else ext = 'mp3';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(audio, 'base64');
    }

    const cleanBase = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase() : 'briefing_audio';
    const uniqueName = `${cleanBase}_${Date.now()}.${ext}`;
    const filePath = path.join(audioDir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    // Also write to public/uploads/audio if directory exists
    const pubAudio = path.join(__dirname, '../../public/uploads/audio');
    if (!fs.existsSync(pubAudio)) {
      try { fs.mkdirSync(pubAudio, { recursive: true }); } catch (e) {}
    }
    if (fs.existsSync(pubAudio)) {
      try { fs.writeFileSync(path.join(pubAudio, uniqueName), buffer); } catch (e) {}
    }

    const publicUrl = `/uploads/audio/${uniqueName}`;
    res.json({ success: true, url: publicUrl, filename: uniqueName });
  } catch (error) {
    console.error('Audio upload error:', error);
    res.status(500).json({ error: 'Failed to upload audio file' });
  }
});

// 8. POST Transcribe Audio
router.post('/transcribe', async (req, res) => {
  try {
    const { audioUrl, audioBase64 } = req.body;
    
    // Check if OpenAI API key is available
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey) {
      let fileBuffer = null;
      let tempFilename = 'audio.mp3';

      if (audioBase64) {
        const matches = audioBase64.match(/^data:audio\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
        fileBuffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(audioBase64, 'base64');
      } else if (audioUrl && audioUrl.startsWith('/uploads/')) {
        const localPath = path.join(__dirname, '../', audioUrl);
        if (fs.existsSync(localPath)) {
          fileBuffer = fs.readFileSync(localPath);
          tempFilename = path.basename(localPath);
        }
      }

      if (fileBuffer) {
        const formData = new FormData();
        const blob = new Blob([fileBuffer]);
        formData.append('file', blob, tempFilename);
        formData.append('model', 'whisper-1');

        const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiKey}`
          },
          body: formData
        });

        if (whisperRes.ok) {
          const whisperData = await whisperRes.json();
          return res.json({ success: true, transcript: whisperData.text });
        }
      }
    }

    // Graceful response when no external key is active (frontend handles in-browser Web Speech API)
    res.json({ 
      success: false, 
      message: 'External AI transcription key not configured in .env. Live microphone speech-to-text was used, or you can edit/paste the transcript directly.' 
    });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
