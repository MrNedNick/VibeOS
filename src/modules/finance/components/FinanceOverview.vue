<script setup lang="ts">
import { useFinanceStore } from '../stores/finance.store'
import { CATEGORY_META, formatAmount } from '../types'
import { UiButton, UiIconButton, UiSectionLabel, UiProgressBar, UiIcon } from '@/ui'
import { useAiInsight } from '@/core/composables/useAiInsight'

const store = useFinanceStore()
const todayDateStr = new Date().toISOString().split('T')[0]

const { result: aiResult, loading: aiLoading, run: runAi, dismiss: dismissAi } = useAiInsight()

function buildSpendingPrompt(): string {
  const cur = store.currency
  const lines = store.viewCategories.map(cat => {
    const spent = store.viewSpentByCategory[cat]
    const limit = store.budgetMap[cat] ?? 0
    const pct = store.viewTotal > 0 ? Math.round((spent / store.viewTotal) * 100) : 0
    const budgetStr = limit > 0
      ? ` · budget ${formatAmount(limit, cur)}${spent > limit ? ` (OVER by ${formatAmount(spent - limit, cur)})` : ''}`
      : ' · no budget set'
    return `- ${CATEGORY_META[cat].label}: ${formatAmount(spent, cur)} (${pct}% of total)${budgetStr}`
  }).join('\n')
  const biggest = [...store.viewExpenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map(e => `- ${formatAmount(e.amount, cur)} on ${CATEGORY_META[e.category].label}${e.note ? ` (${e.note})` : ''}`)
    .join('\n')
  return [
    `You are analysing a user's spending for ${store.monthLabel}. All amounts are in ${cur}. Total spent: ${formatAmount(store.viewTotal, cur)}.`,
    '',
    'By category:',
    lines,
    '',
    'Biggest single expenses:',
    biggest || '- none',
    '',
    'Give 3-4 short observations grounded strictly in this data (largest category, over-budget categories, categories with no spending), then 1-2 concrete suggestions. One line per point, each starting with "- ". Use the same currency. No preamble.',
  ].join('\n')
}

function analyseSpending(): void {
  if (!store.viewCategories.length) return
  runAi(buildSpendingPrompt())
}
</script>

<template>
  <div v-if="store.viewCategories.length === 0" class="fo-empty">
    <UiIcon name="PiggyBank" :size="32" />
    <p>No expenses {{ store.isViewingCurrentMonth ? 'this month' : 'in ' + store.monthLabel }} yet.</p>
    <UiButton v-if="store.isViewingCurrentMonth" @click="store.openAddForm()">Add your first expense</UiButton>
  </div>

  <template v-else>
    <!-- AI spending analysis -->
    <div class="fo-ai">
      <UiButton
        variant="ghost"
        size="sm"
        :disabled="aiLoading"
        title="AI: analyse this month's spending"
        @click="analyseSpending"
      >{{ aiLoading ? '✦ Analysing…' : '✦ Analyse spending' }}</UiButton>
      <Transition name="ai-fade">
        <div v-if="aiResult" class="fo-ai-card">
          <div class="fo-ai-head">
            <span class="fo-ai-label">✦ Spending analysis</span>
            <UiIconButton name="X" aria-label="Dismiss spending analysis" size="sm" @click="dismissAi" />
          </div>
          <p class="fo-ai-text">{{ aiResult }}</p>
        </div>
      </Transition>
    </div>

    <!-- Category stacked proportion bar -->
    <div class="fo-breakdown">
      <UiSectionLabel size="sm">Category breakdown</UiSectionLabel>
      <div class="fo-breakdown-bar">
        <div
          v-for="cat in store.viewCategories"
          :key="cat"
          class="fo-breakdown-seg"
          :style="{
            width: (store.viewSpentByCategory[cat] / store.viewTotal * 100) + '%',
            background: CATEGORY_META[cat].color,
          }"
          :title="`${CATEGORY_META[cat].label}: ${formatAmount(store.viewSpentByCategory[cat], store.currency)} (${Math.round(store.viewSpentByCategory[cat] / store.viewTotal * 100)}%)`"
        />
      </div>
      <div class="fo-breakdown-legend">
        <span
          v-for="cat in store.viewCategories"
          :key="cat"
          class="fo-breakdown-legend-item"
          :style="{ '--cat': CATEGORY_META[cat].color }"
        >
          {{ CATEGORY_META[cat].icon }} {{ Math.round(store.viewSpentByCategory[cat] / store.viewTotal * 100) }}%
        </span>
      </div>
    </div>

    <!-- Day-by-day spending chart -->
    <div v-if="store.hasDayData" class="fo-day-chart">
      <UiSectionLabel size="sm">Daily spending — {{ store.monthLabel }}</UiSectionLabel>
      <div class="fo-day-bars">
        <div
          v-for="d in store.daysInMonth"
          :key="d.day"
          class="fo-day-bar-wrap"
          :title="d.total > 0 ? `${d.day}: ${formatAmount(d.total, store.currency)}` : d.day"
        >
          <div
            class="fo-day-bar"
            :class="{ 'fo-day-bar--today': d.day === todayDateStr, 'fo-day-bar--empty': d.total === 0 }"
            :style="{ height: d.total > 0 ? `${Math.max(4, (d.total / store.maxDaySpend) * 100)}%` : '2px' }"
          />
        </div>
      </div>
    </div>

    <!-- Category rows -->
    <div class="fo-categories">
      <div v-for="cat in store.viewCategories" :key="cat" class="cat-row">
        <div class="cat-row__icon">{{ CATEGORY_META[cat].icon }}</div>
        <div class="cat-row__body">
          <div class="cat-row__top">
            <span class="cat-row__name">{{ CATEGORY_META[cat].label }}</span>
            <span class="cat-row__spent">{{ formatAmount(store.viewSpentByCategory[cat], store.currency) }}</span>
            <span v-if="store.budgetMap[cat]" class="cat-row__limit">
              / {{ formatAmount(store.budgetMap[cat], store.currency) }}
            </span>
          </div>
          <UiProgressBar
            v-if="store.budgetMap[cat]"
            :value="store.barPct(cat)"
            :color="store.barColorToken(cat)"
            class="cat-row__progress"
          />
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
.fo-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 24px;
  color: var(--color-text-muted);
  text-align: center;
}
.fo-empty p { margin: 0; font-size: 14px; }

.fo-ai { display: flex; flex-direction: column; gap: 12px; }
.fo-ai-card {
  background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, var(--color-border));
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--shadow-1);
}
.fo-ai-head { display: flex; align-items: center; justify-content: space-between; }
.fo-ai-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-accent); }
.fo-ai-text { font-size: var(--text-sm); line-height: var(--leading-lg); color: var(--color-text-secondary); margin: 0; white-space: pre-line; }
.ai-fade-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.ai-fade-leave-active { transition: opacity 0.2s ease; }
.ai-fade-enter-from   { opacity: 0; transform: translateY(-8px); }
.ai-fade-leave-to     { opacity: 0; }

.fo-breakdown {
  max-width: 560px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.fo-breakdown-bar {
  height: 10px;
  border-radius: 5px;
  display: flex;
  overflow: hidden;
  gap: 1px;
  background: var(--color-surface-elevated);
}
.fo-breakdown-seg {
  height: 100%;
  transition: width var(--t-base);
  cursor: default;
  min-width: 2px;
}
.fo-breakdown-seg:first-child { border-radius: 5px 0 0 5px; }
.fo-breakdown-seg:last-child  { border-radius: 0 5px 5px 0; }
.fo-breakdown-legend { display: flex; flex-wrap: wrap; gap: 8px; }
.fo-breakdown-legend-item {
  font-size: 11px;
  font-weight: 600;
  color: var(--cat, var(--color-text-muted));
  opacity: 0.85;
}

.fo-day-chart {
  max-width: 560px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.fo-day-bars {
  display: flex;
  gap: 2px;
  height: 56px;
  align-items: flex-end;
}
.fo-day-bar-wrap {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
  cursor: default;
}
.fo-day-bar {
  width: 100%;
  background: var(--color-accent);
  border-radius: 2px 2px 0 0;
  opacity: 0.65;
  transition: height 0.3s ease, opacity var(--t-fast);
  min-height: 2px;
}
.fo-day-bar:hover:not(.fo-day-bar--empty) { opacity: 1; }
.fo-day-bar--today { opacity: 0.9; }
.fo-day-bar--empty { background: var(--color-border); opacity: 0.4; border-radius: 2px; }

.fo-categories { display: flex; flex-direction: column; gap: 6px; max-width: 560px; }
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
.cat-row__top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cat-row__name { font-size: 14px; font-weight: 600; color: var(--color-text); flex: 1; }
.cat-row__spent { font-size: 14px; font-weight: 700; font-family: var(--font-mono); color: var(--color-text); }
.cat-row__limit { font-size: 12px; color: var(--color-text-muted); font-family: var(--font-mono); }
.cat-row__progress { margin-top: 8px; }
</style>
