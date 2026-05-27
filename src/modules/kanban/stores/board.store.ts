import { defineStore } from 'pinia'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import type { BoardCard, BoardColumnId, CardPriority } from '../types'

export const useBoardStore = defineStore('kanban:board', () => {
  const cards = useStorage<BoardCard[]>(storageKey('kanban', 'cards'), [])
  const events = useEventBus()

  function cardsForColumn(colId: BoardColumnId): BoardCard[] {
    return cards.value.filter(c => c.columnId === colId)
  }

  function addCard(columnId: BoardColumnId, title: string): string {
    const card: BoardCard = {
      id:          crypto.randomUUID(),
      title:       title.trim(),
      description: '',
      priority:    'none',
      columnId,
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }
    cards.value.push(card)
    events.emit({ type: 'snippet:created', snippetId: card.id, title: card.title, language: 'card', timestamp: card.createdAt })
    return card.id
  }

  function moveCard(id: string, toColumnId: BoardColumnId): void {
    const card = cards.value.find(c => c.id === id)
    if (!card || card.columnId === toColumnId) return
    card.columnId  = toColumnId
    card.updatedAt = new Date().toISOString()
    if (toColumnId === 'done') {
      events.emit({ type: 'task:completed', taskId: card.id, label: card.title, timestamp: card.updatedAt })
    }
  }

  function updateCard(id: string, patch: Partial<Pick<BoardCard, 'title' | 'description' | 'priority'>>): void {
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
    const next = order[(order.indexOf(card.priority) + 1) % order.length]
    card.priority  = next
    card.updatedAt = new Date().toISOString()
  }

  return { cards, cardsForColumn, addCard, moveCard, updateCard, deleteCard, cyclePriority }
})
