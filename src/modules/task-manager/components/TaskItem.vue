<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import type { Task } from '../types'
import { classifyTaskDueDate } from '../types'
import { UiButton } from '@/ui'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'

const goalsStore = useGoalsStore()

interface Props {
  task: Task
  focused?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggle:      [id: string]
  delete:      [id: string]
  edit:        [id: string, text: string]
  setDueDate:  [id: string, date: string | undefined]
}>()

const linkedGoalTitle = computed(() =>
  props.task.linkedGoalId
    ? (goalsStore.goals.find(g => g.id === props.task.linkedGoalId)?.title ?? null)
    : null
)

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const isEditing   = ref(false)
const editText    = ref('')
const editInputRef = ref<HTMLInputElement>()

async function startEdit() {
  if (props.task.done) return
  isEditing.value = true
  editText.value  = props.task.text
  await nextTick()
  editInputRef.value?.select()
}

function commitEdit() {
  const text = editText.value.trim()
  if (text && text !== props.task.text) emit('edit', props.task.id, text)
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}
</script>

<template>
  <div class="task-item" :class="{ 'task-item--done': task.done, 'task-item--editing': isEditing, 'task-item--focused': focused }">
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

    <template v-if="isEditing">
      <input
        ref="editInputRef"
        v-model="editText"
        class="task-item__edit-input"
        maxlength="120"
        @keydown.enter="commitEdit"
        @keydown.esc="cancelEdit"
        @blur="commitEdit"
      />
    </template>
    <template v-else>
      <span
        v-if="task.priority && task.priority !== 'none'"
        class="task-item__priority"
        :class="`task-item__priority--${task.priority}`"
        :title="task.priority"
      />
      <span
        class="task-item__text"
        :title="task.done ? '' : 'Double-click to edit'"
        @dblclick="startEdit"
      >{{ task.text }}</span>

      <!-- Category badge -->
      <span
        v-if="task.category"
        class="task-item__cat"
        :class="`task-item__cat--${task.category}`"
      >{{ task.category }}</span>

      <!-- Due date badge -->
      <span
        v-if="task.dueDate && !task.done"
        class="task-item__due"
        :class="`task-item__due--${classifyTaskDueDate(task.dueDate)}`"
        :title="task.dueDate"
      >{{ fmtDate(task.dueDate) }}</span>

      <!-- Linked goal chip -->
      <span
        v-if="linkedGoalTitle"
        class="task-item__goal"
        :title="`Linked to goal: ${linkedGoalTitle}`"
      >🎯 {{ linkedGoalTitle }}</span>
    </template>

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
.task-item--editing { border-color: var(--color-accent); background: var(--color-surface-elevated); }
.task-item--focused:not(.task-item--editing) { border-color: var(--color-accent); outline: 2px solid var(--color-accent-muted); }

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

/* Priority dot */
.task-item__priority {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.task-item__priority--low    { background: #4ade80; }
.task-item__priority--medium { background: var(--color-warning); }
.task-item__priority--high   { background: #f97316; }
.task-item__priority--urgent { background: var(--color-danger); }

/* Text */
.task-item__text {
  flex: 1;
  font-size: 17px;
  color: var(--color-text);
  word-break: break-word;
  transition: color var(--t);
  cursor: text;
}

.task-item--done .task-item__text {
  color: var(--color-text-muted);
  text-decoration: line-through;
  cursor: default;
}

/* Edit input */
.task-item__edit-input {
  flex: 1;
  font-size: 17px;
  font-family: inherit;
  color: var(--color-text);
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  min-width: 0;
}

/* Category badge */
.task-item__cat {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  border-radius: 3px;
  flex-shrink: 0;
  white-space: nowrap;
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
}
.task-item__cat--work     { color: #3b82f6; background: rgba(59,130,246,.1); border-color: rgba(59,130,246,.25); }
.task-item__cat--learning { color: #8b5cf6; background: rgba(139,92,246,.1); border-color: rgba(139,92,246,.25); }
.task-item__cat--training { color: #f97316; background: rgba(249,115,22,.1); border-color: rgba(249,115,22,.25); }
.task-item__cat--personal { color: #10b981; background: rgba(16,185,129,.1); border-color: rgba(16,185,129,.25); }
.task-item__cat--goal     { color: var(--color-accent); background: var(--color-accent-muted); border-color: var(--color-accent-muted); }

/* Due date badge */
.task-item__due {
  font-size: 11px;
  font-family: var(--font-mono);
  padding: 2px 6px;
  border-radius: 3px;
  flex-shrink: 0;
  white-space: nowrap;
}
.task-item__due--overdue  { background: color-mix(in srgb, #ef4444 12%, transparent); color: #ef4444; }
.task-item__due--today    { background: color-mix(in srgb, #f59e0b 12%, transparent); color: #f59e0b; }
.task-item__due--upcoming { color: var(--color-text-muted); }

/* Linked goal chip */
.task-item__goal {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 3px;
  flex-shrink: 0;
  white-space: nowrap;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-accent);
  background: var(--color-accent-muted);
  border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
}

/* Delete */
.task-item__delete {
  opacity: 0;
  flex-shrink: 0;
  transition: opacity var(--t-fast) !important;
  padding: 0 6px !important;
}

.task-item--editing .task-item__delete { opacity: 1; }

/* Check icon animation */
.check-enter-active { transition: transform 150ms var(--ease-spring), opacity 150ms; }
.check-enter-from   { transform: scale(0); opacity: 0; }
</style>
