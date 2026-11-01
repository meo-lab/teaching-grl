<script setup lang="ts">
// Same 4 x 4 x 3 RGB image, two vector spaces:
//  left  -> 16 pixels as data points in a 3-D colour space
//  right -> the whole image as one data point in a 48-D space
// clicks: 0 image only, 1 + pixel view, 2 + image view
const props = withDefaults(defineProps<{ clicks?: number }>(), { clicks: Infinity })

// 4 x 4 patch of greenish pixel colours (r, g, b in 0..1)
const pix: [number, number, number][] = [
  [0.24, 0.42, 0.22], [0.30, 0.48, 0.25], [0.55, 0.58, 0.50], [0.62, 0.64, 0.58],
  [0.20, 0.38, 0.20], [0.28, 0.50, 0.26], [0.50, 0.55, 0.47], [0.70, 0.70, 0.64],
  [0.16, 0.30, 0.16], [0.22, 0.40, 0.22], [0.35, 0.52, 0.30], [0.58, 0.60, 0.52],
  [0.12, 0.25, 0.14], [0.18, 0.34, 0.18], [0.30, 0.46, 0.26], [0.45, 0.52, 0.40],
]
const rgb = (p: number[]) => `rgb(${p.map(v => Math.round(v * 255)).join(',')})`

// oblique 3-D projection for the colour space
function proj(r: number, g: number, b: number, ox: number, oy: number, s = 120) {
  return { x: ox + r * s + g * s * 0.55, y: oy - b * s - g * s * 0.38 }
}
const ox = 40
const oy = 300
const pts = pix.map(p => ({ ...proj(p[0], p[1], p[2], ox, oy), c: rgb(p) }))
const axR = proj(1.1, 0, 0, ox, oy)
const axG = proj(0, 1.15, 0, ox, oy)
const axB = proj(0, 0, 1.1, ox, oy)
</script>

<template>
  <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 40.0000%"><svg viewBox="0 0 900 360" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" aria-label="One RGB image represented as 16 points in 3-D or as one point in 48-D">
    <defs>
      <marker id="vsc-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#00457c" />
      </marker>
    </defs>

    <!-- centre: the image tensor -->
    <g transform="translate(385 70)">
      <text x="65" y="-16" text-anchor="middle" style="font-size: 15px" fill="#333">Same data</text>
      <g v-for="(layer, li) in [2, 1, 0]" :key="li" :transform="`translate(${layer * 12} ${-layer * 12 + 24})`">
        <rect v-for="(p, i) in pix" :key="i" :x="(i % 4) * 26" :y="Math.floor(i / 4) * 26" width="25" height="25"
          :fill="layer === 0 ? rgb(p) : (layer === 1 ? '#5e86a8' : '#33597b')" stroke="#fff" stroke-width="1" />
      </g>
      <text x="65" y="168" text-anchor="middle" style="font-size: 15px" font-weight="700" fill="#00457c">3-D tensor: image</text>
      <text x="65" y="188" text-anchor="middle" style="font-size: 14px" fill="#333">[H &#215; W &#215; C] = [4 &#215; 4 &#215; 3]</text>
    </g>

    <!-- left: pixels as data points -->
    <g :style="{ opacity: props.clicks >= 1 ? 1 : 0 }" style="transition: opacity .4s">
      <path d="M 380 120 C 330 100, 300 110, 280 140" stroke="#00457c" stroke-width="5" fill="none" marker-end="url(#vsc-arrow)" />
      <line :x1="ox" :y1="oy" :x2="axR.x" :y2="axR.y" stroke="#b02b37" stroke-width="2" marker-end="url(#vsc-arrow)" />
      <line :x1="ox" :y1="oy" :x2="axG.x" :y2="axG.y" stroke="#2e8b3a" stroke-width="2" marker-end="url(#vsc-arrow)" />
      <line :x1="ox" :y1="oy" :x2="axB.x" :y2="axB.y" stroke="#1f5fa8" stroke-width="2" marker-end="url(#vsc-arrow)" />
      <text :x="axR.x + 4" :y="axR.y + 16" style="font-size: 13px" font-style="italic" fill="#b02b37">red</text>
      <text :x="axG.x + 6" :y="axG.y + 4" style="font-size: 13px" font-style="italic" fill="#2e8b3a">green</text>
      <text :x="axB.x - 10" :y="axB.y - 6" style="font-size: 13px" font-style="italic" fill="#1f5fa8">blue</text>
      <circle v-for="(p, i) in pts" :key="i" :cx="p.x" :cy="p.y" r="6" :fill="p.c" stroke="#00457c" stroke-width="1" />
      <text x="140" y="330" text-anchor="middle" style="font-size: 14px" fill="#222"><tspan font-weight="700">16 data points</tspan> in 3 dimensions</text>
      <text x="140" y="350" text-anchor="middle" style="font-size: 14px" fill="#222">span a <tspan font-weight="700" fill="#2e8b3a">3-D vector space</tspan></text>
    </g>

    <!-- right: the image as one data point -->
    <g :style="{ opacity: props.clicks >= 2 ? 1 : 0 }" style="transition: opacity .4s">
      <path d="M 545 120 C 595 100, 625 110, 640 140" stroke="#00457c" stroke-width="5" fill="none" marker-end="url(#vsc-arrow)" />
      <!-- flattened vector -->
      <g transform="translate(662 60)">
        <rect v-for="k in 16" :key="k" x="0" :y="(k - 1) * 13.5" width="16" height="12.5"
          :fill="rgb(pix[k - 1])" stroke="#fff" stroke-width=".5" />
        <text x="8" y="228" text-anchor="middle" style="font-size: 12px" fill="#333">&#8942;</text>
        <text x="-6" y="250" style="font-size: 12px" fill="#555">[HWC]</text>
        <text x="8" y="-8" text-anchor="middle" style="font-size: 12px" fill="#555" font-style="italic">flatten</text>
      </g>
      <!-- axes with one point -->
      <line x1="720" y1="290" x2="870" y2="290" stroke="#00457c" stroke-width="2" marker-end="url(#vsc-arrow)" />
      <line x1="720" y1="290" x2="720" y2="150" stroke="#00457c" stroke-width="2" marker-end="url(#vsc-arrow)" />
      <line x1="720" y1="290" x2="800" y2="215" stroke="#00457c" stroke-width="2" marker-end="url(#vsc-arrow)" />
      <text x="866" y="306" style="font-size: 12px" font-style="italic" fill="#555" text-anchor="end">pixel 1, green</text>
      <text x="726" y="160" style="font-size: 12px" font-style="italic" fill="#555">pixel 1, red</text>
      <text x="806" y="214" style="font-size: 12px" font-style="italic" fill="#555">&#8230; &#215; 48</text>
      <g transform="translate(792 170)">
        <rect v-for="(p, i) in pix" :key="i" :x="(i % 4) * 5.5" :y="Math.floor(i / 4) * 5.5" width="5.5" height="5.5" :fill="rgb(p)" />
        <rect x="0" y="0" width="22" height="22" fill="none" stroke="#00457c" stroke-width="1.5" />
      </g>
      <text x="790" y="330" text-anchor="middle" style="font-size: 14px" fill="#222"><tspan font-weight="700">1 data point</tspan> in 48 dimensions</text>
      <text x="790" y="350" text-anchor="middle" style="font-size: 14px" fill="#222">span a <tspan font-weight="700" fill="#2e8b3a">48-D vector space</tspan></text>
    </g>
  </svg></div>
</template>
