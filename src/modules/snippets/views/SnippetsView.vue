<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useSnippets } from '../composables/useSnippets'
import SnippetList from '../components/SnippetList.vue'
import SnippetDetail from '../components/SnippetDetail.vue'

const {
  store,
  selectedId,
  searchQuery,
  languageFilter,
  isEditing,
  filteredSnippets,
  selectedSnippet,
  newSnippet,
  selectSnippet,
  deleteSnippet,
} = useSnippets()

const snippetListRef = ref<InstanceType<typeof SnippetList>>()

// Mobile: track whether we're showing the detail pane
const mobileShowDetail = ref(false)

function selectSnippetMobile(id: string) {
  selectSnippet(id)
  mobileShowDetail.value = true
}

function newSnippetMobile() {
  newSnippet()
  mobileShowDetail.value = true
}

function backToList() {
  mobileShowDetail.value = false
}

function onKeydown(e: KeyboardEvent) {
  const meta = e.metaKey || e.ctrlKey
  if (!meta) return
  if (e.key === 'n') { e.preventDefault(); newSnippetMobile() }
  if (e.key === 'f') { e.preventDefault(); snippetListRef.value?.focusSearch() }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="snippets-workspace" :class="{ 'snippets-workspace--detail': mobileShowDetail }">
    <SnippetList
      ref="snippetListRef"
      :snippets="filteredSnippets"
      :selected-id="selectedId"
      :search-query="searchQuery"
      :language-filter="languageFilter"
      :used-languages="store.usedLanguages"
      @select="selectSnippetMobile"
      @new="newSnippetMobile"
      @update:search-query="searchQuery = $event"
      @update:language-filter="languageFilter = $event"
    />

    <div class="snippets-main">
      <!-- Mobile back button -->
      <button v-if="mobileShowDetail" class="snippets-back" @click="backToList">
        ← Snippets
      </button>

      <SnippetDetail
        v-if="selectedSnippet"
        :snippet="selectedSnippet"
        :is-editing="isEditing"
        @save="store.updateSnippet(selectedSnippet!.id, $event)"
        @delete="deleteSnippet"
        @start-edit="isEditing = true"
        @stop-edit="isEditing = false"
      />

      <div v-else class="snippets-empty">
        <p class="snippets-empty__title">Code vault is empty.</p>
        <p class="snippets-empty__sub">Save the patterns you keep rewriting. Find them in seconds with ⌘F.</p>
        <button class="snippets-empty__btn" @click="newSnippetMobile">Add first snippet</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.snippets-workspace {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.snippets-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.snippets-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-text-muted);
}

.snippets-empty__title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0;
}

.snippets-empty__sub {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
  max-width: 300px;
  text-align: center;
}

.snippets-empty__btn {
  margin-top: 8px;
  padding: 7px 18px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: opacity var(--t-fast);
  cursor: pointer;
}

.snippets-empty__btn:hover { opacity: 0.88; }

/* Mobile: single pane at a time */
@media (max-width: 767px) {
  .snippets-workspace {
    flex-direction: column;
  }

  /* Default: show list, hide main */
  .snippets-main {
    display: none;
  }

  /* When detail is active: hide list, show main */
  .snippets-workspace--detail :deep(.snippet-list) {
    display: none;
  }

  .snippets-workspace--detail .snippets-main {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }
}

.snippets-back {
  display: none;
}

@media (max-width: 767px) {
  .snippets-back {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-accent);
    background: none;
    border: none;
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    text-align: left;
    width: 100%;
    flex-shrink: 0;
  }
  .snippets-back:hover {
    background: var(--color-accent-muted);
  }
}
</style>
