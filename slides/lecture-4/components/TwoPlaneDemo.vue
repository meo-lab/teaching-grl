<script setup lang="ts">
// Two targets from the same two features -> two planes in ONE 3D plot (one per row of W).
// Shared floor: elevation x1 and slope x2. Vertical axis: the (standardized) target.
// Orange: temperature ~ elevation + slope. Purple: snow depth ~ elevation + slope.
// Both fitted by OLS on the same inputs; drag to rotate.
import { onMounted, onUnmounted, ref } from 'vue'
import { mulberry32 } from '../lib/lossSurface'

const props = withDefaults(defineProps<{ width?: number, height?: number }>(), { width: 460, height: 300 })

function gauss(r: () => number) {
  return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r())
}

// same inputs for both targets
const rng = mulberry32(21)
const X = Array.from({ length: 30 }, () => ({ x1: -1.3 + 2.6 * rng(), x2: -1.3 + 2.6 * rng() }))
const nrng = mulberry32(7)
const targets = [
  { label: 'temperature ŷ₁', color: '#ff7900', fill: 'rgba(255,121,0,0.17)', edge: 'rgba(200,90,0,0.45)', true: [0.1, -0.5, 0.45], ring: false },
  { label: 'snow depth ŷ₂', color: '#7b3fa0', fill: 'rgba(123,63,160,0.17)', edge: 'rgba(123,63,160,0.45)', true: [-0.05, 0.55, -0.4], ring: true },
].map((t) => {
  const pts = X.map(p => ({ ...p, y: t.true[0] + t.true[1] * p.x1 + t.true[2] * p.x2 + 0.12 * gauss(nrng) }))
  return { ...t, pts, coef: fit(pts) }
})

// OLS via 3x3 normal equations
function fit(pts: { x1: number, x2: number, y: number }[]) {
  const R = pts.map(p => [1, p.x1, p.x2])
  const A = [0, 1, 2].map(i => [0, 1, 2].map(j => R.reduce((s, r) => s + r[i] * r[j], 0)))
  const b = [0, 1, 2].map(i => R.reduce((s, r, k) => s + r[i] * pts[k].y, 0))
  const M = A.map((r, i) => [...r, b[i]])
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
  return M.map((r, i) => r[3] / r[i])
}

// ---------------- 3D view ----------------
const canvas = ref<HTMLCanvasElement>()
let yaw = -1.2
let pitch = 0.18
let auto = true
// camera presets: glide (yaw, pitch) to a target view
let tween: { y0: number, p0: number, y1: number, p1: number, t0: number } | null = null
const view = ref<'free' | 'elev' | 'top'>('free')
function goTo(v: 'free' | 'elev' | 'top') {
  view.value = v
  if (v === 'free') {
    tween = null
    auto = true
    return
  }
  auto = false
  const [y1, p1] = v === 'elev' ? [0, 0] : [-Math.PI / 4, Math.PI / 2 - 0.001]
  // shortest way round for yaw
  let dy = (y1 - yaw) % (2 * Math.PI)
  if (dy > Math.PI) dy -= 2 * Math.PI
  if (dy < -Math.PI) dy += 2 * Math.PI
  tween = { y0: yaw, p0: pitch, y1: yaw + dy, p1, t0: performance.now() }
}
let raf = 0
let drag: { x: number, y: number, yaw: number, pitch: number } | null = null

function project(x1: number, x2: number, y: number) {
  const u = x1 / 1.5
  const v = x2 / 1.5
  const w = y / 1.3
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const X_ = u * cy - v * sy
  const Y_ = u * sy + v * cy
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const s = Math.min(props.width * 0.25, props.height * 0.3)
  return [props.width / 2 + X_ * s, props.height * 0.46 - (w * cp - Y_ * sp) * s, Y_ * cp + w * sp]
}

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

  // shared floor = shared feature space (elevation x slope)
  const fl = [[-1.5, -1.5], [1.5, -1.5], [1.5, 1.5], [-1.5, 1.5]].map(([a, b]) => project(a, b, -1.6))
  ctx.fillStyle = 'rgba(0,69,124,0.05)'
  ctx.strokeStyle = '#b8c0c6'
  ctx.lineWidth = 1
  ctx.beginPath()
  fl.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = '#dde2e5'
  for (const g of [-0.75, 0, 0.75]) {
    const a = project(g, -1.5, -1.6)
    const b = project(g, 1.5, -1.6)
    const c2 = project(-1.5, g, -1.6)
    const d = project(1.5, g, -1.6)
    ctx.beginPath()
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.moveTo(c2[0], c2[1])
    ctx.lineTo(d[0], d[1])
    ctx.stroke()
  }
  ctx.strokeStyle = '#b8c0c6'
  const ax0 = project(-1.5, 1.5, -1.6)
  const ax1 = project(-1.5, 1.5, 1.6)
  ctx.beginPath()
  ctx.moveTo(ax0[0], ax0[1])
  ctx.lineTo(ax1[0], ax1[1])
  ctx.stroke()

  type Item = { d: number, draw: () => void }
  const items: Item[] = []
  const G = 8
  for (const t of targets) {
    const plane = (a: number, b: number) => t.coef[0] + t.coef[1] * a + t.coef[2] * b
    for (let i = 0; i < G; i++) {
      for (let j = 0; j < G; j++) {
        const a0 = -1.5 + 3 * i / G
        const a1 = -1.5 + 3 * (i + 1) / G
        const b0 = -1.5 + 3 * j / G
        const b1 = -1.5 + 3 * (j + 1) / G
        const q = [[a0, b0], [a1, b0], [a1, b1], [a0, b1]].map(([a, b]) => project(a, b, plane(a, b)))
        items.push({
          d: q.reduce((s, p) => s + p[2], 0) / 4,
          draw: () => {
            ctx.fillStyle = t.fill
            ctx.strokeStyle = t.edge
            ctx.beginPath()
            q.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
          },
        })
      }
    }
    for (const p of t.pts) {
      const a = project(p.x1, p.x2, p.y)
      const f = project(p.x1, p.x2, plane(p.x1, p.x2))
      const above = p.y >= plane(p.x1, p.x2)
      items.push({
        d: a[2] + (above ? 0.02 : -0.02),
        draw: () => {
          ctx.strokeStyle = '#9aa1a6'
          ctx.beginPath()
          ctx.moveTo(a[0], a[1])
          ctx.lineTo(f[0], f[1])
          ctx.stroke()
          // target 1: filled dot; target 2: ring -> where both share (x1, x2) the dot sits inside the ring
          ctx.beginPath()
          if (t.ring) {
            ctx.arc(a[0], a[1], 5.6, 0, 2 * Math.PI)
            ctx.strokeStyle = t.color
            ctx.lineWidth = 2
            ctx.stroke()
            ctx.lineWidth = 1
          }
          else {
            ctx.arc(a[0], a[1], 3.4, 0, 2 * Math.PI)
            ctx.fillStyle = t.color
            ctx.strokeStyle = '#fff'
            ctx.fill()
            ctx.stroke()
          }
        },
      })
    }
  }
  items.sort((a, b) => a.d - b.d).forEach(it => it.draw())

  // axis labels: both targets live over the same floor
  ctx.font = '600 11.5px "Exo 2", sans-serif'
  ctx.fillStyle = '#00457c'
  ctx.textAlign = 'center'
  const near = (a: number[], b: number[]) => (a[2] > b[2] ? a : b)
  const l1 = near(project(0, -1.95, -1.6), project(0, 1.95, -1.6))
  const l2 = near(project(-1.95, 0, -1.6), project(1.95, 0, -1.6))
  ctx.fillText('elevation x₁', l1[0], l1[1] + 12)
  ctx.fillText('slope x₂', l2[0], l2[1] + 12)
  ctx.font = '11px "Exo 2", sans-serif'
  ctx.fillStyle = '#666'
  if (pitch < 1.2) {
    const top = project(-1.5, 1.5, 1.6)
    ctx.fillText('target (standardized)', top[0], top[1] - 5)
  }
  else {
    ctx.font = '600 12px "Exo 2", sans-serif'
    ctx.fillStyle = '#00457c'
    ctx.fillText('same (x₁, x₂) for both targets', props.width / 2, 14)
  }
}

function loop() {
  if (tween && !drag) {
    const u = Math.min(1, (performance.now() - tween.t0) / 900)
    const e = u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2
    yaw = tween.y0 + (tween.y1 - tween.y0) * e
    pitch = tween.p0 + (tween.p1 - tween.p0) * e
    draw()
    if (u >= 1)
      tween = null
  }
  else if (auto && !drag && !document.hidden) {
    yaw += 0.004
    draw()
  }
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

const fmt = (v: number) => (v >= 0 ? `+ ${v.toFixed(2)}` : `− ${Math.abs(v).toFixed(2)}`)
const eq = (t: typeof targets[0], k: number) => `ŷ${k === 0 ? '₁' : '₂'} = ${t.coef[0].toFixed(2)} ${fmt(t.coef[1])} x₁ ${fmt(t.coef[2])} x₂`
</script>

<template>
  <div class="tpd select-none">
    <canvas
      ref="canvas"
      :style="{ width: `${width}px`, height: `${height}px`, cursor: 'grab', touchAction: 'none' }"
      @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up"
    />
    <div class="legend">
      <div class="views">
        <button :class="{ on: view === 'elev' }" @click.stop="goTo('elev')">elevation view</button>
        <button :class="{ on: view === 'top' }" @click.stop="goTo('top')">top view: x₁ × x₂</button>
        <button class="ghost" @click.stop="goTo('free')">rotate</button>
      </div>
      <div v-for="(t, k) in targets" :key="k" class="row">
        <span class="sw" :style="t.ring ? { border: `2px solid ${t.color}`, borderRadius: '50%' } : { background: t.color, borderRadius: '50%' }" />
        <div>
          <div class="nm" :style="{ color: t.color }">row {{ k + 1 }} of W: {{ t.label }}</div>
          <div class="eq" :style="{ color: t.color }">{{ eq(t, k) }}</div>
        </div>
      </div>
      <div class="note">same inputs x₁, x₂ (the floor) — two planes, two sets of weights</div>
    </div>
  </div>
</template>

<style scoped>
.tpd { display: flex; gap: 1.2rem; justify-content: center; align-items: center; }
.tpd .legend { display: flex; flex-direction: column; gap: .7rem; max-width: 250px; }
.tpd .row { display: flex; gap: .5rem; align-items: flex-start; }
.tpd .sw { width: 12px; height: 12px; border-radius: 3px; margin-top: 3px; flex: none; opacity: .85; }
.tpd .nm { font: 600 12px "Exo 2", sans-serif; }
.tpd .eq { font: italic 13px 'Times New Roman', serif; margin-top: 1px; }
.tpd .note { font: 11px "Exo 2", sans-serif; color: #666; }
.tpd .views { display: flex; flex-wrap: wrap; gap: .35rem; }
.tpd .views button { font: 600 11px "Exo 2", sans-serif; padding: .2rem .55rem; border-radius: 5px; border: 1px solid #00457c; background: #00457c; color: #fff; }
.tpd .views button.ghost { background: transparent; color: #00457c; }
.tpd .views button.on { background: #ff7900; border-color: #ff7900; }
</style>
