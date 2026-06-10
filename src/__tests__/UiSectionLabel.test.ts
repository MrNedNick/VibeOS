import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiSectionLabel from '@/ui/components/UiSectionLabel.vue'

describe('UiSectionLabel', () => {
  it('renders slot content', () => {
    const wrapper = mount(UiSectionLabel, { slots: { default: 'Overview' } })
    expect(wrapper.text()).toBe('Overview')
    expect(wrapper.classes()).toContain('ui-section-label')
  })

  it('renders as a <p> by default', () => {
    const wrapper = mount(UiSectionLabel, { slots: { default: 'x' } })
    expect(wrapper.element.tagName).toBe('P')
  })

  it('renders as the tag given by the as prop', () => {
    const wrapper = mount(UiSectionLabel, { props: { as: 'h2' }, slots: { default: 'x' } })
    expect(wrapper.element.tagName).toBe('H2')
  })

  it('applies md size class by default', () => {
    const wrapper = mount(UiSectionLabel, { slots: { default: 'x' } })
    expect(wrapper.classes()).toContain('ui-section-label--md')
  })

  it('applies sm size class', () => {
    const wrapper = mount(UiSectionLabel, { props: { size: 'sm' }, slots: { default: 'x' } })
    expect(wrapper.classes()).toContain('ui-section-label--sm')
  })
})
