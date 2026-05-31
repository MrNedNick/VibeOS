import { describe, it, expect } from 'vitest'
import { classifyTaskDueDate } from '@/modules/task-manager/types'

describe('classifyTaskDueDate', () => {
  it('returns none when dueDate is undefined', () => {
    expect(classifyTaskDueDate(undefined)).toBe('none')
  })

  it('returns today for today\'s date', () => {
    const today = new Date().toISOString().slice(0, 10)
    expect(classifyTaskDueDate(today)).toBe('today')
  })

  it('returns overdue for a past date', () => {
    expect(classifyTaskDueDate('2020-01-01')).toBe('overdue')
  })

  it('returns upcoming for a future date', () => {
    const future = new Date()
    future.setDate(future.getDate() + 7)
    expect(classifyTaskDueDate(future.toISOString().slice(0, 10))).toBe('upcoming')
  })
})
