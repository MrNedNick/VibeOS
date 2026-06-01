<script setup lang="ts">
import { UiSkeleton } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const rows: PropDef[] = [
  { prop: 'width', type: 'string', purpose: "CSS width (default: '100%')" },
  { prop: 'height', type: 'string', purpose: "CSS height (default: '1em')" },
  { prop: 'rounded', type: "'none' | 'sm' | 'md' | 'full'", purpose: 'Corner rounding (default: md)' },
  { prop: 'inline', type: 'boolean', purpose: 'Render inline instead of block' },
]
</script>

<template>
  <ShowcaseCard
    title="UiSkeleton"
    purpose="Shimmer placeholder shown while async content loads. Match the skeleton's shape to the real content to avoid layout shift."
    canon="src/ui/components/UiSkeleton.vue"
  >
    <template #playground>
      <PgStage hint="Skeletons animate continuously — use one per line of expected content.">
        <template #stage>
          <div class="skel-demo">
            <UiSkeleton width="60px" height="60px" rounded="full" />
            <div class="skel-lines">
              <UiSkeleton width="80%" height="14px" rounded="full" />
              <UiSkeleton width="100%" height="14px" rounded="full" />
              <UiSkeleton width="55%" height="14px" rounded="full" />
            </div>
          </div>
        </template>
      </PgStage>
    </template>

    <template #props>
      <PropTable :rows="rows" />
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.skel-demo { display: flex; gap: 14px; align-items: center; width: 100%; max-width: 360px; }
.skel-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
</style>
