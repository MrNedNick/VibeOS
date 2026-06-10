/**
 * useAiInsight — fire-and-forget AI insight card (S15 T2 / S16 T1).
 *
 * Backs 8 module views (Goals, Tasks, Learning, Training, Habits, Notes,
 * Finance, …): each triggers an AI insight, shows a loading state, then a
 * dismissable result card. A network failure must NEVER throw — all AI
 * features are optional. These tests pin that contract by mocking the
 * underlying `aiComplete` transport.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAiInsight } from '@/core/composables/useAiInsight'
import { aiComplete } from '@/core/composables/useAI'

vi.mock('@/core/composables/useAI', () => ({
  aiComplete: vi.fn(),
}))

const mockAiComplete = vi.mocked(aiComplete)

/** A promise plus its resolve/reject handles — lets a test control timing. */
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/** Flush the full microtask + finally() chain inside run(). */
const flush = () => new Promise((r) => setTimeout(r, 0))

beforeEach(() => {
  mockAiComplete.mockReset()
})

describe('useAiInsight — initial state', () => {
  it('starts with no result and not loading', () => {
    const { result, loading } = useAiInsight()
    expect(result.value).toBeNull()
    expect(loading.value).toBe(false)
  })
})

describe('useAiInsight — run()', () => {
  it('passes the prompt straight through to aiComplete', () => {
    mockAiComplete.mockReturnValue(deferred<string>().promise)
    const { run } = useAiInsight()
    run('analyse my habits')
    expect(mockAiComplete).toHaveBeenCalledTimes(1)
    expect(mockAiComplete).toHaveBeenCalledWith('analyse my habits')
  })

  it('sets loading=true synchronously while the request is in flight', () => {
    mockAiComplete.mockReturnValue(deferred<string>().promise)
    const { run, loading } = useAiInsight()
    run('prompt')
    expect(loading.value).toBe(true)
  })

  it('populates result and clears loading when aiComplete resolves', async () => {
    const d = deferred<string>()
    mockAiComplete.mockReturnValue(d.promise)
    const { run, result, loading } = useAiInsight()

    run('prompt')
    expect(result.value).toBeNull()
    expect(loading.value).toBe(true)

    d.resolve('You skip Exercise on Wednesdays.')
    await flush()

    expect(result.value).toBe('You skip Exercise on Wednesdays.')
    expect(loading.value).toBe(false)
  })

  it('clears a previous result the moment a new run starts', async () => {
    const first = deferred<string>()
    mockAiComplete.mockReturnValueOnce(first.promise)
    const { run, result } = useAiInsight()

    run('first')
    first.resolve('first insight')
    await flush()
    expect(result.value).toBe('first insight')

    mockAiComplete.mockReturnValueOnce(deferred<string>().promise)
    run('second')
    // result is wiped immediately, before the second request resolves
    expect(result.value).toBeNull()
  })
})

describe('useAiInsight — error handling', () => {
  it('swallows a rejection: no throw, result stays null, loading clears', async () => {
    const d = deferred<string>()
    mockAiComplete.mockReturnValue(d.promise)
    const { run, result, loading } = useAiInsight()

    run('prompt')
    d.reject(new Error('network down'))
    // allow the rejection + finally handlers to flush
    await flush()

    expect(result.value).toBeNull()
    expect(loading.value).toBe(false)
  })
})

describe('useAiInsight — dismiss()', () => {
  it('clears the result', async () => {
    const d = deferred<string>()
    mockAiComplete.mockReturnValue(d.promise)
    const { run, result, dismiss } = useAiInsight()

    run('prompt')
    d.resolve('some insight')
    await flush()
    expect(result.value).toBe('some insight')

    dismiss()
    expect(result.value).toBeNull()
  })

  it('is safe to call when there is no result', () => {
    const { dismiss, result } = useAiInsight()
    expect(() => dismiss()).not.toThrow()
    expect(result.value).toBeNull()
  })
})
