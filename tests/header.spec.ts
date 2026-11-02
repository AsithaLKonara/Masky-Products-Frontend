import { test, expect } from '@playwright/test';
import { setupAdminSession } from './auth-helper';

test.describe('Task 2: Upgraded Header Component', () => {
  test.setTimeout(90000);

  test('should render omnisearch, status badge, action buttons, and toggle theme smoothly', async ({ page, context }) => {
    // Authenticate as Super Admin
    await setupAdminSession(context, page);

    // Mock analytics API response to prevent network delays
    await page.route('**/api/v1/analytics/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            revenue: { value: 22500, trend: '+100%', trendType: 'positive' },
            orders: { value: 7, trend: '+100%', trendType: 'positive' },
            newCustomers: { value: 5, trend: '+100%', trendType: 'positive' },
            avgOrderValue: { value: 3214, trend: '+100%', trendType: 'positive' },
            pendingOrders: { value: 2, trend: '0%', trendType: 'neutral' },
            inventoryValue: { value: 1250000, trend: '+5%', trendType: 'positive' },
            loyaltyPoints: { value: 840, trend: '+12%', trendType: 'positive' },
            returns: { value: 0, trend: '0%', trendType: 'neutral' },
            paymentGatewayPerformance: [
              { gw: 'KOKO', amount: 22500, count: 5, pct: 67 },
              { gw: 'MINTPAY', amount: 1100, count: 1, pct: 3 },
              { gw: 'ONEPAY', amount: 10000, count: 3, pct: 30 },
              { gw: 'CASH', amount: 0, count: 0, pct: 0 },
            ],
            recentTransactions: [],
          },
        }),
      });
    });

    await page.goto('/admin', { timeout: 60000 });
    // Wait for hydration by checking that interactive elements are ready
    await page.waitForLoadState('networkidle');

    // 1. Verify Omnisearch input with ⌘K badge
    const searchInput = page.locator('input[placeholder*="Search tenants"]');
    await expect(searchInput).toBeVisible();

    // 2. Verify Status Badge ("Cluster Online")
    const statusBadge = page.locator('text=Cluster Online');
    await expect(statusBadge).toBeVisible();

    // 3. Verify Action Button ("New Tenant")
    const newTenantBtn = page.locator('button:has-text("New Tenant")');
    await expect(newTenantBtn).toBeVisible();

    // 4. Verify Theme Toggle Button
    const themeBtn = page.locator('#theme-toggle-btn');
    await expect(themeBtn).toBeVisible();

    // Verify dark mode default
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
    await page.screenshot({ path: 'tests/screenshots/task2-header-dark.png' });

    // Wait a brief moment for hydration event listeners, then click
    await page.waitForTimeout(500);
    await themeBtn.click();
    await expect(html).not.toHaveClass(/dark/);
    await page.screenshot({ path: 'tests/screenshots/task2-header-light.png' });

    // Click theme toggle to switch back to Dark mode
    await themeBtn.click();
    await expect(html).toHaveClass(/dark/);
  });
});
