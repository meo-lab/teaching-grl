<script setup lang="ts">
import { computed } from 'vue'

interface FeatureSpec {
  label: string
  symbol?: string
  width?: number
  dimmed?: boolean
}

const props = withDefaults(defineProps<{
  features: FeatureSpec[]
  target: string
  targetSymbol?: string
}>(), {
  targetSymbol: 'y',
})

const rowHeight = 72
const pad = 26
const width = 460
const height = computed(() => props.features.length * rowHeight + pad * 2)
const leftX = 84
const rightX = width - 84
const r = 25
// extra canvas left/right so long feature/target labels (e.g. "newspaper ads",
// "surface temperature") aren't clipped by the SVG's default overflow:hidden
const marginLeft = 70
const marginRight = 120

const nodes = computed(() =>
  props.features.map((f, i) => ({
    ...f,
    cy: pad + rowHeight * i + rowHeight / 2,
  })),
)

const centerY = computed(() => height.value / 2)
</script>

<template>
  <svg
    :viewBox="`-${marginLeft} 0 ${width + marginLeft + marginRight} ${height}`"
    class="feature-target-diagram"
    :style="{ height: `${height}px`, maxWidth: '100%', width: '100%' }"
    preserveAspectRatio="xMidYMid meet"
  >
    <line
      v-for="(n, i) in nodes"
      :key="`line-${i}`"
      :x1="leftX + r" :y1="n.cy"
      :x2="rightX - r" :y2="centerY"
      stroke="var(--bonn-blue)"
      :stroke-width="n.width || 3"
      :style="{ opacity: n.dimmed ? 0.22 : 0.85 }"
    />
    <g v-for="(n, i) in nodes" :key="`node-${i}`">
      <circle
        :cx="leftX" :cy="n.cy" :r="r"
        fill="#ffffff" stroke="var(--bonn-blue)" stroke-width="2"
        :style="{ opacity: n.dimmed ? 0.35 : 1 }"
      />
      <text
        :x="leftX" :y="n.cy + 1" text-anchor="middle" dominant-baseline="middle"
        class="node-symbol" :style="{ opacity: n.dimmed ? 0.4 : 1 }"
      >{{ n.symbol || 'x' }}</text>
      <text
        :x="leftX - r - 10" :y="n.cy" text-anchor="end" dominant-baseline="middle"
        class="node-label" :style="{ opacity: n.dimmed ? 0.45 : 1 }"
      >{{ n.label }}</text>
    </g>
    <circle :cx="rightX" :cy="centerY" :r="r" fill="#ffffff" stroke="var(--bonn-blue)" stroke-width="2.5" />
    <text :x="rightX" :y="centerY + 1" text-anchor="middle" dominant-baseline="middle" class="node-symbol">{{ targetSymbol }}</text>
    <text :x="rightX + r + 10" :y="centerY" text-anchor="start" dominant-baseline="middle" class="node-label node-label-target">{{ target }}</text>
  </svg>
</template>

<style scoped>
.feature-target-diagram {
  display: block;
  margin: 0 auto;
}

.node-symbol {
  font-size: 15px;
  font-style: italic;
  font-family: 'Cambria Math', 'Times New Roman', serif;
  fill: var(--bonn-blue);
}

.node-label {
  font-size: 12.5px;
  font-weight: 600;
  fill: var(--bonn-text);
}

.node-label-target {
  fill: var(--bonn-blue);
  font-weight: 700;
}
</style>
