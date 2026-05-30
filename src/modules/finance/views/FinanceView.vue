<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFinanceStore } from '../stores/finance.store'
import { CATEGORY_META, EXPENSE_CATEGORIES, formatAmount, currentMonthKey } from '../types'
import type { ExpenseCategory } from '../types'
import { UiIcon } from '@/ui'

const store = useFinanceStore()

// ── Tabs ──────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'transactions' | 'budgets'
const activeTab = ref<Tab>('overview')

// ── Add expense form ─────────────────────────────────────────────────────
const showAddForm = ref(false)
const formAmount   = ref('')
const formCategory = ref<ExpenseCategory>('food')
const formNote     = ref('')
const formDate     = ref(new Date().toISOString().split('T')[0])
const formError    = ref('')

function openAddForm() {
  formAmount.value   = ''
  formNote.value     = ''
  formDate.value     = new Date().toISOString().split('T')[0]
  formCategory.value = 'food'
  formError.value    = ''
  showAddForm.value  = true
}

function submitExpense() {
  formError.value = ''
  const amount = parseFloat(formAmount.value.replace(',', '.'))
  if (isNaN(amount) || amount <= 0) {
    formError.value = 'Enter a valid amount greater than 0'
    return
  }
  store.addExpense({
    amount,
    category: formCategory.value,
    note: formNote.value.trim(),
    date: formDate.value,
  })
  showAddForm.value = false
}

// ── Budgets editing ──────────────────────────────────────────────────────
const editingBudget = ref<ExpenseCategory | null>(null)
const budgetInput   = ref('')

function startBudgetEdit(cat: ExpenseCategory) {
  editingBudget.value = cat
  budgetInput.value   = String(store.budgetMap[cat] ?? '')
}

function saveBudget(cat: ExpenseCategory) {
  const val = parseFloat(budgetInput.value.replace(',', '.'))
  if (!isNaN(val) && val > 0) {
    store.setBudget(cat, val)
  } else if (budgetInput.value === '' || val === 0) {
    store.removeBudget(cat)
  }
  editingBudget.value = null
}

function onBudgetKeydown(e: KeyboardEvent, cat: ExpenseCategory) {
  if (e.key === 'Enter') saveBudget(cat)
  if (e.key === 'Escape') editingBudget.value = null
}

// ── Derived display ──────────────────────────────────────────────────────
const overBudgetCount = computed(() =>
  EXPENSE_CATEGORIES.filter(cat => {
    const limit = store.budgetMap[cat] ?? 0
    return limit > 0 && store.spentByCategory[cat] > limit
  }).length,
)

const monthLabel = computed(() => {
  const [y, m] = currentMonthKey().split('-')
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
})

// Category bar fill percentage (cap at 100% for display)
function barPct(cat: ExpenseCategory): number {
  const spent = store.spentByCategory[cat]
  const limit = store.budgetMap[cat] ?? 0
  if (limit <= 0) return 0
  return Math.min(100, (spent / limit) * 100)
}

function barColor(cat: ExpenseCategory): string {
  const pct = barPct(cat)
  if (pct >= 100) return '#ef4444'
  if (pct >= 80)  return '#f59e0b'
  return '#22c55e'
}

// All categories for Overview: those with spend OR budget
const overviewCategories = computed(() =>
  EXPENSE_CATEGORIES.filter(cat =>
    store.spentByCategory[cat] > 0 || (store.budgetMap[cat] ?? 0) > 0,
  ),
)

function deleteExpense(id: string) {
  if (confirm('Delete this expense?')) store.deleteExpense(id)
}
</script>

<template>
  <div class="finance">
    <!-- Header -->
    <div class="finance__header">
      <div class="finance__title-group">
        <h1 class="finance__title">Finance</h1>
        <p class="finance__sub">{{ monthLabel }}</p>
      </div>
      <div class="finance__header-stats">
        <div class="finance__header-stat">
          <span class="finance__header-stat-value">{{ formatAmount(store.totalThisMonth, store.currency) }}</span>
          <span class="finance__header-stat-label">spent</span>
        </div>
        <div v-if="store.totalBudget > 0" class="finance__header-stat">
          <span
            class="finance__header-stat-value"
            :style="{ color: store.totalThisMonth > store.totalBudget ? '#ef4444' : '#22c55e' }"
          >
            {{ formatAmount(store.totalBudget, store.currency) }}
          </span>
          <span class="finance__header-stat-label">budget</span>
        </div>
        <div v-if="overBudgetCount > 0" class="finance__over-badge">
          <UiIcon name="AlertTriangle" :size="12" />
          {{ overBudgetCount }} over budget
        </div>
      </div>
      <button class="finance__add-btn" @click="openAddForm">
        <UiIcon name="Plus" :size="15" />
        Add expense
      </button>
    </div>

    <!-- Tabs -->
    <div class="finance__tabs">
      <button
        v-for="tab in (['overview', 'transactions', 'budgets'] as Tab[])"
        :key="tab"
        class="finance__tab"
        :class="{ 'finance__tab--active': activeTab === tab }"
        @click="activeTab = tab"
      >
        <UiIcon
          :name="tab === 'overview' ? 'PieChart' : tab === 'transactions' ? 'List' : 'Wallet'"
          :size="13"
        />
        {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
      </button>
    </div>

    <!-- ── Overview tab ─────────────────────────────────────────────── -->
    <div v-if="activeTab === 'overview'" class="finance__content">
      <div v-if="overviewCategories.length === 0" class="finance__empty">
        <UiIcon name="PiggyBank" :size="32" />
        <p>No expenses this month yet.</p>
        <button class="finance__empty-btn" @click="openAddForm">Add your first expense</button>
      </div>

      <div v-else class="finance__categories">
        <div
          v-for="cat in overviewCategories"
          :key="cat"
          class="cat-row"
        >
          <div class="cat-row__icon">{{ CATEGORY_META[cat].icon }}</div>
          <div class="cat-row__body">
            <div class="cat-row__top">
              <span class="cat-row__name">{{ CATEGORY_META[cat].label }}</span>
              <span class="cat-row__spent">{{ formatAmount(store.spentByCategory[cat], store.currency) }}</span>
              <span v-if="store.budgetMap[cat]" class="cat-row__limit">
                / {{ formatAmount(store.budgetMap[cat], store.currency) }}
              </span>
            </div>
            <div v-if="store.budgetMap[cat]" class="cat-row__bar-wrap">
              <div
                class="cat-row__bar"
                :style="{ width: barPct(cat) + '%', background: barColor(cat) }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Transactions tab ─────────────────────────────────────────── -->
    <div v-else-if="activeTab === 'transactions'" class="finance__content">
      <div v-if="store.recentExpenses.length === 0" class="finance__empty">
        <UiIcon name="Receipt" :size="32" />
        <p>No transactions recorded yet.</p>
        <button class="finance__empty-btn" @click="openAddForm">Add your first expense</button>
      </div>

      <div v-else class="finance__transactions">
        <div
          v-for="expense in store.recentExpenses"
          :key="expense.id"
          class="txn"
        >
          <div class="txn__icon">{{ CATEGORY_META[expense.category].icon }}</div>
          <div class="txn__body">
            <div class="txn__note">{{ expense.note || CATEGORY_META[expense.category].label }}</div>
            <div class="txn__meta">
              <span class="txn__cat" :style="{ color: CATEGORY_META[expense.category].color }">
                {{ CATEGORY_META[expense.category].label }}
              </span>
              <span class="txn__date">{{ expense.date }}</span>
            </div>
          </div>
          <div class="txn__amount">{{ formatAmount(expense.amount, store.currency) }}</div>
          <button class="txn__del" title="Delete" @click="deleteExpense(expense.id)">
            <UiIcon name="X" :size="13" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── Budgets tab ──────────────────────────────────────────────── -->
    <div v-else-if="activeTab === 'budgets'" class="finance__content">
      <p class="finance__budgets-hint">
        Set monthly spending limits per category. Leave blank to remove.
      </p>

      <div class="finance__budget-list">
        <div
          v-for="cat in EXPENSE_CATEGORIES"
          :key="cat"
          class="budget-row"
        >
          <div class="budget-row__icon">{{ CATEGORY_META[cat].icon }}</div>
          <div class="budget-row__name">{{ CATEGORY_META[cat].label }}</div>

          <!-- Inline edit mode -->
          <template v-if="editingBudget === cat">
            <input
              v-model="budgetInput"
              type="number"
              min="0"
              step="10"
              class="budget-row__input"
              placeholder="0"
              @keydown="onBudgetKeydown($event, cat)"
              @blur="saveBudget(cat)"
            />
            <button class="budget-row__save" @click="saveBudget(cat)">
              <UiIcon name="Check" :size="13" />
            </button>
          </template>

          <!-- Display mode -->
          <template v-else>
            <button class="budget-row__val" @click="startBudgetEdit(cat)">
              <span v-if="store.budgetMap[cat]" class="budget-row__limit">
                {{ formatAmount(store.budgetMap[cat], store.currency) }}/mo
              </span>
              <span v-else class="budget-row__no-limit">Set limit</span>
              <UiIcon name="Pencil" :size="12" class="budget-row__edit-icon" />
            </button>
          </template>

          <!-- Spent this month -->
          <span
            v-if="store.spentByCategory[cat] > 0"
            class="budget-row__spent"
            :style="{ color: store.budgetMap[cat] && store.spentByCategory[cat] > store.budgetMap[cat] ? '#ef4444' : 'var(--color-text-muted)' }"
          >
            {{ formatAmount(store.spentByCategory[cat], store.currency) }} spent
          </span>
        </div>
      </div>

      <!-- Currency setting -->
      <div class="finance__currency-row">
        <span class="finance__currency-label">Currency symbol</span>
        <input
          v-model="store.currency"
          type="text"
          class="finance__currency-input"
          maxlength="3"
          placeholder="€"
        />
      </div>
    </div>

    <!-- ── Add expense modal ────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showAddForm" class="finance-modal-overlay" @click.self="showAddForm = false">
        <div class="finance-modal">
          <div class="finance-modal__header">
            <h2 class="finance-modal__title">Add expense</h2>
            <button class="finance-modal__close" @click="showAddForm = false">
              <UiIcon name="X" :size="16" />
            </button>
          </div>

          <div class="finance-modal__form">
            <!-- Amount -->
            <div class="fm-field">
              <label class="fm-label">Amount ({{ store.currency }})</label>
              <input
                v-model="formAmount"
                type="number"
                min="0"
                step="0.01"
                class="fm-input fm-input--large"
                placeholder="0.00"
                autofocus
                @keydown.enter="submitExpense"
              />
            </div>

            <!-- Category -->
            <div class="fm-field">
              <label class="fm-label">Category</label>
              <div class="fm-cat-grid">
                <button
                  v-for="cat in EXPENSE_CATEGORIES"
                  :key="cat"
                  class="fm-cat-btn"
                  :class="{ 'fm-cat-btn--active': formCategory === cat }"
                  :style="formCategory === cat ? { '--cat-color': CATEGORY_META[cat].color } : {}"
                  @click="formCategory = cat"
                >
                  {{ CATEGORY_META[cat].icon }}
                  <span>{{ CATEGORY_META[cat].label }}</span>
                </button>
              </div>
            </div>

            <!-- Note -->
            <div class="fm-field">
              <label class="fm-label">Note <span class="fm-optional">(optional)</span></label>
              <input
                v-model="formNote"
                type="text"
                class="fm-input"
                placeholder="What did you spend on?"
                @keydown.enter="submitExpense"
              />
            </div>

            <!-- Date -->
            <div class="fm-field">
              <label class="fm-label">Date</label>
              <input
                v-model="formDate"
                type="date"
                class="fm-input"
              />
            </div>

            <div v-if="formError" class="fm-error">
              <UiIcon name="AlertCircle" :size="13" />
              {{ formError }}
            </div>

            <div class="fm-actions">
              <button class="fm-btn fm-btn--ghost" @click="showAddForm = false">Cancel</button>
              <button class="fm-btn fm-btn--primary" @click="submitExpense">Add expense</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.finance {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
  overflow: hidden;
}

/* Header */
.finance__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.finance__title-group { flex: 1; min-width: 0; }

.finance__title {
  font-size: 27px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.finance__sub {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 2px 0 0;
}

.finance__header-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.finance__header-stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.finance__header-stat-value {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-text);
}

.finance__header-stat-label {
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.finance__over-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #ef4444;
  background: color-mix(in srgb, #ef4444 10%, transparent);
  border: 1px solid color-mix(in srgb, #ef4444 25%, transparent);
  border-radius: 20px;
  padding: 3px 10px;
}

.finance__add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity var(--t-fast);
}
.finance__add-btn:hover { opacity: 0.88; }

/* Tabs */
.finance__tabs {
  display: flex;
  gap: 2px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.finance__tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color var(--t-fast), border-color var(--t-fast);
  margin-bottom: -1px;
}
.finance__tab:hover { color: var(--color-text-secondary); }
.finance__tab--active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
  font-weight: 600;
}

/* Content area */
.finance__content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
}

/* Empty state */
.finance__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 24px;
  color: var(--color-text-muted);
  text-align: center;
}
.finance__empty p { margin: 0; font-size: 14px; }
.finance__empty-btn {
  padding: 8px 18px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background var(--t-fast);
}
.finance__empty-btn:hover { background: var(--color-border); }

/* Overview — category rows */
.finance__categories {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 560px;
}

.cat-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.cat-row__icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }

.cat-row__body { flex: 1; min-width: 0; }

.cat-row__top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cat-row__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  flex: 1;
}

.cat-row__spent {
  font-size: 14px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-text);
}

.cat-row__limit {
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.cat-row__bar-wrap {
  height: 4px;
  background: var(--color-surface-elevated);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.cat-row__bar {
  height: 100%;
  border-radius: 2px;
  transition: width var(--t-base);
}

/* Transactions */
.finance__transactions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 560px;
}

.txn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  transition: background var(--t-fast);
}
.txn:hover { background: var(--color-surface-elevated); }

.txn__icon { font-size: 18px; flex-shrink: 0; }

.txn__body { flex: 1; min-width: 0; }

.txn__note {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.txn__meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 2px;
}

.txn__cat {
  font-size: 11px;
  font-weight: 600;
}

.txn__date {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.txn__amount {
  font-size: 14px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-text);
  flex-shrink: 0;
}

.txn__del {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--t-fast), color var(--t-fast);
  flex-shrink: 0;
}
.txn:hover .txn__del { opacity: 1; }
.txn__del:hover { color: #ef4444; }

/* Budgets */
.finance__budgets-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0 0 16px;
}

.finance__budget-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 560px;
}

.budget-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.budget-row__icon { font-size: 18px; flex-shrink: 0; }

.budget-row__name {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.budget-row__val {
  display: flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast);
}
.budget-row__val:hover { background: var(--color-surface-elevated); }

.budget-row__limit {
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-mono);
  color: var(--color-text);
}

.budget-row__no-limit {
  font-size: 12px;
  color: var(--color-text-muted);
}

.budget-row__edit-icon {
  color: var(--color-text-muted);
  opacity: 0;
  transition: opacity var(--t-fast);
}
.budget-row__val:hover .budget-row__edit-icon { opacity: 1; }

.budget-row__input {
  width: 90px;
  padding: 4px 8px;
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  outline: none;
}

.budget-row__save {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.budget-row__spent {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  white-space: nowrap;
}

.finance__currency-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
  max-width: 560px;
}

.finance__currency-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  flex: 1;
}

.finance__currency-input {
  width: 60px;
  padding: 5px 10px;
  font-size: 15px;
  font-family: var(--font-mono);
  text-align: center;
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color var(--t-fast);
}
.finance__currency-input:focus { border-color: var(--color-accent); }

/* ── Add expense modal ─────────────────────────────────────────────── */
.finance-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.finance-modal {
  width: 100%;
  max-width: 440px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.finance-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--color-border);
}

.finance-modal__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.finance-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color var(--t-fast);
}
.finance-modal__close:hover { color: var(--color-text); }

.finance-modal__form {
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fm-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fm-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.fm-optional { font-weight: 400; text-transform: none; letter-spacing: 0; }

.fm-input {
  padding: 9px 12px;
  font-size: 14px;
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color var(--t-fast);
}
.fm-input:focus { border-color: var(--color-accent); }
.fm-input--large { font-size: 22px; font-family: var(--font-mono); font-weight: 700; text-align: center; }

.fm-cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.fm-cat-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 9px 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  cursor: pointer;
  font-size: 18px;
  transition: border-color var(--t-fast), background var(--t-fast);
}
.fm-cat-btn span {
  font-size: 9px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: center;
  line-height: 1.2;
}
.fm-cat-btn:hover { border-color: var(--color-text-muted); }
.fm-cat-btn--active {
  border-color: var(--cat-color, var(--color-accent));
  background: color-mix(in srgb, var(--cat-color, var(--color-accent)) 10%, transparent);
}
.fm-cat-btn--active span { color: var(--cat-color, var(--color-accent)); }

.fm-error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #ef4444;
  padding: 8px 12px;
  background: color-mix(in srgb, #ef4444 8%, transparent);
  border: 1px solid color-mix(in srgb, #ef4444 20%, transparent);
  border-radius: var(--radius-sm);
}

.fm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.fm-btn {
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity var(--t-fast), background var(--t-fast);
}

.fm-btn--ghost {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}
.fm-btn--ghost:hover { background: var(--color-border); }

.fm-btn--primary {
  background: var(--color-accent);
  color: #fff;
}
.fm-btn--primary:hover { opacity: 0.88; }

@media (max-width: 767px) {
  .finance__header { gap: 10px; }
  .finance__header-stats { gap: 10px; }
  .fm-cat-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
