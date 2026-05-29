<script setup lang="ts">
import { computed } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  name: string
  size?: number
  strokeWidth?: number
}>(), {
  size: 16,
  strokeWidth: 1.75,
})

const icon = computed(() => {
  const component = (LucideIcons as Record<string, unknown>)[props.name]
  if (component == null) return null
  const t = typeof component
  return (t === 'object' || t === 'function') ? component : null
})
</script>

<template>
  <component
    :is="icon"
    v-if="icon"
    :size="size"
    :stroke-width="strokeWidth"
    class="ui-icon"
  />
</template>

<style scoped>
.ui-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
