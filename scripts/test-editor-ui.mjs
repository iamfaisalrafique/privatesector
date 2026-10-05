import { chromium } from '../emdash-site/node_modules/playwright/index.mjs';

async function testHeadless() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen to console logs and errors
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));
  page.on('response', res => {
    if (res.status() >= 400) console.log('HTTP ERROR:', res.status(), res.url());
  });

  // First hit dev-bypass to set session cookie
  await page.goto('http://localhost:4321/_emdash/api/auth/dev-bypass');
  await page.waitForTimeout(1000);
  console.log('After dev-bypass URL:', page.url());

  // Now go to the editor
  const editorUrl = 'http://localhost:4321/_emdash/admin/content/posts/post_2?locale=en';
  await page.goto(editorUrl);

  try {
    await page.waitForFunction(() => !document.body.innerText.includes('Loading EmDash...'), { timeout: 20000 });
  } catch (e) {
    console.log('Timeout waiting for Loading EmDash to disappear');
  }

  await page.waitForTimeout(2000);
  console.log('After editor loaded URL:', page.url());

  const bodyText = await page.locator('body').innerText();
  console.log('Body text length:', bodyText.length);
  console.log('Body snippet:\n', bodyText.slice(0, 500));
  console.log('Contains test title:', bodyText.includes('Test Single Post Import'));
  console.log('Contains test content:', bodyText.includes('This is the verified test content.'));

  // Inspect form fields
  const inputs = await page.locator('input').all();
  console.log('Input fields count:', inputs.length);
  for (const input of inputs) {
    const name = await input.getAttribute('name');
    const val = await input.inputValue();
    console.log(`Input [${name}]:`, val);
  }

  // Look for images
  const images = await page.locator('img').all();
  console.log('Total images found:', images.length);
  for (const img of images) {
    const src = await img.getAttribute('src');
    console.log('Image src:', src);
  }



  await browser.close();
}

testHeadless().catch(console.error);
