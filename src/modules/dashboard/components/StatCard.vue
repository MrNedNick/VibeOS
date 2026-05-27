<script setup lang="ts">
import { UiIcon } from '@/ui'

interface Props {
  icon?: string
  label: string
  value: string | number
  sub?: string
  progress?: number      // 0–100, renders a mini bar
  accent?: boolean
  clickable?: boolean
}

defineProps<Props>()
defineEmits<{ click: [] }>()
</script>

<template>
  <div
    class="widget"
    :class="{
      'widget--accent':    accent,
      'widget--clickable': clickable,
    }"
    @click="$emit('click')"
  >
    <div class="widget__header">
      <span class="widget__label">{{ label }}</span>
      <span v-if="icon" class="widget__icon">
        <UiIcon :name="icon" :size="14" :stroke-width="1.75" />
      </span>
    </div>

    <span class="widget__value">{{ value }}</span>

    <div v-if="progress !== undefined" class="widget__bar">
      <div
        class="widget__bar-fill"
        :class="{ 'widget__bar-fill--accent': accent }"
        :style="{ width: `${Math.min(100, progress)}%` }"
      />
    </div>

    <span v-if="sub" class="widget__sub">{{ sub }}</span>
  </div>
</template>

<style scoped>
.widget {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px 20px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  min-width: 0;
  transition: border-color var(--t-fast), background var(--t-fast);
}

.widget--clickable {
  cursor: pointer;
  user-select: none;
}
.widget--clickable:hover {
  border-color: var(--color-accent);
  background: var(--color-surface-elevated);
}
.widget--clickable:active { opacity: 0.85; }

.widget--accent {
  border-color: var(--color-accent);
  background: var(--color-accent-muted);
}

.widget__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.widget__label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.widget__icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.widget--accent .widget__icon { color: var(--color-accent); opacity: 0.7; }

.widget__value {
  font-size: 30px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  margin-top: 4px;
}
.widget--accent .widget__value { color: var(--color-accent); }

.widget__bar {
  height: 3px;
  background: var(--color-border);
  border-radius: 99px;
  overflow: hidden;
  margin-top: 2px;
}

.widget__bar-fill {
  height: 100%;
  background: var(--color-text-muted);
  border-radius: 99px;
  transition: width 600ms var(--ease-out);
}
.widget__bar-fill--accent { background: var(--color-accent); }

.widget__sub {
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}
</style>
