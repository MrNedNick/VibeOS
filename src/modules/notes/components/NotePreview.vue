<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{ content: string }>()

marked.use({ gfm: true })

const rendered = computed<string>(() => {
  if (!props.content.trim()) return ''
  const result = marked.parse(props.content)
  return typeof result === 'string' ? result : ''
})
</script>

<template>
  <div class="note-preview">
    <div
      v-if="rendered"
      class="note-preview__content doc-content"
      v-html="rendered"
    />
    <p v-else class="note-preview__empty">Preview will appear here</p>
  </div>
</template>

<style scoped>
.note-preview {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 24px 28px;
  background: var(--color-bg);
}

.note-preview__empty {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Markdown typography (mirrors DocsView) ─────────────────── */
.note-preview__content :deep(h1) {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 10px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.note-preview__content :deep(h2) {
  font-size: 19px;
  font-weight: 600;
  color: var(--color-text);
  margin: 32px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.note-preview__content :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 24px 0 8px;
}

.note-preview__content :deep(h4) {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 18px 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.note-preview__content :deep(p) {
  font-size: 15px;
  line-height: 1.8;
  color: var(--color-text-secondary);
  margin: 0 0 14px;
}

.note-preview__content :deep(ul),
.note-preview__content :deep(ol) {
  padding-left: 22px;
  margin: 0 0 14px;
  color: var(--color-text-secondary);
  font-size: 15px;
  line-height: 1.75;
}

.note-preview__content :deep(li) { margin-bottom: 4px; }

.note-preview__content :deep(code) {
  font-family: var(--font-mono);
  font-size: 12.5px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 2px 5px;
  border-radius: var(--radius-xs);
  color: var(--color-text);
}

.note-preview__content :deep(pre) {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 16px 18px;
  overflow-x: auto;
  margin: 0 0 16px;
}

.note-preview__content :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  font-size: 12.5px;
  line-height: 1.65;
}

.note-preview__content :deep(blockquote) {
  border-left: 3px solid var(--color-accent);
  padding: 8px 16px;
  margin: 0 0 16px;
  background: var(--color-accent-muted);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.note-preview__content :deep(blockquote p) {
  margin: 0;
  color: var(--color-text);
}

.note-preview__content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 16px;
  font-size: 13.5px;
}

.note-preview__content :deep(th),
.note-preview__content :deep(td) {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  text-align: left;
  color: var(--color-text-secondary);
}

.note-preview__content :deep(th) {
  background: var(--color-surface-elevated);
  font-weight: 600;
  color: var(--color-text);
  font-size: 12.5px;
}

.note-preview__content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 24px 0;
}

.note-preview__content :deep(a) { color: var(--color-accent); }
.note-preview__content :deep(a:hover) { text-decoration: underline; }
.note-preview__content :deep(strong) { color: var(--color-text); font-weight: 600; }
.note-preview__content :deep(em) { color: var(--color-text-secondary); font-style: italic; }
</style>
