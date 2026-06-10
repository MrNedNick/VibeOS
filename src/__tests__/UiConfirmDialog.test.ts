/**
 * UiConfirmDialog — the global promise-based confirm dialog.
 *
 * It renders nothing until `useConfirm().confirm()` is called (module-level
 * singleton state), then teleports a dialog into document.body via UiModal.
 * Accept resolves the returned promise true; dismiss resolves false.
 *
 * Teardown order matters: close the singleton, flush, THEN unmount — never
 * wipe document.body while a live Teleport still references its anchor.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import UiConfirmDialog from '@/ui/components/UiConfirmDialog.vue'
import { useConfirm } from '@/core/composables/useConfirm'

let wrapper: VueWrapper | null = null

const mountDialog = () => {
  wrapper = mount(UiConfirmDialog, { attachTo: document.body })
  return wrapper
}

afterEach(async () => {
  useConfirm().dismiss() // reset singleton + close the modal
  await flushPromises()
  wrapper?.unmount()
  wrapper = null
  document.body.style.overflow = ''
})

describe('UiConfirmDialog — visibility', () => {
  it('renders nothing until confirm() is called', () => {
    mountDialog()
    expect(document.querySelector('.confirm-header__title')).toBeFalsy()
  })

  it('opens and shows the title + body when confirm() is called', async () => {
    mountDialog()
    useConfirm().confirm({ title: 'Delete note?', body: 'This cannot be undone.' })
    await nextTick()
    expect(document.querySelector('.confirm-header__title')?.textContent).toBe('Delete note?')
    expect(document.querySelector('.confirm-body')?.textContent).toBe('This cannot be undone.')
  })

  it('renders the danger icon variant when danger=true', async () => {
    mountDialog()
    useConfirm().confirm({ title: 'Delete?', danger: true })
    await nextTick()
    expect(document.querySelector('.confirm-header__icon--danger')).toBeTruthy()
    expect(document.querySelector('.confirm-btn--danger')).toBeTruthy()
  })

  it('uses custom confirm/cancel labels', async () => {
    mountDialog()
    useConfirm().confirm({ title: 'x', confirmLabel: 'Yes do it', cancelLabel: 'No thanks' })
    await nextTick()
    expect(document.querySelector('.confirm-btn--primary')?.textContent?.trim()).toBe('Yes do it')
    expect(document.querySelector('.confirm-btn--cancel')?.textContent?.trim()).toBe('No thanks')
  })
})

describe('UiConfirmDialog — resolution', () => {
  it('accept resolves the promise with true and closes', async () => {
    mountDialog()
    const result = useConfirm().confirm({ title: 'ok?' })
    await nextTick()
    ;(document.querySelector('.confirm-btn--primary') as HTMLElement).click()
    await expect(result).resolves.toBe(true)
    await nextTick()
    expect(document.querySelector('.confirm-header__title')).toBeFalsy()
  })

  it('cancel resolves the promise with false', async () => {
    mountDialog()
    const result = useConfirm().confirm({ title: 'ok?' })
    await nextTick()
    ;(document.querySelector('.confirm-btn--cancel') as HTMLElement).click()
    await expect(result).resolves.toBe(false)
  })
})
