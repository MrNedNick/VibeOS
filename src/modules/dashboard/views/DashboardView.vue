<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PLATFORM_MODULES } from '@/core/registry/modules'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useLearningStore } from '@/modules/learning/stores/learning.store'
import { useTrainingStore } from '@/modules/training/stores/training.store'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { TOTAL_DOC_PAGES } from '@/modules/docs/data/docs-registry'
import { MODULE_DETAILS, PLATFORM_STATUS } from '../data/platform-notes'
import StatCard from '../components/StatCard.vue'
import ModuleDetailPanel from '../components/ModuleDetailPanel.vue'
import AllTasksPanel, { type AggregatedTask, type AggregatedShipped } from '../components/AllTasksPanel.vue'
import RecentActivityPanel from '../components/RecentActivityPanel.vue'
import { useLocale } from '@/core/i18n'
import { UiIcon } from '@/ui'

const OVERVIEW_ID = '__overview__'

const router = useRouter()
const tasksStore = useTasksStore()
const goalsStore = useGoalsStore()
const learningStore = useLearningStore()
const trainingStore = useTrainingStore()
const habitsStore = useHabitsStore()
const i18n = useLocale()

const todayHabits = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const total = habitsStore.habits.length
  const done  = habitsStore.habits.filter(h => h.completedDates.includes(today)).length
  return { total, done }
})

const today = computed(() =>
  new Date().toLocaleDateString(i18n.localeCode, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
)

// ── Module selection ────────────────────────────────────────────
const selectedId = ref(OVERVIEW_ID)

const allModules = computed(() => PLATFORM_MODULES)

const selectedMod = computed(() =>
  PLATFORM_MODULES.find(m => m.id === selectedId.value) ?? PLATFORM_MODULES[0]
)

const selectedDetail = computed(() =>
  MODULE_DETAILS[selectedId.value] ?? MODULE_DETAILS['dashboard']
)

const liveStats = computed(() =>
  selectedId.value === 'task-manager'
    ? {
        totalCount:  tasksStore.totalCount,
        doneCount:   tasksStore.doneCount,
        activeCount: tasksStore.activeCount,
        progress:    tasksStore.progress,
      }
    : undefined
)

// ── Aggregated tasks across all modules ─────────────────────────
const aggregatedTasks = computed<AggregatedTask[]>(() => {
  const result: AggregatedTask[] = []
  for (const mod of PLATFORM_MODULES) {
    const detail = MODULE_DETAILS[mod.id]
    if (!detail) continue
    for (const task of detail.nextTasks) {
      result.push({
        label:       task.label,
        priority:    task.priority,
        moduleId:    mod.id,
        moduleLabel: mod.label,
        moduleIcon:  mod.icon,
      })
    }
  }
  return result
})

// ── Aggregated shipped tasks across all modules ─────────────────
const aggregatedShipped = computed<AggregatedShipped[]>(() => {
  const result: AggregatedShipped[] = []
  for (const mod of PLATFORM_MODULES) {
    const detail = MODULE_DETAILS[mod.id]
    if (!detail) continue
    for (const task of detail.shippedTasks) {
      result.push({
        label:       task.label,
        date:        task.date,
        moduleId:    mod.id,
        moduleLabel: mod.label,
        moduleIcon:  mod.icon,
      })
    }
  }
  // Sort newest first
  return result.sort((a, b) => b.date.localeCompare(a.date))
})

// ── Platform-level task stats (from MODULE_DETAILS — not task manager) ──
const platformTotalTasks = computed(() =>
  aggregatedTasks.value.length + aggregatedShipped.value.length
)
const platformProgress = computed(() =>
  platformTotalTasks.value === 0
    ? 0
    : Math.round((aggregatedShipped.value.length / platformTotalTasks.value) * 100)
)

// ── Top-level stats ─────────────────────────────────────────────
const availableCount = computed(() =>
  PLATFORM_MODULES.filter(m => m.status === 'available').length
)

const STATUS_ICONS: Record<string, string> = { good: '✓', missing: '✕', planned: '◷' }
const APP_VERSION = __APP_VERSION__
</script>

<template>
  <div class="dashboard">

    <!-- Header ──────────────────────────────────────────────────── -->
    <div class="dashboard__header">
      <div>
        <h1 class="dashboard__title">{{ i18n.t('dashboard.title') }}</h1>
        <p class="dashboard__date">{{ today }}</p>
      </div>
      <span class="dashboard__version">v{{ APP_VERSION }} · VibeOS</span>
    </div>

    <!-- Widget strip ────────────────────────────────────────────── -->
    <div class="dashboard__stats">
      <StatCard
        icon="Package"
        :label="i18n.t('dashboard.statModules')"
        :value="`${availableCount} / ${PLATFORM_MODULES.length}`"
        :sub="i18n.t('dashboard.planned', { n: PLATFORM_MODULES.length - availableCount })"
        clickable
        @click="selectedId = OVERVIEW_ID"
      />
      <StatCard
        icon="List"
        :label="i18n.t('dashboard.statTasks')"
        :value="aggregatedTasks.length"
        :sub="i18n.t('dashboard.shippedCount', { n: aggregatedShipped.length })"
        clickable
        @click="selectedId = OVERVIEW_ID"
      />
      <StatCard
        icon="TrendingUp"
        :label="i18n.t('dashboard.statProgress')"
        :value="`${platformProgress}%`"
        :sub="i18n.t('dashboard.progressOf', { done: aggregatedShipped.length, total: platformTotalTasks })"
        :progress="platformProgress"
        :accent="platformProgress > 0"
        clickable
        @click="selectedId = OVERVIEW_ID"
      />
      <StatCard
        icon="FileText"
        :label="i18n.t('dashboard.statDocs')"
        :value="TOTAL_DOC_PAGES"
        :sub="i18n.t('dashboard.pagesWritten')"
        clickable
        @click="selectedId = 'docs'"
      />
    </div>

    <!-- Life module stats ───────────────────────────────────────── -->
    <div class="dashboard__life-stats">
      <div class="life-stat" @click="router.push('/habits')">
        <span class="life-stat__icon">●</span>
        <div class="life-stat__info">
          <span class="life-stat__value">{{ todayHabits.done }}/{{ todayHabits.total }}</span>
          <span class="life-stat__label">{{ i18n.t('dashboard.habitsToday') }}</span>
        </div>
        <div
          class="life-stat__bar"
          :style="{ '--pct': todayHabits.total > 0 ? `${Math.round(todayHabits.done/todayHabits.total*100)}%` : '0%' }"
        />
      </div>
      <div class="life-stat" @click="router.push('/goals')">
        <span class="life-stat__icon">🎯</span>
        <div class="life-stat__info">
          <span class="life-stat__value">{{ goalsStore.activeGoals.length }}</span>
          <span class="life-stat__label">{{ i18n.t('dashboard.activeGoals') }}</span>
        </div>
      </div>
      <div class="life-stat" @click="router.push('/learning')">
        <span class="life-stat__icon">📚</span>
        <div class="life-stat__info">
          <span class="life-stat__value">{{ learningStore.todayItems.length }}</span>
          <span class="life-stat__label">{{ i18n.t('dashboard.learningToday') }}</span>
        </div>
        <span v-if="learningStore.todayItems.some(i => i.logged)" class="life-stat__done">{{ learningStore.todayItems.filter(i => i.logged).length }} {{ i18n.t('dashboard.doneSuffix') }}</span>
      </div>
      <div class="life-stat" @click="router.push('/training')">
        <span class="life-stat__icon">💪</span>
        <div class="life-stat__info">
          <span class="life-stat__value">{{ trainingStore.todayItems.length }}</span>
          <span class="life-stat__label">{{ i18n.t('dashboard.trainingToday') }}</span>
        </div>
        <span v-if="trainingStore.todayItems.some(i => i.logged)" class="life-stat__done">{{ trainingStore.todayItems.filter(i => i.logged).length }} {{ i18n.t('dashboard.doneSuffix') }}</span>
      </div>
    </div>

    <!-- Workspace: module list + detail panel ───────────────────── -->
    <div class="dashboard__workspace">

      <!-- Left: module list ────────────────────────────────────── -->
      <div class="dashboard__module-list">

        <!-- All Tasks (overview row — always first) -->
        <div
          class="mod-row mod-row--overview"
          :class="{ 'mod-row--active': selectedId === OVERVIEW_ID }"
          @click="selectedId = OVERVIEW_ID"
        >
          <span class="mod-row__icon"><UiIcon name="List" :size="15" :stroke-width="1.75" /></span>
          <span class="mod-row__name">{{ i18n.t('dashboard.allTasks') }}</span>
          <span class="mod-row__count">{{ aggregatedTasks.length }}</span>
        </div>

        <div class="mod-row__divider" />

        <!-- Individual modules -->
        <div
          v-for="mod in allModules"
          :key="mod.id"
          class="mod-row"
          :class="{
            'mod-row--active':   selectedId === mod.id,
            'mod-row--disabled': mod.status !== 'available' && mod.status !== 'planned',
          }"
          @click="selectedId = mod.id"
        >
          <span class="mod-row__icon"><UiIcon :name="mod.icon" :size="15" :stroke-width="1.75" /></span>
          <span class="mod-row__name">{{ i18n.t('modules.' + mod.id) === 'modules.' + mod.id ? mod.label : i18n.t('modules.' + mod.id) }}</span>
          <button
            v-if="mod.status === 'available'"
            class="mod-row__launch"
            title="Open app"
            @click.stop="router.push(mod.path)"
          >→</button>
          <span
            v-else
            class="mod-row__indicator"
            :class="`mod-row__indicator--${mod.status}`"
          />
        </div>

        <!-- Platform health (compact) ─────────────────────────── -->
        <div class="health-compact">
          <p class="health-compact__label">{{ i18n.t('dashboard.health') }}</p>
          <div
            v-for="item in PLATFORM_STATUS"
            :key="item.labelKey"
            class="health-compact__row"
          >
            <span
              class="health-compact__dot"
              :class="`health-compact__dot--${item.status}`"
            >{{ STATUS_ICONS[item.status] }}</span>
            <span class="health-compact__text">{{ i18n.t(item.labelKey) }}</span>
          </div>
        </div>
      </div>

      <!-- Right: detail panel ─────────────────────────────────── -->
      <div class="dashboard__detail">
        <Transition name="panel" mode="out-in">

          <!-- Overview: all tasks aggregated + activity -->
          <div v-if="selectedId === OVERVIEW_ID" key="__overview__" class="overview-panels">
            <AllTasksPanel
              :tasks="aggregatedTasks"
              :shipped-tasks="aggregatedShipped"
            />
            <div class="overview-activity">
              <RecentActivityPanel />
            </div>
          </div>

          <!-- Per-module detail -->
          <ModuleDetailPanel
            v-else
            :key="selectedId"
            :mod="selectedMod"
            :detail="selectedDetail"
            :live-stats="liveStats"
          />

        </Transition>
      </div>

    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1040px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

/* Header */
.dashboard__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}

.dashboard__title {
  font-size: 27px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.dashboard__date {
  font-size: 15px;
  color: var(--color-text-muted);
  margin: 3px 0 0;
}

.dashboard__version {
  font-size: 14px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

/* Stats */
.dashboard__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

/* Life stats strip */
.dashboard__life-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.life-stat {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: border-color var(--t-fast);
  position: relative;
  overflow: hidden;
}
.life-stat:hover { border-color: var(--color-accent); }

.life-stat__icon { font-size: 20px; flex-shrink: 0; }

.life-stat__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.life-stat__value {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.life-stat__label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.life-stat__done {
  font-size: 11px;
  color: var(--color-success);
  font-weight: 500;
  flex-shrink: 0;
}

.life-stat__bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: var(--pct, 0%);
  height: 2px;
  background: var(--color-accent);
  border-radius: 0 99px 99px 0;
  transition: width 0.4s ease;
}

/* Workspace */
.dashboard__workspace {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
  align-items: start;
}

/* Module list (left) */
.dashboard__module-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: sticky;
  top: 0;
}

.mod-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
  color: var(--color-text-secondary);
  font-size: 15px;
  font-weight: 500;
  user-select: none;
}

.mod-row:hover:not(.mod-row--active) {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.mod-row--active {
  background: var(--color-accent-muted);
  color: var(--color-accent);
}

.mod-row--disabled { cursor: default; opacity: 0.5; }

.mod-row--overview {
  font-weight: 600;
}

.mod-row__divider {
  height: 1px;
  background: var(--color-border);
  margin: 4px 6px 6px;
}

.mod-row__icon {
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
}

.mod-row__name { flex: 1; }

.mod-row__count {
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 1px 6px;
  border-radius: 99px;
  flex-shrink: 0;
}

.mod-row--active .mod-row__count {
  background: var(--color-accent-muted);
  border-color: transparent;
  color: var(--color-accent);
}

.mod-row__indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.mod-row__indicator--available { background: var(--color-success); }
.mod-row__indicator--wip       { background: var(--color-warning); }
.mod-row__indicator--planned   { background: var(--color-border); }

.mod-row__launch {
  opacity: 0;
  font-size: 13px;
  color: var(--color-accent);
  flex-shrink: 0;
  padding: 1px 5px;
  border-radius: var(--radius-xs);
  transition: opacity var(--t-fast), background var(--t-fast);
}
.mod-row:hover .mod-row__launch { opacity: 1; }
.mod-row__launch:hover { background: var(--color-accent-muted); }

/* Health compact */
.health-compact {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.health-compact__label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.health-compact__row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
  padding: 3px 0;
}

.health-compact__dot {
  font-size: 12px;
  font-family: var(--font-mono);
  width: 14px;
  text-align: center;
  flex-shrink: 0;
}

.health-compact__dot--good    { color: var(--color-success); }
.health-compact__dot--missing { color: var(--color-danger); }
.health-compact__dot--planned { color: var(--color-warning); }

.health-compact__text { color: var(--color-text-secondary); }

/* Detail panel (right) */
.dashboard__detail {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 22px 24px;
  overflow-y: auto;
}

/* Overview: side-by-side tasks + activity */
.overview-panels {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
  align-items: start;
}

.overview-activity {
  padding-top: 2px;
}

@media (max-width: 900px) {
  .overview-panels { grid-template-columns: 1fr; }
}

/* Panel transition */
.panel-enter-active { transition: opacity 140ms var(--ease), transform 140ms var(--ease); }
.panel-leave-active { transition: opacity 100ms var(--ease); }
.panel-enter-from   { opacity: 0; transform: translateX(6px); }
.panel-leave-to     { opacity: 0; }

/* Responsive — md: 2×2 widget grid, stacked workspace */
@media (max-width: 1279px) {
  .dashboard__stats      { grid-template-columns: repeat(2, 1fr); }
  .dashboard__life-stats { grid-template-columns: repeat(2, 1fr); }
}

/* Responsive — sm: single column everything */
@media (max-width: 767px) {
  .dashboard__stats      { grid-template-columns: 1fr; }
  .dashboard__life-stats { grid-template-columns: repeat(2, 1fr); }
  .dashboard__workspace  { grid-template-columns: 1fr; }
  .dashboard__header     { flex-direction: column; gap: 4px; }
  .dashboard__version    { display: none; }
}
</style>
