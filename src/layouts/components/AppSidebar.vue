<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PLATFORM_MODULES, type ModuleMeta } from '@/core/registry/modules'
import { useUiStore } from '@/core/stores/ui.store'
import { useAuthStore } from '@/core/stores/auth.store'
import { useLocale } from '@/core/i18n'
import { UiIcon } from '@/ui'

const route  = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const auth = useAuthStore()
const i18n = useLocale()

function logout() {
  auth.logout()
  router.push('/welcome')
}

const systemModules = computed(() => PLATFORM_MODULES.filter(m => m.section === 'system'))
const lifeModules   = computed(() => PLATFORM_MODULES.filter(m => m.section === 'life'))
const workModules   = computed(() => PLATFORM_MODULES.filter(m => m.section === 'work'))

const sidebarGroups = computed(() => [
  { key: 'life',   label: i18n.t('nav.life'),   icon: 'Heart',    modules: lifeModules.value },
  { key: 'work',   label: i18n.t('nav.work'),   icon: 'Briefcase', modules: workModules.value },
  { key: 'system', label: i18n.t('nav.system'), icon: 'Cpu',      modules: systemModules.value },
])

const sidebarClasses = computed(() => ({
  'sidebar--pinned':      uiStore.sidebarOpen,
  'sidebar--drawer-open': uiStore.mobileSidebarOpen,
}))

function isActive(mod: ModuleMeta): boolean {
  if (mod.path === '/') return route.path === '/'
  return route.path.startsWith(mod.path)
}

function navigate(mod: ModuleMeta) {
  if (mod.status !== 'available' && mod.status !== 'wip') return
  router.push(mod.path)
}

function modLabel(mod: ModuleMeta): string {
  const key = `modules.${mod.id}`
  const translated = i18n.t(key)
  return translated === key ? mod.label : translated
}

function goHome() {
  router.push('/')
  uiStore.closeMobileDrawer()
}
</script>

<template>
  <aside class="sidebar" :class="sidebarClasses">

    <!-- Brand — clickable, navigates to home -->
    <button class="sidebar__brand" :title="'VibeOS'" @click="goHome">
      <div class="sidebar__logo">
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="var(--color-accent)" />
          <path d="M10 23L14 9" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M18 23L22 9" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="sidebar__brand-name">Vibe<span class="sidebar__brand-os">OS</span></span>
    </button>

    <!-- Navigation -->
    <nav class="sidebar__nav">
      <template v-for="group in sidebarGroups" :key="group.key">
        <div class="sidebar__group" :class="`sidebar__group--${group.key}`">
          <!-- Section header -->
          <div class="sidebar__section-label">
            <span class="sidebar__section-icon">
              <UiIcon :name="group.icon" :size="11" :stroke-width="2.5" />
            </span>
            <span class="sidebar__section-text">{{ group.label }}</span>
          </div>

          <!-- Module items -->
          <button
            v-for="mod in group.modules"
            :key="mod.id"
            class="sidebar__item"
            :class="{
              'sidebar__item--active':   isActive(mod),
              'sidebar__item--disabled': mod.status !== 'available' && mod.status !== 'wip',
            }"
            :disabled="mod.status !== 'available' && mod.status !== 'wip'"
            :title="mod.status === 'available' || mod.status === 'wip'
              ? mod.description
              : `${mod.label} — ${mod.sprint ?? i18n.t('nav.soon')}`"
            @click="navigate(mod)"
          >
            <span class="sidebar__icon">
              <UiIcon :name="mod.icon" :size="17" :stroke-width="1.6" />
            </span>
            <span class="sidebar__label">{{ modLabel(mod) }}</span>
            <span v-if="mod.status === 'wip'" class="sidebar__soon sidebar__soon--wip">
              {{ i18n.t('nav.wip') }}
            </span>
            <span v-else-if="mod.status === 'planned'" class="sidebar__soon">
              {{ mod.sprint ?? i18n.t('nav.soon') }}
            </span>
          </button>
        </div>
      </template>
    </nav>

    <!-- Footer: user + pin/collapse -->
    <div class="sidebar__footer">

      <!-- User row (only when logged in) -->
      <div v-if="auth.isLoggedIn" class="sidebar__user">
        <!-- Avatar initials -->
        <div class="sidebar__user-avatar" :class="{ 'sidebar__user-avatar--demo': auth.isDemoMode }">
          <UiIcon v-if="auth.isDemoMode" name="FlaskConical" :size="13" :stroke-width="2" />
          <span v-else>{{ (auth.user?.displayName ?? auth.user?.email ?? '?')[0].toUpperCase() }}</span>
        </div>
        <!-- Name + email -->
        <div class="sidebar__user-info">
          <span class="sidebar__user-name">
            {{ auth.isDemoMode ? 'Demo mode' : (auth.user?.displayName ?? auth.user?.email) }}
          </span>
          <span class="sidebar__user-email">
            {{ auth.user?.email }}
          </span>
        </div>
        <!-- Logout -->
        <button
          class="sidebar__user-logout"
          title="Sign out"
          @click="logout"
        >
          <UiIcon name="LogOut" :size="14" :stroke-width="1.75" />
        </button>
      </div>

      <!-- Sign in prompt (guest) -->
      <button
        v-else
        class="sidebar__sign-in"
        @click="router.push('/login')"
      >
        <span class="sidebar__icon">
          <UiIcon name="LogIn" :size="15" :stroke-width="1.75" />
        </span>
        <span class="sidebar__label">Sign in</span>
      </button>

      <!-- Pin toggle -->
      <button
        class="sidebar__pin-btn"
        :title="uiStore.sidebarOpen ? i18n.t('header.collapseSidebar') : i18n.t('header.expandSidebar')"
        @click="uiStore.toggleSidebar"
      >
        <span class="sidebar__icon">
          <UiIcon
            :name="uiStore.sidebarOpen ? 'PanelLeftClose' : 'PanelLeft'"
            :size="15"
            :stroke-width="1.75"
          />
        </span>
        <span class="sidebar__pin-label">
          {{ uiStore.sidebarOpen ? i18n.t('header.collapseSidebar') : i18n.t('header.expandSidebar') }}
        </span>
      </button>
    </div>

  </aside>
</template>

<style scoped>
/* ── Base sidebar ────────────────────────────────────────────────── */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--sidebar-collapsed); /* 52px rail */
  z-index: 50;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 220ms var(--ease), box-shadow 220ms var(--ease);
}

/* ── Pinned / expanded on desktop ────────────────────────────────── */
.sidebar--pinned {
  width: var(--sidebar-width);
}

/* ── Desktop rail: hover to expand as overlay ────────────────────── */
@media (min-width: 1024px) {
  .sidebar:not(.sidebar--pinned):hover {
    width: var(--sidebar-width);
    box-shadow: 6px 0 32px rgba(0, 0, 0, 0.35);
    transition: width 180ms var(--ease), box-shadow 180ms var(--ease);
  }
}

/* ── Mobile / tablet: drawer ─────────────────────────────────────── */
@media (max-width: 1023px) {
  .sidebar {
    width: var(--sidebar-width) !important;
    transform: translateX(-100%);
    box-shadow: none;
    transition: transform 240ms var(--ease), box-shadow 240ms var(--ease);
  }

  .sidebar--drawer-open {
    transform: translateX(0);
    box-shadow: var(--shadow-lg);
  }
}

/* ── Brand ───────────────────────────────────────────────────────── */
.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--header-height);
  padding: 0 15px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  cursor: pointer;
  width: 100%;
  text-align: left;
  border-radius: 0;
  transition: background var(--t-fast);
  background: none;
  border-left: none;
  border-top: none;
  border-right: none;
}

.sidebar__brand:hover {
  background: var(--color-surface-elevated);
}

.sidebar__logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.sidebar__brand-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.02em;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease;
  flex: 1;
}

.sidebar__brand-os { color: var(--color-accent); }

/* ── Navigation ──────────────────────────────────────────────────── */
.sidebar__nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  scrollbar-width: none;
}

.sidebar__nav::-webkit-scrollbar { display: none; }

/* ── Section group ───────────────────────────────────────────────── */
.sidebar__group {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sidebar__section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  margin-bottom: 4px;
  min-height: 22px;
  white-space: nowrap;
}

.sidebar__section-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 16px;
  justify-content: center;
}

.sidebar__section-text {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease;
  flex: 1;
  overflow: hidden;
}

.sidebar__group--life   .sidebar__section-label { color: var(--color-success); }
.sidebar__group--work   .sidebar__section-label { color: var(--color-accent); }
.sidebar__group--system .sidebar__section-label { color: var(--color-text-muted); }

/* ── Module item ─────────────────────────────────────────────────── */
.sidebar__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast), color var(--t-fast);
  color: var(--color-text-secondary);
  font-size: 15px;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.sidebar__item:hover:not(.sidebar__item--disabled):not(.sidebar__item--active) {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.sidebar__item--active {
  background: var(--color-accent-muted);
  color: var(--color-accent);
}

.sidebar__item--disabled {
  cursor: default;
  opacity: 0.35;
}

.sidebar__icon {
  width: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.sidebar__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease;
}

.sidebar__soon {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  padding: 2px 5px;
  border-radius: var(--radius-xs);
  flex-shrink: 0;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease;
}

.sidebar__soon--wip {
  color: var(--color-warning);
  background: rgba(240, 160, 48, 0.1);
}

/* ── Footer ──────────────────────────────────────────────────────── */
.sidebar__footer {
  padding: 8px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* ── User row ────────────────────────────────────────────────────── */
.sidebar__user {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  white-space: nowrap;
}

.sidebar__user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--color-accent-muted);
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
  text-transform: uppercase;
}

.sidebar__user-avatar--demo {
  background: color-mix(in srgb, var(--color-warning, #f59e0b) 12%, transparent);
  border-color: color-mix(in srgb, var(--color-warning, #f59e0b) 40%, transparent);
  color: var(--color-warning, #f59e0b);
}

.sidebar__user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease;
}

.sidebar__user-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar__user-email {
  font-size: 11px;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar__user-logout {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
  flex-shrink: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease, background var(--t-fast), color var(--t-fast);
}

.sidebar__user-logout:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

/* Sign in button (guest) */
.sidebar__sign-in {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  overflow: hidden;
  white-space: nowrap;
  transition: background var(--t-fast), color var(--t-fast);
}
.sidebar__sign-in:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.sidebar__pin-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 500;
  width: 100%;
  text-align: left;
  transition: background var(--t-fast), color var(--t-fast);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  overflow: hidden;
  white-space: nowrap;
}

.sidebar__pin-btn:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.sidebar__pin-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease;
}

/* Hide footer on mobile/tablet (pin button only for desktop) */
@media (max-width: 1023px) {
  .sidebar__footer { display: none; }
}

/* ── Mobile (≤ 767px): sidebar completely hidden ─────────────────────── */
/* Bottom tab bar + More sheet replace it entirely */
@media (max-width: 767px) {
  .sidebar {
    display: none !important;
  }
}

/* ── Expanded-state text visibility ──────────────────────────────── */

/* When pinned (sidebarOpen) */
.sidebar--pinned .sidebar__brand-name,
.sidebar--pinned .sidebar__section-text,
.sidebar--pinned .sidebar__label,
.sidebar--pinned .sidebar__soon,
.sidebar--pinned .sidebar__pin-label,
.sidebar--pinned .sidebar__user-info,
.sidebar--pinned .sidebar__user-logout {
  opacity: 1;
  pointer-events: auto;
}

/* When drawer is open on mobile/tablet */
.sidebar--drawer-open .sidebar__brand-name,
.sidebar--drawer-open .sidebar__section-text,
.sidebar--drawer-open .sidebar__label,
.sidebar--drawer-open .sidebar__soon,
.sidebar--drawer-open .sidebar__user-info,
.sidebar--drawer-open .sidebar__user-logout {
  opacity: 1;
  pointer-events: auto;
}

/* Desktop hover expand — text fades in with slight delay */
@media (min-width: 1024px) {
  .sidebar:not(.sidebar--pinned):hover .sidebar__brand-name,
  .sidebar:not(.sidebar--pinned):hover .sidebar__section-text,
  .sidebar:not(.sidebar--pinned):hover .sidebar__label,
  .sidebar:not(.sidebar--pinned):hover .sidebar__soon,
  .sidebar:not(.sidebar--pinned):hover .sidebar__pin-label,
  .sidebar:not(.sidebar--pinned):hover .sidebar__user-info,
  .sidebar:not(.sidebar--pinned):hover .sidebar__user-logout {
    opacity: 1;
    pointer-events: auto;
    transition: opacity 140ms ease 60ms;
  }
}
</style>
