import { test, expect } from '@playwright/test';
import { setupAdminSession } from './auth-helper';

test.describe('Admin Product CRUD Custom Variants & Expiry System', () => {
  test.setTimeout(90000);

  test('Admin Products page displays Shelf Life & Expiry column and Expiry Alert banner', async ({ context, page }) => {
    await setupAdminSession(context, page);
    await page.goto('/admin/products');

    // Wait for the products to load from backend
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 20000 });

    // Verify Page header
    await expect(page.getByText('Mushroom Products & Catalog')).toBeVisible();

    // Verify Expiry Alert Banner is displayed (due to fresh oyster expiring soon)
    const alertBanner = page.locator('text=Shelf Life & Expiry Attention Required');
    await expect(alertBanner).toBeVisible({ timeout: 10000 });

    // Verify table has "Shelf Life & Expiry" column header
    await expect(page.getByRole('columnheader', { name: /Shelf Life & Expiry/i })).toBeVisible();

    // Verify product shows shelf life badge (e.g. "⏳" or "active")
    await expect(page.getByText(/Fresh Oyster Mushrooms/i).first()).toBeVisible();

    await page.waitForTimeout(1000);

    // Capture screenshot of Products list with Expiry Alerts
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/admin-products-expiry-alerts.png',
      fullPage: false,
    });
  });

  test('ProductFormModal offers Custom Variants and Manufacture & Expiry date controls', async ({ context, page }) => {
    await setupAdminSession(context, page);
    await page.goto('/admin/products');

    // Wait for data load
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 20000 });

    // Click "+ Add Product" button
    const addBtn = page.getByRole('button', { name: /\+ Add Product/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Verify modal header
    await expect(page.getByText('Add New Mushroom Product')).toBeVisible({ timeout: 10000 });

    // Verify Manufacture Date and Expiry Date inputs in Basic Info
    const mfgLabel = page.locator('text=Manufacture Date');
    const expLabel = page.locator('text=Expiry Date');
    await expect(mfgLabel).toBeVisible();
    await expect(expLabel).toBeVisible();

    // Type product title
    await page.locator('input[placeholder*="Dehydrated Oyster"]').fill('Organic Lion Mane Mushroom (සිංහ කේසර)');

    // Fill dates
    const todayStr = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0];
    
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.nth(0).fill(todayStr);
    await dateInputs.nth(1).fill(nextYear);

    // Verify dynamic shelf-life active alert badge appears
    await expect(page.getByText(/SHELF LIFE ACTIVE/i)).toBeVisible();

    // Switch to Custom Variants tab
    const variantsTab = page.getByRole('button', { name: /Custom Variants/i });
    await variantsTab.click();

    // Verify mushroom presets are visible
    await expect(page.getByText('100g Pouch')).toBeVisible();
    await expect(page.getByText('250g Pouch')).toBeVisible();
    await expect(page.getByText('500g Pouch')).toBeVisible();
    await expect(page.getByText('200g Glass Jar')).toBeVisible();

    // Add a preset variant
    await page.getByRole('button', { name: /\+ 100g Pouch/i }).click();

    // Verify variant row is added to the table with SKU and Barcode
    await expect(page.getByText('1 Custom Variant Configured')).toBeVisible();
    await expect(page.locator('input[value="100g Pouch"]')).toBeVisible();

    // Add another custom variant via custom input
    const customInput = page.locator('input[placeholder*="350g Value Pack"]');
    await customInput.fill('400g Gourmet Gift Box');
    await page.getByRole('button', { name: /Add Variant/i }).click();

    await expect(page.getByText('2 Custom Variants Configured')).toBeVisible();
    await expect(page.locator('input[value="400g Gourmet Gift Box"]')).toBeVisible();

    await page.waitForTimeout(1000);

    // Capture screenshot of the modal with custom variants & shelf life
    await page.screenshot({
      path: '/Users/asithalakmal/.gemini/antigravity/brain/fce6e67c-1026-4cd4-b305-4a0830372871/admin-product-modal-custom-variants-and-dates.png',
      fullPage: false,
    });
  });
});
