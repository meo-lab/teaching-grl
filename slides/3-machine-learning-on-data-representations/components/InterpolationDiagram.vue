<script setup lang="ts">
import { computed } from 'vue'

const cell = 80
const sourceLines = [20, 100, 180, 260]
const targetOffset = 34
const targetLines = sourceLines.map(v => v + targetOffset)

const viewW = 320
const viewH = 320

interface Node { x: number, y: number }

const sourceNodes = computed<Node[]>(() => {
  const out: Node[] = []
  for (const x of sourceLines)
    for (const y of sourceLines) out.push({ x, y })
  return out
})

const targetNodes = computed<Node[]>(() => {
  const out: Node[] = []
  for (const x of targetLines)
    for (const y of targetLines) out.push({ x, y })
  return out
})

// reference target node: second line in both directions
const reference: Node = { x: targetLines[1], y: targetLines[1] }

// the four nearest source nodes surrounding the reference point
const neighbors = computed(() => {
  return sourceNodes.value
    .map(n => ({ ...n, d: Math.hypot(n.x - reference.x, n.y - reference.y) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 4)
})
</script>

<template>
  <div class="interpolation-diagram">
    <svg
      :viewBox="`0 0 ${viewW} ${viewH}`"
      class="interpolation-svg"
      :style="{ width: '100%', height: 'auto' }"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- source grid (solid) -->
      <g class="source-grid">
        <line v-for="x in sourceLines" :key="`sv-${x}`" :x1="x" y1="20" :x2="x" y2="260" stroke="var(--bonn-blue)" stroke-width="1.25" opacity="0.4" />
        <line v-for="y in sourceLines" :key="`sh-${y}`" x1="20" :y1="y" x2="260" :y2="y" stroke="var(--bonn-blue)" stroke-width="1.25" opacity="0.4" />
      </g>

      <!-- target grid (dashed, misaligned) -->
      <g class="target-grid">
        <line v-for="x in targetLines" :key="`tv-${x}`" :x1="x" y1="54" :x2="x" y2="294" stroke="var(--grl-data-orange)" stroke-width="1.25" stroke-dasharray="5 4" opacity="0.55" />
        <line v-for="y in targetLines" :key="`th-${y}`" x1="54" :y1="y" x2="294" :y2="y" stroke="var(--grl-data-orange)" stroke-width="1.25" stroke-dasharray="5 4" opacity="0.55" />
      </g>

      <!-- distance lines from the reference target point to its 4 nearest source centers -->
      <g class="distances">
        <line
          v-for="(n, i) in neighbors" :key="`dl-${i}`"
          :x1="reference.x" :y1="reference.y" :x2="n.x" :y2="n.y"
          stroke="var(--bonn-muted)" stroke-width="1.25" stroke-dasharray="3 3"
        />
        <text
          v-for="(n, i) in neighbors" :key="`dt-${i}`"
          :x="(reference.x + n.x) / 2" :y="(reference.y + n.y) / 2"
          text-anchor="middle" dominant-baseline="middle"
          class="distance-label"
        >d{{ i + 1 }}</text>
      </g>

      <!-- source grid centers -->
      <circle v-for="(n, i) in sourceNodes" :key="`sn-${i}`" :cx="n.x" :cy="n.y" r="3.5" fill="var(--bonn-blue)" opacity="0.75" />

      <!-- highlighted source neighbors -->
      <circle v-for="(n, i) in neighbors" :key="`nn-${i}`" :cx="n.x" :cy="n.y" r="5.5" fill="var(--bonn-blue)" stroke="#ffffff" stroke-width="1.5" />

      <!-- target grid centers -->
      <circle v-for="(n, i) in targetNodes" :key="`tn-${i}`" :cx="n.x" :cy="n.y" r="3.5" fill="var(--grl-data-orange)" opacity="0.6" />

      <!-- reference target center -->
      <circle :cx="reference.x" :cy="reference.y" r="6.5" fill="var(--grl-data-orange)" stroke="#ffffff" stroke-width="2" />
    </svg>

    <div class="legend">
      <span class="legend-item"><span class="swatch swatch-source" />source grid</span>
      <span class="legend-item"><span class="swatch swatch-target" />target grid</span>
      <span class="legend-item"><span class="swatch swatch-ref" />reference point</span>
    </div>
  </div>
</template>

<style scoped>
.interpolation-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 195px;
  margin: 0 auto;
}

.interpolation-svg {
  display: block;
  margin: 0 auto;
}

.distance-label {
  font-size: 12px;
  font-weight: 600;
  fill: var(--bonn-text);
  paint-order: stroke;
  stroke: #ffffff;
  stroke-width: 3px;
}

.legend {
  display: flex;
  gap: 10px;
  margin-top: 3px;
  font-size: 0.58rem;
  color: var(--bonn-muted);
  width: max-content;
  max-width: none;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.swatch {
  width: 9px;
  height: 9px;
  border-radius: 9999px;
  display: inline-block;
}

.swatch-source {
  background: var(--bonn-blue);
  opacity: 0.75;
}

.swatch-target {
  background: var(--grl-data-orange);
  opacity: 0.6;
}

.swatch-ref {
  background: var(--grl-data-orange);
  box-shadow: 0 0 0 1.5px #ffffff, 0 0 0 2.5px var(--grl-data-orange);
}
</style>
