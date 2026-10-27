<script setup lang="ts">
import { computed } from 'vue'

// Recursive binary splitting: a full binary tree revealed level by level.
// clicks 0: root only · 1..depth-1: one more level · depth: leaves hold a single sample each
const props = withDefaults(defineProps<{
  clicks?: number
  depth?: number
  rootLabel?: string
}>(), {
  clicks: Infinity,
  depth: 4,
  rootLabel: 'X < 30 °C',
})

const W = 420
const H = 250
const levelH = 52

const level = computed(() => Math.min(props.depth, props.clicks === Infinity ? props.depth : props.clicks))

interface N { x: number, y: number, d: number, px?: number, py?: number }

const nodes = computed(() => {
  const out: N[] = []
  for (let d = 0; d <= props.depth; d++) {
    const n = 2 ** d
    for (let i = 0; i < n; i++) {
      const x = ((i + 0.5) / n) * (W - 20) + 10
      const y = 20 + d * levelH
      const node: N = { x, y, d }
      if (d > 0) {
        const pn = 2 ** (d - 1)
        const pi = Math.floor(i / 2)
        node.px = ((pi + 0.5) / pn) * (W - 20) + 10
        node.py = 20 + (d - 1) * levelH
      }
      out.push(node)
    }
  }
  return out.filter(n => n.d <= level.value)
})
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="tree-growth" preserveAspectRatio="xMidYMid meet">
    <g v-for="(n, i) in nodes" :key="`e-${i}`">
      <line v-if="n.px !== undefined" :x1="n.px" :y1="n.py" :x2="n.x" :y2="n.y" stroke="var(--bonn-blue)" stroke-width="1.5" />
    </g>
    <g v-for="(n, i) in nodes" :key="`n-${i}`">
      <template v-if="n.d === 0">
        <rect :x="n.x - 46" :y="n.y - 12" width="92" height="24" rx="5" fill="var(--bonn-blue)" />
        <text :x="n.x" :y="n.y + 4.5" text-anchor="middle" class="root">{{ rootLabel }}</text>
      </template>
      <circle
        v-else :cx="n.x" :cy="n.y" :r="n.d === depth ? 4.5 : 6"
        :fill="n.d === depth ? '#5ec8ec' : 'var(--bonn-blue)'"
        :stroke="n.d === depth ? 'var(--bonn-blue)' : 'none'" stroke-width="0.8"
      />
    </g>
    <text v-if="level >= 1 && level < depth" :x="W - 4" y="24" text-anchor="end" class="note">binary splitting at every new node</text>
  </svg>
</template>

<style scoped>
.tree-growth {
  display: block;
  width: 100%;
  height: auto;
}

.root {
  font-size: 12px;
  font-style: italic;
  font-family: 'Times New Roman', Times, serif;
  fill: #ffffff;
}

.note {
  font-size: 10px;
  fill: var(--bonn-muted);
}
</style>
