import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storagGet, storageSet } from '@/core/utils/storage'

type Theme = 'dark' | 'light'

const THEME_KEY = 'platform:ui:theme'
const SIDEBAR_KEY = 'platform:ui:sidebar'

export const useUiStore = defineStore('core:ui', () => {
  const theme = ref<Theme>(storagGet<Theme>(THEME_KEY, 'dark'))
  // sidebarOpen = sidebar is pinned/expanded on desktop (persisted)
  const sidebarOpen = ref<boolean>(storagGet<boolean>(SIDEBAR_KEY, true))
  // mobileSidebarOpen = drawer is open on mobile/tablet (not persisted)
  const mobileSidebarOpen = ref<boolean>(false)

  const isDark = computed(() => theme.value === 'dark')

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme.value === 'light' ? 'light' : '')
  }

  function setTheme(value: Theme) {
    theme.value = value
    storageSet(THEME_KEY, value)
    applyTheme()
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  function setSidebar(value: boolean) {
    sidebarOpen.value = value
    storageSet(SIDEBAR_KEY, value)
  }

  function toggleSidebar() {
    setSidebar(!sidebarOpen.value)
  }

  function openMobileDrawer() { mobileSidebarOpen.value = true }
  function closeMobileDrawer() { mobileSidebarOpen.value = false }
  function toggleMobileDrawer() { mobileSidebarOpen.value = !mobileSidebarOpen.value }

  function init() {
    applyTheme()
  }

  return {
    theme, isDark,
    sidebarOpen, setSidebar, toggleSidebar,
    mobileSidebarOpen, openMobileDrawer, closeMobileDrawer, toggleMobileDrawer,
    setTheme, toggleTheme,
    init,
  }
})
