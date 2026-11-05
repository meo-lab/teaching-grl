<script setup lang="ts">
// 2-D point cloud with adjustable correlation and spread.
// Step 1 centres the data (translation), step 2 rotates it onto the
// eigenvectors of its covariance matrix (the principal components).
// The live covariance matrix shows the off-diagonal terms vanishing.
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const rho = ref(0.85)
const s1 = ref(3)
const s2 = ref(1.8)
const stage = ref(0) // 0 raw, 1 centred, 2 rotated
const showAxes = ref(true)

const N = 120
const MU = [3, 2]

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(7)
const Z = Array.from({ length: N }, () => {
  const u = Math.max(rnd(), 1e-9)
  const v = rnd()
  const r = Math.sqrt(-2 * Math.log(u))
  return [r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v)]
})

// raw data x = mu + L z  (L = Cholesky factor of the target covariance)
const raw = computed(() => {
  const a = s1.value
  const b = s2.value
  const r = rho.value
  return Z.map(([z1, z2]) => [
    MU[0] + a * z1,
    MU[1] + b * (r * z1 + Math.sqrt(1 - r * r) * z2),
  ])
})

function covOf(pts: number[][]) {
  const n = pts.length
  const m = [0, 0]
  for (const p of pts) { m[0] += p[0] / n; m[1] += p[1] / n }
  let a = 0; let b = 0; let d = 0
  for (const p of pts) {
    const x = p[0] - m[0]
    const y = p[1] - m[1]
    a += x * x; b += x * y; d += y * y
  }
  return { mean: m, C: [a / (n - 1), b / (n - 1), d / (n - 1)] }
}

const rawStats = computed(() => covOf(raw.value))
const eig = computed(() => {
  const [a, b, d] = rawStats.value.C
  const tr = (a + d) / 2
  const disc = Math.sqrt(((a - d) / 2) ** 2 + b * b)
  const theta = 0.5 * Math.atan2(2 * b, a - d)
  return { l1: tr + disc, l2: tr - disc, theta }
})

function stagePoints(s: number) {
  const { mean } = rawStats.value
  const { theta } = eig.value
  const c = Math.cos(theta)
  const sn = Math.sin(theta)
  return raw.value.map(([x, y]) => {
    if (s === 0)
      return [x, y]
    const cx = x - mean[0]
    const cy = y - mean[1]
    if (s === 1)
      return [cx, cy]
    return [c * cx + sn * cy, -sn * cx + c * cy]
  })
}

const shown = ref<number[][]>(stagePoints(0))
let raf = 0
function animateTo(target: number[][], ms = 700) {
  cancelAnimationFrame(raf)
  const from = shown.value.map(p => [...p])
  const t0 = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / ms)
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
    shown.value = from.map((p, i) => [p[0] + (target[i][0] - p[0]) * e, p[1] + (target[i][1] - p[1]) * e])
    if (t < 1)
      raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}
watch(stage, s => animateTo(stagePoints(s)))
watch([rho, s1, s2], () => {
  cancelAnimationFrame(raf)
  shown.value = stagePoints(stage.value)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))

const shownStats = computed(() => covOf(shown.value))

// plot geometry: data range [-10, 10]
const P = 300
const pad = 26
const sc = (P - 2 * pad) / 20
const X = (v: number) => pad + (v + 10) * sc
const Y = (v: number) => P - pad - (v + 10) * sc
const ticks = [-10, -5, 0, 5, 10]

// principal axes drawn through the current mean, along the current eigenvectors
const axes = computed(() => {
  const { mean } = shownStats.value
  const [a, b, d] = shownStats.value.C
  const tr = (a + d) / 2
  const disc = Math.sqrt(((a - d) / 2) ** 2 + b * b)
  const th = 0.5 * Math.atan2(2 * b, a - d)
  const l1 = Math.sqrt(tr + disc) * 2
  const l2 = Math.sqrt(Math.max(tr - disc, 0)) * 2
  const u = [Math.cos(th), Math.sin(th)]
  const v = [-Math.sin(th), Math.cos(th)]
  return [
    { x1: mean[0] - u[0] * l1, y1: mean[1] - u[1] * l1, x2: mean[0] + u[0] * l1, y2: mean[1] + u[1] * l1, label: 'PC 1' },
    { x1: mean[0] - v[0] * l2, y1: mean[1] - v[1] * l2, x2: mean[0] + v[0] * l2, y2: mean[1] + v[1] * l2, label: 'PC 2' },
  ]
})

const fmt = (v: number) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2)
const offStrength = computed(() => {
  const [a, b, d] = shownStats.value.C
  return Math.min(1, Math.abs(b) / Math.sqrt(a * d))
})
const xLabel = computed(() => stage.value === 2 ? 'principal component 1' : 'variable 1')
const yLabel = computed(() => stage.value === 2 ? 'principal component 2' : 'variable 2')
</script>

<template>
  <div class="cov-demo flex gap-5 items-start" @pointerdown.stop @keydown.stop>
    <svg :viewBox="`0 0 ${P} ${P}`" class="w-[300px] h-[300px] flex-shrink-0">
      <defs>
        <marker id="cov-demo-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff7900" />
        </marker>
      </defs>
      <rect :x="pad" :y="pad" :width="P - 2 * pad" :height="P - 2 * pad" fill="#fafbfc" stroke="#d7d9d8" />
      <g v-for="t in ticks" :key="t">
        <line :x1="X(t)" :y1="pad" :x2="X(t)" :y2="P - pad" stroke="#e8eaeb" />
        <line :x1="pad" :y1="Y(t)" :x2="P - pad" :y2="Y(t)" stroke="#e8eaeb" />
        <text :x="X(t)" :y="P - pad + 12" style="font-size: 9px" fill="#777" text-anchor="middle">{{ t }}</text>
        <text :x="pad - 4" :y="Y(t) + 3" style="font-size: 9px" fill="#777" text-anchor="end">{{ t }}</text>
      </g>
      <line :x1="X(0)" :y1="pad" :x2="X(0)" :y2="P - pad" stroke="#9aa3aa" />
      <line :x1="pad" :y1="Y(0)" :x2="P - pad" :y2="Y(0)" stroke="#9aa3aa" />
      <text :x="P / 2" :y="P - 2" style="font-size: 10px" fill="#333" text-anchor="middle">{{ xLabel }}</text>
      <text x="8" :y="P / 2" style="font-size: 10px" fill="#333" text-anchor="middle" :transform="`rotate(-90 8 ${P / 2})`">{{ yLabel }}</text>

      <circle v-for="(p, i) in shown" :key="i" :cx="X(p[0])" :cy="Y(p[1])" r="3.2" fill="#3b6ea5" :style="{ fillOpacity: '.75' }" />

      <g v-if="showAxes">
        <line v-for="a in axes" :key="a.label" :x1="X(a.x1)" :y1="Y(a.y1)" :x2="X(a.x2)" :y2="Y(a.y2)"
          stroke="#ff7900" stroke-width="2.5" marker-end="url(#cov-demo-arrow)" marker-start="url(#cov-demo-arrow)" />
      </g>
      <circle :cx="X(shownStats.mean[0])" :cy="Y(shownStats.mean[1])" r="5" fill="#b02b37" stroke="#fff" />
      <text :x="X(shownStats.mean[0]) + 7" :y="Y(shownStats.mean[1]) - 7" style="font-size: 12px" font-weight="700" fill="#b02b37">&#956;</text>
    </svg>

    <div class="flex-1 text-[.7rem] text-gray-700">
      <div class="grid items-center gap-x-2 gap-y-1" style="grid-template-columns: 7.5rem 1fr 2.4rem">
        <span>correlation &#961;</span><input v-model.number="rho" type="range" min="-0.95" max="0.95" step="0.05"><span class="font-mono">{{ rho.toFixed(2) }}</span>
        <span>spread &#963;<sub>1</sub></span><input v-model.number="s1" type="range" min="0.5" max="4" step="0.1"><span class="font-mono">{{ s1.toFixed(1) }}</span>
        <span>spread &#963;<sub>2</sub></span><input v-model.number="s2" type="range" min="0.5" max="4" step="0.1"><span class="font-mono">{{ s2.toFixed(1) }}</span>
      </div>

      <div class="flex gap-2 mt-3">
        <button class="demo-btn" :class="{ active: stage === 1 }" @click="stage = 1">1 &#183; translate (center)</button>
        <button class="demo-btn" :class="{ active: stage === 2 }" @click="stage = 2">2 &#183; rotate to PCs</button>
        <button class="demo-btn" @click="stage = 0">reset</button>
      </div>
      <label class="flex items-center gap-1 mt-2"><input v-model="showAxes" type="checkbox"> show principal axes</label>

      <div class="mt-3 font-semibold text-[#00457c]">Sample covariance matrix C</div>
      <div class="flex items-center gap-2 mt-1 font-mono text-[.78rem]">
        <span class="text-[1.6rem] font-light leading-none">(</span>
        <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-center">
          <span class="px-1 rounded bg-[#e3edf6]">{{ fmt(shownStats.C[0]) }}</span>
          <span class="px-1 rounded" :style="{ background: `rgba(255,121,0,${0.12 + 0.6 * offStrength})` }">{{ fmt(shownStats.C[1]) }}</span>
          <span class="px-1 rounded" :style="{ background: `rgba(255,121,0,${0.12 + 0.6 * offStrength})` }">{{ fmt(shownStats.C[1]) }}</span>
          <span class="px-1 rounded bg-[#e3edf6]">{{ fmt(shownStats.C[2]) }}</span>
        </div>
        <span class="text-[1.6rem] font-light leading-none">)</span>
      </div>
      <div class="mt-1">
        mean &#956; = ({{ fmt(shownStats.mean[0]) }}, {{ fmt(shownStats.mean[1]) }})
      </div>
      <div class="mt-1">
        eigenvalues &#955;<sub>1</sub> = {{ fmt(eig.l1) }}, &#955;<sub>2</sub> = {{ fmt(eig.l2) }}
        &#8594; PC 1 explains <strong>{{ (100 * eig.l1 / (eig.l1 + eig.l2)).toFixed(0) }}&#8239;%</strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cov-demo input[type='range'] {
  accent-color: #00457c;
}
.demo-btn {
  border: 1.5px solid #00457c;
  border-radius: 6px;
  padding: 2px 8px;
  color: #00457c;
  background: #fff;
  font-size: .68rem;
}
.demo-btn.active,
.demo-btn:hover {
  background: #00457c;
  color: #fff;
}
</style>
