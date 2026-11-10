<script setup lang="ts">
// Logistic regression p = sigma(b1 x1 + b2 x2) on a 2-parameter loss surface.
// Left: data space with predicted probability + decision boundary.
// Right: mean binary cross-entropy over (b1, b2). Hover/click the surface.
// `pins` shows fixed example models (like "testing all possible weights").
import { computed, onMounted, ref, shallowRef } from 'vue'
import { LOG_DATA, LOG_RANGE, logLoss, lossImage, sigmoid } from '../lib/lossSurface'

const props = withDefaults(defineProps<{
  init?: [number, number]
  pins?: [number, number][]
}>(), {
  init: () => [-7.5, 7.5],
  pins: () => [],
})

const S = 210
const pad = { l: 40, t: 22, b: 34, gap: 52 }
const W = pad.l + 2 * S + pad.gap + 12
const H = pad.t + S + pad.b
const ox = (k: number) => pad.l + k * (S + pad.gap)

const DR: [number, number] = [-4.5, 5.5]
const dX = (x: number) => ox(0) + (x - DR[0]) / (DR[1] - DR[0]) * S
const dY = (y: number) => pad.t + (DR[1] - y) / (DR[1] - DR[0]) * S
const mX = (w: number) => ox(1) + (w - LOG_RANGE.w1[0]) / (LOG_RANGE.w1[1] - LOG_RANGE.w1[0]) * S
const mY = (w: number) => pad.t + (LOG_RANGE.w2[1] - w) / (LOG_RANGE.w2[1] - LOG_RANGE.w2[0]) * S
const invX = (px: number) => LOG_RANGE.w1[0] + (px - ox(1)) / S * (LOG_RANGE.w1[1] - LOG_RANGE.w1[0])
const invY = (py: number) => LOG_RANGE.w2[1] - (py - pad.t) / S * (LOG_RANGE.w2[1] - LOG_RANGE.w2[0])

const uid = `lle-${Math.random().toString(36).slice(2, 8)}`
const img = shallowRef<{ url: string }>()
onMounted(() => {
  img.value = lossImage((a, b) => logLoss(a, b), LOG_RANGE.w1, LOG_RANGE.w2, { bands: 16, gamma: 0.6 })
})

const cur = ref({ w1: props.init[0], w2: props.init[1] })
const curLoss = computed(() => logLoss(cur.value.w1, cur.value.w2))

// probability image in data space (orange = class 1, blue = class 0)
const probUrl = computed(() => {
  if (typeof document === 'undefined')
    return ''
  const n = 90
  const c = document.createElement('canvas')
  c.width = n
  c.height = n
  const ctx = c.getContext('2d')!
  const im = ctx.createImageData(n, n)
  const o = [255, 121, 0]
  const b = [0, 69, 124]
  for (let j = 0; j < n; j++) {
    const x2 = DR[1] - (j + 0.5) / n * (DR[1] - DR[0])
    for (let i = 0; i < n; i++) {
      const x1 = DR[0] + (i + 0.5) / n * (DR[1] - DR[0])
      const p = sigmoid(cur.value.w1 * x1 + cur.value.w2 * x2)
      const k = 4 * (j * n + i)
      const a = 0.32
      for (let ch = 0; ch < 3; ch++)
        im.data[k + ch] = 255 - a * (255 - (p * o[ch] + (1 - p) * b[ch]))
      im.data[k + 3] = 255
    }
  }
  ctx.putImageData(im, 0, 0)
  return c.toDataURL()
})

// decision boundary b1 x1 + b2 x2 = 0 -> direction (-b2, b1)
const boundary = computed(() => {
  const { w1, w2 } = cur.value
  const n = Math.hypot(w1, w2) || 1
  const dx = -w2 / n * 10
  const dy = w1 / n * 10
  return { x1: dX(-dx), y1: dY(-dy), x2: dX(dx), y2: dY(dy) }
})

const svg = ref<SVGSVGElement>()
function onPointer(e: PointerEvent) {
  if (e.type === 'pointermove' && e.buttons === 0 && e.pointerType !== 'mouse')
    return
  const el = svg.value
  if (!el)
    return
  const pt = el.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const p = pt.matrixTransform(el.getScreenCTM()!.inverse())
  const w1 = invX(p.x)
  const w2 = invY(p.y)
  if (w1 < LOG_RANGE.w1[0] || w1 > LOG_RANGE.w1[1] || w2 < LOG_RANGE.w2[0] || w2 > LOG_RANGE.w2[1])
    return
  cur.value = { w1, w2 }
}
const ticksD = [-4, -2, 0, 2, 4]
const ticksM = [-10, -5, 0, 5, 10]
</script>

<template>
  <div class="lle select-none">
    <svg ref="svg" :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto" @pointermove="onPointer" @pointerdown="onPointer">
      <defs>
        <clipPath :id="`${uid}-d`"><rect :x="ox(0)" :y="pad.t" :width="S" :height="S" /></clipPath>
      </defs>

      <text :x="ox(0) + S / 2" :y="pad.t - 8" class="ttl">data space</text>
      <image :href="probUrl" :x="ox(0)" :y="pad.t" :width="S" :height="S" preserveAspectRatio="none" />
      <g :clip-path="`url(#${uid}-d)`">
        <line v-bind="boundary" class="bnd" />
        <circle v-for="(p, i) in LOG_DATA" :key="i" :cx="dX(p.x1)" :cy="dY(p.x2)" r="3.6" :class="p.y ? 'c1' : 'c0'" />
      </g>
      <rect :x="ox(0)" :y="pad.t" :width="S" :height="S" class="frame" />
      <text v-for="t in ticksD" :key="`a${t}`" :x="dX(t)" :y="pad.t + S + 13" class="tick">{{ t }}</text>
      <text v-for="t in ticksD" :key="`b${t}`" :x="ox(0) - 6" :y="dY(t) + 3.5" class="tick" text-anchor="end">{{ t }}</text>
      <text :x="ox(0) + S / 2" :y="pad.t + S + 28" class="lab">feature x₁</text>
      <text :transform="`translate(${ox(0) - 26},${pad.t + S / 2}) rotate(-90)`" class="lab">feature x₂</text>

      <text :x="ox(1) + S / 2" :y="pad.t - 8" class="ttl">loss surface (BCE)</text>
      <image v-if="img" :href="img.url" :x="ox(1)" :y="pad.t" :width="S" :height="S" preserveAspectRatio="none" />
      <rect :x="ox(1)" :y="pad.t" :width="S" :height="S" class="frame" style="cursor: crosshair" />
      <g pointer-events="none">
        <g v-for="(p, i) in pins" :key="`pin${i}`">
          <circle :cx="mX(p[0])" :cy="mY(p[1])" r="5" class="pin" />
          <text :x="mX(p[0]) + 8" :y="mY(p[1]) + 4" class="pinl">{{ i + 1 }}</text>
        </g>
        <circle :cx="mX(cur.w1)" :cy="mY(cur.w2)" r="5.5" class="cur" />
      </g>
      <text v-for="t in ticksM" :key="`c${t}`" :x="mX(t)" :y="pad.t + S + 13" class="tick">{{ t }}</text>
      <text v-for="t in ticksM" :key="`d${t}`" :x="ox(1) - 6" :y="mY(t) + 3.5" class="tick" text-anchor="end">{{ t }}</text>
      <text :x="ox(1) + S / 2" :y="pad.t + S + 28" class="lab">w₁</text>
      <text :transform="`translate(${ox(1) - 26},${pad.t + S / 2}) rotate(-90)`" class="lab">w₂</text>
    </svg>
    <div class="ctrl">
      <button v-for="(p, i) in pins" :key="`pb${i}`" @click.stop="cur = { w1: p[0], w2: p[1] }">model {{ i + 1 }}</button>
      <span>hover the surface · w₁ = {{ cur.w1.toFixed(1) }}, w₂ = {{ cur.w2.toFixed(1) }} · <b>L = {{ curLoss.toFixed(3) }}</b></span>
    </div>
  </div>
</template>

<style scoped>
.lle .frame { fill: none; stroke: #9aa1a6; stroke-width: 1; }
.lle .ttl { font: 600 12px "Exo 2", sans-serif; fill: #00457c; text-anchor: middle; }
.lle .lab { font: 11px "Exo 2", sans-serif; fill: #444; text-anchor: middle; }
.lle .tick { font: 9.5px "Exo 2", sans-serif; fill: #666; text-anchor: middle; }
.lle .c1 { fill: #ff7900; stroke: #fff; stroke-width: 1; }
.lle .c0 { fill: #00457c; stroke: #fff; stroke-width: 1; }
.lle .bnd { stroke: #222; stroke-width: 2; }
.lle .cur { fill: #ff7900; stroke: #fff; stroke-width: 1.6; }
.lle .pin { fill: none; stroke: #b02b37; stroke-width: 2; }
.lle .pinl { font: 700 11px "Exo 2", sans-serif; fill: #fff; paint-order: stroke; stroke: #b02b37; stroke-width: 2.5px; }
.ctrl { display: flex; flex-wrap: wrap; gap: .45rem; align-items: center; justify-content: center; font-size: .68rem; color: #333; margin-top: .25rem; }
.ctrl button { padding: .12rem .6rem; border-radius: 4px; background: #00457c; color: #fff; font-size: .66rem; }
</style>
