import { ref } from 'vue'
import { useTasksStore } from '../stores/tasks.store'
import { useNotificationsStore } from '@/core/stores/notifications.store'

const MAX_LENGTH = 120

export function useTasks() {
  const store = useTasksStore()
  const notify = useNotificationsStore()

  const inputText = ref('')

  function submitTask() {
    const text = inputText.value.trim()
    if (!text) return
    if (text.length > MAX_LENGTH) {
      notify.warning(`Task cannot exceed ${MAX_LENGTH} characters`)
      return
    }
    store.addTask(text)
    inputText.value = ''
  }

  function removeTask(id: string) {
    store.deleteTask(id)
    notify.info('Task removed')
  }

  function clearCompleted() {
    const count = store.doneCount
    if (count === 0) return
    store.clearDone()
    notify.info(`Cleared ${count} completed task${count === 1 ? '' : 's'}`)
  }

  return {
    inputText,
    submitTask,
    removeTask,
    clearCompleted,
    store,
    MAX_LENGTH,
  }
}
