<script setup lang="ts">
import { computed } from 'vue'
import { useFinanceStore } from '../stores/finance.store'
import { CATEGORY_META, EXPENSE_CATEGORIES, formatAmount } from '../types'
import type { ExpenseCategory } from '../types'
import { UiSelect, UiInput, UiIcon, UiIconButton } from '@/ui'
import type { SelectOption } from '@/ui'

const store = useFinanceStore()

const currencyOptions = computed<SelectOption[]>(() =>
  store.POPULAR_CURRENCIES.map((c: string) => ({ value: c, label: c })),
)
const baseCurrencyStr = computed({
  get: () => store.baseCurrency,
  set: (v: string | number) => { store.baseCurrency = String(v); store.fetchRates() },
})
const displayCurrencyStr = computed({
  get: () => store.displayCurrency,
  set: (v: string | number) => { store.displayCurrency = String(v); store.fetchRates() },
})

function handleKeydown(e: KeyboardEvent, cat: ExpenseCategory): void {
  store.onBudgetKeydown(e, cat)
}
</script>

<template>
  <p class="fb-hint">Set monthly spending limits per category. Leave blank to remove.</p>

  <div class="fb-list">
    <div v-for="cat in EXPENSE_CATEGORIES" :key="cat" class="budget-row">
      <div class="budget-row__icon">{{ CATEGORY_META[cat].icon }}</div>
      <div class="budget-row__name">{{ CATEGORY_META[cat].label }}</div>

      <template v-if="store.editingBudget === cat">
        <input
          v-model="store.budgetInput"
          type="number"
          min="0"
          step="10"
          class="budget-row__input"
          placeholder="0"
          @keydown="handleKeydown($event, cat)"
          @blur="store.saveBudget(cat)"
        />
        <UiIconButton name="Check" aria-label="Save budget limit" size="sm" @click="store.saveBudget(cat)" />
      </template>

      <template v-else>
        <button class="budget-row__val" @click="store.startBudgetEdit(cat)">
          <span v-if="store.budgetMap[cat]" class="budget-row__limit">
            {{ formatAmount(store.budgetMap[cat], store.currency) }}/mo
          </span>
          <span v-else class="budget-row__no-limit">Set limit</span>
          <UiIcon name="Pencil" :size="12" class="budget-row__edit-icon" />
        </button>
      </template>

      <span
        v-if="store.spentByCategory[cat] > 0"
        class="budget-row__spent"
        :style="{ color: store.budgetMap[cat] && store.spentByCategory[cat] > store.budgetMap[cat] ? '#ef4444' : 'var(--color-text-muted)' }"
      >
        {{ formatAmount(store.spentByCategory[cat], store.currency) }} spent
      </span>
    </div>
  </div>

  <!-- Currency settings -->
  <div class="fb-currency-row">
    <span class="fb-currency-label">Base currency</span>
    <UiSelect v-model="baseCurrencyStr" :options="currencyOptions" size="sm" />
  </div>
  <div class="fb-currency-row">
    <span class="fb-currency-label">Display currency</span>
    <UiSelect v-model="displayCurrencyStr" :options="currencyOptions" size="sm" />
    <span v-if="store.exchangeRate !== 1" class="fb-rate-badge">
      1 {{ store.baseCurrency }} = {{ store.exchangeRate.toFixed(4) }} {{ store.displayCurrency }}
    </span>
  </div>
  <div class="fb-currency-row">
    <span class="fb-currency-label">Symbol</span>
    <UiInput v-model="store.currency" :maxlength="3" placeholder="€" class="fb-currency-input" />
  </div>
</template>

<style scoped>
.fb-hint { font-size: 13px; color: var(--color-text-muted); margin: 0 0 16px; }

.fb-list { display: flex; flex-direction: column; gap: 4px; max-width: 560px; }

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
.budget-row__name { flex: 1; font-size: 14px; color: var(--color-text-secondary); }
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
.budget-row__limit { font-size: 13px; font-weight: 600; font-family: var(--font-mono); color: var(--color-text); }
.budget-row__no-limit { font-size: 12px; color: var(--color-text-muted); }
.budget-row__edit-icon { color: var(--color-text-muted); opacity: 0; transition: opacity var(--t-fast); }
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
.budget-row__spent { font-size: 12px; font-family: var(--font-mono); color: var(--color-text-muted); white-space: nowrap; }

.fb-currency-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
  max-width: 560px;
}
.fb-currency-label { font-size: 13px; color: var(--color-text-secondary); flex: 1; }
.fb-rate-badge {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  padding: 2px 8px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 99px;
  white-space: nowrap;
}
.fb-currency-input { width: 60px; }
</style>
