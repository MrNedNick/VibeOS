<script setup lang="ts">
import { ref } from 'vue'
import { UiField, UiInput } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const label = ref('Email')
const hint = ref('We never share it.')
const error = ref('')
const required = ref(true)
const value = ref('')

const rows: PropDef[] = [
  { prop: 'label', type: 'string', purpose: 'Field label shown above the control' },
  { prop: 'hint', type: 'string', purpose: 'Helper text below the control' },
  { prop: 'error', type: 'string', purpose: 'Error message — replaces hint, turns label/border red' },
  { prop: 'required', type: 'boolean', purpose: 'Shows a * after the label (default: false)' },
  { prop: 'fieldId', type: 'string', purpose: 'id linked to the slotted control for a11y' },
  { prop: 'default slot', type: 'slot', purpose: 'The control (UiInput, select, etc.)' },
]
</script>

<template>
  <ShowcaseCard
    title="UiField"
    purpose="Labelled wrapper around any form control. Owns the label, required marker, hint and error text so controls stay presentation-only."
    canon="src/ui/components/UiField.vue"
  >
    <template #playground>
      <PgStage hint="Toggle the error to see hint → error swap.">
        <template #stage>
          <div class="stage-wrap">
            <UiField :label="label" :hint="hint" :error="error" :required="required">
              <UiInput v-model="value" placeholder="you@example.com" />
            </UiField>
          </div>
        </template>
        <template #controls>
          <label class="ctl">Label <input v-model="label" class="ctl__input" /></label>
          <label class="ctl">Hint <input v-model="hint" class="ctl__input" /></label>
          <label class="ctl">Error <input v-model="error" class="ctl__input" placeholder="(empty = none)" /></label>
          <label class="ctl ctl--check"><input type="checkbox" v-model="required" /> required</label>
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
