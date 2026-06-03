<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'
import AppNotifications from './components/AppNotifications.vue'
import AppErrorBoundary from './components/AppErrorBoundary.vue'
import CommandPalette from './components/CommandPalette.vue'
import AppBottomTabs from './components/AppBottomTabs.vue'
import AchievementToast from '@/core/components/AchievementToast.vue'
import { useUiStore } from '@/core/stores/ui.store'
import { useCommandPaletteStore } from '@/core/stores/commandPalette.store'
import { useHabitNotifications } from '@/core/composables/useHabitNotifications'

const uiStore = useUiStore()
const palette = useCommandPaletteStore()
useHabitNotifications() // initialise polling for streak reminders
const route = useRoute()

// ── Content scroll container ──────────────────────────────────────────
const contentEl = ref<HTMLElement | null>(null)

// ── Fullbleed state ───────────────────────────────────────────────────
// Only update in @after-leave: "out-in" guarantees old page fully exits before new one enters,
// so this fires before the incoming component renders — no layout flash.
const isFullbleed = ref(!!route.meta.fullbleed)

function onAfterLeave() {
  isFullbleed.value = !!route.meta.fullbleed
}

// ── Close mobile drawer + reset scroll on navigation ─────────────────
// scrollBehavior in router resets window scroll, but content scrolls inside
// the .app-content div — we need to reset it manually on every route change.
watch(() => route.path, () => {
  uiStore.closeMobileDrawer()
  contentEl.value?.scrollTo({ top: 0 })
})

// ── Command Palette + Escape ──────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    palette.toggle()
  }
  if (e.key === 'Escape' && uiStore.mobileSidebarOpen) {
    uiStore.closeMobileDrawer()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div
    class="app-layout"
    :class="{ 'app-layout--expanded': uiStore.sidebarOpen }"
  >
    <!-- Mobile / tablet backdrop -->
    <Transition name="backdrop">
      <div
        v-if="uiStore.mobileSidebarOpen"
        class="sidebar-backdrop"
        aria-hidden="true"
        @click="uiStore.closeMobileDrawer"
      />
    </Transition>

    <AppSidebar />

    <div class="app-main">
      <AppHeader />
      <main ref="contentEl" class="app-content" :class="{ 'app-content--fullbleed': isFullbleed }">
        <AppErrorBoundary>
          <router-view v-slot="{ Component }">
            <Transition name="page" mode="out-in" @after-leave="onAfterLeave">
              <component :is="Component" />
            </Transition>
          </router-view>
        </AppErrorBoundary>
      </main>
    </div>

    <AppNotifications />
    <AchievementToast />
    <CommandPalette />
    <!-- Mobile bottom tab bar (self-hides on ≥ 768px via its own CSS) -->
    <AppBottomTabs />
  </div>
</template>

<style scoped>
.app-layout {
  height: 100%;
  overflow: hidden;
}

/* Main content is offset from the fixed sidebar */
.app-main {
  height: 100%;
  margin-left: var(--sidebar-collapsed);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  transition: margin-left 220ms var(--ease);
}

/* Desktop: push content when sidebar is pinned open */
@media (min-width: 1024px) {
  .app-layout--expanded .app-main {
    margin-left: var(--sidebar-width);
  }
}

/* Tablet + mobile: no sidebar offset (drawer is overlay) */
@media (max-width: 1023px) {
  .app-main {
    margin-left: 0 !important;
  }
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--content-padding);
}

.app-content--fullbleed {
  padding: 0;
  overflow: hidden;
}

/* ── Mobile content: clear bottom tab bar + FAB + safe area ───────── */
/* FAB is 56px tall, positioned 20px above the tab bar — content must
   clear both so the last list item is never hidden behind the button. */
@media (max-width: 767px) {
  .app-content:not(.app-content--fullbleed) {
    padding-bottom: calc(
      var(--tab-bar-height) +
      56px +
      20px +
      env(safe-area-inset-bottom, 0px) +
      var(--content-padding)
    );
  }
}

/* Backdrop for tablet drawer (768–1023px only) */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 49;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
}

@media (min-width: 1024px) {
  .sidebar-backdrop { display: none; }
}

/* On mobile the sidebar is gone — backdrop not needed */
@media (max-width: 767px) {
  .sidebar-backdrop { display: none; }
}

.backdrop-enter-active { transition: opacity 200ms var(--ease); }
.backdrop-leave-active { transition: opacity 160ms var(--ease); }
.backdrop-enter-from,
.backdrop-leave-to    { opacity: 0; }

/* Page transitions */
.page-enter-active { transition: opacity 160ms var(--ease); }
.page-leave-active { transition: opacity 100ms var(--ease); }
.page-enter-from   { opacity: 0; }
.page-leave-to     { opacity: 0; }
</style>
