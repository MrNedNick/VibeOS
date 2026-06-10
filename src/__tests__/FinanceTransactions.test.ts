/**
 * FinanceTransactions — the transactions list extracted from FinanceView
 * (S15 T4). Renders the current month's expenses, an empty state, and wires
 * per-row recurring toggle + confirm-gated delete.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

const confirmMock = vi.fn()
vi.mock('@/core/composables/useConfirm', () => ({
  useConfirm: () => ({ confirm: confirmMock }),
}))
vi.mock('@/core/composables/useToast', () => ({
  useToast: () => ({ info: vi.fn(), success: vi.fn(), error: vi.fn() }),
}))

import FinanceTransactions from '@/modules/finance/components/FinanceTransactions.vue'
import { useFinanceStore } from '@/modules/finance/stores/finance.store'

const today = new Date().toISOString().split('T')[0]

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  confirmMock.mockReset()
})

function seed(store: ReturnType<typeof useFinanceStore>) {
  store.addExpense({ amount: 12.5, category: 'food', note: 'Lunch', date: today })
  store.addExpense({ amount: 40, category: 'transport', note: 'Taxi', date: today })
}

describe('FinanceTransactions — empty state', () => {
  it('shows the empty state when there are no expenses this month', () => {
    const wrapper = mount(FinanceTransactions)
    expect(wrapper.find('.ft-empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('No transactions')
    expect(wrapper.find('.txn').exists()).toBe(false)
  })
})

describe('FinanceTransactions — list', () => {
  it('renders one row per expense with a count header', () => {
    const store = useFinanceStore()
    seed(store)
    const wrapper = mount(FinanceTransactions)
    expect(wrapper.findAll('.txn')).toHaveLength(2)
    expect(wrapper.find('.ft-count').text()).toContain('2 transaction')
  })

  it('shows the note and category label for a row', () => {
    const store = useFinanceStore()
    store.addExpense({ amount: 9, category: 'food', note: 'Coffee', date: today })
    const wrapper = mount(FinanceTransactions)
    expect(wrapper.find('.txn__note').text()).toBe('Coffee')
    expect(wrapper.find('.txn__cat').text()).toContain('Food')
  })
})

describe('FinanceTransactions — interactions', () => {
  it('recurring button toggles via the store', async () => {
    const store = useFinanceStore()
    seed(store)
    const spy = vi.spyOn(store, 'toggleRecurring')
    const wrapper = mount(FinanceTransactions)
    await wrapper.find('.txn__recurring').trigger('click')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('delete removes the expense when confirmed', async () => {
    confirmMock.mockResolvedValue(true)
    const store = useFinanceStore()
    seed(store)
    const spy = vi.spyOn(store, 'deleteExpense')
    const wrapper = mount(FinanceTransactions)
    await wrapper.find('[aria-label="Delete expense"]').trigger('click')
    await flushPromises()
    expect(confirmMock).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('delete is a no-op when the confirm is dismissed', async () => {
    confirmMock.mockResolvedValue(false)
    const store = useFinanceStore()
    seed(store)
    const spy = vi.spyOn(store, 'deleteExpense')
    const wrapper = mount(FinanceTransactions)
    await wrapper.find('[aria-label="Delete expense"]').trigger('click')
    await flushPromises()
    expect(spy).not.toHaveBeenCalled()
  })
})
