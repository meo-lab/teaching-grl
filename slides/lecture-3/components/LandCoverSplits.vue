<script setup lang="ts">
import { computed } from 'vue'

// Schematic land-cover feature space (near infrared vs. red) with the three
// axis-aligned splits of a small decision tree.
// clicks: 0 points · 1 + t1 (red) · 2 + t3 (nir, top) · 3 + t2 (nir, bottom) · 4 + region shading
const props = withDefaults(defineProps<{
  clicks?: number
  // restrict drawing to one side of t1 ('top' | 'bottom'); used for the child nodes
  subset?: 'all' | 'top' | 'bottom'
  // hide the threshold lines entirely
  noSplits?: boolean
}>(), {
  clicks: Infinity,
  subset: 'all',
  noSplits: false,
})

const CLASSES = {
  urban: { label: 'urban', color: '#b02b37' },
  ground: { label: 'bare ground', color: '#035172' },
  water: { label: 'water', color: '#5ec8ec' },
  veg: { label: 'vegetation', color: '#2eb82e' },
} as const

type Key = keyof typeof CLASSES

const W = 320
const H = 250
const ox = 46
const oy = 214
const pw = 254
const ph = 190
const X = (u: number) => ox + u * pw
const Y = (v: number) => oy - v * ph

// unit-space positions (nir, red)
const PTS: Record<Key, [number, number][]> = {
  urban: [[0.10, 0.80], [0.17, 0.86], [0.24, 0.83], [0.13, 0.72], [0.22, 0.74], [0.27, 0.66], [0.11, 0.63]],
  ground: [[0.45, 0.86], [0.52, 0.90], [0.58, 0.85], [0.49, 0.79], [0.56, 0.78], [0.62, 0.83]],
  water: [[0.10, 0.22], [0.17, 0.27], [0.23, 0.19], [0.13, 0.12], [0.21, 0.10], [0.28, 0.16]],
  veg: [[0.62, 0.38], [0.70, 0.43], [0.78, 0.47], [0.66, 0.30], [0.75, 0.34], [0.83, 0.40]],
}
const LABEL_POS: Record<Key, [number, number, string]> = {
  urban: [0.08, 0.93, 'start'],
  ground: [0.66, 0.90, 'start'],
  water: [0.32, 0.24, 'start'],
  veg: [0.72, 0.22, 'middle'],
}

const T1 = 0.55 // red
const T3 = 0.35 // nir, upper half
const T2 = 0.45 // nir, lower half

const c = computed(() => (props.clicks === Infinity ? 4 : props.clicks))
const showT1 = computed(() => !props.noSplits && c.value >= 1)
const showT3 = computed(() => !props.noSplits && c.value >= 2)
const showT2 = computed(() => !props.noSplits && c.value >= 3)
const shade = computed(() => !props.noSplits && c.value >= 4)

function inSubset(k: Key) {
  if (props.subset === 'top') return k === 'urban' || k === 'ground'
  if (props.subset === 'bottom') return k === 'water' || k === 'veg'
  return true
}

const keys = computed(() => (Object.keys(CLASSES) as Key[]).filter(inSubset))
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="landcover-splits" preserveAspectRatio="xMidYMid meet">
    <defs>
      <marker id="lc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--bonn-muted)" />
      </marker>
    </defs>

    <g v-if="shade" style="opacity: 0.13">
      <rect :x="X(0)" :y="Y(1)" :width="X(T3) - X(0)" :height="Y(T1) - Y(1)" :fill="CLASSES.urban.color" />
      <rect :x="X(T3)" :y="Y(1)" :width="X(1) - X(T3)" :height="Y(T1) - Y(1)" :fill="CLASSES.ground.color" />
      <rect :x="X(0)" :y="Y(T1)" :width="X(T2) - X(0)" :height="Y(0) - Y(T1)" :fill="CLASSES.water.color" />
      <rect :x="X(T2)" :y="Y(T1)" :width="X(1) - X(T2)" :height="Y(0) - Y(T1)" :fill="CLASSES.veg.color" />
    </g>

    <line :x1="X(0)" :y1="Y(0)" :x2="X(1.04)" :y2="Y(0)" stroke="var(--bonn-muted)" stroke-width="1.4" marker-end="url(#lc-arrow)" />
    <line :x1="X(0)" :y1="Y(0)" :x2="X(0)" :y2="Y(1.08)" stroke="var(--bonn-muted)" stroke-width="1.4" marker-end="url(#lc-arrow)" />
    <text :x="X(1.04)" :y="Y(0) + 18" text-anchor="end" class="axis-label">near infrared</text>
    <text :x="X(0) - 6" :y="Y(1.08) + 4" text-anchor="end" class="axis-label">red</text>

    <g v-if="showT1">
      <line :x1="X(0)" :y1="Y(T1)" :x2="X(1)" :y2="Y(T1)" stroke="var(--bonn-muted)" stroke-width="1.6" stroke-dasharray="6 4" />
      <text :x="X(0) - 6" :y="Y(T1) + 5" text-anchor="end" class="threshold">t₁</text>
    </g>
    <g v-if="showT3">
      <line :x1="X(T3)" :y1="Y(T1)" :x2="X(T3)" :y2="Y(1.02)" stroke="var(--bonn-muted)" stroke-width="1.6" stroke-dasharray="6 4" />
      <text :x="X(T3)" :y="Y(1.02) - 4" text-anchor="middle" class="threshold">t₃</text>
    </g>
    <g v-if="showT2">
      <line :x1="X(T2)" :y1="Y(0)" :x2="X(T2)" :y2="Y(T1)" stroke="var(--bonn-muted)" stroke-width="1.6" stroke-dasharray="6 4" />
      <text :x="X(T2)" :y="Y(0) + 18" text-anchor="middle" class="threshold">t₂</text>
    </g>

    <g v-for="k in keys" :key="k">
      <circle v-for="(p, i) in PTS[k]" :key="i" :cx="X(p[0])" :cy="Y(p[1])" r="4.6" :fill="CLASSES[k].color" />
      <text :x="X(LABEL_POS[k][0])" :y="Y(LABEL_POS[k][1])" :text-anchor="LABEL_POS[k][2]" class="class-label" :fill="CLASSES[k].color">{{ CLASSES[k].label }}</text>
    </g>
  </svg>
</template>

<style scoped>
.landcover-splits {
  display: block;
  width: 100%;
  height: auto;
  margin: 0 auto;
}

.axis-label {
  font-size: 11px;
  font-weight: 600;
  fill: var(--bonn-muted);
}

.threshold {
  font-size: 14px;
  font-style: italic;
  font-family: 'Times New Roman', Times, serif;
  fill: var(--bonn-text);
}

.class-label {
  font-size: 11px;
  font-weight: 700;
}
</style>
