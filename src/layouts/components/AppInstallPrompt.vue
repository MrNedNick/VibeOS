<script setup lang="ts">
import { useInstallPrompt } from '@/core/composables/useInstallPrompt'
import { UiIcon, UiButton } from '@/ui'

const { canShow, promptInstall, dismiss } = useInstallPrompt()
</script>

<template>
  <Transition name="install-prompt">
    <div v-if="canShow" class="install-prompt" role="complementary" aria-label="Install app">
      <span class="install-prompt__icon"><UiIcon name="Download" :size="18" :stroke-width="2" /></span>
      <span class="install-prompt__text">Install this app for quicker, offline access</span>
      <UiButton size="sm" @click="promptInstall">Install</UiButton>
      <button class="install-prompt__close" aria-label="Dismiss install prompt" @click="dismiss">
        <UiIcon name="X" :size="14" :stroke-width="2" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.install-prompt {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 900;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  max-width: 360px;
  border-radius: var(--radius);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

.install-prompt__icon {
  flex-shrink: 0;
  color: var(--color-accent);
  display: flex;
  align-items: center;
}

.install-prompt__text {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-text);
}

.install-prompt__close {
  flex-shrink: 0;
  color: var(--color-text-muted);
  opacity: 0.6;
  display: flex;
  align-items: center;
  transition: opacity var(--t-fast);
}
.install-prompt__close:hover { opacity: 1; }

@media (max-width: 767px) {
  .install-prompt { left: 12px; right: 12px; bottom: 76px; max-width: none; }
}

.install-prompt-enter-active { transition: all 220ms var(--ease-spring); }
.install-prompt-leave-active { transition: all 180ms var(--ease); }
.install-prompt-enter-from,
.install-prompt-leave-to { opacity: 0; transform: translateY(12px); }
</style>
