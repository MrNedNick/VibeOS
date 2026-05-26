<script setup lang="ts">
import { useTasks } from '../composables/useTasks'
import TaskInput from '../components/TaskInput.vue'
import TaskFilters from '../components/TaskFilters.vue'
import TaskList from '../components/TaskList.vue'
import TaskProgress from '../components/TaskProgress.vue'
import { UiButton } from '@/ui'

const { inputText, submitTask, removeTask, clearCompleted, store, MAX_LENGTH } = useTasks()
</script>

<template>
  <div class="tm-view">
    <!-- Header row -->
    <div class="tm-view__header">
      <div>
        <h1 class="tm-view__title">Task Manager</h1>
        <p class="tm-view__subtitle">{{ store.totalCount }} task{{ store.totalCount === 1 ? '' : 's' }}</p>
      </div>
      <UiButton
        v-if="store.doneCount > 0"
        variant="ghost"
        size="sm"
        @click="clearCompleted"
      >
        Clear completed
      </UiButton>
    </div>

    <!-- Input -->
    <TaskInput
      v-model="inputText"
      :max-length="MAX_LENGTH"
      @submit="submitTask"
    />

    <!-- Progress (only when there are tasks) -->
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
      @toggle="store.toggleTask"
      @delete="removeTask"
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
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.tm-view__subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 2px 0 0;
}
</style>
