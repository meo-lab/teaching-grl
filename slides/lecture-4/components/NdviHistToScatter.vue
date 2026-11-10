<script setup lang="ts">
// 1D bridge from lecture 3 to classification-as-regression, on NDVI only.
//   step 1: NDVI histograms per class (as in the lecture-3 recap)
//   step 2: histogram -> scatter: 24 pixels with a 0/1 target (vegetation = 1, urban = 0)
//   step 3: ordinary linear regression line ŷ_veg = w x + b through the 0/1 targets
//   step 4: second line ŷ_urb = 1 − ŷ_veg; where they cross, the predicted class flips (decision boundary)
// No probabilities: the lines leave [0, 1] on purpose.
import { computed } from 'vue'
import ndviData from '../figures/ndvi_histogram_data.json'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 4 })

const W = 620
const H = 290
const pad = { l: 56, r: 18, t: 14, b: 44 }
const X0 = pad.l
const X1 = W - pad.r
const Y0 = pad.t
const Y1 = H - pad.b
const XD = [-0.6, 0.9]
const sx = (x: number) => X0 + (x - XD[0]) / (XD[1] - XD[0]) * (X1 - X0)

// ---- histogram (density), same bins as lecture 3 ----
const bin = ndviData.binSize
function hist(vals: number[]) {
  const counts = new Map<number, number>()
  for (const v of vals) {
    const k = Math.floor(v / bin)
    counts.set(k, (counts.get(k) || 0) + 1)
  }
  return [...counts].map(([k, c]) => ({ x0: k * bin, d: c / (vals.length * bin) }))
}
const hVeg = hist(ndviData.vegetation)
const hUrb = hist(ndviData.urban)
const DMAX = Math.max(...hVeg.map(b => b.d), ...hUrb.map(b => b.d)) * 1.05
const sd = (d: number) => Y1 - d / DMAX * (Y1 - Y0)
const densityTicks = [0, 1, 2, 3].filter(t => t <= DMAX)

// ---- scatter: same 24 pixels as the 2D demo ----
const NDVI_VEG = [0.346, 0.612, 0.672, 0.633, 0.608, 0.718, 0.691, 0.572, 0.791, 0.45, 0.612, 0.726]
const NDVI_URB = [0.126, 0.286, 0.215, 0.023, 0.1, 0.174, 0.131, 0.263, 0.096, 0.306, 0.09, 0.393]
const pts = [...NDVI_VEG.map(x => ({ x, y: 1 })), ...NDVI_URB.map(x => ({ x, y: 0 }))]
const YD = [-0.45, 1.45]
const sy = (y: number) => Y1 - (y - YD[0]) / (YD[1] - YD[0]) * (Y1 - Y0)

// OLS for ŷ = w x + b
const mx = pts.reduce((s, p) => s + p.x, 0) / pts.length
const my = pts.reduce((s, p) => s + p.y, 0) / pts.length
const w = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / pts.reduce((s, p) => s + (p.x - mx) ** 2, 0)
const b = my - w * mx
const fVeg = (x: number) => w * x + b
const xStar = (0.5 - b) / w // ŷ_veg = ŷ_urb = 1 − ŷ_veg  <=>  ŷ_veg = 0.5

// clip a line to the y-domain of the plot
function seg(f: (x: number) => number) {
  const xs = [XD[0], XD[1]]
  const lo = YD[0]
  const hi = YD[1]
  const clipX = (x: number) => {
    const y = f(x)
    if (y > hi) return (hi - f(0)) / (f(1) - f(0))
    if (y < lo) return (lo - f(0)) / (f(1) - f(0))
    return x
  }
  const a = clipX(xs[0])
  const c = clipX(xs[1])
  return { x1: sx(a), y1: sy(f(a)), x2: sx(c), y2: sy(f(c)) }
}
const lineVeg = seg(fVeg)
const lineUrb = seg(x => 1 - fVeg(x))

const s = computed(() => props.step)
</script>

<template>
  <div class="nhs select-none">
    <svg :viewBox="`0 0 ${W} ${H}`" class="plot">
      <!-- step 3+: shaded predicted-class regions -->
      <g class="fade" :style="{ opacity: s >= 4 ? 1 : 0 }">
        <rect :x="X0" :y="Y0" :width="sx(xStar) - X0" :height="Y1 - Y0" fill="rgba(214,39,40,0.07)" />
        <rect :x="sx(xStar)" :y="Y0" :width="X1 - sx(xStar)" :height="Y1 - Y0" fill="rgba(44,160,44,0.08)" />
      </g>

      <!-- x axis -->
      <line :x1="X0" :y1="Y1" :x2="X1" :y2="Y1" class="ax" />
      <g v-for="t in [-0.5, 0, 0.5]" :key="t">
        <line :x1="sx(t)" :x2="sx(t)" :y1="Y1" :y2="Y1 + 4" class="ax" />
        <text :x="sx(t)" :y="Y1 + 17" text-anchor="middle" style="font-size: 11px" class="tk">{{ t }}</text>
      </g>
      <text :x="(X0 + X1) / 2" :y="H - 6" text-anchor="middle" style="font-size: 12px" class="ttl">NDVI x</text>
      <line :x1="X0" :y1="Y0" :x2="X0" :y2="Y1" class="ax" />

      <!-- step 1: histogram + density axis -->
      <g class="fade" :style="{ opacity: s >= 2 ? 0 : 1 }">
        <rect v-for="(r, i) in hUrb" :key="`u${i}`" :x="sx(r.x0) + 0.5" :y="sd(r.d)" :width="sx(r.x0 + bin) - sx(r.x0) - 1" :height="Y1 - sd(r.d)" fill="rgba(214,39,40,0.5)" />
        <rect v-for="(r, i) in hVeg" :key="`v${i}`" :x="sx(r.x0) + 0.5" :y="sd(r.d)" :width="sx(r.x0 + bin) - sx(r.x0) - 1" :height="Y1 - sd(r.d)" fill="rgba(44,160,44,0.5)" />
        <g v-for="t in densityTicks" :key="`d${t}`">
          <line :x1="X0 - 4" :x2="X0" :y1="sd(t)" :y2="sd(t)" class="ax" />
          <text :x="X0 - 8" :y="sd(t) + 4" text-anchor="end" style="font-size: 11px" class="tk">{{ t }}</text>
        </g>
        <text :x="16" :y="(Y0 + Y1) / 2" text-anchor="middle" style="font-size: 12px" class="ttl" :transform="`rotate(-90 16 ${(Y0 + Y1) / 2})`">density</text>
      </g>

      <!-- step 2+: 0/1 target axis -->
      <g class="fade" :style="{ opacity: s >= 2 ? 1 : 0 }">
        <g v-for="t in [0, 0.5, 1]" :key="`y${t}`">
          <line :x1="X0" :x2="X1" :y1="sy(t)" :y2="sy(t)" class="grid" :class="{ half: t === 0.5 }" />
          <line :x1="X0 - 4" :x2="X0" :y1="sy(t)" :y2="sy(t)" class="ax" />
          <text :x="X0 - 8" :y="sy(t) + 4" text-anchor="end" style="font-size: 11px" class="tk">{{ t }}</text>
        </g>
        <text :x="16" :y="(Y0 + Y1) / 2" text-anchor="middle" style="font-size: 12px" class="ttl" :transform="`rotate(-90 16 ${(Y0 + Y1) / 2})`">target y</text>
        <text :x="X0 + 6" :y="sy(1) - 7" style="font-size: 11px; fill: #2ca02c; font-weight: 600">vegetation → 1</text>
        <text :x="X0 + 6" :y="sy(0) + 16" style="font-size: 11px; fill: #d62728; font-weight: 600">urban → 0</text>
      </g>

      <!-- step 3: regression line + residuals -->
      <g class="fade" :style="{ opacity: s >= 3 ? 1 : 0 }">
        <line v-for="(p, i) in pts" :key="`r${i}`" :x1="sx(p.x)" :x2="sx(p.x)" :y1="sy(p.y)" :y2="sy(fVeg(p.x))" class="res" />
        <line v-bind="lineVeg" stroke="#2ca02c" stroke-width="2.6" />
        <text :x="lineVeg.x2 - 6" :y="lineVeg.y2 + 16" text-anchor="end" style="font-size: 12px; fill: #2ca02c; font-weight: 700">ŷ<tspan baseline-shift="sub" style="font-size: 9px">veg</tspan></text>
      </g>

      <!-- step 4: second line and the decision boundary -->
      <g class="fade" :style="{ opacity: s >= 4 ? 1 : 0 }">
        <line v-bind="lineUrb" stroke="#d62728" stroke-width="2.6" stroke-dasharray="7 4" />
        <text :x="lineUrb.x1 + 32" :y="lineUrb.y1 + 14" style="font-size: 12px; fill: #d62728; font-weight: 700">ŷ<tspan baseline-shift="sub" style="font-size: 9px">urb</tspan> = 1 − ŷ<tspan baseline-shift="sub" style="font-size: 9px">veg</tspan></text>
        <line :x1="sx(xStar)" :x2="sx(xStar)" :y1="Y0" :y2="Y1" stroke="#00457c" stroke-width="2.4" />
        <circle :cx="sx(xStar)" :cy="sy(0.5)" r="4.5" fill="#00457c" />
        <text :x="sx(xStar) + 8" :y="Y1 - 22" style="font-size: 12px; fill: #00457c; font-weight: 700">decision boundary</text>
        <text :x="sx(xStar) + 8" :y="Y1 - 8" style="font-size: 11px; fill: #00457c">NDVI = {{ xStar.toFixed(2) }}</text>
        <text :x="sx(-0.42)" :y="Y0 + 14" text-anchor="middle" style="font-size: 12px; fill: #d62728; font-weight: 600; opacity: .8">predict urban</text>
        <text :x="(sx(xStar) + X1) / 2" :y="Y0 + 14" text-anchor="middle" style="font-size: 12px; fill: #2ca02c; font-weight: 600; opacity: .8">predict vegetation</text>
      </g>

      <!-- points: rise out of the histogram baseline into their 0/1 target -->
      <circle
        v-for="(p, i) in pts" :key="`p${i}`"
        :cx="sx(p.x)" :cy="s >= 2 ? sy(p.y) : Y1"
        r="5" class="pt" :style="{ opacity: s >= 2 ? 1 : 0, transitionDelay: `${(i % 12) * 25}ms` }"
        :fill="p.y === 1 ? '#2ca02c' : '#d62728'"
      />
    </svg>

    <div class="side">
      <div v-if="s >= 3" class="model">
        <div class="hd">Linear regression</div>
        <div class="big">ŷ<sub>veg</sub> = w x + b</div>
        <div v-if="s >= 4" class="big" style="color:#d62728">ŷ<sub>urb</sub> = 1 − ŷ<sub>veg</sub></div>
      </div>
      <div v-if="s >= 4" class="bnd"><b>decision boundary:</b> ŷ<sub>veg</sub> = ŷ<sub>urb</sub></div>
    </div>
  </div>
</template>

<style scoped>
.nhs { display: flex; gap: 1.2rem; align-items: center; justify-content: center; }
.plot { width: 560px; height: 262px; flex: none; overflow: visible; }
.ax { stroke: #8b8f8d; stroke-width: 1; }
.grid { stroke: #e3e6e8; stroke-width: 1; }
.grid.half { stroke-dasharray: 3 3; }
.tk { fill: #5f625f; }
.ttl { fill: #00457c; font-weight: 600; }
.res { stroke: #9aa1a6; stroke-width: 1; }
.fade { transition: opacity .6s ease; }
.pt { stroke: #fff; stroke-width: 1.2; transition: cy .8s cubic-bezier(.3, 1.3, .5, 1), opacity .4s ease; }
.side { display: flex; flex-direction: column; gap: .5rem; width: 230px; }
.side .txt { font: 12px/1.35 "Exo 2", sans-serif; color: #444; }
.side .eq { font: italic 15px 'Times New Roman', serif; }
.bnd { font: 13px "Exo 2", sans-serif; color: #00457c; padding-left: .7rem; }
.model { border-left: 4px solid #2ca02c; background: #f1f8f1; border-radius: 0 6px 6px 0; padding: .4rem .6rem; }
.model .hd { font: 700 11px "Exo 2", sans-serif; text-transform: uppercase; letter-spacing: .04em; color: #00457c; }
.model .big { font: italic 20px 'Times New Roman', serif; color: #1a1a1a; }
</style>
