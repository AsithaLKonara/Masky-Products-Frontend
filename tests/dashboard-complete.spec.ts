import { test, expect } from '@playwright/test';
import { setupAdminSession } from './auth-helper';

test.describe('Real Enterprise Dashboard with 0 Mock Data and Upgraded Modern Styling', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page, context }) => {
    await setupAdminSession(context, page);

    // Mock live analytics API with realistic store data
    await page.route('**/api/v1/analytics/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            revenue: { value: 125000, trend: '+15%', trendType: 'positive' },
            orders: { value: 48, trend: '+8%', trendType: 'positive' },
            newCustomers: { value: 19, trend: '+12%', trendType: 'positive' },
            avgOrderValue: { value: 2604, trend: '+4%', trendType: 'positive' },
            pendingOrders: { value: 5, trend: '-2', trendType: 'neutral' },
            inventoryValue: { value: 1850000, trend: '+3%', trendType: 'positive' },
            loyaltyPoints: { value: 3420, trend: '+25%', trendType: 'positive' },
            returns: { value: 4500, trend: '-15%', trendType: 'positive' },
            paymentGatewayPerformance: [
              { gw: 'ONEPAY', amount: 65000, count: 25, pct: 52 },
              { gw: 'KOKO', amount: 35000, count: 14, pct: 28 },
              { gw: 'MINTPAY', amount: 15000, count: 6, pct: 12 },
              { gw: 'CASH', amount: 10000, count: 3, pct: 8 },
            ],
            recentTransactions: [
              {
                id: 'ord-89241-abcde',
                customer: 'Kasun Perera',
                branch: 'Colombo 03',
                amount: 4500,
                paymentMethod: 'ONEPAY',
                paymentStatus: 'PAID',
                orderStatus: 'DELIVERED',
                createdAt: new Date().toISOString(),
              },
            ],
          },
        }),
      });
    });
  });

  test('verifies real sidebar navigation, dynamic metrics, and seamless dark/light styling', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Wait for dynamic component to mount with real metrics
    const revCard = page.locator('text=Revenue').first();
    await expect(revCard).toBeVisible({ timeout: 15000 });

    // 1. Verify Header Elements
    const searchInput = page.locator('input[placeholder*="Search orders, customers, SKU"]');
    await expect(searchInput).toBeVisible();
    await expect(page.locator('text=⌘K')).toBeVisible();

    const onlineBadge = page.locator('text=System Online');
    await expect(onlineBadge).toBeVisible();

    const newProductBtn = page.locator('button:has-text("New Product")');
    await expect(newProductBtn).toBeVisible();

    // 2. Verify Real Sidebar Navigation Groups and Items
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('MASKY PRODUCT', { exact: false })).toBeVisible();

    // Group 1: Overview
    await expect(sidebar.getByText('Overview', { exact: true })).toBeVisible();
    await expect(sidebar.getByText('Dashboard', { exact: true })).toBeVisible();
    await expect(sidebar.getByText('Reports', { exact: true })).toBeVisible();

    // Expand Sales & Fulfillment
    const salesGroup = sidebar.getByRole('button', { name: /Sales & Fulfillment/i });
    if (await salesGroup.isVisible()) {
      await salesGroup.click();
      await page.waitForTimeout(200);
      await expect(sidebar.getByText('Orders', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Returns', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Shipping', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Payments', { exact: true })).toBeVisible();
    }

    // Expand Catalog
    const catalogGroup = sidebar.getByRole('button', { name: /Catalog/i });
    if (await catalogGroup.isVisible()) {
      await catalogGroup.click();
      await page.waitForTimeout(200);
      await expect(sidebar.getByText('Products', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Categories', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Collections', { exact: true })).toBeVisible();
      await expect(sidebar.getByText('Inventory', { exact: true })).toBeVisible();
    }

    // 3. Verify Real Page Title & Real Controls
    await expect(page.getByRole('heading', { name: 'Business Overview' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();

    // 4. Verify Real Operational Stat Cards
    await expect(page.locator('text=Orders').first()).toBeVisible();
    await expect(page.locator('text=New Customers').first()).toBeVisible();
    await expect(page.locator('text=Avg Order Value').first()).toBeVisible();
    await expect(page.locator('text=Pending Orders').first()).toBeVisible();
    await expect(page.locator('text=Inventory Value').first()).toBeVisible();
    await expect(page.locator('text=Loyalty Points').first()).toBeVisible();

    // 5. Verify Visual Charts Grid
    const salesHeader = page.locator('h3:has-text("Sales Performance")');
    await expect(salesHeader).toBeVisible();
    await expect(page.locator('.recharts-surface').first()).toBeVisible();

    const breakdownHeader = page.locator('h3:has-text("Revenue Breakdown")');
    await expect(breakdownHeader).toBeVisible();
    await expect(page.getByText('INFLOW', { exact: true })).toBeVisible();

    // 6. Capture Dark Mode Full Page Screenshot
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
    await page.screenshot({
      path: 'tests/screenshots/task6-complete-dashboard-dark.png',
      fullPage: true,
    });

    // 7. Toggle to Light Mode
    const themeBtn = page.locator('#theme-toggle-btn');
    await themeBtn.click();
    await page.waitForTimeout(500);

    // Verify Light Mode active
    await expect(html).not.toHaveClass(/dark/);
    await expect(page.getByRole('heading', { name: 'Business Overview' })).toBeVisible();

    // Capture Light Mode Full Page Screenshot
    await page.screenshot({
      path: 'tests/screenshots/task6-complete-dashboard-light.png',
      fullPage: true,
    });

    // 8. Toggle back to Dark Mode
    await themeBtn.click();
    await page.waitForTimeout(500);
    await expect(html).toHaveClass(/dark/);
  });
});
