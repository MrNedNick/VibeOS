import { ref, computed, watch } from 'vue'
import { useSnippetsStore } from '../stores/snippets.store'

export function useSnippets() {
  const store = useSnippetsStore()

  const selectedId = ref<string | null>(null)
  const searchQuery = ref('')
  const languageFilter = ref('all')
  const isEditing = ref(false)

  const filteredSnippets = computed(() => {
    let list = store.sortedSnippets
    if (languageFilter.value !== 'all') {
      list = list.filter(s => s.language === languageFilter.value)
    }
    if (!searchQuery.value.trim()) return list
    const q = searchQuery.value.toLowerCase()
    return list.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q))
    )
  })

  const selectedSnippet = computed(() =>
    store.snippets.find(s => s.id === selectedId.value) ?? null
  )

  watch(selectedId, () => { isEditing.value = false })

  watch(filteredSnippets, (list) => {
    if (!selectedId.value && list.length > 0) {
      selectedId.value = list[0].id
    }
  }, { immediate: true })

  function newSnippet(): void {
    const id = store.createSnippet()
    selectedId.value = id
    isEditing.value = true
  }

  function selectSnippet(id: string): void {
    selectedId.value = id
  }

  function deleteSnippet(id: string): void {
    store.deleteSnippet(id)
    const remaining = filteredSnippets.value
    selectedId.value = remaining[0]?.id ?? null
  }

  return {
    store,
    selectedId,
    searchQuery,
    languageFilter,
    isEditing,
    filteredSnippets,
    selectedSnippet,
    newSnippet,
    selectSnippet,
    deleteSnippet,
  }
}
