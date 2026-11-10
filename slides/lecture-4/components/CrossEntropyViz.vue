<script setup lang="ts">
// Cross-entropy as a picture: predicted class probabilities (bars) and the loss −log p (curve)
// share the same vertical p-axis. Only the TRUE class's bar is read off on the curve.
// Presets switch the prediction; clicking a class name changes the true class.
import { computed, onUnmounted, ref } from 'vue'

const CLASSES = [
  { name: 'urban', color: '#d62728' },
  { name: 'water', color: '#1f77b4' },
  { name: 'vegetation', color: '#2ca02c' },
]
const softmax = (z: number[]) => {
  const e = z.map(v => Math.exp(v))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map(v => v / s)
}
const PRESETS = [
  { label: 'A: confident, wrong', p: softmax([Math.log(4), Math.log(1.5), Math.log(3 / 7)]) },
  { label: 'unsure', p: [1 / 3, 1 / 3, 1 / 3] },
  { label: 'B: confident, right', p: [0.05, 0.05, 0.9] },
]
const preset = ref(0)
const trueK = ref(2)
const p = ref<number[]>([...PRESETS[0].p])

let raf = 0
function choose(i: number) {
  preset.value = i
  const from = [...p.value]
  const to = PRESETS[i].p
  const t0 = performance.now()
  cancelAnimationFrame(raf)
  const tick = () => {
    const u = Math.min(1, (performance.now() - t0) / 600)
    const e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2
    p.value = from.map((f, k) => f + (to[k] - f) * e)
    if (u < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}
onUnmounted(() => cancelAnimationFrame(raf))

// geometry: shared p-axis on the left, bars, then the loss curve (loss horizontal, p vertical)
const W = 440
const H = 230
const Y0 = 24
const Y1 = 190
const sy = (v: number) => Y1 - v * (Y1 - Y0)
const BX = 40 // bars start
const BW = 46
const BG = 14
const CX0 = 250 // curve x origin (loss = 0)
const CX1 = 430
const LMAX = 4
const sx = (l: number) => CX0 + Math.min(l, LMAX) / LMAX * (CX1 - CX0)
const curve = (() => {
  let d = ''
  for (let i = 0; i <= 200; i++) {
    const v = Math.exp(-LMAX) + (1 - Math.exp(-LMAX)) * i / 200
    d += `${i ? 'L' : 'M'}${sx(-Math.log(v)).toFixed(1)},${sy(v).toFixed(1)}`
  }
  return d
})()
const barX = (k: number) => BX + k * (BW + BG)
const pt = computed(() => p.value[trueK.value])
const loss = computed(() => -Math.log(pt.value))
</script>

<template>
  <div class="cev select-none" @click.stop @dblclick.stop>
    <svg :viewBox="`0 0 ${W} ${H}`" class="plot">
      <!-- shared p axis -->
      <line :x1="BX - 10" :x2="BX - 10" :y1="Y0" :y2="Y1" class="ax" />
      <g v-for="v in [0, 0.5, 1]" :key="v">
        <line :x1="BX - 14" :x2="BX - 10" :y1="sy(v)" :y2="sy(v)" class="ax" />
        <text :x="BX - 17" :y="sy(v) + 4" text-anchor="end" style="font-size: 11px" class="tk">{{ v }}</text>
        <line :x1="BX - 10" :x2="CX1" :y1="sy(v)" :y2="sy(v)" class="grid" />
      </g>
      <text :x="BX - 10" :y="Y0 - 10" text-anchor="middle" style="font-size: 12px" class="ttl">p</text>

      <!-- bars: prediction, one-hot target frame on the true class -->
      <g v-for="(c, k) in CLASSES" :key="c.name">
        <rect :x="barX(k)" :y="sy(p[k])" :width="BW" :height="Y1 - sy(p[k])" :fill="c.color" :style="{ fillOpacity: k === trueK ? 1 : 0.3 }" />
        <rect v-if="k === trueK" :x="barX(k) - 3" :y="sy(1)" :width="BW + 6" :height="Y1 - sy(1)" fill="none" stroke="#00457c" stroke-width="2" stroke-dasharray="5 4" />
        <text :x="barX(k) + BW / 2" :y="sy(p[k]) - 5" text-anchor="middle" style="font-size: 11px" :fill="c.color" :font-weight="k === trueK ? 700 : 400">{{ p[k].toFixed(2) }}</text>
        <text :x="barX(k) + BW / 2" :y="Y1 + 16" text-anchor="middle" style="font-size: 11.5px; cursor: pointer" :fill="k === trueK ? '#00457c' : '#777'" :font-weight="k === trueK ? 700 : 400" @click.stop="trueK = k">{{ c.name }}</text>
        <text :x="barX(k) + BW / 2" :y="Y1 + 30" text-anchor="middle" style="font-size: 10.5px" :fill="k === trueK ? '#00457c' : '#aaa'">y = {{ k === trueK ? 1 : 0 }}</text>
      </g>

      <!-- loss curve, rotated: loss to the right, p up -->
      <line :x1="CX0" :x2="CX1" :y1="Y1" :y2="Y1" class="ax" />
      <line :x1="CX0" :x2="CX0" :y1="Y0" :y2="Y1" class="ax" />
      <g v-for="l in [0, 2, 4]" :key="`l${l}`">
        <line :x1="sx(l)" :x2="sx(l)" :y1="Y1" :y2="Y1 + 4" class="ax" />
        <text :x="sx(l)" :y="Y1 + 16" text-anchor="middle" style="font-size: 11px" class="tk">{{ l }}</text>
      </g>
      <text :x="(CX0 + CX1) / 2" :y="Y1 + 32" text-anchor="middle" style="font-size: 12px" class="ttl">loss = −log p<tspan baseline-shift="sub" style="font-size: 9px">true</tspan></text>
      <path :d="curve" fill="none" stroke="#ff7900" stroke-width="2.6" />

      <!-- read-off: true-class bar → curve → loss -->
      <line :x1="barX(trueK) + BW" :x2="sx(loss)" :y1="sy(pt)" :y2="sy(pt)" stroke="#00457c" stroke-width="1.6" stroke-dasharray="4 3" />
      <line :x1="sx(loss)" :x2="sx(loss)" :y1="sy(pt)" :y2="Y1" stroke="#00457c" stroke-width="1.6" stroke-dasharray="4 3" />
      <circle :cx="sx(loss)" :cy="sy(pt)" r="5" fill="#00457c" stroke="#fff" stroke-width="1.5" />
      <text :x="Math.min(sx(loss) + 8, CX1 - 70)" :y="sy(pt) - 8" style="font-size: 13px; font-weight: 700" fill="#00457c">loss = {{ loss.toFixed(2) }}</text>
    </svg>

    <div class="btns">
      <button v-for="(pr, i) in PRESETS" :key="pr.label" :class="{ on: preset === i }" @click.stop="choose(i)">{{ pr.label }}</button>
    </div>
  </div>
</template>

<style scoped>
.cev { display: flex; flex-direction: column; align-items: center; gap: .3rem; }
.plot { width: 100%; height: auto; overflow: visible; }
.ax { stroke: #8b8f8d; stroke-width: 1; }
.grid { stroke: #eceef0; stroke-width: 1; }
.tk { fill: #5f625f; }
.ttl { fill: #00457c; font-weight: 600; }
.btns { display: flex; gap: .35rem; }
.btns button { font: 600 11px "Exo 2", sans-serif; padding: .2rem .55rem; border-radius: 5px; border: 1px solid #00457c; background: transparent; color: #00457c; }
.btns button.on { background: #00457c; color: #fff; }
</style>
