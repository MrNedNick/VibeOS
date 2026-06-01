import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { useSoftDeletable } from '@/core/composables/useSoftDeletable'
import { storageKey } from '@/core/utils/storage'
import type { Expense, CategoryBudget, ExpenseCategory } from '../types'
import { isCurrentMonth, EXPENSE_CATEGORIES } from '../types'

export const useFinanceStore = defineStore('finance:main', () => {
  const { all: allExpenses, items: expenses, softDelete: softDeleteExpense } = useSoftDeletable<Expense>(storageKey('finance', 'expenses'))
  const budgets     = useStorage<CategoryBudget[]>(storageKey('finance', 'budgets'), [])
  const currency    = useStorage<string>(storageKey('finance', 'currency'), '€')
  /** Base currency code (e.g. 'EUR') — all amounts stored in this currency */
  const baseCurrency    = useStorage<string>(storageKey('finance', 'baseCurrency'), 'EUR')
  /** Display currency code (e.g. 'USD') — amounts shown converted */
  const displayCurrency = useStorage<string>(storageKey('finance', 'displayCurrency'), 'EUR')
  const exchangeRates   = useStorage<Record<string, number>>(storageKey('finance', 'exchangeRates'), {})
  const ratesFetchedAt  = useStorage<string>(storageKey('finance', 'ratesFetchedAt'), '')

  // ── Derived ──────────────────────────────────────────────────────────
  const thisMonthExpenses = computed(() =>
    expenses.value.filter(e => isCurrentMonth(e.date))
  )

  const totalThisMonth = computed(() =>
    thisMonthExpenses.value.reduce((sum, e) => sum + e.amount, 0)
  )

  const spentByCategory = computed(() => {
    const map: Record<string, number> = {}
    for (const cat of EXPENSE_CATEGORIES) map[cat] = 0
    for (const e of thisMonthExpenses.value) {
      map[e.category] = (map[e.category] ?? 0) + e.amount
    }
    return map as Record<ExpenseCategory, number>
  })

  const budgetMap = computed(() => {
    const map: Record<string, number> = {}
    for (const b of budgets.value) map[b.category] = b.monthlyLimit
    return map as Record<ExpenseCategory, number>
  })

  const totalBudget = computed(() =>
    budgets.value.reduce((sum, b) => sum + b.monthlyLimit, 0)
  )

  // Categories that have at least 1 expense this month OR have a budget set
  const activeCategories = computed(() =>
    EXPENSE_CATEGORIES.filter(cat =>
      spentByCategory.value[cat] > 0 || (budgetMap.value[cat] ?? 0) > 0,
    )
  )

  // ── Expenses ──────────────────────────────────────────────────────────
  function addExpense(data: Omit<Expense, 'id' | 'createdAt'>): Expense {
    const expense: Expense = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    allExpenses.value.push(expense)
    return expense
  }

  function deleteExpense(id: string): void {
    softDeleteExpense(id)
  }

  function updateExpense(id: string, patch: Partial<Omit<Expense, 'id' | 'createdAt'>>): void {
    const e = allExpenses.value.find(x => x.id === id)
    if (!e) return
    Object.assign(e, patch)
  }

  // ── Budgets ────────────────────────────────────────────────────────────
  function setBudget(category: ExpenseCategory, monthlyLimit: number): void {
    const existing = budgets.value.find(b => b.category === category)
    if (existing) {
      existing.monthlyLimit = monthlyLimit
    } else {
      budgets.value.push({ category, monthlyLimit })
    }
  }

  function removeBudget(category: ExpenseCategory): void {
    budgets.value = budgets.value.filter(b => b.category !== category)
  }

  function toggleRecurring(id: string): void {
    const e = allExpenses.value.find(x => x.id === id)
    if (e) e.recurring = !e.recurring
  }

  /** Re-add a recurring expense for today's month */
  function addFromRecurring(id: string): void {
    const src = expenses.value.find(x => x.id === id)
    if (!src) return
    const today = new Date().toISOString().split('T')[0]
    allExpenses.value.push({
      ...src,
      id: crypto.randomUUID(),
      date: today,
      createdAt: new Date().toISOString(),
    })
  }

  // ── History helpers ────────────────────────────────────────────────────
  const recentExpenses = computed(() =>
    [...expenses.value]
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, 100),
  )

  function expensesByMonth(monthKey: string): Expense[] {
    return expenses.value
      .filter(e => e.date.startsWith(monthKey))
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  // ── Currency conversion ─────────────────────────────────────────────
  const displaySymbol = computed(() => {
    const SYMBOLS: Record<string, string> = {
      EUR: '€', USD: '$', GBP: '£', JPY: '¥', RUB: '₽',
      UAH: '₴', CHF: 'Fr', CAD: 'C$', AUD: 'A$', CNY: '¥',
    }
    return SYMBOLS[displayCurrency.value] ?? displayCurrency.value
  })

  const exchangeRate = computed(() => {
    if (displayCurrency.value === baseCurrency.value) return 1
    return exchangeRates.value[displayCurrency.value] ?? 1
  })

  function convertAmount(amount: number): number {
    return Math.round(amount * exchangeRate.value * 100) / 100
  }

  async function fetchRates(): Promise<void> {
    // Refresh at most once per day
    const now = new Date().toISOString().split('T')[0]
    if (ratesFetchedAt.value === now && Object.keys(exchangeRates.value).length > 0) return
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency.value}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.rates) {
        exchangeRates.value  = data.rates as Record<string, number>
        ratesFetchedAt.value = now
      }
    } catch { /* silent — use stored rates */ }
  }

  const POPULAR_CURRENCIES = ['EUR', 'USD', 'GBP', 'JPY', 'RUB', 'UAH', 'CHF', 'CAD', 'AUD', 'CNY']

  return {
    expenses,
    budgets,
    currency,
    baseCurrency,
    displayCurrency,
    displaySymbol,
    exchangeRate,
    exchangeRates,
    convertAmount,
    fetchRates,
    POPULAR_CURRENCIES,
    thisMonthExpenses,
    totalThisMonth,
    spentByCategory,
    budgetMap,
    totalBudget,
    activeCategories,
    recentExpenses,
    addExpense,
    deleteExpense,
    updateExpense,
    toggleRecurring,
    addFromRecurring,
    setBudget,
    removeBudget,
    expensesByMonth,
  }
})
