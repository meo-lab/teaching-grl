<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

// ── Data generation ──────────────────────────────────────────────────────────
const N = 12
const xMin = -Math.PI, xMax = Math.PI

// Mulberry32 seeded RNG for reproducible fixed dataset
function mkRng(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateDataset() {
  const rng = mkRng(42)
  const xs = [], ys = []
  for (let i = 0; i < N; i++) {
    const x = xMin + (xMax - xMin) * rng()
    const y = Math.sin(x) + 0.3 * (rng() * 2 - 1)
    xs.push(x); ys.push(y)
  }
  return { xs, ys }
}

function ols(xs, ys) {
  const n = xs.length
  let sx = 0, sy = 0, sxx = 0, sxy = 0
  for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxx += xs[i] ** 2; sxy += xs[i] * ys[i] }
  const den = n * sxx - sx ** 2
  const w = den ? (n * sxy - sx * sy) / den : 0
  return { w, b: (sy - w * sx) / n }
}

function mse(w, b, xs, ys) {
  return ys.reduce((s, y, i) => s + (y - w * xs[i] - b) ** 2, 0) / ys.length
}

// ── State ─────────────────────────────────────────────────────────────────────
const { xs, ys } = generateDataset()
const opt = ols(xs, ys)
const wOpt = opt.w, bOpt = opt.b, mseOpt = mse(wOpt, bOpt, xs, ys)

const wVal = ref(0.5)
const bVal = ref(0.35)
const animating = ref(false)
const leftCanvas = ref(null)
const rightCanvas = ref(null)

const curMSE = computed(() => mse(wVal.value, bVal.value, xs, ys))

// ── Parameter space bounds ────────────────────────────────────────────────────
const wMin = -2.5, wMax = 2.5, bMin = -1.5, bMax = 1.5

// ── Canvas utilities ──────────────────────────────────────────────────────────
// Convert data coords to canvas pixels. For left panel: x=b, y=w (y-axis inverted).
function toCanvas(canvas, dx, dy, xRange, yRange) {
  return {
    px: (dx - xRange[0]) / (xRange[1] - xRange[0]) * canvas.width,
    py: (1 - (dy - yRange[0]) / (yRange[1] - yRange[0])) * canvas.height
  }
}
function fromCanvas(canvas, px, py, xRange, yRange) {
  return {
    x: px / canvas.width * (xRange[1] - xRange[0]) + xRange[0],
    y: (1 - py / canvas.height) * (yRange[1] - yRange[0]) + yRange[0]
  }
}

// ── Heatmap (built once) ──────────────────────────────────────────────────────
let heatmapImg = null

function buildHeatmap(canvas) {
  const GW = 120, GH = 120
  const data = new Uint8ClampedArray(GW * GH * 4)
  let mseMin = Infinity, mseMax = 0
  const vals = new Float32Array(GW * GH)
  for (let gy = 0; gy < GH; gy++) {
    for (let gx = 0; gx < GW; gx++) {
      const b = bMin + (bMax - bMin) * gx / (GW - 1)
      const w = wMax - (wMax - wMin) * gy / (GH - 1)
      const m = mse(w, b, xs, ys)
      vals[gy * GW + gx] = m
      if (m < mseMin) mseMin = m
      if (m > mseMax) mseMax = m
    }
  }
  const mseVis = mseMin + Math.min(mseMax - mseMin, 2.2)
  for (let i = 0; i < GW * GH; i++) {
    const t = Math.min(Math.max((vals[i] - mseMin) / (mseVis - mseMin), 0), 1)
    // white → yellow → red colormap
    data[i * 4]     = 255
    data[i * 4 + 1] = Math.round(255 * (1 - t) ** 0.6)
    data[i * 4 + 2] = Math.round(220 * (1 - t) ** 2)
    data[i * 4 + 3] = 255
  }
  const tmp = document.createElement('canvas')
  tmp.width = GW; tmp.height = GH
  tmp.getContext('2d').putImageData(new ImageData(data, GW, GH), 0, 0)
  heatmapImg = tmp
}

// ── Drawing ───────────────────────────────────────────────────────────────────
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

function drawLeft() {
  const canvas = leftCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const bRange = [bMin, bMax], wRange = [wMin, wMax]
  const p = (b, w) => toCanvas(canvas, b, w, bRange, wRange)

  ctx.clearRect(0, 0, W, H)
  if (heatmapImg) ctx.drawImage(heatmapImg, 0, 0, W, H)

  // Axis lines
  const { px: b0x } = p(0, 0), { py: w0y } = p(0, 0)
  ctx.strokeStyle = 'rgba(70,70,70,0.45)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(b0x, 0); ctx.lineTo(b0x, H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, w0y); ctx.lineTo(W, w0y); ctx.stroke()

  // Axis labels + ticks
  const fs = Math.max(10, Math.round(W * 0.046))
  ctx.font = `${fs}px sans-serif`; ctx.fillStyle = 'rgba(50,50,50,0.85)'
  ctx.textAlign = 'left';  ctx.fillText('w', 4, fs + 2)
  ctx.textAlign = 'right'; ctx.fillText('b', W - 2, H - 4)

  ctx.font = `${Math.max(9, fs - 2)}px monospace`
  ctx.fillStyle = 'rgba(60,60,60,0.75)'
  ctx.textAlign = 'center'
  ;[-1, 0, 1].forEach(v => {
    const { px } = p(v, 0); ctx.fillText(v === 0 ? '' : String(v), px, H - 3)
  })
  ctx.textAlign = 'right'
  ;[-2, -1, 0, 1, 2].forEach(v => {
    const { py } = p(0, v); ctx.fillText(String(v), b0x - 3, py + 4)
  })

  // Optimal star (blue)
  const { px: opx, py: opy } = p(bOpt, wOpt)
  drawStar(ctx, opx, opy, 7, '#1d4ed8', '#fff')

  // Current point (red, draggable)
  const { px: cpx, py: cpy } = p(bVal.value, wVal.value)
  ctx.beginPath(); ctx.arc(cpx, cpy, 7, 0, Math.PI * 2)
  ctx.fillStyle = '#dc2626'; ctx.fill()
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()
}

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
  ctx.strokeStyle = 'rgba(110,110,110,0.5)'; ctx.lineWidth = 1
  const { py: y0 } = p(0, 0); ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke()
  const { px: x0 } = p(0, 0); ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, H); ctx.stroke()

  // True function f*(x)=sin(x)
  ctx.beginPath(); ctx.strokeStyle = '#374151'; ctx.lineWidth = 2
  for (let i = 0; i <= 200; i++) {
    const x = xMin + (xMax - xMin) * i / 200
    const { px, py } = p(x, Math.sin(x))
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
  }
  ctx.stroke()

  // Residuals
  xs.forEach((x, i) => {
    const yPred = wVal.value * x + bVal.value
    const { px: rx1, py: ry1 } = p(x, ys[i])
    const { px: rx2, py: ry2 } = p(x, yPred)
    ctx.beginPath(); ctx.strokeStyle = 'rgba(220,38,38,0.38)'; ctx.lineWidth = 1.2
    ctx.moveTo(rx1, ry1); ctx.lineTo(rx2, ry2); ctx.stroke()
  })

  // Current hypothesis h(x)=wx+b
  const y1 = wVal.value * xMin + bVal.value, y2 = wVal.value * xMax + bVal.value
  ctx.beginPath(); ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2.5
  const { px: h1x, py: h1y } = p(xMin, y1), { px: h2x, py: h2y } = p(xMax, y2)
  ctx.moveTo(h1x, h1y); ctx.lineTo(h2x, h2y); ctx.stroke()

  // Data points
  xs.forEach((x, i) => {
    const { px, py } = p(x, ys[i])
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#2563eb'; ctx.fill()
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke()
  })

  // Legend
  const fs = Math.max(9, Math.round(W * 0.041))
  const items = [
    { color: '#374151', label: 'f*(x) = sin(x)', line: true, lw: 2 },
    { color: '#dc2626', label: `h(x) = ${wVal.value.toFixed(2)}x + (${bVal.value.toFixed(2)})`, line: true, lw: 2.5 },
    { color: '#2563eb', label: 'Training data', dot: true }
  ]
  ctx.font = `${fs}px sans-serif`
  items.forEach(({ color, label, line, dot, lw }, i) => {
    const lx = 8, ly = 11 + i * (fs + 5)
    if (line) {
      ctx.strokeStyle = color; ctx.lineWidth = lw
      ctx.beginPath(); ctx.moveTo(lx, ly - 2); ctx.lineTo(lx + 15, ly - 2); ctx.stroke()
    } else if (dot) {
      ctx.fillStyle = color
      ctx.beginPath(); ctx.arc(lx + 7, ly - 3, 3.5, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = '#374151'; ctx.font = `${fs}px sans-serif`
    ctx.textAlign = 'left'; ctx.fillText(label, lx + 20, ly)
  })
}

function draw() { drawLeft(); drawRight() }
watch([wVal, bVal], draw)

// ── Drag ──────────────────────────────────────────────────────────────────────
let isDragging = false

function getPos(e) {
  const c = leftCanvas.value, r = c.getBoundingClientRect()
  return {
    px: (e.clientX - r.left) * c.width / r.width,
    py: (e.clientY - r.top) * c.height / r.height
  }
}
function applyDrag(e) {
  if (!isDragging || animating.value) return
  const { px, py } = getPos(e)
  const d = fromCanvas(leftCanvas.value, px, py, [bMin, bMax], [wMin, wMax])
  bVal.value = Math.max(bMin, Math.min(bMax, d.x))
  wVal.value = Math.max(wMin, Math.min(wMax, d.y))
}
function startDrag(e) { if (!animating.value) { isDragging = true; applyDrag(e) } }
function endDrag() { isDragging = false }

// ── Animate to optimum ────────────────────────────────────────────────────────
function fitBestLine() {
  if (animating.value) return
  animating.value = true
  const sw = wVal.value, sb = bVal.value
  const dur = 700, t0 = performance.now()
  function step(t) {
    const pct = Math.min((t - t0) / dur, 1)
    const ease = pct < 0.5 ? 2 * pct ** 2 : -1 + (4 - 2 * pct) * pct
    wVal.value = sw + (wOpt - sw) * ease
    bVal.value = sb + (bOpt - sb) * ease
    if (pct < 1) requestAnimationFrame(step)
    else { wVal.value = wOpt; bVal.value = bOpt; animating.value = false }
  }
  requestAnimationFrame(step)
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  ;[leftCanvas.value, rightCanvas.value].forEach(c => {
    if (!c) return
    const r = c.parentElement.getBoundingClientRect()
    c.width = Math.round(r.width) || 320
    c.height = Math.round(r.height) || 300
  })
  buildHeatmap(leftCanvas.value)
  draw()
})
</script>

<template>
  <div class="flex flex-col h-full gap-2 select-none">
    <!-- Panels -->
    <div class="flex gap-3 flex-1 min-h-0">
      <!-- Left: parameter space -->
      <div class="flex-1 flex flex-col gap-1 min-w-0">
        <div class="text-[.58rem] font-bold uppercase tracking-wide text-gray-400">
          Parameter space &nbsp;(drag to explore)
        </div>
        <div
          class="flex-1 relative border border-gray-200 rounded-lg overflow-hidden cursor-crosshair bg-white"
          @mousedown="startDrag" @mousemove="applyDrag" @mouseup="endDrag" @mouseleave="endDrag"
        >
          <canvas ref="leftCanvas" class="block w-full h-full" style="touch-action:none" />
        </div>
        <div class="flex gap-4 text-[.6rem] font-mono">
          <span class="text-gray-600">w = {{ wVal.toFixed(3) }}</span>
          <span class="text-gray-600">b = {{ bVal.toFixed(3) }}</span>
          <span class="text-red-600 font-semibold">MSE = {{ curMSE.toFixed(3) }}</span>
          <span class="text-blue-700">min MSE = {{ mseOpt.toFixed(3) }}</span>
        </div>
      </div>
      <!-- Right: hypothesis -->
      <div class="flex-1 flex flex-col gap-1 min-w-0">
        <div class="text-[.58rem] font-bold uppercase tracking-wide text-gray-400">
          Selected hypothesis &nbsp;h<sub>w,b</sub>(x) = wx + b
        </div>
        <div class="flex-1 relative border border-gray-200 rounded-lg overflow-hidden bg-white">
          <canvas ref="rightCanvas" class="block w-full h-full" />
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-4">
      <button
        @click="fitBestLine" :disabled="animating"
        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[.65rem] font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Fit best line
      </button>
      <span class="text-[.6rem] text-gray-400">Color: training MSE ·  ⭐ = empirical optimum (w&#x0302;, b&#x0302;)</span>
    </div>

    <!-- Takeaway -->
    <div class="rounded-lg bg-gray-100 px-3 py-1.5 text-[.66rem] text-gray-700 text-center leading-snug">
      Training searches the hypothesis space for the hypothesis with the lowest empirical risk.
      Even the best-fitting line cannot reproduce sin(x) — the linear hypothesis space is too restrictive.
    </div>
  </div>
</template>
