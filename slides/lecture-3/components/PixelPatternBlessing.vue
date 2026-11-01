<script setup lang="ts">
// Blessing of dimensionality (after the Wageningen RS lecture):
// clicks 0: 30 RGB pixels as a dataset of 3-D points (placed by brightness / greenness) - no pattern visible
// clicks 1: the same 30 pixels arranged as one 90-D image (6 x 5) - the spatial pattern appears
import { computed } from 'vue'

const props = withDefaults(defineProps<{ clicks?: number }>(), { clicks: Infinity })
const asImage = computed(() => props.clicks >= 1)

// 5 rows x 6 columns, D = dark pixel, others vary in green / brightness
const layout = [
  'GGLGGL',
  'GDGGDG',
  'LGGLGG',
  'DGLGGD',
  'GDDDDG',
]
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(3)
const cell = 46
const pixels = layout.flatMap((row, r) => row.split('').map((t, c) => {
  const base = t === 'D' ? [0.08, 0.2, 0.1] : t === 'L' ? [0.82, 0.88, 0.8] : [0.35, 0.65, 0.3]
  const j = (rnd() - 0.5) * (t === 'D' ? 0.1 : 0.22)
  const col = base.map(v => Math.min(1, Math.max(0, v + j)))
  const bright = (col[0] + col[1] + col[2]) / 3
  const green = col[1] - (col[0] + col[2]) / 2
  return {
    fill: `rgb(${col.map(v => Math.round(v * 255)).join(',')})`,
    // position in "colour space" (left panel)
    sx: 40 + bright * 300 + (rnd() - 0.5) * 30,
    sy: 260 - green * 520 - (rnd() - 0.5) * 30,
    // position in the image grid (right panel)
    gx: 520 + c * cell,
    gy: 40 + r * cell,
  }
}))
</script>

<template>
  <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 37%"><svg viewBox="0 0 900 333" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" aria-label="Thirty pixels as points in colour space show no pattern; arranged as an image they form a face">
    <defs>
      <marker id="ppb-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#00457c" /></marker>
    </defs>
    <!-- colour-space axes -->
    <g :style="{ opacity: asImage ? 0.25 : 1, transition: 'opacity .6s' }">
      <line x1="30" y1="290" x2="380" y2="290" stroke="#00457c" stroke-width="1.5" marker-end="url(#ppb-arrow)" />
      <line x1="30" y1="290" x2="30" y2="20" stroke="#00457c" stroke-width="1.5" marker-end="url(#ppb-arrow)" />
      <text x="380" y="308" text-anchor="end" style="font-size: 12px" fill="#555">brightness</text>
      <text x="38" y="26" style="font-size: 12px" fill="#555">greenness</text>
      <text x="200" y="326" text-anchor="middle" style="font-size: 14px" fill="#222">dataset of 30 pixels: <tspan font-weight="700">3-D</tspan> RGB vectors</text>
    </g>
    <g :style="{ opacity: asImage ? 1 : 0, transition: 'opacity .6s' }">
      <text x="658" y="326" text-anchor="middle" style="font-size: 14px" fill="#222">one image: <tspan font-weight="700">90-D</tspan> vector (30 pixels × 3 channels)</text>
      <path d="M 400 160 L 495 160" stroke="#00457c" stroke-width="3" fill="none" marker-end="url(#ppb-arrow)" />
    </g>
    <rect v-for="(p, i) in pixels" :key="i" x="0" y="0" :width="asImage ? cell - 2 : 26" :height="asImage ? cell - 2 : 26" :fill="p.fill" stroke="#fff" stroke-width="1"
      :style="{ transform: `translate(${asImage ? p.gx : p.sx}px, ${asImage ? p.gy : p.sy}px)`, transition: 'transform .9s ease-in-out, width .9s, height .9s' }" />
  </svg></div>
</template>
