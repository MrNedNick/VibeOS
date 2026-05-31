<script setup lang="ts">
import { computed } from 'vue'
import type { TaskFilter } from '../types'
import { useLocale } from '@/core/i18n'
import { UiFilterChips } from '@/ui'
import type { FilterChipOption } from '@/ui'

interface Props {
  modelValue: TaskFilter
  totalCount: number
  activeCount: number
  doneCount: number
  todayCount: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: TaskFilter] }>()
const i18n = useLocale()

interface Tab { id: TaskFilter; labelKey: string }

const tabs: Tab[] = [
  { id: 'all',    labelKey: 'tasks.filterAll'    },
  { id: 'today',  labelKey: 'tasks.filterToday'  },
  { id: 'active', labelKey: 'tasks.filterActive' },
  { id: 'done',   labelKey: 'tasks.filterDone'   },
]

function getCount(id: TaskFilter): number {
  if (id === 'all')    return props.totalCount
  if (id === 'today')  return props.todayCount
  if (id === 'active') return props.activeCount
  return props.doneCount
}

const tabOptions = computed<FilterChipOption[]>(() =>
  tabs.map(tab => ({
    value: tab.id,
    label: i18n.t(tab.labelKey),
    count: getCount(tab.id),
  }))
)
</script>

<template>
  <UiFilterChips
    :model-value="modelValue"
    :options="tabOptions"
    variant="tabs"
    @update:model-value="emit('update:modelValue', $event as TaskFilter)"
  />
</template>

<style scoped>
</style>
