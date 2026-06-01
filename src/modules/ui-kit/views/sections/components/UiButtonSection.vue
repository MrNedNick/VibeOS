<script setup lang="ts">
import { ref } from 'vue'
import { UiButton } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const variant = ref<'primary' | 'ghost' | 'danger' | 'outline'>('primary')
const size = ref<'sm' | 'md'>('md')
const disabled = ref(false)
const loading = ref(false)
const clicks = ref(0)

const rows: PropDef[] = [
  { prop: 'variant', type: "'primary' | 'ghost' | 'danger' | 'outline'", purpose: 'Visual style (default: primary)' },
  { prop: 'size', type: "'sm' | 'md'", purpose: 'Height / padding (default: md)' },
  { prop: 'disabled', type: 'boolean', purpose: 'Blocks interaction, dims the button' },
  { prop: 'loading', type: 'boolean', purpose: 'Shows a spinner and disables clicks' },
  { prop: 'type', type: "'button' | 'submit' | 'reset'", purpose: 'Native button type (default: button)' },
]
</script>

<template>
  <ShowcaseCard
    title="UiButton"
    purpose="The primary action element. One primary per view; ghost for secondary, outline for tertiary, danger for destructive actions."
    canon="src/ui/components/UiButton.vue"
  >
    <template #playground>
      <PgStage hint="Hover, focus and press the live button." :readout="`clicks = ${clicks}`">
        <template #stage>
          <UiButton :variant="variant" :size="size" :disabled="disabled" :loading="loading" @click="clicks++">
            Continue
          </UiButton>
        </template>
        <template #controls>
          <label class="ctl">Variant
            <select v-model="variant" class="ctl__select">
              <option value="primary">primary</option>
              <option value="ghost">ghost</option>
              <option value="danger">danger</option>
              <option value="outline">outline</option>
            </select>
          </label>
          <label class="ctl">Size
            <select v-model="size" class="ctl__select">
              <option value="sm">sm</option>
              <option value="md">md</option>
            </select>
          </label>
          <label class="ctl ctl--check"><input type="checkbox" v-model="disabled" /> disabled</label>
          <label class="ctl ctl--check"><input type="checkbox" v-model="loading" /> loading</label>
        </template>
      </PgStage>
    </template>

    <template #demo>
      <div class="row">
        <UiButton variant="primary">Primary</UiButton>
        <UiButton variant="ghost">Ghost</UiButton>
        <UiButton variant="outline">Outline</UiButton>
        <UiButton variant="danger">Danger</UiButton>
        <UiButton disabled>Disabled</UiButton>
        <UiButton loading>Loading</UiButton>
      </div>
    </template>

    <template #props>
      <PropTable :rows="rows" note="All props optional — defaults render a primary md button." />
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.ctl {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
.ctl--check { flex-direction: row; align-items: center; gap: 6px; }
.ctl__select {
  font-family: inherit;
  font-size: var(--text-xs);
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
}
</style>
