<script setup>
import { computed, ref } from 'vue'

// --- Model classes: degree-d polynomials, dim(H_d) = d + 1 free coefficients ---
const OPTIONS = [
  { degree: 1, label: 'Linear', space: 'ℋ₁', dimension: 2 },
  { degree: 2, label: 'Quadratic', space: 'ℋ₂', dimension: 3 },
  { degree: 3, label: 'Cubic', space: 'ℋ₃', dimension: 4 },
]

// --- Plot geometry (SVG user units) ---------------------------------------
const W = 480, H = 176
const pad = { l: 14, r: 14, t: 14, b: 26 }
const plotX0 = pad.l, plotX1 = W - pad.r, plotY0 = pad.t, plotY1 = H - pad.b
const xDomain = [-1, 1]
const N_SAMPLES = 140

const SUBSCRIPTS = ['₁', '₂', '₃', '₄']

function alternatingLabeling(n) {
  return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? -1 : 1))
}

// --- State ------------------------------------------------------------------
const degree = ref(1)
const labels = ref(alternatingLabeling(2))

const selected = computed(() => OPTIONS.find(option => option.degree === degree.value))
const totalPatterns = computed(() => 2 ** labels.value.length)

// Bit i of the pattern index reflects the sign of point i — kept in sync so
// clicking a point and pressing "Next labeling" both move through the same sequence.
const patternIndex = computed(() =>
  labels.value.reduce((value, label, i) => value + (label > 0 ? 2 ** i : 0), 0),
)

function selectDegree(nextDegree) {
  degree.value = nextDegree
  labels.value = alternatingLabeling(nextDegree + 1)
}

function setPattern(index) {
  labels.value = labels.value.map((_, i) => (index & (2 ** i) ? 1 : -1))
}

function nextPattern() {
  setPattern((patternIndex.value + 1) % totalPatterns.value)
}

function toggleLabel(i) {
  const next = [...labels.value]
  next[i] *= -1
  labels.value = next
}

// --- Lagrange interpolation: the unique degree-<=d polynomial with p(x_i) = y_i ---
function evaluatePolynomial(x, xs, ys) {
  return xs.reduce((sum, xi, i) => {
    let basis = 1
    for (let j = 0; j < xs.length; j++) {
      if (j !== i)
        basis *= (x - xs[j]) / (xi - xs[j])
    }
    return sum + ys[i] * basis
  }, 0)
}

function scaleX(x) {
  return plotX0 + (x - xDomain[0]) / (xDomain[1] - xDomain[0]) * (plotX1 - plotX0)
}

// --- Everything derived from (degree, labels): sample points, curve path, ---
// dynamic y-range (so the curve is never clipped), region split, plot points ---
const plot = computed(() => {
  const n = degree.value + 1
  const xs = n === 1
    ? [0]
    : Array.from({ length: n }, (_, i) => -0.72 + 1.44 * i / (n - 1))
  const ys = labels.value

  const samples = Array.from({ length: N_SAMPLES + 1 }, (_, i) => {
    const x = -0.92 + 1.84 * i / N_SAMPLES
    return { x, y: evaluatePolynomial(x, xs, ys) }
  })

  // Always include -1/0/1 so the threshold line and point markers stay in view
  // even when a curve happens to stay flat, and pad so peaks are never clipped.
  const allY = [-1, 0, 1, ...samples.map(s => s.y)]
  const minimum = Math.min(...allY)
  const maximum = Math.max(...allY)
  const padding = Math.max(0.2, 0.12 * (maximum - minimum))
  const yMin = minimum - padding
  const yMax = maximum + padding

  const scaleY = y => plotY0 + (yMax - y) / (yMax - yMin) * (plotY1 - plotY0)

  const path = samples
    .map((s, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(s.x).toFixed(2)} ${scaleY(s.y).toFixed(2)}`)
    .join(' ')

  return {
    path,
    zeroY: scaleY(0),
    points: xs.map((x, i) => ({
      x: scaleX(x),
      y: scaleY(ys[i]),
      label: ys[i],
      xLabel: `x${SUBSCRIPTS[i] || i + 1}`,
    })),
  }
})

const svgLabel = computed(() =>
  `${selected.value.label} classifier through ${selected.value.dimension} points, `
  + `currently labeled ${labels.value.map(l => (l > 0 ? '+1' : '-1')).join(', ')}. `
  + 'Each point can be activated to flip its label.',
)
</script>

<template>
  <div class="vcdemo">
    <div class="controls">
      <div class="model-select" role="group" aria-label="Hypothesis class">
        <button
          v-for="option in OPTIONS" :key="option.degree"
          type="button"
          :class="{ active: degree === option.degree }"
          @click="selectDegree(option.degree)"
        >
          {{ option.label }}
        </button>
      </div>

      <span class="dim-readout">dim({{ selected.space }}) = {{ selected.dimension }}</span>

      <span class="pattern-readout">Labeling {{ patternIndex + 1 }} / {{ totalPatterns }}</span>

      <button type="button" class="next-button" @click="nextPattern">
        Next labeling
      </button>
    </div>

    <div class="plot-wrap">
      <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="xMidYMid meet" :aria-label="svgLabel">
        <rect
          :x="plotX0" :y="plotY0" :width="plotX1 - plotX0" :height="Math.max(0, plot.zeroY - plotY0)"
          class="region-positive"
        />
        <rect
          :x="plotX0" :y="plot.zeroY" :width="plotX1 - plotX0" :height="Math.max(0, plotY1 - plot.zeroY)"
          class="region-negative"
        />

        <line :x1="plotX0" :x2="plotX1" :y1="plot.zeroY" :y2="plot.zeroY" class="threshold" />
        <text :x="plotX1" :y="plot.zeroY - 4" text-anchor="end" class="threshold-label">p(x) = 0</text>

        <g v-for="(point, i) in plot.points" :key="i">
          <line :x1="point.x" :x2="point.x" :y1="plotY0" :y2="plotY1" class="guide" />
        </g>

        <path :d="plot.path" class="curve" />

        <g
          v-for="(point, i) in plot.points" :key="i"
          class="sample" tabindex="0" role="button"
          :aria-label="`Point ${point.xLabel}, label ${point.label > 0 ? '+1' : '-1'}. Activate to flip its label.`"
          @click="toggleLabel(i)"
          @keydown.enter.prevent="toggleLabel(i)"
          @keydown.space.prevent="toggleLabel(i)"
        >
          <circle :cx="point.x" :cy="point.y" r="11" class="hit-area" />
          <circle :cx="point.x" :cy="point.y" r="5.5" :class="point.label > 0 ? 'point-positive' : 'point-negative'" />
          <text :x="point.x" :y="point.y + (point.label > 0 ? -11 : 17)" text-anchor="middle" class="point-label">
            {{ point.label > 0 ? '+1' : '−1' }}
          </text>
          <text :x="point.x" :y="plotY1 + 15" text-anchor="middle" class="x-label">{{ point.xLabel }}</text>
        </g>
      </svg>
    </div>

    <div class="instruction">
      Click a point to change its label. The polynomial adapts to every labeling.
    </div>
  </div>
</template>

<style scoped>
.vcdemo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 100%;
  font: 11px/1.3 Arial, Helvetica, sans-serif;
  color: #222;
  user-select: none;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.model-select {
  display: flex;
  gap: 3px;
}

.model-select button,
.next-button {
  border: 1px solid #b8c2cc;
  border-radius: 5px;
  padding: 2px 8px;
  background: #ffffff;
  color: #222;
  font: inherit;
  font-size: 10px;
  line-height: 1.4;
  cursor: pointer;
}

.model-select button:hover {
  border-color: #00457c;
}

.model-select button.active {
  border-color: #00457c;
  background: #00457c;
  color: #ffffff;
  font-weight: 700;
}

.next-button {
  margin-left: auto;
  border-color: #00457c;
  background: #00457c;
  color: #ffffff;
  font-weight: 600;
}

.next-button:hover {
  background: #003a68;
}

.model-select button:focus-visible,
.next-button:focus-visible {
  outline: 2px solid #f2c300;
  outline-offset: 1px;
}

.sample:focus-visible {
  outline: none;
}

.sample:focus-visible .hit-area {
  fill: rgba(242, 195, 0, 0.18);
  stroke: #f2c300;
  stroke-width: 2;
}

.dim-readout {
  font-weight: 700;
  color: #00457c;
  font-size: 10.5px;
  white-space: nowrap;
}

.pattern-readout {
  color: #5f625f;
  font-size: 9.5px;
  white-space: nowrap;
}

.plot-wrap {
  flex: 1;
  min-height: 0;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #ffffff;
  overflow: hidden;
}

.plot-wrap svg {
  width: 100%;
  height: 100%;
  display: block;
}

.region-positive { fill: rgba(0, 69, 124, 0.07); }
.region-negative { fill: rgba(220, 38, 38, 0.07); }

.threshold { stroke: #8b8f8d; stroke-width: 1; }
.threshold-label { fill: #8b8f8d; font-size: 8px; }

.guide { stroke: #d7d9d8; stroke-width: 1; stroke-dasharray: 2 3; }

.curve { fill: none; stroke: #00457c; stroke-width: 2.2; }

.sample { cursor: pointer; outline: none; }
.hit-area { fill: transparent; }

.point-positive { fill: #00457c; stroke: #ffffff; stroke-width: 1.5; }
.point-negative { fill: #dc2626; stroke: #ffffff; stroke-width: 1.5; }

.sample:hover .point-positive,
.sample:focus-visible .point-positive { stroke: #f2c300; }
.sample:hover .point-negative,
.sample:focus-visible .point-negative { stroke: #f2c300; }

.point-label { font-size: 9.5px; font-weight: 700; fill: #374151; }
.x-label { font-size: 9px; fill: #5f625f; }

.instruction {
  flex-shrink: 0;
  text-align: center;
  color: #8b8f8d;
  font-size: 9.5px;
}
</style>
