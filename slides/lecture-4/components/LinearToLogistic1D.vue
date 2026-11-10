<script setup lang="ts">
// 1D NDVI land cover: from linear regression on 0/1 targets to logistic regression.
//   step 1: the OLS line ŷ_veg = w x + b (same state as the previous slide)
//   step 2: the line morphs into the fitted logistic curve p(vegetation) = σ(w x + b)
import { computed, onUnmounted, ref, watch } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 2 })

const W = 620
const H = 290
const pad = { l: 56, r: 18, t: 14, b: 44 }
const X0 = pad.l
const X1 = W - pad.r
const Y0 = pad.t
const Y1 = H - pad.b
const XD = [-0.6, 0.9]
const YD = [-0.45, 1.45]
const sx = (x: number) => X0 + (x - XD[0]) / (XD[1] - XD[0]) * (X1 - X0)
const sy = (y: number) => Y1 - (y - YD[0]) / (YD[1] - YD[0]) * (Y1 - Y0)

// same 24 pixels as the previous slides
const NDVI_VEG = [0.346, 0.612, 0.672, 0.633, 0.608, 0.718, 0.691, 0.572, 0.791, 0.45, 0.612, 0.726]
const NDVI_URB = [0.126, 0.286, 0.215, 0.023, 0.1, 0.174, 0.131, 0.263, 0.096, 0.306, 0.09, 0.393]
const pts = [...NDVI_VEG.map(x => ({ x, y: 1 })), ...NDVI_URB.map(x => ({ x, y: 0 }))]

// linear regression (OLS)
const mx = pts.reduce((s, p) => s + p.x, 0) / pts.length
const my = pts.reduce((s, p) => s + p.y, 0) / pts.length
const wLin = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / pts.reduce((s, p) => s + (p.x - mx) ** 2, 0)
const bLin = my - wLin * mx

// logistic regression (maximum likelihood, Newton's method)
const sig = (z: number) => 1 / (1 + Math.exp(-z))
let wLog = 0
let bLog = 0
for (let it = 0; it < 50; it++) {
  let gw = 0, gb = 0, hww = 0, hwb = 0, hbb = 0
  for (const p of pts) {
    const q = sig(wLog * p.x + bLog)
    gw += (q - p.y) * p.x
    gb += q - p.y
    const r = q * (1 - q)
    hww += r * p.x * p.x
    hwb += r * p.x
    hbb += r
  }
  const det = hww * hbb - hwb * hwb
  wLog -= (hbb * gw - hwb * gb) / det
  bLog -= (-hwb * gw + hww * gb) / det
}

// steepness slider: scales w (and b) around the 0.5 crossing, for both models
const logK = ref(0) // log2 of the scale factor, -2 .. 2
const k = computed(() => 2 ** logK.value)
const xLin = (0.5 - bLin) / wLin
const fLin = (x: number) => 0.5 + k.value * wLin * (x - xLin)
const fLog = (x: number) => sig(k.value * (wLog * x + bLog))
const kLabel = computed(() => (k.value >= 1 ? `× ${k.value.toFixed(k.value < 1.95 ? 1 : 0)}` : `÷ ${(1 / k.value).toFixed(1 / k.value < 1.95 ? 1 : 0)}`))

// morph parameter t: 0 = line, 1 = logistic curve
const t = ref(props.step >= 2 ? 1 : 0)
let raf = 0
watch(() => props.step, (st) => {
  const target = st >= 2 ? 1 : 0
  const t0 = t.value
  const start = performance.now()
  cancelAnimationFrame(raf)
  const tick = () => {
    const u = Math.min(1, (performance.now() - start) / 1100)
    const e = u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2
    t.value = t0 + (target - t0) * e
    if (u < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
})
onUnmounted(() => cancelAnimationFrame(raf))

const f = (x: number) => (1 - t.value) * fLin(x) + t.value * fLog(x)
function pathOf(fn: (x: number) => number) {
  let d = ''
  let pen = false
  for (let i = 0; i <= 200; i++) {
    const x = XD[0] + (XD[1] - XD[0]) * i / 200
    const y = fn(x)
    if (y < YD[0] || y > YD[1]) {
      pen = false
      continue
    }
    d += `${pen ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`
    pen = true
  }
  return d
}
const curve = computed(() => pathOf(f))
const linGhost = computed(() => pathOf(fLin))

const s = computed(() => props.step)
const tex = (x: string) => katex.renderToString(x, { throwOnError: false, displayMode: false })
const linModel = tex(String.raw`\hat y_{\text{veg}} = w\,x + b`)
const logModel = tex(String.raw`p(\text{vegetation}) = \sigma(w\,x + b)`)
const sigDef = tex(String.raw`\sigma(z) = \frac{1}{1 + e^{-z}}`)
</script>

<template>
  <div class="l2l select-none">
    <svg :viewBox="`0 0 ${W} ${H}`" class="plot">
      <!-- axes -->
      <line :x1="X0" :y1="Y1" :x2="X1" :y2="Y1" class="ax" />
      <line :x1="X0" :y1="Y0" :x2="X0" :y2="Y1" class="ax" />
      <g v-for="v in [-0.5, 0, 0.5]" :key="`x${v}`">
        <line :x1="sx(v)" :x2="sx(v)" :y1="Y1" :y2="Y1 + 4" class="ax" />
        <text :x="sx(v)" :y="Y1 + 17" text-anchor="middle" style="font-size: 11px" class="tk">{{ v }}</text>
      </g>
      <g v-for="v in [0, 0.5, 1]" :key="`y${v}`">
        <line :x1="X0" :x2="X1" :y1="sy(v)" :y2="sy(v)" class="grid" :class="{ half: v === 0.5 }" />
        <line :x1="X0 - 4" :x2="X0" :y1="sy(v)" :y2="sy(v)" class="ax" />
        <text :x="X0 - 8" :y="sy(v) + 4" text-anchor="end" style="font-size: 11px" class="tk">{{ v }}</text>
      </g>
      <text :x="(X0 + X1) / 2" :y="H - 6" text-anchor="middle" style="font-size: 12px" class="ttl">NDVI x</text>
      <text :x="16" :y="(Y0 + Y1) / 2" text-anchor="middle" style="font-size: 12px" class="ttl fade" :style="{ opacity: s >= 2 ? 0 : 1 }" :transform="`rotate(-90 16 ${(Y0 + Y1) / 2})`">target y</text>
      <text :x="16" :y="(Y0 + Y1) / 2" text-anchor="middle" style="font-size: 12px" class="ttl fade" :style="{ opacity: s >= 2 ? 1 : 0 }" :transform="`rotate(-90 16 ${(Y0 + Y1) / 2})`">p(vegetation)</text>
      <text :x="X0 + 6" :y="sy(1) - 7" style="font-size: 11px; fill: #2ca02c; font-weight: 600">vegetation → 1</text>
      <text :x="X0 + 6" :y="sy(0) + 16" style="font-size: 11px; fill: #d62728; font-weight: 600">urban → 0</text>

      <!-- out-of-range zones of the line (step 1 only) -->
      <g class="fade" :style="{ opacity: s === 1 ? 1 : 0 }">
        <rect :x="X0" :y="Y0" :width="X1 - X0" :height="sy(1) - Y0" fill="rgba(0,69,124,0.05)" />
        <rect :x="X0" :y="sy(0)" :width="X1 - X0" :height="Y1 - sy(0)" fill="rgba(0,69,124,0.05)" />
        <text :x="sx(0.2)" :y="Y0 + 16" text-anchor="middle" style="font-size: 11px; fill: #00457c; opacity: .75">ŷ &gt; 1 ?</text>
        <text :x="sx(-0.3)" :y="Y1 - 10" text-anchor="middle" style="font-size: 11px; fill: #00457c; opacity: .75">ŷ &lt; 0 ?</text>
      </g>

      <!-- ghost of the linear line once the curve has taken over -->
      <path :d="linGhost" fill="none" stroke="#2ca02c" stroke-width="1.6" stroke-dasharray="5 4" class="fade" :style="{ opacity: s >= 2 ? 0.4 : 0 }" />

      <!-- residuals to the current curve -->
      <line v-for="(p, i) in pts" :key="`r${i}`" :x1="sx(p.x)" :x2="sx(p.x)" :y1="sy(p.y)" :y2="sy(Math.min(YD[1], Math.max(YD[0], f(p.x))))" class="res" />
      <path :d="curve" fill="none" stroke="#2ca02c" stroke-width="2.8" />

      <circle v-for="(p, i) in pts" :key="`p${i}`" :cx="sx(p.x)" :cy="sy(p.y)" r="5" class="pt" :fill="p.y === 1 ? '#2ca02c' : '#d62728'" />
    </svg>

    <div class="side">
      <div class="model" :class="{ dim: s >= 2 }">
        <div class="hd">Linear regression</div>
        <div class="big" v-html="linModel" />
      </div>
      <div class="model logi fade" :style="{ opacity: s >= 2 ? 1 : 0 }">
        <div class="hd">Logistic regression</div>
        <div class="big" v-html="logModel" />
        <div class="sig" v-html="sigDef" />
      </div>
      <div class="stp" @click.stop @pointerdown.stop @keydown.stop>
        <div class="sl-hd">steepness: w {{ kLabel }}</div>
        <div class="sl-row">
          <span>flatter</span>
          <input v-model.number="logK" type="range" min="-2" max="2" step="0.05" @dblclick="logK = 0">
          <span>sharper</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.l2l { display: flex; gap: 1.1rem; align-items: center; justify-content: center; }
.plot { width: 520px; height: 243px; flex: none; overflow: visible; }
.ax { stroke: #8b8f8d; stroke-width: 1; }
.grid { stroke: #e3e6e8; stroke-width: 1; }
.grid.half { stroke-dasharray: 3 3; }
.tk { fill: #5f625f; }
.ttl { fill: #00457c; font-weight: 600; }
.res { stroke: #9aa1a6; stroke-width: 1; }
.fade { transition: opacity .6s ease; }
.pt { stroke: #fff; stroke-width: 1.2; }
.side { display: flex; flex-direction: column; gap: .45rem; width: 300px; }
.model { border-left: 4px solid #2ca02c; background: #f1f8f1; border-radius: 0 6px 6px 0; padding: .4rem .6rem; transition: opacity .6s ease; }
.model.dim { opacity: .5; }
.model.logi { border-left-color: #00457c; background: #eef5fa; }
.hd { font: 700 11px "Exo 2", sans-serif; text-transform: uppercase; letter-spacing: .04em; color: #00457c; }
.big { font-size: 18px; color: #1a1a1a; margin: .05rem 0; white-space: nowrap; }
.sig { font-size: 13px; color: #333; }
.stp { padding: .2rem .2rem 0 .7rem; }
.sl-hd { font: 600 12px "Exo 2", sans-serif; color: #00457c; }
.sl-row { display: flex; align-items: center; gap: .4rem; font: 10.5px "Exo 2", sans-serif; color: #666; }
.l2l .sl-row input[type=range] { flex: 1; accent-color: #00457c; appearance: auto !important; -webkit-appearance: auto !important; border: none !important; background: transparent !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; height: 18px !important; min-height: 0 !important; outline: none !important; }
.stp { margin-top: .3rem; }
</style>
