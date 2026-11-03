import { test, expect } from '@playwright/test';

test.setTimeout(60000);

test.describe('Product Details Page Redesign', () => {
  const productSlug = 'pleated-silk-blend-slip-midi-dress';

  test('displays redesigned luxury organic product details page on desktop', async ({ page }) => {
    await page.goto(`/products/${productSlug}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 1. Verify Category Bar
    const categoryBar = page.locator('nav[aria-label="Category Navigation"]');
    await expect(categoryBar).toBeVisible();

    // 2. Verify Breadcrumb
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();

    // 3. Verify Product Title
    const title = page.getByRole('heading', { level: 1, name: /Pleated Silk-Blend Slip Midi Dress/i });
    await expect(title).toBeVisible();

    // 4. Verify Pricing and Koko installment badge
    await expect(page.getByText(/Pay in 3 interest-free installments/i)).toBeVisible();

    // 5. Verify Add to Cart button
    const addToCartButton = page.getByRole('button', { name: /Add to Cart/i }).first();
    await expect(addToCartButton).toBeVisible();

    // 6. Verify Product Tabs
    const tabsContainer = page.getByRole('button', { name: 'Product Details' });
    await expect(tabsContainer).toBeVisible();

    // 7. Take desktop screenshot
    await page.screenshot({ path: 'tests/screenshots/product-redesigned-desktop.png', fullPage: false });

    // 8. Mobile viewport check & sticky bar
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    // Check that mobile sticky add to cart bar is visible
    const mobileStickyBar = page.locator('.fixed.bottom-0');
    await expect(mobileStickyBar).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/product-redesigned-mobile.png' });
  });
});
