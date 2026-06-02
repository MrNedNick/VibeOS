import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiFilterChips from '@/ui/components/UiFilterChips.vue'

const OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active', count: 3 },
  { value: 'done', label: 'Done', icon: '✅' },
]

describe('UiFilterChips — rendering', () => {
  it('renders all chip options', () => {
    const wrapper = mount(UiFilterChips, {
      props: { options: OPTIONS, modelValue: 'all' },
    })
    const chips = wrapper.findAll('.ui-fc__chip')
    expect(chips).toHaveLength(3)
    expect(chips[0].text()).toContain('All')
    expect(chips[1].text()).toContain('Active')
    expect(chips[2].text()).toContain('Done')
  })

  it('renders count badge when count is provided', () => {
    const wrapper = mount(UiFilterChips, {
      props: { options: OPTIONS, modelValue: 'all' },
    })
    const count = wrapper.find('.ui-fc__chip-count')
    expect(count.exists()).toBe(true)
    expect(count.text()).toBe('3')
  })

  it('renders icon when icon is provided', () => {
    const wrapper = mount(UiFilterChips, {
      props: { options: OPTIONS, modelValue: 'all' },
    })
    const icon = wrapper.find('.ui-fc__chip-icon')
    expect(icon.exists()).toBe(true)
    expect(icon.text()).toContain('✅')
  })
})

describe('UiFilterChips — active state', () => {
  it('marks the matching chip as active', () => {
    const wrapper = mount(UiFilterChips, {
      props: { options: OPTIONS, modelValue: 'active' },
    })
    const chips = wrapper.findAll('.ui-fc__chip')
    expect(chips[1].classes()).toContain('ui-fc__chip--active')
    expect(chips[0].classes()).not.toContain('ui-fc__chip--active')
  })

  it('sets aria-selected=true on the active chip', () => {
    const wrapper = mount(UiFilterChips, {
      props: { options: OPTIONS, modelValue: 'done' },
    })
    const chips = wrapper.findAll('.ui-fc__chip')
    expect(chips[2].attributes('aria-selected')).toBe('true')
    expect(chips[0].attributes('aria-selected')).toBe('false')
  })
})

describe('UiFilterChips — emit', () => {
  it('emits update:modelValue with chip value on click', async () => {
    const wrapper = mount(UiFilterChips, {
      props: { options: OPTIONS, modelValue: 'all' },
    })
    await wrapper.findAll('.ui-fc__chip')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0][0]).toBe('active')
  })
})

describe('UiFilterChips — variants', () => {
  it('applies tabs variant class by default', () => {
    const wrapper = mount(UiFilterChips, {
      props: { options: OPTIONS, modelValue: 'all' },
    })
    expect(wrapper.classes()).toContain('ui-fc--tabs')
  })

  it('applies pills variant class', () => {
    const wrapper = mount(UiFilterChips, {
      props: { options: OPTIONS, modelValue: 'all', variant: 'pills' },
    })
    expect(wrapper.classes()).toContain('ui-fc--pills')
  })

  it('applies md size class by default', () => {
    const wrapper = mount(UiFilterChips, {
      props: { options: OPTIONS, modelValue: 'all' },
    })
    expect(wrapper.classes()).toContain('ui-fc--md')
  })

  it('applies sm size class', () => {
    const wrapper = mount(UiFilterChips, {
      props: { options: OPTIONS, modelValue: 'all', size: 'sm' },
    })
    expect(wrapper.classes()).toContain('ui-fc--sm')
  })
})
