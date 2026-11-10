// Shared data + maths for the Lecture 4 loss-surface demos.
// Everything is deterministic (seeded), so slides, screenshots and the
// numbers quoted in the speaker notes always agree.

export type Pt = { x: number, y: number }
export type Pt2 = { x1: number, x2: number, y: 0 | 1 }

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(rng: () => number) {
  const u = Math.max(rng(), 1e-12)
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// ---------------------------------------------------------------------------
// Linear regression: standardized elevation x -> standardized temperature y
// y = beta0 + beta1 * x + noise
export const LIN_TRUTH = { b0: 0.1, b1: -0.5 }
export const LIN_RANGE = { b1: [-1.5, 1.5] as [number, number], b0: [-1.5, 1.5] as [number, number] }

export const LIN_DATA: Pt[] = (() => {
  const rng = mulberry32(7)
  const pts: Pt[] = []
  for (let i = 0; i < 20; i++) {
    const x = -1.4 + 2.8 * (i + 0.5 * rng()) / 20
    pts.push({ x, y: LIN_TRUTH.b0 + LIN_TRUTH.b1 * x + 0.12 * gauss(rng) })
  }
  return pts
})()

export type LinLoss = 'mse' | 'mae'

export function linLoss(b0: number, b1: number, kind: LinLoss = 'mse') {
  let s = 0
  for (const p of LIN_DATA) {
    const r = b0 + b1 * p.x - p.y
    s += kind === 'mse' ? 0.5 * r * r : Math.abs(r)
  }
  return s / LIN_DATA.length
}

export function linGrad(b0: number, b1: number, kind: LinLoss = 'mse'): [number, number] {
  let g0 = 0
  let g1 = 0
  for (const p of LIN_DATA) {
    const r = b0 + b1 * p.x - p.y
    const d = kind === 'mse' ? r : Math.sign(r)
    g0 += d
    g1 += d * p.x
  }
  return [g0 / LIN_DATA.length, g1 / LIN_DATA.length]
}

// Closed-form OLS optimum (for the "best model" marker)
export const LIN_OLS = (() => {
  const n = LIN_DATA.length
  const mx = LIN_DATA.reduce((s, p) => s + p.x, 0) / n
  const my = LIN_DATA.reduce((s, p) => s + p.y, 0) / n
  let sxy = 0
  let sxx = 0
  for (const p of LIN_DATA) {
    sxy += (p.x - mx) * (p.y - my)
    sxx += (p.x - mx) ** 2
  }
  const b1 = sxy / sxx
  return { b0: my - b1 * mx, b1 }
})()

// ---------------------------------------------------------------------------
// Logistic regression without bias: p = sigma(w1 x1 + w2 x2)
// Same setup as the course notebook (logistic_regression.py): 20 samples per class,
// class 0 ~ N((-1, 3), 0.5 I) upper-left, class 1 ~ N((3, -2), 0.5 I) lower-right.
// Good models sit at w1 > 0, w2 < 0, as in the notebook's plots.
export const LOG_RANGE = { w1: [-10, 10] as [number, number], w2: [-10, 10] as [number, number] }

export const LOG_DATA: Pt2[] = (() => {
  const rng = mulberry32(11)
  const sd = Math.sqrt(0.5)
  const pts: Pt2[] = []
  for (let i = 0; i < 20; i++)
    pts.push({ x1: -1 + sd * gauss(rng), x2: 3 + sd * gauss(rng), y: 0 })
  for (let i = 0; i < 20; i++)
    pts.push({ x1: 3 + sd * gauss(rng), x2: -2 + sd * gauss(rng), y: 1 })
  return pts
})()

export function sigmoid(z: number) {
  return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z))
}

function softplus(z: number) {
  return z > 30 ? z : Math.log1p(Math.exp(z))
}

// mean binary cross-entropy, numerically stable
export function logLoss(w1: number, w2: number) {
  let s = 0
  for (const p of LOG_DATA) {
    const z = w1 * p.x1 + w2 * p.x2
    s += p.y === 1 ? softplus(-z) : softplus(z)
  }
  return s / LOG_DATA.length
}

export function logGrad(w1: number, w2: number): [number, number] {
  let g1 = 0
  let g2 = 0
  for (const p of LOG_DATA) {
    const d = sigmoid(w1 * p.x1 + w2 * p.x2) - p.y
    g1 += d * p.x1
    g2 += d * p.x2
  }
  return [g1 / LOG_DATA.length, g2 / LOG_DATA.length]
}

// Full-batch SGD on the mean BCE, identical to torch.optim.SGD(lr, momentum,
// weight_decay) with dampening 0: buf = mu * buf + g;  w -= lr * buf.
export type GDStep = { w1: number, w2: number, L: number }
export function runLogGD(opts: { init: [number, number], lr: number, momentum?: number, weightDecay?: number, epochs?: number }): GDStep[] {
  const mu = opts.momentum ?? 0
  const wd = opts.weightDecay ?? 0
  let [w1, w2] = opts.init
  let b1 = 0
  let b2 = 0
  const out: GDStep[] = [{ w1, w2, L: logLoss(w1, w2) }]
  for (let e = 0; e < (opts.epochs ?? 150); e++) {
    let [g1, g2] = logGrad(w1, w2)
    g1 += wd * w1
    g2 += wd * w2
    b1 = e === 0 ? g1 : mu * b1 + g1
    b2 = e === 0 ? g2 : mu * b2 + g2
    w1 -= opts.lr * b1
    w2 -= opts.lr * b2
    out.push({ w1, w2, L: logLoss(w1, w2) })
  }
  return out
}

// ---------------------------------------------------------------------------
// Colour map (viridis; low loss = yellow, high loss = dark purple), matching the
// matplotlib videos used on the momentum / logistic GD slides.
const VIRIDIS = [
  [68, 1, 84], [72, 40, 120], [62, 74, 137], [49, 104, 142], [38, 130, 142],
  [31, 158, 137], [53, 183, 121], [109, 205, 89], [180, 222, 44], [253, 231, 37],
]

export function viridis(t: number): [number, number, number] {
  // t = 0 -> low loss (yellow), t = 1 -> high loss (purple)
  const u = Math.min(1, Math.max(0, 1 - t)) * (VIRIDIS.length - 1)
  const i = Math.min(VIRIDIS.length - 2, Math.floor(u))
  const f = u - i
  const a = VIRIDIS[i]
  const b = VIRIDIS[i + 1]
  return [a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1]), a[2] + f * (b[2] - a[2])]
}

// Render a loss function over a 2D parameter box to a PNG data URL.
// (px, py) -> parameter values; rows go top (py max) to bottom (py min).
export function lossImage(
  f: (a: number, b: number) => number,
  xr: [number, number],
  yr: [number, number],
  opts: { n?: number, bands?: number, gamma?: number, lines?: boolean } = {},
) {
  const n = opts.n ?? 160
  const bands = opts.bands ?? 14
  const gamma = opts.gamma ?? 1
  const vals = new Float64Array(n * n)
  let lo = Infinity
  let hi = -Infinity
  for (let j = 0; j < n; j++) {
    const b = yr[1] - (j + 0.5) / n * (yr[1] - yr[0])
    for (let i = 0; i < n; i++) {
      const a = xr[0] + (i + 0.5) / n * (xr[1] - xr[0])
      const v = f(a, b)
      vals[j * n + i] = v
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
  }
  const level = (v: number) => Math.floor(((v - lo) / (hi - lo)) ** gamma * bands * 0.9999)
  const canvas = document.createElement('canvas')
  canvas.width = n
  canvas.height = n
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(n, n)
  for (let k = 0; k < n * n; k++) {
    const l = level(vals[k])
    const [r, g, bl] = viridis((l + 0.5) / bands)
    let edge = false
    if (opts.lines !== false) {
      const i = k % n
      const j = Math.floor(k / n)
      if (i + 1 < n && level(vals[k + 1]) !== l)
        edge = true
      if (j + 1 < n && level(vals[k + n]) !== l)
        edge = true
    }
    const m = edge ? 0.6 : 0
    img.data[4 * k] = r + m * (255 - r)
    img.data[4 * k + 1] = g + m * (255 - g)
    img.data[4 * k + 2] = bl + m * (255 - bl)
    img.data[4 * k + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return { url: canvas.toDataURL(), lo, hi }
}

// Predicted probability over the data space as a PNG data URL
// (orange = class 1, blue = class 0, lightened like the course figures).
export function probImage(w1: number, w2: number, range: [number, number], n = 90) {
  const c = document.createElement('canvas')
  c.width = n
  c.height = n
  const ctx = c.getContext('2d')!
  const im = ctx.createImageData(n, n)
  const o = [255, 121, 0]
  const b = [0, 69, 124]
  for (let j = 0; j < n; j++) {
    const x2 = range[1] - (j + 0.5) / n * (range[1] - range[0])
    for (let i = 0; i < n; i++) {
      const x1 = range[0] + (i + 0.5) / n * (range[1] - range[0])
      const p = sigmoid(w1 * x1 + w2 * x2)
      const k = 4 * (j * n + i)
      for (let ch = 0; ch < 3; ch++)
        im.data[k + ch] = 255 - 0.32 * (255 - (p * o[ch] + (1 - p) * b[ch]))
      im.data[k + 3] = 255
    }
  }
  ctx.putImageData(im, 0, 0)
  return c.toDataURL()
}
