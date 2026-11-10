<script setup lang="ts">
// Graphical model of logistic regression with two inputs.
// Clicking the z node or the p node switches the 3D view (LogisticPlanesDemo) via the shared logiNode ref.
import { logiNode } from '../lib/logisticView'

// static: plain reminder figure (no click hint, nodes not clickable)
const props = withDefaults(defineProps<{ static?: boolean }>(), { static: false })
const pick = (n: 'z' | 'p') => { if (!props.static) logiNode.value = n }

const it = 'font-family:serif;font-style:italic;line-height:1'
const lab = 'font-family:inherit;font-style:normal;line-height:1'
const halo = ';paint-order:stroke;stroke:white;stroke-width:4px'
</script>

<template>
  <svg viewBox="0 0 440 240" class="lg-graph" role="img" aria-label="Graphical model: x1 (NDVI), x2 (green) and 1 connect with weights w1, w2 and b to the linear node z, which passes through the sigmoid to p(vegetation). Click z or p to switch the 3D view." @click.stop @dblclick.stop>
    <line x1="130" y1="45" x2="258" y2="120" stroke="#00457c" stroke-width="2.5" />
    <line x1="130" y1="120" x2="258" y2="120" stroke="#00457c" stroke-width="2.5" />
    <line x1="130" y1="195" x2="258" y2="120" stroke="#9aa0a6" stroke-width="2.5" />
    <text :style="`font-size:17px;${it}${halo}`" x="186" y="72" text-anchor="middle" fill="#00457c">w₁</text>
    <text :style="`font-size:17px;${it}${halo}`" x="186" y="115" text-anchor="middle" fill="#00457c">w₂</text>
    <text :style="`font-size:17px;${it}${halo}`" x="186" y="170" text-anchor="middle" fill="#5f6368">b</text>
    <circle cx="110" cy="45" r="21" fill="#e8f0f8" stroke="#00457c" stroke-width="2.5" />
    <text :style="`font-size:19px;${it}`" x="110" y="51" text-anchor="middle" fill="#00457c">x₁</text>
    <text :style="`font-size:12px;${lab}`" x="80" y="49" text-anchor="end" fill="#5f6368">NDVI</text>
    <circle cx="110" cy="120" r="21" fill="#e8f0f8" stroke="#00457c" stroke-width="2.5" />
    <text :style="`font-size:19px;${it}`" x="110" y="126" text-anchor="middle" fill="#00457c">x₂</text>
    <text :style="`font-size:12px;${lab}`" x="80" y="124" text-anchor="end" fill="#5f6368">green</text>
    <circle cx="110" cy="195" r="21" fill="#f1f3f4" stroke="#9aa0a6" stroke-width="2.5" />
    <text :style="`font-size:19px;font-family:serif;line-height:1`" x="110" y="201" text-anchor="middle" fill="#5f6368">1</text>

    <!-- clickable: linear part z -->
    <g class="node" :class="{ on: !static && logiNode === 'z', live: !static }" @click.stop="pick('z')">
      <circle cx="280" cy="120" r="28" class="ring" fill="none" stroke="#ff7900" />
      <circle cx="280" cy="120" r="22" fill="#fff1e5" stroke="#ff7900" stroke-width="2.5" />
      <text :style="`font-size:20px;${it}`" x="280" y="127" text-anchor="middle" fill="#b35500">z</text>
      <text :style="`font-size:11px;${lab}`" x="280" y="165" text-anchor="middle" fill="#5f6368">linear part</text>
    </g>

    <line x1="302" y1="120" x2="378" y2="120" stroke="#00457c" stroke-width="2.5" />
    <rect x="322" y="104" width="34" height="32" rx="6" fill="#ffffff" stroke="#00457c" stroke-width="2" />
    <path d="M326,130 C336,130 334,110 352,110" fill="none" stroke="#00457c" stroke-width="2" />
    <text :style="`font-size:14px;${it}${halo}`" x="339" y="96" text-anchor="middle" fill="#00457c">σ</text>

    <!-- clickable: p(vegetation) -->
    <g class="node" :class="{ on: !static && logiNode === 'p', live: !static }" @click.stop="pick('p')">
      <circle cx="400" cy="120" r="28" class="ring" fill="none" stroke="#2ca02c" />
      <circle cx="400" cy="120" r="22" fill="#e9f5e9" stroke="#2ca02c" stroke-width="2.5" />
      <text :style="`font-size:18px;${it}`" x="400" y="127" text-anchor="middle" fill="#1e7a1e">p</text>
      <text :style="`font-size:11px;${lab}`" x="400" y="165" text-anchor="middle" fill="#5f6368">p(vegetation)</text>
    </g>
    <text v-if="!static" :style="`font-size:11px;${lab}`" x="340" y="215" text-anchor="middle" fill="#8b8f8d">click z or p to switch the 3D view →</text>
  </svg>
</template>

<style scoped>
.lg-graph { width: 100%; height: 100%; }
.node.live { cursor: pointer; }
.node .ring { stroke-width: 3; opacity: 0; transition: opacity .3s ease; }
.node.on .ring { opacity: .9; }
.node.live:hover .ring { opacity: .45; }
.node.on:hover .ring { opacity: .9; }
</style>
