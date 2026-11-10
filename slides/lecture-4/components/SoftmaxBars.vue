<script setup lang="ts">
// Softmax: K class scores -> probabilities that sum to 1. Drag the score sliders.
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{ classes?: string[], init?: number[] }>(), {
  classes: () => ['water', 'forest', 'cropland', 'urban'],
  init: () => [0.5, 2.0, 1.0, -1.0],
})
const colors = ['#00457c', '#2eb82e', '#f2c300', '#b02b37', '#5ec8ec']
const z = ref<number[]>([...props.init])
const probs = computed(() => {
  const m = Math.max(...z.value)
  const e = z.value.map(v => Math.exp(v - m))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map(v => v / s)
})

const W = 420
const H = 210
const pad = { l: 34, r: 10, t: 16, b: 28 }
const n = computed(() => props.classes.length)
const bw = computed(() => (W - pad.l - pad.r) / n.value)
const sy = (p: number) => pad.t + (1 - p) * (H - pad.t - pad.b)
</script>

<template>
  <div class="smx select-none">
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto">
      <line v-for="v in [0, 0.5, 1]" :key="v" :x1="pad.l" :x2="W - pad.r" :y1="sy(v)" :y2="sy(v)" class="ax" />
      <text v-for="v in [0, 0.5, 1]" :key="`t${v}`" :x="pad.l - 6" :y="sy(v) + 3.5" class="tick" text-anchor="end">{{ v }}</text>
      <g v-for="(c, k) in classes" :key="c">
        <rect :x="pad.l + k * bw + bw * 0.18" :y="sy(probs[k])" :width="bw * 0.64" :height="sy(0) - sy(probs[k])" :fill="colors[k % colors.length]" rx="3" />
        <text :x="pad.l + (k + 0.5) * bw" :y="sy(probs[k]) - 4" class="val">{{ (probs[k] * 100).toFixed(0) }}%</text>
        <text :x="pad.l + (k + 0.5) * bw" :y="H - 8" class="cls">{{ c }}</text>
      </g>
    </svg>
    <div class="sliders">
      <label v-for="(c, k) in classes" :key="c">
        <span :style="{ color: colors[k % colors.length] }">z<sub>{{ c }}</sub> = {{ z[k].toFixed(1) }}</span>
        <input v-model.number="z[k]" type="range" min="-4" max="4" step="0.1" @pointerdown.stop @keydown.stop>
      </label>
    </div>
  </div>
</template>

<style scoped>
.smx .ax { stroke: #e2e5e6; }
.smx .tick { font: 9.5px "Exo 2", sans-serif; fill: #666; text-anchor: middle; }
.smx .val { font: 600 11px "Exo 2", sans-serif; fill: #222; text-anchor: middle; }
.smx .cls { font: 11px "Exo 2", sans-serif; fill: #444; text-anchor: middle; }
.sliders { display: grid; grid-template-columns: 1fr 1fr; gap: .1rem .8rem; font-size: .64rem; }
.sliders label { display: flex; align-items: center; gap: .35rem; justify-content: space-between; }
.sliders input { width: 100px; accent-color: #00457c; }
</style>
