import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
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
