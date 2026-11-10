<script setup lang="ts">
// One feature -> a line in 2D; two features -> a plane in 3D.
// Left: univariate OLS fit (elevation only). Right: bivariate OLS plane
// (elevation + slope), drag to rotate. Same synthetic data on both sides.
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { mulberry32 } from '../lib/lossSurface'

const props = withDefaults(defineProps<{ width?: number, height?: number }>(), { width: 330, height: 250 })

// ---------------- data: temperature ~ elevation + slope ----------------
function gauss(r: () => number) {
  return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r())
}
const rng = mulberry32(21)
const pts = Array.from({ length: 36 }, () => {
  const x1 = -1.3 + 2.6 * rng()
  const x2 = -1.3 + 2.6 * rng()
  return { x1, x2, y: 0.1 - 0.5 * x1 + 0.45 * x2 + 0.12 * gauss(rng) }
})
const n = pts.length
const mean = (f: (p: typeof pts[0]) => number) => pts.reduce((s, p) => s + f(p), 0) / n
const my = mean(p => p.y)
const tss = pts.reduce((s, p) => s + (p.y - my) ** 2, 0)

// univariate OLS
const m1 = mean(p => p.x1)
const b1u = pts.reduce((s, p) => s + (p.x1 - m1) * (p.y - my), 0) / pts.reduce((s, p) => s + (p.x1 - m1) ** 2, 0)
const b0u = my - b1u * m1
const r2u = 1 - pts.reduce((s, p) => s + (p.y - b0u - b1u * p.x1) ** 2, 0) / tss

// bivariate OLS via normal equations (3x3)
function solve3(A: number[][], b: number[]) {
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
const X = pts.map(p => [1, p.x1, p.x2])
const XtX = [0, 1, 2].map(i => [0, 1, 2].map(j => X.reduce((s, r) => s + r[i] * r[j], 0)))
const Xty = [0, 1, 2].map(i => X.reduce((s, r, k) => s + r[i] * pts[k].y, 0))
const [c0, c1, c2] = solve3(XtX, Xty)
const plane = (x1: number, x2: number) => c0 + c1 * x1 + c2 * x2
const r2p = 1 - pts.reduce((s, p) => s + (p.y - plane(p.x1, p.x2)) ** 2, 0) / tss

// ---------------- 2D panel ----------------
const S = 210
const pad = { l: 40, t: 22, b: 34 }
const W2 = pad.l + S + 14
const H2 = pad.t + S + pad.b
const R: [number, number] = [-1.6, 1.6]
const sx = (x: number) => pad.l + (x - R[0]) / (R[1] - R[0]) * S
const sy = (y: number) => pad.t + (R[1] - y) / (R[1] - R[0]) * S
const ticks = [-1, 0, 1]

// ---------------- 3D panel ----------------
const canvas = ref<HTMLCanvasElement>()
let yaw = -0.5
let pitch = 0.12
let auto = true
let raf = 0
let drag: { x: number, y: number, yaw: number, pitch: number } | null = null

function project(x1: number, x2: number, y: number) {
  // feature axes on the floor, target y vertical; data range ~[-1.5, 1.5]
  const u = x1 / 1.5
  const v = x2 / 1.5
  const w = y / 1.3
  const cy = Math.cos(yaw)
  const sy_ = Math.sin(yaw)
  const X_ = u * cy - v * sy_
  const Y_ = u * sy_ + v * cy
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const s = Math.min(props.width * 0.3, props.height * 0.36)
  return [props.width / 2 + X_ * s, props.height * 0.52 - (w * cp - Y_ * sp) * s, Y_ * cp + w * sp]
}

function draw() {
  const c = canvas.value
  if (!c)
    return
  const dpr = window.devicePixelRatio || 1
  if (c.width !== props.width * dpr) {
    c.width = props.width * dpr
    c.height = props.height * dpr
  }
  const ctx = c.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, props.width, props.height)

  // floor frame + axis labels
  ctx.strokeStyle = '#c9ced1'
  ctx.lineWidth = 1
  const fl = [[-1.5, -1.5], [1.5, -1.5], [1.5, 1.5], [-1.5, 1.5]].map(([a, b]) => project(a, b, -1.6))
  ctx.beginPath()
  fl.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
  ctx.closePath()
  ctx.stroke()

  const ax0 = project(-1.5, 1.5, -1.6)
  const ax1 = project(-1.5, 1.5, 1.6)
  ctx.beginPath()
  ctx.moveTo(ax0[0], ax0[1])
  ctx.lineTo(ax1[0], ax1[1])
  ctx.stroke()

  type Item = { d: number, draw: () => void }
  const items: Item[] = []
  const G = 8
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
          ctx.fillStyle = 'rgba(0,69,124,0.16)'
          ctx.strokeStyle = 'rgba(0,69,124,0.35)'
          ctx.beginPath()
          q.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
          ctx.closePath()
          ctx.fill()
          ctx.stroke()
        },
      })
    }
  }
  for (const p of pts) {
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
        ctx.fillStyle = '#ff7900'
        ctx.strokeStyle = '#fff'
        ctx.beginPath()
        ctx.arc(a[0], a[1], 3.6, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
      },
    })
  }
  items.sort((a, b) => a.d - b.d).forEach(it => it.draw())

  ctx.font = '11px "Exo 2", sans-serif'
  ctx.fillStyle = '#444'
  ctx.textAlign = 'center'
  const near = (a: number[], b: number[]) => (a[2] > b[2] ? a : b)
  const l1 = near(project(0, -1.95, -1.6), project(0, 1.95, -1.6))
  const l2 = near(project(-1.95, 0, -1.6), project(1.95, 0, -1.6))
  ctx.fillText('elevation x₁', l1[0], l1[1] + 10)
  ctx.fillText('slope x₂', l2[0], l2[1] + 10)
  const top = project(-1.5, 1.5, 1.6)
  ctx.fillText('temperature y', top[0], top[1] - 4)
}

function loop() {
  if (auto && !drag && !document.hidden) {
    yaw += 0.005
    draw()
  }
  raf = requestAnimationFrame(loop)
}
function down(e: PointerEvent) {
  e.stopPropagation()
  auto = false
  drag = { x: e.clientX, y: e.clientY, yaw, pitch }
  ;(e.target as Element).setPointerCapture(e.pointerId)
}
function move(e: PointerEvent) {
  if (!drag)
    return
  yaw = drag.yaw - (e.clientX - drag.x) * 0.01
  pitch = Math.min(1.4, Math.max(-0.2, drag.pitch + (e.clientY - drag.y) * 0.01))
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
const eqLine = computed(() => `ŷ = ${b0u.toFixed(2)} ${fmt(b1u)} x₁`)
const eqPlane = computed(() => `ŷ = ${c0.toFixed(2)} ${fmt(c1)} x₁ ${fmt(c2)} x₂`)
</script>

<template>
  <div class="rpd select-none">
    <div class="col">
      <div class="ttl">1 feature → a line in 2D</div>
      <svg :viewBox="`0 0 ${W2} ${H2}`" :style="{ width: `${width * 0.85}px` }">
        <rect :x="pad.l" :y="pad.t" :width="S" :height="S" class="frame" />
        <line v-for="t in ticks" :key="`g${t}`" :x1="sx(t)" :x2="sx(t)" :y1="pad.t" :y2="pad.t + S" class="grid" />
        <line v-for="t in ticks" :key="`h${t}`" :y1="sy(t)" :y2="sy(t)" :x1="pad.l" :x2="pad.l + S" class="grid" />
        <line v-for="(p, i) in pts" :key="`r${i}`" :x1="sx(p.x1)" :x2="sx(p.x1)" :y1="sy(p.y)" :y2="sy(b0u + b1u * p.x1)" class="res" />
        <line :x1="sx(R[0])" :y1="sy(b0u + b1u * R[0])" :x2="sx(R[1])" :y2="sy(b0u + b1u * R[1])" class="fit" />
        <circle v-for="(p, i) in pts" :key="i" :cx="sx(p.x1)" :cy="sy(p.y)" r="3.6" class="pt" />
        <text v-for="t in ticks" :key="`a${t}`" :x="sx(t)" :y="pad.t + S + 13" class="tick">{{ t }}</text>
        <text v-for="t in ticks" :key="`b${t}`" :x="pad.l - 6" :y="sy(t) + 3.5" class="tick" text-anchor="end">{{ t }}</text>
        <text :x="pad.l + S / 2" :y="pad.t + S + 28" class="lab">elevation x₁</text>
        <text :transform="`translate(${pad.l - 26},${pad.t + S / 2}) rotate(-90)`" class="lab">temperature y</text>
      </svg>
      <div class="eq">{{ eqLine }} · R² = {{ r2u.toFixed(2) }}</div>
    </div>
    <div class="col">
      <div class="ttl">2 features → a plane in 3D</div>
      <canvas
        ref="canvas"
        :style="{ width: `${width}px`, height: `${height}px`, cursor: 'grab', touchAction: 'none' }"
        @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up"
      />
      <div class="eq">{{ eqPlane }} · R² = {{ r2p.toFixed(2) }}</div>
    </div>
  </div>
</template>

<style scoped>
.rpd { display: flex; gap: 1.2rem; justify-content: center; align-items: flex-start; }
.rpd .col { display: flex; flex-direction: column; align-items: center; }
.rpd .ttl { font: 600 12px "Exo 2", sans-serif; color: #00457c; margin-bottom: 2px; }
.rpd .eq { font: italic 12px 'Times New Roman', serif; color: #222; margin-top: 2px; }
.rpd .frame { fill: none; stroke: #9aa1a6; }
.rpd .grid { stroke: #eceeef; }
.rpd .res { stroke: #9aa1a6; stroke-width: 1; }
.rpd .fit { stroke: #00457c; stroke-width: 2.4; }
.rpd .pt { fill: #ff7900; stroke: #fff; stroke-width: 1; }
.rpd .tick { font: 9.5px "Exo 2", sans-serif; fill: #666; text-anchor: middle; }
.rpd .lab { font: 11px "Exo 2", sans-serif; fill: #444; text-anchor: middle; }
</style>
