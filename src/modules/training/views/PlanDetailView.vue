<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrainingStore } from '../stores/training.store'
import WorkoutLogForm from '../components/WorkoutLogForm.vue'
import type { WorkoutLog } from '../types'
import { FEELING_EMOJI, todayStr } from '../types'

const route = useRoute()
const router = useRouter()
const store = useTrainingStore()

const planId = computed(() => route.params.id as string)
const plan = computed(() => store.getPlanById(planId.value))

if (!plan.value) router.replace('/training')

const streak = computed(() => store.getStreak(planId.value))
const totalMinutes = computed(() => store.getTotalMinutes(planId.value))
const totalKm = computed(() => store.getTotalKm(planId.value))
const totalHours = computed(() => Math.round((totalMinutes.value / 60) * 10) / 10)
const sessionLogs = computed(() => store.getPlanLogs(planId.value))
const loggedToday = computed(() => store.isLoggedToday(planId.value))
const today = todayStr()

const showLog = ref(false)

function submitLog(data: Omit<WorkoutLog, 'id' | 'createdAt'>) {
  store.logWorkout(data)
  showLog.value = false
}

const confirmingDelete = ref(false)
let deleteTimer: ReturnType<typeof setTimeout> | null = null

function askDelete() {
  confirmingDelete.value = true
  deleteTimer = setTimeout(() => { confirmingDelete.value = false }, 4000)
}

function confirmDelete() {
  if (deleteTimer) clearTimeout(deleteTimer)
  store.deletePlan(planId.value)
  router.replace('/training')
}

function cancelDelete() {
  if (deleteTimer) clearTimeout(deleteTimer)
  confirmingDelete.value = false
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}
</script>

<template>
  <div v-if="plan" class="tdetail">

    <div class="tdetail__nav">
      <button class="tdetail__back" @click="router.push('/training')">← Training</button>
    </div>

    <div class="tdetail__header">
      <span class="tdetail__emoji">{{ plan.coverEmoji }}</span>
      <div class="tdetail__heading">
        <h1 class="tdetail__title">{{ plan.title }}</h1>
        <p class="tdetail__meta">{{ plan.sessionsPerWeek }}× / week</p>
      </div>
    </div>

    <div class="tdetail__stats">
      <div class="tdetail__stat">
        <span class="tdetail__stat-value">🔥 {{ streak }}</span>
        <span class="tdetail__stat-label">day streak</span>
      </div>
      <div class="tdetail__stat">
        <span class="tdetail__stat-value">{{ totalHours }}h</span>
        <span class="tdetail__stat-label">total time</span>
      </div>
      <div v-if="totalKm > 0" class="tdetail__stat">
        <span class="tdetail__stat-value">{{ totalKm }} km</span>
        <span class="tdetail__stat-label">total distance</span>
      </div>
      <div class="tdetail__stat">
        <span class="tdetail__stat-value">{{ sessionLogs.length }}</span>
        <span class="tdetail__stat-label">sessions</span>
      </div>
    </div>

    <div class="tdetail__today">
      <div class="tdetail__today-info">
        <span class="tdetail__today-label">Today</span>
        <span
          class="tdetail__today-status"
          :class="{ 'tdetail__today-status--done': loggedToday }"
        >{{ loggedToday ? '✓ Workout logged' : 'Ready to train' }}</span>
      </div>
      <button
        v-if="!loggedToday"
        class="tdetail__log-btn"
        @click="showLog = true"
      >Log Workout</button>
    </div>

    <div class="tdetail__history">
      <p class="tdetail__section-label">Workout history</p>

      <div v-if="sessionLogs.length > 0" class="tdetail__log-list">
        <div
          v-for="log in sessionLogs"
          :key="log.id"
          class="tdetail__log"
          :class="{ 'tdetail__log--today': log.date === today }"
        >
          <div class="tdetail__log-left">
            <span class="tdetail__log-date">{{ formatDate(log.date) }}</span>
            <span v-if="log.notes" class="tdetail__log-notes">{{ log.notes }}</span>
          </div>
          <div class="tdetail__log-right">
            <span class="tdetail__log-feel">{{ FEELING_EMOJI[log.feeling] }}</span>
            <div class="tdetail__log-nums">
              <span v-if="log.actualDuration" class="tdetail__log-num">{{ log.actualDuration }}min</span>
              <span v-if="log.actualDistance" class="tdetail__log-num">{{ log.actualDistance }}km</span>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="tdetail__empty">No workouts logged yet.</p>
    </div>

    <div class="tdetail__danger">
      <template v-if="confirmingDelete">
        <span class="tdetail__danger-confirm">Delete this plan and all workout history?</span>
        <button class="tdetail__danger-yes" @click="confirmDelete">Delete</button>
        <button class="tdetail__danger-no" @click="cancelDelete">Cancel</button>
      </template>
      <button v-else class="tdetail__danger-btn" @click="askDelete">Delete plan</button>
    </div>

    <WorkoutLogForm
      v-if="showLog"
      :plan="plan"
      @submit="submitLog"
      @cancel="showLog = false"
    />

  </div>
</template>

<style scoped>
.tdetail {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tdetail__back {
  background: none;
  border: none;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  transition: color var(--t-fast);
  font-family: inherit;
}

.tdetail__back:hover { color: var(--color-text-secondary); }

.tdetail__header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tdetail__emoji { font-size: 40px; line-height: 1; flex-shrink: 0; }

.tdetail__title {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.tdetail__meta {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 4px 0 0;
}

.tdetail__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.tdetail__stat {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tdetail__stat-value { font-size: var(--text-lg); font-weight: 700; color: var(--color-text); }
.tdetail__stat-label { font-size: var(--text-xs); color: var(--color-text-muted); }

.tdetail__today {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.tdetail__today-info { display: flex; flex-direction: column; gap: 3px; }
.tdetail__today-label { font-size: var(--text-xs); font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.tdetail__today-status { font-size: var(--text-sm); color: var(--color-text-secondary); }
.tdetail__today-status--done { color: var(--color-success); }

.tdetail__log-btn {
  padding: 8px 20px;
  border-radius: var(--radius);
  background: var(--color-accent);
  color: #fff;
  border: none;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--t-fast);
  font-family: inherit;
  flex-shrink: 0;
}

.tdetail__log-btn:hover { background: var(--color-accent-hover); }

.tdetail__section-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 12px;
}

.tdetail__log-list { display: flex; flex-direction: column; gap: 8px; }

.tdetail__log {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.tdetail__log--today { border-color: var(--color-accent-muted); }

.tdetail__log-left { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.tdetail__log-date { font-size: var(--text-sm); font-weight: 500; color: var(--color-text); }
.tdetail__log-notes { font-size: var(--text-xs); color: var(--color-text-muted); font-style: italic; }

.tdetail__log-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.tdetail__log-feel { font-size: 20px; }
.tdetail__log-nums { display: flex; gap: 8px; }
.tdetail__log-num { font-size: var(--text-xs); font-weight: 600; color: var(--color-text-secondary); }

.tdetail__empty { font-size: var(--text-sm); color: var(--color-text-muted); margin: 0; }

.tdetail__danger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.tdetail__danger-btn { background: none; border: none; font-size: var(--text-sm); color: var(--color-text-muted); cursor: pointer; padding: 0; transition: color var(--t-fast); font-family: inherit; }
.tdetail__danger-btn:hover { color: var(--color-danger); }
.tdetail__danger-confirm { font-size: var(--text-sm); color: var(--color-text-secondary); }
.tdetail__danger-yes { padding: 5px 14px; border-radius: var(--radius); border: 1px solid var(--color-danger); background: transparent; color: var(--color-danger); font-size: var(--text-sm); cursor: pointer; transition: all var(--t-fast); font-family: inherit; }
.tdetail__danger-yes:hover { background: var(--color-danger); color: #fff; }
.tdetail__danger-no { background: none; border: none; font-size: var(--text-sm); color: var(--color-text-muted); cursor: pointer; font-family: inherit; transition: color var(--t-fast); }
.tdetail__danger-no:hover { color: var(--color-text); }

@media (max-width: 767px) {
  .tdetail__title { font-size: var(--text-2xl, 22px); }
  .tdetail__today { flex-direction: column; align-items: flex-start; }
  .tdetail__log-btn { align-self: stretch; text-align: center; }
}
</style>
