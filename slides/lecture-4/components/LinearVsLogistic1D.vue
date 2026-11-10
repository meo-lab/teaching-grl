<script setup lang="ts">
// Why linear regression is not a good model for class labels.
// 1D feature, labels 0/1. Least-squares line vs logistic (sigmoid) fit.
// "add extreme samples" appends clearly-vegetated pixels far to the right:
// the line tilts and its 0.5 threshold moves into class 1, the sigmoid barely changes.
import { computed, ref } from 'vue'
import { mulberry32 } from '../lib/lossSurface'

const rng = mulberry32(5)
const base = [
  ...Array.from({ length: 12 }, () => ({ x: 0.5 + 3.2 * rng(), y: 0 })),
  ...Array.from({ length: 12 }, () => ({ x: 4.6 + 3.2 * rng(), y: 1 })),
]
const extreme = Array.from({ length: 6 }, (_, i) => ({ x: 14 + i * 0.9 + 0.5 * rng(), y: 1 }))

const showLin = ref(true)
const showLog = ref(false)
const addExt = ref(false)
const pts = computed(() => (addExt.value ? [...base, ...extreme] : base))

const lin = computed(() => {
  const n = pts.value.length
  const mx = pts.value.reduce((s, p) => s + p.x, 0) / n
  const my = pts.value.reduce((s, p) => s + p.y, 0) / n
  const w = pts.value.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / pts.value.reduce((s, p) => s + (p.x - mx) ** 2, 0)
  return { w, b: my - w * mx }
})

// logistic fit by Newton's method with a small L2 penalty (data are separable)
const logi = computed(() => {
  let w = 0
  let b = 0
  const lam = 0.02
  for (let it = 0; it < 60; it++) {
    let gw = lam * w
    let gb = 0
    let hww = lam
    let hwb = 0
    let hbb = 1e-6
    for (const p of pts.value) {
      const q = 1 / (1 + Math.exp(-(w * p.x + b)))
      const r = q * (1 - q)
      gw += (q - p.y) * p.x
      gb += q - p.y
      hww += r * p.x * p.x
      hwb += r * p.x
      hbb += r
    }
    const det = hww * hbb - hwb * hwb
    w -= (hbb * gw - hwb * gb) / det
    b -= (hww * gb - hwb * gw) / det
  }
  return { w, b }
})

const W = 620
const H = 250
const pad = { l: 46, r: 14, t: 14, b: 36 }
const XR: [number, number] = [0, 20]
const YR: [number, number] = [-0.45, 1.45]
const sx = (x: number) => pad.l + (x - XR[0]) / (XR[1] - XR[0]) * (W - pad.l - pad.r)
const sy = (y: number) => pad.t + (YR[1] - y) / (YR[1] - YR[0]) * (H - pad.t - pad.b)
const xs = Array.from({ length: 161 }, (_, i) => XR[0] + i / 160 * (XR[1] - XR[0]))
const linPath = computed(() => `M${sx(XR[0])},${sy(lin.value.b)} L${sx(XR[1])},${sy(lin.value.w * XR[1] + lin.value.b)}`)
const logPath = computed(() => xs.map((x, i) => `${i ? 'L' : 'M'}${sx(x)},${sy(1 / (1 + Math.exp(-(logi.value.w * x + logi.value.b))))}`).join(' '))
const linThr = computed(() => (0.5 - lin.value.b) / lin.value.w)
const logThr = computed(() => -logi.value.b / logi.value.w)
const linErr = computed(() => base.filter(p => (lin.value.w * p.x + lin.value.b >= 0.5 ? 1 : 0) !== p.y).length)
</script>

<template>
  <div class="lvl select-none">
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto">
      <rect :x="pad.l" :y="sy(YR[1])" :width="W - pad.l - pad.r" :height="sy(1) - sy(YR[1])" class="bad" />
      <rect :x="pad.l" :y="sy(0)" :width="W - pad.l - pad.r" :height="sy(YR[0]) - sy(0)" class="bad" />
      <text :x="W - pad.r - 6" :y="sy(1.32)" class="badt" text-anchor="end">p &gt; 1: not a probability</text>
      <text :x="W - pad.r - 6" :y="sy(-0.33)" class="badt" text-anchor="end">p &lt; 0: not a probability</text>
      <line v-for="v in [0, 0.5, 1]" :key="v" :x1="pad.l" :x2="W - pad.r" :y1="sy(v)" :y2="sy(v)" :class="v === 0.5 ? 'half' : 'ax'" />
      <text v-for="v in [0, 0.5, 1]" :key="`t${v}`" :x="pad.l - 6" :y="sy(v) + 3.5" class="tick" text-anchor="end">{{ v }}</text>
      <text v-for="v in [0, 5, 10, 15, 20]" :key="`x${v}`" :x="sx(v)" :y="H - pad.b + 14" class="tick">{{ v }}</text>
      <text :x="(W + pad.l) / 2" :y="H - 4" class="lab">feature x (e.g. a vegetation index)</text>
      <text :transform="`translate(13,${(H - pad.b + pad.t) / 2}) rotate(-90)`" class="lab">label y / predicted p</text>

      <template v-if="showLin">
        <path :d="linPath" class="lin" />
        <line :x1="sx(linThr)" :x2="sx(linThr)" :y1="sy(-0.45)" :y2="sy(1.45)" class="linthr" />
      </template>
      <template v-if="showLog">
        <path :d="logPath" class="log" />
        <line :x1="sx(logThr)" :x2="sx(logThr)" :y1="sy(-0.45)" :y2="sy(1.45)" class="logthr" />
      </template>
      <circle v-for="(p, i) in pts" :key="i" :cx="sx(p.x)" :cy="sy(p.y)" r="4.2" :class="p.y ? 'c1' : 'c0'" />
    </svg>
    <div class="ctrl">
      <label><input v-model="showLin" type="checkbox"> linear regression</label>
      <label><input v-model="showLog" type="checkbox"> logistic regression</label>
      <label><input v-model="addExt" type="checkbox"> add extreme class-1 samples</label>
      <span v-if="showLin">line: {{ linErr }} of 24 original samples on the wrong side of 0.5</span>
    </div>
  </div>
</template>

<style scoped>
.lvl .bad { fill: #b02b37; opacity: .07; }
.lvl .badt { font: 600 10px "Exo 2", sans-serif; fill: #b02b37; }
.lvl .ax { stroke: #c9ced1; }
.lvl .half { stroke: #9aa1a6; stroke-dasharray: 4 3; }
.lvl .tick { font: 9.5px "Exo 2", sans-serif; fill: #666; text-anchor: middle; }
.lvl .lab { font: 11px "Exo 2", sans-serif; fill: #444; text-anchor: middle; }
.lvl .c1 { fill: #ff7900; stroke: #fff; stroke-width: 1; }
.lvl .c0 { fill: #00457c; stroke: #fff; stroke-width: 1; }
.lvl .lin { stroke: #b02b37; stroke-width: 2.4; fill: none; }
.lvl .linthr { stroke: #b02b37; stroke-width: 1.2; stroke-dasharray: 3 3; }
.lvl .log { stroke: #2eb82e; stroke-width: 2.6; fill: none; }
.lvl .logthr { stroke: #2eb82e; stroke-width: 1.2; stroke-dasharray: 3 3; }
.ctrl { display: flex; flex-wrap: wrap; gap: .9rem; justify-content: center; font-size: .68rem; color: #333; }
.ctrl input { accent-color: #00457c; margin-right: .2rem; }
</style>
