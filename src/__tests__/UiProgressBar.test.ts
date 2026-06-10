import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiProgressBar from '@/ui/components/UiProgressBar.vue'

const fill = (wrapper: ReturnType<typeof mount>) =>
  wrapper.find('.ui-progress__fill').element as HTMLElement

describe('UiProgressBar — fill width', () => {
  it('sets fill width to the value percentage', () => {
    const wrapper = mount(UiProgressBar, { props: { value: 42 } })
    expect(fill(wrapper).style.width).toBe('42%')
  })

  it('clamps values above 100 to 100%', () => {
    const wrapper = mount(UiProgressBar, { props: { value: 150 } })
    expect(fill(wrapper).style.width).toBe('100%')
  })

  it('clamps negative values to 0%', () => {
    const wrapper = mount(UiProgressBar, { props: { value: -20 } })
    expect(fill(wrapper).style.width).toBe('0%')
  })
})

describe('UiProgressBar — color variants', () => {
  it('defaults to the accent color class', () => {
    const wrapper = mount(UiProgressBar, { props: { value: 50 } })
    expect(fill(wrapper).classList.contains('ui-progress__fill--accent')).toBe(true)
  })

  it.each(['success', 'danger', 'warning'] as const)('applies the %s color class', (color) => {
    const wrapper = mount(UiProgressBar, { props: { value: 50, color } })
    expect(fill(wrapper).classList.contains(`ui-progress__fill--${color}`)).toBe(true)
  })

  it('adds the animated class only when animated', () => {
    const off = mount(UiProgressBar, { props: { value: 50 } })
    expect(fill(off).classList.contains('ui-progress__fill--animated')).toBe(false)
    const on = mount(UiProgressBar, { props: { value: 50, animated: true } })
    expect(fill(on).classList.contains('ui-progress__fill--animated')).toBe(true)
  })
})

describe('UiProgressBar — label', () => {
  it('hides the label by default', () => {
    const wrapper = mount(UiProgressBar, { props: { value: 50 } })
    expect(wrapper.find('.ui-progress__label').exists()).toBe(false)
  })

  it('shows a rounded percentage when showLabel is set', () => {
    const wrapper = mount(UiProgressBar, { props: { value: 66.6, showLabel: true } })
    expect(wrapper.find('.ui-progress__label').text()).toBe('67%')
  })
})

describe('UiProgressBar — accessibility', () => {
  it('exposes role=progressbar with aria-valuenow', () => {
    const wrapper = mount(UiProgressBar, { props: { value: 33 } })
    const track = wrapper.find('[role="progressbar"]')
    expect(track.exists()).toBe(true)
    expect(track.attributes('aria-valuenow')).toBe('33')
    expect(track.attributes('aria-valuemin')).toBe('0')
    expect(track.attributes('aria-valuemax')).toBe('100')
  })
})
