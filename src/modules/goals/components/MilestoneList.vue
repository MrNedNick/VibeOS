<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { GoalMilestone } from '../types'
import { UiIcon, UiInput, UiButton, UiIconButton } from '@/ui'

defineProps<{
  milestones: GoalMilestone[]
}>()

const emit = defineEmits<{
  toggle: [id: string]
  add: [title: string]
  delete: [id: string]
}>()

const newTitle = ref('')
const inputRef = ref<InstanceType<typeof UiInput>>()

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
        <!-- Circular checkbox — bespoke: circular shape + conditional inner icon/dot -->
        <button
          class="milestones__check"
          :class="{ 'milestones__check--on': m.completed }"
          :aria-label="m.completed ? 'Uncheck milestone' : 'Check milestone'"
          @click="emit('toggle', m.id)"
        >
          <UiIcon v-if="m.completed" name="Check" :size="12" :stroke-width="2.5" />
          <span v-else class="milestones__circle" />
        </button>
        <span class="milestones__title">{{ m.title }}</span>
        <UiIconButton
          name="X"
          aria-label="Delete milestone"
          size="sm"
          variant="danger"
          class="milestones__del"
          @click="emit('delete', m.id)"
        />
      </div>
    </div>

    <div class="milestones__add">
      <UiInput
        ref="inputRef"
        v-model="newTitle"
        placeholder="Add milestone…"
        :maxlength="120"
        @keydown="onAddKeydown"
      />
      <UiButton size="sm" :disabled="!newTitle.trim()" @click="submitAdd">Add</UiButton>
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

.milestones__item--done { opacity: 0.6; }

/* Circular checkbox — bespoke: circular shape not in UiButton variants */
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

/* Delete button — opacity-0 by default, shows on hover */
.milestones__del {
  opacity: 0;
  transition: opacity var(--t-fast) !important;
}
.milestones__item:hover .milestones__del { opacity: 1; }

.milestones__add {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style>
