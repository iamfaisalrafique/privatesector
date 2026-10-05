import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { marked } from '../emdash-site/node_modules/marked/lib/marked.esm.js';
import sanitizeHtml from '../emdash-site/node_modules/sanitize-html/index.js';
import { htmlToPortableText } from '../emdash-site/node_modules/@emdash-cms/gutenberg-to-portable-text/dist/index.mjs';

const DB_PATH = 'emdash-site/data.db';
const SOURCE_DB_PATH = 'server/database.sqlite';
const MEDIA_MAP_PATH = 'scripts/emdash-media-map.json';
const BASE_URL = 'http://localhost:4321';

// Backup before import
fs.copyFileSync(DB_PATH, 'C:\\Users\\Faisal\\privatesector_backups\\data.db.pre-master-import');

const sourceDb = new DatabaseSync(SOURCE_DB_PATH);
const emdashDb = new DatabaseSync(DB_PATH);
const mediaMap = JSON.parse(fs.readFileSync(MEDIA_MAP_PATH, 'utf-8'));

// Helper: Resolve media item from mediaMap
function resolveMedia(imageUrl, fallbackAlt = 'Featured image') {
  if (!imageUrl) return null;
  const cleanUrl = imageUrl.split('?')[0];
  const filename = cleanUrl.split('/').pop();
  
  if (mediaMap[filename]) {
    const item = { ...mediaMap[filename] };
    if (!item.alt || item.alt === filename) item.alt = fallbackAlt;
    return item;
  }
  if (mediaMap[filename + '.jpg']) {
    const item = { ...mediaMap[filename + '.jpg'] };
    if (!item.alt || item.alt.includes('photo-')) item.alt = fallbackAlt;
    return item;
  }

  // Fallbacks by context
  if (imageUrl.toLowerCase().includes('roche')) {
    return mediaMap['roche_genentech_ypsomed_holly_springs_north_carolina.jpg'] || mediaMap['logo.png'];
  }
  if (imageUrl.toLowerCase().includes('novartis')) {
    return mediaMap['novartis_biotech_trap_avidity_acquisition.jpg'] || mediaMap['logo.png'];
  }

  return mediaMap['logo.png'] || Object.values(mediaMap)[0];
}

// Convert HTML / Markdown to Portable Text
function mdToSanitizedHtml(content) {
  if (!content) return '';
  const trimmed = content.trim();
  const isHtml = trimmed.startsWith('<') && trimmed.includes('</');
  const rawHtml = isHtml ? trimmed : marked.parse(trimmed);

  return sanitizeHtml(rawHtml, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'b', 'em', 'i',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr', 'a', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td'
    ],
    allowedAttributes: {
      '*': ['class', 'id'],
      'a': ['href', 'target', 'rel', 'title'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'th': ['colspan', 'rowspan'],
      'td': ['colspan', 'rowspan']
    }
  });
}

function parseToPortableText(body) {
  if (!body || typeof body !== 'string') return [];
  let trimmed = body.trim();

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed[0]?.q) {
        trimmed = parsed.map(item => `### ${item.q}\n\n${item.a}`).join('\n\n');
      }
    } catch {}
  }

  const sanitized = mdToSanitizedHtml(trimmed);
  try {
    const blocks = htmlToPortableText(sanitized);
    if (Array.isArray(blocks) && blocks.length > 0) return blocks;
  } catch (err) {}

  return [
    {
      _type: 'block',
      _key: `fb-${Date.now()}`,
      style: 'normal',
      children: [{ _type: 'span', _key: `sp-${Date.now()}`, text: body }]
    }
  ];
}

async function main() {
  console.log('=== Starting Master EmDash Re-Import ===');

  // Step 1: Clean slate corrupt tables in data.db
  console.log('Wiping corrupt rows from ec_* and related tables...');
  const wipeTables = [
    'ec_posts', 'ec_companies', 'ec_interviews', 'ec_blogs', 'ec_jobs', 'ec_briefings',
    'revisions', 'content_taxonomies', '_emdash_content_bylines', '_emdash_content_references'
  ];
  for (const t of wipeTables) {
    try {
      emdashDb.prepare(`DELETE FROM ${t}`).run();
    } catch (e) {
      console.warn(`Could not wipe ${t}:`, e.message);
    }
  }

  // Step 2: Authenticate via dev-bypass
  const bypassRes = await fetch(`${BASE_URL}/_emdash/api/auth/dev-bypass`, { redirect: 'manual' });
  const cookie = bypassRes.headers.get('set-cookie') || '';
  if (!cookie) throw new Error('Failed to get auth cookie from dev-bypass');
  console.log('Authenticated with dev-bypass.');

  const headers = {
    'Content-Type': 'application/json',
    'Origin': BASE_URL,
    'X-EmDash-Request': '1',
    cookie
  };

  // Helper to create and publish
  async function createAndPublish(collection, payload, idLabel) {
    const createRes = await fetch(`${BASE_URL}/_emdash/api/content/${collection}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const createData = await createRes.json();
    if (!createData.success) {
      throw new Error(`Failed to create ${collection} (${idLabel}): ${JSON.stringify(createData.error || createData)}`);
    }

    const createdId = createData.data.item.id;
    const pubRes = await fetch(`${BASE_URL}/_emdash/api/content/${collection}/${createdId}/publish`, {
      method: 'POST',
      headers
    });
    const pubData = await pubRes.json();
    if (!pubData.success) {
      throw new Error(`Failed to publish ${collection} ${createdId}: ${JSON.stringify(pubData.error || pubData)}`);
    }

    return createdId;
  }

  // 1. IMPORT NEWS (POSTS)
  const newsRows = sourceDb.prepare('SELECT * FROM news ORDER BY id ASC').all();
  const seenNewsSlugs = new Set();
  const uniqueNewsRows = [];
  for (const row of newsRows) {
    if (seenNewsSlugs.has(row.slug)) {
      console.log(`Skipping duplicate slug in news: ${row.slug} (ID: ${row.id})`);
      continue;
    }
    seenNewsSlugs.add(row.slug);
    uniqueNewsRows.push(row);
  }

  console.log(`\nImporting ${uniqueNewsRows.length} unique news articles...`);
  let importedNews = 0;
  for (const row of uniqueNewsRows) {
    const mediaObj = resolveMedia(row.image_url, row.title);
    const ptContent = parseToPortableText(row.content_body);
    
    // Parse tags if JSON array
    let tagsList = [];
    if (row.tags) {
      try {
        const parsed = typeof row.tags === 'string' && row.tags.startsWith('[') ? JSON.parse(row.tags) : row.tags.split(',').map(s => s.trim());
        if (Array.isArray(parsed)) tagsList = parsed.map(t => t.toLowerCase().replace(/\s+/g, '-'));
      } catch {}
    }

    const payload = {
      slug: row.slug,
      publishedAt: row.date_published ? new Date(row.date_published).toISOString() : new Date().toISOString(),
      seo: {
        title: row.meta_title || row.title,
        description: row.meta_description || row.subtitle || ''
      },
      primaryBylineId: '01M475RNAS48EE9APPEHNTZJ4X', // PrivateSector Intelligence
      data: {
        title: row.title,
        subtitle: row.subtitle || '',
        featured_image: mediaObj,
        content: ptContent,
        pull_quote: row.pull_quote || '',
        read_time_mins: row.read_time_mins || 5,
        author_name: row.author_name || 'PrivateSector Intelligence',
        author_avatar: row.author_avatar || '/assets/logo_highres.png',
        student_author_id: row.student_author_id || null,
        focus_keyword: row.focus_keyword || '',
        meta_title: row.meta_title || row.title,
        meta_description: row.meta_description || row.subtitle || '',
        schema_markup: row.schema_markup || '',
        legacy_id: row.id
      }
    };

    const newId = await createAndPublish('posts', payload, row.slug);
    importedNews++;
    process.stdout.write(`\r- Posts: ${importedNews}/${uniqueNewsRows.length} (ID: ${row.id} -> ${newId})`);
  }
  console.log('\nFinished news articles.');

  // 2. IMPORT COMPANIES
  const companySlugMap = {
    1: 'nestl-s-a',
    2: 'roche-holding-ag',
    3: 'novartis-ag',
    4: 'ubs-group-ag',
    5: 'rolex-sa',
    6: 'swisscom-ag',
    7: 'logitech-international-s-a',
    8: 'richemont',
    9: 'stadler-rail-ag',
    10: 'b-hler-group',
    11: 'barry-callebaut-ag',
    12: 'swiss-re-ag',
    13: 'glencore-plc',
    14: 'lonza-group-ag',
    15: 'dksh-holding-ag',
    16: 'crevoisier-sa',
    17: 'yalosys-ag'
  };

  const companyRows = sourceDb.prepare('SELECT * FROM companies ORDER BY id ASC').all();
  console.log(`\nImporting ${companyRows.length} companies...`);
  let importedCompanies = 0;
  for (const row of companyRows) {
    const slug = companySlugMap[row.id] || row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = {
      slug,
      publishedAt: new Date().toISOString(),
      seo: {
        title: row.meta_title || `${row.name} — Swiss Company Profile`,
        description: row.meta_description || row.description || ''
      },
      data: {
        name: row.name,
        logo_bg: row.logo_bg || '#1A365D',
        canton: row.canton || '',
        industry: row.industry || '',
        size_class: row.size_class || '',
        description: row.description || '',
        premium: Boolean(row.premium),
        verified: Boolean(row.verified),
        founded: row.founded ? Number(row.founded) : null,
        employees: row.employees ? Number(row.employees) : null,
        revenue_band: row.revenue_band || '',
        website: row.website || '',
        linkedin: row.linkedin || '',
        contact_email: row.contact_email || '',
        about_text: row.about_text || '',
        structured_data: row.structured_data || '',
        esg_rating: row.esg_rating ? Number(row.esg_rating) : null,
        sustainability_summary: row.sustainability_summary || '',
        meta_title: row.meta_title || '',
        meta_description: row.meta_description || '',
        legacy_id: row.id
      }
    };

    const newId = await createAndPublish('companies', payload, slug);
    importedCompanies++;
    process.stdout.write(`\r- Companies: ${importedCompanies}/${companyRows.length} (ID: ${row.id} -> ${newId})`);
  }
  console.log('\nFinished companies.');

  // 3. IMPORT INTERVIEWS
  const interviewSlugMap = {
    1: 'shaping-the-future-of-global-food-systems',
    2: 'the-convergence-of-diagnostics-and-personalized-me',
    3: 'preserving-horological-heritage-in-a-digital-age',
    4: 'navigating-consolidation-in-global-wealth-manageme',
    5: 'zurich-street-buzz-how-locals-choose-their-retail',
    6: 'the-rise-of-green-industry-b-hler-group-s-biomass'
  };

  const interviewRows = sourceDb.prepare('SELECT * FROM interviews ORDER BY id ASC').all();
  console.log(`\nImporting ${interviewRows.length} interviews...`);
  let importedInterviews = 0;
  for (const row of interviewRows) {
    const slug = interviewSlugMap[row.id] || row.slug || row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const ptContent = parseToPortableText(row.qa_content);
    const payload = {
      slug,
      publishedAt: row.date_published ? new Date(row.date_published).toISOString() : new Date().toISOString(),
      seo: {
        title: row.meta_title || row.title,
        description: row.meta_description || row.subtitle || ''
      },
      data: {
        title: row.title,
        subtitle: row.subtitle || '',
        interviewee_name: row.interviewee_name || '',
        interviewee_title: row.interviewee_title || '',
        interviewee_avatar: row.interviewee_avatar || '',
        company_name: row.company_name || '',
        audio_url: row.audio_url || '',
        read_time_mins: row.read_time_mins || 10,
        qa_content: row.qa_content || '',
        student_author_id: row.student_author_id || null,
        category: row.category || 'Executive Interview',
        legacy_id: row.id
      }
    };

    const newId = await createAndPublish('interviews', payload, slug);
    importedInterviews++;
    process.stdout.write(`\r- Interviews: ${importedInterviews}/${interviewRows.length} (ID: ${row.id} -> ${newId})`);
  }
  console.log('\nFinished interviews.');

  // 4. IMPORT BLOGS (2 UNIQUE)
  const blogRows = sourceDb.prepare('SELECT * FROM blogs WHERE id IN (1, 2) ORDER BY id ASC').all();
  console.log(`\nImporting ${blogRows.length} unique blogs...`);
  let importedBlogs = 0;
  for (const row of blogRows) {
    const mediaObj = resolveMedia(row.image_url, row.title);
    const ptContent = parseToPortableText(row.content_body);
    const slug = row.id === 1 ? 'how-to-navigate-the-swiss-b2b-compliance-landscape' : 'the-rise-of-green-tech-startups-in-zurich';
    const payload = {
      slug,
      publishedAt: row.date_published ? new Date(row.date_published).toISOString() : new Date().toISOString(),
      seo: {
        title: row.meta_title || row.title,
        description: row.meta_description || row.subtitle || ''
      },
      primaryBylineId: '01M475RNABJEKGEHTXF5KG78RP', // Editorial
      data: {
        title: row.title,
        subtitle: row.subtitle || '',
        featured_image: mediaObj,
        content: ptContent,
        pull_quote: row.pull_quote || '',
        read_time_mins: row.read_time_mins || 6,
        author_name: row.author_name || 'PrivateSector Editorial',
        author_avatar: row.author_avatar || '/assets/logo_highres.png',
        focus_keyword: row.focus_keyword || '',
        meta_title: row.meta_title || row.title,
        meta_description: row.meta_description || row.subtitle || '',
        schema_markup: row.schema_markup || '',
        legacy_id: row.id
      }
    };

    const newId = await createAndPublish('blogs', payload, slug);
    importedBlogs++;
    process.stdout.write(`\r- Blogs: ${importedBlogs}/${blogRows.length} (ID: ${row.id} -> ${newId})`);
  }
  console.log('\nFinished blogs.');

  // 5. IMPORT CAREERS / JOBS (4 JOBS)
  const jobSlugMap = {
    1: 'sustainable-agriculture-analyst-internship',
    2: 'wealth-management-trainee',
    3: 'healthcare-data-analyst-trainee',
    4: 'precision-mechanical-engineer-internship'
  };

  const jobRows = sourceDb.prepare('SELECT * FROM jobs ORDER BY id ASC').all();
  console.log(`\nImporting ${jobRows.length} jobs...`);
  let importedJobs = 0;
  for (const row of jobRows) {
    const slug = jobSlugMap[row.id] || row.slug || row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const ptContent = parseToPortableText(row.description);
    const payload = {
      slug,
      publishedAt: row.date_posted ? new Date(row.date_posted).toISOString() : new Date().toISOString(),
      seo: {
        title: row.meta_title || `${row.title} at ${row.company_name}`,
        description: row.meta_description || `Career opportunity: ${row.title} at ${row.company_name}`
      },
      data: {
        title: row.title,
        company_name: row.company_name || '',
        company_id: row.company_id ? Number(row.company_id) : null,
        location: row.location || 'Switzerland',
        canton: row.location?.includes('Zurich') ? 'ZH' : (row.location?.includes('Geneva') ? 'GE' : 'CH'),
        employment_type: row.type || 'Full-time',
        experience_level: 'Mid-Senior level',
        department: row.category || 'Operations',
        apply_url: row.apply_url || '',
        description: ptContent,
        deadline: null,
        legacy_id: row.id
      }
    };

    const newId = await createAndPublish('jobs', payload, slug);
    importedJobs++;
    process.stdout.write(`\r- Jobs: ${importedJobs}/${jobRows.length} (ID: ${row.id} -> ${newId})`);
  }
  console.log('\nFinished jobs.');

  // 6. IMPORT MORNING BRIEFINGS (2 BRIEFINGS)
  const briefingRows = sourceDb.prepare('SELECT * FROM morning_briefings ORDER BY id ASC').all();
  console.log(`\nImporting ${briefingRows.length} morning briefings...`);
  let importedBriefings = 0;
  for (const row of briefingRows) {
    const mediaObj = resolveMedia(row.image_url, row.title);
    const slug = `briefing-${row.id}`;
    const payload = {
      slug,
      publishedAt: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
      data: {
        title: row.title,
        date: row.date || '',
        audio_url: row.audio_url || '',
        audio_duration: row.audio_duration ? Number(row.audio_duration) : 180,
        transcript: row.transcript || '',
        featured_image: mediaObj,
        legacy_id: row.id
      }
    };


    const newId = await createAndPublish('briefings', payload, slug);
    importedBriefings++;
    process.stdout.write(`\r- Briefings: ${importedBriefings}/${briefingRows.length} (ID: ${row.id} -> ${newId})`);
  }
  console.log('\nFinished morning briefings.');


  console.log('\n=== All Collections Successfully Imported and Published via Content API! ===');
}

main().catch(err => {
  console.error('\nFatal Import Error:', err);
  process.exit(1);
});
