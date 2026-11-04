import { test, expect } from '@playwright/test';

test.describe('Hero Section CMS Modes & Navbar Visibility', () => {
  test.setTimeout(90000);

  test('Mode 1: Storefront renders 3D Interactive Slider with preserved layout', async ({ page }) => {
    await page.route('**/api/v1/cms/banners', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/v1/cms/hero/config', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ mode: 'slider' }),
      });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const sliderSection = page.locator('#hero-section');
    await sliderSection.waitFor({ state: 'visible', timeout: 30000 });
    await expect(sliderSection).toBeVisible();

    // Verify layout in slider mode retains its 34px spacing
    const layout = page.locator('#storefront-layout');
    await page.waitForTimeout(1000);
    const paddingTop = await layout.evaluate((el) => window.getComputedStyle(el).paddingTop);
    expect(paddingTop).toBe('34px');

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/hero-slider-preserved.png',
      fullPage: false,
    });
  });

  test('Mode 2: Storefront renders Photo Split with 0px top padding (no empty line)', async ({ page }) => {
    await page.route('**/api/v1/cms/banners', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/v1/cms/hero/config', async (route) => {
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
    await photoHero.waitFor({ state: 'visible', timeout: 30000 });
    await expect(photoHero).toBeVisible();
    await expect(photoHero.getByText('Pure Artisanal Mushrooms')).toBeVisible();

    // Verify top padding is 0px (no empty line above photo hero)
    const layout = page.locator('#storefront-layout');
    await page.waitForTimeout(1000);
    const paddingTop = await layout.evaluate((el) => window.getComputedStyle(el).paddingTop);
    expect(paddingTop).toBe('0px');

    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/hero-photo-split-no-padding.png',
      fullPage: false,
    });
  });

  test('Mode 3: Storefront renders Video Hero with 0px top padding & frosted blur navbar with visible light text', async ({ page }) => {
    await page.route('**/api/v1/cms/banners', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/v1/cms/hero/config', async (route) => {
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
    await videoHero.waitFor({ state: 'visible', timeout: 30000 });
    await expect(videoHero).toBeVisible();
    await expect(videoHero.getByText('Gourmet Dehydrated Mushrooms')).toBeVisible();

    // 1. Verify top padding is 0px (no empty line above video hero)
    const layout = page.locator('#storefront-layout');
    await page.waitForTimeout(1000);
    const paddingTop = await layout.evaluate((el) => window.getComputedStyle(el).paddingTop);
    expect(paddingTop).toBe('0px');

    // 2. Verify navbar has frosted blur styling
    const navbar = page.locator('nav').first();
    const navClasses = await navbar.getAttribute('class');
    expect(navClasses).toContain('backdrop-blur-md');
    expect(navClasses).toContain('bg-[#142318]/70');

    // 3. Verify navbar brand text is light ivory and readable
    const brandText = page.locator('nav a:has-text("MASKY")').first();
    await expect(brandText).toBeVisible();
    const brandColor = await brandText.evaluate((el) => window.getComputedStyle(el).color);
    expect(brandColor).toBe('rgb(255, 252, 244)');

    // 4. Verify inactive nav links (e.g. SHOP) are light ivory and readable
    const shopLink = page.locator('nav a:has-text("SHOP")').first();
    await expect(shopLink).toBeVisible();
    const shopColor = await shopLink.evaluate((el) => window.getComputedStyle(el).color);
    expect(shopColor).toBe('rgb(255, 252, 244)');

    // 5. Verify cart button is styled with translucent border and visible text
    const cartButton = page.locator('button[aria-label="Shopping Cart"]');
    await expect(cartButton).toBeVisible();
    const cartClasses = await cartButton.getAttribute('class');
    expect(cartClasses).toContain('backdrop-blur-md');

    // 6. Capture screenshot of video hero with navbar blur
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/hero-video-navbar-blur.png',
      fullPage: false,
    });
  });
});
