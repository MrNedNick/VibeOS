/**
 * FinanceOverview — category breakdown, budget bars, AI spending analysis.
 * Mocks useFinanceStore (localStorage-heavy), useAiInsight (module singleton),
 * and useTrack. Uses real CATEGORY_META + formatAmount from finance types.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import FinanceOverview from '@/modules/finance/components/FinanceOverview.vue'
import type { ExpenseCategory } from '@/modules/finance/types'

// ── Finance store mock ────────────────────────────────────────────────────────
const mockStore = {
  viewCategories:       [] as ExpenseCategory[],
  viewSpentByCategory:  {} as Record<string, number>,
  viewTotal:            0,
  budgetMap:            {} as Record<string, number>,
  currency:             '€',
  isViewingCurrentMonth: true,
  monthLabel:           'June 2026',
  hasDayData:           false,
  daysInMonth:          [] as { day: string; total: number }[],
  maxDaySpend:          100,
  barPct:               vi.fn().mockReturnValue(50),
  barColorToken:        vi.fn().mockReturnValue('var(--color-success)'),
  openAddForm:          vi.fn(),
}

vi.mock('@/modules/finance/stores/finance.store', () => ({
  useFinanceStore: () => mockStore,
}))

// ── useAiInsight mock — reactive refs so v-if reacts ────────────────────────
const mockAiResult  = ref<string | null>(null)
const mockAiLoading = ref(false)
const mockRunAi     = vi.fn()
const mockDismissAi = vi.fn()

vi.mock('@/core/composables/useAiInsight', () => ({
  useAiInsight: () => ({
    result:  mockAiResult,
    loading: mockAiLoading,
    run:     mockRunAi,
    dismiss: mockDismissAi,
  }),
}))

vi.mock('@/core/composables/useTrack', () => ({
  useTrack: () => ({ track: vi.fn() }),
}))

// ── Fixture helpers ───────────────────────────────────────────────────────────
function withCategories(cats: ExpenseCategory[]): void {
  mockStore.viewCategories      = cats
  mockStore.viewSpentByCategory = Object.fromEntries(cats.map(c => [c, 20]))
  mockStore.viewTotal           = cats.length * 20
}

beforeEach(() => {
  setActivePinia(createPinia())
  mockStore.viewCategories       = []
  mockStore.viewSpentByCategory  = {}
  mockStore.viewTotal            = 0
  mockStore.budgetMap            = {}
  mockStore.isViewingCurrentMonth = true
  mockStore.monthLabel           = 'June 2026'
  mockStore.hasDayData           = false
  mockAiResult.value             = null
  mockAiLoading.value            = false
  mockStore.openAddForm.mockClear()
  mockRunAi.mockClear()
  mockDismissAi.mockClear()
})

// ── Empty state ───────────────────────────────────────────────────────────────
describe('FinanceOverview — empty state', () => {
  it('shows the empty state when viewCategories is empty', () => {
    const wrapper = mount(FinanceOverview)
    expect(wrapper.find('.fo-empty').exists()).toBe(true)
  })

  it('says "this month" when viewing the current month', () => {
    const wrapper = mount(FinanceOverview)
    expect(wrapper.find('.fo-empty').text()).toContain('this month')
  })

  it('says "in June 2026" when not viewing the current month', () => {
    mockStore.isViewingCurrentMonth = false
    const wrapper = mount(FinanceOverview)
    expect(wrapper.find('.fo-empty').text()).toContain('in June 2026')
  })

  it('shows the "Add your first expense" button in the current month', () => {
    const wrapper = mount(FinanceOverview)
    expect(wrapper.find('.fo-empty button').exists()).toBe(true)
  })

  it('hides the add-button when not viewing the current month', () => {
    mockStore.isViewingCurrentMonth = false
    const wrapper = mount(FinanceOverview)
    expect(wrapper.find('.fo-empty button').exists()).toBe(false)
  })

  it('clicking the add-button calls store.openAddForm', async () => {
    const wrapper = mount(FinanceOverview)
    await wrapper.find('.fo-empty button').trigger('click')
    expect(mockStore.openAddForm).toHaveBeenCalled()
  })
})

// ── Category list ─────────────────────────────────────────────────────────────
describe('FinanceOverview — category breakdown', () => {
  it('hides the empty state when categories are present', () => {
    withCategories(['food', 'transport'])
    expect(mount(FinanceOverview).find('.fo-empty').exists()).toBe(false)
  })

  it('renders one .fo-breakdown-seg per category', () => {
    withCategories(['food', 'transport', 'housing'])
    const wrapper = mount(FinanceOverview)
    expect(wrapper.findAll('.fo-breakdown-seg')).toHaveLength(3)
  })

  it('renders one .cat-row per category', () => {
    withCategories(['food', 'shopping'])
    const wrapper = mount(FinanceOverview)
    expect(wrapper.findAll('.cat-row')).toHaveLength(2)
  })

  it('shows a budget progress bar when budgetMap has an entry for the category', () => {
    withCategories(['food'])
    mockStore.budgetMap = { food: 100 }
    const wrapper = mount(FinanceOverview)
    expect(wrapper.find('.cat-row__progress').exists()).toBe(true)
  })

  it('omits the progress bar when no budget is set for the category', () => {
    withCategories(['food'])
    // budgetMap is empty from beforeEach
    expect(mount(FinanceOverview).find('.cat-row__progress').exists()).toBe(false)
  })
})

// ── AI spending analysis ──────────────────────────────────────────────────────
describe('FinanceOverview — AI analysis', () => {
  it('shows the Analyse button when categories exist', () => {
    withCategories(['food'])
    expect(mount(FinanceOverview).find('.fo-ai button').exists()).toBe(true)
  })

  it('Analyse button is disabled while aiLoading is true', () => {
    withCategories(['food'])
    mockAiLoading.value = true
    const wrapper = mount(FinanceOverview)
    expect(wrapper.find('.fo-ai button').attributes('disabled')).toBeDefined()
  })

  it('Analyse button is enabled when not loading', () => {
    withCategories(['food'])
    const wrapper = mount(FinanceOverview)
    expect(wrapper.find('.fo-ai button').attributes('disabled')).toBeUndefined()
  })

  it('AI result card is hidden when aiResult is null', () => {
    withCategories(['food'])
    expect(mount(FinanceOverview).find('.fo-ai-card').exists()).toBe(false)
  })

  it('AI result card appears when aiResult is set', () => {
    withCategories(['food'])
    mockAiResult.value = 'Food is your biggest spend at 100%.'
    const wrapper = mount(FinanceOverview)
    expect(wrapper.find('.fo-ai-card').exists()).toBe(true)
    expect(wrapper.find('.fo-ai-text').text()).toContain('Food is your biggest spend')
  })

  it('dismiss button calls dismissAi', async () => {
    withCategories(['food'])
    mockAiResult.value = 'Some insight'
    const wrapper = mount(FinanceOverview)
    await wrapper.find('[aria-label="Dismiss spending analysis"]').trigger('click')
    expect(mockDismissAi).toHaveBeenCalled()
  })
})
