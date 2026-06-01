<script setup lang="ts">
import { ref } from 'vue'
import { UiProgressBar } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const value = ref(60)
const color = ref<'accent' | 'success' | 'danger' | 'warning'>('accent')
const showLabel = ref(true)

const rows: PropDef[] = [
  { prop: 'value', type: 'number (required)', purpose: 'Progress 0–100 (clamped)' },
  { prop: 'color', type: "'accent' | 'success' | 'danger' | 'warning'", purpose: 'Fill colour (default: accent)' },
  { prop: 'height', type: 'number', purpose: 'Bar height in px (default: 4)' },
  { prop: 'animated', type: 'boolean', purpose: 'Animate width changes' },
  { prop: 'showLabel', type: 'boolean', purpose: 'Show the % label' },
]
</script>

<template>
  <ShowcaseCard
    title="UiProgressBar"
    purpose="Linear progress indicator for determinate values — goal completion, budget usage, plan progress."
    canon="src/ui/components/UiProgressBar.vue"
  >
    <template #playground>
      <PgStage :readout="`value = ${value}`">
        <template #stage>
          <div class="stage-wrap">
            <UiProgressBar :value="value" :color="color" :show-label="showLabel" />
          </div>
        </template>
        <template #controls>
          <label class="ctl">Value <input type="range" min="0" max="100" v-model.number="value" /></label>
          <label class="ctl">Color
            <select v-model="color" class="ctl__select">
              <option>accent</option><option>success</option><option>danger</option><option>warning</option>
            </select>
          </label>
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
.stage-wrap { width: 100%; max-width: 320px; }
.ctl { display: flex; flex-direction: column; gap: 4px; font-size: var(--text-xs); color: var(--color-text-secondary); }
.ctl--check { flex-direction: row; align-items: center; gap: 6px; }
.ctl__select {
  font-family: inherit; font-size: var(--text-xs);
  padding: 5px 8px; border-radius: var(--radius-sm);
  border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text);
}
</style>
