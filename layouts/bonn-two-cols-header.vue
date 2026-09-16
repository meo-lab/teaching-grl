<script setup lang="ts">
import { computed } from 'vue'
import logoUrl from '../assets/UNI_Bonn_Logo_Standard.svg'
import BonnSectionNav from './BonnSectionNav.vue'

const props = defineProps<{
  columns?: string
}>()

const style = computed(() => ({
  '--bonn-two-cols-template': props.columns || 'minmax(0, 1fr) minmax(0, 1fr)',
}))
</script>

<template>
  <div class="slidev-layout bonn-layout bonn-content-layout bonn-two-cols-header-layout" :style="style">
    <main class="bonn-content bonn-two-cols-header-content">
      <header class="bonn-two-cols-header">
        <slot />
      </header>
      <div class="bonn-two-cols">
        <section class="bonn-two-cols-column">
          <slot name="left" />
        </section>
        <section class="bonn-two-cols-column">
          <slot name="right" />
        </section>
      </div>
    </main>
    <BonnSectionNav />
    <img class="bonn-logo" :src="logoUrl" alt="University of Bonn" />
  </div>
</template>

<style>
.bonn-two-cols-header-content {
  display: flex;
  flex-direction: column;
}

.bonn-two-cols-header {
  flex: 0 0 auto;
}

.bonn-two-cols-header > :last-child {
  margin-bottom: 0;
}

.bonn-two-cols {
  display: grid;
  grid-template-columns: var(--bonn-two-cols-template);
  gap: 1.5rem;
  min-height: 0;
  margin-top: .45rem;
}

.bonn-two-cols-column {
  min-width: 0;
}

.bonn-two-cols-column > :first-child {
  margin-top: 0;
}

.bonn-two-cols-column > :last-child {
  margin-bottom: 0;
}
</style>
