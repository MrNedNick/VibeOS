import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiButton from '@/ui/components/UiButton.vue'

describe('UiButton — rendering', () => {
  it('renders slot content', () => {
    const wrapper = mount(UiButton, { slots: { default: 'Save' } })
    expect(wrapper.text()).toContain('Save')
  })

  it('renders a <button> element', () => {
    const wrapper = mount(UiButton)
    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('defaults to type="button"', () => {
    const wrapper = mount(UiButton)
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('accepts type="submit"', () => {
    const wrapper = mount(UiButton, { props: { type: 'submit' } })
    expect(wrapper.attributes('type')).toBe('submit')
  })
})

describe('UiButton — variant classes', () => {
  it('applies primary variant class by default', () => {
    const wrapper = mount(UiButton)
    expect(wrapper.classes()).toContain('ui-btn--primary')
  })

  it('applies ghost variant class', () => {
    const wrapper = mount(UiButton, { props: { variant: 'ghost' } })
    expect(wrapper.classes()).toContain('ui-btn--ghost')
  })

  it('applies danger variant class', () => {
    const wrapper = mount(UiButton, { props: { variant: 'danger' } })
    expect(wrapper.classes()).toContain('ui-btn--danger')
  })

  it('applies outline variant class', () => {
    const wrapper = mount(UiButton, { props: { variant: 'outline' } })
    expect(wrapper.classes()).toContain('ui-btn--outline')
  })

  it('applies md size class by default', () => {
    const wrapper = mount(UiButton)
    expect(wrapper.classes()).toContain('ui-btn--md')
  })

  it('applies sm size class', () => {
    const wrapper = mount(UiButton, { props: { size: 'sm' } })
    expect(wrapper.classes()).toContain('ui-btn--sm')
  })
})

describe('UiButton — disabled state', () => {
  it('is not disabled by default', () => {
    const wrapper = mount(UiButton)
    expect(wrapper.attributes('disabled')).toBeUndefined()
  })

  it('disabled prop sets the disabled attribute', () => {
    const wrapper = mount(UiButton, { props: { disabled: true } })
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(true)
  })
})

describe('UiButton — loading state', () => {
  it('is not loading by default', () => {
    const wrapper = mount(UiButton)
    expect(wrapper.classes()).not.toContain('ui-btn--loading')
    expect(wrapper.find('.ui-btn__spinner').exists()).toBe(false)
  })

  it('loading prop adds loading class', () => {
    const wrapper = mount(UiButton, { props: { loading: true } })
    expect(wrapper.classes()).toContain('ui-btn--loading')
  })

  it('loading renders a spinner element', () => {
    const wrapper = mount(UiButton, { props: { loading: true } })
    expect(wrapper.find('.ui-btn__spinner').exists()).toBe(true)
  })

  it('loading disables the button', () => {
    const wrapper = mount(UiButton, { props: { loading: true } })
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(true)
  })
})
