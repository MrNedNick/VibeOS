<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}
defineProps<Props>()
</script>

<template>
  <div class="stat-card" :class="{ 'stat-card--accent': accent }">
    <span class="stat-card__value">{{ value }}</span>
    <span class="stat-card__label">{{ label }}</span>
    <span v-if="sub" class="stat-card__sub">{{ sub }}</span>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 16px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  min-width: 0;
}

.stat-card--accent { border-color: var(--color-accent); background: var(--color-accent-muted); }

.stat-card__value {
  font-size: 30px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.stat-card--accent .stat-card__value { color: var(--color-accent); }

.stat-card__label {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-card__sub {
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  margin-top: 4px;
}
</style>
