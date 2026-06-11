/**
 * StudioHistorySidebar — conversation history list, clear-all with confirm dialog.
 * Mocks useStudioStore (localStorage-backed) and useConfirm (module-level singleton).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StudioHistorySidebar from '@/modules/ai-playground/components/StudioHistorySidebar.vue'
import type { SavedConversation } from '@/modules/ai-playground/stores/studio.store'

const mockStore = {
  savedConversations: [] as SavedConversation[],
  loadConversation:   vi.fn(),
  deleteConversation: vi.fn(),
  clearHistory:       vi.fn(),
}

vi.mock('@/modules/ai-playground/stores/studio.store', () => ({
  useStudioStore: () => mockStore,
}))

const mockConfirm = vi.fn()
vi.mock('@/core/composables/useConfirm', () => ({
  useConfirm: () => ({ confirm: mockConfirm }),
}))

let _id = 0
function makeConv(overrides: Partial<SavedConversation> = {}): SavedConversation {
  return {
    id:        `conv-${++_id}`,
    title:     'Test conversation',
    messages:  [],
    provider:  'free',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  mockStore.savedConversations = []
  mockStore.loadConversation.mockClear()
  mockStore.deleteConversation.mockClear()
  mockStore.clearHistory.mockClear()
  mockConfirm.mockReset()
})

describe('StudioHistorySidebar — header', () => {
  it('renders the "History" title', () => {
    const wrapper = mount(StudioHistorySidebar)
    expect(wrapper.find('.sidebar__title').text()).toBe('History')
  })

  it('Clear button is disabled when there are no conversations', () => {
    const wrapper = mount(StudioHistorySidebar)
    expect(wrapper.find('.sidebar__header button').attributes('disabled')).toBeDefined()
  })

  it('Clear button is enabled when conversations exist', () => {
    mockStore.savedConversations = [makeConv()]
    const wrapper = mount(StudioHistorySidebar)
    expect(wrapper.find('.sidebar__header button').attributes('disabled')).toBeUndefined()
  })
})

describe('StudioHistorySidebar — list', () => {
  it('shows empty state when there are no conversations', () => {
    const wrapper = mount(StudioHistorySidebar)
    expect(wrapper.find('.sidebar__empty').exists()).toBe(true)
  })

  it('hides empty state when conversations are present', () => {
    mockStore.savedConversations = [makeConv()]
    expect(mount(StudioHistorySidebar).find('.sidebar__empty').exists()).toBe(false)
  })

  it('renders one sidebar__item per conversation', () => {
    mockStore.savedConversations = [makeConv(), makeConv()]
    const wrapper = mount(StudioHistorySidebar)
    expect(wrapper.findAll('.sidebar__item')).toHaveLength(2)
  })

  it('shows the conversation title in each item', () => {
    mockStore.savedConversations = [makeConv({ title: 'My first chat' })]
    const wrapper = mount(StudioHistorySidebar)
    expect(wrapper.find('.sidebar__item-title').text()).toBe('My first chat')
  })

  it('shows "Today" for a conversation updated today', () => {
    mockStore.savedConversations = [makeConv({ updatedAt: new Date().toISOString() })]
    const wrapper = mount(StudioHistorySidebar)
    expect(wrapper.find('.sidebar__item-date').text()).toBe('Today')
  })
})

describe('StudioHistorySidebar — interactions', () => {
  it('clicking an item calls loadConversation with its id', async () => {
    const conv = makeConv({ id: 'load-me' })
    mockStore.savedConversations = [conv]
    const wrapper = mount(StudioHistorySidebar)
    await wrapper.find('.sidebar__item').trigger('click')
    expect(mockStore.loadConversation).toHaveBeenCalledWith('load-me')
  })

  it('delete icon button calls deleteConversation without affecting loadConversation', async () => {
    const conv = makeConv({ id: 'del-me' })
    mockStore.savedConversations = [conv]
    const wrapper = mount(StudioHistorySidebar)
    await wrapper.find('[aria-label="Delete conversation"]').trigger('click')
    expect(mockStore.deleteConversation).toHaveBeenCalledWith('del-me')
    expect(mockStore.loadConversation).not.toHaveBeenCalled()
  })

  it('Clear → confirm accepted → calls clearHistory', async () => {
    mockStore.savedConversations = [makeConv()]
    mockConfirm.mockResolvedValue(true)
    const wrapper = mount(StudioHistorySidebar)
    await wrapper.find('.sidebar__header button').trigger('click')
    await flushPromises()
    expect(mockStore.clearHistory).toHaveBeenCalled()
  })

  it('Clear → confirm cancelled → does NOT call clearHistory', async () => {
    mockStore.savedConversations = [makeConv()]
    mockConfirm.mockResolvedValue(false)
    const wrapper = mount(StudioHistorySidebar)
    await wrapper.find('.sidebar__header button').trigger('click')
    await flushPromises()
    expect(mockStore.clearHistory).not.toHaveBeenCalled()
  })
})
