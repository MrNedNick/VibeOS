<script setup lang="ts">
import { computed } from 'vue'

export interface AggregatedTask {
  label: string
  priority: 'high' | 'medium' | 'low'
  moduleId: string
  moduleLabel: string
  moduleIcon: string
}

const props = defineProps<{ tasks: AggregatedTask[] }>()

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const
const PRIORITY_COLOR = { high: 'danger', medium: 'warning', low: 'muted' } as const

const sorted = computed(() =>
  [...props.tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
)

const top5 = computed(() => sorted.value.slice(0, 5))
const rest = computed(() => sorted.value.slice(5))

const highCount   = computed(() => props.tasks.filter(t => t.priority === 'high').length)
const mediumCount = computed(() => props.tasks.filter(t => t.priority === 'medium').length)
const lowCount    = computed(() => props.tasks.filter(t => t.priority === 'low').length)
</script>

<template>
  <div class="all-tasks">

    <!-- Header -->
    <div class="all-tasks__header">
      <div class="all-tasks__title-group">
        <h2 class="all-tasks__title">All Tasks</h2>
        <p class="all-tasks__sub">Across all modules — sorted by priority</p>
      </div>
      <span class="all-tasks__total">{{ tasks.length }} total</span>
    </div>

    <!-- Priority breakdown -->
    <div class="priority-strip">
      <div class="priority-pill priority-pill--danger">
        <span class="priority-pill__count">{{ highCount }}</span>
        <span class="priority-pill__label">high</span>
      </div>
      <div class="priority-pill priority-pill--warning">
        <span class="priority-pill__count">{{ mediumCount }}</span>
        <span class="priority-pill__label">medium</span>
      </div>
      <div class="priority-pill priority-pill--muted">
        <span class="priority-pill__count">{{ lowCount }}</span>
        <span class="priority-pill__label">low</span>
      </div>
    </div>

    <!-- Top 5 -->
    <div class="all-tasks__section">
      <p class="all-tasks__section-label">Top 5</p>
      <div class="task-list">
        <div
          v-for="(task, i) in top5"
          :key="i"
          class="task-row task-row--top"
        >
          <span class="task-row__num">{{ i + 1 }}</span>
          <span class="task-row__priority" :class="`task-row__priority--${PRIORITY_COLOR[task.priority]}`">
            {{ task.priority }}
          </span>
          <span class="task-row__label">{{ task.label }}</span>
          <span class="task-row__module">
            <span class="task-row__module-icon">{{ task.moduleIcon }}</span>
            {{ task.moduleLabel }}
          </span>
        </div>
      </div>
    </div>

    <!-- Rest -->
    <div v-if="rest.length" class="all-tasks__section">
      <p class="all-tasks__section-label">Remaining ({{ rest.length }})</p>
      <div class="task-list">
        <div
          v-for="(task, i) in rest"
          :key="i"
          class="task-row"
        >
          <span class="task-row__num">{{ i + 6 }}</span>
          <span class="task-row__priority" :class="`task-row__priority--${PRIORITY_COLOR[task.priority]}`">
            {{ task.priority }}
          </span>
          <span class="task-row__label">{{ task.label }}</span>
          <span class="task-row__module">
            <span class="task-row__module-icon">{{ task.moduleIcon }}</span>
            {{ task.moduleLabel }}
          </span>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.all-tasks {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.all-tasks__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--color-border);
}

.all-tasks__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 3px;
  line-height: 1.2;
}

.all-tasks__sub {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.all-tasks__total {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  flex-shrink: 0;
  padding-top: 3px;
}

/* Priority strip */
.priority-strip {
  display: flex;
  gap: 8px;
}

.priority-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  flex: 1;
}

.priority-pill--danger  { background: rgba(240, 96, 96, 0.1);  border: 1px solid rgba(240, 96, 96, 0.2); }
.priority-pill--warning { background: rgba(240, 160, 48, 0.1); border: 1px solid rgba(240, 160, 48, 0.2); }
.priority-pill--muted   { background: var(--color-surface-elevated); border: 1px solid var(--color-border); }

.priority-pill__count {
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.priority-pill--danger  .priority-pill__count { color: var(--color-danger); }
.priority-pill--warning .priority-pill__count { color: var(--color-warning); }
.priority-pill--muted   .priority-pill__count { color: var(--color-text-secondary); }

.priority-pill__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

/* Sections */
.all-tasks__section { display: flex; flex-direction: column; gap: 8px; }

.all-tasks__section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

/* Task list */
.task-list { display: flex; flex-direction: column; gap: 5px; }

.task-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.task-row__num {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-muted);
  width: 14px;
  flex-shrink: 0;
  padding-top: 1px;
}

.task-row__priority {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 5px;
  border-radius: var(--radius-xs);
  flex-shrink: 0;
  margin-top: 1px;
}

.task-row__priority--danger  { background: rgba(240, 96, 96, 0.12);  color: var(--color-danger); }
.task-row__priority--warning { background: rgba(240, 160, 48, 0.12); color: var(--color-warning); }
.task-row__priority--muted   { background: var(--color-surface-elevated); color: var(--color-text-muted); border: 1px solid var(--color-border); }

.task-row__label {
  flex: 1;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.task-row__module {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  white-space: nowrap;
}

.task-row__module-icon { font-size: 11px; }
</style>
