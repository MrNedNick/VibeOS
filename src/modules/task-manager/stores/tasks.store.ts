import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import { generateId } from '@/core/utils/id'
import { useEventBus } from '@/core/events'
import type { Task, TaskFilter, TaskPriority, TaskCategory } from '../types'

const STORAGE_KEY = storageKey('task-manager', 'tasks')

export const useTasksStore = defineStore('task-manager:tasks', () => {
  const tasks = useStorage<Task[]>(STORAGE_KEY, [])
  const filter = ref<TaskFilter>('all')
  const categoryFilter = ref<TaskCategory | 'all'>('all')
  const events = useEventBus()

  const filteredTasks = computed<Task[]>(() => {
    let result = tasks.value
    if (filter.value === 'active') result = result.filter(t => !t.done)
    else if (filter.value === 'done') result = result.filter(t => t.done)
    if (categoryFilter.value !== 'all') result = result.filter(t => t.category === categoryFilter.value)
    return result
  })

  const activeCount = computed(() => tasks.value.filter(t => !t.done).length)
  const doneCount   = computed(() => tasks.value.filter(t => t.done).length)
  const totalCount  = computed(() => tasks.value.length)

  const progress = computed(() =>
    totalCount.value === 0 ? 0 : Math.round((doneCount.value / totalCount.value) * 100)
  )

  function addTask(text: string, priority: TaskPriority = 'none', dueDate?: string, category?: TaskCategory) {
    const id = generateId()
    tasks.value.push({ id, text: text.trim(), done: false, priority, dueDate, category, createdAt: Date.now() })
    events.emit({ type: 'task:created', taskId: id, label: text.trim(), timestamp: new Date().toISOString() })
  }

  function setDueDate(id: string, date: string | undefined) {
    const task = tasks.value.find(t => t.id === id)
    if (task) task.dueDate = date
  }

  function toggleTask(id: string) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return
    task.done = !task.done
    if (task.done) {
      events.emit({ type: 'task:completed', taskId: id, label: task.text, timestamp: new Date().toISOString() })
    }
  }

  function deleteTask(id: string) {
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx > -1) {
      const label = tasks.value[idx].text
      tasks.value.splice(idx, 1)
      events.emit({ type: 'task:deleted', taskId: id, label, timestamp: new Date().toISOString() })
    }
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

  function setCategoryFilter(value: TaskCategory | 'all') {
    categoryFilter.value = value
  }

  return {
    tasks,
    filter,
    categoryFilter,
    filteredTasks,
    activeCount,
    doneCount,
    totalCount,
    progress,
    addTask,
    toggleTask,
    updateTask,
    setDueDate,
    deleteTask,
    clearDone,
    setFilter,
    setCategoryFilter,
  }
})
