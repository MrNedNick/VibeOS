<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth.store'
import { UiModal, UiIcon, UiButton } from '@/ui'

const router = useRouter()
const auth   = useAuthStore()

const open = defineModel<boolean>('open', { required: true })

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

      <!-- Avatar + name -->
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
          <p class="user-panel__name">
            {{ auth.isDemoMode ? 'Demo mode' : (auth.user?.displayName ?? 'User') }}
          </p>
          <p class="user-panel__email">{{ auth.user?.email }}</p>
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
  align-items: center;
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
  min-width: 0;
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

.user-panel__divider {
  height: 1px;
  background: var(--color-border);
  margin: 0 -4px;
}
</style>
