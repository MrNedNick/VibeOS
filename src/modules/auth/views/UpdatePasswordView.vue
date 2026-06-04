<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth.store'
import { UiIcon, UiButton, UiInput } from '@/ui'
import { useToast } from '@/core/composables/useToast'

const router = useRouter()
const auth   = useAuthStore()
const toast  = useToast()

const APP_VERSION = __APP_VERSION__

const newPassword     = ref('')
const confirmPassword = ref('')
const showNew         = ref(false)
const showConfirm     = ref(false)
const serverError     = ref<string | null>(null)
const success         = ref(false)

const canSubmit = computed(() =>
  newPassword.value.length >= 8 && newPassword.value === confirmPassword.value,
)

async function submit() {
  serverError.value = null
  if (newPassword.value.length < 8) {
    serverError.value = 'Password must be at least 8 characters.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    serverError.value = "Passwords don't match."
    return
  }
  const result = await auth.updatePassword(newPassword.value)
  if (result.error) {
    serverError.value = result.error
  } else {
    success.value = true
    toast.success('Password updated successfully!')
    setTimeout(() => router.replace('/'), 2000)
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') submit()
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card" @keydown="onKeydown">
      <!-- Logo -->
      <div class="auth-logo" @click="router.push('/welcome')">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="9" fill="var(--color-accent)" />
          <path d="M10.5 11.2 16 20.4M21.5 11.2 16 20.4" stroke="white" stroke-width="1.9" stroke-linecap="round" opacity="0.5"/>
          <circle cx="10.5" cy="10.5" r="2.3" fill="white"/>
          <circle cx="21.5" cy="10.5" r="2.3" fill="white"/>
          <circle cx="16" cy="21" r="3" fill="white"/>
        </svg>
        <span class="auth-logo__text">Vibe<span>OS</span></span>
        <span class="auth-logo__ver">v{{ APP_VERSION }}</span>
      </div>

      <template v-if="success">
        <h1 class="auth-title">Password updated</h1>
        <div class="auth-success">
          <UiIcon name="CheckCircle2" :size="20" />
          <div>
            <p style="margin: 0 0 4px; font-weight: 600;">All done!</p>
            <p style="margin: 0; font-size: 13px;">Redirecting you to the app…</p>
          </div>
        </div>
      </template>

      <template v-else>
        <h1 class="auth-title">Set new password</h1>
        <p class="auth-sub">Choose a strong password for your account.</p>

        <div class="auth-form">
          <div class="auth-field">
            <label class="auth-label">New password <span class="auth-optional">(min. 8 chars)</span></label>
            <div class="auth-input-wrap">
              <UiInput
                v-model="newPassword"
                :type="showNew ? 'text' : 'password'"
                placeholder="Create a strong password"
                autocomplete="new-password"
                :disabled="auth.loading"
              />
              <button
                type="button"
                class="auth-eye-btn"
                :aria-label="showNew ? 'Hide password' : 'Show password'"
                @click="showNew = !showNew"
              >
                <UiIcon :name="showNew ? 'EyeOff' : 'Eye'" :size="15" />
              </button>
            </div>
          </div>

          <div class="auth-field">
            <label class="auth-label">Confirm password</label>
            <div class="auth-input-wrap">
              <UiInput
                v-model="confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                placeholder="Repeat password"
                autocomplete="new-password"
                :disabled="auth.loading"
              />
              <button
                type="button"
                class="auth-eye-btn"
                :aria-label="showConfirm ? 'Hide' : 'Show'"
                @click="showConfirm = !showConfirm"
              >
                <UiIcon :name="showConfirm ? 'EyeOff' : 'Eye'" :size="15" />
              </button>
            </div>
            <span
              v-if="confirmPassword.length > 0 && newPassword === confirmPassword"
              class="auth-field-hint auth-field-hint--ok"
            >
              <UiIcon name="Check" :size="11" /> Passwords match
            </span>
          </div>

          <div v-if="serverError" class="auth-error">
            <UiIcon name="AlertCircle" :size="14" />
            {{ serverError }}
          </div>

          <UiButton :disabled="auth.loading || !canSubmit" @click="submit">
            <UiIcon v-if="auth.loading" name="Loader2" :size="14" class="auth-spinner" />
            <span>{{ auth.loading ? 'Saving…' : 'Set new password' }}</span>
          </UiButton>
        </div>

        <p class="auth-footer-link">
          <UiButton variant="ghost" size="sm" @click="router.replace('/login')">
            ← Back to sign in
          </UiButton>
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: 24px;
  padding-top: calc(24px + env(safe-area-inset-top, 0px));
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
}

.auth-card {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 40px 36px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.12));
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: fit-content;
  margin-bottom: 4px;
}
.auth-logo__text { font-size: 17px; font-weight: 700; letter-spacing: -0.02em; color: var(--color-text); }
.auth-logo__text span { color: var(--color-accent); }
.auth-logo__ver {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 1px 6px;
  border-radius: var(--radius-xs);
}

.auth-title { font-size: 24px; font-weight: 800; color: var(--color-text); margin: 0; letter-spacing: -0.02em; }
.auth-sub   { font-size: 14px; color: var(--color-text-muted); margin: -12px 0 0; }
.auth-optional { font-weight: 400; color: var(--color-text-muted); }

.auth-success {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  font-size: 14px;
  color: var(--color-text-secondary);
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success) 25%, transparent);
  border-radius: var(--radius-sm);
  padding: 16px;
  line-height: var(--leading-relaxed);
}

.auth-form   { display: flex; flex-direction: column; gap: 14px; }
.auth-field  { display: flex; flex-direction: column; gap: 6px; }
.auth-label  { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); }

.auth-input-wrap { position: relative; }
.auth-eye-btn {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: var(--color-text-muted);
  display: flex; align-items: center; padding: 2px; border-radius: var(--radius-xs);
  transition: color var(--t-fast);
}
.auth-eye-btn:hover { color: var(--color-text); }

.auth-field-hint { display: flex; align-items: center; gap: 5px; font-size: 12px; margin-top: -8px; }
.auth-field-hint--ok { color: var(--color-success); }

.auth-error {
  display: flex; align-items: flex-start; gap: 7px; font-size: 13px;
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-danger) 20%, transparent);
  border-radius: var(--radius-sm);
  padding: 10px 12px; line-height: var(--leading-normal);
}

@keyframes auth-spin { to { transform: rotate(360deg); } }
.auth-spinner { animation: auth-spin 0.8s linear infinite; flex-shrink: 0; }

.auth-footer-link { font-size: 13px; color: var(--color-text-muted); text-align: center; margin: 0; }

@media (max-width: 480px) {
  .auth-card { padding: 28px 20px; gap: 16px; }
}
</style>
