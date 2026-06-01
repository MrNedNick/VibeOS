import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiSelect from '@/ui/components/UiSelect.vue'

const OPTIONS = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
]

describe('UiSelect', () => {
  it('renders all options', () => {
    const wrapper = mount(UiSelect, {
      props: { options: OPTIONS, modelValue: '' },
    })
    const opts = wrapper.findAll('option')
    expect(opts.map(o => o.text())).toContain('Option A')
    expect(opts.map(o => o.text())).toContain('Option B')
  })

  it('renders placeholder as disabled first option', () => {
    const wrapper = mount(UiSelect, {
      props: { options: OPTIONS, modelValue: '', placeholder: 'Pick one…' },
    })
    const first = wrapper.find('option')
    expect(first.text()).toBe('Pick one…')
    expect(first.attributes('disabled')).toBeDefined()
  })

  it('reflects bound value', () => {
    const wrapper = mount(UiSelect, {
      props: { options: OPTIONS, modelValue: 'b' },
    })
    const select = wrapper.find('select')
    expect((select.element as HTMLSelectElement).value).toBe('b')
  })

  it('emits update:modelValue when selection changes', async () => {
    const wrapper = mount(UiSelect, {
      props: { options: OPTIONS, modelValue: '' },
    })
    await wrapper.find('select').setValue('c')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toBe('c')
  })

  it('applies size class', () => {
    const wrapper = mount(UiSelect, {
      props: { options: OPTIONS, modelValue: '', size: 'sm' },
    })
    expect(wrapper.find('select').classes()).toContain('ui-select--sm')
  })

  it('is disabled when disabled=true', () => {
    const wrapper = mount(UiSelect, {
      props: { options: OPTIONS, modelValue: '', disabled: true },
    })
    expect(wrapper.find('select').attributes('disabled')).toBeDefined()
  })
})
