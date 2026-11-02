import { test, expect } from '@playwright/test';
import { setupAdminSession } from './auth-helper';

test.describe('Task 5: Interactive Recharts Visualizations', () => {
  test.setTimeout(90000);

  test('should render Sales Performance area chart and Revenue Breakdown donut chart with center stat and legend', async ({ page, context }) => {
    await setupAdminSession(context, page);

    // Mock analytics API to match screenshot values
    await page.route('**/api/v1/analytics/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            revenue: { value: 22500, trend: '+100%', trendType: 'positive' },
            orders: { value: 7, trend: '+100%', trendType: 'positive' },
            newCustomers: { value: 5, trend: '+100%', trendType: 'positive' },
            avgOrderValue: { value: 3214, trend: '-397.8%', trendType: 'negative' },
            pendingOrders: { value: 2, trend: '0%', trendType: 'neutral' },
            inventoryValue: { value: 1250000, trend: '+5%', trendType: 'positive' },
            loyaltyPoints: { value: 840, trend: '+12%', trendType: 'positive' },
            returns: { value: 0, trend: '0%', trendType: 'neutral' },
            paymentGatewayPerformance: [
              { gw: 'Subscriptions', amount: 22500, count: 5, pct: 67 },
              { gw: 'One-time Sales...', amount: 1100, count: 1, pct: 3 },
              { gw: 'Branch Addons', amount: 10000, count: 3, pct: 30 },
              { gw: 'Partnerships & ...', amount: 0, count: 0, pct: 0 },
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
              },
            ],
          },
        }),
      });
    });

    await page.goto('/admin', { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // Wait for dynamic Suspense component to mount
    await expect(page.locator('text=Monthly Recurring Revenue')).toBeVisible({ timeout: 15000 });

    // 1. Verify Sales Performance Card
    const salesHeader = page.locator('h3:has-text("Sales Performance")');
    await expect(salesHeader).toBeVisible();
    await expect(page.locator('text=Monthly recurring SaaS inflows vs targets')).toBeVisible();
    await expect(page.locator('.lg\\:col-span-7 select')).toBeVisible();

    // Verify Recharts SVG is present
    const rechartsArea = page.locator('.recharts-surface').first();
    await expect(rechartsArea).toBeVisible();

    // 2. Verify Revenue Breakdown Donut Card
    const breakdownHeader = page.locator('h3:has-text("Revenue Breakdown")');
    await expect(breakdownHeader).toBeVisible();
    await expect(page.locator('text=Real-time platform distribution by source')).toBeVisible();

    // Verify Centered Donut Text
    await expect(page.getByText('INFLOW', { exact: true })).toBeVisible();
    await expect(page.getByText(/Rs\.\s*34K/)).toBeVisible();

    // Verify Legend items inside the breakdown card
    const legendCard = page.locator('.lg\\:col-span-5');
    await expect(legendCard.getByText('Subscriptions', { exact: true })).toBeVisible();
    await expect(legendCard.getByText('One-time Sales...')).toBeVisible();
    await expect(legendCard.getByText('Branch Addons')).toBeVisible();
    await expect(legendCard.getByText('67%')).toBeVisible();

    // 3. Verify Recent Transactions Table
    await expect(page.locator('h4:has-text("Recent Transactions")')).toBeVisible();

    // Capture Dark Mode Screenshot
    await page.screenshot({ path: 'tests/screenshots/task5-charts-dark.png', fullPage: true });

    // Toggle Light Mode and Screenshot
    const themeBtn = page.locator('#theme-toggle-btn');
    await themeBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'tests/screenshots/task5-charts-light.png', fullPage: true });
  });
});
