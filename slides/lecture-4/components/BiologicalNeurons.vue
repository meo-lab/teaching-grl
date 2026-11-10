<script setup lang="ts">
// Biological reading of y = Wx: each output is one neuron that sums (Σ) the signals arriving at its dendrites.
// Two neuron drawings (figures/Asset-1.svg pink, Asset-2.svg grey) share the same three inputs.
// Node style matches the graphical models (LayerGraph): inputs blue, outputs orange.
import pinkNeuron from '../figures/Asset-1.svg?url'
import greyNeuron from '../figures/Asset-2.svg?url'

withDefaults(defineProps<{ plain?: boolean }>(), { plain: false }) // plain: hide the inputs / outputs titles

const R = 17
const inputs = [
  { x: 142, y: 96 },
  { x: 84, y: 178 },
  { x: 150, y: 238 },
]
// soma (cell body) positions of the two neuron drawings, and their outputs
const outputs = [
  { sx: 296, sy: 141, x: 365, y: 141, sum: '#e27ad6', sumDy: -22 },
  { sx: 293, sy: 201, x: 365, y: 201, sum: '#9aa0a6', sumDy: 36 },
]
const it = 'font-family:serif;font-style:italic;line-height:1'
const lab = 'font-family:inherit;font-style:normal;line-height:1'
</script>

<template>
  <svg viewBox="40 2 360 288" class="bio-neurons" preserveAspectRatio="xMidYMin meet" role="img" aria-label="Biological interpretation: three inputs sit on the dendrites of two neurons; each neuron sums its inputs (sigma) in the cell body and produces one output">
    <text v-if="!plain" :style="`font-size:15px;font-weight:700;${lab}`" x="115" y="30" text-anchor="middle" fill="#00457c">inputs</text>
    <text v-if="!plain" :style="`font-size:15px;font-weight:700;${lab}`" x="365" y="30" text-anchor="middle" fill="#00457c">outputs</text>

    <image :href="greyNeuron" x="40" y="60" width="290" height="230" preserveAspectRatio="xMidYMid meet" />
    <image :href="pinkNeuron" x="40" y="40" width="290" height="220" preserveAspectRatio="xMidYMid meet" />

    <g v-for="(n, k) in inputs" :key="`i${k}`">
      <circle :cx="n.x" :cy="n.y" :r="R" fill="#e8f0f8" stroke="#00457c" stroke-width="2.5" />
      <text :style="`font-size:15px;${it}`" :x="n.x" :y="n.y + 5" text-anchor="middle" fill="#00457c">x<tspan baseline-shift="sub" style="font-size:10px">{{ k + 1 }}</tspan></text>
    </g>

    <g v-for="(n, k) in outputs" :key="`o${k}`">
      <text :style="`font-size:22px;${lab}`" :x="n.sx - 62" :y="n.sy + n.sumDy" text-anchor="middle" :fill="n.sum">Σ</text>
      <line :x1="n.sx + 16" :y1="n.sy" :x2="n.x - R" :y2="n.y" :stroke="n.sum" stroke-width="2.5" />
      <circle :cx="n.x" :cy="n.y" :r="R" fill="#fff1e5" stroke="#ff7900" stroke-width="2.5" />
      <text :style="`font-size:15px;${it}`" :x="n.x" :y="n.y + 5" text-anchor="middle" fill="#b35500">y<tspan baseline-shift="sub" style="font-size:10px">{{ k + 1 }}</tspan></text>
    </g>
  </svg>
</template>

<style scoped>
.bio-neurons { width: 100%; height: 100%; }
</style>
