import { test, expect } from '@playwright/test';

test.setTimeout(60000);

test.describe('Search Page Redesign', () => {
  test('displays redesigned search page with luxury search input and suggestion tags', async ({ page }) => {
    await page.goto('/search', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify search heading
    await expect(page.getByRole('heading', { level: 1, name: 'Search The Wardrobe' })).toBeVisible();

    // Verify search input
    const searchInput = page.getByPlaceholder('Search by silhouette, textile, or cut...');
    await expect(searchInput).toBeVisible();

    // Verify quick suggestion buttons
    await expect(page.getByRole('button', { name: 'Silk' })).toBeVisible();

    // Click suggestion tag 'Silk'
    await page.getByRole('button', { name: 'Silk' }).click();
    await page.waitForTimeout(1500);

    // Take screenshot of search results
    await page.screenshot({ path: 'tests/screenshots/search-results-desktop.png' });
  });
});
