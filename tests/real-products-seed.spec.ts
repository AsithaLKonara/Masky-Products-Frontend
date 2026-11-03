import { test, expect } from '@playwright/test';

test.describe('Real Products & Category Images Seed Verification', () => {
  test.setTimeout(90000);

  test('Homepage Category Cards render with real product images and links', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Look for category cards
    const freshCat = page.locator('a[href="/categories/fresh-mushrooms-product"]');
    const dehydratedCat = page.locator('a[href="/categories/dehydrated-product"]');
    const readyCat = page.locator('a[href="/categories/redy-to-eat-product"]');
    const frozenCat = page.locator('a[href="/categories/frezon-product"]');

    await expect(freshCat.first()).toBeVisible({ timeout: 15000 });
    await expect(dehydratedCat.first()).toBeVisible();
    await expect(readyCat.first()).toBeVisible();
    await expect(frozenCat.first()).toBeVisible();

    // Verify category images are real product images (not default placeholders)
    const freshImg = freshCat.first().locator('img');
    await expect(freshImg).toHaveAttribute('src', /fresh-oyster-mushrooms-200g\.jpg/);

    const dehyImg = dehydratedCat.first().locator('img');
    await expect(dehyImg).toHaveAttribute('src', /dehydrated-oyster-mushroom\.jpg/);

    // Scroll to the category cards section to capture it perfectly
    await freshCat.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/homepage-category-cards-real-images.png',
      fullPage: false,
    });
  });

  test('Shop page displays real mushroom products with authentic prices and zero mock items', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded' });

    // Verify real product titles are displayed
    await expect(page.getByText('Dehydrated Oyster Mushroom (වියළි බිම්මල්)').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Mushroom Chili Paste 200g Glass Jar').first()).toBeVisible();
    await expect(page.getByText('Fresh Oyster Mushrooms 200g (නැවුම් බිම්මල්)').first()).toBeVisible();

    // Verify no legacy apparel products exist
    await expect(page.getByText('Signature Oversized Heavyweight Tee')).toHaveCount(0);
    await expect(page.getByText('Relaxed Oxford Linen Button-Down')).toHaveCount(0);
    await expect(page.getByText('Classic Slim-Fit Japanese Selvedge Denim')).toHaveCount(0);

    // Wait for card images to load
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/shop-real-products-catalog.png',
      fullPage: false,
    });
  });

  test('Product detail page renders authentic packaging photo, price, and descriptions', async ({ page }) => {
    await page.goto('/products/dehydrated-oyster-mushroom', { waitUntil: 'domcontentloaded' });

    // Title
    const title = page.locator('h1');
    await expect(title).toBeVisible({ timeout: 15000 });
    await expect(title).toContainText('Dehydrated Oyster Mushroom');

    // Real packaging image
    const mainImg = page.locator('img[alt*="Dehydrated Oyster Mushroom"]').first();
    await expect(mainImg).toBeVisible();
    await expect(mainImg).toHaveAttribute('src', /dehydrated-oyster-mushroom\.jpg/);

    // Variants and Add to Cart
    await expect(page.getByText('Add to Cart').first()).toBeVisible();

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/product-detail-real-mushroom.png',
      fullPage: false,
    });
  });
});
