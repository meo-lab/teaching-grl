<script setup lang="ts">
// Interactive McCulloch–Pitts neuron (1943), drawn like the logistic regression graph (LogisticGraph).
// - click an input x_i to toggle 0 / 1
// - click a weight to cycle +1 (excitatory) → −1 (inhibitory) → 0 (no connection)
// - presets set weights and θ for logic gates
// The neuron fires (y = 1) if z = Σ w_i x_i − θ ≥ 0.
// act="sigmoid": same neuron as logistic regression, output p = σ(z) instead of the step.
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{ act?: 'step' | 'sigmoid' }>(), { act: 'step' })
const sig = computed(() => props.act === 'sigmoid')

const x = ref([1, 0, 1])
const w = ref([1, 1, 1])
const theta = ref(2)

const PRESETS = [
  { label: 'AND', w: [1, 1, 1], t: 3 },
  { label: 'OR', w: [1, 1, 1], t: 1 },
  { label: 'majority', w: [1, 1, 1], t: 2 },
]
const preset = computed(() => PRESETS.findIndex(p => p.t === theta.value && p.w.every((v, i) => v === w.value[i])))
function choose(i: number) {
  w.value = [...PRESETS[i].w]
  theta.value = PRESETS[i].t
}
const toggleX = (i: number) => { x.value[i] = 1 - x.value[i] }
const cycleW = (i: number) => { w.value[i] = w.value[i] === 1 ? -1 : w.value[i] === -1 ? 0 : 1 }

const sum = computed(() => w.value.reduce((a, wi, i) => a + wi * x.value[i], 0))
const z = computed(() => sum.value - theta.value)
const y = computed(() => (z.value >= 0 ? 1 : 0))
const p = computed(() => 1 / (1 + Math.exp(-z.value)))

const YS = [40, 100, 160]
const ZX = 270
const ZY = 125
const edgeColor = (i: number) => (w.value[i] === 1 ? '#00457c' : w.value[i] === -1 ? '#d62728' : '#c3c7cb')
const fmtW = (v: number) => (v === 1 ? '+1' : v === -1 ? '−1' : '0')
const it = 'font-family:serif;font-style:italic;line-height:1'
const lab = 'font-family:inherit;font-style:normal;line-height:1'
const halo = ';paint-order:stroke;stroke:white;stroke-width:4px'
</script>

<template>
  <div class="mpn select-none" @click.stop @dblclick.stop>
    <svg viewBox="0 0 440 250" class="mp-graph" role="img" aria-label="Interactive McCulloch-Pitts neuron: click the inputs x1 to x3 to toggle them between 0 and 1 and click the weights to switch between +1, -1 and 0; the neuron sums the weighted inputs minus the threshold theta and fires if the result is at least 0">
      <!-- edges: thickness/colour by weight, glow when the input is active -->
      <line
        v-for="(yy, i) in YS" :key="`e${i}`" x1="130" :y1="yy" :x2="ZX - 22" :y2="ZY"
        :style="{ stroke: edgeColor(i), strokeWidth: x[i] && w[i] ? 4.5 : 2, strokeDasharray: w[i] === 0 ? '4 4' : 'none', strokeOpacity: x[i] && w[i] ? 1 : 0.55 }"
      />
      <line x1="130" y1="220" :x2="ZX - 22" :y2="ZY" stroke="#9aa0a6" stroke-width="2.5" />

      <!-- clickable weights -->
      <g v-for="(yy, i) in YS" :key="`w${i}`" class="click" @click.stop="cycleW(i)">
        <rect :x="170" :y="yy + (ZY - yy) * 0.45 - 17" width="34" height="20" rx="5" fill="#fff" :stroke="edgeColor(i)" stroke-width="1.5" />
        <text :style="`font-size:13px;font-weight:700;${lab}`" x="187" :y="yy + (ZY - yy) * 0.45 - 2" text-anchor="middle" :fill="edgeColor(i)">{{ fmtW(w[i]) }}</text>
      </g>
      <text :style="`font-size:15px;${it}${halo}`" x="187" y="190" text-anchor="middle" fill="#5f6368">{{ sig ? 'b' : '−θ' }} = −{{ theta }}</text>

      <!-- clickable inputs -->
      <g v-for="(yy, i) in YS" :key="`x${i}`" class="click" @click.stop="toggleX(i)">
        <circle cx="110" :cy="yy" r="20" :fill="x[i] ? '#00457c' : '#e8f0f8'" stroke="#00457c" stroke-width="2.5" />
        <text :style="`font-size:17px;${it}`" x="110" :y="yy + 6" text-anchor="middle" :fill="x[i] ? '#fff' : '#00457c'">x<tspan baseline-shift="sub" style="font-size:11px">{{ i + 1 }}</tspan></text>
        <text :style="`font-size:15px;font-weight:700;${lab}`" x="78" :y="yy + 5" text-anchor="end" :fill="x[i] ? '#00457c' : '#9aa0a6'">{{ x[i] }}</text>
      </g>
      <circle cx="110" cy="220" r="20" fill="#f1f3f4" stroke="#9aa0a6" stroke-width="2.5" />
      <text style="font-size:18px;font-family:serif;line-height:1" x="110" y="226" text-anchor="middle" fill="#5f6368">1</text>

      <!-- weighted sum -->
      <circle :cx="ZX" :cy="ZY" r="22" fill="#fff1e5" stroke="#ff7900" stroke-width="2.5" />
      <text :style="`font-size:16px;font-weight:700;${lab}`" :x="ZX" :y="ZY + 6" text-anchor="middle" fill="#b35500">{{ z >= 0 ? z : `−${-z}` }}</text>
      <text :style="`font-size:11px;${lab}`" :x="ZX" :y="ZY + 42" text-anchor="middle" fill="#5f6368">z = {{ sum }} − {{ theta }}</text>

      <!-- step activation -->
      <line :x1="ZX + 22" :y1="ZY" x2="378" :y2="ZY" :stroke="!sig && y ? '#2ca02c' : '#00457c'" :stroke-width="!sig && y ? 4 : 2.5" />
      <rect x="312" :y="ZY - 16" width="34" height="32" rx="6" fill="#ffffff" stroke="#00457c" stroke-width="2" />
      <path v-if="sig" :d="`M316,${ZY + 10} C326,${ZY + 10} 324,${ZY - 10} 342,${ZY - 10}`" fill="none" stroke="#00457c" stroke-width="2" />
      <path v-else :d="`M316,${ZY + 10} H329 V${ZY - 10} H342`" fill="none" stroke="#00457c" stroke-width="2" />
      <text v-if="sig" :style="`font-size:14px;${it}${halo}`" x="329" :y="ZY - 24" text-anchor="middle" fill="#00457c">σ</text>
      <text v-else :style="`font-size:11px;${lab}${halo}`" x="329" :y="ZY - 24" text-anchor="middle" fill="#00457c">z ≥ 0 ?</text>

      <!-- binary output -->
      <template v-if="sig">
        <circle cx="400" :cy="ZY" r="22" fill="#e9f5e9" stroke="#2ca02c" stroke-width="2.5" />
        <circle cx="400" :cy="ZY" r="22" fill="#2ca02c" :style="{ fillOpacity: p }" />
        <text :style="`font-size:14px;font-weight:700;${lab}`" x="400" :y="ZY + 5" text-anchor="middle" :fill="p > 0.55 ? '#fff' : '#1e7a1e'">{{ p.toFixed(2) }}</text>
        <text :style="`font-size:11px;${lab}`" x="400" :y="ZY + 42" text-anchor="middle" fill="#1e7a1e">p = σ(z)</text>
      </template>
      <template v-else>
        <circle cx="400" :cy="ZY" r="22" :fill="y ? '#2ca02c' : '#e9f5e9'" stroke="#2ca02c" stroke-width="2.5" />
        <text :style="`font-size:18px;font-weight:700;${lab}`" x="400" :y="ZY + 7" text-anchor="middle" :fill="y ? '#fff' : '#1e7a1e'">{{ y }}</text>
        <text :style="`font-size:11px;${lab}`" x="400" :y="ZY + 42" text-anchor="middle" :fill="y ? '#1e7a1e' : '#5f6368'" :font-weight="y ? 700 : 400">{{ y ? 'fires' : 'silent' }}</text>
      </template>
    </svg>

    <div class="ctl">
      <button v-for="(p, i) in PRESETS" :key="p.label" :class="{ on: preset === i }" @click.stop="choose(i)">{{ p.label }}</button>
    </div>
  </div>
</template>

<style scoped>
.mpn { display: flex; flex-direction: column; align-items: center; gap: .3rem; height: 100%; }
.mp-graph { width: 100%; flex: 1; min-height: 0; }
.click { cursor: pointer; }
.ctl { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: .3rem; }
.ctl button { font: 600 11px "Exo 2", sans-serif; padding: .15rem .5rem; border-radius: 5px; border: 1px solid #00457c; background: transparent; color: #00457c; }
.ctl button.on { background: #00457c; color: #fff; }
</style>
