<script setup lang="ts">
// Logistic regression on two features (NDVI x1, green x2), same 24 pixels as ClassPlanesDemo.
// Two views, switched via the shared logiNode ref (click z / p in LogisticGraph):
//   'z': the linear part  z = wᵀx + b  (green) and −z (red, "not vegetation"): two planes crossing at z = 0
//   'p': p(vegetation) = σ(z) (green) and 1 − p (red): two S-shaped surfaces crossing at 0.5
// Heights are mapped so that z = 0 and p = 0.5 sit at the same level -> the plane bends into the S-surface,
// and the crossing line (decision boundary) stays where it is.
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { logiNode } from '../lib/logisticView'

// mode: pin the view ('z' or 'p') and ignore the shared logiNode; bare: hide legend and buttons
const props = withDefaults(defineProps<{ width?: number, height?: number, mode?: 'z' | 'p', bare?: boolean }>(), { width: 400, height: 290, bare: false })

// [ndvi, green, isVegetation]
const RAW: [number, number, number][] = [
  [0.346, 0.0404, 1], [0.612, 0.032, 1], [0.672, 0.027, 1], [0.633, 0.0342, 1], [0.608, 0.0227, 1], [0.718, 0.057, 1],
  [0.691, 0.0344, 1], [0.572, 0.0287, 1], [0.791, 0.016, 1], [0.45, 0.0315, 1], [0.612, 0.0241, 1], [0.726, 0.0205, 1],
  [0.126, 0.0906, 0], [0.286, 0.0345, 0], [0.215, 0.0614, 0], [0.023, 0.0807, 0], [0.1, 0.0697, 0], [0.174, 0.0596, 0],
  [0.131, 0.0498, 0], [0.263, 0.0562, 0], [0.096, 0.0798, 0], [0.306, 0.0542, 0], [0.09, 0.0643, 0], [0.393, 0.1018, 0],
]
// data -> cube coordinates u, v in [-1.5, 1.5]
const X1 = [-0.05, 0.85]
const X2 = [0.01, 0.11]
const cu = (x1: number) => ((x1 - X1[0]) / (X1[1] - X1[0]) - 0.5) * 3
const cv = (x2: number) => ((x2 - X2[0]) / (X2[1] - X2[0]) - 0.5) * 3
const pts = RAW.map(([a, b, c]) => ({ u: cu(a), v: cv(b), y: c }))

// logistic regression in cube coordinates (Newton, small ridge so a separable sample stays finite)
const sig = (z: number) => 1 / (1 + Math.exp(-z))
let w = [0, 0, 0] // [b, wu, wv]
const LAMBDA = 0.3
for (let it = 0; it < 60; it++) {
  const g = [0, 0, 0]
  const Hm = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (const p of pts) {
    const r = [1, p.u, p.v]
    const q = sig(w[0] + w[1] * p.u + w[2] * p.v)
    for (let i = 0; i < 3; i++) {
      g[i] += (q - p.y) * r[i]
      for (let j = 0; j < 3; j++) Hm[i][j] += q * (1 - q) * r[i] * r[j]
    }
  }
  for (let i = 1; i < 3; i++) {
    g[i] += LAMBDA * w[i]
    Hm[i][i] += LAMBDA
  }
  // solve Hm * d = g (3x3, Gaussian elimination)
  const M = Hm.map((row, i) => [...row, g[i]])
  for (let c = 0; c < 3; c++) {
    let piv = c
    for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r
    ;[M[c], M[piv]] = [M[piv], M[c]]
    for (let r = 0; r < 3; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]
    }
  }
  const d = M.map((row, i) => row[3] / row[i])
  w = w.map((v, i) => v - d[i])
}
const zOf = (u: number, v: number) => w[0] + w[1] * u + w[2] * v
const ZS = Math.max(...[[-1.5, -1.5], [1.5, -1.5], [1.5, 1.5], [-1.5, 1.5]].map(([u, v]) => Math.abs(zOf(u, v))))

// morph: t = 0 -> linear part, t = 1 -> probability
const t = ref((props.mode ?? logiNode.value) === 'p' ? 1 : 0)
const hVeg = (u: number, v: number) => {
  const z = zOf(u, v)
  return (1 - t.value) * (0.5 + 0.8 * z / ZS) + t.value * sig(z)
}
const Z_FLOOR = -0.45
const Z_TOP = 1.45

// boundary z = 0 clipped to the floor square
const boundary = (() => {
  const [c, a, b] = w
  const hits: number[][] = []
  for (const u of [-1.5, 1.5]) {
    const v = -(a * u + c) / b
    if (Math.abs(v) <= 1.5) hits.push([u, v])
  }
  for (const v of [-1.5, 1.5]) {
    const u = -(b * v + c) / a
    if (Math.abs(u) <= 1.5) hits.push([u, v])
  }
  return hits.slice(0, 2)
})()

// ---------------- 3D view ----------------
const canvas = ref<HTMLCanvasElement>()
let yaw = -0.55
let pitch = 0.32
let auto = true
let tween: { y0: number, p0: number, y1: number, p1: number, t0: number } | null = null
let morph: { t0: number, from: number, to: number } | null = null
const view = ref<'free' | 'side' | 'top'>('free')
const sideYaw = (() => {
  const [, a, b] = w
  const y = Math.atan2(-b, a)
  return a * Math.cos(y) - b * Math.sin(y) > 0 ? y : y + Math.PI
})()
function goTo(v: 'free' | 'side' | 'top') {
  view.value = v
  if (v === 'free') {
    tween = null
    auto = true
    return
  }
  auto = false
  const [y1, p1] = v === 'side' ? [sideYaw, 0] : [0, Math.PI / 2 - 0.001]
  let dy = (y1 - yaw) % (2 * Math.PI)
  if (dy > Math.PI) dy -= 2 * Math.PI
  if (dy < -Math.PI) dy += 2 * Math.PI
  tween = { y0: yaw, p0: pitch, y1: yaw + dy, p1, t0: performance.now() }
}
watch(logiNode, (n) => {
  if (props.mode)
    return
  morph = { t0: performance.now(), from: t.value, to: n === 'p' ? 1 : 0 }
})
let raf = 0
let drag: { x: number, y: number, yaw: number, pitch: number } | null = null

function project(u: number, v: number, z: number) {
  const hz = (z - 0.5) / 0.85
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const X_ = (u * cy - v * sy) / 1.5
  const Y_ = (u * sy + v * cy) / 1.5
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const s = Math.min(props.width * 0.29, props.height * 0.33)
  return [props.width / 2 + X_ * s, props.height * 0.46 - (hz * cp - Y_ * sp) * s, Y_ * cp + hz * sp]
}
function poly(ctx: CanvasRenderingContext2D, q: number[][]) {
  ctx.beginPath()
  q.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
  ctx.closePath()
}

const SURF = [
  { color: '#2ca02c', fill: 'rgba(44,160,44,0.24)', edge: 'rgba(30,120,30,0.42)', region: 'rgba(44,160,44,0.16)', ring: false },
  { color: '#d62728', fill: 'rgba(214,39,40,0.20)', edge: 'rgba(170,30,30,0.42)', region: 'rgba(214,39,40,0.13)', ring: true },
]

function draw() {
  const c = canvas.value
  if (!c)
    return
  const dpr = window.devicePixelRatio || 1
  if (c.width !== props.width * dpr || c.height !== props.height * dpr) {
    c.width = props.width * dpr
    c.height = props.height * dpr
  }
  const ctx = c.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, props.width, props.height)

  // floor coloured by predicted class
  const G0 = 30
  for (let i = 0; i < G0; i++) {
    for (let j = 0; j < G0; j++) {
      const u = -1.5 + 3 * (i + 0.5) / G0
      const v = -1.5 + 3 * (j + 0.5) / G0
      ctx.fillStyle = SURF[zOf(u, v) >= 0 ? 0 : 1].region
      poly(ctx, [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([a, b]) => project(-1.5 + 3 * a / G0, -1.5 + 3 * b / G0, Z_FLOOR)))
      ctx.fill()
    }
  }
  const fl = [[-1.5, -1.5], [1.5, -1.5], [1.5, 1.5], [-1.5, 1.5]].map(([a, b]) => project(a, b, Z_FLOOR))
  ctx.strokeStyle = '#b8c0c6'
  ctx.lineWidth = 1
  poly(ctx, fl)
  ctx.stroke()

  // vertical axis: ticks depend on the view (0 / 0.5 / 1 for p, 0 for z)
  const ax0 = project(-1.5, 1.5, Z_FLOOR)
  const ax1 = project(-1.5, 1.5, Z_TOP)
  ctx.beginPath()
  ctx.moveTo(ax0[0], ax0[1])
  ctx.lineTo(ax1[0], ax1[1])
  ctx.stroke()
  if (pitch < 1.2) {
    ctx.font = '11px "Exo 2", sans-serif'
    ctx.fillStyle = '#666'
    ctx.textAlign = 'right'
    const ticks = t.value > 0.5 ? [[0, '0'], [0.5, '0.5'], [1, '1']] : [[0.5, 'z = 0']]
    for (const [h, l] of ticks as [number, string][]) {
      const p = project(-1.5, 1.5, h)
      ctx.beginPath()
      ctx.moveTo(p[0] - 3, p[1])
      ctx.lineTo(p[0] + 3, p[1])
      ctx.stroke()
      ctx.fillText(l, p[0] - 6, p[1] + 4)
    }
  }

  type Item = { d: number, draw: () => void }
  const items: Item[] = []
  const G = 14
  for (let k = 0; k < 2; k++) {
    const S = SURF[k]
    const h = (u: number, v: number) => (k === 0 ? hVeg(u, v) : 1 - hVeg(u, v))
    for (let i = 0; i < G; i++) {
      for (let j = 0; j < G; j++) {
        const q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([a, b]) => {
          const u = -1.5 + 3 * a / G
          const v = -1.5 + 3 * b / G
          return project(u, v, Math.max(Z_FLOOR, Math.min(Z_TOP, h(u, v))))
        })
        items.push({
          d: q.reduce((s, p) => s + p[2], 0) / 4,
          draw: () => {
            ctx.fillStyle = S.fill
            ctx.strokeStyle = S.edge
            poly(ctx, q)
            ctx.fill()
            ctx.stroke()
          },
        })
      }
    }
    // 0/1 targets only make sense for probabilities -> fade them in with t
    if (t.value > 0.02) {
      for (const p of pts) {
        const y = k === 0 ? p.y : 1 - p.y
        const a = project(p.u, p.v, y)
        const f = project(p.u, p.v, h(p.u, p.v))
        items.push({
          d: a[2] + (y >= h(p.u, p.v) ? 0.02 : -0.02),
          draw: () => {
            ctx.globalAlpha = t.value
            ctx.strokeStyle = '#9aa1a6'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a[0], a[1])
            ctx.lineTo(f[0], f[1])
            ctx.stroke()
            ctx.beginPath()
            if (S.ring) {
              ctx.arc(a[0], a[1], 5, 0, 2 * Math.PI)
              ctx.strokeStyle = S.color
              ctx.lineWidth = 2
              ctx.stroke()
              ctx.lineWidth = 1
            }
            else {
              ctx.arc(a[0], a[1], 3.5, 0, 2 * Math.PI)
              ctx.fillStyle = S.color
              ctx.strokeStyle = '#fff'
              ctx.fill()
              ctx.stroke()
            }
            ctx.globalAlpha = 1
          },
        })
      }
    }
  }
  // decision boundary on the surfaces (always at height 0.5) + its shadow on the floor
  if (boundary.length === 2) {
    const [s0, s1] = boundary
    const a = project(s0[0], s0[1], 0.5)
    const b = project(s1[0], s1[1], 0.5)
    items.push({
      d: (a[2] + b[2]) / 2 + 0.03,
      draw: () => {
        ctx.strokeStyle = '#00457c'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(a[0], a[1])
        ctx.lineTo(b[0], b[1])
        ctx.stroke()
        ctx.lineWidth = 1
      },
    })
  }
  items.sort((a, b) => a.d - b.d).forEach(it => it.draw())
  if (boundary.length === 2) {
    const [s0, s1] = boundary
    const a = project(s0[0], s0[1], Z_FLOOR)
    const b = project(s1[0], s1[1], Z_FLOOR)
    ctx.strokeStyle = '#00457c'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.stroke()
    ctx.setLineDash([])
    ctx.lineWidth = 1
  }

  ctx.font = '600 11.5px "Exo 2", sans-serif'
  ctx.fillStyle = '#00457c'
  ctx.textAlign = 'center'
  const near = (a: number[], b: number[]) => (a[2] > b[2] ? a : b)
  const l1 = near(project(0, -1.95, Z_FLOOR), project(0, 1.95, Z_FLOOR))
  const l2 = near(project(-1.95, 0, Z_FLOOR), project(1.95, 0, Z_FLOOR))
  if (Math.abs(Math.sin(yaw)) < 0.97 || pitch > 0.3)
    ctx.fillText('NDVI x₁', l1[0], l1[1] + 12)
  if (Math.abs(Math.cos(yaw)) < 0.97 || pitch > 0.3)
    ctx.fillText('green x₂', l2[0], l2[1] + 12)
  if (pitch < 1.2) {
    ctx.font = '11px "Exo 2", sans-serif'
    ctx.fillStyle = '#666'
    ctx.fillText(t.value > 0.5 ? 'probability' : 'linear part z', ax1[0], ax1[1] - 6)
  }
}

function loop() {
  let dirty = false
  if (morph) {
    const u = Math.min(1, (performance.now() - morph.t0) / 1000)
    const e = u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2
    t.value = morph.from + (morph.to - morph.from) * e
    if (u >= 1)
      morph = null
    dirty = true
  }
  if (tween && !drag) {
    const u = Math.min(1, (performance.now() - tween.t0) / 900)
    const e = u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2
    yaw = tween.y0 + (tween.y1 - tween.y0) * e
    pitch = tween.p0 + (tween.p1 - tween.p0) * e
    if (u >= 1)
      tween = null
    dirty = true
  }
  else if (auto && !drag && !document.hidden) {
    yaw += 0.003
    dirty = true
  }
  if (dirty)
    draw()
  raf = requestAnimationFrame(loop)
}
function down(e: PointerEvent) {
  e.stopPropagation()
  auto = false
  tween = null
  view.value = 'free'
  drag = { x: e.clientX, y: e.clientY, yaw, pitch }
  ;(e.target as Element).setPointerCapture(e.pointerId)
}
function move(e: PointerEvent) {
  if (!drag)
    return
  yaw = drag.yaw - (e.clientX - drag.x) * 0.01
  pitch = Math.min(Math.PI / 2 - 0.001, Math.max(-0.2, drag.pitch + (e.clientY - drag.y) * 0.01))
  draw()
}
function up() {
  drag = null
}
onMounted(() => {
  draw()
  raf = requestAnimationFrame(loop)
})
onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <div class="lpd select-none" @click.stop @dblclick.stop>
    <canvas
      ref="canvas"
      :style="{ width: `${width}px`, height: `${height}px`, cursor: 'grab', touchAction: 'none' }"
      @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up"
    />
    <div v-if="!bare" class="legend">
      <span v-if="logiNode === 'z'"><b style="color:#2ca02c">z</b> and <b style="color:#d62728">−z</b>: two planes, crossing at z = 0</span>
      <span v-else><b style="color:#2ca02c">p(vegetation)</b> and <b style="color:#d62728">1 − p</b>: crossing at 0.5</span>
    </div>
    <div v-if="!bare" class="views">
      <button :class="{ on: view === 'side' }" @click.stop="goTo('side')">look along boundary</button>
      <button :class="{ on: view === 'top' }" @click.stop="goTo('top')">top view</button>
      <button class="ghost" @click.stop="goTo('free')">rotate</button>
    </div>
  </div>
</template>

<style scoped>
.lpd { display: flex; flex-direction: column; align-items: center; gap: .3rem; }
.lpd .legend { font: 12px "Exo 2", sans-serif; color: #444; }
.lpd .views { display: flex; gap: .35rem; }
.lpd .views button { font: 600 11px "Exo 2", sans-serif; padding: .2rem .55rem; border-radius: 5px; border: 1px solid #00457c; background: #00457c; color: #fff; }
.lpd .views button.ghost { background: transparent; color: #00457c; }
.lpd .views button.on { background: #ff7900; border-color: #ff7900; }
</style>
