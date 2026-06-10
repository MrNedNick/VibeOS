/**
 * FinanceBudgets — the per-category budget editor + currency settings
 * extracted from FinanceView (S15 T4). Store-driven: shows a row per
 * category, an inline edit state, spent labels, and base/display currency.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import FinanceBudgets from '@/modules/finance/components/FinanceBudgets.vue'
import { useFinanceStore } from '@/modules/finance/stores/finance.store'
import { EXPENSE_CATEGORIES } from '@/modules/finance/types'

const today = new Date().toISOString().split('T')[0]

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('FinanceBudgets — rows', () => {
  it('renders one budget row per expense category', () => {
    const wrapper = mount(FinanceBudgets)
    expect(wrapper.findAll('.budget-row')).toHaveLength(EXPENSE_CATEGORIES.length)
  })

  it('shows "Set limit" for a category with no budget', () => {
    const wrapper = mount(FinanceBudgets)
    expect(wrapper.find('.budget-row__no-limit').exists()).toBe(true)
    expect(wrapper.find('.budget-row__limit').exists()).toBe(false)
  })

  it('shows the monthly limit once a budget is set', () => {
    const store = useFinanceStore()
    store.setBudget('food', 200)
    const wrapper = mount(FinanceBudgets)
    const limit = wrapper.find('.budget-row__limit')
    expect(limit.exists()).toBe(true)
    expect(limit.text()).toContain('/mo')
  })

  it('shows a spent label for categories with expenses', () => {
    const store = useFinanceStore()
    store.addExpense({ amount: 15, category: 'food', note: '', date: today })
    const wrapper = mount(FinanceBudgets)
    const spent = wrapper.find('.budget-row__spent')
    expect(spent.exists()).toBe(true)
    expect(spent.text()).toContain('spent')
  })
})

describe('FinanceBudgets — editing', () => {
  it('clicking a budget value starts edit via the store', async () => {
    const store = useFinanceStore()
    const spy = vi.spyOn(store, 'startBudgetEdit')
    const wrapper = mount(FinanceBudgets)
    await wrapper.find('.budget-row__val').trigger('click')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('renders an input + save button for the category being edited', async () => {
    const store = useFinanceStore()
    const wrapper = mount(FinanceBudgets)
    store.editingBudget = EXPENSE_CATEGORIES[0]
    await nextTick()
    expect(wrapper.find('.budget-row__input').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Save budget limit"]').exists()).toBe(true)
  })
})

describe('FinanceBudgets — currency settings', () => {
  it('renders three currency setting rows (base, display, symbol)', () => {
    const wrapper = mount(FinanceBudgets)
    expect(wrapper.findAll('.fb-currency-row')).toHaveLength(3)
  })

  it('binds the symbol input to the store currency', async () => {
    const store = useFinanceStore()
    const wrapper = mount(FinanceBudgets)
    const input = wrapper.find('input.fb-currency-input')
    await input.setValue('$')
    expect(store.currency).toBe('$')
  })
})
