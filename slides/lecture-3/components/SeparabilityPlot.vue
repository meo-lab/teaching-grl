<script setup lang="ts">
// Blessing of dimensionality: in 1-D (nir only) urban and water pixels overlap;
// adding the red band lifts them into 2-D, where a line separates them.
// clicks: 0 -> 1-D view, 1 -> 2-D view, 2 -> + decision boundary
const props = withDefaults(defineProps<{ clicks?: number }>(), { clicks: Infinity })

const data = [
  { cls: 'urban', nir: 0.12, red: 0.30 },
  { cls: 'urban', nir: 0.20, red: 0.27 },
  { cls: 'urban', nir: 0.26, red: 0.33 },
  { cls: 'urban', nir: 0.31, red: 0.29 },
  { cls: 'water', nir: 0.10, red: 0.08 },
  { cls: 'water', nir: 0.17, red: 0.11 },
  { cls: 'water', nir: 0.23, red: 0.07 },
  { cls: 'water', nir: 0.29, red: 0.10 },
]

const x0 = 60
const y0 = 250
const sx = 900
const sy = 560
const lifted = () => props.clicks >= 1
const px = (d: typeof data[number]) => x0 + d.nir * sx
const py = (d: typeof data[number]) => lifted() ? y0 - d.red * sy : y0
</script>

<template>
  <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 69.0476%"><svg viewBox="0 0 420 290" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" aria-label="Urban and water pixels overlap along near-infrared but separate once red is added">
    <defs>
      <marker id="sep-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#00457c" />
      </marker>
    </defs>
    <line :x1="x0" :y1="y0" x2="400" :y2="y0" stroke="#00457c" stroke-width="2" marker-end="url(#sep-arrow)" />
    <text x="400" :y="y0 + 24" text-anchor="end" style="font-size: 14px" fill="#333">near infrared (nir)</text>

    <g style="transition: opacity .5s" :style="{ opacity: lifted() ? 1 : 0 }">
      <line :x1="x0" :y1="y0" :x2="x0" y2="20" stroke="#00457c" stroke-width="2" marker-end="url(#sep-arrow)" />
      <text :x="x0 - 12" y="40" text-anchor="end" style="font-size: 14px" fill="#333" transform="rotate(-90 48 40)">red</text>
    </g>

    <line v-if="props.clicks >= 2" :x1="x0" y1="140" x2="400" y2="140" stroke="#ff7900" stroke-width="2.5" stroke-dasharray="8 5" />

    <g v-for="(d, i) in data" :key="i">
      <line :x1="px(d)" :y1="y0" :x2="px(d)" :y2="py(d)" stroke="#999" stroke-width="1" style="transition: all .7s" />
      <circle :cx="px(d)" :cy="py(d)" r="9"
        :fill="d.cls === 'urban' ? '#b02b37' : '#5ec8ec'" stroke="#fff" stroke-width="1.5"
        style="transition: cy .7s ease-in-out" :style="{ fillOpacity: '.9' }" />
    </g>

    <g style="font-size: 14px">
      <circle cx="300" cy="30" r="7" fill="#b02b37" /><text x="312" y="35" fill="#333">urban pixels</text>
      <circle cx="300" cy="54" r="7" fill="#5ec8ec" /><text x="312" y="59" fill="#333">water pixels</text>
    </g>
  </svg></div>
</template>
