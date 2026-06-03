<script setup lang="ts">
import { ref } from 'vue'
import UiFeedbackModal from '@/ui/components/UiFeedbackModal.vue'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const open = ref(false)
const last = ref<'—' | 'submitted' | 'dismissed'>('—')
const lastScore = ref<number | null>(null)

function onSubmitted(score: number, comment?: string) {
  last.value = 'submitted'
  lastScore.value = score
  // comment intentionally unused in showcase
  void comment
}

function onDismissed() {
  last.value = 'dismissed'
}

const rows: PropDef[] = [
  { prop: 'v-model:open', type: 'boolean',    purpose: 'Controls visibility' },
  { prop: '@submitted',   type: '(score: number, comment?: string) => void', purpose: 'Emitted after user sends feedback' },
  { prop: '@dismissed',   type: '() => void',  purpose: 'Emitted when user skips / cancels' },
]
</script>

<template>
  <ShowcaseCard
    title="UiFeedbackModal"
    purpose="3-step NPS feedback modal. Step 1: score 0–10. Step 2 (optional): free-text comment for strong opinions (≤6 or ≥9). Step 3: auto-dismiss thank-you screen. No network calls — result emitted upward."
    canon="src/ui/components/UiFeedbackModal.vue"
  >
    <template #playground>
      <PgStage
        hint="Open the modal, pick a score. Score ≤6 or ≥9 shows the comment step."
        :readout="last === 'submitted' ? `submitted · score ${lastScore}` : `last = ${last}`"
      >
        <template #stage>
          <button class="pg-btn" @click="open = true">Open feedback modal</button>

          <UiFeedbackModal
            v-model:open="open"
            @submitted="onSubmitted"
            @dismissed="onDismissed"
          />
        </template>
      </PgStage>
    </template>

    <template #props>
      <PropTable :rows="rows" note="Trigger manually via useFeedback.openManually() or from Settings → Privacy & Data." />
    </template>

    <template #extra>
      <h3 class="block-title">Usage</h3>
      <pre class="code">import { useFeedback } from '@/core/composables/useFeedback'

// Manual trigger (from Settings)
const { openManually } = useFeedback()
openManually()

// Automatic trigger (on session:start when conditions met)
// — handled by navigationTracker automatically</pre>
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.pg-btn {
  padding: 8px 16px; border-radius: var(--radius-sm);
  border: 1px solid var(--color-accent); background: transparent; color: var(--color-accent);
  font-size: var(--text-xs); font-weight: 500; cursor: pointer; transition: background var(--t-fast);
}
.pg-btn:hover { background: color-mix(in srgb, var(--color-accent) 12%, transparent); }
.block-title {
  font-size: var(--text-sm); font-weight: 600; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 10px;
}
.code {
  font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--color-text-secondary);
  background: var(--color-surface-elevated); padding: 12px 14px; border-radius: var(--radius);
  margin: 0; white-space: pre-wrap; line-height: var(--leading-base);
}
</style>
