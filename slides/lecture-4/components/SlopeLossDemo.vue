<script setup lang="ts">
// Loss (MAE or MSE) as a function of the slope w, with the bias b held fixed.
// Left: the same four samples as RegressionScatterDemo, with the line y = w x + b
//       and its residuals (dashed segments for MAE, squares for MSE).
// Right: loss(w) with a marker at the current w and the optimum.
// Toggles: MAE / MSE, one point / all points (click a point to pick it).
// Interaction: slider, hover on the loss plot, or drag on the data plot.
import { computed, ref } from 'vue'

type Loss = 'mae' | 'mse'

const props = withDefaults(defineProps<{
  b?: number
  loss?: Loss
  single?: boolean // start with the loss on a single point
  selected?: number // index of that point
  initialW?: number
  controls?: boolean
  xLabel?: string
  yLabel?: string
}>(), {
  b: 1, // intercept of the reference line in RegressionScatterDemo (0,1) -> (1,0)
  loss: 'mae',
  single: true,
  selected: 1,
  initialW: 0,
  controls: true,
  xLabel: 'elevation x',
  yLabel: 'temperature y',
})

// same samples (unit space, y-up) as RegressionScatterDemo
const P: [number, number][] = [
  [0.15, 0.75],
  [0.40, 0.75],
  [0.50, 0.45],
  [0.85, 0.35],
]

// keeps every prediction inside the plotted box, so all residuals stay visible
const W_RANGE: [number, number] = [-1.15, 0.1]

const loss = ref<Loss>(props.loss)
const single = ref(props.single)
const sel = ref(props.selected)
const w = ref(props.initialW)

const active = computed(() => (single.value ? [sel.value] : P.map((_, i) => i)))
const isActive = (i: number) => active.value.includes(i)

const resid = (wv: number, i: number) => wv * P[i][0] + props.b - P[i][1]

// MSE with the 1/(2N) convention used on the MSE slide
function lossAt(wv: number) {
  const idx = active.value
  if (loss.value === 'mae')
    return idx.reduce((s, i) => s + Math.abs(resid(wv, i)), 0) / idx.length
  return idx.reduce((s, i) => s + resid(wv, i) ** 2, 0) / (2 * idx.length)
}

const wStar = computed(() => {
  const idx = active.value
  if (loss.value === 'mse') {
    // closed form for w with b fixed: sum x (y - b) / sum x^2
    const num = idx.reduce((s, i) => s + P[i][0] * (P[i][1] - props.b), 0)
    const den = idx.reduce((s, i) => s + P[i][0] ** 2, 0)
    return num / den
  }
  // MAE is piecewise linear: the minimum sits on a kink
  const kinks = idx.map(i => (P[i][1] - props.b) / P[i][0])
  return kinks.reduce((best, k) => (lossAt(k) < lossAt(best) ? k : best), kinks[0])
})

const curLoss = computed(() => lossAt(w.value))

// ---------------- layout (matches RegressionScatterDemo) ----------------
const padL = 50
const padT = 24
const padR = 24
const padB = 32
const plot = 208
const PW = padL + plot + padR
const PH = padT + plot + padB
const LABEL_MARGIN = 60
const uid = `sld-${Math.random().toString(36).slice(2, 8)}`

// data panel
const X = (ux: number) => padL + ux * plot
const Y = (uy: number) => PH - padB - uy * plot

// loss panel: y-axis scales to the curve of the current mode
const scale = computed(() => {
  let m = 0
  for (let i = 0; i <= 100; i++)
    m = Math.max(m, lossAt(W_RANGE[0] + (W_RANGE[1] - W_RANGE[0]) * i / 100))
  const step = [0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1].find(s => Math.ceil(m / s) <= 4) ?? 1
  const n = Math.max(1, Math.ceil(m / step))
  return { max: n * step, ticks: Array.from({ length: n + 1 }, (_, k) => +(k * step).toFixed(3)) }
})

const LX = (wv: number) => padL + (wv - W_RANGE[0]) / (W_RANGE[1] - W_RANGE[0]) * plot
const LY = (m: number) => PH - padB - m / scale.value.max * plot
const invLX = (px: number) => W_RANGE[0] + (px - padL) / plot * (W_RANGE[1] - W_RANGE[0])

const clampW = (v: number) => Math.min(W_RANGE[1], Math.max(W_RANGE[0], v))

// the line, clipped to the unit box
const line = computed(() => {
  const f = (x: number) => w.value * x + props.b
  let x0 = 0
  let x1 = 1
  if (w.value !== 0) {
    const xs = [(0 - props.b) / w.value, (1.08 - props.b) / w.value].sort((a, c) => a - c)
    x0 = Math.max(0, xs[0])
    x1 = Math.min(1, xs[1])
  }
  return { x1: X(x0), y1: Y(f(x0)), x2: X(x1), y2: Y(f(x1)) }
})

const residuals = computed(() => P.map(([x, y], i) => {
  const yh = Math.min(1.08, Math.max(0, w.value * x + props.b))
  const side = Math.abs(Y(yh) - Y(y))
  return { i, x: X(x), y: Y(y), yh: Y(yh), top: Math.min(Y(y), Y(yh)), side }
}))

const curvePath = computed(() => {
  const n = 200
  const pts: string[] = []
  for (let k = 0; k <= n; k++) {
    const wv = W_RANGE[0] + (W_RANGE[1] - W_RANGE[0]) * k / n
    pts.push(`${LX(wv).toFixed(1)},${LY(lossAt(wv)).toFixed(1)}`)
  }
  return `M ${pts.join(' L ')}`
})

const wTicks = [-1, -0.5, 0]
const lossName = computed(() => loss.value.toUpperCase())

// ---------------- interaction ----------------
const dragging = ref(false)

function svgPoint(e: PointerEvent) {
  const svg = e.currentTarget as SVGSVGElement
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  return pt.matrixTransform(svg.getScreenCTM()!.inverse())
}

function onLossMove(e: PointerEvent) {
  w.value = clampW(invLX(svgPoint(e).x))
}

// on the data panel: dragging tilts the line around the fixed intercept
function onDataMove(e: PointerEvent) {
  if (!dragging.value)
    return
  const p = svgPoint(e)
  const ux = (p.x - padL) / plot
  const uy = (PH - padB - p.y) / plot
  if (ux > 0.05)
    w.value = clampW((uy - props.b) / ux)
}

function onDataDown(e: PointerEvent) {
  // clicking near a data point (in one-point mode) selects it instead of dragging
  const p = svgPoint(e)
  if (single.value) {
    const hit = P.findIndex(([x, y]) => Math.hypot(X(x) - p.x, Y(y) - p.y) < 10)
    if (hit >= 0) {
      sel.value = hit
      return
    }
  }
  dragging.value = true
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  onDataMove(e)
}

const fmt = (v: number, d = 2) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d)
</script>

<template>
  <div class="slope-loss-demo">
    <div v-if="controls" class="toggles">
      <div class="seg">
        <button :class="{ on: loss === 'mae' }" @click="loss = 'mae'">MAE</button>
        <button :class="{ on: loss === 'mse' }" @click="loss = 'mse'">MSE</button>
      </div>
      <div class="seg">
        <button :class="{ on: single }" @click="single = true">one point</button>
        <button :class="{ on: !single }" @click="single = false">all points</button>
      </div>
    </div>

    <div class="panels">
      <!-- data space -->
      <svg
        :viewBox="`-${LABEL_MARGIN} 0 ${PW + LABEL_MARGIN} ${PH}`"
        class="panel draggable"
        @pointerdown="onDataDown"
        @pointermove="onDataMove"
        @pointerup="dragging = false"
        @pointercancel="dragging = false"
      >
        <defs>
          <marker :id="`${uid}-arrow`" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--bonn-muted)" />
          </marker>
          <clipPath :id="`${uid}-clip`">
            <rect :x="X(0)" :y="Y(1.08)" :width="plot + padR" :height="1.08 * plot" />
          </clipPath>
        </defs>

        <line :x1="X(0)" :y1="Y(0)" :x2="X(1.02)" :y2="Y(0)" stroke="var(--bonn-muted)" stroke-width="1.4" :marker-end="`url(#${uid}-arrow)`" />
        <line :x1="X(0)" :y1="Y(0)" :x2="X(0)" :y2="Y(1.08)" stroke="var(--bonn-muted)" stroke-width="1.4" :marker-end="`url(#${uid}-arrow)`" />
        <text :x="X(1.02)" :y="Y(0) + 16" text-anchor="end" class="axis-label">{{ xLabel }}</text>
        <text :x="X(0) - 10" :y="Y(1.08) + 4" text-anchor="end" class="axis-label">{{ yLabel }}</text>

        <!-- fixed intercept -->
        <circle :cx="X(0)" :cy="Y(b)" r="3.5" fill="none" stroke="var(--bonn-blue)" stroke-width="1.5" />
        <text :x="X(0) - 8" :y="Y(b) + 4" text-anchor="end" class="tick-label">b</text>

        <!-- MSE: squared residuals as squares -->
        <g v-if="loss === 'mse'" :clip-path="`url(#${uid}-clip)`">
          <template v-for="r in residuals" :key="`sq-${r.i}`">
            <rect
              v-if="isActive(r.i)"
              :x="r.x" :y="r.top" :width="r.side" :height="r.side"
              fill="var(--grl-data-orange)" style="opacity: 0.22" stroke="var(--grl-data-orange)" stroke-width="1"
            />
          </template>
        </g>

        <!-- residual segments -->
        <template v-for="r in residuals" :key="`r-${r.i}`">
          <line
            v-if="isActive(r.i)"
            :x1="r.x" :y1="r.y" :x2="r.x" :y2="r.yh"
            stroke="var(--bonn-muted)" stroke-width="1.6" stroke-dasharray="3 2"
          />
        </template>

        <line :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" stroke="var(--bonn-blue)" stroke-width="2.5" />

        <template v-for="r in residuals" :key="`p-${r.i}`">
          <circle
            :cx="r.x" :cy="r.y" r="5" fill="var(--bonn-blue)"
            :style="{ opacity: isActive(r.i) ? 1 : 0.25, cursor: single ? 'pointer' : undefined }"
          />
          <circle v-if="isActive(r.i)" :cx="r.x" :cy="r.yh" r="4" fill="var(--grl-data-orange)" />
        </template>
      </svg>

      <!-- loss(w) -->
      <svg
        :viewBox="`-${LABEL_MARGIN} 0 ${PW + LABEL_MARGIN} ${PH}`"
        class="panel crosshair"
        @pointermove="onLossMove"
        @pointerdown="onLossMove"
      >
        <line :x1="padL" :y1="LY(0)" :x2="padL + plot + 6" :y2="LY(0)" stroke="var(--bonn-muted)" stroke-width="1.4" :marker-end="`url(#${uid}-arrow)`" />
        <line :x1="padL" :y1="LY(0)" :x2="padL" :y2="padT - 6" stroke="var(--bonn-muted)" stroke-width="1.4" :marker-end="`url(#${uid}-arrow)`" />

        <g v-for="t in wTicks" :key="`wt-${t}`">
          <line :x1="LX(t)" :y1="LY(0)" :x2="LX(t)" :y2="LY(0) + 4" stroke="var(--bonn-muted)" />
          <text :x="LX(t)" :y="LY(0) + 15" text-anchor="middle" class="tick-label">{{ fmt(t, t % 1 ? 1 : 0) }}</text>
        </g>
        <g v-for="t in scale.ticks" :key="`lt-${t}`">
          <line :x1="padL - 4" :y1="LY(t)" :x2="padL" :y2="LY(t)" stroke="var(--bonn-muted)" />
          <text :x="padL - 7" :y="LY(t) + 3.5" text-anchor="end" class="tick-label">{{ t }}</text>
        </g>
        <text :x="padL + plot + 6" :y="LY(0) + 28" text-anchor="end" class="axis-label">slope w</text>
        <text :x="padL + 8" :y="padT - 4" text-anchor="start" class="axis-label">{{ lossName }}(w; 𝒟)</text>

        <!-- optimum -->
        <template v-if="wStar >= W_RANGE[0] && wStar <= W_RANGE[1]">
          <line :x1="LX(wStar)" :y1="LY(0)" :x2="LX(wStar)" :y2="LY(lossAt(wStar))" stroke="var(--bonn-muted)" stroke-dasharray="2 3" />
          <circle :cx="LX(wStar)" :cy="LY(lossAt(wStar))" r="3" fill="var(--bonn-muted)" />
        </template>

        <path :d="curvePath" fill="none" stroke="var(--bonn-blue)" stroke-width="2.2" />

        <!-- current w -->
        <line :x1="LX(w)" :y1="LY(0)" :x2="LX(w)" :y2="LY(curLoss)" stroke="var(--grl-data-orange)" stroke-width="1.2" />
        <circle :cx="LX(w)" :cy="LY(curLoss)" r="6" fill="var(--grl-data-orange)" stroke="white" stroke-width="1.5" />
      </svg>
    </div>

    <div class="controls">
      <span class="readout">y = <b>{{ fmt(w) }}</b>·x + {{ fmt(b, 1) }}</span>
      <input v-model.number="w" type="range" :min="W_RANGE[0]" :max="W_RANGE[1]" step="0.01" aria-label="slope w">
      <span class="readout">{{ lossName }}(w; 𝒟) = <b>{{ curLoss.toFixed(3) }}</b></span>
    </div>
  </div>
</template>

<style scoped>
.slope-loss-demo {
  width: 100%;
}

.toggles {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: .3rem;
}

.seg {
  display: inline-flex;
  border: 1px solid var(--bonn-blue);
  border-radius: 6px;
  overflow: hidden;
}

.seg button {
  font-size: .65rem;
  font-weight: 600;
  padding: .15rem .6rem;
  color: var(--bonn-blue);
  background: transparent;
}

.seg button + button {
  border-left: 1px solid var(--bonn-blue);
}

.seg button.on {
  background: var(--bonn-blue);
  color: white;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.panel {
  display: block;
  width: 100%;
  height: auto;
  max-height: 225px;
  touch-action: none;
  user-select: none;
}

.draggable {
  cursor: ns-resize;
}

.crosshair {
  cursor: crosshair;
}

.axis-label {
  font-size: 11px;
  font-weight: 600;
  fill: var(--bonn-muted);
}

.tick-label {
  font-size: 10px;
  fill: var(--bonn-muted);
  font-style: normal;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: .3rem;
  font-size: .75rem;
  color: var(--bonn-text);
}

.controls input[type='range'] {
  width: 220px;
  accent-color: var(--grl-data-orange);
}

.readout {
  font-variant-numeric: tabular-nums;
  min-width: 9em;
  text-align: center;
}
</style>
