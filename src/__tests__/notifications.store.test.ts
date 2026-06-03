import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useNotificationsStore } from '@/core/stores/notifications.store'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
})

describe('useNotificationsStore', () => {
  it('starts with empty items', () => {
    const store = useNotificationsStore()
    expect(store.items).toHaveLength(0)
  })

  it('push() adds a notification and returns an id', () => {
    const store = useNotificationsStore()
    const id = store.push('success', 'Done!')
    expect(typeof id).toBe('string')
    expect(store.items).toHaveLength(1)
    expect(store.items[0].type).toBe('success')
    expect(store.items[0].message).toBe('Done!')
  })

  it('dismiss() removes a notification by id', () => {
    const store = useNotificationsStore()
    const id = store.push('info', 'Hello', 0)
    expect(store.items).toHaveLength(1)

    store.dismiss(id)
    expect(store.items).toHaveLength(0)
  })

  it('dismiss() on unknown id does nothing', () => {
    const store = useNotificationsStore()
    store.push('info', 'Hello', 0)
    store.dismiss('nonexistent-id')
    expect(store.items).toHaveLength(1)
  })

  it('auto-dismisses after duration elapses', () => {
    const store = useNotificationsStore()
    store.push('warning', 'Auto-gone', 1000)
    expect(store.items).toHaveLength(1)

    vi.advanceTimersByTime(1001)
    expect(store.items).toHaveLength(0)
  })

  it('push() with duration=0 does not auto-dismiss', () => {
    const store = useNotificationsStore()
    store.push('error', 'Stays', 0)

    vi.advanceTimersByTime(10_000)
    expect(store.items).toHaveLength(1)
  })

  it('success() helper creates a success notification', () => {
    const store = useNotificationsStore()
    store.success('All good')
    expect(store.items[0].type).toBe('success')
    expect(store.items[0].message).toBe('All good')
  })

  it('error() helper creates an error notification', () => {
    const store = useNotificationsStore()
    store.error('Something broke')
    expect(store.items[0].type).toBe('error')
  })

  it('warning() helper creates a warning notification', () => {
    const store = useNotificationsStore()
    store.warning('Be careful')
    expect(store.items[0].type).toBe('warning')
  })

  it('info() helper creates an info notification', () => {
    const store = useNotificationsStore()
    store.info('FYI')
    expect(store.items[0].type).toBe('info')
  })

  it('multiple notifications can coexist', () => {
    const store = useNotificationsStore()
    store.push('success', 'A', 0)
    store.push('error', 'B', 0)
    store.push('info', 'C', 0)
    expect(store.items).toHaveLength(3)
  })

  it('notification includes action when provided', () => {
    const store = useNotificationsStore()
    const fn = vi.fn()
    store.push('info', 'Click me', 0, { label: 'Undo', fn })
    expect(store.items[0].action?.label).toBe('Undo')
    store.items[0].action?.fn()
    expect(fn).toHaveBeenCalledOnce()
  })
})
