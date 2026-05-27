<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import sql from 'highlight.js/lib/languages/sql'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import 'highlight.js/styles/github-dark.css'
import type { Snippet } from '../types'
import { LANGUAGE_OPTIONS, getLanguageLabel } from '../types'

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
hljs.registerLanguage('vue', xml)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)

const props = defineProps<{
  snippet: Snippet
  isEditing: boolean
}>()

const emit = defineEmits<{
  save: [patch: Partial<Omit<Snippet, 'id' | 'createdAt'>>]
  delete: [id: string]
  startEdit: []
  stopEdit: []
}>()

// Draft state for edit mode
const draftTitle = ref('')
const draftCode = ref('')
const draftLanguage = ref('javascript')
const draftTags = ref<string[]>([])
const tagInput = ref('')

watch(() => props.snippet, (s) => {
  draftTitle.value = s.title
  draftCode.value = s.code
  draftLanguage.value = s.language
  draftTags.value = [...s.tags]
}, { immediate: true })

watch(() => props.isEditing, (editing) => {
  if (editing) {
    draftTitle.value = props.snippet.title
    draftCode.value = props.snippet.code
    draftLanguage.value = props.snippet.language
    draftTags.value = [...props.snippet.tags]
    tagInput.value = ''
  }
})

const highlighted = computed(() => {
  if (!props.snippet.code.trim()) return ''
  const lang = props.snippet.language
  const useLang = lang !== 'plaintext' && hljs.getLanguage(lang) ? lang : 'plaintext'
  if (useLang === 'plaintext') {
    return props.snippet.code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
  return hljs.highlight(props.snippet.code, { language: useLang }).value
})

const lineCount = computed(() => props.snippet.code.split('\n').length)
const charCount = computed(() => props.snippet.code.length)

const copied = ref(false)
function copyCode() {
  navigator.clipboard.writeText(props.snippet.code)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function save() {
  emit('save', {
    title: draftTitle.value.trim() || 'Untitled snippet',
    code: draftCode.value,
    language: draftLanguage.value,
    tags: draftTags.value,
  })
  emit('stopEdit')
}

function cancel() {
  emit('stopEdit')
}

function addTag() {
  const tag = tagInput.value.trim().toLowerCase().replace(/,/g, '')
  if (tag && !draftTags.value.includes(tag)) {
    draftTags.value.push(tag)
  }
  tagInput.value = ''
}

function onTagKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  } else if (e.key === 'Backspace' && !tagInput.value && draftTags.value.length > 0) {
    draftTags.value.pop()
  }
}

function removeTag(tag: string) {
  draftTags.value = draftTags.value.filter(t => t !== tag)
}

function onKeydown(e: KeyboardEvent) {
  const meta = e.metaKey || e.ctrlKey
  if (props.isEditing) {
    if (meta && e.key === 's') { e.preventDefault(); save() }
    if (e.key === 'Escape') { e.preventDefault(); cancel() }
  } else {
    if (meta && e.key === 'c') { /* let default work */ }
  }
}
</script>

<template>
  <div class="snippet-detail" @keydown="onKeydown">
    <!-- View mode -->
    <template v-if="!isEditing">
      <div class="snippet-detail__header">
        <div class="snippet-detail__header-left">
          <h2 class="snippet-detail__title">{{ snippet.title }}</h2>
          <span class="snippet-detail__lang-badge">{{ getLanguageLabel(snippet.language) }}</span>
        </div>
        <div class="snippet-detail__header-actions">
          <button class="snippet-detail__copy" :class="{ 'snippet-detail__copy--done': copied }" @click="copyCode">
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
          <button class="snippet-detail__action" title="Edit snippet (⌘E)" @click="emit('startEdit')">Edit</button>
          <button class="snippet-detail__delete" title="Delete snippet" @click="emit('delete', snippet.id)">Delete</button>
        </div>
      </div>

      <div class="snippet-detail__tags-row" v-if="snippet.tags.length > 0">
        <span v-for="tag in snippet.tags" :key="tag" class="snippet-detail__tag">#{{ tag }}</span>
      </div>

      <div class="snippet-detail__code-wrap">
        <pre class="snippet-detail__pre"><code class="hljs" v-html="highlighted || '&nbsp;'" /></pre>
      </div>

      <div class="snippet-detail__footer">
        <span>{{ lineCount }} line{{ lineCount === 1 ? '' : 's' }}</span>
        <span>{{ charCount }} chars</span>
      </div>
    </template>

    <!-- Edit mode -->
    <template v-else>
      <div class="snippet-detail__edit-header">
        <input
          v-model="draftTitle"
          class="snippet-detail__title-input"
          placeholder="Snippet title"
          autofocus
        />
        <div class="snippet-detail__edit-actions">
          <button class="snippet-detail__save-btn" @click="save">Save <kbd>⌘S</kbd></button>
          <button class="snippet-detail__cancel-btn" @click="cancel">Cancel <kbd>Esc</kbd></button>
        </div>
      </div>

      <div class="snippet-detail__edit-meta">
        <select v-model="draftLanguage" class="snippet-detail__lang-select">
          <option v-for="opt in LANGUAGE_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <div class="snippet-detail__tags-editor">
          <span v-for="tag in draftTags" :key="tag" class="snippet-detail__draft-tag">
            #{{ tag }}
            <button class="snippet-detail__tag-remove" @click="removeTag(tag)">×</button>
          </span>
          <input
            v-model="tagInput"
            class="snippet-detail__tag-input"
            placeholder="Add tag…"
            @keydown="onTagKeydown"
            @blur="addTag"
          />
        </div>
      </div>

      <textarea
        v-model="draftCode"
        class="snippet-detail__textarea"
        placeholder="Paste your code here…"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
      />
    </template>
  </div>
</template>

<style scoped>
.snippet-detail {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* View mode header */
.snippet-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 24px;
  height: var(--header-height);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  background: var(--color-surface);
}

.snippet-detail__header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.snippet-detail__title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.snippet-detail__lang-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent);
  background: var(--color-accent-muted);
  border: 1px solid var(--color-accent);
  padding: 2px 8px;
  border-radius: 99px;
  flex-shrink: 0;
}

.snippet-detail__header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.snippet-detail__copy {
  padding: 6px 16px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--t-fast), opacity var(--t-fast);
  min-width: 70px;
}

.snippet-detail__copy:hover { opacity: 0.88; }
.snippet-detail__copy--done { background: var(--color-success, #22c55e); }

.snippet-detail__action {
  padding: 5px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
}

.snippet-detail__action:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.snippet-detail__delete {
  padding: 5px 12px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: transparent;
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
}

.snippet-detail__delete:hover {
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
}

/* Tags row */
.snippet-detail__tags-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 8px 24px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.snippet-detail__tag {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 2px 8px;
  border-radius: 99px;
}

/* Code block */
.snippet-detail__code-wrap {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background: var(--color-bg);
}

.snippet-detail__pre {
  margin: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 20px 24px;
  overflow-x: auto;
  min-height: 100%;
}

.snippet-detail__pre code {
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.7;
  background: transparent;
  padding: 0;
}

/* Override hljs background */
.snippet-detail__pre :deep(.hljs) {
  background: transparent;
  padding: 0;
}

/* Footer */
.snippet-detail__footer {
  display: flex;
  gap: 16px;
  padding: 8px 24px;
  border-top: 1px solid var(--color-border);
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  flex-shrink: 0;
  background: var(--color-surface);
}

/* Edit mode */
.snippet-detail__edit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: var(--header-height);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  background: var(--color-surface);
}

.snippet-detail__title-input {
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  background: transparent;
  border: none;
  outline: none;
  min-width: 0;
}

.snippet-detail__title-input::placeholder { color: var(--color-text-muted); }

.snippet-detail__edit-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.snippet-detail__save-btn {
  padding: 6px 14px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: opacity var(--t-fast);
}

.snippet-detail__save-btn:hover { opacity: 0.88; }

.snippet-detail__cancel-btn {
  padding: 6px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background var(--t-fast);
}

.snippet-detail__cancel-btn:hover { background: var(--color-border); }

kbd {
  font-size: 11px;
  font-family: var(--font-mono);
  opacity: 0.6;
}

.snippet-detail__edit-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.snippet-detail__lang-select {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  outline: none;
  cursor: pointer;
  appearance: none;
}

.snippet-detail__lang-select:focus { border-color: var(--color-accent); }

.snippet-detail__tags-editor {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  min-width: 0;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  cursor: text;
  transition: border-color var(--t-fast);
}

.snippet-detail__tags-editor:focus-within { border-color: var(--color-accent); }

.snippet-detail__draft-tag {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-accent);
  background: var(--color-accent-muted);
  border: 1px solid var(--color-accent);
  padding: 1px 6px;
  border-radius: 99px;
}

.snippet-detail__tag-remove {
  font-size: 14px;
  line-height: 1;
  color: var(--color-accent);
  opacity: 0.6;
  cursor: pointer;
  padding: 0 1px;
}

.snippet-detail__tag-remove:hover { opacity: 1; }

.snippet-detail__tag-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: var(--color-text);
  min-width: 80px;
  flex: 1;
}

.snippet-detail__tag-input::placeholder { color: var(--color-text-muted); }

.snippet-detail__textarea {
  flex: 1;
  resize: none;
  border: none;
  outline: none;
  padding: 20px 24px;
  font-size: 14px;
  font-family: var(--font-mono);
  line-height: 1.7;
  color: var(--color-text);
  background: var(--color-bg);
  overflow-y: auto;
}

.snippet-detail__textarea::placeholder { color: var(--color-text-muted); }

/* Responsive */
@media (max-width: 767px) {
  .snippet-detail__header { padding: 0 14px; }
  .snippet-detail__code-wrap { padding: 14px; }
  .snippet-detail__footer { padding: 6px 14px; }
  .snippet-detail__edit-header { padding: 0 12px; }
  .snippet-detail__textarea { padding: 14px; }
}
</style>
