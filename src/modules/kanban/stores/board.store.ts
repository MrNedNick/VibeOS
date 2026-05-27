import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import { classifyDueDate } from '../types'
import type { BoardCard, BoardColumnId, CardPriority, SwimlaneRowId } from '../types'

export const useBoardStore = defineStore('kanban:board', () => {
  const cards    = useStorage<BoardCard[]>(storageKey('kanban', 'cards'), [])
  const viewMode = useStorage<'kanban' | 'timeline'>('platform:kanban:viewMode', 'kanban')
  const events   = useEventBus()

  // ── Queries ─────────────────────────────────────────────────────

  function cardsForColumn(colId: BoardColumnId): BoardCard[] {
    return cards.value.filter(c => c.columnId === colId)
  }

  function cardsForCell(rowId: SwimlaneRowId, colId: BoardColumnId): BoardCard[] {
    return cards.value.filter(c =>
      c.columnId === colId && classifyDueDate(c.dueDate) === rowId
    )
  }

  const taskIdsOnBoard = computed(() =>
    new Set(cards.value.filter(c => c.sourceTaskId).map(c => c.sourceTaskId!))
  )

  function isTaskOnBoard(taskId: string): boolean {
    return taskIdsOnBoard.value.has(taskId)
  }

  // ── Mutations ────────────────────────────────────────────────────

  function addCard(columnId: BoardColumnId, title: string, dueDate?: string): string {
    const card: BoardCard = {
      id:          crypto.randomUUID(),
      title:       title.trim(),
      description: '',
      priority:    'none',
      columnId,
      dueDate,
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }
    cards.value.push(card)
    events.emit({ type: 'snippet:created', snippetId: card.id, title: card.title, language: 'card', timestamp: card.createdAt })
    return card.id
  }

  function moveCard(id: string, toColumnId: BoardColumnId, toDueDate?: string | null): void {
    const card = cards.value.find(c => c.id === id)
    if (!card) return
    const colChanged  = card.columnId !== toColumnId
    const dateChanged = toDueDate !== undefined && toDueDate !== null
    if (!colChanged && !dateChanged) return

    if (colChanged)  card.columnId = toColumnId
    if (toDueDate !== undefined) card.dueDate = toDueDate ?? undefined
    card.updatedAt = new Date().toISOString()

    if (toColumnId === 'done' && colChanged) {
      events.emit({ type: 'task:completed', taskId: card.id, label: card.title, timestamp: card.updatedAt })

      // Sync source task if this card was imported from Tasks
      if (card.sourceTaskId) {
        // Lazy import to avoid circular reference issues
        import('@/modules/task-manager/stores/tasks.store').then(({ useTasksStore }) => {
          const tasksStore = useTasksStore()
          const task = tasksStore.tasks.find(t => t.id === card.sourceTaskId)
          if (task && !task.done) tasksStore.toggleTask(task.id)
        })
      }
    }
  }

  function setDueDate(id: string, date: string | undefined): void {
    const card = cards.value.find(c => c.id === id)
    if (!card) return
    card.dueDate   = date
    card.updatedAt = new Date().toISOString()
  }

  function updateCard(id: string, patch: Partial<Pick<BoardCard, 'title' | 'description' | 'priority' | 'dueDate'>>): void {
    const card = cards.value.find(c => c.id === id)
    if (!card) return
    Object.assign(card, patch)
    card.updatedAt = new Date().toISOString()
  }

  function deleteCard(id: string): void {
    const idx = cards.value.findIndex(c => c.id === id)
    if (idx > -1) cards.value.splice(idx, 1)
  }

  function cyclePriority(id: string): void {
    const order: CardPriority[] = ['none', 'low', 'medium', 'high', 'urgent']
    const card = cards.value.find(c => c.id === id)
    if (!card) return
    card.priority  = order[(order.indexOf(card.priority) + 1) % order.length]
    card.updatedAt = new Date().toISOString()
  }

  /** Import a Task as a board card in Backlog. No-op if already imported. */
  function importFromTask(taskId: string, title: string): void {
    if (isTaskOnBoard(taskId)) return
    const card: BoardCard = {
      id:           crypto.randomUUID(),
      title:        title.trim(),
      description:  '',
      priority:     'none',
      columnId:     'backlog',
      sourceTaskId: taskId,
      createdAt:    new Date().toISOString(),
      updatedAt:    new Date().toISOString(),
    }
    cards.value.push(card)
  }

  return {
    cards, viewMode,
    taskIdsOnBoard, isTaskOnBoard,
    cardsForColumn, cardsForCell,
    addCard, moveCard, setDueDate, updateCard, deleteCard, cyclePriority, importFromTask,
  }
})
