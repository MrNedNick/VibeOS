<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { DocSection } from '../data/docs-registry'

interface Props {
  sections: DocSection[]
  activeSlug: string
}

const props = defineProps<Props>()
const router = useRouter()

const searchQuery = ref('')

const filteredSections = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.sections
  return props.sections.map(section => ({
    ...section,
    pages: section.pages.filter(p =>
      p.label.toLowerCase().includes(q) ||
      (p.description?.toLowerCase().includes(q) ?? false)
    ),
  })).filter(s => s.pages.length > 0)
})
</script>

<template>
  <nav class="docs-nav">
    <div class="docs-nav__search-wrap">
      <input
        v-model="searchQuery"
        class="docs-nav__search"
        type="search"
        placeholder="Search docs…"
        aria-label="Search documentation"
      />
    </div>

    <div
      v-for="section in filteredSections"
      :key="section.id"
      class="docs-nav__section"
    >
      <p class="docs-nav__label">{{ section.label }}</p>
      <button
        v-for="page in section.pages"
        :key="page.slug"
        class="docs-nav__item"
        :class="{ 'docs-nav__item--active': activeSlug === page.slug }"
        @click="router.push(`/docs/${page.slug}`)"
      >
        {{ page.label }}
      </button>
    </div>

    <p v-if="filteredSections.length === 0" class="docs-nav__empty">No results</p>
  </nav>
</template>

<style scoped>
.docs-nav {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 8px;
  position: sticky;
  top: 0;
}

.docs-nav__search-wrap {
  margin-bottom: -8px;
}

.docs-nav__search {
  width: 100%;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  font-size: 14px;
  color: var(--color-text);
  outline: none;
  font-family: inherit;
}
.docs-nav__search:focus { border-color: var(--color-accent); }
.docs-nav__search::placeholder { color: var(--color-text-muted); }

.docs-nav__section { display: flex; flex-direction: column; gap: 2px; }

.docs-nav__label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin: 0 0 4px 8px;
}

.docs-nav__item {
  display: block;
  width: 100%;
  padding: 6px 10px;
  text-align: left;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  transition: background var(--t-fast), color var(--t-fast);
}

.docs-nav__item:hover { background: var(--color-surface-elevated); color: var(--color-text); }

.docs-nav__item--active {
  background: var(--color-accent-muted);
  color: var(--color-accent);
}

.docs-nav__empty {
  font-size: 14px;
  color: var(--color-text-muted);
  padding: 8px 8px;
}
</style>
