import { ref } from 'vue'

export interface ConfirmOptions {
  title?:        string
  body?:         string
  danger?:       boolean
  confirmLabel?: string
  cancelLabel?:  string
}

// ── Singleton state (module-level so all callers share one instance) ──
const isOpen       = ref(false)
const title        = ref('')
const body         = ref('')
const isDanger     = ref(false)
const confirmLabel = ref('Confirm')
const cancelLabel  = ref('Cancel')

let _resolve: ((value: boolean) => void) | null = null

export function useConfirm() {
  function confirm(opts: ConfirmOptions = {}): Promise<boolean> {
    title.value        = opts.title        ?? 'Are you sure?'
    body.value         = opts.body         ?? ''
    isDanger.value     = opts.danger       ?? false
    confirmLabel.value = opts.confirmLabel ?? (opts.danger ? 'Delete' : 'Confirm')
    cancelLabel.value  = opts.cancelLabel  ?? 'Cancel'
    isOpen.value       = true

    return new Promise((resolve) => { _resolve = resolve })
  }

  function accept(): void {
    isOpen.value = false
    _resolve?.(true)
    _resolve = null
  }

  function dismiss(): void {
    isOpen.value = false
    _resolve?.(false)
    _resolve = null
  }

  return { isOpen, title, body, isDanger, confirmLabel, cancelLabel, confirm, accept, dismiss }
}
