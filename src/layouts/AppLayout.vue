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
// We decouple isFullbleed from the route so we can delay the class removal
// until AFTER the leave animation, preventing layout shifts between
// fullbleed (Notes/Snippets) and padded (Habits/Tasks) views.
const isFullbleed = ref(!!route.meta.fullbleed)

watch(
  () => route.meta.fullbleed,
  (newVal) => {
    // Going TO fullbleed: apply immediately (content expands, no jank)
    if (newVal) isFullbleed.value = true
    // Going FROM fullbleed: handled by @after-leave below
  }
)

function onAfterLeave() {
  isFullbleed.value = !!route.meta.fullbleed
}

// ── Command Palette shortcut ──────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    palette.toggle()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="app-layout" :class="{ 'app-layout--collapsed': !uiStore.sidebarOpen }">
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
  display: flex;
  height: 100%;
  overflow: hidden;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
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

/* Page transition — opacity only, no translateY which causes layout-shift
   when switching between fullbleed and padded views */
.page-enter-active { transition: opacity 160ms var(--ease); }
.page-leave-active { transition: opacity 100ms var(--ease); }
.page-enter-from   { opacity: 0; }
.page-leave-to     { opacity: 0; }
</style>
