<script setup lang="ts">
import type { Task } from '../types'
import TaskItem from './TaskItem.vue'

interface Props {
  tasks: Task[]
  focusedId?: string | null
}

defineProps<Props>()
const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
  edit:   [id: string, text: string]
  focus:  [id: string]
}>()
</script>

<template>
  <div class="task-list">
    <TransitionGroup name="task" tag="div" class="task-list__items">
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :focused="task.id === focusedId"
        @click="emit('focus', task.id)"
        @toggle="emit('toggle', $event)"
        @delete="emit('delete', $event)"
        @edit="(id, text) => emit('edit', id, text)"
      />
    </TransitionGroup>

    <div v-if="tasks.length === 0" class="task-list__empty">
      <span class="task-list__empty-icon">✓</span>
      <p class="task-list__empty-title">Inbox zero.</p>
      <p class="task-list__empty-sub">Add something above to get started.</p>
    </div>
  </div>
</template>

<style scoped>
.task-list__items { display: flex; flex-direction: column; gap: 6px; }

.task-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 48px 0;
  color: var(--color-text-muted);
}

.task-list__empty-icon {
  font-size: 28px;
  opacity: 0.18;
  margin-bottom: 6px;
}

.task-list__empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0;
}

.task-list__empty-sub {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

/* List animations */
.task-enter-active { transition: all 200ms var(--ease-spring); }
.task-leave-active { transition: all 160ms var(--ease); position: absolute; width: 100%; }
.task-enter-from   { opacity: 0; transform: translateY(-6px) scale(0.98); }
.task-leave-to     { opacity: 0; transform: translateX(10px); }
.task-move         { transition: transform 200ms var(--ease); }
</style>
