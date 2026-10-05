import { execSync } from 'node:child_process';
import fs from 'node:fs';

const cli = 'node ./node_modules/emdash/dist/cli/index.mjs';

// 1. Export schema from database
const rawSeedStr = execSync(`${cli} export-seed`, { cwd: 'd:/privatesector/emdash-site', encoding: 'utf-8' });
const jsonStart = rawSeedStr.indexOf('{');
const seed = JSON.parse(rawSeedStr.substring(jsonStart));

// 2. Enhance metadata and settings
seed.$schema = 'https://emdashcms.com/seed.schema.json';
seed.version = '1';
seed.meta = {
  name: 'PrivateSector',
  description: "Switzerland's Independent Private Sector & Business Intelligence Platform",
  author: 'PrivateSector Editorial'
};
seed.settings = {
  title: 'PrivateSector.ch',
  tagline: "Switzerland's Private Sector Intelligence"
};

// 3. Ensure collections have correct urlPattern and supports
for (const col of seed.collections) {
  if (col.slug === 'posts') {
    col.label = 'News Articles';
    col.labelSingular = 'News Article';
    col.urlPattern = '/news/{slug}';
    col.supports = ['drafts', 'revisions', 'preview', 'scheduling', 'search', 'seo'];
  } else if (col.slug === 'blogs') {
    col.label = 'Blog Posts';
    col.labelSingular = 'Blog Post';
    col.urlPattern = '/blogs/{slug}';
    col.supports = ['drafts', 'revisions', 'preview', 'scheduling', 'search', 'seo'];
  } else if (col.slug === 'companies') {
    col.label = 'Companies';
    col.labelSingular = 'Company';
    col.urlPattern = '/companies/{slug}';
    col.supports = ['drafts', 'revisions', 'search', 'seo'];
  } else if (col.slug === 'interviews') {
    col.label = 'Interviews & Podcasts';
    col.labelSingular = 'Interview';
    col.urlPattern = '/interviews/{slug}';
    col.supports = ['drafts', 'revisions', 'search', 'seo'];
  } else if (col.slug === 'jobs') {
    col.label = 'Careers & Jobs';
    col.labelSingular = 'Career Listing';
    col.urlPattern = '/careers/{slug}';
    col.supports = ['drafts', 'revisions', 'search', 'seo'];
  } else if (col.slug === 'briefings') {
    col.label = 'Morning Briefings';
    col.labelSingular = 'Morning Briefing';
    col.urlPattern = '/podcasts';
    col.supports = ['drafts', 'revisions', 'search'];
  } else if (col.slug === 'pages') {
    col.label = 'Pages';
    col.labelSingular = 'Page';
    col.urlPattern = '/{slug}';
    col.supports = ['drafts', 'revisions', 'preview', 'search', 'seo'];
  }
}

// 4. Enhanced Taxonomies
seed.taxonomies = [
  {
    name: 'category',
    label: 'Categories',
    labelSingular: 'Category',
    hierarchical: true,
    collections: ['posts', 'blogs', 'interviews', 'jobs'],
    terms: [
      { slug: 'executive-briefing', label: 'Executive Briefing' },
      { slug: 'deal-radar', label: 'Deal Radar' },
      { slug: 'transatlantic-transcript', label: 'Transatlantic Transcript' },
      { slug: 'socal-gateway', label: 'SoCal Gateway' },
      { slug: 'trade-policy-pulse', label: 'Trade Policy Pulse' },
      { slug: 'university-perspective', label: 'University Perspective' }
    ]
  },
  {
    name: 'tag',
    label: 'Tags',
    labelSingular: 'Tag',
    hierarchical: false,
    collections: ['posts', 'blogs', 'companies', 'interviews', 'jobs'],
    terms: [
      { slug: 'hidden-swiss', label: 'Hidden Swiss' },
      { slug: 'switzerland', label: 'Switzerland' },
      { slug: 'usa', label: 'USA' },
      { slug: 'manufacturing', label: 'Manufacturing' },
      { slug: 'ai', label: 'AI' },
      { slug: 'pharma', label: 'Pharma' },
      { slug: 'medtech', label: 'Medtech' }
    ]
  },
  {
    name: 'canton',
    label: 'Cantons',
    labelSingular: 'Canton',
    hierarchical: false,
    collections: ['companies', 'jobs'],
    terms: [
      { slug: 'zh', label: 'Zurich (ZH)' },
      { slug: 'be', label: 'Bern (BE)' },
      { slug: 'lu', label: 'Lucerne (LU)' },
      { slug: 'zg', label: 'Zug (ZG)' },
      { slug: 'bs', label: 'Basel-Stadt (BS)' },
      { slug: 'bl', label: 'Basel-Landschaft (BL)' },
      { slug: 'vd', label: 'Vaud (VD)' },
      { slug: 'ge', label: 'Geneva (GE)' },
      { slug: 'sg', label: 'St. Gallen (SG)' },
      { slug: 'ag', label: 'Aargau (AG)' },
      { slug: 'ti', label: 'Ticino (TI)' },
      { slug: 'ju', label: 'Jura (JU)' },
      { slug: 'ne', label: 'Neuchâtel (NE)' }
    ]
  },
  {
    name: 'industry',
    label: 'Industries',
    labelSingular: 'Industry',
    hierarchical: false,
    collections: ['companies', 'jobs'],
    terms: [
      { slug: 'fintech', label: 'Fintech & Banking' },
      { slug: 'pharma-biotech', label: 'Pharma & Biotech' },
      { slug: 'medtech', label: 'Medtech & Precision Instruments' },
      { slug: 'manufacturing', label: 'Advanced Manufacturing & Robotics' },
      { slug: 'private-equity', label: 'Private Equity & Venture Capital' },
      { slug: 'commodities', label: 'Commodities & Global Trade' },
      { slug: 'ai', label: 'Artificial Intelligence & Software' },
      { slug: 'cleantech', label: 'Clean Tech & Renewable Energy' }
    ]
  }
];

// 5. Enhanced Menus
seed.menus = [
  {
    name: 'primary',
    label: 'Primary Navigation',
    items: [
      { type: 'custom', label: 'Home', url: '/' },
      { type: 'custom', label: 'News & Intelligence', url: '/news' },
      { type: 'custom', label: 'Unternehmen', url: '/companies' },
      { type: 'custom', label: 'Interviews & Podcasts', url: '/interviews' },
      { type: 'custom', label: 'Market Blogs', url: '/blogs' },
      { type: 'custom', label: 'Karriere', url: '/careers' },
      { type: 'custom', label: 'Morning Briefings', url: '/podcasts' }
    ]
  },
  {
    name: 'footer',
    label: 'Footer Navigation',
    items: [
      { type: 'custom', label: 'News & Intelligence', url: '/news' },
      { type: 'custom', label: 'Company Directory', url: '/companies' },
      { type: 'custom', label: 'Executive Interviews', url: '/interviews' },
      { type: 'custom', label: 'Career Opportunities', url: '/careers' },
      { type: 'custom', label: 'About PrivateSector', url: '/about' },
      { type: 'custom', label: 'Contact', url: '/contact' }
    ]
  }
];

// 6. Bylines
seed.bylines = [
  {
    id: 'byline-editorial',
    slug: 'privatesector-editorial',
    displayName: 'PrivateSector Editorial',
    isGuest: false
  },
  {
    id: 'byline-intelligence',
    slug: 'privatesector-intelligence',
    displayName: 'PrivateSector Intelligence',
    isGuest: false
  },
  {
    id: 'byline-sophia',
    slug: 'sophia-von-bern',
    displayName: 'Sophia von Bern',
    isGuest: false
  }
];

fs.writeFileSync('emdash-site/seed/seed.json', JSON.stringify(seed, null, 2));
console.log('Updated emdash-site/seed/seed.json with clean full schema, taxonomies, menus, and bylines!');
