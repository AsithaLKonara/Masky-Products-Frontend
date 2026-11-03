import { test, expect } from '@playwright/test';
import { setupAdminSession } from './auth-helper';

test.describe('Task 8: Private Gazette System End-to-End', () => {
  test.setTimeout(90000);

  test('Part 1: Storefront footer allows visitor to subscribe to Private Gazette', async ({ page }) => {
    // 1. Visit Storefront Home Page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // 2. Scroll to Storefront Footer
    const footer = page.locator('footer[aria-label="Storefront Footer"]');
    await expect(footer).toBeVisible({ timeout: 15000 });
    await footer.scrollIntoViewIfNeeded();

    // 3. Locate Private Gazette Header
    const gazetteTitle = footer.getByText('Private Gazette');
    await expect(gazetteTitle).toBeVisible();

    // 4. Enter unique test email and submit
    const gazetteInput = footer.locator('input[type="email"]');
    await expect(gazetteInput).toBeVisible();
    const testEmail = `sommelier.harvest.${Date.now()}@maskytest.lk`;
    await gazetteInput.fill(testEmail);

    const subscribeBtn = footer.getByRole('button', { name: /Subscribe/i });
    await expect(subscribeBtn).toBeVisible();
    await subscribeBtn.click();

    // 5. Verify Success Message appears in footer
    const successMsg = footer.getByText(/Welcome to our inner circle|confirmation has been dispatched/i);
    await expect(successMsg).toBeVisible({ timeout: 10000 });

    // 6. Capture Footer Subscription Screenshot
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/private-gazette-footer-subscribed.png',
      fullPage: false,
    });
  });

  test('Part 2: Admin CMS displays Gazette subscriber roster and compose dispatch modal', async ({ page, context }) => {
    // 1. Establish Admin Session before navigation
    await setupAdminSession(context, page);

    // 2. Navigate to Admin CMS
    await page.goto('/admin/cms', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    // 3. Click on Private Gazette Tab
    const gazetteTabBtn = page.getByRole('button', { name: /Private Gazette/i });
    await expect(gazetteTabBtn).toBeVisible({ timeout: 15000 });
    await gazetteTabBtn.click();

    // 4. Verify KPI cards
    await expect(page.getByText('Active Gazette Members')).toBeVisible();
    await expect(page.getByText('Delivery Gateway')).toBeVisible();

    // 5. Verify subscriber roster table is visible
    await expect(page.getByText('Private Gazette Subscribers')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Active').first()).toBeVisible();

    // 6. Capture Admin Gazette Dashboard Screenshot
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/private-gazette-admin-dashboard.png',
      fullPage: false,
    });

    // 7. Open Compose Dispatch Modal
    const composeBtn = page.getByRole('button', { name: /Compose Dispatch/i });
    await expect(composeBtn).toBeVisible();
    await composeBtn.click();

    // 8. Verify Modal elements
    await expect(page.getByText('Compose Private Gazette Dispatch')).toBeVisible();
    await expect(page.getByPlaceholder(/Autumn Harvest Chronicle/i)).toBeVisible();

    // 9. Capture Compose Modal Screenshot
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/private-gazette-compose-modal.png',
      fullPage: false,
    });
  });
});
