<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { setupHiDPICanvas, getLogicalSize, toLogicalPoint, watchHiDPIResize } from './canvasHiDpi.js'

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
// W/H here are always the logical (unscaled) canvas size — see canvasHiDpi.js.
function toCanvas(W, H, dx, dy, xRange, yRange) {
  return {
    px: (dx - xRange[0]) / (xRange[1] - xRange[0]) * W,
    py: (1 - (dy - yRange[0]) / (yRange[1] - yRange[0])) * H
  }
}
function fromCanvas(W, H, px, py, xRange, yRange) {
  return {
    x: px / W * (xRange[1] - xRange[0]) + xRange[0],
    y: (1 - py / H) * (yRange[1] - yRange[0]) + yRange[0]
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
    //data[i * 4]     = 255
    //data[i * 4 + 1] = Math.round(255 * (1 - t) ** 0.6)
    //data[i * 4 + 2] = Math.round(220 * (1 - t) ** 2)
    //data[i * 4 + 3] = 255
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
  const { width: W, height: H } = getLogicalSize(canvas)
  const bRange = [bMin, bMax], wRange = [wMin, wMax]
  const p = (b, w) => toCanvas(W, H, b, w, bRange, wRange)

  ctx.clearRect(0, 0, W, H)
  if (heatmapImg) ctx.drawImage(heatmapImg, 0, 0, W, H)

  // Axis lines
  const { px: b0x } = p(0, 0), { py: w0y } = p(0, 0)
  ctx.strokeStyle = 'rgba(70,70,70,0.45)'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(b0x, 0); ctx.lineTo(b0x, H); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, w0y); ctx.lineTo(W, w0y); ctx.stroke()

  // Axis labels + ticks
  const fs = Math.max(9, Math.round(Math.min(W, H) * 0.052))
  ctx.font = `${fs}px sans-serif`; ctx.fillStyle = 'rgba(50,50,50,0.85)'
  ctx.textAlign = 'left';  ctx.fillText('w', 4, fs + 2)
  ctx.textAlign = 'right'; ctx.fillText('b', W - 2, H - 4)

  ctx.font = `${Math.max(8, fs - 2)}px monospace`
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
  const { width: W, height: H } = getLogicalSize(canvas)
  const xRange = [xMin, xMax], yRange = [-1.85, 1.85]
  const p = (x, y) => toCanvas(W, H, x, y, xRange, yRange)

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

  // Legend — sized off panel height too, since these panels are now short and
  // wide (stacked in a single narrow column) rather than roughly square.
  const fs = Math.max(7, Math.round(Math.min(W * 0.032, H * 0.11)))
  const items = [
    { color: '#374151', label: 'f*(x) = sin(x)', line: true, lw: 2 },
    { color: '#dc2626', label: `h(x) = ${wVal.value.toFixed(2)}x + (${bVal.value.toFixed(2)})`, line: true, lw: 2.5 },
    { color: '#2563eb', label: 'Data', dot: true }
  ]
  ctx.font = `${fs}px sans-serif`
  items.forEach(({ color, label, line, dot, lw }, i) => {
    const lx = 6, ly = fs + 1 + i * (fs + 3)
    if (line) {
      ctx.strokeStyle = color; ctx.lineWidth = lw
      ctx.beginPath(); ctx.moveTo(lx, ly - 2); ctx.lineTo(lx + 12, ly - 2); ctx.stroke()
    } else if (dot) {
      ctx.fillStyle = color
      ctx.beginPath(); ctx.arc(lx + 6, ly - 3, 3, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = '#374151'; ctx.font = `${fs}px sans-serif`
    ctx.textAlign = 'left'; ctx.fillText(label, lx + 16, ly)
  })
}

function draw() { drawLeft(); drawRight() }
watch([wVal, bVal], draw)

// ── Drag ──────────────────────────────────────────────────────────────────────
let isDragging = false

function getPos(e) {
  // Convert on-screen (post-Slidev-scale) client coordinates into the canvas's
  // logical drawing space — not its high-DPI backing-buffer pixel space.
  const { x, y } = toLogicalPoint(leftCanvas.value, e.clientX, e.clientY)
  return { px: x, py: y }
}
function applyDrag(e) {
  if (!isDragging || animating.value) return
  const { px, py } = getPos(e)
  const { width, height } = getLogicalSize(leftCanvas.value)
  const d = fromCanvas(width, height, px, py, [bMin, bMax], [wMin, wMax])
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
let stopResizeWatch = null

onMounted(async () => {
  await nextTick()
  ;[leftCanvas.value, rightCanvas.value].forEach(c => { if (c) setupHiDPICanvas(c) })
  buildHeatmap(leftCanvas.value)
  draw()

  // Re-fit the backing buffers whenever the window resizes (covers windowed,
  // presenter, and fullscreen mode — Slidev's presentation scale changes with
  // each), then redraw at the new resolution. The heatmap raster itself is
  // resolution-independent (drawn scaled-to-fit), so it doesn't need rebuilding.
  stopResizeWatch = watchHiDPIResize(
    [() => leftCanvas.value, () => rightCanvas.value],
    draw
  )
})

onBeforeUnmount(() => {
  if (stopResizeWatch) stopResizeWatch()
})
</script>

<template>
  <div class="flex flex-col h-full gap-1.5 select-none">
    <!-- Row 1: parameter space kept SQUARE (b/w axes need equal pixel-per-unit
         scaling to look undistorted) + stats/controls filling the freed width -->
    <div class="flex gap-2.5 flex-1 min-h-0">
      <div class="flex flex-col gap-0.5 h-full" style="aspect-ratio: 1 / 1">
        <div class="text-[.46rem] font-bold uppercase tracking-wide text-gray-400 shrink-0">
          Parameter space
        </div>
        <div
          class="flex-1 min-h-0 relative border border-gray-200 rounded-lg overflow-hidden cursor-crosshair bg-white"
          @mousedown="startDrag" @mousemove="applyDrag" @mouseup="endDrag" @mouseleave="endDrag"
        >
          <canvas ref="leftCanvas" class="block w-full h-full" style="touch-action:none" />
        </div>
      </div>
      <div class="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
        <div class="text-[.46rem] text-gray-400">Drag the point to explore</div>
        <div class="flex flex-col gap-1 text-[.56rem] font-mono">
          <span class="text-gray-600">w = {{ wVal.toFixed(2) }}</span>
          <span class="text-gray-600">b = {{ bVal.toFixed(2) }}</span>
          <span class="text-red-600 font-semibold">MSE = {{ curMSE.toFixed(3) }}</span>
          <span class="text-blue-700">min MSE = {{ mseOpt.toFixed(3) }}</span>
        </div>
        <button
          @click="fitBestLine" :disabled="animating"
          class="mt-0.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[.56rem] font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-start"
        >
          Fit best line
        </button>
      </div>
    </div>

    <!-- Row 2: hypothesis (function) plot, full width -->
    <div class="flex-1 flex flex-col gap-0.5 min-h-0">
      <div class="text-[.46rem] font-bold uppercase tracking-wide text-gray-400 shrink-0">
        Selected hypothesis
      </div>
      <div class="flex-1 relative border border-gray-200 rounded-lg overflow-hidden bg-white">
        <canvas ref="rightCanvas" class="block w-full h-full" />
      </div>
    </div>
  </div>
</template>
