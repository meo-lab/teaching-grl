<script setup lang="ts">
import { computed } from 'vue'
import happyUrl from '../figures/dt_sunflower_happy.png'
import unhappyUrl from '../figures/dt_sunflower_unhappy.png'

// Binary splitting on six sorted points.
// clicks 0: data + sorted indices · 1..5: candidate threshold between point k and k+1
// clicks 6: best threshold t* highlighted
const props = withDefaults(defineProps<{ clicks?: number }>(), { clicks: Infinity })

const PTS: [number, number][] = [
  [0.12, 0.62], [0.27, 0.66], [0.31, 0.97], [0.47, 0.16], [0.52, 0.42], [0.68, 0.08],
]
const N = PTS.length
const step = computed(() => Math.min(N, props.clicks === Infinity ? N : props.clicks))
const k = computed(() => Math.min(step.value, N - 1)) // active threshold index (1..5)

function sse(a: number[]) {
  if (!a.length) return 0
  const m = a.reduce((s, v) => s + v, 0) / a.length
  return a.reduce((s, v) => s + (v - m) ** 2, 0)
}
const IMP = Array.from({ length: N - 1 }, (_, i) => {
  const kk = i + 1
  return sse(PTS.slice(0, kk).map(p => p[1])) + sse(PTS.slice(kk).map(p => p[1]))
})
const BEST = IMP.indexOf(Math.min(...IMP)) + 1
const thrX = (kk: number) => (PTS[kk - 1][0] + PTS[kk][0]) / 2

const shownK = computed(() => (step.value >= N ? BEST : k.value))
const final = computed(() => step.value >= N)

// left: scatter
const ox = 64
const oy = 210
const pw = 230
const ph = 170
const X = (u: number) => ox + u * pw
const Y = (v: number) => oy - v * ph

// right-bottom: impurity vs. threshold
const qx0 = 360
const qy0 = 250
const qw = 180
const qh = 80
const QX = (kk: number) => qx0 + 14 + ((kk - 1) / (N - 2)) * (qw - 28)
const IMP_MAX = Math.max(...IMP)
const QY = (v: number) => qy0 - (v / IMP_MAX) * qh

const ICON = 28
</script>

<template>
  <svg viewBox="0 0 580 290" class="binary-splitting" preserveAspectRatio="xMidYMid meet">
    <defs>
      <marker id="bs-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--bonn-muted)" />
      </marker>
    </defs>

    <!-- scatter -->
    <line :x1="X(0)" :y1="Y(0) + 6" :x2="X(0.85)" :y2="Y(0) + 6" stroke="var(--bonn-muted)" stroke-width="1.4" marker-end="url(#bs-arrow)" />
    <line :x1="X(0)" :y1="Y(0) + 6" :x2="X(0)" :y2="Y(1.12)" stroke="var(--bonn-muted)" stroke-width="1.4" marker-end="url(#bs-arrow)" />
    <text :x="X(0.85)" :y="Y(0) + 40" text-anchor="end" class="axis-label">temperature X</text>
    <text :x="X(0) - 4" :y="Y(1.12) - 6" text-anchor="middle" class="axis-label">sunflower happiness y</text>
    <image :href="happyUrl" :x="X(0) - 58" :y="Y(1) - ICON / 2" :width="ICON" :height="ICON" />
    <image :href="unhappyUrl" :x="X(0) - 58" :y="Y(0) - ICON / 2" :width="ICON" :height="ICON" />
    <text :x="X(0) - 10" :y="Y(1) + 4" text-anchor="end" class="tick">1</text>
    <text :x="X(0) - 10" :y="Y(0) + 4" text-anchor="end" class="tick">0</text>

    <g v-if="step >= 1">
      <line :x1="X(thrX(shownK))" :y1="Y(1.08)" :x2="X(thrX(shownK))" :y2="Y(0) + 6"
            :stroke="final ? 'var(--grl-data-orange)' : 'var(--bonn-muted)'" stroke-width="1.8" stroke-dasharray="5 3" />
      <text :x="X(thrX(shownK))" :y="Y(0) + 22" text-anchor="middle" class="tau">{{ final ? 't*' : 'τ' }}</text>
    </g>

    <g v-for="(p, i) in PTS" :key="i">
      <circle :cx="X(p[0])" :cy="Y(p[1])" r="9"
              :fill="step >= 1 ? (i < shownK ? '#5ec8ec' : '#ffc891') : '#5ec8ec'" />
      <text :x="X(p[0])" :y="Y(p[1]) + 3.5" text-anchor="middle" class="idx">{{ i + 1 }}</text>
    </g>

    <!-- algorithm text + sorted chips -->
    <text x="340" y="28" class="algo">1. sort data points by X (index 1–6)</text>
    <g v-for="(p, i) in PTS" :key="`c-${i}`">
      <circle :cx="358 + i * 26" cy="50" r="10"
              :fill="step >= 1 ? (i < shownK ? '#5ec8ec' : '#ffc891') : '#5ec8ec'" />
      <text :x="358 + i * 26" y="54" text-anchor="middle" class="idx">{{ i + 1 }}</text>
    </g>
    <g v-if="step >= 1">
      <rect x="345" y="37" :width="shownK * 26" height="26" rx="6" fill="none" stroke="var(--bonn-blue)" stroke-dasharray="3 2" />
      <rect :x="345 + shownK * 26" y="37" :width="(N - shownK) * 26" height="26" rx="6" fill="none" stroke="var(--grl-data-orange)" stroke-dasharray="3 2" />
      <text :x="345 + shownK * 13" y="78" text-anchor="middle" class="sigma">σ²_left</text>
      <text :x="345 + shownK * 26 + (N - shownK) * 13" y="78" text-anchor="middle" class="sigma">σ²_right</text>
    </g>
    <text x="340" y="104" class="algo">2. for every pair of neighbours i, i+1:</text>
    <text x="352" y="120" class="algo">try τ between them, record σ²_left + σ²_right</text>

    <!-- impurity vs threshold -->
    <line :x1="qx0" :y1="qy0" :x2="qx0 + qw" :y2="qy0" stroke="var(--bonn-muted)" stroke-width="1.2" marker-end="url(#bs-arrow)" />
    <line :x1="qx0" :y1="qy0" :x2="qx0" :y2="qy0 - qh - 18" stroke="var(--bonn-muted)" stroke-width="1.2" marker-end="url(#bs-arrow)" />
    <text :x="qx0 + qw" :y="qy0 + 14" text-anchor="end" class="axis-small">threshold τ</text>
    <text :x="qx0 + 6" :y="qy0 - qh - 12" class="axis-small">σ²_left + σ²_right</text>
    <g v-for="kk in Math.min(k, N - 1)" :key="`q-${kk}`">
      <circle v-if="step >= kk" :cx="QX(kk)" :cy="QY(IMP[kk - 1])" r="4.5"
              :fill="final && kk === BEST ? 'var(--grl-data-orange)' : 'var(--bonn-blue)'" />
    </g>
    <text v-if="final" :x="QX(BEST)" :y="QY(IMP[BEST - 1]) - 9" text-anchor="middle" class="tau">t*</text>
  </svg>
</template>

<style scoped>
.binary-splitting {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.axis-label {
  font-size: 12px;
  font-weight: 700;
  fill: var(--bonn-blue);
}

.axis-small {
  font-size: 10px;
  fill: var(--bonn-muted);
}

.tick {
  font-size: 12px;
  fill: var(--bonn-muted);
}

.idx {
  font-size: 10px;
  font-weight: 700;
  fill: var(--bonn-blue);
}

.algo {
  font-size: 11.5px;
  fill: var(--bonn-text);
}

.sigma {
  font-size: 11px;
  font-style: italic;
  font-family: 'Times New Roman', Times, serif;
  fill: var(--bonn-blue);
}

.tau {
  font-size: 13px;
  font-style: italic;
  font-weight: 700;
  font-family: 'Times New Roman', Times, serif;
  fill: var(--grl-data-orange);
}
</style>
