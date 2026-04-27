<script setup lang="ts">
import { computed } from 'vue'
import logoUrl from '../assets/uni-bonn-logo.png'

const props = defineProps<{
  background?: string
  subhead?: string
}>()

const style = computed(() => {
  if (!props.background)
    return {}

  return {
    backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.18) 100%), url("${props.background}")`,
  }
})
</script>

<template>
  <div class="slidev-layout bonn-layout bonn-cover-layout" :style="style">
    <div class="bonn-cover-panel">
      <p v-if="subhead" class="bonn-cover-subhead">{{ subhead }}</p>
      <slot />
    </div>
    <img class="bonn-logo" :src="logoUrl" alt="University of Bonn" />
  </div>
</template>
