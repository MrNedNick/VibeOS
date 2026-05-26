<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { ModuleMeta } from '@/core/registry/modules'
import type { ModuleDetail } from '../data/platform-notes'

interface LiveStats {
  totalCount: number
  doneCount: number
  activeCount: number
  progress: number
}

interface Props {
  mod: ModuleMeta
  detail: ModuleDetail
  liveStats?: LiveStats
}

const { mod, detail, liveStats } = defineProps<Props>()
const router = useRouter()

const STATUS_MAP = {
  available: { label: 'Active',   color: 'success' },
  wip:       { label: 'In Progress', color: 'warning' },
  planned:   { label: 'Planned',  color: 'muted' },
} as const

const PRIORITY_COLOR = { high: 'danger', medium: 'warning', low: 'muted' } as const
const SEVERITY_COLOR = { high: 'danger', medium: 'warning', low: 'muted' } as const

const statusInfo = STATUS_MAP[mod.status]
</script>

<template>
  <div class="detail">

    <!-- Header -->
    <div class="detail__header">
      <span class="detail__icon">{{ mod.icon }}</span>
      <div class="detail__title-group">
        <h2 class="detail__name">{{ mod.label }}</h2>
        <p class="detail__desc">{{ mod.description }}</p>
      </div>
      <div class="detail__header-right">
        <span class="detail__status" :class="`detail__status--${statusInfo.color}`">
          {{ statusInfo.label }}
        </span>
        <button
          v-if="mod.status === 'available'"
          class="detail__open-btn"
          @click="router.push(mod.path)"
        >
          Open module →
        </button>
      </div>
    </div>

    <!-- Module progress -->
    <div class="detail__progress-section">
      <div class="detail__progress-row">
        <span class="detail__progress-label">Module completeness</span>
        <span class="detail__progress-pct">{{ detail.progress }}%</span>
      </div>
      <div class="detail__progress-bar">
        <div
          class="detail__progress-fill"
          :class="{ 'detail__progress-fill--accent': detail.progress > 0 }"
          :style="{ width: `${detail.progress}%` }"
        />
      </div>
      <p class="detail__milestone">{{ detail.milestone }}</p>
    </div>

    <!-- Live usage stats (task-manager only for now) -->
    <div v-if="liveStats && mod.status === 'available'" class="detail__live-stats">
      <p class="detail__section-label">Live stats</p>
      <div class="live-stats">
        <div class="live-stat">
          <span class="live-stat__value">{{ liveStats.totalCount }}</span>
          <span class="live-stat__label">total tasks</span>
        </div>
        <div class="live-stat">
          <span class="live-stat__value live-stat__value--success">{{ liveStats.doneCount }}</span>
          <span class="live-stat__label">done</span>
        </div>
        <div class="live-stat">
          <span class="live-stat__value">{{ liveStats.activeCount }}</span>
          <span class="live-stat__label">remaining</span>
        </div>
        <div class="live-stat">
          <span class="live-stat__value live-stat__value--accent">{{ liveStats.progress }}%</span>
          <span class="live-stat__label">progress</span>
        </div>
      </div>
    </div>

    <!-- Shipped Tasks -->
    <div v-if="detail.shippedTasks.length" class="detail__section">
      <p class="detail__section-label detail__section-label--success">Shipped ✓</p>
      <div class="task-list">
        <div
          v-for="(task, i) in detail.shippedTasks"
          :key="i"
          class="task-row task-row--shipped"
        >
          <span class="task-row__check">✓</span>
          <span class="task-row__label task-row__label--shipped">{{ task.label }}</span>
          <span class="task-row__date">{{ task.date }}</span>
        </div>
      </div>
    </div>

    <!-- Next Tasks -->
    <div v-if="detail.nextTasks.length" class="detail__section">
      <p class="detail__section-label">Next tasks</p>
      <div class="task-list">
        <div
          v-for="(task, i) in detail.nextTasks"
          :key="i"
          class="task-row"
        >
          <span class="task-row__num">{{ i + 1 }}</span>
          <span class="task-row__priority" :class="`task-row__priority--${PRIORITY_COLOR[task.priority]}`">
            {{ task.priority }}
          </span>
          <span class="task-row__label">{{ task.label }}</span>
        </div>
      </div>
    </div>

    <!-- Planned Improvements -->
    <div v-if="detail.improvements.length" class="detail__section">
      <p class="detail__section-label">Planned improvements</p>
      <ul class="detail__list">
        <li v-for="(item, i) in detail.improvements" :key="i">{{ item }}</li>
      </ul>
    </div>

    <!-- Tech Debt -->
    <div v-if="detail.techDebt.length" class="detail__section">
      <p class="detail__section-label">Technical debt</p>
      <div class="debt-list">
        <div v-for="(item, i) in detail.techDebt" :key="i" class="debt-row">
          <span class="debt-row__sev" :class="`debt-row__sev--${SEVERITY_COLOR[item.severity]}`">
            {{ item.severity }}
          </span>
          <span class="debt-row__label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- Ideas -->
    <div v-if="detail.ideas.length" class="detail__section">
      <p class="detail__section-label">Ideas</p>
      <ul class="detail__list detail__list--muted">
        <li v-for="(item, i) in detail.ideas" :key="i">{{ item }}</li>
      </ul>
    </div>

    <!-- Notes -->
    <p v-if="detail.notes" class="detail__notes">{{ detail.notes }}</p>

  </div>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0;
}

/* Header */
.detail__header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--color-border);
}

.detail__icon {
  font-size: 22px;
  flex-shrink: 0;
  padding-top: 2px;
}

.detail__title-group { flex: 1; min-width: 0; }

.detail__name {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 3px;
  line-height: 1.2;
}

.detail__desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.detail__header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.detail__status {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
}

.detail__status--success { background: rgba(52, 208, 88, 0.12);  color: var(--color-success); }
.detail__status--warning { background: rgba(240, 160, 48, 0.12); color: var(--color-warning); }
.detail__status--muted   { background: var(--color-surface-elevated); color: var(--color-text-muted); }

.detail__open-btn {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent);
  padding: 0;
}
.detail__open-btn:hover { text-decoration: underline; }

/* Progress */
.detail__progress-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail__progress-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail__progress-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.detail__progress-pct {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

.detail__progress-bar {
  height: 4px;
  background: var(--color-surface-elevated);
  border-radius: 99px;
  overflow: hidden;
}

.detail__progress-fill {
  height: 100%;
  background: var(--color-border);
  border-radius: 99px;
  transition: width 500ms var(--ease-out);
}

.detail__progress-fill--accent { background: var(--color-accent); }

.detail__milestone {
  font-size: 12px;
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

/* Live stats */
.detail__live-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.live-stats {
  display: flex;
  gap: 16px;
  padding: 12px 14px;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.live-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.live-stat__value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.live-stat__value--success { color: var(--color-success); }
.live-stat__value--accent  { color: var(--color-accent); }

.live-stat__label {
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Sections */
.detail__section { display: flex; flex-direction: column; gap: 8px; }

.detail__section-label {
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

.task-row__priority--danger  { background: rgba(240, 96, 96, 0.12);   color: var(--color-danger); }
.task-row__priority--warning { background: rgba(240, 160, 48, 0.12);  color: var(--color-warning); }
.task-row__priority--muted   { background: var(--color-surface-elevated); color: var(--color-text-muted);
                                border: 1px solid var(--color-border); }

.task-row--shipped {
  opacity: 0.6;
  border-color: transparent;
  background: transparent;
}
.task-row--shipped:hover { opacity: 1; }

.task-row__check {
  font-size: 11px;
  color: var(--color-success);
  width: 14px;
  flex-shrink: 0;
}

.task-row__label--shipped {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.task-row__date {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  flex-shrink: 0;
  white-space: nowrap;
  margin-left: auto;
}

.detail__section-label--success { color: var(--color-success); }

.task-row__label {
  flex: 1;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

/* Lists */
.detail__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.detail__list--muted { color: var(--color-text-muted); }
.detail__list li { padding: 1px 0; }

/* Debt */
.debt-list { display: flex; flex-direction: column; gap: 5px; }

.debt-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 7px 10px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.debt-row__sev {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 5px;
  border-radius: var(--radius-xs);
  flex-shrink: 0;
  margin-top: 1px;
}
.debt-row__sev--danger  { background: rgba(240, 96, 96, 0.12);        color: var(--color-danger); }
.debt-row__sev--warning { background: rgba(240, 160, 48, 0.12);       color: var(--color-warning); }
.debt-row__sev--muted   { background: var(--color-surface-elevated);  color: var(--color-text-muted); }

.debt-row__label { color: var(--color-text-secondary); line-height: 1.4; }

/* Notes */
.detail__notes {
  font-size: 12px;
  color: var(--color-text-muted);
  font-style: italic;
  padding: 10px 12px;
  border-left: 2px solid var(--color-border);
  margin-top: 4px;
}
</style>
