<script setup lang="ts">
// The sigmoid maps any score z = w·x + b to a probability in (0, 1). Drag the slider.
import { computed, ref } from 'vue'

const z = ref(1.5)
const W = 420
const H = 230
const pad = { l: 40, r: 14, t: 12, b: 36 }
const ZR: [number, number] = [-7, 7]
const sx = (v: number) => pad.l + (v - ZR[0]) / (ZR[1] - ZR[0]) * (W - pad.l - pad.r)
const sy = (p: number) => pad.t + (1 - p) * (H - pad.t - pad.b)
const sig = (v: number) => 1 / (1 + Math.exp(-v))
const path = Array.from({ length: 141 }, (_, i) => {
  const v = ZR[0] + i / 140 * (ZR[1] - ZR[0])
  return `${i ? 'L' : 'M'}${sx(v)},${sy(sig(v))}`
}).join(' ')
const p = computed(() => sig(z.value))
</script>

<template>
  <div class="sgc select-none">
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto">
      <rect :x="sx(0)" :y="pad.t" :width="sx(ZR[1]) - sx(0)" :height="H - pad.t - pad.b" class="r1" />
      <rect :x="pad.l" :y="pad.t" :width="sx(0) - pad.l" :height="H - pad.t - pad.b" class="r0" />
      <text :x="sx(3.5)" :y="pad.t + 14" class="lab1">predict class 1</text>
      <text :x="sx(-3.5)" :y="pad.t + 14" class="lab0">predict class 0</text>
      <line v-for="v in [0, 0.5, 1]" :key="v" :x1="pad.l" :x2="W - pad.r" :y1="sy(v)" :y2="sy(v)" :class="v === 0.5 ? 'half' : 'ax'" />
      <line :x1="sx(0)" :x2="sx(0)" :y1="pad.t" :y2="H - pad.b" class="half" />
      <path :d="path" class="curve" />
      <line :x1="sx(z)" :x2="sx(z)" :y1="H - pad.b" :y2="sy(p)" class="guide" />
      <line :x1="pad.l" :x2="sx(z)" :y1="sy(p)" :y2="sy(p)" class="guide" />
      <circle :cx="sx(z)" :cy="sy(p)" r="5.5" class="pt" />
      <text v-for="v in [-6, -3, 0, 3, 6]" :key="`z${v}`" :x="sx(v)" :y="H - pad.b + 14" class="tick">{{ v }}</text>
      <text v-for="v in [0, 0.5, 1]" :key="`p${v}`" :x="pad.l - 6" :y="sy(v) + 3.5" class="tick" text-anchor="end">{{ v }}</text>
      <text :x="(W + pad.l) / 2" :y="H - 4" class="lab">score z = wᵀx + b</text>
      <text :transform="`translate(12,${(H - pad.b + pad.t) / 2}) rotate(-90)`" class="lab">p = σ(z)</text>
    </svg>
    <div class="ctrl">
      <label>z <input v-model.number="z" type="range" min="-7" max="7" step="0.1" @pointerdown.stop @keydown.stop></label>
      <span>z = {{ z.toFixed(1) }} → <b>p = {{ p.toFixed(3) }}</b></span>
    </div>
  </div>
</template>

<style scoped>
.sgc .r1 { fill: #ff7900; opacity: .08; }
.sgc .r0 { fill: #00457c; opacity: .07; }
.sgc .lab1 { font: 600 10.5px "Exo 2", sans-serif; fill: #c45f00; text-anchor: middle; }
.sgc .lab0 { font: 600 10.5px "Exo 2", sans-serif; fill: #00457c; text-anchor: middle; }
.sgc .ax { stroke: #c9ced1; }
.sgc .half { stroke: #9aa1a6; stroke-dasharray: 4 3; }
.sgc .curve { fill: none; stroke: #00457c; stroke-width: 2.6; }
.sgc .guide { stroke: #ff7900; stroke-dasharray: 3 3; }
.sgc .pt { fill: #ff7900; stroke: #fff; stroke-width: 1.5; }
.sgc .tick { font: 9.5px "Exo 2", sans-serif; fill: #666; text-anchor: middle; }
.sgc .lab { font: 11px "Exo 2", sans-serif; fill: #444; text-anchor: middle; }
.ctrl { display: flex; gap: .8rem; justify-content: center; align-items: center; font-size: .7rem; }
.ctrl input { width: 180px; accent-color: #00457c; }
</style>
