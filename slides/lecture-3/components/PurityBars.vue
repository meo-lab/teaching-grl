<script setup lang="ts">
// Class-count histogram of a tree node, used to discuss node purity (entropy / Gini).
const props = withDefaults(defineProps<{
  counts: number[]
  labels?: string[]
  colors?: string[]
  showValues?: boolean
  title?: string
  // value that maps to the full bar height (keeps several charts on one scale)
  max?: number
}>(), {
  labels: () => ['urban', 'ground', 'water', 'veg.'],
  colors: () => ['#b02b37', '#035172', '#5ec8ec', '#2eb82e'],
  showValues: true,
})

const W = 150
const H = 132
const baseY = 100
const barH = 66
const barW = 22
const gap = 10
const x0 = 22

function height(v: number) {
  const m = props.max ?? Math.max(...props.counts, 1)
  return (v / m) * barH
}
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="purity-bars" preserveAspectRatio="xMidYMid meet">
    <text v-if="title" :x="W / 2" y="10" text-anchor="middle" class="title">{{ title }}</text>
    <text x="10" :y="baseY - barH / 2" text-anchor="middle" class="axis" :transform="`rotate(-90 10 ${baseY - barH / 2})`">counts</text>
    <line :x1="x0 - 4" :y1="baseY" :x2="x0 + counts.length * (barW + gap)" :y2="baseY" stroke="var(--bonn-muted)" stroke-width="1.2" />
    <g v-for="(v, i) in counts" :key="i">
      <rect :x="x0 + i * (barW + gap)" :y="baseY - height(v)" :width="barW" :height="height(v)" :fill="colors[i]" />
      <text v-if="showValues" :x="x0 + i * (barW + gap) + barW / 2" :y="baseY - height(v) - 3" text-anchor="middle" class="value">{{ v }}</text>
      <text :x="x0 + i * (barW + gap) + barW / 2" :y="baseY + 12" text-anchor="middle" class="label">{{ labels[i] }}</text>
    </g>
  </svg>
</template>

<style scoped>
.purity-bars {
  display: block;
  width: 100%;
  height: auto;
}

.title {
  font-size: 10px;
  font-weight: 700;
  fill: var(--bonn-blue);
}

.axis {
  font-size: 8px;
  fill: var(--bonn-muted);
}

.value {
  font-size: 9px;
  font-weight: 700;
  fill: var(--bonn-text);
}

.label {
  font-size: 8.5px;
  fill: var(--bonn-muted);
}
</style>
