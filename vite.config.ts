import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

export default defineConfig({
  plugins: [vue()],
  base: process.env.GITHUB_PAGES ? '/VibeOS/' : '/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Heavy, rarely-on-first-screen deps get their own chunks so they
          // never land in the initial bundle.
          if (id.includes('node_modules/highlight.js')) return 'highlight'
          if (id.includes('node_modules/marked')) return 'marked'
          if (id.includes('node_modules/lucide-vue-next')) return 'icons'
        },
      },
    },
  },
})
