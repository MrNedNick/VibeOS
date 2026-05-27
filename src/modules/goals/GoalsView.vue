<script setup lang="ts">
import { UiPlannedView } from '@/ui'
</script>

<template>
  <UiPlannedView
    icon="Target"
    title="Goals"
    sprint="Sprint 4"
    description="Long-term goals, milestones, and progress tracking. Connect your tasks and habits to what matters most — and finally see the bigger picture."
    :features="[
      'Life goals with categories: career, health, skill, personal',
      'Milestones as checkable sub-goals',
      'Link tasks and habits to a goal',
      'Progress calculated automatically',
      'Dashboard widget with progress bars',
    ]"
  />
</template>
