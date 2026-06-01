<script setup lang="ts">
import { ref } from 'vue'
import { UiCard } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const padding = ref<'none' | 'sm' | 'md' | 'lg'>('md')
const surface = ref<'base' | 'raised'>('raised')
const hoverable = ref(true)

const rows: PropDef[] = [
  { prop: 'padding', type: "'none' | 'sm' | 'md' | 'lg'", purpose: 'Inner padding (default: md)' },
  { prop: 'surface', type: "'base' | 'raised'", purpose: "'raised' adds shadow-1 + lifts on hover (default: base)" },
  { prop: 'hoverable', type: 'boolean', purpose: 'Enables hover elevation/tint' },
  { prop: 'clickable', type: 'boolean', purpose: 'Cursor pointer + press feedback' },
  { prop: 'as', type: 'string', purpose: 'Root element tag (default: div)' },
  { prop: 'default slot', type: 'slot', purpose: 'Card content' },
]
</script>

<template>
  <ShowcaseCard
    title="UiCard"
    purpose="The container for every card surface in the app. Use surface='raised' for interactive or content cards so elevation stays consistent."
    canon="src/ui/components/UiCard.vue"
  >
    <template #playground>
      <PgStage hint="Hover the card to see the raised-surface elevation.">
        <template #stage>
          <UiCard :padding="padding" :surface="surface" :hoverable="hoverable" style="width: 240px;">
            <strong style="color: var(--color-text)">Card title</strong>
            <p style="margin: 6px 0 0; font-size: var(--text-xs); color: var(--color-text-muted)">
              Any content goes in the default slot.
            </p>
          </UiCard>
        </template>
        <template #controls>
          <label class="ctl">Padding
            <select v-model="padding" class="ctl__select">
              <option>none</option><option>sm</option><option>md</option><option>lg</option>
            </select>
          </label>
          <label class="ctl">Surface
            <select v-model="surface" class="ctl__select">
              <option>base</option><option>raised</option>
            </select>
          </label>
          <label class="ctl ctl--check"><input type="checkbox" v-model="hoverable" /> hoverable</label>
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
.ctl__select {
  font-family: inherit; font-size: var(--text-xs);
  padding: 5px 8px; border-radius: var(--radius-sm);
  border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text);
}
</style>
