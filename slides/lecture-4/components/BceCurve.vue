<script setup lang="ts">
// -log(p) for y = 1 and -log(1 - p) for y = 0
const W = 300
const H = 200
const pad = { l: 38, r: 12, t: 12, b: 34 }
const X = (p: number) => pad.l + p * (W - pad.l - pad.r)
const Y = (v: number) => pad.t + (1 - Math.min(v, 4.5) / 4.5) * (H - pad.t - pad.b)
const ps = Array.from({ length: 120 }, (_, i) => 0.005 + i / 119 * 0.99)
const pos = ps.map(p => `${X(p)},${Y(-Math.log(p))}`).join(' ')
const neg = ps.map(p => `${X(p)},${Y(-Math.log(1 - p))}`).join(' ')
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto bce">
    <line :x1="pad.l" :x2="W - pad.r" :y1="Y(0)" :y2="Y(0)" class="ax" />
    <line :x1="pad.l" :x2="pad.l" :y1="pad.t" :y2="Y(0)" class="ax" />
    <polyline :points="pos" class="c1" />
    <polyline :points="neg" class="c0" />
    <text v-for="t in [0, 0.5, 1]" :key="t" :x="X(t)" :y="Y(0) + 13" class="tick">{{ t }}</text>
    <text v-for="t in [0, 2, 4]" :key="`y${t}`" :x="pad.l - 6" :y="Y(t) + 3.5" class="tick" text-anchor="end">{{ t }}</text>
    <text :x="(W + pad.l) / 2" :y="H - 4" class="lab">predicted probability p = ŷ</text>
    <text :transform="`translate(12,${(H - pad.b + pad.t) / 2}) rotate(-90)`" class="lab">loss</text>
    <text :x="X(0.05)" :y="Y(4.1)" class="l1">y = 1: −log p</text>
    <text :x="X(0.95)" :y="Y(4.1)" class="l0">y = 0: −log(1−p)</text>
  </svg>
</template>

<style scoped>
.bce .ax { stroke: #9aa1a6; }
.bce .c1 { fill: none; stroke: #ff7900; stroke-width: 2.4; }
.bce .c0 { fill: none; stroke: #00457c; stroke-width: 2.4; }
.bce .tick { font: 9.5px "Exo 2", sans-serif; fill: #666; text-anchor: middle; }
.bce .lab { font: 11px "Exo 2", sans-serif; fill: #444; text-anchor: middle; }
.bce .l1 { font: 600 11px "Exo 2", sans-serif; fill: #ff7900; text-anchor: start; paint-order: stroke; stroke: #fff; stroke-width: 3px; }
.bce .l0 { font: 600 11px "Exo 2", sans-serif; fill: #00457c; text-anchor: end; paint-order: stroke; stroke: #fff; stroke-width: 3px; }
</style>
