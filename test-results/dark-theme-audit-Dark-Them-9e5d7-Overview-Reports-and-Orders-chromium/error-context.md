# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dark-theme-audit.spec.ts >> Dark Theme Audit - Stat Cards, Filters & Charts >> captures and validates Dark Theme on Dashboard Overview, Reports, and Orders
- Location: tests/dark-theme-audit.spec.ts:9:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/admin/orders", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import * as path from 'path';
  3  | 
  4  | test.describe('Dark Theme Audit - Stat Cards, Filters & Charts', () => {
  5  |   test.setTimeout(90000);
  6  | 
  7  |   const ARTIFACT_DIR = '/Users/asithalakmal/.gemini/antigravity-ide/brain/606b7139-4607-4c14-a282-b6350b1a78d1';
  8  | 
  9  |   test('captures and validates Dark Theme on Dashboard Overview, Reports, and Orders', async ({ page }) => {
  10 |     await page.setViewportSize({ width: 1440, height: 960 });
  11 | 
  12 |     // 1. Log in via Super Admin button
  13 |     await page.goto('http://localhost:3000/login');
  14 |     await page.waitForLoadState('networkidle');
  15 | 
  16 |     await page.click('button:has-text("Super Admin")');
  17 |     await page.click('button[type="submit"]:has-text("Sign In")');
  18 |     await page.waitForURL('**/admin', { timeout: 30000 });
  19 |     await expect(page.locator('text=Business Overview').first()).toBeVisible({ timeout: 15000 });
  20 | 
  21 |     // Ensure dark mode
  22 |     await page.evaluate(() => {
  23 |       document.documentElement.classList.add('dark');
  24 |       localStorage.setItem('theme', 'dark');
  25 |     });
  26 |     await page.waitForTimeout(1000);
  27 | 
  28 |     // Screenshot 1: Dark Mode Dashboard Overview (Stat Cards, Charts, Donut, Filters)
  29 |     const darkDashboardShot = path.join(ARTIFACT_DIR, 'dark_theme_audit_dashboard.png');
  30 |     await page.screenshot({ path: darkDashboardShot, fullPage: true });
  31 | 
  32 |     // Screenshot 2: Dark Mode Orders (AdminStatCards, Filter dropdowns, Search bar)
> 33 |     await page.goto('http://localhost:3000/admin/orders');
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  34 |     await page.evaluate(() => document.documentElement.classList.add('dark'));
  35 |     await page.waitForTimeout(1500);
  36 |     const darkOrdersShot = path.join(ARTIFACT_DIR, 'dark_theme_audit_orders.png');
  37 |     await page.screenshot({ path: darkOrdersShot, fullPage: true });
  38 | 
  39 |     // Screenshot 3: Dark Mode Sales Reports (Sales Area/Bar Chart, Date range, Summary Cards)
  40 |     await page.goto('http://localhost:3000/admin/reports/sales');
  41 |     await page.evaluate(() => document.documentElement.classList.add('dark'));
  42 |     await page.waitForTimeout(1500);
  43 |     const darkSalesReportsShot = path.join(ARTIFACT_DIR, 'dark_theme_audit_sales_chart.png');
  44 |     await page.screenshot({ path: darkSalesReportsShot, fullPage: true });
  45 | 
  46 |     // Screenshot 4: Light Mode Dashboard Overview for comparison
  47 |     await page.goto('http://localhost:3000/admin');
  48 |     await page.evaluate(() => {
  49 |       document.documentElement.classList.remove('dark');
  50 |       localStorage.setItem('theme', 'light');
  51 |     });
  52 |     await page.waitForTimeout(1000);
  53 |     const lightDashboardShot = path.join(ARTIFACT_DIR, 'light_theme_audit_dashboard.png');
  54 |     await page.screenshot({ path: lightDashboardShot, fullPage: true });
  55 | 
  56 |     console.log('All audit screenshots captured successfully');
  57 |   });
  58 | });
  59 | 
```