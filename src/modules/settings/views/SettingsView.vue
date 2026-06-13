<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { UiButton, UiInput, UiFeedbackModal } from '@/ui'
import { useUiStore } from '@/core/stores/ui.store'
import type { Theme } from '@/core/stores/ui.store'
import { useAuthStore } from '@/core/stores/auth.store'
import { useLocale } from '@/core/i18n'
import { useStorage } from '@/core/composables/useStorage'
import { useModuleVisibility } from '@/core/composables/useModuleVisibility'
import { PLATFORM_MODULES } from '@/core/registry/modules'
import { useTrack } from '@/core/composables/useTrack'
import { useFeedback } from '@/core/composables/useFeedback'
import { useFeedbackStore } from '@/core/stores/feedback.store'
import { useInteractionBus } from '@/core/stores/interaction.store'
import { useHabitNotifications } from '@/core/composables/useHabitNotifications'
import { useToast } from '@/core/composables/useToast'
import UiIcon from '@/ui/components/UiIcon.vue'
import AllTasksPanel, { type AggregatedTask, type AggregatedShipped } from '@/modules/dashboard/components/AllTasksPanel.vue'
import { MODULE_DETAILS } from '@/modules/dashboard/data/platform-notes'

const router  = useRouter()
const uiStore = useUiStore()
const auth    = useAuthStore()
const toast   = useToast()
const i18n    = useLocale()
const { track } = useTrack()
const feedback      = useFeedback()
const feedbackStore = useFeedbackStore()
const interBus      = useInteractionBus()
const habitNotifs   = useHabitNotifications()

// Privacy & Data — analytics opt-out toggle
const analyticsEnabled = useStorage<boolean>('platform:analytics:enabled', true)

// Recent feedback entries (last 5)
const recentFeedback = computed(() => [...feedbackStore.entries].reverse().slice(0, 5))

function clearAnalyticsData(): void {
  interBus.clear()
  track('data:analytics-cleared')
}

// ── Email confirmation banner ────────────────────────────────────
const confirmResending = ref(false)

async function resendEmailConfirmation() {
  if (!auth.user?.email) return
  confirmResending.value = true
  const result = await auth.resendConfirmation(auth.user.email)
  confirmResending.value = false
  if (result.error) toast.error(result.error)
  else toast.success('Confirmation email sent — check your inbox.')
}

// ── Avatar upload ─────────────────────────────────────────────────
const avatarInputRef  = ref<HTMLInputElement>()
const avatarUploading = ref(false)
const avatarError     = ref<string | null>(null)

function triggerAvatarPick() {
  if (auth.isDemoMode) return
  avatarInputRef.value?.click()
}

async function onAvatarFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) { avatarError.value = 'Please select an image file.'; return }
  avatarUploading.value = true
  avatarError.value     = null
  const result = await auth.updateAvatar(file)
  avatarUploading.value = false
  if (result.error) { avatarError.value = result.error; return }
  toast.success('Profile picture updated!')
}

// ── Profile: first/last name edit ─────────────────────────────────
const editingName  = ref(false)
const firstName    = ref('')
const lastName     = ref('')
const nameError    = ref<string | null>(null)
const nameSaving   = ref(false)

function startEditName() {
  const parts = (auth.user?.displayName ?? '').trim().split(/\s+/).filter(Boolean)
  firstName.value   = parts[0] ?? ''
  lastName.value    = parts.slice(1).join(' ')
  nameError.value   = null
  editingName.value = true
}

function cancelEditName() {
  editingName.value = false
  nameError.value   = null
}

async function saveName() {
  const first = firstName.value.trim()
  const last  = lastName.value.trim()
  if (!first) { nameError.value = 'First name is required.'; return }
  const fullName = last ? `${first} ${last}` : first
  nameSaving.value = true
  nameError.value  = null
  const result = await auth.updateDisplayName(fullName)
  nameSaving.value = false
  if (result.error) { nameError.value = result.error; return }
  toast.success('Profile name updated!')
  editingName.value = false
}

// ── Security: change password ─────────────────────────────────────
const showPasswordForm = ref(false)
const newPassword      = ref('')
const confirmPassword  = ref('')
const passwordError    = ref<string | null>(null)
const passwordSuccess  = ref(false)
const showNewPwd       = ref(false)
const showConfirmPwd   = ref(false)

function togglePasswordForm() {
  showPasswordForm.value = !showPasswordForm.value
  passwordError.value   = null
  passwordSuccess.value = false
  newPassword.value     = ''
  confirmPassword.value = ''
}

async function savePassword() {
  passwordError.value = null
  if (newPassword.value.length < 8) {
    passwordError.value = 'Password must be at least 8 characters.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = "Passwords don't match."
    return
  }
  const result = await auth.updatePassword(newPassword.value)
  if (result.error) { passwordError.value = result.error; return }
  toast.success('Password updated!')
  passwordSuccess.value = true
  newPassword.value     = ''
  confirmPassword.value = ''
  setTimeout(() => {
    showPasswordForm.value = false
    passwordSuccess.value  = false
  }, 2000)
}

const canSavePassword = computed(() =>
  newPassword.value.length >= 8 && confirmPassword.value.length >= 8,
)

// ── Email change ──────────────────────────────────────────────────
const showEmailForm     = ref(false)
const newEmailValue     = ref('')
const emailChangeError  = ref<string | null>(null)
const emailChangePending = ref(false)
const emailChangeSaving  = ref(false)

function openEmailForm() {
  showEmailForm.value     = true
  newEmailValue.value     = ''
  emailChangeError.value  = null
  emailChangePending.value = false
}

function closeEmailForm() {
  showEmailForm.value     = false
  emailChangePending.value = false
}

async function submitEmailChange() {
  const email = newEmailValue.value.trim()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailChangeError.value = 'Enter a valid email address.'
    return
  }
  emailChangeSaving.value = true
  emailChangeError.value  = null
  const result = await auth.requestEmailChange(email)
  emailChangeSaving.value = false
  if (result.error) { emailChangeError.value = result.error; return }
  emailChangePending.value = true
  toast.success('Confirmation emails sent!')
}

async function handleLogout() {
  await auth.logout()
  toast.info('You\'ve been signed out.')
  router.replace('/welcome').catch(() => {})
}

function goRegister() {
  router.push('/register')
}

// ── Vibe-paks ─────────────────────────────────────────────────────
interface VibePak {
  id: Theme
  nameKey: string
  swatches: string[]
  label: string
}

const VIBE_PAKS: VibePak[] = [
  { id: 'dark',      nameKey: 'settings.themeDark',      swatches: ['#0b0f1a', '#5c7cfa', '#f0f0f4'], label: 'Navy'     },
  { id: 'light',     nameKey: 'settings.themeLight',     swatches: ['#eef1f7', '#2563eb', '#0d1117'], label: 'Frosted'  },
  { id: 'brutalist', nameKey: 'settings.themeBrutalist', swatches: ['#f0ede8', '#000000', '#000000'], label: 'Stark'    },
  { id: 'crt',       nameKey: 'settings.themeCrt',       swatches: ['#091209', '#52c46a', '#a8d8a8'], label: 'Terminal' },
  { id: 'system',    nameKey: 'settings.themeSystem',    swatches: ['#0a0a0a', '#eef1f7', '#5c7cfa'], label: 'Auto'     },
]

// ── Module visibility ─────────────────────────────────────────────
const { isVisible, toggleModule } = useModuleVisibility()
const toggleableModules = PLATFORM_MODULES.filter(m => m.section !== 'system')
const modulesOpen = ref(false)

const activeModulesCount = computed(() => toggleableModules.filter(m => isVisible(m.id)).length)

// ── API keys ──────────────────────────────────────────────────────
const anthropicKey  = useStorage<string>('platform:studio:apikey', '')
const showAnthropic = ref(false)

// ── Admin panel data ──────────────────────────────────────────────
const adminTasks = computed<AggregatedTask[]>(() => {
  const result: AggregatedTask[] = []
  for (const mod of PLATFORM_MODULES) {
    const detail = MODULE_DETAILS[mod.id]
    if (!detail) continue
    for (const task of (detail.nextTasks ?? [])) {
      result.push({ label: task.label, priority: task.priority, moduleId: mod.id, moduleLabel: mod.label, moduleIcon: mod.icon })
    }
  }
  return result.sort((a, b) => {
    const ord = { high: 0, medium: 1, low: 2 } as const
    return (ord[a.priority] ?? 3) - (ord[b.priority] ?? 3)
  })
})
const adminShipped = computed<AggregatedShipped[]>(() => {
  const result: AggregatedShipped[] = []
  for (const mod of PLATFORM_MODULES) {
    const detail = MODULE_DETAILS[mod.id]
    if (!detail) continue
    for (const shipped of detail.shippedTasks) {
      result.push({ label: shipped.label, date: shipped.date, moduleId: mod.id, moduleLabel: mod.label, moduleIcon: mod.icon })
    }
  }
  return result.sort((a, b) => b.date.localeCompare(a.date))
})

// ── Data section ──────────────────────────────────────────────────
const clearConfirm  = ref(false)
const importConfirm = ref(false)
const importPayload = ref<Record<string, unknown> | null>(null)
const fileInputRef  = ref<HTMLInputElement>()
let clearTimer: ReturnType<typeof setTimeout> | null = null

function exportData() {
  const snapshot: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!
    try {
      snapshot[key] = JSON.parse(localStorage.getItem(key) ?? 'null')
    } catch {
      snapshot[key] = localStorage.getItem(key)
    }
  }
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `vibeos-backup-${new Date().toISOString().slice(0, 10)}.json`,
  })
  a.click()
  URL.revokeObjectURL(url)
  track('data:exported', { format: 'json' })
  toast.success('Data exported successfully')
}

function startClear() {
  clearConfirm.value = true
  clearTimer = setTimeout(() => { clearConfirm.value = false }, 5000)
}

function confirmClear() {
  if (clearTimer) clearTimeout(clearTimer)
  localStorage.clear()
  clearConfirm.value = false
  window.location.reload()
}

function cancelClear() {
  if (clearTimer) clearTimeout(clearTimer)
  clearConfirm.value = false
}

function triggerImport() {
  fileInputRef.value?.click()
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  ;(e.target as HTMLInputElement).value = ''
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target?.result as string)
      if (typeof data !== 'object' || data === null) throw new Error('Not an object')
      importPayload.value = data as Record<string, unknown>
      importConfirm.value = true
    } catch {
      alert('Invalid backup file — expected a VibeOS JSON export.')
    }
  }
  reader.readAsText(file)
}

function confirmImport() {
  if (!importPayload.value) return
  for (const [key, value] of Object.entries(importPayload.value)) {
    if (value === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    }
  }
  importConfirm.value = false
  importPayload.value = null
  window.location.reload()
}

function cancelImport() {
  importConfirm.value = false
  importPayload.value = null
}
</script>

<template>
  <div class="settings">
    <div class="settings__header">
      <h1 class="settings__title">Settings</h1>
      <p class="settings__desc">Manage your profile, appearance, and data.</p>
    </div>

    <!-- ── Profile ───────────────────────────────────────── -->
    <section class="settings__section">
      <h2 class="settings__section-title">Profile</h2>

      <div class="profile-identity">
        <!-- Avatar -->
        <!-- Avatar: clickable to upload (non-demo only) -->
        <button
          class="profile-avatar"
          :class="{ 'profile-avatar--demo': auth.isDemoMode, 'profile-avatar--uploading': avatarUploading }"
          :title="auth.isDemoMode ? undefined : 'Change profile picture'"
          :disabled="auth.isDemoMode"
          @click="triggerAvatarPick"
        >
          <UiIcon v-if="auth.isDemoMode" name="FlaskConical" :size="22" :stroke-width="2" />
          <UiIcon v-else-if="avatarUploading" name="Loader2" :size="18" class="spin" />
          <img
            v-else-if="auth.user?.avatarUrl"
            :src="auth.user.avatarUrl"
            class="profile-avatar__img"
            alt="Avatar"
          />
          <span v-else class="profile-avatar__letter">{{ auth.initials }}</span>
          <!-- Camera icon overlay on hover -->
          <span v-if="!auth.isDemoMode && !avatarUploading" class="profile-avatar__overlay">
            <UiIcon name="Camera" :size="14" />
          </span>
        </button>
        <input
          ref="avatarInputRef"
          type="file"
          accept="image/*"
          class="sr-only"
          @change="onAvatarFileChange"
        />
        <span v-if="avatarError" class="profile-field-error" style="align-self:center">
          <UiIcon name="AlertCircle" :size="12" />{{ avatarError }}
        </span>

        <!-- Name + email block -->
        <div class="profile-info">
          <!-- Edit mode -->
          <template v-if="editingName">
            <div class="profile-name-edit">
              <div class="profile-name-edit__fields">
                <UiInput
                  v-model="firstName"
                  placeholder="First name"
                  :disabled="nameSaving"
                  :error="!!nameError"
                  @keydown.enter="saveName"
                  @keydown.esc="cancelEditName"
                />
                <UiInput
                  v-model="lastName"
                  placeholder="Last name"
                  :disabled="nameSaving"
                  @keydown.enter="saveName"
                  @keydown.esc="cancelEditName"
                />
              </div>
              <div class="profile-name-edit__actions">
                <UiButton size="sm" :disabled="nameSaving" @click="saveName">
                  <UiIcon v-if="nameSaving" name="Loader2" :size="13" class="spin" />
                  <span v-else>Save</span>
                </UiButton>
                <UiButton size="sm" variant="ghost" :disabled="nameSaving" @click="cancelEditName">
                  Cancel
                </UiButton>
              </div>
              <span v-if="nameError" class="profile-field-error">
                <UiIcon name="AlertCircle" :size="12" />{{ nameError }}
              </span>
            </div>
          </template>

          <!-- Display mode -->
          <template v-else>
            <div class="profile-name-row">
              <p class="profile-name">
                {{ auth.isDemoMode ? 'Demo mode' : (auth.user?.displayName ?? 'User') }}
              </p>
              <button
                v-if="!auth.isDemoMode"
                class="profile-edit-btn"
                title="Edit display name"
                @click="startEditName"
              >
                <UiIcon name="Pencil" :size="13" />
                <span>Edit</span>
              </button>
            </div>
            <p class="profile-email">{{ auth.user?.email }}</p>
          </template>
        </div>
      </div>

      <!-- Email confirmation banner — shown only when email hasn't been verified yet -->
      <div v-if="auth.isRealUser && !auth.emailConfirmed" class="profile-confirm-banner">
        <UiIcon name="Mail" :size="15" class="profile-confirm-banner__icon" />
        <div class="profile-confirm-banner__body">
          <span class="profile-confirm-banner__title">Confirm your email</span>
          <p class="profile-confirm-banner__text">Check your inbox for a confirmation link to verify your address.</p>
        </div>
        <UiButton variant="ghost" size="sm" :disabled="confirmResending" @click="resendEmailConfirmation">
          <UiIcon v-if="confirmResending" name="Loader2" :size="13" class="spin" />
          <span v-else>Resend</span>
        </UiButton>
      </div>

      <!-- Demo CTA -->
      <div v-if="auth.isDemoMode" class="profile-demo-cta">
        <p class="profile-demo-text">
          You're exploring in demo mode. Create a free account to save your data.
        </p>
        <UiButton @click="goRegister">
          <UiIcon name="UserPlus" :size="14" />
          Create free account
        </UiButton>
        <UiButton variant="ghost" @click="handleLogout">
          <UiIcon name="LogOut" :size="14" />
          Exit demo
        </UiButton>
      </div>

      <!-- Sign out — placed here so it's visually adjacent to name/avatar -->
      <div v-if="!auth.isDemoMode" class="profile-signout-row">
        <UiButton variant="danger" size="sm" @click="handleLogout">
          <UiIcon name="LogOut" :size="14" />
          Sign out
        </UiButton>
        <p class="profile-signout-hint">Ends your current session on this device.</p>
      </div>
    </section>

    <!-- ── Security ──────────────────────────────────────── -->
    <section v-if="!auth.isDemoMode" class="settings__section">
      <h2 class="settings__section-title">Security</h2>

      <!-- Change password accordion row -->
      <div class="settings__row">
        <div>
          <span class="settings__row-name">Password</span>
          <p class="settings__row-hint">Update your account password.</p>
        </div>
        <UiButton variant="ghost" size="sm" @click="togglePasswordForm">
          <UiIcon :name="showPasswordForm ? 'ChevronUp' : 'KeyRound'" :size="14" />
          {{ showPasswordForm ? 'Cancel' : 'Change' }}
        </UiButton>
      </div>

      <!-- Password form -->
      <Transition name="expand">
        <div v-if="showPasswordForm" class="security-pwd-form">
          <template v-if="passwordSuccess">
            <div class="security-pwd-success">
              <UiIcon name="CheckCircle2" :size="15" />
              Password updated successfully.
            </div>
          </template>
          <template v-else>
            <div class="security-pwd-field">
              <label class="security-pwd-label">New password</label>
              <div class="security-pwd-wrap">
                <UiInput
                  v-model="newPassword"
                  :type="showNewPwd ? 'text' : 'password'"
                  placeholder="Min. 8 characters"
                  autocomplete="new-password"
                  :disabled="auth.loading"
                />
                <button
                  type="button"
                  class="security-eye-btn"
                  :aria-label="showNewPwd ? 'Hide' : 'Show'"
                  @click="showNewPwd = !showNewPwd"
                >
                  <UiIcon :name="showNewPwd ? 'EyeOff' : 'Eye'" :size="14" />
                </button>
              </div>
            </div>
            <div class="security-pwd-field">
              <label class="security-pwd-label">Confirm password</label>
              <div class="security-pwd-wrap">
                <UiInput
                  v-model="confirmPassword"
                  :type="showConfirmPwd ? 'text' : 'password'"
                  placeholder="Repeat password"
                  autocomplete="new-password"
                  :disabled="auth.loading"
                  @keydown.enter="savePassword"
                />
                <button
                  type="button"
                  class="security-eye-btn"
                  :aria-label="showConfirmPwd ? 'Hide' : 'Show'"
                  @click="showConfirmPwd = !showConfirmPwd"
                >
                  <UiIcon :name="showConfirmPwd ? 'EyeOff' : 'Eye'" :size="14" />
                </button>
              </div>
            </div>
            <div v-if="passwordError" class="profile-field-error">
              <UiIcon name="AlertCircle" :size="12" />{{ passwordError }}
            </div>
            <UiButton
              size="sm"
              :disabled="auth.loading || !canSavePassword"
              @click="savePassword"
            >
              <UiIcon v-if="auth.loading" name="Loader2" :size="13" class="spin" />
              <span>{{ auth.loading ? 'Saving…' : 'Update password' }}</span>
            </UiButton>
          </template>
        </div>
      </Transition>

    </section>

    <!-- ── Email ──────────────────────────────────────────── -->
    <section v-if="!auth.isDemoMode" class="settings__section">
      <h2 class="settings__section-title">Email address</h2>

      <!-- Show current + open form -->
      <div v-if="!showEmailForm" class="settings__row">
        <div>
          <span class="settings__row-name">{{ auth.user?.email }}</span>
          <p class="settings__row-hint">Your sign-in email address.</p>
        </div>
        <UiButton variant="outline" size="sm" @click="openEmailForm">Change email</UiButton>
      </div>

      <!-- Email change form -->
      <div v-else class="email-change">
        <template v-if="!emailChangePending">
          <p class="email-change__desc">
            Enter your new email. Supabase will send a confirmation link to <strong>both</strong> your current and new address — the change takes effect when you confirm both.
          </p>
          <UiInput
            v-model="newEmailValue"
            type="email"
            placeholder="new@email.com"
            :disabled="emailChangeSaving"
            :error="!!emailChangeError"
            @keydown.enter="submitEmailChange"
            @keydown.esc="closeEmailForm"
          />
          <span v-if="emailChangeError" class="profile-field-error">
            <UiIcon name="AlertCircle" :size="12" />{{ emailChangeError }}
          </span>
          <div class="email-change__actions">
            <UiButton :disabled="emailChangeSaving" @click="submitEmailChange">
              <UiIcon v-if="emailChangeSaving" name="Loader2" :size="13" class="spin" />
              <span v-else>Send confirmation</span>
            </UiButton>
            <UiButton variant="ghost" :disabled="emailChangeSaving" @click="closeEmailForm">Cancel</UiButton>
          </div>
        </template>
        <template v-else>
          <div class="email-change__pending">
            <UiIcon name="MailCheck" :size="24" class="email-change__pending-icon" />
            <div>
              <p class="email-change__pending-title">Check your inboxes</p>
              <p class="email-change__pending-desc">Confirmation emails sent to your current and new address. Click both links to complete the change.</p>
            </div>
          </div>
          <UiButton variant="ghost" size="sm" @click="closeEmailForm">Done</UiButton>
        </template>
      </div>
    </section>

    <!-- ── Appearance ──────────────────────────────────────── -->
    <section class="settings__section">
      <h2 class="settings__section-title">{{ i18n.t('settings.sectionAppearance') }}</h2>

      <!-- Vibe-paks -->
      <div class="settings__row settings__row--col">
        <div>
          <span class="settings__row-name">{{ i18n.t('settings.vibePaks') }}</span>
          <p class="settings__row-hint">{{ i18n.t('settings.vibePaksSub') }}</p>
        </div>
        <div class="pak-grid">
          <button
            v-for="pak in VIBE_PAKS"
            :key="pak.id"
            class="pak-card"
            :class="{ 'pak-card--active': uiStore.theme === pak.id }"
            @click="uiStore.setTheme(pak.id); track('theme:changed', { theme: pak.id })"
          >
            <div class="pak-preview">
              <span
                v-for="(swatch, si) in pak.swatches"
                :key="si"
                class="pak-swatch"
                :style="{ background: swatch }"
              />
            </div>
            <span class="pak-name">{{ i18n.t(pak.nameKey) }}</span>
            <span class="pak-label">{{ pak.label }}</span>
            <span v-if="uiStore.theme === pak.id" class="pak-check">✓</span>
          </button>
        </div>
      </div>

      <div class="settings__row">
        <span class="settings__row-name">{{ i18n.t('settings.langLabel') }}</span>
        <div class="settings__toggle">
          <button
            class="settings__toggle-btn"
            :class="{ 'settings__toggle-btn--active': i18n.locale === 'ru' }"
            @click="i18n.setLocale('ru')"
          >Русский</button>
          <button
            class="settings__toggle-btn"
            :class="{ 'settings__toggle-btn--active': i18n.locale === 'en' }"
            @click="i18n.setLocale('en')"
          >English</button>
        </div>
      </div>
    </section>

    <!-- ── Modules ───────────────────────────────────────── -->
    <section class="settings__section">
      <button class="settings__section-accordion" @click="modulesOpen = !modulesOpen">
        <h2 class="settings__section-title">Modules</h2>
        <span class="settings__section-count">{{ activeModulesCount }} / {{ toggleableModules.length }} active</span>
        <UiIcon
          :name="modulesOpen ? 'ChevronUp' : 'ChevronDown'"
          :size="15"
          class="settings__section-chevron"
        />
      </button>

      <Transition name="expand">
        <div v-if="modulesOpen" class="settings__modules-list">
          <p class="settings__row-hint" style="margin: 0 0 6px;">
            Toggle modules on or off in the sidebar. System modules are always shown.
          </p>
          <div
            v-for="mod in toggleableModules"
            :key="mod.id"
            class="settings__row settings__module-row"
          >
            <div class="settings__module-info">
              <span class="settings__row-name">{{ mod.label }}</span>
              <p class="settings__row-hint">{{ mod.description }}</p>
            </div>
            <button
              class="settings__vis-toggle"
              :class="{ 'settings__vis-toggle--on': isVisible(mod.id) }"
              :title="isVisible(mod.id) ? 'Click to hide' : 'Click to show'"
              @click="toggleModule(mod.id); track('module:visibility-toggled', { module: mod.id, nowVisible: !isVisible(mod.id) })"
            >
              <span class="settings__vis-knob" />
            </button>
          </div>
        </div>
      </Transition>
    </section>

    <!-- ── API Keys ──────────────────────────────────────── -->
    <section class="settings__section">
      <h2 class="settings__section-title">{{ i18n.t('settings.sectionApiKeys') }}</h2>

      <div class="settings__row settings__row--col">
        <div>
          <span class="settings__row-name">{{ i18n.t('settings.anthropicKeyLabel') }}</span>
          <p class="settings__row-hint">{{ i18n.t('settings.anthropicKeyHint') }}</p>
        </div>
        <div class="settings__key-row">
          <UiInput
            v-model="anthropicKey"
            :type="showAnthropic ? 'text' : 'password'"
            placeholder="sk-ant-…"
            spellcheck="false"
            autocomplete="off"
          />
          <UiButton variant="ghost" size="sm" @click="showAnthropic = !showAnthropic">
            {{ showAnthropic ? i18n.t('settings.keyHide') : i18n.t('settings.keyShow') }}
          </UiButton>
          <span class="settings__key-status" :class="{ 'settings__key-status--set': anthropicKey }">
            {{ anthropicKey ? i18n.t('settings.keySet') : i18n.t('settings.keyNotSet') }}
          </span>
        </div>
      </div>
    </section>

    <!-- ── Data ────────────────────────────────────────── -->
    <section class="settings__section">
      <h2 class="settings__section-title">{{ i18n.t('settings.sectionData') }}</h2>

      <div class="settings__row">
        <div>
          <span class="settings__row-name">{{ i18n.t('settings.exportLabel') }}</span>
          <p class="settings__row-hint">{{ i18n.t('settings.exportHint') }}</p>
        </div>
        <UiButton variant="ghost" @click="exportData">
          {{ i18n.t('settings.exportBtn') }}
        </UiButton>
      </div>

      <div class="settings__row">
        <div>
          <span class="settings__row-name">{{ i18n.t('settings.importLabel') }}</span>
          <p class="settings__row-hint">{{ i18n.t('settings.importHint') }}</p>
        </div>
        <div class="settings__import-actions">
          <template v-if="!importConfirm">
            <UiButton variant="ghost" @click="triggerImport">
              {{ i18n.t('settings.importBtn') }}
            </UiButton>
            <input
              ref="fileInputRef"
              type="file"
              accept=".json,application/json"
              class="settings__file-input"
              @change="onFileChange"
            />
          </template>
          <template v-else>
            <span class="settings__danger-confirm">{{ i18n.t('settings.importConfirm') }}</span>
            <UiButton variant="danger" @click="confirmImport">
              {{ i18n.t('settings.importYes') }}
            </UiButton>
            <UiButton variant="ghost" @click="cancelImport">
              {{ i18n.t('settings.importNo') }}
            </UiButton>
          </template>
        </div>
      </div>

      <div class="settings__row settings__row--danger">
        <div>
          <span class="settings__row-name">{{ i18n.t('settings.clearLabel') }}</span>
          <p class="settings__row-hint">{{ i18n.t('settings.clearHint') }}</p>
        </div>
        <div class="settings__clear-actions">
          <template v-if="!clearConfirm">
            <UiButton variant="danger" @click="startClear">
              {{ i18n.t('settings.clearBtn') }}
            </UiButton>
          </template>
          <template v-else>
            <span class="settings__danger-confirm">{{ i18n.t('settings.clearConfirm') }}</span>
            <UiButton variant="danger" @click="confirmClear">
              {{ i18n.t('settings.clearYes') }}
            </UiButton>
            <UiButton variant="ghost" @click="cancelClear">
              {{ i18n.t('settings.clearNo') }}
            </UiButton>
          </template>
        </div>
      </div>
    </section>

    <!-- ── Privacy & Data ───────────────────────────────── -->
    <section class="settings__section">
      <h2 class="settings__section-title">Privacy & Data</h2>

      <div class="settings__row">
        <div class="settings__row-info">
          <span class="settings__row-name">Usage analytics</span>
          <p class="settings__row-hint">Track which modules and features you use. Stays local, never shared.</p>
        </div>
        <button
          class="settings__vis-toggle"
          :class="{ 'settings__vis-toggle--on': analyticsEnabled }"
          title="Toggle usage analytics"
          @click="analyticsEnabled = !analyticsEnabled"
        >
          <span class="settings__vis-knob" />
        </button>
      </div>

      <div class="settings__row">
        <div class="settings__row-info">
          <span class="settings__row-name">Habit streak reminders</span>
          <p class="settings__row-hint">Browser notification at 21:00 when a habit with a streak ≥ 2 isn't done yet.
            <template v-if="habitNotifs.permission.value === 'denied'"> (Notifications blocked in browser — allow them first.)</template>
          </p>
        </div>
        <button
          class="settings__vis-toggle"
          :class="{ 'settings__vis-toggle--on': habitNotifs.enabled.value }"
          title="Toggle habit notifications"
          @click="habitNotifs.enabled.value ? habitNotifs.disable() : habitNotifs.enable()"
        >
          <span class="settings__vis-knob" />
        </button>
      </div>

      <div class="settings__row settings__row--col">
        <div>
          <span class="settings__row-name">Feedback history</span>
          <p class="settings__row-hint">Your past NPS submissions.</p>
        </div>
        <div v-if="recentFeedback.length" class="pv-feedback-list">
          <div
            v-for="entry in recentFeedback"
            :key="entry.id"
            class="pv-feedback-row"
          >
            <span class="pv-feedback-score" :class="{
              'pv-feedback-score--low':  entry.score <= 6,
              'pv-feedback-score--mid':  entry.score >= 7 && entry.score <= 8,
              'pv-feedback-score--high': entry.score >= 9,
            }">{{ entry.score }}/10</span>
            <span class="pv-feedback-date">{{ new Date(entry.timestamp).toLocaleDateString() }}</span>
            <span v-if="entry.comment" class="pv-feedback-comment">"{{ entry.comment }}"</span>
          </div>
        </div>
        <p v-else class="pv-feedback-empty">No feedback submitted yet.</p>
      </div>

      <div class="settings__row">
        <div class="settings__row-info">
          <span class="settings__row-name">Submit feedback now</span>
          <p class="settings__row-hint">Rate VibeOS and share a comment.</p>
        </div>
        <UiButton variant="ghost" @click="feedback.openManually()">
          Submit feedback
        </UiButton>
      </div>

      <div class="settings__row">
        <div class="settings__row-info">
          <span class="settings__row-name">Clear analytics data</span>
          <p class="settings__row-hint">Remove all recorded usage events from this device.</p>
        </div>
        <UiButton variant="ghost" @click="clearAnalyticsData">
          Clear events
        </UiButton>
      </div>
    </section>

    <!-- Admin panel — only visible to admin accounts ─────────────── -->
    <section v-if="auth.isAdmin" class="settings__section settings__section--admin">
      <h2 class="settings__section-title">
        <UiIcon name="Shield" :size="16" style="vertical-align: -2px; margin-right: 6px;" />
        Dev / Admin
      </h2>
      <p class="settings__admin-hint">Platform tasks and module status. Only visible to admin accounts.</p>
      <AllTasksPanel :tasks="adminTasks" :shipped-tasks="adminShipped" />
    </section>

    <!-- Feedback modal — must stay inside the single root element so Transition can animate -->
    <UiFeedbackModal
      v-model:open="feedback.isOpen.value"
      @submitted="(score, comment) => { feedback.markSubmitted(score, comment); toast.success('Feedback received — thank you! 🙏') }"
      @dismissed="feedback.markDismissed()"
    />
  </div>
</template>

<style scoped>
.settings {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.settings__header { margin-bottom: 12px; }

.settings__title {
  font-size: 27px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.settings__desc {
  font-size: 15px;
  color: var(--color-text-muted);
  margin: 6px 0 0;
  line-height: var(--leading-relaxed);
}

/* Section */
.settings__section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.settings__section--admin {
  border-color: color-mix(in srgb, var(--color-warning) 40%, var(--color-border));
}

.settings__admin-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: var(--leading-relaxed);
}

.settings__section-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Accordion header for Modules */
.settings__section-accordion {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-family: inherit;
  margin: -2px 0;
}

.settings__section-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 2px 8px;
  border-radius: 99px;
  white-space: nowrap;
}

.settings__section-chevron {
  margin-left: auto;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.settings__modules-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 4px;
  border-top: 1px solid var(--color-border);
  margin-top: -4px;
}

/* Row */
.settings__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 40px;
}

.settings__row--danger {
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
}

.settings__row-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
}

.settings__row-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 3px 0 0;
  line-height: 1.4;
}

/* Toggle */
.settings__toggle {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.settings__toggle-btn {
  padding: 5px 14px;
  border-radius: var(--radius-xs);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: background var(--t-fast), color var(--t-fast);
  cursor: pointer;
}
.settings__toggle-btn:hover:not(.settings__toggle-btn--active) {
  color: var(--color-text);
  background: var(--color-border);
}
.settings__toggle-btn--active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
  cursor: default;
}

.settings__import-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.settings__file-input { display: none; }

.settings__clear-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.settings__danger-confirm {
  font-size: 13px;
  color: var(--color-danger);
  font-weight: 500;
}

/* API Key rows */
.settings__row--col { flex-direction: column; align-items: flex-start; gap: 10px; }

.settings__key-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  flex-wrap: wrap;
}

.settings__key-status {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.settings__key-status--set { color: var(--color-success); }

/* Vibe-pak picker */
.pak-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  width: 100%;
}

.pak-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 10px 12px;
  border-radius: var(--radius);
  border: 2px solid var(--color-border);
  background: var(--color-surface-elevated);
  cursor: pointer;
  transition: border-color var(--t-fast), box-shadow var(--t-fast), transform var(--t-fast);
  min-width: 0;
  min-height: 0;
}
.pak-card:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
.pak-card--active {
  border-color: var(--color-accent);
  background: var(--color-accent-muted);
  box-shadow: var(--shadow);
}

.pak-preview {
  display: flex;
  gap: 4px;
  align-items: center;
}
.pak-swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.2);
  flex-shrink: 0;
}

.pak-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
}
.pak-label {
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.pak-check {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-accent);
}

/* Module visibility toggles */
.settings__module-row { min-height: 48px; }
.settings__module-info { flex: 1; min-width: 0; }

.settings__vis-toggle {
  position: relative;
  width: 42px;
  height: 24px;
  min-height: 0;
  min-width: 0;
  border-radius: 99px;
  background: var(--color-border);
  border: none;
  cursor: pointer;
  transition: background var(--t-fast);
  flex-shrink: 0;
}
.settings__vis-toggle--on { background: var(--color-accent); }

.settings__vis-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,.25);
  transition: transform var(--t-fast);
  display: block;
}
.settings__vis-toggle--on .settings__vis-knob { transform: translateX(18px); }

/* ── Profile section ────────────────────────────────────────────── */
.profile-identity {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.profile-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--color-accent-muted);
  border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: border-color var(--t-fast);
}
.profile-avatar:not(.profile-avatar--demo):hover {
  border-color: var(--color-accent);
}
.profile-avatar:not(.profile-avatar--demo):hover .profile-avatar__overlay {
  opacity: 1;
}

.profile-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar__overlay {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--color-bg) 55%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--t-fast);
  color: var(--color-text);
}

.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
}

.profile-avatar--demo {
  background: color-mix(in srgb, var(--color-warning) 12%, transparent);
  border-color: color-mix(in srgb, var(--color-warning) 30%, transparent);
  color: var(--color-warning);
}

.profile-avatar__letter {
  font-size: 22px;
  font-weight: 800;
  text-transform: uppercase;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.profile-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.profile-email {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 4px 0 0;
}

.profile-edit-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.profile-edit-btn:hover {
  background: var(--color-accent-muted);
  color: var(--color-accent);
  border-color: color-mix(in srgb, var(--color-accent) 30%, transparent);
}

.profile-name-edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-name-edit__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.profile-name-edit__actions {
  display: flex;
  gap: 6px;
}

.profile-field-error {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-danger);
}

.profile-confirm-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--color-warning) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-warning) 30%, transparent);
  border-radius: var(--radius);
}
.profile-confirm-banner__icon {
  color: var(--color-warning);
  flex-shrink: 0;
}
.profile-confirm-banner__body {
  flex: 1;
  min-width: 0;
}
.profile-confirm-banner__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}
.profile-confirm-banner__text {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 2px 0 0;
  line-height: 1.4;
}

.profile-demo-cta {
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 20%, transparent);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-demo-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--leading-relaxed);
}

.profile-signout-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
}

.profile-signout-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Security section ───────────────────────────────────────────── */
.security-pwd-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.security-pwd-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.security-pwd-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.security-pwd-wrap {
  position: relative;
}

.security-eye-btn {
  position: absolute;
  right: 8px;
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
.security-eye-btn:hover { color: var(--color-text); }

.security-pwd-success {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-success);
  padding: 4px 0;
}

/* Expand transition */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 160ms var(--ease), transform 160ms var(--ease);
  transform-origin: top;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: scaleY(0.94);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
.spin {
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

/* Privacy & Data */
.pv-feedback-list { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
.pv-feedback-row  { display: flex; align-items: baseline; gap: 10px; font-size: 13px; }
.pv-feedback-score { font-weight: 700; font-family: var(--font-mono); min-width: 36px; }
.pv-feedback-score--low  { color: var(--color-danger); }
.pv-feedback-score--mid  { color: var(--color-warning); }
.pv-feedback-score--high { color: var(--color-success); }
.pv-feedback-date { font-size: 11px; color: var(--color-text-muted); }
.pv-feedback-comment { font-size: 12px; color: var(--color-text-secondary); font-style: italic; }
.pv-feedback-empty { font-size: 13px; color: var(--color-text-muted); margin: 4px 0 0; }

/* ── Email change section ───────────────────────────────────────── */
.email-change {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.email-change__desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: var(--leading-relaxed);
}

.email-change__actions {
  display: flex;
  gap: 8px;
}

.email-change__pending {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px;
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success) 25%, transparent);
  border-radius: var(--radius-md);
}

.email-change__pending-icon { color: var(--color-success); flex-shrink: 0; margin-top: 2px; }

.email-change__pending-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 4px;
}

.email-change__pending-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: var(--leading-relaxed);
}

@media (max-width: 767px) {
  .settings { max-width: 100%; }
  .settings__section { padding: 16px 16px; }
  .settings__row { flex-direction: column; align-items: flex-start; gap: 10px; }
  .settings__module-row { flex-direction: row; align-items: center; }
  .settings__clear-actions { flex-wrap: wrap; }
  .pak-grid { grid-template-columns: repeat(2, 1fr); }
  .profile-name { font-size: 16px; }
}
</style>
