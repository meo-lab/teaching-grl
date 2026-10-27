<script setup lang="ts">
import { computed } from 'vue'
import happyUrl from '../figures/dt_sunflower_happy.png'
import unhappyUrl from '../figures/dt_sunflower_unhappy.png'

// Sunflower happiness vs. temperature — why linear models fail and how regions help.
// stage 0: cold/unhappy + warm/happy, a linear fit works
// stage 1: add hot/unhappy, the best linear fit is flat (fails)
// stage 2: piecewise-constant model with regions R1..R3 and values c1..c3
// stage 3: + interval definitions of the regions
const props = withDefaults(defineProps<{
  clicks?: number
  // first stage shown at click 0 (lets a slide start part-way through the story)
  start?: number
  // fixed stage, ignores clicks
  stage?: number
}>(), {
  clicks: Infinity,
  start: 0,
})

const s = computed(() => props.stage ?? Math.min(3, props.start + (props.clicks === Infinity ? 3 : props.clicks)))

const W = 560
const H = 300
const x0 = 70
const x1 = 540
const yBase = 200
const yHappy = 70
const yUnhappy = 165
const ICON = 30

const cx = { cold: 150, warm: 300, hot: 450 }

const clusters = computed(() => {
  const c = [
    { key: 'cold', x: cx.cold, y: yUnhappy, happy: false },
    { key: 'warm', x: cx.warm, y: yHappy, happy: true },
  ]
  if (s.value >= 1) c.push({ key: 'hot', x: cx.hot, y: yUnhappy, happy: false })
  return c
})

const icons = computed(() => clusters.value.flatMap(c => [-34, 0, 34].map(dx => ({
  x: c.x + dx, y: c.y, url: c.happy ? happyUrl : unhappyUrl, key: `${c.key}${dx}`,
}))))

const t10 = 225
const t30 = 375
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="sunflower-regions" preserveAspectRatio="xMidYMid meet">
    <defs>
      <marker id="sr-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--bonn-muted)" />
      </marker>
      <radialGradient id="sr-happy">
        <stop offset="0%" stop-color="var(--grl-data-green)" stop-opacity="0.35" />
        <stop offset="100%" stop-color="var(--grl-data-green)" stop-opacity="0.04" />
      </radialGradient>
      <radialGradient id="sr-unhappy">
        <stop offset="0%" stop-color="var(--bonn-blue)" stop-opacity="0.28" />
        <stop offset="100%" stop-color="var(--bonn-blue)" stop-opacity="0.03" />
      </radialGradient>
    </defs>

    <!-- data distributions -->
    <ellipse v-for="c in clusters" :key="`e-${c.key}`" :cx="c.x" :cy="c.y" rx="92" ry="44" :fill="c.happy ? 'url(#sr-happy)' : 'url(#sr-unhappy)'" />
    <text :x="cx.warm" :y="yHappy - 50" text-anchor="middle" class="dist-label">P(X, y = happy)</text>
    <text :x="cx.cold" :y="yUnhappy - 52" text-anchor="middle" class="dist-label">P(X, y = not happy)</text>

    <!-- axes -->
    <line :x1="x0" :y1="yBase + 18" :x2="x1" :y2="yBase + 18" stroke="var(--bonn-muted)" stroke-width="1.4" marker-end="url(#sr-arrow)" />
    <line :x1="x0" :y1="yBase + 18" :x2="x0" y2="22" stroke="var(--bonn-muted)" stroke-width="1.4" marker-end="url(#sr-arrow)" />
    <text :x="x0 - 8" :y="yHappy + 4" text-anchor="end" class="axis-tick">happy</text>
    <text :x="x0 - 8" :y="yUnhappy + 4" text-anchor="end" class="axis-tick">not happy</text>
    <text :x="x0 - 8" y="26" text-anchor="end" class="axis-label">target y</text>
    <text :x="cx.cold" :y="yBase + 34" text-anchor="middle" class="axis-tick">cold</text>
    <text :x="cx.warm" :y="yBase + 34" text-anchor="middle" class="axis-tick">warm</text>
    <text v-if="s >= 1" :x="cx.hot" :y="yBase + 34" text-anchor="middle" class="axis-tick">hot</text>
    <text :x="x1" :y="yBase + 52" text-anchor="end" class="axis-label">X: temperature</text>

    <!-- models -->
    <line v-if="s === 0" x1="90" y1="200" x2="380" y2="40" stroke="var(--bonn-blue)" stroke-width="3" />
    <line v-if="s === 1" x1="90" y1="132" x2="520" y2="126" stroke="var(--bonn-blue)" stroke-width="3" />
    <polyline
      v-if="s >= 2"
      :points="`${x0 + 6},${yUnhappy} ${t10},${yUnhappy} ${t10},${yHappy} ${t30},${yHappy} ${t30},${yUnhappy} ${x1 - 10},${yUnhappy}`"
      fill="none" stroke="var(--bonn-blue)" stroke-width="3"
    />

    <!-- sunflowers -->
    <image v-for="i in icons" :key="i.key" :href="i.url" :x="i.x - ICON / 2" :y="i.y - ICON / 2" :width="ICON" :height="ICON" />

    <!-- regions -->
    <g v-if="s >= 2" class="regions">
      <line :x1="t10" y1="40" :x2="t10" :y2="yBase + 18" stroke="var(--bonn-muted)" stroke-dasharray="4 3" />
      <line :x1="t30" y1="40" :x2="t30" :y2="yBase + 18" stroke="var(--bonn-muted)" stroke-dasharray="4 3" />
      <text :x="(x0 + t10) / 2" :y="yBase + 70" text-anchor="middle" class="region">R₁</text>
      <text :x="(t10 + t30) / 2" :y="yBase + 70" text-anchor="middle" class="region">R₂</text>
      <text :x="(t30 + x1) / 2" :y="yBase + 70" text-anchor="middle" class="region">R₃</text>
      <text :x="(x0 + t10) / 2" :y="yBase + 88" text-anchor="middle" class="value">c₁ = not happy</text>
      <text :x="(t10 + t30) / 2" :y="yBase + 88" text-anchor="middle" class="value">c₂ = happy</text>
      <text :x="(t30 + x1) / 2" :y="yBase + 88" text-anchor="middle" class="value">c₃ = not happy</text>
    </g>
    <g v-if="s >= 3">
      <text :x="t10" y="34" text-anchor="middle" class="threshold">10 °C</text>
      <text :x="t30" y="34" text-anchor="middle" class="threshold">30 °C</text>
    </g>
  </svg>
</template>

<style scoped>
.sunflower-regions {
  display: block;
  width: 100%;
  height: auto;
  margin: 0 auto;
}

.axis-label {
  font-size: 13px;
  font-weight: 700;
  fill: var(--bonn-blue);
}

.axis-tick {
  font-size: 12px;
  fill: var(--bonn-muted);
}

.dist-label {
  font-size: 11px;
  font-style: italic;
  font-family: 'Times New Roman', Times, serif;
  fill: var(--bonn-muted);
}

.region {
  font-size: 14px;
  font-style: italic;
  font-family: 'Times New Roman', Times, serif;
  fill: var(--bonn-blue);
}

.value {
  font-size: 12px;
  fill: var(--bonn-text);
}

.threshold {
  font-size: 11px;
  font-weight: 700;
  fill: var(--bonn-muted);
}
</style>
