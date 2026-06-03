<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth.store'
import { UiIcon, UiButton, UiInput } from '@/ui'
import { useFormValidation, required, email as emailValidator, minLength, mustMatch } from '@/core/composables/useFormValidation'

const router = useRouter()
const auth = useAuthStore()

const APP_VERSION = __APP_VERSION__

const displayName = ref('')
const email       = ref('')
const password    = ref('')
const confirm     = ref('')
const serverError = ref<string | null>(null)

// "Check your email" state (when Supabase email confirmation is enabled)
const confirmationPending = ref(false)
const showPassword = ref(false)
const showConfirm  = ref(false)

// Rate limit state
const rateLimitCooldown = ref(0)
let rateLimitTimer: ReturnType<typeof setInterval> | null = null

const { errors, touched, onBlur, validate, reset } = useFormValidation(
  {
    email:    [required('Email is required'), emailValidator()],
    password: [required('Password is required'), minLength(8)],
    confirm:  [required('Please confirm your password'), mustMatch(password, "Passwords don't match")],
  },
  { email, password, confirm },
)

const canSubmit = computed(() =>
  rateLimitCooldown.value === 0 &&
  email.value.trim().length > 0 &&
  password.value.length >= 8 &&
  password.value === confirm.value,
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

  const result = await auth.register(
    email.value.trim(),
    password.value,
    displayName.value.trim() || undefined,
  )

  if (result.error) {
    if (isRateLimit(result.error)) {
      startCooldown(30)
      serverError.value = 'Too many attempts. Please wait a moment and try again.'
    } else {
      serverError.value = result.error
    }
  } else if (auth.isLoggedIn) {
    reset()
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
          <rect width="32" height="32" rx="8" fill="var(--color-accent)" />
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
              :error="touched.email && !!errors.email"
              @blur="onBlur('email')"
            />
            <span v-if="touched.email && errors.email" class="auth-field-hint auth-field-hint--error">
              <UiIcon name="AlertCircle" :size="11" />{{ errors.email }}
            </span>
          </div>
          <div class="auth-field">
            <label class="auth-label">Password <span class="auth-optional">(min. 8 chars)</span></label>
            <div class="auth-input-wrap">
              <UiInput
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Create a strong password"
                autocomplete="new-password"
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
          <div class="auth-field">
            <label class="auth-label">Confirm password</label>
            <div class="auth-input-wrap">
              <UiInput
                v-model="confirm"
                :type="showConfirm ? 'text' : 'password'"
                placeholder="Repeat password"
                autocomplete="new-password"
                :disabled="auth.loading"
                :error="touched.confirm && !!errors.confirm"
                @blur="onBlur('confirm')"
              />
              <button
                type="button"
                class="auth-eye-btn"
                :aria-label="showConfirm ? 'Hide password' : 'Show password'"
                @click="showConfirm = !showConfirm"
              >
                <UiIcon :name="showConfirm ? 'EyeOff' : 'Eye'" :size="15" />
              </button>
            </div>
            <span v-if="touched.confirm && errors.confirm" class="auth-field-hint auth-field-hint--error">
              <UiIcon name="AlertCircle" :size="11" />{{ errors.confirm }}
            </span>
            <span v-else-if="touched.confirm && confirm.length > 0" class="auth-field-hint auth-field-hint--ok">
              <UiIcon name="Check" :size="11" /> Passwords match
            </span>
          </div>

          <div v-if="serverError" class="auth-error">
            <UiIcon name="AlertCircle" :size="14" />
            {{ serverError }}
          </div>

          <UiButton :disabled="auth.loading || !canSubmit" @click="submit">
            <UiIcon v-if="auth.loading" name="Loader2" :size="14" class="auth-spinner" />
            <span v-if="rateLimitCooldown > 0">Try again in {{ rateLimitCooldown }}s</span>
            <span v-else>{{ auth.loading ? 'Creating account…' : 'Create account' }}</span>
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
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success) 25%, transparent);
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
.auth-field-hint--error { color: var(--color-danger); }
.auth-field-hint--ok    { color: var(--color-success); }

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
