import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

// Module-level state — shared across all components, no Pinia needed
let _nextId = 0
const _toasts = reactive<Toast[]>([])

export function useToast() {
  function dismiss(id: number): void {
    const i = _toasts.findIndex(t => t.id === id)
    if (i !== -1) _toasts.splice(i, 1)
  }

  function add(type: ToastType, message: string, duration = 3500): void {
    // Cap at 3 visible toasts — drop oldest if over limit
    if (_toasts.length >= 3) _toasts.shift()
    const id = ++_nextId
    _toasts.push({ id, type, message })
    setTimeout(() => dismiss(id), duration)
  }

  return {
    toasts: _toasts,
    success: (msg: string, duration?: number) => add('success', msg, duration),
    error:   (msg: string, duration?: number) => add('error',   msg, duration),
    info:    (msg: string, duration?: number) => add('info',    msg, duration),
    warning: (msg: string, duration?: number) => add('warning', msg, duration),
    dismiss,
  }
}
