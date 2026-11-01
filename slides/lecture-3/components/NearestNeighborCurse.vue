<script setup lang="ts">
// Curse of dimensionality for a nearest-neighbour classifier.
// Two classes differ only in the first two dimensions; every extra dimension is noise.
// Left: the informative 2-D view with each test point linked to its nearest training
// point (found in the full d-dimensional space). Right: distances from one test point
// to all training points (sorted) and the 1-NN test accuracy.
import { computed, ref } from 'vue'

const dims = [2, 5, 10, 20, 50, 100, 500]
const idx = ref(0)
const d = computed(() => dims[idx.value])
const DMAX = 500
const NTRAIN = 30
const NTEST = 40

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(11)
const gauss = () => {
  const u = Math.max(rnd(), 1e-9)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd())
}
function sample(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const cls = i % 2
    const x = Float64Array.from({ length: DMAX }, () => gauss() * 0.6)
    x[0] += cls ? 1.1 : -1.1
    x[1] += cls ? 0.5 : -0.5
    return { cls, x }
  })
}
const train = sample(NTRAIN)
const test = sample(NTEST)

function dist(a: Float64Array, b: Float64Array, dim: number) {
  let s = 0
  for (let k = 0; k < dim; k++) {
    const t = a[k] - b[k]
    s += t * t
  }
  return Math.sqrt(s)
}

const result = computed(() => {
  const dim = d.value
  let correct = 0
  const links = test.map((t) => {
    let best = 0
    let bd = Infinity
    train.forEach((r, j) => {
      const dd = dist(t.x, r.x, dim)
      if (dd < bd) { bd = dd; best = j }
    })
    if (train[best].cls === t.cls) correct++
    return { t, n: train[best], ok: train[best].cls === t.cls }
  })
  const q = test[0]
  const bars = train.map(r => ({ cls: r.cls, v: dist(q.x, r.x, dim) })).sort((a, b) => a.v - b.v)
  const vmax = bars[bars.length - 1].v
  return { acc: correct / NTEST, links, bars: bars.map(b => ({ ...b, h: b.v / vmax })), ratio: bars[0].v / vmax }
})

const S = 260
const X = (v: number) => S / 2 + v * 48
const Y = (v: number) => S / 2 - v * 48
const color = (c: number) => (c ? '#b02b37' : '#2e8b3a')
</script>

<template>
  <div class="nn-demo" @pointerdown.stop @keydown.stop>
    <div class="flex items-center gap-3 text-[.72rem]">
      <span class="font-semibold text-[#00457c] w-48">dimensions d = {{ d }} <span class="font-normal text-gray-500">({{ d - 2 }} noise)</span></span>
      <input v-model.number="idx" type="range" min="0" :max="dims.length - 1" step="1" class="flex-1">
    </div>
    <div class="flex gap-4 mt-1">
      <div class="w-[48%]">
        <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 100%"><svg :viewBox="`0 0 ${S} ${S}`" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block">
          <rect x="0" y="0" :width="S" :height="S" fill="#fafbfc" stroke="#d7d9d8" />
          <line v-for="(l, i) in result.links" :key="`l${i}`" :x1="X(l.t.x[0])" :y1="Y(l.t.x[1])" :x2="X(l.n.x[0])" :y2="Y(l.n.x[1])"
            :stroke="l.ok ? '#9aa3aa' : '#ff7900'" :stroke-width="l.ok ? 1 : 1.8" />
          <circle v-for="(r, i) in train" :key="`r${i}`" :cx="X(r.x[0])" :cy="Y(r.x[1])" r="5" :fill="color(r.cls)" />
          <circle v-for="(t, i) in test" :key="`t${i}`" :cx="X(t.x[0])" :cy="Y(t.x[1])" r="4" fill="#fff" :stroke="color(t.cls)" stroke-width="2" />
          <text x="6" :y="S - 6" style="font-size: 10px" fill="#777">informative dims 1 &amp; 2</text>
        </svg></div>
      </div>
      <div class="flex-1 text-[.68rem] text-gray-700">
        <div>distances from one test point to all training points (sorted)</div>
        <div class="svg-fit mt-1" style="position: relative; width: 100%; height: 0; padding-top: 55%"><svg viewBox="0 0 300 165" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block">
          <line x1="0" y1="150" x2="300" y2="150" stroke="#00457c" />
          <rect v-for="(b, i) in result.bars" :key="i" :x="i * 10 + 1" :y="150 - b.h * 140" width="8" :height="b.h * 140" :fill="color(b.cls)" style="transition: all .3s" />
          <text x="0" y="163" style="font-size: 9px" fill="#777">nearest</text>
          <text x="300" y="163" text-anchor="end" style="font-size: 9px" fill="#777">farthest</text>
        </svg></div>
        <div class="mt-2">nearest / farthest distance: <strong>{{ result.ratio.toFixed(2) }}</strong></div>
        <div class="mt-1">1-nearest-neighbour test accuracy:
          <strong class="text-[.85rem]" :class="result.acc > 0.8 ? 'text-[#2e8b3a]' : 'text-[#b02b37]'">{{ Math.round(result.acc * 100) }}&#8239;%</strong>
        </div>
        <div class="mt-2 flex gap-3 items-center text-[.62rem]">
          <span><span class="inline-block w-2.5 h-2.5 rounded-full bg-[#2e8b3a] align-middle" /> / <span class="inline-block w-2.5 h-2.5 rounded-full bg-[#b02b37] align-middle" /> training</span>
          <span><span class="inline-block w-2.5 h-2.5 rounded-full border-2 border-gray-500 align-middle" /> test</span>
          <span><span class="inline-block w-4 h-0.5 bg-[#ff7900] align-middle" /> wrong neighbour</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nn-demo input[type='range'] { accent-color: #00457c; }
</style>
