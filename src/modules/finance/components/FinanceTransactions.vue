<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFinanceStore } from '../stores/finance.store'
import { CATEGORY_META, formatAmount } from '../types'
import { UiButton, UiIconButton, UiIcon, UiInput } from '@/ui'
import { useConfirm } from '@/core/composables/useConfirm'
import { useToast } from '@/core/composables/useToast'

const store = useFinanceStore()
const { confirm } = useConfirm()
const toast = useToast()

const searchQuery = ref('')

const visibleExpenses = computed(() => {
  const base = store.viewExpenses
  if (!searchQuery.value.trim()) return base
  const q = searchQuery.value.toLowerCase()
  return base.filter(e => e.note?.toLowerCase().includes(q))
})

async function deleteExpense(id: string): Promise<void> {
  const ok = await confirm({
    title:        'Delete this expense?',
    body:         'The transaction will be permanently removed.',
    danger:       true,
    confirmLabel: 'Delete',
  })
  if (ok) { store.deleteExpense(id); toast.info('Transaction deleted') }
}
</script>

<template>
  <div v-if="store.viewExpenses.length === 0" class="ft-empty">
    <UiIcon name="Receipt" :size="32" />
    <p>No transactions in {{ store.monthLabel }}.</p>
    <UiButton v-if="store.isViewingCurrentMonth" @click="store.openAddForm()">Add your first expense</UiButton>
  </div>

  <template v-else>
    <div class="ft__search-wrap">
      <UiInput v-model="searchQuery" placeholder="Search expenses…" />
    </div>

    <div class="ft-header">
      <span class="ft-count">{{ store.viewExpenses.length }} transaction{{ store.viewExpenses.length !== 1 ? 's' : '' }}</span>
      <UiButton variant="ghost" size="sm" title="Export as CSV" @click="store.exportTransactionsCSV()">
        <UiIcon name="Download" :size="13" />
        CSV
      </UiButton>
    </div>

    <!-- Recurring expenses quick-add -->
    <div v-if="store.recentExpenses.filter(e => e.recurring).length > 0" class="ft-recurring">
      <p class="ft-recurring-label">🔄 Recurring — add for this month:</p>
      <div class="ft-recurring-list">
        <button
          v-for="re in store.recentExpenses.filter(e => e.recurring).slice(0, 5)"
          :key="re.id"
          class="ft-recurring-btn"
          :title="`Add ${re.note || CATEGORY_META[re.category].label} (${formatAmount(re.amount, store.currency)})`"
          @click="store.addFromRecurring(re.id)"
        >
          {{ CATEGORY_META[re.category].icon }} {{ re.note || CATEGORY_META[re.category].label }}
          <span class="ft-recurring-amt">{{ formatAmount(re.amount, store.currency) }}</span>
        </button>
      </div>
    </div>

    <div class="ft-list">
      <div v-for="expense in visibleExpenses" :key="expense.id" class="txn">
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
        <button
          class="txn__recurring"
          :class="{ 'txn__recurring--active': expense.recurring }"
          title="Mark as recurring monthly expense"
          @click.stop="store.toggleRecurring(expense.id)"
        >🔄</button>
        <UiIconButton name="X" aria-label="Delete expense" size="sm" @click="deleteExpense(expense.id)" />
      </div>
    </div>
  </template>
</template>

<style scoped>
.ft-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 24px;
  color: var(--color-text-muted);
  text-align: center;
}
.ft-empty p { margin: 0; font-size: 14px; }

.ft-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 560px;
  margin-bottom: 12px;
}
.ft-count { font-size: 12px; color: var(--color-text-muted); }

.ft-recurring {
  max-width: 560px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--color-accent) 4%, var(--color-surface));
  border: 1px dashed color-mix(in srgb, var(--color-accent) 25%, var(--color-border));
  border-radius: var(--radius);
}
.ft-recurring-label { font-size: 12px; font-weight: 600; color: var(--color-text-secondary); margin: 0; }
.ft-recurring-list { display: flex; flex-wrap: wrap; gap: 6px; }
.ft-recurring-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px; font-size: 12px; font-family: inherit;
  border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  background: var(--color-surface); color: var(--color-text-secondary);
  cursor: pointer; transition: border-color var(--t-fast), background var(--t-fast);
}
.ft-recurring-btn:hover { border-color: var(--color-accent); background: var(--color-accent-muted); }
.ft-recurring-amt { font-family: var(--font-mono); font-weight: 600; color: var(--color-text); }

.ft-list { display: flex; flex-direction: column; gap: 4px; max-width: 560px; }

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
.txn__meta { display: flex; gap: 8px; align-items: center; margin-top: 2px; }
.txn__cat { font-size: 11px; font-weight: 600; }
.txn__date { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }
.txn__amount { font-size: 14px; font-weight: 700; font-family: var(--font-mono); color: var(--color-text); flex-shrink: 0; }
.txn__recurring {
  font-size: 13px;
  line-height: 1;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: opacity var(--t-fast);
  cursor: pointer;
  flex-shrink: 0;
  filter: grayscale(1);
  background: none;
  border: none;
}
.txn:hover .txn__recurring { opacity: 0.6; }
.txn__recurring--active { opacity: 1 !important; filter: none; }

.ft__search-wrap {
  max-width: 560px;
  margin-bottom: 12px;
}
</style>
