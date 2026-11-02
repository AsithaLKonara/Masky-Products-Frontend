import { test, expect } from '@playwright/test';
import { setupAdminSession } from './auth-helper';

test.describe('Task 4: High-Impact KPI Stat Cards Row', () => {
  test.setTimeout(90000);

  test('should render 4 KPI cards with badges, values, trend descriptions, and subtext', async ({ page, context }) => {
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
            paymentGatewayPerformance: [],
            recentTransactions: [],
          },
        }),
      });
    });

    await page.goto('/admin', { timeout: 60000 });
    await page.waitForLoadState('networkidle');

    // 1. Verify Page Title & Actions
    await expect(page.locator('h1:has-text("Business Dashboard")')).toBeVisible();
    await expect(page.locator('button:has-text("+ Provision Tenant")')).toBeVisible();
    await expect(page.locator('button:has-text("Record Expense")')).toBeVisible();

    // 2. Card 1: Monthly Recurring Revenue (wait for dynamic Suspense component)
    const card1 = page.locator('text=Monthly Recurring Revenue');
    await expect(card1).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Rs\.\s*22,500/)).toBeVisible();
    await expect(page.locator('text=Trending up this month ↗')).toBeVisible();
    await expect(page.locator('text=Projected ARR: Rs. 270,000')).toBeVisible();

    // 3. Card 2: Active Tenants
    await expect(page.locator('text=Active Tenants')).toBeVisible();
    await expect(page.locator('text=Strong tenant adoption ↗')).toBeVisible();

    // 4. Card 3: Total Orders
    await expect(page.locator('text=Total Orders')).toBeVisible();
    await expect(page.locator('text=Order volume expanding ↗')).toBeVisible();

    // 5. Card 4: Net Profit Margin
    await expect(page.locator('text=Net Profit Margin')).toBeVisible();
    await expect(page.locator('text=High infrastructure overhead ↘')).toBeVisible();
    await expect(page.locator('text=SaaS Net Profit: Rs. -133,851.5')).toBeVisible();

    // Screenshot Dark Mode
    await page.screenshot({ path: 'tests/screenshots/task4-kpicards-dark.png' });

    // Toggle Light Mode and screenshot
    const themeBtn = page.locator('#theme-toggle-btn');
    await themeBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'tests/screenshots/task4-kpicards-light.png' });
  });
});
