<script setup lang="ts">
// Universal approximation as regression, trained live.
// Model: one hidden layer with N ReLU neurons and a linear output,
//   ŷ(x) = Σ_j v_j · ReLU(w_j u + b_j) + c,   u = 4 (x − 0.5),
// trained with mean squared error and Adam (full batch, gradients by hand, a little weight decay).
// Starts with a few random points; click the plot to add points and watch the network bend to fit them.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useIsSlideActive } from '@slidev/client'

const active = useIsSlideActive()

// ---------- data ----------
function rng(seed: number) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
}
function baseData() {
  const r = rng(11)
  return Array.from({ length: 8 }, (_, i) => {
    const x = (i + 0.2 + 0.6 * r()) / 8
    return { x, y: 0.6 * Math.sin(5.5 * x) - 0.3 + 0.25 * (r() - 0.5) }
  })
}
const data = ref(baseData())

// ---------- model ----------
const NS = [1, 2, 4, 8, 16, 32, 64, 128, 256]
const ni = ref(4)
const N = computed(() => NS[ni.value])
const toU = (x: number) => 4 * (x - 0.5)
const relu = (v: number) => Math.max(0, v)

interface Params { w: number[], b: number[], v: number[], c: number }
let P: Params = { w: [], b: [], v: [], c: 0 }
let M: Params = { w: [], b: [], v: [], c: 0 } // Adam 1st moment
let V: Params = { w: [], b: [], v: [], c: 0 } // Adam 2nd moment
let seed = 1
const step = ref(0)
const loss = ref(0)
const version = ref(0) // bump to redraw
const running = ref(false)

function init() {
  const r = rng(100 + seed++)
  const n = N.value
  // kinks spread evenly over [0, 1], random directions, small output weights
  const w = Array.from({ length: n }, () => (r() < 0.5 ? -1 : 1) * (0.8 + r()))
  const kink = Array.from({ length: n }, (_, j) => toU((j + 0.5) / n + (r() - 0.5) * 0.08))
  P = { w, b: w.map((wj, j) => -wj * kink[j]), v: Array.from({ length: n }, () => (r() - 0.5) * 0.4), c: 0 }
  const zeros = () => ({ w: Array(n).fill(0), b: Array(n).fill(0), v: Array(n).fill(0), c: 0 })
  M = zeros()
  V = zeros()
  step.value = 0
  computeLoss()
}
function predict(x: number) {
  const u = toU(x)
  let y = P.c
  for (let j = 0; j < P.w.length; j++) y += P.v[j] * relu(P.w[j] * u + P.b[j])
  return y
}
function computeLoss() {
  const d = data.value
  loss.value = d.reduce((a, s) => a + (predict(s.x) - s.y) ** 2, 0) / Math.max(1, d.length)
  version.value++
}
const LR = 0.02
const WD = 0.0005
function trainStep() {
  const n = P.w.length
  const d = data.value
  if (!d.length)
    return
  const g: Params = { w: Array(n).fill(0), b: Array(n).fill(0), v: Array(n).fill(0), c: 0 }
  for (const s of d) {
    const u = toU(s.x)
    const pre = P.w.map((w, j) => w * u + P.b[j])
    const h = pre.map(relu)
    const yhat = P.c + h.reduce((a, hj, j) => a + P.v[j] * hj, 0)
    const dy = 2 * (yhat - s.y) // d MSE / dŷ
    g.c += dy
    for (let j = 0; j < n; j++) {
      g.v[j] += dy * h[j]
      if (pre[j] > 0) {
        const dp = dy * P.v[j]
        g.w[j] += dp * u
        g.b[j] += dp
      }
    }
  }
  step.value++
  const t = step.value
  const b1 = 0.9
  const b2 = 0.999
  const upd = (key: 'w' | 'b' | 'v', j: number) => {
    const gr = g[key][j] / d.length + (key === 'b' ? 0 : WD * P[key][j])
    M[key][j] = b1 * M[key][j] + (1 - b1) * gr
    V[key][j] = b2 * V[key][j] + (1 - b2) * gr * gr
    P[key][j] -= LR * (M[key][j] / (1 - b1 ** t)) / (Math.sqrt(V[key][j] / (1 - b2 ** t)) + 1e-8)
  }
  for (let j = 0; j < n; j++) { upd('w', j); upd('b', j); upd('v', j) }
  const gc = g.c / d.length
  M.c = b1 * M.c + (1 - b1) * gc
  V.c = b2 * V.c + (1 - b2) * gc * gc
  P.c -= LR * (M.c / (1 - b1 ** t)) / (Math.sqrt(V.c / (1 - b2 ** t)) + 1e-8)
}

let raf = 0
let runStart = 0 // each press of "train" runs up to 5000 steps
function loop() {
  if (!running.value || !active.value)
    return
  for (let i = 0; i < 10; i++) trainStep()
  computeLoss()
  if (step.value - runStart >= 5000)
    running.value = false
  raf = requestAnimationFrame(loop)
}
watch([running, active], () => {
  cancelAnimationFrame(raf)
  if (running.value && active.value) {
    runStart = step.value
    raf = requestAnimationFrame(loop)
  }
})
watch(N, () => { running.value = false; init() })
onBeforeUnmount(() => cancelAnimationFrame(raf))
function oneStep() {
  running.value = false
  for (let i = 0; i < 10; i++) trainStep()
  computeLoss()
}
function resetModel() {
  running.value = false
  init()
}
function resetData() {
  data.value = baseData()
  computeLoss()
}
function clearData() {
  data.value = []
  computeLoss()
}
init()

// ---------- drawing ----------
const showUnits = ref(false)
const W = 440
const H = 250
const X0 = 30
const X1 = 430
const Y0 = 14
const Y1 = 236
const YD = [-1.2, 1.2]
const sx = (x: number) => X0 + x * (X1 - X0)
const sy = (y: number) => Y1 - (y - YD[0]) / (YD[1] - YD[0]) * (Y1 - Y0)
const curve = (f: (x: number) => number) => {
  let d = ''
  for (let i = 0; i <= 300; i++) {
    const x = i / 300
    const y = Math.min(YD[1] + 0.5, Math.max(YD[0] - 0.5, f(x)))
    d += `${i ? 'L' : 'M'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`
  }
  return d
}
const modelPath = computed(() => { void version.value; return curve(predict) })
// hidden neurons: hinge ReLU(w u + b), normalised to the same height; kink at u = −b / w
const units = computed(() => {
  void version.value
  return P.w.map((w, j) => {
    const b = P.b[j]
    const mx = Math.max(relu(w * toU(0) + b), relu(w * toU(1) + b), 1e-6)
    const kink = 0.5 + (-b / w) / 4
    return {
      d: curve(x => YD[0] + 0.1 + 0.5 * relu(w * toU(x) + b) / mx),
      kink: kink >= 0 && kink <= 1 ? kink : null,
    }
  })
})

const svg = ref<SVGSVGElement>()
function addPoint(e: PointerEvent) {
  const r = svg.value!.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width * W
  const py = (e.clientY - r.top) / r.height * H
  if (px < X0 || px > X1 || py < Y0 || py > Y1)
    return
  data.value = [...data.value, { x: (px - X0) / (X1 - X0), y: YD[0] + (Y1 - py) / (Y1 - Y0) * (YD[1] - YD[0]) }]
  computeLoss()
}
</script>

<template>
  <div class="uap select-none" @click.stop @dblclick.stop>
    <svg
      ref="svg" :viewBox="`0 0 ${W} ${H}`" class="plot" role="img"
      :aria-label="`Regression: ${data.length} points and the prediction of a one-hidden-layer network with ${N} ReLU neurons; step ${step}, mean squared error ${loss.toFixed(3)}`"
      @pointerdown.stop="addPoint"
    >
      <rect :x="X0" :y="Y0" :width="X1 - X0" :height="Y1 - Y0" fill="#fafbfc" />
      <line :x1="X0" :x2="X1" :y1="sy(0)" :y2="sy(0)" stroke="#d0d4d8" stroke-width="1" />
      <line :x1="X0" :x2="X0" :y1="Y0" :y2="Y1" stroke="#8b8f8d" stroke-width="1" />
      <line :x1="X0" :x2="X1" :y1="Y1" :y2="Y1" stroke="#8b8f8d" stroke-width="1" />
      <text :x="X1" :y="Y1 + 13" text-anchor="end" style="font-size: 12px; font-family: serif; font-style: italic" fill="#5f625f">x</text>
      <text :x="X0 - 6" :y="Y0 + 10" text-anchor="end" style="font-size: 12px; font-family: serif; font-style: italic" fill="#5f625f">y</text>

      <template v-if="showUnits">
        <template v-for="(u, j) in units" :key="`u${j}`">
          <path :d="u.d" fill="none" style="stroke: #ff7900; stroke-width: 1.3; stroke-opacity: 0.55" />
          <line v-if="u.kink !== null" :x1="sx(u.kink)" :x2="sx(u.kink)" :y1="Y1 - 6" :y2="Y1" style="stroke: #ff7900; stroke-width: 2" />
        </template>
      </template>

      <path :d="modelPath" fill="none" stroke="#2ca02c" stroke-width="3" stroke-linejoin="round" />
      <circle v-for="(p, i) in data" :key="`p${i}`" :cx="sx(p.x)" :cy="sy(p.y)" r="5" style="fill: #00457c" stroke="#fff" stroke-width="1.2" />

      <text :x="X1 - 4" :y="Y0 + 14" text-anchor="end" style="font-size: 11px; font-weight: 700" fill="#00457c">step {{ step }} · MSE {{ loss.toFixed(3) }}</text>
      <text v-if="!data.length" :x="(X0 + X1) / 2" :y="(Y0 + Y1) / 2" text-anchor="middle" style="font-size: 13px" fill="#8b8f8d">click to add points</text>
    </svg>
    <div class="ctl">
      <button class="primary" @click.stop="running = !running">{{ running ? 'pause' : 'train' }}</button>
      <button @click.stop="oneStep">step</button>
      <button @click.stop="resetModel">reset model</button>
      <button @click.stop="resetData">reset data</button>
      <button @click.stop="clearData">clear</button>
    </div>
    <div class="ctl">
      <label>
        <span>hidden ReLU neurons: <b>{{ N }}</b></span>
        <input v-model.number="ni" class="stp" type="range" min="0" :max="NS.length - 1" step="1" @pointerdown.stop @keydown.stop>
      </label>
      <button class="units" :class="{ on: showUnits }" @click.stop="showUnits = !showUnits">show neurons</button>
    </div>
    <span class="hint">click the plot to add points</span>
  </div>
</template>

<style scoped>
.uap { display: flex; flex-direction: column; align-items: center; gap: .25rem; }
.plot { width: 100%; height: auto; cursor: crosshair; touch-action: none; }
.ctl { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: .35rem; font: 12px "Exo 2", sans-serif; color: #00457c; }
.ctl label { display: flex; align-items: center; gap: .4rem; }
.uap .ctl input.stp { width: 100px; accent-color: #00457c; appearance: auto !important; -webkit-appearance: auto !important; border: none !important; background: transparent !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; height: 18px !important; min-height: 0 !important; }
.ctl button { white-space: nowrap; font: 600 11px "Exo 2", sans-serif; padding: .12rem .5rem; border-radius: 5px; border: 1px solid #00457c; background: transparent; color: #00457c; }
.ctl button.primary { background: #00457c; color: #fff; min-width: 4.2em; }
.ctl button.units { border-color: #ff7900; color: #b35500; }
.ctl button.units.on { background: #ff7900; color: #fff; }
.hint { font-size: 10px; color: #8b8f8d; }
</style>
