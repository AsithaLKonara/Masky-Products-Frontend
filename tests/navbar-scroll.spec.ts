import { test, expect } from '@playwright/test';

test.setTimeout(60000);

test('navbar transparent on hero section and glass white when scrolled past hero', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const nav = page.locator('nav');
  await expect(nav).toBeVisible();

  // 1. Initial state at top of hero section
  console.log('--- Test Stage 1: Scroll at top (0px) ---');
  let navClass = await nav.getAttribute('class');
  let computedBg = await nav.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  console.log('Class:', navClass);
  console.log('Computed Background:', computedBg);
  expect(navClass).toContain('bg-transparent');
  await page.screenshot({ path: 'tests/screenshots/1-hero-top-0px.png' });

  // 2. Mid-hero section (e.g. 350px - still on hero section)
  console.log('--- Test Stage 2: Scroll on hero section (350px) ---');
  await page.evaluate(() => window.scrollTo(0, 350));
  await page.waitForTimeout(600);
  navClass = await nav.getAttribute('class');
  computedBg = await nav.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  console.log('Class at 350px:', navClass);
  console.log('Computed Background at 350px:', computedBg);
  expect(navClass).toContain('bg-transparent');
  await page.screenshot({ path: 'tests/screenshots/2-hero-mid-350px.png' });

  // 3. Scrolled past hero section (950px - on stats and collections)
  console.log('--- Test Stage 3: Scrolled past hero section (950px) ---');
  await page.evaluate(() => window.scrollTo(0, 950));
  await page.waitForTimeout(800);
  navClass = await nav.getAttribute('class');
  computedBg = await nav.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  const backdropFilter = await nav.evaluate((el) => window.getComputedStyle(el).backdropFilter || window.getComputedStyle(el).webkitBackdropFilter);
  console.log('Class at 950px:', navClass);
  console.log('Computed Background at 950px:', computedBg);
  console.log('Computed BackdropFilter at 950px:', backdropFilter);
  expect(navClass).toContain('bg-white/80');
  expect(navClass).toContain('backdrop-blur-md');
  expect(computedBg).toContain('255, 255, 255');
  await page.screenshot({ path: 'tests/screenshots/3-scrolled-past-hero-950px.png' });

  // 4. Scroll back to top into hero section
  console.log('--- Test Stage 4: Scroll back up to hero (0px) ---');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  navClass = await nav.getAttribute('class');
  computedBg = await nav.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  console.log('Class after scroll back:', navClass);
  console.log('Computed Background after scroll back:', computedBg);
  expect(navClass).toContain('bg-transparent');
  await page.screenshot({ path: 'tests/screenshots/4-back-to-hero-0px.png' });
});
