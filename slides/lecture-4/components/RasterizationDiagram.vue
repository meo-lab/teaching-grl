<script setup lang="ts">
import { computed } from 'vue'

const cols = 6
const rows = 6
const cell = 38
const panelW = cols * cell
const panelH = rows * cell
const gap = 64
const panelBX = panelW + gap

// irregular polygon, drawn in panel-local coordinates
const polygon: [number, number][] = [
  [128, 14], [206, 70], [214, 172], [132, 220], [58, 190], [24, 96],
]

function pointInPolygon(x: number, y: number, poly: [number, number][]) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    const intersect = (yi > y) !== (yj > y)
      && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

// sample each cell on a sub-grid to approximate the covered area fraction
const sampleN = 6

const cells = computed(() => {
  const out: { x: number, y: number, covered: boolean }[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = c * cell
      const y0 = r * cell
      let hits = 0
      for (let si = 0; si < sampleN; si++) {
        for (let sj = 0; sj < sampleN; sj++) {
          const sx = x0 + (si + 0.5) * (cell / sampleN)
          const sy = y0 + (sj + 0.5) * (cell / sampleN)
          if (pointInPolygon(sx, sy, polygon)) hits++
        }
      }
      out.push({ x: x0, y: y0, covered: hits / (sampleN * sampleN) > 0.5 })
    }
  }
  return out
})

const polygonPoints = computed(() => polygon.map(p => p.join(',')).join(' '))
const gridLinesV = Array.from({ length: cols + 1 }, (_, i) => i * cell)
const gridLinesH = Array.from({ length: rows + 1 }, (_, i) => i * cell)

const viewW = panelBX + panelW
const viewH = panelH + 30
</script>

<template>
  <svg
    :viewBox="`0 0 ${viewW} ${viewH}`"
    class="rasterization-diagram"
    :style="{ width: '100%', height: 'auto' }"
    preserveAspectRatio="xMidYMid meet"
  >
    <defs>
      <marker id="rasterization-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="var(--bonn-text)" />
      </marker>
    </defs>

    <!-- Panel A: polygon overlaid with grid -->
    <g>
      <rect :width="panelW" :height="panelH" fill="#ffffff" stroke="var(--bonn-rule)" />
      <line v-for="x in gridLinesV" :key="`va-${x}`" :x1="x" y1="0" :x2="x" :y2="panelH" stroke="var(--bonn-rule)" stroke-width="1" />
      <line v-for="y in gridLinesH" :key="`ha-${y}`" x1="0" :y1="y" :x2="panelW" :y2="y" stroke="var(--bonn-rule)" stroke-width="1" />
      <polygon :points="polygonPoints" fill="var(--grl-data-orange)" fill-opacity="0.32" stroke="var(--grl-data-orange)" stroke-width="2.5" />
    </g>

    <!-- Arrow -->
    <line
      :x1="panelW + 10" :y1="panelH / 2"
      :x2="panelBX - 10" :y2="panelH / 2"
      stroke="var(--bonn-text)" stroke-width="2"
      marker-end="url(#rasterization-arrowhead)"
    />

    <!-- Panel B: rasterized grid -->
    <g :transform="`translate(${panelBX}, 0)`">
      <rect
        v-for="(cbox, i) in cells" :key="`cell-${i}`"
        :x="cbox.x" :y="cbox.y" :width="cell" :height="cell"
        :fill="cbox.covered ? 'var(--bonn-blue)' : '#ffffff'"
        :fill-opacity="cbox.covered ? 0.85 : 1"
        stroke="var(--bonn-rule)" stroke-width="1"
      />
      <polygon :points="polygonPoints" fill="none" stroke="var(--grl-data-orange)" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.55" />
    </g>
  </svg>
</template>

<style scoped>
.rasterization-diagram {
  display: block;
  margin: 0 auto;
}
</style>
