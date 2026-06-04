<script setup lang="ts">
import { ref } from 'vue'
import { useStudioStore } from '../stores/studio.store'
import { UiIcon, UiButton, UiIconButton } from '@/ui'
import StudioHistorySidebar from '../components/StudioHistorySidebar.vue'
import StudioModelPicker from '../components/StudioModelPicker.vue'
import StudioConversation from '../components/StudioConversation.vue'

const store     = useStudioStore()
const showSidebar = ref(window.innerWidth > 767)

const TABS = [
  { id: 'free',        label: 'Free AI',     badge: 'no key', icon: 'Sparkles' },
  { id: 'anthropic',   label: 'Claude',      badge: null,     icon: 'Key' },
  { id: 'groq',        label: 'Groq',        badge: null,     icon: 'Zap' },
  { id: 'gemini',      label: 'Gemini',      badge: null,     icon: 'Star' },
  { id: 'openrouter',  label: 'OpenRouter',  badge: null,     icon: 'Globe' },
] as const
</script>

<template>
  <div class="studio studio--with-sidebar" :class="{ 'studio--sidebar-open': showSidebar }">

    <!-- History sidebar -->
    <aside class="studio__sidebar">
      <StudioHistorySidebar />
    </aside>

    <!-- Main chat area -->
    <div class="studio__main">

      <!-- Top bar -->
      <div class="studio__topbar">
        <UiIconButton
          name="PanelLeft"
          :aria-label="showSidebar ? 'Hide history' : 'Show history'"
          :class="{ 'studio__sidebar-toggle--active': showSidebar }"
          @click="showSidebar = !showSidebar"
        />
        <div class="studio__tabs">
          <button
            v-for="tab in TABS"
            :key="tab.id"
            class="studio__tab"
            :class="{ 'studio__tab--active': store.provider === tab.id }"
            @click="store.provider = tab.id"
          >
            <UiIcon :name="tab.icon" :size="13" />
            <span class="studio__tab-label">{{ tab.label }}</span>
            <span v-if="tab.badge" class="studio__tab-badge">{{ tab.badge }}</span>
          </button>
        </div>
        <UiButton variant="ghost" size="sm" :disabled="!store.messages.length" title="Export conversation as markdown" @click="store.exportConversation()">
          <UiIcon name="Download" :size="14" />
          <span class="studio__btn-label">Export</span>
        </UiButton>
        <UiButton variant="ghost" size="sm" :disabled="!store.messages.length" title="Start a new conversation" @click="store.newConversation()">
          <UiIcon name="SquarePen" :size="14" />
          <span class="studio__btn-label">New chat</span>
        </UiButton>
      </div>

      <!-- Model picker + system prompt -->
      <StudioModelPicker />

      <!-- Conversation (messages + input) -->
      <StudioConversation />

    </div>
  </div>
</template>

<style scoped>
.studio {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--color-bg);
}
.studio--with-sidebar { flex-direction: row; }

.studio__sidebar {
  width: 0;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 0px solid var(--color-border);
  background: var(--color-surface);
  transition: width 0.22s ease, border-width 0.22s ease;
}
.studio--sidebar-open .studio__sidebar { width: 224px; border-right-width: 1px; }

.studio__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.studio__topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  background: var(--color-surface);
  overflow-x: auto;
  scrollbar-width: none;
}
.studio__topbar::-webkit-scrollbar { display: none; }

.studio__tabs {
  display: flex;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex: 1;
  min-width: 0;
}
.studio__tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 5px 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: background var(--t-fast), color var(--t-fast);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  min-width: 0;
}
.studio__tab:hover:not(.studio__tab--active) { background: var(--color-surface-elevated); color: var(--color-text); }
.studio__tab--active { background: var(--color-accent); color: #fff; }
.studio__tab-badge {
  font-size: 9px;
  padding: 1px 5px;
  background: color-mix(in srgb, #fff 15%, transparent);
  border-radius: 99px;
  font-weight: 600;
  white-space: nowrap;
}
.studio__tab-label { min-width: 0; }
.studio__sidebar-toggle--active { color: var(--color-accent); }
.studio__btn-label { white-space: nowrap; }

@media (max-width: 767px) {
  .studio--with-sidebar { flex-direction: column; }
  .studio--sidebar-open .studio__sidebar { width: 100%; max-height: 200px; border-right: none; border-bottom: 1px solid var(--color-border); }
  .studio__tab-label { display: none; }
  .studio__btn-label { display: none; }
}
</style>
