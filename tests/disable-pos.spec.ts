import { test, expect } from '@playwright/test';
import { setupAdminSession } from './auth-helper';

test.describe('Task 1: Disable POS Feature Verification', () => {
  test('POS Terminal and POS Sales do not appear in the sidebar', async ({ context, page }) => {
    await setupAdminSession(context, page);

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify other sidebar links like Overview, Products, Orders exist
    await expect(page.locator('aside a[href="/admin"]')).toBeVisible();

    // Verify sidebar does NOT have "POS Terminal" link
    const posTerminalLink = page.locator('aside a[href="/pos"]');
    await expect(posTerminalLink).toHaveCount(0);

    // Verify sidebar does NOT have "POS Sales" link
    const posSalesLink = page.locator('aside a[href="/admin/pos-sales"]');
    await expect(posSalesLink).toHaveCount(0);

    // Verify sidebar does NOT show POS text anywhere
    const posText = page.locator('aside').getByText('POS Terminal', { exact: true });
    await expect(posText).toHaveCount(0);

    // Capture screenshot of sidebar
    await page.screenshot({ path: 'tests/screenshots/disabled-pos-sidebar.png' });
  });

  test('Direct navigation to /pos redirects away from POS', async ({ context, page }) => {
    await setupAdminSession(context, page);

    // Navigate to /pos
    await page.goto('/pos', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // The user should have been redirected away to /admin
    expect(page.url()).not.toContain('/pos');
    expect(page.url()).toContain('/admin');

    await page.screenshot({ path: 'tests/screenshots/disabled-pos-redirect.png' });
  });

  test('Direct navigation to /admin/pos-sales redirects away', async ({ context, page }) => {
    await setupAdminSession(context, page);

    await page.goto('/admin/pos-sales', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    expect(page.url()).not.toContain('/admin/pos-sales');
    expect(page.url()).toContain('/admin');
  });

  test('Reports overview page does not display Point of Sale report card', async ({ context, page }) => {
    await setupAdminSession(context, page);

    await page.goto('/admin/reports', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const posReportCard = page.locator('a[href="/admin/reports/pos"]');
    await expect(posReportCard).toHaveCount(0);

    const posReportText = page.getByText('Point of Sale (POS)', { exact: true });
    await expect(posReportText).toHaveCount(0);

    await page.screenshot({ path: 'tests/screenshots/disabled-pos-reports.png' });
  });

  test('Direct navigation to /admin/reports/pos redirects away', async ({ context, page }) => {
    await setupAdminSession(context, page);

    await page.goto('/admin/reports/pos', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    expect(page.url()).not.toContain('/admin/reports/pos');
  });
});
