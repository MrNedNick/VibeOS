<script setup lang="ts">
import { UiConfirmDialog, UiToastContainer } from '@/ui'
import AppInstallPrompt from '@/layouts/components/AppInstallPrompt.vue'
</script>

<template>
  <router-view />
  <!-- Global singletons — always present regardless of route -->
  <UiConfirmDialog />
  <UiToastContainer />
  <AppInstallPrompt />
</template>
