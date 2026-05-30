import { ref } from 'vue'
import { useTasksStore } from '../stores/tasks.store'
import { useNotificationsStore } from '@/core/stores/notifications.store'
import type { Task, TaskPriority, TaskCategory } from '../types'

const MAX_LENGTH = 120

const PRIORITY_CYCLE: TaskPriority[] = ['none', 'low', 'medium', 'high', 'urgent']

export function useTasks() {
  const store = useTasksStore()
  const notify = useNotificationsStore()

  const inputText       = ref('')
  const inputPriority   = ref<TaskPriority>('none')
  const inputCategory   = ref<TaskCategory | undefined>(undefined)
  const inputGoalId     = ref<string>('')
  let   lastDeleted: Task | null = null

  function cyclePriority() {
    const idx = PRIORITY_CYCLE.indexOf(inputPriority.value)
    inputPriority.value = PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length]
  }

  function submitTask() {
    const text = inputText.value.trim()
    if (!text) return
    if (text.length > MAX_LENGTH) {
      notify.warning(`Task cannot exceed ${MAX_LENGTH} characters`)
      return
    }
    const duplicate = store.tasks.some(
      t => t.text.toLowerCase() === text.toLowerCase()
    )
    if (duplicate) {
      notify.warning('This task already exists')
      return
    }
    store.addTask(text, inputPriority.value, undefined, inputCategory.value, inputGoalId.value || undefined)
    inputText.value     = ''
    inputPriority.value = 'none'
    inputCategory.value = undefined
    inputGoalId.value   = ''
  }

  function removeTask(id: string) {
    lastDeleted = store.tasks.find(t => t.id === id) ?? null
    store.deleteTask(id)
    notify.push('info', 'Task removed', 4000, {
      label: 'Undo',
      fn: () => {
        if (lastDeleted) {
          store.tasks.unshift(lastDeleted)
          lastDeleted = null
        }
      },
    })
  }

  function clearCompleted() {
    const count = store.doneCount
    if (count === 0) return
    store.clearDone()
    notify.info(`Cleared ${count} completed task${count === 1 ? '' : 's'}`)
  }

  function exportTasks(format: 'csv' | 'json') {
    const tasks = store.tasks
    if (tasks.length === 0) {
      notify.warning('No tasks to export')
      return
    }

    let content: string
    let filename: string
    let type: string

    if (format === 'json') {
      content = JSON.stringify(tasks, null, 2)
      filename = 'tasks.json'
      type = 'application/json'
    } else {
      const header = 'id,text,done,priority,createdAt'
      const rows = tasks.map(t =>
        [t.id, `"${t.text.replace(/"/g, '""')}"`, t.done, t.priority, t.createdAt].join(',')
      )
      content = [header, ...rows].join('\n')
      filename = 'tasks.csv'
      type = 'text/csv'
    }

    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    notify.info(`Exported ${tasks.length} task${tasks.length === 1 ? '' : 's'} as ${format.toUpperCase()}`)
  }

  return {
    inputText,
    inputPriority,
    inputCategory,
    inputGoalId,
    cyclePriority,
    submitTask,
    removeTask,
    clearCompleted,
    exportTasks,
    store,
    MAX_LENGTH,
  }
}
