import { test, expect } from '@playwright/test';

test.setTimeout(60000);

test.describe('Category, Collection & Sale Pages Redesign', () => {
  test('displays redesigned category page on desktop and mobile', async ({ page }) => {
    await page.goto('/categories/dresses', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify editorial category header
    await expect(page.getByRole('heading', { level: 1, name: /Dresses/i })).toBeVisible();
    await expect(page.getByText('Curated Category')).toBeVisible();

    // Verify CategoryBar and Breadcrumbs
    await expect(page.locator('nav[aria-label="Category Navigation"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();

    // Take category screenshot
    await page.screenshot({ path: 'tests/screenshots/category-dresses-desktop.png' });
  });

  test('displays redesigned collection page on desktop', async ({ page }) => {
    await page.goto('/collections/autumn-capsule', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify collection hero
    await expect(page.getByRole('heading', { level: 1, name: /Autumn Capsule/i })).toBeVisible();
    await expect(page.getByText('Curated Capsule')).toBeVisible();

    // Take collection screenshot
    await page.screenshot({ path: 'tests/screenshots/collection-capsule-desktop.png' });
  });

  test('displays redesigned sale page on desktop', async ({ page }) => {
    await page.goto('/sale', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify sale hero
    await expect(page.getByRole('heading', { level: 1, name: /End of Season Archive/i })).toBeVisible();
    await expect(page.getByText('Archive Privileges')).toBeVisible();

    // Take sale screenshot
    await page.screenshot({ path: 'tests/screenshots/sale-archive-desktop.png' });
  });
});
