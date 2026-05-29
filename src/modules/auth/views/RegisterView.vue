<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth.store'
import { UiIcon } from '@/ui'

const router = useRouter()
const auth = useAuthStore()

const APP_VERSION = __APP_VERSION__

const displayName = ref('')
const email       = ref('')
const password    = ref('')
const confirm     = ref('')
const error       = ref<string | null>(null)
const loading     = ref(false)

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

  loading.value = true
  const result = await auth.register(email.value.trim(), password.value, displayName.value.trim() || undefined)
  loading.value = false

  if (result.error) {
    error.value = result.error
  } else {
    router.replace('/')
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
    <div class="auth-card">
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

      <h1 class="auth-title">Create account</h1>
      <p class="auth-sub">Set up your personal life OS.</p>

      <!-- Notice: Supabase not configured -->
      <div class="auth-notice">
        <UiIcon name="Info" :size="14" />
        Sign-up is coming soon. Use <strong>Demo mode</strong> to explore everything now.
      </div>

      <!-- Form (disabled until Supabase is wired) -->
      <div class="auth-form" @keydown="onKeydown">
        <div class="auth-field">
          <label class="auth-label">Display name <span class="auth-optional">(optional)</span></label>
          <input
            v-model="displayName"
            type="text"
            class="auth-input"
            placeholder="Your name"
            autocomplete="name"
            :disabled="loading"
          />
        </div>
        <div class="auth-field">
          <label class="auth-label">Email</label>
          <input
            v-model="email"
            type="email"
            class="auth-input"
            placeholder="you@example.com"
            autocomplete="email"
            :disabled="loading"
          />
        </div>
        <div class="auth-field">
          <label class="auth-label">Password</label>
          <input
            v-model="password"
            type="password"
            class="auth-input"
            placeholder="Min. 8 characters"
            autocomplete="new-password"
            :disabled="loading"
          />
        </div>
        <div class="auth-field">
          <label class="auth-label">Confirm password</label>
          <input
            v-model="confirm"
            type="password"
            class="auth-input"
            placeholder="Repeat password"
            autocomplete="new-password"
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="auth-error">
          <UiIcon name="AlertCircle" :size="14" />
          {{ error }}
        </div>

        <button class="auth-btn auth-btn--primary" :disabled="loading" @click="submit">
          <span v-if="loading">Creating account…</span>
          <span v-else>Create account</span>
        </button>
      </div>

      <div class="auth-divider"><span>or</span></div>

      <button class="auth-btn auth-btn--demo" @click="tryDemo">
        <UiIcon name="Play" :size="14" />
        Try demo — no account needed
      </button>

      <p class="auth-footer-link">
        Already have an account?
        <button class="auth-text-btn" @click="router.push('/login')">Sign in</button>
      </p>
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
  .auth-card {
    padding: 28px 20px;
    gap: 16px;
  }
}
</style>
