<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import markdown from 'highlight.js/lib/languages/markdown'
import 'highlight.js/styles/github-dark.css'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)

const props = defineProps<{ content: string }>()
const emit  = defineEmits<{ 'wiki-navigate': [title: string] }>()

marked.use({
  gfm: true,
  extensions: [{
    name: 'wikiLink',
    level: 'inline' as const,
    start(src: string) { return src.indexOf('[[') },
    tokenizer(src: string) {
      const m = /^\[\[([^\]]+)\]\]/.exec(src)
      if (m) return { type: 'wikiLink', raw: m[0], title: m[1].trim() }
    },
    renderer(token) {
      const t    = token as unknown as { title: string }
      const safe = t.title.replace(/"/g, '&quot;')
      return `<a class="wiki-link" data-wiki="${safe}">${t.title}</a>`
    },
  }],
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
      const highlighted = language === 'plaintext'
        ? text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        : hljs.highlight(text, { language }).value
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
    },
  },
})

const rendered = computed<string>(() => {
  if (!props.content.trim()) return ''
  const result = marked.parse(props.content)
  return typeof result === 'string' ? result : ''
})

function handleClick(e: MouseEvent) {
  const el = e.target as HTMLElement
  if (el.classList.contains('wiki-link') && el.dataset.wiki) {
    e.preventDefault()
    emit('wiki-navigate', el.dataset.wiki)
  }
}
</script>

<template>
  <div class="note-preview">
    <div
      v-if="rendered"
      class="note-preview__content doc-content"
      v-html="rendered"
      @click="handleClick"
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
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Markdown typography (mirrors DocsView) ─────────────────── */
.note-preview__content :deep(h1) {
  font-size: 27px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 10px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.note-preview__content :deep(h2) {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
  margin: 32px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.note-preview__content :deep(h3) {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  margin: 24px 0 8px;
}

.note-preview__content :deep(h4) {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 18px 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.note-preview__content :deep(p) {
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text-secondary);
  margin: 0 0 14px;
}

.note-preview__content :deep(ul),
.note-preview__content :deep(ol) {
  padding-left: 22px;
  margin: 0 0 14px;
  color: var(--color-text-secondary);
  font-size: 16px;
  line-height: 1.75;
}

.note-preview__content :deep(li) { margin-bottom: 4px; }

.note-preview__content :deep(code) {
  font-family: var(--font-mono);
  font-size: 13.5px;
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
  background: transparent;
  border: none;
  padding: 0;
  font-size: 13.5px;
  line-height: 1.65;
}

/* Override hljs background to blend with our surface */
.note-preview__content :deep(.hljs) {
  background: transparent;
  padding: 0;
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
  font-size: 14.5px;
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
  font-size: 13.5px;
}

.note-preview__content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 24px 0;
}

.note-preview__content :deep(a) { color: var(--color-accent); }
.note-preview__content :deep(a:hover) { text-decoration: underline; }

.note-preview__content :deep(.wiki-link) {
  color: var(--color-accent);
  border-bottom: 1px dashed var(--color-accent);
  cursor: pointer;
  text-decoration: none;
  transition: opacity var(--t-fast);
}
.note-preview__content :deep(.wiki-link:hover) {
  text-decoration: none;
  opacity: 0.75;
}
.note-preview__content :deep(strong) { color: var(--color-text); font-weight: 600; }
.note-preview__content :deep(em) { color: var(--color-text-secondary); font-style: italic; }
</style>
