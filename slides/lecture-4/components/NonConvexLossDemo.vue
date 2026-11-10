<script setup lang="ts">
// Rugged non-convex loss surface over two weights (w₁, w₂): one global minimum, several local minima, many saddle points.
// The loss is a sum of parts (bowl + valleys + hill + ripples), like a network output is a sum over neurons;
// "dropout" randomly drops parts at each step (rescaling the rest by 1/(1−p)), so each step sees a slightly different surface.
// - click the surface: start optimizers there (one ball per active optimizer), drag: rotate
// - optimizers: gradient descent, momentum, RMSProp, Adam; learning rate, momentum β and gradient noise (mini-batch SGD)
// - "20 random starts": many initialisations with the first active optimizer → basins of attraction
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useIsSlideActive } from '@slidev/client'
import { viridis } from '../lib/lossSurface'

const active = useIsSlideActive()

// ---------- surface ----------
const g = (dx: number, dy: number, s: number) => Math.exp(-(dx * dx + dy * dy) / (2 * s * s))
const PARTS: ((x: number, y: number) => number)[] = [
  (x, y) => -1.8 * g(x - 1.5, y + 1.1, 1.1), // wide global valley
  (x, y) => -0.7 * g(x + 1.6, y + 1.2, 0.75), // shallow local valleys
  (x, y) => -0.6 * g(x + 0.9, y - 1.8, 0.65),
  (x, y) => -0.6 * g(x - 1.7, y - 1.6, 0.5),
  (x, y) => 0.15 * g(x - 0.1, y - 0.1, 0.7), // low hill in the middle
  (x, y) => 0.10 * Math.sin(2.3 * x + 1) * Math.cos(1.9 * y), // ripples → many small minima and saddles
  (x, y) => 0.13 * Math.sin(4.1 * x) * Math.sin(3.7 * y + 0.5),
  (x, y) => 0.08 * Math.cos(6.3 * x + 0.4) * Math.cos(5.8 * y),
]
const bowl = (x: number, y: number) => 0.08 * (x * x + y * y) + 2.3
const L = (x: number, y: number) => bowl(x, y) + PARTS.reduce((a, f) => a + f(x, y), 0)
const R = 3
// loss with a dropout mask (keep[k] = 0 or 1/(1−p)), gradient by central differences
const Lmask = (x: number, y: number, keep: number[]) => bowl(x, y) + PARTS.reduce((a, f, k) => a + keep[k] * f(x, y), 0)
const gradOf = (f: (x: number, y: number) => number, x: number, y: number) => {
  const e = 1e-4
  return [(f(x + e, y) - f(x - e, y)) / (2 * e), (f(x, y + e) - f(x, y - e)) / (2 * e)]
}
const grad = (x: number, y: number) => gradOf(L, x, y)
// all local minima of the surface (fine grid search); the lowest is the global minimum
const MINIMA = (() => {
  const n = 240
  const h = 2 * R / n
  const z = Array.from({ length: n + 1 }, (_, j) => Array.from({ length: n + 1 }, (_, i) => L(-R + i * h, -R + j * h)))
  const out: { w: number[], z: number }[] = []
  for (let j = 1; j < n; j++) {
    for (let i = 1; i < n; i++) {
      const v = z[j][i]
      if ([z[j - 1][i - 1], z[j - 1][i], z[j - 1][i + 1], z[j][i - 1], z[j][i + 1], z[j + 1][i - 1], z[j + 1][i], z[j + 1][i + 1]].every(u => u > v))
        out.push({ w: [-R + i * h, -R + j * h], z: v })
    }
  }
  return out.sort((a, b) => a.z - b.z)
})()
const NG = 64
const Z: number[][] = []
let zlo = Infinity
let zhi = -Infinity
for (let j = 0; j <= NG; j++) {
  const row: number[] = []
  for (let i = 0; i <= NG; i++) {
    const v = L(-R + 2 * R * i / NG, -R + 2 * R * j / NG)
    row.push(v)
    zlo = Math.min(zlo, v)
    zhi = Math.max(zhi, v)
  }
  Z.push(row)
}

// ---------- optimizers ----------
type Opt = 'gd' | 'momentum' | 'rmsprop' | 'adam'
const OPTS: { key: Opt, label: string, color: string }[] = [
  { key: 'gd', label: 'GD', color: '#d62728' },
  { key: 'momentum', label: 'Momentum', color: '#ff7900' },
  { key: 'rmsprop', label: 'RMSProp', color: '#7b3fa0' },
  { key: 'adam', label: 'Adam', color: '#1f77b4' },
]
const on = reactive<Record<Opt, boolean>>({ gd: true, momentum: true, rmsprop: false, adam: false })
const logLr = ref(Math.log10(0.05))
const lr = computed(() => 10 ** logLr.value)
const beta = ref(0.9)
const noise = ref(0)
const dropout = ref(0)

interface Run { opt: Opt, color: string, w: number[], v: number[], s: number[], m: number[], t: number, trail: number[][], done: boolean, small: boolean }
const runs = ref<Run[]>([])
const version = ref(0)
function gauss() {
  const u = 1 - Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random())
}
function newRun(opt: Opt, w: number[], small = false): Run {
  return { opt, color: OPTS.find(o => o.key === opt)!.color, w: [...w], v: [0, 0], s: [0, 0], m: [0, 0], t: 0, trail: [[...w]], done: false, small }
}
function stepRun(r: Run) {
  if (r.done)
    return
  const p = dropout.value
  const keep = PARTS.map(() => (Math.random() < p ? 0 : 1 / (1 - p))) // one dropout mask per step
  const gr = (p > 0
    ? gradOf((x, y) => Lmask(x, y, keep), r.w[0], r.w[1])
    : grad(r.w[0], r.w[1])).map(v => v + noise.value * gauss())
  r.t++
  const a = lr.value
  for (let k = 0; k < 2; k++) {
    let d = 0
    if (r.opt === 'gd') {
      d = a * gr[k]
    }
    else if (r.opt === 'momentum') {
      r.v[k] = beta.value * r.v[k] + gr[k]
      d = a * r.v[k]
    }
    else if (r.opt === 'rmsprop') {
      r.s[k] = 0.9 * r.s[k] + 0.1 * gr[k] ** 2
      d = a * gr[k] / (Math.sqrt(r.s[k]) + 1e-8)
    }
    else {
      r.m[k] = 0.9 * r.m[k] + 0.1 * gr[k]
      r.s[k] = 0.999 * r.s[k] + 0.001 * gr[k] ** 2
      d = a * (r.m[k] / (1 - 0.9 ** r.t)) / (Math.sqrt(r.s[k] / (1 - 0.999 ** r.t)) + 1e-8)
    }
    r.w[k] = Math.min(R, Math.max(-R, r.w[k] - d))
  }
  r.trail.push([...r.w])
  const gn = Math.hypot(...grad(r.w[0], r.w[1]))
  if (r.t >= 800 || (noise.value === 0 && dropout.value === 0 && gn < 2e-3 && r.t > 20))
    r.done = true
}
function start(w: number[]) {
  runs.value = OPTS.filter(o => on[o.key]).map(o => newRun(o.key, w))
  version.value++
}
function randomStart() {
  start([(Math.random() * 2 - 1) * R * 0.9, (Math.random() * 2 - 1) * R * 0.9])
}
function manyStarts() {
  const opt = OPTS.find(o => on[o.key])?.key ?? 'gd'
  runs.value = Array.from({ length: 20 }, () => newRun(opt, [(Math.random() * 2 - 1) * R * 0.95, (Math.random() * 2 - 1) * R * 0.95], true))
  version.value++
}
function clearRuns() {
  runs.value = []
  version.value++
}
const where = (w: number[]) => {
  const k = MINIMA.findIndex(mm => Math.hypot(mm.w[0] - w[0], mm.w[1] - w[1]) < 0.2)
  return k === 0 ? 'global min' : k > 0 ? 'local min' : '…'
}
const summary = computed(() => {
  void version.value
  const rs = runs.value
  if (!rs.length)
    return []
  if (rs[0].small) {
    const counts: Record<string, number> = {}
    rs.forEach((r) => { const k = where(r.w); counts[k] = (counts[k] || 0) + 1 })
    return Object.entries(counts).map(([k, c]) => ({ color: rs[0].color, text: `${c} × ${k}` }))
  }
  return rs.map(r => ({ color: r.color, text: `${OPTS.find(o => o.key === r.opt)!.label}: loss ${L(r.w[0], r.w[1]).toFixed(2)} · ${where(r.w)}` }))
})

// ---------- 3D view ----------
const W = 430
const H = 330
const canvas = ref<HTMLCanvasElement>()
let yaw = 2.0
let pitch = 0.55
const toUV = (w: number[]) => [w[0] / R, w[1] / R]
function project(u: number, v: number, h: number) {
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const x = u * cy - v * sy
  const y = u * sy + v * cy
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const zz = h * 0.8 - 0.4
  const s = Math.min(W * 0.33, H * 0.42)
  return [W / 2 + x * s, H * 0.53 - (zz * cp - y * sp) * s, y * cp + zz * sp]
}
const hOf = (z: number) => (z - zlo) / (zhi - zlo)
let screenGrid: { p: number[], i: number, j: number }[] = []
function draw() {
  const c = canvas.value
  if (!c)
    return
  const dpr = window.devicePixelRatio || 1
  if (c.width !== W * dpr) {
    c.width = W * dpr
    c.height = H * dpr
  }
  const ctx = c.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, W, H)
  const P: number[][][] = []
  screenGrid = []
  for (let j = 0; j <= NG; j++) {
    P.push([])
    for (let i = 0; i <= NG; i++) {
      const p = project(i / NG * 2 - 1, j / NG * 2 - 1, hOf(Z[j][i]))
      P[j].push(p)
      screenGrid.push({ p, i, j })
    }
  }
  const quads: { d: number, p: number[][], t: number }[] = []
  for (let j = 0; j < NG; j++) {
    for (let i = 0; i < NG; i++) {
      const p = [P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]]
      quads.push({ d: p.reduce((a, q) => a + q[2], 0) / 4, p, t: hOf((Z[j][i] + Z[j][i + 1] + Z[j + 1][i] + Z[j + 1][i + 1]) / 4) })
    }
  }
  quads.sort((a, b) => a.d - b.d)
  for (const q of quads) {
    const [r, gg, b] = viridis(q.t)
    ctx.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 0.6
    ctx.beginPath()
    q.p.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }
  // global minimum marker
  const gm = project(...(toUV(MINIMA[0].w) as [number, number]), hOf(L(MINIMA[0].w[0], MINIMA[0].w[1])))
  ctx.strokeStyle = '#ffd400'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(gm[0], gm[1], 7, 0, 2 * Math.PI)
  ctx.stroke()
  // runs
  for (const r of runs.value) {
    ctx.strokeStyle = r.color
    ctx.lineWidth = r.small ? 1.2 : 2.4
    ctx.beginPath()
    r.trail.forEach((w, k) => {
      const [u, v] = toUV(w)
      const p = project(u, v, hOf(L(w[0], w[1])) + 0.012)
      if (k) ctx.lineTo(p[0], p[1])
      else ctx.moveTo(p[0], p[1])
    })
    ctx.stroke()
    const [u, v] = toUV(r.w)
    const p = project(u, v, hOf(L(r.w[0], r.w[1])) + 0.012)
    ctx.fillStyle = r.color
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(p[0], p[1], r.small ? 3.5 : 6, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  }
  // axis labels
  ctx.fillStyle = '#5f625f'
  ctx.font = 'italic 13px serif'
  const lx = project(0, -1.12, 0)
  const ly = project(-1.12, 0, 0)
  ctx.fillText('w₁', lx[0] - 6, lx[1] + 12)
  ctx.fillText('w₂', ly[0] - 14, ly[1] + 6)
  const top = project(-1, -1, 1.05)
  ctx.font = '600 11px "Exo 2", sans-serif'
  ctx.fillText('loss', top[0] - 10, top[1] - 4)
}

// ---------- interaction ----------
let drag: { x: number, y: number, yaw: number, pitch: number, moved: boolean } | null = null
function down(e: PointerEvent) {
  e.stopPropagation()
  drag = { x: e.clientX, y: e.clientY, yaw, pitch, moved: false }
  ;(e.target as Element).setPointerCapture(e.pointerId)
}
function move(e: PointerEvent) {
  if (!drag)
    return
  const dx = e.clientX - drag.x
  const dy = e.clientY - drag.y
  if (Math.hypot(dx, dy) > 4)
    drag.moved = true
  if (drag.moved) {
    yaw = drag.yaw - dx * 0.01
    pitch = Math.min(1.45, Math.max(0.15, drag.pitch + dy * 0.01))
    draw()
  }
}
function up(e: PointerEvent) {
  if (drag && !drag.moved) {
    // click: pick the visible grid vertex under the pointer (closest to the viewer)
    const rect = canvas.value!.getBoundingClientRect()
    const x = (e.clientX - rect.left) * W / rect.width
    const y = (e.clientY - rect.top) * H / rect.height
    let best: { p: number[], i: number, j: number } | null = null
    for (const gp of screenGrid) {
      if (Math.hypot(gp.p[0] - x, gp.p[1] - y) < 9 && (!best || gp.p[2] > best.p[2]))
        best = gp
    }
    if (best)
      start([-R + 2 * R * best.i / NG, -R + 2 * R * best.j / NG])
  }
  drag = null
}

let raf = 0
function loop() {
  if (active.value && runs.value.some(r => !r.done)) {
    for (let k = 0; k < 2; k++) runs.value.forEach(stepRun)
    version.value++
    draw()
  }
  raf = requestAnimationFrame(loop)
}
onMounted(() => {
  draw()
  raf = requestAnimationFrame(loop)
})
onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <div class="ncl select-none" @click.stop @dblclick.stop>
    <div class="view">
      <canvas
        ref="canvas" :style="{ width: `${W}px`, height: `${H}px`, cursor: 'crosshair', touchAction: 'none' }"
        role="img" aria-label="Rugged 3D loss surface over two weights w1 and w2 with one global minimum, several local minima and many saddle points; click to start optimizers, drag to rotate"
        @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="drag = null"
      />
      <div class="hint">click the surface: start · drag: rotate · <span style="color:#c9a800">○</span> global minimum</div>
    </div>
    <div class="side">
      <div class="grp">
        <div class="lbl">optimizers</div>
        <div class="chips">
          <button
            v-for="o in OPTS" :key="o.key"
            :style="on[o.key] ? { background: o.color, borderColor: o.color, color: '#fff' } : { borderColor: o.color, color: o.color }"
            @click.stop="on[o.key] = !on[o.key]"
          >
            {{ o.label }}
          </button>
        </div>
      </div>
      <label class="sl">
        <span>learning rate <b>{{ lr < 0.1 ? lr.toFixed(3) : lr.toFixed(2) }}</b></span>
        <input v-model.number="logLr" type="range" min="-2.5" max="0" step="0.05" @pointerdown.stop @keydown.stop>
      </label>
      <label class="sl">
        <span>momentum β <b>{{ beta.toFixed(2) }}</b></span>
        <input v-model.number="beta" type="range" min="0" max="0.99" step="0.01" @pointerdown.stop @keydown.stop>
      </label>
      <label class="sl">
        <span>gradient noise (mini-batch) <b>{{ noise.toFixed(2) }}</b></span>
        <input v-model.number="noise" type="range" min="0" max="1.5" step="0.05" @pointerdown.stop @keydown.stop>
      </label>
      <label class="sl">
        <span>dropout p <b>{{ dropout.toFixed(2) }}</b></span>
        <input v-model.number="dropout" type="range" min="0" max="0.5" step="0.05" @pointerdown.stop @keydown.stop>
      </label>
      <div class="btns">
        <button @click.stop="randomStart">random start</button>
        <button @click.stop="manyStarts">20 random starts</button>
        <button class="ghost" @click.stop="clearRuns">clear</button>
      </div>
      <div class="res">
        <div v-for="(s, k) in summary" :key="k" :style="{ color: s.color }">● <span>{{ s.text }}</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ncl { display: flex; gap: 1rem; align-items: flex-start; }
.view { display: flex; flex-direction: column; align-items: center; }
.hint { font: 10.5px "Exo 2", sans-serif; color: #8b8f8d; }
.side { flex: 1; display: flex; flex-direction: column; gap: .45rem; font: 12px "Exo 2", sans-serif; color: #00457c; padding-top: .4rem; }
.lbl { font-weight: 600; margin-bottom: .15rem; }
.chips { display: flex; flex-wrap: wrap; gap: .3rem; }
.chips button { font: 600 11px "Exo 2", sans-serif; padding: .12rem .5rem; border-radius: 5px; border: 1.5px solid; background: #fff; }
.sl { display: flex; flex-direction: column; gap: .05rem; }
.ncl .sl input[type=range] { width: 100%; accent-color: #00457c; appearance: auto !important; -webkit-appearance: auto !important; border: none !important; background: transparent !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; height: 18px !important; min-height: 0 !important; }
.btns { display: flex; flex-wrap: wrap; gap: .3rem; }
.btns button { font: 600 11px "Exo 2", sans-serif; padding: .12rem .5rem; border-radius: 5px; border: 1px solid #00457c; background: #00457c; color: #fff; }
.btns button.ghost { background: transparent; color: #00457c; }
.res { font-size: 11.5px; line-height: 1.5; min-height: 4.5em; }
.res span { color: #333; }
</style>
