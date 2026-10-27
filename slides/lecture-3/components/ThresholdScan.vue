<script setup lang="ts">
import { computed, ref } from 'vue'

// Interactive version of the "try different thresholds" Colab:
// drag the threshold τ, see the two region means (left) and the
// weighted impurity of the split as a function of τ (right).
const props = withDefaults(defineProps<{
  initial?: number
  // show the optimum t* marker on the impurity curve
  showOptimum?: boolean
}>(), {
  initial: -3.5,
  showOptimum: true,
})

// deterministic pseudo-random data (two groups, left ≈ 5, right ≈ 0)
function lcg(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}
function gauss(r: () => number) {
  const u = Math.max(r(), 1e-9)
  const v = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const rand = lcg(42)
const DATA: [number, number][] = []
for (let i = 0; i < 60; i++) {
  const left = i < 30
  const x = left ? -4.5 + 4.4 * rand() + gauss(rand) * 0.5 : 0.2 + 5 * rand() + gauss(rand) * 0.5
  DATA.push([Math.max(-5.8, Math.min(5.8, x)), (left ? 4.8 : 0) + gauss(rand) * 1.1])
}

function split(t: number) {
  const l = DATA.filter(p => p[0] < t)
  const r = DATA.filter(p => p[0] >= t)
  const mean = (a: [number, number][]) => a.reduce((s, p) => s + p[1], 0) / Math.max(a.length, 1)
  const sse = (a: [number, number][], m: number) => a.reduce((s, p) => s + (p[1] - m) ** 2, 0)
  const ml = mean(l)
  const mr = mean(r)
  return { ml, mr, nl: l.length, nr: r.length, imp: (sse(l, ml) + sse(r, mr)) / DATA.length }
}

const TS = Array.from({ length: 221 }, (_, i) => -5.5 + i * 0.05)
const CURVE = TS.map(t => ({ t, imp: split(t).imp }))
const best = CURVE.reduce((a, b) => (b.imp < a.imp ? b : a))
const IMP_MAX = Math.max(...CURVE.map(c => c.imp))

const tau = ref(props.initial)
const cur = computed(() => split(tau.value))

// scatter panel
const PW = 230
const PH = 190
const px = (x: number) => 30 + ((x + 6) / 12) * PW
const py = (y: number) => 10 + ((9 - y) / 13) * PH
// impurity panel
const qx = (t: number) => 30 + ((t + 6) / 12) * PW
const qy = (v: number) => 10 + (1 - v / (IMP_MAX * 1.08)) * PH

const curvePath = CURVE.map((c, i) => `${i ? 'L' : 'M'} ${qx(c.t).toFixed(1)} ${qy(c.imp).toFixed(1)}`).join(' ')
</script>

<template>
  <div class="threshold-scan">
    <div class="panels">
      <svg :viewBox="`0 0 ${PW + 40} ${PH + 40}`" class="panel">
        <line :x1="px(-6)" :y1="py(-4)" :x2="px(6)" :y2="py(-4)" class="axis" />
        <line :x1="px(-6)" :y1="py(-4)" :x2="px(-6)" :y2="py(9)" class="axis" />
        <text :x="px(6)" :y="py(-4) + 16" text-anchor="end" class="axis-label">x</text>
        <text :x="px(-6) - 6" :y="py(9) + 8" text-anchor="end" class="axis-label">y</text>
        <circle v-for="(p, i) in DATA" :key="i" :cx="px(p[0])" :cy="py(p[1])" r="3.4"
                :fill="p[0] < tau ? '#5ec8ec' : '#ffc891'"
                stroke="var(--bonn-blue)" stroke-width="0.4" />
        <line :x1="px(-6)" :y1="py(cur.ml)" :x2="px(tau)" :y2="py(cur.ml)" stroke="var(--bonn-blue)" stroke-width="2.4" />
        <line :x1="px(tau)" :y1="py(cur.mr)" :x2="px(6)" :y2="py(cur.mr)" stroke="var(--bonn-blue)" stroke-width="2.4" />
        <line :x1="px(tau)" :y1="py(9)" :x2="px(tau)" :y2="py(-4)" stroke="var(--grl-data-orange)" stroke-width="2" stroke-dasharray="5 3" />
        <text :x="px(tau) + 4" :y="py(9) + 10" class="tau">τ = {{ tau.toFixed(2) }}</text>
      </svg>

      <svg :viewBox="`0 0 ${PW + 40} ${PH + 40}`" class="panel">
        <line :x1="qx(-6)" :y1="qy(0)" :x2="qx(6)" :y2="qy(0)" class="axis" />
        <line :x1="qx(-6)" :y1="qy(0)" :x2="qx(-6)" :y2="qy(IMP_MAX * 1.08)" class="axis" />
        <text :x="qx(6)" :y="qy(0) + 16" text-anchor="end" class="axis-label">threshold τ</text>
        <text :x="qx(-6) + 4" :y="qy(IMP_MAX * 1.08) + 8" class="axis-label">impurity after the split</text>
        <path :d="curvePath" fill="none" stroke="var(--bonn-muted)" stroke-width="1.6" stroke-dasharray="4 2" />
        <g v-if="showOptimum">
          <text :x="qx(best.t)" :y="qy(best.imp) + 6" text-anchor="middle" class="star">★</text>
          <text :x="qx(best.t)" :y="qy(best.imp) + 22" text-anchor="middle" class="tau">t* = {{ best.t.toFixed(2) }}</text>
        </g>
        <circle :cx="qx(tau)" :cy="qy(cur.imp)" r="5.5" fill="var(--grl-data-orange)" stroke="#fff" stroke-width="1.5" />
      </svg>
    </div>

    <label class="slider">
      <span>τ</span>
      <input v-model.number="tau" type="range" min="-5.5" max="5.5" step="0.05" @keydown.stop>
      <span class="readout">impurity {{ cur.imp.toFixed(2) }}</span>
    </label>
  </div>
</template>

<style scoped>
.threshold-scan {
  width: 100%;
}

.panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.panel {
  width: 100%;
  height: auto;
  overflow: visible;
}

.axis {
  stroke: var(--bonn-muted);
  stroke-width: 1.2;
}

.axis-label {
  font-size: 10px;
  font-weight: 600;
  fill: var(--bonn-muted);
}

.tau {
  font-size: 11px;
  font-style: italic;
  font-weight: 700;
  fill: var(--grl-data-orange);
}

.star {
  font-size: 18px;
  fill: var(--bonn-blue);
}

.slider {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin-top: .4rem;
  color: var(--bonn-blue);
  font-size: .8rem;
  font-weight: 700;
}

.slider input {
  flex: 1;
  accent-color: var(--grl-data-orange);
}

.readout {
  min-width: 7.5rem;
  color: var(--bonn-muted);
  font-weight: 600;
}
</style>
