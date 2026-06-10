/**
 * HabitCardLinks — the goal/learning/training connector row extracted from
 * HabitCard (S15 T4). Shows linked-entity chips, opens a picker panel, and
 * persists selections via habitsStore.updateHabitLink.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HabitCardLinks from '@/modules/habits/components/HabitCardLinks.vue'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import type { Habit } from '@/modules/habits/types'

function makeHabit(over: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Read',
    emoji: '📖',
    createdAt: '2026-01-01',
    completedDates: [],
    ...over,
  }
}

beforeEach(() => setActivePinia(createPinia()))

const mountLinks = (habit = makeHabit()) => mount(HabitCardLinks, { props: { habit } })

describe('HabitCardLinks — summary row', () => {
  it('shows the connect hint when the habit has no links', () => {
    const wrapper = mountLinks()
    expect(wrapper.find('.hcl__hint').exists()).toBe(true)
    expect(wrapper.text()).toContain('Connect to goal or plan')
    expect(wrapper.find('.hcl-chip').exists()).toBe(false)
  })

  it('does not show the hint once a link exists (even if the name is unresolved)', () => {
    const wrapper = mountLinks(makeHabit({ linkedGoalId: 'g-unknown' }))
    expect(wrapper.find('.hcl__hint').exists()).toBe(false)
  })
})

describe('HabitCardLinks — picker panel', () => {
  it('toggles the picker panel open with three selects', async () => {
    const wrapper = mountLinks()
    expect(wrapper.find('.hcl__panel').exists()).toBe(false)
    await wrapper.find('.hcl__toggle').trigger('click')
    expect(wrapper.find('.hcl__panel').exists()).toBe(true)
    expect(wrapper.findAll('.hcl-field__select')).toHaveLength(3)
  })

  it('Cancel closes the panel without saving', async () => {
    const store = useHabitsStore()
    const spy = vi.spyOn(store, 'updateHabitLink').mockImplementation(() => {})
    const wrapper = mountLinks()
    await wrapper.find('.hcl__toggle').trigger('click')
    await wrapper.find('.hcl__btn--ghost').trigger('click')
    expect(wrapper.find('.hcl__panel').exists()).toBe(false)
    expect(spy).not.toHaveBeenCalled()
  })

  it('Save persists the (empty → undefined) selection and closes', async () => {
    const store = useHabitsStore()
    const spy = vi.spyOn(store, 'updateHabitLink').mockImplementation(() => {})
    const wrapper = mountLinks()
    await wrapper.find('.hcl__toggle').trigger('click')
    await wrapper.find('.hcl__btn--primary').trigger('click')
    expect(spy).toHaveBeenCalledWith('h1', {
      linkedGoalId: undefined,
      linkedLearningPlanId: undefined,
      linkedTrainingPlanId: undefined,
    })
    expect(wrapper.find('.hcl__panel').exists()).toBe(false)
  })
})
