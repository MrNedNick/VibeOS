import { ref } from 'vue'
import { useFeedbackStore, type FeedbackEntry } from '@/core/stores/feedback.store'
import { useInteractionBus } from '@/core/stores/interaction.store'
import { useEventBus } from '@/core/events/index'
import type { UiFeedbackSubmittedEvent, UiFeedbackDismissedEvent, UiFeedbackTriggeredEvent } from '@/core/events/interaction.types'

const APP_VERSION = __APP_VERSION__

// 30 active-session-days threshold for repeat prompts
const REPEAT_AFTER_ACTIVE_DAYS = 30

export function useFeedback() {
  const store = useFeedbackStore()
  const bus   = useInteractionBus()
  const eventBus = useEventBus()

  const isOpen = ref(false)

  /** Returns true when the feedback modal should be auto-prompted. */
  function shouldPrompt(): boolean {
    if (store.dismissCount >= 2) return false
    if (store.activeDays.length < 3) return false
    if (eventBus.history.length < 5) return false

    if (store.lastSubmitted) {
      const lastDate = new Date(store.lastSubmitted)
      const activeSince = store.activeDays.filter(d => d > lastDate.toISOString().slice(0, 10))
      if (activeSince.length < REPEAT_AFTER_ACTIVE_DAYS) return false
    }

    return true
  }

  function markSubmitted(score: number, comment?: string): void {
    const sessionId = bus.recent(1, 'session:start')[0] !== undefined
      ? (bus.recent(1, 'session:start')[0] as { sessionId: string }).sessionId
      : 'unknown'

    const entry: FeedbackEntry = {
      id: crypto.randomUUID(),
      score,
      comment,
      timestamp: new Date().toISOString(),
      sessionId,
      appVersion: APP_VERSION,
    }
    store.addEntry(entry)
    isOpen.value = false

    const ev: UiFeedbackSubmittedEvent = {
      type: 'ui:feedback-submitted',
      score,
      hasComment: !!comment,
      timestamp: new Date().toISOString(),
    }
    bus.emit(ev)
  }

  function markDismissed(): void {
    store.incrementDismiss()
    isOpen.value = false

    const ev: UiFeedbackDismissedEvent = {
      type: 'ui:feedback-dismissed',
      dismissCount: store.dismissCount,
      timestamp: new Date().toISOString(),
    }
    bus.emit(ev)
  }

  function openManually(): void {
    isOpen.value = true
    const ev: UiFeedbackTriggeredEvent = {
      type: 'ui:feedback-triggered',
      trigger: 'manual',
      timestamp: new Date().toISOString(),
    }
    bus.emit(ev)
  }

  function checkAndPrompt(): void {
    if (shouldPrompt()) {
      isOpen.value = true
      const ev: UiFeedbackTriggeredEvent = {
        type: 'ui:feedback-triggered',
        trigger: 'auto',
        timestamp: new Date().toISOString(),
      }
      bus.emit(ev)
    }
  }

  /** Record today as an active day — call from navigationTracker or app init. */
  function recordToday(): void {
    store.recordActiveDay(new Date().toISOString().slice(0, 10))
  }

  return {
    isOpen,
    shouldPrompt,
    markSubmitted,
    markDismissed,
    openManually,
    checkAndPrompt,
    recordToday,
  }
}
