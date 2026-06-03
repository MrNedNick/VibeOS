import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useWidgetsStore, ALL_WIDGET_IDS } from '@/modules/dashboard/stores/widgets.store'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('useWidgetsStore', () => {
  it('initialises with all widgets visible', () => {
    const store = useWidgetsStore()
    expect(store.configs).toHaveLength(ALL_WIDGET_IDS.length)
    expect(store.configs.every(c => c.visible)).toBe(true)
  })

  it('sortedConfigs returns widgets in order', () => {
    const store = useWidgetsStore()
    const orders = store.sortedConfigs.map(c => c.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('toggleWidget() flips visibility', () => {
    const store = useWidgetsStore()
    const before = store.configs.find(c => c.id === 'github')!.visible
    store.toggleWidget('github')
    const after = store.configs.find(c => c.id === 'github')!.visible
    expect(after).toBe(!before)
  })

  it('toggleWidget() double-toggle restores original visibility', () => {
    const store = useWidgetsStore()
    const before = store.configs.find(c => c.id === 'weather')!.visible
    store.toggleWidget('weather')
    store.toggleWidget('weather')
    const after = store.configs.find(c => c.id === 'weather')!.visible
    expect(after).toBe(before)
  })

  it('visibleRowWidgets never includes digest', () => {
    const store = useWidgetsStore()
    const ids = store.visibleRowWidgets.map(c => c.id)
    expect(ids).not.toContain('digest')
  })

  it('toggleWidget() changes visibility of the target widget', () => {
    const store = useWidgetsStore()
    const before = store.configs.find(c => c.id === 'github')!.visible
    store.toggleWidget('github')
    const after = store.configs.find(c => c.id === 'github')!.visible
    // Toggle must have changed the value
    expect(after).not.toBe(before)
  })

  it('digestVisible reflects digest widget visibility', () => {
    const store = useWidgetsStore()
    expect(store.digestVisible).toBe(true)

    store.toggleWidget('digest')
    expect(store.digestVisible).toBe(false)
  })

  it('reorder() moves widget to new position', () => {
    const store = useWidgetsStore()
    const before = store.sortedConfigs.map(c => c.id)
    store.reorder(before[0], before[1])
    const after = store.sortedConfigs.map(c => c.id)
    expect(after[0]).toBe(before[1])
  })

  it('reorder() with same id does nothing', () => {
    const store = useWidgetsStore()
    const before = store.sortedConfigs.map(c => c.id)
    store.reorder('github', 'github')
    const after = store.sortedConfigs.map(c => c.id)
    expect(after).toEqual(before)
  })

  it('resetToDefaults() restores configs to default order values', () => {
    const store = useWidgetsStore()
    store.reorder(ALL_WIDGET_IDS[0], ALL_WIDGET_IDS[3])

    store.resetToDefaults()

    const orders = store.configs.map(c => c.order).sort((a, b) => a - b)
    expect(orders).toEqual([0, 1, 2, 3])
  })

  it('resetToDefaults() restores all widgets to visible even after toggling', () => {
    const store = useWidgetsStore()
    // Hide all widgets
    for (const id of ALL_WIDGET_IDS) store.toggleWidget(id)
    expect(store.configs.every(c => !c.visible)).toBe(true)

    store.resetToDefaults()

    expect(store.configs.every(c => c.visible)).toBe(true)
  })

  it('resetToDefaults() produces a fresh default order (0,1,2,3 matching ALL_WIDGET_IDS)', () => {
    const store = useWidgetsStore()
    store.reorder(ALL_WIDGET_IDS[0], ALL_WIDGET_IDS[3])
    store.toggleWidget(ALL_WIDGET_IDS[1])

    store.resetToDefaults()

    const sorted = store.sortedConfigs
    expect(sorted.map(c => c.id)).toEqual(ALL_WIDGET_IDS)
    expect(sorted.map(c => c.visible)).toEqual(ALL_WIDGET_IDS.map(() => true))
  })

  it('resetToDefaults() keeps the same number of widget configs', () => {
    const store = useWidgetsStore()
    store.resetToDefaults()
    expect(store.configs).toHaveLength(ALL_WIDGET_IDS.length)
  })

  it('resetToDefaults() produces configs with all expected widget ids', () => {
    const store = useWidgetsStore()
    store.resetToDefaults()
    const ids = store.configs.map(c => c.id).sort()
    expect(ids).toEqual([...ALL_WIDGET_IDS].sort())
  })

  it('allSorted returns all configs sorted by order', () => {
    const store = useWidgetsStore()
    const sorted = store.allSorted
    expect(sorted.map(c => c.order)).toEqual([...sorted.map(c => c.order)].sort((a, b) => a - b))
  })
})
