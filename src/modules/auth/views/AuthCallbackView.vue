<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSupabase, isSupabaseConfigured } from '@/core/services/supabase'
import { UiIcon, UiButton } from '@/ui'

const router = useRouter()
const failed = ref(false)

onMounted(async () => {
  try {
    // Detect password recovery flow from URL hash (#type=recovery)
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    const isRecovery = params.get('type') === 'recovery'

    if (isSupabaseConfigured) {
      const sb = getSupabase()
      // Let Supabase process the URL hash / PKCE code exchange
      const { data: { session } } = await sb.auth.getSession()
      if (!session) {
        await new Promise(r => setTimeout(r, 800))
        const { data: retry } = await sb.auth.getSession()
        if (!retry.session && !isRecovery) {
          failed.value = true
          return
        }
      }
    }

    if (isRecovery) {
      router.replace('/auth/update-password')
    } else {
      router.replace('/')
    }
  } catch {
    failed.value = true
  }
})
</script>

<template>
  <div class="callback-page">
    <!-- Error state -->
    <div v-if="failed" class="callback-card callback-card--error">
      <UiIcon name="AlertCircle" :size="28" class="callback-error-icon" />
      <p class="callback-title">Something went wrong</p>
      <p class="callback-text">The sign-in link may have expired or already been used.</p>
      <UiButton @click="router.replace('/login')">Back to sign in</UiButton>
    </div>

    <!-- Loading state -->
    <div v-else class="callback-card">
      <UiIcon name="Loader2" :size="28" class="callback-spinner" />
      <p class="callback-text">Signing you in…</p>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
}

.callback-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.callback-card--error {
  max-width: 340px;
  width: calc(100% - 48px);
  padding: 32px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-align: center;
}

.callback-error-icon { color: var(--color-danger); }

.callback-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.callback-text {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: var(--leading-relaxed);
}

@keyframes spin { to { transform: rotate(360deg); } }
.callback-spinner {
  animation: spin 0.9s linear infinite;
  color: var(--color-accent);
}
</style>
