<script setup lang="ts">
// Three logits -> (a) three independent sigmoids (one-vs-rest) vs. (b) one softmax.
// Starts at σ = 0.8 / 0.6 / 0.3 (the example from the previous slide).
import { computed, ref } from 'vue'

const CLASSES = [
  { name: 'urban', sub: 'urb', color: '#d62728', light: 'rgba(214,39,40,0.18)' },
  { name: 'water', sub: 'wat', color: '#1f77b4', light: 'rgba(31,119,180,0.18)' },
  { name: 'vegetation', sub: 'veg', color: '#2ca02c', light: 'rgba(44,160,44,0.18)' },
]
const INIT = [Math.log(0.8 / 0.2), Math.log(0.6 / 0.4), Math.log(0.3 / 0.7)]
const z = ref<number[]>([...INIT])

const sig = (v: number) => 1 / (1 + Math.exp(-v))
const sigs = computed(() => z.value.map(sig))
const soft = computed(() => {
  const m = Math.max(...z.value)
  const e = z.value.map(v => Math.exp(v - m))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map(v => v / s)
})
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0)

const W = 430
const H = 150
const pad = { l: 30, r: 8, t: 16, b: 22 }
const gw = (W - pad.l - pad.r) / 3
const sy = (p: number) => pad.t + (1 - p) * (H - pad.t - pad.b)
</script>

<template>
  <div class="svs select-none" @click.stop @dblclick.stop>
    <svg :viewBox="`0 0 ${W} ${H}`" class="plot">
      <g v-for="v in [0, 0.5, 1]" :key="v">
        <line :x1="pad.l" :x2="W - pad.r" :y1="sy(v)" :y2="sy(v)" class="ax" :class="{ base: v === 0 }" />
        <text :x="pad.l - 6" :y="sy(v) + 4" text-anchor="end" style="font-size: 11px" class="tk">{{ v }}</text>
      </g>
      <g v-for="(c, k) in CLASSES" :key="c.name">
        <!-- sigmoid: light, dashed outline -->
        <rect :x="pad.l + k * gw + gw * 0.14" :y="sy(sigs[k])" :width="gw * 0.32" :height="sy(0) - sy(sigs[k])" :fill="c.light" :stroke="c.color" stroke-width="1.5" stroke-dasharray="4 3" />
        <text :x="pad.l + k * gw + gw * 0.30" :y="sy(sigs[k]) - 5" text-anchor="middle" style="font-size: 11px" :fill="c.color">{{ sigs[k].toFixed(2) }}</text>
        <!-- softmax: solid -->
        <rect :x="pad.l + k * gw + gw * 0.54" :y="sy(soft[k])" :width="gw * 0.32" :height="sy(0) - sy(soft[k])" :fill="c.color" />
        <text :x="pad.l + k * gw + gw * 0.70" :y="sy(soft[k]) - 5" text-anchor="middle" style="font-size: 11px; font-weight: 700" :fill="c.color">{{ soft[k].toFixed(2) }}</text>
        <text :x="pad.l + (k + 0.5) * gw" :y="H - 6" text-anchor="middle" style="font-size: 12px" class="cls">{{ c.name }}</text>
      </g>
    </svg>

    <div class="sums">
      <span class="s-sig">σ each: Σ = <b :class="{ bad: Math.abs(sum(sigs) - 1) > 0.005 }">{{ sum(sigs).toFixed(2) }}</b></span>
      <span class="s-soft">softmax: Σ = <b>{{ sum(soft).toFixed(2) }}</b></span>
    </div>

    <div class="sliders">
      <label v-for="(c, k) in CLASSES" :key="c.name">
        <span :style="{ color: c.color }">z<sub>{{ c.sub }}</sub> = {{ z[k].toFixed(1) }}</span>
        <input v-model.number="z[k]" type="range" min="-4" max="4" step="0.1" @pointerdown.stop @keydown.stop>
      </label>
    </div>
  </div>
</template>

<style scoped>
.svs { display: flex; flex-direction: column; gap: .25rem; }
.plot { width: 100%; height: auto; }
.ax { stroke: #e3e6e8; stroke-width: 1; }
.ax.base { stroke: #8b8f8d; }
.tk { fill: #5f625f; }
.cls { fill: #444; }
.sums { display: flex; justify-content: center; gap: 1.6rem; font: 12px "Exo 2", sans-serif; color: #555; }
.sums .s-sig b.bad { color: #d62728; }
.sums .s-soft b { color: #00457c; }
.sliders { display: grid; grid-template-columns: repeat(3, 1fr); gap: .2rem .8rem; font: 11.5px "Exo 2", sans-serif; }
.sliders label { display: flex; flex-direction: column; align-items: center; gap: .1rem; }
.svs .sliders input[type=range] { width: 100%; accent-color: #00457c; appearance: auto !important; -webkit-appearance: auto !important; border: none !important; background: transparent !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; height: 18px !important; min-height: 0 !important; }
</style>
