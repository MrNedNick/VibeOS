<script setup lang="ts">
import { watch } from 'vue'
import { useAchievementsStore } from '@/core/stores/achievements.store'

const store = useAchievementsStore()

// Auto-dismiss after 4 seconds
watch(() => store.pendingToast, (val) => {
  if (val) setTimeout(() => store.dismissToast(), 4000)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="ach-toast">
      <div
        v-if="store.pendingToast"
        class="ach-toast"
        @click="store.dismissToast()"
      >
        <span class="ach-toast__icon">{{ store.pendingToast.icon }}</span>
        <div class="ach-toast__body">
          <span class="ach-toast__label">Achievement unlocked!</span>
          <span class="ach-toast__title">{{ store.pendingToast.title }}</span>
          <span class="ach-toast__desc">{{ store.pendingToast.description }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ach-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9000;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: linear-gradient(135deg,
    color-mix(in srgb, #f59e0b 15%, var(--color-surface)),
    color-mix(in srgb, var(--color-accent) 10%, var(--color-surface))
  );
  border: 1px solid color-mix(in srgb, #f59e0b 40%, var(--color-border));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  max-width: 320px;
  transition: opacity var(--t-fast), transform var(--t-fast);
}
.ach-toast:hover { opacity: 0.9; }

.ach-toast__icon {
  font-size: 30px;
  line-height: 1;
  flex-shrink: 0;
}

.ach-toast__body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.ach-toast__label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #f59e0b;
}

.ach-toast__title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}

.ach-toast__desc {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

/* Slide in from bottom-right */
.ach-toast-enter-active { transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.ach-toast-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.ach-toast-enter-from   { opacity: 0; transform: translateY(20px) scale(0.92); }
.ach-toast-leave-to     { opacity: 0; transform: translateY(10px); }

@media (max-width: 767px) {
  .ach-toast {
    bottom: 80px; /* above bottom tab bar */
    left: 16px;
    right: 16px;
    max-width: none;
  }
}
</style>
