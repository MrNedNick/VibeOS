import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import type { Snippet } from '../types'

export const useSnippetsStore = defineStore('snippets:snippets', () => {
  const snippets = useStorage<Snippet[]>(storageKey('snippets', 'snippets'), [])
  const events   = useEventBus()

  const sortedSnippets = computed(() =>
    [...snippets.value].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  )

  const usedLanguages = computed(() => {
    const langs = new Set(snippets.value.map(s => s.language))
    return Array.from(langs).sort()
  })

  function createSnippet(): string {
    const snippet: Snippet = {
      id: crypto.randomUUID(),
      title: 'Untitled snippet',
      code: '',
      language: 'javascript',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    snippets.value.unshift(snippet)
    events.emit({ type: 'snippet:created', snippetId: snippet.id, title: snippet.title, language: snippet.language, timestamp: snippet.createdAt })
    return snippet.id
  }

  function updateSnippet(id: string, patch: Partial<Omit<Snippet, 'id' | 'createdAt'>>): void {
    const s = snippets.value.find(s => s.id === id)
    if (s) Object.assign(s, patch, { updatedAt: new Date().toISOString() })
  }

  function deleteSnippet(id: string): void {
    const idx = snippets.value.findIndex(s => s.id === id)
    if (idx !== -1) snippets.value.splice(idx, 1)
  }

  return { snippets, sortedSnippets, usedLanguages, createSnippet, updateSnippet, deleteSnippet }
})
