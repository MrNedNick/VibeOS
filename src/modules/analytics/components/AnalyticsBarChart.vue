<script setup lang="ts">
import { UiSectionLabel } from '@/ui'

interface BarItem {
  label: string
  value: number
  secondary: number
  tooltip: string
}

interface LegendItem {
  colorClass: string
  label: string
}

const props = defineProps<{
  title: string
  bars: BarItem[]
  legend: LegendItem[]
  emptyLabel: string
  fillClass?: string
}>()

function maxVal(): number {
  return Math.max(...props.bars.map(b => b.value), 1)
}
function pct(value: number): string {
  if (value === 0) return '0%'
  return `${Math.max((value / maxVal()) * 100, 3)}%`
}
function pctSecondary(value: number): string {
  if (value === 0) return '0%'
  return `${Math.max((value / maxVal()) * 100, 2)}%`
}
</script>

<template>
  <section class="analytics__section">
    <UiSectionLabel as="h2" class="analytics__section-label">{{ title }}</UiSectionLabel>

    <div v-if="bars.every(b => b.value === 0)" class="empty-state">{{ emptyLabel }}</div>

    <div v-else class="bar-chart" :class="{ 'bar-chart--single': legend.length === 1 }">
      <div class="bar-chart__bars">
        <div v-for="(bar, i) in bars" :key="i" class="bar-col" :title="bar.tooltip">
          <div class="bar-col__stack">
            <template v-if="bar.secondary > 0">
              <div class="bar-col__fill bar-col__fill--secondary" :style="{ height: pctSecondary(bar.secondary) }" />
              <div class="bar-col__fill bar-col__fill--primary" :style="{ height: pct(bar.value - bar.secondary) }" />
            </template>
            <div v-else class="bar-col__fill" :class="fillClass ?? 'bar-col__fill--primary'" :style="{ height: pct(bar.value) }" />
          </div>
          <span class="bar-col__label">{{ bar.label }}</span>
        </div>
      </div>
      <div class="bar-chart__legend">
        <template v-for="item in legend" :key="item.label">
          <span class="legend-dot" :class="item.colorClass" />
          <span>{{ item.label }}</span>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.analytics__section { display: flex; flex-direction: column; gap: 16px; }
.analytics__section-label { margin-bottom: 0; }
.empty-state { font-size: 13px; color: var(--color-text-muted); padding: 8px 0; }

.bar-chart {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.bar-chart__bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 100px;
}
.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
}
.bar-col__stack {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  justify-content: flex-start;
  gap: 1px;
}
.bar-col__fill {
  width: 100%;
  border-radius: 2px 2px 0 0;
  min-height: 2px;
  transition: height 0.3s ease;
}
.bar-col__fill--primary   { background: var(--color-accent); opacity: 0.4; }
.bar-col__fill--secondary { background: var(--color-accent); opacity: 0.9; }
.bar-col__fill--learning  { background: #a78bfa; opacity: 0.8; }
.bar-col__fill--training  { background: #34d399; opacity: 0.8; }
.bar-col__label { font-size: 9px; color: var(--color-text-muted); font-family: var(--font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; text-align: center; }

.bar-chart__legend { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.legend-dot--primary   { background: var(--color-accent); opacity: 0.4; }
.legend-dot--secondary { background: var(--color-accent); opacity: 0.9; }
.legend-dot--learning  { background: #a78bfa; opacity: 0.8; }
.legend-dot--training  { background: #34d399; opacity: 0.8; }
</style>
