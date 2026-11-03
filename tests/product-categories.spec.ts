import { test, expect } from '@playwright/test';

test.describe('Task 3: Product Categories Alignment', () => {
  test.setTimeout(60000);

  test('CategoryBar renders the 4 official product categories', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });

    const nav = page.locator('nav[aria-label="Category Navigation"]');
    await expect(nav).toBeVisible({ timeout: 15000 });

    await expect(nav.getByText('Fresh mushrooms product')).toBeVisible();
    await expect(nav.getByText('Dehydrated product')).toBeVisible();
    await expect(nav.getByText('Redy to eat product')).toBeVisible();
    await expect(nav.getByText('Frezon product')).toBeVisible();

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/categories-bar-aligned.png',
      fullPage: false,
    });
  });

  test('Category Route renders mushroom headline for dehydrated-product', async ({ page }) => {
    await page.goto('/categories/dehydrated-product', { waitUntil: 'domcontentloaded' });

    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 15000 });
    await expect(heading).toContainText('Dehydrated Product');

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/category-dehydrated-desktop.png',
      fullPage: false,
    });
  });
});

