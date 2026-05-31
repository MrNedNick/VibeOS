<script setup lang="ts">
import { useConfirm } from '@/core/composables/useConfirm'
import UiIcon from './UiIcon.vue'

const { isOpen, title, body, isDanger, confirmLabel, cancelLabel, accept, dismiss } = useConfirm()

function onBackdropKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') dismiss()
}

function onDialogKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); accept() }
  if (e.key === 'Escape') dismiss()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div
        v-if="isOpen"
        class="confirm-backdrop"
        role="presentation"
        @mousedown.self="dismiss"
        @keydown="onBackdropKeydown"
      >
        <div
          class="confirm-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title"
          @keydown="onDialogKeydown"
        >
          <!-- Icon -->
          <div class="confirm-modal__icon" :class="{ 'confirm-modal__icon--danger': isDanger }">
            <UiIcon :name="isDanger ? 'AlertTriangle' : 'HelpCircle'" :size="20" :stroke-width="1.8" />
          </div>

          <!-- Text -->
          <div class="confirm-modal__text">
            <h2 class="confirm-modal__title">{{ title }}</h2>
            <p v-if="body" class="confirm-modal__body">{{ body }}</p>
          </div>

          <!-- Actions -->
          <div class="confirm-modal__actions">
            <button class="confirm-btn confirm-btn--cancel" @click="dismiss">
              {{ cancelLabel }}
            </button>
            <button
              class="confirm-btn"
              :class="isDanger ? 'confirm-btn--danger' : 'confirm-btn--primary'"
              @click="accept"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-4), 0 0 0 1px rgba(255,255,255,0.04);
  width: 100%;
  max-width: 380px;
  padding: 24px 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.confirm-modal__icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-text-muted) 10%, transparent);
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.confirm-modal__icon--danger {
  background: color-mix(in srgb, #ef4444 12%, transparent);
  color: #ef4444;
}

.confirm-modal__text { display: flex; flex-direction: column; gap: 6px; }

.confirm-modal__title {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: var(--leading-2xl);
}

.confirm-modal__body {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: 0;
  line-height: var(--leading-sm);
}

.confirm-modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 4px;
}

.confirm-btn {
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--t-fast), background var(--t-fast);
  border: none;
}

.confirm-btn--cancel {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}
.confirm-btn--cancel:hover { background: var(--color-border); }

.confirm-btn--primary {
  background: var(--color-accent);
  color: #fff;
}
.confirm-btn--primary:hover { opacity: 0.88; }

.confirm-btn--danger {
  background: #ef4444;
  color: #fff;
}
.confirm-btn--danger:hover { opacity: 0.88; }

/* Transition */
.confirm-fade-enter-active { transition: opacity 140ms var(--ease); }
.confirm-fade-enter-active .confirm-modal { transition: transform 140ms var(--ease), opacity 140ms var(--ease); }
.confirm-fade-leave-active { transition: opacity 100ms var(--ease); }
.confirm-fade-leave-active .confirm-modal { transition: transform 100ms var(--ease), opacity 100ms var(--ease); }
.confirm-fade-enter-from { opacity: 0; }
.confirm-fade-enter-from .confirm-modal { transform: scale(0.95) translateY(6px); opacity: 0; }
.confirm-fade-leave-to { opacity: 0; }
.confirm-fade-leave-to .confirm-modal { transform: scale(0.97) translateY(3px); opacity: 0; }
</style>
