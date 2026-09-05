import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUiStore } from './core/stores/ui.store'
import { useAuthStore } from './core/stores/auth.store'
import { gcTombstones, useCloudSync } from './core/composables/useCloudSync'
import { createNavigationTracker } from './core/plugins/navigationTracker'
import { registerTrackDirective } from './core/directives/vTrack'
import { registerSW } from 'virtual:pwa-register'
import './assets/styles/main.css'

// Offline app shell: a new deploy activates immediately (autoUpdate) instead of
// leaving an open tab stuck on the previous cached version.
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      updateSW(true)
    },
  })
  // Catch deploys that land while the tab has been open for a while.
  setInterval(() => updateSW(), 60 * 60 * 1000)
}

// Reclaim space from soft-deleted records older than the merge window (S14 T3).
gcTombstones()

// Reconcile with the server when network reconnects: pull + merge remote
// changes (by updatedAt) into localStorage *before* draining the offline
// write queue, so a queued push can't blindly clobber a newer edit made
// from another tab/device while this one was offline. pullAll() already
// calls drainQueue() itself once the merge is done.
window.addEventListener('online', () => useCloudSync().pullAll())

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(createNavigationTracker(router))
registerTrackDirective(app)

// Initialize UI (theme) synchronously — must happen before mount to avoid flash
const uiStore = useUiStore()
uiStore.init()

// Initialize auth: restores demo session synchronously from localStorage,
// then kicks off async Supabase session check without blocking mount.
const authStore = useAuthStore()
authStore.init().catch(console.warn)

app.mount('#app')
