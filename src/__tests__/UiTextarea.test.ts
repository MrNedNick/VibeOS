import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiTextarea from '@/ui/components/UiTextarea.vue'

describe('UiTextarea', () => {
  it('renders a textarea element', () => {
    const wrapper = mount(UiTextarea, {
      props: { modelValue: '' },
    })
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('reflects bound value', () => {
    const wrapper = mount(UiTextarea, {
      props: { modelValue: 'hello world' },
    })
    const ta = wrapper.find('textarea').element as HTMLTextAreaElement
    expect(ta.value).toBe('hello world')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(UiTextarea, {
      props: { modelValue: '' },
    })
    await wrapper.find('textarea').setValue('new text')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toBe('new text')
  })

  it('sets rows attribute', () => {
    const wrapper = mount(UiTextarea, {
      props: { modelValue: '', rows: 6 },
    })
    expect(wrapper.find('textarea').attributes('rows')).toBe('6')
  })

  it('defaults to 4 rows', () => {
    const wrapper = mount(UiTextarea, {
      props: { modelValue: '' },
    })
    expect(wrapper.find('textarea').attributes('rows')).toBe('4')
  })

  it('is disabled when disabled=true', () => {
    const wrapper = mount(UiTextarea, {
      props: { modelValue: '', disabled: true },
    })
    expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
  })

  it('renders placeholder', () => {
    const wrapper = mount(UiTextarea, {
      props: { modelValue: '', placeholder: 'Write here…' },
    })
    expect(wrapper.find('textarea').attributes('placeholder')).toBe('Write here…')
  })

  it('applies resize class', () => {
    const wrapper = mount(UiTextarea, {
      props: { modelValue: '', resize: 'none' },
    })
    expect(wrapper.find('textarea').classes()).toContain('ui-textarea--resize-none')
  })
})
