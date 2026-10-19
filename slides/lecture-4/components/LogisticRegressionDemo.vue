<script setup>
import { computed, ref } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import landCover from '../assets/land_cover_features.json'

// --- Plot geometry (SVG user units) ---------------------------------------
const W = 640, H = 400
const pad = { l: 48, r: 16, t: 16, b: 42 }
const plotX0 = pad.l, plotX1 = W - pad.r, plotY0 = pad.t, plotY1 = H - pad.b
const xDomain = [-0.6, 0.9] // NDVI
const yDomain = [0, 0.2] // Green reflectance (clips a handful of extreme outliers)
const xTicks = [-0.5, 0, 0.5]
const yTicks = [0, 0.05, 0.1, 0.15, 0.2]
const DRAG_MARGIN = 40 // px, lets handles travel a bit beyond the plot rect
const MIN_SEP_PX = 24 // minimum on-screen distance kept between the two handles

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z))
}

// --- Sigmoid-curve plot (bottom strip): z (distance to the decision boundary) on x,
// P = sigma(z) on y. Fixed curve shape; only the hover marker moves. ---
const SW = 640, SH = 118
const spad = { l: 40, r: 16, t: 10, b: 24 }
const sPlotX0 = spad.l, sPlotX1 = SW - spad.r, sPlotY0 = spad.t, sPlotY1 = SH - spad.b
const zDomain = [-3, 3]
const pDomain = [0, 1]
const zTicks = [-3, -1.5, 0, 1.5, 3]
const pTicks = [0, 0.5, 1]
function toPxSig(z, p) {
  return {
    x: sPlotX0 + (z - zDomain[0]) / (zDomain[1] - zDomain[0]) * (sPlotX1 - sPlotX0),
    y: sPlotY1 - (p - pDomain[0]) / (pDomain[1] - pDomain[0]) * (sPlotY1 - sPlotY0),
  }
}
const sigmoidCurveD = Array.from({ length: 121 }, (_, i) => {
  const z = zDomain[0] + (zDomain[1] - zDomain[0]) * i / 120
  const { x, y } = toPxSig(z, sigmoid(z))
  return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
}).join(' ')

function toPx({ x, y }) {
  return {
    x: plotX0 + (x - xDomain[0]) / (xDomain[1] - xDomain[0]) * (plotX1 - plotX0),
    y: plotY1 - (y - yDomain[0]) / (yDomain[1] - yDomain[0]) * (plotY1 - plotY0),
  }
}
function fromPx({ x, y }) {
  return {
    x: xDomain[0] + (x - plotX0) / (plotX1 - plotX0) * (xDomain[1] - xDomain[0]),
    y: yDomain[0] + (plotY1 - y) / (plotY1 - plotY0) * (yDomain[1] - yDomain[0]),
  }
}
function clampPx({ x, y }) {
  return {
    x: Math.min(Math.max(x, plotX0 - DRAG_MARGIN), plotX1 + DRAG_MARGIN),
    y: Math.min(Math.max(y, plotY0 - DRAG_MARGIN), plotY1 + DRAG_MARGIN),
  }
}

// --- Data points (fixed; pixel positions only need to be computed once) ---
// Color baked in as a single rgba() fill (rather than separate fill + fill-opacity
// attributes) to sidestep a rendering quirk where semi-transparent circle fills
// failed to paint in some browser/screenshot pipelines.
const VEGETATION_FILL = 'rgba(44, 160, 44, 0.55)'
const URBAN_FILL = 'rgba(214, 39, 40, 0.55)'
const pointsPx = landCover.points.map(p => ({
  ...toPx({ x: p.ndvi, y: p.green }),
  fill: p.label === 'vegetation' ? VEGETATION_FILL : URBAN_FILL,
}))

const clipId = `logit-demo-plot-clip-${Math.random().toString(36).slice(2)}`

// --- Draggable decision-boundary handles (data coordinates: x = NDVI, y = Green) ---
const p1 = ref({ x: 0.44, y: 0 })
const p2 = ref({ x: 0.46, y: 0.2 })
const dragging = ref(-1)

const p1px = computed(() => toPx(p1.value))
const p2px = computed(() => toPx(p2.value))

// w = [y1-y2, x2-x1], b = -w·p1  (line through p1, p2 in NDVI/Green space)
const w = computed(() => {
  const { x: x1, y: y1 } = p1.value
  const { x: x2, y: y2 } = p2.value
  const w1 = y1 - y2
  const w2 = x2 - x1
  const b = -(w1 * x1 + w2 * y1)
  return { w1, w2, b }
})
// Unit-normalize so the displayed coefficients don't depend on how far apart the handles are.
const wn = computed(() => {
  const { w1, w2, b } = w.value
  const norm = Math.hypot(w1, w2) || 1
  return { w1: w1 / norm, w2: w2 / norm, b: b / norm }
})

// --- Accuracy: best of the two possible side↔label assignments, since the sign of
// z = w·x+b is an arbitrary artifact of which way the handles were dragged, not a label.
// Thresholding the probability at 0.5 is equivalent to thresholding z at 0. ---
const accuracy = computed(() => {
  const { w1, w2, b } = wn.value
  let positiveIsVegetation = 0
  for (const p of landCover.points) {
    const score = w1 * p.ndvi + w2 * p.green + b
    if ((score >= 0) === (p.label === 'vegetation')) positiveIsVegetation++
  }
  const total = landCover.points.length
  return Math.max(positiveIsVegetation, total - positiveIsVegetation) / total
})

// --- Hover: predicted probability at the pointer, plus its distance to the boundary ---
const hover = ref(null) // data coords ({x: ndvi, y: green}) or null when not hovering
function onPlotMove(evt) {
  if (dragging.value !== -1) return
  const svg = evt.currentTarget.ownerSVGElement || evt.currentTarget
  if (!svg) return
  const px = svgPoint(svg, evt)
  if (px.x < plotX0 || px.x > plotX1 || px.y < plotY0 || px.y > plotY1) {
    hover.value = null
    return
  }
  hover.value = fromPx(px)
}
function onPlotLeave() {
  hover.value = null
}
const hoverInfo = computed(() => {
  if (!hover.value || dragging.value !== -1) return null
  const { w1, w2, b } = wn.value
  // The logit (signed distance in feature space) uses the true NDVI/Green coordinates;
  // the sigmoid then turns it into the predicted probability shown to the student.
  const z = w1 * hover.value.x + w2 * hover.value.y + b
  const p = sigmoid(z)
  // The drawn foot point is projected in PIXEL space: the x/y axes are scaled very
  // differently (NDVI over ~576px vs. Green over ~342px), so a "perpendicular" in data
  // space would not look perpendicular on screen. Project onto the on-screen line instead.
  const mousePx = toPx(hover.value)
  const a = p1px.value, c = p2px.value
  const d = { x: c.x - a.x, y: c.y - a.y }
  const lenSq = d.x * d.x + d.y * d.y
  const t = lenSq < 1e-9 ? 0 : ((mousePx.x - a.x) * d.x + (mousePx.y - a.y) * d.y) / lenSq
  const footPx = { x: a.x + t * d.x, y: a.y + t * d.y }
  return { mousePx, footPx, z, p }
})
// Where the hovered point lands on the sigmoid curve below, clamped to the visible z range.
const sigMarker = computed(() => {
  if (!hoverInfo.value) return null
  const z = Math.min(zDomain[1], Math.max(zDomain[0], hoverInfo.value.z))
  const p = sigmoid(z)
  return { ...toPxSig(z, p), z: hoverInfo.value.z, p }
})

function svgPoint(svg, evt) {
  const pt = svg.createSVGPoint()
  pt.x = evt.clientX
  pt.y = evt.clientY
  const ctm = svg.getScreenCTM()
  if (!ctm) return { x: 0, y: 0 }
  const loc = pt.matrixTransform(ctm.inverse())
  return { x: loc.x, y: loc.y }
}

function startDrag(i, evt) {
  evt.preventDefault()
  evt.stopPropagation()
  dragging.value = i
  evt.target.setPointerCapture?.(evt.pointerId)
}
function onDrag(i, evt) {
  if (dragging.value !== i) return
  evt.preventDefault()
  evt.stopPropagation()
  const svg = evt.currentTarget.ownerSVGElement
  if (!svg) return
  const next = clampPx(svgPoint(svg, evt))
  const other = i === 0 ? p2px.value : p1px.value
  if (Math.hypot(next.x - other.x, next.y - other.y) < MIN_SEP_PX) return
  const data = fromPx(next)
  if (i === 0) p1.value = data
  else p2.value = data
}
function endDrag(evt) {
  evt.preventDefault()
  evt.stopPropagation()
  dragging.value = -1
}

// --- Clip the (infinite) boundary line to the plot rectangle --------------
function clipLine(p, d) {
  let t0 = -Infinity, t1 = Infinity
  const edges = [
    [-d.x, p.x - plotX0],
    [d.x, plotX1 - p.x],
    [-d.y, p.y - plotY0],
    [d.y, plotY1 - p.y],
  ]
  for (const [pp, q] of edges) {
    if (pp === 0) {
      if (q < 0) return null
    }
    else {
      const r = q / pp
      if (pp < 0) { if (r > t1) return null; if (r > t0) t0 = r }
      else { if (r < t0) return null; if (r < t1) t1 = r }
    }
  }
  if (!Number.isFinite(t0) || !Number.isFinite(t1)) return null
  return { a: { x: p.x + t0 * d.x, y: p.y + t0 * d.y }, b: { x: p.x + t1 * d.x, y: p.y + t1 * d.y } }
}
const linePx = computed(() => {
  const a = p1px.value, b = p2px.value
  const d = { x: b.x - a.x, y: b.y - a.y }
  if (Math.hypot(d.x, d.y) < 1e-6) return null
  return clipLine(a, d)
})

// --- Subtle "+"/"-" side indicators (sign of the logit either side of P = 0.5) -------
const signLabels = computed(() => {
  const line = linePx.value
  if (!line) return null
  const mid = { x: (line.a.x + line.b.x) / 2, y: (line.a.y + line.b.y) / 2 }
  const dir = { x: line.b.x - line.a.x, y: line.b.y - line.a.y }
  const len = Math.hypot(dir.x, dir.y) || 1
  const n = { x: -dir.y / len, y: dir.x / len }
  const OFFSET = 34
  const posA = { x: mid.x + n.x * OFFSET, y: mid.y + n.y * OFFSET }
  const posB = { x: mid.x - n.x * OFFSET, y: mid.y - n.y * OFFSET }
  const dataA = fromPx(posA)
  const scoreA = wn.value.w1 * dataA.x + wn.value.w2 * dataA.y + wn.value.b
  return scoreA >= 0 ? { plus: posA, minus: posB } : { plus: posB, minus: posA }
})

// --- Math panel (KaTeX) -----------------------------------------------------
function katexHtml(tex, displayMode = true) {
  return katex.renderToString(tex, { throwOnError: false, displayMode })
}
const generalHtml = katexHtml(String.raw`P(y{=}1 \mid \mathbf{x}) = \sigma\!\left(w_1\,\mathrm{NDVI} + w_2\,\mathrm{Green} + b\right)`)
const vectorHtml = katexHtml(String.raw`P(y{=}1 \mid \mathbf{x}) = \sigma\!\left(\mathbf{w}^{\top}\mathbf{x} + b\right)`)
const sigmoidHtml = katexHtml(String.raw`\sigma(z) = \dfrac{1}{1 + e^{-z}}`, false)

function fmt(n) {
  const v = Math.abs(n) < 0.005 ? 0 : n
  return v.toFixed(2)
}
const liveHtml = computed(() => {
  const { w1, w2, b } = wn.value
  const term2 = w2 >= 0 ? `+ ${fmt(w2)}` : `- ${fmt(Math.abs(w2))}`
  const term3 = b >= 0 ? `+ ${fmt(b)}` : `- ${fmt(Math.abs(b))}`
  return katexHtml(String.raw`z = ${fmt(w1)}\,\mathrm{NDVI} ${term2}\,\mathrm{Green} ${term3}`)
})
const liveEqText = computed(() => {
  const { w1, w2, b } = wn.value
  return `Decision boundary at z = 0: ${fmt(w1)} NDVI ${w2 >= 0 ? '+' : '-'} ${fmt(Math.abs(w2))} Green ${b >= 0 ? '+' : '-'} ${fmt(Math.abs(b))} = 0`
})
</script>

<template>
  <div class="lin-demo" @click.stop @dblclick.stop @pointerdown.stop>
   <div class="top-row">
    <div class="plot-wrap">
      <svg
        :viewBox="`0 0 ${W} ${H}`"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Scatter plot of NDVI versus Green reflectance for vegetation and urban land cover, with a draggable logistic regression decision boundary"
        @pointermove="onPlotMove"
        @pointerleave="onPlotLeave"
      >
        <defs>
          <clipPath :id="clipId">
            <rect :x="plotX0" :y="plotY0" :width="plotX1 - plotX0" :height="plotY1 - plotY0" />
          </clipPath>
        </defs>

        <!-- axes -->
        <g class="axis">
          <line :x1="plotX0" :y1="plotY1" :x2="plotX1" :y2="plotY1" class="axis-line" />
          <line :x1="plotX0" :y1="plotY0" :x2="plotX0" :y2="plotY1" class="axis-line" />
          <g v-for="t in xTicks" :key="`xt-${t}`">
            <line :x1="toPx({ x: t, y: yDomain[0] }).x" :x2="toPx({ x: t, y: yDomain[0] }).x" :y1="plotY1" :y2="plotY1 + 4" class="tick-mark" />
            <text :x="toPx({ x: t, y: yDomain[0] }).x" :y="plotY1 + 16" class="tick-label" text-anchor="middle">{{ t }}</text>
          </g>
          <g v-for="t in yTicks" :key="`yt-${t}`">
            <line :x1="plotX0 - 4" :x2="plotX0" :y1="toPx({ x: xDomain[0], y: t }).y" :y2="toPx({ x: xDomain[0], y: t }).y" class="tick-mark" />
            <text :x="plotX0 - 8" :y="toPx({ x: xDomain[0], y: t }).y + 3" class="tick-label" text-anchor="end">{{ t }}</text>
          </g>
          <text :x="(plotX0 + plotX1) / 2" :y="H - 6" class="axis-title" text-anchor="middle">NDVI</text>
          <text :x="14" :y="(plotY0 + plotY1) / 2" class="axis-title" text-anchor="middle" :transform="`rotate(-90 14 ${(plotY0 + plotY1) / 2})`">Green reflectance</text>
        </g>

        <!-- data points -->
        <g :clip-path="`url(#${clipId})`">
          <circle
            v-for="(p, i) in pointsPx" :key="i"
            :cx="p.x" :cy="p.y" r="2.6"
            :fill="p.fill"
          />
        </g>

        <!-- decision boundary (P = 0.5) -->
        <line
          v-if="linePx"
          :x1="linePx.a.x" :y1="linePx.a.y" :x2="linePx.b.x" :y2="linePx.b.y"
          class="boundary-line"
        />
        <g v-if="signLabels" class="sign-labels">
          <text :x="signLabels.plus.x" :y="signLabels.plus.y" text-anchor="middle" dominant-baseline="middle">+</text>
          <text :x="signLabels.minus.x" :y="signLabels.minus.y" text-anchor="middle" dominant-baseline="middle">&minus;</text>
        </g>

        <!-- draggable handles -->
        <g
          v-for="(pt, i) in [p1px, p2px]" :key="`handle-${i}`"
          class="handle" :class="{ active: dragging === i }"
          style="touch-action: none;"
          @pointerdown="startDrag(i, $event)"
          @pointermove="onDrag(i, $event)"
          @pointerup="endDrag($event)"
          @pointercancel="endDrag($event)"
        >
          <circle :cx="pt.x" :cy="pt.y" r="13" fill="transparent" />
          <circle :cx="pt.x" :cy="pt.y" r="6" class="handle-dot" />
        </g>

        <!-- legend -->
        <g class="legend" :transform="`translate(${plotX1 - 118}, ${plotY0 + 8})`">
          <circle cx="4" cy="4" r="4" :fill="VEGETATION_FILL" />
          <text x="12" y="7">Vegetation</text>
          <circle cx="4" cy="18" r="4" :fill="URBAN_FILL" />
          <text x="12" y="21">Urban / Built-up</text>
        </g>

        <!-- hover: predicted probability at the pointer -->
        <g v-if="hoverInfo" class="hover-probe" :class="{ positive: hoverInfo.z >= 0, negative: hoverInfo.z < 0 }">
          <line :x1="hoverInfo.mousePx.x" :y1="hoverInfo.mousePx.y" :x2="hoverInfo.footPx.x" :y2="hoverInfo.footPx.y" class="hover-line" />
          <circle :cx="hoverInfo.footPx.x" :cy="hoverInfo.footPx.y" r="2.5" class="hover-foot" />
          <circle :cx="hoverInfo.mousePx.x" :cy="hoverInfo.mousePx.y" r="3.5" class="hover-dot" />
          <text
            :x="hoverInfo.mousePx.x + (hoverInfo.mousePx.x > (plotX0 + plotX1) / 2 ? -10 : 10)"
            :y="hoverInfo.mousePx.y - 10"
            class="hover-label"
            :text-anchor="hoverInfo.mousePx.x > (plotX0 + plotX1) / 2 ? 'end' : 'start'"
          >P = {{ fmt(hoverInfo.p) }}</text>
        </g>
      </svg>
    </div>

    <div class="math-panel">
      <div class="panel-title">Logistic Regression Model <span v-html="katexHtml('P(y\\mid \\mathbf{x})', false)" /></div>
      <div class="katex-block" v-html="generalHtml" />
      <div class="katex-block small" v-html="vectorHtml" />
      <div class="sigmoid-note">
        where <span v-html="sigmoidHtml" /> squashes the score into a probability in (0, 1).
      </div>
      <div class="live-box">
        <div class="live-label">Decision boundary &middot; P = 0.5</div>
        <div class="katex-block live" :aria-label="liveEqText" v-html="liveHtml" />
      </div>
      <div class="accuracy-row">
        <span class="accuracy-label">Accuracy</span>
        <span class="accuracy-value">{{ (accuracy * 100).toFixed(1) }}%</span>
        <span class="accuracy-note">({{ landCover.points.length }} points)</span>
      </div>
      <div class="hint">Drag either handle to reposition the boundary. Hover the plot to read the predicted probability.</div>
    </div>
   </div>

    <div class="sigmoid-wrap">
      <div class="sigmoid-caption">The logistic (sigmoid) function &mdash; squashing the score <em>z</em> into a probability</div>
      <svg
        :viewBox="`0 0 ${SW} ${SH}`"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="The sigmoid curve, mapping the logit score to a probability between 0 and 1, with a marker showing the currently hovered point"
      >
        <!-- axes -->
        <g class="axis">
          <line :x1="sPlotX0" :y1="sPlotY1" :x2="sPlotX1" :y2="sPlotY1" class="axis-line" />
          <line :x1="sPlotX0" :y1="sPlotY0" :x2="sPlotX0" :y2="sPlotY1" class="axis-line" />
          <g v-for="t in zTicks" :key="`szt-${t}`">
            <line :x1="toPxSig(t, 0).x" :x2="toPxSig(t, 0).x" :y1="sPlotY1" :y2="sPlotY1 + 4" class="tick-mark" />
            <text :x="toPxSig(t, 0).x" :y="sPlotY1 + 14" class="tick-label" text-anchor="middle">{{ t }}</text>
          </g>
          <g v-for="t in pTicks" :key="`spt-${t}`">
            <line :x1="sPlotX0 - 4" :x2="sPlotX0" :y1="toPxSig(zDomain[0], t).y" :y2="toPxSig(zDomain[0], t).y" class="tick-mark" />
            <text :x="sPlotX0 - 8" :y="toPxSig(zDomain[0], t).y + 3" class="tick-label" text-anchor="end">{{ t }}</text>
          </g>
          <text :x="(sPlotX0 + sPlotX1) / 2" :y="SH - 4" class="axis-title" text-anchor="middle">z &nbsp;(distance to boundary)</text>
          <text :x="12" :y="(sPlotY0 + sPlotY1) / 2" class="axis-title" text-anchor="middle" :transform="`rotate(-90 12 ${(sPlotY0 + sPlotY1) / 2})`">P</text>
        </g>

        <!-- P = 0.5 / z = 0 reference (the decision boundary) -->
        <line :x1="toPxSig(0, 0).x" :y1="sPlotY0" :x2="toPxSig(0, 0).x" :y2="sPlotY1" class="ref-line" />
        <line :x1="sPlotX0" :y1="toPxSig(0, 0.5).y" :x2="sPlotX1" :y2="toPxSig(0, 0.5).y" class="ref-line" />

        <!-- the sigmoid curve itself -->
        <path :d="sigmoidCurveD" class="sigmoid-curve" />

        <!-- marker: where the hovered point (from the scatter plot above) sits on the curve -->
        <g v-if="sigMarker" class="sig-marker" :class="{ positive: sigMarker.z >= 0, negative: sigMarker.z < 0 }">
          <line :x1="sigMarker.x" :y1="sigMarker.y" :x2="sigMarker.x" :y2="sPlotY1" class="sig-guide" />
          <line :x1="sPlotX0" :y1="sigMarker.y" :x2="sigMarker.x" :y2="sigMarker.y" class="sig-guide" />
          <circle :cx="sigMarker.x" :cy="sigMarker.y" r="4" class="sig-dot" />
          <text :x="sigMarker.x" :y="sigMarker.y - 9" class="sig-label" :text-anchor="sigMarker.x > (sPlotX0 + sPlotX1) / 2 ? 'end' : 'start'">P = {{ fmt(sigMarker.p) }}</text>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.lin-demo {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 366px;
  font: 12px/1.3 Arial, Helvetica, sans-serif;
  color: #222;
}
.top-row {
  flex: 0 0 240px;
  display: grid;
  grid-template-columns: 5fr 3fr;
  gap: 14px;
  min-height: 0;
}
.plot-wrap { min-width: 0; min-height: 0; display: flex; align-items: center; }
.plot-wrap svg { width: 100%; height: 100%; max-height: 240px; display: block; touch-action: none; user-select: none; }

.axis-line { stroke: #8b8f8d; stroke-width: 1; }
.tick-mark { stroke: #8b8f8d; stroke-width: 1; }
.tick-label { fill: #5f625f; font-size: 10px; }
.axis-title { fill: #5f625f; font-size: 11px; font-weight: 600; }

.boundary-line { stroke: #00457c; stroke-width: 2.4; }
.sign-labels text { fill: #00457c; font-size: 15px; font-weight: 700; opacity: 0.35; }

.handle { cursor: grab; }
.handle.active { cursor: grabbing; }
.handle-dot { fill: #ffffff; stroke: #00457c; stroke-width: 2.2; }
.handle:hover .handle-dot, .handle.active .handle-dot { stroke: #f2c300; }

.legend circle { }
.legend text { fill: #5f625f; font-size: 10px; }

.hover-probe { pointer-events: none; }
.hover-probe .hover-line { stroke-width: 1.4; stroke-dasharray: 3 3; }
.hover-probe .hover-dot { stroke: #ffffff; stroke-width: 1.2; }
.hover-probe .hover-foot { fill: #ffffff; stroke-width: 1.6; }
.hover-probe .hover-label { font-size: 11px; font-weight: 700; }
.hover-probe.positive .hover-line, .hover-probe.positive .hover-dot { stroke: #00457c; fill: #00457c; }
.hover-probe.positive .hover-foot { stroke: #00457c; }
.hover-probe.positive .hover-label { fill: #00457c; }
.hover-probe.negative .hover-line, .hover-probe.negative .hover-dot { stroke: #b45309; fill: #b45309; }
.hover-probe.negative .hover-foot { stroke: #b45309; }
.hover-probe.negative .hover-label { fill: #b45309; }

.math-panel { min-width: 0; min-height: 0; overflow: hidden; display: flex; flex-direction: column; gap: 6px; justify-content: center; }
.panel-title { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; color: #5f625f; margin-bottom: -2px; display: flex; align-items: baseline; gap: 4px; }
.panel-title :deep(.katex) { font-size: 12px; text-transform: none; }
.katex-block { font-size: 11px; color: #222; }
.katex-block.small { color: #5f625f; }
.katex-block :deep(.katex-display) { margin: 2px 0; overflow: hidden; }
.katex-block.live :deep(.katex-display) { margin: 0; }
.katex-block :deep(.katex) { max-width: 100%; }

.sigmoid-note { font-size: 9.5px; color: #5f625f; line-height: 1.3; }
.sigmoid-note :deep(.katex) { font-size: 11px; }

.live-box {
  border-left: 3px solid #f2c300;
  background: #eef5fa;
  border-radius: 0 6px 6px 0;
  padding: 7px 8px;
  min-width: 0;
}
.live-label { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #00457c; margin-bottom: 3px; }
.katex-block.live { font-size: 10.5px; }

.accuracy-row { display: flex; align-items: baseline; gap: 6px; font-size: 11px; }
.accuracy-label { color: #5f625f; }
.accuracy-value { font-weight: 700; color: #00457c; font-size: 13px; }
.accuracy-note { color: #8b8f8d; font-size: 9.5px; }

.hint { font-size: 10px; color: #5f625f; }

.sigmoid-wrap {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-top: 1px solid #e4e6e5;
  padding-top: 6px;
}
.sigmoid-caption { font-size: 10px; font-weight: 600; color: #5f625f; }
.sigmoid-caption em { font-style: italic; color: #00457c; }
.sigmoid-wrap svg { width: 100%; flex: 1 1 auto; min-height: 0; display: block; }

.ref-line { stroke: #d7d9d8; stroke-width: 1; stroke-dasharray: 2 3; }
.sigmoid-curve { fill: none; stroke: #00457c; stroke-width: 2; }

.sig-marker { pointer-events: none; }
.sig-marker .sig-guide { stroke-width: 1; stroke-dasharray: 3 3; }
.sig-marker .sig-dot { stroke: #ffffff; stroke-width: 1.4; }
.sig-marker .sig-label { font-size: 10.5px; font-weight: 700; }
.sig-marker.positive .sig-guide, .sig-marker.positive .sig-dot { stroke: #00457c; }
.sig-marker.positive .sig-dot { fill: #00457c; }
.sig-marker.positive .sig-label { fill: #00457c; }
.sig-marker.negative .sig-guide, .sig-marker.negative .sig-dot { stroke: #b45309; }
.sig-marker.negative .sig-dot { fill: #b45309; }
.sig-marker.negative .sig-label { fill: #b45309; }
</style>
