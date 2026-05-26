<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PLATFORM_MODULES, type ModuleMeta } from '@/core/registry/modules'
import { useUiStore } from '@/core/stores/ui.store'

const route  = useRoute()
const router = useRouter()
const uiStore = useUiStore()

const platformModules = computed(() => PLATFORM_MODULES.filter(m => m.section === 'platform'))
const featureModules  = computed(() => PLATFORM_MODULES.filter(m => m.section === 'modules'))

function isActive(mod: ModuleMeta): boolean {
  if (mod.path === '/') return route.path === '/'
  return route.path.startsWith(mod.path)
}

function navigate(mod: ModuleMeta) {
  if (mod.status !== 'available') return
  router.push(mod.path)
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': !uiStore.sidebarOpen }">

    <!-- Brand -->
    <div class="sidebar__brand">
      <div class="sidebar__logo">
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="var(--color-accent)" />
          <path d="M10 23L14 9" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M18 23L22 9" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
        </svg>
      </div>
      <span class="sidebar__brand-name">Vibe<span class="sidebar__brand-os">OS</span></span>
    </div>

    <!-- Navigation -->
    <nav class="sidebar__nav">

      <!-- System section -->
      <div class="sidebar__group">
        <p class="sidebar__section-label">System</p>
        <button
          v-for="mod in platformModules"
          :key="mod.id"
          class="sidebar__item"
          :class="{ 'sidebar__item--active': isActive(mod) }"
          @click="navigate(mod)"
        >
          <span class="sidebar__icon">{{ mod.icon }}</span>
          <span class="sidebar__label">{{ mod.label }}</span>
        </button>
      </div>

      <!-- Apps section -->
      <div class="sidebar__group">
        <p class="sidebar__section-label">Apps</p>
        <button
          v-for="mod in featureModules"
          :key="mod.id"
          class="sidebar__item"
          :class="{
            'sidebar__item--active':   isActive(mod),
            'sidebar__item--disabled': mod.status !== 'available',
          }"
          :disabled="mod.status !== 'available'"
          @click="navigate(mod)"
        >
          <span class="sidebar__icon">{{ mod.icon }}</span>
          <span class="sidebar__label">{{ mod.label }}</span>
          <span v-if="mod.status !== 'available'" class="sidebar__soon">soon</span>
        </button>
      </div>

    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100%;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width var(--t);
  flex-shrink: 0;
}

.sidebar--collapsed { width: var(--sidebar-collapsed); }

/* Brand */
.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: var(--header-height);
  padding: 0 14px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.sidebar__logo { flex-shrink: 0; display: flex; align-items: center; }

.sidebar__brand-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  transition: opacity var(--t);
  letter-spacing: -0.02em;
}

.sidebar__brand-os {
  color: var(--color-accent);
}

.sidebar--collapsed .sidebar__brand-name { opacity: 0; pointer-events: none; }

/* Nav */
.sidebar__nav {
  flex: 1;
  overflow-y: auto;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar__group { display: flex; flex-direction: column; gap: 2px; }

.sidebar__section-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  padding: 0 8px;
  margin-bottom: 2px;
  white-space: nowrap;
  transition: opacity var(--t);
}

.sidebar--collapsed .sidebar__section-label { opacity: 0; }

.sidebar__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast), color var(--t-fast);
  color: var(--color-text-secondary);
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  text-align: left;
}

.sidebar__item:hover:not(.sidebar__item--disabled):not(.sidebar__item--active) {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.sidebar__item--active {
  background: var(--color-accent-muted);
  color: var(--color-accent);
}

.sidebar__item--disabled { cursor: default; opacity: 0.4; }

.sidebar__icon {
  font-size: 17px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar__label { flex: 1; overflow: hidden; text-overflow: ellipsis; }

.sidebar--collapsed .sidebar__label,
.sidebar--collapsed .sidebar__soon { opacity: 0; width: 0; overflow: hidden; }

.sidebar__soon {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  padding: 2px 5px;
  border-radius: var(--radius-xs);
  flex-shrink: 0;
}
</style>
