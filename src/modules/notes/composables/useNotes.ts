import { ref, computed } from 'vue'
import { useNotesStore } from '../stores/notes.store'
import { deriveTitle } from '../types'

type EditorMode = 'edit' | 'preview'

let debounceTimer: ReturnType<typeof setTimeout> | null = null

export function useNotes() {
  const store = useNotesStore()

  const selectedId = ref<string | null>(null)
  const mode = ref<EditorMode>('edit')
  const searchQuery = ref('')

  const filteredNotes = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return store.sortedNotes
    return store.sortedNotes.filter(n =>
      n.content.toLowerCase().includes(q) ||
      deriveTitle(n.content).toLowerCase().includes(q)
    )
  })

  const selectedNote = computed(() =>
    selectedId.value ? store.notes.find(n => n.id === selectedId.value) ?? null : null
  )

  function selectNote(id: string): void {
    selectedId.value = id
  }

  function newNote(): void {
    const id = store.createNote()
    selectedId.value = id
    mode.value = 'edit'
  }

  /** Open (or create) today's daily journal note. */
  function todayNote(): void {
    const id = store.openOrCreateToday()
    selectedId.value = id
    mode.value = 'edit'
  }

  function debouncedSave(id: string, content: string): void {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => store.updateContent(id, content), 300)
  }

  function deleteNote(id: string): void {
    store.deleteNote(id)
    if (selectedId.value === id) {
      const remaining = filteredNotes.value.filter(n => n.id !== id)
      selectedId.value = remaining[0]?.id ?? null
    }
  }

  return {
    selectedId,
    mode,
    searchQuery,
    filteredNotes,
    selectedNote,
    selectNote,
    newNote,
    todayNote,
    debouncedSave,
    deleteNote,
  }
}
