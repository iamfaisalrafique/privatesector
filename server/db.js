import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:sEZiFJJsF4zRlk94MJIfrR6zvBwCDqmTbQuAnLcLrvAdSlHKtzNbKvjAFN1pJ7es@jyx3rke6geesevkw8hz8ucf7:5432/postgres';

const pool = new pg.Pool({
  connectionString,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
});

// Helper to convert SQLite `?` placeholders to PostgreSQL `$1, $2, ...`
function convertSql(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

export async function dbQuery(sql, params = []) {
  const converted = convertSql(sql);
  const res = await pool.query(converted, params);
  return res.rows;
}

export async function dbRun(sql, params = []) {
  let converted = convertSql(sql);
  const isInsert = converted.trim().toUpperCase().startsWith('INSERT');
  if (isInsert && !converted.toUpperCase().includes('RETURNING')) {
    converted = `${converted} RETURNING id`;
  }
  const res = await pool.query(converted, params);
  return {
    id: isInsert && res.rows[0] ? res.rows[0].id : null,
    changes: res.rowCount
  };
}

export async function dbGet(sql, params = []) {
  const converted = convertSql(sql);
  const res = await pool.query(converted, params);
  return res.rows[0] || null;
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
      tags TEXT NOT NULL
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

  // Seed check
  const companyCount = await dbGet('SELECT COUNT(*) as count FROM companies');
  if (companyCount.count === 0) {
    console.log('Seeding mock B2B data...');
    await seedData();
  } else {
    console.log('Database already populated.');
  }

  // Seed check for interviews
  const interviewCount = await dbGet('SELECT COUNT(*) as count FROM interviews');
  if (interviewCount.count === 0) {
    console.log('Seeding mock interviews...');
    await seedInterviews();
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
        "logo": "https://privatesector.ch/logos/nestle.png",
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
    }
  ];

  for (const art of articles) {
    await dbRun(`
      INSERT INTO news (
        title, subtitle, category, author_name, author_avatar, date_published, read_time_mins, content_body, pull_quote, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      art.title, art.subtitle, art.category, art.author_name, art.author_avatar, art.date_published,
      art.read_time_mins, art.content_body, art.pull_quote, art.tags
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
    // UI elements
    'nav_login': { de: 'Login', fr: 'Connexion', en: 'Login', it: 'Accedi', rm: 'Entrada', es: 'Iniciar Sesión', pt: 'Entrar', ar: 'تسجيل الدخول', zh: '登录', ru: 'Войти', ja: 'ログイン', tr: 'Giriş', nl: 'Inloggen', pl: 'Zaloguj', ko: '로그인', sv: 'Logga in', da: 'Log ind', fi: 'Kirjaudu' },
    'nav_register': { de: 'Registrieren', fr: 'S\'inscrire', en: 'Register', it: 'Registrati', rm: 'Registrar', es: 'Registrarse', pt: 'Registrar-se', ar: 'تسجيل', zh: '注册', ru: 'Регистрация', ja: '新規登録', tr: 'Kayıt Ol', nl: 'Registreren', pl: 'Zarejestruj', ko: '회원가입', sv: 'Registrera', da: 'Registrer', fi: 'Rekisteröidy' },
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
    'button_latest_news': { de: 'Neueste Nachrichten', fr: 'Dernières actualités', en: 'Latest News', it: 'Ultime Notizie', rm: 'Novitats actualas', es: 'Últimas Noticias', pt: 'Últimas Notícias', ar: 'آخر الأخبار', zh: '最新动态', ru: 'Последние новости', ja: '最新ニュース', tr: 'Son Haberler', nl: 'Laatste Nieuws', pl: 'Najnowsze Wiadomości', ko: '최신 뉴스', sv: 'Senaste nyheterna', da: 'Seneste nyheder', fi: 'Viimeisimmät uutiset' }
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
      ])
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
      ])
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
      ])
    }
  ];

  for (const iv of interviews) {
    await dbRun(`
      INSERT INTO interviews (
        title, subtitle, interviewee_name, interviewee_title, interviewee_avatar,
        company_id, company_name, date_published, read_time_mins, audio_url, qa_content
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      iv.title, iv.subtitle, iv.interviewee_name, iv.interviewee_title, iv.interviewee_avatar,
      iv.company_id, iv.company_name, iv.date_published, iv.read_time_mins, iv.audio_url, iv.qa_content
    ]);
  }
}
