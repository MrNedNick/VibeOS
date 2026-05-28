<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGoalsStore } from '../stores/goals.store'
import MilestoneList from '../components/MilestoneList.vue'
import { calcProgress, daysUntil, CATEGORY_LABEL } from '../types'
import { UiIcon } from '@/ui'

const route = useRoute()
const router = useRouter()
const store = useGoalsStore()

const goalId = computed(() => route.params.id as string)
const goal = computed(() => store.getGoalById(goalId.value))

if (!goal.value) router.replace('/goals')

const progress = computed(() => goal.value ? calcProgress(goal.value) : 0)

// Notes — local ref, synced to store on change with debounce
const localNotes = ref(goal.value?.notes ?? '')
let notesTimer: ReturnType<typeof setTimeout> | null = null

watch(localNotes, (val) => {
  if (notesTimer) clearTimeout(notesTimer)
  notesTimer = setTimeout(() => {
    store.updateNotes(goalId.value, val)
  }, 600)
})

// Due date display
const dueDisplay = computed(() => {
  if (!goal.value?.targetDate) return null
  const days = daysUntil(goal.value.targetDate)
  if (days < 0) return { text: `${Math.abs(days)} days overdue`, overdue: true }
  if (days === 0) return { text: 'Due today', overdue: true }
  if (days === 1) return { text: 'Due tomorrow', overdue: false }
  return {
    text: `${days} days left · ${new Date(goal.value.targetDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    overdue: false,
  }
})

// Complete goal
const confirmingComplete = ref(false)
let completeTimer: ReturnType<typeof setTimeout> | null = null

function askComplete() {
  confirmingComplete.value = true
  completeTimer = setTimeout(() => { confirmingComplete.value = false }, 4000)
}

function confirmComplete() {
  if (completeTimer) clearTimeout(completeTimer)
  store.completeGoal(goalId.value)
  confirmingComplete.value = false
}

// Delete goal
const confirmingDelete = ref(false)
let deleteTimer: ReturnType<typeof setTimeout> | null = null

function askDelete() {
  confirmingDelete.value = true
  deleteTimer = setTimeout(() => { confirmingDelete.value = false }, 4000)
}

function confirmDelete() {
  if (deleteTimer) clearTimeout(deleteTimer)
  store.deleteGoal(goalId.value)
  router.replace('/goals')
}

function cancelConfirm() {
  if (completeTimer) clearTimeout(completeTimer)
  if (deleteTimer) clearTimeout(deleteTimer)
  confirmingComplete.value = false
  confirmingDelete.value = false
}
</script>

<template>
  <div v-if="goal" class="gdetail">

    <div class="gdetail__nav">
      <button class="gdetail__back" @click="router.push('/goals')">
        <UiIcon name="ArrowLeft" :size="14" :stroke-width="2" />
        Goals
      </button>
    </div>

    <div class="gdetail__header">
      <span class="gdetail__emoji">{{ goal.coverEmoji }}</span>
      <div class="gdetail__heading">
        <h1 class="gdetail__title">{{ goal.title }}</h1>
        <div class="gdetail__badges">
          <span class="gdetail__category">{{ CATEGORY_LABEL[goal.category] }}</span>
          <span
            v-if="dueDisplay"
            class="gdetail__due"
            :class="{ 'gdetail__due--overdue': dueDisplay.overdue }"
          >{{ dueDisplay.text }}</span>
          <span
            v-if="goal.status === 'completed'"
            class="gdetail__status-badge"
          >✓ Completed</span>
        </div>
      </div>
      <span class="gdetail__pct">{{ progress }}%</span>
    </div>

    <!-- Progress bar -->
    <div class="gdetail__progress-bar">
      <div class="gdetail__progress-fill" :style="{ width: progress + '%' }" />
    </div>

    <!-- Milestones -->
    <div class="gdetail__section">
      <p class="gdetail__section-label">Milestones</p>
      <MilestoneList
        :milestones="goal.milestones"
        @toggle="store.toggleMilestone(goalId, $event)"
        @add="store.addMilestone(goalId, $event)"
        @delete="store.deleteMilestone(goalId, $event)"
      />
    </div>

    <!-- Notes -->
    <div class="gdetail__section">
      <p class="gdetail__section-label">Notes</p>
      <textarea
        v-model="localNotes"
        class="gdetail__notes"
        rows="4"
        placeholder="Planning notes, context, ideas…"
      />
    </div>

    <!-- Actions -->
    <div class="gdetail__actions">
      <template v-if="goal.status === 'active'">
        <template v-if="confirmingComplete">
          <span class="gdetail__confirm-text">Mark this goal as completed?</span>
          <button class="gdetail__btn gdetail__btn--success" @click="confirmComplete">Complete</button>
          <button class="gdetail__btn gdetail__btn--ghost" @click="cancelConfirm">Cancel</button>
        </template>
        <button v-else class="gdetail__btn gdetail__btn--outline" @click="askComplete">
          Mark complete
        </button>
      </template>
    </div>

    <!-- Danger zone -->
    <div class="gdetail__danger">
      <template v-if="confirmingDelete">
        <span class="gdetail__danger-confirm">Delete this goal permanently?</span>
        <button class="gdetail__danger-yes" @click="confirmDelete">Delete</button>
        <button class="gdetail__danger-no" @click="cancelConfirm">Cancel</button>
      </template>
      <button v-else class="gdetail__danger-btn" @click="askDelete">Delete goal</button>
    </div>

  </div>
</template>

<style scoped>
.gdetail {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.gdetail__back {
  background: none;
  border: none;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  transition: color var(--t-fast);
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 4px;
}

.gdetail__back:hover { color: var(--color-text-secondary); }

.gdetail__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.gdetail__emoji { font-size: 40px; line-height: 1; flex-shrink: 0; margin-top: 2px; }

.gdetail__heading { flex: 1; min-width: 0; }

.gdetail__title { font-size: var(--text-3xl); font-weight: 700; margin: 0; color: var(--color-text); }

.gdetail__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 6px;
}

.gdetail__category {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: 2px 8px;
}

.gdetail__due { font-size: var(--text-sm); color: var(--color-text-secondary); }
.gdetail__due--overdue { color: var(--color-danger); }

.gdetail__status-badge {
  font-size: var(--text-xs);
  color: var(--color-success);
  background: var(--color-bg);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-xs);
  padding: 2px 8px;
}

.gdetail__pct {
  font-size: var(--text-2xl, 22px);
  font-weight: 700;
  color: var(--color-accent);
  flex-shrink: 0;
}

.gdetail__progress-bar {
  height: 6px;
  background: var(--color-border);
  border-radius: 99px;
  overflow: hidden;
}

.gdetail__progress-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 99px;
  transition: width 0.5s var(--ease);
}

.gdetail__section { display: flex; flex-direction: column; gap: 10px; }

.gdetail__section-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0;
}

.gdetail__notes {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px;
  font-size: var(--text-sm);
  color: var(--color-text);
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  transition: border-color var(--t-fast);
  min-height: 100px;
}

.gdetail__notes:focus { outline: none; border-color: var(--color-accent); }

.gdetail__actions { display: flex; align-items: center; gap: 10px; }

.gdetail__btn {
  padding: 8px 18px;
  border-radius: var(--radius);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--t-fast);
  font-family: inherit;
}

.gdetail__btn--outline {
  background: transparent;
  border-color: var(--color-success);
  color: var(--color-success);
}

.gdetail__btn--outline:hover { background: var(--color-success); color: #fff; }

.gdetail__btn--success { background: var(--color-success); color: #fff; }
.gdetail__btn--success:hover { opacity: 0.88; }

.gdetail__btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.gdetail__btn--ghost:hover { color: var(--color-text); }

.gdetail__confirm-text { font-size: var(--text-sm); color: var(--color-text-secondary); }

.gdetail__danger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.gdetail__danger-btn { background: none; border: none; font-size: var(--text-sm); color: var(--color-text-muted); cursor: pointer; padding: 0; transition: color var(--t-fast); font-family: inherit; }
.gdetail__danger-btn:hover { color: var(--color-danger); }
.gdetail__danger-confirm { font-size: var(--text-sm); color: var(--color-text-secondary); }
.gdetail__danger-yes { padding: 5px 14px; border-radius: var(--radius); border: 1px solid var(--color-danger); background: transparent; color: var(--color-danger); font-size: var(--text-sm); cursor: pointer; transition: all var(--t-fast); font-family: inherit; }
.gdetail__danger-yes:hover { background: var(--color-danger); color: #fff; }
.gdetail__danger-no { background: none; border: none; font-size: var(--text-sm); color: var(--color-text-muted); cursor: pointer; font-family: inherit; transition: color var(--t-fast); }
.gdetail__danger-no:hover { color: var(--color-text); }

@media (max-width: 767px) {
  .gdetail__title { font-size: var(--text-2xl, 22px); }
  .gdetail__pct { font-size: var(--text-lg); }
}
</style>
