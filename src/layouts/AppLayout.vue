<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'
import AppNotifications from './components/AppNotifications.vue'
import { useUiStore } from '@/core/stores/ui.store'

const uiStore = useUiStore()
const route = useRoute()
const isFullbleed = computed(() => !!route.meta.fullbleed)
</script>

<template>
  <div class="app-layout" :class="{ 'app-layout--collapsed': !uiStore.sidebarOpen }">
    <AppSidebar />
    <div class="app-main">
      <AppHeader />
      <main class="app-content" :class="{ 'app-content--fullbleed': isFullbleed }">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>
    </div>
    <AppNotifications />
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
