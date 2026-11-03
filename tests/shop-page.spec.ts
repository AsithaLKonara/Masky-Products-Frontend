import { test, expect } from '@playwright/test';

test.setTimeout(60000);

test.describe('Shop Catalog Page Redesign', () => {
  test('displays redesigned luxury organic shop catalog on desktop', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 1. Verify Category Bar has redesigned pill buttons
    const categoryBar = page.locator('nav[aria-label="Category Navigation"]');
    await expect(categoryBar).toBeVisible();
    const allPiecesPill = categoryBar.getByRole('link', { name: 'All Pieces' });
    await expect(allPiecesPill).toBeVisible();

    // 2. Verify Editorial Header
    const heading = page.getByRole('heading', { name: 'All Creations' });
    await expect(heading).toBeVisible();

    // 3. Verify Filters Sidebar exists
    const filterSidebar = page.locator('aside[aria-label="Product Filters"]');
    await expect(filterSidebar).toBeVisible();
    await expect(filterSidebar.getByText('Filter Pieces')).toBeVisible();

    // 4. Take desktop screenshot
    await page.screenshot({ path: 'tests/screenshots/shop-redesigned-desktop.png', fullPage: false });

    // 5. Check mobile drawer behavior
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    const filterButton = page.getByRole('button', { name: 'Filters', exact: true });
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);
      await expect(page.locator('aside[aria-label="Product Filters"]')).toBeVisible();
      await page.screenshot({ path: 'tests/screenshots/shop-redesigned-mobile-drawer.png' });
    }
  });
});
