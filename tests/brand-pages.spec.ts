import { test, expect } from '@playwright/test';

test.describe('Task 7: Brand Story & Contact Redesign', () => {
  test.setTimeout(90000);

  test('About Page renders quiet luxury editorial story', async ({ page }) => {
    await page.goto('/about', { waitUntil: 'domcontentloaded' });

    // Assert main headline
    const heading = page.getByRole('heading', { name: /Elevated Silhouettes/i });
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Assert Craftsmanship pillars
    await expect(page.getByText('Ethical Sourcing')).toBeVisible();
    await expect(page.getByText('Artisan Tailoring')).toBeVisible();
    await expect(page.getByText('Enduring Quality')).toBeVisible();
    await expect(page.getByText('Small Capsule Drops')).toBeVisible();

    // Assert Atelier Creed quote banner
    await expect(page.getByText('The Atelier Creed')).toBeVisible();

    // Assert in-person experience section
    await expect(page.getByText('Experience Masky Product in Person')).toBeVisible();

    // Capture screenshot
    await page.screenshot({ path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/about-redesigned-desktop.png', fullPage: true });
  });

  test('Contact Page renders concierge form and handles submission', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'networkidle' });

    // Assert main headline
    const heading = page.getByRole('heading', { name: /Connect with Our Concierge/i });
    await expect(heading).toBeVisible({ timeout: 15000 });

    // Assert contact details and WhatsApp concierge
    await expect(page.getByText('Instant WhatsApp Concierge')).toBeVisible();
    await expect(page.getByText('Colombo Atelier Studio')).toBeVisible();

    // Select topic pill to ensure hydration is ready
    await page.getByRole('button', { name: 'Studio Fitting' }).click();

    // Test form interaction
    await page.getByPlaceholder(/Elena Perera/i).fill('Aurelia Vance');
    await page.getByPlaceholder(/elena@example.com/i).fill('aurelia@vance.luxury');
    await page.getByPlaceholder(/How may our concierge assist you/i).fill('I would like to schedule a private fitting this Friday at 3 PM for the linen capsule.');

    // Submit form
    await page.getByRole('button', { name: /Send Concierge Inquiry/i }).click();

    // Expect confirmation state
    await expect(page.getByText('Inquiry Received with Pleasure')).toBeVisible({ timeout: 15000 });

    // Capture screenshot
    await page.screenshot({ path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/contact-redesigned-desktop.png', fullPage: true });
  });
});
