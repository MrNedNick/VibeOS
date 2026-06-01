<script setup lang="ts">
import { ref } from 'vue'
import { UiModal, UiButton } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const open = ref(false)
const size = ref<'sm' | 'md' | 'lg'>('md')
const last = ref<'open' | 'closed'>('closed')

function openModal() { open.value = true; last.value = 'open' }

const rows: PropDef[] = [
  { prop: 'v-model:open', type: 'boolean',             purpose: 'Controls visibility — set false to close' },
  { prop: 'size',         type: "'sm' | 'md' | 'lg'",  purpose: 'Max-width: 420 / 560 / 720px (default: md)' },
  { prop: '@close',       type: '() => void',           purpose: 'Emitted when modal closes itself (Esc or backdrop click)' },
]
</script>

<template>
  <ShowcaseCard
    title="UiModal"
    purpose="Base overlay primitive. Teleports to body, traps focus, locks scroll, closes on Esc/backdrop click. Compose with header/body/footer slots. Used by UiConfirmDialog."
    canon="src/ui/components/UiModal.vue"
  >
    <template #playground>
      <PgStage hint="Open the modal then try Esc, backdrop click, or the Close button." :readout="`state = ${last}`">
        <template #stage>
          <UiButton @click="openModal">Open modal</UiButton>

          <UiModal v-model:open="open" :size="size" @close="last = 'closed'">
            <template #header>
              <h2 class="modal-demo__title">Example modal</h2>
            </template>
            <template #body>
              <p class="modal-demo__text">
                This modal traps focus (Tab cycles inside), locks scroll on <code>&lt;body&gt;</code>,
                and closes on Esc or backdrop click.
              </p>
              <p class="modal-demo__text">Size: <strong>{{ size }}</strong> — try the control below to resize.</p>
            </template>
            <template #footer>
              <UiButton variant="ghost" @click="open = false; last = 'closed'">Cancel</UiButton>
              <UiButton @click="open = false; last = 'closed'">Confirm</UiButton>
            </template>
          </UiModal>
        </template>
        <template #controls>
          <label class="ctl">Size
            <select v-model="size" class="ctl__select">
              <option value="sm">sm</option>
              <option value="md">md</option>
              <option value="lg">lg</option>
            </select>
          </label>
        </template>
      </PgStage>
    </template>

    <template #props>
      <PropTable :rows="rows" note="Slots: #header (bordered top area), #body (scrollable, padded), #footer (bordered bottom, flex-end)." />
    </template>

    <template #extra>
      <h3 class="block-title">Usage</h3>
      <pre class="code">&lt;UiModal v-model:open="isOpen" size="md" @close="onClose"&gt;
  &lt;template #header&gt;Title here&lt;/template&gt;
  &lt;template #body&gt;Content&lt;/template&gt;
  &lt;template #footer&gt;
    &lt;UiButton variant="ghost" @click="isOpen = false"&gt;Cancel&lt;/UiButton&gt;
    &lt;UiButton @click="save"&gt;Save&lt;/UiButton&gt;
  &lt;/template&gt;
&lt;/UiModal&gt;</pre>
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.modal-demo__title {
  font-size: var(--text-md);
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
  line-height: var(--leading-2xl);
}

.modal-demo__text {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0 0 12px;
  line-height: var(--leading-base);
}
.modal-demo__text:last-child { margin-bottom: 0; }
.modal-demo__text code {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  background: var(--color-surface-elevated);
  padding: 1px 4px;
  border-radius: var(--radius-xs);
}

.ctl {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
.ctl__select {
  font-family: inherit;
  font-size: var(--text-xs);
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
}

.block-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 10px;
}
.code {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  padding: 12px 14px;
  border-radius: var(--radius);
  margin: 0;
  white-space: pre-wrap;
  line-height: var(--leading-base);
}
</style>
