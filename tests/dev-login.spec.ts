import { test, expect } from '@playwright/test';

test.describe('Dev Login Credentials & Quick-Fill Flow', () => {
  test('should display dev login credentials card, autofill roles, and log in to admin', async ({ page }) => {
    test.setTimeout(60000);
    page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER UNCAUGHT:', err.message));
    page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure()?.errorText));
    
    // 1. Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // 2. Verify Dev Login Credentials card is visible
    const devCard = page.locator('text=Dev Login Credentials');
    await expect(devCard).toBeVisible();

    // Verify all role quick-fill buttons are rendered
    await expect(page.locator('button:has-text("Super Admin")')).toBeVisible();
    await expect(page.locator('button:has-text("Store Admin")')).toBeVisible();
    await expect(page.locator('button:has-text("Branch Manager")')).toBeVisible();
    await expect(page.locator('button:has-text("Cashier")')).toBeVisible();
    await expect(page.locator('button:has-text("Customer")')).toBeVisible();

    // 3. Test Cashier Quick-Fill
    await page.click('button:has-text("Cashier")');
    await expect(page.locator('input[type="email"]')).toHaveValue('cashier@masky.space');
    await expect(page.locator('input[type="password"]')).toHaveValue('Password123!');
    await expect(page.locator('text=Loaded credentials for Cashier')).toBeVisible();

    // 4. Test Store Admin Quick-Fill
    await page.click('button:has-text("Store Admin")');
    await expect(page.locator('input[type="email"]')).toHaveValue('admin@masky.space');
    await expect(page.locator('input[type="password"]')).toHaveValue('Password123!');
    await expect(page.locator('text=Loaded credentials for Store Admin')).toBeVisible();

    // 5. Test Super Admin Quick-Fill
    await page.click('button:has-text("Super Admin")');
    await expect(page.locator('input[type="email"]')).toHaveValue('superadmin@masky.space');
    await expect(page.locator('input[type="password"]')).toHaveValue('Password123!');
    await expect(page.locator('text=Loaded credentials for Super Admin')).toBeVisible();

    // Take screenshot of login page with dev credentials loaded
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity-ide/brain/606b7139-4607-4c14-a282-b6350b1a78d1/login_page_dev_credentials.png',
      fullPage: true,
    });

    // 6. Click Sign In and verify navigation into /admin
    await page.click('button[type="submit"]:has-text("Sign In")');
    
    // Wait for redirect to /admin dashboard
    await page.waitForURL('**/admin', { timeout: 30000 });
    expect(page.url()).toContain('/admin');

    // Take screenshot of live admin dashboard after dev login
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity-ide/brain/606b7139-4607-4c14-a282-b6350b1a78d1/admin_dashboard_after_login.png',
      fullPage: true,
    });
  });
});
