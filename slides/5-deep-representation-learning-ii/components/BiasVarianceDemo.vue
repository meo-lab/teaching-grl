<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

// ── Constants ─────────────────────────────────────────────────────────────────
const xMin = -Math.PI, xMax = Math.PI

// Population-optimal linear approximation of sin(x) for X ~ Uniform[-π, π]:
//   w* = E[XY]/E[X²] = (∫ x·sin(x) dx / 2π) / (π²/3) = 1/(π²/3) = 3/π²
//   b* = E[Y] - w*·E[X] = 0  (both are zero by symmetry)
const wStar = 3 / (Math.PI ** 2)   // ≈ 0.3040
const bStar = 0

// ── State ─────────────────────────────────────────────────────────────────────
const N = ref(12)
const datasets = ref([])   // array of { w, b }
const leftCanvas = ref(null)
const rightCanvas = ref(null)
const count = computed(() => datasets.value.length)

// ── Parameter-space bounds ────────────────────────────────────────────────────
const wMin = -1.2, wMax = 1.2, bMin = -0.9, bMax = 0.9

// ── RNG + sampling ────────────────────────────────────────────────────────────
function mkRng(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function sampleAndFit() {
  const seed = Date.now() ^ Math.floor(Math.random() * 0x7fffffff)
  const rng = mkRng(seed)
  let sx = 0, sy = 0, sxx = 0, sxy = 0, n = N.value
  for (let i = 0; i < n; i++) {
    const x = xMin + (xMax - xMin) * rng()
    const y = Math.sin(x) + 0.3 * (rng() * 2 - 1)
    sx += x; sy += y; sxx += x * x; sxy += x * y
  }
  const den = n * sxx - sx * sx
  const w = den ? (n * sxy - sx * sy) / den : 0
  const b = (sy - w * sx) / n
  return { w, b }
}

function addDataset() {
  datasets.value.push(sampleAndFit())
  draw()
}

function reset() {
  datasets.value = []
  draw()
}

watch(N, () => { datasets.value = []; draw() })

// ── Canvas utilities ──────────────────────────────────────────────────────────
function toCanvas(canvas, dx, dy, xRange, yRange) {
  return {
    px: (dx - xRange[0]) / (xRange[1] - xRange[0]) * canvas.width,
    py: (1 - (dy - yRange[0]) / (yRange[1] - yRange[0])) * canvas.height
  }
}

function drawStar(ctx, cx, cy, r, fill, stroke) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = i * Math.PI / 5 - Math.PI / 2
    const rad = i % 2 === 0 ? r : r * 0.4
    i === 0 ? ctx.moveTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad)
            : ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad)
  }
  ctx.closePath()
  ctx.fillStyle = fill; ctx.fill()
  ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke()
}

// ── Left panel: parameter cloud ───────────────────────────────────────────────
function drawLeft() {
  const canvas = leftCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const bRange = [bMin, bMax], wRange = [wMin, wMax]
  const p = (b, w) => toCanvas(canvas, b, w, bRange, wRange)

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, W, H)

  // Grid
  ctx.strokeStyle = 'rgba(200,200,200,0.55)'; ctx.lineWidth = 0.5
  ;[-0.8, -0.4, 0, 0.4, 0.8].forEach(v => {
    const { px } = p(v, 0); ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke()
    const { py } = p(0, v); ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke()
  })

  // Axes
  ctx.strokeStyle = 'rgba(100,100,100,0.4)'; ctx.lineWidth = 1
  const { px: b0 } = p(0, 0); ctx.beginPath(); ctx.moveTo(b0, 0); ctx.lineTo(b0, H); ctx.stroke()
  const { py: w0 } = p(0, 0); ctx.beginPath(); ctx.moveTo(0, w0); ctx.lineTo(W, w0); ctx.stroke()

  // Axis labels
  const fs = Math.max(10, Math.round(W * 0.046))
  ctx.font = `${fs}px sans-serif`; ctx.fillStyle = 'rgba(50,50,50,0.8)'
  ctx.textAlign = 'left';  ctx.fillText('w', 4, fs + 2)
  ctx.textAlign = 'right'; ctx.fillText('b', W - 3, H - 4)

  // Covariance ellipse (≥5 datasets)
  if (datasets.value.length >= 5) {
    // Work in canvas-pixel space to avoid axis-scale issues
    const pts = datasets.value.map(({ w, b }) => {
      const { px, py } = p(b, w); return [px, py]
    })
    const mx = pts.reduce((s, pt) => s + pt[0], 0) / pts.length
    const my = pts.reduce((s, pt) => s + pt[1], 0) / pts.length
    const vx = pts.reduce((s, pt) => s + (pt[0] - mx) ** 2, 0) / pts.length
    const vy = pts.reduce((s, pt) => s + (pt[1] - my) ** 2, 0) / pts.length
    const cxy = pts.reduce((s, pt) => s + (pt[0] - mx) * (pt[1] - my), 0) / pts.length

    const tr = vx + vy, det = vx * vy - cxy ** 2
    const disc = Math.sqrt(Math.max(0, tr ** 2 / 4 - det))
    const l1 = tr / 2 + disc, l2 = tr / 2 - disc
    const angle = Math.atan2(l1 - vx, cxy)

    ctx.save(); ctx.translate(mx, my); ctx.rotate(angle)
    ctx.beginPath()
    ctx.ellipse(0, 0, Math.max(2, Math.sqrt(Math.abs(l1))), Math.max(2, Math.sqrt(Math.abs(l2))), 0, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(80,80,80,0.35)'; ctx.lineWidth = 1.5
    ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([])
    ctx.restore()
  }

  // Parameter cloud
  datasets.value.forEach(({ w, b }) => {
    const { px, py } = p(b, w)
    ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(100,100,100,0.5)'; ctx.fill()
  })

  // Population-optimal star
  const { px: spx, py: spy } = p(bStar, wStar)
  drawStar(ctx, spx, spy, 8, '#1d4ed8', '#fff')

  // Star label
  ctx.font = `bold ${Math.max(9, Math.round(W * 0.038))}px sans-serif`
  ctx.fillStyle = '#1d4ed8'; ctx.textAlign = 'left'
  ctx.fillText('★ h* (population optimum)', spx + 11, spy + 4)
}

// ── Right panel: function view ────────────────────────────────────────────────
function drawRight() {
  const canvas = rightCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const xRange = [xMin, xMax], yRange = [-1.85, 1.85]
  const p = (x, y) => toCanvas(canvas, x, y, xRange, yRange)

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, W, H)

  // Grid
  ctx.strokeStyle = 'rgba(200,200,200,0.55)'; ctx.lineWidth = 0.5
  ;[-1.5, -1, -0.5, 0, 0.5, 1, 1.5].forEach(v => {
    const { py } = p(0, v); ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke()
  })

  // Axes
  ctx.strokeStyle = 'rgba(110,110,110,0.45)'; ctx.lineWidth = 1
  const { py: y0 } = p(0, 0); ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke()
  const { px: x0 } = p(0, 0); ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, H); ctx.stroke()

  // Individual fitted lines (gray, semi-transparent)
  datasets.value.forEach(({ w, b }) => {
    const { px: p1x, py: p1y } = p(xMin, w * xMin + b)
    const { px: p2x, py: p2y } = p(xMax, w * xMax + b)
    ctx.beginPath(); ctx.strokeStyle = 'rgba(130,130,130,0.38)'; ctx.lineWidth = 1.3
    ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y); ctx.stroke()
  })

  // Running average (red)
  if (datasets.value.length > 0) {
    const M = datasets.value.length
    const avgW = datasets.value.reduce((s, d) => s + d.w, 0) / M
    const avgB = datasets.value.reduce((s, d) => s + d.b, 0) / M
    const { px: r1x, py: r1y } = p(xMin, avgW * xMin + avgB)
    const { px: r2x, py: r2y } = p(xMax, avgW * xMax + avgB)
    ctx.beginPath(); ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2.5
    ctx.moveTo(r1x, r1y); ctx.lineTo(r2x, r2y); ctx.stroke()
  }

  // Population-optimal line (blue)
  const { px: s1x, py: s1y } = p(xMin, wStar * xMin + bStar)
  const { px: s2x, py: s2y } = p(xMax, wStar * xMax + bStar)
  ctx.beginPath(); ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2.2
  ctx.moveTo(s1x, s1y); ctx.lineTo(s2x, s2y); ctx.stroke()

  // True function sin(x) (black)
  ctx.beginPath(); ctx.strokeStyle = '#111827'; ctx.lineWidth = 2.5
  for (let i = 0; i <= 250; i++) {
    const x = xMin + (xMax - xMin) * i / 250
    const { px, py } = p(x, Math.sin(x))
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
  }
  ctx.stroke()

  // Legend
  const fs = Math.max(9, Math.round(W * 0.040))
  ctx.font = `${fs}px sans-serif`
  const items = [
    { color: '#111827', label: 'f*(x) = sin(x)', lw: 2.5 },
    { color: '#1d4ed8', label: 'h*(x) = population-optimal linear', lw: 2.2 },
    { color: 'rgba(130,130,130,0.7)', label: 'fitted lines (each dataset)', lw: 1.5 },
    { color: '#dc2626', label: 'running average h̄ₘ(x)', lw: 2.5 }
  ]
  items.forEach(({ color, label, lw }, i) => {
    const lx = 7, ly = 12 + i * (fs + 5)
    ctx.strokeStyle = color; ctx.lineWidth = lw
    ctx.beginPath(); ctx.moveTo(lx, ly - 2); ctx.lineTo(lx + 15, ly - 2); ctx.stroke()
    ctx.fillStyle = '#374151'; ctx.textAlign = 'left'; ctx.font = `${fs}px sans-serif`
    ctx.fillText(label, lx + 20, ly)
  })
}

function draw() { drawLeft(); drawRight() }

function initCanvases() {
  ;[leftCanvas.value, rightCanvas.value].forEach(c => {
    if (!c) return
    const r = c.parentElement.getBoundingClientRect()
    c.width = Math.round(r.width) || 320
    c.height = Math.round(r.height) || 300
  })
}

onMounted(async () => {
  await nextTick()
  initCanvases()
  draw()
})
</script>

<template>
  <div class="flex flex-col h-full gap-2 select-none">
    <!-- Panels -->
    <div class="flex gap-3 flex-1 min-h-0">
      <!-- Left: parameter cloud -->
      <div class="flex-1 flex flex-col gap-1 min-w-0">
        <div class="text-[.58rem] font-bold uppercase tracking-wide text-gray-400">Parameter space</div>
        <div class="flex-1 relative border border-gray-200 rounded-lg overflow-hidden bg-white">
          <canvas ref="leftCanvas" class="block w-full h-full" />
        </div>
      </div>
      <!-- Right: function view -->
      <div class="flex-1 flex flex-col gap-1 min-w-0">
        <div class="text-[.58rem] font-bold uppercase tracking-wide text-gray-400">Hypothesis space (functions)</div>
        <div class="flex-1 relative border border-gray-200 rounded-lg overflow-hidden bg-white">
          <canvas ref="rightCanvas" class="block w-full h-full" />
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-3 flex-wrap">
      <button
        @click="addDataset"
        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[.65rem] font-semibold rounded-md transition-colors"
      >
        Draw another dataset
      </button>
      <button
        @click="reset"
        class="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-[.65rem] font-semibold rounded-md transition-colors"
      >
        Reset
      </button>
      <div class="flex items-center gap-2 text-[.62rem] text-gray-600">
        <label class="font-mono">N =</label>
        <input
          type="range" v-model.number="N" min="5" max="60" step="1"
          class="w-20 h-2 cursor-pointer accent-blue-600"
        />
        <span class="font-mono w-5 text-right">{{ N }}</span>
      </div>
      <span class="text-[.62rem] font-mono text-gray-500 ml-auto">M = {{ count }}</span>
    </div>

    <!-- Takeaway -->
    <div class="rounded-lg bg-gray-100 px-3 py-1.5 text-[.66rem] text-gray-700 text-center leading-snug">
      The spread of fitted lines around their average = <strong>variance</strong>. &nbsp;
      The systematic gap between the average and sin(x) = <strong>bias</strong>. &nbsp;
      Increasing N reduces variance but not bias.
    </div>
  </div>
</template>
