<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { setupHiDPICanvas, getLogicalSize, watchHiDPIResize } from './canvasHiDpi.js'

// ── Constants ─────────────────────────────────────────────────────────────────
const N_PTS  = 20
const NOISE  = 0.45
const xMin   = -Math.PI
const xMax   = Math.PI
const INTERP = N_PTS - 1   // d+1 = N_PTS → exact interpolation of noise-free targets

// This is the "beyond the interpolation threshold" version of the demo: the
// degree now ranges all the way into the heavily overparameterized regime
// (d+1 ≫ n) to show the double-descent second descent, not just the classical
// U-shape. A handful of log-spaced integer degrees (rather than every integer
// up to 500) keeps the slider and capacity curve responsive while still
// covering the full under- → interpolation → over-parameterized range.
function logSpacedDegrees(minD, maxD, count) {
  const out = new Set()
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1)
    out.add(Math.max(1, Math.round(minD * Math.pow(maxD / minD, t))))
  }
  out.add(INTERP)
  return Array.from(out).sort((a, b) => a - b)
}
const DEGREES    = logSpacedDegrees(1, 500, 28)
const MAX_DEGREE = DEGREES[DEGREES.length - 1]

function nearestDegreeIndex(target) {
  let bestI = 0, bestDiff = Infinity
  DEGREES.forEach((d, i) => { const diff = Math.abs(d - target); if (diff < bestDiff) { bestDiff = diff; bestI = i } })
  return bestI
}

// y-axis range is recomputed every draw() so wildly oscillating high-degree
// fits (Runge's phenomenon) stay fully visible instead of getting clipped.
let yMin = -2.8
let yMax = 2.8

// ── Vue state ─────────────────────────────────────────────────────────────────
// The slider drives an INDEX into DEGREES (log-spaced), not the degree itself —
// a linear 1..500 slider would waste almost all its travel on the "boring"
// high-capacity tail and make the interesting 1..19 region impossible to aim at.
const degIdx      = ref(nearestDegreeIndex(3))
const degree      = computed(() => DEGREES[degIdx.value])
const mainCanvas  = ref(null)
const curveCanvas = ref(null)
const trainMSE    = ref(0)
const testMSE     = ref(0)

// ── Plain data (managed imperatively, canvas redrawn on change) ───────────────
let xs = [], ys = []
let coeffs    = null
let prevCoefs = null
let animProg  = 1
let animRaf   = null

// Train/test MSE at each degree in DEGREES on the CURRENT dataset — recomputed
// once per dataset (not per slider move) and drawn as the capacity curve on
// the right-hand panel, recreating the full double-descent risk-vs-capacity
// shape (under-parameterized → interpolation threshold → over-parameterized)
// from real fits, extending ./assets/bias_variance_belkin.svg past the peak.
let curveTrain = []
let curveTest  = []

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

// ── Householder QR least squares ──────────────────────────────────────────────
// Solves min ||A c - b||. Used instead of normal equations (A^T A c = A^T y)
// for the overdetermined case: squaring A into A^T A also squares its condition
// number, which is catastrophic for near-Vandermonde polynomial bases once the
// degree approaches n − 1 (exactly the range this demo pushes up to, right at
// the interpolation threshold) — QR keeps the condition number at O(cond(A))
// instead of O(cond(A)^2), so train MSE correctly bottoms out near 0 there.
function qrLeastSquares(A, b) {
  const n = A.length, m = A[0].length
  const R = A.map(row => row.slice())
  const r = b.slice()
  for (let k = 0; k < m; k++) {
    let normX = 0
    for (let i = k; i < n; i++) normX += R[i][k] * R[i][k]
    normX = Math.sqrt(normX)
    if (normX < 1e-300) continue
    const alpha = R[k][k] >= 0 ? -normX : normX
    const v = new Array(n).fill(0)
    for (let i = k; i < n; i++) v[i] = R[i][k]
    v[k] -= alpha
    let vNorm = 0
    for (let i = k; i < n; i++) vNorm += v[i] * v[i]
    vNorm = Math.sqrt(vNorm)
    if (vNorm < 1e-300) continue
    for (let i = k; i < n; i++) v[i] /= vNorm
    for (let j = k; j < m; j++) {
      let dot = 0
      for (let i = k; i < n; i++) dot += v[i] * R[i][j]
      for (let i = k; i < n; i++) R[i][j] -= 2 * dot * v[i]
    }
    let dotB = 0
    for (let i = k; i < n; i++) dotB += v[i] * r[i]
    for (let i = k; i < n; i++) r[i] -= 2 * dotB * v[i]
  }
  const c = new Array(m).fill(0)
  for (let i = m - 1; i >= 0; i--) {
    let s = r[i]
    for (let j = i + 1; j < m; j++) s -= R[i][j] * c[j]
    c[i] = Math.abs(R[i][i]) > 1e-300 ? s / R[i][i] : 0
  }
  return c
}

// ── Chebyshev polynomial basis ────────────────────────────────────────────────
// Going into the hundreds of degrees rules out the raw monomial basis (1, u,
// u², …) used elsewhere: its Vandermonde matrix becomes catastrophically
// ill-conditioned long before d≈500. Chebyshev polynomials T_k(u) span the
// exact same space of degree-≤d polynomials — evaluating a fit is still
// "a polynomial of degree d" — but stay bounded in [-1,1] for u∈[-1,1] and are
// far better conditioned, which is what makes fitting out here numerically
// feasible at all.
function chebyshevRow(u, m) {
  const row = new Array(m)
  row[0] = 1
  if (m > 1) row[1] = u
  for (let k = 2; k < m; k++) row[k] = 2 * u * row[k - 1] - row[k - 2]
  return row
}

// ── Polynomial least squares (x normalized to [-1,1] for stability) ───────────
// overdetermined/exact (d+1 ≤ n): Householder QR least squares (see above)
// underdetermined      (d+1 > n): min-norm α via (A A^T + ridge·I) α = y, c = A^T α
//   A tiny ridge term keeps A A^T solvable once degree climbs into the
//   hundreds — with n = 20 samples, Chebyshev rows that far out numerically
//   start to look linearly dependent, which is real ill-conditioning, not a
//   bug — the ridge is what lets this demo push into that regime at all.
function polyFit(xArr, yArr, d) {
  const n = xArr.length, m = d + 1
  const xn = xArr.map(x => x / Math.PI)
  const A  = xn.map(x => chebyshevRow(x, m))
  if (m <= n) {
    return qrLeastSquares(A, yArr)
  } else {
    const AAt = Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => A[i].reduce((s, v, k) => s + v * A[j][k], 0)))
    let trace = 0
    for (let i = 0; i < n; i++) trace += AAt[i][i]
    const ridge = Math.max(trace / n, 1) * 1e-10
    for (let i = 0; i < n; i++) AAt[i][i] += ridge
    const al = gaussSolve(AAt, yArr.slice())
    return Array.from({length: m}, (_, j) => A.reduce((s, r, i) => s + r[j] * al[i], 0))
  }
}

function evalPoly(c, x) {
  const xn = x / Math.PI
  const row = chebyshevRow(xn, c.length)
  let v = 0
  for (let i = 0; i < c.length; i++) v += c[i] * row[i]
  return v
}

function evalBlended(prev, next, x, t) {
  return (prev ? evalPoly(prev, x) : 0) * (1 - t) + evalPoly(next, x) * t
}

function computeMSE(c, xArr, yArr) {
  return yArr.reduce((s, y, i) => s + (y - evalPoly(c, xArr[i])) ** 2, 0) / yArr.length
}

// Test error: MSE of the fitted polynomial against the true noise-free f*(x) = sin(x),
// densely sampled across the domain (population risk, not just at the 10 training x's).
function computeTrueMSE(c) {
  const N = 200
  let s = 0
  for (let i = 0; i <= N; i++) {
    const x = xMin + (xMax - xMin) * i / N
    const d = Math.sin(x) - evalPoly(c, x)
    s += d * d
  }
  return s / (N + 1)
}

// Recompute the y-axis range from the current data + fitted curve so the plot
// auto-scales instead of clipping when a high-degree fit oscillates wildly.
function computeYRange() {
  let lo = -1.15, hi = 1.15
  for (let i = 0; i < ys.length; i++) { lo = Math.min(lo, ys[i]); hi = Math.max(hi, ys[i]) }
  const N = 120
  for (let i = 0; i <= N; i++) {
    const x = xMin + (xMax - xMin) * i / N
    const y = evalBlended(prevCoefs, coeffs, x, animProg)
    if (Number.isFinite(y)) { lo = Math.min(lo, y); hi = Math.max(hi, y) }
  }
  const CLAMP = 12   // cap the zoom-out for pathological high-degree fits
  lo = Math.max(lo, -CLAMP); hi = Math.min(hi, CLAMP)
  const pad = Math.max((hi - lo) * 0.12, 0.25)
  return [lo - pad, hi + pad]
}

// "Nice" tick step (1/2/5 × 10^k) for a given range and target tick count
function niceYTicks(lo, hi, target = 5) {
  const span = Math.max(hi - lo, 1e-6)
  const rawStep = span / target
  const mag  = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const norm = rawStep / mag
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag
  const ticks = []
  const start = Math.ceil(lo / step) * step
  for (let v = start; v <= hi + step * 1e-6; v += step) {
    const r = Math.round(v / step) * step
    ticks.push(Math.abs(r) < step * 1e-6 ? 0 : Math.round(r * 1000) / 1000)
  }
  return ticks
}

function formatTick(v) {
  return String(Math.round(v * 100) / 100)
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
  computeCapacityCurve()
  refit(false)
}

// Fit each degree in DEGREES once on the current dataset and record its
// train/test MSE — this is what the right-hand capacity-curve panel plots.
function computeCapacityCurve() {
  curveTrain = []; curveTest = []
  for (const d of DEGREES) {
    const c = polyFit(xs, ys, d)
    curveTrain.push(computeMSE(c, xs, ys))
    curveTest.push(computeTrueMSE(c))
  }
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
  // Curve DATA only depends on the dataset (recomputed in generateDataset),
  // not on the selected degree — just redraw to move the "current d" marker.
  drawCurve()
}

watch(degIdx, () => refit(true))

// ── Canvas helpers ────────────────────────────────────────────────────────────
// W/H here are always the logical (unscaled) canvas size — see canvasHiDpi.js.
function toCanvas(W, H, x, y) {
  return {
    px: (x - xMin) / (xMax - xMin) * W,
    py: (1 - (y - yMin) / (yMax - yMin)) * H
  }
}

// ── Drawing ───────────────────────────────────────────────────────────────────
function draw() {
  const canvas = mainCanvas.value
  if (!canvas || !coeffs) return
  const ctx = canvas.getContext('2d')
  const { width: W, height: H } = getLogicalSize(canvas)

  ;[yMin, yMax] = computeYRange()
  const yTicks = niceYTicks(yMin, yMax)

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, W, H)

  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip()

  // Grid
  ctx.strokeStyle = 'rgba(200,200,200,0.6)'; ctx.lineWidth = 0.5
  yTicks.forEach(v => {
    const {py} = toCanvas(W, H, 0, v)
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke()
  })
  ;[-Math.PI, -Math.PI/2, 0, Math.PI/2, Math.PI].forEach(v => {
    const {px} = toCanvas(W, H, v, 0)
    ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke()
  })

  // Axes
  ctx.strokeStyle = 'rgba(100,100,100,0.4)'; ctx.lineWidth = 1
  const {py: y0} = toCanvas(W, H, 0, 0)
  ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke()
  const {px: x0} = toCanvas(W, H, 0, 0)
  ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, H); ctx.stroke()

  // Axis tick labels
  const lfs = Math.max(9, Math.round(W * 0.022))
  ctx.font = `${lfs}px monospace`; ctx.fillStyle = 'rgba(80,80,80,0.7)'
  ctx.textAlign = 'center'
  ;[[-Math.PI,'-π'], [-Math.PI/2,'-π/2'], [Math.PI/2,'π/2'], [Math.PI,'π']].forEach(([v,l]) => {
    const {px} = toCanvas(W, H, v, 0); ctx.fillText(l, px, y0 + 12)
  })
  ctx.textAlign = 'right'
  yTicks.filter(v => v !== 0).forEach(v => {
    const {py} = toCanvas(W, H, 0, v); ctx.fillText(formatTick(v), x0 - 5, py + 4)
  })

  // Residual segments (training point ↔ fitted value)
  xs.forEach((x, i) => {
    const yFit = evalBlended(prevCoefs, coeffs, x, animProg)
    const {px: px1, py: py1} = toCanvas(W, H, x, ys[i])
    const {px: px2, py: py2} = toCanvas(W, H, x, yFit)
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
    const {px, py} = toCanvas(W, H, x, y)
    if (py < -15 || py > H + 15) { moved = false; continue }
    moved ? ctx.lineTo(px, py) : (ctx.moveTo(px, py), moved = true)
  }
  ctx.stroke()

  // True sin(x) (black, on top)
  ctx.strokeStyle = '#111827'; ctx.lineWidth = 2.8
  ctx.beginPath()
  for (let i = 0; i <= 300; i++) {
    const x = xMin + (xMax - xMin) * i / 300
    const {px, py} = toCanvas(W, H, x, Math.sin(x))
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
  }
  ctx.stroke()

  // Training points (prominent, on top)
  xs.forEach((x, i) => {
    const {px, py} = toCanvas(W, H, x, ys[i])
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#2563eb'; ctx.fill()
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke()
  })

  ctx.restore()   // end clip

  // Train/test MSE — exposed as reactive refs and rendered as HTML overlay
  // (crisp text) instead of onto the canvas (rasterized, blurred after Slidev's zoom).
  trainMSE.value = computeMSE(coeffs, xs, ys)
  testMSE.value  = computeTrueMSE(coeffs)
}

// ── Capacity-curve panel: train/test MSE vs. polynomial degree ────────────────
// MSE spans many orders of magnitude (≈0 once d+1 ≥ n, up to Runge's-phenomenon
// blow-ups for wild high-degree fits), so the y-axis is log-scaled — the same
// reason ./assets/bias_variance_belkin.svg's risk axis needs a wide dynamic range.
const MSE_FLOOR = 1e-3
function logClamp(v) { return Math.log10(Math.max(v, MSE_FLOOR)) }

// x-axis is log-scaled too — DEGREES spans 1..500, and a linear axis would
// squeeze the entire classical regime (1..19) into a sliver at the left edge.
const DEG_MIN_LOG = Math.log10(DEGREES[0])
const DEG_MAX_LOG = Math.log10(MAX_DEGREE)

function drawCurve() {
  const canvas = curveCanvas.value
  if (!canvas || curveTrain.length === 0) return
  const ctx = canvas.getContext('2d')
  const { width: W, height: H } = getLogicalSize(canvas)

  const vals = [...curveTrain, ...curveTest].map(logClamp)
  let loLog = Math.floor(Math.min(...vals))
  let hiLog = Math.ceil(Math.max(...vals))
  if (hiLog <= loLog) hiLog = loLog + 1

  const M = { left: Math.max(26, Math.round(W * 0.09)), right: 6, top: 8, bottom: 16 }
  const plotW = W - M.left - M.right
  const plotH = H - M.top - M.bottom
  const xAt = d => M.left + (Math.log10(d) - DEG_MIN_LOG) / (DEG_MAX_LOG - DEG_MIN_LOG) * plotW
  const yAt = v => M.top + (hiLog - logClamp(v)) / (hiLog - loLog) * plotH

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, W, H)

  // Horizontal log-scale grid + tick labels
  const tfs = Math.max(7, Math.round(Math.min(W, H) * 0.06))
  ctx.font = `${tfs}px monospace`
  for (let e = loLog; e <= hiLog; e++) {
    const y = yAt(10 ** e)
    ctx.strokeStyle = 'rgba(200,200,200,0.6)'; ctx.lineWidth = 0.5
    ctx.beginPath(); ctx.moveTo(M.left, y); ctx.lineTo(W - M.right, y); ctx.stroke()
    ctx.fillStyle = 'rgba(80,80,80,0.7)'; ctx.textAlign = 'right'
    ctx.fillText(e === 0 ? '1' : `1e${e}`, M.left - 4, y + tfs * 0.32)
  }

  // Interpolation-threshold marker (d+1 = n): amber dashed, mirroring the
  // under-/over-fitting divider in bias_variance_belkin.svg. Unlike the
  // capped-at-threshold version of this demo, MAX_DEGREE now reaches far past
  // it, so the marker sits inside the plot with room either side.
  const threshX = xAt(INTERP)
  ctx.save()
  ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 2])
  ctx.beginPath(); ctx.moveTo(threshX, M.top); ctx.lineTo(threshX, H - M.bottom); ctx.stroke()
  ctx.restore()
  ctx.fillStyle = '#b45309'; ctx.font = `${Math.max(7, tfs - 1)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('interpolation', threshX, M.top + tfs * 0.8)

  // x-axis (degree) ticks — log-spaced
  ctx.fillStyle = 'rgba(80,80,80,0.7)'; ctx.font = `${tfs}px monospace`; ctx.textAlign = 'center'
  ;[1, 5, INTERP, 50, 150, MAX_DEGREE].forEach(d => ctx.fillText(String(d), xAt(d), H - 3))

  // Curves: test (green) drawn first, train (red) on top — matches the HTML
  // MSE-readout colors on the left panel
  const plot = (series, color, lw) => {
    ctx.strokeStyle = color; ctx.lineWidth = lw
    ctx.beginPath()
    series.forEach((v, i) => {
      const px = xAt(DEGREES[i]), py = yAt(v)
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    })
    ctx.stroke()
    series.forEach((v, i) => {
      ctx.beginPath(); ctx.arc(xAt(DEGREES[i]), yAt(v), 2, 0, Math.PI * 2)
      ctx.fillStyle = color; ctx.fill()
    })
  }
  plot(curveTest, '#059669', 2)
  plot(curveTrain, '#dc2626', 2)

  // Marker for the currently selected degree (ties this panel to the left one)
  const curX = xAt(degree.value)
  ctx.strokeStyle = 'rgba(37,99,235,0.55)'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(curX, M.top); ctx.lineTo(curX, H - M.bottom); ctx.stroke()
  ;[curveTrain[degIdx.value], curveTest[degIdx.value]].forEach(v => {
    ctx.beginPath(); ctx.arc(curX, yAt(v), 3.5, 0, Math.PI * 2)
    ctx.fillStyle = '#2563eb'; ctx.fill()
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke()
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

const trainMSELabel = computed(() => trainMSE.value < 5e-4 ? '≈ 0' : trainMSE.value.toFixed(3))
const testMSELabel  = computed(() => testMSE.value  < 5e-4 ? '≈ 0' : testMSE.value.toFixed(3))

// ── Init ──────────────────────────────────────────────────────────────────────
let stopResizeWatch = null

onMounted(async () => {
  await nextTick()
  setupHiDPICanvas(mainCanvas.value)
  setupHiDPICanvas(curveCanvas.value)
  generateDataset()

  // Re-fit the backing buffers whenever the window resizes (covers windowed,
  // presenter, and fullscreen mode — Slidev's presentation scale changes with
  // each), then redraw at the new resolution.
  stopResizeWatch = watchHiDPIResize(
    [() => mainCanvas.value, () => curveCanvas.value],
    () => { if (coeffs) draw(); drawCurve() }
  )
})

onBeforeUnmount(() => {
  if (animRaf) cancelAnimationFrame(animRaf)
  if (stopResizeWatch) stopResizeWatch()
})
</script>

<template>
  <div class="flex gap-3 h-full select-none">

    <!-- Left: polynomial regression demo — same as PolynomialBiasVarianceDemo2,
         but the fit now uses a Chebyshev basis so it stays numerically stable
         at degrees far beyond the interpolation threshold -->
    <div class="flex-1 flex flex-col gap-1.5 min-w-0">

      <!-- Controls -->
      <div class="flex items-center gap-4 flex-wrap shrink-0">

        <!-- Degree slider — log-spaced index into DEGREES, see script setup -->
        <div class="flex flex-col gap-0.5 flex-1 min-w-[220px]">
          <div class="flex items-center gap-2">
            <span class="text-[.58rem] font-bold uppercase tracking-wide text-gray-400">
              Polynomial degree (log scale)
            </span>
            <span class="text-[.7rem] font-mono font-semibold text-blue-700">d = {{ degree }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-[.58rem] font-mono text-gray-400">1</span>
            <div class="relative flex-1">
              <input
                type="range" v-model.number="degIdx" min="0" :max="DEGREES.length - 1" step="1"
                class="w-full h-2 cursor-pointer accent-blue-600"
              />
            </div>
            <span class="text-[.58rem] font-mono text-gray-400">{{ MAX_DEGREE }}</span>
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
      <div class="flex-1 min-h-0 relative border border-gray-200 rounded-lg overflow-hidden bg-white">
        <canvas ref="mainCanvas" class="block w-full h-full" />

        <!-- Legend (top-left) — HTML for crisp text, unlike canvas-drawn labels -->
        <div class="absolute top-1.5 left-2 flex flex-col gap-0.5 text-[.62rem] font-sans leading-tight pointer-events-none">
          <div class="flex items-center gap-1.5">
            <span class="inline-block w-3.5 h-[2.5px] rounded-full" style="background:#111827"></span>
            <span class="text-gray-700">f*(x) = sin(x)</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="inline-block w-3.5 h-[2.5px] rounded-full" style="background:#dc2626"></span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="inline-block w-2 h-2 rounded-full border border-white" style="background:#2563eb"></span>
            <span class="text-gray-700">training data (n = {{ N_PTS }})</span>
          </div>
        </div>

        <!-- MSE readout (top-right) — HTML for crisp text -->
        <div class="absolute top-1.5 right-2 flex flex-col items-end gap-0.5 text-[.68rem] font-mono font-semibold leading-tight pointer-events-none">
          <span style="color:#dc2626">train MSE = {{ trainMSELabel }}</span>
          <span style="color:#059669">test MSE (vs f*) = {{ testMSELabel }}</span>
        </div>
      </div>
    </div>

    <!-- Right: train/test MSE vs. hypothesis-space capacity (polynomial degree) —
         recreates the shape of ./assets/bias_variance_belkin.svg from real fits -->
    <div class="flex-1 flex flex-col gap-1.5 min-w-0">
      <div class="text-[.58rem] font-bold uppercase tracking-wide text-gray-400 shrink-0">
        Train / test error vs. hypothesis-space capacity (log–log)
      </div>
      <div class="flex-1 min-h-0 relative border border-gray-200 rounded-lg overflow-hidden bg-white">
        <canvas ref="curveCanvas" class="block w-full h-full" />

        <!-- Legend (top-left, clear of the y-axis tick margin) — HTML for crisp text -->
        <div class="absolute top-1 left-9 flex flex-col gap-0.5 text-[.58rem] font-sans leading-tight pointer-events-none">
          <span style="color:#dc2626">— train MSE</span>
          <span style="color:#059669">— test MSE</span>
        </div>
      </div>
      <div class="text-[.5rem] text-gray-400 text-center shrink-0">degree d (hypothesis-space capacity, log scale) →</div>
    </div>
  </div>
</template>
