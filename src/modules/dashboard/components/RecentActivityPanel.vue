<script setup lang="ts">
import { computed } from 'vue'
import { useEventBus } from '@/core/events'
import type { PlatformEvent } from '@/core/events'
import { useLocale } from '@/core/i18n'
import { UiIcon } from '@/ui'

const bus  = useEventBus()
const i18n = useLocale()

interface EventGroup {
  label: string
  events: PlatformEvent[]
}

const groupedEvents = computed((): EventGroup[] => {
  const all = bus.recent(20)
  if (!all.length) return []

  const now       = new Date()
  const todayStr  = now.toISOString().split('T')[0]
  const yd        = new Date(now); yd.setDate(yd.getDate() - 1)
  const yestStr   = yd.toISOString().split('T')[0]

  const map = new Map<string, PlatformEvent[]>()
  for (const e of all) {
    const day = e.timestamp.split('T')[0]
    if (!map.has(day)) map.set(day, [])
    map.get(day)!.push(e)
  }

  return Array.from(map.entries()).map(([day, events]) => {
    let label: string
    if (day === todayStr)  label = i18n.t('recentActivity.today')
    else if (day === yestStr) label = i18n.t('recentActivity.yesterday')
    else {
      const diffD = Math.floor((now.getTime() - new Date(day).getTime()) / 86_400_000)
      label = `${diffD} ${i18n.t('recentActivity.daysAgo')}`
    }
    return { label, events }
  })
})

const hasEvents = computed(() => groupedEvents.value.length > 0)

/** Translate a raw Kanban column ID to its display label */
function colLabel(colId: string): string {
  const map: Record<string, string> = {
    'backlog':     i18n.t('kanban.colBacklog'),
    'in-progress': i18n.t('kanban.colInProgress'),
    'done':        i18n.t('kanban.colDone'),
  }
  return map[colId] ?? colId
}

function formatTime(iso: string): string {
  const d       = new Date(iso)
  const diffMs  = Date.now() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffH   = Math.floor(diffMs / 3_600_000)
  if (diffMin < 1)  return i18n.t('recentActivity.justNow')
  if (diffMin < 60) return `${diffMin}m`
  if (diffH   < 24) return `${diffH}h`
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function describeEvent(e: PlatformEvent): { icon: string; text: string } {
  switch (e.type) {
    case 'task:created':    return { icon: 'Plus',           text: `${i18n.t('recentActivity.taskAdded')} — "${e.label}"` }
    case 'task:completed':  return { icon: 'CheckCircle2',   text: `${i18n.t('recentActivity.taskDone')} — "${e.label}"` }
    case 'task:deleted':    return { icon: 'Trash2',         text: `${i18n.t('recentActivity.taskRemoved')} — "${e.label}"` }
    case 'habit:checked':   return { icon: 'Flame',          text: `${i18n.t('recentActivity.habitChecked')} — "${e.habitName}"` }
    case 'habit:unchecked': return { icon: 'Circle',         text: `${i18n.t('recentActivity.habitUnchecked')} — "${e.habitName}"` }
    case 'note:created':    return { icon: 'FileText',       text: `${i18n.t('recentActivity.noteCreated')} — "${e.title}"` }
    case 'note:deleted':    return { icon: 'FileX2',         text: `${i18n.t('recentActivity.noteDeleted')} — "${e.title}"` }
    case 'snippet:created': return { icon: 'Braces',         text: `${i18n.t('recentActivity.snippet')} — "${e.title}" (${e.language})` }
    case 'card:created':    return { icon: 'LayoutGrid',     text: `${i18n.t('recentActivity.cardAdded')} — "${e.title}"` }
    case 'card:moved':      return { icon: 'ArrowRight',     text: `${i18n.t('recentActivity.cardMoved')} — "${e.title}" → ${colLabel(e.toColumnId)}` }
    case 'studio:run':      return { icon: 'Sparkles',       text: `${i18n.t('recentActivity.studioRun')} — ${e.model.split('-')[1]} · ${e.inputTokens + e.outputTokens} tok` }
    case 'game:score':      return { icon: 'Gamepad2',       text: `${i18n.t('recentActivity.gameScore')} — ${e.game} ${e.score}` }
    case 'learning:session:completed': return { icon: 'BookOpenCheck',  text: `${i18n.t('recentActivity.learningSessionLogged')} — "${e.planTitle}" · ${e.minutes}min` }
    case 'learning:plan:created':      return { icon: 'BookOpen',       text: `${i18n.t('recentActivity.learningPlanCreated')} — "${e.title}"` }
    case 'learning:plan:completed':    return { icon: 'GraduationCap',  text: `${i18n.t('recentActivity.learningPlanCompleted')} — "${e.title}"` }
    case 'training:workout:logged':    return { icon: 'Dumbbell',       text: `${i18n.t('recentActivity.workoutLogged')} — "${e.planTitle}"${e.duration ? ` · ${e.duration}min` : ''}` }
    case 'training:plan:created':      return { icon: 'ClipboardList',  text: `${i18n.t('recentActivity.trainingPlanCreated')} — "${e.title}"` }
    case 'goal:created':               return { icon: 'Target',         text: `${i18n.t('recentActivity.goalCreated')} — "${e.title}"` }
    case 'goal:completed':             return { icon: 'Trophy',         text: `${i18n.t('recentActivity.goalCompleted')} — "${e.title}"` }
    case 'goal:milestone:completed':   return { icon: 'CheckCheck',     text: `${i18n.t('recentActivity.milestoneCompleted')} — "${e.milestoneTitle}"` }
    default:                           return { icon: 'Activity',       text: i18n.t('recentActivity.activity') }
  }
}

function iconColor(e: PlatformEvent): string {
  switch (e.type) {
    case 'task:created':    return 'var(--color-accent)'
    case 'task:completed':  return 'var(--color-success)'
    case 'task:deleted':    return 'var(--color-danger)'
    case 'habit:checked':   return 'var(--color-success)'
    case 'habit:unchecked': return 'var(--color-text-muted)'
    case 'note:created':    return 'var(--color-accent)'
    case 'note:deleted':    return 'var(--color-danger)'
    case 'snippet:created': return '#10b981'
    case 'card:created':    return 'var(--color-accent)'
    case 'card:moved':      return '#f59e0b'
    case 'studio:run':      return '#8b5cf6'
    case 'game:score':      return '#6b7280'
    case 'learning:session:completed':
    case 'learning:plan:created':    return '#8b5cf6'
    case 'learning:plan:completed':  return 'var(--color-success)'
    case 'training:workout:logged':
    case 'training:plan:created':   return '#f97316'
    case 'goal:created':            return 'var(--color-accent)'
    case 'goal:completed':          return 'var(--color-success)'
    case 'goal:milestone:completed': return 'var(--color-success)'
    default:                return 'var(--color-text-muted)'
  }
}
</script>

<template>
  <div class="activity">
    <p class="activity__heading">{{ i18n.t('recentActivity.title') }}</p>

    <div v-if="!hasEvents" class="activity__empty">
      <p>{{ i18n.t('recentActivity.empty') }}</p>
      <p class="activity__empty-sub">{{ i18n.t('recentActivity.emptySub') }}</p>
    </div>

    <template v-else>
      <div
        v-for="group in groupedEvents"
        :key="group.label"
        class="activity__group"
      >
        <p class="activity__day-label">{{ group.label }}</p>
        <ul class="activity__list">
          <li
            v-for="(e, i) in group.events"
            :key="i"
            class="activity__item"
          >
            <span class="activity__icon" :style="{ color: iconColor(e) }">
              <UiIcon :name="describeEvent(e).icon" :size="14" :stroke-width="1.75" />
            </span>
            <span class="activity__text">{{ describeEvent(e).text }}</span>
            <span class="activity__time">{{ formatTime(e.timestamp) }}</span>
          </li>
        </ul>
      </div>

      <button class="activity__clear" @click="bus.clear()">
        {{ i18n.t('recentActivity.clear') }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.activity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity__heading {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin: 0 0 8px;
}

.activity__empty {
  font-size: 14px;
  color: var(--color-text-muted);
  padding: 12px 0;
}
.activity__empty p     { margin: 0; }
.activity__empty-sub   { font-size: 12px; margin-top: 4px !important; }

/* Day group */
.activity__group + .activity__group { margin-top: 12px; }

.activity__day-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
  margin: 0 0 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--color-border);
}

.activity__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.activity__item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 5px 0;
  font-size: 13px;
  border-bottom: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
}
.activity__item:last-child { border-bottom: none; }

.activity__icon {
  flex-shrink: 0;
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity__text {
  flex: 1;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.activity__time {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.activity__clear {
  margin-top: 10px;
  align-self: flex-start;
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast), color var(--t-fast);
}
.activity__clear:hover {
  background: var(--color-surface-elevated);
  color: var(--color-danger);
}
</style>
