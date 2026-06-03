<script setup lang="ts">
import { UiConfirmDialog, UiToastContainer } from '@/ui'
</script>

<template>
  <router-view />
  <!-- Global singletons — always present regardless of route -->
  <UiConfirmDialog />
  <UiToastContainer />
</template>
