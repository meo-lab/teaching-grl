<script setup lang="ts">
// Biological reading of the logistic function: a neuron's input strength z sets how OFTEN it spikes.
// Top: voltage trace with all-or-none spikes; their number per time window is RMAX · σ(z).
// Bottom: the sigmoid as firing rate (relative to the maximum rate), with the current z marked.
import { computed, ref } from 'vue'

const z = ref(0)
const RMAX = 14 // spikes per window at saturation
const sig = (v: number) => 1 / (1 + Math.exp(-v))
const rate = computed(() => sig(z.value))
const nSpikes = computed(() => Math.round(RMAX * rate.value))

const W = 440
// spike panel
const TX0 = 40
const TX1 = 425
const VB = 92 // resting potential (y)
const VT = 18 // spike peak (y)
const trace = computed(() => {
  const n = nSpikes.value
  let d = `M${TX0},${VB}`
  for (let k = 0; k < n; k++) {
    const t = TX0 + (k + 0.5) / n * (TX1 - TX0)
    d += ` L${(t - 4).toFixed(1)},${VB} L${(t - 1).toFixed(1)},${VT} L${(t + 2).toFixed(1)},${VB + 8} L${(t + 6).toFixed(1)},${VB}`
  }
  return `${d} L${TX1},${VB}`
})

// sigmoid panel
const X0 = 40
const X1 = 425
const Y0 = 150
const Y1 = 290
const ZMAX = 6
const sx = (v: number) => X0 + (v + ZMAX) / (2 * ZMAX) * (X1 - X0)
const sy = (p: number) => Y1 - p * (Y1 - Y0)
const sigPath = (() => {
  let d = ''
  for (let i = 0; i <= 200; i++) {
    const v = -ZMAX + 2 * ZMAX * i / 200
    d += `${i ? 'L' : 'M'}${sx(v).toFixed(1)},${sy(sig(v)).toFixed(1)}`
  }
  return d
})()
</script>

<template>
  <div class="spk select-none" @click.stop @dblclick.stop>
    <svg :viewBox="`0 0 ${W} 318`" class="plot" role="img" aria-label="Top: a neuron's voltage over time with spikes; the stronger the input, the more spikes per time window. Bottom: the logistic function as firing rate over input strength; it saturates at 0 for weak input and at 1 for strong input">
      <!-- spike train -->
      <text x="6" y="12" style="font-size: 12px; font-weight: 600" fill="#00457c">voltage</text>
      <line :x1="TX0" :x2="TX1" :y1="VB + 14" :y2="VB + 14" stroke="#8b8f8d" stroke-width="1" />
      <text :x="TX1" :y="VB + 28" text-anchor="end" style="font-size: 11px" fill="#5f625f">time →</text>
      <path :d="trace" fill="none" stroke="#5f625f" stroke-width="1.6" stroke-linejoin="round" />
      <text :x="(TX0 + TX1) / 2" :y="VB + 28" text-anchor="middle" style="font-size: 12px; font-weight: 700" fill="#00457c">{{ nSpikes }} spikes</text>

      <!-- sigmoid as firing rate -->
      <line :x1="X0" :x2="X1" :y1="sy(0)" :y2="sy(0)" stroke="#8b8f8d" stroke-width="1.2" />
      <line :x1="X0" :x2="X0" :y1="Y0 - 8" :y2="Y1" stroke="#8b8f8d" stroke-width="1.2" />
      <line :x1="X0" :x2="X1" :y1="sy(1)" :y2="sy(1)" stroke="#e3e6e8" stroke-width="1" stroke-dasharray="4 4" />
      <text :x="X0 - 6" :y="sy(1) + 4" text-anchor="end" style="font-size: 11px" fill="#5f625f">1</text>
      <text :x="X0 - 6" :y="sy(0) + 4" text-anchor="end" style="font-size: 11px" fill="#5f625f">0</text>
      <text x="6" :y="Y0 - 14" style="font-size: 12px; font-weight: 600" fill="#00457c">firing rate σ(z)</text>
      <text :x="X1" :y="Y1 + 18" text-anchor="end" style="font-size: 12px" fill="#5f625f">input z →</text>
      <path :d="sigPath" fill="none" stroke="#2ca02c" stroke-width="3" />

      <text :x="X0 + 4" :y="Y1 + 18" style="font-size: 11px" fill="#5f625f">weak input: (almost) silent → 0</text>
      <text :x="X1" :y="sy(1) - 6" text-anchor="end" style="font-size: 11px" fill="#5f625f">strong input: max. rate → 1</text>

      <!-- current input -->
      <line :x1="sx(z)" :x2="sx(z)" :y1="sy(rate)" :y2="Y1" stroke="#00457c" stroke-width="1.4" stroke-dasharray="4 3" />
      <circle :cx="sx(z)" :cy="sy(rate)" r="6" fill="#00457c" stroke="#fff" stroke-width="1.5" />
    </svg>
    <label class="zctl">
      <span>input z = {{ z.toFixed(1) }}</span>
      <input v-model.number="z" class="stp" type="range" :min="-ZMAX" :max="ZMAX" step="0.1" @pointerdown.stop @keydown.stop>
    </label>
  </div>
</template>

<style scoped>
.spk { display: flex; flex-direction: column; align-items: center; gap: .2rem; }
.plot { width: 100%; height: auto; }
.zctl { display: flex; align-items: center; gap: .6rem; font: 12px "Exo 2", sans-serif; color: #00457c; width: 85%; }
.zctl span { white-space: nowrap; min-width: 6.5em; }
.spk .zctl input.stp { flex: 1; accent-color: #00457c; appearance: auto !important; -webkit-appearance: auto !important; border: none !important; background: transparent !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; height: 18px !important; min-height: 0 !important; }
</style>
