<script setup lang="ts">
// Two ways to turn a 4 x 4 RGB image into vectors (after the Wageningen RS lecture):
//  variant 'pixels': 3-D tensor -> N = HW pixel vectors [C] -> data matrix [N x C]  (3 dimensions)
//  variant 'image' : 3-D tensor -> flatten -> one vector [HWC] -> data matrix [1 x HWC] (48 dimensions)
// clicks: 0 tensor, 1 + middle step, 2 + data matrix
import { computed } from 'vue'

const props = withDefaults(defineProps<{ variant?: 'pixels' | 'image', clicks?: number }>(), { variant: 'pixels', clicks: Infinity })
const show = (k: number) => ({ opacity: props.clicks >= k ? 1 : 0, transition: 'opacity .4s' })

const pix: [number, number, number][] = [
  [0.24, 0.42, 0.22], [0.30, 0.48, 0.25], [0.55, 0.58, 0.50], [0.62, 0.64, 0.58],
  [0.20, 0.38, 0.20], [0.28, 0.50, 0.26], [0.50, 0.55, 0.47], [0.70, 0.70, 0.64],
  [0.16, 0.30, 0.16], [0.22, 0.40, 0.22], [0.35, 0.52, 0.30], [0.58, 0.60, 0.52],
  [0.12, 0.25, 0.14], [0.18, 0.34, 0.18], [0.30, 0.46, 0.26], [0.45, 0.52, 0.40],
]
const rgb = (p: number[]) => `rgb(${p.map(v => Math.round(v * 255)).join(',')})`
const chan = ['#c0392b', '#2e8b3a', '#1f5fa8']
const f2 = (v: number) => v.toFixed(2)
const isPixels = computed(() => props.variant === 'pixels')
</script>

<template>
  <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 40%"><svg viewBox="0 0 900 360" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" :aria-label="isPixels ? 'An RGB image as a dataset of pixel vectors with three dimensions' : 'An RGB image flattened into a single 48-dimensional vector'">
    <defs>
      <marker :id="`iav-arrow-${props.variant}`" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#00457c" /></marker>
    </defs>

    <!-- headers -->
    <g style="font-size: 14px" fill="#222">
      <text x="20" y="20" font-weight="700">3-D tensor:</text><text x="20" y="38">image (RGB)</text><text x="20" y="56" class="font-mono">[H × W × C]</text>
      <g :style="show(1)">
        <text x="300" y="20" font-weight="700">{{ isPixels ? '1-D tensors:' : '1-D tensor:' }}</text>
        <text x="300" y="38">{{ isPixels ? 'list of N = HW pixels' : 'stacked pixels' }}</text>
        <text x="300" y="56" class="font-mono">{{ isPixels ? '[C]' : '[HWC]' }}</text>
      </g>
      <g :style="show(2)">
        <text x="560" y="20" font-weight="700">2-D tensor:</text><text x="560" y="38">data(set) matrix</text>
        <text x="560" y="56" class="font-mono">{{ isPixels ? '[N × C]' : '[1 × HWC]' }}</text>
      </g>
    </g>

    <!-- 3-D tensor: three channel layers -->
    <g transform="translate(40 110)">
      <g v-for="c in [2, 1, 0]" :key="c" :transform="`translate(${c * 16} ${-c * 16})`">
        <rect v-for="(p, i) in pix" :key="i" :x="(i % 4) * 30" :y="Math.floor(i / 4) * 30" width="29" height="29"
          :fill="c === 0 ? rgb(p) : (c === 1 ? '#5e86a8' : '#33597b')" stroke="#fff" />
      </g>
      <g v-if="!isPixels" style="font-size: 12px" font-weight="700" fill="#fff">
        <text v-for="k in 4" :key="k" :x="(k - 1) % 2 * 30 + 15" :y="Math.floor((k - 1) / 2) * 30 + 19" text-anchor="middle">{{ k }}</text>
      </g>
    </g>

    <!-- middle step -->
    <g :style="show(1)">
      <line x1="230" y1="170" x2="285" y2="170" stroke="#00457c" stroke-width="3" :marker-end="`url(#iav-arrow-${props.variant})`" />
      <!-- pixels: a fan of small [C] vectors -->
      <g v-if="isPixels" transform="translate(300 90)">
        <g v-for="(p, i) in pix" :key="i" :transform="`translate(${(i % 8) * 26} ${Math.floor(i / 8) * 80})`">
          <rect v-for="c in 3" :key="c" x="0" :y="(c - 1) * 18" width="18" height="17" rx="2" :fill="chan[c - 1]" :style="{ fillOpacity: 0.25 + p[c - 1] }" />
        </g>
        <text x="100" y="175" text-anchor="middle" style="font-size: 13px" fill="#555">N = 16 vectors with 3 values</text>
      </g>
      <!-- image: one long flattened column -->
      <g v-else transform="translate(330 70)">
        <g v-for="k in 4" :key="k">
          <rect v-for="c in 3" :key="c" x="0" :y="(k - 1) * 58 + (c - 1) * 18" width="22" height="17" rx="2" :fill="chan[c - 1]" :style="{ fillOpacity: 0.25 + pix[k - 1][c - 1] }" />
          <text x="34" :y="(k - 1) * 58 + 32" style="font-size: 12px" font-weight="700" fill="#00457c">{{ k }}</text>
        </g>
        <text x="11" y="240" text-anchor="middle" style="font-size: 16px" fill="#555">&#8942;</text>
        <text x="60" y="270" text-anchor="middle" style="font-size: 12px" font-style="italic" fill="#555">&#8220;flatten&#8221; / &#8220;vectorize&#8221;</text>
      </g>
    </g>

    <!-- data matrix -->
    <g :style="show(2)">
      <line x1="525" y1="170" x2="555" y2="170" stroke="#00457c" stroke-width="3" :marker-end="`url(#iav-arrow-${props.variant})`" />
      <g v-if="isPixels" transform="translate(570 90)" style="font-size: 13px">
        <text x="0" y="0" font-style="italic" font-weight="700" fill="#00457c">pixel</text>
        <text x="80" y="0" font-weight="700" :fill="chan[0]">red</text>
        <text x="150" y="0" font-weight="700" :fill="chan[1]">green</text>
        <text x="230" y="0" font-weight="700" :fill="chan[2]">blue</text>
        <g v-for="r in 4" :key="r">
          <text x="20" :y="r * 24" text-anchor="end" fill="#333">{{ r }}</text>
          <text x="80" :y="r * 24" fill="#333">{{ f2(pix[r - 1][0]) }}</text>
          <text x="150" :y="r * 24" fill="#333">{{ f2(pix[r - 1][1]) }}</text>
          <text x="230" :y="r * 24" fill="#333">{{ f2(pix[r - 1][2]) }}</text>
        </g>
        <text x="150" y="122" fill="#555">&#8942;</text>
        <line x1="-10" y1="8" x2="290" y2="8" stroke="#d7d9d8" />
        <text x="150" y="175" text-anchor="middle" style="font-size: 16px" font-weight="700" fill="#00457c">3 data dimensions</text>
        <text x="150" y="196" text-anchor="middle" style="font-size: 14px" fill="#222">16 data points span a <tspan font-weight="700" fill="#2e8b3a">3-D vector space</tspan></text>
      </g>
      <g v-else transform="translate(570 110)" style="font-size: 12px">
        <text x="70" y="-14" text-anchor="middle" fill="#555">pixel 1</text>
        <text x="190" y="-14" text-anchor="middle" fill="#555">pixel 2</text>
        <text x="0" y="6" font-style="italic" font-weight="700" fill="#00457c">image</text>
        <g v-for="(c, j) in ['red', 'green', 'blue', 'red', 'green']" :key="j">
          <text :x="45 + j * 52" y="6" font-weight="700" :fill="chan[j % 3]">{{ c }}</text>
          <text :x="45 + j * 52" y="32" fill="#333">{{ f2(pix[Math.floor(j / 3)][j % 3]) }}</text>
        </g>
        <text x="305" y="6" fill="#555">&#8230;</text>
        <text x="305" y="32" fill="#555">&#8230;</text>
        <text x="20" y="32" text-anchor="end" fill="#333">1</text>
        <line x1="-10" y1="14" x2="315" y2="14" stroke="#d7d9d8" />
        <text x="150" y="120" text-anchor="middle" style="font-size: 16px" font-weight="700" fill="#00457c">48 = 4 · 4 · 3 data dimensions</text>
        <text x="150" y="142" text-anchor="middle" style="font-size: 14px" fill="#222">one data point spans a <tspan font-weight="700" fill="#2e8b3a">48-D vector space</tspan></text>
      </g>
    </g>
  </svg></div>
</template>
