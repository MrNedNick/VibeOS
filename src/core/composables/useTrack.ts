import { useRouter } from 'vue-router'
import { useInteractionBus } from '@/core/stores/interaction.store'
import type { FeatureUsedEvent } from '@/core/events/interaction.types'

/**
 * Emit a semantic feature:used event. Call at the click/action site.
 *
 * @example
 * const { track } = useTrack()
 * track('task:quick-add', { from: 'dashboard' })
 */
export function useTrack() {
  const router = useRouter()

  function track(feature: string, context?: Record<string, unknown>): void {
    const bus = useInteractionBus()
    const module = (router.currentRoute.value.meta?.module as string | undefined)
      ?? router.currentRoute.value.path.split('/').filter(Boolean)[0]
      ?? 'unknown'

    const ev: FeatureUsedEvent = {
      type: 'feature:used',
      module,
      feature,
      context,
      timestamp: new Date().toISOString(),
    }
    bus.emit(ev)
  }

  return { track }
}
