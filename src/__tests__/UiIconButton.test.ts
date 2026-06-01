import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiIconButton from '@/ui/components/UiIconButton.vue'

// aria-label is passed as an HTML attribute (falls through via $attrs to the button)
const stubs = { UiIcon: { template: '<span data-icon />' } }

const base = (extra: Record<string, unknown> = {}) =>
  mount(UiIconButton, {
    props: { name: 'X', ...extra },
    attrs: { 'aria-label': 'Close' },
    global: { stubs },
  })

describe('UiIconButton', () => {
  it('renders a button element', () => {
    expect(base().find('button').exists()).toBe(true)
  })

  it('forwards aria-label to the button element', () => {
    const wrapper = mount(UiIconButton, {
      props: { name: 'X' },
      attrs: { 'aria-label': 'Close dialog' },
      global: { stubs },
    })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Close dialog')
  })

  it('applies sm size class', () => {
    expect(base({ size: 'sm' }).find('button').classes()).toContain('ui-icon-btn--sm')
  })

  it('applies md size class by default', () => {
    expect(base().find('button').classes()).toContain('ui-icon-btn--md')
  })

  it('applies danger variant class', () => {
    expect(base({ variant: 'danger' }).find('button').classes()).toContain('ui-icon-btn--danger')
  })

  it('applies subtle variant class', () => {
    expect(base({ variant: 'subtle' }).find('button').classes()).toContain('ui-icon-btn--subtle')
  })

  it('is disabled when disabled=true', () => {
    expect(base({ disabled: true }).find('button').attributes('disabled')).toBeDefined()
  })

  it('shows spinner and disables when loading=true', () => {
    const wrapper = base({ loading: true })
    expect(wrapper.find('.ui-icon-btn__spinner').exists()).toBe(true)
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('emits click when clicked', async () => {
    const wrapper = base()
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = base({ disabled: true })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})
