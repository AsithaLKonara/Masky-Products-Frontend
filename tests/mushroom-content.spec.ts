import { test, expect } from '@playwright/test';

test.describe('Task 4: Dehydrated Mushroom Site Content Overhaul', () => {
  test.setTimeout(90000);

  test('Home page marquee ribbon highlights dehydrated gourmet mushrooms', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const marquee = page.locator('.animate-marquee');
    await expect(marquee).toBeVisible({ timeout: 15000 });
    await expect(marquee).toContainText('100% Organic Gourmet Mushrooms');
    await expect(marquee).toContainText('Low-Temperature Dehydration');
    await expect(marquee).toContainText('12-Month Shelf Life');
  });

  test('About page showcases gourmet mushroom manifesto, Daraz link and official email', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' });

    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 15000 });
    await expect(heading).toContainText('Pure Earth, Intense Umami');

    // Section title
    await expect(page.getByText('Grown & Dehydrated with Quiet Intention').first()).toBeVisible();
    await expect(page.getByText('Low-Temp Dehydration').first()).toBeVisible();

    // Email link check
    const emailLink = page.locator('a[href="mailto:maskyproduct@gmail.com"]');
    await expect(emailLink.first()).toBeVisible();

    // Daraz link check
    const darazLink = page.locator('a[href="https://s.daraz.lk/s.Z7xIF"]');
    await expect(darazLink.first()).toBeVisible();

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/about-mushroom-content.png',
      fullPage: false,
    });
  });

  test('FAQ page displays mushroom rehydration, 12-month shelf life, and quality category pill', async ({ page }) => {
    await page.goto('/faq', { waitUntil: 'domcontentloaded' });

    // Category pill
    const mushroomPill = page.getByRole('button', { name: /Mushrooms & Quality/i });
    await expect(mushroomPill).toBeVisible({ timeout: 15000 });

    // FAQ items
    await expect(page.getByText('How do I rehydrate dehydrated mushrooms for cooking?')).toBeVisible();
    await expect(page.getByText('What is the shelf life and proper storage for dehydrated products?')).toBeVisible();

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/faq-mushroom-content.png',
      fullPage: false,
    });
  });

  test('Shop page displays gourmet mushroom header and search placeholder reflects mushroom harvest', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });

    const badge = page.getByText('Gourmet Mushroom Collection');
    await expect(badge).toBeVisible({ timeout: 15000 });

    // Go to search page
    await page.goto('/search', { waitUntil: 'domcontentloaded' });
    const searchHeading = page.getByRole('heading', { name: 'Search Our Harvest' });
    await expect(searchHeading).toBeVisible({ timeout: 15000 });

    const searchInput = page.getByPlaceholder('Search by mushroom variety, culinary cut, or category...');
    await expect(searchInput).toBeVisible();

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/shop-mushroom-content.png',
      fullPage: false,
    });
  });
});
