import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFinanceStore } from '@/modules/finance/stores/finance.store'
import { currentMonthKey } from '@/modules/finance/types'
import type { ExpenseCategory } from '@/modules/finance/types'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

/** A date string inside the current month (safe day 15) */
function thisMonthDate(): string {
  return `${currentMonthKey()}-15`
}

function add(store: ReturnType<typeof useFinanceStore>, amount: number, category: ExpenseCategory, date = thisMonthDate(), note = '') {
  return store.addExpense({ amount, category, note, date })
}

describe('useFinanceStore — expenses CRUD', () => {
  it('starts with no expenses', () => {
    expect(useFinanceStore().expenses).toHaveLength(0)
  })

  it('addExpense adds an expense and returns it with an id', () => {
    const store = useFinanceStore()
    const e = add(store, 12.5, 'food')
    expect(e.id).toBeTruthy()
    expect(e.createdAt).toBeTruthy()
    expect(store.expenses).toHaveLength(1)
    expect(store.expenses[0].amount).toBe(12.5)
  })

  it('updateExpense patches fields', () => {
    const store = useFinanceStore()
    const e = add(store, 10, 'food')
    store.updateExpense(e.id, { amount: 25, note: 'lunch' })
    expect(store.expenses[0].amount).toBe(25)
    expect(store.expenses[0].note).toBe('lunch')
    expect(store.expenses[0].category).toBe('food')
  })

  it('updateExpense on an unknown id is a no-op', () => {
    const store = useFinanceStore()
    add(store, 10, 'food')
    expect(() => store.updateExpense('nope', { amount: 99 })).not.toThrow()
    expect(store.expenses[0].amount).toBe(10)
  })

  it('deleteExpense soft-deletes (removes from visible list)', () => {
    const store = useFinanceStore()
    const e = add(store, 10, 'food')
    store.deleteExpense(e.id)
    expect(store.expenses).toHaveLength(0)
  })

  it('deleteExpense is idempotent', () => {
    const store = useFinanceStore()
    const e = add(store, 10, 'food')
    store.deleteExpense(e.id)
    expect(() => store.deleteExpense(e.id)).not.toThrow()
    expect(store.expenses).toHaveLength(0)
  })
})

describe('useFinanceStore — monthly aggregates', () => {
  it('totalThisMonth sums only current-month expenses', () => {
    const store = useFinanceStore()
    add(store, 10, 'food')
    add(store, 5.5, 'transport')
    add(store, 100, 'shopping', '2020-01-10') // old month — excluded
    expect(store.totalThisMonth).toBe(15.5)
  })

  it('spentByCategory groups current-month spend by category', () => {
    const store = useFinanceStore()
    add(store, 10, 'food')
    add(store, 4, 'food')
    add(store, 8, 'transport')
    expect(store.spentByCategory.food).toBe(14)
    expect(store.spentByCategory.transport).toBe(8)
    expect(store.spentByCategory.savings).toBe(0)
  })

  it('thisMonthExpenses excludes deleted and other-month rows', () => {
    const store = useFinanceStore()
    const e = add(store, 10, 'food')
    add(store, 20, 'food', '2019-05-01')
    store.deleteExpense(e.id)
    expect(store.thisMonthExpenses).toHaveLength(0)
  })
})

describe('useFinanceStore — budgets', () => {
  it('setBudget creates a budget for a category', () => {
    const store = useFinanceStore()
    store.setBudget('food', 200)
    expect(store.budgetMap.food).toBe(200)
    expect(store.totalBudget).toBe(200)
  })

  it('setBudget updates an existing category budget (no duplicate)', () => {
    const store = useFinanceStore()
    store.setBudget('food', 200)
    store.setBudget('food', 350)
    expect(store.budgets).toHaveLength(1)
    expect(store.budgetMap.food).toBe(350)
  })

  it('totalBudget sums all category budgets', () => {
    const store = useFinanceStore()
    store.setBudget('food', 200)
    store.setBudget('transport', 100)
    expect(store.totalBudget).toBe(300)
  })

  it('removeBudget deletes a category budget', () => {
    const store = useFinanceStore()
    store.setBudget('food', 200)
    store.removeBudget('food')
    expect(store.budgetMap.food).toBeUndefined()
    expect(store.totalBudget).toBe(0)
  })

  it('activeCategories includes categories with spend OR a budget', () => {
    const store = useFinanceStore()
    add(store, 10, 'food')
    store.setBudget('transport', 50)
    const active = store.activeCategories
    expect(active).toContain('food')
    expect(active).toContain('transport')
    expect(active).not.toContain('housing')
  })
})

describe('useFinanceStore — recurring + history', () => {
  it('toggleRecurring flips the recurring flag', () => {
    const store = useFinanceStore()
    const e = add(store, 10, 'housing')
    store.toggleRecurring(e.id)
    expect(store.expenses[0].recurring).toBe(true)
    store.toggleRecurring(e.id)
    expect(store.expenses[0].recurring).toBe(false)
  })

  it('addFromRecurring clones an expense into the current month', () => {
    const store = useFinanceStore()
    const e = store.addExpense({ amount: 30, category: 'housing', note: 'rent', date: '2020-01-01' })
    store.addFromRecurring(e.id)
    expect(store.expenses).toHaveLength(2)
    const clone = store.expenses.find(x => x.id !== e.id)!
    expect(clone.amount).toBe(30)
    expect(clone.date.startsWith(currentMonthKey())).toBe(true)
  })

  it('expensesByMonth returns only that month, newest first', () => {
    const store = useFinanceStore()
    store.addExpense({ amount: 1, category: 'food', note: '', date: '2021-03-02' })
    store.addExpense({ amount: 2, category: 'food', note: '', date: '2021-03-20' })
    store.addExpense({ amount: 3, category: 'food', note: '', date: '2021-04-01' })
    const march = store.expensesByMonth('2021-03')
    expect(march).toHaveLength(2)
    expect(march[0].date).toBe('2021-03-20') // newest first
  })

  it('recentExpenses caps at 100 rows', () => {
    const store = useFinanceStore()
    for (let i = 0; i < 120; i++) add(store, 1, 'other')
    expect(store.recentExpenses.length).toBe(100)
  })
})

describe('useFinanceStore — currency conversion', () => {
  it('convertAmount is identity when display === base', () => {
    const store = useFinanceStore()
    expect(store.convertAmount(42)).toBe(42)
  })

  it('convertAmount applies the stored rate and rounds to cents', () => {
    const store = useFinanceStore()
    store.displayCurrency = 'USD'
    store.exchangeRates = { USD: 1.1 }
    expect(store.convertAmount(10)).toBe(11)
    expect(store.convertAmount(9.99)).toBe(10.99) // 10.989 → 10.99
  })

  it('displaySymbol resolves known currency codes', () => {
    const store = useFinanceStore()
    store.displayCurrency = 'GBP'
    expect(store.displaySymbol).toBe('£')
  })
})
