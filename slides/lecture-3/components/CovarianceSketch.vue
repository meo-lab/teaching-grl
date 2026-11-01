<script setup lang="ts">
// Two correlated bands: the mean vector mu, the variances along each axis and the
// covariance as the "diagonal" spread of the cloud (after the Wageningen RS lecture).
import { useId } from 'vue'

const mid = `cs-arrow-${useId()}`
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(5)
const gauss = () => Math.sqrt(-2 * Math.log(Math.max(rnd(), 1e-9))) * Math.cos(2 * Math.PI * rnd())

const W = 300
const H = 260
const ox = 40
const oy = 225
const mx = 150
const my = 120
// correlated cloud along the diagonal, brightness grows along it
const pts = Array.from({ length: 110 }, () => {
  const u = gauss() * 52
  const v = gauss() * 13
  const x = mx + (u - v) * 0.72
  const y = my - (u + v) * 0.72
  const t = Math.min(1, Math.max(0, (u + 110) / 220))
  const g = Math.round(40 + t * 175)
  return { x, y, fill: `rgb(${Math.round(g * 0.9)},${g},${Math.round(g * 0.85)})` }
}).filter(p => p.x > ox + 4 && p.y < oy - 4 && p.y > 10 && p.x < W - 10)
</script>

<template>
  <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 86.67%"><svg :viewBox="`0 0 ${W} ${H}`" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" aria-label="Scatter of two correlated bands with the mean, the variances along each axis and the covariance along the diagonal">
    <defs>
      <marker :id="mid" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#d62728" /></marker>
    </defs>
    <line :x1="ox" :y1="oy" :x2="W - 5" :y2="oy" stroke="#1d2b36" stroke-width="1.5" />
    <line :x1="ox" :y1="oy" :x2="ox" y2="5" stroke="#1d2b36" stroke-width="1.5" />
    <circle v-for="(p, i) in pts" :key="i" :cx="p.x" :cy="p.y" r="4" :fill="p.fill" stroke="#666" stroke-width=".6" />

    <!-- mean guides -->
    <line :x1="ox" :y1="my" :x2="mx" :y2="my" stroke="#1d2b36" stroke-dasharray="2 3" />
    <line :x1="mx" :y1="my" :x2="mx" :y2="oy" stroke="#1d2b36" stroke-dasharray="2 3" />
    <text :x="ox - 6" :y="my + 4" text-anchor="end" style="font-size: 13px" font-style="italic" fill="#1d2b36">μ<tspan dy="3" style="font-size: 9px">d2</tspan></text>
    <text :x="mx" :y="oy + 18" text-anchor="middle" style="font-size: 13px" font-style="italic" fill="#1d2b36">μ<tspan dy="3" style="font-size: 9px">d1</tspan></text>

    <!-- variances along the axes -->
    <line :x1="mx - 62" :y1="my" :x2="mx + 62" :y2="my" stroke="#d62728" stroke-width="2.2" stroke-dasharray="6 4" :marker-start="`url(#${mid})`" :marker-end="`url(#${mid})`" />
    <line :x1="mx" :y1="my - 62" :x2="mx" :y2="my + 62" stroke="#d62728" stroke-width="2.2" stroke-dasharray="6 4" :marker-start="`url(#${mid})`" :marker-end="`url(#${mid})`" />
    <text :x="mx + 68" :y="my + 4" style="font-size: 13px" font-style="italic" fill="#d62728">σ²<tspan dy="3" style="font-size: 9px">d1</tspan></text>
    <text :x="mx + 6" :y="my + 78" style="font-size: 13px" font-style="italic" fill="#d62728">σ²<tspan dy="3" style="font-size: 9px">d2</tspan></text>

    <!-- covariance: diagonal spread -->
    <line :x1="mx - 58" :y1="my + 58" :x2="mx + 58" :y2="my - 58" stroke="#d62728" stroke-width="2.2" stroke-dasharray="6 4" :marker-start="`url(#${mid})`" :marker-end="`url(#${mid})`" />
    <line :x1="mx - 40" :y1="my - 40" :x2="mx + 40" :y2="my + 40" stroke="#d62728" stroke-width="2.2" stroke-dasharray="6 4" :marker-start="`url(#${mid})`" :marker-end="`url(#${mid})`" />
    <text :x="ox + 6" y="20" style="font-size: 12px" font-weight="700" fill="#d62728">co-variance σ<tspan dy="3" style="font-size: 8px">d1d2</tspan></text>
    <text :x="ox + 6" y="36" style="font-size: 12px" fill="#d62728">describes the diagonal spread</text>

    <circle :cx="mx" :cy="my" r="11" fill="#d62728" />
    <text :x="mx" :y="my + 5" text-anchor="middle" style="font-size: 13px" font-weight="700" font-style="italic" fill="#fff">μ</text>
  </svg></div>
</template>
