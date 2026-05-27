<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useHabitsStore } from '../stores/habits.store'
import HabitCard from '../components/HabitCard.vue'

const store = useHabitsStore()

const showForm = ref(false)
const newName = ref('')
const newEmoji = ref('')
const nameInputRef = ref<HTMLInputElement>()

function openForm() {
  showForm.value = true
  newName.value = ''
  newEmoji.value = ''
  setTimeout(() => nameInputRef.value?.focus(), 50)
}

function submitForm() {
  if (!newName.value.trim()) return
  store.createHabit(newName.value, newEmoji.value)
  showForm.value = false
}

function cancelForm() {
  showForm.value = false
}

function onFormKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') submitForm()
  if (e.key === 'Escape') cancelForm()
}

function onKeydown(e: KeyboardEvent) {
  if (showForm.value) return
  if (e.target instanceof HTMLInputElement) return
  if (e.key === 'n' || e.key === 'N') openForm()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const todayLabel = new Date().toLocaleDateString('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long',
})
</script>

<template>
  <div class="habits">
    <div class="habits__header">
      <div>
        <h1 class="habits__title">Habits</h1>
        <p class="habits__date">{{ todayLabel }}</p>
      </div>
      <button class="habits__add-btn" title="Add habit (N)" @click="openForm">+ Add habit</button>
    </div>

    <!-- New habit form -->
    <div v-if="showForm" class="habits__form" @keydown="onFormKeydown">
      <input
        v-model="newEmoji"
        ref="emojiInput"
        class="habits__form-emoji"
        placeholder="⭐"
        maxlength="2"
      />
      <input
        v-model="newName"
        ref="nameInputRef"
        class="habits__form-name"
        placeholder="Habit name"
        maxlength="60"
      />
      <div class="habits__form-actions">
        <button class="habits__form-save" @click="submitForm">Add</button>
        <button class="habits__form-cancel" @click="cancelForm">Cancel</button>
      </div>
    </div>

    <!-- Habit cards -->
    <div v-if="store.habits.length > 0" class="habits__grid">
      <HabitCard
        v-for="habit in store.habits"
        :key="habit.id"
        :habit="habit"
        :done-today="store.isCompletedToday(habit.id)"
        @toggle="store.toggleToday"
        @delete="store.deleteHabit"
      />
    </div>

    <!-- Empty state -->
    <div v-else-if="!showForm" class="habits__empty">
      <div class="habits__empty-icon">📋</div>
      <p class="habits__empty-title">No habits tracked yet.</p>
      <p class="habits__empty-sub">Add something you want to do every day — the heatmap will do the motivating.</p>
      <button class="habits__empty-btn" @click="openForm">Add your first habit</button>
    </div>
  </div>
</template>

<style scoped>
.habits {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.habits__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.habits__title {
  font-size: 27px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.habits__date {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 4px 0 0;
}

.habits__add-btn {
  padding: 8px 16px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity var(--t-fast);
}

.habits__add-btn:hover { opacity: 0.88; }

/* New habit form */
.habits__form {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-lg);
}

.habits__form-emoji {
  width: 44px;
  font-size: 22px;
  text-align: center;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 6px;
  outline: none;
  color: var(--color-text);
}

.habits__form-name {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
  background: transparent;
  border: none;
  outline: none;
}

.habits__form-name::placeholder { color: var(--color-text-muted); }

.habits__form-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.habits__form-save {
  padding: 6px 14px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--t-fast);
}

.habits__form-save:hover { opacity: 0.88; }

.habits__form-cancel {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  cursor: pointer;
  transition: background var(--t-fast);
}

.habits__form-cancel:hover { background: var(--color-border); }

/* Grid */
.habits__grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Empty state */
.habits__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 64px 0;
  text-align: center;
}

.habits__empty-icon {
  font-size: 40px;
  line-height: 1;
}

.habits__empty-title {
  font-size: 19px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0;
}

.habits__empty-sub {
  font-size: 15px;
  color: var(--color-text-muted);
  margin: 0;
  max-width: 380px;
  line-height: 1.6;
}

.habits__empty-btn {
  margin-top: 6px;
  padding: 9px 22px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--t-fast);
}

.habits__empty-btn:hover { opacity: 0.88; }

/* Responsive */
@media (max-width: 767px) {
  .habits__header { flex-direction: column; gap: 12px; }
  .habits__add-btn { align-self: flex-start; }
  .habits__form { flex-wrap: wrap; }
  .habits__form-name { min-width: 0; width: 100%; order: -1; }
}
</style>
