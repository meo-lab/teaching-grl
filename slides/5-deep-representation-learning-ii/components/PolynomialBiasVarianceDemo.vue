<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'

// ── Constants ─────────────────────────────────────────────────────────────────
const N_PTS   = 10       // observations per dataset
const N_DS    = 5        // number of independent datasets
const xMin    = -Math.PI
const xMax    = Math.PI
const yMin    = -2.6
const yMax    = 2.6
const INTERP  = 9        // interpolation-threshold degree (d+1 = N_PTS)
const COLORS  = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626']
const LABELS  = ['A', 'B', 'C', 'D', 'E']

// ── Vue state ─────────────────────────────────────────────────────────────────
const degree      = ref(3)
const hoveredIdx  = ref(-1)
const mainCanvas  = ref(null)

// ── Plain (non-reactive) data ─────────────────────────────────────────────────
// Datasets and fitted coefficients are managed imperatively; canvas is
// redrawn on every logical change rather than via Vue templates.
let datasets    = []   // [{xs, ys}]
let allCoeffs   = []   // [Float64Array or plain array of coefficients]

// Animation state for degree transitions
let prevCoeffs   = []
let animProgress = 1
let animRaf      = null
let animDegree   = 1   // target degree at anim start

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

// ── Numerics: Gaussian elimination with partial pivoting ──────────────────────
function gaussSolve(A, b) {
  const n = b.length
  const M = A.map(row => row.slice())
  const r = b.slice()
  for (let col = 0; col < n; col++) {
    let pivRow = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[pivRow][col])) pivRow = row
    }
    ;[M[col], M[pivRow]] = [M[pivRow], M[col]]
    ;[r[col], r[pivRow]] = [r[pivRow], r[col]]
    const piv = M[col][col]
    if (Math.abs(piv) < 1e-14) continue
    for (let row = col + 1; row < n; row++) {
      const f = M[row][col] / piv
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

// ── Polynomial fitting (x normalized to [-1,1] = x/π for stability) ──────────
//
// When m = d+1 ≤ n  (overdetermined): solve normal equations  A^T A c = A^T y
// When m > n         (underdetermined): minimum-norm via  A A^T α = y, c = A^T α
//
function polyFit(xs, ys, d) {
  const n  = xs.length
  const m  = d + 1
  const xn = xs.map(x => x / Math.PI)   // normalize to [-1, 1]

  // Vandermonde rows: [1, x, x², …, x^d]
  const A = xn.map(x => {
    const row = [1]
    for (let j = 1; j < m; j++) row.push(row[j - 1] * x)
    return row
  })

  if (m <= n) {
    // Normal equations: (A^T A) c = A^T y
    const AtA = Array.from({ length: m }, (_, i) =>
      Array.from({ length: m }, (_, j) =>
        A.reduce((s, row) => s + row[i] * row[j], 0)))
    const Aty = Array.from({ length: m }, (_, i) =>
      A.reduce((s, row, k) => s + row[i] * ys[k], 0))
    return gaussSolve(AtA, Aty)
  } else {
    // Minimum-norm: (A A^T) α = y  →  c = A^T α
    const AAt = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) =>
        A[i].reduce((s, v, k) => s + v * A[j][k], 0)))
    const alpha = gaussSolve(AAt, ys.slice())
    return Array.from({ length: m }, (_, j) =>
      A.reduce((s, row, i) => s + row[j] * alpha[i], 0))
  }
}

// Horner evaluation (coeffs in ascending power order; x is the raw value)
function evalPoly(coeffs, x) {
  const xn = x / Math.PI
  let v = coeffs[coeffs.length - 1]
  for (let i = coeffs.length - 2; i >= 0; i--) v = v * xn + coeffs[i]
  return v
}

// Blend two polynomial evaluations for transition animation
function evalBlended(prev, next, x, t) {
  const yPrev = prev ? evalPoly(prev, x) : 0
  const yNext = evalPoly(next, x)
  return yPrev + (yNext - yPrev) * t
}

function computeMSE(coeffs, xs, ys) {
  return ys.reduce((s, y, i) => s + (y - evalPoly(coeffs, xs[i])) ** 2, 0) / ys.length
}

// ── Data generation ───────────────────────────────────────────────────────────
function generateDatasets() {
  datasets = []
  for (let d = 0; d < N_DS; d++) {
    const rng = mkRng(Date.now() ^ (d * 0x3a7c1b2f + 0x9e3779b9))
    const xs = [], ys = []
    for (let i = 0; i < N_PTS; i++) {
      const x = xMin + (xMax - xMin) * rng()
      xs.push(x)
      ys.push(Math.sin(x))   // noise-free for conceptual clarity
    }
    datasets.push({ xs, ys })
  }
  refit(false)
}

function refit(animate = true) {
  if (animRaf) { cancelAnimationFrame(animRaf); animRaf = null }

  const newCoeffs = datasets.map(({ xs, ys }) => polyFit(xs, ys, degree.value))

  if (animate && allCoeffs.length === N_DS && prevCoeffs.length === 0) {
    // Store snapshot for blending
    prevCoeffs = allCoeffs
    animDegree = degree.value
  }

  allCoeffs = newCoeffs

  if (animate && prevCoeffs.length > 0) {
    animProgress = 0
    const t0 = performance.now()
    const dur = 280
    function step(t) {
      const ease = (p => p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p)
      animProgress = ease(Math.min((t - t0) / dur, 1))
      draw()
      if (animProgress < 1) {
        animRaf = requestAnimationFrame(step)
      } else {
        animProgress = 1
        prevCoeffs = []
        animRaf = null
      }
    }
    animRaf = requestAnimationFrame(step)
  } else {
    animProgress = 1
    prevCoeffs = []
    draw()
  }
}

watch(degree, () => { prevCoeffs = allCoeffs.length ? [...allCoeffs] : []; refit(true) })

// ── Canvas utilities ──────────────────────────────────────────────────────────
function toCanvas(canvas, x, y) {
  return {
    px: (x - xMin) / (xMax - xMin) * canvas.width,
    py: (1 - (y - yMin) / (yMax - yMin)) * canvas.height
  }
}
function fromCanvasX(px, canvas) {
  return px / canvas.width * (xMax - xMin) + xMin
}

// ── Drawing ───────────────────────────────────────────────────────────────────
function draw() {
  const canvas = mainCanvas.value
  if (!canvas || datasets.length === 0) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const hov = hoveredIdx.value

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, W, H)

  // ── Clip region ────────────────────────────────────────────────────────────
  ctx.save()
  ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip()

  // ── Grid ───────────────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(200,200,200,0.55)'; ctx.lineWidth = 0.5
  ;[-2, -1, 0, 1, 2].forEach(v => {
    const { py } = toCanvas(canvas, 0, v)
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke()
  })
  ;[-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI].forEach(v => {
    const { px } = toCanvas(canvas, v, 0)
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke()
  })

  // ── Axes ───────────────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(100,100,100,0.4)'; ctx.lineWidth = 1
  const { py: y0 } = toCanvas(canvas, 0, 0)
  ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke()
  const { px: x0 } = toCanvas(canvas, 0, 0)
  ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, H); ctx.stroke()

  // ── Axis labels ────────────────────────────────────────────────────────────
  const labelFs = Math.max(9, Math.round(W * 0.022))
  ctx.font = `${labelFs}px monospace`
  ctx.fillStyle = 'rgba(80,80,80,0.7)'; ctx.textAlign = 'center'
  ;[[-Math.PI, '-π'], [-Math.PI / 2, '-π/2'], [Math.PI / 2, 'π/2'], [Math.PI, 'π']].forEach(([v, l]) => {
    const { px } = toCanvas(canvas, v, 0); ctx.fillText(l, px, y0 + 12)
  })
  ctx.textAlign = 'right'
  ;[-2, -1, 1, 2].forEach(v => {
    const { py } = toCanvas(canvas, 0, v); ctx.fillText(String(v), x0 - 4, py + 4)
  })

  // ── Running average of 5 fits (dashed dark line) ───────────────────────────
  if (allCoeffs.length === N_DS) {
    ctx.save()
    ctx.globalAlpha = hov >= 0 ? 0.18 : 0.55
    ctx.strokeStyle = '#374151'; ctx.lineWidth = 1.8
    ctx.setLineDash([7, 4])
    ctx.beginPath()
    let moved = false
    for (let i = 0; i <= 300; i++) {
      const x = xMin + (xMax - xMin) * i / 300
      const avgY = allCoeffs.reduce((s, c, di) => {
        const prev = prevCoeffs[di]
        return s + evalBlended(prev, c, x, animProgress)
      }, 0) / allCoeffs.length
      const { px, py } = toCanvas(canvas, x, avgY)
      if (py < -8 || py > H + 8) { moved = false; continue }
      moved ? ctx.lineTo(px, py) : (ctx.moveTo(px, py), moved = true)
    }
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }

  // ── 5 fitted polynomial curves ─────────────────────────────────────────────
  datasets.forEach(({ xs, ys }, idx) => {
    const coeffs = allCoeffs[idx]
    if (!coeffs) return
    const prev   = prevCoeffs[idx]
    const isHov  = hov === idx
    const isFade = hov >= 0 && !isHov
    const alpha  = isHov ? 1 : isFade ? 0.09 : 0.62
    const lw     = isHov ? 3 : 1.8

    // Polynomial curve
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.strokeStyle = COLORS[idx]; ctx.lineWidth = lw
    ctx.beginPath()
    let moved = false
    for (let i = 0; i <= 350; i++) {
      const x = xMin + (xMax - xMin) * i / 350
      const y = evalBlended(prev, coeffs, x, animProgress)
      const { px, py } = toCanvas(canvas, x, y)
      if (py < -12 || py > H + 12) { moved = false; continue }
      moved ? ctx.lineTo(px, py) : (ctx.moveTo(px, py), moved = true)
    }
    ctx.stroke()
    ctx.restore()

    // Training points
    xs.forEach((x, i) => {
      const { px, py } = toCanvas(canvas, x, ys[i])
      ctx.save()
      ctx.globalAlpha = isHov ? 1 : isFade ? 0.06 : 0.55
      ctx.beginPath(); ctx.arc(px, py, isHov ? 5 : 3.5, 0, Math.PI * 2)
      ctx.fillStyle = COLORS[idx]; ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.stroke()
      ctx.restore()
    })

    // Hover label (dataset + MSE)
    if (isHov) {
      const mse = computeMSE(coeffs, xs, ys)
      const fs  = Math.max(10, Math.round(W * 0.026))
      ctx.save()
      ctx.font = `bold ${fs}px monospace`
      ctx.fillStyle = COLORS[idx]; ctx.textAlign = 'right'
      ctx.fillText(
        `Dataset ${LABELS[idx]}  ·  degree ${degree.value}  ·  train MSE ${mse < 1e-6 ? '≈ 0' : mse.toFixed(4)}`,
        W - 8, 18
      )
      ctx.restore()
    }
  })

  // ── True function sin(x) on top ────────────────────────────────────────────
  ctx.save()
  ctx.globalAlpha = hov >= 0 ? 0.65 : 1
  ctx.beginPath(); ctx.strokeStyle = '#111827'; ctx.lineWidth = 2.8
  for (let i = 0; i <= 300; i++) {
    const x = xMin + (xMax - xMin) * i / 300
    const { px, py } = toCanvas(canvas, x, Math.sin(x))
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
  }
  ctx.stroke()
  ctx.restore()

  ctx.restore() // end clip

  // ── Legend (top-left) ──────────────────────────────────────────────────────
  if (hov < 0) {
    const fs = Math.max(9, Math.round(W * 0.027))
    ctx.font = `${fs}px sans-serif`
    const items = [
      { color: '#111827', label: 'f*(x) = sin(x)', lw: 2.8, dash: false },
      ...COLORS.map((c, i) => ({ color: c, label: `Dataset ${LABELS[i]}`, lw: 1.8, dash: false })),
      { color: '#374151', label: 'average h̄(x)', lw: 1.8, dash: true }
    ]
    items.forEach(({ color, label, lw, dash }, i) => {
      const lx = 8, ly = 12 + i * (fs + 4)
      ctx.strokeStyle = color; ctx.lineWidth = lw
      if (dash) ctx.setLineDash([5, 3])
      ctx.beginPath(); ctx.moveTo(lx, ly - 2); ctx.lineTo(lx + 14, ly - 2); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#374151'; ctx.textAlign = 'left'; ctx.font = `${fs}px sans-serif`
      ctx.fillText(label, lx + 19, ly)
    })
  }
}

// ── Hover detection ───────────────────────────────────────────────────────────
function handleMouseMove(e) {
  const canvas = mainCanvas.value
  if (!canvas || allCoeffs.length === 0) return
  const r  = canvas.getBoundingClientRect()
  const mx = (e.clientX - r.left) * canvas.width  / r.width
  const my = (e.clientY - r.top)  * canvas.height / r.height
  const xD = fromCanvasX(mx, canvas)

  if (xD < xMin - 0.05 || xD > xMax + 0.05) {
    if (hoveredIdx.value !== -1) { hoveredIdx.value = -1; draw() }
    return
  }

  let bestIdx = -1, bestDist = 22   // 22px hit threshold
  allCoeffs.forEach((coeffs, i) => {
    const yD = evalPoly(coeffs, xD)
    const { py } = toCanvas(canvas, xD, yD)
    const dist = Math.abs(my - py)
    if (dist < bestDist) { bestDist = dist; bestIdx = i }
  })

  if (hoveredIdx.value !== bestIdx) { hoveredIdx.value = bestIdx; draw() }
}

function handleMouseLeave() {
  if (hoveredIdx.value !== -1) { hoveredIdx.value = -1; draw() }
}

// ── Qualitative bias / variance labels ───────────────────────────────────────
const biasLabel = computed(() => {
  const d = degree.value
  if (d <= 2)  return 'High'
  if (d <= 5)  return 'Medium'
  if (d <= 8)  return 'Low'
  return 'Very low'
})
const varianceLabel = computed(() => {
  const d = degree.value
  if (d <= 2)  return 'Low'
  if (d <= 5)  return 'Medium'
  if (d <= 8)  return 'High'
  return 'Very high'
})
const biasColor = computed(() => {
  const d = degree.value
  if (d <= 2)  return '#b45309'
  if (d <= 5)  return '#d97706'
  return '#059669'
})
const varianceColor = computed(() => {
  const d = degree.value
  if (d <= 2)  return '#059669'
  if (d <= 5)  return '#d97706'
  return '#dc2626'
})

// Fraction along slider [0,1] for the interpolation-threshold tick
const thresholdFrac = (INTERP - 1) / (12 - 1)   // (9-1)/(12-1) ≈ 0.727

// ── Canvas init ───────────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  const c = mainCanvas.value
  const r = c.parentElement.getBoundingClientRect()
  c.width  = Math.round(r.width)  || 640
  c.height = Math.round(r.height) || 360
  generateDatasets()
})
</script>

<template>
  <div class="flex flex-col h-full gap-1.5 select-none">

    <!-- ── Controls ──────────────────────────────────────────────────────── -->
    <div class="flex items-center gap-4 flex-wrap">

      <!-- Degree slider -->
      <div class="flex flex-col gap-0.5 flex-1 min-w-[220px]">
        <div class="flex items-center gap-2">
          <span class="text-[.58rem] font-bold uppercase tracking-wide text-gray-400">
            Polynomial degree / hypothesis-space capacity
          </span>
          <span class="text-[.7rem] font-mono font-semibold text-blue-700">d&nbsp;=&nbsp;{{ degree }}</span>
        </div>
        <!-- Slider with interpolation-threshold tick -->
        <div class="flex items-center gap-1.5">
          <span class="text-[.58rem] font-mono text-gray-400">1</span>
          <div class="relative flex-1">
            <!-- Threshold indicator above -->
            <div
              class="absolute text-[.5rem] text-amber-500 font-semibold whitespace-nowrap"
              :style="`left: calc(${thresholdFrac * 100}%); transform: translateX(-50%); top: -14px`"
            >▼ interp. threshold (d = {{ INTERP }})</div>
            <input
              type="range" v-model.number="degree" min="1" max="12" step="1"
              class="w-full h-2 cursor-pointer accent-blue-600"
            />
          </div>
          <span class="text-[.58rem] font-mono text-gray-400">12</span>
        </div>
        <!-- Nested space formula -->
        <div class="text-[.54rem] text-gray-400 font-mono leading-none">
          ℋ₁ ⊂ ℋ₂ ⊂ ··· ⊂ ℋ<sub>d</sub>
        </div>
      </div>

      <!-- Bias / Variance badges -->
      <div class="flex gap-2 text-[.58rem] font-semibold shrink-0">
        <div class="rounded px-2 py-1 border transition-colors duration-200"
             :style="`border-color: ${biasColor}; color: ${biasColor}`">
          Bias: {{ biasLabel }}
        </div>
        <div class="rounded px-2 py-1 border transition-colors duration-200"
             :style="`border-color: ${varianceColor}; color: ${varianceColor}`">
          Variance: {{ varianceLabel }}
        </div>
      </div>

      <!-- Draw button -->
      <button
        @click="generateDatasets"
        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[.64rem] font-semibold rounded-md transition-colors shrink-0"
      >
        Draw 5 new datasets
      </button>
    </div>

    <!-- ── Main plot ──────────────────────────────────────────────────────── -->
    <div
      class="flex-1 relative border border-gray-200 rounded-lg overflow-hidden bg-white"
      @mousemove="handleMouseMove" @mouseleave="handleMouseLeave"
    >
      <canvas ref="mainCanvas" class="block w-full h-full" style="cursor: crosshair" />
    </div>

    <!-- ── Takeaway strip ─────────────────────────────────────────────────── -->
    <div class="rounded-lg bg-gray-100 px-3 py-1.5 text-[.63rem] text-gray-700 text-center leading-snug">
      <span class="font-semibold">Small ℋ:</span>&nbsp;High bias · Low variance
      &nbsp;→ increase capacity →&nbsp;
      <span class="font-semibold">Large ℋ:</span>&nbsp;Lower bias · Higher variance
      <span class="text-gray-400 ml-3">· What happens after the interpolation threshold?</span>
    </div>

  </div>
</template>
