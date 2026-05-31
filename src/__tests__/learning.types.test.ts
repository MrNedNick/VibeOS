import { describe, it, expect } from 'vitest'
import {
  calcProgress,
  calcStreak,
  calcHoursLogged,
  todayStr,
} from '@/modules/learning/types'
import type { LearningPlan, LearningSession } from '@/modules/learning/types'

function makePlan(overrides: Partial<LearningPlan> = {}): LearningPlan {
  return {
    id: 'p1',
    title: 'TypeScript Deep Dive',
    topic: 'TypeScript',
    category: 'programming',
    minutesPerSession: 60,
    targetHours: 10,
    daysPerWeek: 5,
    startDate: '2024-01-01',
    active: true,
    coverEmoji: '💻',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function makeSession(
  planId: string,
  date: string,
  actualMinutes = 60,
  status: 'completed' | 'skipped' = 'completed',
): LearningSession {
  return {
    id: crypto.randomUUID(),
    planId,
    date,
    status,
    plannedMinutes: 60,
    actualMinutes,
    rating: 3,
  }
}

function dateOffset(daysBack: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysBack)
  return d.toISOString().split('T')[0]
}

describe('calcProgress (learning)', () => {
  it('returns 0 with no sessions', () => {
    expect(calcProgress(makePlan(), [])).toBe(0)
  })

  it('returns 0 when targetHours is 0', () => {
    expect(calcProgress(makePlan({ targetHours: 0 }), [])).toBe(0)
  })

  it('returns correct percentage based on minutes logged', () => {
    const sessions = [makeSession('p1', '2024-01-01', 300)] // 5h of 10h target
    expect(calcProgress(makePlan(), sessions)).toBe(50)
  })

  it('caps at 100 even when over target', () => {
    const sessions = [makeSession('p1', '2024-01-01', 700)] // 11.7h > 10h
    expect(calcProgress(makePlan(), sessions)).toBe(100)
  })

  it('ignores skipped sessions', () => {
    const sessions = [
      makeSession('p1', '2024-01-01', 300, 'skipped'),
      makeSession('p1', '2024-01-02', 300, 'completed'),
    ]
    expect(calcProgress(makePlan(), sessions)).toBe(50)
  })

  it('ignores sessions from other plans', () => {
    const sessions = [makeSession('other-plan', '2024-01-01', 600)]
    expect(calcProgress(makePlan({ id: 'p1' }), sessions)).toBe(0)
  })
})

describe('calcStreak', () => {
  it('returns 0 with no sessions', () => {
    expect(calcStreak('p1', [])).toBe(0)
  })

  it('returns 1 for a session only today', () => {
    const sessions = [makeSession('p1', todayStr())]
    expect(calcStreak('p1', sessions)).toBe(1)
  })

  it('counts consecutive days ending today', () => {
    const sessions = [
      makeSession('p1', dateOffset(0)),
      makeSession('p1', dateOffset(1)),
      makeSession('p1', dateOffset(2)),
    ]
    expect(calcStreak('p1', sessions)).toBe(3)
  })

  it('breaks on a gap in the streak', () => {
    const sessions = [
      makeSession('p1', dateOffset(0)),
      // dateOffset(1) is missing — gap
      makeSession('p1', dateOffset(2)),
    ]
    expect(calcStreak('p1', sessions)).toBe(1)
  })

  it('counts streak from yesterday when today has no session', () => {
    const sessions = [
      makeSession('p1', dateOffset(1)),
      makeSession('p1', dateOffset(2)),
    ]
    expect(calcStreak('p1', sessions)).toBe(2)
  })
})

describe('calcHoursLogged', () => {
  it('returns 0 with no sessions', () => {
    expect(calcHoursLogged('p1', [])).toBe(0)
  })

  it('converts minutes to hours correctly', () => {
    const sessions = [
      makeSession('p1', '2024-01-01', 90),
      makeSession('p1', '2024-01-02', 30),
    ]
    expect(calcHoursLogged('p1', sessions)).toBe(2)
  })

  it('rounds to 1 decimal place', () => {
    const sessions = [makeSession('p1', '2024-01-01', 100)] // 1.666...h
    expect(calcHoursLogged('p1', sessions)).toBe(1.7)
  })

  it('excludes skipped sessions', () => {
    const sessions = [
      makeSession('p1', '2024-01-01', 60, 'skipped'),
      makeSession('p1', '2024-01-02', 60, 'completed'),
    ]
    expect(calcHoursLogged('p1', sessions)).toBe(1)
  })
})
