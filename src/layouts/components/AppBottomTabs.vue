<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PLATFORM_MODULES, type ModuleMeta } from '@/core/registry/modules'
import { useLocale } from '@/core/i18n'
import { UiIcon } from '@/ui'
import { useModuleVisibility } from '@/core/composables/useModuleVisibility'
import { useUiStore } from '@/core/stores/ui.store'
import UserPanel from './UserPanel.vue'

const route   = useRoute()
const router  = useRouter()
const i18n    = useLocale()
const uiStore = useUiStore()
const { isVisible } = useModuleVisibility()

const showMore = ref(false)

// ── Bottom bar tabs (the 4 main + More) ──────────────────────────────
const BOTTOM_TABS = [
  { id: 'dashboard',    icon: 'LayoutDashboard', path: '/',       labelKey: 'modules.dashboard'    },
  { id: 'task-manager', icon: 'CheckSquare',      path: '/tasks',  labelKey: 'modules.task-manager' },
  { id: 'habits',       icon: 'Flame',            path: '/habits', labelKey: 'modules.habits'       },
] as const

/** Returns true when the route matches this tab's path */
function isTabActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

/** "More" tab is active when the current route isn't one of the 3 main tabs */
const isMoreActive = computed(() => {
  const mainPaths = BOTTOM_TABS.map(t => t.path)
  if (route.path === '/') return false
  return !mainPaths.some(p => p !== '/' && route.path.startsWith(p))
})

function navigateTo(path: string) {
  showMore.value = false
  router.push(path)
}

function toggleMore() {
  showMore.value = !showMore.value
}

// ── "More" drawer content ─────────────────────────────────────────────
const moreGroups = computed(() => [
  {
    key: 'life',
    label: i18n.t('nav.life'),
    icon: 'Heart',
    color: 'var(--color-success)',
    modules: PLATFORM_MODULES.filter(m => m.section === 'life' && isVisible(m.id)),
  },
  {
    key: 'work',
    label: i18n.t('nav.work'),
    icon: 'Briefcase',
    color: 'var(--color-accent)',
    modules: PLATFORM_MODULES.filter(m => m.section === 'work' && isVisible(m.id)),
  },
  {
    key: 'system',
    label: i18n.t('nav.system'),
    icon: 'Cpu',
    color: 'var(--color-text-muted)',
    modules: PLATFORM_MODULES.filter(m => m.section === 'system'),
  },
])

function modLabel(mod: ModuleMeta): string {
  const key = `modules.${mod.id}`
  const tr  = i18n.t(key)
  return tr === key ? mod.label : tr
}

function isModActive(mod: ModuleMeta): boolean {
  if (mod.path === '/') return route.path === '/'
  return route.path.startsWith(mod.path)
}

function navigateMod(mod: ModuleMeta) {
  if (mod.status !== 'available' && mod.status !== 'wip') return
  navigateTo(mod.path)
}

// Close drawer on any route change (back button, swipe, programmatic nav)
watch(route, () => { showMore.value = false })

// Lock body scroll when More drawer is open
watch(showMore, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})
onUnmounted(() => { document.body.style.overflow = '' })
</script>

<template>
  <!-- ── Bottom tab bar ──────────────────────────────────────────── -->
  <nav class="bottom-nav" role="tablist" aria-label="Mobile navigation">
    <!-- The 4 main tabs -->
    <button
      v-for="tab in BOTTOM_TABS"
      :key="tab.id"
      class="bottom-nav__tab"
      :class="{ 'bottom-nav__tab--active': isTabActive(tab.path) }"
      role="tab"
      :aria-selected="isTabActive(tab.path)"
      @click="navigateTo(tab.path)"
    >
      <span class="bottom-nav__tab-icon">
        <UiIcon :name="tab.icon" :size="22" :stroke-width="isTabActive(tab.path) ? 2.1 : 1.6" />
      </span>
      <span class="bottom-nav__tab-label">{{ i18n.t(tab.labelKey) }}</span>
      <span v-if="isTabActive(tab.path)" class="bottom-nav__tab-pill" />
    </button>

    <!-- User tab -->
    <button
      class="bottom-nav__tab"
      :class="{ 'bottom-nav__tab--active': uiStore.userPanelOpen }"
      role="tab"
      :aria-label="'Account'"
      @click="uiStore.openUserPanel()"
    >
      <span class="bottom-nav__tab-icon">
        <UiIcon name="User" :size="22" :stroke-width="uiStore.userPanelOpen ? 2.1 : 1.6" />
      </span>
      <span class="bottom-nav__tab-label">Account</span>
      <span v-if="uiStore.userPanelOpen" class="bottom-nav__tab-pill" />
    </button>

    <!-- More tab -->
    <button
      class="bottom-nav__tab"
      :class="{ 'bottom-nav__tab--active': isMoreActive || showMore }"
      role="tab"
      :aria-expanded="showMore"
      @click="toggleMore"
    >
      <span class="bottom-nav__tab-icon">
        <UiIcon
          :name="showMore ? 'X' : 'Grid2X2'"
          :size="22"
          :stroke-width="(isMoreActive || showMore) ? 2.1 : 1.6"
        />
      </span>
      <span class="bottom-nav__tab-label">{{ i18n.t('nav.more') }}</span>
      <span v-if="isMoreActive && !showMore" class="bottom-nav__tab-pill" />
    </button>
  </nav>

  <!-- User panel modal -->
  <UserPanel v-model:open="uiStore.userPanelOpen" />

  <!-- ── "More" bottom sheet ─────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="more-sheet">
      <div v-if="showMore" class="more-overlay" @click.self="showMore = false">
        <div class="more-sheet" role="dialog" aria-modal="true" aria-label="All modules">

          <!-- Handle -->
          <div class="more-sheet__handle-area" @click="showMore = false">
            <div class="more-sheet__handle" />
          </div>

          <!-- Scrollable content -->
          <div class="more-sheet__scroll">
            <div
              v-for="group in moreGroups"
              :key="group.key"
              class="more-group"
            >
              <!-- Section header -->
              <div class="more-group__header" :style="{ color: group.color }">
                <UiIcon :name="group.icon" :size="12" :stroke-width="2.5" />
                <span class="more-group__label">{{ group.label }}</span>
              </div>

              <!-- Module grid -->
              <div class="more-group__grid">
                <button
                  v-for="mod in group.modules"
                  :key="mod.id"
                  class="more-item"
                  :class="{
                    'more-item--active':   isModActive(mod),
                    'more-item--disabled': mod.status !== 'available' && mod.status !== 'wip',
                  }"
                  :disabled="mod.status !== 'available' && mod.status !== 'wip'"
                  @click="navigateMod(mod)"
                >
                  <span class="more-item__icon">
                    <UiIcon :name="mod.icon" :size="22" :stroke-width="1.6" />
                  </span>
                  <span class="more-item__label">{{ modLabel(mod) }}</span>
                  <span v-if="mod.status === 'wip'" class="more-item__badge more-item__badge--wip">
                    {{ i18n.t('nav.wip') }}
                  </span>
                  <span v-else-if="mod.status === 'planned'" class="more-item__badge">
                    {{ mod.sprint ?? i18n.t('nav.soon') }}
                  </span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Only visible on mobile ─────────────────────────────────────────── */
@media (min-width: 768px) {
  .bottom-nav { display: none !important; }
}

/* ── Bottom navigation bar ──────────────────────────────────────────── */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  display: flex;
  align-items: flex-start;
  justify-content: space-around;

  /* Height = tab area + home indicator safe area */
  padding-bottom: env(safe-area-inset-bottom, 0px);
  height: calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px));

  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-top: 1px solid var(--color-border);
}

/* ── Tab button ─────────────────────────────────────────────────────── */
.bottom-nav__tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 8px 4px 4px;
  height: var(--tab-bar-height);
  position: relative;
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 140ms var(--ease);
  min-width: 0;
  /* Override global mobile min-height */
  min-height: var(--tab-bar-height);
}

.bottom-nav__tab--active {
  color: var(--color-accent);
}

.bottom-nav__tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.bottom-nav__tab-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.2;
  /* Override inherited --color-text-muted for contrast compliance (WCAG AA) */
  color: var(--color-text-secondary);
}
.bottom-nav__tab--active .bottom-nav__tab-label {
  color: var(--color-accent);
}

/* Active pill indicator behind the icon */
.bottom-nav__tab-pill {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 32px;
  background: var(--color-accent-muted);
  border-radius: 99px;
  z-index: 0;
}

/* ── "More" bottom sheet overlay ────────────────────────────────────── */
.more-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* ── Bottom sheet ───────────────────────────────────────────────────── */
.more-sheet {
  background: var(--color-surface);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  border-top: 1px solid var(--color-border);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.4);
  /* Safe area at bottom (sheet extends to bottom edge) */
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.more-sheet__handle-area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.more-sheet__handle {
  width: 36px;
  height: 4px;
  background: var(--color-border);
  border-radius: 99px;
}

/* ── Sheet scrollable content ───────────────────────────────────────── */
.more-sheet__scroll {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 4px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Module group ───────────────────────────────────────────────────── */
.more-group__header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.more-group__label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.more-group__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

/* ── Module item in grid ────────────────────────────────────────────── */
.more-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 6px 10px;
  border-radius: var(--radius);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
  color: var(--color-text-secondary);
  min-height: 0;
  /* Override the global 44px rule — items are intentionally compact in grid */
  min-width: 0;
  position: relative;
}

.more-item:active:not(.more-item--disabled) {
  background: var(--color-accent-muted);
  border-color: color-mix(in srgb, var(--color-accent) 30%, transparent);
  transform: scale(0.95);
  transition: transform 80ms var(--ease);
}

.more-item--active {
  background: var(--color-accent-muted);
  border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
  color: var(--color-accent);
}

.more-item--disabled {
  opacity: 0.35;
  cursor: default;
}

.more-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.more-item__label {
  font-size: 10px;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.2;
}

.more-item__badge {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  background: var(--color-surface);
  padding: 1px 4px;
  border-radius: 99px;
  border: 1px solid var(--color-border);
  line-height: 1.4;
}

.more-item__badge--wip {
  color: var(--color-warning);
  background: rgba(240, 160, 48, 0.08);
  border-color: rgba(240, 160, 48, 0.25);
}

/* ── Sheet transition — spring slide-up ─────────────────────────────── */
.more-sheet-enter-active {
  transition: transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 200ms var(--ease);
}
.more-sheet-leave-active {
  transition: transform 220ms var(--ease), opacity 180ms var(--ease);
}
.more-sheet-enter-from,
.more-sheet-leave-to {
  opacity: 0;
}
.more-sheet-enter-from .more-sheet,
.more-sheet-leave-to .more-sheet {
  transform: translateY(100%);
}
</style>
