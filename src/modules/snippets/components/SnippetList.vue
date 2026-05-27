<script setup lang="ts">
import { ref } from 'vue'
import type { Snippet } from '../types'
import { getLanguageLabel } from '../types'
import SnippetListItem from './SnippetListItem.vue'

defineProps<{
  snippets: Snippet[]
  selectedId: string | null
  searchQuery: string
  languageFilter: string
  usedLanguages: string[]
}>()

const emit = defineEmits<{
  select: [id: string]
  new: []
  'update:searchQuery': [value: string]
  'update:languageFilter': [value: string]
}>()

const searchInputRef = ref<HTMLInputElement>()
defineExpose({ focusSearch: () => searchInputRef.value?.focus() })
</script>

<template>
  <aside class="snippet-list">
    <div class="snippet-list__header">
      <span class="snippet-list__title">
        Snippets
        <span class="snippet-list__count">{{ snippets.length }}</span>
      </span>
      <button class="snippet-list__new" title="New snippet (⌘N)" @click="emit('new')">+</button>
    </div>

    <div class="snippet-list__search-wrap">
      <input
        ref="searchInputRef"
        class="snippet-list__search"
        type="search"
        placeholder="Search…"
        :value="searchQuery"
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div v-if="usedLanguages.length > 1" class="snippet-list__filters">
      <button
        class="snippet-list__filter"
        :class="{ 'snippet-list__filter--active': languageFilter === 'all' }"
        @click="emit('update:languageFilter', 'all')"
      >All</button>
      <button
        v-for="lang in usedLanguages"
        :key="lang"
        class="snippet-list__filter"
        :class="{ 'snippet-list__filter--active': languageFilter === lang }"
        @click="emit('update:languageFilter', lang)"
      >{{ getLanguageLabel(lang) }}</button>
    </div>

    <div class="snippet-list__items">
      <SnippetListItem
        v-for="snippet in snippets"
        :key="snippet.id"
        :snippet="snippet"
        :active="snippet.id === selectedId"
        @click="emit('select', snippet.id)"
      />
      <div v-if="snippets.length === 0" class="snippet-list__empty">
        <span v-if="searchQuery">Nothing found for "{{ searchQuery }}"</span>
        <span v-else>No snippets yet — add one with ⌘N</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.snippet-list {
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-surface);
}

.snippet-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  height: var(--header-height);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.snippet-list__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 6px;
}

.snippet-list__count {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 1px 5px;
  border-radius: 99px;
}

.snippet-list__new {
  font-size: 19px;
  line-height: 1;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: background var(--t-fast), color var(--t-fast);
}

.snippet-list__new:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.snippet-list__search-wrap {
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.snippet-list__search {
  width: 100%;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 5px 10px;
  font-size: 13px;
  color: var(--color-text);
  outline: none;
}

.snippet-list__search:focus { border-color: var(--color-accent); }
.snippet-list__search::placeholder { color: var(--color-text-muted); }

.snippet-list__filters {
  display: flex;
  gap: 4px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.snippet-list__filter {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 8px;
  border-radius: 99px;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}

.snippet-list__filter:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.snippet-list__filter--active {
  background: var(--color-accent-muted);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.snippet-list__items {
  flex: 1;
  overflow-y: auto;
}

.snippet-list__empty {
  padding: 24px 14px;
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
}
</style>
