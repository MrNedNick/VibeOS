<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const {
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
} = defineProps<Props>()
</script>

<template>
  <button
    :type="type"
    class="ui-btn"
    :class="[`ui-btn--${variant}`, `ui-btn--${size}`, { 'ui-btn--loading': loading }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="ui-btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.ui-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast), color var(--t-fast), opacity var(--t-fast),
              box-shadow var(--t-fast), transform var(--t-fast);
  white-space: nowrap;
}

.ui-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* Sizes */
.ui-btn--sm { height: 28px; padding: 0 10px; font-size: var(--text-xs); }
.ui-btn--md { height: 34px; padding: 0 14px; }

/* Variants */
.ui-btn--primary {
  background: var(--color-accent);
  color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.ui-btn--primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-accent) 40%, transparent);
}
.ui-btn--primary:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: none;
}

.ui-btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
}
.ui-btn--ghost:hover:not(:disabled) {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.ui-btn--outline {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}
.ui-btn--outline:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.ui-btn--danger {
  background: transparent;
  color: var(--color-danger);
}
.ui-btn--danger:hover:not(:disabled) { background: rgba(239, 68, 68, 0.1); }

/* Spinner */
.ui-btn__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
