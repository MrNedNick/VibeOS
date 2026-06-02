import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUiStore } from '@/core/stores/ui.store'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  // Reset data-theme attribute between tests
  document.documentElement.removeAttribute('data-theme')
})

describe('useUiStore — theme', () => {
  it('defaults to light theme when localStorage is empty', () => {
    expect(useUiStore().theme).toBe('light')
  })

  it('setTheme updates theme ref', () => {
    const store = useUiStore()
    store.setTheme('dark')
    expect(store.theme).toBe('dark')
  })

  it('setTheme persists to localStorage', () => {
    const store = useUiStore()
    store.setTheme('brutalist')
    const raw = localStorage.getItem('platform:ui:theme')
    expect(JSON.parse(raw!)).toBe('brutalist')
  })

  it('setTheme dark → clears data-theme attribute', () => {
    const store = useUiStore()
    store.setTheme('dark')
    // dark theme uses '' (empty = :root default)
    expect(document.documentElement.getAttribute('data-theme')).toBe('')
  })

  it('setTheme light → sets data-theme="light"', () => {
    const store = useUiStore()
    store.setTheme('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('setTheme crt → sets data-theme="crt"', () => {
    const store = useUiStore()
    store.setTheme('crt')
    expect(document.documentElement.getAttribute('data-theme')).toBe('crt')
  })

  it('isDark is true for dark theme', () => {
    const store = useUiStore()
    store.setTheme('dark')
    expect(store.isDark).toBe(true)
  })

  it('isDark is true for crt theme', () => {
    const store = useUiStore()
    store.setTheme('crt')
    expect(store.isDark).toBe(true)
  })

  it('isDark is false for light theme', () => {
    const store = useUiStore()
    store.setTheme('light')
    expect(store.isDark).toBe(false)
  })

  it('isDark is false for brutalist theme', () => {
    const store = useUiStore()
    store.setTheme('brutalist')
    expect(store.isDark).toBe(false)
  })

  it('toggleTheme switches from dark to light', () => {
    const store = useUiStore()
    store.setTheme('dark')
    store.toggleTheme()
    expect(store.theme).toBe('light')
  })

  it('toggleTheme switches from light to dark', () => {
    const store = useUiStore()
    store.setTheme('light')
    store.toggleTheme()
    expect(store.theme).toBe('dark')
  })

  it('toggleTheme switches from crt to light (isDark → light)', () => {
    const store = useUiStore()
    store.setTheme('crt')
    store.toggleTheme()
    expect(store.theme).toBe('light')
  })
})

describe('useUiStore — init (stale pak migration)', () => {
  it('init migrates synthwave → dark', () => {
    localStorage.setItem('platform:ui:theme', JSON.stringify('synthwave'))
    const store = useUiStore()
    store.init()
    expect(store.theme).toBe('dark')
  })

  it('init migrates softglass → light', () => {
    localStorage.setItem('platform:ui:theme', JSON.stringify('softglass'))
    const store = useUiStore()
    store.init()
    expect(store.theme).toBe('light')
  })
})

describe('useUiStore — sidebar', () => {
  it('sidebarOpen defaults to true', () => {
    expect(useUiStore().sidebarOpen).toBe(true)
  })

  it('setSidebar(false) collapses sidebar', () => {
    const store = useUiStore()
    store.setSidebar(false)
    expect(store.sidebarOpen).toBe(false)
  })

  it('toggleSidebar flips open state', () => {
    const store = useUiStore()
    store.toggleSidebar()
    expect(store.sidebarOpen).toBe(false)
    store.toggleSidebar()
    expect(store.sidebarOpen).toBe(true)
  })

  it('setSidebar persists to localStorage', () => {
    const store = useUiStore()
    store.setSidebar(false)
    const raw = localStorage.getItem('platform:ui:sidebar')
    expect(JSON.parse(raw!)).toBe(false)
  })
})

describe('useUiStore — mobile drawer', () => {
  it('mobileSidebarOpen starts false (not persisted)', () => {
    expect(useUiStore().mobileSidebarOpen).toBe(false)
  })

  it('openMobileDrawer sets mobileSidebarOpen true', () => {
    const store = useUiStore()
    store.openMobileDrawer()
    expect(store.mobileSidebarOpen).toBe(true)
  })

  it('closeMobileDrawer sets mobileSidebarOpen false', () => {
    const store = useUiStore()
    store.openMobileDrawer()
    store.closeMobileDrawer()
    expect(store.mobileSidebarOpen).toBe(false)
  })

  it('toggleMobileDrawer flips state', () => {
    const store = useUiStore()
    store.toggleMobileDrawer()
    expect(store.mobileSidebarOpen).toBe(true)
    store.toggleMobileDrawer()
    expect(store.mobileSidebarOpen).toBe(false)
  })
})
