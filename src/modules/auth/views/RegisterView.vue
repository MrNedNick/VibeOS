<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth.store'
import { UiIcon, UiButton, UiInput } from '@/ui'

const router = useRouter()
const auth = useAuthStore()

const APP_VERSION = __APP_VERSION__

const displayName = ref('')
const email       = ref('')
const password    = ref('')
const confirm     = ref('')
const error       = ref<string | null>(null)

// "Check your email" state (when Supabase email confirmation is enabled)
const confirmationPending = ref(false)

const canSubmit = computed(() =>
  email.value.trim().length > 0 &&
  password.value.length >= 8 &&
  password.value === confirm.value,
)

async function submit() {
  error.value = null

  if (!email.value.trim() || !password.value) {
    error.value = 'Email and password are required.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match.'
    return
  }
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }

  const result = await auth.register(
    email.value.trim(),
    password.value,
    displayName.value.trim() || undefined,
  )

  if (result.error) {
    error.value = result.error
  } else if (auth.isLoggedIn) {
    // Email confirmation disabled — user is logged in immediately
    router.replace('/')
  } else {
    // Email confirmation required — show "check your email"
    confirmationPending.value = true
  }
}

function tryDemo() {
  auth.loginDemo()
  router.replace('/')
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
          <rect width="32" height="32" rx="8" fill="#4f8ef7" />
          <path d="M10 23L14 9" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M18 23L22 9" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
        </svg>
        <span class="auth-logo__text">Vibe<span>OS</span></span>
        <span class="auth-logo__ver">v{{ APP_VERSION }}</span>
      </div>

      <!-- ── Email confirmation pending ─────────────────────────────── -->
      <template v-if="confirmationPending">
        <h1 class="auth-title">Check your email</h1>
        <p class="auth-sub">Almost there — one more step.</p>

        <div class="auth-success">
          <UiIcon name="MailCheck" :size="20" />
          <div>
            <p style="margin: 0 0 6px; font-weight: 600;">Confirmation link sent</p>
            <p style="margin: 0; font-size: 13px;">
              We sent a confirmation link to <strong>{{ email }}</strong>.
              Click it to activate your account, then sign in.
            </p>
          </div>
        </div>

        <UiButton @click="router.replace('/login')">Go to sign in</UiButton>
      </template>

      <!-- ── Registration form ──────────────────────────────────────── -->
      <template v-else>
        <h1 class="auth-title">Create account</h1>
        <p class="auth-sub">Set up your personal life OS.</p>

        <!-- Not configured → demo CTA prominent, form visible but secondary -->
        <div v-if="!auth.isSupabaseConfigured" class="auth-notice">
          <UiIcon name="Info" :size="14" />
          Sign-up requires Supabase. Use <strong>Demo mode</strong> to explore everything now.
        </div>

        <div class="auth-form">
          <div class="auth-field">
            <label class="auth-label">Display name <span class="auth-optional">(optional)</span></label>
            <UiInput
              v-model="displayName"
              placeholder="Your name"
              autocomplete="name"
              :disabled="auth.loading"
            />
          </div>
          <div class="auth-field">
            <label class="auth-label">Email</label>
            <UiInput
              v-model="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              :disabled="auth.loading"
            />
          </div>
          <div class="auth-field">
            <label class="auth-label">Password <span class="auth-optional">(min. 8 chars)</span></label>
            <UiInput
              v-model="password"
              type="password"
              placeholder="Create a strong password"
              autocomplete="new-password"
              :disabled="auth.loading"
            />
          </div>
          <div class="auth-field">
            <label class="auth-label">Confirm password</label>
            <UiInput
              v-model="confirm"
              type="password"
              placeholder="Repeat password"
              autocomplete="new-password"
              :disabled="auth.loading"
            />
          </div>

          <!-- Inline password match indicator -->
          <div
            v-if="confirm.length > 0 && password !== confirm"
            class="auth-field-hint auth-field-hint--error"
          >
            <UiIcon name="X" :size="12" /> Passwords don't match
          </div>
          <div
            v-else-if="confirm.length > 0 && password === confirm"
            class="auth-field-hint auth-field-hint--ok"
          >
            <UiIcon name="Check" :size="12" /> Passwords match
          </div>

          <div v-if="error" class="auth-error">
            <UiIcon name="AlertCircle" :size="14" />
            {{ error }}
          </div>

          <UiButton :disabled="auth.loading || !canSubmit" @click="submit">
            <span v-if="auth.loading">Creating account…</span>
            <span v-else>Create account</span>
          </UiButton>
        </div>

        <div class="auth-divider"><span>or</span></div>

        <UiButton variant="ghost" @click="tryDemo">
          <UiIcon name="Play" :size="14" />
          Try demo — no account needed
        </UiButton>

        <p class="auth-footer-link">
          Already have an account?
          <UiButton variant="ghost" size="sm" @click="router.push('/login')">Sign in</UiButton>
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: 24px;
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
.auth-logo__text {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
}
.auth-logo__text span { color: #4f8ef7; }
.auth-logo__ver {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 1px 6px;
  border-radius: var(--radius-xs);
}

.auth-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.02em;
}

.auth-sub {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: -12px 0 0;
}

.auth-notice {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 13px;
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  line-height: 1.5;
}

.auth-success {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  font-size: 14px;
  color: var(--color-text-secondary);
  background: color-mix(in srgb, #22c55e 8%, transparent);
  border: 1px solid color-mix(in srgb, #22c55e 25%, transparent);
  border-radius: var(--radius-sm);
  padding: 16px;
  line-height: 1.5;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.auth-optional {
  font-weight: 400;
  color: var(--color-text-muted);
}

.auth-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 15px;
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color var(--t-fast);
  box-sizing: border-box;
}
.auth-input:focus { border-color: var(--color-accent); }
.auth-input:disabled { opacity: 0.5; cursor: not-allowed; }
.auth-input::placeholder { color: var(--color-text-muted); }

.auth-field-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  margin-top: -8px;
}
.auth-field-hint--error { color: #ef4444; }
.auth-field-hint--ok    { color: #22c55e; }

.auth-error {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 13px;
  color: var(--color-error, #ef4444);
  background: color-mix(in srgb, var(--color-error, #ef4444) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-error, #ef4444) 20%, transparent);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  line-height: 1.4;
}

.auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 11px 20px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--t-fast), background var(--t-fast);
  border: none;
}
.auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.auth-btn--primary {
  background: var(--color-accent);
  color: #fff;
  margin-top: 4px;
}
.auth-btn--primary:hover:not(:disabled) { opacity: 0.88; }

.auth-btn--demo {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}
.auth-btn--demo:hover { background: var(--color-border); color: var(--color-text); }

.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: -4px 0;
}
.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.auth-footer-link {
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
  margin: 0;
}

.auth-text-btn {
  background: none;
  border: none;
  color: var(--color-accent);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}
.auth-text-btn:hover { opacity: 0.8; }

@media (max-width: 480px) {
  .auth-card { padding: 28px 20px; gap: 16px; }
}
</style>
