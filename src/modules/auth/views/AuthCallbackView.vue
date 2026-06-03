<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSupabase, isSupabaseConfigured } from '@/core/services/supabase'
import { UiIcon } from '@/ui'

const router = useRouter()

onMounted(async () => {
  if (isSupabaseConfigured) {
    const sb = getSupabase()
    // detectSessionInUrl parses the hash fragment from OAuth / magic-link / PKCE flow
    const { data: { session } } = await sb.auth.getSession()
    if (!session) {
      // Give Supabase a moment to process the URL hash
      await new Promise(r => setTimeout(r, 800))
    }
  }
  router.replace('/')
})
</script>

<template>
  <div class="callback-page">
    <div class="callback-card">
      <UiIcon name="Loader2" :size="28" class="callback-spinner" />
      <p class="callback-text">Signing you in…</p>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
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

.callback-text {
  font-size: 15px;
  color: var(--color-text-muted);
  margin: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.callback-spinner {
  animation: spin 0.9s linear infinite;
  color: var(--color-accent);
}
</style>
