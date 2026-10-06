import { chromium } from '../emdash-site/node_modules/playwright/index.mjs';
import path from 'node:path';

async function testLogoSurfaces() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; font-family: sans-serif; display: flex; flex-direction: column; height: 100vh; }
        .light { background: #FFFFFF; color: #000; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-bottom: 2px solid #ccc; }
        .dark { background: #0B0F19; color: #fff; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        img { height: 64px; object-fit: contain; }
      </style>
    </head>
    <body>
      <div class="light">
        <h3>Light Surface (#FFFFFF)</h3>
        <img src="http://localhost:4321/logo.png" />
      </div>
      <div class="dark">
        <h3>Dark Surface (#0B0F19)</h3>
        <img src="http://localhost:4321/logo.png" />
      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/logo_surfaces_test.png' });
  console.log('Saved logo test screenshot to scripts/logo_surfaces_test.png');
  await browser.close();
}

testLogoSurfaces().catch(console.error);
