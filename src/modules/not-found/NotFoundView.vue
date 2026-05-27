<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="not-found__card">
      <div class="not-found__code">404</div>
      <h1 class="not-found__title">This route doesn't exist in VibeOS yet.</h1>
      <p class="not-found__sub">
        Maybe it's coming in a future sprint — or the URL just has a typo.
      </p>
      <div class="not-found__actions">
        <button class="not-found__btn not-found__btn--primary" @click="router.push('/')">
          Go to Dashboard
        </button>
        <button class="not-found__btn" @click="router.back()">
          Go back
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--content-padding);
}

.not-found__card {
  max-width: 440px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.not-found__code {
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  color: var(--color-border);
  letter-spacing: -0.04em;
  font-family: var(--font-mono);
}

.not-found__title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: 1.3;
}

.not-found__sub {
  font-size: 15px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.6;
}

.not-found__actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.not-found__btn {
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

.not-found__btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.not-found__btn--primary {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}

.not-found__btn--primary:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  color: #fff;
}

@media (max-width: 767px) {
  .not-found__code { font-size: 56px; }
  .not-found__title { font-size: 19px; }
  .not-found__actions { flex-direction: column; }
  .not-found__btn { text-align: center; }
}
</style>
