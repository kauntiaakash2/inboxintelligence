import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: '127.0.0.1' },
  test: {
    include: ['src/tests/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    css: false,
    coverage: {
      provider: 'v8',
      include: [
        'src/features/**/*.ts',
        'src/services/**/*.ts',
        'src/repositories/**/*.ts',
        'src/components/**/*.tsx',
      ],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
  },
})
