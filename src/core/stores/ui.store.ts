import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storagGet, storageSet } from '@/core/utils/storage'

export type Theme = 'dark' | 'light' | 'brutalist' | 'softglass' | 'crt'

const THEME_KEY = 'platform:ui:theme'
const SIDEBAR_KEY = 'platform:ui:sidebar'

export const useUiStore = defineStore('core:ui', () => {
  const theme = ref<Theme>(storagGet<Theme>(THEME_KEY, 'light'))
  // sidebarOpen = sidebar is pinned/expanded on desktop (persisted)
  const sidebarOpen = ref<boolean>(storagGet<boolean>(SIDEBAR_KEY, true))
  // mobileSidebarOpen = drawer is open on mobile/tablet (not persisted)
  const mobileSidebarOpen = ref<boolean>(false)

  /** True for dark-background themes */
  const isDark = computed(() => theme.value === 'dark' || theme.value === 'crt')

  function applyTheme() {
    // dark → '' (default), everything else → its own data-theme value
    document.documentElement.setAttribute(
      'data-theme',
      theme.value === 'dark' ? '' : theme.value
    )
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
    // Migrate removed pak IDs to safe defaults
    const stored = storagGet<string>(THEME_KEY, '')
    if (stored === 'synthwave') setTheme('dark')
    else applyTheme()
  }

  return {
    theme, isDark,
    sidebarOpen, setSidebar, toggleSidebar,
    mobileSidebarOpen, openMobileDrawer, closeMobileDrawer, toggleMobileDrawer,
    setTheme, toggleTheme,
    init,
  }
})
