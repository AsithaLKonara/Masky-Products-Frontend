import { test, expect } from '@playwright/test';
import { setupAdminSession } from './auth-helper';

test.describe('Task 2: Disable Multi-Branch Management Verification', () => {
  test('Dashboard hides branch selector tabs and sidebar hides Branches & Retail section', async ({ context, page }) => {
    await setupAdminSession(context, page);

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 1. Verify branch filter segmented tabs are NOT present on dashboard
    const branchTabsContainer = page.locator('button:has-text("Online")');
    await expect(branchTabsContainer).toHaveCount(0);

    // 2. Verify sidebar does NOT have "Branches" link
    const branchesLink = page.locator('aside a[href="/admin/branches"]');
    await expect(branchesLink).toHaveCount(0);

    // 3. Verify sidebar does NOT have "RETAIL" section header
    const retailHeader = page.locator('aside').getByText('Retail', { exact: true });
    await expect(retailHeader).toHaveCount(0);

    // Capture screenshot of dashboard and sidebar
    await page.screenshot({ path: 'tests/screenshots/disabled-branches-dashboard.png' });
  });

  test('Direct navigation to /admin/branches redirects away', async ({ context, page }) => {
    await setupAdminSession(context, page);

    await page.goto('/admin/branches');
    await page.waitForTimeout(1000);

    expect(page.url()).not.toContain('/admin/branches');
    expect(page.url()).toContain('/admin');
  });

  test('Direct navigation to /branch-admin redirects away', async ({ context, page }) => {
    await setupAdminSession(context, page);

    await page.goto('/branch-admin');
    await page.waitForTimeout(1000);

    expect(page.url()).not.toContain('/branch-admin');
    expect(page.url()).toContain('/admin');
  });

  test('Reports overview page does not display Branches report card', async ({ context, page }) => {
    await setupAdminSession(context, page);

    await page.goto('/admin/reports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const branchesReportCard = page.locator('a[href="/admin/reports/branches"]');
    await expect(branchesReportCard).toHaveCount(0);

    await page.screenshot({ path: 'tests/screenshots/disabled-branches-reports.png' });
  });

  test('Inventory page does not show Branches tab', async ({ context, page }) => {
    await setupAdminSession(context, page);

    await page.goto('/admin/inventory');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Should have Stock Levels and Stock Transfers, but NOT Branches tab
    await expect(page.locator('button:has-text("Stock Levels")')).toBeVisible();
    await expect(page.locator('button:has-text("Stock Transfers")')).toBeVisible();
    await expect(page.locator('button:has-text("Branches")')).toHaveCount(0);

    await page.screenshot({ path: 'tests/screenshots/disabled-branches-inventory.png' });
  });

  test('Orders page STILL supports branch filtering for e-commerce website orders', async ({ context, page }) => {
    await setupAdminSession(context, page);

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Branch selection dropdown exists for e-commerce orders
    const branchDropdown = page.locator('select').filter({ hasText: 'All Branches' });
    await expect(branchDropdown).toBeVisible();

    await page.screenshot({ path: 'tests/screenshots/ecommerce-orders-branch-filter.png' });
  });
});
