<script setup lang="ts">
// Gradient descent on logistic regression (full-batch SGD on the mean BCE, as in
// the course notebook). Data space + loss surface with the path + training curve.
// Click the surface to choose the initialization; optional lr / momentum sliders.
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { LOG_DATA, LOG_RANGE, lossImage, logLoss, probImage, runLogGD } from '../lib/lossSurface'

const props = withDefaults(defineProps<{
  init?: [number, number]
  lr?: number
  momentum?: number
  epochs?: number
  showLr?: boolean
  showMomentum?: boolean
}>(), {
  init: () => [-7, 7],
  lr: 0.1,
  momentum: 0,
  epochs: 150,
  showLr: false,
  showMomentum: false,
})

// ---------------- geometry ----------------
const S = 190
const pad = { l: 40, t: 22, b: 34, gap: 50 }
const CW = 210
const W = pad.l + 2 * S + 2 * pad.gap + CW + 12
const H = pad.t + S + pad.b
const ox = (k: number) => pad.l + k * (S + pad.gap)
const DR: [number, number] = [-4.5, 5.5]
const dX = (x: number) => ox(0) + (x - DR[0]) / (DR[1] - DR[0]) * S
const dY = (y: number) => pad.t + (DR[1] - y) / (DR[1] - DR[0]) * S
const mX = (w: number) => ox(1) + (w - LOG_RANGE.w1[0]) / (LOG_RANGE.w1[1] - LOG_RANGE.w1[0]) * S
const mY = (w: number) => pad.t + (LOG_RANGE.w2[1] - w) / (LOG_RANGE.w2[1] - LOG_RANGE.w2[0]) * S
const invX = (px: number) => LOG_RANGE.w1[0] + (px - ox(1)) / S * (LOG_RANGE.w1[1] - LOG_RANGE.w1[0])
const invY = (py: number) => LOG_RANGE.w2[1] - (py - pad.t) / S * (LOG_RANGE.w2[1] - LOG_RANGE.w2[0])
const uid = `lgd-${Math.random().toString(36).slice(2, 8)}`

const surf = shallowRef<string>()
onMounted(() => {
  surf.value = lossImage((a, b) => logLoss(a, b), LOG_RANGE.w1, LOG_RANGE.w2, { bands: 16, gamma: 0.6 }).url
})

// ---------------- state ----------------
const init = ref<[number, number]>([...props.init])
const lr = ref(props.lr)
const mu = ref(props.momentum)
const run = computed(() => runLogGD({ init: init.value, lr: lr.value, momentum: mu.value, epochs: props.epochs }))
const t = ref(0)
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const cur = computed(() => run.value[t.value])
const pathPts = computed(() => run.value.slice(0, t.value + 1).map(s => `${mX(s.w1)},${mY(s.w2)}`).join(' '))
const outside = computed(() => Math.abs(cur.value.w1) > 10 || Math.abs(cur.value.w2) > 10)

function stop() {
  playing.value = false
  if (timer)
    clearInterval(timer)
  timer = undefined
}
function step() {
  if (t.value < props.epochs)
    t.value++
  else
    stop()
}
function play() {
  if (playing.value)
    return stop()
  if (t.value >= props.epochs)
    t.value = 0
  playing.value = true
  timer = setInterval(step, 40)
}
function reset() {
  stop()
  t.value = 0
}
watch([lr, mu, init], reset)
onUnmounted(stop)

const svg = ref<SVGSVGElement>()
function onClick(e: PointerEvent) {
  const el = svg.value
  if (!el)
    return
  const pt = el.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const p = pt.matrixTransform(el.getScreenCTM()!.inverse())
  const w1 = invX(p.x)
  const w2 = invY(p.y)
  if (w1 < -10 || w1 > 10 || w2 < -10 || w2 > 10)
    return
  init.value = [w1, w2]
}

// ---------------- data space ----------------
const probUrl = computed(() => (typeof document === 'undefined' ? '' : probImage(cur.value.w1, cur.value.w2, DR)))
const boundary = computed(() => {
  const { w1, w2 } = cur.value
  const n = Math.hypot(w1, w2) || 1
  const dx = -w2 / n * 12
  const dy = w1 / n * 12
  return { x1: dX(-dx), y1: dY(-dy), x2: dX(dx), y2: dY(dy) }
})

// ---------------- training curve ----------------
const cx0 = ox(2)
const lMax = computed(() => Math.max(run.value[0].L, 0.8) * 1.05)
const cX = (i: number) => cx0 + i / props.epochs * CW
const cY = (v: number) => pad.t + S - Math.min(v / lMax.value, 1) * S
const curvePts = computed(() => run.value.slice(0, t.value + 1).map((s, i) => `${cX(i)},${cY(s.L)}`).join(' '))
const curveGhost = computed(() => run.value.map((s, i) => `${cX(i)},${cY(s.L)}`).join(' '))
const ticksD = [-4, -2, 0, 2, 4]
const ticksM = [-10, -5, 0, 5, 10]
</script>

<template>
  <div class="lgd select-none">
    <svg ref="svg" :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto" @pointerdown="onClick">
      <defs>
        <clipPath :id="`${uid}-d`"><rect :x="ox(0)" :y="pad.t" :width="S" :height="S" /></clipPath>
        <clipPath :id="`${uid}-m`"><rect :x="ox(1)" :y="pad.t" :width="S" :height="S" /></clipPath>
      </defs>

      <!-- data space -->
      <text :x="ox(0) + S / 2" :y="pad.t - 8" class="ttl">data space</text>
      <image :href="probUrl" :x="ox(0)" :y="pad.t" :width="S" :height="S" preserveAspectRatio="none" />
      <g :clip-path="`url(#${uid}-d)`">
        <line v-bind="boundary" class="bnd" />
        <circle v-for="(p, i) in LOG_DATA" :key="i" :cx="dX(p.x1)" :cy="dY(p.x2)" r="3.4" :class="p.y ? 'c1' : 'c0'" />
      </g>
      <rect :x="ox(0)" :y="pad.t" :width="S" :height="S" class="frame" />
      <text v-for="v in ticksD" :key="`a${v}`" :x="dX(v)" :y="pad.t + S + 13" class="tick">{{ v }}</text>
      <text v-for="v in ticksD" :key="`b${v}`" :x="ox(0) - 6" :y="dY(v) + 3.5" class="tick" text-anchor="end">{{ v }}</text>
      <text :x="ox(0) + S / 2" :y="pad.t + S + 28" class="lab">feature x₁</text>
      <text :transform="`translate(${ox(0) - 26},${pad.t + S / 2}) rotate(-90)`" class="lab">feature x₂</text>

      <!-- loss surface + path -->
      <text :x="ox(1) + S / 2" :y="pad.t - 8" class="ttl">loss surface (BCE)</text>
      <image v-if="surf" :href="surf" :x="ox(1)" :y="pad.t" :width="S" :height="S" preserveAspectRatio="none" />
      <rect :x="ox(1)" :y="pad.t" :width="S" :height="S" class="frame" style="cursor: crosshair" />
      <g :clip-path="`url(#${uid}-m)`" pointer-events="none">
        <polyline :points="pathPts" class="path" />
        <circle :cx="mX(run[0].w1)" :cy="mY(run[0].w2)" r="4" class="start" />
        <circle :cx="mX(cur.w1)" :cy="mY(cur.w2)" r="5.5" class="cur" />
      </g>
      <text v-if="outside" :x="ox(1) + S / 2" :y="pad.t + S - 8" class="warn">w left the plotted area: ({{ cur.w1.toFixed(0) }}, {{ cur.w2.toFixed(0) }})</text>
      <text v-for="v in ticksM" :key="`c${v}`" :x="mX(v)" :y="pad.t + S + 13" class="tick">{{ v }}</text>
      <text v-for="v in ticksM" :key="`d${v}`" :x="ox(1) - 6" :y="mY(v) + 3.5" class="tick" text-anchor="end">{{ v }}</text>
      <text :x="ox(1) + S / 2" :y="pad.t + S + 28" class="lab">w₁</text>
      <text :transform="`translate(${ox(1) - 26},${pad.t + S / 2}) rotate(-90)`" class="lab">w₂</text>

      <!-- training curve -->
      <text :x="cx0 + CW / 2" :y="pad.t - 8" class="ttl">training curve</text>
      <rect :x="cx0" :y="pad.t" :width="CW" :height="S" class="frame" />
      <polyline :points="curveGhost" class="ghost" />
      <polyline :points="curvePts" class="curve" />
      <circle :cx="cX(t)" :cy="cY(cur.L)" r="4" class="cur" />
      <text v-for="v in [0, 50, 100, 150]" :key="`e${v}`" :x="cX(v)" :y="pad.t + S + 13" class="tick">{{ v }}</text>
      <text :x="cx0 + CW / 2" :y="pad.t + S + 28" class="lab">epoch</text>
      <text :transform="`translate(${cx0 - 12},${pad.t + S / 2}) rotate(-90)`" class="lab">loss</text>
    </svg>

    <div class="ctrl">
      <button @click.stop="step">step</button>
      <button @click.stop="play">{{ playing ? 'pause' : 'run' }}</button>
      <button class="ghostbtn" @click.stop="reset">reset</button>
      <label v-if="showLr" class="sl">η
        <input v-model.number="lr" type="range" min="0.01" max="2" step="0.01" @pointerdown.stop @keydown.stop>
        <b>{{ lr.toFixed(2) }}</b>
      </label>
      <label v-if="showMomentum" class="sl">μ
        <input v-model.number="mu" type="range" min="0" max="1" step="0.05" @pointerdown.stop @keydown.stop>
        <b>{{ mu.toFixed(2) }}</b>
      </label>
      <span>epoch {{ t }} · w = ({{ cur.w1.toFixed(1) }}, {{ cur.w2.toFixed(1) }}) · <b>L = {{ cur.L.toFixed(3) }}</b> · click the surface to set the start</span>
    </div>
  </div>
</template>

<style scoped>
.lgd .frame { fill: none; stroke: #9aa1a6; }
.lgd .ttl { font: 600 12px "Exo 2", sans-serif; fill: #00457c; text-anchor: middle; }
.lgd .lab { font: 11px "Exo 2", sans-serif; fill: #444; text-anchor: middle; }
.lgd .tick { font: 9.5px "Exo 2", sans-serif; fill: #666; text-anchor: middle; }
.lgd .c1 { fill: #ff7900; stroke: #fff; stroke-width: 1; }
.lgd .c0 { fill: #00457c; stroke: #fff; stroke-width: 1; }
.lgd .bnd { stroke: #222; stroke-width: 2; }
.lgd .path { fill: none; stroke: #b02b37; stroke-width: 2; }
.lgd .start { fill: #fff; stroke: #b02b37; stroke-width: 1.5; }
.lgd .cur { fill: #ff7900; stroke: #fff; stroke-width: 1.6; }
.lgd .ghost { fill: none; stroke: #d7d9d8; stroke-width: 1.5; stroke-dasharray: 3 3; }
.lgd .curve { fill: none; stroke: #00457c; stroke-width: 2; }
.lgd .warn { font: 600 10px "Exo 2", sans-serif; fill: #fff; text-anchor: middle; paint-order: stroke; stroke: #b02b37; stroke-width: 3px; }
.ctrl { display: flex; flex-wrap: wrap; gap: .45rem; align-items: center; justify-content: center; font-size: .66rem; color: #333; margin-top: .2rem; }
.ctrl button { padding: .12rem .6rem; border-radius: 4px; background: #00457c; color: #fff; font-size: .66rem; }
.ctrl button.ghostbtn { background: transparent; color: #00457c; border: 1px solid #00457c; }
.ctrl .sl { display: inline-flex; gap: .3rem; align-items: center; }
.ctrl .sl input { width: 90px; accent-color: #00457c; }
</style>
