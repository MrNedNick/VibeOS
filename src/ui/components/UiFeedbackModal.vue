<script setup lang="ts">
import { ref, watch } from 'vue'
import UiModal from './UiModal.vue'
import UiButton from './UiButton.vue'
import UiTextarea from './UiTextarea.vue'

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  submitted: [score: number, comment?: string]
  dismissed: []
}>()

type Step = 'mood' | 'comment' | 'thankyou'

interface MoodOption {
  emoji: string
  label: string
  score: number
  color: string
  commentPrompt: string
}

const MOODS: MoodOption[] = [
  { emoji: '😞', label: 'Not great',  score: 2,  color: 'danger',  commentPrompt: "What's not working for you? We want to improve." },
  { emoji: '😐', label: "It's ok",    score: 5,  color: 'warning', commentPrompt: 'What would make VibeOS better for you?' },
  { emoji: '😊', label: 'Good',       score: 8,  color: 'success', commentPrompt: 'What do you enjoy most? Anything we can improve?' },
  { emoji: '😍', label: 'Love it!',   score: 10, color: 'accent',  commentPrompt: "Amazing! What's your favourite part?" },
]

const step         = ref<Step>('mood')
const selectedMood = ref<MoodOption | null>(null)
const comment      = ref('')
const hovered      = ref<number | null>(null)

watch(open, (v) => {
  if (v) {
    step.value         = 'mood'
    selectedMood.value = null
    comment.value      = ''
    hovered.value      = null
  }
})

function pickMood(mood: MoodOption): void {
  selectedMood.value = mood
  step.value = 'comment'
}

function submit(): void {
  if (!selectedMood.value) return
  step.value = 'thankyou'
  const c = comment.value.trim() || undefined
  emit('submitted', selectedMood.value.score, c)
  setTimeout(() => { open.value = false }, 2200)
}

function dismiss(): void {
  open.value = false
  emit('dismissed')
}
</script>

<template>
  <UiModal v-model:open="open" size="sm" @close="dismiss">
    <template #header>
      <div class="ufm-header">
        <span class="ufm-header-icon">💬</span>
        <div>
          <h2 class="ufm-title">
            {{ step === 'mood'    ? "How's VibeOS treating you?" :
               step === 'comment' ? 'Tell us more' :
                                    'Thank you!' }}
          </h2>
          <p v-if="step === 'mood'" class="ufm-subtitle">Your feedback helps us build a better product.</p>
        </div>
      </div>
    </template>

    <template #body>

      <!-- Step 1: Emoji mood -->
      <div v-if="step === 'mood'" class="ufm-mood">
        <button
          v-for="mood in MOODS"
          :key="mood.score"
          class="ufm-mood-btn"
          :class="[
            `ufm-mood-btn--${mood.color}`,
            { 'ufm-mood-btn--hovered': hovered === mood.score },
          ]"
          @mouseenter="hovered = mood.score"
          @mouseleave="hovered = null"
          @click="pickMood(mood)"
        >
          <span class="ufm-mood-emoji">{{ mood.emoji }}</span>
          <span class="ufm-mood-label">{{ mood.label }}</span>
        </button>
      </div>

      <!-- Step 2: Comment -->
      <div v-else-if="step === 'comment'" class="ufm-comment">
        <div class="ufm-selected-mood">
          <span class="ufm-selected-emoji">{{ selectedMood?.emoji }}</span>
          <p class="ufm-comment-prompt">{{ selectedMood?.commentPrompt }}</p>
        </div>
        <UiTextarea
          v-model="comment"
          placeholder="Optional — share your thoughts…"
          :rows="3"
          resize="none"
          autofocus
        />
      </div>

      <!-- Step 3: Thank you -->
      <div v-else-if="step === 'thankyou'" class="ufm-thankyou">
        <span class="ufm-thankyou-emoji">{{ selectedMood?.emoji }}</span>
        <p class="ufm-thankyou-text">Feedback received!</p>
        <p class="ufm-thankyou-sub">This helps make VibeOS better. Thank you 🙏</p>
      </div>

    </template>

    <template v-if="step === 'comment'" #footer>
      <UiButton variant="ghost" @click="dismiss">Skip</UiButton>
      <UiButton @click="submit">Send feedback</UiButton>
    </template>
    <template v-else-if="step === 'mood'" #footer>
      <UiButton variant="ghost" size="sm" @click="dismiss">Maybe later</UiButton>
    </template>
  </UiModal>
</template>

<style scoped>
.ufm-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.ufm-header-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 2px;
}

.ufm-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 2px;
}

.ufm-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: var(--leading-relaxed);
}

/* Mood step */
.ufm-mood {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.ufm-mood-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: var(--color-surface-1);
  cursor: pointer;
  transition: all var(--t-fast);
}

.ufm-mood-btn:hover,
.ufm-mood-btn--hovered {
  transform: translateY(-3px);
  box-shadow: var(--shadow-2);
}

.ufm-mood-btn--danger:hover,
.ufm-mood-btn--danger.ufm-mood-btn--hovered {
  border-color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 8%, transparent);
}
.ufm-mood-btn--warning:hover,
.ufm-mood-btn--warning.ufm-mood-btn--hovered {
  border-color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 8%, transparent);
}
.ufm-mood-btn--success:hover,
.ufm-mood-btn--success.ufm-mood-btn--hovered {
  border-color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
}
.ufm-mood-btn--accent:hover,
.ufm-mood-btn--accent.ufm-mood-btn--hovered {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}

.ufm-mood-emoji {
  font-size: 32px;
  line-height: 1;
  transition: transform var(--t-fast);
}

.ufm-mood-btn:hover .ufm-mood-emoji,
.ufm-mood-btn--hovered .ufm-mood-emoji {
  transform: scale(1.15);
}

.ufm-mood-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: center;
  line-height: var(--leading-tight);
}

/* Comment step */
.ufm-comment {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ufm-selected-mood {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--color-surface-1);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.ufm-selected-emoji {
  font-size: 26px;
  line-height: 1;
  flex-shrink: 0;
}

.ufm-comment-prompt {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--leading-relaxed);
}

/* Thank you */
.ufm-thankyou {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 0 8px;
  text-align: center;
}

.ufm-thankyou-emoji {
  font-size: 44px;
  line-height: 1;
  animation: ufm-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes ufm-pop {
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

.ufm-thankyou-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.ufm-thankyou-sub {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}
</style>
