<script setup lang="ts">
interface Props {
  variant?: 'default' | 'accent' | 'success' | 'danger' | 'warning'
}
const { variant = 'default' } = defineProps<Props>()
</script>

<template>
  <span class="ui-badge" :class="`ui-badge--${variant}`">
    <slot />
  </span>
</template>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: var(--text-2xs);
  font-weight: 600;
  border-radius: 99px;
  line-height: 1;
}

.ui-badge--default  { background: var(--color-surface-elevated); color: var(--color-text-secondary); }
.ui-badge--accent   { background: var(--color-accent-muted);      color: var(--color-accent); }
.ui-badge--success  { background: rgba(34, 197, 94, 0.12);        color: var(--color-success); }
.ui-badge--danger   { background: rgba(239, 68, 68, 0.12);        color: var(--color-danger); }
.ui-badge--warning  { background: rgba(245, 158, 11, 0.12);       color: var(--color-warning); }
</style>
