<script setup lang="ts">
import { UiPlannedView } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const rows: PropDef[] = [
  { prop: 'icon', type: 'string (required)', purpose: 'Lucide icon for the placeholder' },
  { prop: 'title', type: 'string (required)', purpose: 'Module / feature name' },
  { prop: 'description', type: 'string (required)', purpose: 'One-line summary of what is coming' },
  { prop: 'sprint', type: 'string (required)', purpose: 'Sprint tag (e.g. "S13")' },
  { prop: 'features', type: 'string[] (required)', purpose: 'Planned feature bullets' },
]
</script>

<template>
  <ShowcaseCard
    title="UiPlannedView"
    purpose="Full-page placeholder for modules that are planned but not built. Communicates intent and scope instead of a dead end."
    canon="src/ui/components/UiPlannedView.vue"
  >
    <template #demo>
      <div class="frame">
        <UiPlannedView
          icon="Sparkles"
          title="Coming soon"
          description="This module is on the roadmap and will land in an upcoming sprint."
          sprint="S13"
          :features="['Live data sync', 'AI insights', 'Mobile layout']"
        />
      </div>
    </template>

    <template #props>
      <PropTable :rows="rows" note="All props required — it's a content-driven placeholder." />
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.frame {
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
</style>
