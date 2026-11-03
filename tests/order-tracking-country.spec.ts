import { test, expect } from '@playwright/test';

test.describe('Task 7: Order Tracking Country Restriction & Selector', () => {
  test.setTimeout(90000);

  test('Order tracking page separates country selector and enforces Sri Lanka domestic rule', async ({ page }) => {
    await page.goto('/track-order', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // 1. Check Page Header and Subtitle
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 15000 });
    await expect(heading).toContainText('Track Your Consignment');

    // 2. Verify Country Selector exists and defaults to Sri Lanka
    const countrySelect = page.getByTestId('country-selector');
    await expect(countrySelect).toBeVisible();
    await expect(countrySelect).toHaveValue('LK');

    // 3. Verify Phone Input is visible for Sri Lanka
    const phoneInput = page.locator('input[type="tel"]');
    await expect(phoneInput).toBeVisible();
    await expect(page.getByText('🇱🇰 +94')).toBeVisible();

    // 4. Take screenshot of initial Sri Lanka state
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/track-order-sri-lanka-desktop.png',
      fullPage: false,
    });

    // 5. Select United States (US) from country dropdown
    await countrySelect.selectOption('US');
    await countrySelect.dispatchEvent('change');

    // 6. Verify "Tracking not available for your country" notice is displayed
    const alertHeading = page.getByText('Tracking not available for your country');
    await expect(alertHeading).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Automated courier dispatch tracking is currently supported only for domestic orders within Sri Lanka')).toBeVisible();

    // 7. Verify export contact channels are shown
    const emailLink = page.locator('a[href="mailto:maskyproduct@gmail.com"]').first();
    await expect(emailLink).toBeVisible();
    const whatsappLink = page.locator('a[href*="94783130967"]').first();
    await expect(whatsappLink).toBeVisible();

    // 8. Verify phone input form is not active / disabled for non-LK
    await expect(page.locator('input[type="tel"]')).not.toBeVisible();

    // 9. Take screenshot of Unsupported Country state
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/track-order-unsupported-country-desktop.png',
      fullPage: false,
    });

    // 10. Switch back to Sri Lanka and ensure form re-appears
    await countrySelect.selectOption('LK');
    await countrySelect.dispatchEvent('change');
    await expect(page.locator('input[type="tel"]')).toBeVisible({ timeout: 10000 });
    await expect(alertHeading).not.toBeVisible();
  });
});
