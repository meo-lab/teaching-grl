<script setup lang="ts">
// The same 7 points in 1-D, 2-D and 3-D: with every added dimension the
// space around each point gets emptier.
const p1 = [0.12, 0.2, 0.3, 0.42, 0.55, 0.62, 0.8]
const p2 = [[0.15, 0.7], [0.8, 0.75], [0.35, 0.3], [0.62, 0.45], [0.2, 0.18], [0.85, 0.2], [0.5, 0.85]]
const p3 = [[0.2, 0.7, 0.3], [0.8, 0.2, 0.6], [0.35, 0.3, 0.9], [0.62, 0.8, 0.1], [0.1, 0.1, 0.5], [0.85, 0.55, 0.85], [0.5, 0.45, 0.2]]
const S = 110
const proj3 = (p: number[]) => ({ x: p[0] * S + p[1] * S * 0.5, y: 40 + S - p[2] * S - p[1] * S * 0.4 })
</script>

<template>
  <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 31.6667%"><svg viewBox="0 0 600 190" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" aria-label="Seven points spread across one, two and three dimensions">
    <g style="font-size: 13px" font-weight="700" fill="#00457c" text-anchor="middle">
      <text x="80" y="16">1 dimension</text>
      <text x="290" y="16">2 dimensions</text>
      <text x="500" y="16">3 dimensions</text>
    </g>
    <!-- 1D -->
    <g transform="translate(20 100)">
      <line x1="0" y1="0" x2="120" y2="0" stroke="#00457c" stroke-width="1.5" />
      <circle v-for="(x, i) in p1" :key="i" :cx="x * 140" cy="0" r="6" fill="#ff7900" />
    </g>
    <!-- 2D -->
    <g transform="translate(230 40)">
      <rect x="0" y="0" :width="S + 10" :height="S + 10" fill="none" stroke="#00457c" stroke-width="1.5" />
      <circle v-for="(p, i) in p2" :key="i" :cx="p[0] * S + 5" :cy="(1 - p[1]) * S + 5" r="6" fill="#ff7900" />
    </g>
    <!-- 3D (oblique cube) -->
    <g transform="translate(425 20)">
      <g stroke="#00457c" stroke-width="1.2" fill="none">
        <rect x="0" :y="40" :width="S" :height="S" />
        <rect :x="S * 0.5" :y="40 - S * 0.4" :width="S" :height="S" stroke-dasharray="4 3" />
        <line x1="0" y1="40" :x2="S * 0.5" :y2="40 - S * 0.4" />
        <line :x1="S" y1="40" :x2="S * 1.5" :y2="40 - S * 0.4" />
        <line x1="0" :y1="40 + S" :x2="S * 0.5" :y2="40 + S - S * 0.4" stroke-dasharray="4 3" />
        <line :x1="S" :y1="40 + S" :x2="S * 1.5" :y2="40 + S - S * 0.4" />
      </g>
      <circle v-for="(p, i) in p3" :key="i" :cx="proj3(p).x" :cy="proj3(p).y" :r="4 + p[1] * 4" fill="#ff7900" :style="{ fillOpacity: '.9' }" />
    </g>
  </svg></div>
</template>
