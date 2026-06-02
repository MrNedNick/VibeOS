import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// ── AnalyticsBarChart ──────────────────────────────────────────────────────
import AnalyticsBarChart from '@/modules/analytics/components/AnalyticsBarChart.vue'

const BAR_FIXTURE = [
  { label: 'Mon', value: 5,  secondary: 3, tooltip: '5 created, 3 done' },
  { label: 'Tue', value: 8,  secondary: 6, tooltip: '8 created, 6 done' },
  { label: 'Wed', value: 0,  secondary: 0, tooltip: '0 created, 0 done' },
]

const LEGEND = [
  { colorClass: 'legend-dot--primary',   label: 'Created' },
  { colorClass: 'legend-dot--secondary', label: 'Done' },
]

describe('AnalyticsBarChart', () => {
  it('renders a section element', () => {
    const w = mount(AnalyticsBarChart, { props: { title: 'Tasks', bars: BAR_FIXTURE, legend: LEGEND, emptyLabel: 'No data' } })
    expect(w.find('section').exists()).toBe(true)
  })

  it('renders the title', () => {
    const w = mount(AnalyticsBarChart, { props: { title: 'My Title', bars: BAR_FIXTURE, legend: LEGEND, emptyLabel: 'No data' } })
    expect(w.text()).toContain('My Title')
  })

  it('shows emptyLabel when all bar values are 0', () => {
    const zeroBars = BAR_FIXTURE.map(b => ({ ...b, value: 0, secondary: 0 }))
    const w = mount(AnalyticsBarChart, { props: { title: 'Tasks', bars: zeroBars, legend: LEGEND, emptyLabel: 'Nothing yet' } })
    expect(w.text()).toContain('Nothing yet')
  })

  it('does not show emptyLabel when bars have values', () => {
    const w = mount(AnalyticsBarChart, { props: { title: 'Tasks', bars: BAR_FIXTURE, legend: LEGEND, emptyLabel: 'Nothing yet' } })
    expect(w.text()).not.toContain('Nothing yet')
  })

  it('renders the correct number of bar columns', () => {
    const w = mount(AnalyticsBarChart, { props: { title: 'Tasks', bars: BAR_FIXTURE, legend: LEGEND, emptyLabel: 'No data' } })
    expect(w.findAll('.bar-col').length).toBe(3)
  })

  it('renders legend items', () => {
    const w = mount(AnalyticsBarChart, { props: { title: 'Tasks', bars: BAR_FIXTURE, legend: LEGEND, emptyLabel: 'No data' } })
    expect(w.text()).toContain('Created')
    expect(w.text()).toContain('Done')
  })

  it('renders bar labels', () => {
    const w = mount(AnalyticsBarChart, { props: { title: 'Tasks', bars: BAR_FIXTURE, legend: LEGEND, emptyLabel: 'No data' } })
    expect(w.text()).toContain('Mon')
    expect(w.text()).toContain('Tue')
  })
})

// ── AnalyticsHabits ────────────────────────────────────────────────────────
import AnalyticsHabits from '@/modules/analytics/components/AnalyticsHabits.vue'

const HABIT_ROW_FIXTURE = [
  {
    id:    'h1',
    name:  'Morning run',
    emoji: '🏃',
    rate:  80,
    cells: [
      { date: '2026-06-01', done: true,  isToday: false },
      { date: '2026-06-02', done: false, isToday: true  },
    ],
  },
]

describe('AnalyticsHabits', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders a section element', () => {
    const w = mount(AnalyticsHabits, { props: { habitRows: HABIT_ROW_FIXTURE } })
    expect(w.find('section').exists()).toBe(true)
  })

  it('shows habit name', () => {
    const w = mount(AnalyticsHabits, { props: { habitRows: HABIT_ROW_FIXTURE } })
    expect(w.text()).toContain('Morning run')
  })

  it('shows habit emoji', () => {
    const w = mount(AnalyticsHabits, { props: { habitRows: HABIT_ROW_FIXTURE } })
    expect(w.text()).toContain('🏃')
  })

  it('shows habit rate percentage', () => {
    const w = mount(AnalyticsHabits, { props: { habitRows: HABIT_ROW_FIXTURE } })
    expect(w.text()).toContain('80%')
  })

  it('renders done cell with --done class', () => {
    const w = mount(AnalyticsHabits, { props: { habitRows: HABIT_ROW_FIXTURE } })
    const done = w.findAll('.habit-cell--done')
    expect(done.length).toBe(1)
  })

  it('renders today cell with --today class', () => {
    const w = mount(AnalyticsHabits, { props: { habitRows: HABIT_ROW_FIXTURE } })
    const today = w.findAll('.habit-cell--today')
    expect(today.length).toBe(1)
  })

  it('shows empty state when habitRows is empty', () => {
    const w = mount(AnalyticsHabits, { props: { habitRows: [] } })
    expect(w.find('.empty-state').exists()).toBe(true)
  })

  it('renders multiple habits', () => {
    const rows = [
      { ...HABIT_ROW_FIXTURE[0] },
      { id: 'h2', name: 'Read', emoji: '📖', rate: 50, cells: [] },
    ]
    const w = mount(AnalyticsHabits, { props: { habitRows: rows } })
    expect(w.findAll('.habit-row').length).toBe(2)
  })
})

// ── AnalyticsGoals ─────────────────────────────────────────────────────────
import AnalyticsGoals from '@/modules/analytics/components/AnalyticsGoals.vue'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'

describe('AnalyticsGoals', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('renders a section element', () => {
    const w = mount(AnalyticsGoals)
    expect(w.find('section').exists()).toBe(true)
  })

  it('shows empty state when there are no goals', () => {
    const w = mount(AnalyticsGoals)
    expect(w.find('.empty-state').exists()).toBe(true)
  })

  it('renders active goals when present', () => {
    const store = useGoalsStore()
    store.createGoal({ title: 'Run 100km', category: 'health', emoji: '🏃', targetDate: '' })
    const w = mount(AnalyticsGoals)
    expect(w.text()).toContain('Run 100km')
  })

  it('shows progress percentage for active goals', () => {
    const store = useGoalsStore()
    store.createGoal({ title: 'Learn Vue', category: 'learning', emoji: '📚', targetDate: '' })
    const w = mount(AnalyticsGoals)
    expect(w.text()).toMatch(/\d+%/)
  })

  it('shows completed badge when completed goals exist', () => {
    const store = useGoalsStore()
    store.createGoal({ title: 'Done goal', category: 'health', emoji: '✅', targetDate: '' })
    const id = store.goals[0].id
    store.completeGoal(id)
    // Add an active goal so the section renders
    store.createGoal({ title: 'Active goal', category: 'health', emoji: '🏃', targetDate: '' })
    const w = mount(AnalyticsGoals)
    expect(w.find('.goals-completed-badge').exists()).toBe(true)
  })
})

// ── AnalyticsUsage ─────────────────────────────────────────────────────────
import AnalyticsUsage from '@/modules/analytics/components/AnalyticsUsage.vue'

describe('AnalyticsUsage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('renders a container element', () => {
    const w = mount(AnalyticsUsage, { props: { period: 30 } })
    expect(w.find('.au').exists()).toBe(true)
  })

  it('shows empty state when no interaction data', () => {
    const w = mount(AnalyticsUsage, { props: { period: 30 } })
    expect(w.find('.au-empty').exists()).toBe(true)
  })

  it('shows stat cards when session data exists', () => {
    const bus = useInteractionBus()
    bus.emit({ type: 'module:visited', module: 'dashboard', timestamp: new Date().toISOString(), sessionId: 'test', from: undefined })
    const w = mount(AnalyticsUsage, { props: { period: 30 } })
    // With data, stat cards should render
    expect(w.find('.au-stat-card').exists()).toBe(true)
  })
})

import { useInteractionBus } from '@/core/stores/interaction.store'
