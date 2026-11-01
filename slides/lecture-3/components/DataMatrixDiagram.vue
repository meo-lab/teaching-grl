<script setup lang="ts">
// A multi-band image as a data matrix X (N pixels x D bands). Two band columns
// (green, red) are plotted against each other: strongly correlated.
import blueUrl from '../figures/pca/s2-composite-blue.png'
import greenUrl from '../figures/pca/s2-composite-green.png'
import redUrl from '../figures/pca/s2-composite-red.png'
import rgbUrl from '../figures/pca/s2-rgb.png'
import scatterUrl from '../figures/pca/s2-scatter-green-red.png'

const stack = [blueUrl, greenUrl, redUrl, rgbUrl]
const cols = ['B1', 'B2', 'G', 'R', '…', 'B12']
const shade = ['#6b7075', '#8b9095', '#2eb82e', '#b02b37', '#fff', '#a0a5aa']
</script>

<template>
  <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 33.3333%"><svg viewBox="0 0 900 300" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" aria-label="Image bands rearranged as a data matrix with N pixel rows and D band columns; the red and green columns are strongly correlated">
    <defs>
      <marker id="dm-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#00457c" /></marker>
    </defs>
    <!-- band stack -->
    <image v-for="(u, i) in stack" :key="i" :href="u" :x="60 - i * 16" :y="20 + i * 22" width="170" height="170" />
    <text x="110" y="290" style="font-size: 13px" text-anchor="middle" fill="#333">13 Sentinel-2 bands</text>

    <line x1="250" y1="150" x2="300" y2="150" stroke="#00457c" stroke-width="4" marker-end="url(#dm-arrow)" />

    <!-- data matrix -->
    <g transform="translate(330 30)">
      <rect x="-14" y="-18" width="240" height="268" rx="12" fill="#fff" stroke="#00457c" stroke-width="1.5" />
      <text x="0" y="0" style="font-size: 15px" font-weight="700" fill="#00457c">Data matrix X</text>
      <text x="210" y="0" style="font-size: 12px" font-style="italic" fill="#555" text-anchor="end">N &#215; D</text>
      <g v-for="(c, j) in cols" :key="c">
        <text :x="22 + j * 30" y="26" style="font-size: 11px" text-anchor="middle" font-style="italic" :fill="j === 2 ? '#2eb82e' : (j === 3 ? '#b02b37' : '#333')" font-weight="700">{{ c }}</text>
        <template v-if="c !== '…'">
          <rect v-for="r in 7" :key="r" :x="10 + j * 30" :y="34 + (r - 1) * 26 + (r === 7 ? 10 : 0)" width="24" height="22" rx="3" :fill="shade[j]" :style="{ fillOpacity: j === 2 || j === 3 ? 0.75 : 0.85 }" />
        </template>
        <text v-else :x="22 + j * 30" y="120" style="font-size: 16px" text-anchor="middle" fill="#555">&#8230;</text>
      </g>
      <rect x="64" y="30" width="62" height="208" rx="5" fill="none" stroke="#ff7900" stroke-width="2.5" />
      <text x="-4" y="200" style="font-size: 16px" fill="#555">&#8942;</text>
      <text x="-6" y="135" style="font-size: 12px" fill="#555" text-anchor="middle" transform="rotate(-90 -6 135)">N pixels</text>
    </g>

    <line x1="580" y1="150" x2="640" y2="150" stroke="#00457c" stroke-width="4" marker-end="url(#dm-arrow)" />

    <image :href="scatterUrl" x="650" y="40" width="240" height="225" />
    <text x="770" y="290" style="font-size: 13px" text-anchor="middle" fill="#333">green vs. red reflectance per pixel</text>
  </svg></div>
</template>
