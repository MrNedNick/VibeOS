import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiField from '@/ui/components/UiField.vue'

describe('UiField — label', () => {
  it('renders a label when provided', () => {
    const wrapper = mount(UiField, { props: { label: 'Email' } })
    expect(wrapper.find('.ui-field__label').exists()).toBe(true)
    expect(wrapper.find('.ui-field__label').text()).toContain('Email')
  })

  it('omits the label element when no label prop', () => {
    const wrapper = mount(UiField)
    expect(wrapper.find('.ui-field__label').exists()).toBe(false)
  })

  it('wires label[for] to fieldId', () => {
    const wrapper = mount(UiField, { props: { label: 'Email', fieldId: 'email-input' } })
    expect(wrapper.find('label').attributes('for')).toBe('email-input')
  })

  it('shows a required asterisk when required', () => {
    const wrapper = mount(UiField, { props: { label: 'Email', required: true } })
    expect(wrapper.find('.ui-field__required').exists()).toBe(true)
  })

  it('omits the asterisk by default', () => {
    const wrapper = mount(UiField, { props: { label: 'Email' } })
    expect(wrapper.find('.ui-field__required').exists()).toBe(false)
  })
})

describe('UiField — slot', () => {
  it('renders slotted control content', () => {
    const wrapper = mount(UiField, { slots: { default: '<input class="probe" />' } })
    expect(wrapper.find('.ui-field__control .probe').exists()).toBe(true)
  })
})

describe('UiField — hint / error messages', () => {
  it('shows the hint when there is no error', () => {
    const wrapper = mount(UiField, { props: { hint: 'We never share it' } })
    const msg = wrapper.find('.ui-field__msg')
    expect(msg.classes()).toContain('ui-field__msg--hint')
    expect(msg.text()).toBe('We never share it')
  })

  it('error replaces the hint and colors the field', () => {
    const wrapper = mount(UiField, { props: { hint: 'We never share it', error: 'Required' } })
    const msg = wrapper.find('.ui-field__msg')
    expect(msg.classes()).toContain('ui-field__msg--error')
    expect(msg.text()).toBe('Required')
    expect(wrapper.classes()).toContain('ui-field--error')
  })

  it('renders no message when neither hint nor error', () => {
    const wrapper = mount(UiField, { props: { label: 'Email' } })
    expect(wrapper.find('.ui-field__msg').exists()).toBe(false)
  })
})
