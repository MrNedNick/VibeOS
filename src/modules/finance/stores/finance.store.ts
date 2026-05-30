import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import type { Expense, CategoryBudget, ExpenseCategory } from '../types'
import { isCurrentMonth, EXPENSE_CATEGORIES } from '../types'

export const useFinanceStore = defineStore('finance:main', () => {
  const expenses = useStorage<Expense[]>(storageKey('finance', 'expenses'), [])
  const budgets  = useStorage<CategoryBudget[]>(storageKey('finance', 'budgets'), [])
  const currency = useStorage<string>(storageKey('finance', 'currency'), '€')

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
    expenses.value.push(expense)
    return expense
  }

  function deleteExpense(id: string): void {
    expenses.value = expenses.value.filter(e => e.id !== id)
  }

  function updateExpense(id: string, patch: Partial<Omit<Expense, 'id' | 'createdAt'>>): void {
    const e = expenses.value.find(x => x.id === id)
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

  return {
    expenses,
    budgets,
    currency,
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
    setBudget,
    removeBudget,
    expensesByMonth,
  }
})
