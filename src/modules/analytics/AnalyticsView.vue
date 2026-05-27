<script setup lang="ts">
import { UiPlannedView } from '@/ui'
</script>

<template>
  <UiPlannedView
    icon="BarChart2"
    title="Analytics"
    sprint="Sprint 5"
    description="Personal stats aggregated across all modules. Understand your patterns — when you're productive, which habits stick, how training and learning progress over time."
    :features="[
      'Habit consistency heatmap (GitHub-style)',
      'Task completion rate over time',
      'Learning hours per week chart',
      'Workout frequency and distance trends',
      'Goal progress overview and weekly digest',
    ]"
  />
</template>
