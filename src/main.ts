import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUiStore } from './core/stores/ui.store'
import { useAuthStore } from './core/stores/auth.store'
import { gcTombstones } from './core/composables/useCloudSync'
import { createNavigationTracker } from './core/plugins/navigationTracker'
import { registerTrackDirective } from './core/directives/vTrack'
import './assets/styles/main.css'

// Reclaim space from soft-deleted records older than the merge window (S14 T3).
gcTombstones()

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
