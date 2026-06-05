/**
 * usePullToRefresh — gesture state machine.
 *
 * Guards the mobile pull-to-refresh on the Dashboard: it must only fire when
 * the scroll container is at the top, only past the 72px threshold, and must
 * run the onRefresh callback exactly once per qualifying gesture.
 */
import { describe, it, expect, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { usePullToRefresh } from '@/core/composables/usePullToRefresh'

function fireTouch(el: EventTarget, type: string, clientY: number, cancelable = false) {
  const ev = new Event(type, { bubbles: true, cancelable })
  Object.defineProperty(ev, 'touches', { value: [{ clientY }], configurable: true })
  el.dispatchEvent(ev)
  return ev
}

function makeHarness(onRefresh: () => Promise<void> | void) {
  const Comp = defineComponent({
    setup() {
      const container = ref<HTMLElement | null>(null)
      const ptr = usePullToRefresh(container, onRefresh)
      return { container, ...ptr }
    },
    template: `<div ref="container" class="scroller"></div>`,
  })
  const wrapper = mount(Comp, { attachTo: document.body })
  const el = wrapper.vm.container as HTMLElement
  return { wrapper, el }
}

describe('usePullToRefresh', () => {
  it('fires onRefresh when pulled past the threshold from the top', async () => {
    const onRefresh = vi.fn(async () => {})
    const { wrapper, el } = makeHarness(onRefresh)
    el.scrollTop = 0

    fireTouch(el, 'touchstart', 0)
    fireTouch(el, 'touchmove', 200, true) // delta 200 → pullDistance 100 ≥ 72
    expect(wrapper.vm.isPulling).toBe(true)

    fireTouch(el, 'touchend', 200)
    await flushPromises()

    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.isRefreshing).toBe(false)
    expect(wrapper.vm.pullDistance).toBe(0)
    wrapper.unmount()
  })

  it('does not fire when the container is scrolled down', async () => {
    const onRefresh = vi.fn(async () => {})
    const { wrapper, el } = makeHarness(onRefresh)
    el.scrollTop = 50

    fireTouch(el, 'touchstart', 0)
    fireTouch(el, 'touchmove', 200, true)
    fireTouch(el, 'touchend', 200)
    await flushPromises()

    expect(onRefresh).not.toHaveBeenCalled()
    expect(wrapper.vm.isPulling).toBe(false)
    wrapper.unmount()
  })

  it('does not fire when pulled below the threshold', async () => {
    const onRefresh = vi.fn(async () => {})
    const { wrapper, el } = makeHarness(onRefresh)
    el.scrollTop = 0

    fireTouch(el, 'touchstart', 0)
    fireTouch(el, 'touchmove', 100, true) // delta 100 → pullDistance 50 < 72
    fireTouch(el, 'touchend', 100)
    await flushPromises()

    expect(onRefresh).not.toHaveBeenCalled()
    expect(wrapper.vm.pullDistance).toBe(0)
    wrapper.unmount()
  })

  it('removes its listeners on unmount', async () => {
    const onRefresh = vi.fn(async () => {})
    const { wrapper, el } = makeHarness(onRefresh)
    wrapper.unmount()

    // After unmount a fresh gesture must be ignored entirely.
    el.scrollTop = 0
    fireTouch(el, 'touchstart', 0)
    fireTouch(el, 'touchmove', 200, true)
    fireTouch(el, 'touchend', 200)
    await flushPromises()

    expect(onRefresh).not.toHaveBeenCalled()
  })
})
