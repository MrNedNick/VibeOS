import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storagGet, storageSet } from '@/core/utils/storage'
import { getSupabase, isSupabaseConfigured } from '@/core/services/supabase'

export type Theme = 'dark' | 'light' | 'brutalist' | 'crt'

const THEME_KEY = 'platform:ui:theme'
const SIDEBAR_KEY = 'platform:ui:sidebar'

export const useUiStore = defineStore('core:ui', () => {
  const theme = ref<Theme>(storagGet<Theme>(THEME_KEY, 'light'))
  const sidebarOpen = ref<boolean>(storagGet<boolean>(SIDEBAR_KEY, true))
  const mobileSidebarOpen = ref<boolean>(false)

  const isDark = computed(() => theme.value === 'dark' || theme.value === 'crt')

  function applyTheme() {
    document.documentElement.setAttribute(
      'data-theme',
      theme.value === 'dark' ? '' : theme.value,
    )
  }

  async function _pushSettingsToCloud(): Promise<void> {
    if (!isSupabaseConfigured) return
    try {
      const sb = getSupabase()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (sb.from('user_settings') as any).upsert(
        { user_id: user.id, theme: theme.value },
        { onConflict: 'user_id' },
      )
    } catch { /* non-critical — settings also live in localStorage */ }
  }

  function setTheme(value: Theme) {
    theme.value = value
    storageSet(THEME_KEY, value)
    applyTheme()
    _pushSettingsToCloud()
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  function setSidebar(value: boolean) {
    sidebarOpen.value = value
    storageSet(SIDEBAR_KEY, value)
  }

  function toggleSidebar() { setSidebar(!sidebarOpen.value) }

  function openMobileDrawer()  { mobileSidebarOpen.value = true }
  function closeMobileDrawer() { mobileSidebarOpen.value = false }
  function toggleMobileDrawer() { mobileSidebarOpen.value = !mobileSidebarOpen.value }

  async function syncSettingsFromCloud(): Promise<void> {
    if (!isSupabaseConfigured) return
    try {
      const sb = getSupabase()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (sb.from('user_settings') as any)
        .select('theme')
        .eq('user_id', user.id)
        .single()
      if (data?.theme && data.theme !== theme.value) {
        setTheme(data.theme as Theme)
      }
    } catch { /* non-critical */ }
  }

  function init() {
    const stored = storagGet<string>(THEME_KEY, '')
    if (stored === 'synthwave') setTheme('dark')
    else if (stored === 'softglass') setTheme('light')
    else applyTheme()
  }

  return {
    theme, isDark,
    sidebarOpen, setSidebar, toggleSidebar,
    mobileSidebarOpen, openMobileDrawer, closeMobileDrawer, toggleMobileDrawer,
    setTheme, toggleTheme,
    syncSettingsFromCloud,
    init,
  }
})
