import { chromium } from '../emdash-site/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const outDir = path.resolve('d:/privatesector/docs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log("1. Testing Desktop Navbar & Mega Menu...");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });

  // Verify mega menu trigger
  const triggerBtn = await page.$('#mega-menu-trigger-btn');
  if (triggerBtn) {
    await triggerBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(outDir, "screenshot_megamenu_desktop.png") });
    console.log("Captured: screenshot_megamenu_desktop.png");

    // Dark mode mega menu
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(outDir, "screenshot_megamenu_dark.png") });
    console.log("Captured: screenshot_megamenu_dark.png");
    await page.evaluate(() => document.documentElement.classList.remove("dark"));
  }

  console.log("2. Testing Mobile Navbar Drawer & Accordions...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });

  const mobileBtn = await page.$('#mobile-menu-btn');
  if (mobileBtn) {
    await mobileBtn.click();
    await page.waitForTimeout(300);
    // Expand Switzerland accordion
    const swissToggle = await page.$('button[data-target="mob-sec-switzerland"]');
    if (swissToggle) await swissToggle.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, "screenshot_megamenu_mobile.png") });
    console.log("Captured: screenshot_megamenu_mobile.png");
  }

  console.log("3. Testing Career Redirects & Footer...");
  await page.setViewportSize({ width: 1440, height: 900 });
  
  // Test /karriere redirect
  const karriereResponse = await page.goto("http://localhost:4321/karriere", { waitUntil: "networkidle" });
  console.log("Visiting /karriere redirected to:", page.url(), "Status:", karriereResponse?.status());

  // Test /careers redirect
  const careersResponse = await page.goto("http://localhost:4321/careers", { waitUntil: "networkidle" });
  console.log("Visiting /careers redirected to:", page.url(), "Status:", careersResponse?.status());

  // Check footer for Career Board
  await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  const footerCareer = await page.$('footer a[href*="karriere"], footer a[href*="career"]');
  console.log("Footer career links found:", footerCareer ? "YES (ERROR)" : "NONE (PERFECT)");

  const footerPulse = await page.$('footer a[href="/trade-policy-pulse"]');
  console.log("Footer Trade & Policy Pulse link found:", footerPulse ? "YES (CONFIRMED)" : "NO");

  await browser.close();
  console.log("All verification checks complete!");
}

main().catch(console.error);
