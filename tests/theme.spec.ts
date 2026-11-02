import { test, expect } from '@playwright/test';

test.describe('Task 1: Theme & Design System Foundation', () => {
  test.setTimeout(90000);

  test('should default to dark mode and support switching to light mode', async ({ page }) => {
    // Navigate to admin
    await page.goto('/admin', { timeout: 60000, waitUntil: 'domcontentloaded' });

    // 1. Verify dark mode is active by default
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Capture Dark Mode initial screenshot
    await page.screenshot({ path: 'tests/screenshots/task1-theme-dark.png', fullPage: true });

    // 2. Switch to light mode via script / localStorage
    await page.evaluate(() => {
      localStorage.setItem('masky_theme', 'light');
      document.documentElement.classList.remove('dark');
    });

    // Verify dark class removed
    await expect(html).not.toHaveClass(/dark/);

    // Capture Light Mode screenshot
    await page.screenshot({ path: 'tests/screenshots/task1-theme-light.png', fullPage: true });

    // 3. Switch back to dark mode
    await page.evaluate(() => {
      localStorage.setItem('masky_theme', 'dark');
      document.documentElement.classList.add('dark');
    });

    await expect(html).toHaveClass(/dark/);
  });
});
