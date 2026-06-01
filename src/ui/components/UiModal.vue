<script setup lang="ts">
import { watch, onUnmounted, nextTick } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
}

const { size = 'md' } = defineProps<Props>()
const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{ close: [] }>()

function close() {
  open.value = false
  emit('close')
}

function onBackdropMousedown(e: MouseEvent) {
  if (e.target === e.currentTarget) close()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') { e.stopPropagation(); close() }
  if (e.key === 'Tab') trapFocus(e)
}

function trapFocus(e: KeyboardEvent) {
  const dialog = document.querySelector('[data-ui-modal]') as HTMLElement | null
  if (!dialog) return
  const focusable = Array.from(
    dialog.querySelectorAll<HTMLElement>(
      'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
    )
  )
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus() }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus() }
  }
}

watch(open, async (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
    await nextTick()
    const dialog = document.querySelector('[data-ui-modal]') as HTMLElement | null
    dialog?.focus()
  } else {
    document.body.style.overflow = ''
  }
}, { immediate: true })

onUnmounted(() => { document.body.style.overflow = '' })
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-modal">
      <div
        v-if="open"
        class="ui-modal__backdrop"
        role="presentation"
        @mousedown="onBackdropMousedown"
        @keydown="onKeydown"
      >
        <div
          class="ui-modal__dialog"
          :class="`ui-modal__dialog--${size}`"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          data-ui-modal
        >
          <div v-if="$slots.header" class="ui-modal__header">
            <slot name="header" />
          </div>
          <div class="ui-modal__body">
            <slot name="body" />
          </div>
          <div v-if="$slots.footer" class="ui-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ui-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: color-mix(in srgb, black 45%, transparent);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.ui-modal__dialog {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-4);
  width: 100%;
  display: flex;
  flex-direction: column;
  outline: none;
  max-height: calc(100dvh - 40px);
  overflow: hidden;
}

.ui-modal__dialog--sm { max-width: 420px; }
.ui-modal__dialog--md { max-width: 560px; }
.ui-modal__dialog--lg { max-width: 720px; }

.ui-modal__header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.ui-modal__body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.ui-modal__footer {
  padding: 16px 24px 20px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

/* Transition */
.ui-modal-enter-active { transition: opacity 150ms var(--ease); }
.ui-modal-leave-active { transition: opacity 120ms var(--ease); }
.ui-modal-enter-from,
.ui-modal-leave-to { opacity: 0; }
</style>
