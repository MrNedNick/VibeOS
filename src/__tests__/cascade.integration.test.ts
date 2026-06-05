/**
 * Cross-store cascade integration tests.
 *
 * This guards VibeOS's #1 differentiator — the auto-cascade headlined on the
 * welcome page ("Log one thing. Everything updates."): logging a learning
 * session / workout checks the linked habit, and checking a habit advances the
 * linked goal's next milestone. The wiring runs through async dynamic
 * `import()` between stores, so it is exactly the kind of thing that silently
 * breaks under refactors with green per-store tests. These assert the real
 * end-to-end chain.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useLearningStore } from '@/modules/learning/stores/learning.store'
import { useTrainingStore } from '@/modules/training/stores/training.store'
import { todayStr } from '@/modules/habits/types'

// The cascade fires through dynamic import().then() chains. Awaiting a macro
// task tick drains the pending microtask queue; the full chain (session →
// habit → goal) has two nested imports, so flush twice to be safe.
const flush = () => new Promise(r => setTimeout(r, 0))

const L_PLAN = {
  title: 'TypeScript',
  topic: 'Advanced patterns',
  category: 'programming' as const,
  minutesPerSession: 45,
  targetHours: 20,
  daysPerWeek: 3,
  startDate: '2026-06-01',
  coverEmoji: '📘',
}
const L_SESSION = {
  date: todayStr(),
  status: 'completed' as const,
  plannedMinutes: 45,
  actualMinutes: 50,
  rating: 4 as const,
}
const T_PLAN = {
  title: 'Running',
  sportType: 'running' as const,
  sessionsPerWeek: 3,
  startDate: '2026-06-01',
  coverEmoji: '🏃',
}
const T_LOG = {
  date: todayStr(),
  sportType: 'running' as const,
  title: 'Morning run',
  feeling: 4 as const,
  actualDuration: 30,
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('cascade: habit → goal', () => {
  it('checking a habit completes the linked goal’s next milestone', async () => {
    const goals = useGoalsStore()
    const habits = useHabitsStore()

    const goal = goals.createGoal({ title: 'Run a half-marathon', category: 'health', coverEmoji: '🏃' })
    goals.addMilestone(goal.id, 'Run 5K')
    goals.addMilestone(goal.id, 'Run 10K')
    expect(goals.getProgress(goal.id)).toBe(0)

    habits.createHabit('Morning run', '🏃')
    const habitId = habits.habits[0].id
    habits.updateHabitLink(habitId, { linkedGoalId: goal.id })

    habits.toggleToday(habitId)
    await flush()

    const fresh = goals.goals.find(g => g.id === goal.id)!
    expect(fresh.milestones.filter(m => m.completed)).toHaveLength(1)
    expect(fresh.milestones[0].completed).toBe(true)
    expect(fresh.milestones[1].completed).toBe(false)
    expect(goals.getProgress(goal.id)).toBe(50)
  })

  it('a habit with no linked goal does not throw and touches no goal', async () => {
    const goals = useGoalsStore()
    const habits = useHabitsStore()
    goals.createGoal({ title: 'Solo goal', category: 'skill', coverEmoji: '🎯' })
    goals.addMilestone(goals.goals[0].id, 'M1')

    habits.createHabit('Read', '📖')
    habits.toggleToday(habits.habits[0].id)
    await flush()

    expect(goals.getProgress(goals.goals[0].id)).toBe(0)
  })

  it('does not advance a second milestone on a single check', async () => {
    const goals = useGoalsStore()
    const habits = useHabitsStore()
    const goal = goals.createGoal({ title: 'G', category: 'health', coverEmoji: '🎯' })
    goals.addMilestone(goal.id, 'M1')
    goals.addMilestone(goal.id, 'M2')
    goals.addMilestone(goal.id, 'M3')

    habits.createHabit('H', '⭐')
    const habitId = habits.habits[0].id
    habits.updateHabitLink(habitId, { linkedGoalId: goal.id })
    habits.toggleToday(habitId)
    await flush()

    expect(goals.goals.find(g => g.id === goal.id)!.milestones.filter(m => m.completed)).toHaveLength(1)
  })
})

describe('cascade: learning session → habit', () => {
  it('logging a session checks the linked habit for today', async () => {
    const habits = useHabitsStore()
    const learning = useLearningStore()

    habits.createHabit('Study', '📚')
    const habitId = habits.habits[0].id
    const plan = learning.createPlan(L_PLAN)
    learning.updatePlanLink(plan.id, habitId)

    expect(habits.isCompletedToday(habitId)).toBe(false)
    learning.logSession({ ...L_SESSION, planId: plan.id })
    await flush()

    expect(habits.isCompletedToday(habitId)).toBe(true)
  })

  it('logging a session on an unlinked plan checks no habit', async () => {
    const habits = useHabitsStore()
    const learning = useLearningStore()
    habits.createHabit('Study', '📚')
    const habitId = habits.habits[0].id
    const plan = learning.createPlan(L_PLAN)

    learning.logSession({ ...L_SESSION, planId: plan.id })
    await flush()

    expect(habits.isCompletedToday(habitId)).toBe(false)
  })
})

describe('cascade: training workout → habit', () => {
  it('logging a workout checks the linked habit for today', async () => {
    const habits = useHabitsStore()
    const training = useTrainingStore()

    habits.createHabit('Train', '🏋️')
    const habitId = habits.habits[0].id
    const plan = training.createPlan(T_PLAN)
    training.updatePlanLink(plan.id, habitId)

    expect(habits.isCompletedToday(habitId)).toBe(false)
    training.logWorkout({ ...T_LOG, planId: plan.id })
    await flush()

    expect(habits.isCompletedToday(habitId)).toBe(true)
  })
})

describe('cascade: full chain (session → habit → goal)', () => {
  it('a logged learning session advances the goal through the linked habit', async () => {
    const goals = useGoalsStore()
    const habits = useHabitsStore()
    const learning = useLearningStore()

    const goal = goals.createGoal({ title: 'Master Vue', category: 'skill', coverEmoji: '💻' })
    goals.addMilestone(goal.id, 'Finish docs')
    goals.addMilestone(goal.id, 'Build app')

    habits.createHabit('Study Vue', '📚')
    const habitId = habits.habits[0].id
    habits.updateHabitLink(habitId, { linkedGoalId: goal.id })

    const plan = learning.createPlan({ ...L_PLAN, title: 'Vue' })
    learning.updatePlanLink(plan.id, habitId)

    learning.logSession({ ...L_SESSION, planId: plan.id })
    // two nested dynamic imports: session→habit, then habit→goal
    await flush()
    await flush()

    expect(habits.isCompletedToday(habitId)).toBe(true)
    const fresh = goals.goals.find(g => g.id === goal.id)!
    expect(fresh.milestones.filter(m => m.completed)).toHaveLength(1)
    expect(goals.getProgress(goal.id)).toBe(50)
  })
})
