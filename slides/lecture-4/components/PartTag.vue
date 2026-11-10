<script setup lang="ts">
// Small tag in the top-right corner: which part of the Model → Loss → Fitting frame a slide belongs to.
import { computed } from 'vue'

const props = defineProps<{ part: 'model' | 'loss' | 'fitting' | 'data' }>()
const cfg = computed(() => ({
  model: { label: 'Model', color: '#00457c', bg: '#e8f0f7' },
  loss: { label: 'Loss', color: '#c45f00', bg: '#fff1e5' },
  fitting: { label: 'Fitting', color: '#1f7a1f', bg: '#e9f7e9' },
  data: { label: 'Real data', color: '#5f625f', bg: '#f0f1f1' },
}[props.part]))
const parts = ['model', 'loss', 'fitting'] as const
</script>

<template>
  <div class="part-tag">
    <template v-if="part !== 'data'">
      <span
        v-for="p in parts" :key="p" class="chip"
        :class="{ on: p === part }"
        :style="p === part ? { color: cfg.color, background: cfg.bg, borderColor: cfg.color } : {}"
      >{{ { model: 'Model', loss: 'Loss', fitting: 'Fitting' }[p] }}</span>
    </template>
    <span v-else class="chip on" :style="{ color: cfg.color, background: cfg.bg, borderColor: cfg.color }">{{ cfg.label }}</span>
  </div>
</template>

<style scoped>
.part-tag { position: absolute; top: 30px; right: 44px; display: flex; gap: 4px; z-index: 5; pointer-events: none; }
.chip { font: 600 9px "Exo 2", sans-serif; letter-spacing: .04em; text-transform: uppercase; color: #b4b8ba; border: 1px solid #d7d9d8; border-radius: 10px; padding: 2px 8px; }
.chip.on { font-weight: 700; }
</style>
