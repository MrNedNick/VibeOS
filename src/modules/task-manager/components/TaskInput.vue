<script setup lang="ts">
import type { TaskPriority } from '../types'
import { useLocale } from '@/core/i18n'
import { UiInput, UiButton } from '@/ui'

const i18n = useLocale()

interface Props {
  modelValue: string
  priority?: TaskPriority
  maxLength?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  priority: 'none',
  maxLength: 120,
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:priority':  [value: TaskPriority]
  submit: []
}>()

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  none:   '—',
  low:    'L',
  medium: 'M',
  high:   'H',
  urgent: '!',
}

const PRIORITY_TITLE = (p: TaskPriority) => ({
  none:   i18n.t('tasks.priorityNone'),
  low:    i18n.t('tasks.priorityLow'),
  medium: i18n.t('tasks.priorityMedium'),
  high:   i18n.t('tasks.priorityHigh'),
  urgent: i18n.t('tasks.priorityUrgent'),
}[p] ?? p)

const PRIORITY_CYCLE: TaskPriority[] = ['none', 'low', 'medium', 'high', 'urgent']

function cyclePriority() {
  const idx = PRIORITY_CYCLE.indexOf(props.priority)
  emit('update:priority', PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length])
}

const charCount = () => props.modelValue.length
const isNearLimit = () => charCount() > props.maxLength * 0.85
const isOverLimit = () => charCount() > props.maxLength
</script>

<template>
  <div class="task-input">
    <button
      class="priority-btn"
      :class="`priority-btn--${priority}`"
      :title="PRIORITY_TITLE(priority)"
      @click="cyclePriority"
    >{{ PRIORITY_LABEL[priority] }}</button>

    <div class="task-input__field">
      <UiInput
        :model-value="modelValue"
        :placeholder="i18n.t('tasks.inputPlaceholder')"
        :maxlength="maxLength + 10"
        autofocus
        @update:model-value="emit('update:modelValue', $event)"
        @enter="emit('submit')"
      />
      <span
        v-if="isNearLimit()"
        class="task-input__counter"
        :class="{ 'task-input__counter--over': isOverLimit() }"
      >{{ charCount() }}/{{ maxLength }}</span>
    </div>

    <UiButton
      :disabled="!modelValue.trim() || isOverLimit()"
      :loading="loading"
      @click="emit('submit')"
    >{{ i18n.t('tasks.inputAdd') }}</UiButton>
  </div>
</template>

<style scoped>
.task-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.task-input__field {
  flex: 1;
  position: relative;
}

.task-input__counter {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  pointer-events: none;
}
.task-input__counter--over { color: var(--color-danger); }

/* Priority button */
.priority-btn {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: var(--radius-xs);
  font-size: 12px;
  font-weight: 800;
  font-family: var(--font-mono);
  border: 1.5px solid var(--color-border);
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  transition: all var(--t-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}
.priority-btn:hover { border-color: var(--color-text-muted); color: var(--color-text); }

.priority-btn--low    { border-color: var(--color-success);              color: var(--color-success);              background: color-mix(in srgb, var(--color-success)              8%, transparent); }
.priority-btn--medium { border-color: var(--color-warning);              color: var(--color-warning);              background: color-mix(in srgb, var(--color-warning)              8%, transparent); }
.priority-btn--high   { border-color: var(--color-warning-dark, #f97316); color: var(--color-warning-dark, #f97316); background: color-mix(in srgb, var(--color-warning-dark, #f97316) 8%, transparent); }
.priority-btn--urgent { border-color: var(--color-danger);               color: var(--color-danger);               background: color-mix(in srgb, var(--color-danger)               12%, transparent); }
</style>
