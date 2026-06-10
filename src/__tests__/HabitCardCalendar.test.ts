/**
 * HabitCardCalendar — the 14-day retro check-in grid extracted from HabitCard
 * (S15 T4). Renders done/skipped/today states and routes clicks: today emits
 * `toggle`, past days call the store directly, right-click toggles a skip day.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HabitCardCalendar from '@/modules/habits/components/HabitCardCalendar.vue'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import type { Habit } from '@/modules/habits/types'

/** ISO date `offset` days before today. */
const iso = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() - offset)
  return d.toISOString().split('T')[0]
}

function makeHabit(over: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Read',
    emoji: '📖',
    createdAt: iso(20),
    completedDates: [iso(1)],
    skippedDates: [iso(2)],
    ...over,
  }
}

beforeEach(() => setActivePinia(createPinia()))

const mountCal = (habit = makeHabit(), doneToday = false) =>
  mount(HabitCardCalendar, { props: { habit, doneToday } })

describe('HabitCardCalendar — rendering', () => {
  it('renders a 14-day grid of day buttons', () => {
    expect(mountCal().findAll('.hcc-day')).toHaveLength(14)
  })

  it('marks the completed date as done', () => {
    expect(mountCal().findAll('.hcc-day--done')).toHaveLength(1)
  })

  it('marks the skipped date as skipped', () => {
    expect(mountCal().findAll('.hcc-day--skipped')).toHaveLength(1)
  })

  it('marks the last cell as today', () => {
    const cells = mountCal().findAll('.hcc-day')
    expect(cells[13].classes()).toContain('hcc-day--today')
  })
})

describe('HabitCardCalendar — interactions', () => {
  it('clicking today emits toggle with the habit id', async () => {
    const wrapper = mountCal()
    await wrapper.findAll('.hcc-day')[13].trigger('click')
    expect(wrapper.emitted('toggle')).toBeTruthy()
    expect(wrapper.emitted('toggle')![0]).toEqual(['h1'])
  })

  it('clicking a past day calls store.toggleDate (not emit)', async () => {
    const store = useHabitsStore()
    const spy = vi.spyOn(store, 'toggleDate').mockImplementation(() => {})
    const wrapper = mountCal()
    await wrapper.findAll('.hcc-day')[0].trigger('click')
    expect(spy).toHaveBeenCalledWith('h1', iso(13))
    expect(wrapper.emitted('toggle')).toBeFalsy()
  })

  it('right-click toggles a skip day via the store', async () => {
    const store = useHabitsStore()
    const spy = vi.spyOn(store, 'toggleSkip').mockImplementation(() => {})
    const wrapper = mountCal()
    await wrapper.findAll('.hcc-day')[0].trigger('contextmenu')
    expect(spy).toHaveBeenCalledWith('h1', iso(13))
  })
})
