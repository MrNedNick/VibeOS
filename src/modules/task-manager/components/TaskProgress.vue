<script setup lang="ts">
interface Props {
  progress: number
  activeCount: number
  doneCount: number
}

defineProps<Props>()
</script>

<template>
  <div class="task-progress">
    <div class="task-progress__stats">
      <span class="task-progress__label">
        <span class="task-progress__value">{{ activeCount }}</span>
        remaining
      </span>
      <span class="task-progress__pct">{{ progress }}%</span>
      <span class="task-progress__label">
        <span class="task-progress__value task-progress__value--done">{{ doneCount }}</span>
        done
      </span>
    </div>
    <div class="task-progress__bar" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100">
      <div class="task-progress__fill" :style="{ width: `${progress}%` }" />
    </div>
  </div>
</template>

<style scoped>
.task-progress { display: flex; flex-direction: column; gap: 6px; }

.task-progress__stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.task-progress__value { font-weight: 600; color: var(--color-text); }
.task-progress__value--done { color: var(--color-success); }

.task-progress__pct {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-muted);
}

.task-progress__bar {
  height: 3px;
  background: var(--color-surface-elevated);
  border-radius: 99px;
  overflow: hidden;
}

.task-progress__fill {
  height: 100%;
  background: var(--color-success);
  border-radius: 99px;
  transition: width 400ms var(--ease-out);
}
</style>
