<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth.store'
import { UiIcon, UiButton, UiInput } from '@/ui'
import { useTrack } from '@/core/composables/useTrack'
import { useFormValidation, required, email as emailValidator, minLength } from '@/core/composables/useFormValidation'
import { useToast } from '@/core/composables/useToast'

const router = useRouter()
const auth = useAuthStore()
const { track } = useTrack()
const toast = useToast()

const APP_VERSION = __APP_VERSION__

const email    = ref('')
const password = ref('')
const serverError = ref<string | null>(null)
const emailNotConfirmed = computed(() => !!serverError.value?.toLowerCase().includes('email not confirmed'))
const resendingConfirm  = ref(false)

// Rate limit state
const rateLimitCooldown = ref(0)
let rateLimitTimer: ReturnType<typeof setInterval> | null = null

// Show password reset form
const showReset  = ref(false)
const resetEmail = ref('')
const resetSent  = ref(false)
const resetError = ref<string | null>(null)

const showPassword = ref(false)

const { errors, touched, onBlur, validate, reset } = useFormValidation(
  {
    email:    [required('Email is required'), emailValidator()],
    password: [required('Password is required'), minLength(8)],
  },
  { email, password },
)

const canSubmit = computed(() =>
  rateLimitCooldown.value === 0 &&
  email.value.trim().length > 0 &&
  password.value.length > 0,
)

function isRateLimit(msg: string): boolean {
  return /429|rate.?limit|too many/i.test(msg)
}

function startCooldown(seconds = 30) {
  rateLimitCooldown.value = seconds
  if (rateLimitTimer) clearInterval(rateLimitTimer)
  rateLimitTimer = setInterval(() => {
    rateLimitCooldown.value--
    if (rateLimitCooldown.value <= 0) {
      clearInterval(rateLimitTimer!)
      rateLimitTimer = null
    }
  }, 1000)
}

async function submit() {
  if (!validate()) return
  serverError.value = null
  track('auth:sign-in-attempted')
  const result = await auth.login(email.value.trim(), password.value)
  if (result.error) {
    if (isRateLimit(result.error)) {
      startCooldown(30)
      serverError.value = 'Too many attempts. Please wait a moment and try again.'
    } else {
      serverError.value = result.error
    }
  } else {
    toast.success('Welcome back!')
    reset()
    router.replace('/')
  }
}

function tryDemo() {
  track('auth:demo-activated')
  auth.loginDemo()
  router.replace('/')
}

async function resendConfirmation() {
  const addr = email.value.trim()
  if (!addr) return
  resendingConfirm.value = true
  const result = await auth.resendConfirmation(addr)
  resendingConfirm.value = false
  if (result.error) {
    toast.error(result.error)
  } else {
    serverError.value = null
    toast.success('Confirmation email resent — check your inbox.')
  }
}

async function sendReset() {
  if (!resetEmail.value.trim()) return
  resetError.value = null
  const result = await auth.sendPasswordReset(resetEmail.value.trim())
  if (result.error) {
    resetError.value = result.error
  } else {
    resetSent.value = true
    toast.success('Reset email sent! Check your inbox.')
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    if (showReset.value) sendReset()
    else submit()
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card" @keydown="onKeydown">
      <!-- Logo -->
      <div class="auth-logo" @click="router.push('/welcome').catch(() => {})">
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

      <!-- ── Password Reset mode ──────────────────────────────────────── -->
      <template v-if="showReset">
        <h1 class="auth-title">Reset password</h1>
        <p class="auth-sub">We'll send a reset link to your email.</p>

        <template v-if="!resetSent">
          <div class="auth-form">
            <div class="auth-field">
              <label class="auth-label">Email</label>
              <UiInput
                v-model="resetEmail"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                :disabled="auth.loading"
              />
            </div>

            <div v-if="resetError" class="auth-error">
              <UiIcon name="AlertCircle" :size="14" />
              {{ resetError }}
            </div>

            <UiButton :disabled="auth.loading" @click="sendReset">
              <span v-if="auth.loading">Sending…</span>
              <span v-else>Send reset link</span>
            </UiButton>
          </div>
        </template>

        <div v-else class="auth-success">
          <UiIcon name="MailCheck" :size="16" />
          Check your email — reset link sent to <strong>{{ resetEmail }}</strong>.
        </div>

        <p class="auth-footer-link">
          <UiButton variant="ghost" size="sm" @click="showReset = false; resetSent = false">
            ← Back to sign in
          </UiButton>
        </p>
      </template>

      <!-- ── Normal login mode ───────────────────────────────────────── -->
      <template v-else>
        <h1 class="auth-title">Sign in</h1>
        <p class="auth-sub">Welcome back to your personal life OS.</p>

        <!-- Notice when Supabase not configured -->
        <div v-if="!auth.isSupabaseConfigured" class="auth-notice">
          <UiIcon name="Info" :size="14" />
          Real auth isn't active yet — use <strong>Demo mode</strong> to explore everything now.
        </div>

        <div class="auth-form">
          <div class="auth-field">
            <label class="auth-label">Email</label>
            <UiInput
              v-model="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              :disabled="auth.loading"
              :error="touched.email && !!errors.email"
              @blur="onBlur('email')"
            />
            <span v-if="touched.email && errors.email" class="auth-field-hint auth-field-hint--error">
              <UiIcon name="AlertCircle" :size="11" />{{ errors.email }}
            </span>
          </div>
          <div class="auth-field">
            <div class="auth-label-row">
              <label class="auth-label">Password</label>
              <UiButton
                v-if="auth.isSupabaseConfigured"
                variant="ghost"
                size="sm"
                @click.prevent="showReset = true"
              >
                Forgot password?
              </UiButton>
            </div>
            <div class="auth-input-wrap">
              <UiInput
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                autocomplete="current-password"
                :disabled="auth.loading"
                :error="touched.password && !!errors.password"
                @blur="onBlur('password')"
              />
              <button
                type="button"
                class="auth-eye-btn"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <UiIcon :name="showPassword ? 'EyeOff' : 'Eye'" :size="15" />
              </button>
            </div>
            <span v-if="touched.password && errors.password" class="auth-field-hint auth-field-hint--error">
              <UiIcon name="AlertCircle" :size="11" />{{ errors.password }}
            </span>
          </div>

          <!-- Soft warning when email hasn't been confirmed yet -->
          <div v-if="emailNotConfirmed" class="auth-notice auth-notice--warn">
            <UiIcon name="Mail" :size="14" style="flex-shrink:0;margin-top:1px" />
            <div class="auth-notice-body">
              <span>Please confirm your email before signing in.</span>
              <button
                class="auth-text-btn auth-text-btn--small"
                :disabled="resendingConfirm || !email.trim()"
                @click="resendConfirmation"
              >{{ resendingConfirm ? 'Sending…' : 'Resend confirmation email' }}</button>
            </div>
          </div>
          <!-- All other server errors -->
          <div v-else-if="serverError" class="auth-error">
            <UiIcon name="AlertCircle" :size="14" />
            {{ serverError }}
          </div>

          <UiButton :disabled="auth.loading || !canSubmit" @click="submit">
            <UiIcon v-if="auth.loading" name="Loader2" :size="14" class="auth-spinner" />
            <span v-if="rateLimitCooldown > 0">Try again in {{ rateLimitCooldown }}s</span>
            <span v-else>{{ auth.loading ? 'Signing in…' : 'Sign in' }}</span>
          </UiButton>
        </div>

        <div class="auth-divider"><span>or</span></div>

        <UiButton variant="ghost" @click="tryDemo">
          <UiIcon name="Play" :size="14" />
          Try demo — no account needed
        </UiButton>

        <p class="auth-footer-link">
          Don't have an account?
          <UiButton variant="ghost" size="sm" @click="router.push('/register').catch(() => {})">Create one</UiButton>
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

/* Logo */
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

/* Notice */
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
.auth-notice--warn {
  background: color-mix(in srgb, var(--color-warning) 8%, transparent);
  border-color: color-mix(in srgb, var(--color-warning) 30%, transparent);
  color: var(--color-text-secondary);
}
.auth-notice-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Success */
.auth-success {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  font-size: 14px;
  color: var(--color-text-secondary);
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success) 25%, transparent);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  line-height: 1.5;
}

/* Form */
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

.auth-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.auth-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
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

.auth-input-wrap {
  position: relative;
}

.auth-eye-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: var(--radius-xs);
  transition: color var(--t-fast);
}
.auth-eye-btn:hover { color: var(--color-text); }

@keyframes auth-spin {
  to { transform: rotate(360deg); }
}
.auth-spinner {
  animation: auth-spin 0.8s linear infinite;
  flex-shrink: 0;
}

.auth-field-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-top: -4px;
}
.auth-field-hint--error { color: var(--color-danger); }

.auth-error {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 13px;
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-danger) 20%, transparent);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  line-height: 1.4;
}

/* Buttons */
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

/* Divider */
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

.auth-text-btn--small {
  font-size: 12px;
  font-weight: 500;
}

@media (max-width: 480px) {
  .auth-page {
    align-items: flex-start;
    overflow-y: auto;
  }
  .auth-card {
    padding: 28px 20px;
    gap: 16px;
    margin: auto;
  }
}
</style>
