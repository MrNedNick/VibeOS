/**
 * UiToastContainer — renders toasts from the module-level useToast() singleton
 * via Teleport (to body).  Queries must target document.body.
 *
 * useToast is NOT Pinia — it uses a module-level reactive array, so tests that
 * add toasts see each other's state.  Each test dismisses what it adds.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import UiToastContainer from '@/ui/components/UiToastContainer.vue'
import { useToast } from '@/core/composables/useToast'

// Attach once so the Teleport anchor is stable for all tests
mount(UiToastContainer, { attachTo: document.body })

afterEach(async () => {
  // Dismiss all lingering toasts so tests don't bleed into each other
  const { toasts, dismiss } = useToast()
  ;[...toasts].forEach(t => dismiss(t.id))
  await nextTick()
})

describe('UiToastContainer — rendering', () => {
  it('mounts without error and renders the container', () => {
    expect(document.querySelector('.toast-container')).toBeTruthy()
  })

  it('shows a success toast when success() is called', async () => {
    useToast().success('File saved')
    await nextTick()
    const toast = document.querySelector('.toast--success')
    expect(toast).toBeTruthy()
    expect(toast?.textContent).toContain('File saved')
  })

  it('shows an error toast when error() is called', async () => {
    useToast().error('Something went wrong')
    await nextTick()
    const toast = document.querySelector('.toast--error')
    expect(toast).toBeTruthy()
    expect(toast?.textContent).toContain('Something went wrong')
  })

  it('shows an info toast when info() is called', async () => {
    useToast().info('Just so you know')
    await nextTick()
    expect(document.querySelector('.toast--info')).toBeTruthy()
  })

  it('shows a warning toast when warning() is called', async () => {
    useToast().warning('Careful!')
    await nextTick()
    expect(document.querySelector('.toast--warning')).toBeTruthy()
  })
})

describe('UiToastContainer — dismiss', () => {
  it('removes a toast when dismiss() is called with its id', async () => {
    const { success, toasts, dismiss } = useToast()
    success('Will be dismissed')
    await nextTick()
    expect(document.querySelector('.toast--success')).toBeTruthy()

    const id = toasts[0].id
    dismiss(id)
    await nextTick()
    expect(document.querySelector('.toast--success')).toBeFalsy()
  })

  it('caps visible toasts at 3 — oldest is dropped when a 4th is added', async () => {
    const toast = useToast()
    toast.info('1st')
    toast.info('2nd')
    toast.info('3rd')
    toast.info('4th — oldest dropped')
    await nextTick()
    // At most 3 toasts visible
    expect(document.querySelectorAll('.toast').length).toBeLessThanOrEqual(3)
  })
})
