import { test, expect } from '@playwright/test';

test.describe('Task 8: Content & Legal Pages Redesign', () => {
  test.setTimeout(90000);

  test('Privacy Policy renders quiet luxury editorial layout', async ({ page }) => {
    await page.goto('/privacy-policy', { waitUntil: 'domcontentloaded' });

    // Assert main heading
    const heading = page.getByRole('heading', { name: 'Privacy Policy', exact: true });
    await expect(heading).toBeVisible({ timeout: 20000 });

    // Assert sections
    await expect(page.getByText('Information We Collect')).toBeVisible();
    await expect(page.getByText('Encrypted Payment Processing')).toBeVisible();
    await expect(page.getByText('Third-Party Logistics & Disclosures')).toBeVisible();

    // Assert breadcrumbs & category bar
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();

    // Capture screenshot
    await page.screenshot({ path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/privacy-policy-redesigned-desktop.png', fullPage: true });
  });

  test('Terms & Conditions renders quiet luxury editorial layout', async ({ page }) => {
    await page.goto('/terms-conditions', { waitUntil: 'domcontentloaded' });

    // Assert main heading
    const heading = page.getByRole('heading', { name: 'Terms & Conditions', exact: true });
    await expect(heading).toBeVisible({ timeout: 20000 });

    // Assert sections
    await expect(page.getByText('Agreement & General Terms')).toBeVisible();
    await expect(page.getByText('Artisan Garment Authenticity & Colorways')).toBeVisible();
    await expect(page.getByText('Exchange Privilege & Cancellations')).toBeVisible();

    // Assert concierge inquiry box
    await expect(page.getByText('Need Clarification on Our Terms?')).toBeVisible();

    // Capture screenshot
    await page.screenshot({ path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/terms-conditions-redesigned-desktop.png', fullPage: true });
  });
});
