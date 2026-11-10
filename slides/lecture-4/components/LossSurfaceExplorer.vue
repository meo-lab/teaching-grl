<script setup lang="ts">
// Linear regression on a 2-parameter loss surface.
// Left: data space with the current line. Middle: loss surface L(beta0, beta1).
// Optional right: training curve.
//   mode="explore" hover the surface -> the line follows
//   mode="guess"   random guessing (brute force) with a best-so-far marker
//   mode="gd"      gradient descent from a chosen initialization (click to set)
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import {
  LIN_DATA, LIN_OLS, LIN_RANGE, type LinLoss,
  linGrad, linLoss, lossImage, mulberry32,
} from '../lib/lossSurface'

const props = withDefaults(defineProps<{
  mode?: 'explore' | 'guess' | 'gd'
  loss?: LinLoss
  showLr?: boolean
  showCurve?: boolean
  lr?: number
  init?: [number, number] // [beta1, beta0]
  showTruth?: boolean
  highlightOptimum?: boolean // labelled ring at the global minimum + dashed optimal line in data space
  showClosedForm?: boolean // explore mode: button that jumps to the OLS solution
}>(), {
  mode: 'explore',
  loss: 'mse',
  showLr: false,
  showCurve: false,
  lr: 0.3,
  init: () => [1.2, 1.2],
  showTruth: false,
  highlightOptimum: false,
  showClosedForm: false,
})

// ---------------- geometry ----------------
const S = 210 // plot size
const pad = { l: 40, t: 22, b: 34, gap: 52 }
const panels = computed(() => props.showCurve ? 3 : 2)
const W = computed(() => pad.l + panels.value * S + (panels.value - 1) * pad.gap + 12)
const H = pad.t + S + pad.b
const ox = (k: number) => pad.l + k * (S + pad.gap)

// data panel
const DX: [number, number] = [-1.6, 1.6]
const DY: [number, number] = [-1.4, 1.4]
const dX = (x: number) => ox(0) + (x - DX[0]) / (DX[1] - DX[0]) * S
const dY = (y: number) => pad.t + (DY[1] - y) / (DY[1] - DY[0]) * S

// map panel: beta1 horizontal, beta0 vertical
const mX = (b1: number) => ox(1) + (b1 - LIN_RANGE.b1[0]) / (LIN_RANGE.b1[1] - LIN_RANGE.b1[0]) * S
const mY = (b0: number) => pad.t + (LIN_RANGE.b0[1] - b0) / (LIN_RANGE.b0[1] - LIN_RANGE.b0[0]) * S
const invX = (px: number) => LIN_RANGE.b1[0] + (px - ox(1)) / S * (LIN_RANGE.b1[1] - LIN_RANGE.b1[0])
const invY = (py: number) => LIN_RANGE.b0[1] - (py - pad.t) / S * (LIN_RANGE.b0[1] - LIN_RANGE.b0[0])

const uid = `lse-${Math.random().toString(36).slice(2, 8)}`
const ticks = [-1, 0, 1]

// ---------------- surface image ----------------
const img = shallowRef<{ url: string, lo: number, hi: number }>()
onMounted(() => {
  img.value = lossImage((b1, b0) => linLoss(b0, b1, props.loss), LIN_RANGE.b1, LIN_RANGE.b0, { bands: 12 })
})

// ---------------- state ----------------
const cur = ref({ b0: props.init[1], b1: props.init[0] })
const guesses = ref<{ b0: number, b1: number, L: number }[]>([])
const path = ref<{ b0: number, b1: number, L: number }[]>([])
const lr = ref(props.lr)
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
let rng = mulberry32(3)

const L = (b0: number, b1: number) => linLoss(b0, b1, props.loss)
const curLoss = computed(() => L(cur.value.b0, cur.value.b1))
const best = computed(() => guesses.value.reduce<null | typeof guesses.value[0]>(
  (a, g) => (!a || g.L < a.L ? g : a), null))

function resetGd() {
  stop()
  path.value = [{ ...cur.value, L: curLoss.value }]
}
if (props.mode === 'gd')
  resetGd()
if (props.mode === 'explore')
  cur.value = { b0: 0.6, b1: 0.8 }

function addGuesses(k: number) {
  for (let i = 0; i < k; i++) {
    const b1 = LIN_RANGE.b1[0] + rng() * (LIN_RANGE.b1[1] - LIN_RANGE.b1[0])
    const b0 = LIN_RANGE.b0[0] + rng() * (LIN_RANGE.b0[1] - LIN_RANGE.b0[0])
    guesses.value.push({ b0, b1, L: L(b0, b1) })
    cur.value = { b0, b1 }
  }
}
function resetGuesses() {
  rng = mulberry32(3)
  guesses.value = []
  cur.value = { b0: props.init[1], b1: props.init[0] }
}

function step() {
  const last = path.value[path.value.length - 1]
  if (Math.abs(last.b0) > 50 || Math.abs(last.b1) > 50) {
    stop()
    return
  }
  const [g0, g1] = linGrad(last.b0, last.b1, props.loss)
  const b0 = last.b0 - lr.value * g0
  const b1 = last.b1 - lr.value * g1
  path.value.push({ b0, b1, L: L(b0, b1) })
  cur.value = { b0, b1 }
  if (path.value.length > 80 || Math.hypot(g0, g1) < 1e-4)
    stop()
}
function play() {
  if (playing.value)
    return stop()
  if (path.value.length > 80)
    resetGd()
  playing.value = true
  timer = setInterval(step, 140)
}
function stop() {
  playing.value = false
  if (timer)
    clearInterval(timer)
  timer = undefined
}
onUnmounted(stop)
watch(lr, () => {
  cur.value = { b0: path.value[0]?.b0 ?? cur.value.b0, b1: path.value[0]?.b1 ?? cur.value.b1 }
  resetGd()
})

// ---------------- pointer on the map ----------------
const svg = ref<SVGSVGElement>()
function toParams(e: PointerEvent) {
  const el = svg.value
  if (!el)
    return null
  const pt = el.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const p = pt.matrixTransform(el.getScreenCTM()!.inverse())
  const b1 = invX(p.x)
  const b0 = invY(p.y)
  if (b1 < LIN_RANGE.b1[0] || b1 > LIN_RANGE.b1[1] || b0 < LIN_RANGE.b0[0] || b0 > LIN_RANGE.b0[1])
    return null
  return { b0, b1 }
}
// closed-form jump (explore mode): glide to the OLS solution, then hold it until the surface is clicked
const locked = ref(false)
let raf: number | undefined
function solveClosedForm() {
  if (raf)
    cancelAnimationFrame(raf)
  locked.value = true
  const from = { ...cur.value }
  const t0 = performance.now()
  const dur = 600
  const tick = (t: number) => {
    const u = Math.min(1, (t - t0) / dur)
    const e = 1 - (1 - u) ** 3
    cur.value = { b0: from.b0 + (LIN_OLS.b0 - from.b0) * e, b1: from.b1 + (LIN_OLS.b1 - from.b1) * e }
    raf = u < 1 ? requestAnimationFrame(tick) : undefined
  }
  raf = requestAnimationFrame(tick)
}
onUnmounted(() => raf && cancelAnimationFrame(raf))

function onMove(e: PointerEvent) {
  if (props.mode !== 'explore' || locked.value)
    return
  const p = toParams(e)
  if (p)
    cur.value = p
}
function onClick(e: PointerEvent) {
  const p = toParams(e)
  if (!p)
    return
  if (props.mode === 'gd') {
    cur.value = p
    resetGd()
  }
  else if (props.mode === 'guess') {
    guesses.value.push({ ...p, L: L(p.b0, p.b1) })
    cur.value = p
  }
  else {
    locked.value = false
    cur.value = p
  }
}

// ---------------- drawing helpers ----------------
function lineEnds(b0: number, b1: number) {
  return { x1: dX(DX[0]), y1: dY(b0 + b1 * DX[0]), x2: dX(DX[1]), y2: dY(b0 + b1 * DX[1]) }
}
const pathPts = computed(() => path.value.map(p => `${mX(p.b1)},${mY(p.b0)}`).join(' '))

// training curve panel
const curveMax = computed(() => Math.max(...path.value.slice(0, 1).map(p => p.L), 0.05) * 1.15)
const cX = (i: number) => ox(2) + i / 80 * S
const cY = (v: number) => pad.t + S - Math.min(v / curveMax.value, 1.08) * S
const curvePts = computed(() => path.value.map((p, i) => `${cX(i)},${cY(p.L)}`).join(' '))

const fmt = (v: number) => v.toFixed(2)
const lossName = computed(() => props.loss === 'mse' ? 'MSE' : 'MAE')
</script>

<template>
  <div class="lse select-none">
    <svg ref="svg" :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto" @pointermove="onMove" @pointerdown="onClick">
      <defs>
        <clipPath :id="`${uid}-d`"><rect :x="ox(0)" :y="pad.t" :width="S" :height="S" /></clipPath>
        <clipPath :id="`${uid}-m`"><rect :x="ox(1)" :y="pad.t" :width="S" :height="S" /></clipPath>
        <clipPath :id="`${uid}-c`"><rect :x="ox(2)" :y="pad.t - 6" :width="S" :height="S + 6" /></clipPath>
      </defs>

      <!-- ===== data space ===== -->
      <text :x="ox(0) + S / 2" :y="pad.t - 8" class="ttl">data space</text>
      <rect :x="ox(0)" :y="pad.t" :width="S" :height="S" class="frame" />
      <g :clip-path="`url(#${uid}-d)`">
        <line v-for="t in ticks" :key="`dx${t}`" :x1="dX(t)" :x2="dX(t)" :y1="pad.t" :y2="pad.t + S" class="grid" />
        <line v-for="t in ticks" :key="`dy${t}`" :y1="dY(t)" :y2="dY(t)" :x1="ox(0)" :x2="ox(0) + S" class="grid" />
        <template v-if="mode === 'guess'">
          <line v-for="(g, i) in guesses.slice(-25)" :key="`gl${i}`" v-bind="lineEnds(g.b0, g.b1)" class="ghost" />
          <line v-if="best" v-bind="lineEnds(best.b0, best.b1)" class="fit" />
        </template>
        <line v-if="highlightOptimum" v-bind="lineEnds(LIN_OLS.b0, LIN_OLS.b1)" class="optline" />
        <line v-if="mode !== 'guess'" v-bind="lineEnds(cur.b0, cur.b1)" class="fit" />
        <circle v-for="(p, i) in LIN_DATA" :key="i" :cx="dX(p.x)" :cy="dY(p.y)" r="3.6" class="pt" />
      </g>
      <text v-for="t in ticks" :key="`dxl${t}`" :x="dX(t)" :y="pad.t + S + 13" class="tick">{{ t }}</text>
      <text v-for="t in ticks" :key="`dyl${t}`" :x="ox(0) - 6" :y="dY(t) + 3.5" class="tick" text-anchor="end">{{ t }}</text>
      <text :x="ox(0) + S / 2" :y="pad.t + S + 28" class="lab">elevation x (standardized)</text>
      <text :transform="`translate(${ox(0) - 26},${pad.t + S / 2}) rotate(-90)`" class="lab">temperature y</text>

      <!-- ===== loss surface ===== -->
      <text :x="ox(1) + S / 2" :y="pad.t - 8" class="ttl">loss surface ({{ lossName }})</text>
      <image v-if="img" :href="img.url" :x="ox(1)" :y="pad.t" :width="S" :height="S" preserveAspectRatio="none" style="image-rendering: auto" />
      <rect :x="ox(1)" :y="pad.t" :width="S" :height="S" class="frame" style="cursor: crosshair" />
      <g :clip-path="`url(#${uid}-m)`" pointer-events="none">
        <template v-if="mode === 'guess'">
          <circle v-for="(g, i) in guesses" :key="`g${i}`" :cx="mX(g.b1)" :cy="mY(g.b0)" r="3" class="guess" />
          <path v-if="best" :d="`M${mX(best.b1)},${mY(best.b0) - 7} l2,5 h5.5 l-4.5,3.3 l1.8,5.3 l-4.8,-3.2 l-4.8,3.2 l1.8,-5.3 l-4.5,-3.3 h5.5 z`" class="star" />
        </template>
        <template v-if="mode === 'gd'">
          <polyline :points="pathPts" class="gdpath" />
          <circle v-for="(p, i) in path" :key="`p${i}`" :cx="mX(p.b1)" :cy="mY(p.b0)" r="2.2" class="gdpt" />
        </template>
        <circle v-if="showTruth && !highlightOptimum" :cx="mX(LIN_OLS.b1)" :cy="mY(LIN_OLS.b0)" r="4.5" class="opt" />
        <template v-if="highlightOptimum">
          <circle :cx="mX(LIN_OLS.b1)" :cy="mY(LIN_OLS.b0)" r="10" class="opt-ring" />
          <circle :cx="mX(LIN_OLS.b1)" :cy="mY(LIN_OLS.b0)" r="3" class="opt-dot" />
          <text :x="mX(LIN_OLS.b1)" :y="mY(LIN_OLS.b0) + 26" class="opt-label">global minimum</text>
        </template>
        <circle v-if="mode !== 'guess'" :cx="mX(cur.b1)" :cy="mY(cur.b0)" r="5.5" class="cur" />
      </g>
      <text v-for="t in ticks" :key="`mxl${t}`" :x="mX(t)" :y="pad.t + S + 13" class="tick">{{ t }}</text>
      <text v-for="t in ticks" :key="`myl${t}`" :x="ox(1) - 6" :y="mY(t) + 3.5" class="tick" text-anchor="end">{{ t }}</text>
      <text :x="ox(1) + S / 2" :y="pad.t + S + 28" class="lab">w (slope)</text>
      <text :transform="`translate(${ox(1) - 26},${pad.t + S / 2}) rotate(-90)`" class="lab">b (bias)</text>

      <!-- ===== training curve ===== -->
      <template v-if="showCurve">
        <text :x="ox(2) + S / 2" :y="pad.t - 8" class="ttl">training curve</text>
        <rect :x="ox(2)" :y="pad.t" :width="S" :height="S" class="frame" />
        <g :clip-path="`url(#${uid}-c)`">
          <polyline :points="curvePts" class="curve" />
        </g>
        <text v-for="t in [0, 20, 40, 60, 80]" :key="`cx${t}`" :x="cX(t)" :y="pad.t + S + 13" class="tick">{{ t }}</text>
        <text :x="ox(2) + S / 2" :y="pad.t + S + 28" class="lab">iteration</text>
        <text :transform="`translate(${ox(2) - 14},${pad.t + S / 2}) rotate(-90)`" class="lab">loss</text>
      </template>
    </svg>

    <div class="ctrl">
      <template v-if="mode === 'explore'">
        <button v-if="showClosedForm" @click.stop="solveClosedForm">closed form (OLS)</button>
        <span><template v-if="locked">OLS solution · click the surface to explore again</template><template v-else>hover the surface</template> · w = {{ fmt(cur.b1) }}, b = {{ fmt(cur.b0) }} · <b>L = {{ curLoss.toFixed(3) }}</b></span>
      </template>
      <template v-else-if="mode === 'guess'">
        <button @click.stop="addGuesses(1)">guess</button>
        <button @click.stop="addGuesses(10)">10 guesses</button>
        <button @click.stop="addGuesses(100)">100 guesses</button>
        <button class="ghostbtn" @click.stop="resetGuesses">reset</button>
        <span>{{ guesses.length }} guesses<template v-if="best"> · best <b>L = {{ best.L.toFixed(3) }}</b> (optimum {{ L(LIN_OLS.b0, LIN_OLS.b1).toFixed(3) }})</template></span>
      </template>
      <template v-else>
        <button @click.stop="step">step</button>
        <button @click.stop="play">{{ playing ? 'pause' : 'run' }}</button>
        <button class="ghostbtn" @click.stop="resetGd">reset</button>
        <label v-if="showLr" class="lr">η =
          <input v-model.number="lr" type="range" min="0.05" max="2.2" step="0.05" @pointerdown.stop @keydown.stop>
          <b>{{ lr.toFixed(2) }}</b>
        </label>
        <span>iter {{ path.length - 1 }} · <b>L = {{ curLoss < 1e3 ? curLoss.toFixed(3) : '∞' }}</b> · click the surface to set the start</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.lse .frame { fill: none; stroke: #9aa1a6; stroke-width: 1; }
.lse .grid { stroke: #eceeef; stroke-width: 1; }
.lse .ttl { font: 600 12px "Exo 2", sans-serif; fill: #00457c; text-anchor: middle; }
.lse .lab { font: 11px "Exo 2", sans-serif; fill: #444; text-anchor: middle; }
.lse .tick { font: 9.5px "Exo 2", sans-serif; fill: #666; text-anchor: middle; }
.lse .pt { fill: #00457c; stroke: #fff; stroke-width: 1; }
.lse .fit { stroke: #ff7900; stroke-width: 2.6; }
.lse .ghost { stroke: #9aa1a6; stroke-width: 1; stroke-opacity: .45; }
.lse .guess { fill: none; stroke: #fff; stroke-width: 1.2; }
.lse .star { fill: #ff7900; stroke: #fff; stroke-width: 1; }
.lse .cur { fill: #ff7900; stroke: #fff; stroke-width: 1.6; }
.lse .opt { fill: none; stroke: #b02b37; stroke-width: 2; }
.lse .opt-ring { fill: none; stroke: #b02b37; stroke-width: 2.5; }
.lse .opt-dot { fill: #b02b37; }
.lse .opt-label { font-size: 11px; font-weight: 700; fill: #b02b37; text-anchor: middle; paint-order: stroke; stroke: white; stroke-width: 3px; }
.lse .optline { stroke: #b02b37; stroke-width: 2; stroke-dasharray: 5 4; }
.lse .gdpath { fill: none; stroke: #ff7900; stroke-width: 2; }
.lse .gdpt { fill: #fff; stroke: #ff7900; stroke-width: 1; }
.lse .curve { fill: none; stroke: #00457c; stroke-width: 2; }
.ctrl { display: flex; flex-wrap: wrap; gap: .45rem; align-items: center; justify-content: center; font-size: .68rem; color: #333; margin-top: .25rem; }
.ctrl button { padding: .12rem .6rem; border-radius: 4px; background: #00457c; color: #fff; font-size: .66rem; }
.ctrl button.ghostbtn { background: transparent; color: #00457c; border: 1px solid #00457c; }
.ctrl .lr { display: inline-flex; gap: .3rem; align-items: center; }
.ctrl .lr input { width: 110px; accent-color: #00457c; }
</style>
