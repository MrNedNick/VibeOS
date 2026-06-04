<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStudioStore } from '../stores/studio.store'
import { UiIcon, UiButton, UiIconButton } from '@/ui'
import StudioHistorySidebar from '../components/StudioHistorySidebar.vue'
import StudioModelPicker from '../components/StudioModelPicker.vue'
import StudioConversation from '../components/StudioConversation.vue'

const store     = useStudioStore()
const showSidebar = ref(window.innerWidth > 767)
const isFree    = computed(() => store.provider === 'free')
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
          <button class="studio__tab" :class="{ 'studio__tab--active': isFree }" @click="store.provider = 'free'">
            <UiIcon name="Sparkles" :size="13" />
            Free AI
            <span class="studio__tab-badge">no key</span>
          </button>
          <button class="studio__tab" :class="{ 'studio__tab--active': !isFree }" @click="store.provider = 'anthropic'">
            <UiIcon name="Key" :size="13" />
            Claude API
          </button>
        </div>
        <UiButton variant="ghost" size="sm" :disabled="!store.messages.length" title="Export conversation as markdown" @click="store.exportConversation()">
          <UiIcon name="Download" :size="14" />
          Export
        </UiButton>
        <UiButton variant="ghost" size="sm" :disabled="!store.messages.length" title="Start a new conversation" @click="store.newConversation()">
          <UiIcon name="SquarePen" :size="14" />
          New chat
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
}

.studio__tabs {
  display: flex;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex: 1;
  max-width: 260px;
}
.studio__tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: background var(--t-fast), color var(--t-fast);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
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
.studio__sidebar-toggle--active { color: var(--color-accent); }

@media (max-width: 767px) {
  .studio--with-sidebar { flex-direction: column; }
  .studio--sidebar-open .studio__sidebar { width: 100%; max-height: 200px; border-right: none; border-bottom: 1px solid var(--color-border); }
}
</style>
