<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStudioStore } from '../stores/studio.store'
import { STUDIO_MODELS, FREE_MODELS } from '../types'
import { UiIcon, UiButton, UiIconButton, UiInput } from '@/ui'

const store = useStudioStore()
const showKey    = ref(false)
const showSystem = ref(false)
const isFree     = computed(() => store.provider === 'free')
</script>

<template>
  <!-- Settings bar -->
  <div class="sp-bar">
    <div class="sp-model-row">
      <template v-if="isFree">
        <button v-for="m in FREE_MODELS" :key="m.id" class="sp-chip" :class="{ 'sp-chip--active': store.freeModel === m.id }" :style="store.freeModel === m.id ? { '--chip-color': m.color } : {}" :title="m.desc" @click="store.freeModel = m.id">{{ m.label }}</button>
      </template>
      <template v-else>
        <button v-for="m in STUDIO_MODELS" :key="m.id" class="sp-chip" :class="{ 'sp-chip--active': store.model === m.id }" :style="store.model === m.id ? { '--chip-color': m.color } : {}" :title="m.desc" @click="store.model = m.id">{{ m.label }}</button>
      </template>
    </div>

    <div v-if="!isFree" class="sp-key-row">
      <div class="sp-key-wrap">
        <UiInput v-model="store.apiKey" :type="showKey ? 'text' : 'password'" placeholder="sk-ant-..." autocomplete="off" spellcheck="false" />
        <UiIconButton :name="showKey ? 'EyeOff' : 'Eye'" :aria-label="showKey ? 'Hide key' : 'Show key'" size="sm" @click="showKey = !showKey" />
      </div>
      <span v-if="store.apiKey" class="sp-key-ok">● key set</span>
    </div>

    <UiButton variant="ghost" size="sm" @click="showSystem = !showSystem">
      <UiIcon name="Settings2" :size="13" />
      System
      <UiIcon :name="showSystem ? 'ChevronUp' : 'ChevronDown'" :size="12" />
    </UiButton>

    <button
      class="sp-ctx-btn"
      :class="{ 'sp-ctx-btn--active': store.includeContext }"
      title="Include your VibeOS project data as AI context"
      @click="store.includeContext = !store.includeContext"
    >
      <UiIcon name="Database" :size="13" />
      My data
    </button>
  </div>

  <!-- System prompt -->
  <div v-if="showSystem" class="sp-system-area">
    <textarea v-model="store.system" class="sp-system-ta" placeholder="Optional system prompt…" rows="2" />
  </div>
</template>

<style scoped>
.sp-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  flex-wrap: wrap;
  background: var(--color-surface);
}
.sp-model-row { display: flex; gap: 5px; flex-wrap: wrap; }
.sp-chip {
  padding: 4px 11px;
  font-size: 12px; font-weight: 500; font-family: inherit;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: border-color var(--t-fast), color var(--t-fast), background var(--t-fast);
}
.sp-chip:hover { color: var(--color-text); border-color: var(--color-text-muted); }
.sp-chip--active {
  border-color: var(--chip-color, var(--color-accent));
  color: var(--chip-color, var(--color-accent));
  background: color-mix(in srgb, var(--chip-color, var(--color-accent)) 10%, transparent);
}
.sp-key-row { display: flex; align-items: center; gap: 6px; }
.sp-key-wrap { display: flex; align-items: center; }
.sp-key-ok { font-size: 11px; color: var(--color-success); white-space: nowrap; }
.sp-ctx-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 10px; font-size: 12px; font-weight: 500; font-family: inherit;
  border-radius: var(--radius-sm); border: 1px solid var(--color-border);
  background: transparent; color: var(--color-text-muted); cursor: pointer;
  transition: all var(--t-fast);
}
.sp-ctx-btn:hover { background: var(--color-surface-elevated); color: var(--color-text); }
.sp-ctx-btn--active { border-color: var(--color-accent); color: var(--color-accent); background: color-mix(in srgb, var(--color-accent) 8%, transparent); }
.sp-system-area {
  padding: 8px 14px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  flex-shrink: 0;
}
.sp-system-ta {
  width: 100%;
  font-size: 13px; font-family: inherit;
  color: var(--color-text); background: var(--color-bg);
  border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  padding: 8px 10px; outline: none; resize: vertical; line-height: 1.5;
  transition: border-color var(--t-fast);
}
.sp-system-ta:focus { border-color: var(--color-accent); }
</style>
