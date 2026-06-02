<script setup lang="ts">
import { useLocale } from '@/core/i18n'
import { UiSectionLabel } from '@/ui'

interface HabitRow {
  id: string
  name: string
  emoji: string
  rate: number
  cells: { date: string; done: boolean; isToday: boolean }[]
}

defineProps<{ habitRows: HabitRow[] }>()

const i18n = useLocale()
</script>

<template>
  <section class="analytics__section">
    <UiSectionLabel as="h2" class="analytics__section-label">{{ i18n.t('analytics.habitsTitle') }}</UiSectionLabel>

    <div v-if="habitRows.length === 0" class="empty-state">{{ i18n.t('analytics.habitsEmpty') }}</div>

    <div v-else class="habit-grid-wrap">
      <div v-for="row in habitRows" :key="row.id" class="habit-row">
        <div class="habit-row__meta">
          <span class="habit-row__emoji">{{ row.emoji }}</span>
          <span class="habit-row__name">{{ row.name }}</span>
          <span class="habit-row__rate">{{ row.rate }}%</span>
        </div>
        <div class="habit-row__cells">
          <div
            v-for="cell in row.cells"
            :key="cell.date"
            class="habit-cell"
            :class="{ 'habit-cell--done': cell.done, 'habit-cell--today': cell.isToday }"
            :title="cell.date"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.analytics__section { display: flex; flex-direction: column; gap: 16px; }
.analytics__section-label { margin-bottom: 0; }
.empty-state { font-size: 13px; color: var(--color-text-muted); padding: 8px 0; }

.habit-grid-wrap { display: flex; flex-direction: column; gap: 8px; }
.habit-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.habit-row__meta {
  display: flex; align-items: center; gap: 8px;
  min-width: 200px; flex: 0 0 200px;
}
.habit-row__emoji { font-size: 16px; }
.habit-row__name { font-size: 13px; font-weight: 500; color: var(--color-text); flex: 1; }
.habit-row__rate { font-size: 12px; font-family: var(--font-mono); color: var(--color-text-muted); }
.habit-row__cells { display: flex; gap: 2px; flex-wrap: wrap; }
.habit-cell {
  width: 14px; height: 14px; border-radius: 2px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  transition: background var(--t-fast);
}
.habit-cell--done { background: var(--color-accent); border-color: var(--color-accent); opacity: 0.85; }
.habit-cell--today { border-color: var(--color-accent); box-shadow: 0 0 0 1px var(--color-accent); }

@media (max-width: 600px) {
  .habit-row__meta { min-width: 100%; flex: 0 0 100%; }
}
</style>
