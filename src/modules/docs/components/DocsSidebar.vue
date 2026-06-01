<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { DocSection } from '../data/docs-registry'
import { DOC_FILES } from '../composables/useDocs'
import { useLocale } from '@/core/i18n'

interface Props {
  sections: DocSection[]
  activeSlug: string
}

const props = defineProps<Props>()
const router = useRouter()
const i18n = useLocale()
const isRu = computed(() => i18n.locale === 'ru')

const searchQuery = ref('')
const collapsed = ref<Set<string>>(new Set())

function toggleSection(id: string) {
  if (collapsed.value.has(id)) {
    collapsed.value.delete(id)
  } else {
    collapsed.value.add(id)
  }
  collapsed.value = new Set(collapsed.value)
}

function extractSnippet(content: string, query: string): string {
  const lower = content.toLowerCase()
  const idx = lower.indexOf(query)
  if (idx === -1) return ''
  const start = Math.max(0, idx - 25)
  const end = Math.min(content.length, idx + 55)
  let snippet = content.slice(start, end).replace(/\n+/g, ' ').replace(/#+\s*/g, '').trim()
  if (start > 0) snippet = '…' + snippet
  if (end < content.length) snippet += '…'
  return snippet
}

interface FilteredPage {
  slug: string
  label: string
  labelRu: string
  filePath?: string
  description?: string
  descriptionRu?: string
  snippet?: string
}

const filteredSections = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return props.sections

  return props.sections.map(section => {
    const pages: FilteredPage[] = []
    for (const p of section.pages) {
      const titleMatch =
        p.label.toLowerCase().includes(q) ||
        p.labelRu.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false) ||
        (p.descriptionRu?.toLowerCase().includes(q) ?? false)

      if (titleMatch) {
        pages.push(p)
        continue
      }

      // Fall through to content search (markdown pages only)
      const content = p.filePath ? DOC_FILES[p.filePath] : undefined
      if (content && content.toLowerCase().includes(q)) {
        pages.push({ ...p, snippet: extractSnippet(content, q) })
      }
    }
    return { ...section, pages }
  }).filter(s => s.pages.length > 0)
})

// While searching, force-expand all sections so results are visible
const isCollapsed = (id: string) =>
  !searchQuery.value.trim() && collapsed.value.has(id)
</script>

<template>
  <nav class="docs-nav">
    <div class="docs-nav__search-wrap">
      <input
        v-model="searchQuery"
        class="docs-nav__search"
        type="search"
        :placeholder="i18n.t('docs.searchPlaceholder')"
        aria-label="Search documentation"
      />
    </div>

    <div
      v-for="section in filteredSections"
      :key="section.id"
      class="docs-nav__section"
    >
      <button
        class="docs-nav__label"
        :class="{ 'docs-nav__label--collapsed': isCollapsed(section.id) }"
        @click="toggleSection(section.id)"
      >
        <span>{{ isRu ? section.labelRu : section.label }}</span>
        <span class="docs-nav__chevron">{{ isCollapsed(section.id) ? '›' : '⌄' }}</span>
      </button>

      <div v-if="!isCollapsed(section.id)" class="docs-nav__pages">
        <button
          v-for="page in section.pages"
          :key="page.slug"
          class="docs-nav__item"
          :class="{ 'docs-nav__item--active': activeSlug === page.slug }"
          @click="router.push(`/docs/${page.slug}`)"
        >
          <span class="docs-nav__item-label">{{ isRu ? page.labelRu : page.label }}</span>
          <span v-if="isRu && page.descriptionRu" class="docs-nav__desc">{{ page.descriptionRu }}</span>
          <span v-if="(page as FilteredPage).snippet" class="docs-nav__snippet">
            {{ (page as FilteredPage).snippet }}
          </span>
        </button>
      </div>
    </div>

    <p v-if="filteredSections.length === 0" class="docs-nav__empty">{{ i18n.t('docs.noResults') }}</p>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: background var(--t-fast), color var(--t-fast);
  cursor: pointer;
  text-align: left;
  margin-bottom: 2px;
}
.docs-nav__label:hover { background: var(--color-surface-elevated); color: var(--color-text-secondary); }
.docs-nav__label--collapsed { color: var(--color-text-muted); }

.docs-nav__chevron {
  font-size: 14px;
  line-height: 1;
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform var(--t-fast);
}

.docs-nav__pages {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.docs-nav__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 6px 10px;
  text-align: left;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast), color var(--t-fast);
  gap: 2px;
}

.docs-nav__item-label {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: color var(--t-fast);
}

.docs-nav__desc {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.3;
}

.docs-nav__snippet {
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.4;
}

.docs-nav__item:hover { background: var(--color-surface-elevated); }
.docs-nav__item:hover .docs-nav__item-label { color: var(--color-text); }

.docs-nav__item--active {
  background: var(--color-accent-muted);
}
.docs-nav__item--active .docs-nav__item-label { color: var(--color-accent); }

.docs-nav__empty {
  font-size: 14px;
  color: var(--color-text-muted);
  padding: 8px 8px;
}
</style>
