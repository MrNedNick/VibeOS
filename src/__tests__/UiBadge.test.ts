import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiBadge from '@/ui/components/UiBadge.vue'

describe('UiBadge', () => {
  it('renders slot content', () => {
    const wrapper = mount(UiBadge, { slots: { default: '3' } })
    expect(wrapper.text()).toBe('3')
  })

  it('renders a <span> with the ui-badge class', () => {
    const wrapper = mount(UiBadge)
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toContain('ui-badge')
  })

  it('applies the default variant class when none given', () => {
    const wrapper = mount(UiBadge)
    expect(wrapper.classes()).toContain('ui-badge--default')
  })

  it.each(['accent', 'success', 'danger', 'warning'] as const)(
    'applies the %s variant class',
    (variant) => {
      const wrapper = mount(UiBadge, { props: { variant } })
      expect(wrapper.classes()).toContain(`ui-badge--${variant}`)
    },
  )
})
