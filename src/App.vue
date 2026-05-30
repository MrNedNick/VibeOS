<script setup lang="ts">
import { UiConfirmDialog } from '@/ui'
</script>

<template>
  <router-view />
  <!-- Global confirm dialog — singleton, mounted once here -->
  <UiConfirmDialog />
</template>
