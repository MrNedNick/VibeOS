import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiFab from '@/ui/components/UiFab.vue'

describe('UiFab', () => {
  it('renders a button with the ui-fab class and type=button', () => {
    const wrapper = mount(UiFab, { props: { label: 'New task' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.classes()).toContain('ui-fab')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('uses the label prop as aria-label', () => {
    const wrapper = mount(UiFab, { props: { label: 'New task' } })
    expect(wrapper.attributes('aria-label')).toBe('New task')
  })

  it('emits click when pressed', async () => {
    const wrapper = mount(UiFab, { props: { label: 'New task' } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')!.length).toBe(1)
  })

  it('is enabled by default', () => {
    const wrapper = mount(UiFab, { props: { label: 'New task' } })
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(false)
    expect(wrapper.classes()).not.toContain('ui-fab--disabled')
  })

  it('disabled prop sets the attribute and the disabled class', () => {
    const wrapper = mount(UiFab, { props: { label: 'New task', disabled: true } })
    expect((wrapper.element as HTMLButtonElement).disabled).toBe(true)
    expect(wrapper.classes()).toContain('ui-fab--disabled')
  })
})
