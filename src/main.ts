import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUiStore } from './core/stores/ui.store'
import { useAuthStore } from './core/stores/auth.store'
import './assets/styles/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Initialize UI (theme) synchronously — must happen before mount to avoid flash
const uiStore = useUiStore()
uiStore.init()

// Initialize auth: restores demo session synchronously from localStorage,
// then kicks off async Supabase session check without blocking mount.
const authStore = useAuthStore()
authStore.init().catch(console.warn)

app.mount('#app')
