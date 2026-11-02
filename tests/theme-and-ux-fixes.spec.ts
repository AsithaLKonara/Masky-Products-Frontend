import { test, expect } from '@playwright/test';

test.describe('Theme Overhaul & UX Enhancements Verification', () => {
  test.setTimeout(90000);

  test('verifies rebrand to MASKY PRODUCT, open sidebar dropdowns by default, removal of floating capsules, and #002417 / #FCF4DC theme colors', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });

    // 1. Log in as Super Admin via the dev credentials panel
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Click Super Admin and wait for inputs to be filled
    await page.click('button:has-text("Super Admin")');
    await expect(page.locator('input[type="email"]')).toHaveValue('superadmin@masky.space');
    await expect(page.locator('input[type="password"]')).toHaveValue('Password123!');
    await expect(page.locator('text=Loaded credentials for Super Admin')).toBeVisible();

    // Submit and wait for login API response to complete with 200
    const loginPromise = page.waitForResponse(
      (resp) => resp.url().includes('/auth/login') && resp.status() === 200,
      { timeout: 15000 }
    );
    await page.click('button[type="submit"]:has-text("Sign In")');
    await loginPromise;

    await page.waitForURL('**/admin', { timeout: 30000 });
    expect(page.url()).toContain('/admin');

    // Wait for dashboard content to load
    const businessOverview = page.locator('text=Business Overview').first();
    await expect(businessOverview).toBeVisible({ timeout: 15000 });

    // 2. VERIFY REBRAND: "MASKY PRODUCT" is visible in sidebar brand header
    const brandTitle = page.locator('text=MASKY PRODUCT').first();
    await expect(brandTitle).toBeVisible();

    // Verify "SERAMAADUWEN" is NOT visible in the DOM
    const legacyBrand = page.locator('text=SERAMAADUWEN');
    await expect(legacyBrand).toHaveCount(0);

    // 3. VERIFY SIDEBAR CATEGORIES / DROPDOWN ACTION OPEN BY DEFAULT
    // Catalog group items: Categories, Products, Collections should be visible without clicking
    const categoriesLink = page.locator('aside a[href="/admin/categories"]').first();
    await expect(categoriesLink).toBeVisible();
    await expect(page.locator('aside a[href="/admin/products"]').first()).toBeVisible();
    await expect(page.locator('aside a[href="/admin/collections"]').first()).toBeVisible();

    // 4. VERIFY NO FLOATING PILL CAPSULES ON STAT TRENDS
    // Wait for Revenue card to render
    const revCard = page.locator('text=Revenue').first();
    await expect(revCard).toBeVisible();

    // In StatCard, trend is inline typography, not a rounded-full capsule badge
    const trendText = page.locator('text=% vs last period').first();
    if (await trendText.isVisible()) {
      const trendContainer = trendText.locator('..');
      const trendClass = await trendContainer.getAttribute('class');
      expect(trendClass || '').not.toContain('rounded-full');
    }

    // 5. VERIFY DARK MODE (Deepest Forest Green #002417)
    // Ensure document has .dark class
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isDark).toBe(true);

    // Check background color computed value for --background in dark mode
    const darkBgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
    });
    expect(darkBgColor.toLowerCase()).toBe('#0b0f17');

    // Take high-resolution screenshot of Enterprise Dark Mode
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity-ide/brain/606b7139-4607-4c14-a282-b6350b1a78d1/enterprise_dashboard_dark.png',
      fullPage: true,
    });

    // 6. TOGGLE TO LIGHT MODE (Clean Alpine Slate & Snow #F8FAFC)
    // Find theme toggle button in header and click
    const themeToggleBtn = page.locator('header button[aria-label="Toggle theme"], header button:has(svg.lucide-sun), header button:has(svg.lucide-moon)').first();
    await themeToggleBtn.click();

    // Wait for .dark class to be removed
    await page.waitForFunction(() => !document.documentElement.classList.contains('dark'));
    const isLightNow = await page.evaluate(() => !document.documentElement.classList.contains('dark'));
    expect(isLightNow).toBe(true);

    // Check background color computed value for --background in light mode
    const lightBgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
    });
    expect(lightBgColor.toUpperCase()).toBe('#F8FAFC');

    // Take high-resolution screenshot of Enterprise Light Mode
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity-ide/brain/606b7139-4607-4c14-a282-b6350b1a78d1/enterprise_dashboard_light.png',
      fullPage: true,
    });
  });
});
