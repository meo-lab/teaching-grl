<script setup lang="ts">
// Classification seen as linear regression: one plane per class over the same features.
// Floor: NDVI x1 and green reflectance x2 (24 land-cover pixels, a subsample of land_cover_features.json).
// One-hot targets: vegetation -> (1, 0), urban -> (0, 1). Each target gets its own OLS plane;
// in the binary case the urban plane is exactly 1 - vegetation plane.
// Where the planes intersect, the predicted class flips: that line is the decision boundary.
// No probabilities here - purely linear regression on 0/1 targets.
//   step 1: vegetation target + plane   step 2: + urban target + plane   step 3: + decision boundary
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ width?: number, height?: number, step?: number }>(), { width: 470, height: 320, step: 3 })

// [ndvi, green, isVegetation]
const RAW: [number, number, number][] = [
  [0.346, 0.0404, 1], [0.612, 0.032, 1], [0.672, 0.027, 1], [0.633, 0.0342, 1], [0.608, 0.0227, 1], [0.718, 0.057, 1],
  [0.691, 0.0344, 1], [0.572, 0.0287, 1], [0.791, 0.016, 1], [0.45, 0.0315, 1], [0.612, 0.0241, 1], [0.726, 0.0205, 1],
  [0.126, 0.0906, 0], [0.286, 0.0345, 0], [0.215, 0.0614, 0], [0.023, 0.0807, 0], [0.1, 0.0697, 0], [0.174, 0.0596, 0],
  [0.131, 0.0498, 0], [0.263, 0.0562, 0], [0.096, 0.0798, 0], [0.306, 0.0542, 0], [0.09, 0.0643, 0], [0.393, 0.1018, 0],
]
const pts = RAW.map(([x1, x2, v]) => ({ x1, x2, veg: v === 1 }))

// OLS via 3x3 normal equations
function fit(y: number[]) {
  const R = pts.map(p => [1, p.x1, p.x2])
  const A = [0, 1, 2].map(i => [0, 1, 2].map(j => R.reduce((s, r) => s + r[i] * r[j], 0)))
  const b = [0, 1, 2].map(i => R.reduce((s, r, k) => s + r[i] * y[k], 0))
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

const CLASSES = [
  { key: 'veg', label: 'vegetation', sub: 'veg', color: '#2ca02c', fill: 'rgba(44,160,44,0.22)', edge: 'rgba(30,120,30,0.45)', region: 'rgba(44,160,44,0.16)', ring: false },
  { key: 'urb', label: 'urban', sub: 'urb', color: '#d62728', fill: 'rgba(214,39,40,0.20)', edge: 'rgba(170,30,30,0.45)', region: 'rgba(214,39,40,0.13)', ring: true },
].map((c, k) => {
  const y = pts.map(p => (p.veg === (k === 0) ? 1 : 0))
  return { ...c, y, coef: fit(y) }
})
const plane = (k: number, x1: number, x2: number) => CLASSES[k].coef[0] + CLASSES[k].coef[1] * x1 + CLASSES[k].coef[2] * x2
const predVeg = (x1: number, x2: number) => plane(0, x1, x2) >= plane(1, x1, x2)
const nCorrect = pts.filter(p => predVeg(p.x1, p.x2) === p.veg).length

// data -> cube coordinates
const X1 = [-0.05, 0.85]
const X2 = [0.01, 0.11]
const Z_FLOOR = -0.45
const Z_TOP = 1.45
const cu = (x1: number) => ((x1 - X1[0]) / (X1[1] - X1[0]) - 0.5) * 3
const cv = (x2: number) => ((x2 - X2[0]) / (X2[1] - X2[0]) - 0.5) * 3
const dx1 = (u: number) => X1[0] + (u / 3 + 0.5) * (X1[1] - X1[0])
const dx2 = (v: number) => X2[0] + (v / 3 + 0.5) * (X2[1] - X2[0])

// decision boundary: (w_veg - w_urb) . x + (b_veg - b_urb) = 0, clipped to the floor square (cube coords)
const boundary = (() => {
  const d = [0, 1, 2].map(i => CLASSES[0].coef[i] - CLASSES[1].coef[i])
  // in cube coords: d0 + d1*dx1(u) + d2*dx2(v) = 0 -> a*u + b*v + c = 0
  const a = d[1] * (X1[1] - X1[0]) / 3
  const b = d[2] * (X2[1] - X2[0]) / 3
  const c = d[0] + d[1] * (X1[0] + 0.5 * (X1[1] - X1[0])) + d[2] * (X2[0] + 0.5 * (X2[1] - X2[0]))
  const hits: number[][] = []
  for (const u of [-1.5, 1.5]) {
    const v = -(a * u + c) / b
    if (Math.abs(v) <= 1.5) hits.push([u, v])
  }
  for (const v of [-1.5, 1.5]) {
    const u = -(b * v + c) / a
    if (Math.abs(u) <= 1.5) hits.push([u, v])
  }
  return { a, b, c, seg: hits.slice(0, 2) }
})()

// ---------------- 3D view ----------------
const canvas = ref<HTMLCanvasElement>()
let yaw = -0.55
let pitch = 0.32
let auto = true
let tween: { y0: number, p0: number, y1: number, p1: number, t0: number } | null = null
const view = ref<'free' | 'side' | 'top'>('free')
// yaw at which we look exactly along the boundary line, vegetation on the right
const sideYaw = (() => {
  const { a, b } = boundary
  let y = Math.atan2(-b, a) // direction of the line (du, dv) = (-b, a) -> X_ = du cos - dv sin = 0
  y = Math.atan2(Math.sin(y), Math.cos(y))
  // normal (a, b) points to where ŷ_veg > ŷ_urb; make vegetation appear on the right
  const nx = a * Math.cos(y) - b * Math.sin(y)
  return nx > 0 ? y : y + Math.PI
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
let raf = 0
let drag: { x: number, y: number, yaw: number, pitch: number } | null = null

function project(u: number, v: number, z: number) {
  const w = (z - 0.5) / 0.85
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const X_ = (u * cy - v * sy) / 1.5
  const Y_ = (u * sy + v * cy) / 1.5
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const s = Math.min(props.width * 0.27, props.height * 0.32)
  return [props.width / 2 + X_ * s, props.height * 0.48 - (w * cp - Y_ * sp) * s, Y_ * cp + w * sp]
}
const P = (x1: number, x2: number, z: number) => project(cu(x1), cv(x2), z)

function poly(ctx: CanvasRenderingContext2D, q: number[][]) {
  ctx.beginPath()
  q.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
  ctx.closePath()
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
  const step = props.step
  const nPlanes = step >= 2 ? 2 : 1

  // floor = feature space; from step 3 it is coloured by the predicted class
  const fl = [[-1.5, -1.5], [1.5, -1.5], [1.5, 1.5], [-1.5, 1.5]].map(([a, b]) => project(a, b, Z_FLOOR))
  ctx.fillStyle = 'rgba(0,69,124,0.04)'
  poly(ctx, fl)
  ctx.fill()
  if (step >= 3) {
    const G = 30
    for (let i = 0; i < G; i++) {
      for (let j = 0; j < G; j++) {
        const u = -1.5 + 3 * (i + 0.5) / G
        const v = -1.5 + 3 * (j + 0.5) / G
        const veg = predVeg(dx1(u), dx2(v))
        const q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([a, b]) => project(-1.5 + 3 * a / G, -1.5 + 3 * b / G, Z_FLOOR))
        ctx.fillStyle = CLASSES[veg ? 0 : 1].region
        poly(ctx, q)
        ctx.fill()
      }
    }
  }
  ctx.strokeStyle = '#b8c0c6'
  ctx.lineWidth = 1
  poly(ctx, fl)
  ctx.stroke()
  ctx.strokeStyle = '#dde2e5'
  for (const g of [-0.75, 0, 0.75]) {
    const a = project(g, -1.5, Z_FLOOR)
    const b = project(g, 1.5, Z_FLOOR)
    const c2 = project(-1.5, g, Z_FLOOR)
    const d = project(1.5, g, Z_FLOOR)
    ctx.beginPath()
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.moveTo(c2[0], c2[1])
    ctx.lineTo(d[0], d[1])
    ctx.stroke()
  }
  // vertical target axis with ticks 0 and 1
  const corner = [-1.5, 1.5]
  const ax0 = project(corner[0], corner[1], Z_FLOOR)
  const ax1 = project(corner[0], corner[1], Z_TOP)
  ctx.strokeStyle = '#b8c0c6'
  ctx.beginPath()
  ctx.moveTo(ax0[0], ax0[1])
  ctx.lineTo(ax1[0], ax1[1])
  ctx.stroke()
  if (pitch < 1.2) {
    ctx.font = '11px "Exo 2", sans-serif'
    ctx.fillStyle = '#666'
    ctx.textAlign = 'right'
    for (const t of [0, 1]) {
      const p = project(corner[0], corner[1], t)
      ctx.beginPath()
      ctx.moveTo(p[0] - 3, p[1])
      ctx.lineTo(p[0] + 3, p[1])
      ctx.stroke()
      ctx.fillText(String(t), p[0] - 6, p[1] + 4)
    }
  }

  // planes + targets, depth-sorted
  type Item = { d: number, draw: () => void }
  const items: Item[] = []
  const G = 12
  for (let k = 0; k < nPlanes; k++) {
    const t = CLASSES[k]
    for (let i = 0; i < G; i++) {
      for (let j = 0; j < G; j++) {
        const q = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([a, b]) => {
          const u = -1.5 + 3 * a / G
          const v = -1.5 + 3 * b / G
          return project(u, v, plane(k, dx1(u), dx2(v)))
        })
        items.push({
          d: q.reduce((s, p) => s + p[2], 0) / 4,
          draw: () => {
            ctx.fillStyle = t.fill
            ctx.strokeStyle = t.edge
            poly(ctx, q)
            ctx.fill()
            ctx.stroke()
          },
        })
      }
    }
    pts.forEach((p, n) => {
      const z = t.y[n]
      // seen from above, the 0-targets would hide which class a pixel belongs to
      if (pitch > 1.2 && z === 0)
        return
      const a = P(p.x1, p.x2, z)
      const f = P(p.x1, p.x2, plane(k, p.x1, p.x2))
      const above = z >= plane(k, p.x1, p.x2)
      items.push({
        d: a[2] + (above ? 0.02 : -0.02),
        draw: () => {
          ctx.strokeStyle = '#9aa1a6'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(a[0], a[1])
          ctx.lineTo(f[0], f[1])
          ctx.stroke()
          ctx.beginPath()
          if (t.ring) {
            ctx.arc(a[0], a[1], 5.2, 0, 2 * Math.PI)
            ctx.strokeStyle = t.color
            ctx.lineWidth = 2
            ctx.stroke()
            ctx.lineWidth = 1
          }
          else {
            ctx.arc(a[0], a[1], 3.6, 0, 2 * Math.PI)
            ctx.fillStyle = t.color
            ctx.strokeStyle = '#fff'
            ctx.fill()
            ctx.stroke()
          }
        },
      })
    })
  }
  // decision boundary: where the two planes intersect (+ its shadow on the floor)
  if (step >= 3 && boundary.seg.length === 2) {
    const [s0, s1] = boundary.seg
    const N = 12
    for (let i = 0; i < N; i++) {
      const u0 = s0[0] + (s1[0] - s0[0]) * i / N
      const v0 = s0[1] + (s1[1] - s0[1]) * i / N
      const u1 = s0[0] + (s1[0] - s0[0]) * (i + 1) / N
      const v1 = s0[1] + (s1[1] - s0[1]) * (i + 1) / N
      const a = project(u0, v0, plane(0, dx1(u0), dx2(v0)))
      const b = project(u1, v1, plane(0, dx1(u1), dx2(v1)))
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
  }
  items.sort((a, b) => a.d - b.d).forEach(it => it.draw())

  if (step >= 3 && boundary.seg.length === 2) {
    const [s0, s1] = boundary.seg
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

  // axis labels
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
    ctx.fillText('target y', ax1[0], ax1[1] - 6)
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
    yaw += 0.003
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
watch(() => props.step, () => draw())
onMounted(() => {
  draw()
  raf = requestAnimationFrame(loop)
})
onUnmounted(() => cancelAnimationFrame(raf))

const fmt = (v: number) => (v >= 0 ? `+ ${v.toFixed(2)}` : `− ${Math.abs(v).toFixed(2)}`)
const eq = (k: number) => {
  const c = CLASSES[k].coef
  return `ŷ<sub>${CLASSES[k].sub}</sub> = ${c[0].toFixed(2)} ${fmt(c[1])} x₁ ${fmt(c[2])} x₂`
}
const shown = computed(() => CLASSES.slice(0, props.step >= 2 ? 2 : 1))
</script>

<template>
  <div class="cpd select-none">
    <canvas
      ref="canvas"
      :style="{ width: `${width}px`, height: `${height}px`, cursor: 'grab', touchAction: 'none' }"
      @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up"
    />
    <div class="legend">
      <div class="views">
        <button :class="{ on: view === 'side' }" @click.stop="goTo('side')">look along boundary</button>
        <button :class="{ on: view === 'top' }" @click.stop="goTo('top')">top view: x₁ × x₂</button>
        <button class="ghost" @click.stop="goTo('free')">rotate</button>
      </div>
      <div class="note">one-hot targets: vegetation → (1, 0), urban → (0, 1)</div>
      <div v-for="(t, k) in shown" :key="t.key" class="row">
        <span class="sw" :style="t.ring ? { border: `2px solid ${t.color}`, borderRadius: '50%' } : { background: t.color, borderRadius: '50%' }" />
        <div>
          <div class="nm" :style="{ color: t.color }">plane {{ k + 1 }}: is it {{ t.label }}?</div>
          <div class="eq" :style="{ color: t.color }" v-html="eq(k)" />
          <div v-if="k === 1" class="note">binary case: ŷ<sub>urb</sub> = 1 − ŷ<sub>veg</sub></div>
        </div>
      </div>
      <div v-if="step >= 3" class="row">
        <span class="sw line" />
        <div>
          <div class="nm" style="color:#00457c">decision boundary: ŷ<sub>veg</sub> = ŷ<sub>urb</sub></div>
          <div class="note">predict the class whose plane is higher → {{ nCorrect }}/{{ pts.length }} pixels correct</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cpd { display: flex; gap: 1.2rem; justify-content: center; align-items: center; }
.cpd .legend { display: flex; flex-direction: column; gap: .6rem; max-width: 285px; }
.cpd .row { display: flex; gap: .5rem; align-items: flex-start; }
.cpd .sw { width: 12px; height: 12px; margin-top: 3px; flex: none; opacity: .85; }
.cpd .sw.line { height: 3px; margin-top: 8px; background: #00457c; }
.cpd .nm { font: 600 12px "Exo 2", sans-serif; }
.cpd .eq { font: italic 13px 'Times New Roman', serif; margin-top: 1px; }
.cpd .note { font: 11px "Exo 2", sans-serif; color: #666; }
.cpd .views { display: flex; flex-wrap: wrap; gap: .35rem; }
.cpd .views button { font: 600 11px "Exo 2", sans-serif; padding: .2rem .55rem; border-radius: 5px; border: 1px solid #00457c; background: #00457c; color: #fff; }
.cpd .views button.ghost { background: transparent; color: #00457c; }
.cpd .views button.on { background: #ff7900; border-color: #ff7900; }
</style>
