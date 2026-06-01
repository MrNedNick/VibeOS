<script setup lang="ts">
import { ref } from 'vue'
import { useConfirm } from '@/core/composables/useConfirm'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const { confirm } = useConfirm()
const danger = ref(true)
const last = ref<'—' | 'confirmed' | 'cancelled'>('—')

async function open() {
  const ok = await confirm({
    title: danger.value ? 'Delete this item?' : 'Save changes?',
    body: danger.value ? 'This cannot be undone.' : 'Your changes will be applied.',
    danger: danger.value,
  })
  last.value = ok ? 'confirmed' : 'cancelled'
}

const rows: PropDef[] = [
  { prop: 'confirm(opts)', type: '(o: ConfirmOptions) => Promise<boolean>', purpose: 'Opens the dialog, resolves true/false' },
  { prop: 'opts.title', type: 'string', purpose: 'Dialog heading' },
  { prop: 'opts.body', type: 'string', purpose: 'Optional explanatory text' },
  { prop: 'opts.danger', type: 'boolean', purpose: 'Red destructive styling + "Delete" default label' },
  { prop: 'opts.confirmLabel', type: 'string', purpose: 'Override confirm button text' },
  { prop: 'opts.cancelLabel', type: 'string', purpose: 'Override cancel button text' },
]
</script>

<template>
  <ShowcaseCard
    title="UiConfirmDialog"
    purpose="App-wide confirmation modal driven by the useConfirm() composable. The dialog is mounted once at the app root; call confirm() anywhere and await the boolean result."
    canon="src/ui/components/UiConfirmDialog.vue · src/core/composables/useConfirm.ts"
  >
    <template #playground>
      <PgStage hint="Opens the real app-level dialog. ESC cancels, Enter confirms." :readout="`last = ${last}`">
        <template #stage>
          <button class="pg-btn" @click="open">Open dialog</button>
        </template>
        <template #controls>
          <label class="ctl ctl--check"><input type="checkbox" v-model="danger" /> danger</label>
        </template>
      </PgStage>
    </template>

    <template #props>
      <PropTable :rows="rows" note="Driven by a composable, not props — useConfirm() returns confirm()." />
    </template>

    <template #extra>
      <h3 class="block-title">Usage</h3>
      <pre class="code">const { confirm } = useConfirm()
const ok = await confirm({ title: 'Delete?', danger: true })
if (ok) remove()</pre>
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
.ctl { display: flex; align-items: center; gap: 6px; font-size: var(--text-xs); color: var(--color-text-secondary); }
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
