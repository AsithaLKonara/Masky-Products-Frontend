import { test, expect } from '@playwright/test';

test.describe('Task 9: Storefront Customer Auth Redesign', () => {
  test.setTimeout(90000);

  test('Login Page renders quiet luxury split view and handles dev credentials', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    // Assert main elements
    const heading = page.getByRole('heading', { name: /Welcome Back/i });
    await expect(heading).toBeVisible({ timeout: 20000 });

    // Assert editorial showcase column
    await expect(page.getByText('Client Privilege Portal')).toBeVisible();
    await expect(page.getByText('Pieces edited for quiet elegance')).toBeVisible();

    // Assert Dev credentials card
    await expect(page.getByText('Dev Credentials')).toBeVisible();

    // Click Customer quick fill
    const customerButton = page.getByRole('button', { name: /Customer/i });
    await customerButton.click();

    // Verify email input was auto-filled
    const emailInput = page.getByPlaceholder(/Email Address/i);
    await expect(emailInput).toHaveValue('customer@masky.space');

    // Capture screenshot of login state
    await page.screenshot({ path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/login-redesigned-desktop.png', fullPage: true });

    // Switch to Register view
    await page.getByRole('button', { name: /Create an account/i }).click();
    await expect(page.getByRole('heading', { name: /Join MASKY PRODUCT/i })).toBeVisible();

    // Capture screenshot of register state
    await page.screenshot({ path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/register-redesigned-desktop.png', fullPage: true });
  });
});
