import { BrowserContext, Page } from '@playwright/test';

export function createMockAdminToken(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      id: 'admin-user-id',
      email: 'admin@masky.space',
      name: 'Asitha K.',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 7, // 7 days
    })
  ).toString('base64url');

  return `${header}.${body}.mockSignature`;
}

export async function setupAdminSession(context: BrowserContext, page: Page) {
  const token = createMockAdminToken();

  // Set auth cookies for Next.js middleware
  await context.addCookies([
    {
      name: 'laural_access_token',
      value: token,
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'laural_refresh_token',
      value: token,
      domain: 'localhost',
      path: '/',
    },
  ]);

  const mockUser = {
    id: 'admin-user-id',
    name: 'Asitha K.',
    email: 'admin@masky.space',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: [
      'reports:view_dashboard',
      'reports:view_financial',
      'reports:export_data',
      'orders:view',
      'products:view',
      'customers:view',
      'inventory:view_stock',
      'loyalty:view_points',
      'returns:view',
      'payments:view_transactions',
      'system:manage_roles',
      'system:manage_users',
      'system:platform_settings',
    ],
  };

  // Mock /auth/me API endpoint
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: mockUser,
      }),
    });
  });

  // Mock CSRF token endpoint
  await page.route('**/api/v1/auth/csrf', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success', csrfToken: 'mock-csrf-token' }),
    });
  });

  // Mock /auth/refresh API endpoint
  await page.route('**/api/v1/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: {
          accessToken: token,
          user: mockUser,
        },
      }),
    });
  });

  // Initialize both laural_user and auth-storage before page loads
  await page.addInitScript((user) => {
    localStorage.setItem('laural_user', JSON.stringify(user));
    localStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          user,
          isAuthenticated: true,
          isLoading: false,
        },
        version: 0,
      })
    );
  }, mockUser);
}
