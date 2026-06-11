/**
 * StudioConversation — messages panel, empty state, send button, quick prompts.
 * Mocks useStudioStore (complex API calls) + all secondary data stores that
 * are only used inside buildProjectContext() (not needed for rendering tests).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StudioConversation from '@/modules/ai-playground/components/StudioConversation.vue'
import type { ConvMessage } from '@/modules/ai-playground/stores/studio.store'
import type { StudioProvider } from '@/modules/ai-playground/types'

// ── Store mock ────────────────────────────────────────────────────────────────
const mockStore = {
  provider:          'free' as StudioProvider,
  loading:           false,
  messages:          [] as ConvMessage[],
  includeContext:    false,
  apiKey:            '',
  groqApiKey:        '',
  geminiApiKey:      '',
  openrouterApiKey:  '',
  freeModel:         'openai-fast',
  sendMessage:       vi.fn(),
  newConversation:   vi.fn(),
}

vi.mock('@/modules/ai-playground/stores/studio.store', () => ({
  useStudioStore: () => mockStore,
}))

// Secondary stores only used in buildProjectContext() — stub minimally
vi.mock('@/modules/goals/stores/goals.store', () => ({
  useGoalsStore: () => ({ activeGoals: [], getProgress: () => 0 }),
}))
vi.mock('@/modules/task-manager/stores/tasks.store', () => ({
  useTasksStore: () => ({ tasks: [], activeCount: 0 }),
}))
vi.mock('@/modules/habits/stores/habits.store', () => ({
  useHabitsStore: () => ({ habits: [] }),
}))
vi.mock('@/modules/learning/stores/learning.store', () => ({
  useLearningStore: () => ({ activePlans: [], isLoggedToday: () => false }),
}))
vi.mock('@/modules/training/stores/training.store', () => ({
  useTrainingStore: () => ({ activePlans: [], isLoggedToday: () => false }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────
let _msgId = 0
function makeMsg(overrides: Partial<ConvMessage> = {}): ConvMessage {
  return {
    id:        `msg-${++_msgId}`,
    role:      'user',
    content:   'Hello',
    timestamp: new Date().toISOString(),
    ...overrides,
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  mockStore.provider    = 'free'
  mockStore.loading     = false
  mockStore.messages    = []
  mockStore.apiKey      = ''
  mockStore.groqApiKey  = ''
  mockStore.geminiApiKey = ''
  mockStore.openrouterApiKey = ''
  mockStore.sendMessage.mockClear()
})

// ── Empty state ───────────────────────────────────────────────────────────────
describe('StudioConversation — empty state', () => {
  it('shows the "Free AI" title when provider is "free"', () => {
    const wrapper = mount(StudioConversation)
    expect(wrapper.find('.sc-empty-title').text()).toContain('Free AI')
  })

  it('shows the "Claude API" title when provider is "anthropic"', () => {
    mockStore.provider = 'anthropic'
    const wrapper = mount(StudioConversation)
    expect(wrapper.find('.sc-empty-title').text()).toBe('Claude API')
  })

  it('shows quick-prompt buttons for free provider (no key required)', () => {
    const wrapper = mount(StudioConversation)
    const prompts = wrapper.findAll('.sc-quick-btn')
    expect(prompts.length).toBeGreaterThan(0)
  })

  it('shows the no-key warning when provider needs a key and no key is set', () => {
    mockStore.provider = 'anthropic'
    // apiKey is already '' from beforeEach
    const wrapper = mount(StudioConversation)
    expect(wrapper.find('.sc-no-key').exists()).toBe(true)
  })

  it('hides the no-key warning when the required key is set', () => {
    mockStore.provider = 'anthropic'
    mockStore.apiKey   = 'sk-ant-test'
    const wrapper = mount(StudioConversation)
    expect(wrapper.find('.sc-no-key').exists()).toBe(false)
  })
})

// ── Message list ──────────────────────────────────────────────────────────────
describe('StudioConversation — message rendering', () => {
  it('hides the empty state when messages are present', () => {
    mockStore.messages = [makeMsg()]
    const wrapper = mount(StudioConversation)
    expect(wrapper.find('.sc-empty').exists()).toBe(false)
  })

  it('renders a user message with sc-msg--user class', () => {
    mockStore.messages = [makeMsg({ role: 'user', content: 'Hi there!' })]
    const wrapper = mount(StudioConversation)
    const msg = wrapper.find('.sc-msg--user')
    expect(msg.exists()).toBe(true)
    expect(msg.text()).toContain('Hi there!')
  })

  it('renders an assistant message with sc-msg--assistant class', () => {
    mockStore.messages = [makeMsg({ role: 'assistant', content: 'Hello back!' })]
    const wrapper = mount(StudioConversation)
    expect(wrapper.find('.sc-msg--assistant').exists()).toBe(true)
  })

  it('renders an error message with sc-msg--error class', () => {
    mockStore.messages = [makeMsg({ role: 'assistant', content: 'no_key', error: true })]
    const wrapper = mount(StudioConversation)
    expect(wrapper.find('.sc-msg--error').exists()).toBe(true)
  })

  it('shows the typing indicator while loading', () => {
    mockStore.messages = [makeMsg()]
    mockStore.loading  = true
    const wrapper = mount(StudioConversation)
    expect(wrapper.find('.sc-typing').exists()).toBe(true)
  })
})

// ── Input / send button ───────────────────────────────────────────────────────
describe('StudioConversation — input bar', () => {
  it('renders the textarea input', () => {
    expect(mount(StudioConversation).find('.sc-input').exists()).toBe(true)
  })

  it('send button starts disabled when input is empty', () => {
    const wrapper = mount(StudioConversation)
    expect(wrapper.find('.sc-send-btn').attributes('disabled')).toBeDefined()
  })

  it('send button becomes active (not disabled) when text is typed', async () => {
    const wrapper = mount(StudioConversation)
    await wrapper.find('.sc-input').setValue('Hello')
    // canSend = true for free provider with text
    expect(wrapper.find('.sc-send-btn--ready').exists()).toBe(true)
  })
})
