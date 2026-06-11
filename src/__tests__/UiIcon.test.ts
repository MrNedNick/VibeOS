/**
 * UiIcon — resolves a lucide-vue-next component by name string at render time.
 * Renders an SVG when the name is valid; renders nothing for unknown names.
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiIcon from '@/ui/components/UiIcon.vue'

describe('UiIcon — valid icon name', () => {
  it('renders an SVG element for a known icon (Check)', () => {
    const wrapper = mount(UiIcon, { props: { name: 'Check' } })
    // Lucide renders an <svg> with class "ui-icon"
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('applies .ui-icon class', () => {
    const wrapper = mount(UiIcon, { props: { name: 'Check' } })
    expect(wrapper.find('.ui-icon').exists()).toBe(true)
  })

  it('passes size prop to the lucide component', () => {
    // lucide icons receive size via the "size" attribute on the svg element
    const wrapper = mount(UiIcon, { props: { name: 'X', size: 24 } })
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    // size is bound as attribute; lucide renders it as width/height attributes
    const h = svg.attributes('height')
    const w = svg.attributes('width')
    expect(Number(h)).toBe(24)
    expect(Number(w)).toBe(24)
  })

  it('renders another valid icon (Search)', () => {
    const wrapper = mount(UiIcon, { props: { name: 'Search' } })
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})

describe('UiIcon — invalid icon name', () => {
  it('renders nothing for an unknown icon name', () => {
    const wrapper = mount(UiIcon, { props: { name: 'ThisIconDoesNotExist' } })
    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.html()).toBe('<!--v-if-->')
  })

  it('renders nothing for an empty name string', () => {
    const wrapper = mount(UiIcon, { props: { name: '' } })
    expect(wrapper.find('svg').exists()).toBe(false)
  })
})
