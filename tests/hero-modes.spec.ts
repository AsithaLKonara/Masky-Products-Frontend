import { test, expect } from '@playwright/test';

test.describe('Task 1: Hero Section CMS Modes', () => {
  test.setTimeout(60000);

  test('Mode 1: Storefront renders 3D Interactive Slider by default', async ({ page }) => {
    await page.route('**/*cms/hero/config*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ mode: 'slider' }),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const section = page.locator('section').first();
    await expect(section).toBeVisible();

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/hero-mode-slider-desktop.png',
      fullPage: false,
    });
  });

  test('Mode 2: Storefront renders Two-Column Editorial Photo Split', async ({ page }) => {
    await page.route('**/*cms/hero/config*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mode: 'photo',
          photoConfig: {
            imageUrl: '/isolated-oyster-mushroom-cutout-on-white-background-free-png.webp',
            eyebrow: '100% ORGANIC HIGHLAND HARVEST',
            title: 'Pure Artisanal Mushrooms',
            subtitle: 'Dehydrated & Fresh Gourmet Fungi',
            description:
              'Carefully selected and handcrafted in Sri Lanka. Slowly dehydrated at low temperatures to lock in concentrated umami and earthy gourmet perfection.',
            badgeText: 'Sun-Kissed & Dehydrated',
            badgeSubtext: 'Sustainably grown in Sri Lanka',
            ctaText: 'Explore Products',
            ctaLink: '/shop',
            ctaSecondaryText: 'Our Story',
            ctaSecondaryLink: '/about',
          },
        }),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const photoHero = page.locator('[data-testid="hero-photo-section"]');
    await expect(photoHero).toBeVisible({ timeout: 10000 });
    await expect(photoHero.getByText('Pure Artisanal Mushrooms')).toBeVisible();

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/hero-mode-photo-split-desktop.png',
      fullPage: false,
    });
  });

  test('Mode 3: Storefront renders Cinematic Video Hero', async ({ page }) => {
    await page.route('**/*cms/hero/config*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          mode: 'video',
          videoConfig: {
            videoUrl: '',
            posterUrl: '/hero-image/Product1.png',
            eyebrow: "NATURE'S FINEST SELECTION",
            title: 'Gourmet Dehydrated Mushrooms',
            subtitle: 'Artisan Harvested • Peak Umami • 100% Organic',
            description:
              'Slowly dried at low temperatures to lock in intense aroma, exquisite flavor, and natural nutrients for gourmet cuisine.',
            ctaText: 'Shop Collection',
            ctaLink: '/shop',
            ctaSecondaryText: 'Our Story',
            ctaSecondaryLink: '/about',
          },
        }),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const videoHero = page.locator('[data-testid="hero-video-section"]');
    await expect(videoHero).toBeVisible({ timeout: 10000 });
    await expect(videoHero.getByText('Gourmet Dehydrated Mushrooms')).toBeVisible();

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/hero-mode-video-desktop.png',
      fullPage: false,
    });
  });
});