import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { createHash } from 'crypto'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
const base = process.env.GITHUB_PAGES ? '/VibeOS/' : '/'

// Admin addresses never reach the bundle — only their SHA-256 hashes do.
const env = { ...loadEnv('', __dirname, ''), ...process.env }
const adminEmailHashes = (env.ADMIN_EMAILS ?? env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)
  .map(e => createHash('sha256').update(e).digest('hex'))

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      // autoUpdate: the new service worker takes over (skipWaiting + clientsClaim)
      // as soon as it finishes installing, so a stale version never stays active.
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: false, // public/manifest.webmanifest is hand-maintained and already linked in index.html
      workbox: {
        // App-shell precache: JS/CSS/HTML/icons. No API responses are cached —
        // Supabase reads/writes stay live-network-only; the app's own offline
        // queue (useCloudSync) already handles writes made while offline.
        globPatterns: ['**/*.{js,css,html,svg,webmanifest}'],
        navigateFallback: `${base}index.html`,
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __ADMIN_EMAIL_HASHES__: JSON.stringify(adminEmailHashes),
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
