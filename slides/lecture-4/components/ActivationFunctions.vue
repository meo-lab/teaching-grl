<script setup lang="ts">
// Common activation functions on one plot. Chips toggle each curve.
import { computed, ref } from 'vue'

const SQ = Math.sqrt(2 / Math.PI)
const FNS = [
  { key: 'sigmoid', label: 'sigmoid', color: '#2ca02c', f: (z: number) => 1 / (1 + Math.exp(-z)) },
  { key: 'tanh', label: 'tanh', color: '#1f77b4', f: (z: number) => Math.tanh(z) },
  { key: 'relu', label: 'ReLU', color: '#ff7900', f: (z: number) => Math.max(0, z) },
  { key: 'gelu', label: 'GELU', color: '#7b3fa0', f: (z: number) => 0.5 * z * (1 + Math.tanh(SQ * (z + 0.044715 * z ** 3))) },
  { key: 'leaky', label: 'Leaky ReLU', color: '#d62728', f: (z: number) => (z > 0 ? z : 0.1 * z) },
  { key: 'sine', label: 'sine', color: '#8c564b', f: (z: number) => Math.sin(z) },
]
const on = ref<Record<string, boolean>>({ sigmoid: true, tanh: true, relu: true, gelu: true, leaky: false, sine: false })

const W = 440
const H = 270
const X0 = 36
const X1 = 430
const Y0 = 14
const Y1 = 240
const ZMIN = -4
const ZMAX = 4
const yRange = computed(() => [-1.3, 3])
const sx = (z: number) => X0 + (z - ZMIN) / (ZMAX - ZMIN) * (X1 - X0)
const sy = (v: number) => {
  const [a, b] = yRange.value
  return Y1 - (v - a) / (b - a) * (Y1 - Y0)
}
const ticksY = [-1, 0, 1, 2, 3]

function path(f: (z: number) => number) {
  const g = f
  const [a, b] = yRange.value
  let d = ''
  for (let i = 0; i <= 320; i++) {
    const z = ZMIN + (ZMAX - ZMIN) * i / 320
    const v = Math.min(b + 2, Math.max(a - 2, g(z))) // drawn beyond the frame, clipped by the SVG
    d += `${i ? 'L' : 'M'}${sx(z).toFixed(1)},${sy(v).toFixed(1)}`
  }
  return d
}
</script>

<template>
  <div class="actf select-none" @click.stop @dblclick.stop>
    <div class="chips">
      <button
        v-for="fn in FNS" :key="fn.key" :class="{ on: on[fn.key] }"
        :style="on[fn.key] ? { background: fn.color, borderColor: fn.color, color: '#fff' } : { borderColor: fn.color, color: fn.color }"
        @click.stop="on[fn.key] = !on[fn.key]"
      >
        {{ fn.label }}
      </button>
    </div>
    <svg :viewBox="`0 0 ${W} ${H}`" class="plot" role="img" aria-label="Activation functions sigmoid, tanh, ReLU, GELU, Leaky ReLU and sine plotted over z from -4 to 4">
      <g v-for="v in ticksY" :key="`t${v}`">
        <line :x1="X0" :x2="X1" :y1="sy(v)" :y2="sy(v)" :stroke="v === 0 ? '#8b8f8d' : '#eceef0'" stroke-width="1" />
        <text :x="X0 - 5" :y="sy(v) + 4" text-anchor="end" style="font-size: 11px" fill="#5f625f">{{ v }}</text>
      </g>
      <line :x1="sx(0)" :x2="sx(0)" :y1="Y0" :y2="Y1" stroke="#8b8f8d" stroke-width="1" />
      <g v-for="z in [-4, -2, 2, 4]" :key="`z${z}`">
        <text :x="sx(z)" :y="Y1 + 15" text-anchor="middle" style="font-size: 11px" fill="#5f625f">{{ z }}</text>
      </g>
      <text :x="X1" :y="Y1 + 28" text-anchor="end" style="font-size: 13px; font-family: serif; font-style: italic" fill="#5f625f">z</text>
      <defs><clipPath id="actf-clip"><rect :x="X0" :y="Y0" :width="X1 - X0" :height="Y1 - Y0" /></clipPath></defs>
      <template v-for="fn in FNS" :key="fn.key">
        <path v-if="on[fn.key]" clip-path="url(#actf-clip)" :d="path(fn.f)" fill="none" :stroke="fn.color" stroke-width="3" stroke-linejoin="round" />
      </template>
    </svg>
  </div>
</template>

<style scoped>
.actf { display: flex; flex-direction: column; gap: .3rem; }
.chips { display: flex; flex-wrap: wrap; gap: .3rem; justify-content: center; }
.chips button { font: 600 11px "Exo 2", sans-serif; padding: .12rem .5rem; border-radius: 5px; border: 1.5px solid; background: #fff; }
.plot { width: 100%; height: auto; }
</style>
