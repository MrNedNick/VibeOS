import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNotesStore } from '@/modules/notes/stores/notes.store'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('useNotesStore — CRUD', () => {
  it('starts with no notes', () => {
    expect(useNotesStore().notes).toHaveLength(0)
  })

  it('createNote adds an empty note and returns its id', () => {
    const store = useNotesStore()
    const id = store.createNote()
    expect(id).toBeTruthy()
    expect(store.notes).toHaveLength(1)
    expect(store.notes[0].content).toBe('')
  })

  it('updateContent changes note content', () => {
    const store = useNotesStore()
    const id = store.createNote()
    store.updateContent(id, '# Hello world')
    expect(store.notes[0].content).toBe('# Hello world')
  })

  it('deleteNote removes the note from visible list', () => {
    const store = useNotesStore()
    const id = store.createNote()
    store.deleteNote(id)
    expect(store.notes).toHaveLength(0)
  })

  it('deleteNote only removes the specified note', () => {
    const store = useNotesStore()
    store.createNote()
    const id2 = store.createNote()
    store.createNote()
    store.deleteNote(id2)
    expect(store.notes).toHaveLength(2)
  })

  it('deleteNote is idempotent — second call is a no-op', () => {
    const store = useNotesStore()
    const id = store.createNote()
    store.deleteNote(id)
    expect(() => store.deleteNote(id)).not.toThrow()
    expect(store.notes).toHaveLength(0)
  })
})

describe('useNotesStore — pin', () => {
  it('togglePin pins an unpinned note', () => {
    const store = useNotesStore()
    const id = store.createNote()
    store.togglePin(id)
    expect(store.notes[0].pinned).toBe(true)
  })

  it('togglePin unpins a pinned note', () => {
    const store = useNotesStore()
    const id = store.createNote()
    store.togglePin(id)
    store.togglePin(id)
    expect(store.notes[0].pinned).toBe(false)
  })
})

describe('useNotesStore — sortedNotes', () => {
  it('pinned notes sort before unpinned', () => {
    const store = useNotesStore()
    const idA = store.createNote()
    const idB = store.createNote()
    store.togglePin(idA)
    const sorted = store.sortedNotes
    expect(sorted[0].id).toBe(idA)
    expect(sorted[1].id).toBe(idB)
  })
})

describe('useNotesStore — openOrCreateToday', () => {
  it('creates a daily journal note if none exists', () => {
    const store = useNotesStore()
    const id = store.openOrCreateToday()
    expect(id).toBeTruthy()
    expect(store.notes).toHaveLength(1)
    const today = new Date().toISOString().slice(0, 10)
    expect(store.notes[0].content).toContain(today)
  })

  it('returns the same note id on second call (does not duplicate)', () => {
    const store = useNotesStore()
    const id1 = store.openOrCreateToday()
    const id2 = store.openOrCreateToday()
    expect(id1).toBe(id2)
    expect(store.notes).toHaveLength(1)
  })
})

describe('useNotesStore — goal link', () => {
  it('setNoteGoal links a note to a goal', () => {
    const store = useNotesStore()
    const id = store.createNote()
    store.setNoteGoal(id, 'goal-123')
    expect(store.notes[0].linkedGoalId).toBe('goal-123')
  })

  it('getNotesForGoal returns only notes linked to that goal', () => {
    const store = useNotesStore()
    const id1 = store.createNote()
    store.createNote() // unlinked
    store.setNoteGoal(id1, 'goal-abc')
    expect(store.getNotesForGoal('goal-abc')).toHaveLength(1)
    expect(store.getNotesForGoal('other')).toHaveLength(0)
  })
})
