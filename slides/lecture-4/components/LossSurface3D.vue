<script setup lang="ts">
// Rotatable 3D loss surface (canvas, no external libraries).
// Drag to rotate; it slowly auto-rotates until touched.
import { onMounted, onUnmounted, ref } from 'vue'
import { LIN_OLS, LIN_RANGE, LOG_RANGE, linLoss, logLoss, viridis } from '../lib/lossSurface'

const props = withDefaults(defineProps<{
  surface?: 'lin-mse' | 'lin-mae' | 'log-bce'
  width?: number
  height?: number
  title?: string
  autoRotate?: boolean
  yaw?: number
  pitch?: number
  range?: number // log-bce only: weights shown in [-range, range] (default LOG_RANGE)
  markFlat?: number // log-bce only: highlight where the loss is below this value
}>(), {
  surface: 'lin-mse',
  width: 360,
  height: 300,
  title: '',
  autoRotate: true,
  yaw: -0.75,
  pitch: 0.62,
})

const cfg = {
  'lin-mse': { f: (a: number, b: number) => linLoss(b, a, 'mse'), xr: LIN_RANGE.b1, yr: LIN_RANGE.b0, xl: 'w (slope)', yl: 'b (bias)', opt: [LIN_OLS.b1, LIN_OLS.b0] },
  'lin-mae': { f: (a: number, b: number) => linLoss(b, a, 'mae'), xr: LIN_RANGE.b1, yr: LIN_RANGE.b0, xl: 'w (slope)', yl: 'b (bias)', opt: null },
  'log-bce': { f: (a: number, b: number) => logLoss(a, b), xr: props.range ? [-props.range, props.range] : LOG_RANGE.w1, yr: props.range ? [-props.range, props.range] : LOG_RANGE.w2, xl: 'w₁', yl: 'w₂', opt: null },
}[props.surface]

const N = props.markFlat ? 60 : 44
const Z: number[][] = []
let zlo = Infinity
let zhi = -Infinity
for (let j = 0; j <= N; j++) {
  const row: number[] = []
  for (let i = 0; i <= N; i++) {
    const a = cfg.xr[0] + i / N * (cfg.xr[1] - cfg.xr[0])
    const b = cfg.yr[0] + j / N * (cfg.yr[1] - cfg.yr[0])
    const v = cfg.f(a, b)
    row.push(v)
    zlo = Math.min(zlo, v)
    zhi = Math.max(zhi, v)
  }
  Z.push(row)
}

const canvas = ref<HTMLCanvasElement>()
let yaw = props.yaw
let pitch = props.pitch
let raf = 0
let auto = props.autoRotate
let drag: { x: number, y: number, yaw: number, pitch: number } | null = null

// unit cube coords: u,v in [-1,1], w in [0,1.15]
function project(u: number, v: number, w: number) {
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const x = u * cy - v * sy
  const y = u * sy + v * cy
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const zz = w * 0.85 - 0.42
  const sx = x
  const syy = -(zz * cp - y * sp)
  const depth = y * cp + zz * sp
  const s = Math.min(props.width * 0.3, props.height * 0.36)
  return [props.width / 2 + sx * s, props.height * 0.52 + syy * s, depth]
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

  const quads: { d: number, p: number[][], t: number, flat: boolean }[] = []
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const corners = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]]
      const pts = corners.map(([a, b]) => project(a / N * 2 - 1, b / N * 2 - 1, (Z[b][a] - zlo) / (zhi - zlo)))
      const t = ((Z[j][i] + Z[j][i + 1] + Z[j + 1][i] + Z[j + 1][i + 1]) / 4 - zlo) / (zhi - zlo)
      const flat = props.markFlat != null && Math.max(Z[j][i], Z[j][i + 1], Z[j + 1][i], Z[j + 1][i + 1]) < props.markFlat
      quads.push({ d: pts.reduce((s, p) => s + p[2], 0) / 4, p: pts, t, flat })
    }
  }
  // floor box edges (behind)
  ctx.strokeStyle = '#c9ced1'
  ctx.lineWidth = 1
  const floor = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => project(u, v, 0))
  ctx.beginPath()
  floor.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
  ctx.closePath()
  ctx.stroke()

  // depth grows toward the viewer: paint far quads first
  quads.sort((a, b) => a.d - b.d)
  for (const q of quads) {
    const [r, g, b] = viridis(q.t)
    ctx.fillStyle = q.flat ? '#ff9d4d' : `rgb(${r | 0},${g | 0},${b | 0})`
    ctx.strokeStyle = q.flat ? 'rgba(255,255,255,0.35)' : `rgba(255,255,255,0.18)`
    ctx.beginPath()
    q.p.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }
  if (cfg.opt) {
    const u = (cfg.opt[0] - cfg.xr[0]) / (cfg.xr[1] - cfg.xr[0]) * 2 - 1
    const v = (cfg.opt[1] - cfg.yr[0]) / (cfg.yr[1] - cfg.yr[0]) * 2 - 1
    const p = project(u, v, (cfg.f(cfg.opt[0], cfg.opt[1]) - zlo) / (zhi - zlo))
    ctx.fillStyle = '#ff7900'
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(p[0], p[1], 5, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  }
  // label the flat region at its (projected) centre
  if (props.markFlat != null) {
    const fl = quads.filter(q => q.flat)
    if (fl.length) {
      const cx = fl.reduce((s, q) => s + (q.p[0][0] + q.p[2][0]) / 2, 0) / fl.length
      const cy = fl.reduce((s, q) => s + (q.p[0][1] + q.p[2][1]) / 2, 0) / fl.length
      ctx.font = '600 12px "Exo 2", sans-serif'
      ctx.textAlign = 'center'
      ctx.lineWidth = 3
      ctx.strokeStyle = '#fff'
      ctx.fillStyle = '#b35500'
      ctx.strokeText('flat: loss ≈ 0', cx, cy - 4)
      ctx.fillText('flat: loss ≈ 0', cx, cy - 4)
      ctx.strokeText('no single minimum', cx, cy + 11)
      ctx.fillText('no single minimum', cx, cy + 11)
      ctx.lineWidth = 1
    }
  }
  // vertical loss axis at the back corner (smallest depth)
  {
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
    const back = corners.map(([u, v]) => ({ u, v, d: project(u, v, 0)[2] })).sort((a, b) => a.d - b.d)[0]
    const a0 = project(back.u, back.v, 0)
    const a1 = project(back.u, back.v, 1.3)
    ctx.strokeStyle = '#8b8f8d'
    ctx.fillStyle = '#8b8f8d'
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(a0[0], a0[1])
    ctx.lineTo(a1[0], a1[1])
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(a1[0], a1[1] - 6)
    ctx.lineTo(a1[0] - 4, a1[1] + 2)
    ctx.lineTo(a1[0] + 4, a1[1] + 2)
    ctx.closePath()
    ctx.fill()
    ctx.lineWidth = 1
    ctx.font = '600 12px "Exo 2", sans-serif'
    ctx.fillStyle = '#00457c'
    ctx.textAlign = 'center'
    ctx.fillText('loss', a1[0], a1[1] - 10)
  }
  // axis labels at floor edge midpoints
  ctx.font = '11px "Exo 2", sans-serif'
  ctx.fillStyle = '#444'
  ctx.textAlign = 'center'
  // put each axis label on the floor edge nearest to the viewer (larger depth)
  const near = (a: number[], b: number[]) => (a[2] > b[2] ? a : b)
  const lx = near(project(0, -1.4, -0.05), project(0, 1.4, -0.05))
  const ly = near(project(-1.4, 0, -0.05), project(1.4, 0, -0.05))
  ctx.fillText(cfg.xl, lx[0], lx[1] + 10)
  ctx.fillText(cfg.yl, ly[0], ly[1] + 10)
}

function loop() {
  if (auto && !drag && !document.hidden) {
    yaw += 0.006
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
  pitch = Math.min(1.45, Math.max(0.05, drag.pitch + (e.clientY - drag.y) * 0.01))
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
  <div class="ls3d">
    <div v-if="title" class="ttl">{{ title }}</div>
    <canvas
      ref="canvas"
      :style="{ width: `${width}px`, height: `${height}px`, cursor: 'grab', touchAction: 'none' }"
      @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up"
    />
  </div>
</template>

<style scoped>
.ls3d { display: flex; flex-direction: column; align-items: center; }
.ls3d .ttl { font: 600 12px "Exo 2", sans-serif; color: #00457c; }
</style>
