import { defineConfig } from '@playwright/test'
// Keep optional browser binaries inside the project, not in the host profile.
process.env.PLAYWRIGHT_BROWSERS_PATH ??= './.cache/ms-playwright'
export default defineConfig({
  testDir: './browser-tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  outputDir: 'output/playwright/runs',
  use: {
    baseURL: 'http://127.0.0.1:4101',
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4101 --strictPort',
    url: 'http://127.0.0.1:4101',
    reuseExistingServer: !process.env.CI,
  },
})
