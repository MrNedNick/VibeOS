<script setup lang="ts">
import { useToast } from '@/core/composables/useToast'
import UiIcon from './UiIcon.vue'

const { toasts, dismiss } = useToast()

const ICONS: Record<string, string> = {
  success: 'CheckCircle',
  error:   'XCircle',
  info:    'Info',
  warning: 'AlertTriangle',
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast" tag="div" class="toast-stack">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="`toast--${t.type}`"
          role="alert"
          @click="dismiss(t.id)"
        >
          <UiIcon :name="ICONS[t.type]" :size="16" :stroke-width="2" class="toast__icon" />
          <span class="toast__msg">{{ t.message }}</span>
          <button class="toast__close" :aria-label="'Dismiss'" @click.stop="dismiss(t.id)">
            <UiIcon name="X" :size="13" :stroke-width="2.5" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  /* Desktop: top-right below the header */
  top: calc(var(--header-height, 52px) + 12px);
  right: 16px;
  z-index: 9999;
  pointer-events: none;
}

.toast-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px 11px 12px;
  border-radius: var(--radius-lg);
  border: 1px solid transparent;
  min-width: 260px;
  max-width: 380px;
  pointer-events: all;
  cursor: pointer;
  box-shadow: var(--shadow-3);
  backdrop-filter: blur(8px);
  transition: box-shadow var(--t-fast);
}
.toast:hover { box-shadow: var(--shadow-4); }

/* Type variants */
.toast--success {
  background: color-mix(in srgb, var(--color-success) 12%, var(--color-surface));
  border-color: color-mix(in srgb, var(--color-success) 35%, var(--color-border));
}
.toast--success .toast__icon { color: var(--color-success); }

.toast--error {
  background: color-mix(in srgb, var(--color-danger) 12%, var(--color-surface));
  border-color: color-mix(in srgb, var(--color-danger) 35%, var(--color-border));
}
.toast--error .toast__icon { color: var(--color-danger); }

.toast--info {
  background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface));
  border-color: color-mix(in srgb, var(--color-accent) 30%, var(--color-border));
}
.toast--info .toast__icon { color: var(--color-accent); }

.toast--warning {
  background: color-mix(in srgb, var(--color-warning) 12%, var(--color-surface));
  border-color: color-mix(in srgb, var(--color-warning) 35%, var(--color-border));
}
.toast--warning .toast__icon { color: var(--color-warning); }

.toast__icon { flex-shrink: 0; }

.toast__msg {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  line-height: var(--leading-md);
}

.toast__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-xs);
  color: var(--color-text-muted);
  background: transparent;
  transition: background var(--t-fast), color var(--t-fast);
}
.toast__close:hover {
  background: color-mix(in srgb, var(--color-text) 10%, transparent);
  color: var(--color-text);
}

/* Transitions */
.toast-enter-active { transition: opacity 200ms ease, transform 200ms ease; }
.toast-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.toast-enter-from   { opacity: 0; transform: translateX(20px); }
.toast-leave-to     { opacity: 0; transform: translateX(20px); }
.toast-move         { transition: transform 200ms ease; }

/* Mobile: bottom-center above tab bar */
@media (max-width: 767px) {
  .toast-container {
    top: unset;
    right: unset;
    bottom: calc(var(--tab-bar-height, 64px) + env(safe-area-inset-bottom, 0px) + 12px);
    left: 50%;
    transform: translateX(-50%);
  }
  .toast-stack { align-items: center; }
  .toast {
    min-width: min(320px, calc(100vw - 32px));
    max-width: calc(100vw - 32px);
  }
  .toast-enter-from { transform: translateY(12px); }
  .toast-leave-to   { transform: translateY(12px); }
}
</style>
