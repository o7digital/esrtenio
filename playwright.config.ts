import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const localChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'line',
  use: {
    baseURL: process.env.SITE_TEST_URL || 'http://127.0.0.1:4322',
    browserName: 'chromium',
    ...(existsSync(localChrome) ? { launchOptions: { executablePath: localChrome } } : {}),
  },
  webServer: process.env.SITE_TEST_URL ? undefined : {
    command: 'python3 -m http.server 4322 --bind 127.0.0.1 --directory dist',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: false,
  },
});
