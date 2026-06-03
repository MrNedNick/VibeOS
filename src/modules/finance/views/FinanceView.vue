<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFinanceStore } from '../stores/finance.store'
import { CATEGORY_META, EXPENSE_CATEGORIES, formatAmount } from '../types'
import type { ExpenseCategory } from '../types'
import { UiIcon, UiFilterChips, UiButton, UiIconButton, UiInput, UiModal } from '@/ui'
import type { FilterChipOption } from '@/ui'
import FinanceOverview from '../components/FinanceOverview.vue'
import FinanceTransactions from '../components/FinanceTransactions.vue'
import FinanceBudgets from '../components/FinanceBudgets.vue'
import { useTrack } from '@/core/composables/useTrack'

const store = useFinanceStore()
const { track } = useTrack()

type Tab = 'overview' | 'transactions' | 'budgets'
const activeTab = ref<Tab>('overview')

const TAB_OPTIONS: FilterChipOption[] = [
  { value: 'overview',     label: 'Overview' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'budgets',      label: 'Budgets' },
]

const activeTabStr = computed({
  get: () => activeTab.value as string,
  set: (v: string) => { activeTab.value = v as Tab; track('tab:switched', { tab: v }) },
})

function addExpense(): void {
  store.openAddForm()
  track('expense:form-opened')
}

function submitExpense(): void {
  const had_error = !!store.formError
  store.submitExpense()
  if (!had_error && !store.formError) track('expense:added')
}

onMounted(() => store.fetchRates())
</script>

<template>
  <div class="finance">
    <!-- Header -->
    <div class="finance__header">
      <div class="finance__title-group">
        <h1 class="finance__title">Finance</h1>
        <div class="finance__month-nav">
          <UiIconButton name="ChevronLeft" aria-label="Previous month" size="sm" @click="store.prevMonth()" />
          <span class="finance__month-label">{{ store.monthLabel }}</span>
          <UiIconButton name="ChevronRight" aria-label="Next month" size="sm" :disabled="store.isViewingCurrentMonth" @click="store.nextMonth()" />
        </div>
      </div>
      <div class="finance__header-stats">
        <div class="finance__header-stat">
          <span class="finance__header-stat-value">{{ formatAmount(store.viewTotal, store.currency) }}</span>
          <span
            v-if="store.displayCurrency !== store.baseCurrency && store.exchangeRate !== 1"
            class="finance__header-stat-converted"
          >≈ {{ store.displaySymbol }}{{ store.convertAmount(store.viewTotal).toLocaleString() }}</span>
          <span class="finance__header-stat-label">spent</span>
        </div>
        <div v-if="store.totalBudget > 0 && store.isViewingCurrentMonth" class="finance__header-stat">
          <span
            class="finance__header-stat-value"
            :style="{ color: store.viewTotal > store.totalBudget ? 'var(--color-danger)' : 'var(--color-success)' }"
          >{{ formatAmount(store.totalBudget, store.currency) }}</span>
          <span class="finance__header-stat-label">budget</span>
        </div>
        <div v-if="store.viewOverBudgetCount > 0" class="finance__over-badge">
          <UiIcon name="AlertTriangle" :size="12" />
          {{ store.viewOverBudgetCount }} over budget
        </div>
      </div>
      <UiButton @click="addExpense()">
        <UiIcon name="Plus" :size="15" />
        Add expense
      </UiButton>
    </div>

    <!-- Tabs -->
    <div class="finance__tabs">
      <UiFilterChips v-model="activeTabStr" :options="TAB_OPTIONS" />
    </div>

    <!-- Tab content -->
    <div class="finance__content">
      <FinanceOverview v-if="activeTab === 'overview'" />
      <FinanceTransactions v-else-if="activeTab === 'transactions'" />
      <FinanceBudgets v-else-if="activeTab === 'budgets'" />
    </div>

    <!-- Add expense modal -->
    <UiModal v-model:open="store.showAddForm" size="sm">
      <template #header>
        <h2 class="fm-title">Add expense</h2>
      </template>

      <template #body>
        <div class="fm-form">
          <div class="fm-field">
            <label class="fm-label">Amount ({{ store.currency }})</label>
            <input
              v-model="store.formAmount"
              type="number"
              min="0"
              step="0.01"
              class="fm-input fm-input--large"
              placeholder="0.00"
              autofocus
              @keydown.enter="submitExpense()"
            />
          </div>

          <div class="fm-field">
            <label class="fm-label">Category</label>
            <div class="fm-cat-grid">
              <button
                v-for="cat in EXPENSE_CATEGORIES"
                :key="cat"
                class="fm-cat-btn"
                :class="{ 'fm-cat-btn--active': store.formCategory === cat }"
                :style="store.formCategory === cat ? { '--cat-color': CATEGORY_META[cat].color } : {}"
                @click="store.formCategory = cat as ExpenseCategory"
              >
                {{ CATEGORY_META[cat].icon }}
                <span>{{ CATEGORY_META[cat].label }}</span>
              </button>
            </div>
          </div>

          <div class="fm-field">
            <label class="fm-label">Note <span class="fm-optional">(optional)</span></label>
            <UiInput v-model="store.formNote" placeholder="What did you spend on?" @enter="store.submitExpense()" />
          </div>

          <div class="fm-field">
            <label class="fm-label">Date</label>
            <UiInput v-model="store.formDate" type="date" />
          </div>

          <div v-if="store.formError" class="fm-error">
            <UiIcon name="AlertCircle" :size="13" />
            {{ store.formError }}
          </div>
        </div>
      </template>

      <template #footer>
        <UiButton variant="ghost" @click="store.showAddForm = false">Cancel</UiButton>
        <UiButton @click="submitExpense()">Add expense</UiButton>
      </template>
    </UiModal>
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

.finance__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.finance__title-group { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.finance__title { font-size: 27px; font-weight: 700; color: var(--color-text); margin: 0; }

.finance__month-nav { display: flex; align-items: center; gap: 4px; }
.finance__month-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  min-width: 130px;
  text-align: center;
}

.finance__header-stats { display: flex; align-items: center; gap: 16px; }
.finance__header-stat { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.finance__header-stat-value { font-size: 20px; font-weight: 700; font-family: var(--font-mono); color: var(--color-text); }
.finance__header-stat-converted { font-size: 12px; color: var(--color-text-muted); font-family: var(--font-mono); }
.finance__header-stat-label { font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

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

.finance__tabs {
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.finance__content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
}

/* Add expense modal form */
.fm-title { font-size: 17px; font-weight: 700; color: var(--color-text); margin: 0; }
.fm-form { display: flex; flex-direction: column; gap: 16px; }
.fm-field { display: flex; flex-direction: column; gap: 6px; }
.fm-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
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
.fm-cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
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
.fm-cat-btn span { font-size: 9px; font-weight: 600; color: var(--color-text-muted); text-align: center; line-height: 1.2; }
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

@media (max-width: 767px) {
  .finance { height: auto; overflow: visible; }
  .finance__header { flex-direction: column; align-items: flex-start; gap: 10px; padding-bottom: 14px; }
  .finance__title-group { width: 100%; flex-direction: row; align-items: center; justify-content: space-between; }
  .finance__title { font-size: 22px; }
  .finance__header-stats { width: 100%; justify-content: space-between; gap: 8px; }
  .finance__header-stat-value { font-size: 17px; }
  .finance__tabs { overflow-x: auto; white-space: nowrap; }
}
</style>
