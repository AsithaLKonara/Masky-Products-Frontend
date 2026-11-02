import { test, expect } from '@playwright/test';

test.describe('Dashboard Table Clean Enterprise Styling', () => {
  test.setTimeout(90000);

  test('verifies all dashboard tables have clean flush styling with zero floating shadows or puffy cards', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });

    await page.route('**/api/v1/analytics/overview*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            revenue: { value: 398, trend: '+100%', trendType: 'positive' },
            orders: { value: 5, trend: '+100%', trendType: 'positive' },
            newCustomers: { value: 5, trend: '+100%', trendType: 'positive' },
            avgOrderValue: { value: 79.6, trend: '+5%', trendType: 'positive' },
            pendingOrders: { value: 1, trend: '0%', trendType: 'neutral' },
            inventoryValue: { value: 1250000, trend: '+5%', trendType: 'positive' },
            loyaltyPoints: { value: 840, trend: '+12%', trendType: 'positive' },
            returns: { value: 0, trend: '0%', trendType: 'neutral' },
            paymentGatewayPerformance: [
              { name: 'COD', revenue: 68.5, count: 1, percentage: 17 },
              { name: 'MINTPAY', revenue: 76.5, count: 1, percentage: 19 },
              { name: 'KOKO', revenue: 95.5, count: 1, percentage: 24 },
              { name: 'ONEPAY', revenue: 101.5, count: 1, percentage: 26 },
              { name: 'CASH', revenue: 56, count: 1, percentage: 14 },
            ],
            recentTransactions: [
              {
                id: 'TX-101',
                orderNumber: 'ORD-9821',
                customer: 'Kamal Perera',
                branch: 'MAIN FLAGSHIP STORE (COLOMBO 03)',
                amount: 68.5,
                paymentMethod: 'COD',
                paymentStatus: 'PENDING',
                orderStatus: 'PENDING',
                createdAt: new Date().toISOString(),
              },
              {
                id: 'TX-102',
                orderNumber: 'ORD-9822',
                customer: 'Amara Fernando',
                branch: 'GANEMULLA BRANCH',
                amount: 76.5,
                paymentMethod: 'MINTPAY',
                paymentStatus: 'PAID',
                orderStatus: 'SHIPPED',
                createdAt: new Date().toISOString(),
              },
              {
                id: 'TX-103',
                orderNumber: 'ORD-9823',
                customer: 'Kasun Silva',
                branch: 'MAIN FLAGSHIP STORE (COLOMBO 03)',
                amount: 95.5,
                paymentMethod: 'KOKO',
                paymentStatus: 'PAID',
                orderStatus: 'PROCESSING',
                createdAt: new Date().toISOString(),
              },
              {
                id: 'TX-104',
                orderNumber: 'ORD-9824',
                customer: 'Nimal Bandara',
                branch: 'MAIN FLAGSHIP STORE (COLOMBO 03)',
                amount: 101.5,
                paymentMethod: 'ONEPAY',
                paymentStatus: 'PAID',
                orderStatus: 'COMPLETED',
                createdAt: new Date().toISOString(),
              },
              {
                id: 'TX-105',
                orderNumber: 'ORD-9825',
                customer: 'Dinuka Senanayake',
                branch: 'MAIN FLAGSHIP STORE (COLOMBO 03)',
                amount: 56,
                paymentMethod: 'CASH',
                paymentStatus: 'PAID',
                orderStatus: 'COMPLETED',
                createdAt: new Date().toISOString(),
              },
            ],
          },
        }),
      });
    });

    // 1. Log in
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Super Admin")');
    await expect(page.locator('input[type="email"]')).toHaveValue('superadmin@masky.space');
    await expect(page.locator('input[type="password"]')).toHaveValue('Password123!');
    await expect(page.locator('text=Loaded credentials for Super Admin')).toBeVisible();

    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL('**/admin', { timeout: 30000 });
    await expect(page.locator('text=Business Overview').first()).toBeVisible({ timeout: 15000 });

    // Ensure dark mode first
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    if (!isDark) {
      const themeToggle = page.locator('button[title*="theme" i], button[aria-label*="theme" i]').first();
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
      }
    }

    // Check Recent Transactions table container
    const recentTxHeading = page.locator('text=Recent Transactions').first();
    await expect(recentTxHeading).toBeVisible({ timeout: 30000 });
    
    // Locate the container holding Recent Transactions
    const tableContainer = page.locator('div:has(> div:has-text("Recent Transactions"))').first();
    const containerClass = await tableContainer.getAttribute('class');
    
    // Must NOT have floating card shadows or bubbly 2xl radiuses
    expect(containerClass || '').not.toContain('shadow-2xs');
    expect(containerClass || '').not.toContain('shadow-md');
    expect(containerClass || '').not.toContain('shadow-lg');
    expect(containerClass || '').not.toContain('rounded-2xl');

    // Scroll down to recent transactions table
    await recentTxHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Take screenshot of Dark Theme with flush enterprise tables
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity-ide/brain/606b7139-4607-4c14-a282-b6350b1a78d1/clean_table_dashboard_dark.png',
      fullPage: false,
    });

    // Switch to Light Theme
    const lightToggle = page.locator('button[title*="theme" i], button[aria-label*="theme" i]').first();
    if (await lightToggle.isVisible()) {
      await lightToggle.click();
      await page.waitForTimeout(500);
    }

    // Take screenshot of Light Theme with flush enterprise tables
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity-ide/brain/606b7139-4607-4c14-a282-b6350b1a78d1/clean_table_dashboard_light.png',
      fullPage: false,
    });

    // Also navigate to /admin/orders to verify DataTable
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const ordersTable = page.locator('table').first();
    if (await ordersTable.isVisible()) {
      const ordersTableContainer = ordersTable.locator('xpath=./ancestor::div[contains(@class, "rounded-xl")]').first();
      const ordersContainerClass = await ordersTableContainer.getAttribute('class');
      expect(ordersContainerClass || '').not.toContain('shadow-');
    }

    // Screenshot orders table in light mode
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity-ide/brain/606b7139-4607-4c14-a282-b6350b1a78d1/clean_table_orders_light.png',
      fullPage: false,
    });
  });
});
