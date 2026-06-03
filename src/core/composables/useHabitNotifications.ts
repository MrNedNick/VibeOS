import { ref, watch, onUnmounted } from 'vue'
import { useStorage } from './useStorage'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { computeStreak } from '@/modules/habits/types'

const notifiedToday = useStorage<string>('platform:habits:notified-date', '')

export function useHabitNotifications() {
  const enabled = useStorage<boolean>('platform:habits:notifications', false)
  const permission = ref<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  )

  async function requestPermission(): Promise<boolean> {
    if (typeof Notification === 'undefined') return false
    const result = await Notification.requestPermission()
    permission.value = result
    return result === 'granted'
  }

  async function enable(): Promise<void> {
    const granted = await requestPermission()
    enabled.value = granted
  }

  function disable(): void {
    enabled.value = false
  }

  function checkAndNotify(): void {
    if (!enabled.value || permission.value !== 'granted') return
    const today = new Date().toISOString().split('T')[0]
    if (notifiedToday.value === today) return

    const hour = new Date().getHours()
    if (hour < 21) return

    const habitsStore = useHabitsStore()
    const atRisk = habitsStore.habits.filter(h => {
      if (h.completedDates.includes(today)) return false
      const streak = computeStreak(h.completedDates, h.skippedDates ?? [])
      return streak >= 2
    })

    if (!atRisk.length) { notifiedToday.value = today; return }

    const names = atRisk.map(h => `${h.emoji} ${h.name}`).join(', ')
    new Notification('⚠️ Habit streak at risk', {
      body:    `${atRisk.length === 1 ? 'This habit is' : `${atRisk.length} habits are`} at risk today: ${names}`,
      icon:    '/favicon.ico',
      tag:     'habit-streak-risk',
    })
    notifiedToday.value = today
  }

  // Poll every 5 min while app is open
  let interval: ReturnType<typeof setInterval> | null = null

  function startPolling(): void {
    if (interval) return
    interval = setInterval(checkAndNotify, 5 * 60 * 1000)
    checkAndNotify()
  }

  function stopPolling(): void {
    if (interval) { clearInterval(interval); interval = null }
  }

  watch(enabled, (val) => { val ? startPolling() : stopPolling() }, { immediate: true })

  onUnmounted(stopPolling)

  return { enabled, permission, enable, disable, checkAndNotify }
}
