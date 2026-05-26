import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import { generateId } from '@/core/utils/id'
import type { Task, TaskFilter } from '../types'

const STORAGE_KEY = storageKey('task-manager', 'tasks')

export const useTasksStore = defineStore('task-manager:tasks', () => {
  const tasks = useStorage<Task[]>(STORAGE_KEY, [])
  const filter = ref<TaskFilter>('all')

  const filteredTasks = computed<Task[]>(() => {
    if (filter.value === 'active') return tasks.value.filter(t => !t.done)
    if (filter.value === 'done')   return tasks.value.filter(t => t.done)
    return tasks.value
  })

  const activeCount = computed(() => tasks.value.filter(t => !t.done).length)
  const doneCount   = computed(() => tasks.value.filter(t => t.done).length)
  const totalCount  = computed(() => tasks.value.length)

  const progress = computed(() =>
    totalCount.value === 0 ? 0 : Math.round((doneCount.value / totalCount.value) * 100)
  )

  function addTask(text: string) {
    tasks.value.push({ id: generateId(), text: text.trim(), done: false, createdAt: Date.now() })
  }

  function toggleTask(id: string) {
    const task = tasks.value.find(t => t.id === id)
    if (task) task.done = !task.done
  }

  function deleteTask(id: string) {
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx > -1) tasks.value.splice(idx, 1)
  }

  function updateTask(id: string, text: string) {
    const task = tasks.value.find(t => t.id === id)
    if (task) task.text = text.trim()
  }

  function clearDone() {
    tasks.value = tasks.value.filter(t => !t.done)
  }

  function setFilter(value: TaskFilter) {
    filter.value = value
  }

  return {
    tasks,
    filter,
    filteredTasks,
    activeCount,
    doneCount,
    totalCount,
    progress,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    clearDone,
    setFilter,
  }
})
