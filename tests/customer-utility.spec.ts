import { test, expect } from '@playwright/test';

test.setTimeout(60000);

test.describe('Customer Utility Pages Redesign', () => {
  test('displays redesigned track order page', async ({ page }) => {
    await page.goto('/track-order', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify track order heading
    await expect(page.getByRole('heading', { level: 1, name: 'Track Your Consignment' })).toBeVisible();
    await expect(page.getByPlaceholder(/Enter phone number/i)).toBeVisible();

    // Take track order screenshot
    await page.screenshot({ path: 'tests/screenshots/track-order-redesigned-desktop.png' });
  });

  test('displays redesigned returns and exchanges page', async ({ page }) => {
    await page.goto('/returns', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify returns heading
    await expect(page.getByRole('heading', { level: 1, name: 'Returns & Exchanges' })).toBeVisible();
    await expect(page.getByPlaceholder('e.g. ORD-10023')).toBeVisible();

    // Take returns screenshot
    await page.screenshot({ path: 'tests/screenshots/returns-redesigned-desktop.png' });
  });

  test('displays redesigned interactive FAQ page', async ({ page }) => {
    await page.goto('/faq', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify FAQ heading and category filter
    await expect(page.getByRole('heading', { level: 1, name: 'Frequently Asked Questions' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delivery', exact: true })).toBeVisible();

    // Verify first accordion item is open
    await expect(page.getByText(/We partner with trusted express couriers/i)).toBeVisible();

    // Take FAQ screenshot
    await page.screenshot({ path: 'tests/screenshots/faq-redesigned-desktop.png' });
  });
});
