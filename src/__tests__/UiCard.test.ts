import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiCard from '@/ui/components/UiCard.vue'

describe('UiCard — rendering', () => {
  it('renders slot content', () => {
    const wrapper = mount(UiCard, { slots: { default: '<p id="content">Hello</p>' } })
    expect(wrapper.find('#content').exists()).toBe(true)
  })

  it('renders as a <div> by default', () => {
    const wrapper = mount(UiCard)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('renders as a custom tag via as prop', () => {
    const wrapper = mount(UiCard, { props: { as: 'article' } })
    expect(wrapper.element.tagName).toBe('ARTICLE')
  })

  it('always has ui-card class', () => {
    const wrapper = mount(UiCard)
    expect(wrapper.classes()).toContain('ui-card')
  })
})

describe('UiCard — padding classes', () => {
  it('applies md padding class by default', () => {
    const wrapper = mount(UiCard)
    expect(wrapper.classes()).toContain('ui-card--pad-md')
  })

  it('applies sm padding class', () => {
    const wrapper = mount(UiCard, { props: { padding: 'sm' } })
    expect(wrapper.classes()).toContain('ui-card--pad-sm')
  })

  it('applies none padding class', () => {
    const wrapper = mount(UiCard, { props: { padding: 'none' } })
    expect(wrapper.classes()).toContain('ui-card--pad-none')
  })

  it('applies lg padding class', () => {
    const wrapper = mount(UiCard, { props: { padding: 'lg' } })
    expect(wrapper.classes()).toContain('ui-card--pad-lg')
  })
})

describe('UiCard — surface classes', () => {
  it('applies base surface class by default', () => {
    const wrapper = mount(UiCard)
    expect(wrapper.classes()).toContain('ui-card--surface-base')
  })

  it('applies raised surface class', () => {
    const wrapper = mount(UiCard, { props: { surface: 'raised' } })
    expect(wrapper.classes()).toContain('ui-card--surface-raised')
  })
})

describe('UiCard — interactive classes', () => {
  it('no hoverable class by default', () => {
    const wrapper = mount(UiCard)
    expect(wrapper.classes()).not.toContain('ui-card--hoverable')
  })

  it('hoverable prop adds hoverable class', () => {
    const wrapper = mount(UiCard, { props: { hoverable: true } })
    expect(wrapper.classes()).toContain('ui-card--hoverable')
  })

  it('clickable prop adds both hoverable and clickable classes', () => {
    const wrapper = mount(UiCard, { props: { clickable: true } })
    expect(wrapper.classes()).toContain('ui-card--hoverable')
    expect(wrapper.classes()).toContain('ui-card--clickable')
  })
})
