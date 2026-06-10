import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiEmptyState from '@/ui/components/UiEmptyState.vue'

describe('UiEmptyState — content', () => {
  it('renders the title', () => {
    const wrapper = mount(UiEmptyState, { props: { title: 'No tasks yet' } })
    expect(wrapper.find('.ui-empty__title').text()).toBe('No tasks yet')
  })

  it('renders the subtitle when provided', () => {
    const wrapper = mount(UiEmptyState, { props: { title: 'No tasks', subtitle: 'Add one to begin' } })
    expect(wrapper.find('.ui-empty__sub').text()).toBe('Add one to begin')
  })

  it('omits the subtitle when not provided', () => {
    const wrapper = mount(UiEmptyState, { props: { title: 'No tasks' } })
    expect(wrapper.find('.ui-empty__sub').exists()).toBe(false)
  })
})

describe('UiEmptyState — icon vs emoji', () => {
  it('renders an emoji when the emoji prop is set', () => {
    const wrapper = mount(UiEmptyState, { props: { title: 'Empty', emoji: '📭' } })
    expect(wrapper.find('.ui-empty__emoji').text()).toBe('📭')
  })

  it('falls back to a Lucide icon when no emoji', () => {
    const wrapper = mount(UiEmptyState, { props: { title: 'Empty' } })
    expect(wrapper.find('.ui-empty__emoji').exists()).toBe(false)
    expect(wrapper.find('.ui-empty__icon').exists()).toBe(true)
  })
})

describe('UiEmptyState — action button', () => {
  it('hides the action button when no actionLabel', () => {
    const wrapper = mount(UiEmptyState, { props: { title: 'Empty' } })
    expect(wrapper.find('.ui-empty__btn').exists()).toBe(false)
  })

  it('renders the action button and emits "action" on click', async () => {
    const wrapper = mount(UiEmptyState, { props: { title: 'Empty', actionLabel: 'Add task' } })
    const btn = wrapper.find('.ui-empty__btn')
    expect(btn.text()).toBe('Add task')
    await btn.trigger('click')
    expect(wrapper.emitted('action')).toBeTruthy()
    expect(wrapper.emitted('action')!.length).toBe(1)
  })
})
