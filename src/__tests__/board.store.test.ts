/**
 * board.store — Kanban cards (irreplaceable user data, S16 T2) + the
 * card→task cross-store cascade (moving an imported card to Done completes
 * its source task).
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useBoardStore } from '@/modules/kanban/stores/board.store'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'

const flush = () => new Promise(r => setTimeout(r, 0))

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('board.store — CRUD', () => {
  it('starts with no cards', () => {
    expect(useBoardStore().cards).toHaveLength(0)
  })

  it('addCard trims the title and returns the new id', () => {
    const store = useBoardStore()
    const id = store.addCard('backlog', '  Write docs  ')
    expect(store.cards).toHaveLength(1)
    expect(store.cards[0].id).toBe(id)
    expect(store.cards[0].title).toBe('Write docs')
    expect(store.cards[0].columnId).toBe('backlog')
    expect(store.cards[0].priority).toBe('none')
  })

  it('cardsForColumn filters by column', () => {
    const store = useBoardStore()
    store.addCard('backlog', 'A')
    store.addCard('in-progress', 'B')
    store.addCard('backlog', 'C')
    expect(store.cardsForColumn('backlog')).toHaveLength(2)
    expect(store.cardsForColumn('in-progress')).toHaveLength(1)
    expect(store.cardsForColumn('done')).toHaveLength(0)
  })

  it('updateCard patches fields', () => {
    const store = useBoardStore()
    const id = store.addCard('backlog', 'A')
    store.updateCard(id, { title: 'Renamed', priority: 'high', description: 'd' })
    const card = store.cards[0]
    expect(card.title).toBe('Renamed')
    expect(card.priority).toBe('high')
    expect(card.description).toBe('d')
  })

  it('deleteCard removes only the target card', () => {
    const store = useBoardStore()
    const a = store.addCard('backlog', 'A')
    store.addCard('backlog', 'B')
    store.deleteCard(a)
    expect(store.cards).toHaveLength(1)
    expect(store.cards[0].title).toBe('B')
  })

  it('cyclePriority rotates none → low → … → urgent → none', () => {
    const store = useBoardStore()
    const id = store.addCard('backlog', 'A')
    const seq = ['low', 'medium', 'high', 'urgent', 'none']
    for (const expected of seq) {
      store.cyclePriority(id)
      expect(store.cards[0].priority).toBe(expected)
    }
  })

  it('setDueDate sets and clears the date', () => {
    const store = useBoardStore()
    const id = store.addCard('backlog', 'A')
    store.setDueDate(id, '2026-07-01')
    expect(store.cards[0].dueDate).toBe('2026-07-01')
    store.setDueDate(id, undefined)
    expect(store.cards[0].dueDate).toBeUndefined()
  })
})

describe('board.store — moveCard', () => {
  it('changes the column', () => {
    const store = useBoardStore()
    const id = store.addCard('backlog', 'A')
    store.moveCard(id, 'in-progress')
    expect(store.cards[0].columnId).toBe('in-progress')
  })

  it('is a no-op for an unknown id', () => {
    const store = useBoardStore()
    store.addCard('backlog', 'A')
    store.moveCard('nope', 'done')
    expect(store.cards[0].columnId).toBe('backlog')
  })

  it('updates the due date when dropped on a dated row', () => {
    const store = useBoardStore()
    const id = store.addCard('backlog', 'A')
    store.moveCard(id, 'backlog', '2026-08-01')
    expect(store.cards[0].dueDate).toBe('2026-08-01')
  })
})

describe('board.store — task import + cascade', () => {
  it('importFromTask adds a backlog card linked to the task, once', () => {
    const store = useBoardStore()
    store.importFromTask('task-1', 'Imported')
    expect(store.cards).toHaveLength(1)
    expect(store.cards[0].columnId).toBe('backlog')
    expect(store.cards[0].sourceTaskId).toBe('task-1')
    expect(store.isTaskOnBoard('task-1')).toBe(true)

    store.importFromTask('task-1', 'Imported again')
    expect(store.cards).toHaveLength(1) // no duplicate
  })

  it('moving an imported card to Done completes its source task', async () => {
    const tasks = useTasksStore()
    tasks.addTask('Ship it')
    const taskId = tasks.tasks[0].id
    expect(tasks.tasks[0].done).toBe(false)

    const board = useBoardStore()
    board.importFromTask(taskId, 'Ship it')
    const cardId = board.cards[0].id

    board.moveCard(cardId, 'done')
    await flush()

    expect(tasks.tasks.find(t => t.id === taskId)?.done).toBe(true)
  })
})
