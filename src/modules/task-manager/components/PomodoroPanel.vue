<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { useTasksStore } from '../stores/tasks.store'
import { UiIcon } from '@/ui'

type TimerMode = 'work' | 'break'
type TimerState = 'idle' | 'running' | 'paused'

// ── Config presets ─────────────────────────────────────────────────────
const PRESETS = [
  { work: 25, brk: 5,  label: '25/5' },
  { work: 50, brk: 10, label: '50/10' },
  { work: 15, brk: 3,  label: '15/3' },
]

const tasksStore = useTasksStore()

// ── State ──────────────────────────────────────────────────────────────
const presetIdx   = ref(0)
const mode        = ref<TimerMode>('work')
const state       = ref<TimerState>('idle')
const secondsLeft = ref(PRESETS[0].work * 60)
const focusTaskId = ref<string | null>(null)
const sessions    = ref(0)  // completed work sessions this run

let intervalId = 0

// ── Computed ───────────────────────────────────────────────────────────
const preset = computed(() => PRESETS[presetIdx.value])

const totalSeconds = computed(() =>
  mode.value === 'work' ? preset.value.work * 60 : preset.value.brk * 60
)

const progress = computed(() =>
  1 - secondsLeft.value / totalSeconds.value
)

const mm = computed(() => String(Math.floor(secondsLeft.value / 60)).padStart(2, '0'))
const ss = computed(() => String(secondsLeft.value % 60).padStart(2, '0'))

const focusTask = computed(() =>
  focusTaskId.value ? tasksStore.tasks.find(t => t.id === focusTaskId.value) : null
)

const activeTasks = computed(() => tasksStore.tasks.filter(t => !t.done))

// SVG circle
const RADIUS = 44
const CIRC   = 2 * Math.PI * RADIUS
const dashOffset = computed(() => CIRC * (1 - progress.value))

// ── Actions ────────────────────────────────────────────────────────────
function start(): void {
  if (state.value === 'idle') {
    secondsLeft.value = totalSeconds.value
  }
  state.value = 'running'
  intervalId = setInterval(tick, 1000) as unknown as number
}

function pause(): void {
  state.value = 'paused'
  clearInterval(intervalId)
}

function reset(): void {
  clearInterval(intervalId)
  state.value    = 'idle'
  secondsLeft.value = totalSeconds.value
}

function tick(): void {
  if (secondsLeft.value <= 1) {
    secondsLeft.value = 0
    clearInterval(intervalId)
    onTimerEnd()
    return
  }
  secondsLeft.value--
}

function onTimerEnd(): void {
  // Browser notification
  if (Notification.permission === 'granted') {
    new Notification(
      mode.value === 'work' ? '⏰ Focus session done! Take a break.' : '⏰ Break over! Time to focus.',
      { body: focusTask.value ? `Task: ${focusTask.value.text}` : 'Well done!' }
    )
  }

  if (mode.value === 'work') {
    sessions.value++
    // Mark focus task as done after a work session (optional confirm)
    // We don't auto-complete — user decides
  }

  // Switch mode
  mode.value = mode.value === 'work' ? 'break' : 'work'
  state.value = 'idle'
  secondsLeft.value = totalSeconds.value
}

function requestNotificationPermission(): void {
  if (Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function switchPreset(idx: number): void {
  if (state.value !== 'idle') reset()
  presetIdx.value = idx
  secondsLeft.value = (mode.value === 'work' ? PRESETS[idx].work : PRESETS[idx].brk) * 60
}

function switchMode(m: TimerMode): void {
  if (state.value !== 'idle') reset()
  mode.value = m
  secondsLeft.value = totalSeconds.value
}

watch(mode, () => {
  if (state.value === 'idle') {
    secondsLeft.value = totalSeconds.value
  }
})

onUnmounted(() => clearInterval(intervalId))
</script>

<template>
  <div class="pomo">
    <div class="pomo__header">
      <span class="pomo__label">Focus Timer</span>
      <!-- Preset chips -->
      <div class="pomo__presets">
        <button
          v-for="(p, i) in PRESETS"
          :key="p.label"
          class="pomo__preset"
          :class="{ 'pomo__preset--active': presetIdx === i }"
          @click="switchPreset(i)"
        >{{ p.label }}</button>
      </div>
    </div>

    <div class="pomo__body">
      <!-- SVG ring timer -->
      <div class="pomo__ring-wrap">
        <svg class="pomo__ring" viewBox="0 0 100 100">
          <!-- Track -->
          <circle
            cx="50" cy="50"
            :r="RADIUS"
            fill="none"
            stroke="var(--color-surface-elevated)"
            stroke-width="7"
          />
          <!-- Progress arc -->
          <circle
            cx="50" cy="50"
            :r="RADIUS"
            fill="none"
            :stroke="mode === 'work' ? 'var(--color-accent)' : '#10b981'"
            stroke-width="7"
            stroke-linecap="round"
            :stroke-dasharray="CIRC"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 50 50)"
            style="transition: stroke-dashoffset 0.8s ease;"
          />
        </svg>
        <!-- Time display -->
        <div class="pomo__time">
          <span class="pomo__time-digits">{{ mm }}:{{ ss }}</span>
          <span class="pomo__time-mode">{{ mode === 'work' ? 'Focus' : 'Break' }}</span>
          <span v-if="sessions > 0" class="pomo__sessions">🍅 {{ sessions }}</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="pomo__controls">
        <!-- Mode toggle -->
        <div class="pomo__modes">
          <button
            class="pomo__mode-btn"
            :class="{ 'pomo__mode-btn--active': mode === 'work' }"
            @click="switchMode('work')"
          >Work</button>
          <button
            class="pomo__mode-btn"
            :class="{ 'pomo__mode-btn--active': mode === 'break' }"
            @click="switchMode('break')"
          >Break</button>
        </div>

        <!-- Start / Pause / Reset -->
        <div class="pomo__btns">
          <button
            v-if="state !== 'running'"
            class="pomo__btn pomo__btn--start"
            @click="start(); requestNotificationPermission()"
          >
            <UiIcon name="Play" :size="14" />
            {{ state === 'paused' ? 'Resume' : 'Start' }}
          </button>
          <button
            v-else
            class="pomo__btn pomo__btn--pause"
            @click="pause"
          >
            <UiIcon name="Pause" :size="14" />
            Pause
          </button>
          <button
            v-if="state !== 'idle'"
            class="pomo__btn pomo__btn--reset"
            @click="reset"
          >
            <UiIcon name="RotateCcw" :size="13" />
          </button>
        </div>

        <!-- Task selector -->
        <div class="pomo__task-row">
          <span class="pomo__task-label">Focus on:</span>
          <select
            v-model="focusTaskId"
            class="pomo__task-select"
          >
            <option :value="null">— none —</option>
            <option
              v-for="t in activeTasks"
              :key="t.id"
              :value="t.id"
            >{{ t.text.length > 40 ? t.text.slice(0, 40) + '…' : t.text }}</option>
          </select>
        </div>

        <!-- Active task display -->
        <div v-if="focusTask" class="pomo__focus-task">
          <UiIcon name="Target" :size="12" />
          <span>{{ focusTask.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pomo {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Header */
.pomo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.pomo__label {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
}

.pomo__presets {
  display: flex;
  gap: 4px;
}

.pomo__preset {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--t-fast);
}
.pomo__preset:hover { background: var(--color-surface-elevated); color: var(--color-text-secondary); }
.pomo__preset--active {
  background: var(--color-accent-muted);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* Body */
.pomo__body {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

/* Ring */
.pomo__ring-wrap {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.pomo__ring {
  width: 100%;
  height: 100%;
}

.pomo__time {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
}

.pomo__time-digits {
  font-size: 20px;
  font-weight: 800;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
  line-height: 1;
}

.pomo__time-mode {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
}

.pomo__sessions {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 1px;
}

/* Controls */
.pomo__controls {
  flex: 1;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pomo__modes {
  display: flex;
  gap: 4px;
}

.pomo__mode-btn {
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--t-fast);
}
.pomo__mode-btn:hover { background: var(--color-surface-elevated); }
.pomo__mode-btn--active {
  background: var(--color-accent-muted);
  border-color: var(--color-accent);
  color: var(--color-accent);
  font-weight: 600;
}

.pomo__btns {
  display: flex;
  gap: 6px;
  align-items: center;
}

.pomo__btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--t-fast), background var(--t-fast);
}

.pomo__btn--start {
  background: var(--color-accent);
  color: #fff;
}
.pomo__btn--start:hover { opacity: 0.88; }

.pomo__btn--pause {
  background: var(--color-warning);
  color: #fff;
}
.pomo__btn--pause:hover { opacity: 0.88; }

.pomo__btn--reset {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 6px 9px;
}
.pomo__btn--reset:hover { color: var(--color-text); }

/* Task selector */
.pomo__task-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pomo__task-label {
  font-size: 12px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.pomo__task-select {
  flex: 1;
  font-size: 12px;
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: 3px 6px;
  outline: none;
  cursor: pointer;
  min-width: 0;
  transition: border-color var(--t-fast);
}
.pomo__task-select:focus { border-color: var(--color-accent); }

/* Active task chip */
.pomo__focus-task {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--color-accent);
  background: var(--color-accent-muted);
  border-radius: var(--radius-xs);
  padding: 3px 8px;
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
}
.pomo__focus-task span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
</style>
