<script setup lang="ts">
import { useNotificationsStore } from '@/core/stores/notifications.store'

const store = useNotificationsStore()

const ICONS: Record<string, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}
</script>

<template>
  <Teleport to="body">
    <div class="notif-stack" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="notif">
        <div
          v-for="n in store.items"
          :key="n.id"
          class="notif"
          :class="`notif--${n.type}`"
          role="alert"
        >
          <span class="notif__icon">{{ ICONS[n.type] }}</span>
          <span class="notif__msg">{{ n.message }}</span>
          <button
            v-if="n.action"
            class="notif__action"
            @click="n.action.fn(); store.dismiss(n.id)"
          >{{ n.action.label }}</button>
          <button class="notif__close" :aria-label="`Dismiss: ${n.message}`" @click="store.dismiss(n.id)">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.notif-stack {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.notif {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  min-width: 260px;
  max-width: 380px;
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  font-size: 14px;
  font-weight: 500;
  pointer-events: all;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
}

.notif--success { border-left: 3px solid var(--color-success); }
.notif--error   { border-left: 3px solid var(--color-danger);  }
.notif--warning { border-left: 3px solid var(--color-warning); }
.notif--info    { border-left: 3px solid var(--color-info);    }

.notif--success .notif__icon { color: var(--color-success); }
.notif--error   .notif__icon { color: var(--color-danger);  }
.notif--warning .notif__icon { color: var(--color-warning); }
.notif--info    .notif__icon { color: var(--color-info);    }

.notif__icon { font-size: 13px; flex-shrink: 0; font-family: var(--font-mono); }
.notif__msg  { flex: 1; color: var(--color-text); }

.notif__action {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-accent);
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  transition: background var(--t-fast);
}
.notif__action:hover { background: var(--color-accent-muted); }

.notif__close {
  color: var(--color-text-muted);
  font-size: 11px;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity var(--t-fast);
}
.notif__close:hover { opacity: 1; }

/* Transition */
.notif-enter-active { transition: all 220ms var(--ease-spring); }
.notif-leave-active { transition: all 180ms var(--ease); }
.notif-enter-from   { opacity: 0; transform: translateX(24px) scale(0.96); }
.notif-leave-to     { opacity: 0; transform: translateX(24px) scale(0.96); }
.notif-move         { transition: transform 200ms var(--ease); }
</style>
