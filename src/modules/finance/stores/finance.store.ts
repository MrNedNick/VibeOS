import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { useSoftDeletable } from '@/core/composables/useSoftDeletable'
import { storageKey, storagGet } from '@/core/utils/storage'
import { useBackendSync } from '@/core/composables/useBackendSync'
import { useSyncBus } from '@/core/composables/useSyncBus'
import type { Expense, CategoryBudget, ExpenseCategory } from '../types'
import { isCurrentMonth, EXPENSE_CATEGORIES, CATEGORY_META, currentMonthKey } from '../types'

const EXPENSES_KEY = storageKey('finance', 'expenses')
const BUDGETS_KEY  = storageKey('finance', 'budgets')

export const useFinanceStore = defineStore('finance:main', () => {
  const { all: allExpenses, items: expenses, softDelete: softDeleteExpense } = useSoftDeletable<Expense>(EXPENSES_KEY)
  const budgets     = useStorage<CategoryBudget[]>(BUDGETS_KEY, [])

  // ── Backend sync (mirrors habits/goals pattern) ───────────────────
  const syncBus       = useSyncBus()
  const syncExpenses  = useBackendSync(EXPENSES_KEY)
  const syncBudgets   = useBackendSync(BUDGETS_KEY)

  watch(syncBus.pullSeq, () => {
    allExpenses.value = storagGet<Expense[]>(EXPENSES_KEY, [])
    budgets.value     = storagGet<CategoryBudget[]>(BUDGETS_KEY, [])
  })
  watch(allExpenses, v => syncExpenses.push(v), { deep: true })
  watch(budgets,     v => syncBudgets.push(v),  { deep: true })
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
    for (const b of budgets.value) { if (!b.deletedAt) map[b.category] = b.monthlyLimit }
    return map as Record<ExpenseCategory, number>
  })

  const totalBudget = computed(() =>
    budgets.value.reduce((sum, b) => sum + (b.deletedAt ? 0 : b.monthlyLimit), 0)
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
      updatedAt: Date.now(),
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
    e.updatedAt = Date.now()
  }

  // ── Budgets ────────────────────────────────────────────────────────────
  function setBudget(category: ExpenseCategory, monthlyLimit: number): void {
    const existing = budgets.value.find(b => b.category === category)
    if (existing) {
      existing.monthlyLimit = monthlyLimit
      existing.updatedAt = Date.now()
      delete existing.deletedAt
    } else {
      budgets.value.push({ category, monthlyLimit, updatedAt: Date.now() })
    }
  }

  function removeBudget(category: ExpenseCategory): void {
    // Tombstone, not removal — a hard delete resurrects on the next cloud
    // merge because the remote copy still exists (S28 T3)
    const b = budgets.value.find(x => x.category === category)
    if (b && !b.deletedAt) b.deletedAt = Date.now()
  }

  function toggleRecurring(id: string): void {
    const e = allExpenses.value.find(x => x.id === id)
    if (e) { e.recurring = !e.recurring; e.updatedAt = Date.now() }
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

  // ── Month navigation (UI state) ─────────────────────────────────────────
  const selectedMonth = ref(currentMonthKey())
  const isViewingCurrentMonth = computed(() => selectedMonth.value === currentMonthKey())
  const monthLabel = computed(() => {
    const [y, m] = selectedMonth.value.split('-')
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  })
  function prevMonth(): void {
    const [y, m] = selectedMonth.value.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    selectedMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  function nextMonth(): void {
    if (isViewingCurrentMonth.value) return
    const [y, m] = selectedMonth.value.split('-').map(Number)
    const d = new Date(y, m, 1)
    selectedMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  // ── Month-scoped derived data ────────────────────────────────────────────
  const viewExpenses = computed(() => expensesByMonth(selectedMonth.value))
  const viewTotal = computed(() => viewExpenses.value.reduce((s, e) => s + e.amount, 0))
  const viewSpentByCategory = computed(() => {
    const map: Record<string, number> = {}
    for (const cat of EXPENSE_CATEGORIES) map[cat] = 0
    for (const e of viewExpenses.value) map[e.category] = (map[e.category] ?? 0) + e.amount
    return map as Record<ExpenseCategory, number>
  })
  const viewOverBudgetCount = computed(() =>
    EXPENSE_CATEGORIES.filter(cat => {
      const limit = budgetMap.value[cat] ?? 0
      return limit > 0 && viewSpentByCategory.value[cat] > limit
    }).length,
  )
  const viewCategories = computed(() =>
    EXPENSE_CATEGORIES.filter(cat =>
      viewSpentByCategory.value[cat] > 0 || (isViewingCurrentMonth.value && (budgetMap.value[cat] ?? 0) > 0),
    ),
  )

  // ── Day-by-day chart data ────────────────────────────────────────────────
  const daysInMonth = computed(() => {
    const [y, m] = selectedMonth.value.split('-').map(Number)
    const last = new Date(y, m, 0).getDate()
    const result: { day: string; total: number }[] = []
    for (let d = 1; d <= last; d++) {
      const dayStr = `${selectedMonth.value}-${String(d).padStart(2, '0')}`
      const total = viewExpenses.value.filter(e => e.date === dayStr).reduce((s, e) => s + e.amount, 0)
      result.push({ day: dayStr, total })
    }
    return result
  })
  const maxDaySpend = computed(() => Math.max(...daysInMonth.value.map(d => d.total), 0.01))
  const hasDayData = computed(() => daysInMonth.value.some(d => d.total > 0))

  // ── Category bar helpers ─────────────────────────────────────────────────
  function barPct(cat: ExpenseCategory): number {
    const limit = budgetMap.value[cat] ?? 0
    if (limit <= 0) return 0
    return Math.min(100, (viewSpentByCategory.value[cat] / limit) * 100)
  }
  function barColorToken(cat: ExpenseCategory): 'success' | 'warning' | 'danger' {
    const pct = barPct(cat)
    if (pct >= 100) return 'danger'
    if (pct >= 80) return 'warning'
    return 'success'
  }

  // ── Budget editing state ─────────────────────────────────────────────────
  const editingBudget = ref<ExpenseCategory | null>(null)
  const budgetInput = ref('')
  function startBudgetEdit(cat: ExpenseCategory): void {
    editingBudget.value = cat
    budgetInput.value = String(budgetMap.value[cat] ?? '')
  }
  function saveBudget(cat: ExpenseCategory): void {
    const val = parseFloat(budgetInput.value.replace(',', '.'))
    if (!isNaN(val) && val > 0) setBudget(cat, val)
    else if (budgetInput.value === '' || val === 0) removeBudget(cat)
    editingBudget.value = null
  }
  function onBudgetKeydown(e: KeyboardEvent, cat: ExpenseCategory): void {
    if (e.key === 'Enter') saveBudget(cat)
    if (e.key === 'Escape') editingBudget.value = null
  }

  // ── Add expense form state ───────────────────────────────────────────────
  const showAddForm = ref(false)
  const formAmount = ref('')
  const formCategory = ref<ExpenseCategory>('food')
  const formNote = ref('')
  const formDate = ref(new Date().toISOString().split('T')[0])
  const formError = ref('')
  function openAddForm(): void {
    formAmount.value = ''
    formNote.value = ''
    formDate.value = new Date().toISOString().split('T')[0]
    formCategory.value = 'food'
    formError.value = ''
    showAddForm.value = true
  }
  function submitExpense(): void {
    formError.value = ''
    const amount = parseFloat(formAmount.value.replace(',', '.'))
    if (isNaN(amount) || amount <= 0) {
      formError.value = 'Enter a valid amount greater than 0'
      return
    }
    addExpense({ amount, category: formCategory.value, note: formNote.value.trim(), date: formDate.value })
    showAddForm.value = false
  }

  // ── CSV export (all expenses) ────────────────────────────────────────────
  function exportCsv(): void {
    const rows = [['Date', 'Description', 'Amount', 'Category', 'Recurring']]
    const sorted = [...expenses.value].sort((a, b) => a.date < b.date ? 1 : -1)
    for (const e of sorted) {
      rows.push([e.date, e.note ?? '', String(e.amount), e.category, e.recurring ? 'yes' : 'no'])
    }
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `expenses-${new Date().toISOString().slice(0, 10)}.csv`,
    })
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── CSV export (current view) ────────────────────────────────────────────
  function exportTransactionsCSV(): void {
    if (!viewExpenses.value.length) return
    const rows = ['Date,Category,Note,Amount']
    for (const e of viewExpenses.value) {
      const note = e.note ? `"${e.note.replace(/"/g, '""')}"` : ''
      rows.push(`${e.date},${CATEGORY_META[e.category].label},${note},${e.amount.toFixed(2)}`)
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: `expenses-${selectedMonth.value}.csv` })
    a.click()
    URL.revokeObjectURL(url)
  }

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
    // Month navigation
    selectedMonth,
    isViewingCurrentMonth,
    monthLabel,
    prevMonth,
    nextMonth,
    // Month-scoped data
    viewExpenses,
    viewTotal,
    viewSpentByCategory,
    viewOverBudgetCount,
    viewCategories,
    daysInMonth,
    maxDaySpend,
    hasDayData,
    barPct,
    barColorToken,
    // Budget editing
    editingBudget,
    budgetInput,
    startBudgetEdit,
    saveBudget,
    onBudgetKeydown,
    // Add form
    showAddForm,
    formAmount,
    formCategory,
    formNote,
    formDate,
    formError,
    openAddForm,
    submitExpense,
    exportCsv,
    exportTransactionsCSV,
  }
})
