<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanceStore } from '@/modules/finance/stores/finance.store'
import { CATEGORY_META, EXPENSE_CATEGORIES, formatAmount, currentMonthKey } from '@/modules/finance/types'
import { UiIcon } from '@/ui'

const router  = useRouter()
const store   = useFinanceStore()

const monthLabel = computed(() => {
  const [y, m] = currentMonthKey().split('-')
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
})

const total  = computed(() => store.totalThisMonth)
const budget = computed(() => store.totalBudget)
const overBudgetCount = computed(() =>
  EXPENSE_CATEGORIES.filter(cat => {
    const limit = store.budgetMap[cat] ?? 0
    return limit > 0 && store.spentByCategory[cat] > limit
  }).length,
)

// Top 3 categories by spend this month
const topCategories = computed(() =>
  EXPENSE_CATEGORIES
    .filter(cat => store.spentByCategory[cat] > 0)
    .sort((a, b) => store.spentByCategory[b] - store.spentByCategory[a])
    .slice(0, 4),
)

const budgetPct = computed(() => {
  if (!budget.value) return 0
  return Math.min(100, Math.round((total.value / budget.value) * 100))
})

const isEmpty = computed(() => store.thisMonthExpenses.length === 0)
</script>

<template>
  <div class="fin-widget" @click="router.push('/finance')">
    <div class="fin-widget__header">
      <div class="fin-widget__title-row">
        <UiIcon name="Wallet" :size="13" :stroke-width="2" class="fin-widget__icon" />
        <span class="fin-widget__title">Finance</span>
      </div>
      <span class="fin-widget__month">{{ monthLabel }}</span>
    </div>

    <!-- Empty state -->
    <div v-if="isEmpty" class="fin-widget__empty">
      <span class="fin-widget__empty-text">No expenses this month</span>
      <button class="fin-widget__add" @click.stop="router.push('/finance')">
        + Add expense
      </button>
    </div>

    <template v-else>
      <!-- Total -->
      <div class="fin-widget__total-row">
        <span
          class="fin-widget__total"
          :style="budget && total > budget ? { color: 'var(--color-danger)' } : {}"
        >{{ formatAmount(total, store.currency) }}</span>
        <span v-if="budget" class="fin-widget__budget-label">
          / {{ formatAmount(budget, store.currency) }}
        </span>
        <span v-if="overBudgetCount > 0" class="fin-widget__over">
          <UiIcon name="AlertTriangle" :size="11" />
          {{ overBudgetCount }} over
        </span>
      </div>

      <!-- Budget progress bar -->
      <div v-if="budget" class="fin-widget__budget-bar">
        <div
          class="fin-widget__budget-fill"
          :style="{
            width: budgetPct + '%',
            background: budgetPct >= 100 ? 'var(--color-danger)' : budgetPct >= 80 ? 'var(--color-warning)' : 'var(--color-success)',
          }"
        />
      </div>

      <!-- Top categories -->
      <div class="fin-widget__cats">
        <div
          v-for="cat in topCategories"
          :key="cat"
          class="fin-widget__cat"
          :title="`${CATEGORY_META[cat].label}: ${formatAmount(store.spentByCategory[cat], store.currency)}`"
        >
          <span class="fin-widget__cat-icon">{{ CATEGORY_META[cat].icon }}</span>
          <div class="fin-widget__cat-bar-wrap">
            <div
              class="fin-widget__cat-bar"
              :style="{
                width: total > 0 ? (store.spentByCategory[cat] / total * 100) + '%' : '0%',
                background: CATEGORY_META[cat].color,
              }"
            />
          </div>
          <span class="fin-widget__cat-amount">{{ formatAmount(store.spentByCategory[cat], store.currency) }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.fin-widget {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  cursor: pointer;
  transition: border-color var(--t-fast);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.fin-widget:hover { border-color: var(--color-accent); }

.fin-widget__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fin-widget__title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fin-widget__icon { color: var(--color-text-muted); }

.fin-widget__title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-secondary);
}

.fin-widget__month {
  font-size: 11px;
  color: var(--color-text-muted);
}

.fin-widget__empty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.fin-widget__empty-text {
  font-size: 13px;
  color: var(--color-text-muted);
  font-style: italic;
}

.fin-widget__add {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent);
  padding: 3px 10px;
  border: 1px solid var(--color-accent-muted);
  border-radius: var(--radius-xs);
  background: var(--color-accent-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: opacity var(--t-fast);
}
.fin-widget__add:hover { opacity: 0.8; }

.fin-widget__total-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.fin-widget__total {
  font-size: 22px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-text);
  line-height: 1;
}

.fin-widget__budget-label {
  font-size: 13px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.fin-widget__over {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-danger);
  margin-left: auto;
}

.fin-widget__budget-bar {
  height: 4px;
  background: var(--color-surface-elevated);
  border-radius: 2px;
  overflow: hidden;
}

.fin-widget__budget-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
}

.fin-widget__cats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fin-widget__cat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fin-widget__cat-icon { font-size: 13px; width: 18px; text-align: center; flex-shrink: 0; }

.fin-widget__cat-bar-wrap {
  flex: 1;
  height: 3px;
  background: var(--color-surface-elevated);
  border-radius: 2px;
  overflow: hidden;
}

.fin-widget__cat-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
  min-width: 2px;
  opacity: 0.75;
}

.fin-widget__cat-amount {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  white-space: nowrap;
  min-width: 50px;
  text-align: right;
}
</style>
