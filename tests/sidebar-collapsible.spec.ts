import { test, expect, Page } from '@playwright/test';

async function loginAsSuperAdmin(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.click('button:has-text("Super Admin")');
  await page.click('button[type="submit"]:has-text("Sign In")');
  await page.waitForURL('**/admin', { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test.describe('Collapsible Sidebar & Icon Rail Menu Verification', () => {
  test.setTimeout(60000);

  test('Toggles smoothly between full expanded sidebar and collapsed icon rail menu', async ({ page }) => {
    // 1. Real Super Admin login
    await loginAsSuperAdmin(page);

    const aside = page.locator('aside');
    const mainContent = page.locator('#dashboard-main-content');

    // Reset collapsed state in localStorage if present and reload
    await page.evaluate(() => {
      localStorage.removeItem('masky_sidebar_collapsed');
    });

    // 2. Initial State: Expanded Sidebar
    await expect(aside).toHaveClass(/w-\[240px\]/);
    await expect(aside.getByText('MASKY PRODUCT')).toBeVisible();

    // Verify sidebar has NO duplicate collapse button (only header has the button)
    const asideCollapseBtn = aside.locator('button[aria-label="Collapse sidebar"]');
    await expect(asideCollapseBtn).toHaveCount(0);

    // 3. Click Header Collapse Button
    const headerCollapseBtn = page.locator('header button[aria-label="Collapse sidebar"]');
    await expect(headerCollapseBtn).toBeVisible();
    await headerCollapseBtn.click();
    await page.waitForTimeout(400);

    // 4. Verify Collapsed State (Rail Icon Menu)
    await expect(aside).toHaveClass(/md:w-\[68px\]/);
    await expect(mainContent).toHaveClass(/md:ml-\[68px\]/);
    await expect(aside.getByText('MASKY PRODUCT')).toBeHidden();

    // Verify icons are present in rail menu
    const railNavLinks = aside.locator('nav a, a[href^="/admin"]');
    const railCount = await railNavLinks.count();
    expect(railCount).toBeGreaterThan(5);

    // Verify hover tooltip on one of the rail items (e.g. Orders)
    const ordersItem = aside.locator('a[href="/admin/orders"]');
    await expect(ordersItem).toBeVisible();
    await ordersItem.hover();
    await page.waitForTimeout(200);

    // Screenshot of collapsed rail icon menu
    await page.screenshot({ path: 'tests/screenshots/sidebar-collapsed-rail.png' });

    // 5. Click Expand Button (M logo button in collapsed sidebar)
    const expandBtn = aside.locator('button[aria-label="Expand sidebar"]');
    await expect(expandBtn).toBeVisible();
    await expandBtn.click();
    await page.waitForTimeout(400);

    // 6. Verify Expanded State Restored
    await expect(aside).toHaveClass(/w-\[240px\]/);
    await expect(mainContent).toHaveClass(/md:ml-\[240px\]/);
    await expect(aside.getByText('MASKY PRODUCT')).toBeVisible();

    // Screenshot of restored expanded sidebar
    await page.screenshot({ path: 'tests/screenshots/sidebar-expanded-back.png' });

    // 7. Also test Header menu toggle button
    const headerToggleBtn = page.locator('header button[aria-label="Collapse sidebar"]');
    await expect(headerToggleBtn).toBeVisible();
    await headerToggleBtn.click();
    await page.waitForTimeout(400);
    await expect(aside).toHaveClass(/md:w-\[68px\]/);

    const headerExpandBtn = page.locator('header button[aria-label="Expand sidebar"]');
    await expect(headerExpandBtn).toBeVisible();
    await headerExpandBtn.click();
    await page.waitForTimeout(400);
    await expect(aside).toHaveClass(/w-\[240px\]/);
  });

  test('Preserves collapsed preference across page navigation and reload', async ({ page }) => {
    // 1. Real Super Admin login
    await loginAsSuperAdmin(page);

    // Set collapsed in localStorage beforehand
    await page.evaluate(() => {
      localStorage.setItem('masky_sidebar_collapsed', 'true');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const aside = page.locator('aside');
    await expect(aside).toHaveClass(/md:w-\[68px\]/);
    await expect(aside.locator('button[aria-label="Expand sidebar"]')).toBeVisible();

    // Navigate to /admin/orders and ensure it remains collapsed
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(aside).toHaveClass(/md:w-\[68px\]/);
  });
});
