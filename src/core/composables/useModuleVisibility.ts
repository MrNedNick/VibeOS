import { computed } from 'vue'
import { useStorage } from './useStorage'

// IDs of modules the user has hidden from the sidebar
const HIDDEN_KEY = 'platform:settings:hidden-modules'

const hiddenModules = useStorage<string[]>(HIDDEN_KEY, [])

export function useModuleVisibility() {
  function isVisible(moduleId: string): boolean {
    return !hiddenModules.value.includes(moduleId)
  }

  function toggleModule(moduleId: string) {
    const idx = hiddenModules.value.indexOf(moduleId)
    if (idx > -1) {
      hiddenModules.value.splice(idx, 1)
    } else {
      hiddenModules.value.push(moduleId)
    }
  }

  function showModule(moduleId: string) {
    hiddenModules.value = hiddenModules.value.filter(id => id !== moduleId)
  }

  function hideModule(moduleId: string) {
    if (!hiddenModules.value.includes(moduleId)) {
      hiddenModules.value.push(moduleId)
    }
  }

  const hiddenCount = computed(() => hiddenModules.value.length)

  return { hiddenModules, isVisible, toggleModule, showModule, hideModule, hiddenCount }
}
