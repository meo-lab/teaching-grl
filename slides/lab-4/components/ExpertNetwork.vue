<script setup lang="ts">
import { computed } from 'vue'
import networkUrl from '../figures/backprop-network.svg'

type Role = 'A' | 'B' | 'C' | 'D'

const props = defineProps<{ role: Role }>()

const regions = {
  A: { x: 14, y: 34, width: 410, height: 168, start: 61, end: 378, from: 'Input 𝐱', to: 'Prediction p → loss L' },
  B: { x: 258, y: 60, width: 166, height: 98, start: 378, end: 285, from: 'Loss L', to: 'Output gradients' },
  C: { x: 171, y: 34, width: 182, height: 168, start: 378, end: 218, from: '∂L/∂z₂', to: '∂L/∂𝐳₁' },
  D: { x: 37, y: 34, width: 225, height: 168, start: 218, end: 133, from: '∂L/∂𝐳₁', to: 'First-layer gradients' },
} satisfies Record<Role, { x: number, y: number, width: number, height: number, start: number, end: number, from: string, to: string }>

const hiddenEntrances = [
  { x: 197, y: 65, labelX: 186, labelY: 46, lineY: 49 },
  { x: 197, y: 157, labelX: 186, labelY: 184, lineY: 173 },
]
const outputEntrance = { x: 357, y: 111, labelX: 349, labelY: 91, lineY: 94 }

const hiddenGradients = hiddenEntrances.map((entrance, index) => ({ ...entrance, labelX: 174, label: '∂L/∂z', subscript: '1,' + (index + 1) }))

const annotations = {
  A: [
    { ...hiddenEntrances[0], label: 'z', subscript: '1,1' },
    { ...hiddenEntrances[1], label: 'z', subscript: '1,2' },
    { ...outputEntrance, label: 'z', subscript: '2' },
  ],
  B: [{ ...outputEntrance, labelX: 343, label: '∂L/∂z', subscript: '2' }],
  C: hiddenGradients,
  D: hiddenGradients,
}

const annotationDescriptions = {
  A: 'The two z one entries mark the ReLU inputs, and z two marks the sigmoid input.',
  B: 'The derivative of the loss with respect to z two is marked at the sigmoid input.',
  C: 'The two entries of the loss gradient with respect to z one are marked at the ReLU inputs.',
  D: 'The two given entries of the loss gradient with respect to z one are marked at the ReLU inputs.',
}

const region = computed(() => regions[props.role])
const arrowheadId = computed(() => 'expert-arrow-' + props.role)
</script>

<template>
  <svg
    class="expert-network"
    :class="{ backward: role !== 'A' }"
    viewBox="0 0 440 277"
    role="img"
    :aria-label="'Neural network. Highlighted calculation from ' + region.from + ' to ' + region.to + '. ' + annotationDescriptions[role] + ' Red marks features and forward values, purple marks weights and biases, and blue marks gradients.'"
  >
    <defs>
      <marker :id="arrowheadId" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M0 0L8 4L0 8Z" fill="var(--calculation-color)" />
      </marker>
    </defs>

    <image :href="networkUrl" width="440" height="225" />
    <rect
      :x="region.x" :y="region.y" :width="region.width" :height="region.height"
      rx="9" fill="none" stroke="#64748b" stroke-width="1.6" stroke-dasharray="5 4"
    />
    <g v-for="point in annotations[role]" :key="point.subscript" class="activation-label">
      <line :x1="point.labelX + 3" :y1="point.lineY" :x2="point.x" :y2="point.y" />
      <circle :cx="point.x" :cy="point.y" r="4" />
      <text :x="point.labelX" :y="point.labelY" text-anchor="middle">{{ point.label }}<tspan baseline-shift="sub">{{ point.subscript }}</tspan></text>
    </g>
    <line
      :x1="region.start" :x2="region.end" y1="239" y2="239"
      stroke="var(--calculation-color)" stroke-width="2.8" :marker-end="'url(#' + arrowheadId + ')'"
    />
    <text :class="{ 'forward-value': role === 'B' }" :x="Math.min(region.start, 369)" y="258" :text-anchor="role === 'D' ? 'start' : 'middle'">{{ region.from }}</text>
    <text :x="role === 'D' ? region.end + 18 : Math.min(region.end, 369)" y="258" :text-anchor="role === 'D' ? 'end' : 'middle'">{{ region.to }}</text>
  </svg>
</template>

<style scoped>
.expert-network {
  --calculation-color: #b42318;
  display: block;
  width: 100%;
}
.expert-network.backward {
  --calculation-color: #0059b3;
}
.expert-network text {
  fill: var(--calculation-color);
  font-size: 12px;
}
.expert-network .forward-value {
  fill: #b42318;
}
.activation-label line {
  stroke: var(--calculation-color);
  stroke-width: 1.6;
}
.activation-label circle {
  fill: var(--calculation-color);
  stroke: white;
  stroke-width: 1;
}
.activation-label text {
  font-family: serif;
  font-size: 16px;
  font-style: italic;
  paint-order: stroke;
  stroke: white;
  stroke-width: 4px;
  stroke-linejoin: round;
}
.activation-label tspan {
  font-size: 10px;
}
</style>
