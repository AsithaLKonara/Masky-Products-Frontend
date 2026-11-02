import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3000',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: 'on',
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        channel: 'chrome',
      },
    },
  ],
});
