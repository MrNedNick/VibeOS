import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiSkeleton from '@/ui/components/UiSkeleton.vue'

describe('UiSkeleton', () => {
  it('renders an aria-hidden span with the ui-skeleton class', () => {
    const wrapper = mount(UiSkeleton)
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toContain('ui-skeleton')
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('defaults to 100% width and 1em height', () => {
    const wrapper = mount(UiSkeleton)
    const el = wrapper.element as HTMLElement
    expect(el.style.width).toBe('100%')
    expect(el.style.height).toBe('1em')
  })

  it('applies custom width and height', () => {
    const wrapper = mount(UiSkeleton, { props: { width: '120px', height: '40px' } })
    const el = wrapper.element as HTMLElement
    expect(el.style.width).toBe('120px')
    expect(el.style.height).toBe('40px')
  })

  it('defaults to md rounding and not inline', () => {
    const wrapper = mount(UiSkeleton)
    expect(wrapper.classes()).toContain('ui-skeleton--rounded-md')
    expect(wrapper.classes()).not.toContain('ui-skeleton--inline')
  })

  it.each(['none', 'sm', 'full'] as const)('applies rounded-%s', (rounded) => {
    const wrapper = mount(UiSkeleton, { props: { rounded } })
    expect(wrapper.classes()).toContain(`ui-skeleton--rounded-${rounded}`)
  })

  it('adds the inline class when inline', () => {
    const wrapper = mount(UiSkeleton, { props: { inline: true } })
    expect(wrapper.classes()).toContain('ui-skeleton--inline')
  })
})
