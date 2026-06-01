<script setup lang="ts">
import { useConfirm } from '@/core/composables/useConfirm'
import UiModal from './UiModal.vue'
import UiIcon from './UiIcon.vue'

const { isOpen, title, body, isDanger, confirmLabel, cancelLabel, accept, dismiss } = useConfirm()

function onDialogKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); accept() }
}
</script>

<template>
  <UiModal v-model:open="isOpen" size="sm" @close="dismiss">
    <template #header>
      <div class="confirm-header">
        <div class="confirm-header__icon" :class="{ 'confirm-header__icon--danger': isDanger }">
          <UiIcon :name="isDanger ? 'AlertTriangle' : 'HelpCircle'" :size="20" :stroke-width="1.8" />
        </div>
        <h2 class="confirm-header__title">{{ title }}</h2>
      </div>
    </template>

    <template #body>
      <div @keydown="onDialogKeydown">
        <p v-if="body" class="confirm-body">{{ body }}</p>
        <p v-else class="confirm-body confirm-body--empty" aria-hidden="true" />
      </div>
    </template>

    <template #footer>
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
    </template>
  </UiModal>
</template>

<style scoped>
.confirm-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.confirm-header__icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-text-muted) 10%, transparent);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.confirm-header__icon--danger {
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
}

.confirm-header__title {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: var(--leading-2xl);
}

.confirm-body {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: 0;
  line-height: var(--leading-sm);
  min-height: 0;
}

.confirm-body--empty { display: none; }

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
.confirm-btn--cancel:hover {
  background: color-mix(in srgb, var(--color-text-muted) 12%, var(--color-surface-elevated));
}

.confirm-btn--primary {
  background: var(--color-accent);
  color: #fff;
}
.confirm-btn--primary:hover { opacity: 0.88; }

.confirm-btn--danger {
  background: var(--color-danger);
  color: #fff;
}
.confirm-btn--danger:hover { opacity: 0.88; }
</style>
