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

type Step = 'nps' | 'comment' | 'thankyou'

const step    = ref<Step>('nps')
const score   = ref<number | null>(null)
const comment = ref('')

// Reset state when modal opens
watch(open, (v) => {
  if (v) {
    step.value    = 'nps'
    score.value   = null
    comment.value = ''
  }
})

function selectScore(n: number): void {
  score.value = n
  // Prompt for comment on strong opinions (detractors ≤6 or promoters ≥9)
  if (n <= 6 || n >= 9) {
    step.value = 'comment'
  } else {
    submit()
  }
}

function submit(): void {
  if (score.value === null) return
  step.value = 'thankyou'
  const c = comment.value.trim() || undefined
  emit('submitted', score.value, c)
  setTimeout(() => { open.value = false }, 2000)
}

function dismiss(): void {
  open.value = false
  emit('dismissed')
}

</script>

<template>
  <UiModal v-model:open="open" size="sm" @close="dismiss">
    <template #header>
      <h2 class="ufm-title">How likely are you to recommend VibeOS?</h2>
    </template>

    <template #body>
      <!-- Step 1: NPS score -->
      <div v-if="step === 'nps'" class="ufm-nps">
        <div class="ufm-scale-labels">
          <span>Not at all</span>
          <span>Absolutely</span>
        </div>
        <div class="ufm-scale">
          <button
            v-for="n in 11"
            :key="n - 1"
            class="ufm-score-btn"
            :class="{
              'ufm-score-btn--selected': score === n - 1,
              'ufm-score-btn--low':  n - 1 <= 6,
              'ufm-score-btn--mid':  n - 1 >= 7 && n - 1 <= 8,
              'ufm-score-btn--high': n - 1 >= 9,
            }"
            @click="selectScore(n - 1)"
          >{{ n - 1 }}</button>
        </div>
      </div>

      <!-- Step 2: Optional comment -->
      <div v-else-if="step === 'comment'" class="ufm-comment">
        <p class="ufm-comment-prompt">
          {{ score !== null && score >= 9
            ? 'Great! What do you love most about VibeOS?'
            : 'What could we improve?' }}
        </p>
        <UiTextarea
          v-model="comment"
          placeholder="Optional — share your thoughts"
          :rows="4"
          resize="none"
        />
      </div>

      <!-- Step 3: Thank you -->
      <div v-else-if="step === 'thankyou'" class="ufm-thankyou">
        <span class="ufm-thankyou-icon">✦</span>
        <p class="ufm-thankyou-text">Thanks for your feedback!</p>
        <p class="ufm-thankyou-sub">This helps make VibeOS better.</p>
      </div>
    </template>

    <template v-if="step !== 'thankyou'" #footer>
      <UiButton variant="ghost" @click="dismiss">
        {{ step === 'nps' ? 'Skip' : 'Cancel' }}
      </UiButton>
      <UiButton v-if="step === 'comment'" @click="submit">
        Send feedback
      </UiButton>
    </template>
  </UiModal>
</template>

<style scoped>
.ufm-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

/* NPS scale */
.ufm-nps { display: flex; flex-direction: column; gap: 10px; }

.ufm-scale-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.ufm-scale {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  justify-content: center;
}

.ufm-score-btn {
  flex: 1;
  min-width: 0;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface-1);
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
}
.ufm-score-btn:hover { border-color: var(--color-accent); color: var(--color-text); }

.ufm-score-btn--selected.ufm-score-btn--low  {
  background: color-mix(in srgb, var(--color-danger) 15%, transparent);
  border-color: var(--color-danger);
  color: var(--color-danger);
}
.ufm-score-btn--selected.ufm-score-btn--mid  {
  background: color-mix(in srgb, var(--color-warning) 15%, transparent);
  border-color: var(--color-warning);
  color: var(--color-warning);
}
.ufm-score-btn--selected.ufm-score-btn--high {
  background: color-mix(in srgb, var(--color-success) 15%, transparent);
  border-color: var(--color-success);
  color: var(--color-success);
}

/* Comment step */
.ufm-comment { display: flex; flex-direction: column; gap: 12px; }
.ufm-comment-prompt { font-size: 14px; color: var(--color-text-secondary); margin: 0; }

/* Thank you */
.ufm-thankyou {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0 4px;
  text-align: center;
}
.ufm-thankyou-icon { font-size: 28px; color: var(--color-accent); }
.ufm-thankyou-text { font-size: 17px; font-weight: 700; color: var(--color-text); margin: 0; }
.ufm-thankyou-sub  { font-size: 13px; color: var(--color-text-muted); margin: 0; }
</style>
