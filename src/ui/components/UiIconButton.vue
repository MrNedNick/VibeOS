<script setup lang="ts">
import UiIcon from './UiIcon.vue'

interface Props {
  name: string
  ariaLabel: string
  size?: 'sm' | 'md'
  variant?: 'ghost' | 'danger' | 'subtle'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const {
  size = 'md',
  variant = 'ghost',
  loading = false,
  disabled = false,
  type = 'button',
} = defineProps<Props>()
</script>

<template>
  <button
    :type="type"
    class="ui-icon-btn"
    :class="[`ui-icon-btn--${size}`, `ui-icon-btn--${variant}`, { 'ui-icon-btn--loading': loading }]"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
  >
    <span v-if="loading" class="ui-icon-btn__spinner" aria-hidden="true" />
    <UiIcon v-else :name="name" :size="size === 'sm' ? 14 : 16" />
  </button>
</template>

<style scoped>
.ui-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: background var(--t-fast), color var(--t-fast), opacity var(--t-fast);
}

.ui-icon-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* Sizes */
.ui-icon-btn--sm { width: 26px; height: 26px; }
.ui-icon-btn--md { width: 32px; height: 32px; }

/* Variants */
.ui-icon-btn--ghost {
  background: transparent;
  color: var(--color-text-muted);
}
.ui-icon-btn--ghost:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-text-muted) 10%, transparent);
  color: var(--color-text);
}

.ui-icon-btn--subtle {
  background: color-mix(in srgb, var(--color-text-muted) 6%, transparent);
  color: var(--color-text-secondary);
}
.ui-icon-btn--subtle:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-text-muted) 14%, transparent);
  color: var(--color-text);
}

.ui-icon-btn--danger {
  background: transparent;
  color: var(--color-danger);
}
.ui-icon-btn--danger:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
}

/* Spinner */
.ui-icon-btn__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
