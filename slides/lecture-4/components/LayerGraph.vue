<script setup lang="ts">
// Graphical model of a stack of linear layers (same visual style as the linear / logistic regression graphs).
// Each layer: a column of nodes with a title ("input vector"), its size ("[2]") and a vector symbol ("x").
// Between consecutive layers, fully connected edges labelled with the weight matrix ("W₁").
import { computed } from 'vue'

interface Layer { title: string, sym: string, n: number }
const props = withDefaults(defineProps<{
  layers?: Layer[]
  weights?: string[]
  plain?: boolean // hide titles, vector symbols and weight labels (e.g. for a cover image)
}>(), {
  plain: false,
  layers: () => [
    { title: 'input vector', sym: 'x', n: 2 },
    { title: 'hidden vector', sym: 'h', n: 3 },
  ],
  weights: () => ['W₁'],
})

const R = 19
const GAP = 52 // vertical distance between node centres
const COL = 170 // horizontal distance between layers
const X0 = 70
const YC = 150 // vertical centre of the node columns
const W = computed(() => X0 * 2 + COL * (props.layers.length - 1))

// same palette as the regression graphs: inputs blue, later layers orange
const STYLE = [
  { fill: '#e8f0f8', stroke: '#00457c', text: '#00457c' },
  { fill: '#fff1e5', stroke: '#ff7900', text: '#b35500' },
]
const nodes = computed(() => props.layers.map((l, i) => Array.from({ length: l.n }, (_, k) => ({
  x: X0 + i * COL,
  y: YC + (k - (l.n - 1) / 2) * GAP,
  ...STYLE[i === 0 ? 0 : 1],
}))))
const edges = computed(() => {
  const out: { x1: number, y1: number, x2: number, y2: number }[] = []
  for (let i = 0; i < nodes.value.length - 1; i++) {
    for (const a of nodes.value[i]) {
      for (const b of nodes.value[i + 1])
        out.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })
    }
  }
  return out
})
const it = 'font-family:serif;font-style:italic;line-height:1'
const lab = 'font-family:inherit;font-style:normal;line-height:1'
const halo = ';paint-order:stroke;stroke:white;stroke-width:5px'
const topY = (i: number) => nodes.value[i][0].y
const botY = (i: number) => nodes.value[i][nodes.value[i].length - 1].y
const symY = computed(() => Math.min(...props.layers.map((_, i) => topY(i))) - R - 14)
const maxBot = computed(() => Math.max(...props.layers.map((_, i) => botY(i))))
</script>

<template>
  <svg :viewBox="`0 20 ${W} 280`" class="layer-graph" preserveAspectRatio="xMidYMin meet" role="img" :aria-label="`Graphical model: ${layers.map(l => `${l.title} ${l.sym} with ${l.n} entries`).join(', ')}, fully connected by ${weights.join(', ')}`">
    <line v-for="(e, j) in edges" :key="j" :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2" stroke="#00457c" stroke-width="2" stroke-opacity="0.75" />

    <g v-for="(l, i) in layers" :key="l.title + i">
      <text v-if="!plain" :style="`font-size:14px;font-weight:700;${lab}`" :x="X0 + i * COL" y="44" text-anchor="middle" fill="#00457c">{{ l.title }}</text>
      <text v-if="!plain" :style="`font-size:22px;font-weight:700;${it}`" :x="X0 + i * COL" :y="symY" text-anchor="middle" fill="#00457c">{{ l.sym }}</text>
      <g v-for="(n, k) in nodes[i]" :key="k">
        <circle :cx="n.x" :cy="n.y" :r="R" :fill="n.fill" :stroke="n.stroke" stroke-width="2.5" />
        <text :style="`font-size:16px;${it}`" :x="n.x" :y="n.y + 5" text-anchor="middle" :fill="n.text">{{ l.sym }}<tspan baseline-shift="sub" style="font-size:11px">{{ k + 1 }}</tspan></text>
      </g>
    </g>

    <text v-for="(w, i) in (plain ? [] : weights)" :key="w" :style="`font-size:22px;font-weight:700;${it}${halo}`" :x="X0 + (i + 0.5) * COL" :y="maxBot + R + 34" text-anchor="middle" fill="#00457c">{{ w }}</text>
  </svg>
</template>

<style scoped>
.layer-graph { width: 100%; height: 100%; }
</style>
