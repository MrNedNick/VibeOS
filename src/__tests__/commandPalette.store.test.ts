import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCommandPaletteStore } from '@/core/stores/commandPalette.store'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useCommandPaletteStore', () => {
  it('starts closed', () => {
    expect(useCommandPaletteStore().isOpen).toBe(false)
  })

  it('open() sets isOpen to true', () => {
    const store = useCommandPaletteStore()
    store.open()
    expect(store.isOpen).toBe(true)
  })

  it('close() sets isOpen to false', () => {
    const store = useCommandPaletteStore()
    store.open()
    store.close()
    expect(store.isOpen).toBe(false)
  })

  it('toggle() opens when closed', () => {
    const store = useCommandPaletteStore()
    store.toggle()
    expect(store.isOpen).toBe(true)
  })

  it('toggle() closes when open', () => {
    const store = useCommandPaletteStore()
    store.open()
    store.toggle()
    expect(store.isOpen).toBe(false)
  })

  it('toggle() can cycle open → closed → open', () => {
    const store = useCommandPaletteStore()
    store.toggle()
    expect(store.isOpen).toBe(true)
    store.toggle()
    expect(store.isOpen).toBe(false)
    store.toggle()
    expect(store.isOpen).toBe(true)
  })
})
