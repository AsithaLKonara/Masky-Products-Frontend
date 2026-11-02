import { test, expect } from '@playwright/test';
import { setupAdminSession } from './auth-helper';

test.describe('Multi-Channel E-Commerce Control Center Verification', () => {
  test.setTimeout(90000);

  test('Navigates to Multi-Channel Control Center, verifies all channels, tests sync and modal', async ({ page, context }) => {
    await page.setViewportSize({ width: 1440, height: 960 });

    // 1. Setup authenticated admin session
    await setupAdminSession(context, page);

    const mockChannels = [
      {
        id: "daraz",
        name: "Daraz Sri Lanka & Regional",
        type: "DARAZ",
        status: "CONNECTED",
        icon: "Globe2",
        region: "LK (Sri Lanka)",
        credentials: { appKey: "502841" },
        syncSettings: {
          autoSyncInventory: true,
          autoSyncPrices: true,
          autoSyncOrders: true,
          syncIntervalMinutes: 15,
        },
        metrics: {
          totalRevenue: 486250,
          totalOrders: 328,
          activeListings: 142,
          syncHealth: "Optimal",
        },
        lastSyncAt: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        id: "ebay",
        name: "eBay Marketplace",
        type: "EBAY",
        status: "CONNECTED",
        icon: "Tag",
        region: "Global (EBAY_US)",
        credentials: { marketplaceId: "EBAY_US" },
        syncSettings: {
          autoSyncInventory: true,
          autoSyncPrices: true,
          autoSyncOrders: true,
          syncIntervalMinutes: 30,
        },
        metrics: {
          totalRevenue: 342000,
          totalOrders: 114,
          activeListings: 88,
          syncHealth: "Optimal",
        },
        lastSyncAt: new Date(Date.now() - 35 * 60000).toISOString(),
      },
      {
        id: "amazon",
        name: "Amazon SP-API",
        type: "AMAZON",
        status: "DISCONNECTED",
        icon: "Box",
        region: "North America / Global",
        credentials: {},
        syncSettings: {
          autoSyncInventory: false,
          autoSyncPrices: false,
          autoSyncOrders: false,
          syncIntervalMinutes: 60,
        },
        metrics: {
          totalRevenue: 0,
          totalOrders: 0,
          activeListings: 0,
          syncHealth: "Idle",
        },
        lastSyncAt: null,
      },
      {
        id: "web_store",
        name: "Masky Web Store",
        type: "WEB_STORE",
        status: "CONNECTED",
        icon: "Globe",
        region: "Global / Sri Lanka",
        credentials: {},
        syncSettings: {
          autoSyncInventory: true,
          autoSyncPrices: true,
          autoSyncOrders: true,
          syncIntervalMinutes: 0,
        },
        metrics: {
          totalRevenue: 2840500,
          totalOrders: 1420,
          activeListings: 215,
          syncHealth: "100%",
        },
        lastSyncAt: new Date().toISOString(),
      },
    ];

    const mockStats = {
      connectedChannels: "3 / 4",
      totalActiveListings: 445,
      totalMultiChannelOrders: 1862,
      totalMultiChannelRevenue: 3668750,
      overallSyncStatus: "OPTIMAL",
    };

    const mockLogs = [
      {
        id: "log-1",
        channelId: "daraz",
        channelName: "Daraz Sri Lanka",
        action: "SYNC_INVENTORY",
        status: "SUCCESS",
        message: "Synchronized 142 SKUs to Daraz LK Seller Center",
        itemsProcessed: 142,
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        id: "log-2",
        channelId: "ebay",
        channelName: "eBay Marketplace",
        action: "PULL_ORDERS",
        status: "SUCCESS",
        message: "Imported 4 new orders from eBay US marketplace",
        itemsProcessed: 4,
        timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
      },
    ];

    const mockOrders = [
      {
        id: "ord-daraz-1",
        orderNumber: "DARAZ-LK-98214",
        customer: { firstName: "Kasun", lastName: "Perera", email: "kasun.p@gmail.com", phone: "+94 77 123 4567" },
        total: 12500,
        status: "PROCESSING",
        paymentStatus: "PAID",
        paymentMethod: "DARAZ_WALLET",
        type: "DARAZ",
        channel: "DARAZ",
        createdAt: new Date().toISOString(),
        items: [{ id: "item-1", productName: "Masky Linen Shirt", quantity: 2, price: 6250 }],
      },
      {
        id: "ord-ebay-2",
        orderNumber: "EBAY-US-55410",
        customer: { firstName: "David", lastName: "Miller", email: "dmiller@yahoo.com", phone: "+1 415 555 2671" },
        total: 24500,
        status: "DISPATCHED",
        paymentStatus: "PAID",
        paymentMethod: "EBAY_PAYMENTS",
        type: "EBAY",
        channel: "EBAY",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        items: [{ id: "item-2", productName: "Oversized Cotton Tee", quantity: 1, price: 24500 }],
      },
      {
        id: "ord-amz-3",
        orderNumber: "AMZ-114-99210",
        customer: { firstName: "Sarah", lastName: "Jenkins", email: "sarah.j@amazon.com", phone: "+1 206 555 9012" },
        total: 18900,
        status: "DELIVERED",
        paymentStatus: "PAID",
        paymentMethod: "AMAZON_PAY",
        type: "AMAZON",
        channel: "AMAZON",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        items: [{ id: "item-3", productName: "Classic Silk Scarf", quantity: 1, price: 18900 }],
      },
      {
        id: "ord-web-4",
        orderNumber: "ORD-2026-0042",
        customer: { firstName: "Dilani", lastName: "Silva", email: "dilani.silva@gmail.com", phone: "+94 71 888 9900" },
        total: 8900,
        status: "PENDING",
        paymentStatus: "PAID",
        paymentMethod: "KOKO",
        type: "ECOMMERCE",
        channel: "WEB_STORE",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        items: [{ id: "item-4", productName: "Canvas Utility Tote", quantity: 1, price: 8900 }],
      },
    ];

    // Mock channel and order APIs to ensure seamless testing
    await page.route('**/api/v1/channels/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: mockStats }),
      });
    });

    await page.route('**/api/v1/channels/logs*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: mockLogs }),
      });
    });

    await page.route('**/api/v1/channels/*/sync', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: {
            channel: mockChannels[0],
            itemsProcessed: 142,
            message: 'Synchronized 142 items successfully',
          },
        }),
      });
    });

    await page.route('**/api/v1/channels/*/connect', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: {
            ...mockChannels[2],
            status: 'CONNECTED',
          },
        }),
      });
    });

    await page.route('**/api/v1/channels', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: mockChannels }),
      });
    });

    await page.route('**/api/v1/orders*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: mockOrders,
          meta: { totalCount: mockOrders.length, totalPages: 1, page: 1 },
        }),
      });
    });

    await page.route('**/api/v1/branches*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: [] }),
      });
    });

    await page.route('**/api/v1/reports/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: {} }),
      });
    });

    await page.route('**/api/v1/notifications*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: [] }),
      });
    });

    // 2. Navigate directly to /admin/channels
    await page.goto('/admin/channels');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // 3. Verify Header and Page Title
    await expect(page.locator('h1:has-text("Multi-Channel Control Center")')).toBeVisible();
    await expect(page.locator('text=Multi-Channel Retail').first()).toBeVisible();

    // 4. Verify all 4 Marketplace channels are present
    await expect(page.locator('text=Daraz Sri Lanka & Regional').first()).toBeVisible();
    await expect(page.locator('text=eBay Marketplace').first()).toBeVisible();
    await expect(page.locator('text=Amazon SP-API').first()).toBeVisible();
    await expect(page.locator('text=Masky Web Store').first()).toBeVisible();

    // 5. Verify KPI StatCards
    await expect(page.locator('text=Multi-Channel Revenue')).toBeVisible();
    await expect(page.locator('text=Connected Channels')).toBeVisible();
    await expect(page.locator('text=Active Cross-Listings')).toBeVisible();
    await expect(page.locator('text=Gateway Sync Health')).toBeVisible();

    // 6. Test Single Channel Sync (Daraz "Sync Stock")
    const syncStockBtn = page.getByRole('button', { name: 'Sync Stock' }).first();
    await expect(syncStockBtn).toBeVisible();
    await syncStockBtn.click();
    await page.waitForTimeout(800);

    // Verify feedback notification toast
    await expect(page.locator('text=Synchronization Complete').first()).toBeVisible({ timeout: 10000 });

    // 7. Test Channel Configuration Modal on Amazon
    const configBtn = page.getByRole('button', { name: 'Configure & Connect Channel' }).first();
    await expect(configBtn).toBeVisible();
    await configBtn.click();

    // Modal should be visible
    await expect(page.locator('text=Configure Amazon SP-API').first()).toBeVisible();
    const clientIdInput = page.locator('input[placeholder*="Client ID"]').first();
    await expect(clientIdInput).toBeVisible();

    // Fill sample credentials and submit
    await clientIdInput.fill('amzn1.application-oa2-client.masky1029');
    await page.locator('input[placeholder="••••••••••••••••"]').first().fill('sec-amzn-masky-secret-key-12345');
    await page.getByRole('button', { name: 'Save & Verify Connection' }).click();
    await page.waitForTimeout(800);

    // Verify feedback
    await expect(page.locator('text=Configuration Saved').first()).toBeVisible({ timeout: 10000 });

    // 8. Capture Light Theme Screenshot
    await page.screenshot({ path: 'tests/screenshots/multichannel-control-center-light.png', fullPage: true });

    // 9. Switch to Dark Theme and Capture Screenshot
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'tests/screenshots/multichannel-control-center-dark.png', fullPage: true });

    // 10. Navigate to Orders Page and verify Channel Column and filter
    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify Channel column exists in orders table
    await expect(page.locator('th:has-text("Channel")')).toBeVisible();

    // Verify Channel dropdown options
    const channelSelect = page.locator('select:has-text("All Channels")');
    await expect(channelSelect).toBeVisible();
    await expect(channelSelect.locator('option[value="DARAZ"]')).toBeAttached();
    await expect(channelSelect.locator('option[value="EBAY"]')).toBeAttached();
    await expect(channelSelect.locator('option[value="AMAZON"]')).toBeAttached();

    // Verify Channel badges exist in table
    await expect(page.locator('span:has-text("Daraz")').first()).toBeVisible();
    await expect(page.locator('span:has-text("eBay")').first()).toBeVisible();
    await expect(page.locator('span:has-text("Amazon")').first()).toBeVisible();

    // Capture Orders with Multi-Channel Badges Screenshot
    await page.screenshot({ path: 'tests/screenshots/multichannel-orders-badges.png', fullPage: true });
  });
});
