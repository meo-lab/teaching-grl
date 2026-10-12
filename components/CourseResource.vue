<script setup>
import releases from '../data/course-releases'

defineProps({
  resource: { type: String, required: true },
  href: { type: String, required: true },
})
</script>

<template>
  <component
    :is="releases[resource] ? 'a' : 'span'"
    :href="releases[resource] ? href : undefined"
    :aria-disabled="releases[resource] ? undefined : 'true'"
    :class="{ 'course-resource-unreleased': !releases[resource] }"
  ><slot /></component>
</template>

<style scoped>
.course-resource-unreleased {
  background: #f1f3f5 !important;
  border-color: #d1d5db !important;
  color: #9ca3af !important;
  cursor: default;
}
.course-resource-unreleased :deep(*) {
  color: inherit !important;
}
</style>
