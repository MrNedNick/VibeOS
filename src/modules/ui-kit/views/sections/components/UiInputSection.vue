<script setup lang="ts">
import { ref } from 'vue'
import { UiInput } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const value = ref('')
const placeholder = ref('Type something…')
const disabled = ref(false)
const enters = ref(0)

const rows: PropDef[] = [
  { prop: 'v-model', type: 'string (required)', purpose: 'Two-way bound value (defineModel)' },
  { prop: 'placeholder', type: 'string', purpose: 'Empty-state hint text' },
  { prop: 'maxlength', type: 'number', purpose: 'Max character count' },
  { prop: 'disabled', type: 'boolean', purpose: 'Blocks editing, dims the field' },
  { prop: 'autofocus', type: 'boolean', purpose: 'Focus on mount' },
  { prop: '@enter', type: '() => void', purpose: 'Emitted when Enter is pressed' },
]
</script>

<template>
  <ShowcaseCard
    title="UiInput"
    purpose="A single-line text input with token-driven focus glow. Pair with UiField for a labelled, validated field."
    canon="src/ui/components/UiInput.vue"
  >
    <template #playground>
      <PgStage hint="Type and press Enter." :readout="`value = ${JSON.stringify(value)} · enter ×${enters}`">
        <template #stage>
          <div class="stage-wrap">
            <UiInput v-model="value" :placeholder="placeholder" :disabled="disabled" @enter="enters++" />
          </div>
        </template>
        <template #controls>
          <label class="ctl">Placeholder
            <input v-model="placeholder" class="ctl__input" />
          </label>
          <label class="ctl ctl--check"><input type="checkbox" v-model="disabled" /> disabled</label>
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
.ctl__input {
  font-family: inherit; font-size: var(--text-xs);
  padding: 5px 8px; border-radius: var(--radius-sm);
  border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text);
}
</style>
