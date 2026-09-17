<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'

// ── Constants ─────────────────────────────────────────────────────────────────
const N_PTS  = 10
const NOISE  = 0.45
const xMin   = -Math.PI
const xMax   = Math.PI
const yMin   = -2.8
const yMax   = 2.8
const INTERP = 9    // d+1 = N_PTS → exact interpolation of noise-free targets

// ── Vue state ─────────────────────────────────────────────────────────────────
const degree     = ref(3)
const mainCanvas = ref(null)

// ── Plain data (managed imperatively, canvas redrawn on change) ───────────────
let xs = [], ys = []
let coeffs    = null
let prevCoefs = null
let animProg  = 1
let animRaf   = null

// ── RNG (mulberry32) ──────────────────────────────────────────────────────────
function mkRng(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Gaussian elimination with partial pivoting ────────────────────────────────
function gaussSolve(A, b) {
  const n = b.length
  const M = A.map(r => r.slice()), r = b.slice()
  for (let col = 0; col < n; col++) {
    let piv = col
    for (let row = col + 1; row < n; row++)
      if (Math.abs(M[row][col]) > Math.abs(M[piv][col])) piv = row
    ;[M[col], M[piv]] = [M[piv], M[col]]; [r[col], r[piv]] = [r[piv], r[col]]
    const p = M[col][col]
    if (Math.abs(p) < 1e-14) continue
    for (let row = col + 1; row < n; row++) {
      const f = M[row][col] / p
      for (let k = col; k < n; k++) M[row][k] -= f * M[col][k]
      r[row] -= f * r[col]
    }
  }
  const x = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    x[i] = r[i]
    for (let j = i + 1; j < n; j++) x[i] -= M[i][j] * x[j]
    if (Math.abs(M[i][i]) > 1e-14) x[i] /= M[i][i]
  }
  return x
}

// ── Polynomial least squares (x normalized to [-1,1] for stability) ───────────
// overdetermined  (d+1 ≤ n): normal equations  A^T A c = A^T y
// underdetermined (d+1 > n): min-norm          A A^T α = y, c = A^T α
function polyFit(xArr, yArr, d) {
  const n = xArr.length, m = d + 1
  const xn = xArr.map(x => x / Math.PI)
  const A  = xn.map(x => { const row = [1]; for (let j = 1; j < m; j++) row.push(row[j-1]*x); return row })
  if (m <= n) {
    const AtA = Array.from({length: m}, (_, i) => Array.from({length: m}, (_, j) => A.reduce((s, r) => s + r[i]*r[j], 0)))
    const Aty = Array.from({length: m}, (_, i) => A.reduce((s, r, k) => s + r[i]*yArr[k], 0))
    return gaussSolve(AtA, Aty)
  } else {
    const AAt = Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => A[i].reduce((s, v, k) => s + v*A[j][k], 0)))
    const al  = gaussSolve(AAt, yArr.slice())
    return Array.from({length: m}, (_, j) => A.reduce((s, r, i) => s + r[j]*al[i], 0))
  }
}

// Horner's method (coeffs in ascending power order, x is raw)
function evalPoly(c, x) {
  const xn = x / Math.PI
  let v = c[c.length - 1]
  for (let i = c.length - 2; i >= 0; i--) v = v * xn + c[i]
  return v
}

function evalBlended(prev, next, x, t) {
  return (prev ? evalPoly(prev, x) : 0) * (1 - t) + evalPoly(next, x) * t
}

function computeMSE(c, xArr, yArr) {
  return yArr.reduce((s, y, i) => s + (y - evalPoly(c, xArr[i])) ** 2, 0) / yArr.length
}

// ── Data generation ───────────────────────────────────────────────────────────
function generateDataset() {
  const rng = mkRng(Date.now() ^ 0x9e3779b9)
  xs = []; ys = []
  for (let i = 0; i < N_PTS; i++) {
    const x = xMin + (xMax - xMin) * rng()
    xs.push(x)
    ys.push(Math.sin(x) + NOISE * (rng() * 2 - 1))
  }
  refit(false)
}

// ── Refit with optional transition animation ───────────────────────────────────
function refit(animate = true) {
  if (animRaf) { cancelAnimationFrame(animRaf); animRaf = null }
  const newC = polyFit(xs, ys, degree.value)
  if (animate && coeffs) {
    prevCoefs = coeffs
    animProg  = 0
    coeffs    = newC
    const t0  = performance.now(), dur = 280
    function step(t) {
      const p = Math.min((t - t0) / dur, 1)
      animProg = p < 0.5 ? 2*p*p : -1 + (4 - 2*p)*p   // ease-in-out
      draw()
      if (p < 1) animRaf = requestAnimationFrame(step)
      else { animProg = 1; prevCoefs = null; animRaf = null }
    }
    animRaf = requestAnimationFrame(step)
  } else {
    coeffs = newC; animProg = 1; prevCoefs = null; draw()
  }
}

watch(degree, () => refit(true))

// ── Canvas helpers ────────────────────────────────────────────────────────────
function toCanvas(canvas, x, y) {
  return {
    px: (x - xMin) / (xMax - xMin) * canvas.width,
    py: (1 - (y - yMin) / (yMax - yMin)) * canvas.height
  }
}

// ── Drawing ───────────────────────────────────────────────────────────────────
function draw() {
  const canvas = mainCanvas.value
  if (!canvas || !coeffs) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, W, H)

  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip()

  // Grid
  ctx.strokeStyle = 'rgba(200,200,200,0.6)'; ctx.lineWidth = 0.5
  ;[-2, -1, 0, 1, 2].forEach(v => {
    const {py} = toCanvas(canvas, 0, v)
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke()
  })
  ;[-Math.PI, -Math.PI/2, 0, Math.PI/2, Math.PI].forEach(v => {
    const {px} = toCanvas(canvas, v, 0)
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke()
  })

  // Axes
  ctx.strokeStyle = 'rgba(100,100,100,0.4)'; ctx.lineWidth = 1
  const {py: y0} = toCanvas(canvas, 0, 0)
  ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke()
  const {px: x0} = toCanvas(canvas, 0, 0)
  ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, H); ctx.stroke()

  // Axis tick labels
  const lfs = Math.max(9, Math.round(W * 0.022))
  ctx.font = `${lfs}px monospace`; ctx.fillStyle = 'rgba(80,80,80,0.7)'
  ctx.textAlign = 'center'
  ;[[-Math.PI,'-π'], [-Math.PI/2,'-π/2'], [Math.PI/2,'π/2'], [Math.PI,'π']].forEach(([v,l]) => {
    const {px} = toCanvas(canvas, v, 0); ctx.fillText(l, px, y0 + 12)
  })
  ctx.textAlign = 'right'
  ;[-2,-1,1,2].forEach(v => {
    const {py} = toCanvas(canvas, 0, v); ctx.fillText(String(v), x0 - 5, py + 4)
  })

  // Residual segments (training point ↔ fitted value)
  xs.forEach((x, i) => {
    const yFit = evalBlended(prevCoefs, coeffs, x, animProg)
    const {px: px1, py: py1} = toCanvas(canvas, x, ys[i])
    const {px: px2, py: py2} = toCanvas(canvas, x, yFit)
    ctx.strokeStyle = 'rgba(220,38,38,0.35)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2); ctx.stroke()
  })

  // Fitted polynomial (red)
  ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2.5
  ctx.beginPath()
  let moved = false
  for (let i = 0; i <= 400; i++) {
    const x = xMin + (xMax - xMin) * i / 400
    const y = evalBlended(prevCoefs, coeffs, x, animProg)
    const {px, py} = toCanvas(canvas, x, y)
    if (py < -15 || py > H + 15) { moved = false; continue }
    moved ? ctx.lineTo(px, py) : (ctx.moveTo(px, py), moved = true)
  }
  ctx.stroke()

  // True sin(x) (black, on top)
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 2.8
  ctx.beginPath()
  for (let i = 0; i <= 300; i++) {
    const x = xMin + (xMax - xMin) * i / 300
    const {px, py} = toCanvas(canvas, x, Math.sin(x))
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
  }
  ctx.stroke()

  // Training points (prominent, on top)
  xs.forEach((x, i) => {
    const {px, py} = toCanvas(canvas, x, ys[i])
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#2563eb'; ctx.fill()
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()
  })

  ctx.restore()   // end clip

  // MSE label (top-right)
  const mse = computeMSE(coeffs, xs, ys)
  const mfs = Math.max(10, Math.round(W * 0.028))
  ctx.font = `${mfs}px monospace`; ctx.fillStyle = '#dc2626'
  ctx.textAlign = 'right'
  ctx.fillText(`train MSE = ${mse < 5e-4 ? '≈ 0' : mse.toFixed(3)}`, W - 8, 20)

  // Legend (top-left)
  const fs = Math.max(9, Math.round(W * 0.027))
  ctx.font = `${fs}px sans-serif`
  ;[
    {color: '#111827', label: 'f*(x) = sin(x)', lw: 2.8},
    {color: '#dc2626', label: `fitted polynomial, degree ${degree.value}`, lw: 2.5},
    {color: '#2563eb', label: 'training data (n = 10)', dot: true}
  ].forEach(({color, label, lw, dot}, i) => {
    const lx = 8, ly = 12 + i * (fs + 5)
    if (dot) {
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(lx+7, ly-3, 4.5, 0, Math.PI*2); ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke()
    } else {
      ctx.strokeStyle = color; ctx.lineWidth = lw
      ctx.beginPath(); ctx.moveTo(lx, ly-2); ctx.lineTo(lx+15, ly-2); ctx.stroke()
    }
    ctx.fillStyle = '#374151'; ctx.font = `${fs}px sans-serif`; ctx.textAlign = 'left'
    ctx.fillText(label, lx + 20, ly)
  })
}

// ── Qualitative labels ────────────────────────────────────────────────────────
const biasLabel = computed(() => {
  const d = degree.value
  if (d <= 2) return 'High'; if (d <= 5) return 'Medium'; if (d <= 8) return 'Low'; return 'Very low'
})
const varLabel = computed(() => {
  const d = degree.value
  if (d <= 2) return 'Low'; if (d <= 5) return 'Medium'; if (d <= 8) return 'High'; return 'Very high'
})
const biasColor   = computed(() => degree.value <= 2 ? '#b45309' : degree.value <= 5 ? '#d97706' : '#059669')
const varColor    = computed(() => degree.value <= 2 ? '#059669' : degree.value <= 5 ? '#d97706' : '#dc2626')
const threshFrac  = (INTERP - 1) / (12 - 1)   // ≈ 0.727

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  const c = mainCanvas.value
  const r = c.parentElement.getBoundingClientRect()
  c.width  = Math.round(r.width)  || 640
  c.height = Math.round(r.height) || 360
  generateDataset()
})
</script>

<template>
  <div class="flex flex-col h-full gap-1.5 select-none">

    <!-- Controls -->
    <div class="flex items-center gap-4 flex-wrap">

      <!-- Degree slider -->
      <div class="flex flex-col gap-0.5 flex-1 min-w-[220px]">
        <div class="flex items-center gap-2">
          <span class="text-[.58rem] font-bold uppercase tracking-wide text-gray-400">
            Polynomial degree / hypothesis-space capacity
          </span>
          <span class="text-[.7rem] font-mono font-semibold text-blue-700">d = {{ degree }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[.58rem] font-mono text-gray-400">1</span>
          <div class="relative flex-1">
            <div
              class="absolute text-[.5rem] text-amber-500 font-semibold whitespace-nowrap"
              :style="`left: calc(${threshFrac * 100}%); transform: translateX(-50%); top: -14px`"
            >▼ interpolation (d = {{ INTERP }})</div>
            <input
              type="range" v-model.number="degree" min="1" max="12" step="1"
              class="w-full h-2 cursor-pointer accent-blue-600"
            />
          </div>
          <span class="text-[.58rem] font-mono text-gray-400">12</span>
        </div>
        <div class="text-[.54rem] text-gray-400 font-mono">ℋ₁ ⊂ ℋ₂ ⊂ ··· ⊂ ℋ<sub>d</sub></div>
      </div>

      <!-- Bias / Variance badges -->
      <div class="flex gap-2 text-[.58rem] font-semibold shrink-0">
        <div class="rounded px-2 py-1 border transition-colors duration-200"
             :style="`border-color: ${biasColor}; color: ${biasColor}`">
          Bias: {{ biasLabel }}
        </div>
        <div class="rounded px-2 py-1 border transition-colors duration-200"
             :style="`border-color: ${varColor}; color: ${varColor}`">
          Variance: {{ varLabel }}
        </div>
      </div>

      <!-- Draw button -->
      <button
        @click="generateDataset"
        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[.64rem] font-semibold rounded-md transition-colors shrink-0"
      >
        Draw new dataset
      </button>
    </div>

    <!-- Main plot -->
    <div class="flex-1 relative border border-gray-200 rounded-lg overflow-hidden bg-white">
      <canvas ref="mainCanvas" class="block w-full h-full" />
    </div>

    <!-- Takeaway strip -->
    <div class="rounded-lg bg-gray-100 px-3 py-1.5 text-[.63rem] text-gray-700 text-center leading-snug">
      <span class="font-semibold">Small ℋ:</span>&nbsp;High bias · Low variance
      &nbsp;→ increase capacity →&nbsp;
      <span class="font-semibold">Large ℋ:</span>&nbsp;Lower bias · Higher variance
      <span class="text-gray-400 ml-3">· What happens after the interpolation threshold?</span>
    </div>

  </div>
</template>
