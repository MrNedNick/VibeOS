import { describe, it, expect } from 'vitest'
import { calcProgress, daysUntil } from '@/modules/goals/types'
import type { Goal } from '@/modules/goals/types'

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: '1',
    title: 'Test Goal',
    category: 'skill',
    coverEmoji: '🎯',
    status: 'active',
    milestones: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('calcProgress', () => {
  it('returns 0 when no milestones', () => {
    expect(calcProgress(makeGoal())).toBe(0)
  })

  it('returns 0 when no milestones are done', () => {
    const goal = makeGoal({
      milestones: [
        { id: '1', title: 'A', completed: false, order: 0 },
        { id: '2', title: 'B', completed: false, order: 1 },
      ],
    })
    expect(calcProgress(goal)).toBe(0)
  })

  it('returns 50 when half of milestones are done', () => {
    const goal = makeGoal({
      milestones: [
        { id: '1', title: 'A', completed: true, order: 0 },
        { id: '2', title: 'B', completed: false, order: 1 },
      ],
    })
    expect(calcProgress(goal)).toBe(50)
  })

  it('returns 100 when all milestones are done', () => {
    const goal = makeGoal({
      milestones: [
        { id: '1', title: 'A', completed: true, order: 0 },
        { id: '2', title: 'B', completed: true, order: 1 },
      ],
    })
    expect(calcProgress(goal)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    const goal = makeGoal({
      milestones: [
        { id: '1', title: 'A', completed: true, order: 0 },
        { id: '2', title: 'B', completed: false, order: 1 },
        { id: '3', title: 'C', completed: false, order: 2 },
      ],
    })
    expect(calcProgress(goal)).toBe(33)
  })
})

describe('daysUntil', () => {
  it('returns 0 for today', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(daysUntil(today)).toBe(0)
  })

  it('returns positive number for a future date', () => {
    const future = new Date()
    future.setDate(future.getDate() + 5)
    expect(daysUntil(future.toISOString().slice(0, 10))).toBe(5)
  })

  it('returns negative number for a past date', () => {
    const past = new Date()
    past.setDate(past.getDate() - 3)
    expect(daysUntil(past.toISOString().slice(0, 10))).toBe(-3)
  })
})
