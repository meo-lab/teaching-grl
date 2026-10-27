<script setup lang="ts">
import { computed } from 'vue'
import happyUrl from '../figures/dt_sunflower_happy.png'
import unhappyUrl from '../figures/dt_sunflower_unhappy.png'

// Regression trees on sunflower happiness vs. temperature.
//   points      raw data
//   leaf-means  three regions, each leaf predicts the region mean
//   variance    node X ≤ 30 °C before splitting (click 0: residuals, 1: squares),
//               click 2: after splitting at 10 °C — much smaller squares
//   threshold   two regions defined by a threshold τ with their means
type Variant = 'points' | 'leaf-means' | 'variance' | 'threshold'

const props = withDefaults(defineProps<{
  variant: Variant
  clicks?: number
  // threshold position in °C for the 'threshold' variant
  tau?: number
}>(), {
  clicks: Infinity,
  tau: 20,
})

const W = 380
const H = 270
const ox = 70
const oy = 222
const pw = 290
const ph = 180
const TMAX = 40
const X = (t: number) => ox + (t / TMAX) * pw
const Y = (v: number) => oy - v * ph

// (temperature °C, happiness)
const DATA: [number, number][] = [
  [1.5, 0.12], [3.5, 0.30], [5.0, 0.05], [6.5, 0.22], [8.0, 0.36], [9.0, 0.10],
  [11.5, 0.78], [13.5, 0.95], [15.0, 0.70], [17.0, 1.02], [19.0, 0.84], [21.0, 0.98], [23.0, 0.74], [25.5, 0.90], [28.0, 0.80],
  [31.0, 0.20], [32.5, 0.06], [34.0, 0.28], [35.5, 0.12], [37.0, 0.24], [38.5, 0.04],
]

function mean(pts: [number, number][]) {
  return pts.reduce((s, p) => s + p[1], 0) / Math.max(pts.length, 1)
}

interface Region { a: number, b: number, mu: number, pts: [number, number][], name?: string, mu_label?: string, faded?: boolean }

function region(a: number, b: number, extra: Partial<Region> = {}): Region {
  const pts = DATA.filter(p => p[0] >= a && p[0] < b)
  return { a, b, pts, mu: mean(pts), ...extra }
}

const c = computed(() => (props.clicks === Infinity ? 2 : props.clicks))

const regions = computed<Region[]>(() => {
  switch (props.variant) {
    case 'leaf-means':
      return [
        region(0, 10, { name: 'R₁', mu_label: 'μ₁' }),
        region(10, 30, { name: 'R₂', mu_label: 'μ₂' }),
        region(30, TMAX, { name: 'R₃', mu_label: 'μ₃' }),
      ]
    case 'variance':
      if (c.value < 2) {
        return [
          region(0, 30, { name: 'X ≤ 30 °C', mu_label: 'μ' }),
          region(30, TMAX, { name: 'R₃', mu_label: 'μ₃', faded: true }),
        ]
      }
      return [
        region(0, 10, { name: 'R₁', mu_label: 'μ₁' }),
        region(10, 30, { name: 'R₂', mu_label: 'μ₂' }),
        region(30, TMAX, { name: 'R₃', mu_label: 'μ₃', faded: true }),
      ]
    case 'threshold':
      return [
        region(0, props.tau, { name: 'R₁', mu_label: 'μ_R₁' }),
        region(props.tau, TMAX, { name: 'R₂', mu_label: 'μ_R₂' }),
      ]
    default:
      return []
  }
})

const showSticks = computed(() =>
  props.variant === 'threshold' || (props.variant === 'variance' && c.value !== 1),
)
const showSquares = computed(() => props.variant === 'variance' && c.value >= 1)

const boundaries = computed(() => {
  const b = new Set<number>()
  regions.value.forEach((r) => { if (r.a > 0) b.add(r.a) })
  return [...b]
})

const pointsOut = computed(() => DATA.map(([t, v]) => {
  const r = regions.value.find(r => t >= r.a && t < r.b)
  return { x: X(t), y: Y(v), faded: r?.faded ?? false, t, v, mu: r?.mu }
}))

const ICON = 30
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="regression-tree-demo" preserveAspectRatio="xMidYMid meet">
    <defs>
      <marker id="rtd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--bonn-muted)" />
      </marker>
    </defs>

    <!-- axes -->
    <line :x1="X(0)" :y1="Y(0) + 6" :x2="X(TMAX) + 10" :y2="Y(0) + 6" stroke="var(--bonn-muted)" stroke-width="1.4" marker-end="url(#rtd-arrow)" />
    <line :x1="X(0)" :y1="Y(0) + 6" :x2="X(0)" :y2="Y(1.12)" stroke="var(--bonn-muted)" stroke-width="1.4" marker-end="url(#rtd-arrow)" />
    <text :x="X(TMAX) + 10" :y="Y(0) + 40" text-anchor="end" class="axis-label">temperature X</text>
    <text :x="X(0) - 4" :y="Y(1.12) - 6" text-anchor="middle" class="axis-label">sunflower happiness y</text>
    <image :href="happyUrl" :x="X(0) - 62" :y="Y(1) - ICON / 2" :width="ICON" :height="ICON" />
    <image :href="unhappyUrl" :x="X(0) - 62" :y="Y(0) - ICON / 2" :width="ICON" :height="ICON" />
    <text :x="X(0) - 10" :y="Y(1) + 4" text-anchor="end" class="tick">1</text>
    <text :x="X(0) - 10" :y="Y(0) + 4" text-anchor="end" class="tick">0</text>

    <!-- region boundaries + labels -->
    <g v-for="b in boundaries" :key="`b-${b}`">
      <line :x1="X(b)" :y1="Y(1.08)" :x2="X(b)" :y2="Y(0) + 6" stroke="var(--bonn-muted)" stroke-dasharray="4 3" />
      <text v-if="variant === 'threshold'" :x="X(b)" :y="Y(0) + 22" text-anchor="middle" class="tau">τ</text>
    </g>
    <g v-for="(r, i) in regions" :key="`r-${i}`" :style="{ opacity: r.faded ? 0.35 : 1 }">
      <text v-if="r.name" :x="(X(r.a) + X(r.b)) / 2" :y="Y(0) + 24" text-anchor="middle" class="region">{{ r.name }}</text>
    </g>

    <!-- squared residuals -->
    <g v-if="showSquares">
      <rect
        v-for="(p, i) in pointsOut.filter(p => !p.faded && p.mu !== undefined)" :key="`sq-${i}`"
        :x="p.x" :y="Math.min(p.y, Y(p.mu!))" :width="Math.abs(p.y - Y(p.mu!))" :height="Math.abs(p.y - Y(p.mu!))"
        fill="var(--grl-data-green)" fill-opacity="0.18" stroke="var(--grl-data-green)" stroke-width="0.8" stroke-dasharray="3 2"
      />
    </g>

    <!-- residual sticks -->
    <g v-if="showSticks">
      <line
        v-for="(p, i) in pointsOut.filter(p => !p.faded && p.mu !== undefined)" :key="`st-${i}`"
        :x1="p.x" :y1="p.y" :x2="p.x" :y2="Y(p.mu!)"
        stroke="var(--grl-data-green)" stroke-width="1.2" stroke-dasharray="3 2"
      />
    </g>

    <!-- region means -->
    <g v-for="(r, i) in regions" :key="`m-${i}`" :style="{ opacity: r.faded ? 0.35 : 1 }">
      <line :x1="X(r.a) + 4" :y1="Y(r.mu)" :x2="X(r.b) - 4" :y2="Y(r.mu)" stroke="var(--bonn-blue)" stroke-width="3" />
      <text v-if="r.mu_label" :x="X(r.b) - 6" :y="Y(r.mu) - 6" text-anchor="end" class="mu">{{ r.mu_label }}</text>
    </g>

    <!-- data -->
    <circle
      v-for="(p, i) in pointsOut" :key="`p-${i}`"
      :cx="p.x" :cy="p.y" r="4.6"
      fill="#5ec8ec" stroke="var(--bonn-blue)" stroke-width="0.6"
      :style="{ opacity: p.faded ? 0.35 : 1 }"
    />
  </svg>
</template>

<style scoped>
.regression-tree-demo {
  display: block;
  width: 100%;
  height: auto;
  margin: 0 auto;
  overflow: visible;
}

.axis-label {
  font-size: 12px;
  font-weight: 700;
  fill: var(--bonn-blue);
}

.tick {
  font-size: 12px;
  fill: var(--bonn-muted);
}

.region,
.tau,
.mu {
  font-size: 13px;
  font-style: italic;
  font-family: 'Times New Roman', Times, serif;
  fill: var(--bonn-blue);
}
</style>
