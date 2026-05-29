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

// Initialize UI (theme) and auth session before mount
const uiStore = useUiStore()
uiStore.init()

const authStore = useAuthStore()
authStore.init()

app.mount('#app')
