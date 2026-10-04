import sqlite3 from 'sqlite3';
import { marked } from '../emdash-site/node_modules/marked/lib/marked.esm.js';
import sanitizeHtml from '../emdash-site/node_modules/sanitize-html/index.js';
import { htmlToPortableText, gutenbergToPortableText } from '../emdash-site/node_modules/@emdash-cms/gutenberg-to-portable-text/dist/index.mjs';

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

function getProse(html) {
  const htmlWithBlockSpaces = html
    .replace(/<\/?(p|div|h[1-6]|li|blockquote|tr|table|ul|ol)[^>]*>/gi, ' ')
    .replace(/<(br|hr)\s*\/?>/gi, ' ');
  const strippedHtml = htmlWithBlockSpaces.replace(/<[^>]+>/g, '');
  return decodeHtmlEntities(strippedHtml).replace(/\s+/g, ' ').trim();
}

function getPtProse(blocks) {
  const texts = [];
  for (const b of blocks) {
    if (b._type === 'block' && Array.isArray(b.children)) {
      texts.push(b.children.map(c => c.text || '').join(''));
    } else if (b._type === 'table' && Array.isArray(b.rows)) {
      for (const row of b.rows) {
        if (Array.isArray(row.cells)) {
          for (const cell of row.cells) {
            if (Array.isArray(cell.content)) {
              texts.push(cell.content.map(c => c.text || '').join(''));
            } else if (typeof cell === 'string') {
              texts.push(cell);
            }
          }
        }
      }
    }
  }
  return texts.join(' ').replace(/\s+/g, ' ').trim();
}

function countHtmlElements(html) {
  const headings = (html.match(/<h[1-6][^>]*>/gi) || []).length;
  const links = (html.match(/<a\s+[^>]*href=/gi) || []).length;
  const images = (html.match(/<img\s+[^>]*src=/gi) || []).length;
  const listItems = (html.match(/<li[^>]*>/gi) || []).length;
  const tables = (html.match(/<table[^>]*>/gi) || []).length;
  const iframes = (html.match(/<iframe[^>]*>/gi) || []).length;
  const embeds = (html.match(/<(embed|video|audio|object)[^>]*>/gi) || []).length;
  return { headings, links, images, listItems, tables, iframes, embeds };
}

function countPtElements(blocks) {
  let headings = 0;
  let links = 0;
  let images = 0;
  let listItems = 0;
  let tables = 0;

  for (const b of blocks) {
    if (b._type === 'block') {
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(b.style)) headings++;
      if (b.listItem) listItems++;
      if (Array.isArray(b.markDefs)) {
        for (const def of b.markDefs) {
          if (def._type === 'link') links++;
        }
      }
    } else if (b._type === 'image') {
      images++;
    } else if (b._type === 'table') {
      tables++;
    }
  }
  return { headings, links, images, listItems, tables };
}

// Extract tags and attributes dropped by sanitize-html
function analyzeDroppedMarkup(rawHtml, sanitizedHtml) {
  const allTagsInRaw = [...rawHtml.matchAll(/<([a-z0-9]+)([^>]*)>/gi)].map(m => ({
    tag: m[1].toLowerCase(),
    attrs: m[2]
  }));

  const droppedTags = new Set();
  const droppedAttrTypes = new Set();

  const allowedTags = new Set([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'b', 'em', 'i',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr', 'a', 'img', 'table',
    'thead', 'tbody', 'tr', 'th', 'td'
  ]);

  for (const item of allTagsInRaw) {
    if (!allowedTags.has(item.tag)) {
      droppedTags.add(item.tag);
    }
    if (item.attrs) {
      if (/style\s*=/i.test(item.attrs)) droppedAttrTypes.add('style');
      if (/data-[a-z0-9_-]+\s*=/i.test(item.attrs)) droppedAttrTypes.add('data-*');
      if (/on[a-z]+\s*=/i.test(item.attrs)) droppedAttrTypes.add('event-handlers (onclick, etc.)');
      if (/target\s*=\s*["']?_blank["']?/i.test(item.attrs) && !/rel\s*=/i.test(item.attrs)) {
        droppedAttrTypes.add('target without rel');
      }
    }
  }

  return {
    droppedTags: Array.from(droppedTags),
    droppedAttributes: Array.from(droppedAttrTypes)
  };
}

async function runAudit() {
  console.log('='.repeat(85));
  console.log('FULL DATA FIDELITY & SANITIZE-HTML PURGE AUDIT [PROVISIONAL LIVE SOURCE]');
  console.log('='.repeat(85));

  const res = await fetch('https://privatesector.ch/api/news');
  const news = await res.json();

  console.log(`Auditing ${news.length} news articles...\n`);

  const specialMediaItems = [];
  let totalDiscrepancies = 0;

  for (const n of news) {
    const raw = n.content_body || '';
    const isHtml = raw.trim().startsWith('<') && raw.trim().includes('</');
    const unsanitizedHtml = isHtml ? raw : marked.parse(raw);

    // Preprocess: Convert <div> to <p>, <br><br> to paragraph breaks, and single <br> to space
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

    const dropped = analyzeDroppedMarkup(unsanitizedHtml, sanitizedHtml);

    const rawMetrics = countHtmlElements(unsanitizedHtml);
    const sanitizedMetrics = countHtmlElements(sanitizedHtml);

    let normalizedHtml = normalizeHtmlForPortableText(sanitizedHtml);
    let ptBlocks = [];
    if (normalizedHtml.includes('<table')) {
      const parts = normalizedHtml.split(/(<table[\s\S]*?<\/table>)/gi);
      for (const part of parts) {
        if (/^<table[\s\S]*?<\/table>$/i.test(part.trim())) {
          const tblGutenberg = `<!-- wp:table -->\n<figure class="wp-block-table">${part.trim()}</figure>\n<!-- /wp:table -->`;
          const tblBlocks = gutenbergToPortableText(tblGutenberg);
          ptBlocks.push(...tblBlocks);
        } else if (part.trim()) {
          ptBlocks.push(...htmlToPortableText(part));
        }
      }
    } else {
      ptBlocks = htmlToPortableText(normalizedHtml);
    }
    const ptMetrics = countPtElements(ptBlocks);

    const unsanitizedProse = getProse(unsanitizedHtml);
    const sanitizedProse = getProse(sanitizedHtml);
    const ptProse = getPtProse(ptBlocks);

    const unsanitizedWords = unsanitizedProse ? unsanitizedProse.split(' ').filter(Boolean).length : 0;
    const sanitizedWords = sanitizedProse ? sanitizedProse.split(' ').filter(Boolean).length : 0;
    const ptWords = ptProse ? ptProse.split(' ').filter(Boolean).length : 0;

    const diffVsUnsanitized = ptWords - unsanitizedWords;
    const diffVsSanitized = ptWords - sanitizedWords;

    if (diffVsUnsanitized !== 0) totalDiscrepancies++;

    // Track items with images, tables, iframes, embeds
    if (rawMetrics.images > 0 || rawMetrics.tables > 0 || rawMetrics.iframes > 0 || rawMetrics.embeds > 0 || n.featured_image) {
      specialMediaItems.push({
        id: n.id,
        title: n.title,
        featured_image: n.featured_image,
        bodyImages: rawMetrics.images,
        ptImages: ptMetrics.images,
        tables: rawMetrics.tables,
        ptTables: ptMetrics.tables,
        iframes: rawMetrics.iframes,
        embeds: rawMetrics.embeds,
        droppedTags: dropped.droppedTags,
        droppedAttrs: dropped.droppedAttributes
      });
    }

    // Print summary line for item
    console.log(`[PROVISIONAL] ID ${String(n.id).padStart(2, ' ')}: Words [Unsanitized: ${String(unsanitizedWords).padStart(4, ' ')} | PT: ${String(ptWords).padStart(4, ' ')} | Diff: ${diffVsUnsanitized}] | H: ${rawMetrics.headings}=${ptMetrics.headings} | L: ${rawMetrics.links}=${ptMetrics.links} | Lists: ${rawMetrics.listItems}=${ptMetrics.listItems} | Img: ${rawMetrics.images}=${ptMetrics.images} | Tab: ${rawMetrics.tables}=${ptMetrics.tables}`);
    if (dropped.droppedTags.length > 0 || dropped.droppedAttributes.length > 0) {
      console.log(`       └─ Sanitize Dropped: Tags=[${dropped.droppedTags.join(', ')}] Attrs=[${dropped.droppedAttributes.join(', ')}]`);
    }
  }

  console.log('\n' + '='.repeat(85));
  console.log(`SUMMARY: ${news.length - totalDiscrepancies}/${news.length} articles have 0-word difference.`);
  console.log(`Total Articles with embedded media/tables/iframes: ${specialMediaItems.length}`);
  console.log('='.repeat(85));

  console.log('\n[3] SPECIAL MEDIA / EMBED / TABLE RENDERING AUDIT:');
  for (const item of specialMediaItems) {
    console.log(`\n• ID ${item.id}: "${item.title}"`);
    console.log(`  Featured Image: ${item.featured_image || 'None'}`);
    console.log(`  Body Images:    Source=${item.bodyImages} -> PortableText=${item.ptImages}`);
    console.log(`  Tables:         Source=${item.tables} -> PortableText=${item.ptTables}`);
    console.log(`  Iframes/Embeds: Source=${item.iframes + item.embeds} -> Purged for security: ${item.iframes > 0 ? 'iframe stripped by sanitize-html' : 'None'}`);
    console.log(`  Purged Markup:  Tags: [${item.droppedTags.join(', ')}] | Attrs: [${item.droppedAttrs.join(', ')}]`);
  }
}

runAudit();
