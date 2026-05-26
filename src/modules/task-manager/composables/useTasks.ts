import { ref } from 'vue'
import { useTasksStore } from '../stores/tasks.store'
import { useNotificationsStore } from '@/core/stores/notifications.store'
import type { Task, TaskPriority } from '../types'

const MAX_LENGTH = 120

const PRIORITY_CYCLE: TaskPriority[] = ['none', 'low', 'medium', 'high', 'urgent']

export function useTasks() {
  const store = useTasksStore()
  const notify = useNotificationsStore()

  const inputText       = ref('')
  const inputPriority   = ref<TaskPriority>('none')
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
    store.addTask(text, inputPriority.value)
    inputText.value     = ''
    inputPriority.value = 'none'
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

  return {
    inputText,
    inputPriority,
    cyclePriority,
    submitTask,
    removeTask,
    clearCompleted,
    store,
    MAX_LENGTH,
  }
}
