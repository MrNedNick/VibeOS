import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useSoftDeletable } from '@/core/composables/useSoftDeletable'
import { storageKey } from '@/core/utils/storage'
import { generateId } from '@/core/utils/id'
import { useEventBus } from '@/core/events'
import type { Task, TaskFilter, TaskPriority, TaskCategory } from '../types'

const STORAGE_KEY = storageKey('task-manager', 'tasks')

export const useTasksStore = defineStore('task-manager:tasks', () => {
  const { all: allTasks, items: tasks, softDelete } = useSoftDeletable<Task>(STORAGE_KEY)
  const filter = ref<TaskFilter>('all')
  const categoryFilter = ref<TaskCategory | 'all'>('all')
  const events = useEventBus()

  const filteredTasks = computed<Task[]>(() => {
    const today = new Date().toISOString().slice(0, 10)
    let result = tasks.value
    if (filter.value === 'active') result = result.filter(t => !t.done)
    else if (filter.value === 'done') result = result.filter(t => t.done)
    else if (filter.value === 'today') result = result.filter(t => !t.done && t.dueDate === today)
    if (categoryFilter.value !== 'all') result = result.filter(t => t.category === categoryFilter.value)
    return result
  })

  const activeCount = computed(() => tasks.value.filter(t => !t.done).length)
  const doneCount   = computed(() => tasks.value.filter(t => t.done).length)
  const totalCount  = computed(() => tasks.value.length)
  const todayCount  = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return tasks.value.filter(t => !t.done && t.dueDate === today).length
  })

  const progress = computed(() =>
    totalCount.value === 0 ? 0 : Math.round((doneCount.value / totalCount.value) * 100)
  )

  const doneThisWeek = computed(() => {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sun
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Monday = start
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - diff)
    weekStart.setHours(0, 0, 0, 0)
    const weekStartIso = weekStart.toISOString()
    return tasks.value.filter(t => t.done && t.completedAt && t.completedAt >= weekStartIso).length
  })

  function addTask(text: string, priority: TaskPriority = 'none', dueDate?: string, category?: TaskCategory, linkedGoalId?: string) {
    const id = generateId()
    allTasks.value.push({ id, text: text.trim(), done: false, priority, dueDate, category, linkedGoalId, createdAt: Date.now() })
    events.emit({ type: 'task:created', taskId: id, label: text.trim(), timestamp: new Date().toISOString() })
  }

  function setDueDate(id: string, date: string | undefined) {
    const task = allTasks.value.find(t => t.id === id)
    if (task) task.dueDate = date
  }

  function toggleTask(id: string) {
    const task = allTasks.value.find(t => t.id === id)
    if (!task) return
    task.done = !task.done
    if (task.done) {
      task.completedAt = new Date().toISOString()
      events.emit({ type: 'task:completed', taskId: id, label: task.text, timestamp: task.completedAt })
    } else {
      task.completedAt = undefined
    }
  }

  function deleteTask(id: string) {
    const task = allTasks.value.find(t => t.id === id)
    if (task && !task.deletedAt) {
      softDelete(id)
      events.emit({ type: 'task:deleted', taskId: id, label: task.text, timestamp: new Date().toISOString() })
    }
  }

  function updateTask(id: string, text: string) {
    const task = allTasks.value.find(t => t.id === id)
    if (task) task.text = text.trim()
  }

  function clearDone() {
    // Soft-delete done tasks so the removal syncs as a tombstone, not a gap.
    for (const t of allTasks.value) {
      if (t.done && !t.deletedAt) softDelete(t.id)
    }
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
    todayCount,
    progress,
    doneThisWeek,
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
