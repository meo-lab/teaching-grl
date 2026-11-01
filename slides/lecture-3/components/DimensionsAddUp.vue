<script setup lang="ts">
// Stacking geospatial layers quickly produces high-dimensional feature vectors.
// clicks: 0 one Sentinel-2 pixel (13 bands) -> 1 x 12 months -> 2 x 5x5 neighbourhood
//         -> 3 + auxiliary layers (elevation, slope, land cover one-hot, ...)
import { computed } from 'vue'

const props = withDefaults(defineProps<{ clicks?: number }>(), { clicks: Infinity })
const step = computed(() => Math.min(3, props.clicks))

const steps = [
  { label: 'one Sentinel-2 pixel', formula: '13 bands', d: 13 },
  { label: '+ time: one image per month', formula: '13 × 12', d: 156 },
  { label: '+ local context: 5 × 5 neighbourhood', formula: '13 × 12 × 25', d: 3900 },
  { label: '+ auxiliary layers (elevation, slope, land-cover one-hot, …)', formula: '13 × 12 × 25 + 13 × 25', d: 4225 },
]
const fmt = (n: number) => n.toLocaleString('en-US')

// band colours (visible -> NIR -> SWIR)
const bandColors = ['#5b6fd6', '#3b82f6', '#2eb82e', '#e04848', '#e9706a', '#d9845a', '#c98f4e', '#9c6b3a', '#8b5e34', '#6f4e37', '#7d7d7d', '#a0a0a0', '#5f625f']
const months = 12
</script>

<template>
  <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 42%"><svg viewBox="0 0 900 378" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" aria-label="Stacking bands, time steps, neighbourhood pixels and auxiliary layers multiplies the number of dimensions">
    <!-- left: illustration -->
    <g transform="translate(20 20)">
      <!-- step 2: neighbourhood grid (behind) -->
      <g :style="{ opacity: step >= 2 ? 1 : 0, transition: 'opacity .5s' }">
        <rect v-for="k in 25" :key="`n${k}`" :x="300 + ((k - 1) % 5) * 34" :y="40 + Math.floor((k - 1) / 5) * 34" width="32" height="32" rx="2"
          :fill="k === 13 ? '#ff7900' : '#9fc79a'" :style="{ fillOpacity: k === 13 ? 0.9 : 0.55 }" stroke="#fff" />
        <text x="385" y="230" text-anchor="middle" style="font-size: 13px" fill="#333">5 × 5 neighbourhood</text>
      </g>

      <!-- step 0: band column of one pixel -->
      <g>
        <rect v-for="(c, i) in bandColors" :key="`b${i}`" x="10" :y="10 + i * 16" width="34" height="14" rx="2" :fill="c" />
        <text x="27" y="232" text-anchor="middle" style="font-size: 13px" fill="#333">13 bands</text>
      </g>

      <!-- step 1: months -->
      <g :style="{ opacity: step >= 1 ? 1 : 0, transition: 'opacity .5s' }">
        <g v-for="m in months - 1" :key="`m${m}`">
          <rect v-for="(c, i) in bandColors" :key="`m${m}b${i}`" :x="10 + m * 18" :y="10 + i * 16" width="14" height="14" rx="2" :fill="c" :style="{ fillOpacity: 0.85 - m * 0.04 }" />
        </g>
        <text x="130" y="232" text-anchor="middle" style="font-size: 13px" fill="#333">× 12 months</text>
      </g>

      <!-- step 3: auxiliary layers -->
      <g :style="{ opacity: step >= 3 ? 1 : 0, transition: 'opacity .5s' }">
        <g v-for="(l, i) in ['elevation', 'slope', 'land cover', 'population', '…']" :key="l">
          <rect x="520" :y="40 + i * 34" width="140" height="28" rx="4" fill="#ececec" stroke="#5f625f" />
          <text x="590" :y="59 + i * 34" text-anchor="middle" style="font-size: 12px" fill="#333">{{ l }}</text>
        </g>
        <text x="590" y="230" text-anchor="middle" style="font-size: 13px" fill="#333">auxiliary layers</text>
      </g>
    </g>

    <!-- right: running dimension count -->
    <g transform="translate(700 30)">
      <text x="90" y="10" text-anchor="middle" style="font-size: 14px" fill="#555">dimensions of one feature vector</text>
      <text x="90" y="80" text-anchor="middle" style="font-size: 52px" font-weight="700" fill="#00457c">{{ fmt(steps[step].d) }}</text>
      <text x="90" y="110" text-anchor="middle" style="font-size: 13px" fill="#555" class="font-mono">D = {{ steps[step].formula }}</text>
    </g>

    <!-- bottom: step list -->
    <g transform="translate(20 268)">
      <g v-for="(s, i) in steps" :key="s.label" :style="{ opacity: i <= step ? 1 : 0.25, transition: 'opacity .4s' }">
        <circle cx="10" :cy="i * 26" r="9" :fill="i === step ? '#ff7900' : '#00457c'" />
        <text x="10" :y="i * 26 + 4" text-anchor="middle" style="font-size: 11px" font-weight="700" fill="#fff">{{ i + 1 }}</text>
        <text x="28" :y="i * 26 + 5" style="font-size: 14px" fill="#222">{{ s.label }}</text>
        <text x="860" :y="i * 26 + 5" text-anchor="end" style="font-size: 14px" font-weight="700" fill="#00457c">D = {{ fmt(s.d) }}</text>
      </g>
    </g>
  </svg></div>
</template>
