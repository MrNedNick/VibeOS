<script setup lang="ts">
import { UiPlannedView } from '@/ui'
</script>

<template>
  <UiPlannedView
    icon="BookOpen"
    title="Learning"
    sprint="Sprint 5"
    description="Structured learning plans with daily sessions and progress tracking. Turn vague intentions — 'I should learn TypeScript' — into a concrete, measurable plan."
    :features="[
      'Learning plans with topic, time target, and deadline',
      'Daily session logging with notes and key takeaways',
      'Progress measured in hours completed',
      'Streak tracking and consistency heatmap',
      'Link to a Goal and Habit for full accountability',
    ]"
  />
</template>
