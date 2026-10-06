import { chromium } from '../emdash-site/node_modules/playwright/index.mjs';
import path from 'node:path';
import fs from 'node:fs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const outDir = path.resolve('d:/privatesector/docs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log("Capturing homepage responsive views...");
  // Desktop Home
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "screenshot_home_1280.png") });

  // Home Dark
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.screenshot({ path: path.join(outDir, "screenshot_home_dark.png") });
  await page.evaluate(() => document.documentElement.classList.remove("dark"));

  // Tablet Home
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "screenshot_home_768.png") });

  // Mobile Home
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("http://localhost:4321/", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "screenshot_home_360.png") });

  // Reset to desktop for other pages
  await page.setViewportSize({ width: 1280, height: 900 });

  console.log("Capturing news views...");
  // News listing
  await page.goto("http://localhost:4321/news", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "screenshot_news_1280.png") });

  // News article
  await page.goto("http://localhost:4321/news/texas-data-centers-swiss-investors", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "screenshot_article_1280.png") });

  console.log("Capturing interviews & blogs...");
  // Interviews index
  await page.goto("http://localhost:4321/interviews", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "screenshot_interviews_1280.png") });

  // Single interview
  await page.goto("http://localhost:4321/interviews/1", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "screenshot_interview_detail_1280.png") });

  // Blogs index
  await page.goto("http://localhost:4321/blogs", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "screenshot_blogs_1280.png") });

  // Company detail
  await page.goto("http://localhost:4321/unternehmen/1", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "screenshot_company_detail_1280.png") });

  // Statistics
  await page.goto("http://localhost:4321/statistiken", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "screenshot_statistiken_1280.png") });

  // Rankings
  await page.goto("http://localhost:4321/ranking", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "screenshot_ranking_1280.png") });

  // Careers
  await page.goto("http://localhost:4321/karriere", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "screenshot_karriere_1280.png") });

  await browser.close();
  console.log("All comprehensive screenshots captured successfully!");
}

main().catch(err => { console.error(err); process.exit(1); });
