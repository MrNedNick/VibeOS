import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('useGoalsStore — CRUD', () => {
  it('starts with no goals', () => {
    const store = useGoalsStore()
    expect(store.goals).toHaveLength(0)
  })

  it('createGoal adds a goal with active status', () => {
    const store = useGoalsStore()
    store.createGoal({ title: 'Learn Vue', category: 'skill', coverEmoji: '💻' })
    expect(store.goals).toHaveLength(1)
    expect(store.goals[0].title).toBe('Learn Vue')
    expect(store.goals[0].status).toBe('active')
    expect(store.goals[0].milestones).toHaveLength(0)
  })

  it('createGoal returns the created goal', () => {
    const store = useGoalsStore()
    const goal = store.createGoal({ title: 'Run 5K', category: 'health', coverEmoji: '🏃' })
    expect(goal.id).toBeTruthy()
    expect(goal.title).toBe('Run 5K')
  })

  it('deleteGoal removes the goal', () => {
    const store = useGoalsStore()
    const goal = store.createGoal({ title: 'Read 12 books', category: 'personal', coverEmoji: '📚' })
    store.deleteGoal(goal.id)
    expect(store.goals).toHaveLength(0)
  })

  it('deleteGoal only removes the specified goal', () => {
    const store = useGoalsStore()
    const g1 = store.createGoal({ title: 'A', category: 'skill', coverEmoji: '🎯' })
    store.createGoal({ title: 'B', category: 'skill', coverEmoji: '🎯' })
    store.deleteGoal(g1.id)
    expect(store.goals).toHaveLength(1)
    expect(store.goals[0].title).toBe('B')
  })

  it('completeGoal changes status to completed', () => {
    const store = useGoalsStore()
    const goal = store.createGoal({ title: 'Ship project', category: 'project', coverEmoji: '🚀' })
    store.completeGoal(goal.id)
    expect(store.goals[0].status).toBe('completed')
    expect(store.goals[0].completedAt).toBeTruthy()
  })
})

describe('useGoalsStore — computed lists', () => {
  it('activeGoals contains only active goals', () => {
    const store = useGoalsStore()
    const g1 = store.createGoal({ title: 'Active', category: 'skill', coverEmoji: '🎯' })
    const g2 = store.createGoal({ title: 'To complete', category: 'skill', coverEmoji: '🎯' })
    store.completeGoal(g2.id)
    expect(store.activeGoals).toHaveLength(1)
    expect(store.activeGoals[0].id).toBe(g1.id)
  })

  it('completedGoals contains only completed goals', () => {
    const store = useGoalsStore()
    store.createGoal({ title: 'Active', category: 'skill', coverEmoji: '🎯' })
    const g2 = store.createGoal({ title: 'Done', category: 'skill', coverEmoji: '🎯' })
    store.completeGoal(g2.id)
    expect(store.completedGoals).toHaveLength(1)
    expect(store.completedGoals[0].title).toBe('Done')
  })

  it('activeGoals sorted by targetDate — closest first', () => {
    const store = useGoalsStore()
    store.createGoal({ title: 'Far', category: 'skill', coverEmoji: '🎯', targetDate: '2030-12-31' })
    store.createGoal({ title: 'Near', category: 'skill', coverEmoji: '🎯', targetDate: '2025-01-01' })
    store.createGoal({ title: 'No date', category: 'skill', coverEmoji: '🎯' })
    expect(store.activeGoals[0].title).toBe('Near')
    expect(store.activeGoals[1].title).toBe('Far')
    expect(store.activeGoals[2].title).toBe('No date')
  })
})

describe('useGoalsStore — milestones', () => {
  it('addMilestone appends to goal', () => {
    const store = useGoalsStore()
    const goal = store.createGoal({ title: 'Learn TS', category: 'skill', coverEmoji: '💻' })
    store.addMilestone(goal.id, 'Read the docs')
    expect(store.goals[0].milestones).toHaveLength(1)
    expect(store.goals[0].milestones[0].title).toBe('Read the docs')
    expect(store.goals[0].milestones[0].completed).toBe(false)
  })

  it('toggleMilestone marks milestone as done', () => {
    const store = useGoalsStore()
    const goal = store.createGoal({ title: 'Learn TS', category: 'skill', coverEmoji: '💻' })
    store.addMilestone(goal.id, 'Step 1')
    const milestoneId = store.goals[0].milestones[0].id
    store.toggleMilestone(goal.id, milestoneId)
    expect(store.goals[0].milestones[0].completed).toBe(true)
    expect(store.goals[0].milestones[0].completedAt).toBeTruthy()
  })

  it('toggleMilestone undoes a completed milestone', () => {
    const store = useGoalsStore()
    const goal = store.createGoal({ title: 'Learn TS', category: 'skill', coverEmoji: '💻' })
    store.addMilestone(goal.id, 'Step 1')
    const milestoneId = store.goals[0].milestones[0].id
    store.toggleMilestone(goal.id, milestoneId)
    store.toggleMilestone(goal.id, milestoneId)
    expect(store.goals[0].milestones[0].completed).toBe(false)
    expect(store.goals[0].milestones[0].completedAt).toBeUndefined()
  })

  it('deleteMilestone removes milestone', () => {
    const store = useGoalsStore()
    const goal = store.createGoal({ title: 'Learn TS', category: 'skill', coverEmoji: '💻' })
    store.addMilestone(goal.id, 'Step 1')
    store.addMilestone(goal.id, 'Step 2')
    const milestoneId = store.goals[0].milestones[0].id
    store.deleteMilestone(goal.id, milestoneId)
    expect(store.goals[0].milestones).toHaveLength(1)
    expect(store.goals[0].milestones[0].title).toBe('Step 2')
  })
})

describe('useGoalsStore — getProgress', () => {
  it('returns 0 for a goal with no milestones', () => {
    const store = useGoalsStore()
    const goal = store.createGoal({ title: 'Test', category: 'skill', coverEmoji: '🎯' })
    expect(store.getProgress(goal.id)).toBe(0)
  })

  it('returns 0 for unknown goal id', () => {
    const store = useGoalsStore()
    expect(store.getProgress('nonexistent')).toBe(0)
  })

  it('returns correct % after toggling milestones', () => {
    const store = useGoalsStore()
    const goal = store.createGoal({ title: 'Test', category: 'skill', coverEmoji: '🎯' })
    store.addMilestone(goal.id, 'A')
    store.addMilestone(goal.id, 'B')
    store.addMilestone(goal.id, 'C')
    store.addMilestone(goal.id, 'D')
    const m1 = store.goals[0].milestones[0].id
    store.toggleMilestone(goal.id, m1)
    expect(store.getProgress(goal.id)).toBe(25)
  })
})
