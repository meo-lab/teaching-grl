<script setup lang="ts">
// Weight decay on the logistic-regression loss surface (no bias, same data as LossSurface3D 'log-bce').
// Three layers in one rotatable 3D plot, each toggled by a button:
//   BCE loss (flat plateau, no single minimum) · penalty λ/2 ‖w‖² (a bowl) · their sum (one clear minimum)
// "run gradient descent" runs SGD with momentum on BCE + penalty (= weight_decay λ in torch.optim.SGD).
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { logLoss, runLogGD, viridis } from '../lib/lossSurface'

const props = withDefaults(defineProps<{ width?: number, height?: number, range?: number }>(), { width: 430, height: 300, range: 20 })

const R = props.range
const N = 40
const lam = ref(0.05)
const show = ref({ loss: true, reg: false, sum: false })

// precompute the BCE grid once; the penalty is analytic
const W = (k: number) => -R + 2 * R * k / N
const BCE: number[][] = []
for (let j = 0; j <= N; j++) {
  const row: number[] = []
  for (let i = 0; i <= N; i++) row.push(logLoss(W(i), W(j)))
  BCE.push(row)
}
const pen = (a: number, b: number) => lam.value / 2 * (a * a + b * b)
const zMax = computed(() => {
  let m = 0
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) m = Math.max(m, BCE[j][i] + pen(W(i), W(j)))
  return m
})

// ---- gradient descent with momentum on the regularized objective ----
const START: [number, number] = [-15, 15]
const path = ref<{ w1: number, w2: number }[]>([])
const shown = ref(0)
let anim = 0
function runGD() {
  show.value.sum = true
  const steps = runLogGD({ init: START, lr: 0.3, momentum: 0.9, weightDecay: lam.value, epochs: 160 })
  path.value = steps.map(s => ({ w1: s.w1, w2: s.w2 }))
  shown.value = 0
  cancelAnimationFrame(anim)
  const t0 = performance.now()
  const tick = () => {
    shown.value = Math.min(path.value.length - 1, Math.floor((performance.now() - t0) / 18))
    draw()
    if (shown.value < path.value.length - 1) anim = requestAnimationFrame(tick)
  }
  anim = requestAnimationFrame(tick)
}
function resetGD() {
  cancelAnimationFrame(anim)
  path.value = []
  shown.value = 0
  draw()
}
watch(lam, () => {
  path.value = []
  draw()
})
watch(show, () => draw(), { deep: true })
const cur = computed(() => path.value[shown.value])
const objective = (a: number, b: number) => logLoss(a, b) + pen(a, b)

// ---------------- 3D view (same projection as LossSurface3D) ----------------
const canvas = ref<HTMLCanvasElement>()
let yaw = 0.9
let pitch = 0.45
let drag: { x: number, y: number, yaw: number, pitch: number } | null = null

function project(u: number, v: number, w: number) {
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const x = u * cy - v * sy
  const y = u * sy + v * cy
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const zz = w * 0.85 - 0.42
  const s = Math.min(props.width * 0.3, props.height * 0.36)
  return [props.width / 2 + x * s, props.height * 0.54 - (zz * cp - y * sp) * s, y * cp + zz * sp]
}
const P = (a: number, b: number, z: number) => project(a / R, b / R, z / zMax.value)

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

  // floor
  const fl = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => project(u, v, 0))
  ctx.strokeStyle = '#c9ced1'
  ctx.beginPath()
  fl.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
  ctx.closePath()
  ctx.stroke()

  // the "main" layer gets the viridis colours; the others are translucent overlays
  const main = show.value.sum ? 'sum' : show.value.loss ? 'loss' : 'reg'
  const layers: { key: 'loss' | 'reg' | 'sum', z: (i: number, j: number) => number }[] = []
  if (show.value.loss) layers.push({ key: 'loss', z: (i, j) => BCE[j][i] })
  if (show.value.reg) layers.push({ key: 'reg', z: (i, j) => pen(W(i), W(j)) })
  if (show.value.sum) layers.push({ key: 'sum', z: (i, j) => BCE[j][i] + pen(W(i), W(j)) })

  const quads: { d: number, p: number[][], fill: string, stroke: string }[] = []
  for (const L of layers) {
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const cs = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]]
        const zs = cs.map(([a, b]) => L.z(a, b))
        const pts = cs.map(([a, b], k) => P(W(a), W(b), zs[k]))
        const t = zs.reduce((s, z) => s + z, 0) / 4 / zMax.value
        let fill: string
        let stroke: string
        if (L.key === main) {
          const [r, g, b] = viridis(Math.pow(t, 0.6))
          fill = `rgba(${r | 0},${g | 0},${b | 0},${layers.length > 1 ? 0.92 : 1})`
          stroke = 'rgba(255,255,255,0.16)'
        }
        else if (L.key === 'reg') {
          fill = 'rgba(255,121,0,0.16)'
          stroke = 'rgba(255,121,0,0.45)'
        }
        else {
          fill = 'rgba(120,130,140,0.12)'
          stroke = 'rgba(90,100,110,0.35)'
        }
        quads.push({ d: pts.reduce((s, p) => s + p[2], 0) / 4, p: pts, fill, stroke })
      }
    }
  }
  quads.sort((a, b) => a.d - b.d)
  for (const q of quads) {
    ctx.fillStyle = q.fill
    ctx.strokeStyle = q.stroke
    ctx.beginPath()
    q.p.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])))
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  // gradient-descent path on the regularized surface
  if (path.value.length && show.value.sum) {
    ctx.strokeStyle = '#ff2d2d'
    ctx.lineWidth = 2.2
    ctx.beginPath()
    for (let k = 0; k <= shown.value; k++) {
      const s = path.value[k]
      const p = P(s.w1, s.w2, objective(s.w1, s.w2) + zMax.value * 0.01)
      k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])
    }
    ctx.stroke()
    ctx.lineWidth = 1
    const s0 = path.value[0]
    const p0 = P(s0.w1, s0.w2, objective(s0.w1, s0.w2))
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#ff2d2d'
    ctx.beginPath()
    ctx.arc(p0[0], p0[1], 4, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    const s1 = path.value[shown.value]
    const p1 = P(s1.w1, s1.w2, objective(s1.w1, s1.w2))
    ctx.fillStyle = '#ff2d2d'
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(p1[0], p1[1], 5.5, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    ctx.lineWidth = 1
  }

  // vertical axis + labels
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
  const back = corners.map(([u, v]) => ({ u, v, d: project(u, v, 0)[2] })).sort((a, b) => a.d - b.d)[0]
  const a0 = project(back.u, back.v, 0)
  const a1 = project(back.u, back.v, 1.25)
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
  ctx.fillText('objective', a1[0], a1[1] - 10)
  ctx.font = '11px "Exo 2", sans-serif'
  ctx.fillStyle = '#444'
  const near = (a: number[], b: number[]) => (a[2] > b[2] ? a : b)
  const lx = near(project(0, -1.35, -0.05), project(0, 1.35, -0.05))
  const ly = near(project(-1.35, 0, -0.05), project(1.35, 0, -0.05))
  ctx.fillText('w₁', lx[0], lx[1] + 10)
  ctx.fillText('w₂', ly[0], ly[1] + 10)
}

function down(e: PointerEvent) {
  e.stopPropagation()
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
onMounted(draw)
onUnmounted(() => cancelAnimationFrame(anim))
</script>

<template>
  <div class="rl3 select-none" @click.stop @dblclick.stop>
    <canvas
      ref="canvas"
      :style="{ width: `${width}px`, height: `${height}px`, cursor: 'grab', touchAction: 'none' }"
      @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up"
    />
    <div class="side">
      <div class="hd">layers</div>
      <button :class="{ on: show.loss }" @click.stop="show.loss = !show.loss">BCE loss</button>
      <button class="reg" :class="{ on: show.reg }" @click.stop="show.reg = !show.reg">penalty λ/2 · |w|²</button>
      <button class="sum" :class="{ on: show.sum }" @click.stop="show.sum = !show.sum">loss + penalty</button>

      <label class="lam">
        <span>λ = {{ lam.toFixed(2) }}</span>
        <input v-model.number="lam" type="range" min="0" max="0.15" step="0.01" @pointerdown.stop @keydown.stop>
      </label>

      <div class="hd mt">fitting</div>
      <button class="run" @click.stop="runGD">run gradient descent<br><span>with momentum</span></button>
      <button class="ghost" @click.stop="resetGD">reset</button>
      <div v-if="cur" class="read">
        step {{ shown }} · w = ({{ cur.w1.toFixed(1) }}, {{ cur.w2.toFixed(1) }})
      </div>
    </div>
  </div>
</template>

<style scoped>
.rl3 { display: flex; gap: 1rem; align-items: center; justify-content: center; }
.side { display: flex; flex-direction: column; gap: .35rem; width: 170px; }
.hd { font: 700 10.5px "Exo 2", sans-serif; text-transform: uppercase; letter-spacing: .05em; color: #5f625f; }
.hd.mt { margin-top: .4rem; }
.side button { font: 600 11.5px "Exo 2", sans-serif; padding: .25rem .5rem; border-radius: 5px; border: 1.5px solid #00457c; background: transparent; color: #00457c; text-align: left; }
.side button.on { background: #00457c; color: #fff; }
.side button.reg { border-color: #ff7900; color: #b35500; }
.side button.reg.on { background: #ff7900; color: #fff; }
.side button.sum.on { background: #2a7d4f; border-color: #2a7d4f; color: #fff; }
.side button.sum { border-color: #2a7d4f; color: #2a7d4f; }
.side button.run { background: #ff2d2d; border-color: #ff2d2d; color: #fff; }
.side button.run span { font-weight: 400; font-size: 10.5px; }
.side button.ghost { border-color: #aaa; color: #666; text-align: center; }
.lam { display: flex; flex-direction: column; font: 11.5px "Exo 2", sans-serif; color: #b35500; }
.rl3 .lam input[type=range] { width: 100%; accent-color: #ff7900; appearance: auto !important; -webkit-appearance: auto !important; border: none !important; background: transparent !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; height: 18px !important; min-height: 0 !important; }
.read { font: 11px "Exo 2", sans-serif; color: #444; }
</style>
