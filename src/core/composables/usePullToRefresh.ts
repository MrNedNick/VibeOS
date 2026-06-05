import { ref, onMounted, onUnmounted } from 'vue'

const THRESHOLD = 72
const MAX_PULL  = 120

export function usePullToRefresh(
  containerRef: { value: HTMLElement | null },
  onRefresh: () => Promise<void> | void,
) {
  const isPulling    = ref(false)
  const isRefreshing = ref(false)
  const pullDistance = ref(0)

  let startY = 0

  function getScrollTop(): number {
    const el = containerRef.value
    if (!el) return 0
    return el.scrollTop ?? window.scrollY
  }

  function onTouchStart(e: TouchEvent) {
    if (isRefreshing.value) return
    if (getScrollTop() > 0) return
    startY = e.touches[0].clientY
  }

  function onTouchMove(e: TouchEvent) {
    if (isRefreshing.value) return
    if (getScrollTop() > 0) { pullDistance.value = 0; isPulling.value = false; return }
    const delta = e.touches[0].clientY - startY
    if (delta <= 0) { pullDistance.value = 0; isPulling.value = false; return }
    e.preventDefault()
    isPulling.value = true
    pullDistance.value = Math.min(delta * 0.5, MAX_PULL)
  }

  async function onTouchEnd() {
    if (!isPulling.value) return
    if (pullDistance.value >= THRESHOLD) {
      isRefreshing.value = true
      pullDistance.value = 0
      isPulling.value    = false
      try {
        await onRefresh()
      } finally {
        isRefreshing.value = false
      }
    } else {
      pullDistance.value = 0
      isPulling.value    = false
    }
  }

  // Capture the attach target at mount so we detach from the SAME element —
  // `containerRef.value` is null again by onUnmounted (template ref cleared),
  // which would otherwise leak the element's listeners.
  let attached: EventTarget | null = null

  onMounted(() => {
    attached = containerRef.value ?? window
    attached.addEventListener('touchstart', onTouchStart as EventListener, { passive: true })
    attached.addEventListener('touchmove',  onTouchMove  as EventListener, { passive: false })
    attached.addEventListener('touchend',   onTouchEnd   as EventListener, { passive: true })
  })

  onUnmounted(() => {
    if (!attached) return
    attached.removeEventListener('touchstart', onTouchStart as EventListener)
    attached.removeEventListener('touchmove',  onTouchMove  as EventListener)
    attached.removeEventListener('touchend',   onTouchEnd   as EventListener)
    attached = null
  })

  return { isPulling, isRefreshing, pullDistance }
}
