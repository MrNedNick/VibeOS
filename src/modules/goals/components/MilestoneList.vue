<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { GoalMilestone } from '../types'
import { UiIcon } from '@/ui'

defineProps<{
  milestones: GoalMilestone[]
}>()

const emit = defineEmits<{
  toggle: [id: string]
  add: [title: string]
  delete: [id: string]
}>()

const newTitle = ref('')
const inputRef = ref<HTMLInputElement>()

async function focusInput() {
  await nextTick()
  inputRef.value?.focus()
}

function submitAdd() {
  const t = newTitle.value.trim()
  if (!t) return
  emit('add', t)
  newTitle.value = ''
  focusInput()
}

function onAddKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') submitAdd()
}
</script>

<template>
  <div class="milestones">
    <div v-if="milestones.length > 0" class="milestones__list">
      <div
        v-for="m in milestones"
        :key="m.id"
        class="milestones__item"
        :class="{ 'milestones__item--done': m.completed }"
      >
        <button
          class="milestones__check"
          :class="{ 'milestones__check--on': m.completed }"
          @click="emit('toggle', m.id)"
          :aria-label="m.completed ? 'Uncheck milestone' : 'Check milestone'"
        >
          <UiIcon v-if="m.completed" name="Check" :size="12" :stroke-width="2.5" />
          <span v-else class="milestones__circle" />
        </button>
        <span class="milestones__title">{{ m.title }}</span>
        <button
          class="milestones__del"
          @click="emit('delete', m.id)"
          aria-label="Delete milestone"
        ><UiIcon name="X" :size="14" :stroke-width="2" /></button>
      </div>
    </div>

    <div class="milestones__add">
      <input
        v-model="newTitle"
        ref="inputRef"
        class="milestones__input"
        placeholder="Add milestone…"
        maxlength="120"
        @keydown="onAddKeydown"
      />
      <button
        class="milestones__add-btn"
        :disabled="!newTitle.trim()"
        @click="submitAdd"
      >Add</button>
    </div>
  </div>
</template>

<style scoped>
.milestones { display: flex; flex-direction: column; gap: 8px; }

.milestones__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.milestones__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  transition: opacity var(--t-fast);
}

.milestones__item--done {
  opacity: 0.6;
}

.milestones__check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border);
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 12px;
  transition: all var(--t-fast);
  color: var(--color-text-muted);
  padding: 0;
}

.milestones__check--on {
  background: var(--color-success);
  border-color: var(--color-success);
  color: #fff;
}

.milestones__circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
}

.milestones__title {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-text);
}

.milestones__item--done .milestones__title {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.milestones__del {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0 4px;
  display: flex;
  align-items: center;
  line-height: 1;
  opacity: 0;
  transition: opacity var(--t-fast), color var(--t-fast);
}

.milestones__item:hover .milestones__del { opacity: 1; }
.milestones__del:hover { color: var(--color-danger); }

.milestones__add {
  display: flex;
  gap: 8px;
  align-items: center;
}

.milestones__input {
  flex: 1;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 8px 12px;
  font-size: var(--text-sm);
  color: var(--color-text);
  font-family: inherit;
  transition: border-color var(--t-fast);
}

.milestones__input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.milestones__add-btn {
  padding: 8px 16px;
  border-radius: var(--radius);
  border: none;
  background: var(--color-accent);
  color: #fff;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--t-fast);
  font-family: inherit;
  flex-shrink: 0;
}

.milestones__add-btn:hover { background: var(--color-accent-hover); }
.milestones__add-btn:disabled { opacity: 0.4; cursor: default; }
</style>
