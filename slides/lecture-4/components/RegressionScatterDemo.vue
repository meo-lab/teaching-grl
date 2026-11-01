<script setup lang="ts">
import { computed } from 'vue'

type Variant =
  | 'points'
  | 'fit'
  | 'error-band'
  | 'residual-segments'
  | 'residual-squares'
  | 'offsets-vertical'
  | 'offsets-perpendicular'
  | 'trainval-1'
  | 'trainval-2'
  | 'trainval-3'

const props = withDefaults(defineProps<{
  variant: Variant
  xLabel?: string
  yLabel?: string
  // current slide click count (pass Slidev's $clicks). Leave unset to render the
  // variant's fully revealed state with no click-by-click staging.
  clicks?: number
}>(), {
  xLabel: 'x',
  yLabel: 'y',
  clicks: Infinity,
})

// --- layout -----------------------------------------------------------
const padL = 50
const padT = 24
const padR = 24
const padB = 32
const plot = 208
const W = padL + plot + padR
const H = padT + plot + padB
const LABEL_MARGIN = 60 // extra canvas to the left so long y-axis labels (e.g. "temperature y") aren't clipped

function X(ux: number) {
  return padL + ux * plot
}
function Y(uy: number) {
  return H - padB - uy * plot
}

// --- fixed sample geometry (unit space, y-up) --------------------------
const P = [
  [0.15, 0.75],
  [0.40, 0.75],
  [0.50, 0.45],
  [0.85, 0.35],
]
const Phat = [
  [0.15, 0.85],
  [0.40, 0.60],
  [0.50, 0.50],
  [0.85, 0.15],
]
const Pperp = [
  [0.20, 0.80],
  [0.325, 0.675],
  [0.525, 0.475],
  [0.75, 0.25],
]
const LINE_A: [number, number] = [0, 1]
const LINE_B: [number, number] = [1, 0]

const V = [
  [0.10, 0.75],
  [0.35, 0.70],
  [0.50, 0.45],
  [0.85, 0.35],
]
const TRAIN_LINE: [[number, number], [number, number]] = [[0, 1.02], [0.97, 0]]
const VAL_LINE: [[number, number], [number, number]] = [[0, 0.95], [1.0, 0.02]]

const BAND = [[0, 1.09], [1, 0.09], [0.91, 0], [0, 0.91]]

// --- derived screen-space points ---------------------------------------
const dataPts = computed(() => P.map(([ux, uy]) => ({ x: X(ux), y: Y(uy) })))
const hatPts = computed(() => Phat.map(([ux, uy]) => ({ x: X(ux), y: Y(uy) })))
const perpPts = computed(() => Pperp.map(([ux, uy]) => ({ x: X(ux), y: Y(uy) })))
const valPts = computed(() => V.map(([ux, uy]) => ({ x: X(ux), y: Y(uy) })))

const linePts = computed(() => ({
  x1: X(LINE_A[0]), y1: Y(LINE_A[1]),
  x2: X(LINE_B[0]), y2: Y(LINE_B[1]),
}))
const trainLinePts = computed(() => ({
  x1: X(TRAIN_LINE[0][0]), y1: Y(TRAIN_LINE[0][1]),
  x2: X(TRAIN_LINE[1][0]), y2: Y(TRAIN_LINE[1][1]),
}))
const valLinePts = computed(() => ({
  x1: X(VAL_LINE[0][0]), y1: Y(VAL_LINE[0][1]),
  x2: X(VAL_LINE[1][0]), y2: Y(VAL_LINE[1][1]),
}))

const bandPath = computed(() => {
  const pts = BAND.map(([ux, uy]) => `${X(ux)},${Y(uy)}`)
  return `M ${pts.join(' L ')} Z`
})

const segments = computed(() =>
  P.map(([ux, uy], i) => {
    const [hx, hy] = Phat[i]
    return { x: X(ux), y1: Y(uy), y2: Y(hy) }
  }),
)

const perpSegments = computed(() =>
  P.map(([ux, uy], i) => {
    const [px, py] = Pperp[i]
    return { x1: X(ux), y1: Y(uy), x2: X(px), y2: Y(py) }
  }),
)

const squares = computed(() =>
  P.map(([ux, uy], i) => {
    const [, hy] = Phat[i]
    const x0 = X(ux)
    const yData = Y(uy)
    const yHat = Y(hy)
    const side = Math.abs(yHat - yData)
    const top = Math.min(yData, yHat)
    return { x: x0, y: top, side }
  }),
)

// --- variant flags -------------------------------------------------------
const isTrainVal = computed(() => props.variant.startsWith('trainval'))

// trainval staging: with `clicks` left at the default (Infinity), the stage is read
// straight off the variant name (trainval-1/2/3), same as before. When a slide passes
// `:clicks="$clicks"` together with variant="trainval-3", the stage instead advances
// with clicks: 0 -> train only, 1 -> + validation, 2+ -> + combined/true relationship.
const trainStage = computed(() => {
  if (!isTrainVal.value) return 0
  if (props.clicks === Infinity) {
    if (props.variant === 'trainval-3') return 3
    if (props.variant === 'trainval-2') return 2
    return 1
  }
  return Math.min(3, 1 + props.clicks)
})
const showValLayer = computed(() => trainStage.value >= 2)
const showCombinedLine = computed(() => trainStage.value >= 3)

const showBaseLine = computed(() =>
  ['fit', 'error-band', 'residual-segments', 'residual-squares', 'offsets-vertical', 'offsets-perpendicular'].includes(props.variant)
  || (props.variant === 'points' && props.clicks >= 1),
)

// residual-segments: with clicks staged, only the last (labelled) segment shows at
// click 0, the rest appear together at click 1 -- matching the original build where
// the labelled residual is introduced first and the others follow.
const shownSegments = computed(() => {
  if (props.variant === 'residual-segments' && props.clicks < 1 && segments.value.length) {
    return [segments.value[segments.value.length - 1]]
  }
  return segments.value
})

// offsets-vertical / offsets-perpendicular: toggle from offset segments to offset
// squares once clicked, mirroring the original's vertical-offset -> squared-error build.
const showOffsetSquares = computed(() =>
  (props.variant === 'offsets-vertical' || props.variant === 'offsets-perpendicular') && props.clicks >= 1,
)

const perpSquares = computed(() =>
  P.map(([ux, uy], i) => {
    const [px, py] = Pperp[i]
    const p1x = X(ux), p1y = Y(uy)
    const p2x = X(px), p2y = Y(py)
    const vx = p2x - p1x
    const vy = p2y - p1y
    // rotate the offset vector by -90deg to build the square's far edge
    const nx = vy
    const ny = -vx
    return `${p1x},${p1y} ${p2x},${p2y} ${p2x + nx},${p2y + ny} ${p1x + nx},${p1y + ny}`
  }),
)
</script>

<template>
  <svg
    :viewBox="`-${LABEL_MARGIN} 0 ${W + LABEL_MARGIN} ${H}`"
    class="regression-demo"
    :style="{ width: '100%', height: 'auto', maxWidth: `${W + LABEL_MARGIN}px` }"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <marker id="rsd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--bonn-muted)" />
      </marker>
    </defs>

    <!-- axes -->
    <line :x1="X(0)" :y1="Y(0)" :x2="X(1.02)" :y2="Y(0)" stroke="var(--bonn-muted)" stroke-width="1.4" marker-end="url(#rsd-arrow)" />
    <line :x1="X(0)" :y1="Y(0)" :x2="X(0)" :y2="Y(1.08)" stroke="var(--bonn-muted)" stroke-width="1.4" marker-end="url(#rsd-arrow)" />
    <text :x="X(1.02)" :y="Y(0) + 16" text-anchor="end" class="axis-label">{{ xLabel }}</text>
    <text :x="X(0) - 10" :y="Y(1.08) + 4" text-anchor="end" class="axis-label">{{ yLabel }}</text>

    <template v-if="!isTrainVal">
      <!-- shaded error band -->
      <path v-if="variant === 'error-band'" :d="bandPath" fill="var(--bonn-blue)" style="opacity: 0.12" />

      <!-- squares (MSE / RSS / vertical-offset squares) -->
      <g v-if="variant === 'residual-squares' || (variant === 'offsets-vertical' && showOffsetSquares)">
        <rect
          v-for="(s, i) in squares" :key="`sq-${i}`"
          :x="s.x" :y="s.y" :width="s.side" :height="s.side"
          fill="var(--grl-data-orange)" style="opacity: 0.25" stroke="var(--grl-data-orange)" stroke-width="1"
        />
      </g>

      <!-- squares (perpendicular-offset) -->
      <g v-if="variant === 'offsets-perpendicular' && showOffsetSquares">
        <polygon
          v-for="(pts, i) in perpSquares" :key="`psq-${i}`"
          :points="pts"
          fill="var(--grl-data-orange)" style="opacity: 0.25" stroke="var(--grl-data-orange)" stroke-width="1"
        />
      </g>

      <!-- vertical residual segments -->
      <g v-if="variant === 'residual-segments' || (variant === 'offsets-vertical' && !showOffsetSquares)">
        <line
          v-for="(s, i) in shownSegments" :key="`seg-${i}`"
          :x1="s.x" :y1="s.y1" :x2="s.x" :y2="s.y2"
          stroke="var(--bonn-muted)" stroke-width="1.6"
          :stroke-dasharray="variant === 'residual-segments' ? '3 2' : undefined"
        />
      </g>

      <!-- perpendicular offset segments -->
      <g v-if="variant === 'offsets-perpendicular' && !showOffsetSquares">
        <line
          v-for="(s, i) in perpSegments" :key="`pseg-${i}`"
          :x1="s.x1" :y1="s.y1" :x2="s.x2" :y2="s.y2"
          stroke="var(--bonn-muted)" stroke-width="1.6"
        />
      </g>

      <!-- fitted model line -->
      <line
        v-if="showBaseLine"
        :x1="linePts.x1" :y1="linePts.y1" :x2="linePts.x2" :y2="linePts.y2"
        stroke="var(--bonn-blue)" stroke-width="2.5"
      />

      <!-- observed data points -->
      <circle
        v-for="(p, i) in dataPts" :key="`p-${i}`"
        :cx="p.x" :cy="p.y" r="5" fill="var(--bonn-blue)"
      />

      <!-- predicted points on the line -->
      <template v-if="variant === 'residual-segments' || variant === 'residual-squares'">
        <circle
          v-for="(p, i) in hatPts" :key="`h-${i}`"
          :cx="p.x" :cy="p.y" r="4.5" fill="var(--grl-data-orange)"
        />
      </template>
      <template v-if="variant === 'offsets-vertical'">
        <circle
          v-for="(p, i) in hatPts" :key="`hv-${i}`"
          :cx="p.x" :cy="p.y" r="4" fill="var(--grl-data-orange)"
        />
      </template>
      <template v-if="variant === 'offsets-perpendicular'">
        <circle
          v-for="(p, i) in perpPts" :key="`hp-${i}`"
          :cx="p.x" :cy="p.y" r="4" fill="var(--grl-data-orange)"
        />
      </template>

      <!-- residual label on the last point -->
      <text
        v-if="variant === 'residual-segments'"
        :x="segments[3].x + 8" :y="(segments[3].y1 + segments[3].y2) / 2 + 4"
        class="residual-label"
      >ε</text>
    </template>

    <template v-else>
      <!-- train points + train fit -->
      <line :x1="trainLinePts.x1" :y1="trainLinePts.y1" :x2="trainLinePts.x2" :y2="trainLinePts.y2" stroke="var(--bonn-blue)" stroke-width="2.2" />
      <circle v-for="(p, i) in dataPts" :key="`tr-${i}`" :cx="p.x" :cy="p.y" r="5" fill="var(--bonn-blue)" />

      <!-- validation points + validation fit -->
      <template v-if="showValLayer">
        <line :x1="valLinePts.x1" :y1="valLinePts.y1" :x2="valLinePts.x2" :y2="valLinePts.y2" stroke="var(--grl-data-orange)" stroke-width="2.2" stroke-dasharray="5 3" />
        <circle v-for="(p, i) in valPts" :key="`va-${i}`" :cx="p.x" :cy="p.y" r="5" fill="var(--grl-data-orange)" />
      </template>

      <!-- combined / true relationship -->
      <line
        v-if="showCombinedLine"
        :x1="linePts.x1" :y1="linePts.y1" :x2="linePts.x2" :y2="linePts.y2"
        stroke="var(--bonn-text)" stroke-width="3"
      />
    </template>
  </svg>
</template>

<style scoped>
.regression-demo {
  display: block;
  margin: 0 auto;
}

.axis-label {
  font-size: 11px;
  font-weight: 600;
  fill: var(--bonn-muted);
}

.residual-label {
  font-size: 13px;
  font-style: italic;
  fill: var(--bonn-muted);
}
</style>
