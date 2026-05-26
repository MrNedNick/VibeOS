import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUiStore } from './core/stores/ui.store'
import './assets/styles/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Initialize theme before mount to avoid flash
const uiStore = useUiStore()
uiStore.init()

app.mount('#app')
