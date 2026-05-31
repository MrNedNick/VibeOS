<script setup lang="ts">
import UiIcon from './UiIcon.vue'

withDefaults(defineProps<{
  /** The big number or string to display */
  value: string | number
  /** The small label below the value */
  label: string
  /** Optional Lucide icon name shown above the value */
  icon?: string
  /** Render value in monospace font */
  mono?: boolean
  /** Value color; defaults to var(--color-text) */
  color?: 'default' | 'accent' | 'success' | 'danger' | 'warning' | 'muted'
  /** Alignment of the whole stat */
  align?: 'left' | 'center' | 'right'
  /** Font size of the value */
  size?: 'sm' | 'md' | 'lg'
}>(), {
  mono:  false,
  color: 'default',
  align: 'left',
  size:  'md',
})
</script>

<template>
  <div class="ui-stat" :class="`ui-stat--align-${align}`">
    <span v-if="icon" class="ui-stat__icon">
      <UiIcon :name="icon" :size="16" :stroke-width="1.75" />
    </span>
    <span
      class="ui-stat__value"
      :class="[
        `ui-stat__value--${size}`,
        `ui-stat__value--${color}`,
        { 'ui-stat__value--mono': mono },
      ]"
    >{{ value }}</span>
    <span class="ui-stat__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.ui-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ui-stat--align-left   { align-items: flex-start; }
.ui-stat--align-center { align-items: center; }
.ui-stat--align-right  { align-items: flex-end; }

/* Icon */
.ui-stat__icon {
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

/* Value */
.ui-stat__value {
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.ui-stat__value--sm { font-size: var(--text-lg); }   /* 18px */
.ui-stat__value--md { font-size: var(--text-2xl); }  /* 24px */
.ui-stat__value--lg { font-size: var(--text-3xl); }  /* 27px */

.ui-stat__value--mono { font-family: var(--font-mono); letter-spacing: -0.03em; }

/* Color variants */
.ui-stat__value--default { color: var(--color-text); }
.ui-stat__value--accent  { color: var(--color-accent); }
.ui-stat__value--success { color: var(--color-success); }
.ui-stat__value--danger  { color: var(--color-danger); }
.ui-stat__value--warning { color: var(--color-warning); }
.ui-stat__value--muted   { color: var(--color-text-muted); }

/* Label */
.ui-stat__label {
  font-size: var(--text-2xs);
  color: var(--color-text-muted);
  font-weight: 500;
}
</style>
