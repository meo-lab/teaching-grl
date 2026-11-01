<script setup lang="ts">
import { computed } from 'vue'
import happyUrl from '../figures/dt_sunflower_happy.png'
import unhappyUrl from '../figures/dt_sunflower_unhappy.png'

// Generic, hand-placed binary-tree diagram used throughout the decision-tree section.
// Node coordinates are given in viewBox units, so each slide controls its own layout.
interface TreeNode {
  id: string
  x: number
  y: number
  label?: string
  // decision: filled split node · leaf: outlined output · input: plain feature label · dot: tiny node
  type?: 'decision' | 'leaf' | 'input' | 'dot'
  // leaf rendered as a sunflower icon instead of text
  icon?: 'happy' | 'unhappy' | 'unknown'
  w?: number
  color?: string
}

interface TreeEdge {
  from: string
  to: string
  label?: string
}

const props = withDefaults(defineProps<{
  nodes: TreeNode[]
  edges: TreeEdge[]
  width?: number
  height?: number
  // ids of nodes/edges (edge id = "from-to") drawn in the highlight colour
  highlight?: string[]
  // ids of nodes drawn greyed out (e.g. pruned sub-trees)
  dim?: string[]
  // when set, only these node ids are drawn (edges need both ends visible)
  show?: string[]
  maxWidth?: string
}>(), {
  width: 360,
  height: 240,
  highlight: () => [],
  dim: () => [],
  maxWidth: '100%',
})

const visible = computed(() => new Set(props.show ?? props.nodes.map(n => n.id)))
const byId = computed(() => Object.fromEntries(props.nodes.map(n => [n.id, n])))

const NODE_H = 26
const ICON = 34

function nodeWidth(n: TreeNode) {
  if (n.w) return n.w
  if (n.type === 'dot') return 10
  if (n.icon) return ICON
  return Math.max(48, (n.label?.length ?? 2) * 7.4 + 18)
}

function half(n: TreeNode) {
  if (n.type === 'dot') return 5
  if (n.icon) return ICON / 2
  return NODE_H / 2
}

const drawnEdges = computed(() => props.edges
  .filter(e => visible.value.has(e.from) && visible.value.has(e.to))
  .map((e) => {
    const a = byId.value[e.from]
    const b = byId.value[e.to]
    const x1 = a.x
    const y1 = a.y + (a.type === 'input' ? 9 : half(a))
    const x2 = b.x
    const y2 = b.y - half(b)
    const id = `${e.from}-${e.to}`
    const left = x2 < x1
    return {
      id,
      x1, y1, x2, y2,
      label: e.label,
      lx: (x1 + x2) / 2 + (left ? -8 : 8),
      ly: (y1 + y2) / 2 - 2,
      anchor: left ? 'end' : 'start',
      hl: props.highlight.includes(id),
      dim: props.dim.includes(e.to),
      arrow: a.type === 'input',
    }
  }))

const drawnNodes = computed(() => props.nodes
  .filter(n => visible.value.has(n.id))
  .map(n => ({
    ...n,
    type: n.type ?? 'decision',
    width: nodeWidth(n),
    hl: props.highlight.includes(n.id),
    dimmed: props.dim.includes(n.id),
  })))

function iconUrl(icon?: string) {
  return icon === 'happy' ? happyUrl : unhappyUrl
}
</script>

<template>
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    class="tree-diagram"
    :style="{ width: '100%', height: 'auto', maxWidth }"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <marker id="td-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--bonn-blue)" />
      </marker>
    </defs>

    <g v-for="e in drawnEdges" :key="e.id" :style="{ opacity: e.dim ? 0.35 : 1 }">
      <line
        :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2"
        :stroke="e.hl ? 'var(--grl-data-orange)' : (e.dim ? 'var(--bonn-muted)' : 'var(--bonn-blue)')"
        :stroke-width="e.hl ? 3 : 1.6"
        :marker-end="e.arrow ? 'url(#td-arrow)' : undefined"
      />
      <text v-if="e.label" :x="e.lx" :y="e.ly" :text-anchor="e.anchor" class="edge-label">{{ e.label }}</text>
    </g>

    <g v-for="n in drawnNodes" :key="n.id" :style="{ opacity: n.dimmed ? 0.35 : 1 }">
      <template v-if="n.type === 'input'">
        <text :x="n.x" :y="n.y + 4" text-anchor="middle" class="input-label">{{ n.label }}</text>
      </template>

      <template v-else-if="n.type === 'dot'">
        <circle :cx="n.x" :cy="n.y" r="5" :fill="n.color ?? (n.dimmed ? 'var(--bonn-muted)' : 'var(--bonn-blue)')" />
      </template>

      <template v-else-if="n.icon">
        <circle
          v-if="n.hl" :cx="n.x" :cy="n.y" :r="ICON / 2 + 3"
          fill="none" stroke="var(--grl-data-orange)" stroke-width="3"
        />
        <image
          v-if="n.icon !== 'unknown'"
          :href="iconUrl(n.icon)" :x="n.x - ICON / 2" :y="n.y - ICON / 2" :width="ICON" :height="ICON"
        />
        <g v-else>
          <circle :cx="n.x" :cy="n.y" :r="ICON / 2 - 2" fill="#ffffff" stroke="var(--bonn-blue)" stroke-width="1.6" />
          <text :x="n.x" :y="n.y + 6" text-anchor="middle" class="unknown-label">?</text>
        </g>
      </template>

      <template v-else>
        <rect
          :x="n.x - n.width / 2" :y="n.y - NODE_H / 2" :width="n.width" :height="NODE_H" rx="5"
          :fill="n.type === 'decision' ? (n.color ?? (n.dimmed ? 'var(--bonn-muted)' : 'var(--bonn-blue)')) : '#ffffff'"
          :stroke="n.hl ? 'var(--grl-data-orange)' : (n.dimmed ? 'var(--bonn-muted)' : 'var(--bonn-blue)')"
          :stroke-width="n.hl ? 3 : 1.6"
        />
        <text
          :x="n.x" :y="n.y + 4.5" text-anchor="middle"
          :class="n.type === 'decision' ? 'decision-label' : 'leaf-label'"
        >{{ n.label }}</text>
      </template>
    </g>
  </svg>
</template>

<style scoped>
.tree-diagram {
  display: block;
  margin: 0 auto;
  overflow: visible;
}

.decision-label {
  font-size: 12.5px;
  font-style: italic;
  font-family: 'Times New Roman', Times, serif;
  fill: #ffffff;
}

.leaf-label {
  font-size: 12px;
  font-weight: 600;
  fill: var(--bonn-blue);
}

.input-label {
  font-size: 15px;
  font-style: italic;
  font-family: 'Times New Roman', Times, serif;
  fill: var(--bonn-blue);
}

.unknown-label {
  font-size: 18px;
  font-weight: 700;
  fill: var(--bonn-blue);
}

.edge-label {
  font-size: 10px;
  fill: var(--bonn-muted);
}
</style>
