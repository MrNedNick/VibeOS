<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useTasks } from '../composables/useTasks'
import TaskInput from '../components/TaskInput.vue'
import TaskFilters from '../components/TaskFilters.vue'
import TaskList from '../components/TaskList.vue'
import TaskProgress from '../components/TaskProgress.vue'
import { UiButton } from '@/ui'

const {
  inputText, inputPriority,
  submitTask, removeTask, clearCompleted,
  store, MAX_LENGTH,
} = useTasks()

const focusedId    = ref<string | null>(null)
const taskInputRef = ref<InstanceType<typeof TaskInput>>()

function onKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

  const tasks = store.filteredTasks
  if (!tasks.length) return

  const idx = focusedId.value ? tasks.findIndex(t => t.id === focusedId.value) : -1

  if (e.key === 'j' || e.key === 'ArrowDown') {
    e.preventDefault()
    focusedId.value = tasks[Math.min(idx + 1, tasks.length - 1)].id
  } else if (e.key === 'k' || e.key === 'ArrowUp') {
    e.preventDefault()
    focusedId.value = tasks[Math.max(idx - 1, 0)].id
  } else if (e.key === ' ' && focusedId.value) {
    e.preventDefault()
    store.toggleTask(focusedId.value)
  } else if (e.key === 'd' && focusedId.value) {
    e.preventDefault()
    removeTask(focusedId.value)
    focusedId.value = tasks[Math.min(idx, tasks.length - 2)]?.id ?? null
  } else if (e.key === '/') {
    e.preventDefault()
    document.querySelector<HTMLInputElement>('.ui-input__field')?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="tm-view">
    <!-- Header row -->
    <div class="tm-view__header">
      <div>
        <h1 class="tm-view__title">Task Manager</h1>
        <p class="tm-view__subtitle">{{ store.totalCount }} task{{ store.totalCount === 1 ? '' : 's' }}
          <span class="tm-view__hint">· j/k navigate · space toggle · d delete · / focus input</span>
        </p>
      </div>
      <UiButton
        v-if="store.doneCount > 0"
        variant="ghost"
        size="sm"
        @click="clearCompleted"
      >Clear completed</UiButton>
    </div>

    <!-- Input -->
    <TaskInput
      ref="taskInputRef"
      v-model="inputText"
      :priority="inputPriority"
      :max-length="MAX_LENGTH"
      @update:priority="inputPriority = $event"
      @submit="submitTask"
    />

    <!-- Progress -->
    <TaskProgress
      v-if="store.totalCount > 0"
      :progress="store.progress"
      :active-count="store.activeCount"
      :done-count="store.doneCount"
    />

    <!-- Filters -->
    <TaskFilters
      v-model="store.filter"
      :total-count="store.totalCount"
      :active-count="store.activeCount"
      :done-count="store.doneCount"
    />

    <!-- List -->
    <TaskList
      :tasks="store.filteredTasks"
      :focused-id="focusedId"
      @toggle="store.toggleTask"
      @delete="removeTask"
      @edit="store.updateTask"
      @focus="focusedId = $event"
    />
  </div>
</template>

<style scoped>
.tm-view {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tm-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.tm-view__title {
  font-size: 27px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.tm-view__subtitle {
  font-size: 15px;
  color: var(--color-text-muted);
  margin: 2px 0 0;
}

.tm-view__hint {
  font-size: 13px;
  color: var(--color-text-muted);
  opacity: 0.5;
  font-family: var(--font-mono);
}
</style>
