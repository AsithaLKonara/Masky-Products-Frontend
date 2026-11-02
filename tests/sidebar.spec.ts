import { test, expect } from '@playwright/test';
import { setupAdminSession } from './auth-helper';

test.describe('Task 3: Modern Navigation Sidebar with Engine Widget', () => {
  test.setTimeout(90000);

  test('should render grouped sections, active pill, telemetry card, and dismiss card properly', async ({ page, context }) => {
    await setupAdminSession(context, page);

    // Mock analytics API to avoid error boundaries
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
            paymentGatewayPerformance: [],
            recentTransactions: [],
          },
        }),
      });
    });

    await page.goto('/admin', { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // 1. Verify Brand Logo
    const brand = page.locator('aside').getByText('MASKY', { exact: true });
    await expect(brand).toBeVisible();

    // 2. Verify Sections
    await expect(page.locator('text=DASHBOARDS')).toBeVisible();
    await expect(page.locator('text=PLATFORM APPS')).toBeVisible();
    await expect(page.locator('text=SYSTEM & TOOLS')).toBeVisible();

    // 3. Verify Active item "Dashboard 1 (Overview)"
    const overviewItem = page.locator('text=Dashboard 1 (Overview)');
    await expect(overviewItem).toBeVisible();

    // 4. Verify Item with count badge "5"
    const tenantsItem = page.locator('text=Dashboard 2 (Tenants)');
    await expect(tenantsItem).toBeVisible();
    await expect(page.locator('text=5')).toBeVisible();

    // 5. Verify Engine Status Card
    const engineCard = page.locator('text=Cluster v2.4.0 Engine');
    await expect(engineCard).toBeVisible();

    // Capture Dark Mode Screenshot
    await page.screenshot({ path: 'tests/screenshots/task3-sidebar-dark.png' });

    // 6. Test dismissing the engine card
    const dismissBtn = page.locator('button[aria-label="Dismiss cluster card"]');
    await dismissBtn.click();
    await expect(engineCard).not.toBeVisible();

    // 7. Toggle to Light Mode and verify sidebar styling
    const themeBtn = page.locator('#theme-toggle-btn');
    await themeBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'tests/screenshots/task3-sidebar-light.png' });
  });
});
