import { test, expect } from '@playwright/test';

test.setTimeout(60000);

test.describe('Cart and Checkout Flow Redesign', () => {
  test('displays redesigned shopping cart page', async ({ page }) => {
    await page.goto('/cart', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify editorial heading
    await expect(page.getByRole('heading', { level: 1, name: 'Your Wardrobe Bag' })).toBeVisible();

    // Verify CategoryBar and Breadcrumb
    await expect(page.locator('nav[aria-label="Category Navigation"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();

    // Take cart screenshot
    await page.screenshot({ path: 'tests/screenshots/cart-redesigned-desktop.png' });
  });

  test('displays redesigned secure checkout page', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify checkout heading and realtime sync badge
    await expect(page.getByRole('heading', { level: 1, name: 'Secure Checkout' })).toBeVisible();
    await expect(page.locator('#realtime-sync-indicator')).toBeVisible();

    // Verify shipping details card and payment option card
    await expect(page.getByRole('heading', { name: 'Shipping Details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Payment Option' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Wardrobe Review' })).toBeVisible();

    // Take checkout screenshot
    await page.screenshot({ path: 'tests/screenshots/checkout-redesigned-desktop.png' });
  });

  test('displays redesigned checkout failed recovery page', async ({ page }) => {
    await page.goto('/checkout/failed?orderNumber=ORD-DEMO-2026', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify failure recovery heading
    await expect(page.getByRole('heading', { level: 1, name: 'Payment Unsuccessful' })).toBeVisible();
    await expect(page.getByText('ORD-DEMO-2026')).toBeVisible();

    // Take checkout failed screenshot
    await page.screenshot({ path: 'tests/screenshots/checkout-failed-desktop.png' });
  });
});
