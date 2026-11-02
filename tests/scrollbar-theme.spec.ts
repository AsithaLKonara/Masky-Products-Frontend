import { test, expect } from '@playwright/test';
import { setupAdminSession } from './auth-helper';

test.describe('Theme-Adaptive Scrollbar Verification', () => {
  test('Scrollbars correctly adapt tokens in Dark and Light themes', async ({ context, page }) => {
    await setupAdminSession(context, page);

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // 1. Verify Dark Mode scrollbar variables
    const darkScrollbarProps = await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      const styles = getComputedStyle(document.documentElement);
      return {
        track: styles.getPropertyValue('--scrollbar-track').trim(),
        thumb: styles.getPropertyValue('--scrollbar-thumb').trim(),
        colorScheme: styles.colorScheme,
      };
    });

    expect(darkScrollbarProps.track).toBe('#0B0F17');
    expect(darkScrollbarProps.thumb).toBe('#1E293B');
    expect(darkScrollbarProps.colorScheme).toBe('dark');

    // 2. Verify Light Mode scrollbar variables
    const lightScrollbarProps = await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      const styles = getComputedStyle(document.documentElement);
      return {
        track: styles.getPropertyValue('--scrollbar-track').trim(),
        thumb: styles.getPropertyValue('--scrollbar-thumb').trim(),
        colorScheme: styles.colorScheme,
      };
    });

    expect(lightScrollbarProps.track).toBe('#F1F5F9');
    expect(lightScrollbarProps.thumb).toBe('#CBD5E1');
    expect(lightScrollbarProps.colorScheme).toBe('light');

    // 3. Verify scrollable main container has thin scrollbar-width
    const scrollbarWidth = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? getComputedStyle(main).scrollbarWidth : '';
    });
    expect(scrollbarWidth).toBe('thin');
  });
});
