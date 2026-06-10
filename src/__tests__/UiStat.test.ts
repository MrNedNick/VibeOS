import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiStat from '@/ui/components/UiStat.vue'

describe('UiStat — content', () => {
  it('renders value and label', () => {
    const wrapper = mount(UiStat, { props: { value: 42, label: 'Tasks done' } })
    expect(wrapper.find('.ui-stat__value').text()).toBe('42')
    expect(wrapper.find('.ui-stat__label').text()).toBe('Tasks done')
  })

  it('renders a string value', () => {
    const wrapper = mount(UiStat, { props: { value: '12h', label: 'Learning' } })
    expect(wrapper.find('.ui-stat__value').text()).toBe('12h')
  })
})

describe('UiStat — icon', () => {
  it('shows an icon slot when icon prop is set', () => {
    const wrapper = mount(UiStat, { props: { value: 1, label: 'x', icon: 'Target' } })
    expect(wrapper.find('.ui-stat__icon').exists()).toBe(true)
  })

  it('omits the icon when no icon prop', () => {
    const wrapper = mount(UiStat, { props: { value: 1, label: 'x' } })
    expect(wrapper.find('.ui-stat__icon').exists()).toBe(false)
  })
})

describe('UiStat — modifiers', () => {
  it('defaults to left align, md size, default color, no mono', () => {
    const wrapper = mount(UiStat, { props: { value: 1, label: 'x' } })
    expect(wrapper.find('.ui-stat').classes()).toContain('ui-stat--align-left')
    const value = wrapper.find('.ui-stat__value')
    expect(value.classes()).toContain('ui-stat__value--md')
    expect(value.classes()).toContain('ui-stat__value--default')
    expect(value.classes()).not.toContain('ui-stat__value--mono')
  })

  it('applies align, size, color and mono modifiers', () => {
    const wrapper = mount(UiStat, {
      props: { value: 1, label: 'x', align: 'center', size: 'lg', color: 'accent', mono: true },
    })
    expect(wrapper.find('.ui-stat').classes()).toContain('ui-stat--align-center')
    const value = wrapper.find('.ui-stat__value')
    expect(value.classes()).toContain('ui-stat__value--lg')
    expect(value.classes()).toContain('ui-stat__value--accent')
    expect(value.classes()).toContain('ui-stat__value--mono')
  })
})
