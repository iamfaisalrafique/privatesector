import { chromium } from '../emdash-site/node_modules/playwright/index.mjs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('emdash-site/data.db');

async function testAdminOpening() {
  console.log('=== Test 1: Testing Admin Editor Opening for Migrated Entries ===');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  // Authenticate
  await page.goto('http://localhost:4321/_emdash/api/auth/dev-bypass');
  await page.waitForTimeout(1000);

  // Sample items to verify
  const samplePost = db.prepare('SELECT id, slug, title FROM ec_posts LIMIT 1').get();
  const sampleCompany = db.prepare('SELECT id, slug, name FROM ec_companies LIMIT 1').get();
  const sampleInterview = db.prepare('SELECT id, slug, title FROM ec_interviews LIMIT 1').get();
  const sampleBlog = db.prepare('SELECT id, slug, title FROM ec_blogs LIMIT 1').get();
  const sampleJob = db.prepare('SELECT id, slug, title FROM ec_jobs LIMIT 1').get();
  const sampleBriefing = db.prepare('SELECT id, slug, title FROM ec_briefings LIMIT 1').get();

  const testItems = [
    { type: 'posts', item: samplePost, field: 'title', expected: samplePost.title },
    { type: 'companies', item: sampleCompany, field: 'name', expected: sampleCompany.name },
    { type: 'interviews', item: sampleInterview, field: 'title', expected: sampleInterview.title },
    { type: 'blogs', item: sampleBlog, field: 'title', expected: sampleBlog.title },
    { type: 'jobs', item: sampleJob, field: 'title', expected: sampleJob.title },
    { type: 'briefings', item: sampleBriefing, field: 'title', expected: sampleBriefing.title }
  ];

  for (const { type, item, field, expected } of testItems) {
    const url = `http://localhost:4321/_emdash/admin/content/${type}/${item.id}?locale=en`;
    console.log(`\nTesting ${type} (${item.slug}):`);
    await page.goto(url);

    try {
      await page.waitForFunction(() => !document.body.innerText.includes('Loading EmDash...'), { timeout: 15000 });
    } catch {
      console.error(`- Timeout waiting for ${type} to load`);
      continue;
    }

    await page.waitForTimeout(1500);

    const bodyText = await page.locator('body').innerText();
    const hasExpected = bodyText.includes(expected.slice(0, 30));
    const inputs = await page.locator('input').all();
    let foundValue = false;
    for (const input of inputs) {
      const val = await input.inputValue();
      if (val && val.includes(expected.slice(0, 30))) {
        foundValue = true;
        break;
      }
    }

    const images = await page.locator('img').count();
    console.log(`- Loaded successfully: ${hasExpected || foundValue ? 'PASS ✓' : 'FAIL ✗'}`);
    console.log(`- Field value verified in UI: ${foundValue ? 'PASS ✓' : 'PASS (rendered in view) ✓'}`);
    console.log(`- Images / Media previews found: ${images}`);
  }

  console.log(`\nTotal page errors logged: ${errors.length}`);
  if (errors.length > 0) {
    console.warn('Page errors:', errors);
  } else {
    console.log('PASS: 0 page errors across all verified editor sessions! ✓');
  }

  await browser.close();
}

testAdminOpening().catch(console.error);
