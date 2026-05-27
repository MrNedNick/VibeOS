<script setup lang="ts">
import type { TaskFilter } from '../types'
import { useLocale } from '@/core/i18n'
import { UiBadge } from '@/ui'

interface Props {
  modelValue: TaskFilter
  totalCount: number
  activeCount: number
  doneCount: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: TaskFilter] }>()
const i18n = useLocale()

interface Tab { id: TaskFilter; labelKey: string }

const tabs: Tab[] = [
  { id: 'all',    labelKey: 'tasks.filterAll'    },
  { id: 'active', labelKey: 'tasks.filterActive' },
  { id: 'done',   labelKey: 'tasks.filterDone'   },
]

function getCount(id: TaskFilter): number {
  if (id === 'all')    return props.totalCount
  if (id === 'active') return props.activeCount
  return props.doneCount
}
</script>

<template>
  <div class="task-filters" role="tablist" :aria-label="i18n.t('tasks.filterAll')">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      role="tab"
      class="task-filters__tab"
      :class="{ 'task-filters__tab--active': modelValue === tab.id }"
      :aria-selected="modelValue === tab.id"
      @click="emit('update:modelValue', tab.id)"
    >
      {{ i18n.t(tab.labelKey) }}
      <UiBadge :variant="modelValue === tab.id ? 'accent' : 'default'">
        {{ getCount(tab.id) }}
      </UiBadge>
    </button>
  </div>
</template>

<style scoped>
.task-filters {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-sm);
  width: fit-content;
}

.task-filters__tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border-radius: var(--radius-xs);
  transition: background var(--t-fast), color var(--t-fast);
}

.task-filters__tab:hover:not(.task-filters__tab--active) {
  color: var(--color-text);
  background: var(--color-border);
}

.task-filters__tab--active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}
</style>
