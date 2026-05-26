<script setup lang="ts">
import type { ModuleMeta } from '@/core/registry/modules'

interface StatItem { label: string; value: string | number }

interface Props {
  module: ModuleMeta
  stats?: StatItem[]
}

defineProps<Props>()

const STATUS_LABEL: Record<string, string> = {
  available: 'active',
  wip: 'in progress',
  planned: 'planned',
}
</script>

<template>
  <div class="mod-card" :class="`mod-card--${module.status}`">
    <div class="mod-card__top">
      <span class="mod-card__icon">{{ module.icon }}</span>
      <span class="mod-card__status">{{ STATUS_LABEL[module.status] }}</span>
    </div>
    <p class="mod-card__name">{{ module.label }}</p>
    <p class="mod-card__desc">{{ module.description }}</p>

    <div v-if="stats && stats.length" class="mod-card__stats">
      <div v-for="s in stats" :key="s.label" class="mod-card__stat">
        <span class="mod-card__stat-value">{{ s.value }}</span>
        <span class="mod-card__stat-label">{{ s.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mod-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  transition: border-color var(--t-fast);
  min-height: 120px;
}

.mod-card--available {
  border-color: var(--color-border);
}
.mod-card--available:hover { border-color: var(--color-accent); }

.mod-card--planned,
.mod-card--wip { opacity: 0.55; }

.mod-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.mod-card__icon { font-size: 19px; }

.mod-card__status {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  background: var(--color-surface-elevated);
  color: var(--color-text-muted);
}

.mod-card--available .mod-card__status {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.mod-card__name {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.mod-card__desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
  flex: 1;
}

.mod-card__stats {
  display: flex;
  gap: 14px;
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
}

.mod-card__stat {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.mod-card__stat-value {
  font-size: 19px;
  font-weight: 700;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.mod-card__stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
