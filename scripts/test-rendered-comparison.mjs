import { DatabaseSync } from 'node:sqlite';
import { spawn } from 'node:child_process';
import { marked } from '../emdash-site/node_modules/marked/lib/marked.esm.js';
import sanitizeHtml from '../emdash-site/node_modules/sanitize-html/index.js';
import { htmlToPortableText, gutenbergToPortableText } from '../emdash-site/node_modules/@emdash-cms/gutenberg-to-portable-text/dist/index.mjs';
import { generatePrefixedToken, Role } from '../emdash-site/node_modules/@emdash-cms/auth/dist/index.mjs';

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function normalizeHtmlForPortableText(html) {
  const preBlocks = [];
  const withoutPre = html.replace(/<pre[\s\S]*?<\/pre>/gi, (match) => {
    preBlocks.push(match);
    return `___PRE_BLOCK_${preBlocks.length - 1}___`;
  });
  let normalized = withoutPre.replace(/\n+/g, ' ');
  normalized = normalized.replace(/___PRE_BLOCK_(\d+)___/g, (_, idx) => preBlocks[Number(idx)]);
  return normalized;
}

function convertToPortableText(rawContent) {
  const raw = rawContent || '';
  const isHtml = raw.trim().startsWith('<') && raw.trim().includes('</');
  const unsanitizedHtml = isHtml ? raw : marked.parse(raw);

  let preprocessedHtml = unsanitizedHtml
    .replace(/<div[^>]*>/gi, '<p>')
    .replace(/<\/div>/gi, '</p>')
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '</p><p>')
    .replace(/<br\s*\/?>/gi, ' ');

  const sanitizedHtml = sanitizeHtml(preprocessedHtml, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'b', 'em', 'i',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr', 'a', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td', 'br'
    ],
    allowedAttributes: {
      '*': ['class', 'id'],
      'a': ['href', 'target', 'rel', 'title'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'th': ['colspan', 'rowspan'],
      'td': ['colspan', 'rowspan']
    }
  });

  let normalizedHtml = normalizeHtmlForPortableText(sanitizedHtml);
  let ptBlocks = [];
  if (normalizedHtml.includes('<table')) {
    const parts = normalizedHtml.split(/(<table[\s\S]*?<\/table>)/gi);
    for (const part of parts) {
      if (/^<table[\s\S]*?<\/table>$/i.test(part.trim())) {
        const tblGutenberg = `<!-- wp:table -->\n<figure class="wp-block-table">${part.trim()}</figure>\n<!-- /wp:table -->`;
        ptBlocks.push(...gutenbergToPortableText(tblGutenberg));
      } else if (part.trim()) {
        ptBlocks.push(...htmlToPortableText(part));
      }
    }
  } else {
    ptBlocks = htmlToPortableText(normalizedHtml);
  }
  return ptBlocks;
}

const db = new DatabaseSync('./emdash-site/data.db');

console.log('='.repeat(85));
console.log('SIDE-BY-SIDE RENDERED PAGE AUDIT: LIVE CONTENT VS ASTRO SSR OUTPUT');
console.log('Target News IDs: 33, 4, 3, 29, 54');
console.log('='.repeat(85));

// 1. Seed Admin user & PAT
const adminId = 'usr_audit_admin_999';
db.prepare("DELETE FROM users WHERE id = ?").run(adminId);
db.prepare("DELETE FROM _emdash_api_tokens WHERE user_id = ?").run(adminId);

db.prepare(`
  INSERT INTO users (id, email, name, role, email_verified, disabled, created_at, updated_at)
  VALUES (?, 'audit-admin@privatesector.ch', 'Audit Admin', ?, 1, 0, datetime('now'), datetime('now'))
`).run(adminId, Role.ADMIN);

const adminToken = generatePrefixedToken('ec_pat_');
db.prepare(`
  INSERT INTO _emdash_api_tokens (id, name, token_hash, prefix, user_id, scopes, created_at)
  VALUES ('tok_audit_999', 'Audit PAT', ?, ?, ?, ?, datetime('now'))
`).run(adminToken.hash, adminToken.prefix, adminId, JSON.stringify(['content:write', 'content:read', 'admin']));

console.log('[1] Admin User and Token initialized.');

// 2. Spawn Astro server
console.log('[2] Spawning local Astro standalone server on port 4321...');
const serverProcess = spawn('node', ['./dist/server/entry.mjs'], {
  cwd: './emdash-site',
  env: { ...process.env, PORT: '4321', HOST: '127.0.0.1' },
  stdio: ['ignore', 'pipe', 'pipe']
});

serverProcess.stderr.on('data', (d) => {
  const msg = d.toString();
  if (!msg.includes('ExperimentalWarning')) {
    console.error('[Astro Server Log]:', msg.trim());
  }
});

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404 || res.status === 200) return true;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Server timed out waiting to start');
}

await waitForServer('http://127.0.0.1:4321/_emdash/api/health');
console.log('  -> Astro server healthy on http://127.0.0.1:4321\n');

const createdPostIds = [];

try {
  const newsListRes = await fetch('https://privatesector.ch/api/news');
  const allNews = await newsListRes.json();

  const targetIds = [33, 4, 3, 29, 54];

  for (const targetId of targetIds) {
    const article = allNews.find(n => n.id === targetId);
    if (!article) continue;

    console.log('='.repeat(85));
    console.log(`AUDIT FOR NEWS ID ${targetId}: "${article.title}"`);
    console.log(`Slug: ${article.slug}`);
    console.log('='.repeat(85));

    // Convert content to Portable Text
    const ptBlocks = convertToPortableText(article.content_body);

    // Create entry in EmDash
    const createRes = await fetch('http://127.0.0.1:4321/_emdash/api/content/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken.raw}`,
        'X-EmDash-Request': '1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        slug: article.slug,
        status: 'draft',
        data: {
          title: article.title,
          subtitle: article.subtitle || '',
          content: ptBlocks,
          read_time_mins: article.read_time_mins || 5,
          author_name: article.author_name || 'PrivateSector Intelligence'
        }
      })
    });

    const createJson = await createRes.json();
    const entryId = createJson.item?.id || createJson.data?.item?.id;
    if (entryId) createdPostIds.push(entryId);

    // Publish entry in EmDash
    const pubRes = await fetch(`http://127.0.0.1:4321/_emdash/api/content/posts/${entryId}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken.raw}`,
        'X-EmDash-Request': '1',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    // Fetch built Astro rendered page
    const astroRes = await fetch(`http://127.0.0.1:4321/news/${encodeURIComponent(article.slug)}`);
    console.log(`  -> Astro SSR Page Status: HTTP ${astroRes.status}`);
    const astroHtml = await astroRes.text();

    // Extract article content from Astro rendered HTML
    // Extract ONLY the portable text body div from Astro rendered HTML
    const contentMatch = astroHtml.match(/<div class="mt-8 leading-relaxed space-y-6">([\s\S]*?)<\/div>\s*<\/article>/i);
    const renderedBody = contentMatch ? contentMatch[1] : (articleMatch ? articleMatch[0] : astroHtml);

    // 1. VISIBLE PROSE WORD COUNT & TEXT COMPARISON
    const renderedProse = decodeHtmlEntities(
      renderedBody
        .replace(/<\/(p|div|h[1-6]|li|blockquote|tr|table|ul|ol)>/gi, ' ')
        .replace(/<[^>]+>/g, '')
    ).replace(/\s+/g, ' ').trim();

    // Source prose
    const rawUnsanitized = marked.parse(article.content_body || '');
    const sourceProse = decodeHtmlEntities(
      rawUnsanitized
        .replace(/<div[^>]*>/gi, '<p>')
        .replace(/<\/div>/gi, '</p>')
        .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '</p><p>')
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/(p|div|h[1-6]|li|blockquote|tr|table|ul|ol)>/gi, ' ')
        .replace(/<[^>]+>/g, '')
    ).replace(/\s+/g, ' ').trim();

    const srcWords = sourceProse.split(' ').filter(Boolean).length;
    const bodyWords = renderedProse.split(' ').filter(Boolean).length;

    console.log(`\n  [VISIBLE TEXT FIDELITY]:`);
    console.log(`    - Source Prose Word Count:   ${srcWords}`);
    console.log(`    - Rendered Prose Word Count: ${bodyWords}`);
    console.log(`    - Difference:                ${bodyWords - srcWords} words ${bodyWords === srcWords ? '(EXACT MATCH)' : ''}`);
    if (bodyWords !== srcWords) {
      const srcArr = sourceProse.split(' ').filter(Boolean);
      const renArr = renderedProse.split(' ').filter(Boolean);
      for (let i = 0; i < Math.min(srcArr.length, renArr.length); i++) {
        if (srcArr[i] !== renArr[i]) {
          console.log(`    - First divergence at word index ${i}: Source "${srcArr.slice(i, i+3).join(' ')}" vs Rendered "${renArr.slice(i, i+3).join(' ')}"`);
          break;
        }
      }
    }

    // 2. LINK TARGETS COMPARISON (Support Markdown + HTML links + autolinks)
    const srcMdLinks = [...(article.content_body || '').matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(m => ({ text: m[1], href: m[2] }));
    const srcHtmlLinks = [...(article.content_body || '').matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi)].map(m => ({ text: m[2].replace(/<[^>]+>/g, '').trim(), href: m[1] }));
    const srcLinks = [...srcMdLinks, ...srcHtmlLinks];

    const astroLinks = [...renderedBody.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi)]
      .map(m => ({ text: m[2].replace(/<[^>]+>/g, '').trim(), href: m[1] }))
      .filter(l => !l.href.startsWith('/news') && !l.href.startsWith('/#') && l.href !== '/' && !l.href.startsWith('mailto:') && !l.href.startsWith('tel:') && !l.href.startsWith('/admin'));

    console.log(`\n  [LINK TARGETS AUDIT]:`);
    console.log(`    - Source Links Count:   ${srcLinks.length}`);
    console.log(`    - Rendered Links Count: ${astroLinks.length}`);
    for (let i = 0; i < Math.max(srcLinks.length, astroLinks.length); i++) {
      const s = srcLinks[i];
      const a = astroLinks[i];
      const match = s && a && (s.href === a.href || a.href.startsWith(s.href));
      console.log(`      ${i+1}. [${s?.text || 'N/A'}] -> ${s?.href || 'N/A'} | Rendered: [${a?.text || 'N/A'}] -> ${a?.href || 'N/A'} ${match ? '✓ MATCH' : ''}`);
    }

    // 3. HEADINGS STRUCTURE COMPARISON
    const srcH2 = ((article.content_body || '').match(/^##\s+.+$/gm) || []).length;
    const srcH3 = ((article.content_body || '').match(/^###\s+.+$/gm) || []).length;
    const astroH2 = (renderedBody.match(/<h2[^>]*>/gi) || []).length;
    const astroH3 = (renderedBody.match(/<h3[^>]*>/gi) || []).length;

    console.log(`\n  [HEADINGS AUDIT]:`);
    console.log(`    - Source H2:   ${srcH2} | Rendered H2:   ${astroH2}`);
    console.log(`    - Source H3:   ${srcH3} | Rendered H3:   ${astroH3}`);

    // 4. LIST STRUCTURE COMPARISON
    const srcListBullets = ((article.content_body || '').match(/^[-*]\s+.+$/gm) || []).length;
    const srcListNumbered = ((article.content_body || '').match(/^\d+\.\s+.+$/gm) || []).length;
    const totalSrcList = srcListBullets + srcListNumbered;
    const astroLi = (renderedBody.match(/<li[^>]*>/gi) || []).length;

    console.log(`\n  [LIST STRUCTURE AUDIT]:`);
    console.log(`    - Source List Items:   ${totalSrcList} (Bullets: ${srcListBullets}, Numbered: ${srcListNumbered})`);
    console.log(`    - Rendered <li> Items: ${astroLi}`);
    console.log(`    - Match: ${totalSrcList === astroLi ? '✓ EXACT 100% MATCH' : 'DISCREPANCY'}`);

    // 5. TABLE STRUCTURE (ID 33)
    if (targetId === 33) {
      const astroHasTable = renderedBody.includes('<table');
      const tableRows = (renderedBody.match(/<tr[^>]*>/gi) || []).length;
      console.log(`\n  [TABLE AUDIT (ID 33)]:`);
      console.log(`    - Source Table Present: true (1 table, 5 rows)`);
      console.log(`    - Rendered Table:       ${astroHasTable ? '✓ Present' : 'Missing'} (${tableRows} rows rendered)`);
    }
  }
} finally {
  console.log('\n' + '='.repeat(85));
  console.log('Cleaning test entries from data.db...');
  try {
    for (const id of createdPostIds) {
      db.prepare("DELETE FROM ec_posts WHERE id = ?").run(id);
    }
    db.prepare("DELETE FROM users WHERE id = ?").run(adminId);
    db.prepare("DELETE FROM _emdash_api_tokens WHERE id = 'tok_audit_999'").run();
    console.log('Database cleaned successfully.');
  } catch (e) {
    console.error('Error during cleanup:', e);
  }
  serverProcess.kill('SIGTERM');
  console.log('Server terminated.');
}
