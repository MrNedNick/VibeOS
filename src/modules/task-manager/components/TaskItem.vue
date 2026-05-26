<script setup lang="ts">
import type { Task } from '../types'
import { UiButton } from '@/ui'

interface Props {
  task: Task
}

defineProps<Props>()
const emit = defineEmits<{ toggle: [id: string]; delete: [id: string] }>()
</script>

<template>
  <div class="task-item" :class="{ 'task-item--done': task.done }">
    <button
      class="task-item__check"
      :aria-label="task.done ? 'Mark as active' : 'Mark as done'"
      @click="emit('toggle', task.id)"
    >
      <Transition name="check">
        <svg v-if="task.done" width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </Transition>
    </button>

    <span class="task-item__text">{{ task.text }}</span>

    <UiButton
      variant="danger"
      size="sm"
      class="task-item__delete"
      aria-label="Delete task"
      @click="emit('delete', task.id)"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </UiButton>
  </div>
</template>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: border-color var(--t-fast), background var(--t-fast);
}

.task-item:hover { border-color: var(--color-border-subtle); background: var(--color-surface-elevated); }
.task-item:hover .task-item__delete { opacity: 1; }

/* Checkbox */
.task-item__check {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-success);
  transition: border-color var(--t-fast), background var(--t-fast);
}

.task-item--done .task-item__check {
  background: var(--color-success);
  border-color: var(--color-success);
  color: #fff;
}

.task-item__check:hover:not(:disabled) {
  border-color: var(--color-success);
}

/* Text */
.task-item__text {
  flex: 1;
  font-size: 14px;
  color: var(--color-text);
  word-break: break-word;
  transition: color var(--t);
}

.task-item--done .task-item__text {
  color: var(--color-text-muted);
  text-decoration: line-through;
}

/* Delete */
.task-item__delete {
  opacity: 0;
  flex-shrink: 0;
  transition: opacity var(--t-fast) !important;
  padding: 0 6px !important;
}

/* Check icon animation */
.check-enter-active { transition: transform 150ms var(--ease-spring), opacity 150ms; }
.check-enter-from   { transform: scale(0); opacity: 0; }
</style>
