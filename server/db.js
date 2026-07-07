import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.sqlite');

let usePg = false;
let pool = null;
let sqliteDb = null;
let sqlite3 = null;

const connectionString = process.env.DATABASE_URL;

if (connectionString) {
  console.log('DATABASE_URL environment variable found. Using PostgreSQL.');
  usePg = true;
  pool = new pg.Pool({
    connectionString,
  });
  pool.on('error', (err) => {
    console.error('Unexpected error on idle pg client', err);
  });
} else {
  console.log('No DATABASE_URL environment variable found. Falling back to local SQLite.');
  usePg = false;
  try {
    const sqliteModule = await import('sqlite3');
    sqlite3 = sqliteModule.default || sqliteModule;
  } catch (err) {
    console.error('Failed to import sqlite3 database driver. Make sure to run "npm install sqlite3 --no-save"');
  }
}

if (!usePg && sqlite3) {
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening SQLite database:', err);
    } else {
      console.log('Connected to SQLite database at:', dbPath);
    }
  });
}

// Helper to convert SQLite `?` placeholders to PostgreSQL `$1, $2, ...`
function convertSql(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

// Helper to clean PostgreSQL syntax for SQLite compatibility
function cleanSqlForSQLite(sql) {
  let cleaned = sql;
  
  // Replace SERIAL PRIMARY KEY with INTEGER PRIMARY KEY AUTOINCREMENT
  cleaned = cleaned.replace(/SERIAL\s+PRIMARY\s+KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
  
  // Replace ADD COLUMN IF NOT EXISTS with ADD COLUMN (SQLite handles exist check through error handling)
  cleaned = cleaned.replace(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS/gi, 'ADD COLUMN');
  
  return cleaned;
}

export async function dbQuery(sql, params = []) {
  if (usePg) {
    const converted = convertSql(sql);
    const res = await pool.query(converted, params);
    return res.rows;
  } else {
    const cleanedSql = cleanSqlForSQLite(sql);
    return new Promise((resolve, reject) => {
      sqliteDb.all(cleanedSql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

export async function dbRun(sql, params = []) {
  if (usePg) {
    let converted = convertSql(sql);
    const isInsert = converted.trim().toUpperCase().startsWith('INSERT');
    if (isInsert && !converted.toUpperCase().includes('RETURNING')) {
      converted = `${converted} RETURNING *`;
    }
    const res = await pool.query(converted, params);
    return {
      id: isInsert && res.rows[0] ? res.rows[0].id : null,
      changes: res.rowCount
    };
  } else {
    const cleanedSql = cleanSqlForSQLite(sql);
    return new Promise((resolve, reject) => {
      sqliteDb.run(cleanedSql, params, function (err) {
        if (err) {
          // Swallow duplicate column name error during migrations
          if (err.message.includes('duplicate column name')) {
            resolve({ id: null, changes: 0 });
          } else {
            reject(err);
          }
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }
}

export async function dbGet(sql, params = []) {
  if (usePg) {
    const converted = convertSql(sql);
    const res = await pool.query(converted, params);
    return res.rows[0] || null;
  } else {
    const cleanedSql = cleanSqlForSQLite(sql);
    return new Promise((resolve, reject) => {
      sqliteDb.get(cleanedSql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }
}


// Translation cache setup
let translationCache = {};
const cachePath = path.resolve(__dirname, 'translations_cache.json');
try {
  if (fs.existsSync(cachePath)) {
    translationCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }
} catch (e) {
  console.error('Failed to load translations cache:', e);
}

function saveTranslationCache() {
  try {
    fs.writeFileSync(cachePath, JSON.stringify(translationCache, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write translation cache:', err);
  }
}

// Google Translate integration helper
const GERMAN_UI_KEYS = new Set([
  '✓ Verified',
  '✓ Premium',
  'Verified ✓',
  '🍃 Eco-Leader',
  'LIVE',
  'Rectangle (300px × 250px)',
  'Leaderboard (100% × 90px)',
  'Admin Dashboard',
  'Business Spotlight',
  'Spotlight Companies',
  'Spotlight',
  'Unternehmen',
  'News',
  'Statistiken',
  'Interviews',
  'Podcasts',
  'Talent',
  'Ranking',
  'Admin',
  'Home',
  'Directory',
  'Search',
  'Search...',
  'Suchen',
  'Firma suchen (z.B. Nestlé, Roche, UBS)...',
  'Premium',
  'Canton VD · Consumer Goods',
  'The world\'s largest food & beverage company. Headquartered in Vevey.',
  'Canton VD',
  'Canton',
  'FOUNDED',
  'REVENUE',
  'EMPLOYEES',
  'VD',
  'GE',
  'BS',
  'ZG',
  'SG',
  'AG',
  'ZH',
  'BE',
  'Est.',
  'View Profile →',
  'Luxury Goods',
  'Consumer Goods',
  'Pharmaceuticals',
  'Financial Services',
  'Technology',
  'Manufacturing',
  'Commodities',
  'Swiss Watch Exports Surge by 8.6% Driven by Premium Asia Demands',
  'Luxury manufactures like Rolex and Richemont see record order books despite macroeconomic cooling.',
  'Nestlé Expands Plant-Based Production in Konolfingen',
  'A CHF 120M investment builds out state-of-the-art alternative protein research and processing lines.',
  'Stadler Rail Secures Major CHF 1.8B Order for Italian Regional Trains',
  'The Bussnang manufacturer will deliver hydrogen-powered and electric multiple-unit trains to Trenitalia.',
  'B2B Vertrauensindex',
  'Zefix-verifizierte Profile sorgen für Transparenz und direkte Vertrauensbildung mit internationalen Handelspartnern im Schweizer B2B-Markt.',
  'Dossier-Index durchsuchen',
  'Showcase Sponsor Spot Here.',
  'Sponsor Spotlight',
  'Ad',
  'Werbung',
  'Karriere-Zentrum wird geladen...',
  'TALENT FORUM & CAREERS',
  'Karriere & Talent-Plattform',
  'Die Schnittstelle zwischen Schweizer Spitzen-Universitäten (wie der HSG und ETH) und den führenden Unternehmen des Privatsektors.',
  'Nachwuchstalente',
  'Diese Studierenden publizieren exklusive Wirtschaftsanalysen und Firmenstudien auf unserer Plattform. Klicken Sie auf ein Profil, um deren Dossier und Portfolio einzusehen.',
  'Klasse',
  'Stellenangebote & Praktika',
  'Alle Typen',
  'Praktikum',
  'Trainee Program',
  'Alle Kantone',
  'Zurich (ZH)',
  'Vaud (VD)',
  'Basel (BS)',
  'St. Gallen (SG)',
  'Keine passenden Stellenangebote im System gefunden.',
  'Bewerben',
  'Studenten-Profil wird geladen...',
  'Profil nicht gefunden',
  'Zurück zur Karriere-Plattform',
  'Zurück zur Übersicht',
  'Zertifizierter Student Contributor',
  'Fachbereich:',
  'Abschlussklasse',
  'Über mich',
  'Externes Universitäts-Portfolio',
  'Publikationen & Analysen',
  'Noch keine schriftlichen Wirtschaftsanalysen veröffentlicht.',
  'Audio Briefings & Podcasts',
  'Noch keine Audio-Podcasts oder Interviews aufgezeichnet.',
  'Erfolgreich angemeldet als',
  'Konto erfolgreich registriert für',
  'mit Sprache',
  'Schweizer Wirtschaftsdaten,',
  'vollständig verifiziert.',
  'Verifizierte B2B-Firmendossiers',
  'Metriken, Kantons- und Registerdaten direkt aus offiziellen Quellen.',
  'Präzise Analysen & Marktberichte',
  'Unabhängiger Wirtschaftsjournalismus mit exklusiven CEO-Interviews.',
  '100% DSGVO / GDPR Konformität',
  'Ihre Präferenzen und Daten werden vollständig verschlüsselt in der Schweiz gehostet.',
  'Swiss-made',
  'GDPR-compliant',
  '18 languages supported',
  'Anmelden',
  'Konto erstellen',
  'Willkommen zurück im Schweizer B2B Portal',
  'Erhalten Sie unbegrenzten Zugriff auf Firmendaten',
  'Mit LinkedIn anmelden',
  'Mit Google anmelden',
  'oder mit E-Mail',
  'Name',
  'Ihr vollständiger Name',
  'E-Mail-Adresse',
  'Passwort',
  'Bevorzugte Sprache',
  'Noch kein Konto?',
  'Jetzt registrieren',
  'Bereits registriert?',
  'Hier anmelden',
  'Dossier wird geladen...',
  'Fehler beim Laden des Unternehmensprofils. Bitte kehren Sie zum Verzeichnis zurück.',
  'Zurück zum Verzeichnis',
  'Verwaltungsratspräsident / Chairman',
  'Seit',
  'Delegierter des Verwaltungsrats / CEO',
  'Mitglied der Geschäftsleitung / CFO',
  'Übersicht',
  'Über',
  'Unternehmensfakten',
  'Offizieller Firmenname',
  'Hauptsitz',
  'Kanton',
  'Schweiz',
  'Gründungsjahr',
  'Mitarbeiter',
  'Umsatzklasse',
  'Berichte & Medienmitteilungen',
  'Keine aktuellen Berichte für dieses Unternehmen vorhanden.',
  'Umsatzentwicklung (CHF)',
  'Entwicklung der Mitarbeiterzahlen (Headcount)',
  'Schlüsselpersonen & Management',
  'ESG Nachhaltigkeit',
  'Ähnliche Unternehmen',
  'Keine ähnlichen Einträge gefunden.',
  'Schweizer Wirtschafts-Newsletter',
  'Erhalten Sie wöchentlich verifizierte B2B-Daten und Premium-Analysen direkt in Ihr Postfach.',
  'Ihre E-Mail-Adresse',
  'Abonnieren',
  'Verified ✓',
  'Founded',
  'Employees',
  'Revenue',
  'Firmendaten',
  '📍 Standort',
  '📅 Gründung',
  '👥 Mitarbeiter',
  '🏭 Branche',
  '💰 Umsatz',
  '🌐 Sprachen',
  'DE, FR, IT, EN',
  'Structured Data ✓',
  'Website ↗',
  'LinkedIn ↗',
  'Kontakt',
  'Kontakt mit',
  'wird initiiert. Ein Verifizierungscode wurde an',
  'gesendet.',
  'VR-Mitglied Mutation eingetragen',
  'Kapitalerhöhung im Handelsregister publiziert',
  'Statutenänderung genehmigt',
  'Prokura erloschen für 2 Zeichnungsberechtigte',
  'Neue Zweigniederlassung registriert in Vevey',
  'Zweigniederlassung Mutation',
  'Eintragung eines neuen Markenpatents',
  'Statutenänderung und Sitzverlegung',
  'VR-Präsident wiedergewählt',
  "Aktienkapital neu CHF 120'000'000",
  'Veränderung der Zeichnungsberechtigung',
  'Verschmelzung mit Tochtergesellschaft genehmigt',
  'Vor 1 Min.',
  'Vor 2 Min.',
  'Vor 3 Min.',
  'Vor 5 Min.',
  'Vor 8 Min.',
  'Vor 12 Min.',
  'Vor 15 Min.',
  'Vor 18 Min.',
  'Vor 22 Min.',
  'Vor 25 Min.',
  'Vor 30 Min.',
  'Vor 35 Min.',
  'Gerade eben',
  'Zürich',
  'Bern',
  'Genf',
  'Waadt',
  'Basel-Stadt',
  'Zug',
  'St. Gallen',
  'Aargau',
  'Roche',
  'Holding AG',
  'Genentech',
  '100% (US)',
  'Chugai',
  '61.5% (JP)',
  'Diagnostics',
  '100% (CH)',
  'Foundation',
  'Grossbanken verschärfen die Richtlinien für Immobilienkredite',
  'SGS meldet Umsatzsteigerung von 4.5% im ersten Quartal',
  'Wie Fintechs den Schweizer Vermögensverwaltungsmarkt aufmischen',
  'Bedeutende Investitionen in grüne Energie im Kanton Aargau',
  'Die wichtigsten Startup-Exits der Westschweiz im Rückblick',
  '1.2k views',
  '980 views',
  '850 views',
  '760 views',
  '620 views',
  'THEMEN:',
  'Ähnliche Artikel',
  'Min',
  'Meistgelesen',
  'Erwähnte Unternehmen',
  'Wirtschafts-Briefing',
  'Werbung',
  'Spotlight-Unternehmen',
  'Sponsor-Dossier hier platzieren.',
  '(Erfordert Cookie-Zustimmung)',
  'Executive Briefing',
  'Street Briefing',
  'University Perspective',
  'Alle Beiträge',
  'Executive Briefings',
  'Street Briefings 🎤',
  'University Perspectives 🎓',
  'Keine Beiträge in dieser Kategorie vorhanden.',
  'Audio-Podcast abspielen',
  'im Gespräch mit der Redaktion',
  'Unternehmen im Fokus',
  'Mitarbeiter:',
  'Umsatzklasse:',
  'Dossier ansehen',
  'AUDIO BRIEFINGS',
  'REDENDE INHABER & EXECUTIVES',
  'Swiss Private Sector Podcasts',
  'Unternehmer-Interviews',
  'Dossiers und vertiefende Audio-Gespräche mit CEOs, Gründern und Verwaltungsräten der Schweiz.',
  'Podcast anhören',
  'Dossier lesen'
]);

// Static Translation Integration (No Google Translate API)
async function translateText(text, targetLang) {
  if (!text) return '';
  if (targetLang === 'rm') return text; 
  
  const isGermanUiKey = GERMAN_UI_KEYS.has(text);
  const sourceLang = isGermanUiKey ? 'de' : 'en';
  
  if (targetLang === sourceLang) return text;
  
  const cacheKey = `${targetLang}:${text}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }
  
  // Return the original text if no static translation is found in server/translations_cache.json
  return text; 
}


// Database schema and seeding script
export async function initializeDatabase() {
  console.log('Initializing schema and seeds...');
  
  // 1. Companies Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      logo_bg TEXT NOT NULL,
      canton TEXT NOT NULL,
      industry TEXT NOT NULL,
      size_class TEXT NOT NULL,
      description TEXT NOT NULL,
      premium INTEGER DEFAULT 0,
      verified INTEGER DEFAULT 0,
      founded INTEGER NOT NULL,
      employees INTEGER NOT NULL,
      revenue_band TEXT NOT NULL,
      website TEXT NOT NULL,
      linkedin TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      about_text TEXT NOT NULL,
      structured_data TEXT NOT NULL
    )
  `);

  // 2. News Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      category TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_avatar TEXT NOT NULL,
      date_published TEXT NOT NULL,
      read_time_mins INTEGER NOT NULL,
      content_body TEXT NOT NULL,
      pull_quote TEXT NOT NULL,
      tags TEXT NOT NULL,
      image_url TEXT DEFAULT ''
    )
  `);

  // 2b. Blogs Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS blogs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      category TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_avatar TEXT NOT NULL,
      date_published TEXT NOT NULL,
      read_time_mins INTEGER NOT NULL,
      content_body TEXT NOT NULL,
      pull_quote TEXT NOT NULL,
      tags TEXT NOT NULL,
      image_url TEXT DEFAULT ''
    )
  `);

  // 3. Ads Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS ads (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      position TEXT NOT NULL,
      company_id INTEGER,
      status TEXT NOT NULL,
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      image_url TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      geo_swiss_only INTEGER DEFAULT 1
    )
  `);

  // 4. Pages Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS pages (
      id SERIAL PRIMARY KEY,
      path TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      meta_description TEXT NOT NULL,
      blocks_layout TEXT NOT NULL,
      ads_enabled INTEGER DEFAULT 1
    )
  `);

  // 5. Translations Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS translations (
      language_code TEXT NOT NULL,
      key TEXT NOT NULL,
      translated_text TEXT NOT NULL,
      status TEXT NOT NULL,
      PRIMARY KEY (language_code, key)
    )
  `);

  // 6. Interviews Table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS interviews (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      interviewee_name TEXT NOT NULL,
      interviewee_title TEXT NOT NULL,
      interviewee_avatar TEXT NOT NULL,
      company_id INTEGER,
      company_name TEXT NOT NULL,
      date_published TEXT NOT NULL,
      read_time_mins INTEGER NOT NULL,
      audio_url TEXT,
      qa_content TEXT NOT NULL
    )
  `);

  // Alter existing tables if needed for migrations
  await dbRun(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS esg_rating INTEGER DEFAULT 0`);
  await dbRun(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS sustainability_summary TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE news ADD COLUMN IF NOT EXISTS student_author_id INTEGER`);
  await dbRun(`ALTER TABLE news ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS student_author_id INTEGER`);
  await dbRun(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Executive Briefing'`);

  // Create new tables
  await dbRun(`
    CREATE TABLE IF NOT EXISTS student_profiles (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      university TEXT NOT NULL,
      study_field TEXT NOT NULL,
      avatar TEXT NOT NULL,
      grad_year INTEGER NOT NULL,
      portfolio_url TEXT NOT NULL,
      bio TEXT NOT NULL,
      email TEXT,
      phone_number TEXT,
      birth_date TEXT,
      skills TEXT,
      experience TEXT
    )
  `);

  // Alter student_profiles table if columns do not exist
  await dbRun(`ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS email TEXT`);
  await dbRun(`ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS phone_number TEXT`);
  await dbRun(`ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS birth_date TEXT`);
  await dbRun(`ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS skills TEXT`);
  await dbRun(`ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS experience TEXT`);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      company_id INTEGER,
      company_name TEXT NOT NULL,
      location TEXT NOT NULL,
      apply_url TEXT NOT NULL,
      date_posted TEXT NOT NULL
    )
  `);

  // Create users table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL, -- 'admin', 'student', 'company'
      profile_id INTEGER
    )
  `);

  // Add SEO columns, category, and tags to all tables
  await dbRun(`ALTER TABLE news ADD COLUMN IF NOT EXISTS focus_keyword TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE news ADD COLUMN IF NOT EXISTS meta_title TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE news ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE news ADD COLUMN IF NOT EXISTS slug TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE news ADD COLUMN IF NOT EXISTS schema_markup TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE news ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '[]'`);

  await dbRun(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS focus_keyword TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS meta_title TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS slug TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS schema_markup TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '[]'`);

  await dbRun(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS focus_keyword TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS meta_title TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS slug TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS schema_markup TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '[]'`);

  await dbRun(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS focus_keyword TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS meta_title TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS slug TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS schema_markup TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE jobs ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '[]'`);

  // Add SEO columns and custom fields to blogs table
  await dbRun(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS focus_keyword TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_title TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS slug TEXT DEFAULT ''`);
  await dbRun(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS schema_markup TEXT DEFAULT ''`);


  // Seed Default Users
  try {
    const adminExists = await dbGet('SELECT id FROM users WHERE email = ?', ['admin@private.com']);
    if (!adminExists) {
      console.log('Seeding super admin user...');
      await dbRun(`INSERT INTO users (email, password_hash, role) VALUES ('admin@private.com', 'Admin2026', 'admin')`);
    }
    const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
    if (Number(userCount.count) <= 1) {
      await dbRun(`INSERT INTO users (email, password_hash, role) VALUES ('student@privatesector.ch', 'StudentPassword!', 'student')`);
      await dbRun(`INSERT INTO users (email, password_hash, role) VALUES ('company@privatesector.ch', 'CompanyPassword!', 'company')`);
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  }


  // Count checks to decide if we need to clean and seed
  const companyCount = await dbGet('SELECT COUNT(*) as count FROM companies');
  const newsCount = await dbGet('SELECT COUNT(*) as count FROM news');
  const interviewCount = await dbGet('SELECT COUNT(*) as count FROM interviews');
  const newsWithoutImages = await dbGet("SELECT COUNT(*) as count FROM news WHERE image_url = '' OR image_url IS NULL");

  const needsReset = Number(companyCount.count) < 15 || Number(newsCount.count) < 20 || Number(interviewCount.count) < 6 || Number(newsWithoutImages.count) > 0;
  if (needsReset) {
    console.log('Database schema or seed count is low. Clearing database to perform a complete re-seed...');
    
    if (usePg) {
      await dbRun('TRUNCATE TABLE companies, news, ads, pages, translations, interviews, student_profiles, jobs RESTART IDENTITY CASCADE');
    } else {
      await dbRun('DELETE FROM companies');
      await dbRun('DELETE FROM news');
      await dbRun('DELETE FROM ads');
      await dbRun('DELETE FROM pages');
      await dbRun('DELETE FROM translations');
      await dbRun('DELETE FROM interviews');
      await dbRun('DELETE FROM student_profiles');
      await dbRun('DELETE FROM jobs');
      try {
        await dbRun("DELETE FROM sqlite_sequence WHERE name IN ('companies', 'news', 'ads', 'pages', 'translations', 'interviews', 'student_profiles', 'jobs')");
      } catch (e) {
        // Ignore if sqlite_sequence table does not exist
      }
    }
    
    console.log('Seeding mock B2B data (companies and news)...');
    await seedData();
    
    console.log('Seeding student profiles and jobs...');
    await seedStudentsAndJobs();
    
    console.log('Seeding mock interviews...');
    await seedInterviews();

    console.log('Running auto-translation scanner for all database content...');
    await autoTranslateDatabaseContent();
  } else {
    console.log('Database is already fully populated with latest B2B, Careers, ESG, and podcast features.');
    console.log('Running incremental auto-translation scanner...');
    await autoTranslateDatabaseContent();
  }
}

async function seedData() {
  // Seed Companies
  const companies = [
    {
      name: 'Nestlé S.A.',
      logo_bg: '#1A365D',
      canton: 'VD',
      industry: 'Consumer Goods',
      size_class: 'Large',
      description: 'The world\'s largest food and beverage company, headquartered in Vevey.',
      premium: 1,
      verified: 1,
      founded: 1866,
      employees: 273000,
      revenue_band: 'CHF 90B+',
      website: 'https://www.nestle.com',
      linkedin: 'https://linkedin.com/company/nestle',
      contact_email: 'corporate.relations@nestle.com',
      about_text: 'Nestlé is the world\'s largest food and beverage company. We have more than 2,000 brands ranging from global icons to local favorites, and we are present in 188 countries worldwide. Guided by our values rooted in respect, we want to shape a better and healthier world.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "Nestlé S.A.",
        "url": "https://www.nestle.com",
        "logo": "https://privatesector.vitalswiss.ch/logos/nestle.png",
        "foundingDate": "1866",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Vevey",
          "addressRegion": "VD",
          "addressCountry": "CH"
        }
      })
    },
    {
      name: 'Roche Holding AG',
      logo_bg: '#0066CC',
      canton: 'BS',
      industry: 'Pharmaceuticals',
      size_class: 'Large',
      description: 'A global research-focused healthcare company that discovers and develops drugs.',
      premium: 1,
      verified: 1,
      founded: 1896,
      employees: 101000,
      revenue_band: 'CHF 50B - 90B',
      website: 'https://www.roche.com',
      linkedin: 'https://linkedin.com/company/roche',
      contact_email: 'investor.relations@roche.com',
      about_text: 'Roche is a global pioneer in pharmaceuticals and diagnostics focused on advancing science to improve people\'s lives. The combined strengths of pharmaceuticals and diagnostics under one roof have made Roche the leader in personalised healthcare.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "Roche Holding AG",
        "url": "https://www.roche.com",
        "foundingDate": "1896",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Basel",
          "addressRegion": "BS",
          "addressCountry": "CH"
        }
      })
    },
    {
      name: 'Novartis AG',
      logo_bg: '#E37222',
      canton: 'BS',
      industry: 'Pharmaceuticals',
      size_class: 'Large',
      description: 'Leading global medicines company powered by research and digital technologies.',
      premium: 0,
      verified: 1,
      founded: 1996,
      employees: 76000,
      revenue_band: 'CHF 40B - 50B',
      website: 'https://www.novartis.com',
      linkedin: 'https://linkedin.com/company/novartis',
      contact_email: 'media.relations@novartis.com',
      about_text: 'Novartis is an innovative medicines company. Everyday, we work to reimagine medicine to improve and extend people\'s lives so that individuals, society and healthcare systems can address the world\'s most challenging disease burdens.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "Novartis AG",
        "url": "https://www.novartis.com",
        "foundingDate": "1996",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Basel",
          "addressRegion": "BS",
          "addressCountry": "CH"
        }
      })
    },
    {
      name: 'UBS Group AG',
      logo_bg: '#000000',
      canton: 'ZH',
      industry: 'Financial Services',
      size_class: 'Large',
      description: 'Switzerland\'s largest financial institution and prominent global wealth manager.',
      premium: 1,
      verified: 1,
      founded: 1862,
      employees: 115000,
      revenue_band: 'CHF 30B - 40B',
      website: 'https://www.ubs.com',
      linkedin: 'https://linkedin.com/company/ubs',
      contact_email: 'corporate.communications@ubs.com',
      about_text: 'UBS is a leading global wealth manager, providing financial advice and solutions to private, institutional and corporate clients worldwide, as well as private clients in Switzerland.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "UBS Group AG",
        "url": "https://www.ubs.com",
        "foundingDate": "1862",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Zurich",
          "addressRegion": "ZH",
          "addressCountry": "CH"
        }
      })
    },
    {
      name: 'Rolex SA',
      logo_bg: '#114D30',
      canton: 'GE',
      industry: 'Luxury Goods',
      size_class: 'Large',
      description: 'Luxury watch manufacturer famous for its premium oyster chronometers.',
      premium: 1,
      verified: 1,
      founded: 1905,
      employees: 14000,
      revenue_band: 'CHF 10B - 15B',
      website: 'https://www.rolex.com',
      linkedin: 'https://linkedin.com/company/rolex',
      contact_email: 'press@rolex.com',
      about_text: 'Rolex is an integrated and independent Swiss watch manufacture. Headquartered in Geneva, the brand is recognized the world over for its expertise and the quality of its products – symbols of excellence, elegance and prestige.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "Rolex SA",
        "url": "https://www.rolex.com",
        "foundingDate": "1905",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Geneva",
          "addressRegion": "GE",
          "addressCountry": "CH"
        }
      })
    },
    {
      name: 'Swisscom AG',
      logo_bg: '#002B49',
      canton: 'BE',
      industry: 'Telecommunications',
      size_class: 'Large',
      description: 'Major telecommunications provider in Switzerland offering internet, TV, and IT services.',
      premium: 0,
      verified: 1,
      founded: 1998,
      employees: 19000,
      revenue_band: 'CHF 10B - 15B',
      website: 'https://www.swisscom.ch',
      linkedin: 'https://linkedin.com/company/swisscom',
      contact_email: 'media@swisscom.com',
      about_text: 'Swisscom is Switzerland\'s leading telecoms company and one of its leading IT companies. Swisscom is structured as a joint-stock company under public law with the Swiss Confederation holding a majority stake.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "Swisscom AG",
        "url": "https://www.swisscom.ch",
        "foundingDate": "1998",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bern",
          "addressRegion": "BE",
          "addressCountry": "CH"
        }
      })
    },
    {
      name: 'Logitech International S.A.',
      logo_bg: '#000000',
      canton: 'VD',
      industry: 'Technology',
      size_class: 'Medium',
      description: 'Multi-brand company designing products that bring people together through music, gaming, and video.',
      premium: 0,
      verified: 1,
      founded: 1981,
      employees: 7300,
      revenue_band: 'CHF 4B - 5B',
      website: 'https://www.logitech.com',
      linkedin: 'https://linkedin.com/company/logitech',
      contact_email: 'ir@logitech.com',
      about_text: 'Logitech starts as a Swiss provider of computer peripherals and now specializes in designing products that have an everyday place in people\'s lives, bringing experiences they care about to the digital space.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "Logitech International S.A.",
        "url": "https://www.logitech.com",
        "foundingDate": "1981",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Lausanne",
          "addressRegion": "VD",
          "addressCountry": "CH"
        }
      })
    },
    {
      name: 'Richemont',
      logo_bg: '#0F2C59',
      canton: 'GE',
      industry: 'Luxury Goods',
      size_class: 'Large',
      description: 'One of the world\'s leading luxury goods groups, encompassing Cartier and IWC.',
      premium: 1,
      verified: 1,
      founded: 1988,
      employees: 37000,
      revenue_band: 'CHF 20B - 30B',
      website: 'https://www.richemont.com',
      linkedin: 'https://linkedin.com/company/richemont',
      contact_email: 'investor.relations@richemont.com',
      about_text: 'Richemont owns a portfolio of leading international Maisons, recognized for their distinctive heritage and craftsmanship in luxury jewelry, watchmaking, and accessories.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "Richemont",
        "url": "https://www.richemont.com",
        "foundingDate": "1988",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Geneva",
          "addressRegion": "GE",
          "addressCountry": "CH"
        }
      })
    },
    {
      name: 'Stadler Rail AG',
      logo_bg: '#D10A10',
      canton: 'TG',
      industry: 'Manufacturing',
      size_class: 'Medium',
      description: 'Swiss manufacturer of railway locomotives and passenger rolling stock.',
      premium: 0,
      verified: 0,
      founded: 1942,
      employees: 13500,
      revenue_band: 'CHF 3B - 4B',
      website: 'https://www.stadlerrail.com',
      linkedin: 'https://linkedin.com/company/stadler-rail',
      contact_email: 'stadler.rail@stadlerrail.com',
      about_text: 'Stadler has been building trains for over 80 years. Headquartered in Bussnang, Switzerland, Stadler provides comprehensive solutions in rail vehicle construction and services.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "Stadler Rail AG",
        "url": "https://www.stadlerrail.com",
        "foundingDate": "1942",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bussnang",
          "addressRegion": "TG",
          "addressCountry": "CH"
        }
      })
    },
    {
      name: 'Bühler Group',
      logo_bg: '#009FDF',
      canton: 'SG',
      industry: 'Manufacturing',
      size_class: 'Medium',
      description: 'Global technology partner for the food, feed, and advanced materials industries.',
      premium: 0,
      verified: 1,
      founded: 1860,
      employees: 12500,
      revenue_band: 'CHF 2B - 3B',
      website: 'https://www.buhlergroup.com',
      linkedin: 'https://linkedin.com/company/buhler-group',
      contact_email: 'media@buhlergroup.com',
      about_text: 'Every day, billions of people come into contact with Bühler technologies to cover their basic needs for food and mobility. Bühler plays a key role in processing grains, cocoa, and advanced materials.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "Bühler Group",
        "url": "https://www.buhlergroup.com",
        "foundingDate": "1860",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Uzwil",
          "addressRegion": "SG",
          "addressCountry": "CH"
        }
      })
    },
    {
      name: 'Barry Callebaut AG',
      logo_bg: '#3B2F2F',
      canton: 'ZH',
      industry: 'Consumer Goods',
      size_class: 'Medium',
      description: 'The world\'s leading manufacturer of high-quality chocolate and cocoa products.',
      premium: 0,
      verified: 1,
      founded: 1996,
      employees: 13000,
      revenue_band: 'CHF 7B - 8B',
      website: 'https://www.barry-callebaut.com',
      linkedin: 'https://linkedin.com/company/barry-callebaut',
      contact_email: 'media_relations@barry-callebaut.com',
      about_text: 'Headquartered in Zurich, Barry Callebaut is the world\'s leading manufacturer of high-quality chocolate and cocoa products, sourcing from cocoa bean to gourmet chocolates.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "Barry Callebaut AG",
        "url": "https://www.barry-callebaut.com",
        "foundingDate": "1996",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Zurich",
          "addressRegion": "ZH",
          "addressCountry": "CH"
        }
      })
    },
    {
      name: 'Swiss Re AG',
      logo_bg: '#1A4D6C',
      canton: 'ZH',
      industry: 'Financial Services',
      size_class: 'Large',
      description: 'A leading wholesale provider of reinsurance, insurance and insurance-based risk transfer.',
      premium: 1,
      verified: 1,
      founded: 1863,
      employees: 14000,
      revenue_band: 'CHF 40B - 50B',
      website: 'https://www.swissre.com',
      linkedin: 'https://linkedin.com/company/swiss-re',
      contact_email: 'investor_relations@swissre.com',
      about_text: 'Swiss Re is one of the world\'s leading providers of reinsurance and insurance. We work to make the world more resilient, helping clients manage complex risks in property, casualty, and health sectors.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "Swiss Re AG",
        "url": "https://www.swissre.com",
        "foundingDate": "1863",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Zurich",
          "addressRegion": "ZH",
          "addressCountry": "CH"
        }
      })
    },
    {
      name: 'Glencore PLC',
      logo_bg: '#002E5D',
      canton: 'ZG',
      industry: 'Commodities',
      size_class: 'Large',
      description: 'One of the world\'s largest globally diversified natural resource companies.',
      premium: 0,
      verified: 1,
      founded: 1974,
      employees: 140000,
      revenue_band: 'CHF 200B+',
      website: 'https://www.glencore.com',
      linkedin: 'https://linkedin.com/company/glencore',
      contact_email: 'info@glencore.com',
      about_text: 'Glencore is a leading commodity trading and mining company. We produce and market over 60 commodities, operating in over 35 countries with a global network of operations.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "Glencore PLC",
        "url": "https://www.glencore.com",
        "foundingDate": "1974",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Baar",
          "addressRegion": "ZG",
          "addressCountry": "CH"
        }
      })
    },
    {
      name: 'Lonza Group AG',
      logo_bg: '#004F9F',
      canton: 'VS',
      industry: 'Pharmaceuticals',
      size_class: 'Large',
      description: 'A global partner to the pharmaceutical, biotech and nutrition markets.',
      premium: 0,
      verified: 0,
      founded: 1897,
      employees: 17500,
      revenue_band: 'CHF 6B - 7B',
      website: 'https://www.lonza.com',
      linkedin: 'https://linkedin.com/company/lonza',
      contact_email: 'media@lonza.com',
      about_text: 'Lonza is a leading global manufacturing partner to the pharmaceutical and biotech industries. Our custom development and manufacturing capabilities enable clients to bring treatments to patients.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "Lonza Group AG",
        "url": "https://www.lonza.com",
        "foundingDate": "1897",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Basel",
          "addressRegion": "BS",
          "addressCountry": "CH"
        }
      })
    },
    {
      name: 'DKSH Holding AG',
      logo_bg: '#D21F1F',
      canton: 'ZH',
      industry: 'Consumer Goods',
      size_class: 'Medium',
      description: 'The leading Market Expansion Services provider with a focus on Asia.',
      premium: 0,
      verified: 1,
      founded: 1865,
      employees: 33000,
      revenue_band: 'CHF 10B - 15B',
      website: 'https://www.dksh.com',
      linkedin: 'https://linkedin.com/company/dksh',
      contact_email: 'branding@dksh.com',
      about_text: 'DKSH is a leading B2B service group assisting companies to grow in new or existing markets, primarily across Asia Pacific.',
      structured_data: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Corporation",
        "name": "DKSH Holding AG",
        "url": "https://www.dksh.com",
        "foundingDate": "1865",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Zurich",
          "addressRegion": "ZH",
          "addressCountry": "CH"
        }
      })
    }
  ];

  for (const comp of companies) {
    await dbRun(`
      INSERT INTO companies (
        name, logo_bg, canton, industry, size_class, description, premium, verified,
        founded, employees, revenue_band, website, linkedin, contact_email, about_text, structured_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      comp.name, comp.logo_bg, comp.canton, comp.industry, comp.size_class, comp.description,
      comp.premium, comp.verified, comp.founded, comp.employees, comp.revenue_band,
      comp.website, comp.linkedin, comp.contact_email, comp.about_text, comp.structured_data
    ]);
  }

  // Seed News Articles
  const articles = [
    // 1. Luxury Goods
    {
      title: 'Swiss Watch Exports Surge by 8.6% Driven by Premium Asia Demands',
      subtitle: 'Luxury manufactures like Rolex and Richemont see record order books despite macroeconomic cooling.',
      category: 'Luxury Goods',
      author_name: 'Geneva Editorial Board',
      author_avatar: 'https://i.pravatar.cc/100?img=1',
      date_published: '2026-06-01',
      read_time_mins: 5,
      content_body: `The Federation of the Swiss Watch Industry reported a major jump in exports. Total export value reached historic highs, proving that the luxury segment remains largely immune to global financial volatility. High-net-worth buyers in Tokyo, Shanghai, and Singapore continue to view Swiss chronometers as key asset classes.

"The demand for luxury mechanical watchcraft is growing exponentially," says Jean-Pierre Blanc, luxury sector analyst in Zurich. "Consumers are willing to wait years for signature models, keeping order backlogs at record durations."

The demand has forced manufacturers like Rolex to expand their domestic production capacities. However, watchmakers caution that securing raw gold and high-grade diamonds faces logistical blockades under newer regulatory compliance frameworks. The supply bottlenecks might limit overall output for the upcoming fiscal quarters.`,
      pull_quote: 'Mechanical excellence has transitioned from a utility to a resilient wealth repository.',
      tags: JSON.stringify(['Rolex', 'Richemont', 'Exports', 'Luxury'])
    },
    {
      title: 'Richemont Posts Strong Jewelry Sales Amid Soft Watch Demand',
      subtitle: 'Cartier and Van Cleef & Arpels drive group revenues upward while watch divisions experience consolidation.',
      category: 'Luxury Goods',
      author_name: 'Helene Duport',
      author_avatar: 'https://i.pravatar.cc/100?img=2',
      date_published: '2026-05-29',
      read_time_mins: 6,
      content_body: `Richemont reported robust sales performance for its jewelry Maisons, balancing out a minor contraction in its specialist watchmakers. The Geneva-based luxury conglomerate saw strong performance in both retail and online channels, highlighting the enduring value of high jewelry.

Cartier and Van Cleef & Arpels continue to attract long-term collectors, particularly in the Middle East and the Americas. The group\'s operating margin remained resilient, though executives warn of rising labor costs for skilled artisans in the Jura region.`,
      pull_quote: 'Jewelry continues to act as the primary engine of long-term luxury growth.',
      tags: JSON.stringify(['Richemont', 'Cartier', 'Jewelry', 'Luxury'])
    },
    {
      title: 'Audemars Piguet Expands Heritage Museum in Le Brassus',
      subtitle: 'The brand invests in local cultural infrastructure to celebrate the history of complex Swiss watch complications.',
      category: 'Luxury Goods',
      author_name: 'Marc Vandeveld',
      author_avatar: 'https://i.pravatar.cc/100?img=3',
      date_published: '2026-05-12',
      read_time_mins: 4,
      content_body: `Audemars Piguet has officially inaugurated a new extension to its architectural museum in the Vallée de Joux. The pavilion showcases over 300 historical timepieces, highlighting the evolution of watch complications from the 18th century to modern day.

The expansion is part of a broader initiative by luxury brands to establish deeper roots in local heritage, driving tourism and preserving classical Swiss watchmaking disciplines.`,
      pull_quote: 'Our history is not a static display; it is the blueprint for our future designs.',
      tags: JSON.stringify(['Audemars Piguet', 'Le Brassus', 'Museum', 'Watchmaking'])
    },

    // 2. Pharmaceuticals
    {
      title: 'Pharmaceutical Giants Invest CHF 1.2B in Basel Biotech Incubators',
      subtitle: 'Roche and Novartis back custom therapies research as Swiss R&D pipelines seek innovative biological platforms.',
      category: 'Pharmaceuticals',
      author_name: 'Clara Kaufmann',
      author_avatar: 'https://i.pravatar.cc/100?img=5',
      date_published: '2026-05-24',
      read_time_mins: 7,
      content_body: `Basel\'s biotechnology hub is receiving a major capital infusion. A joint initiative supported by pharmaceutical leaders Roche and Novartis aims to construct state-of-the-art laboratory spaces. These spaces will nurture early-stage research into messenger RNA (mRNA) and personalized molecular treatments.

Switzerland\'s corporate tax reforms and research subsidies have played a vital role in keeping Basel competitive against hubs in Boston and San Francisco. Local authorities have fast-tracked site clearances, hoping to create over 2,000 highly skilled scientific positions over the next decade.

"Maintaining absolute R&D quality is paramount," commented Clara Kaufmann, Lead Healthcare Correspondent. "By financing local university spin-offs, pharma companies secure direct access to experimental methodologies before they enter competitive bidding wars."`,
      pull_quote: 'Basel remains the global heart of chemical and molecular discovery.',
      tags: JSON.stringify(['Roche', 'Novartis', 'Biotech', 'Basel'])
    },
    {
      title: 'Novartis Focuses on Pure-Play Medicines Strategy Post-SpinOff',
      subtitle: 'CEO Vas Narasimhan outlines core therapeutic areas as Sandoz separation completes successfully.',
      category: 'Pharmaceuticals',
      author_name: 'Adrian Keller',
      author_avatar: 'https://i.pravatar.cc/100?img=6',
      date_published: '2026-05-20',
      read_time_mins: 6,
      content_body: `Novartis has successfully completed its separation from Sandoz, its generics division. The company will now focus entirely on innovative medicines, targeting four key therapeutic areas: cardiovascular, immunology, neuroscience, and oncology.

The restructuring is designed to improve profit margins and accelerate the development of high-value biologics, leveraging Novartis\'s advanced chemistry hubs in Basel and East Hanover.`,
      pull_quote: 'Our goal is to build the leading pure-play innovative medicines company in the world.',
      tags: JSON.stringify(['Novartis', 'Sandoz', 'Pharma', 'Strategy'])
    },
    {
      title: 'Lonza Expands Biologics Manufacturing Capacity in Visp',
      subtitle: 'The contract manufacturer builds out new mammalian cell culture lines to meet rising global drug production needs.',
      category: 'Pharmaceuticals',
      author_name: 'Sarah Brunner',
      author_avatar: 'https://i.pravatar.cc/100?img=7',
      date_published: '2026-05-08',
      read_time_mins: 5,
      content_body: `Lonza Group has announced a major expansion of its bio-manufacturing facility in Visp, Canton Valais. The investment adds multiple new bioreactor lines, allowing the company to manufacture complex monoclonal antibodies for major global pharmaceutical clients.

The expansion solidifies Switzerland\'s role as a key manufacturing node for global biologics supply chains, supported by highly trained local engineering staff.`,
      pull_quote: 'Scaling up biotechnology is an engineering challenge that Swiss expertise is uniquely suited for.',
      tags: JSON.stringify(['Lonza', 'Visp', 'Biologics', 'Manufacturing'])
    },

    // 3. Financial Services
    {
      title: 'Swiss Banking Sector Accelerates Digital Asset Integration',
      subtitle: 'FINMA issues guidelines for institutional custody of tokenized equities, prompting major banks to launch trading desks.',
      category: 'Financial Services',
      author_name: 'Dr. Beat Hintermann',
      author_avatar: 'https://i.pravatar.cc/100?img=8',
      date_published: '2026-05-18',
      read_time_mins: 6,
      content_body: `Switzerland\'s financial watchdog, FINMA, has published comprehensive rules regarding the holding of tokenized securities. The clarifications eliminate long-standing ambiguities, prompting banks in Zurich and Geneva to integrate distributed ledger technology directly into their prime brokerage suites.

UBS has already confirmed the launch of a pilot program targeting tokenized corporate bonds. Analysts suggest that blockchain-mediated settlements could reduce back-office costs by up to 35% while enabling real-time international capital clearances.

"Regulatory clarity is our absolute competitive edge," says Hintermann. "While other jurisdictions seek to restrict digital tokenization, the Swiss framework offers clear guidance that preserves security while promoting technical integration."`,
      pull_quote: 'Compliance is not an obstacle to innovation; it is its foundation.',
      tags: JSON.stringify(['UBS', 'FINMA', 'Digital Assets', 'Banking'])
    },
    {
      title: 'UBS Completes Integration Phase of Credit Suisse Retail Operations',
      subtitle: 'The banking giant migrates millions of client accounts under unified Swiss retail banner.',
      category: 'Financial Services',
      author_name: 'Beat Hintermann',
      author_avatar: 'https://i.pravatar.cc/100?img=8',
      date_published: '2026-05-27',
      read_time_mins: 8,
      content_body: `UBS has successfully completed the migration of Credit Suisse\'s domestic retail and corporate clients to the UBS platform. The consolidation marks a historic step in the merger of Switzerland\'s two largest financial entities.

While the integration has resulted in administrative cost savings, UBS executives emphasized that branch counts will remain stable in key cantons to preserve regional B2B service availability.`,
      pull_quote: 'A single strong bank is vital for supporting Switzerland\'s export-driven B2B economy.',
      tags: JSON.stringify(['UBS', 'Credit Suisse', 'Banking', 'Merger'])
    },
    {
      title: 'Swiss Re Forecasts Increased Natural Catastrophe Premiums for 2027',
      subtitle: 'Climate volatility and property valuation updates drive global reinsurance pricing models higher.',
      category: 'Financial Services',
      author_name: 'Christina Meier',
      author_avatar: 'https://i.pravatar.cc/100?img=9',
      date_published: '2026-05-14',
      read_time_mins: 7,
      content_body: `Swiss Re\'s latest economic report warns of rising reinsurance premiums. The group expects property catastrophe rates to adjust upward to offset the increasing frequency of severe weather events worldwide.

The Zurich-based reinsurer is deploying advanced AI models to simulate micro-climatic damage risks, allowing for more precise actuarial pricing.`,
      pull_quote: 'Risk models must evolve to reflect the reality of systemic weather volatility.',
      tags: JSON.stringify(['Swiss Re', 'Reinsurance', 'Climate', 'Risk'])
    },

    // 4. Consumer Goods
    {
      title: 'Nestlé Expands Plant-Based Production in Konolfingen',
      subtitle: 'A CHF 120M investment builds out state-of-the-art alternative protein research and processing lines.',
      category: 'Consumer Goods',
      author_name: 'Sophie Grandjean',
      author_avatar: 'https://i.pravatar.cc/100?img=11',
      date_published: '2026-05-31',
      read_time_mins: 5,
      content_body: `Nestlé has officially opened its new plant-based beverage expansion in Konolfingen, Canton Bern. The facility is equipped with state-of-the-art extrusion technologies, enabling the processing of high-grade dairy alternatives.

The investment aims to address the growing European demand for lactose-free and plant-based protein alternatives, utilizing local Swiss oats and peas.`,
      pull_quote: 'Pioneering nutrition is about adapting our agricultural supply to ecological reality.',
      tags: JSON.stringify(['Nestle', 'Konolfingen', 'Plant-Based', 'Food'])
    },
    {
      title: 'Swiss Chocolate Manufacturers Face Record Cocoa Cost Pressures',
      subtitle: 'Barry Callebaut and local brands navigate supply shortfalls from West African plantations.',
      category: 'Consumer Goods',
      author_name: 'Daniel Schmid',
      author_avatar: 'https://i.pravatar.cc/100?img=12',
      date_published: '2026-05-25',
      read_time_mins: 6,
      content_body: `Unfavorable weather in Ghana and Côte d\'Ivoire has sent global cocoa prices to historic highs. Barry Callebaut has adjusted its sourcing strategies, increasing investments in sustainable farming and regenerative agriculture.

The company aims to stabilize supplies by building direct partnerships with cooperatives, bypassing traditional merchant middlemen.`,
      pull_quote: 'Chocolate manufacturing is facing its biggest raw material challenge in a generation.',
      tags: JSON.stringify(['Barry Callebaut', 'Cocoa', 'Supply Chain', 'Agriculture'])
    },
    {
      title: 'DKSH Reports Solid Growth in Asia-Pacific Consumer Sector',
      subtitle: 'The Zurich-based market expansion specialist gains market share in Southeast Asian retail networks.',
      category: 'Consumer Goods',
      author_name: 'Thomas Meier',
      author_avatar: 'https://i.pravatar.cc/100?img=13',
      date_published: '2026-05-05',
      read_time_mins: 5,
      content_body: `DKSH reported strong financial performance in its consumer goods division. The group leveraged its extensive distribution networks in Thailand, Vietnam, and Malaysia to expand international brands.

The focus on digital supply chains and automated warehousing has helped the firm maintain margins despite rising regional inflation.`,
      pull_quote: 'Asia-Pacific remains the most dynamic growth region for premium consumer goods.',
      tags: JSON.stringify(['DKSH', 'Distribution', 'Asia', 'Consumer'])
    },

    // 5. Telecommunications
    {
      title: 'Swisscom Rolls Out 5G Standalone Network Across Switzerland',
      subtitle: 'The telco launches pure-5G infrastructure, offering ultra-low latency and network slicing for enterprise clients.',
      category: 'Telecommunications',
      author_name: 'Hans-Rudolf Lutz',
      author_avatar: 'https://i.pravatar.cc/100?img=15',
      date_published: '2026-05-22',
      read_time_mins: 5,
      content_body: `Swisscom has successfully deployed its standalone 5G network core. Unlike previous iterations that relied on 4G infrastructure, the new standalone core enables true network slicing, giving enterprises dedicated bandwidth lanes.

Industries such as precision logistics and emergency services will benefit from millisecond latencies, boosting Swiss competitive edge in digital operations.`,
      pull_quote: 'Standalone 5G is the backbone of the next industrial revolution in Switzerland.',
      tags: JSON.stringify(['Swisscom', '5G', 'Telecom', 'Infrastructure'])
    },
    {
      title: 'Telecom Security: Swiss Operators Align on Quantum Cryptography',
      subtitle: 'Swisscom and Sunrise conduct pilot testing of Quantum Key Distribution to secure critical banking backbones.',
      category: 'Telecommunications',
      author_name: 'Erich Steiner',
      author_avatar: 'https://i.pravatar.cc/100?img=16',
      date_published: '2026-05-15',
      read_time_mins: 7,
      content_body: `Swiss telecom companies are collaborating to test Quantum Key Distribution (QKD) systems. The pilot project aims to establish secure fiber lines linking major financial data hubs in Zurich and Geneva.

The technology uses quantum mechanics to detect interception attempts, making banking data transfers immune to future decryption technologies.`,
      pull_quote: 'Data security in the future requires anticipating quantum threat vectors today.',
      tags: JSON.stringify(['Swisscom', 'Quantum', 'Security', 'Banking'])
    },
    {
      title: 'Sunrise and Swisscom Battle for Business IT Cloud Contracts',
      subtitle: 'Major Swiss enterprises migrate workloads to local data centers, sparking competitive bidding for hybrid cloud infrastructure.',
      category: 'Telecommunications',
      author_name: 'Lukas Fischer',
      author_avatar: 'https://i.pravatar.cc/100?img=17',
      date_published: '2026-05-02',
      read_time_mins: 6,
      content_body: `The competition for corporate IT contracts is intensifying. Local regulations regarding data residency have forced multinational firms in Switzerland to store their core database workloads within Swiss territory.

Both Swisscom and Sunrise are expanding their local hyper-scale facilities, offering customized hybrid clouds that guarantee Swiss jurisdictional protection.`,
      pull_quote: 'Swiss data residency is no longer just a luxury; it is a regulatory mandate.',
      tags: JSON.stringify(['Sunrise', 'Swisscom', 'Cloud', 'Data Residency'])
    },

    // 6. Technology
    {
      title: 'Logitech Unveils Next-Gen AI-Integrated Ergonomic Workstations',
      subtitle: 'The Lausanne-based company launches intelligent peripheral line with integrated voice assistant interfaces.',
      category: 'Technology',
      author_name: 'Jan de Wit',
      author_avatar: 'https://i.pravatar.cc/100?img=19',
      date_published: '2026-05-28',
      read_time_mins: 5,
      content_body: `Logitech has introduced a new suite of ergonomic input devices that feature dedicated AI processing chips. The mice and keyboards include configurable hotkeys that launch local AI assistant models, optimizing workflows.

The engineering team in Lausanne focused on reducing power consumption while maintaining wireless latency below 1 millisecond.`,
      pull_quote: 'Human-machine interfaces are transitioning from input channels to active partners.',
      tags: JSON.stringify(['Logitech', 'AI', 'Hardware', 'Lausanne'])
    },
    {
      title: 'Swiss Software Sector Records 12% Revenue Boost in Enterprise SaaS',
      subtitle: 'Zurich tech ecosystem benefits from increased B2B demand for localized security and compliance software.',
      category: 'Technology',
      author_name: 'Martin Wenger',
      author_avatar: 'https://i.pravatar.cc/100?img=20',
      date_published: '2026-05-19',
      read_time_mins: 4,
      content_body: `Switzerland\'s software-as-a-service sector continues to grow. High local compliance standards have created a niche for Swiss-made software, protecting sensitive customer files from foreign surveillance frameworks.

Investment capital for Swiss B2B tech firms reached new highs, with significant funding flowing from local institutional pension funds.`,
      pull_quote: 'Trust is our primary technical commodity; Swiss software represents security.',
      tags: JSON.stringify(['Software', 'SaaS', 'Zurich', 'Sovereignty'])
    },
    {
      title: 'Sensirion Invests in Micro-Sensor Production Facilities in Stäfa',
      subtitle: 'The sensor manufacturer expands cleanroom capacities to meet automotive and environmental measurement needs.',
      category: 'Technology',
      author_name: 'Ursula Keller',
      author_avatar: 'https://i.pravatar.cc/100?img=21',
      date_published: '2026-05-09',
      read_time_mins: 6,
      content_body: `Sensirion has announced an expansion of its production infrastructure in Stäfa, Canton Zurich. The company will install automated cleanrooms to manufacture high-precision gas and humidity sensors.

The growth is driven by the expansion of the EV sector, which requires specialized sensors for battery thermal management.`,
      pull_quote: 'Precision measurements are essential for building efficient green mobility solutions.',
      tags: JSON.stringify(['Sensirion', 'Sensors', 'Stäfa', 'Cleanrooms'])
    },

    // 7. Manufacturing
    {
      title: 'Stadler Rail Secures Major CHF 1.8B Order for Italian Regional Trains',
      subtitle: 'The Bussnang manufacturer will deliver hydrogen-powered and electric multiple-unit trains to Trenitalia.',
      category: 'Manufacturing',
      author_name: 'Peter Spuhler',
      author_avatar: 'https://i.pravatar.cc/100?img=23',
      date_published: '2026-05-30',
      read_time_mins: 6,
      content_body: `Stadler Rail has signed a contract with Italy\'s national rail operator to deliver 90 regional passenger trains. The order includes a mix of battery-electric and hydrogen-powered models, highlighting Stadler\'s leadership in alternative propulsion.

The trains will be manufactured at Stadler\'s Swiss facilities, securing jobs and driving local industrial export volumes.`,
      pull_quote: 'Rail transportation must lead the transition to zero-emission logistics.',
      tags: JSON.stringify(['Stadler Rail', 'Trains', 'Hydrogen', 'Italy'])
    },
    {
      title: 'Bühler Group Pioneers Carbon-Neutral Grain Processing Plants',
      subtitle: 'The Uzwil company launches industrial grain mills powered by local agricultural biomass.',
      category: 'Manufacturing',
      author_name: 'Stefan Scheiber',
      author_avatar: 'https://i.pravatar.cc/100?img=24',
      date_published: '2026-05-23',
      read_time_mins: 5,
      content_body: `Bühler has introduced a new line of grain processing plants that utilize by-product hulls to generate energy. The systems allow food manufacturers to reduce their reliance on natural gas.

The technology is being deployed in European mills, helping food companies meet strict Scope 1 emission targets.`,
      pull_quote: 'Industrial food systems must close their energy loops to achieve sustainability.',
      tags: JSON.stringify(['Bühler Group', 'Grain', 'Biomass', 'Sustainability'])
    },
    {
      title: 'ABB Invests in Robotics and Automation Hub in Baden',
      subtitle: 'The engineering firm builds a research center focused on collaborative robots for electronics manufacturing.',
      category: 'Manufacturing',
      author_name: 'Christina Wyss',
      author_avatar: 'https://i.pravatar.cc/100?img=25',
      date_published: '2026-05-11',
      read_time_mins: 6,
      content_body: `ABB is constructing a new research facility in Baden, Canton Aargau, dedicated to collaborative robots (cobots). The center will focus on developing AI-guided armatures that can assist human operators.

The investment supports Switzerland\'s industrial base, helping local factories automate assembly processes to counter rising labor costs.`,
      pull_quote: 'Automation is not about replacing workers; it is about amplifying their capability.',
      tags: JSON.stringify(['ABB', 'Robotics', 'Baden', 'Automation'])
    },

    // 8. Commodities
    {
      title: 'Glencore Directs Capital to Copper Operations Supporting EV Transition',
      subtitle: 'The Baar-based natural resource company expands copper mining in Peru and Africa to meet global electrification demand.',
      category: 'Commodities',
      author_name: 'Gary Nagle',
      author_avatar: 'https://i.pravatar.cc/100?img=27',
      date_published: '2026-05-26',
      read_time_mins: 7,
      content_body: `Glencore has adjusted its capital expenditure plans, prioritizing copper mining operations. Copper is a critical component for EV motors and renewable energy grids, with global demand projected to double by 2035.

The commodity trading giant is restructuring its mining portfolio, committing to responsible extraction practices and carbon-reduction targets.`,
      pull_quote: 'Electrification requires copper; our job is to supply it responsibly.',
      tags: JSON.stringify(['Glencore', 'Copper', 'EVs', 'Mining'])
    },
    {
      title: 'Swiss Commodity Traders Enhance ESG Transparency Protocols',
      subtitle: 'Geneva and Zug associations adopt unified ESG reporting metrics to address regulatory oversight.',
      category: 'Commodities',
      author_name: 'Jean-Francois Legrand',
      author_avatar: 'https://i.pravatar.cc/100?img=28',
      date_published: '2026-05-16',
      read_time_mins: 6,
      content_body: `The Swiss Commodity Merchants Association has published new guidelines for environmental and social reporting. The metrics require traders to disclose the carbon footprint of their shipping fleets and supply chains.

The self-regulatory initiative is designed to align the sector with newer federal disclosure requirements on non-financial reporting.`,
      pull_quote: 'Transparency is essential for maintaining trust in global trade channels.',
      tags: JSON.stringify(['Commodities', 'ESG', 'Compliance', 'Trading'])
    },
    {
      title: 'Trafigura Navigates Supply Chain Shifts in Hydrogen Infrastructure',
      subtitle: 'The commodity firm invests in European green hydrogen ports, preparing for clean fuel distribution networks.',
      category: 'Commodities',
      author_name: 'Luc de Temmerman',
      author_avatar: 'https://i.pravatar.cc/100?img=29',
      date_published: '2026-05-04',
      read_time_mins: 5,
      content_body: `Trafigura has committed capital to a joint venture developing green hydrogen import terminals in Northern Europe. The terminals will receive liquid hydrogen from solar-rich regions for industrial use.

The investment represents a strategic diversification for the trading firm as global industries transition away from fossil fuels.`,
      pull_quote: 'Hydrogen will play a critical role in decarbonizing heavy transport and manufacturing.',
      tags: JSON.stringify(['Trafigura', 'Hydrogen', 'Logistics', 'Clean Energy'])
    }
  ];

  const categoryImages = {
    'Luxury Goods': 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=600',
    'Pharmaceuticals': 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600',
    'Financial Services': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600',
    'Consumer Goods': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600',
    'Telecommunications': 'https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&q=80&w=600',
    'Technology': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600',
    'Manufacturing': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600',
    'Commodities': 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&q=80&w=600'
  };
  const defaultImage = 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&q=80&w=600';

  for (const art of articles) {
    const imgUrl = art.image_url || categoryImages[art.category] || defaultImage;
    await dbRun(`
      INSERT INTO news (
        title, subtitle, category, author_name, author_avatar, date_published, read_time_mins, content_body, pull_quote, tags, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      art.title, art.subtitle, art.category, art.author_name, art.author_avatar, art.date_published,
      art.read_time_mins, art.content_body, art.pull_quote, art.tags, imgUrl
    ]);
  }

  // Seed Blogs
  const blogPosts = [
    {
      title: 'How to Navigate the Swiss B2B Compliance Landscape',
      subtitle: 'A practical guide for new enterprises entering the Swiss market and handling FINMA regulations.',
      category: 'Guides',
      author_name: 'Faisal Rafique',
      author_avatar: 'https://i.pravatar.cc/100?img=11',
      date_published: '2026-05-20',
      read_time_mins: 6,
      content_body: `When entering the Swiss B2B market, companies must quickly adapt to a highly regulated yet extremely rewarding environment. In this post, we cover the top three strategies for compliance and why you need to integrate them early into your business processes.

First, understanding the local canton laws is vital. Each canton may have specific regulations regarding corporate tax, hiring, and environmental compliance.
Second, if you're in tech or finance, FINMA compliance is non-negotiable. Building your cloud infrastructure with these guidelines in mind saves millions in potential rework.
Lastly, maintaining a verified Zefix profile gives you the trust necessary to close enterprise deals.`,
      pull_quote: 'Compliance is not just a legal requirement; it is a competitive advantage in Switzerland.',
      tags: JSON.stringify(['Compliance', 'FINMA', 'B2B Strategy']),
      image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'The Rise of Green Tech Startups in Zurich',
      subtitle: 'Why Zurich is quickly becoming the European hub for sustainable technology and green investments.',
      category: 'Market Trends',
      author_name: 'Sophia Müller',
      author_avatar: 'https://i.pravatar.cc/100?img=5',
      date_published: '2026-05-18',
      read_time_mins: 4,
      content_body: `Over the past three years, Zurich has seen a 40% increase in the number of registered green tech startups. This boom is fueled by a combination of government grants, strong academic institutions like ETH Zurich, and a culture that values sustainability.

Investors from across Europe are now looking at Zurich as the primary hub for early-stage investments in climate tech. In this blog, we explore the top sectors driving this growth, including smart grid technologies and sustainable agriculture solutions.`,
      pull_quote: 'Zurich is proving that ecological sustainability and economic prosperity go hand in hand.',
      tags: JSON.stringify(['Green Tech', 'Startups', 'Zurich']),
      image_url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=600'
    }
  ];

  for (const blog of blogPosts) {
    await dbRun(`
      INSERT INTO blogs (
        title, subtitle, category, author_name, author_avatar, date_published, read_time_mins, content_body, pull_quote, tags, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      blog.title, blog.subtitle, blog.category, blog.author_name, blog.author_avatar, blog.date_published,
      blog.read_time_mins, blog.content_body, blog.pull_quote, blog.tags, blog.image_url
    ]);
  }

  // Seed Ads
  const ads = [
    { name: 'Swiss Re Spotlight Campaign', type: 'Company Spotlight', position: 'spotlight', company_id: 12, status: 'active', impressions: 4520, clicks: 184, image_url: '', start_date: '2026-05-01', end_date: '2026-08-01', geo_swiss_only: 1 },
    { name: 'Nestlé Corporate Banner', type: 'Direct Banner', position: 'leaderboard', company_id: 1, status: 'active', impressions: 12500, clicks: 312, image_url: 'https://placehold.co/728x90/1a1a1a/bf9b30?text=Nestle+-+Good+Food,+Good+Life', start_date: '2026-05-10', end_date: '2026-06-30', geo_swiss_only: 1 },
    { name: 'Rolex Luxury Rectangle', type: 'Direct Banner', position: 'sidebar', company_id: 5, status: 'active', impressions: 8400, clicks: 251, image_url: 'https://placehold.co/300x250/114d30/bf9b30?text=Rolex+-+Perpetual+Excellence', start_date: '2026-05-15', end_date: '2026-07-15', geo_swiss_only: 0 },
    { name: 'Google B2B Services', type: 'Google AdSense', position: 'native', company_id: null, status: 'active', impressions: 3200, clicks: 45, image_url: '', start_date: '2026-01-01', end_date: '2026-12-31', geo_swiss_only: 0 }
  ];

  for (const ad of ads) {
    await dbRun(`
      INSERT INTO ads (
        name, type, position, company_id, status, impressions, clicks, image_url, start_date, end_date, geo_swiss_only
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      ad.name, ad.type, ad.position, ad.company_id, ad.status, ad.impressions, ad.clicks,
      ad.image_url, ad.start_date, ad.end_date, ad.geo_swiss_only
    ]);
  }

  // Seed Page configs (Page Builder)
  const defaultLayout = JSON.stringify([
    { id: 'hero', enabled: true },
    { id: 'ticker', enabled: true },
    { id: 'sponsored_carousel', enabled: true },
    { id: 'companies_grid', enabled: true },
    { id: 'news_section', enabled: true }
  ]);

  const pages = [
    { path: '/', title: 'Home — Switzerland\'s Private Sector Platform', meta_description: 'Swiss Private Sector Business Platform providing verified intelligence, Swiss news and corporate directories.', blocks_layout: defaultLayout, ads_enabled: 1 },
    { path: '/unternehmen', title: 'Company Directory — Swiss B2B Platform', meta_description: 'Browse and search through Swiss private sector companies, filterable by canton, industry, size, and premium verification.', blocks_layout: defaultLayout, ads_enabled: 1 },
    { path: '/news', title: 'Intelligence & Editorial — Swiss B2B Platform', meta_description: 'Authoritative analysis and updates on Swiss private sector performance, corporate governance, and economic shifts.', blocks_layout: defaultLayout, ads_enabled: 1 },
    { path: '/statistiken', title: 'Macroeconomic Statistics — Swiss B2B Platform', meta_description: 'Interactive Swiss economic indicators, canton employment heatmap and industry comparison metrics.', blocks_layout: defaultLayout, ads_enabled: 0 }
  ];

  for (const page of pages) {
    await dbRun(`
      INSERT INTO pages (
        path, title, meta_description, blocks_layout, ads_enabled
      ) VALUES (?, ?, ?, ?, ?)
    `, [page.path, page.title, page.meta_description, page.blocks_layout, page.ads_enabled]);
  }

  // Seed Translation dictionary for English, German, French, and 15 other languages!
  const baseUiKeys = {
    // Nav
    'nav_companies': { de: 'Unternehmen', fr: 'Entreprises', en: 'Companies', it: 'Aziende', rm: 'Interpresas', es: 'Empresas', pt: 'Empresas', ar: 'الشركات', zh: '企业', ru: 'Компании', ja: '企業', tr: 'Şirketler', nl: 'Bedrijven', pl: 'Firmy', ko: '기업', sv: 'Företag', da: 'Virksomheder', fi: 'Yritykset' },
    'nav_news': { de: 'News', fr: 'Actualités', en: 'News', it: 'Notizie', rm: 'Novitats', es: 'Noticias', pt: 'Notícias', ar: 'الأخبار', zh: '新闻', ru: 'Новости', ja: 'ニュース', tr: 'Haberler', nl: 'Nieuws', pl: 'Wiadomości', ko: '뉴스', sv: 'Nyheter', da: 'Nyheder', fi: 'Uutiset' },
    'nav_statistics': { de: 'Statistiken', fr: 'Statistiques', en: 'Statistics', it: 'Statistiche', rm: 'Statisticas', es: 'Estadísticas', pt: 'Estatísticas', ar: 'الإحصائيات', zh: '统计数据', ru: 'Статистика', ja: '統計', tr: 'İstatistikler', nl: 'Statistieken', pl: 'Statystyki', ko: '통계', sv: 'Statistik', da: 'Statistik', fi: 'Tilastot' },
    'nav_interviews': { de: 'Interviews', fr: 'Interviews', en: 'Interviews', it: 'Interviste', rm: 'Interviews', es: 'Entrevistas', pt: 'Entrevistas', ar: 'المقابلات', zh: '专访', ru: 'Интервью', ja: 'インタビュー', tr: 'Röportajlar', nl: 'Interviews', pl: 'Wywiady', ko: '인터뷰', sv: 'Intervjuer', da: 'Interviews', fi: 'Haastattelut' },
    'nav_podcasts': { de: 'Podcasts', fr: 'Podcasts', en: 'Podcasts', it: 'Podcast', rm: 'Podcasts', es: 'Podcasts', pt: 'Podcasts', ar: 'بودكاست', zh: '播客', ru: 'Подкасты', ja: 'ポッドキャスト', tr: 'Podcast\'ler', nl: 'Podcasts', pl: 'Podcasty', ko: '팟캐스트', sv: 'Podcaster', da: 'Podcasts', fi: 'Podcastit' },
    'nav_careers': { de: 'Karriere', fr: 'Carrières', en: 'Careers', it: 'Carriere', rm: 'Carrieras', es: 'Carreras', pt: 'Carreiras', ar: 'الوظائف', zh: '职业生涯', ru: 'Карьера', ja: 'キャリア', tr: 'Kariyer', nl: 'Carrières', pl: 'Kariera', ko: '커리어', sv: 'Karriär', da: 'Karriere', fi: 'Urat' },
    // UI elements
    'nav_login': { de: 'Login', fr: 'Connexion', en: 'Login', it: 'Accedi', rm: 'Entrada', es: 'Iniciar Sesión', pt: 'Entrar', ar: 'تسجيل الدخول', zh: '登录', ru: 'Войти', ja: 'ログイン', tr: 'Giriş', nl: 'Inloggen', pl: 'Zaloguj', ko: '로그인', sv: 'Logga in', da: 'Log ind', fi: 'Kirjaudu' },
    'nav_register': { de: 'Registrieren', fr: 'S\'inscrire', en: 'Register', it: 'Registrati', rm: 'Registrar', es: 'Registrarse', pt: 'Registrar-se', ar: 'تسجيل', zh: '注册', ru: 'Регистрация', ja: '新規登録', tr: 'Kayıt Ol', nl: 'Registreren', pl: 'Zarejestruj', ko: '회원가입', sv: 'Registrera', da: 'Registrer', fi: 'Rekisteröidy' },
    'search_placeholder': { de: 'Firma suchen (z.B. Nestlé, Roche, UBS)...', fr: 'Rechercher une entreprise (ex. Nestlé, Roche, UBS)...', en: 'Search company (e.g. Nestlé, Roche, UBS)...', it: 'Cerca azienda (es. Nestlé, Roche, UBS)...', rm: 'Tschertgar firma (p.ex. Nestlé, Roche, UBS)...', es: 'Buscar empresa (ej. Nestlé, Roche, UBS)...', pt: 'Pesquisar empresa (ex. Nestlé, Roche, UBS)...', ar: 'ابحث عن شركة (مثل Nestlé, Roche, UBS)...', zh: '搜索公司（如 Nestlé, Roche, UBS）...', ru: 'Найти компанию (напр. Nestlé, Roche, UBS)...', ja: '企業を検索（例：Nestlé, Roche, UBS）...', tr: 'Şirket ara (ör. Nestlé, Roche, UBS)...', nl: 'Bedrijf zoeken (bijv. Nestlé, Roche, UBS)...', pl: 'Szukaj firmy (np. Nestlé, Roche, UBS)...', ko: '회사 검색 (예: Nestlé, Roche, UBS)...', sv: 'Sök företag (t.ex. Nestlé, Roche, UBS)...', da: 'Søg virksomhed (f.eks. Nestlé, Roche, UBS)...', fi: 'Hae yritystä (esim. Nestlé, Roche, UBS)...' },
    'search_button': { de: 'Suchen', fr: 'Rechercher', en: 'Search', it: 'Cerca', rm: 'Tschertgar', es: 'Buscar', pt: 'Pesquisar', ar: 'بحث', zh: '搜索', ru: 'Поиск', ja: '検索', tr: 'Ara', nl: 'Zoeken', pl: 'Szukaj', ko: '검색', sv: 'Sök', da: 'Søg', fi: 'Hae' },
    'popular_searches': { de: 'Beliebte Suchen:', fr: 'Recherches populaires :', en: 'Popular searches:', it: 'Ricerche popolari:', rm: 'Retschertgas popularas:', es: 'Búsquedas populares:', pt: 'Pesquisas populares:', ar: 'عمليات بحث شائعة:', zh: '热门搜索：', ru: 'Популярные запросы:', ja: '人気の検索：', tr: 'Popüler aramalar:', nl: 'Populaire zoekopdrachten:', pl: 'Popularne wyszukiwania:', ko: '인기 검색:', sv: 'Populära sökningar:', da: 'Populære søgninger:', fi: 'Suositut haut:' },
    'stats_companies': { de: 'Unternehmen', fr: 'Entreprises', en: 'Companies', it: 'Aziende', rm: 'Interpresas', es: 'Empresas', pt: 'Empresas', ar: 'شركات', zh: '企业', ru: 'Компании', ja: '企業', tr: 'Şirketler', nl: 'Bedrijven', pl: 'Firmy', ko: '기업', sv: 'Företag', da: 'Virksomheder', fi: 'Yritykset' },
    'stats_cantons': { de: 'Kantone', fr: 'Cantons', en: 'Cantons', it: 'Cantoni', rm: 'Chantuns', es: 'Cantones', pt: 'Cantões', ar: 'كانتونات', zh: '州', ru: 'Кантоны', ja: '州', tr: 'Kantonlar', nl: 'Kantons', pl: 'Kantony', ko: '주', sv: 'Kantoner', da: 'Kantoner', fi: 'Kantonit' },
    'stats_gdp': { de: 'BIP', fr: 'PIB', en: 'GDP', it: 'PIL', rm: 'PIB', es: 'PIB', pt: 'PIB', ar: 'الناتج المحلي', zh: 'GDP', ru: 'ВВП', ja: 'GDP', tr: 'GSYİH', nl: 'BBP', pl: 'PKB', ko: 'GDP', sv: 'BNP', da: 'BNP', fi: 'BKT' },
    'stats_languages': { de: 'Sprachen', fr: 'Langues', en: 'Languages', it: 'Lingue', rm: 'Linguas', es: 'Idiomas', pt: 'Idiomas', ar: 'لغات', zh: '语言', ru: 'Языки', ja: '言語', tr: 'Diller', nl: 'Talen', pl: 'Języki', ko: '언어', sv: 'Språk', da: 'Sprog', fi: 'Kielet' },
    'stats_readers': { de: 'Leser', fr: 'Lecteurs', en: 'Readers', it: 'Lettori', rm: 'Lecturs', es: 'Lectores', pt: 'Leitores', ar: 'قراء', zh: '读者', ru: 'Читатели', ja: '読者', tr: 'Okuyucular', nl: 'Lezers', pl: 'Czytelnicy', ko: '독자', sv: 'Läsare', da: 'Læsere', fi: 'Lukijat' },
    'spotlight_title': { de: 'Premium Business Spotlight', fr: 'Projecteur Entreprises Premium', en: 'Premium Business Spotlight', it: 'Spotlight Aziende Premium', rm: 'Spotlight Interpresas Premium', es: 'Spotlight Empresas Premium', pt: 'Spotlight Empresas Premium', ar: 'تسليط الضوء على الأعمال المميزة', zh: '优质企业聚焦', ru: 'Премиум-обзор бизнеса', ja: 'プレミアムビジネススポットライト', tr: 'Premium İş Vitrinleri', nl: 'Premium Bedrijven Spotlight', pl: 'Spotlight Firm Premium', ko: '프리미엄 비즈니스 스포트라이트', sv: 'Premium Företagsstrålkastare', da: 'Premium Virksomhedsspotlight', fi: 'Premium-yritysvalokeilassa' },
    'open_directory': { de: 'Verzeichnis öffnen', fr: 'Ouvrir l\'annuaire', en: 'Open Directory', it: 'Apri elenco', rm: 'Avrir il register', es: 'Abrir directorio', pt: 'Abrir diretório', ar: 'فتح الدليل', zh: '打开目录', ru: 'Открыть каталог', ja: 'ディレクトリを開く', tr: 'Dizini aç', nl: 'Map openen', pl: 'Otwórz katalog', ko: '디렉토리 열기', sv: 'Öppna katalog', da: 'Åbn katalog', fi: 'Avaa hakemisto' },
    'news_title': { de: 'Wirtschaftsanalysen & Berichte', fr: 'Analyses économiques & Rapports', en: 'Economic Analyses & Reports', it: 'Analisi economiche e rapporti', rm: 'Analisas economicas & rapports', es: 'Análisis económicos e informes', pt: 'Análises econômicas e relatórios', ar: 'التحليلات الاقتصادية والتقارير', zh: '经济分析与报告', ru: 'Экономический анализ и отчёты', ja: '経済分析とレポート', tr: 'Ekonomik Analizler ve Raporlar', nl: 'Economische analyses en rapporten', pl: 'Analizy ekonomiczne i raporty', ko: '경제 분석 및 보고서', sv: 'Ekonomiska analyser och rapporter', da: 'Økonomiske analyser og rapporter', fi: 'Talousanalyysit ja raportit' },
    'breaking_news': { de: 'Eilmeldung', fr: 'Flash info', en: 'Breaking News', it: 'Ultim\'ora', rm: 'Novitad urgenta', es: 'Última hora', pt: 'Notícia urgente', ar: 'عاجل', zh: '突发新闻', ru: 'Срочные новости', ja: '速報', tr: 'Son dakika', nl: 'Laatste nieuws', pl: 'Pilne', ko: '속보', sv: 'Senaste nytt', da: 'Breaking news', fi: 'Tuoreet uutiset' },
    'b2b_index_title': { de: 'B2B Vertrauensindex', fr: 'Indice de confiance B2B', en: 'B2B Trust Index', it: 'Indice di fiducia B2B', rm: 'Index da confidenza B2B', es: 'Índice de confianza B2B', pt: 'Índice de confiança B2B', ar: 'مؤشر الثقة B2B', zh: 'B2B 信任指数', ru: 'Индекс доверия B2B', ja: 'B2B 信頼指数', tr: 'B2B Güven Endeksi', nl: 'B2B Vertrouwensindex', pl: 'Indeks zaufania B2B', ko: 'B2B 신뢰 지수', sv: 'B2B Förtroendeindex', da: 'B2B Tillidsindeks', fi: 'B2B-luottamusindeksi' },
    'b2b_index_desc': { de: 'Zefix-verifizierte Profile sorgen für Transparenz und direkte Vertrauensbildung mit internationalen Handelspartnern im Schweizer B2B-Markt.', fr: 'Les profils vérifiés par Zefix garantissent la transparence et établissent une confiance directe avec les partenaires commerciaux internationaux sur le marché B2B suisse.', en: 'Zefix-verified profiles ensure transparency and build direct trust with international trading partners in the Swiss B2B market.', it: 'I profili verificati Zefix garantiscono trasparenza e creano fiducia diretta con i partner commerciali internazionali nel mercato B2B svizzero.', rm: 'Profils verifichads da Zefix garanteschan transparenza e fidonza directa cun partenaris commercials internaziunals sin il martgà B2B svizzer.', es: 'Los perfiles verificados por Zefix garantizan transparencia y generan confianza directa con socios comerciales internacionales en el mercado B2B suizo.', pt: 'Os perfis verificados pela Zefix garantem transparência e geram confiança direta com parceiros comerciais internacionais no mercado B2B suíço.', ar: 'تضمن الملفات التعريفية الموثقة من Zefix الشفافية وبناء الثقة المباشرة مع الشركاء التجاريين الدوليين في سوق B2B السويسري.', zh: 'Zefix 认证的企业档案确保透明度，并与瑞士 B2B 市场的国际贸易伙伴建立直接信任。', ru: 'Профили, верифицированные Zefix, обеспечивают прозрачность и создают прямое доверие с международными торговыми партнёрами на швейцарском рынке B2B.', ja: 'Zefix認証プロフィールは透明性を確保し、スイスB2B市場の国際的な取引パートナーとの直接的な信頼を構築します。', tr: 'Zefix doğrulanmış profiller, İsviçre B2B pazarında uluslararası ticaret ortaklarıyla şeffaflık ve doğrudan güven oluşturur.', nl: 'Zefix-geverifieerde profielen zorgen voor transparantie en bouwen direct vertrouwen op met internationale handelspartners op de Zwitserse B2B-markt.', pl: 'Profile zweryfikowane przez Zefix zapewniają przejrzystość i budują bezpośrednie zaufanie z międzynarodowymi partnerami handlowymi na rynku B2B w Szwajcarii.', ko: 'Zefix 인증 프로필은 스위스 B2B 시장에서 국제 무역 파트너와의 투명성과 직접적인 신뢰를 구축합니다.', sv: 'Zefix-verifierade profiler säkerställer transparens och bygger direkt förtroende med internationella handelspartners på den schweiziska B2B-marknaden.', da: 'Zefix-verificerede profiler sikrer gennemsigtighed og opbygger direkte tillid med internationale handelspartnere på det schweiziske B2B-marked.', fi: 'Zefix-vahvistetut profiilit varmistavat läpinäkyvyyden ja rakentavat suoran luottamuksen kansainvälisten kauppakumppaneiden kanssa Sveitsin B2B-markkinoilla.' },
    'search_dossier': { de: 'Dossier-Index durchsuchen', fr: 'Rechercher dans l\'index des dossiers', en: 'Search Dossier Index', it: 'Cerca nell\'indice dossier', rm: 'Tschertgar en l\'index da dossiers', es: 'Buscar índice de expedientes', pt: 'Pesquisar índice de dossiês', ar: 'البحث في فهرس الملفات', zh: '搜索档案索引', ru: 'Поиск в индексе досье', ja: 'ドシエインデックスを検索', tr: 'Dosya dizininde ara', nl: 'Dossierindex doorzoeken', pl: 'Przeszukaj indeks dossier', ko: '서류 색인 검색', sv: 'Sök dossierindex', da: 'Søg i dossierindeks', fi: 'Hae asiakirjaindeksistä' },
    'dir_home': { de: 'Home', fr: 'Accueil', en: 'Home', it: 'Home', rm: 'Home', es: 'Inicio', pt: 'Início', ar: 'الرئيسية', zh: '首页', ru: 'Главная', ja: 'ホーム', tr: 'Ana Sayfa', nl: 'Home', pl: 'Strona główna', ko: '홈', sv: 'Hem', da: 'Hjem', fi: 'Etusivu' },
    'dir_directory': { de: 'Verzeichnis', fr: 'Annuaire', en: 'Directory', it: 'Elenco', rm: 'Register', es: 'Directorio', pt: 'Diretório', ar: 'الدليل', zh: '目录', ru: 'Каталог', ja: 'ディレクトリ', tr: 'Dizin', nl: 'Map', pl: 'Katalog', ko: '디렉토리', sv: 'Katalog', da: 'Katalog', fi: 'Hakemisto' },
    'dir_filterpanel': { de: 'Filterpanel', fr: 'Panneau de filtrage', en: 'Filter Panel', it: 'Pannello filtri', rm: 'Panel da filter', es: 'Panel de filtros', pt: 'Painel de filtros', ar: 'لوحة التصفية', zh: '筛选面板', ru: 'Панель фильтров', ja: 'フィルタパネル', tr: 'Filtre Paneli', nl: 'Filterpaneel', pl: 'Panel filtrów', ko: '필터 패널', sv: 'Filterpanel', da: 'Filterpanel', fi: 'Suodatinpaneeli' },
    'dir_verified_only': { de: 'Nur verifiziert', fr: 'Uniquement vérifié', en: 'Verified Only', it: 'Solo verificati', rm: 'Mo verifichads', es: 'Solo verificados', pt: 'Apenas verificados', ar: 'الموثقة فقط', zh: '仅已验证', ru: 'Только верифицированные', ja: '認証済みのみ', tr: 'Yalnızca doğrulanmış', nl: 'Alleen geverifieerd', pl: 'Tylko zweryfikowane', ko: '인증된 항목만', sv: 'Endast verifierade', da: 'Kun verificerede', fi: 'Vain vahvistetut' },
    'dir_eco_only': { de: 'Nur Eco-Leader', fr: 'Uniquement Eco-Leader', en: 'Eco-Leader Only', it: 'Solo Eco-Leader', rm: 'Mo Eco-Leader', es: 'Solo Eco-Líder', pt: 'Apenas Eco-Líder', ar: 'القادة البيئيون فقط', zh: '仅环保先锋', ru: 'Только Эко-лидеры', ja: 'エコリーダーのみ', tr: 'Yalnızca Eko-Lider', nl: 'Alleen Eco-Leider', pl: 'Tylko Eko-Liderzy', ko: '에코리더만', sv: 'Endast Eko-Ledare', da: 'Kun Øko-Leder', fi: 'Vain Eko-johtajat' },
    'dir_canton': { de: 'Kanton', fr: 'Canton', en: 'Canton', it: 'Cantone', rm: 'Chantun', es: 'Cantón', pt: 'Cantão', ar: 'الكانتون', zh: '州', ru: 'Кантон', ja: '州', tr: 'Kanton', nl: 'Kanton', pl: 'Kanton', ko: '주', sv: 'Kanton', da: 'Kanton', fi: 'Kantoni' },
    'dir_industry': { de: 'Industrie', fr: 'Industrie', en: 'Industry', it: 'Industria', rm: 'Industria', es: 'Industria', pt: 'Indústria', ar: 'الصناعة', zh: '行业', ru: 'Отрасль', ja: '業界', tr: 'Sektör', nl: 'Industrie', pl: 'Branża', ko: '산업', sv: 'Bransch', da: 'Branche', fi: 'Toimiala' },
    'dir_company_size': { de: 'Firmengröße', fr: 'Taille de l\'entreprise', en: 'Company Size', it: 'Dimensione azienda', rm: 'Grondezza da l\'interpresa', es: 'Tamaño de empresa', pt: 'Tamanho da empresa', ar: 'حجم الشركة', zh: '公司规模', ru: 'Размер компании', ja: '企業規模', tr: 'Şirket Büyüklüğü', nl: 'Bedrijfsgrootte', pl: 'Rozmiar firmy', ko: '기업 규모', sv: 'Företagsstorlek', da: 'Virksomhedsstørrelse', fi: 'Yrityksen koko' },
    'dir_all_sizes': { de: 'Alle Größen', fr: 'Toutes les tailles', en: 'All Sizes', it: 'Tutte le dimensioni', rm: 'Tut las grondezzas', es: 'Todos los tamaños', pt: 'Todos os tamanhos', ar: 'جميع الأحجام', zh: '所有规模', ru: 'Все размеры', ja: 'すべてのサイズ', tr: 'Tüm Büyüklükler', nl: 'Alle groottes', pl: 'Wszystkie rozmiary', ko: '모든 규모', sv: 'Alla storlekar', da: 'Alle størrelser', fi: 'Kaikki koot' },
    'dir_enterprise': { de: 'Unternehmen', fr: 'Entreprise', en: 'Enterprise', it: 'Impresa', rm: 'Interpresa', es: 'Empresa', pt: 'Empresa', ar: 'مؤسسة', zh: '企业', ru: 'Предприятие', ja: '企業', tr: 'İşletme', nl: 'Onderneming', pl: 'Przedsiębiorstwo', ko: '기업', sv: 'Företag', da: 'Virksomhed', fi: 'Yritys' },
    'dir_reset_filters': { de: 'Filter zurücksetzen', fr: 'Réinitialiser les filtres', en: 'Reset Filters', it: 'Reimposta filtri', rm: 'Redefinir filters', es: 'Restablecer filtros', pt: 'Redefinir filtros', ar: 'إعادة تعيين الفلاتر', zh: '重置筛选', ru: 'Сбросить фильтры', ja: 'フィルタをリセット', tr: 'Filtreleri sıfırla', nl: 'Filters resetten', pl: 'Resetuj filtry', ko: '필터 초기화', sv: 'Återställ filter', da: 'Nulstil filtre', fi: 'Nollaa suodattimet' },
    'dir_found_singular': { de: 'Eintrag gefunden', fr: 'entrée trouvée', en: 'entry found', it: 'voce trovata', rm: 'entrada chattada', es: 'entrada encontrada', pt: 'entrada encontrada', ar: 'إدخال تم العثور عليه', zh: '个条目', ru: 'запись найдена', ja: '件見つかりました', tr: 'kayıt bulundu', nl: 'vermelding gevonden', pl: 'wpis znaleziony', ko: '항목 발견', sv: 'post hittad', da: 'indgang fundet', fi: 'merkintä löydetty' },
    'dir_found_plural': { de: 'Einträge gefunden', fr: 'entrées trouvées', en: 'entries found', it: 'voci trovate', rm: 'entradas chattadas', es: 'entradas encontradas', pt: 'entradas encontradas', ar: 'إدخالات تم العثور عليها', zh: '个条目', ru: 'записей найдено', ja: '件見つかりました', tr: 'kayıt bulundu', nl: 'vermeldingen gevonden', pl: 'wpisów znalezionych', ko: '항목 발견', sv: 'poster hittade', da: 'indgange fundet', fi: 'merkintää löydetty' },
    'dir_view': { de: 'Ansicht:', fr: 'Vue :', en: 'View:', it: 'Vista:', rm: 'Vista:', es: 'Vista:', pt: 'Visualização:', ar: 'عرض:', zh: '视图：', ru: 'Вид:', ja: '表示：', tr: 'Görünüm:', nl: 'Weergave:', pl: 'Widok:', ko: '보기:', sv: 'Vy:', da: 'Visning:', fi: 'Näkymä:' },
    'dir_loading': { de: 'Firmendaten werden geladen...', fr: 'Chargement des données de l\'entreprise...', en: 'Loading company data...', it: 'Caricamento dati aziendali...', rm: 'Chargiar datas da l\'interpresa...', es: 'Cargando datos de la empresa...', pt: 'Carregando dados da empresa...', ar: 'جاري تحميل بيانات الشركة...', zh: '正在加载公司数据...', ru: 'Загрузка данных компании...', ja: '企業データを読み込み中...', tr: 'Şirket verileri yükleniyor...', nl: 'Bedrijfsgegevens laden...', pl: 'Ładowanie danych firmy...', ko: '회사 데이터 로딩 중...', sv: 'Laddar företagsdata...', da: 'Indlæser virksomhedsdata...', fi: 'Ladataan yritystietoja...' },
    'dir_no_results': { de: 'Keine Ergebnisse gefunden', fr: 'Aucun résultat trouvé', en: 'No results found', it: 'Nessun risultato trovato', rm: 'Nagins resultats chattads', es: 'No se encontraron resultados', pt: 'Nenhum resultado encontrado', ar: 'لم يتم العثور على نتائج', zh: '未找到结果', ru: 'Результатов не найдено', ja: '結果が見つかりません', tr: 'Sonuç bulunamadı', nl: 'Geen resultaten gevonden', pl: 'Brak wyników', ko: '결과를 찾을 수 없습니다', sv: 'Inga resultat hittades', da: 'Ingen resultater fundet', fi: 'Ei tuloksia' },
    'dir_no_results_desc': { de: 'Es wurden keine Unternehmen gefunden, die den gewählten Filtern entsprechen. Setzen Sie die Filter zurück oder passen Sie die Suche an.', fr: 'Aucune entreprise correspondant aux filtres sélectionnés n\'a été trouvée. Réinitialisez les filtres ou ajustez la recherche.', en: 'No companies matching the selected filters were found. Reset the filters or adjust the search.', it: 'Nessuna azienda corrispondente ai filtri selezionati. Reimpostare i filtri o modificare la ricerca.', rm: 'Naginas interpresas correspundantas als filters tschernids. Redefinir ils filters u adattar la tschertga.', es: 'No se encontraron empresas que coincidan con los filtros seleccionados. Restablezca los filtros o ajuste la búsqueda.', pt: 'Nenhuma empresa correspondente aos filtros selecionados foi encontrada. Redefina os filtros ou ajuste a pesquisa.', ar: 'لم يتم العثور على شركات تطابق الفلاتر المحددة. أعد تعيين الفلاتر أو عدّل البحث.', zh: '未找到符合所选筛选条件的公司。请重置筛选条件或调整搜索。', ru: 'Компании, соответствующие выбранным фильтрам, не найдены. Сбросьте фильтры или измените поиск.', ja: '選択されたフィルタに一致する企業が見つかりません。フィルタをリセットするか、検索を調整してください。', tr: 'Seçilen filtrelere uyan şirket bulunamadı. Filtreleri sıfırlayın veya aramayı ayarlayın.', nl: 'Geen bedrijven gevonden die overeenkomen met de geselecteerde filters. Reset de filters of pas de zoekopdracht aan.', pl: 'Nie znaleziono firm odpowiadających wybranym filtrom. Zresetuj filtry lub dostosuj wyszukiwanie.', ko: '선택한 필터와 일치하는 회사가 없습니다. 필터를 초기화하거나 검색을 조정하세요.', sv: 'Inga företag som matchar de valda filtren hittades. Återställ filtren eller justera sökningen.', da: 'Ingen virksomheder matcher de valgte filtre. Nulstil filtre eller juster søgningen.', fi: 'Valittuihin suodattimiin sopivia yrityksiä ei löytynyt. Nollaa suodattimet tai muokkaa hakua.' },
    'dir_back': { de: '← Zurück', fr: '← Précédent', en: '← Back', it: '← Indietro', rm: '← Enavos', es: '← Atrás', pt: '← Voltar', ar: '← رجوع', zh: '← 返回', ru: '← Назад', ja: '← 戻る', tr: '← Geri', nl: '← Terug', pl: '← Wstecz', ko: '← 뒤로', sv: '← Tillbaka', da: '← Tilbage', fi: '← Takaisin' },
    'dir_page': { de: 'Seite', fr: 'Page', en: 'Page', it: 'Pagina', rm: 'Pagina', es: 'Página', pt: 'Página', ar: 'صفحة', zh: '页', ru: 'Страница', ja: 'ページ', tr: 'Sayfa', nl: 'Pagina', pl: 'Strona', ko: '페이지', sv: 'Sida', da: 'Side', fi: 'Sivu' },
    'dir_of': { de: 'von', fr: 'sur', en: 'of', it: 'di', rm: 'da', es: 'de', pt: 'de', ar: 'من', zh: '/', ru: 'из', ja: '/', tr: '/', nl: 'van', pl: 'z', ko: '/', sv: 'av', da: 'af', fi: '/' },
    'dir_next': { de: 'Vorwärts →', fr: 'Suivant →', en: 'Next →', it: 'Avanti →', rm: 'Enavant →', es: 'Siguiente →', pt: 'Próximo →', ar: 'التالي →', zh: '下一页 →', ru: 'Далее →', ja: '次へ →', tr: 'İleri →', nl: 'Volgende →', pl: 'Dalej →', ko: '다음 →', sv: 'Nästa →', da: 'Næste →', fi: 'Seuraava →' },
    'news_loading': { de: 'Medienarchiv wird geladen...', fr: 'Chargement des archives de presse...', en: 'Loading news archive...', it: 'Caricamento archivio notizie...', rm: 'Chargiar l\'archiv da medias...', es: 'Cargando archivo de noticias...', pt: 'Carregando arquivo de notícias...', ar: 'جاري تحميل أرشيف الأخبار...', zh: '正在加载新闻存档...', ru: 'Загрузка архива новостей...', ja: 'ニュースアーカイブを読み込み中...', tr: 'Haber arşivi yükleniyor...', nl: 'Nieuwsarchief laden...', pl: 'Ładowanie archiwum wiadomości...', ko: '뉴스 아카이브 로딩 중...', sv: 'Laddar nyhetsarkiv...', da: 'Indlæser nyhedsarkiv...', fi: 'Ladataan uutisarkistoa...' },
    'news_article': { de: 'Artikel', fr: 'Article', en: 'Article', it: 'Articolo', rm: 'Artitgel', es: 'Artículo', pt: 'Artigo', ar: 'مقال', zh: '文章', ru: 'Статья', ja: '記事', tr: 'Makale', nl: 'Artikel', pl: 'Artykuł', ko: '기사', sv: 'Artikel', da: 'Artikel', fi: 'Artikkeli' },
    'news_read_time': { de: 'Min. Lesezeit', fr: 'Min. de lecture', en: 'min read', it: 'min di lettura', rm: 'min da lectura', es: 'min de lectura', pt: 'min de leitura', ar: 'دقيقة قراءة', zh: '分钟阅读', ru: 'мин. чтения', ja: '分で読めます', tr: 'dk okuma', nl: 'min leestijd', pl: 'min czytania', ko: '분 읽기', sv: 'min läsning', da: 'min læsning', fi: 'min lukuaika' },
    'news_topics': { de: 'THEMEN:', fr: 'SUJETS :', en: 'TOPICS:', it: 'ARGOMENTI:', rm: 'TEMAS:', es: 'TEMAS:', pt: 'TÓPICOS:', ar: 'المواضيع:', zh: '主题：', ru: 'ТЕМЫ:', ja: 'トピック：', tr: 'KONULAR:', nl: 'ONDERWERPEN:', pl: 'TEMATY:', ko: '주제:', sv: 'ÄMNEN:', da: 'EMNER:', fi: 'AIHEET:' },
    'news_related': { de: 'Ähnliche Artikel', fr: 'Articles connexes', en: 'Related Articles', it: 'Articoli correlati', rm: 'Artitgels sumegliants', es: 'Artículos relacionados', pt: 'Artigos relacionados', ar: 'مقالات ذات صلة', zh: '相关文章', ru: 'Похожие статьи', ja: '関連記事', tr: 'İlgili Makaleler', nl: 'Gerelateerde artikelen', pl: 'Powiązane artykuły', ko: '관련 기사', sv: 'Relaterade artiklar', da: 'Relaterede artikler', fi: 'Aiheeseen liittyvät artikkelit' },
    'news_min_abbr': { de: 'Min', fr: 'Min', en: 'min', it: 'min', rm: 'min', es: 'min', pt: 'min', ar: 'دقيقة', zh: '分钟', ru: 'мин', ja: '分', tr: 'dk', nl: 'min', pl: 'min', ko: '분', sv: 'min', da: 'min', fi: 'min' },
    'news_most_read': { de: 'Meistgelesen', fr: 'Plus lus', en: 'Most Read', it: 'Più letti', rm: 'Il pli legids', es: 'Más leídos', pt: 'Mais lidos', ar: 'الأكثر قراءة', zh: '最多阅读', ru: 'Самые читаемые', ja: '最も読まれた', tr: 'En çok okunan', nl: 'Meest gelezen', pl: 'Najczęściej czytane', ko: '가장 많이 읽힌', sv: 'Mest lästa', da: 'Mest læste', fi: 'Luetuimmat' },
    'news_mentioned_companies': { de: 'Erwähnte Unternehmen', fr: 'Entreprises mentionnées', en: 'Mentioned Companies', it: 'Aziende menzionate', rm: 'Interpresas menziunadas', es: 'Empresas mencionadas', pt: 'Empresas mencionadas', ar: 'الشركات المذكورة', zh: '提及的公司', ru: 'Упомянутые компании', ja: '言及された企業', tr: 'Bahsedilen Şirketler', nl: 'Genoemde bedrijven', pl: 'Wymienione firmy', ko: '언급된 회사', sv: 'Nämnda företag', da: 'Nævnte virksomheder', fi: 'Mainitut yritykset' },
    'news_briefing_title': { de: 'Wirtschafts-Briefing', fr: 'Briefing économique', en: 'Business Briefing', it: 'Briefing economico', rm: 'Briefing economic', es: 'Briefing empresarial', pt: 'Briefing de negócios', ar: 'ملخص الأعمال', zh: '商业简报', ru: 'Бизнес-брифинг', ja: 'ビジネスブリーフィング', tr: 'İş Brifing', nl: 'Zakelijke briefing', pl: 'Briefing biznesowy', ko: '비즈니스 브리핑', sv: 'Affärsbriefing', da: 'Forretningsbriefing', fi: 'Liiketoimintakatsaus' },
    'news_briefing_desc': { de: 'Abonnieren Sie unseren Newsletter für die aktuellsten Unternehmensberichte.', fr: 'Abonnez-vous à notre newsletter pour les derniers rapports d\'entreprise.', en: 'Subscribe to our newsletter for the latest company reports.', it: 'Iscriviti alla nostra newsletter per i rapporti aziendali più recenti.', rm: 'Abunnai voss a noss newsletter per ils rapports actuals da l\'interpresa.', es: 'Suscríbase a nuestro boletín para los últimos informes empresariales.', pt: 'Inscreva-se em nosso boletim para os relatórios empresariais mais recentes.', ar: 'اشترك في نشرتنا الإخبارية للحصول على أحدث تقارير الشركات.', zh: '订阅我们的新闻通讯，获取最新公司报告。', ru: 'Подпишитесь на нашу рассылку для получения последних корпоративных отчётов.', ja: '最新の企業レポートを受け取るにはニュースレターを購読してください。', tr: 'En güncel şirket raporları için bültenimize abone olun.', nl: 'Abonneer u op onze nieuwsbrief voor de nieuwste bedrijfsrapporten.', pl: 'Zasubskrybuj nasz newsletter, aby otrzymywać najnowsze raporty firmowe.', ko: '최신 기업 보고서를 받으려면 뉴스레터를 구독하세요.', sv: 'Prenumerera på vårt nyhetsbrev för de senaste företagsrapporterna.', da: 'Abonner på vores nyhedsbrev for de seneste virksomhedsrapporter.', fi: 'Tilaa uutiskirjeemme uusimpien yritysraporttien saamiseksi.' },
    'news_email_placeholder': { de: 'Ihre E-Mail-Adresse', fr: 'Votre adresse e-mail', en: 'Your email address', it: 'Il tuo indirizzo e-mail', rm: 'Voss adressa dad e-mail', es: 'Su dirección de correo', pt: 'Seu endereço de e-mail', ar: 'عنوان بريدك الإلكتروني', zh: '您的电子邮箱地址', ru: 'Ваш адрес электронной почты', ja: 'メールアドレス', tr: 'E-posta adresiniz', nl: 'Uw e-mailadres', pl: 'Twój adres e-mail', ko: '이메일 주소', sv: 'Din e-postadress', da: 'Din e-mailadresse', fi: 'Sähköpostiosoitteesi' },
    'news_subscribe': { de: 'Abonnieren', fr: 'S\'abonner', en: 'Subscribe', it: 'Iscriviti', rm: 'Abunar', es: 'Suscribirse', pt: 'Inscrever-se', ar: 'اشتراك', zh: '订阅', ru: 'Подписаться', ja: '購読する', tr: 'Abone ol', nl: 'Abonneren', pl: 'Subskrybuj', ko: '구독', sv: 'Prenumerera', da: 'Abonner', fi: 'Tilaa' },
    'news_header': { de: 'Schweizer Wirtschaftsnachrichten', fr: 'Actualités économiques suisses', en: 'Swiss Business News', it: 'Notizie economiche svizzere', rm: 'Novitads economicas svizras', es: 'Noticias empresariales suizas', pt: 'Notícias empresariais suíças', ar: 'أخبار الأعمال السويسرية', zh: '瑞士商业新闻', ru: 'Швейцарские бизнес-новости', ja: 'スイスビジネスニュース', tr: 'İsviçre İş Haberleri', nl: 'Zwitsers zakelijk nieuws', pl: 'Szwajcarskie wiadomości biznesowe', ko: '스위스 비즈니스 뉴스', sv: 'Schweiziska affärsnyheter', da: 'Schweiziske erhvervsnyheder', fi: 'Sveitsin talousuutiset' },
    'news_header_desc': { de: 'Unabhängiger, verifizierter B2B-Journalismus zu Strukturen, Transaktionen und Strategien.', fr: 'Journalisme B2B indépendant et vérifié sur les structures, transactions et stratégies.', en: 'Independent, verified B2B journalism on structures, transactions, and strategies.', it: 'Giornalismo B2B indipendente e verificato su strutture, transazioni e strategie.', rm: 'Schurnalissem B2B independent e verifichà davart structuras, transacziuns e strategias.', es: 'Periodismo B2B independiente y verificado sobre estructuras, transacciones y estrategias.', pt: 'Jornalismo B2B independente e verificado sobre estruturas, transações e estratégias.', ar: 'صحافة B2B مستقلة وموثقة حول الهياكل والمعاملات والاستراتيجيات.', zh: '独立、经过验证的 B2B 新闻报道，涵盖结构、交易和战略。', ru: 'Независимая, верифицированная B2B-журналистика о структурах, транзакциях и стратегиях.', ja: '構造、取引、戦略に関する独立した検証済みのB2Bジャーナリズム。', tr: 'Yapılar, işlemler ve stratejiler üzerine bağımsız, doğrulanmış B2B gazeteciliği.', nl: 'Onafhankelijke, geverifieerde B2B-journalistiek over structuren, transacties en strategieën.', pl: 'Niezależne, zweryfikowane dziennikarstwo B2B o strukturach, transakcjach i strategiach.', ko: '구조, 거래 및 전략에 대한 독립적이고 검증된 B2B 저널리즘.', sv: 'Oberoende, verifierad B2B-journalistik om strukturer, transaktioner och strategier.', da: 'Uafhængig, verificeret B2B-journalistik om strukturer, transaktioner og strategier.', fi: 'Riippumaton, vahvistettu B2B-journalismi rakenteista, transaktioista ja strategioista.' },
    'news_no_articles': { de: 'Keine Artikel im Archiv vorhanden.', fr: 'Aucun article dans l\'archive.', en: 'No articles in the archive.', it: 'Nessun articolo nell\'archivio.', rm: 'Nagins artitgels en l\'archiv.', es: 'No hay artículos en el archivo.', pt: 'Nenhum artigo no arquivo.', ar: 'لا توجد مقالات في الأرشيف.', zh: '存档中没有文章。', ru: 'В архиве нет статей.', ja: 'アーカイブに記事がありません。', tr: 'Arşivde makale yok.', nl: 'Geen artikelen in het archief.', pl: 'Brak artykułów w archiwum.', ko: '아카이브에 기사가 없습니다.', sv: 'Inga artiklar i arkivet.', da: 'Ingen artikler i arkivet.', fi: 'Arkistossa ei ole artikkeleita.' },
    'news_read_article': { de: 'Artikel lesen', fr: 'Lire l\'article', en: 'Read Article', it: 'Leggi l\'articolo', rm: 'Leger l\'artitgel', es: 'Leer artículo', pt: 'Ler artigo', ar: 'قراءة المقال', zh: '阅读文章', ru: 'Читать статью', ja: '記事を読む', tr: 'Makaleyi oku', nl: 'Artikel lezen', pl: 'Czytaj artykuł', ko: '기사 읽기', sv: 'Läs artikel', da: 'Læs artikel', fi: 'Lue artikkeli' },
    'hero_title': { 
      de: 'Schweizer Privatsektor, eine Plattform.', 
      fr: 'Le secteur privé suisse, une seule plateforme.', 
      en: 'Switzerland\'s Private Sector, One Platform.',
      it: 'Il settore privato svizzero, un\'unica piattaforma.',
      rm: 'Il sectur privat svizzer, ina plattafurma.',
      es: 'El sector privado suizo, una sola plataforma.',
      pt: 'O setor privado suíço, uma única plataforma.',
      ar: 'القطاع الخاص السويسري، منصة واحدة.',
      zh: '瑞士私营部门，统一平台。',
      ru: 'Частный сектор Швейцарии, одна платформа.',
      ja: 'スイスの民間部門を、ひとつのプラットフォームで。',
      tr: 'İsviçre Özel Sektörü, Tek Platform.',
      nl: 'De Zwitserse particuliere sector, één platform.',
      pl: 'Szwajcarski sektor prywatny, jedna platforma.',
      ko: '스위스 민간 부문, 하나의 플랫폼.',
      sv: 'Schweiziska privata sektorn, en plattform.',
      da: 'Schweiz\' private sektor, én platform.',
      fi: 'Sveitsin yksityinen sektori, yksi alusta.'
    },
    'hero_subtitle': { 
      de: 'Zugang zu Premium-Insights, verifizierten B2B-Daten und aktuellen Nachrichten über Schweizer Unternehmen.', 
      fr: 'Accédez à des informations premium, des données B2B vérifiées et les dernières actualités des entreprises suisses.', 
      en: 'Access premium insights, verified B2B data, and the latest news on Swiss enterprises.',
      it: 'Accedi a informazioni premium, dati B2B verificati e alle ultime notizie sulle imprese svizzere.',
      rm: 'Access a premium-insights, datas da B2B verifikadas e novitats actualas davart interpresas svizras.',
      es: 'Acceda a perspectivas premium, datos B2B verificados y las últimas noticias sobre empresas suizas.',
      pt: 'Acesso a insights premium, dados B2B verificados e as últimas notícias sobre empresas suíças.',
      ar: 'احصل على رؤى متميزة، وبيانات B2B موثوقة، وآخر الأخبار عن الشركات السويسرية.',
      zh: '获取关于瑞士企业的优质洞察、经过验证的 B2B 数据和最新动态。',
      ru: 'Получайте премиум-аналитику, проверенные B2B-данные и свежие новости о швейцарских предприятиях.',
      ja: 'スイス企業に関するプレミアムな洞察、検証済みのB2Bデータ、最新ニュースにアクセス。',
      tr: 'İsviçre işletmeleri hakkında premium analizlere, doğrulanmış B2B verilerine ve en son haberlere erişin.',
      nl: 'Toegang tot premium inzichten, geverifieerde B2B-gegevens en het laatste nieuws over Zwitserse ondernemingen.',
      pl: 'Dostęp do analiz premium, zweryfikowanych danych B2B i najnowszych wiadomości o szwajcarskich przedsiębiorstwach.',
      ko: '스위스 기업에 대한 프리미엄 인사이트, 검증된 B2B 데이터 및 최신 뉴스에 액세스하세요.',
      sv: 'Få tillgång till premiuminsikter, verifierad B2B-data och de senaste nyheterna om schweiziska företag.',
      da: 'Få adgang til premium indsigt, verificerede B2B-data og de seneste nyheder om schweiziske virksomheder.',
      fi: 'Pääsy premium-tietohin, vahvistettuihin B2B-tietoihin ja viimeisimpiin uutisiin sveitsiläisistä yrityksistä.'
    },
    'button_browse': { de: 'Unternehmen durchsuchen', fr: 'Parcourir les entreprises', en: 'Browse Companies', it: 'Sfoglia Aziende', rm: 'Navigar interpresas', es: 'Buscar Empresas', pt: 'Navegar Empresas', ar: 'تصفح الشركات', zh: '浏览企业', ru: 'Каталог компаний', ja: '企業を閲覧', tr: 'Şirketleri İncele', nl: 'Bedrijven Bekijken', pl: 'Przeglądaj Firmy', ko: '기업 찾아보기', sv: 'Sök företag', da: 'Gennemse virksomheder', fi: 'Selaa yrityksiä' },
    'button_latest_news': { de: 'Neueste Nachrichten', fr: 'Dernières actualités', en: 'Latest News', it: 'Ultime Notizie', rm: 'Novitats actualas', es: 'Últimas Noticias', pt: 'Últimas Notícias', ar: 'آخر الأخبار', zh: '最新动态', ru: 'Последние новости', ja: '最新ニュース', tr: 'Son Haberler', nl: 'Laatste Nieuws', pl: 'Najnowsze Wiadomości', ko: '최신 뉴스', sv: 'Senaste nyheterna', da: 'Seneste nyheder', fi: 'Viimeisimmät uutiset' },
    // Hero platform label
    'hero_platform_label': { de: '🇨🇭 Schweizer Privatsektor-Plattform', fr: '🇨🇭 Plateforme du secteur privé suisse', en: '🇨🇭 Switzerland\'s Private Sector Platform', it: '🇨🇭 Piattaforma del settore privato svizzero', rm: '🇨🇭 Plattafurma dal sectur privat svizzer', es: '🇨🇭 Plataforma del sector privado suizo', pt: '🇨🇭 Plataforma do setor privado suíço', ar: '🇨🇭 منصة القطاع الخاص السويسري', zh: '🇨🇭 瑞士私营部门平台', ru: '🇨🇭 Платформа частного сектора Швейцарии', ja: '🇨🇭 スイス民間部門プラットフォーム', tr: '🇨🇭 İsviçre Özel Sektör Platformu', nl: '🇨🇭 Platform voor de Zwitserse privésector', pl: '🇨🇭 Platforma sektora prywatnego Szwajcarii', ko: '🇨🇭 스위스 민간 부문 플랫폼', sv: '🇨🇭 Schweiziska privata sektorn-plattformen', da: '🇨🇭 Schweizisk privat sektor platform', fi: '🇨🇭 Sveitsin yksityisen sektorin alusta' },
    // Footer
    'footer_desc': { de: 'Schweizer Wirtschafts- und B2B-Datenplattform. Verifizierte Informationen zu Unternehmen, Marktzahlen und Analysen.', fr: 'Plateforme suisse de données économiques et B2B. Informations vérifiées sur les entreprises, les chiffres du marché et les analyses.', en: 'Swiss business and B2B data platform. Verified information on companies, market data, and analyses.', it: 'Piattaforma svizzera di dati economici e B2B. Informazioni verificate su aziende, dati di mercato e analisi.', rm: 'Plattafurma svizra da datas economicas e B2B. Infurmaziuns verifichadas davart interpresas, datas dal martgà e analisas.', es: 'Plataforma suiza de datos comerciales y B2B. Información verificada sobre empresas, datos de mercado y análisis.', pt: 'Plataforma suíça de dados comerciais e B2B. Informações verificadas sobre empresas, dados de mercado e análises.', ar: 'منصة البيانات التجارية السويسرية وB2B. معلومات موثقة عن الشركات وبيانات السوق والتحليلات.', zh: '瑞士商业和B2B数据平台。经过验证的企业信息、市场数据和分析。', ru: 'Швейцарская платформа бизнес- и B2B-данных. Верифицированная информация о компаниях, рыночных данных и аналитике.', ja: 'スイスのビジネスおよびB2Bデータプラットフォーム。企業、市場データ、分析に関する検証済みの情報。', tr: 'İsviçre iş ve B2B veri platformu. Şirketler, pazar verileri ve analizler hakkında doğrulanmış bilgiler.', nl: 'Zwitsers zakelijk en B2B-dataplatform. Geverifieerde informatie over bedrijven, marktgegevens en analyses.', pl: 'Szwajcarska platforma danych biznesowych i B2B. Zweryfikowane informacje o firmach, danych rynkowych i analizach.', ko: '스위스 비즈니스 및 B2B 데이터 플랫폼. 기업, 시장 데이터 및 분석에 대한 검증된 정보.', sv: 'Schweizisk affärs- och B2B-dataplattform. Verifierad information om företag, marknadsdata och analyser.', da: 'Schweizisk forretnings- og B2B-dataplatform. Verificerede oplysninger om virksomheder, markedsdata og analyser.', fi: 'Sveitsiläinen liiketoiminta- ja B2B-tietoalusta. Vahvistettua tietoa yrityksistä, markkinadatasta ja analyyseista.' },
    'footer_directory': { de: 'Verzeichnis', fr: 'Annuaire', en: 'Directory', it: 'Elenco', rm: 'Register', es: 'Directorio', pt: 'Diretório', ar: 'الدليل', zh: '目录', ru: 'Каталог', ja: 'ディレクトリ', tr: 'Dizin', nl: 'Map', pl: 'Katalog', ko: '디렉토리', sv: 'Katalog', da: 'Katalog', fi: 'Hakemisto' },
    'footer_search_companies': { de: 'Unternehmen suchen', fr: 'Rechercher des entreprises', en: 'Search Companies', it: 'Cerca aziende', rm: 'Tschertgar interpresas', es: 'Buscar empresas', pt: 'Pesquisar empresas', ar: 'البحث عن شركات', zh: '搜索企业', ru: 'Поиск компаний', ja: '企業を検索', tr: 'Şirket ara', nl: 'Bedrijven zoeken', pl: 'Szukaj firm', ko: '기업 검색', sv: 'Sök företag', da: 'Søg virksomheder', fi: 'Hae yrityksiä' },
    'footer_verified_partners': { de: 'Verifizierte Partner', fr: 'Partenaires vérifiés', en: 'Verified Partners', it: 'Partner verificati', rm: 'Partenaris verifichads', es: 'Socios verificados', pt: 'Parceiros verificados', ar: 'شركاء موثقون', zh: '认证合作伙伴', ru: 'Верифицированные партнёры', ja: '認証済みパートナー', tr: 'Doğrulanmış ortaklar', nl: 'Geverifieerde partners', pl: 'Zweryfikowani partnerzy', ko: '인증된 파트너', sv: 'Verifierade partners', da: 'Verificerede partnere', fi: 'Vahvistetut kumppanit' },
    'footer_editorial': { de: 'Redaktion', fr: 'Rédaction', en: 'Editorial', it: 'Redazione', rm: 'Redacziun', es: 'Redacción', pt: 'Redação', ar: 'التحرير', zh: '编辑部', ru: 'Редакция', ja: '編集部', tr: 'Editöryel', nl: 'Redactie', pl: 'Redakcja', ko: '편집부', sv: 'Redaktion', da: 'Redaktion', fi: 'Toimitus' },
    'footer_reports': { de: 'Wirtschaftsberichte', fr: 'Rapports économiques', en: 'Business Reports', it: 'Rapporti economici', rm: 'Rapports economics', es: 'Informes económicos', pt: 'Relatórios econômicos', ar: 'التقارير الاقتصادية', zh: '商业报告', ru: 'Бизнес-отчёты', ja: 'ビジネスレポート', tr: 'İş Raporları', nl: 'Zakelijke rapporten', pl: 'Raporty biznesowe', ko: '비즈니스 보고서', sv: 'Affärsrapporter', da: 'Forretningsrapporter', fi: 'Liiketoimintaraportit' },
    'footer_ceo_interviews': { de: 'CEO-Interviews', fr: 'Interviews de PDG', en: 'CEO Interviews', it: 'Interviste ai CEO', rm: 'Interviews cun CEOs', es: 'Entrevistas a CEO', pt: 'Entrevistas com CEOs', ar: 'مقابلات الرؤساء التنفيذيين', zh: 'CEO专访', ru: 'Интервью с CEO', ja: 'CEO インタビュー', tr: 'CEO Röportajları', nl: 'CEO-interviews', pl: 'Wywiady z CEO', ko: 'CEO 인터뷰', sv: 'VD-intervjuer', da: 'CEO-interviews', fi: 'Toimitusjohtajahaastattelut' },
    'footer_podcasts': { de: 'Wirtschafts-Podcasts', fr: 'Podcasts économiques', en: 'Business Podcasts', it: 'Podcast economici', rm: 'Podcasts economics', es: 'Podcasts empresariales', pt: 'Podcasts de negócios', ar: 'بودكاست الأعمال', zh: '商业播客', ru: 'Бизнес-подкасты', ja: 'ビジネスポッドキャスト', tr: 'İş Podcast\'leri', nl: 'Zakelijke podcasts', pl: 'Podcasty biznesowe', ko: '비즈니스 팟캐스트', sv: 'Affärspodcaster', da: 'Erhvervspodcasts', fi: 'Liiketoimintapodcastit' },
    'footer_console': { de: 'Konsole', fr: 'Console', en: 'Console', it: 'Console', rm: 'Consola', es: 'Consola', pt: 'Console', ar: 'وحدة التحكم', zh: '控制台', ru: 'Консоль', ja: 'コンソール', tr: 'Konsol', nl: 'Console', pl: 'Konsola', ko: '콘솔', sv: 'Konsol', da: 'Konsol', fi: 'Konsoli' },
    'footer_stats_heatmaps': { de: 'Statistiken & Heatmaps', fr: 'Statistiques & Cartes thermiques', en: 'Statistics & Heatmaps', it: 'Statistiche e mappe di calore', rm: 'Statisticas & heatmaps', es: 'Estadísticas y mapas de calor', pt: 'Estatísticas e mapas de calor', ar: 'الإحصائيات وخرائط الحرارة', zh: '统计数据和热力图', ru: 'Статистика и тепловые карты', ja: '統計とヒートマップ', tr: 'İstatistikler ve Isı Haritaları', nl: 'Statistieken en heatmaps', pl: 'Statystyki i mapy ciepła', ko: '통계 및 히트맵', sv: 'Statistik och värmekartor', da: 'Statistik og varmekort', fi: 'Tilastot ja lämpökartat' },
    'footer_supported_langs': { de: 'Unterstützte Sprachen', fr: 'Langues prises en charge', en: 'Supported Languages', it: 'Lingue supportate', rm: 'Linguas sustegnidas', es: 'Idiomas compatibles', pt: 'Idiomas suportados', ar: 'اللغات المدعومة', zh: '支持的语言', ru: 'Поддерживаемые языки', ja: 'サポートされている言語', tr: 'Desteklenen Diller', nl: 'Ondersteunde talen', pl: 'Obsługiwane języki', ko: '지원 언어', sv: 'Språk som stöds', da: 'Understøttede sprog', fi: 'Tuetut kielet' },
    'footer_rights': { de: '© 2026 privatesector.vitalswiss.ch. Alle Rechte vorbehalten.', fr: '© 2026 privatesector.vitalswiss.ch. Tous droits réservés.', en: '© 2026 privatesector.vitalswiss.ch. All rights reserved.', it: '© 2026 privatesector.vitalswiss.ch. Tutti i diritti riservati.', rm: '© 2026 privatesector.vitalswiss.ch. Tut ils dretgs reservads.', es: '© 2026 privatesector.vitalswiss.ch. Todos los derechos reservados.', pt: '© 2026 privatesector.vitalswiss.ch. Todos os direitos reservados.', ar: '© 2026 privatesector.vitalswiss.ch. جميع الحقوق محفوظة.', zh: '© 2026 privatesector.vitalswiss.ch。保留所有权利。', ru: '© 2026 privatesector.vitalswiss.ch. Все права защищены.', ja: '© 2026 privatesector.vitalswiss.ch. All rights reserved.', tr: '© 2026 privatesector.vitalswiss.ch. Tüm hakları saklıdır.', nl: '© 2026 privatesector.vitalswiss.ch. Alle rechten voorbehouden.', pl: '© 2026 privatesector.vitalswiss.ch. Wszelkie prawa zastrzeżone.', ko: '© 2026 privatesector.vitalswiss.ch. 모든 권리 보유.', sv: '© 2026 privatesector.vitalswiss.ch. Alla rättigheter förbehållna.', da: '© 2026 privatesector.vitalswiss.ch. Alle rettigheder forbeholdes.', fi: '© 2026 privatesector.vitalswiss.ch. Kaikki oikeudet pidätetään.' },
    'footer_compliance': { de: 'Konform mit DSGVO & Schweizer Datenschutzgesetz 🇨🇭', fr: 'Conforme au RGPD et à la loi suisse sur la protection des données 🇨🇭', en: 'GDPR & Swiss Data Protection Act compliant 🇨🇭', it: 'Conforme al GDPR e alla legge svizzera sulla protezione dei dati 🇨🇭', rm: 'Confurm cun GDPR & la lescha svizra da protecziun da datas 🇨🇭', es: 'Cumple con GDPR y la Ley Suiza de Protección de Datos 🇨🇭', pt: 'Em conformidade com GDPR e Lei Suíça de Proteção de Dados 🇨🇭', ar: 'متوافق مع GDPR وقانون حماية البيانات السويسري 🇨🇭', zh: '符合 GDPR 和瑞士数据保护法 🇨🇭', ru: 'Соответствует GDPR и швейцарскому закону о защите данных 🇨🇭', ja: 'GDPR およびスイスデータ保護法に準拠 🇨🇭', tr: 'GDPR ve İsviçre Veri Koruma Kanunu\'na uyumlu 🇨🇭', nl: 'Voldoet aan AVG en Zwitserse gegevensbeschermingswet 🇨🇭', pl: 'Zgodne z RODO i szwajcarską ustawą o ochronie danych 🇨🇭', ko: 'GDPR 및 스위스 데이터 보호법 준수 🇨🇭', sv: 'Överensstämmer med GDPR och schweizisk dataskyddslag 🇨🇭', da: 'I overensstemmelse med GDPR og schweizisk databeskyttelseslov 🇨🇭', fi: 'GDPR:n ja Sveitsin tietosuojalain mukainen 🇨🇭' },
    // Cookie banner
    'cookie_text': { de: 'Wir verwenden Cookies, um Ihre Erfahrung auf privatesector.vitalswiss.ch zu optimieren. Mit der Nutzung der Website stimmen Sie unseren Richtlinien zu.', fr: 'Nous utilisons des cookies pour optimiser votre expérience sur privatesector.vitalswiss.ch. En utilisant le site, vous acceptez nos politiques.', en: 'We use cookies to optimize your experience on privatesector.vitalswiss.ch. By using the website, you agree to our policies.', it: 'Utilizziamo i cookie per ottimizzare la tua esperienza su privatesector.vitalswiss.ch. Utilizzando il sito, accetti le nostre politiche.', rm: 'Nus utilisain cookies per optimisar vossa experientscha sin privatesector.vitalswiss.ch. Cun l\'utilisaziun dal website acceptais Vus nossas directivas.', es: 'Utilizamos cookies para optimizar su experiencia en privatesector.vitalswiss.ch. Al utilizar el sitio web, acepta nuestras políticas.', pt: 'Utilizamos cookies para otimizar sua experiência no privatesector.vitalswiss.ch. Ao usar o site, você concorda com nossas políticas.', ar: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك على privatesector.vitalswiss.ch. باستخدام الموقع، فإنك توافق على سياساتنا.', zh: '我们使用 Cookie 来优化您在 privatesector.vitalswiss.ch 上的体验。使用本网站即表示您同意我们的政策。', ru: 'Мы используем файлы cookie для оптимизации вашего опыта на privatesector.vitalswiss.ch. Используя сайт, вы соглашаетесь с нашей политикой.', ja: 'privatesector.vitalswiss.ch でのご利用体験を最適化するために Cookie を使用しています。ウェブサイトの利用により、当社のポリシーに同意したものとみなされます。', tr: 'privatesector.vitalswiss.ch\'deki deneyiminizi optimize etmek için çerezler kullanıyoruz. Web sitesini kullanarak politikalarımızı kabul etmiş olursunuz.', nl: 'Wij gebruiken cookies om uw ervaring op privatesector.vitalswiss.ch te optimaliseren. Door de website te gebruiken, gaat u akkoord met ons beleid.', pl: 'Używamy plików cookie, aby zoptymalizować Twoje doświadczenie na privatesector.vitalswiss.ch. Korzystając ze strony, akceptujesz nasze zasady.', ko: 'privatesector.vitalswiss.ch에서의 경험을 최적화하기 위해 쿠키를 사용합니다. 웹사이트를 사용하면 당사 정책에 동의하는 것입니다.', sv: 'Vi använder cookies för att optimera din upplevelse på privatesector.vitalswiss.ch. Genom att använda webbplatsen godkänner du våra policyer.', da: 'Vi bruger cookies til at optimere din oplevelse på privatesector.vitalswiss.ch. Ved at bruge websiden accepterer du vores politikker.', fi: 'Käytämme evästeitä optimoidaksemme kokemustasi osoitteessa privatesector.vitalswiss.ch. Käyttämällä verkkosivustoa hyväksyt käytäntömme.' },
    'cookie_accept': { de: 'Einverstanden', fr: 'J\'accepte', en: 'Accept', it: 'Accetto', rm: 'D\'accord', es: 'Aceptar', pt: 'Aceitar', ar: 'موافق', zh: '同意', ru: 'Принять', ja: '同意する', tr: 'Kabul ediyorum', nl: 'Akkoord', pl: 'Akceptuję', ko: '동의', sv: 'Godkänn', da: 'Accepter', fi: 'Hyväksy' },
    // Homepage Graphics
    'canton_distribution': { de: 'Kantonale Verteilung', fr: 'Répartition cantonale', en: 'Canton Distribution', it: 'Distribuzione cantonale', rm: 'Distribuziun chantunaala', es: 'Distribución cantonal', pt: 'Distribuição cantonal', ar: 'توزيع الكانتونات', zh: '州分布', ru: 'Распределение по кантонам', ja: '州別分布', tr: 'Kanton Dağılımı', nl: 'Kantonale verdeling', pl: 'Rozkład kantonalny', ko: '주별 분포', sv: 'Kantonfördelning', da: 'Kantonal fordeling', fi: 'Kantonaalinen jakauma' },
    'canton_desc': { de: 'Erkunden Sie Schweizer Unternehmen nach Kanton. Klicken Sie auf einen Kanton, um den B2B-Index direkt für diese Region zu öffnen.', fr: 'Explorez les entreprises suisses par canton. Cliquez sur un canton pour ouvrir directement l\'index B2B pour cette région.', en: 'Explore Swiss companies by canton. Click on a canton to open the B2B index directly for that region.', it: 'Esplora le aziende svizzere per cantone. Clicca su un cantone per aprire direttamente l\'indice B2B per quella regione.', rm: 'Explorai interpresas svizras tenor chantun. Clicai sin in chantun per avrir l\'index B2B directamain per quella regiun.', es: 'Explore empresas suizas por cantón. Haga clic en un cantón para abrir directamente el índice B2B de esa región.', pt: 'Explore empresas suíças por cantão. Clique em um cantão para abrir diretamente o índice B2B dessa região.', ar: 'استكشف الشركات السويسرية حسب الكانتون. انقر على كانتون لفتح مؤشر B2B مباشرة لتلك المنطقة.', zh: '按州探索瑞士企业。点击某个州即可直接打开该地区的 B2B 索引。', ru: 'Исследуйте швейцарские компании по кантонам. Нажмите на кантон, чтобы открыть B2B-индекс для этого региона.', ja: '州ごとにスイス企業を探索。州をクリックするとその地域のB2Bインデックスが直接開きます。', tr: 'İsviçre şirketlerini kantona göre keşfedin. B2B dizinini doğrudan o bölge için açmak üzere bir kantona tıklayın.', nl: 'Verken Zwitserse bedrijven per kanton. Klik op een kanton om direct de B2B-index voor die regio te openen.', pl: 'Przeglądaj firmy szwajcarskie według kantonu. Kliknij kanton, aby otworzyć indeks B2B bezpośrednio dla tego regionu.', ko: '주별로 스위스 기업을 탐색하세요. 주를 클릭하면 해당 지역의 B2B 지수가 바로 열립니다.', sv: 'Utforska schweiziska företag per kanton. Klicka på en kanton för att öppna B2B-indexet direkt för den regionen.', da: 'Udforsk schweiziske virksomheder efter kanton. Klik på en kanton for at åbne B2B-indekset direkte for den region.', fi: 'Tutustu sveitsiläisiin yrityksiin kantoneittain. Napsauta kantonia avataksesi B2B-indeksin suoraan kyseiselle alueelle.' },
    'companies_label': { de: 'Firmen', fr: 'Entreprises', en: 'Companies', it: 'Aziende', rm: 'Firmas', es: 'Empresas', pt: 'Empresas', ar: 'شركات', zh: '企业', ru: 'Компании', ja: '企業', tr: 'Şirketler', nl: 'Bedrijven', pl: 'Firmy', ko: '기업', sv: 'Företag', da: 'Virksomheder', fi: 'Yritykset' },
    'gdp_share': { de: 'Schweizer BIP Anteil:', fr: 'Part du PIB suisse:', en: 'Swiss GDP Share:', it: 'Quota PIL svizzero:', rm: 'Part dal PIB svizzer:', es: 'Participación PIB suizo:', pt: 'Participação PIB suíço:', ar: 'حصة الناتج المحلي السويسري:', zh: '瑞士GDP占比：', ru: 'Доля ВВП Швейцарии:', ja: 'スイスGDP占有率：', tr: 'İsviçre GSYİH Payı:', nl: 'Zwitsers BBP-aandeel:', pl: 'Udział w PKB Szwajcarii:', ko: '스위스 GDP 비중:', sv: 'Schweizisk BNP-andel:', da: 'Schweizisk BNP-andel:', fi: 'Sveitsin BKT-osuus:' },
    'register_live_title': { de: 'Handelsregister Live-Meldungen', fr: 'Registre du commerce en direct', en: 'Commercial Register Live Feed', it: 'Registro di commercio in diretta', rm: 'Register da commerzi live', es: 'Registro comercial en vivo', pt: 'Registro comercial ao vivo', ar: 'سجل التجارة المباشر', zh: '商业登记实时消息', ru: 'Торговый реестр в реальном времени', ja: '商業登記ライブフィード', tr: 'Ticaret Sicili Canlı Akışı', nl: 'Handelsregister live', pl: 'Rejestr handlowy na żywo', ko: '상업 등기부 실시간 피드', sv: 'Handelsregister i realtid', da: 'Handelsregister live', fi: 'Kaupparekisterin suora syöte' },
    'register_live_desc': { de: 'Echtzeit-Meldungen der kantonalen Handelsregisterämter (Zefix / SOGC Schnittstellen-Simulation).', fr: 'Notifications en temps réel des registres du commerce cantonaux (simulation d\'interface Zefix / SOGC).', en: 'Real-time notifications from cantonal commercial register offices (Zefix / SOGC interface simulation).', it: 'Notifiche in tempo reale degli uffici del registro di commercio cantonali (simulazione interfaccia Zefix / SOGC).', rm: 'Communicaziuns en temp real dals uffizis dal register da commerzi chantunalas (simulaziun interfatscha Zefix / SOGC).', es: 'Notificaciones en tiempo real de las oficinas del registro comercial cantonal (simulación de interfaz Zefix / SOGC).', pt: 'Notificações em tempo real dos registros comerciais cantonais (simulação de interface Zefix / SOGC).', ar: 'إشعارات في الوقت الفعلي من مكاتب السجل التجاري الكانتوني (محاكاة واجهة Zefix / SOGC).', zh: '州级商业登记机构的实时通知（Zefix / SOGC 接口模拟）。', ru: 'Уведомления в реальном времени от кантональных коммерческих реестров (симуляция интерфейса Zefix / SOGC).', ja: '州商業登記局からのリアルタイム通知（Zefix / SOGC インターフェースシミュレーション）。', tr: 'Kanton ticaret sicil dairelerinden gerçek zamanlı bildirimler (Zefix / SOGC arayüz simülasyonu).', nl: 'Realtime meldingen van kantonnale handelsregisterbureaus (Zefix / SOGC-interfacesimulatie).', pl: 'Powiadomienia w czasie rzeczywistym z kantonalnych biur rejestru handlowego (symulacja interfejsu Zefix / SOGC).', ko: '주 상업 등기 사무소의 실시간 알림(Zefix / SOGC 인터페이스 시뮬레이션).', sv: 'Realtidsmeddelanden från kantonala handelsregistermyndigheter (Zefix / SOGC-gränssnittssimulering).', da: 'Realtidsmeddelelser fra kantonnale handelsregistermyndigheder (Zefix / SOGC-grænsefladsimulering).', fi: 'Reaaliaikaiset ilmoitukset kantonien kaupparekisteritoimistoilta (Zefix / SOGC -rajapintasimulaatio).' },
    'network_title': { de: 'Konzerne & Beteiligungen Mapping', fr: 'Cartographie des groupes et participations', en: 'Corporate Groups & Participations Map', it: 'Mappatura gruppi e partecipazioni', rm: 'Mapping da concerns & participaziuns', es: 'Mapa de grupos corporativos y participaciones', pt: 'Mapa de grupos corporativos e participações', ar: 'خريطة المجموعات والمساهمات', zh: '企业集团与参股关系图', ru: 'Карта корпоративных групп и долей участия', ja: 'コーポレートグループ＆出資マップ', tr: 'Şirket Grupları ve Katılımlar Haritası', nl: 'Kaart van bedrijfsgroepen en deelnemingen', pl: 'Mapa grup korporacyjnych i udziałów', ko: '기업 그룹 및 지분 지도', sv: 'Karta över koncerner och andelar', da: 'Koncernkort og deltagelseskort', fi: 'Konsernikartta ja omistuskartta' },
    'network_desc': { de: 'Interaktive Visualisierung von Firmenstrukturen. Bewegen Sie den Mauszeiger über eine Einheit, um Eigentumsverhältnisse und Stimmrechtsanteile aufzudecken.', fr: 'Visualisation interactive des structures d\'entreprise. Survolez une entité pour révéler les relations de propriété et les droits de vote.', en: 'Interactive visualization of corporate structures. Hover over an entity to reveal ownership relationships and voting rights.', it: 'Visualizzazione interattiva delle strutture aziendali. Passa il mouse su un\'entità per rivelare le relazioni di proprietà e i diritti di voto.', rm: 'Visualisaziun interactiva da structuras da firmas. Mova il cursor sur in\'entitad per manifestar relaziuns da proprietà e dretgs da votaziun.', es: 'Visualización interactiva de estructuras corporativas. Pase el cursor sobre una entidad para revelar relaciones de propiedad y derechos de voto.', pt: 'Visualização interativa de estruturas corporativas. Passe o mouse sobre uma entidade para revelar relações de propriedade e direitos de voto.', ar: 'تصور تفاعلي لهياكل الشركات. حرّك المؤشر فوق كيان لكشف علاقات الملكية وحقوق التصويت.', zh: '企业结构的交互式可视化。将鼠标悬停在实体上以显示所有权关系和投票权。', ru: 'Интерактивная визуализация корпоративных структур. Наведите курсор на объект, чтобы увидеть структуру собственности и доли голосов.', ja: '企業構造のインタラクティブな可視化。エンティティにカーソルを合わせると所有関係と議決権が表示されます。', tr: 'Şirket yapılarının etkileşimli görselleştirmesi. Mülkiyet ilişkilerini ve oy haklarını ortaya çıkarmak için bir varlığın üzerine gelin.', nl: 'Interactieve visualisatie van bedrijfsstructuren. Beweeg over een entiteit om eigendomsrelaties en stemrechten te onthullen.', pl: 'Interaktywna wizualizacja struktur korporacyjnych. Najedź kursorem na podmiot, aby ujawnić relacje własnościowe i prawa głosu.', ko: '기업 구조의 인터랙티브 시각화. 엔터티 위에 커서를 올려 소유 관계와 의결권을 확인하세요.', sv: 'Interaktiv visualisering av företagsstrukturer. Håll muspekaren över en enhet för att avslöja ägandeförhållanden och rösträtt.', da: 'Interaktiv visualisering af virksomhedsstrukturer. Hold musen over en enhed for at afsløre ejerforhold og stemmerettigheder.', fi: 'Yritysrakenteiden interaktiivinen visualisointi. Vie hiiri entiteetin päälle paljastaaksesi omistussuhteet ja äänioikeudet.' },
    'market_indicators': { de: 'Schweizer Marktindikatoren', fr: 'Indicateurs du marché suisse', en: 'Swiss Market Indicators', it: 'Indicatori del mercato svizzero', rm: 'Indicaturs dal martgà svizzer', es: 'Indicadores del mercado suizo', pt: 'Indicadores do mercado suíço', ar: 'مؤشرات السوق السويسرية', zh: '瑞士市场指标', ru: 'Индикаторы швейцарского рынка', ja: 'スイス市場指標', tr: 'İsviçre Piyasa Göstergeleri', nl: 'Zwitserse marktindicatoren', pl: 'Wskaźniki rynku szwajcarskiego', ko: '스위스 시장 지표', sv: 'Schweiziska marknadsindikatorer', da: 'Schweiziske markedsindikatorer', fi: 'Sveitsin markkinaindikaattorit' },
    'market_indicators_desc': { de: 'Wirtschaftliche Kennzahlen und Vertrauensindizes der eingetragenen Schweizer Kapitalgesellschaften.', fr: 'Indicateurs économiques clés et indices de confiance des sociétés de capitaux suisses enregistrées.', en: 'Key economic figures and trust indices of registered Swiss corporations.', it: 'Indicatori economici chiave e indici di fiducia delle società di capitali svizzere registrate.', rm: 'Cifras economicas clavs e indischs da confidenza da las societads da capital svizras registradas.', es: 'Cifras económicas clave e índices de confianza de las sociedades de capital suizas registradas.', pt: 'Indicadores econômicos-chave e índices de confiança de sociedades de capital suíças registradas.', ar: 'مؤشرات اقتصادية رئيسية ومؤشرات ثقة الشركات السويسرية المسجلة.', zh: '瑞士注册资本公司的关键经济指标和信任指数。', ru: 'Ключевые экономические показатели и индексы доверия зарегистрированных швейцарских корпораций.', ja: '登録済みスイス資本会社の主要経済指標と信頼指数。', tr: 'Kayıtlı İsviçre sermaye şirketlerinin temel ekonomik göstergeleri ve güven endeksleri.', nl: 'Belangrijke economische cijfers en vertrouwensindexen van geregistreerde Zwitserse vennootschappen.', pl: 'Kluczowe wskaźniki ekonomiczne i indeksy zaufania zarejestrowanych szwajcarskich spółek kapitałowych.', ko: '등록된 스위스 법인의 주요 경제 지표 및 신뢰 지수.', sv: 'Viktiga ekonomiska nyckeltal och förtroendeindex för registrerade schweiziska bolag.', da: 'Vigtige økonomiske nøgletal og tillidsindekser for registrerede schweiziske selskaber.', fi: 'Rekisteröityjen sveitsiläisten pääomayhtiöiden keskeiset taloustunnusluvut ja luottamusindeksit.' },
    // Company Card
    'card_founded': { de: 'Gegr.', fr: 'Fond.', en: 'Est.', it: 'Fond.', rm: 'Fund.', es: 'Fund.', pt: 'Fund.', ar: 'تأسست', zh: '成立', ru: 'Осн.', ja: '設立', tr: 'Kur.', nl: 'Opg.', pl: 'Zał.', ko: '설립', sv: 'Grd.', da: 'Grd.', fi: 'Per.' },
    'card_view_profile': { de: 'Profile ansehen →', fr: 'Voir le profil →', en: 'View Profile →', it: 'Vedi profilo →', rm: 'Vesair il profil →', es: 'Ver perfil →', pt: 'Ver perfil →', ar: 'عرض الملف الشخصي →', zh: '查看简介 →', ru: 'Просмотр профиля →', ja: 'プロフィールを見る →', tr: 'Profili görüntüle →', nl: 'Profiel bekijken →', pl: 'Zobacz profil →', ko: '프로필 보기 →', sv: 'Visa profil →', da: 'Vis profil →', fi: 'Näytä profiili →' },
    // Breaking news marquee
    'marquee_text': { de: '+++ Schweizer Bundesrat kündigt steuerliche Entlastungen für private R&D-Hubs an +++ Nestlé weitet Nachhaltigkeitsaudits in landwirtschaftlichen Lieferketten aus +++ UBS erhält Freigabe für Pilotprojekt zu tokenisierten Anleihen in Genf +++', fr: '+++ Le Conseil fédéral suisse annonce des allègements fiscaux pour les centres de R&D privés +++ Nestlé étend les audits de durabilité dans les chaînes d\'approvisionnement agricoles +++ UBS obtient l\'autorisation pour un projet pilote d\'obligations tokenisées à Genève +++', en: '+++ Swiss Federal Council announces tax relief for private R&D hubs +++ Nestlé expands sustainability audits across agricultural supply chains +++ UBS receives approval for tokenized bond pilot project in Geneva +++', it: '+++ Il Consiglio federale svizzero annuncia agevolazioni fiscali per gli hub di R&S privati +++ Nestlé espande gli audit di sostenibilità nelle filiere agricole +++ UBS riceve l\'approvazione per il progetto pilota di obbligazioni tokenizzate a Ginevra +++', rm: '+++ Il Cussegl federal svizzer annunzia facilitaziuns fiscalas per hubs da R&D privats +++ Nestlé extenda ils audits da durablezia en las chadainas da furniziun agraricas +++ UBS survegn il permiss per in project pilot d\'obligaziuns tokenisadas a Genevra +++', es: '+++ El Consejo Federal Suizo anuncia desgravaciones fiscales para centros de I+D privados +++ Nestlé amplía las auditorías de sostenibilidad en las cadenas de suministro agrícolas +++ UBS recibe aprobación para proyecto piloto de bonos tokenizados en Ginebra +++', pt: '+++ O Conselho Federal Suíço anuncia benefícios fiscais para hubs de P&D privados +++ Nestlé amplia auditorias de sustentabilidade nas cadeias agrícolas +++ UBS recebe aprovação para projeto piloto de títulos tokenizados em Genebra +++', ar: '+++ المجلس الاتحادي السويسري يعلن عن تخفيضات ضريبية لمراكز البحث والتطوير الخاصة +++ نستله توسع عمليات تدقيق الاستدامة في سلاسل التوريد الزراعية +++ UBS يحصل على موافقة لمشروع تجريبي للسندات الرقمية في جنيف +++', zh: '+++ 瑞士联邦委员会宣布对私营研发中心减税 +++ 雀巢扩大农业供应链可持续性审计 +++ 瑞银在日内瓦获批代币化债券试点项目 +++', ru: '+++ Федеральный совет Швейцарии объявляет о налоговых льготах для частных R&D-центров +++ Nestlé расширяет аудиты устойчивости в сельскохозяйственных цепочках поставок +++ UBS получает одобрение на пилотный проект токенизированных облигаций в Женеве +++', ja: '+++ スイス連邦評議会が民間R&Dハブの税軽減を発表 +++ ネスレが農業サプライチェーンの持続可能性監査を拡大 +++ UBSがジュネーブでトークン化債券のパイロットプロジェクトの承認を取得 +++', tr: '+++ İsviçre Federal Konseyi özel Ar-Ge merkezleri için vergi indirimi açıkladı +++ Nestlé tarımsal tedarik zincirlerinde sürdürülebilirlik denetimlerini genişletiyor +++ UBS Cenevre\'de tokenize tahvil pilot projesi için onay aldı +++', nl: '+++ De Zwitserse Bondsraad kondigt belastingverlichting aan voor private R&D-hubs +++ Nestlé breidt duurzaamheidsaudits uit in agrarische toeleveringsketens +++ UBS krijgt goedkeuring voor tokenized obligatie-pilotproject in Genève +++', pl: '+++ Szwajcarska Rada Federalna ogłasza ulgi podatkowe dla prywatnych centrów R&D +++ Nestlé rozszerza audyty zrównoważonego rozwoju w łańcuchach dostaw rolnictwa +++ UBS uzyskuje zgodę na pilotażowy projekt tokenizowanych obligacji w Genewie +++', ko: '+++ 스위스 연방의회, 민간 R&D 허브 세금 감면 발표 +++ 네슬레, 농업 공급망 지속가능성 감사 확대 +++ UBS, 제네바에서 토큰화 채권 파일럿 프로젝트 승인 +++', sv: '+++ Schweiziska förbundsrådet meddelar skattelättnader för privata FoU-hubbar +++ Nestlé utökar hållbarhetsrevisioner i jordbruksleverantörskedjor +++ UBS får godkännande för pilotprojekt med tokeniserade obligationer i Genève +++', da: '+++ Det schweiziske forbundsråd annoncerer skattelettelser for private F&U-centre +++ Nestlé udvider bæredygtighedsrevisioner i landbrugsforsyningskæder +++ UBS modtager godkendelse til tokeniseret obligationspilotprojekt i Genève +++', fi: '+++ Sveitsin liittoneuvosto ilmoittaa verohelpotuksista yksityisille T&K-keskuksille +++ Nestlé laajentaa kestävyystarkastuksia maataloustoimitusketjuissa +++ UBS saa hyväksynnän tokenisoidun joukkovelkakirjan pilottiprojektille Genevessä +++' },
    // Market Stat Cards
    'stat_b2b_trust_title': { de: 'B2B Vertrauensindex (Verifiziert)', fr: 'Indice de confiance B2B (Vérifié)', en: 'B2B Trust Index (Verified)', it: 'Indice di fiducia B2B (Verificato)', rm: 'Index da confidenza B2B (Verifichà)', es: 'Índice de confianza B2B (Verificado)', pt: 'Índice de confiança B2B (Verificado)', ar: 'مؤشر ثقة B2B (موثق)', zh: 'B2B 信任指数（已验证）', ru: 'Индекс доверия B2B (Верифицировано)', ja: 'B2B 信頼指数（検証済み）', tr: 'B2B Güven Endeksi (Doğrulanmış)', nl: 'B2B Vertrouwensindex (Geverifieerd)', pl: 'Indeks zaufania B2B (Zweryfikowany)', ko: 'B2B 신뢰 지수 (검증)', sv: 'B2B Förtroendeindex (Verifierat)', da: 'B2B Tillidsindeks (Verificeret)', fi: 'B2B Luottamusindeksi (Vahvistettu)' },
    'stat_b2b_trust_desc': { de: '94% aller Premium-Profile verfügen über vollständig verifizierte Zefix-Dossiers.', fr: '94 % de tous les profils premium disposent de dossiers Zefix entièrement vérifiés.', en: '94% of all premium profiles have fully verified Zefix dossiers.', it: 'Il 94% di tutti i profili premium dispone di dossier Zefix completamente verificati.', rm: '94% da tut ils profils premium han dossiers Zefix cumplettamain verifichads.', es: 'El 94% de todos los perfiles premium tienen expedientes Zefix completamente verificados.', pt: '94% de todos os perfis premium possuem dossiês Zefix completamente verificados.', ar: '94% من جميع الملفات الشخصية المميزة لديها ملفات Zefix تم التحقق منها بالكامل.', zh: '94% 的高级配置文件拥有经过完全验证的 Zefix 档案。', ru: '94% всех премиум-профилей имеют полностью верифицированные досье Zefix.', ja: 'すべてのプレミアムプロフィールの94%が完全に検証されたZefix書類を保有しています。', tr: 'Tüm premium profillerin %94\'ü tamamen doğrulanmış Zefix dosyalarına sahiptir.', nl: '94% van alle premium-profielen beschikt over volledig geverifieerde Zefix-dossiers.', pl: '94% wszystkich profili premium posiada w pełni zweryfikowane akta Zefix.', ko: '모든 프리미엄 프로필의 94%가 완전히 검증된 Zefix 서류를 보유하고 있습니다.', sv: '94% av alla premiumprofiler har fullt verifierade Zefix-dossier.', da: '94% af alle premium-profiler har fuldt verificerede Zefix-dossier.', fi: '94% kaikista premium-profiileista on täysin vahvistetut Zefix-tiedostot.' },
    'stat_sustainability_title': { de: 'Nachhaltigkeits-Reporting', fr: 'Reporting de durabilité', en: 'Sustainability Reporting', it: 'Reporting di sostenibilità', rm: 'Reporting da durablezia', es: 'Informes de sostenibilidad', pt: 'Relatórios de sustentabilidade', ar: 'تقارير الاستدامة', zh: '可持续发展报告', ru: 'Отчётность по устойчивому развитию', ja: 'サステナビリティ報告', tr: 'Sürdürülebilirlik Raporlaması', nl: 'Duurzaamheidsrapportage', pl: 'Raportowanie zrównoważonego rozwoju', ko: '지속가능성 보고', sv: 'Hållbarhetsrapportering', da: 'Bæredygtighedsrapportering', fi: 'Kestävyysraportointi' },
    'stat_sustainability_desc': { de: '78% der Top-100 Schweizer Grosskonzerne weisen validierte ESG-Scores über 75/100 auf.', fr: '78 % des 100 plus grands groupes suisses affichent des scores ESG validés supérieurs à 75/100.', en: '78% of the top 100 Swiss corporations have validated ESG scores above 75/100.', it: 'Il 78% delle prime 100 grandi aziende svizzere presenta punteggi ESG validati superiori a 75/100.', rm: '78% dals top-100 concerns svizzers muossan ESG-scores validads sur 75/100.', es: 'El 78% de las 100 principales corporaciones suizas tienen puntuaciones ESG validadas superiores a 75/100.', pt: '78% das 100 maiores corporações suíças têm pontuações ESG validadas acima de 75/100.', ar: '78% من أفضل 100 شركة سويسرية لديها درجات ESG معتمدة أعلى من 75/100.', zh: '瑞士前100大企业中78%的ESG评分经验证超过75/100。', ru: '78% из топ-100 швейцарских корпораций имеют валидированные ESG-оценки выше 75/100.', ja: 'スイスのトップ100企業の78%が75/100を超える検証済みESGスコアを持っています。', tr: 'En büyük 100 İsviçre şirketinin %78\'i 75/100\'ün üzerinde doğrulanmış ESG puanlarına sahiptir.', nl: '78% van de top 100 Zwitserse bedrijven heeft gevalideerde ESG-scores boven 75/100.', pl: '78% ze 100 największych szwajcarskich korporacji ma zwalidowane wyniki ESG powyżej 75/100.', ko: '스위스 상위 100대 기업의 78%가 75/100을 초과하는 검증된 ESG 점수를 보유하고 있습니다.', sv: '78% av de 100 största schweiziska företagen har validerade ESG-poäng över 75/100.', da: '78% af de 100 største schweiziske virksomheder har validerede ESG-scores over 75/100.', fi: '78% Sveitsin 100 suurimmasta yrityksestä on vahvistetut ESG-pisteet yli 75/100.' },
    'stat_rd_title': { de: 'R&D Standortattraktivität', fr: 'Attractivité des sites de R&D', en: 'R&D Location Attractiveness', it: 'Attrattività delle sedi R&S', rm: 'Attractivitad da plazzas da R&D', es: 'Atractivo de ubicaciones de I+D', pt: 'Atratividade de locais de P&D', ar: 'جاذبية مواقع البحث والتطوير', zh: '研发地点吸引力', ru: 'Привлекательность R&D-локаций', ja: 'R&D 立地魅力', tr: 'Ar-Ge Lokasyon Çekiciliği', nl: 'R&D-locatieaantrekkelijkheid', pl: 'Atrakcyjność lokalizacji R&D', ko: 'R&D 입지 매력도', sv: 'FoU-platsattraktivitet', da: 'F&U-lokationsattraktivitet', fi: 'T&K-sijaintivetovoima' },
    'stat_rd_desc': { de: '85% der Schweizer R&D-Hubs erhalten Bestbewertungen für steuerliche Rahmenbedingungen.', fr: '85 % des hubs R&D suisses reçoivent les meilleures notes pour le cadre fiscal.', en: '85% of Swiss R&D hubs receive top ratings for tax frameworks.', it: 'L\'85% degli hub R&S svizzeri riceve le migliori valutazioni per i quadri fiscali.', rm: '85% dals hubs da R&D svizzers survegnan las meglras evaluaziuns per las cundiziuns fiscalas.', es: 'El 85% de los centros de I+D suizos reciben las mejores calificaciones por marcos fiscales.', pt: '85% dos centros de P&D suíços recebem classificações máximas para estruturas fiscais.', ar: '85% من مراكز البحث والتطوير السويسرية تحصل على أعلى التصنيفات للأطر الضريبية.', zh: '85% 的瑞士研发中心在税收框架方面获得最高评级。', ru: '85% швейцарских R&D-центров получают высшие оценки за налоговые условия.', ja: 'スイスのR&Dハブの85%が税制面で最高評価を獲得しています。', tr: 'İsviçre Ar-Ge merkezlerinin %85\'i vergi çerçeveleri için en yüksek derecelendirmeleri almaktadır.', nl: '85% van de Zwitserse R&D-hubs krijgt topbeoordelingen voor fiscale kaders.', pl: '85% szwajcarskich centrów R&D otrzymuje najwyższe oceny za ramy podatkowe.', ko: '스위스 R&D 허브의 85%가 세제 프레임워크에서 최고 등급을 받고 있습니다.', sv: '85% av schweiziska FoU-hubbar får toppbetyg för skatteramar.', da: '85% af schweiziske F&U-centre modtager topbedømmelser for skatterammer.', fi: '85% Sveitsin T&K-keskuksista saa parhaat arviot verorakenteista.' }
  };

  const languages = ['de', 'fr', 'en', 'it', 'rm', 'es', 'pt', 'ar', 'zh', 'ru', 'ja', 'tr', 'nl', 'pl', 'ko', 'sv', 'da', 'fi'];

  for (const [key, langObj] of Object.entries(baseUiKeys)) {
    for (const lang of languages) {
      const text = langObj[lang] || langObj['en']; // fallback to english
      const status = (lang === 'de' || lang === 'fr' || lang === 'en') ? 'reviewed' : 'auto-only';
      await dbRun(`
        INSERT INTO translations (language_code, key, translated_text, status)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (language_code, key) 
        DO UPDATE SET translated_text = EXCLUDED.translated_text, status = EXCLUDED.status
      `, [lang, key, text, status]);
    }
  }
}

async function seedInterviews() {
  const interviews = [
    {
      title: 'Shaping the Future of Global Food Systems',
      subtitle: 'Nestlé\'s CEO on portfolio restructuring, sustainability targets, and navigating Swiss-EU supply chain relations.',
      interviewee_name: 'Laurent Freixe',
      interviewee_title: 'CEO, Nestlé S.A.',
      interviewee_avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
      company_id: 1,
      company_name: 'Nestlé S.A.',
      date_published: '2026-06-05',
      read_time_mins: 8,
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      qa_content: JSON.stringify([
        {
          q: 'How is Nestlé adapting its global supply chains to new ESG regulations?',
          a: 'We are investing heavily in local sourcing and carbon-reduction initiatives. In Switzerland and Europe, we are ensuring our agricultural suppliers adhere to strict soil-regeneration practices. By localizing key elements of our supply networks, we reduce transition risks and meet consumer expectations.'
        },
        {
          q: 'What role does Swiss R&D play in Nestlé\'s global strategy?',
          a: 'Switzerland remains our core R&D powerhouse. The expertise we draw from institutions like EPFL and local incubators in Lausanne allows us to pioneer plant-based alternatives and advanced packaging materials. It is a unique ecosystem that cannot easily be replicated elsewhere.'
        },
        {
          q: 'Are we seeing a permanent shift in consumer purchasing power?',
          a: 'Inflation has certainly tested price elasticities, but our focus on premium brands and high-nutrition categories has proven resilient. We see stable volume growth in premium coffees and pet care.'
        }
      ]),
      category: 'Executive Briefing',
      student_author_id: null
    },
    {
      title: 'The Convergence of Diagnostics and Personalized Medicine',
      subtitle: 'How Roche is leveraging AI to accelerate oncology pipelines and clinical trials in Basel.',
      interviewee_name: 'Thomas Schinecker',
      interviewee_title: 'CEO, Roche Holding AG',
      interviewee_avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256',
      company_id: 2,
      company_name: 'Roche Holding AG',
      date_published: '2026-05-28',
      read_time_mins: 10,
      audio_url: null,
      qa_content: JSON.stringify([
        {
          q: 'How is artificial intelligence transforming your oncology drug discovery?',
          a: 'AI is allowing us to simulate molecular interactions at an unprecedented scale. What used to take months of lab screening is now done in hours. This doesn\'t replace clinical testing, but it drastically increases the quality of candidates entering Phase I trials.'
        },
        {
          q: 'Why does Basel remain central to your global pharmaceutical strategy?',
          a: 'Basel offers a dense concentration of academic excellence, regulatory expertise, and skilled talent. The physical proximity between our diagnostics division and our pharmaceutical labs creates a unique feedback loop that accelerates translation.'
        },
        {
          q: 'What is your outlook on Swiss-EU research integration?',
          a: 'It is critical for Switzerland to remain fully associated with Horizon Europe. Science thrives on international collaboration. Restricting talent mobility or funding participation ultimately harms patients globally.'
        }
      ]),
      category: 'Executive Briefing',
      student_author_id: null
    },
    {
      title: 'Preserving Horological Heritage in a Digital Age',
      subtitle: 'Rolex\'s CEO discusses production expansion, certified pre-owned markets, and the timelessness of mechanical craft.',
      interviewee_name: 'Jean-Frédéric Dufour',
      interviewee_title: 'CEO, Rolex SA',
      interviewee_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
      company_id: 5,
      company_name: 'Rolex SA',
      date_published: '2026-05-15',
      read_time_mins: 7,
      audio_url: null,
      qa_content: JSON.stringify([
        {
          q: 'Why is Rolex expanding its manufacturing footprint now?',
          a: 'We are building new production sites in Bulle to meet long-term demand while maintaining our absolute quality standards. We will never compromise on craftsmanship. Every Rolex chronometer must be assembled and tested to our exact tolerances, which takes time.'
        },
        {
          q: 'What was the strategic driver behind the Certified Pre-Owned program?',
          a: 'It provides transparency and authenticity in the secondary market. Clients want to know that their timepiece is genuine and serviced to our standards. It reinforces the lasting value and circularity of our products.'
        },
        {
          q: 'Does smartwatch technology pose a threat to mechanical watchmaking?',
          a: 'Not at all. A mechanical watch is an emotional object, a piece of art, and a repository of history. A digital screen is obsolete in a few years, but a mechanical Rolex is designed to last for generations.'
        }
      ]),
      category: 'Executive Briefing',
      student_author_id: null
    },
    {
      title: 'Navigating Consolidation in Global Wealth Management',
      subtitle: 'UBS CEO Sergio Ermotti discusses the integration of Credit Suisse and regional B2B growth.',
      interviewee_name: 'Sergio Ermotti',
      interviewee_title: 'CEO, UBS Group AG',
      interviewee_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
      company_id: 4,
      company_name: 'UBS Group AG',
      date_published: '2026-06-03',
      read_time_mins: 9,
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      qa_content: JSON.stringify([
        {
          q: 'How is the integration of Credit Suisse progressing for corporate clients?',
          a: 'We have prioritized maintaining stable credit facilities for Swiss SMEs. The integration is moving on schedule, and our combined capabilities allow us to offer institutional-grade services to local businesses looking to expand globally.'
        },
        {
          q: 'Is Switzerland\'s financial competitiveness secure?',
          a: 'Yes, but we must protect our core strengths: stability, a strong currency, and a highly skilled workforce. Embracing digital asset standards while maintaining regulatory rigor is key to staying ahead.'
        }
      ]),
      category: 'Executive Briefing',
      student_author_id: null
    },
    {
      title: 'Zurich Street Buzz: How locals choose their retail banks',
      subtitle: 'We took to the streets of Zurich to ask locals why they choose UBS, PostFinance, or Cantonal Banks.',
      interviewee_name: 'Zurich Public Opinions',
      interviewee_title: 'Street Survey',
      interviewee_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256',
      company_id: null,
      company_name: 'Zurich Street Broadcast',
      date_published: '2026-06-08',
      read_time_mins: 6,
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      qa_content: JSON.stringify([
        {
          q: 'Why do you choose a Cantonal Bank over a major bank like UBS?',
          a: 'Mostly because of the local connection. Cantonal banks invest directly back into regional infrastructure and projects. For personal savings, the state guarantee is also a major trust factor.'
        },
        {
          q: 'Does digital banking technology influence your bank selection?',
          a: 'Absolutely. If the mobile app is slow or clunky, I won\'t use it. Mobile-first Neobanks are gaining a lot of ground among university students because they have zero fees and instant transfers.'
        }
      ]),
      category: 'Street Briefing',
      student_author_id: 1
    },
    {
      title: 'The Rise of Green Industry: Bühler Group\'s Biomass Transition',
      subtitle: 'ETH St. Gallen student analysis of Bühler Group\'s new carbon-neutral biomass grain processing solutions.',
      interviewee_name: 'Stefan Scheiber',
      interviewee_title: 'CEO, Bühler Group',
      interviewee_avatar: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=256',
      company_id: 10,
      company_name: 'Bühler Group',
      date_published: '2026-06-07',
      read_time_mins: 5,
      audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      qa_content: JSON.stringify([
        {
          q: 'How does Bühler help companies reduce their Scope 1 emissions in milling?',
          a: 'Our biomass-powered burners utilize the hulls of processed grain directly to heat the mills. This creates a circular energy system, eliminating the need for fossil natural gas entirely in the drying process.'
        },
        {
          q: 'Is carbon neutrality economically viable for medium-sized mills?',
          a: 'Yes, because agricultural waste is practically free. With energy prices fluctuating, building energy-independent milling plants pays off within three to five years.'
        }
      ]),
      category: 'University Perspective',
      student_author_id: 2
    }
  ];

  for (const iv of interviews) {
    await dbRun(`
      INSERT INTO interviews (
        title, subtitle, interviewee_name, interviewee_title, interviewee_avatar,
        company_id, company_name, date_published, read_time_mins, audio_url, qa_content, category, student_author_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      iv.title, iv.subtitle, iv.interviewee_name, iv.interviewee_title, iv.interviewee_avatar,
      iv.company_id, iv.company_name, iv.date_published, iv.read_time_mins, iv.audio_url, iv.qa_content, iv.category, iv.student_author_id
    ]);
  }
}

async function seedStudentsAndJobs() {
  console.log('Seeding student profiles...');
  const students = [
    {
      name: 'Amina Al-Mansoor',
      university: 'University of St. Gallen (HSG)',
      study_field: 'Banking & Finance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      grad_year: 2027,
      portfolio_url: 'https://hsg-alumni.ch/amina-almansoor',
      bio: 'Honors student in Banking & Finance at HSG. Passionate about Swiss private banking systems and ESG metrics. Research contributor to the Zurich B2B Economic Briefings.',
      email: 'amina.almansoor@student.unisg.ch',
      phone_number: '+41 71 224 21 11',
      birth_date: '2003-04-12',
      skills: JSON.stringify(['Private Banking', 'ESG Analysis', 'Financial Modeling', 'Swiss Tax Law']),
      experience: JSON.stringify([
        { role: 'Summer Analyst', company: 'LGT Bank', duration: '3 months', description: 'Assisted the private banking advisory desk with asset allocation metrics.' },
        { role: 'Research Assistant', company: 'HSG Institute of Finance', duration: '6 months', description: 'Reviewed green bond compliance frameworks in the DACH region.' }
      ])
    },
    {
      name: 'Lukas Keller',
      university: 'ETH Zurich',
      study_field: 'Environmental Engineering & IT',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256',
      grad_year: 2026,
      portfolio_url: 'https://ethz.ch/lukas-keller-sustainability',
      bio: 'Graduate student at ETH Zurich focusing on industrial decarbonization. Specializes in auditing Scope 1 and Scope 2 emissions in Swiss manufacturing systems.',
      email: 'l.keller@student.ethz.ch',
      phone_number: '+41 44 632 11 11',
      birth_date: '2001-11-22',
      skills: JSON.stringify(['Decarbonization', 'Carbon Accounting', 'Python', 'Life Cycle Assessment']),
      experience: JSON.stringify([
        { role: 'ESG Intern', company: 'Bühler Group', duration: '6 months', description: 'Audited carbon offsets and scope 1 emissions for grain milling setups.' },
        { role: 'Project Assistant', company: 'ETH Energy Science Center', duration: '1 year', description: 'Simulated micro-grid electricity sharing models.' }
      ])
    },
    {
      name: 'Elena Rossi',
      university: 'University of Geneva (UNIGE)',
      study_field: 'International Relations & Economics',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
      grad_year: 2027,
      portfolio_url: 'https://unige.ch/elena-rossi-portfolio',
      bio: 'Bilingual economics researcher focused on multilateral trade flows and Swiss pharma expansion in Southeast Asia.',
      email: 'elena.rossi@etu.unige.ch',
      phone_number: '+41 22 379 71 11',
      birth_date: '2002-08-05',
      skills: JSON.stringify(['Macroeconomics', 'International Trade', 'Bilingual (FR/EN)', 'Data Analysis']),
      experience: JSON.stringify([
        { role: 'Trade Policy Intern', company: 'World Trade Organization', duration: '4 months', description: 'Synthesized regional trade agreements databases.' }
      ])
    }
  ];

  for (const s of students) {
    await dbRun(`
      INSERT INTO student_profiles (name, university, study_field, avatar, grad_year, portfolio_url, bio, email, phone_number, birth_date, skills, experience)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [s.name, s.university, s.study_field, s.avatar, s.grad_year, s.portfolio_url, s.bio, s.email, s.phone_number, s.birth_date, s.skills, s.experience]);
  }

  console.log('Seeding job postings...');
  const jobs = [
    {
      title: 'Sustainable Agriculture Analyst (Internship)',
      type: 'Internship',
      description: 'Support Nestlé\'s global ESG compliance team in auditing cocoa supply chains. Ideal for students with environmental sciences or agricultural economics backgrounds.',
      company_id: 1,
      company_name: 'Nestlé S.A.',
      location: 'Vevey, VD',
      apply_url: 'https://nestle.com/careers/sustainable-agri-intern',
      date_posted: '2026-06-08'
    },
    {
      title: 'Wealth Management Trainee',
      type: 'Trainee',
      description: 'Join the UBS Graduate Talent Program in Zurich. Work alongside senior client advisors managing ultra-high-net-worth portfolios across European markets.',
      company_id: 4,
      company_name: 'UBS Group AG',
      location: 'Zurich, ZH',
      apply_url: 'https://ubs.com/careers/wealth-management-trainee',
      date_posted: '2026-06-07'
    },
    {
      title: 'Healthcare Data Analyst (Trainee)',
      type: 'Trainee',
      description: 'Rotational trainee program at Roche HQ in Basel. Analyze clinical trial data pipelines using advanced ML and stats. Requires strong Python/R and biotech interest.',
      company_id: 2,
      company_name: 'Roche Holding AG',
      location: 'Basel, BS',
      apply_url: 'https://roche.com/careers/healthcare-data-trainee',
      date_posted: '2026-06-05'
    },
    {
      title: 'Precision Mechanical Engineer (Internship)',
      type: 'Internship',
      description: 'Hands-on internship at Bühler Group. Design and test carbon-neutral biomass grain processing armatures. Ideal for ETH/EPFL mechanical engineering students.',
      company_id: 10,
      company_name: 'Bühler Group',
      location: 'Uzwil, SG',
      apply_url: 'https://buhlergroup.com/careers/precision-engineer-intern',
      date_posted: '2026-06-06'
    }
  ];

  for (const j of jobs) {
    await dbRun(`
      INSERT INTO jobs (title, type, description, company_id, company_name, location, apply_url, date_posted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [j.title, j.type, j.description, j.company_id, j.company_name, j.location, j.apply_url, j.date_posted]);
  }

  console.log('Updating companies with ESG scores...');
  const esgUpdates = [
    { id: 1, score: 88, summary: 'Nestlé is targeting net-zero emissions by 2050 and uses 100% sustainably sourced cocoa for its Swiss chocolate production.' },
    { id: 2, score: 92, summary: 'Roche ranks as one of the most sustainable pharmaceutical companies, focusing on energy-efficient laboratories and medical waste reduction in Basel.' },
    { id: 3, score: 78, summary: 'Novartis is committed to carbon neutrality in its operations by 2030 and works on green transport fleets for medicines distribution.' },
    { id: 4, score: 85, summary: 'UBS has committed to fully green investment portfolios and has phased out financing for new coal-fired power plants.' },
    { id: 5, score: 62, summary: 'Rolex is expanding green certifications for its watch assembly sites and uses certified ethically-sourced gold.' },
    { id: 10, score: 82, summary: 'Bühler Group plays a key role in global food sustainability, designing plants that cut waste and energy consumption in grain milling by 50%.' },
    { id: 11, score: 84, summary: 'Barry Callebaut is driving the "Forever Chocolate" initiative, aiming to lift cocoa farmers out of poverty and eliminate child labor.' },
    { id: 12, score: 90, summary: 'Swiss Re uses advanced AI-driven climatic modeling to set strict underwriting criteria for eco-friendly infrastructure projects.' }
  ];

  for (const up of esgUpdates) {
    await dbRun('UPDATE companies SET esg_rating = ?, sustainability_summary = ? WHERE id = ?', [up.score, up.summary, up.id]);
  }

  // Set student author on some existing articles
  await dbRun('UPDATE news SET student_author_id = 2 WHERE id IN (4, 11)'); // Lukas Keller authored Bühler Group / ESG transparency articles

  // Run the auto-translation scanner for all database content
  await autoTranslateDatabaseContent();
}

async function autoTranslateDatabaseContent() {
  const stringsToTranslate = new Set();

  // Add English UI keys that need translation
  const newUiKeys = [
    'Zefix Verified',
    'Roche Holding AG (Parent Company)',
    'Genentech Inc. (San Francisco, USA)',
    'Chugai Pharmaceutical Co., Ltd. (Tokyo, Japan)',
    'Roche Diagnostics International AG (Rotkreuz, CH)',
    'Foundation Medicine Inc. (Cambridge, USA)',
    'Focus a node to see details',
    'Consolidates 273,000 employees worldwide.',
    '100% owned. R&D center for oncology.',
    'Strategic partnership (61.5% capital shares).',
    'Central Swiss production and development site.',
    'Acquisition 2018. Genomic profiling.',
    'Shows ownership chains and direct participations.',
    'INTELLIGENCE & ANALYSIS',
    'Sponsored',
    'Click to view profile',
    'Sponsored Spotlight',
    'Discover our premium verified solutions tailored for Swiss industry leaders.',
    'Visit Profile',
    'Featured',
    '✓ Verified Partner',
    'Learn more about the leading B2B financial and reinsurance structures operating out of Zurich.',
    'Explore Corporate Dossier',
    'Sponsored Content',
    "How Switzerland's Private Sector Navigates Evolving Global Compliance Standards",
    'Sponsored by',
    'Google B2B Services',
    "Learn about modern cloud compliance infrastructures designed to align with FINMA's latest technical directives.",
    'Read the Whitepaper ↗',
    'Loading dashboard...',
    'Student Profile Not Found',
    'Go to Careers Center',
    'Student Talent Hub',
    'Welcome, {name}!',
    'View Public Profile',
    'Overview',
    'Edit Profile (LinkedIn Style)',
    'Write Business Article',
    'Dossier Overview',
    'Articles Written',
    'Podcasts & Briefings',
    'My Published Pieces',
    "You haven't published any articles yet. Navigate to 'Write Business Article' to get started!",
    'View Article',
    'University',
    'Field of Study',
    'Graduation Year',
    'Portfolio URL',
    'Avatar Image URL',
    'Email',
    'Phone Number',
    'Birth Date',
    'Bio / Summary',
    'Skills & Endorsements',
    'Add a skill...',
    'Add',
    'Experience & Projects',
    'Remove',
    'Add Experience',
    'Role (e.g. Intern)',
    'Company / University project',
    'Duration (e.g. 3 months)',
    'Description...',
    'Save Changes',
    'Compose Business Article',
    'Title',
    'Swiss watch exports reach historic heights...',
    'Subtitle',
    'Brief summary teaser...',
    'Category',
    'University Perspective',
    'Executive Briefing',
    'Street Briefing',
    'Image URL',
    'Unsplash image URL...',
    'Tags (Comma separated)',
    'Rolex, Richemont, ESG',
    'Pull Quote (Featured text highlight)',
    'Pull quote highlight...',
    'Body Content',
    'Publish Article',
    'Go to Student Talent Dashboard 🚀'
  ];
  for (const k of newUiKeys) {
    stringsToTranslate.add(k.trim());
  }
  for (const k of GERMAN_UI_KEYS) {
    stringsToTranslate.add(k.trim());
  }

  // 1. Companies
  const companies = await dbQuery('SELECT name, canton, industry, size_class, description, revenue_band, about_text, sustainability_summary FROM companies');
  for (const c of companies) {
    if (c.name) stringsToTranslate.add(c.name.trim());
    if (c.canton) stringsToTranslate.add(c.canton.trim());
    if (c.industry) stringsToTranslate.add(c.industry.trim());
    if (c.size_class) stringsToTranslate.add(c.size_class.trim());
    if (c.description) stringsToTranslate.add(c.description.trim());
    if (c.revenue_band) stringsToTranslate.add(c.revenue_band.trim());
    if (c.about_text) stringsToTranslate.add(c.about_text.trim());
    if (c.sustainability_summary) stringsToTranslate.add(c.sustainability_summary.trim());
  }

  // 2. News
  const news = await dbQuery('SELECT title, subtitle, category, author_name, content_body, pull_quote, tags FROM news');
  for (const n of news) {
    if (n.title) stringsToTranslate.add(n.title.trim());
    if (n.subtitle) stringsToTranslate.add(n.subtitle.trim());
    if (n.category) stringsToTranslate.add(n.category.trim());
    if (n.author_name) stringsToTranslate.add(n.author_name.trim());
    if (n.content_body) stringsToTranslate.add(n.content_body.trim());
    if (n.pull_quote) stringsToTranslate.add(n.pull_quote.trim());
    if (n.tags) {
      try {
        const parsedTags = JSON.parse(n.tags);
        if (Array.isArray(parsedTags)) {
          parsedTags.forEach(t => stringsToTranslate.add(t.trim()));
        }
      } catch (e) {}
    }
  }

  // 3. Interviews
  const interviews = await dbQuery('SELECT title, subtitle, interviewee_name, interviewee_title, company_name, qa_content, category FROM interviews');
  for (const iv of interviews) {
    if (iv.title) stringsToTranslate.add(iv.title.trim());
    if (iv.subtitle) stringsToTranslate.add(iv.subtitle.trim());
    if (iv.interviewee_name) stringsToTranslate.add(iv.interviewee_name.trim());
    if (iv.interviewee_title) stringsToTranslate.add(iv.interviewee_title.trim());
    if (iv.company_name) stringsToTranslate.add(iv.company_name.trim());
    if (iv.category) stringsToTranslate.add(iv.category.trim());
    if (iv.qa_content) {
      try {
        const qa = JSON.parse(iv.qa_content);
        if (Array.isArray(qa)) {
          for (const item of qa) {
            if (item.q) stringsToTranslate.add(item.q.trim());
            if (item.a) stringsToTranslate.add(item.a.trim());
          }
        }
      } catch (e) {}
    }
  }

  // 4. Student Profiles
  const students = await dbQuery('SELECT name, university, study_field, bio FROM student_profiles');
  for (const s of students) {
    if (s.name) stringsToTranslate.add(s.name.trim());
    if (s.university) stringsToTranslate.add(s.university.trim());
    if (s.study_field) stringsToTranslate.add(s.study_field.trim());
    if (s.bio) stringsToTranslate.add(s.bio.trim());
  }

  // 5. Jobs
  const jobs = await dbQuery('SELECT title, type, description, company_name, location FROM jobs');
  for (const j of jobs) {
    if (j.title) stringsToTranslate.add(j.title.trim());
    if (j.type) stringsToTranslate.add(j.type.trim());
    if (j.description) stringsToTranslate.add(j.description.trim());
    if (j.company_name) stringsToTranslate.add(j.company_name.trim());
    if (j.location) stringsToTranslate.add(j.location.trim());
  }

  console.log(`Auto-translation scanner found ${stringsToTranslate.size} unique database strings to translate.`);

  const languages = ['de', 'fr', 'en', 'ar'];

  // 1. Gather all API translation tasks that are not yet cached
  const apiTasks = [];
  for (const text of stringsToTranslate) {
    if (!text || text.trim().length === 0) continue;
    const isGermanUiKey = GERMAN_UI_KEYS.has(text);
    const sourceLang = isGermanUiKey ? 'de' : 'en';

    for (const lang of languages) {
      if (lang === 'rm') continue;
      if (lang === sourceLang) continue;
      
      const cacheKey = `${lang}:${text}`;
      if (!translationCache[cacheKey]) {
        apiTasks.push({ text, lang });
      }
    }
  }

  console.log(`Found ${apiTasks.length} translations missing from cache. Translating via Google Translate API with concurrency pool...`);

  // Concurrency worker to translate and update cache in memory
  let processed = 0;
  const limit = 20; // 20 concurrent requests
  
  const runTasks = async () => {
    let index = 0;
    return new Promise((resolve) => {
      let activeCount = 0;
      
      const next = () => {
        if (index >= apiTasks.length) {
          if (activeCount === 0) resolve();
          return;
        }
        
        while (activeCount < limit && index < apiTasks.length) {
          const task = apiTasks[index++];
          activeCount++;
          
          translateText(task.text, task.lang)
            .then(() => {
              activeCount--;
              processed++;
              if (processed % 100 === 0) {
                console.log(`Translated ${processed}/${apiTasks.length} missing strings...`);
                saveTranslationCache();
              }
              next();
            })
            .catch(err => {
              console.error(`Error translating:`, err);
              activeCount--;
              next();
            });
        }
      };
      
      if (apiTasks.length === 0) {
        resolve();
      } else {
        next();
      }
    });
  };

  await runTasks();
  
  // Save cache at the end of API requests
  saveTranslationCache();
  console.log('Translation API phase complete. Writing all translations to database...');

  // 2. Perform bulk insertion in SQLite using a transaction to make it extremely fast
  await dbRun('BEGIN TRANSACTION');
  try {
    let count = 0;
    for (const text of stringsToTranslate) {
      if (!text || text.trim().length === 0) continue;
      const isGermanUiKey = GERMAN_UI_KEYS.has(text);
      const sourceLang = isGermanUiKey ? 'de' : 'en';

      for (const lang of languages) {
        let translatedText = text;
        if (lang === 'rm') {
          translatedText = text;
        } else if (lang === sourceLang) {
          translatedText = text;
        } else {
          const cacheKey = `${lang}:${text}`;
          translatedText = translationCache[cacheKey] || text;
        }

        const status = (lang === 'de' || lang === 'fr' || lang === 'en') ? 'reviewed' : 'auto-only';
        await dbRun(`
          INSERT INTO translations (language_code, key, translated_text, status)
          VALUES (?, ?, ?, ?)
          ON CONFLICT (language_code, key) 
          DO UPDATE SET translated_text = EXCLUDED.translated_text, status = EXCLUDED.status
        `, [lang, text, translatedText, status]);
        count++;
      }
    }
    await dbRun('COMMIT');
    console.log(`Successfully ensured ${count} database translations in table 'translations'.`);
  } catch (dbErr) {
    await dbRun('ROLLBACK');
    console.error('Failed database transaction for translations:', dbErr);
    throw dbErr;
  }
}
