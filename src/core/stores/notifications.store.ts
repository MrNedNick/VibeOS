import { defineStore } from 'pinia'
import { ref } from 'vue'
import { generateId } from '@/core/utils/id'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration: number
}

const DEFAULT_DURATION = 3500

export const useNotificationsStore = defineStore('core:notifications', () => {
  const items = ref<Notification[]>([])

  function push(type: NotificationType, message: string, duration = DEFAULT_DURATION): string {
    const id = generateId()
    items.value.push({ id, type, message, duration })
    if (duration > 0) setTimeout(() => dismiss(id), duration)
    return id
  }

  function dismiss(id: string) {
    const idx = items.value.findIndex(n => n.id === id)
    if (idx > -1) items.value.splice(idx, 1)
  }

  const success = (msg: string) => push('success', msg)
  const error   = (msg: string) => push('error', msg)
  const warning = (msg: string) => push('warning', msg)
  const info    = (msg: string) => push('info', msg)

  return { items, push, dismiss, success, error, warning, info }
})
