import { chromium } from '../emdash-site/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const outDir = path.resolve('d:/privatesector/docs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const pagesToTest = [
    { name: 'locale_ar_home', url: 'http://localhost:4321/?locale=ar', width: 1280, height: 900 },
    { name: 'locale_de_home', url: 'http://localhost:4321/?locale=de', width: 1280, height: 900 },
    { name: 'about_1280', url: 'http://localhost:4321/about', width: 1280, height: 900 },
    { name: 'contact_1280', url: 'http://localhost:4321/contact', width: 1280, height: 900 },
    { name: 'login_1280', url: 'http://localhost:4321/login', width: 1280, height: 900 },
    { name: 'company_detail_1280', url: 'http://localhost:4321/unternehmen/1', width: 1280, height: 900 },
    { name: 'statistiken_1280', url: 'http://localhost:4321/statistiken', width: 1280, height: 900 },
    { name: 'ranking_1280', url: 'http://localhost:4321/ranking', width: 1280, height: 900 },
    { name: 'karriere_1280', url: 'http://localhost:4321/karriere', width: 1280, height: 900 },
    { name: 'socal_gateway_1280', url: 'http://localhost:4321/socal-gateway', width: 1280, height: 900 },
  ];

  console.log(`Starting headless browser capture of ${pagesToTest.length} pages...`);

  for (const item of pagesToTest) {
    try {
      await page.setViewportSize({ width: item.width, height: item.height });
      const resp = await page.goto(item.url, { waitUntil: 'networkidle', timeout: 15000 });
      const status = resp ? resp.status() : 'no-resp';
      console.log(`[${status}] ${item.url}`);
      
      const screenshotPath = path.join(outDir, `screenshot_${item.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`  -> Saved ${screenshotPath}`);
    } catch (e) {
      console.error(`  Error on ${item.url}:`, e.message);
    }
  }

  await browser.close();
  console.log('Finished visual verification!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
