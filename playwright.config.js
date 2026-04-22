import { devices } from '@playwright/test';

export default {
  testMatch: /.*\.e2e\.js/,
  outputDir: './test/artifacts/',

  timeout: 120000, // 2 minutes for complex tests
  globalTimeout: 600000, // 10 minutes total
  expect: {
    timeout: 30000, // 30 seconds for assertions
  },

  reporter: [
    ['list'],
    ['json', { outputFile: './test/report/test-results.json' }],
    [
      'html',
      {
        outputFolder: './test/report',
        open: process.env.SKIP_OPEN_REPORT ? 'never' : 'on-failure',
      },
    ],
  ],

  webServer: {
    command: 'npm run serve -- --port 8077 --open false',
    reuseExistingServer: !process.env.CI,
    port: '8077',
    timeout: 120000, // Wait longer for server startup
  },

  use: {
    baseURL: 'http://localhost:8077',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000, // Time for clicks, fills, etc.
    navigationTimeout: 60000, // Time for page loads
  },

  projects: [
    {
      name: 'chromium',
      headless: true,
      use: {
        ...devices['Desktop Chrome'],
        // clipboard-write permission required for Monaco editor write strategy —
        // navigator.clipboard.writeText() is blocked by default in headless Chromium
        permissions: ['clipboard-read', 'clipboard-write'],
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'],
        },
      },
    },
  ],
};
