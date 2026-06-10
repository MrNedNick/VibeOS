import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiInput from '@/ui/components/UiInput.vue'

describe('UiInput — rendering', () => {
  it('renders an <input> with the ui-input class', () => {
    const wrapper = mount(UiInput, { props: { modelValue: '' } })
    expect(wrapper.element.tagName).toBe('INPUT')
    expect(wrapper.classes()).toContain('ui-input')
  })

  it('binds placeholder, maxlength and disabled props', () => {
    const wrapper = mount(UiInput, {
      props: { modelValue: '', placeholder: 'Email', maxlength: 5, disabled: true },
    })
    expect(wrapper.attributes('placeholder')).toBe('Email')
    expect(wrapper.attributes('maxlength')).toBe('5')
    expect((wrapper.element as HTMLInputElement).disabled).toBe(true)
  })

  it('passes through $attrs (e.g. type="password")', () => {
    const wrapper = mount(UiInput, { props: { modelValue: '' }, attrs: { type: 'password' } })
    expect(wrapper.attributes('type')).toBe('password')
  })
})

describe('UiInput — v-model', () => {
  it('reflects the modelValue prop into the input value', () => {
    const wrapper = mount(UiInput, { props: { modelValue: 'hello' } })
    expect((wrapper.element as HTMLInputElement).value).toBe('hello')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(UiInput, { props: { modelValue: '' } })
    await wrapper.find('input').setValue('changed')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['changed'])
  })
})

describe('UiInput — error state', () => {
  it('has no error class by default', () => {
    const wrapper = mount(UiInput, { props: { modelValue: '' } })
    expect(wrapper.classes()).not.toContain('ui-input--error')
  })

  it('adds ui-input--error when error prop is set', () => {
    const wrapper = mount(UiInput, { props: { modelValue: '', error: true } })
    expect(wrapper.classes()).toContain('ui-input--error')
  })
})

describe('UiInput — enter emit', () => {
  it('emits "enter" on Enter keydown', async () => {
    const wrapper = mount(UiInput, { props: { modelValue: '' } })
    await wrapper.find('input').trigger('keydown.enter')
    expect(wrapper.emitted('enter')).toBeTruthy()
    expect(wrapper.emitted('enter')!.length).toBe(1)
  })
})

describe('UiInput — exposed focus()', () => {
  it('focus() moves focus to the underlying input', () => {
    const wrapper = mount(UiInput, { props: { modelValue: '' }, attachTo: document.body })
    ;(wrapper.vm as unknown as { focus: () => void }).focus()
    expect(document.activeElement).toBe(wrapper.element)
    wrapper.unmount()
  })
})
