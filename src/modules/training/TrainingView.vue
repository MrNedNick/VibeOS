<script setup lang="ts">
import { UiPlannedView } from '@/ui'
</script>

<template>
  <UiPlannedView
    icon="Dumbbell"
    title="Training"
    sprint="Sprint 5"
    description="Training plans, workout logs, and fitness progress. See whether today is a training day, log sessions, and track how your fitness evolves over time."
    :features="[
      'Training plans with sessions per week and sport type',
      'Today indicator: rest day or scheduled workout',
      'Workout logging with duration, distance, and feeling',
      'Connect training plan to a life goal',
      'Optional AI analysis after each session (Sprint 6)',
    ]"
  />
</template>
