<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const CATEGORIES: { label: string; icon: string; emojis: string[] }[] = [
  { label: 'Health',       icon: '❤️', emojis: ['💪', '🏃', '🧘', '🏋', '🚴', '🤸', '🏊', '🧗', '🚶', '🛌', '💊', '🩺', '❤️', '🫁', '🧬'] },
  { label: 'Food & Drink', icon: '🥗', emojis: ['💧', '🥗', '🥦', '🫐', '🍎', '🥑', '🍵', '☕', '🥝', '🍇', '🫒', '🥕', '🍋', '🫐', '🍓'] },
  { label: 'Learning',     icon: '📚', emojis: ['📖', '📚', '🎓', '✏️', '📝', '🔬', '💻', '🧮', '📐', '🗺️', '🧠', '🔭', '📡', '🗞️', '🎯'] },
  { label: 'Mind',         icon: '🌿', emojis: ['🧘', '🌱', '🌿', '🌊', '🌙', '⭐', '🌅', '🍃', '🌸', '🦋', '🌈', '🕯️', '🌺', '🫶', '🙏'] },
  { label: 'Productive',   icon: '🚀', emojis: ['🎯', '✅', '⏰', '📋', '📊', '🚀', '💡', '🔑', '⚡', '🏆', '🗓', '📌', '📬', '🔔', '⚙️'] },
  { label: 'Creative',     icon: '🎨', emojis: ['🎨', '🎵', '📸', '🎭', '🎸', '🎹', '🎬', '📷', '🖋️', '🧶', '✂️', '🪡', '🎤', '📻', '🎙️'] },
  { label: 'Sport',        icon: '⚽', emojis: ['⚽', '🏀', '🎾', '🏐', '🏓', '🥊', '🤺', '⛷️', '🏄', '🎿', '🏇', '🤾', '🧜', '🏌️', '🥋'] },
]

const open        = ref(false)
const search      = ref('')
const activeTab   = ref(0)
const containerEl = ref<HTMLElement | null>(null)
const searchEl    = ref<HTMLInputElement | null>(null)

const filteredEmojis = computed(() => {
  const q = search.value.trim()
  if (!q) return CATEGORIES[activeTab.value].emojis
  const all = CATEGORIES.flatMap(c => c.emojis)
  // Simple filter — show emojis that match (no text metadata, just show all as a shortcut)
  return all.filter((e, i, arr) => arr.indexOf(e) === i)
})

function pick(emoji: string) {
  emit('update:modelValue', emoji)
  open.value = false
  search.value = ''
}

function openPicker() {
  open.value = true
  setTimeout(() => searchEl.value?.focus(), 60)
}

function onClickOutside(e: MouseEvent) {
  if (containerEl.value && !containerEl.value.contains(e.target as Node)) {
    open.value = false
    search.value = ''
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div ref="containerEl" class="ep">
    <!-- Trigger -->
    <button type="button" class="ep__trigger" @click="openPicker">
      <span v-if="modelValue" class="ep__current">{{ modelValue }}</span>
      <span v-else class="ep__placeholder">⭐</span>
    </button>

    <!-- Picker popover -->
    <div v-if="open" class="ep__popover">
      <input
        ref="searchEl"
        v-model="search"
        class="ep__search"
        placeholder="Search…"
      />

      <!-- Category tabs (hidden when searching) -->
      <div v-if="!search.trim()" class="ep__tabs">
        <button
          v-for="(cat, i) in CATEGORIES"
          :key="cat.label"
          type="button"
          class="ep__tab"
          :class="{ 'ep__tab--active': activeTab === i }"
          :title="cat.label"
          @click="activeTab = i"
        >{{ cat.icon }}</button>
      </div>

      <!-- Emoji grid -->
      <div class="ep__grid">
        <button
          v-for="emoji in filteredEmojis"
          :key="emoji"
          type="button"
          class="ep__emoji"
          :class="{ 'ep__emoji--active': modelValue === emoji }"
          @click="pick(emoji)"
        >{{ emoji }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ep { position: relative; display: inline-block; }

.ep__trigger {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; line-height: 1;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color var(--t-fast), background var(--t-fast);
}
.ep__trigger:hover { border-color: var(--color-accent); background: var(--color-surface-elevated); }

.ep__placeholder { font-size: 20px; opacity: 0.35; }

.ep__popover {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 200;
  width: 248px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-3);
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
}

.ep__search {
  width: 100%;
  padding: 6px 10px;
  font-size: 13px;
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
}
.ep__search:focus { border-color: var(--color-accent); }
.ep__search::placeholder { color: var(--color-text-muted); }

.ep__tabs {
  display: flex;
  gap: 2px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.ep__tab {
  flex-shrink: 0;
  padding: 4px 7px;
  font-size: 16px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: none;
  cursor: pointer;
  transition: background var(--t-fast), border-color var(--t-fast);
}
.ep__tab:hover { background: var(--color-surface-elevated); }
.ep__tab--active { background: var(--color-accent-muted); border-color: color-mix(in srgb, var(--color-accent) 30%, transparent); }

.ep__grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 1px;
  max-height: 180px;
  overflow-y: auto;
}

.ep__emoji {
  padding: 4px;
  font-size: 18px;
  line-height: 1;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: none;
  cursor: pointer;
  transition: background var(--t-fast);
  display: flex; align-items: center; justify-content: center;
}
.ep__emoji:hover { background: var(--color-surface-elevated); }
.ep__emoji--active { background: var(--color-accent-muted); border-color: color-mix(in srgb, var(--color-accent) 30%, transparent); }
</style>
