/**
 * UiFeedbackModal — 3-step feedback flow (mood → comment → thank-you).
 *
 * Teleports into document.body via UiModal. We drive it through the DOM and
 * assert the emitted (score, comment) contract that useFeedback persists.
 */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import UiFeedbackModal from '@/ui/components/UiFeedbackModal.vue'

let wrapper: VueWrapper | null = null

const mountModal = () => {
  wrapper = mount(UiFeedbackModal, { props: { open: true }, attachTo: document.body })
  return wrapper
}

/** Find a teleported button by its trimmed text. */
function buttonByText(text: string): HTMLButtonElement | undefined {
  return Array.from(document.body.querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === text,
  )
}

afterEach(() => {
  wrapper?.unmount() // proper Teleport teardown — don't wipe body manually
  wrapper = null
  document.body.style.overflow = ''
  vi.useRealTimers()
})

describe('UiFeedbackModal — step 1 (mood)', () => {
  it('opens on the mood step with 4 mood options', async () => {
    const wrapper = mountModal()
    await nextTick()
    expect(document.querySelector('.ufm-title')?.textContent).toContain("How's VibeOS")
    expect(document.querySelectorAll('.ufm-mood-btn')).toHaveLength(4)
    wrapper.unmount()
  })

  it('"Maybe later" emits dismissed and closes (update:open=false)', async () => {
    const wrapper = mountModal()
    await nextTick()
    buttonByText('Maybe later')!.click()
    await nextTick()
    expect(wrapper.emitted('dismissed')).toBeTruthy()
    expect(wrapper.emitted('update:open')!.at(-1)).toEqual([false])
    wrapper.unmount()
  })
})

describe('UiFeedbackModal — step 2 (comment) → submit', () => {
  it('picking a mood advances to the comment step', async () => {
    const wrapper = mountModal()
    await nextTick()
    ;(document.querySelectorAll('.ufm-mood-btn')[2] as HTMLElement).click() // "Good" (score 8)
    await nextTick()
    expect(document.querySelector('.ufm-comment')).toBeTruthy()
    expect(document.querySelector('textarea')).toBeTruthy()
    wrapper.unmount()
  })

  it('submitting emits the mood score and trimmed comment, then thank-you', async () => {
    vi.useFakeTimers()
    const wrapper = mountModal()
    await nextTick()
    ;(document.querySelectorAll('.ufm-mood-btn')[3] as HTMLElement).click() // "Love it!" (score 10)
    await nextTick()

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    textarea.value = '  the cascade  '
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()

    buttonByText('Send feedback')!.click()
    await nextTick()

    expect(wrapper.emitted('submitted')).toBeTruthy()
    expect(wrapper.emitted('submitted')![0]).toEqual([10, 'the cascade'])
    expect(document.querySelector('.ufm-thankyou')).toBeTruthy()

    // auto-closes after the 2.2s thank-you delay
    vi.advanceTimersByTime(2200)
    await nextTick()
    expect(wrapper.emitted('update:open')!.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('submitting with an empty comment emits undefined for the comment', async () => {
    vi.useFakeTimers()
    const wrapper = mountModal()
    await nextTick()
    ;(document.querySelectorAll('.ufm-mood-btn')[0] as HTMLElement).click() // "Not great" (score 2)
    await nextTick()
    buttonByText('Send feedback')!.click()
    await nextTick()
    expect(wrapper.emitted('submitted')![0]).toEqual([2, undefined])
    wrapper.unmount()
  })
})
