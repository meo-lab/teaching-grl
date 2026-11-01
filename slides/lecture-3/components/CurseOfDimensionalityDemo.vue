<script setup lang="ts">
// Distance concentration: sample N random points in the unit hypercube [0,1]^d
// and look at the distribution of distances from each point to all others.
// As d grows, the nearest and the farthest neighbour become almost equally far.
import { computed, ref } from 'vue'

const dims = [1, 2, 3, 5, 10, 20, 50, 100, 500, 1000]
const idx = ref(2)
const d = computed(() => dims[idx.value])
const N = 150

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const stats = computed(() => {
  const dim = d.value
  const rnd = mulberry32(42)
  const pts = Array.from({ length: N }, () => Float64Array.from({ length: dim }, () => rnd()))
  const dist: number[] = []
  let contrast = 0
  for (let i = 0; i < N; i++) {
    let mn = Infinity
    let mx = 0
    for (let j = 0; j < N; j++) {
      if (i === j)
        continue
      let s = 0
      const a = pts[i]
      const b = pts[j]
      for (let k = 0; k < dim; k++) {
        const t = a[k] - b[k]
        s += t * t
      }
      const r = Math.sqrt(s)
      if (j > i)
        dist.push(r)
      if (r < mn) mn = r
      if (r > mx) mx = r
    }
    contrast += (mx - mn) / mn
  }
  contrast /= N
  // normalise by the largest distance in this sample so all histograms share 0..1
  const dmax = Math.max(...dist)
  const bins = new Array(30).fill(0)
  for (const r of dist) bins[Math.min(29, Math.floor((r / dmax) * 30))]++
  const peak = Math.max(...bins)
  return { bins: bins.map(b => b / peak), contrast }
})

const W = 440
const H = 200
const pad = { l: 36, r: 12, t: 12, b: 34 }
const bw = (W - pad.l - pad.r) / 30
</script>

<template>
  <div class="curse-demo" @pointerdown.stop @keydown.stop>
    <div class="flex items-center gap-3 text-[.72rem]">
      <span class="font-semibold text-[#00457c] w-28">dimensions d = {{ d }}</span>
      <input v-model.number="idx" type="range" min="0" :max="dims.length - 1" step="1" class="flex-1">
    </div>
    <div class="svg-fit mt-1" :style="{ position: 'relative', width: '100%', height: 0, paddingTop: `${(H) / (W) * 100}%` }"><svg :viewBox="`0 0 ${W} ${H}`" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block">
      <line :x1="pad.l" :y1="H - pad.b" :x2="W - pad.r" :y2="H - pad.b" stroke="#00457c" />
      <line :x1="pad.l" :y1="pad.t" :x2="pad.l" :y2="H - pad.b" stroke="#00457c" />
      <rect v-for="(b, i) in stats.bins" :key="i"
        :x="pad.l + i * bw + 1" :y="H - pad.b - b * (H - pad.t - pad.b)"
        :width="bw - 2" :height="b * (H - pad.t - pad.b)" fill="#ff7900"
        style="transition: all .35s" :style="{ fillOpacity: '.85' }" />
      <text :x="pad.l" :y="H - 14" style="font-size: 11px" fill="#555">0</text>
      <text :x="W - pad.r" :y="H - 14" style="font-size: 11px" fill="#555" text-anchor="end">max. distance</text>
      <text :x="(W + pad.l) / 2" :y="H - 2" style="font-size: 12px" fill="#333" text-anchor="middle">pairwise distance (relative)</text>
      <text x="12" :y="(H - pad.b) / 2 + 10" style="font-size: 12px" fill="#333" text-anchor="middle" :transform="`rotate(-90 12 ${(H - pad.b) / 2 + 10})`">count</text>
    </svg></div>
    <div class="text-[.7rem] text-gray-700 mt-1">
      relative contrast <span class="font-mono">(d<sub>max</sub> &#8722; d<sub>min</sub>) / d<sub>min</sub></span> =
      <span class="font-semibold text-[#b02b37]">{{ stats.contrast >= 100 ? stats.contrast.toExponential(1) : stats.contrast.toFixed(2) }}</span>
      <span class="text-gray-500"> ({{ N }} uniform random points)</span>
    </div>
  </div>
</template>

<style scoped>
.curse-demo input[type='range'] {
  accent-color: #00457c;
}
</style>
