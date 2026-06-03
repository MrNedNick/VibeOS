<script setup lang="ts">
import { computed, ref, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { PLATFORM_MODULES } from '@/core/registry/modules'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useLearningStore } from '@/modules/learning/stores/learning.store'
import { useTrainingStore } from '@/modules/training/stores/training.store'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { computeStreak } from '@/modules/habits/types'
import { MODULE_DETAILS, PLATFORM_STATUS } from '../data/platform-notes'
import ModuleDetailPanel from '../components/ModuleDetailPanel.vue'
import AllTasksPanel, { type AggregatedTask, type AggregatedShipped } from '../components/AllTasksPanel.vue'
import RecentActivityPanel from '../components/RecentActivityPanel.vue'
import DashboardTodayPanel from '../components/DashboardTodayPanel.vue'
import GoalsPanel from '../components/GoalsPanel.vue'
import HabitsPanel from '../components/HabitsPanel.vue'
import AchievementsPanel from '../components/AchievementsPanel.vue'
import GitHubWidget from '../components/GitHubWidget.vue'
import WeatherWidget from '../components/WeatherWidget.vue'
import FinanceWidget from '../components/FinanceWidget.vue'
import DigestWidget from '../components/DigestWidget.vue'
import DashboardWidgetCustomizer from '../components/DashboardWidgetCustomizer.vue'
import { useWidgetsStore, type WidgetId } from '../stores/widgets.store'
import { useLocale } from '@/core/i18n'
import { UiIcon, UiButton } from '@/ui'

// ── Widget component map (markRaw prevents Vue from making them reactive) ──
const WIDGET_COMPONENTS: Record<WidgetId, object> = {
  github:  markRaw(GitHubWidget),
  weather: markRaw(WeatherWidget),
  finance: markRaw(FinanceWidget),
  digest:  markRaw(DigestWidget),  // not used in row but kept for completeness
}

const widgetsStore = useWidgetsStore()
const showCustomizer = ref(false)

const TODAY_ID        = '__today__'
const OVERVIEW_ID     = '__overview__'
const GOALS_ID        = '__goals__'
const HABITS_ID       = '__habits__'
const ACHIEVEMENTS_ID = '__achievements__'

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

const bestHabitStreak = computed(() => {
  if (!habitsStore.habits.length) return 0
  return Math.max(...habitsStore.habits.map(h => computeStreak(h.completedDates)))
})

// ── Habit of the day spotlight ──────────────────────────────────
const todayStr = computed(() => new Date().toISOString().split('T')[0])
const spotlightHabit = computed(() => {
  const unchecked = habitsStore.habits.filter(h => !h.completedDates.includes(todayStr.value))
  if (!unchecked.length) return null
  // Deterministic random per day (not truly random — avoids flicker)
  const seed = new Date().getDate()
  return unchecked[seed % unchecked.length]
})

const today = computed(() =>
  new Date().toLocaleDateString(i18n.localeCode, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
)

// ── Module selection ────────────────────────────────────────────
const selectedId = ref(TODAY_ID)

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


const STATUS_ICON_NAMES: Record<string, string> = { good: 'Check', missing: 'X', planned: 'Clock3' }
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
      <div class="dashboard__header-right">
        <!-- Customize widgets button -->
        <UiButton
          variant="ghost"
          size="sm"
          :class="{ 'dashboard__customize-btn--active': showCustomizer }"
          title="Customize widgets"
          @click="showCustomizer = !showCustomizer"
        >
          <UiIcon name="LayoutDashboard" :size="14" :stroke-width="1.75" />
          <span class="dashboard__customize-label">Widgets</span>
        </UiButton>
        <span class="dashboard__version">v{{ APP_VERSION }} · VibeOS</span>
      </div>
    </div>

    <!-- Life module stats ───────────────────────────────────────── -->
    <div class="dashboard__life-stats">
      <div class="life-stat" @click="router.push('/habits')">
        <span class="life-stat__icon"><UiIcon name="Flame" :size="20" :stroke-width="1.6" /></span>
        <div class="life-stat__info">
          <span class="life-stat__value">{{ todayHabits.done }}/{{ todayHabits.total }}</span>
          <span class="life-stat__label">{{ i18n.t('dashboard.habitsToday') }}</span>
        </div>
        <span v-if="bestHabitStreak > 0" class="life-stat__streak">🔥 {{ bestHabitStreak }}</span>
        <div
          class="life-stat__bar"
          :style="{ '--pct': todayHabits.total > 0 ? `${Math.round(todayHabits.done/todayHabits.total*100)}%` : '0%' }"
        />
      </div>
      <div class="life-stat" @click="router.push('/goals')">
        <span class="life-stat__icon"><UiIcon name="Target" :size="20" :stroke-width="1.6" /></span>
        <div class="life-stat__info">
          <span class="life-stat__value">{{ goalsStore.activeGoals.length }}</span>
          <span class="life-stat__label">{{ i18n.t('dashboard.activeGoals') }}</span>
        </div>
      </div>
      <div class="life-stat" @click="router.push('/learning')">
        <span class="life-stat__icon"><UiIcon name="BookOpen" :size="20" :stroke-width="1.6" /></span>
        <div class="life-stat__info">
          <span class="life-stat__value">{{ learningStore.todayItems.length }}</span>
          <span class="life-stat__label">{{ i18n.t('dashboard.learningToday') }}</span>
        </div>
        <span v-if="learningStore.todayItems.some(i => i.logged)" class="life-stat__done">{{ learningStore.todayItems.filter(i => i.logged).length }} {{ i18n.t('dashboard.doneSuffix') }}</span>
      </div>
      <div class="life-stat" @click="router.push('/training')">
        <span class="life-stat__icon"><UiIcon name="Dumbbell" :size="20" :stroke-width="1.6" /></span>
        <div class="life-stat__info">
          <span class="life-stat__value">{{ trainingStore.todayItems.length }}</span>
          <span class="life-stat__label">{{ i18n.t('dashboard.trainingToday') }}</span>
        </div>
        <span v-if="trainingStore.todayItems.some(i => i.logged)" class="life-stat__done">{{ trainingStore.todayItems.filter(i => i.logged).length }} {{ i18n.t('dashboard.doneSuffix') }}</span>
      </div>
    </div>

    <!-- Habit of the day spotlight ──────────────────────────────── -->
    <Transition name="panel">
      <div
        v-if="spotlightHabit"
        class="habit-spotlight"
        @click="habitsStore.toggleToday(spotlightHabit!.id)"
      >
        <span class="habit-spotlight__emoji">{{ spotlightHabit.emoji }}</span>
        <div class="habit-spotlight__info">
          <span class="habit-spotlight__eyebrow">Habit of the day</span>
          <span class="habit-spotlight__name">{{ spotlightHabit.name }}</span>
          <span v-if="spotlightHabit.purpose" class="habit-spotlight__purpose">{{ spotlightHabit.purpose }}</span>
        </div>
        <span class="habit-spotlight__cta">Check off →</span>
      </div>
    </Transition>

    <!-- Widgets section ──────────────────────────────────────────────── -->
    <div class="dashboard__widgets-section">

      <!-- Customizer panel (collapsible) -->
      <Transition name="customizer">
        <DashboardWidgetCustomizer
          v-if="showCustomizer"
          class="dashboard__customizer"
          @close="showCustomizer = false"
        />
      </Transition>

      <!-- Dynamic widgets row (row widgets: github/weather/finance) -->
      <div
        v-if="widgetsStore.visibleRowWidgets.length > 0"
        class="dashboard__widgets"
        :class="`dashboard__widgets--count-${widgetsStore.visibleRowWidgets.length}`"
      >
        <component
          :is="WIDGET_COMPONENTS[w.id]"
          v-for="w in widgetsStore.visibleRowWidgets"
          :key="w.id"
          class="dashboard__widget"
        />
      </div>

      <!-- AI Digest (full-width, separate row) -->
      <DigestWidget v-if="widgetsStore.digestVisible" />
    </div>

    <!-- Workspace: module list + detail panel ───────────────────── -->
    <div class="dashboard__workspace">

      <!-- Left: module list ────────────────────────────────────── -->
      <div class="dashboard__module-list">

        <!-- Today (default view — always first) -->
        <div
          class="mod-row mod-row--today"
          :class="{ 'mod-row--active': selectedId === TODAY_ID }"
          @click="selectedId = TODAY_ID"
        >
          <span class="mod-row__icon"><UiIcon name="Sun" :size="15" :stroke-width="1.75" /></span>
          <span class="mod-row__name">{{ i18n.t('dashboardToday.navLabel') }}</span>
        </div>

        <!-- All Tasks (overview row) -->
        <div
          class="mod-row mod-row--overview"
          :class="{ 'mod-row--active': selectedId === OVERVIEW_ID }"
          @click="selectedId = OVERVIEW_ID"
        >
          <span class="mod-row__icon"><UiIcon name="List" :size="15" :stroke-width="1.75" /></span>
          <span class="mod-row__name">{{ i18n.t('dashboard.allTasks') }}</span>
          <span class="mod-row__count">{{ aggregatedTasks.length }}</span>
        </div>

        <!-- Goals live panel -->
        <div
          class="mod-row mod-row--life"
          :class="{ 'mod-row--active': selectedId === GOALS_ID }"
          @click="selectedId = GOALS_ID"
        >
          <span class="mod-row__icon"><UiIcon name="Target" :size="15" :stroke-width="1.75" /></span>
          <span class="mod-row__name">Goals</span>
          <span v-if="goalsStore.activeGoals.length > 0" class="mod-row__count">{{ goalsStore.activeGoals.length }}</span>
        </div>

        <!-- Habits live panel -->
        <div
          class="mod-row mod-row--life"
          :class="{ 'mod-row--active': selectedId === HABITS_ID }"
          @click="selectedId = HABITS_ID"
        >
          <span class="mod-row__icon"><UiIcon name="Flame" :size="15" :stroke-width="1.75" /></span>
          <span class="mod-row__name">Habits</span>
          <span class="mod-row__count">{{ todayHabits.done }}/{{ todayHabits.total }}</span>
        </div>

        <!-- Achievements panel -->
        <div
          class="mod-row mod-row--life"
          :class="{ 'mod-row--active': selectedId === ACHIEVEMENTS_ID }"
          @click="selectedId = ACHIEVEMENTS_ID"
        >
          <span class="mod-row__icon"><UiIcon name="Trophy" :size="15" :stroke-width="1.75" /></span>
          <span class="mod-row__name">Achievements</span>
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
          <UiButton
            v-if="mod.status === 'available'"
            variant="ghost"
            size="sm"
            title="Open app"
            @click.stop="router.push(mod.path)"
          >→</UiButton>
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
            ><UiIcon :name="STATUS_ICON_NAMES[item.status] ?? 'Activity'" :size="12" :stroke-width="2.2" /></span>
            <span class="health-compact__text">{{ i18n.t(item.labelKey) }}</span>
          </div>
        </div>
      </div>

      <!-- Right: detail panel ─────────────────────────────────── -->
      <div class="dashboard__detail">
        <Transition name="panel" mode="out-in">

          <!-- Today panel -->
          <DashboardTodayPanel v-if="selectedId === TODAY_ID" key="__today__" />

          <!-- Achievements panel -->
          <AchievementsPanel v-else-if="selectedId === ACHIEVEMENTS_ID" key="__achievements__" />

          <!-- Goals live panel -->
          <GoalsPanel v-else-if="selectedId === GOALS_ID" key="__goals__" />

          <!-- Habits live panel -->
          <HabitsPanel v-else-if="selectedId === HABITS_ID" key="__habits__" />

          <!-- Overview: all tasks aggregated + activity -->
          <div v-else-if="selectedId === OVERVIEW_ID" key="__overview__" class="overview-panels">
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
  gap: 20px;
  height: 100%;
}

/* Header */
.dashboard__header {
  display: flex;
  align-items: center;
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

.dashboard__header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.dashboard__version {
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

/* Customize button */
.dashboard__customize-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 11px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: color var(--t-fast), border-color var(--t-fast), background var(--t-fast);
}
.dashboard__customize-btn:hover {
  color: var(--color-text);
  border-color: var(--color-accent);
}
.dashboard__customize-btn--active {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: var(--color-accent-muted);
}

.dashboard__customize-label {
  /* Hide label on small screens */
}

/* Life stats strip */
.dashboard__life-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.life-stat {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 15px 18px;
  display: flex;
  align-items: center;
  gap: 13px;
  cursor: pointer;
  transition: border-color var(--t-fast), box-shadow var(--t-fast), background var(--t-fast);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-1);
}
.life-stat:hover {
  border-color: color-mix(in srgb, var(--color-accent) 50%, var(--color-border));
  box-shadow: var(--shadow-2);
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-surface));
}

.life-stat__icon {
  font-size: 20px;
  flex-shrink: 0;
  color: var(--color-accent);
  display: flex;
  align-items: center;
}

.life-stat__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.life-stat__value {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text);
  line-height: var(--leading-xl);
  font-variant-numeric: tabular-nums;
}

.life-stat__label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--leading-xs);
}

.life-stat__done {
  font-size: 11px;
  color: var(--color-success);
  font-weight: 500;
  flex-shrink: 0;
}

.life-stat__streak {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-warning);
  flex-shrink: 0;
  white-space: nowrap;
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

/* Habit of the day spotlight */
.habit-spotlight {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-accent) 20%, var(--color-border));
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}
.habit-spotlight:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-1);
}
.habit-spotlight__emoji {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}
.habit-spotlight__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.habit-spotlight__eyebrow {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent);
}
.habit-spotlight__name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.habit-spotlight__purpose {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.habit-spotlight__cta {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-accent);
  white-space: nowrap;
  flex-shrink: 0;
  opacity: 0.8;
  transition: opacity var(--t-fast);
}
.habit-spotlight:hover .habit-spotlight__cta { opacity: 1; }

/* Widgets section wrapper */
.dashboard__widgets-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Customizer panel transition */
.customizer-enter-active { transition: opacity 160ms var(--ease), transform 160ms var(--ease); }
.customizer-leave-active { transition: opacity 120ms var(--ease), transform 120ms var(--ease); }
.customizer-enter-from   { opacity: 0; transform: translateY(-6px); }
.customizer-leave-to     { opacity: 0; transform: translateY(-4px); }

/* Dynamic widgets row — equal columns, adapts to visible widget count */
.dashboard__widgets {
  display: grid;
  gap: 16px;
  align-items: stretch;
}

/* Equal columns based on widget count */
.dashboard__widgets--count-1 { grid-template-columns: 1fr; }
.dashboard__widgets--count-2 { grid-template-columns: repeat(2, 1fr); }
.dashboard__widgets--count-3 { grid-template-columns: repeat(3, 1fr); }

/* All widget cards share the same min-height — no layout shift */
.dashboard__widget {
  min-height: 148px;
}

/* On smaller screens, collapse to fewer columns */
@media (max-width: 900px) {
  .dashboard__widgets--count-2,
  .dashboard__widgets--count-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .dashboard__widgets--count-1,
  .dashboard__widgets--count-2,
  .dashboard__widgets--count-3 { grid-template-columns: 1fr; }
  .dashboard__customize-label  { display: none; }
}

/* Workspace */
.dashboard__workspace {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
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
  background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface-elevated));
  color: var(--color-text);
}

.mod-row--active {
  background: var(--color-accent-muted);
  color: var(--color-accent);
}

.mod-row--disabled { cursor: default; opacity: 0.5; }

.mod-row--today {
  font-weight: 700;
}

.mod-row--overview {
  font-weight: 600;
}

.mod-row--life {
  font-weight: 500;
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
  width: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.health-compact__dot--good    { color: var(--color-success); }
.health-compact__dot--missing { color: var(--color-danger); }
.health-compact__dot--planned { color: var(--color-warning); }

.health-compact__text { color: var(--color-text-secondary); }

/* Detail panel (right) */
.dashboard__detail {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px 28px;
  overflow-y: auto;
  box-shadow: var(--shadow-1);
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

/* Responsive — md: 2×2 life stats grid */
@media (max-width: 1279px) {
  .dashboard__life-stats { grid-template-columns: repeat(2, 1fr); }
}

/* Responsive — sm (iPhone 17 Pro: 393px) */
@media (max-width: 767px) {
  .dashboard {
    gap: 14px;
    height: auto; /* allow natural flow on mobile */
  }

  .dashboard__header        { flex-direction: row; align-items: center; gap: 8px; }
  .dashboard__header > div  { flex: 1; min-width: 0; }
  .dashboard__title         { font-size: 22px; }
  .dashboard__date          { font-size: 13px; }
  .dashboard__version       { display: none; }
  .dashboard__header-right  { gap: 6px; }
  .dashboard__customize-btn { padding: 5px 8px; }
  .dashboard__customize-label { display: none; }

  /* 2×2 life stats */
  .dashboard__life-stats { grid-template-columns: repeat(2, 1fr); gap: 8px; }

  /* Module list is a desktop sidebar — hide on mobile */
  /* Users navigate via bottom tab bar */
  .dashboard__workspace  {
    grid-template-columns: 1fr;
  }
  .dashboard__module-list { display: none; }

  /* Detail panel: full-width, no extra padding */
  .dashboard__detail {
    padding: 16px;
    border-radius: var(--radius-lg);
  }

  /* Overview panels: stack vertically */
  .overview-panels {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  /* Life stat cards: smaller text */
  .life-stat            { padding: 12px 12px; }
  .life-stat__value     { font-size: 16px; }
  .life-stat__label     { font-size: 11px; }
}
</style>
