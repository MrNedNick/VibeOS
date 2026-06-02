import type { DirectiveBinding, App } from 'vue'
import { useInteractionBus } from '@/core/stores/interaction.store'
import type { FeatureUsedEvent } from '@/core/events/interaction.types'

type TrackValue = string | { feature: string; context?: Record<string, unknown> }

function getModule(): string {
  const pathSeg = window.location.pathname.split('/').filter(Boolean)[0]
  return pathSeg || 'unknown'
}

export const vTrack = {
  mounted(el: HTMLElement, binding: DirectiveBinding<TrackValue>) {
    const handler = () => {
      const bus = useInteractionBus()
      const value = binding.value
      const feature = typeof value === 'string' ? value : value.feature
      const context = typeof value === 'string' ? undefined : value.context

      const ev: FeatureUsedEvent = {
        type: 'feature:used',
        module: getModule(),
        feature,
        context,
        timestamp: new Date().toISOString(),
      }
      bus.emit(ev)
    }
    el.addEventListener('click', handler)
    ;(el as HTMLElement & { _vTrackHandler?: () => void })._vTrackHandler = handler
  },
  unmounted(el: HTMLElement) {
    const h = (el as HTMLElement & { _vTrackHandler?: () => void })._vTrackHandler
    if (h) { el.removeEventListener('click', h); delete (el as HTMLElement & { _vTrackHandler?: () => void })._vTrackHandler }
  },
}

export function registerTrackDirective(app: App): void {
  app.directive('track', vTrack)
}
