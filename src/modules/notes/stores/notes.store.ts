import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useSoftDeletable } from '@/core/composables/useSoftDeletable'
import { storageKey, storagGet } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import { useBackendSync } from '@/core/composables/useBackendSync'
import { useSyncBus } from '@/core/composables/useSyncBus'
import { isSupabaseConfigured } from '@/core/services/supabase'
import { deriveTitle } from '../types'
import type { Note, NoteType } from '../types'

const NOTES_KEY = storageKey('notes', 'notes')

export const useNotesStore = defineStore('notes:notes', () => {
  const { all: allNotes, items: notes, softDelete } = useSoftDeletable<Note>(NOTES_KEY)
  const events = useEventBus()

  const initialized = ref(!isSupabaseConfigured || allNotes.value.length > 0)
  const syncBus = useSyncBus()
  watch(syncBus.pullSeq, () => {
    allNotes.value = storagGet<Note[]>(NOTES_KEY, [])
    initialized.value = true
  })
  const backendSync = useBackendSync(NOTES_KEY)
  watch(allNotes, v => backendSync.push(v), { deep: true })

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
    allNotes.value.unshift(note)
    events.emit({ type: 'note:created', noteId: note.id, title: 'Untitled', timestamp: note.createdAt })
    return note.id
  }

  /**
   * Open today's daily journal note, creating it if it doesn't exist.
   * The note starts with "# YYYY-MM-DD" so it appears as the date in the list.
   * Returns the note id.
   */
  function openOrCreateToday(): string {
    const todayDate = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
    const todayHeading = `# ${todayDate}`
    const existing = notes.value.find(n => n.content.trimStart().startsWith(todayHeading))
    if (existing) return existing.id
    const note: Note = {
      id: crypto.randomUUID(),
      content: `${todayHeading}\n\n`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    allNotes.value.unshift(note)
    events.emit({ type: 'note:created', noteId: note.id, title: todayDate, timestamp: note.createdAt })
    return note.id
  }

  function updateContent(id: string, content: string): void {
    const note = allNotes.value.find(n => n.id === id)
    if (note) {
      note.content = content
      note.updatedAt = new Date().toISOString()
    }
  }

  function deleteNote(id: string): void {
    const note = allNotes.value.find(n => n.id === id)
    if (note && !note.deletedAt) {
      const title = deriveTitle(note.content)
      softDelete(id)
      events.emit({ type: 'note:deleted', noteId: id, title, timestamp: new Date().toISOString() })
    }
  }

  function togglePin(id: string): void {
    const note = allNotes.value.find(n => n.id === id)
    if (note) note.pinned = !note.pinned
  }

  function setNoteType(id: string, type: NoteType): void {
    const note = allNotes.value.find(n => n.id === id)
    if (note) {
      note.type = type
      note.updatedAt = new Date().toISOString()
    }
  }

  function setNoteGoal(id: string, goalId: string | undefined): void {
    const note = allNotes.value.find(n => n.id === id)
    if (note) {
      note.linkedGoalId = goalId || undefined
      note.updatedAt = new Date().toISOString()
    }
  }

  function getNotesForGoal(goalId: string): Note[] {
    return notes.value.filter(n => n.linkedGoalId === goalId)
  }

  return { notes, initialized, sortedNotes, createNote, openOrCreateToday, updateContent, deleteNote, togglePin, setNoteType, setNoteGoal, getNotesForGoal }
})
