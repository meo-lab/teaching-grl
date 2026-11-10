<script setup lang="ts">
// A linear transformation R^3 -> R^2: input space (elevation, slope, aspect) -> output space (temperature, snow depth).
// Left: input points as a rotatable 3D cloud. Right: the same points after y = W x + b.
// Points are coloured by elevation so they can be followed across; hover highlights one sample in both spaces.
// Arrows in the output space show where each input axis lands: the columns of W.
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { mulberry32, viridis } from '../lib/lossSurface'

const props = withDefaults(defineProps<{ size?: number }>(), { size: 250 })

// ---------------- data + map ----------------
const W = [
  [-0.7, 0.4, -0.15], // temperature: mostly elevation (colder up high), warmer on steep sunny slopes
  [0.3, -0.15, 0.7], // snow depth: mostly aspect (north-facing slopes keep snow), more up high
]
const B = [0.1, -0.05]
const FEAT = ['elevation', 'slope', 'aspect']
const rng = mulberry32(5)
const pts = Array.from({ length: 40 }, () => {
  const x = [-1.2 + 2.4 * rng(), -1.2 + 2.4 * rng(), -1.2 + 2.4 * rng()]
  const y = W.map((row, i) => row.reduce((s, w, j) => s + w * x[j], B[i]))
  // lib viridis has yellow at t = 0; flip so dark = low elevation, yellow = high
  const [r, g, b] = viridis(1 - (x[0] + 1.2) / 2.4)
  return { x, y, col: `rgb(${r},${g},${b})` }
})
const hover = ref<number | null>(null)

// ---------------- input space (3D canvas) ----------------
const canvas = ref<HTMLCanvasElement>()
const S = computed(() => props.size)
let yaw = -0.7
let pitch = 0.35
let auto = true
let raf = 0
let drag: { x: number, y: number, yaw: number, pitch: number } | null = null
let proj: number[][] = []

function project(a: number, b: number, c: number) {
  // elevation, slope on the floor; aspect vertical
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const X_ = a * cy - b * sy
  const Y_ = a * sy + b * cy
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const s = S.value * 0.2
  return [S.value / 2 + X_ * s, S.value * 0.5 - (c * cp - Y_ * sp) * s, Y_ * cp + c * sp]
}

function draw() {
  const c = canvas.value
  if (!c)
    return
  const dpr = window.devicePixelRatio || 1
  const n = S.value * dpr
  if (c.width !== n || c.height !== n) {
    c.width = n
    c.height = n
  }
  const ctx = c.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, S.value, S.value)

  // wireframe cube
  const L = 1.4
  const corners = [-L, L]
  ctx.strokeStyle = '#dde2e5'
  ctx.lineWidth = 1
  for (const a of corners) {
    for (const b of corners) {
      const seg = [[[a, b, -L], [a, b, L]], [[a, -L, b], [a, L, b]], [[-L, a, b], [L, a, b]]]
      for (const [p, q] of seg) {
        const P = project(p[0], p[1], p[2])
        const Q = project(q[0], q[1], q[2])
        ctx.beginPath()
        ctx.moveTo(P[0], P[1])
        ctx.lineTo(Q[0], Q[1])
        ctx.stroke()
      }
    }
  }
  // the three input axes from the corner
  const o = project(-L, -L, -L)
  const ends = [project(L + 0.25, -L, -L), project(-L, L + 0.25, -L), project(-L, -L, L + 0.25)]
  ctx.strokeStyle = '#00457c'
  ctx.lineWidth = 1.6
  ctx.font = '600 11px "Exo 2", sans-serif'
  ctx.fillStyle = '#00457c'
  ctx.textAlign = 'center'
  ends.forEach((e, k) => {
    ctx.beginPath()
    ctx.moveTo(o[0], o[1])
    ctx.lineTo(e[0], e[1])
    ctx.stroke()
    ctx.fillText(`${FEAT[k]} x${'₁₂₃'[k]}`, Math.min(S.value - 30, Math.max(30, e[0] + (e[0] - o[0]) * 0.1)), Math.min(S.value - 4, Math.max(12, e[1] + (e[1] - o[1]) * 0.1 + 4)))
  })

  proj = pts.map(p => project(p.x[0], p.x[1], p.x[2]))
  const order = proj.map((p, i) => i).sort((a, b) => proj[a][2] - proj[b][2])
  for (const i of order) {
    const [px, py] = proj[i]
    const h = hover.value === i
    ctx.beginPath()
    ctx.arc(px, py, h ? 7 : 4.2, 0, 2 * Math.PI)
    ctx.fillStyle = pts[i].col
    ctx.fill()
    ctx.strokeStyle = h ? '#ff7900' : '#fff'
    ctx.lineWidth = h ? 2.5 : 1
    ctx.stroke()
  }
}

function loop() {
  if (auto && !drag && !document.hidden) {
    yaw += 0.004
    draw()
  }
  raf = requestAnimationFrame(loop)
}
function localXY(e: PointerEvent) {
  const r = canvas.value!.getBoundingClientRect()
  return [(e.clientX - r.left) * S.value / r.width, (e.clientY - r.top) * S.value / r.height]
}
function down(e: PointerEvent) {
  e.stopPropagation()
  auto = false
  drag = { x: e.clientX, y: e.clientY, yaw, pitch }
  ;(e.target as Element).setPointerCapture(e.pointerId)
}
function move(e: PointerEvent) {
  if (drag) {
    yaw = drag.yaw - (e.clientX - drag.x) * 0.01
    pitch = Math.min(1.5, Math.max(-0.3, drag.pitch + (e.clientY - drag.y) * 0.01))
    draw()
    return
  }
  const [mx, my] = localXY(e)
  let best = -1
  let bd = 9
  proj.forEach((p, i) => {
    const d = Math.hypot(p[0] - mx, p[1] - my)
    if (d < bd) {
      bd = d
      best = i
    }
  })
  hover.value = best >= 0 ? best : null
  draw()
}
function up() {
  drag = null
}
function leave() {
  if (!drag) {
    hover.value = null
    draw()
  }
}
onMounted(() => {
  draw()
  raf = requestAnimationFrame(loop)
})
onUnmounted(() => cancelAnimationFrame(raf))

// ---------------- output space (2D svg) ----------------
const pad = 34
const R = 1.6
const ox = (v: number) => pad + (v + R) / (2 * R) * (S.value - pad - 10)
const oy = (v: number) => 10 + (R - v) / (2 * R) * (S.value - pad - 10)
const ticks = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5]
// images of the unit input axes: b + W e_j  (the columns of W)
const axes = computed(() => FEAT.map((f, j) => ({ f, j, x: B[0] + W[0][j], y: B[1] + W[1][j] })))
const fmt = (v: number) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(2)
const hp = computed(() => (hover.value === null ? null : pts[hover.value]))
function setHover(i: number | null) {
  hover.value = i
  draw()
}
</script>

<template>
  <div class="lmd select-none">
    <div class="col">
      <div class="ttl">input space ℝ³</div>
      <canvas
        ref="canvas"
        :style="{ width: `${size}px`, height: `${size}px`, cursor: 'grab', touchAction: 'none' }"
        @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up" @pointerleave="leave"
      />
      <div class="hint">drag to rotate · hover a point</div>
      <div class="cbar"><span>colour = elevation: low</span><i /><span>high</span></div>
    </div>

    <div class="mid">
      <div class="map">ŷ = <b>W</b>x + <b>b</b></div>
      <table class="mat">
        <tbody>
          <tr v-for="(row, i) in W" :key="i" :style="{ color: i === 0 ? '#ff7900' : '#7b3fa0' }">
            <td v-for="(w, j) in row" :key="j">{{ fmt(w) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="shape">W ∈ ℝ<sup>2×3</sup></div>
      <div class="arrow">⟶</div>
      <div v-if="hp" class="sample">
        x = ({{ hp.x.map(v => fmt(v)).join(', ') }})<br>
        ↦ ŷ = ({{ hp.y.map(v => fmt(v)).join(', ') }})
      </div>
    </div>

    <div class="col">
      <div class="ttl">output space ℝ²</div>
      <svg :viewBox="`0 0 ${size} ${size}`" :style="{ width: `${size}px`, height: `${size}px` }">
        <defs>
          <marker id="lmd-arr" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#00457c" />
          </marker>
        </defs>
        <rect :x="pad" y="10" :width="size - pad - 10" :height="size - pad - 10" fill="none" stroke="#9aa1a6" />
        <line v-for="t in ticks" :key="`gx${t}`" :x1="ox(t)" :x2="ox(t)" y1="10" :y2="size - pad" stroke="#eceeef" />
        <line v-for="t in ticks" :key="`gy${t}`" :y1="oy(t)" :y2="oy(t)" :x1="pad" :x2="size - 10" stroke="#eceeef" />
        <text v-for="t in ticks.filter(t => t % 1 === 0)" :key="`tx${t}`" :x="ox(t)" :y="size - pad + 12" class="tick">{{ t }}</text>
        <text v-for="t in ticks.filter(t => t % 1 === 0)" :key="`ty${t}`" :x="pad - 5" :y="oy(t) + 3" class="tick" text-anchor="end">{{ t }}</text>
        <text :x="(size + pad) / 2" :y="size - 6" class="lab" fill="#ff7900">temperature ŷ₁</text>
        <text :transform="`translate(11,${(size - pad) / 2 + 10}) rotate(-90)`" class="lab" fill="#7b3fa0">snow depth ŷ₂</text>

        <circle
          v-for="(p, i) in pts" :key="i" :cx="ox(p.y[0])" :cy="oy(p.y[1])"
          :r="hover === i ? 7 : 4.2" :fill="p.col"
          :stroke="hover === i ? '#ff7900' : '#fff'" :stroke-width="hover === i ? 2.5 : 1"
          style="cursor: pointer" @mouseenter="setHover(i)" @mouseleave="setHover(null)"
        />

        <!-- where the input axes land: columns of W -->
        <g v-for="a in axes" :key="a.f">
          <line :x1="ox(B[0])" :y1="oy(B[1])" :x2="ox(a.x)" :y2="oy(a.y)" stroke="#00457c" stroke-width="2" marker-end="url(#lmd-arr)" />
          <text :x="ox(a.x) + (a.x - B[0]) * 40" :y="oy(a.y) - (a.y - B[1]) * 40 + 4" class="axl">{{ a.f }}</text>
        </g>
      </svg>
      <div class="hint">arrows: where each input axis lands (columns of W)</div>
    </div>
  </div>
</template>

<style scoped>
.lmd { display: flex; gap: .8rem; justify-content: center; align-items: center; }
.lmd .col { display: flex; flex-direction: column; align-items: center; }
.lmd .ttl { font: 600 12px "Exo 2", sans-serif; color: #00457c; margin-bottom: 2px; }
.lmd .hint { font: 10.5px "Exo 2", sans-serif; color: #777; margin-top: 2px; }
.lmd .mid { display: flex; flex-direction: column; align-items: center; gap: .25rem; width: 150px; }
.lmd .map { font: italic 15px 'Times New Roman', serif; }
.lmd .mat { border-left: 1.5px solid #333; border-right: 1.5px solid #333; border-collapse: separate; border-spacing: 6px 1px; font: 12px "Exo 2", sans-serif; font-variant-numeric: tabular-nums; }
.lmd .mat td { padding: 0 2px; text-align: right; border: none; }
.lmd .shape { font: 11px "Exo 2", sans-serif; color: #666; }
.lmd .arrow { font-size: 30px; color: #00457c; line-height: 1; }
.lmd .sample { font: 10.5px "Exo 2", sans-serif; color: #333; text-align: center; min-height: 2.6em; }
.lmd .cbar { display: flex; align-items: center; gap: 4px; font: 10px "Exo 2", sans-serif; color: #777; }
.lmd .cbar i { display: inline-block; width: 60px; height: 7px; border-radius: 3px; background: linear-gradient(90deg, #440154, #3b528b, #21918c, #5ec962, #fde725); }
.lmd .tick { font: 9px "Exo 2", sans-serif; fill: #666; text-anchor: middle; }
.lmd .lab { font: 600 11px "Exo 2", sans-serif; text-anchor: middle; }
.lmd .axl { font: 600 10.5px "Exo 2", sans-serif; fill: #00457c; text-anchor: middle; paint-order: stroke; stroke: white; stroke-width: 3px; }
</style>
