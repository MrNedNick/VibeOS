<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
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
const isFullbleed = computed(() => !!route.meta.fullbleed)

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
            <Transition name="page" mode="out-in">
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

/* Page transition */
.page-enter-active,
.page-leave-active { transition: opacity var(--t-fast), transform var(--t-fast); }
.page-enter-from   { opacity: 0; transform: translateY(4px); }
.page-leave-to     { opacity: 0; transform: translateY(-4px); }
</style>
