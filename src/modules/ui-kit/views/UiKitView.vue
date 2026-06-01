<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import { useUiStore, type Theme } from '@/core/stores/ui.store'

// ── Token sections ──────────────────────────────────────────────────────
import ColorsSection from './sections/tokens/ColorsSection.vue'
import TypographySection from './sections/tokens/TypographySection.vue'
import SpacingSection from './sections/tokens/SpacingSection.vue'
import ShadowsSection from './sections/tokens/ShadowsSection.vue'
import MotionSection from './sections/tokens/MotionSection.vue'
// ── Component sections ──────────────────────────────────────────────────
import UiButtonSection from './sections/components/UiButtonSection.vue'
import UiInputSection from './sections/components/UiInputSection.vue'
import UiFieldSection from './sections/components/UiFieldSection.vue'
import UiCardSection from './sections/components/UiCardSection.vue'
import UiSkeletonSection from './sections/components/UiSkeletonSection.vue'
import UiBadgeSection from './sections/components/UiBadgeSection.vue'
import UiIconSection from './sections/components/UiIconSection.vue'
import UiProgressBarSection from './sections/components/UiProgressBarSection.vue'
import UiProgressRingSection from './sections/components/UiProgressRingSection.vue'
import UiStatSection from './sections/components/UiStatSection.vue'
import UiSectionLabelSection from './sections/components/UiSectionLabelSection.vue'
import UiFilterChipsSection from './sections/components/UiFilterChipsSection.vue'
// ── Pattern sections ────────────────────────────────────────────────────
import UiEmptyStateSection from './sections/patterns/UiEmptyStateSection.vue'
import UiConfirmDialogSection from './sections/patterns/UiConfirmDialogSection.vue'
import UiPlannedViewSection from './sections/patterns/UiPlannedViewSection.vue'

interface Item { key: string; label: string; component: Component }
interface Group { name: string; items: Item[] }

const groups: Group[] = [
  {
    name: 'Tokens',
    items: [
      { key: 'colors',     label: 'Colors',          component: ColorsSection },
      { key: 'typography', label: 'Typography',      component: TypographySection },
      { key: 'spacing',    label: 'Spacing',         component: SpacingSection },
      { key: 'shadows',    label: 'Shadows & Radius', component: ShadowsSection },
      { key: 'motion',     label: 'Motion & Easing', component: MotionSection },
    ],
  },
  {
    name: 'Components',
    items: [
      { key: 'button',       label: 'UiButton',       component: UiButtonSection },
      { key: 'input',        label: 'UiInput',        component: UiInputSection },
      { key: 'field',        label: 'UiField',        component: UiFieldSection },
      { key: 'card',         label: 'UiCard',         component: UiCardSection },
      { key: 'skeleton',     label: 'UiSkeleton',     component: UiSkeletonSection },
      { key: 'badge',        label: 'UiBadge',        component: UiBadgeSection },
      { key: 'icon',         label: 'UiIcon',         component: UiIconSection },
      { key: 'progressbar',  label: 'UiProgressBar',  component: UiProgressBarSection },
      { key: 'progressring', label: 'UiProgressRing', component: UiProgressRingSection },
      { key: 'stat',         label: 'UiStat',         component: UiStatSection },
      { key: 'sectionlabel', label: 'UiSectionLabel', component: UiSectionLabelSection },
      { key: 'filterchips',  label: 'UiFilterChips',  component: UiFilterChipsSection },
    ],
  },
  {
    name: 'Patterns',
    items: [
      { key: 'emptystate',    label: 'UiEmptyState',    component: UiEmptyStateSection },
      { key: 'confirmdialog', label: 'UiConfirmDialog', component: UiConfirmDialogSection },
      { key: 'plannedview',   label: 'UiPlannedView',   component: UiPlannedViewSection },
    ],
  },
]

const active = ref('colors')
const activeComponent = computed<Component>(() => {
  for (const g of groups) {
    const found = g.items.find(i => i.key === active.value)
    if (found) return found.component
  }
  return ColorsSection
})

// ── Theme switcher (preview swatches — the one place concrete per-theme
// accents are shown side-by-side; live tokens can't represent 4 at once) ──
const ui = useUiStore()
const paks: { id: Theme; name: string; accent: string; bg: string }[] = [
  { id: 'dark',      name: 'Dark',      accent: '#5c7cfa', bg: '#0b0f1a' },
  { id: 'light',     name: 'Light',     accent: '#2563eb', bg: '#eef1f7' },
  { id: 'brutalist', name: 'Brutalist', accent: '#000000', bg: '#f0ede8' },
  { id: 'crt',       name: 'CRT',       accent: '#52c46a', bg: '#091209' },
]
</script>

<template>
  <div class="uikit">
    <!-- Sidebar -->
    <aside class="uikit__sidebar" aria-label="UI Kit navigation">
      <div class="uikit__brand">
        <span class="uikit__brand-mark">▮</span>
        <span class="uikit__brand-name">VibeOS UI Kit</span>
      </div>

      <nav class="uikit__nav">
        <div v-for="g in groups" :key="g.name" class="uikit__group">
          <div class="uikit__group-label">{{ g.name }}</div>
          <button
            v-for="item in g.items"
            :key="item.key"
            class="uikit__item"
            :class="{ 'uikit__item--active': active === item.key }"
            :aria-current="active === item.key ? 'page' : undefined"
            @click="active = item.key"
          >
            {{ item.label }}
          </button>
        </div>
      </nav>

      <!-- Theme switcher -->
      <div class="uikit__theme">
        <div class="uikit__group-label">Theme</div>
        <div class="uikit__paks">
          <button
            v-for="pak in paks"
            :key="pak.id"
            class="uikit__pak"
            :class="{ 'uikit__pak--active': ui.theme === pak.id }"
            :style="{ background: pak.bg }"
            :title="pak.name"
            :aria-label="`Switch to ${pak.name} theme`"
            @click="ui.setTheme(pak.id)"
          >
            <span class="uikit__pak-dot" :style="{ background: pak.accent }" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <main class="uikit__main">
      <component :is="activeComponent" />
    </main>
  </div>
</template>

<style scoped>
.uikit {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}

.uikit__sidebar {
  width: 230px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 14px;
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
}

.uikit__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
}
.uikit__brand-mark { color: var(--color-accent); font-weight: 700; }
.uikit__brand-name { font-size: var(--text-sm); font-weight: 700; color: var(--color-text); }

.uikit__nav { display: flex; flex-direction: column; gap: 16px; flex: 1; }
.uikit__group { display: flex; flex-direction: column; gap: 2px; }
.uikit__group-label {
  font-size: var(--text-2xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
  padding: 0 8px 4px;
}

.uikit__item {
  text-align: left;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  border: none;
  background: none;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  font-family: inherit;
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
}
.uikit__item:hover {
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  color: var(--color-text);
}
.uikit__item--active {
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
  color: var(--color-accent);
  font-weight: 600;
  box-shadow: inset 2.5px 0 0 var(--color-accent);
}

.uikit__theme {
  border-top: 1px solid var(--color-border);
  padding-top: 14px;
}
.uikit__paks { display: flex; gap: 8px; padding: 0 8px; }
.uikit__pak {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--t-fast), border-color var(--t-fast);
}
.uikit__pak:hover { transform: translateY(-1px); }
.uikit__pak--active { border-color: var(--color-accent); box-shadow: 0 0 0 2px var(--color-accent-muted); }
.uikit__pak-dot { width: 14px; height: 14px; border-radius: 50%; }

.uikit__main {
  flex: 1;
  min-width: 0;
  padding: 40px;
  overflow-x: hidden;
}

@media (max-width: 767px) {
  .uikit { flex-direction: column; }
  .uikit__sidebar {
    width: 100%;
    height: auto;
    position: static;
    flex-direction: column;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
  .uikit__main { padding: 20px; }
}
</style>
