/**
 * BoardColumn — wraps a Kanban column header, card list, empty state, and
 * "add card" button.  Extracted from BoardView (S15 T4).
 * All mutation emits are tested via trigger; drag events check emit names.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BoardColumn from '@/modules/kanban/components/BoardColumn.vue'
import type { BoardCard, BoardColumn as Col } from '@/modules/kanban/types'

const BACKLOG_COL: Col = { id: 'backlog', color: '#6b7280' }

function makeCard(id: string, over: Partial<BoardCard> = {}): BoardCard {
  return {
    id,
    title: `Card ${id}`,
    description: '',
    priority: 'none',
    columnId: 'backlog',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...over,
  }
}

function mountCol(
  cards: BoardCard[] = [],
  extra: Partial<InstanceType<typeof BoardColumn>['$props']> = {},
) {
  return mount(BoardColumn, {
    props: {
      col: BACKLOG_COL,
      cards,
      isDragOver: false,
      isMobileHidden: false,
      expandedCardId: null,
      activeColMobile: 'backlog',
      ...extra,
    },
  })
}

beforeEach(() => setActivePinia(createPinia()))

describe('BoardColumn — header', () => {
  it('renders the color dot', () => {
    expect(mountCol().find('.board-col__dot').exists()).toBe(true)
  })

  it('shows the card count', () => {
    const wrapper = mountCol([makeCard('a'), makeCard('b')])
    expect(wrapper.find('.board-col__count').text()).toBe('2')
  })

  it('shows count 0 when no cards', () => {
    expect(mountCol().find('.board-col__count').text()).toBe('0')
  })
})

describe('BoardColumn — card list', () => {
  it('renders an empty-column placeholder when cards list is empty', () => {
    expect(mountCol().find('.board-col__empty').exists()).toBe(true)
  })

  it('does not show empty state when cards are present', () => {
    expect(mountCol([makeCard('x')]).find('.board-col__empty').exists()).toBe(false)
  })

  it('renders one BoardCard component per card', () => {
    const wrapper = mountCol([makeCard('c1'), makeCard('c2'), makeCard('c3')])
    // Each card renders with its title
    expect(wrapper.text()).toContain('Card c1')
    expect(wrapper.text()).toContain('Card c2')
    expect(wrapper.text()).toContain('Card c3')
  })
})

describe('BoardColumn — emits', () => {
  it('emits "add-card" with the column id when the add button is clicked', async () => {
    const wrapper = mountCol()
    await wrapper.find('.board-col__add-btn').trigger('click')
    expect(wrapper.emitted('add-card')).toEqual([['backlog']])
  })

  it('emits "drag-enter" with colId on dragenter', async () => {
    const wrapper = mountCol()
    await wrapper.find('.board-col').trigger('dragenter')
    expect(wrapper.emitted('drag-enter')).toEqual([['backlog']])
  })

  it('emits "drop" with colId on drop', async () => {
    const wrapper = mountCol()
    await wrapper.find('.board-col').trigger('drop')
    expect(wrapper.emitted('drop')).toEqual([['backlog']])
  })
})

describe('BoardColumn — drag-over styling', () => {
  it('adds drag-over class when isDragOver=true', () => {
    const wrapper = mountCol([], { isDragOver: true })
    expect(wrapper.find('.board-col--dragover').exists()).toBe(true)
  })

  it('no drag-over class when isDragOver=false', () => {
    expect(mountCol().find('.board-col--dragover').exists()).toBe(false)
  })
})
