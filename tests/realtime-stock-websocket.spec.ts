import { test, expect } from '@playwright/test';
import { setupAdminSession } from './auth-helper';

test.describe('Real-Time WebSocket Stock Synchronization & 0-Stock Checkout Prevention', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[BROWSER ERROR] ${err.message}`));
    page.on('requestfailed', req => console.log(`[REQUEST FAILED] ${req.method()} ${req.url()}: ${req.failure()?.errorText}`));
  });

  test('Storefront Checkout: Disables place order button and shows alert banner when 0-stock event arrives via WebSocket', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 });

    const mockCartItem = {
      id: "cart-item-1",
      variantId: "var-polo-black-l",
      quantity: 1,
      variant: {
        id: "var-polo-black-l",
        sku: "MSK-POLO-BLK-L",
        price: 4500,
        quantity: 2,
        stockStatus: "instock",
        name: "Size L / Black",
        product: {
          id: "prod-polo-1",
          name: "Signature Polo Shirt",
          allowedPaymentMethods: ["cod", "koko", "payhere"],
        },
      },
    };

    // Set mock zustand session in localStorage before page load
    await page.addInitScript(() => {
      localStorage.setItem('laural-cart-session', JSON.stringify({
        state: {
          sessionId: 'mock-session-test-123',
          isDrawerOpen: false,
        },
        version: 0,
      }));
    });

    // Mock cart API specifically for /api/v1/cart requests
    await page.route(/\/api\/v1\/cart(\?.*)?$/, async (route) => {
      console.log(`[MOCK ROUTE] Intercepted /api/v1/cart`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: "mock-cart-id",
          sessionId: "mock-session-test-123",
          items: [mockCartItem],
          subtotal: 4500,
          total: 4900,
        }),
      });
    });

    // Mock addresses API
    await page.route(/\/api\/v1\/addresses/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Mock payment methods API
    await page.route(/\/api\/v1\/payments\/methods/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: [
            { id: "cod", name: "Cash on Delivery", isEnabled: true },
            { id: "koko", name: "Koko (Buy Now Pay Later)", isEnabled: true },
            { id: "payhere", name: "Credit / Debit Card", isEnabled: true },
          ],
        }),
      });
    });

    // Mock stock verification endpoint
    await page.route(/\/api\/v1\/checkout\/verify-stock/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: false,
          depletedItems: [
            {
              variantId: "var-polo-black-l",
              name: "Signature Polo Shirt",
              availableStock: 0,
            },
          ],
        }),
      });
    });

    // Navigate to Checkout page
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });

    // Verify "Real-Time Sync Active" status indicator is rendered in the order summary
    const realtimeBadge = page.locator('#realtime-sync-indicator');
    await expect(realtimeBadge).toBeVisible({ timeout: 15000 });
    await expect(realtimeBadge).toContainText('Real-Time Sync Active');

    // Wait for the cart review items to populate with the polo item
    await expect(page.locator('text=Signature Polo Shirt').first()).toBeVisible({ timeout: 15000 });

    const placeOrderBtn = page.locator('#place-order-submit-btn');
    await expect(placeOrderBtn).toBeVisible();

    // Verify initial state: not out of stock
    const realtimeAlert = page.locator('#realtime-stock-alert');
    await expect(realtimeAlert).not.toBeVisible();

    // Small delay to ensure React hooks are fully mounted
    await page.waitForTimeout(500);

    // Simulate real-time stock depletion event over WebSocket
    await page.evaluate(() => {
      const eventData = {
        variantId: "var-polo-black-l",
        quantity: 0,
        stockStatus: "outofstock",
        channel: "Daraz Sri Lanka",
        reason: "Order ingested on Daraz Sri Lanka",
        timestamp: new Date().toISOString(),
        zeroStock: true,
      };

      if (typeof (window as any).__MASKY_DISPATCH_SOCKET_EVENT__ === 'function') {
        (window as any).__MASKY_DISPATCH_SOCKET_EVENT__('stock:depleted', eventData);
        (window as any).__MASKY_DISPATCH_SOCKET_EVENT__('stock:updated', eventData);
      }
      window.dispatchEvent(new CustomEvent('masky:stock:depleted', { detail: eventData }));
    });

    // The real-time alert banner should appear
    await expect(page.locator('#realtime-stock-alert')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#realtime-stock-alert')).toContainText('was just purchased on Daraz Sri Lanka');

    // The Place Order button must be disabled with lockout message
    await expect(placeOrderBtn).toBeDisabled();
    await expect(placeOrderBtn).toContainText('Item Out of Stock — Checkout Blocked');

    // Take screenshot of the real-time stock lockout on checkout
    await page.screenshot({
      path: 'tests/screenshots/realtime-checkout-lockout.png',
      fullPage: true,
    });
  });

  test('Multi-Channel Control Center: Shows active WebSocket Live Sync badge and streams real-time sync events', async ({ page, context }) => {
    await page.setViewportSize({ width: 1440, height: 960 });

    // Setup authenticated session
    await setupAdminSession(context, page);

    const mockChannels = [
      {
        id: "daraz",
        name: "Daraz Sri Lanka & Regional",
        type: "DARAZ",
        status: "CONNECTED",
        icon: "Globe2",
        region: "LK (Sri Lanka)",
        syncSettings: { autoSyncInventory: true, autoSyncPrices: true, autoSyncOrders: true },
        metrics: { totalRevenue: 486250, totalOrders: 328, activeListings: 142, syncHealth: "Optimal" },
        lastSyncAt: new Date().toISOString(),
      },
      {
        id: "ebay",
        name: "eBay Marketplace",
        type: "EBAY",
        status: "CONNECTED",
        icon: "Tag",
        region: "Global (EBAY_US)",
        syncSettings: { autoSyncInventory: true, autoSyncPrices: true, autoSyncOrders: true },
        metrics: { totalRevenue: 894100, totalOrders: 154, activeListings: 89, syncHealth: "Optimal" },
        lastSyncAt: new Date().toISOString(),
      },
      {
        id: "amazon",
        name: "Amazon Seller Central (SP-API)",
        type: "AMAZON",
        status: "CONNECTED",
        icon: "ShoppingCart",
        region: "US Marketplace (ATVPDKIKX0DER)",
        syncSettings: { autoSyncInventory: true, autoSyncPrices: true, autoSyncOrders: true },
        metrics: { totalRevenue: 1420800, totalOrders: 412, activeListings: 210, syncHealth: "Optimal" },
        lastSyncAt: new Date().toISOString(),
      },
    ];

    // Mock channel APIs on /api/v1/
    await page.route(/\/api\/v1\/channels\/stats/, async (route) => {
      console.log(`[MOCK ROUTE] Intercepted /api/v1/channels/stats`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: {
            connectedChannels: "3 / 4",
            totalActiveListings: 445,
            totalMultiChannelOrders: 1862,
            totalMultiChannelRevenue: 3668750,
            overallSyncStatus: "OPTIMAL",
          },
        }),
      });
    });

    await page.route(/\/api\/v1\/channels\/logs/, async (route) => {
      console.log(`[MOCK ROUTE] Intercepted /api/v1/channels/logs`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: [
            {
              id: "log-1",
              channelName: "Daraz Sri Lanka",
              action: "INVENTORY_SYNC",
              status: "SUCCESS",
              details: "Synced 142 SKUs across regional branches",
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    await page.route(/\/api\/v1\/channels(\?.*)?$/, async (route) => {
      console.log(`[MOCK ROUTE] Intercepted /api/v1/channels`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: mockChannels }),
      });
    });

    await page.route(/\/api\/v1\/branches/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: [] }),
      });
    });

    await page.route(/\/api\/v1\/reports/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: {} }),
      });
    });

    await page.route(/\/api\/v1\/notifications/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: [] }),
      });
    });

    await page.route(/\/api\/v1\/orders/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: [] }),
      });
    });

    // Navigate to Channels page
    await page.goto('/admin/channels', { waitUntil: 'domcontentloaded' });

    // Verify WebSocket status indicator is present and connected
    const wsBadge = page.locator('#websocket-status-badge');
    await expect(wsBadge).toBeVisible({ timeout: 15000 });
    await expect(wsBadge).toContainText('WebSocket Live Sync: Active', { timeout: 20000 });

    // Wait a brief moment to ensure React hooks are mounted
    await page.waitForTimeout(500);

    // Simulate incoming WebSocket channel sync event
    await page.evaluate(() => {
      console.log("[TEST 2 EVALUATE] Starting dispatch...");
      const liveEvent = {
        id: "live-event-test-99",
        channelName: "Amazon SP-API",
        action: "REALTIME_0_STOCK_GUARD",
        status: "SUCCESS",
        details: "Zero-stock lockout triggered for SKU MSK-POLO-BLK-L across Daraz and Web Storefront",
        timestamp: new Date().toISOString(),
      };

      if (typeof (window as any).__MASKY_DISPATCH_SOCKET_EVENT__ === 'function') {
        (window as any).__MASKY_DISPATCH_SOCKET_EVENT__('channel:sync_event', liveEvent);
      } else {
        window.dispatchEvent(new CustomEvent('masky:channel:sync', { detail: liveEvent }));
      }
    });

    // Check if the live log is visible in the audit table
    const auditRow = page.locator('text=REALTIME_0_STOCK_GUARD').first();
    await expect(auditRow).toBeVisible({ timeout: 10000 });

    // Scroll to the audit log table to show both the cards and the live event
    await auditRow.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Take screenshot of the channels control center with real-time websocket badge and event
    await page.screenshot({
      path: 'tests/screenshots/realtime-channels-websocket.png',
      fullPage: true,
    });
  });
});
