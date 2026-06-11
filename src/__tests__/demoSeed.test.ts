/**
 * demoSeed — seeding and the S28 T1 purge that keeps demo data out of
 * real accounts. Purge contract: seeded records (`demo-` ids) and seeded
 * budgets are removed, records the user created during demo are kept,
 * and the whole thing is a no-op when the seed flag is absent.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { seedDemoData, purgeDemoData } from '@/core/utils/demoSeed'

const SEED_FLAG = 'platform:demo:v1:seeded'
const TASKS_KEY = 'platform:task-manager:tasks'
const BUDGETS_KEY = 'platform:finance:budgets'

function readJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  return raw ? (JSON.parse(raw) as T) : null
}

beforeEach(() => {
  localStorage.clear()
})

describe('seedDemoData', () => {
  it('seeds demo records and sets the one-time flag', () => {
    seedDemoData()
    const tasks = readJson<Array<{ id: string }>>(TASKS_KEY)
    expect(tasks?.length).toBeGreaterThan(0)
    expect(tasks?.every(t => t.id.startsWith('demo-'))).toBe(true)
    expect(readJson<Array<unknown>>(BUDGETS_KEY)?.length).toBeGreaterThan(0)
    expect(readJson(SEED_FLAG)).toBe(true)
  })

  it('does not re-seed when the flag is already set', () => {
    seedDemoData()
    localStorage.setItem(TASKS_KEY, '[]')
    seedDemoData()
    expect(readJson<Array<unknown>>(TASKS_KEY)).toEqual([])
  })
})

describe('purgeDemoData (S28 T1)', () => {
  it('removes seeded records, budgets and the flag', () => {
    seedDemoData()
    purgeDemoData()
    expect(readJson<Array<unknown>>(TASKS_KEY)).toEqual([])
    expect(localStorage.getItem(BUDGETS_KEY)).toBeNull()
    expect(localStorage.getItem(SEED_FLAG)).toBeNull()
    expect(readJson<Array<unknown>>('platform:habits:habits')).toEqual([])
    expect(readJson<Array<unknown>>('platform:goals:goals')).toEqual([])
    expect(readJson<Array<unknown>>('platform:notes:notes')).toEqual([])
    expect(readJson<Array<unknown>>('platform:finance:expenses')).toEqual([])
    expect(readJson<Array<unknown>>('platform:kanban:cards')).toEqual([])
  })

  it('keeps records the user created during demo', () => {
    seedDemoData()
    const tasks = readJson<Array<{ id: string }>>(TASKS_KEY) ?? []
    tasks.push({ id: 'abc123-user-made' })
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))

    purgeDemoData()

    const kept = readJson<Array<{ id: string }>>(TASKS_KEY)
    expect(kept).toEqual([{ id: 'abc123-user-made' }])
  })

  it('is a no-op when the seed flag is absent', () => {
    localStorage.setItem(TASKS_KEY, '[{"id":"demo-task-1"}]')
    localStorage.setItem(BUDGETS_KEY, '[{"category":"food","monthlyLimit":100}]')

    purgeDemoData()

    expect(readJson<Array<{ id: string }>>(TASKS_KEY)).toEqual([{ id: 'demo-task-1' }])
    expect(readJson<Array<unknown>>(BUDGETS_KEY)?.length).toBe(1)
  })
})
