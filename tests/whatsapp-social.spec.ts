import { test, expect } from '@playwright/test';

test.describe('Task 2: Floating WhatsApp Button & Updated Social Details', () => {
  test.setTimeout(60000);

  test('Floating WhatsApp button is visible and links to 0783130967', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const whatsappBtn = page.locator('[data-testid="floating-whatsapp"]');
    await expect(whatsappBtn).toBeVisible({ timeout: 15000 });

    const link = whatsappBtn.locator('a');
    const href = await link.getAttribute('href');
    expect(href).toContain('wa.me/94783130967');

    // Screenshot of bottom corner showing floating WhatsApp button
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/floating-whatsapp-desktop.png',
      fullPage: false,
    });
  });

  test('Footer displays updated email, phone, Facebook, and Daraz links', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();

    await expect(footer.getByText('maskyproduct@gmail.com')).toBeVisible();
    await expect(footer.getByText('078 313 0967')).toBeVisible();

    const darazLink = footer.locator('a[href*="daraz.lk"]');
    await expect(darazLink).toBeVisible();

    const fbLink = footer.locator('a[href*="facebook.com/share/1CQDRvhudv"]');
    await expect(fbLink).toBeVisible();

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/footer-updated-contacts.png',
      fullPage: false,
    });
  });

  test('Contact page displays updated details and official store links', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('maskyproduct@gmail.com').first()).toBeVisible();
    await expect(page.getByText('078 313 0967').first()).toBeVisible();
    await expect(page.locator('a[href*="daraz.lk"]').first()).toBeVisible();

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/contact-updated-socials.png',
      fullPage: false,
    });
  });
});

