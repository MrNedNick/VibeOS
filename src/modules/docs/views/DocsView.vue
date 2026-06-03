<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import { useDocs } from '../composables/useDocs'
import DocsSidebar from '../components/DocsSidebar.vue'
import { UiIcon, UiButton } from '@/ui'
import { useTrack } from '@/core/composables/useTrack'

const router = useRouter()
const { DOC_REGISTRY, currentSlug, currentPage, currentContent } = useDocs()
const { track } = useTrack()

function onMobileSelect(e: Event) {
  const slug = (e.target as HTMLSelectElement).value
  if (slug) router.push(`/docs/${slug}`)
}

// Anchor links for headings
marked.use({
  gfm: true,
  renderer: {
    heading({ text, depth }: { text: string; depth: number }): string {
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      return `<h${depth} id="${id}"><a class="anchor-link" href="#${id}">#</a>${text}</h${depth}>\n`
    },
  },
})

const renderedHtml = computed<string>(() => {
  if (!currentContent.value) return ''
  const result = marked.parse(currentContent.value)
  return typeof result === 'string' ? result : ''
})

// Copy buttons for code blocks
const docContentRef = ref<HTMLElement>()

watch(renderedHtml, async () => {
  await nextTick()
  if (!docContentRef.value) return
  docContentRef.value.querySelectorAll<HTMLElement>('pre:not([data-copy-attached])').forEach(pre => {
    pre.setAttribute('data-copy-attached', '')
    const btn = document.createElement('button')
    btn.className = 'copy-btn'
    btn.textContent = 'copy'
    btn.addEventListener('click', () => {
      const code = pre.querySelector('code')?.textContent ?? ''
      navigator.clipboard.writeText(code)
      btn.textContent = 'copied!'
      setTimeout(() => { btn.textContent = 'copy' }, 2000)
    })
    pre.appendChild(btn)
  })
}, { immediate: true })

const firstPage = DOC_REGISTRY[0]?.pages[0]

function goToFirst() {
  if (firstPage) {
    router.push(`/docs/${firstPage.slug}`)
    track('page:navigated', { slug: firstPage.slug })
  }
}

watch(currentSlug, (slug) => {
  if (slug) track('page:navigated', { slug })
})
</script>

<template>
  <div class="docs-layout">
    <!-- Mobile nav dropdown -->
    <div class="docs-layout__mobile-nav">
      <select class="docs-layout__mobile-select" :value="currentSlug" @change="onMobileSelect">
        <option value="">— Navigation —</option>
        <optgroup v-for="section in DOC_REGISTRY" :key="section.id" :label="section.label">
          <option v-for="page in section.pages" :key="page.slug" :value="page.slug">
            {{ page.label }}
          </option>
        </optgroup>
      </select>
    </div>

    <!-- Desktop sidebar nav -->
    <aside class="docs-layout__nav">
      <DocsSidebar :sections="DOC_REGISTRY" :active-slug="currentSlug" />
    </aside>

    <!-- Content -->
    <main class="docs-layout__content">

      <!-- No page selected → show index -->
      <div v-if="!currentSlug" class="docs-home">
        <h1>Documentation</h1>
        <p class="docs-home__sub">How VibeOS is built — architecture decisions, patterns, and module specs.</p>
        <div class="docs-home__grid">
          <div
            v-for="section in DOC_REGISTRY"
            :key="section.id"
            class="docs-home__section"
          >
            <h3 class="docs-home__section-title">{{ section.label }}</h3>
            <button
              v-for="page in section.pages"
              :key="page.slug"
              class="docs-home__link"
              @click="router.push(`/docs/${page.slug}`)"
            >
              <span class="docs-home__link-label">{{ page.label }}</span>
              <span v-if="page.description" class="docs-home__link-desc">{{ page.description }}</span>
            </button>
          </div>
        </div>
        <UiButton @click="goToFirst">
          Start reading <UiIcon name="ArrowRight" :size="14" :stroke-width="2" />
        </UiButton>
      </div>

      <!-- Live UI Kit showcase (component page) -->
      <div v-else-if="currentPage?.component" class="docs-showcase">
        <component :is="currentPage.component" />
      </div>

      <!-- Doc page not found -->
      <div v-else-if="!currentPage || !currentContent" class="docs-missing">
        <p class="docs-missing__title">This page doesn't exist yet.</p>
        <p class="docs-missing__sub">No doc found for <code>{{ currentSlug }}</code> — maybe it's in the backlog.</p>
        <UiButton @click="router.push('/docs')">
          <UiIcon name="ArrowLeft" :size="14" :stroke-width="2" /> Back to index
        </UiButton>
      </div>

      <!-- Rendered markdown -->
      <article v-else class="doc-article">
        <div ref="docContentRef" class="doc-content" v-html="renderedHtml" />
      </article>

    </main>
  </div>
</template>

<style scoped>
.docs-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 32px;
  max-width: 1100px;
  margin: 0 auto;
  align-items: start;
}

.docs-layout__nav {
  padding-top: 4px;
}

/* Mobile nav dropdown — hidden on desktop */
.docs-layout__mobile-nav { display: none; }
.docs-layout__mobile-select {
  width: 100%;
  padding: 9px 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
}
.docs-layout__mobile-select:focus { border-color: var(--color-accent); }

@media (max-width: 767px) {
  .docs-layout {
    grid-template-columns: 1fr;
    gap: 0;
    padding: 0;
  }
  .docs-layout__mobile-nav {
    display: block;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .docs-layout__nav { display: none; }
  .docs-layout__content { padding: 0 16px 24px; }
  .docs-home__grid { grid-template-columns: 1fr; }
}

/* Home index */
.docs-home {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.docs-home h1 {
  font-size: 31px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.docs-home__sub {
  font-size: 17px;
  color: var(--color-text-secondary);
  margin: 0;
  max-width: 520px;
  line-height: 1.6;
}

.docs-home__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.docs-home__section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.docs-home__section-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin: 0 0 6px;
}

.docs-home__link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  text-align: left;
  cursor: pointer;
  transition: border-color var(--t-fast);
}

.docs-home__link:hover { border-color: var(--color-accent); }

.docs-home__link-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.docs-home__link-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.docs-home__start {
  width: fit-content;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.docs-home__start:hover { text-decoration: underline; }

/* Missing */
.docs-missing {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 48px 0;
}

.docs-missing__title { font-size: 21px; font-weight: 600; color: var(--color-text); margin: 0; }
.docs-missing__sub   { font-size: 16px; color: var(--color-text-muted); margin: 0; }
.docs-missing__sub code {
  font-family: var(--font-mono);
  background: var(--color-surface-elevated);
  padding: 1px 5px;
  border-radius: var(--radius-xs);
}

/* Live UI Kit showcase ──────────────────────────────────────── */
.docs-showcase { min-width: 0; }

/* Rendered markdown ─────────────────────────────────────────── */
.doc-article { min-width: 0; }

.doc-content :deep(h1) {
  font-size: 33px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 10px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.doc-content :deep(h2) {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  margin: 36px 0 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
  letter-spacing: -0.01em;
}

.doc-content :deep(h3) {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin: 28px 0 10px;
}

.doc-content :deep(h4) {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 22px 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.doc-content :deep(p) {
  font-size: 18px;
  line-height: 1.8;
  color: var(--color-text-secondary);
  margin: 0 0 16px;
}

.doc-content :deep(ul),
.doc-content :deep(ol) {
  padding-left: 22px;
  margin: 0 0 16px;
  color: var(--color-text-secondary);
  font-size: 18px;
  line-height: 1.75;
}

.doc-content :deep(li) { margin-bottom: 6px; }
.doc-content :deep(li > p) { margin-bottom: 4px; }

.doc-content :deep(code) {
  font-family: var(--font-mono);
  font-size: 15px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  color: var(--color-text);
}

.doc-content :deep(pre) {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 18px 20px;
  overflow-x: auto;
  margin: 0 0 20px;
}

.doc-content :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  font-size: 15px;
  line-height: 1.65;
}

.doc-content :deep(blockquote) {
  border-left: 3px solid var(--color-accent);
  padding: 10px 18px;
  margin: 0 0 18px;
  background: var(--color-accent-muted);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.doc-content :deep(blockquote p) {
  margin: 0;
  color: var(--color-text);
  font-size: 16px;
}

.doc-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 20px;
  font-size: 16px;
}

.doc-content :deep(th),
.doc-content :deep(td) {
  padding: 9px 14px;
  border: 1px solid var(--color-border);
  text-align: left;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.doc-content :deep(th) {
  background: var(--color-surface-elevated);
  font-weight: 600;
  color: var(--color-text);
  font-size: 15px;
}

.doc-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 28px 0;
}

.doc-content :deep(a) { color: var(--color-accent); }
.doc-content :deep(a:hover) { text-decoration: underline; color: var(--color-accent-hover); }

.doc-content :deep(strong) { color: var(--color-text); font-weight: 600; }
.doc-content :deep(em) { color: var(--color-text-secondary); font-style: italic; }

/* Anchor links on headings */
.doc-content :deep(.anchor-link) {
  opacity: 0;
  margin-right: 6px;
  font-size: 0.85em;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: opacity var(--t-fast);
  user-select: none;
}
.doc-content :deep(h1:hover .anchor-link),
.doc-content :deep(h2:hover .anchor-link),
.doc-content :deep(h3:hover .anchor-link),
.doc-content :deep(h4:hover .anchor-link) { opacity: 1; }

/* Copy button on code blocks */
.doc-content :deep(pre) { position: relative; }

.doc-content :deep(.copy-btn) {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 12px;
  font-family: var(--font-mono);
  font-weight: 500;
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: 3px 8px;
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--t-fast), color var(--t-fast);
}
.doc-content :deep(pre:hover .copy-btn) { opacity: 1; }
.doc-content :deep(.copy-btn:hover) { color: var(--color-accent); border-color: var(--color-accent); }
</style>
