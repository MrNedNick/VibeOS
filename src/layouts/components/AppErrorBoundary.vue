<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err instanceof Error ? err : new Error(String(err))
  return false
})

function reset() {
  error.value = null
}
</script>

<template>
  <div v-if="error" class="error-boundary">
    <div class="error-boundary__card">
      <div class="error-boundary__icon">⚠</div>
      <h2 class="error-boundary__title">Something went wrong.</h2>
      <p class="error-boundary__message">{{ error.message }}</p>
      <div class="error-boundary__actions">
        <button class="error-boundary__btn error-boundary__btn--primary" @click="reset">
          Try again
        </button>
        <button class="error-boundary__btn" @click="() => { reset(); $router?.push('/') }">
          Go home
        </button>
      </div>
      <details class="error-boundary__details">
        <summary>Stack trace</summary>
        <pre>{{ error.stack }}</pre>
      </details>
    </div>
  </div>
  <slot v-else />
</template>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--content-padding);
}

.error-boundary__card {
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 32px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.error-boundary__icon {
  font-size: 28px;
  color: var(--color-warning);
}

.error-boundary__title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.error-boundary__message {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-family: var(--font-mono);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  margin: 0;
  word-break: break-all;
}

.error-boundary__actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.error-boundary__btn {
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
}

.error-boundary__btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.error-boundary__btn--primary {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}

.error-boundary__btn--primary:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  color: #fff;
}

.error-boundary__details {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.error-boundary__details summary {
  cursor: pointer;
  user-select: none;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.error-boundary__details pre {
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.5;
  color: var(--color-text-muted);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
