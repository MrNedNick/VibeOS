import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import type { Note } from '../types'

export const useNotesStore = defineStore('notes:notes', () => {
  const notes = useStorage<Note[]>(storageKey('notes', 'notes'), [])

  const sortedNotes = computed(() =>
    [...notes.value].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.updatedAt.localeCompare(a.updatedAt)
    })
  )

  function createNote(): string {
    const note: Note = {
      id: crypto.randomUUID(),
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    notes.value.unshift(note)
    return note.id
  }

  function updateContent(id: string, content: string): void {
    const note = notes.value.find(n => n.id === id)
    if (note) {
      note.content = content
      note.updatedAt = new Date().toISOString()
    }
  }

  function deleteNote(id: string): void {
    const idx = notes.value.findIndex(n => n.id === id)
    if (idx !== -1) notes.value.splice(idx, 1)
  }

  function togglePin(id: string): void {
    const note = notes.value.find(n => n.id === id)
    if (note) note.pinned = !note.pinned
  }

  return { notes, sortedNotes, createNote, updateContent, deleteNote, togglePin }
})
