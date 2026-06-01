<script setup lang="ts">
import { ref } from 'vue'
import { UiProgressRing } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const progress = ref(72)
const size = ref(96)
const strokeWidth = ref(8)
const showLabel = ref(true)

const rows: PropDef[] = [
  { prop: 'progress', type: 'number (required)', purpose: 'Progress 0–100' },
  { prop: 'size', type: 'number', purpose: 'Diameter in px' },
  { prop: 'strokeWidth', type: 'number', purpose: 'Ring thickness in px' },
  { prop: 'color', type: 'string', purpose: 'Stroke colour (CSS value/var)' },
  { prop: 'showLabel', type: 'boolean', purpose: 'Show the centre label' },
  { prop: 'label', type: 'string', purpose: 'Override centre label (default: %)' },
]
</script>

<template>
  <ShowcaseCard
    title="UiProgressRing"
    purpose="Circular progress for compact, glanceable metrics — learning plan completion, daily habit ring."
    canon="src/ui/components/UiProgressRing.vue"
  >
    <template #playground>
      <PgStage :readout="`progress = ${progress}`">
        <template #stage>
          <UiProgressRing :progress="progress" :size="size" :stroke-width="strokeWidth" :show-label="showLabel" />
        </template>
        <template #controls>
          <label class="ctl">Progress <input type="range" min="0" max="100" v-model.number="progress" /></label>
          <label class="ctl">Size <input type="range" min="48" max="160" v-model.number="size" /></label>
          <label class="ctl">Stroke <input type="range" min="3" max="16" v-model.number="strokeWidth" /></label>
          <label class="ctl ctl--check"><input type="checkbox" v-model="showLabel" /> showLabel</label>
        </template>
      </PgStage>
    </template>

    <template #props>
      <PropTable :rows="rows" />
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.ctl { display: flex; flex-direction: column; gap: 4px; font-size: var(--text-xs); color: var(--color-text-secondary); }
.ctl--check { flex-direction: row; align-items: center; gap: 6px; }
</style>
