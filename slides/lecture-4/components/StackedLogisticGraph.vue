<script setup lang="ts">
// Stacked logistic regressions, drawn like LogisticGraph. The architecture comes from the editable
// PyTorch code (MlpCodeEditor) via lib/mlpView: every nn.Linear adds a layer of nodes, an activation
// after it draws its glyph inside those nodes (σ, ReLU, tanh). Default: 2 → 3 (σ) → 1 (σ).
import { computed } from 'vue'
import type { Act } from '../lib/mlpView'
import { mlp } from '../lib/mlpView'

const W = 450
const H = 260
const TOP = 30
const BOT = 215
const MAXN = 7 // nodes drawn per layer; larger layers show "⋮"
const X0 = 60
const X1 = 400

const SUB = '₀₁₂₃₄₅₆₇₈₉'
const sub = (n: number) => String(n).split('').map(d => SUB[Number(d)]).join('')

const view = computed(() => {
  const L = mlp.value.layers.slice(0, 7)
  const nL = L.length
  const xs = L.map((_, l) => (nL === 1 ? (X0 + X1) / 2 : X0 + l * (X1 - X0) / (nL - 1)))
  const maxShown = Math.max(1, ...L.map(l => Math.min(l.size, MAXN)))
  const gap = (BOT - TOP) / Math.max(1, maxShown - 1)
  const R = Math.max(9, Math.min(21, gap * 0.38, (nL > 1 ? (X1 - X0) / (nL - 1) : 200) * 0.16))
  const last = nL - 1
  const layers = L.map((layer, l) => {
    const shown = Math.min(layer.size, MAXN)
    const nodes = Array.from({ length: shown }, (_, k) => {
      const idx = layer.size > MAXN && k === shown - 1 ? layer.size : k + 1 // last drawn node = last neuron
      const y = (TOP + BOT) / 2 + (k - (shown - 1) / 2) * Math.min(gap, 70)
      let t: string
      if (l === 0)
        t = `x${sub(idx)}`
      else if (l === last)
        t = layer.size === 1 ? (layer.act === 'sigmoid' ? 'p' : 'y') : `y${sub(idx)}`
      else
        t = nL > 3 ? `h${sub(idx)}` : `h${sub(idx)}`
      return { y, t }
    })
    const kind = l === 0 ? 'in' : l === last ? 'out' : 'hid'
    const caption = l === 0 ? 'input' : l === last ? 'output' : nL > 3 ? `hidden ${l}` : 'hidden layer'
    return { x: xs[l], size: layer.size, act: layer.act, nodes, kind, caption, dots: layer.size > MAXN }
  })
  return { layers, R }
})

const COLORS = {
  in: { fill: '#e8f0f8', stroke: '#00457c', text: '#00457c' },
  hid: { fill: '#fff1e5', stroke: '#ff7900', text: '#b35500' },
  out: { fill: '#e9f5e9', stroke: '#2ca02c', text: '#1e7a1e' },
}
// activation glyph centred at (cx, cy), scaled to the node radius
function glyph(act: Act, cx: number, cy: number, r: number) {
  const a = r * 0.52
  const b = r * 0.33
  if (act === 'sigmoid')
    return `M${cx - a},${cy + b} C${cx - a * 0.2},${cy + b} ${cx + a * 0.2},${cy - b} ${cx + a},${cy - b}`
  if (act === 'tanh')
    return `M${cx - a},${cy + b} C${cx - a * 0.35},${cy + b} ${cx + a * 0.35},${cy - b} ${cx + a},${cy - b} M${cx - a},${cy} H${cx + a}`
  if (act === 'relu')
    return `M${cx - a},${cy + b * 0.6} H${cx} L${cx + a},${cy - b}`
  if (act === 'leakyrelu')
    return `M${cx - a},${cy + b * 0.85} L${cx},${cy + b * 0.6} L${cx + a},${cy - b}`
  if (act === 'sine')
    return `M${cx - a},${cy} C${cx - a * 0.75},${cy - b * 1.6} ${cx - a * 0.25},${cy - b * 1.6} ${cx},${cy} S${cx + a * 0.75},${cy + b * 1.6} ${cx + a},${cy}`
  if (act === 'gelu')
    return `M${cx - a},${cy + b * 0.6} C${cx - a * 0.4},${cy + b * 0.6} ${cx - a * 0.2},${cy + b} ${cx},${cy + b * 0.6} L${cx + a},${cy - b}`
  return ''
}
const it = 'font-family:serif;font-style:italic;line-height:1'
const lab = 'font-family:inherit;font-style:normal;line-height:1'
const halo = ';paint-order:stroke;stroke:white;stroke-width:4px'
const ariaLabel = computed(() => `Neural network graph: ${view.value.layers.map(l => `${l.caption} with ${l.size} nodes${l.act ? ` and ${l.act} activation` : ''}`).join(', ')}`)
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="slg" role="img" :aria-label="ariaLabel">
    <!-- edges -->
    <template v-for="(L, l) in view.layers" :key="`e${l}`">
      <template v-if="l > 0">
        <template v-for="(b, j) in L.nodes" :key="`e${l}-${j}`">
          <line
            v-for="(a, i) in view.layers[l - 1].nodes" :key="`e${l}-${j}-${i}`"
            :x1="view.layers[l - 1].x + view.R" :y1="a.y" :x2="L.x - view.R" :y2="b.y"
            stroke="#00457c" :stroke-width="view.R > 15 ? 2 : 1.4" stroke-opacity="0.75"
          />
        </template>
      </template>
    </template>

    <!-- weight labels -->
    <text
      v-for="(L, l) in view.layers.slice(1)" :key="`w${l}`" :style="`font-size:15px;${it}${halo}`"
      :x="(view.layers[l].x + L.x) / 2" :y="TOP - 16" text-anchor="middle" fill="#00457c"
    >W{{ sub(l + 1) }}</text>

    <!-- nodes -->
    <g v-for="(L, l) in view.layers" :key="`n${l}`">
      <g v-for="(n, k) in L.nodes" :key="`n${l}-${k}`">
        <circle :cx="L.x" :cy="n.y" :r="view.R" :fill="COLORS[L.kind].fill" :stroke="COLORS[L.kind].stroke" stroke-width="2.5" />
        <path v-if="L.act" :d="glyph(L.act, L.x, n.y, view.R)" fill="none" :stroke="COLORS[L.kind].text" stroke-width="2.2" />
        <text
          v-if="!L.act" :style="`font-size:${Math.min(18, view.R * 0.85)}px;${it}`"
          :x="L.x" :y="n.y + view.R * 0.3" text-anchor="middle" :fill="COLORS[L.kind].text"
        >{{ n.t }}</text>
        <text
          v-else-if="view.R >= 14" :style="`font-size:13px;${it}${halo}`"
          :x="L.x + view.R + 3" :y="n.y - view.R + 3" :fill="COLORS[L.kind].text"
        >{{ n.t }}</text>
        <text
          v-if="L.kind === 'in' && L.size === 2" :style="`font-size:11px;${lab}`"
          :x="L.x - view.R - 6" :y="n.y + 4" text-anchor="end" fill="#5f6368"
        >{{ k === 0 ? 'NDVI' : 'green' }}</text>
      </g>
      <text
        v-if="L.dots" :style="`font-size:16px;${lab}`" :x="L.x"
        :y="(L.nodes[L.nodes.length - 2].y + L.nodes[L.nodes.length - 1].y) / 2 + 5" text-anchor="middle" :fill="COLORS[L.kind].text"
      >⋮</text>
      <text
        :style="`font-size:12px;font-weight:700;${lab}`" :x="L.x" :y="H - 12" text-anchor="middle"
        :fill="COLORS[L.kind].text"
      >{{ L.caption }}</text>
      <text
        v-if="L.kind === 'out' && L.size === 1 && L.act === 'sigmoid'" :style="`font-size:11px;${lab}`"
        :x="L.x" :y="L.nodes[0].y + view.R + 16" text-anchor="middle" fill="#5f6368"
      >p(vegetation)</text>
    </g>
  </svg>
</template>

<style scoped>
.slg { width: 100%; height: 100%; }
</style>
