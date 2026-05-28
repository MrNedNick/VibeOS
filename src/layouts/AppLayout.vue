<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'
import AppNotifications from './components/AppNotifications.vue'
import AppErrorBoundary from './components/AppErrorBoundary.vue'
import CommandPalette from './components/CommandPalette.vue'
import { useUiStore } from '@/core/stores/ui.store'
import { useCommandPaletteStore } from '@/core/stores/commandPalette.store'

const uiStore = useUiStore()
const palette = useCommandPaletteStore()
const route = useRoute()

// ── Fullbleed state ───────────────────────────────────────────────────
const isFullbleed = ref(!!route.meta.fullbleed)

watch(
  () => route.meta.fullbleed,
  (newVal) => {
    if (newVal) isFullbleed.value = true
  }
)

function onAfterLeave() {
  isFullbleed.value = !!route.meta.fullbleed
}

// ── Close mobile drawer on navigation ────────────────────────────────
watch(() => route.path, () => {
  uiStore.closeMobileDrawer()
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
      <main class="app-content" :class="{ 'app-content--fullbleed': isFullbleed }">
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
    <CommandPalette />
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

/* Backdrop for mobile/tablet drawer */
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
