import { chromium } from '../emdash-site/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

async function inspectLiveSite() {
  console.log('=== Step C1: Inspecting Live Site at 360px, 768px, and 1280px ===');
  
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'mobile', width: 360, height: 800 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 900 }
  ];

  const results = {};

  for (const vp of viewports) {
    console.log(`\nInspecting at ${vp.width}x${vp.height} (${vp.name})...`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    try {
      await page.goto('https://privatesector.ch', { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      // Measure layout & elements
      const pageTitle = await page.title();
      const navLinks = await page.locator('nav a, header a').allInnerTexts();
      const headings = await page.locator('h1, h2, h3').allInnerTexts();
      const buttons = await page.locator('button').allInnerTexts();
      const audioPlayers = await page.locator('audio, [class*="audio"], [class*="player"]').count();
      const searchInputs = await page.locator('input[type="search"], input[placeholder*="search" i]').count();
      const langSwitchers = await page.locator('[class*="lang"], [aria-label*="language" i], select').allInnerTexts();

      results[vp.name] = {
        title: pageTitle,
        navCount: navLinks.length,
        navSample: navLinks.slice(0, 10).map(s => s.trim()).filter(Boolean),
        headingsCount: headings.length,
        headingsSample: headings.slice(0, 10).map(s => s.trim()).filter(Boolean),
        buttonSample: buttons.slice(0, 10).map(s => s.trim()).filter(Boolean),
        audioPlayers,
        searchInputs,
        langSwitchers: langSwitchers.slice(0, 5)
      };

      // Screenshot for analysis
      const screenshotPath = `scripts/live_${vp.name}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved screenshot to: ${screenshotPath}`);
    } catch (e) {
      console.error(`Failed to load at ${vp.name}:`, e.message);
    } finally {
      await context.close();
    }
  }

  await browser.close();

  fs.writeFileSync('scripts/live_inspection_data.json', JSON.stringify(results, null, 2));
  console.log('\nInspection data saved to scripts/live_inspection_data.json');
}

inspectLiveSite().catch(console.error);
