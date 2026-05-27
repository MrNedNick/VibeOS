<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/core/stores/ui.store'
import { useCommandPaletteStore } from '@/core/stores/commandPalette.store'
import { PLATFORM_MODULES } from '@/core/registry/modules'
import { UiIcon } from '@/ui'

const route = useRoute()
const uiStore = useUiStore()
const palette = useCommandPaletteStore()

const currentModule = computed(() =>
  PLATFORM_MODULES.find(m =>
    m.path === '/' ? route.path === '/' : route.path.startsWith(m.path)
  )
)
</script>

<template>
  <header class="app-header">
    <!-- Sidebar toggle -->
    <button
      class="header-btn"
      :title="uiStore.sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'"
      :aria-label="uiStore.sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'"
      @click="uiStore.toggleSidebar"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="4" width="12" height="1.5" rx="1" fill="currentColor"/>
        <rect x="2" y="7.25" width="8"  height="1.5" rx="1" fill="currentColor"/>
        <rect x="2" y="10.5" width="12" height="1.5" rx="1" fill="currentColor"/>
      </svg>
    </button>

    <!-- Module title -->
    <div class="header-title">
      <UiIcon
        v-if="currentModule"
        :name="currentModule.icon"
        :size="16"
        :stroke-width="1.75"
        class="header-title__icon"
      />
      <span class="header-title__label">{{ currentModule?.label ?? 'VibeOS' }}</span>
    </div>

    <div class="header-spacer" />

    <!-- Command palette trigger -->
    <button
      class="header-search"
      title="Command palette (⌘K)"
      aria-label="Open command palette"
      @click="palette.open"
    >
      <UiIcon name="Search" :size="14" :stroke-width="1.75" />
      <span class="header-search__text">Search…</span>
      <kbd class="header-search__kbd">⌘K</kbd>
    </button>

    <!-- Theme toggle -->
    <button
      class="header-btn"
      :title="uiStore.isDark ? 'Switch to light' : 'Switch to dark'"
      :aria-label="uiStore.isDark ? 'Switch to light theme' : 'Switch to dark theme'"
      @click="uiStore.toggleTheme"
    >
      <svg v-if="uiStore.isDark" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.5"/>
        <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M11.89 4.11l1.06-1.06M3.05 12.95l1.06-1.06"
          stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 100 11 5.5 5.5 0 007-4z"
          stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
    </button>
  </header>
</template>

<style scoped>
.app-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  flex-shrink: 0;
}

.header-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  transition: background var(--t-fast), color var(--t-fast);
}
.header-btn:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title__icon {
  color: var(--color-text-secondary);
}

.header-title__label {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
}

.header-spacer { flex: 1; }

.header-search {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-elevated);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: border-color var(--t-fast), color var(--t-fast);
}

.header-search:hover {
  border-color: var(--color-accent);
  color: var(--color-text);
}

.header-search__text {
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
}

.header-search__kbd {
  font-size: 11px;
  font-family: var(--font-mono);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: 1px 5px;
  color: var(--color-text-muted);
}

@media (max-width: 767px) {
  .header-search__text,
  .header-search__kbd { display: none; }
  .header-search { padding: 5px 7px; }
}
</style>
