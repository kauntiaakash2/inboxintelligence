import { defineConfig } from '@playwright/test'
import base from './playwright.config'
// Dev-module failure injection needs Vite's source server; all other suites also verify dist.
export default defineConfig({
  ...base,
  outputDir: 'output/playwright/preview-runs',
  testMatch: [
    '**/landing.spec.ts',
    '**/onboarding.spec.ts',
    '**/gmail.spec.ts',
    '**/workspace.spec.ts',
    '**/simplification.spec.ts',
  ],
  use: { ...base.use, baseURL: 'http://127.0.0.1:4102' },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4102 --strictPort',
    url: 'http://127.0.0.1:4102',
    reuseExistingServer: false,
  },
})
