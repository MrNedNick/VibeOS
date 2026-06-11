/**
 * UiPlannedView — "coming soon" placeholder for modules not yet shipped.
 * Props-driven render (title, description, sprint badge, features list).
 * Uses useRouter — mock via vi.mock('vue-router').
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UiPlannedView from '@/ui/components/UiPlannedView.vue'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({ useRouter: () => ({ push: mockPush }) }))

const DEFAULT_PROPS = {
  icon: 'Star',
  title: 'Something Planned',
  description: 'This feature is coming soon.',
  sprint: 'S32',
  features: ['Feature A', 'Feature B'],
}

beforeEach(() => {
  setActivePinia(createPinia())
  mockPush.mockClear()
})

describe('UiPlannedView — content render', () => {
  it('renders the title', () => {
    const wrapper = mount(UiPlannedView, { props: DEFAULT_PROPS })
    expect(wrapper.find('.planned-view__title').text()).toBe('Something Planned')
  })

  it('renders the description', () => {
    const wrapper = mount(UiPlannedView, { props: DEFAULT_PROPS })
    expect(wrapper.find('.planned-view__description').text()).toBe('This feature is coming soon.')
  })

  it('renders the sprint badge', () => {
    const wrapper = mount(UiPlannedView, { props: DEFAULT_PROPS })
    expect(wrapper.find('.planned-view__badge').text()).toBe('S32')
  })

  it('renders the "Planned" eta label', () => {
    const wrapper = mount(UiPlannedView, { props: DEFAULT_PROPS })
    expect(wrapper.find('.planned-view__eta').text()).toBe('Planned')
  })

  it('renders each feature in the list', () => {
    const wrapper = mount(UiPlannedView, { props: DEFAULT_PROPS })
    const items = wrapper.findAll('.planned-view__feature')
    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('Feature A')
    expect(items[1].text()).toContain('Feature B')
  })

  it('renders an empty feature list when features=[]', () => {
    const wrapper = mount(UiPlannedView, {
      props: { ...DEFAULT_PROPS, features: [] },
    })
    expect(wrapper.findAll('.planned-view__feature')).toHaveLength(0)
  })
})

describe('UiPlannedView — navigation', () => {
  it('clicking the back button calls router.push("/")', async () => {
    const wrapper = mount(UiPlannedView, { props: DEFAULT_PROPS })
    await wrapper.find('.planned-view__back').trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
