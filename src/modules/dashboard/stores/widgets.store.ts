import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'

// ── Types ──────────────────────────────────────────────────────────────
export type WidgetId = 'github' | 'weather' | 'finance' | 'digest'

export interface WidgetConfig {
  id:      WidgetId
  visible: boolean
  order:   number
}

// ── Static metadata ────────────────────────────────────────────────────
export const WIDGET_META: Record<WidgetId, { label: string; icon: string; description: string }> = {
  github:  { label: 'GitHub Activity', icon: 'Github',   description: 'Recent commits + activity graph' },
  weather: { label: 'Weather',         icon: 'Cloud',    description: 'Current conditions + forecast' },
  finance: { label: 'Finance',         icon: 'Wallet',   description: 'Monthly spend snapshot' },
  digest:  { label: 'AI Digest',       icon: 'Sparkles', description: 'On-demand daily summary' },
}

// ── All widget IDs in default order ───────────────────────────────────
export const ALL_WIDGET_IDS: WidgetId[] = ['github', 'weather', 'finance', 'digest']

const DEFAULT_CONFIGS: WidgetConfig[] = ALL_WIDGET_IDS.map((id, i) => ({
  id,
  visible: true,
  order:   i,
}))

// ── Store ──────────────────────────────────────────────────────────────
export const useWidgetsStore = defineStore('dashboard:widgets', () => {
  const configs = useStorage<WidgetConfig[]>(
    storageKey('dashboard', 'widgets'),
    DEFAULT_CONFIGS,
  )

  // Ensure any new widget IDs added in the future get merged in
  function ensureAllWidgets() {
    const existingIds = new Set(configs.value.map(c => c.id))
    let maxOrder = Math.max(...configs.value.map(c => c.order), -1)
    for (const id of ALL_WIDGET_IDS) {
      if (!existingIds.has(id)) {
        configs.value.push({ id, visible: true, order: ++maxOrder })
      }
    }
  }
  ensureAllWidgets()

  // ── Sorted config ────────────────────────────────────────────────────
  const sortedConfigs = computed<WidgetConfig[]>(() =>
    [...configs.value].sort((a, b) => a.order - b.order),
  )

  /** Row widgets: github / weather / finance — visible, sorted */
  const visibleRowWidgets = computed<WidgetConfig[]>(() =>
    sortedConfigs.value.filter(c => c.id !== 'digest' && c.visible),
  )

  /** All configs sorted (used by customizer list) */
  const allSorted = computed<WidgetConfig[]>(() => sortedConfigs.value)

  const digestVisible = computed<boolean>(
    () => configs.value.find(c => c.id === 'digest')?.visible ?? true,
  )

  // ── Actions ──────────────────────────────────────────────────────────
  function toggleWidget(id: WidgetId) {
    const cfg = configs.value.find(c => c.id === id)
    if (cfg) cfg.visible = !cfg.visible
  }

  function reorder(fromId: WidgetId, toId: WidgetId) {
    if (fromId === toId) return
    const sorted = [...configs.value].sort((a, b) => a.order - b.order)
    const fromIdx = sorted.findIndex(c => c.id === fromId)
    const toIdx   = sorted.findIndex(c => c.id === toId)
    if (fromIdx === -1 || toIdx === -1) return

    // Splice fromId out, insert at toIdx
    const [moved] = sorted.splice(fromIdx, 1)
    sorted.splice(toIdx, 0, moved)

    // Re-assign sequential order values
    sorted.forEach((c, i) => {
      const cfg = configs.value.find(x => x.id === c.id)
      if (cfg) cfg.order = i
    })
  }

  function resetToDefaults() {
    configs.value = DEFAULT_CONFIGS.map(c => ({ ...c }))
  }

  return {
    configs,
    sortedConfigs,
    allSorted,
    visibleRowWidgets,
    digestVisible,
    toggleWidget,
    reorder,
    resetToDefaults,
  }
})
