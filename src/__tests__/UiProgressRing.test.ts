import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiProgressRing from '@/ui/components/UiProgressRing.vue'

describe('UiProgressRing — structure', () => {
  it('renders an svg with a track and an arc circle', () => {
    const wrapper = mount(UiProgressRing, { props: { progress: 50 } })
    expect(wrapper.find('svg.ui-ring').exists()).toBe(true)
    expect(wrapper.find('.ui-ring__track').exists()).toBe(true)
    expect(wrapper.find('.ui-ring__arc').exists()).toBe(true)
  })

  it('exposes role=img with an aria-label describing progress', () => {
    const wrapper = mount(UiProgressRing, { props: { progress: 50 } })
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('50% complete')
  })

  it('honours the size prop on the svg', () => {
    const wrapper = mount(UiProgressRing, { props: { progress: 50, size: 80 } })
    expect(wrapper.attributes('width')).toBe('80')
    expect(wrapper.attributes('height')).toBe('80')
  })
})

describe('UiProgressRing — label', () => {
  it('shows a rounded percentage label by default', () => {
    const wrapper = mount(UiProgressRing, { props: { progress: 66.6 } })
    expect(wrapper.find('.ui-ring__label').text()).toBe('67%')
  })

  it('uses a custom label when provided', () => {
    const wrapper = mount(UiProgressRing, { props: { progress: 50, label: '3/6' } })
    expect(wrapper.find('.ui-ring__label').text()).toBe('3/6')
  })

  it('hides the label when showLabel is false', () => {
    const wrapper = mount(UiProgressRing, { props: { progress: 50, showLabel: false } })
    expect(wrapper.find('.ui-ring__label').exists()).toBe(false)
  })
})

describe('UiProgressRing — arc geometry', () => {
  it('full progress closes the arc (offset 0)', () => {
    const wrapper = mount(UiProgressRing, { props: { progress: 100 } })
    const arc = wrapper.find('.ui-ring__arc').element as SVGElement
    expect(arc.style.strokeDashoffset).toBe('0')
  })

  it('zero progress leaves the arc fully open (offset == circumference)', () => {
    const wrapper = mount(UiProgressRing, { props: { progress: 0 } })
    const arc = wrapper.find('.ui-ring__arc').element as SVGElement
    // offset equals the dasharray (circumference) when empty
    expect(arc.style.strokeDashoffset).toBe(arc.style.strokeDasharray)
  })

  it('clamps progress above 100 (offset never goes negative)', () => {
    const wrapper = mount(UiProgressRing, { props: { progress: 150 } })
    const arc = wrapper.find('.ui-ring__arc').element as SVGElement
    expect(parseFloat(arc.style.strokeDashoffset)).toBe(0)
  })
})
