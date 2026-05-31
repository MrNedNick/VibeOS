export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'health'
  | 'entertainment'
  | 'shopping'
  | 'savings'
  | 'other'

export interface Expense {
  id: string
  amount: number          // in user's base currency, decimal (e.g. 12.50)
  category: ExpenseCategory
  note: string
  date: string            // 'YYYY-MM-DD'
  createdAt: string
  recurring?: boolean     // marks this as a recurring monthly expense
}

export interface CategoryBudget {
  category: ExpenseCategory
  monthlyLimit: number
}

export const CATEGORY_META: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  food:          { label: 'Food & Drink',   icon: '🍔', color: '#f59e0b' },
  transport:     { label: 'Transport',       icon: '🚌', color: '#3b82f6' },
  housing:       { label: 'Housing',         icon: '🏠', color: '#8b5cf6' },
  health:        { label: 'Health',          icon: '❤️', color: '#ef4444' },
  entertainment: { label: 'Entertainment',   icon: '🎮', color: '#a855f7' },
  shopping:      { label: 'Shopping',        icon: '🛍️', color: '#ec4899' },
  savings:       { label: 'Savings',         icon: '💰', color: '#10b981' },
  other:         { label: 'Other',           icon: '📌', color: '#6b7280' },
}

export const EXPENSE_CATEGORIES = Object.keys(CATEGORY_META) as ExpenseCategory[]

export function currentMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function isCurrentMonth(date: string): boolean {
  return date.startsWith(currentMonthKey())
}

export function formatAmount(n: number, currency = '€'): string {
  return `${currency}${n.toFixed(2)}`
}
