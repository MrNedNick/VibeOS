import { computed, ref } from 'vue'
import { storagGet, storageSet } from '@/core/utils/storage'

const DISMISSED_KEY = 'platform:install-prompt:dismissed'
const MIN_DELAY_MS = 15_000

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const deferredEvent = ref<BeforeInstallPromptEvent | null>(null)
const elapsed = ref(false)
const dismissed = ref(storagGet<boolean>(DISMISSED_KEY, false))

if ('serviceWorker' in navigator) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredEvent.value = e as BeforeInstallPromptEvent
  })
  window.addEventListener('appinstalled', () => {
    deferredEvent.value = null
  })
  setTimeout(() => { elapsed.value = true }, MIN_DELAY_MS)
}

/**
 * Surfaces the browser's `beforeinstallprompt` as a dismiss-once banner.
 * `canShow` only turns true once the browser has actually offered the
 * prompt, the app has been open a little while, and the user hasn't
 * dismissed it before (dismissal persists across sessions).
 */
export function useInstallPrompt() {
  const canShow = computed(() => deferredEvent.value !== null && elapsed.value && !dismissed.value)

  async function promptInstall() {
    const evt = deferredEvent.value
    if (!evt) return
    await evt.prompt()
    await evt.userChoice
    deferredEvent.value = null
  }

  function dismiss() {
    dismissed.value = true
    storageSet(DISMISSED_KEY, true)
  }

  return { deferredEvent, elapsed, dismissed, canShow, promptInstall, dismiss }
}
