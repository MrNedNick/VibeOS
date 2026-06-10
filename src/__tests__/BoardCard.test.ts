/**
 * BoardCard — the draggable Kanban card extracted from BoardView (S15 T4).
 * Props-driven render + emit contract (toggle-expand / delete / drag), with
 * priority/due/source meta and store-backed mutations (cyclePriority, move).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BoardCard from '@/modules/kanban/components/BoardCard.vue'
import { useBoardStore } from '@/modules/kanban/stores/board.store'
import type { BoardCard as Card } from '@/modules/kanban/types'

function makeCard(over: Partial<Card> = {}): Card {
  return {
    id: 'c1',
    title: 'Buy milk',
    description: '',
    priority: 'high',
    columnId: 'backlog',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...over,
  }
}

beforeEach(() => setActivePinia(createPinia()))

const mountCard = (card = makeCard(), extra: Record<string, unknown> = {}) =>
  mount(BoardCard, {
    props: {
      card,
      colId: 'backlog',
      isExpanded: false,
      isDragging: false,
      activeColMobile: 'backlog',
      ...extra,
    },
  })

describe('BoardCard — collapsed render', () => {
  it('renders the card title', () => {
    expect(mountCard().find('.board-card__title').text()).toBe('Buy milk')
  })

  it('shows a priority dot when priority is not "none"', () => {
    expect(mountCard().find('.board-card__pri-dot').exists()).toBe(true)
  })

  it('hides the priority dot when priority is "none"', () => {
    const wrapper = mountCard(makeCard({ priority: 'none' }))
    expect(wrapper.find('.board-card__pri-dot').exists()).toBe(false)
  })

  it('shows a due-date pill with a classification class when dueDate set', () => {
    const wrapper = mountCard(makeCard({ dueDate: '2099-12-31' }))
    const due = wrapper.find('.board-card__due')
    expect(due.exists()).toBe(true)
    expect(due.classes().some((c) => c.startsWith('board-card__due--'))).toBe(true)
  })

  it('shows the source dot only when imported from a task', () => {
    expect(mountCard().find('.board-card__source-dot').exists()).toBe(false)
    expect(mountCard(makeCard({ sourceTaskId: 't9' })).find('.board-card__source-dot').exists()).toBe(true)
  })

  it('does not render the expanded section when collapsed', () => {
    expect(mountCard().find('.board-card__move-row').exists()).toBe(false)
  })
})

describe('BoardCard — emits', () => {
  it('expand button emits toggle-expand with the card id', async () => {
    const wrapper = mountCard()
    await wrapper.find('.board-card__expand').trigger('click')
    expect(wrapper.emitted('toggle-expand')![0]).toEqual(['c1'])
  })

  it('delete button emits delete with the card id', async () => {
    const wrapper = mountCard()
    await wrapper.find('.board-card__del').trigger('click')
    expect(wrapper.emitted('delete')![0]).toEqual(['c1'])
  })

  it('dragstart emits drag-start with the event and card id', async () => {
    const wrapper = mountCard()
    await wrapper.trigger('dragstart')
    expect(wrapper.emitted('drag-start')).toBeTruthy()
    expect(wrapper.emitted('drag-start')![0][1]).toBe('c1')
  })

  it('dragend emits drag-end', async () => {
    const wrapper = mountCard()
    await wrapper.trigger('dragend')
    expect(wrapper.emitted('drag-end')).toBeTruthy()
  })
})

describe('BoardCard — store mutations', () => {
  it('clicking the priority strip cycles priority via the store', async () => {
    const store = useBoardStore()
    const spy = vi.spyOn(store, 'cyclePriority').mockImplementation(() => {})
    const wrapper = mountCard()
    await wrapper.find('.board-card__priority-strip').trigger('click')
    expect(spy).toHaveBeenCalledWith('c1')
  })

  it('expanded card exposes move-to-column buttons that call store.moveCard', async () => {
    const store = useBoardStore()
    const spy = vi.spyOn(store, 'moveCard').mockImplementation(() => {})
    const wrapper = mountCard(makeCard(), { isExpanded: true })
    expect(wrapper.find('.board-card__move-row').exists()).toBe(true)
    await wrapper.findAll('.board-card__move-btn')[0].trigger('click')
    expect(spy).toHaveBeenCalledWith('c1', expect.any(String))
  })
})
