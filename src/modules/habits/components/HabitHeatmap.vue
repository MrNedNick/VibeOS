<script setup lang="ts">
import { computed } from 'vue'
import { generateHeatmapDates, todayStr } from '../types'

const props = defineProps<{
  completedDates: string[]
  weeks?: number
}>()

const WEEKS = computed(() => props.weeks ?? 16)
const today = todayStr()
const dateSet = computed(() => new Set(props.completedDates))
const grid = computed(() => generateHeatmapDates(WEEKS.value))

function cellTitle(date: string): string {
  const d = new Date(date + 'T00:00:00')
  const label = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  return dateSet.value.has(date) ? `✓ ${label}` : label
}
</script>

<template>
  <div class="heatmap">
    <div
      v-for="(week, wi) in grid"
      :key="wi"
      class="heatmap__week"
    >
      <div
        v-for="date in week"
        :key="date"
        class="heatmap__cell"
        :class="{
          'heatmap__cell--done': dateSet.has(date),
          'heatmap__cell--today': date === today,
          'heatmap__cell--future': date > today,
        }"
        :title="cellTitle(date)"
      />
    </div>
  </div>
</template>

<style scoped>
.heatmap {
  display: flex;
  gap: 2px;
}

.heatmap__week {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.heatmap__cell {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: var(--color-border);
  transition: background var(--t-fast), transform var(--t-fast);
  cursor: default;
}

.heatmap__cell:hover {
  transform: scale(1.2);
}

.heatmap__cell--done {
  background: var(--color-accent);
  opacity: 0.85;
}

.heatmap__cell--done.heatmap__cell--today {
  opacity: 1;
  box-shadow: 0 0 6px var(--color-accent);
}

.heatmap__cell--today:not(.heatmap__cell--done) {
  background: var(--color-border);
  outline: 1.5px solid var(--color-accent);
  outline-offset: 1px;
}

.heatmap__cell--future {
  opacity: 0.3;
}
</style>
