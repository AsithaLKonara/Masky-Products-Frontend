import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Dark Theme Audit - Stat Cards, Filters & Charts', () => {
  test.setTimeout(90000);

  const ARTIFACT_DIR = '/Users/asithalakmal/.gemini/antigravity-ide/brain/606b7139-4607-4c14-a282-b6350b1a78d1';

  test('captures and validates Dark Theme on Dashboard Overview, Reports, and Orders', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });

    // 1. Log in via Super Admin button
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Super Admin")');
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL('**/admin', { timeout: 30000 });
    await expect(page.locator('text=Business Overview').first()).toBeVisible({ timeout: 15000 });

    // Ensure dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    await page.waitForTimeout(1000);

    // Screenshot 1: Dark Mode Dashboard Overview (Stat Cards, Charts, Donut, Filters)
    const darkDashboardShot = path.join(ARTIFACT_DIR, 'dark_theme_audit_dashboard.png');
    await page.screenshot({ path: darkDashboardShot, fullPage: true });

    // Screenshot 2: Dark Mode Orders (AdminStatCards, Filter dropdowns, Search bar)
    await page.goto('http://localhost:3000/admin/orders');
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(1500);
    const darkOrdersShot = path.join(ARTIFACT_DIR, 'dark_theme_audit_orders.png');
    await page.screenshot({ path: darkOrdersShot, fullPage: true });

    // Screenshot 3: Dark Mode Sales Reports (Sales Area/Bar Chart, Date range, Summary Cards)
    await page.goto('http://localhost:3000/admin/reports/sales');
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(1500);
    const darkSalesReportsShot = path.join(ARTIFACT_DIR, 'dark_theme_audit_sales_chart.png');
    await page.screenshot({ path: darkSalesReportsShot, fullPage: true });

    // Screenshot 4: Light Mode Dashboard Overview for comparison
    await page.goto('http://localhost:3000/admin');
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    await page.waitForTimeout(1000);
    const lightDashboardShot = path.join(ARTIFACT_DIR, 'light_theme_audit_dashboard.png');
    await page.screenshot({ path: lightDashboardShot, fullPage: true });

    console.log('All audit screenshots captured successfully');
  });
});
