import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { createHash } from 'crypto'

export default defineConfig({
  plugins: [vue()],
  define: {
    __ADMIN_EMAIL_HASHES__: JSON.stringify([createHash('sha256').update('admin@example.com').digest('hex')]),
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/core/**/*.ts', 'src/modules/**/stores/*.ts', 'src/modules/**/types.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts'],
      thresholds: {
        statements: 35,
        branches: 22,
        functions: 40,
        lines: 35,
      },
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
})
