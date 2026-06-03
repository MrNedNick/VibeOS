<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth.store'
import { UiModal, UiIcon, UiButton, UiInput } from '@/ui'

const router = useRouter()
const auth   = useAuthStore()

const open = defineModel<boolean>('open', { required: true })

// ── Display name edit ─────────────────────────────────────────────────
const editingName  = ref(false)
const nameValue    = ref('')
const nameError    = ref<string | null>(null)
const nameSaving   = ref(false)

function startEditName() {
  nameValue.value = auth.user?.displayName ?? ''
  nameError.value = null
  editingName.value = true
}

function cancelEditName() {
  editingName.value = false
  nameError.value = null
}

async function saveName() {
  const trimmed = nameValue.value.trim()
  if (!trimmed) { nameError.value = 'Name cannot be empty.'; return }
  nameSaving.value = true
  nameError.value = null
  const result = await auth.updateDisplayName(trimmed)
  nameSaving.value = false
  if (result.error) { nameError.value = result.error; return }
  editingName.value = false
}

// ── Change password ───────────────────────────────────────────────────
const showPasswordForm = ref(false)
const newPassword      = ref('')
const confirmPassword  = ref('')
const passwordError    = ref<string | null>(null)
const passwordSuccess  = ref(false)
const showNewPwd       = ref(false)
const showConfirmPwd   = ref(false)

function togglePasswordForm() {
  showPasswordForm.value = !showPasswordForm.value
  passwordError.value = null
  passwordSuccess.value = false
  newPassword.value = ''
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
  passwordSuccess.value = true
  newPassword.value = ''
  confirmPassword.value = ''
  setTimeout(() => {
    showPasswordForm.value = false
    passwordSuccess.value = false
  }, 2000)
}

const canSavePassword = computed(() =>
  newPassword.value.length >= 8 && confirmPassword.value.length >= 8,
)

// ── Logout ────────────────────────────────────────────────────────────
async function handleLogout() {
  open.value = false
  await auth.logout()
  router.replace('/welcome')
}

function goRegister() {
  open.value = false
  router.push('/register')
}
</script>

<template>
  <UiModal v-model:open="open" size="sm">
    <div class="user-panel">

      <!-- Avatar + name / edit -->
      <div class="user-panel__identity">
        <div
          class="user-panel__avatar"
          :class="{ 'user-panel__avatar--demo': auth.isDemoMode }"
        >
          <UiIcon v-if="auth.isDemoMode" name="FlaskConical" :size="20" :stroke-width="2" />
          <span v-else class="user-panel__avatar-letter">
            {{ (auth.user?.displayName ?? auth.user?.email ?? '?')[0].toUpperCase() }}
          </span>
        </div>

        <div class="user-panel__name-block">
          <!-- Edit mode -->
          <template v-if="editingName">
            <div class="user-panel__name-edit">
              <UiInput
                v-model="nameValue"
                placeholder="Display name"
                :disabled="nameSaving"
                :error="!!nameError"
                class="user-panel__name-input"
                @keydown.enter="saveName"
                @keydown.esc="cancelEditName"
              />
              <div class="user-panel__name-edit-actions">
                <UiButton size="sm" :disabled="nameSaving" @click="saveName">
                  <UiIcon v-if="nameSaving" name="Loader2" :size="12" class="panel-spinner" />
                  <span v-else>Save</span>
                </UiButton>
                <UiButton size="sm" variant="ghost" :disabled="nameSaving" @click="cancelEditName">
                  Cancel
                </UiButton>
              </div>
              <span v-if="nameError" class="user-panel__field-error">
                <UiIcon name="AlertCircle" :size="11" />{{ nameError }}
              </span>
            </div>
          </template>

          <!-- Display mode -->
          <template v-else>
            <div class="user-panel__name-row">
              <p class="user-panel__name">
                {{ auth.isDemoMode ? 'Demo mode' : (auth.user?.displayName ?? 'User') }}
              </p>
              <button
                v-if="!auth.isDemoMode"
                class="user-panel__edit-btn"
                title="Edit display name"
                @click="startEditName"
              >
                <UiIcon name="Pencil" :size="12" />
              </button>
            </div>
            <p class="user-panel__email">{{ auth.user?.email }}</p>
          </template>
        </div>
      </div>

      <!-- Demo CTA -->
      <template v-if="auth.isDemoMode">
        <div class="user-panel__demo-cta">
          <p class="user-panel__demo-text">
            You're exploring in demo mode. Create a free account to save your data.
          </p>
          <UiButton @click="goRegister">
            <UiIcon name="UserPlus" :size="14" />
            Create free account
          </UiButton>
        </div>
      </template>

      <!-- Authenticated actions -->
      <template v-else>
        <div class="user-panel__actions">
          <button class="user-panel__action" @click="router.push('/settings'); open = false">
            <UiIcon name="Settings2" :size="16" :stroke-width="1.75" />
            <span>Settings</span>
          </button>

          <!-- Change password -->
          <button class="user-panel__action" @click="togglePasswordForm">
            <UiIcon name="KeyRound" :size="16" :stroke-width="1.75" />
            <span>Change password</span>
            <UiIcon
              :name="showPasswordForm ? 'ChevronUp' : 'ChevronDown'"
              :size="13"
              class="user-panel__action-chevron"
            />
          </button>

          <!-- Password form -->
          <Transition name="panel-expand">
            <div v-if="showPasswordForm" class="user-panel__password-form">
              <template v-if="passwordSuccess">
                <div class="user-panel__pwd-success">
                  <UiIcon name="CheckCircle2" :size="14" />
                  Password updated successfully.
                </div>
              </template>
              <template v-else>
                <div class="user-panel__pwd-field">
                  <label class="user-panel__pwd-label">New password</label>
                  <div class="user-panel__pwd-wrap">
                    <UiInput
                      v-model="newPassword"
                      :type="showNewPwd ? 'text' : 'password'"
                      placeholder="Min. 8 characters"
                      autocomplete="new-password"
                      :disabled="auth.loading"
                    />
                    <button
                      type="button"
                      class="user-panel__eye-btn"
                      :aria-label="showNewPwd ? 'Hide' : 'Show'"
                      @click="showNewPwd = !showNewPwd"
                    >
                      <UiIcon :name="showNewPwd ? 'EyeOff' : 'Eye'" :size="13" />
                    </button>
                  </div>
                </div>
                <div class="user-panel__pwd-field">
                  <label class="user-panel__pwd-label">Confirm password</label>
                  <div class="user-panel__pwd-wrap">
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
                      class="user-panel__eye-btn"
                      :aria-label="showConfirmPwd ? 'Hide' : 'Show'"
                      @click="showConfirmPwd = !showConfirmPwd"
                    >
                      <UiIcon :name="showConfirmPwd ? 'EyeOff' : 'Eye'" :size="13" />
                    </button>
                  </div>
                </div>
                <div v-if="passwordError" class="user-panel__field-error">
                  <UiIcon name="AlertCircle" :size="11" />{{ passwordError }}
                </div>
                <UiButton
                  size="sm"
                  :disabled="auth.loading || !canSavePassword"
                  @click="savePassword"
                >
                  <UiIcon v-if="auth.loading" name="Loader2" :size="12" class="panel-spinner" />
                  <span>{{ auth.loading ? 'Saving…' : 'Update password' }}</span>
                </UiButton>
              </template>
            </div>
          </Transition>
        </div>
      </template>

      <div class="user-panel__divider" />

      <UiButton variant="ghost" @click="handleLogout">
        <UiIcon name="LogOut" :size="14" />
        {{ auth.isDemoMode ? 'Exit demo' : 'Sign out' }}
      </UiButton>

    </div>
  </UiModal>
</template>

<style scoped>
.user-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0;
}

.user-panel__identity {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.user-panel__avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--color-accent-muted);
  border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-panel__avatar--demo {
  background: color-mix(in srgb, var(--color-warning) 12%, transparent);
  border-color: color-mix(in srgb, var(--color-warning) 30%, transparent);
  color: var(--color-warning);
}

.user-panel__avatar-letter {
  font-size: 18px;
  font-weight: 800;
  text-transform: uppercase;
}

.user-panel__name-block {
  flex: 1;
  min-width: 0;
}

.user-panel__name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-panel__name {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-panel__email {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-panel__edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: var(--radius-xs);
  flex-shrink: 0;
  transition: color var(--t-fast), background var(--t-fast);
}
.user-panel__edit-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-elevated);
}

.user-panel__name-edit {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-panel__name-edit-actions {
  display: flex;
  gap: 6px;
}

.user-panel__field-error {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-danger);
}

.user-panel__demo-cta {
  background: color-mix(in srgb, var(--color-accent) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 20%, transparent);
  border-radius: var(--radius);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-panel__demo-text {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--leading-relaxed);
}

.user-panel__actions {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-panel__action {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-radius: var(--radius-sm);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  color: var(--color-text-secondary);
  width: 100%;
  text-align: left;
  transition: background var(--t-fast), color var(--t-fast);
}

.user-panel__action:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.user-panel__action-chevron {
  margin-left: auto;
}

/* Password form */
.user-panel__password-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  margin: 0 -4px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.user-panel__pwd-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.user-panel__pwd-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.user-panel__pwd-wrap {
  position: relative;
}

.user-panel__eye-btn {
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
.user-panel__eye-btn:hover { color: var(--color-text); }

.user-panel__pwd-success {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: var(--color-success);
  padding: 4px 0;
}

/* Expand transition */
.panel-expand-enter-active,
.panel-expand-leave-active {
  transition: opacity 160ms var(--ease), transform 160ms var(--ease);
  transform-origin: top;
}
.panel-expand-enter-from,
.panel-expand-leave-to {
  opacity: 0;
  transform: scaleY(0.92);
}

@keyframes panel-spin {
  to { transform: rotate(360deg); }
}
.panel-spinner {
  animation: panel-spin 0.8s linear infinite;
  flex-shrink: 0;
}

.user-panel__divider {
  height: 1px;
  background: var(--color-border);
  margin: 0 -4px;
}
</style>
