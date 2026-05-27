<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useSnippets } from '../composables/useSnippets'
import SnippetList from '../components/SnippetList.vue'
import SnippetDetail from '../components/SnippetDetail.vue'
import { ref } from 'vue'

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

function onKeydown(e: KeyboardEvent) {
  const meta = e.metaKey || e.ctrlKey
  if (!meta) return
  if (e.key === 'n') { e.preventDefault(); newSnippet() }
  if (e.key === 'f') { e.preventDefault(); snippetListRef.value?.focusSearch() }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="snippets-workspace">
    <SnippetList
      ref="snippetListRef"
      :snippets="filteredSnippets"
      :selected-id="selectedId"
      :search-query="searchQuery"
      :language-filter="languageFilter"
      :used-languages="store.usedLanguages"
      @select="selectSnippet"
      @new="newSnippet"
      @update:search-query="searchQuery = $event"
      @update:language-filter="languageFilter = $event"
    />

    <div class="snippets-main">
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
        <p class="snippets-empty__title">Your code vault is empty.</p>
        <p class="snippets-empty__sub">Save a snippet to have it here whenever you need it.</p>
        <button class="snippets-empty__btn" @click="newSnippet">New snippet</button>
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

/* Mobile: stack vertically */
@media (max-width: 767px) {
  .snippets-workspace { flex-direction: column; }
  .snippets-main { flex: 1; min-height: 0; }
}
</style>
