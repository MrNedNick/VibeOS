import { describe, it, expect, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import UiModal from '@/ui/components/UiModal.vue'

// UiModal uses <Teleport to="body">, so rendered content appears in document.body,
// not inside the wrapper element. Query document.body for teleported nodes.
const mountModal = (open: boolean, size: 'sm' | 'md' | 'lg' = 'md') =>
  mount(UiModal, {
    props: { open, size },
    slots: {
      header: '<h2 id="test-h2">Test Header</h2>',
      body: '<p id="test-body">Test Body</p>',
      footer: '<button id="close-btn">Close</button>',
    },
    attachTo: document.body,
  })

describe('UiModal', () => {
  afterEach(() => {
    document.body.style.overflow = ''
    document.body.innerHTML = ''
  })

  it('renders slots when open=true', async () => {
    const wrapper = mountModal(true)
    await nextTick()
    expect(document.querySelector('#test-h2')).toBeTruthy()
    expect(document.querySelector('#test-body')).toBeTruthy()
    expect(document.querySelector('#close-btn')).toBeTruthy()
    wrapper.unmount()
  })

  it('does not render dialog when open=false', () => {
    const wrapper = mountModal(false)
    expect(document.querySelector('[data-ui-modal]')).toBeFalsy()
    wrapper.unmount()
  })

  it('renders dialog when open=true', async () => {
    const wrapper = mountModal(true)
    await nextTick()
    expect(document.querySelector('[data-ui-modal]')).toBeTruthy()
    wrapper.unmount()
  })

  it('applies size class to dialog', async () => {
    const wrapper = mountModal(true, 'lg')
    await nextTick()
    const dialog = document.querySelector('[data-ui-modal]')
    expect(dialog?.classList.contains('ui-modal__dialog--lg')).toBe(true)
    wrapper.unmount()
  })

  it('locks body scroll when open=true', async () => {
    const wrapper = mountModal(true)
    await nextTick()
    await flushPromises()
    expect(document.body.style.overflow).toBe('hidden')
    wrapper.unmount()
  })

  it('restores body scroll when open changes to false', async () => {
    const wrapper = mountModal(true)
    await nextTick()
    await flushPromises()
    expect(document.body.style.overflow).toBe('hidden')
    await wrapper.setProps({ open: false })
    await nextTick()
    expect(document.body.style.overflow).toBe('')
    wrapper.unmount()
  })

  it('emits close and update:open=false on Escape', async () => {
    const wrapper = mountModal(true)
    await nextTick()
    const backdrop = document.querySelector('.ui-modal__backdrop') as HTMLElement
    backdrop?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    wrapper.unmount()
  })

  it('restores scroll on unmount while open', async () => {
    const wrapper = mountModal(true)
    await nextTick()
    await flushPromises()
    expect(document.body.style.overflow).toBe('hidden')
    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('has backdrop and dialog structure', async () => {
    const wrapper = mountModal(true)
    await nextTick()
    expect(document.querySelector('.ui-modal__backdrop')).toBeTruthy()
    expect(document.querySelector('.ui-modal__dialog')).toBeTruthy()
    wrapper.unmount()
  })
})
