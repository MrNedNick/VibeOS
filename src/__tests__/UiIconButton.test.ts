import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiIconButton from '@/ui/components/UiIconButton.vue'

const stubs = { UiIcon: { template: '<span data-icon />' } }

describe('UiIconButton', () => {
  it('renders a button element', () => {
    const wrapper = mount(UiIconButton, {
      props: { name: 'X', ariaLabel: 'Close' },
      global: { stubs },
    })
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('sets aria-label on the button', () => {
    const wrapper = mount(UiIconButton, {
      props: { name: 'X', ariaLabel: 'Close dialog' },
      global: { stubs },
    })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Close dialog')
  })

  it('applies size class', () => {
    const wrapper = mount(UiIconButton, {
      props: { name: 'X', ariaLabel: 'Test', size: 'sm' },
      global: { stubs },
    })
    expect(wrapper.find('button').classes()).toContain('ui-icon-btn--sm')
  })

  it('applies variant class', () => {
    const wrapper = mount(UiIconButton, {
      props: { name: 'Trash2', ariaLabel: 'Delete', variant: 'danger' },
      global: { stubs },
    })
    expect(wrapper.find('button').classes()).toContain('ui-icon-btn--danger')
  })

  it('is disabled when disabled=true', () => {
    const wrapper = mount(UiIconButton, {
      props: { name: 'X', ariaLabel: 'Close', disabled: true },
      global: { stubs },
    })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('shows spinner and disables button when loading=true', () => {
    const wrapper = mount(UiIconButton, {
      props: { name: 'X', ariaLabel: 'Loading', loading: true },
      global: { stubs },
    })
    expect(wrapper.find('.ui-icon-btn__spinner').exists()).toBe(true)
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('emits click when clicked', async () => {
    const wrapper = mount(UiIconButton, {
      props: { name: 'Plus', ariaLabel: 'Add' },
      global: { stubs },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(UiIconButton, {
      props: { name: 'Plus', ariaLabel: 'Add', disabled: true },
      global: { stubs },
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})
