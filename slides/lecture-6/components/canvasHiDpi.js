// Shared high-DPI canvas setup for Slidev demos.
//
// Slidev renders each slide at a fixed logical size and then scales the whole
// slide with a CSS transform to fit the viewport (windowed, presenter, and
// fullscreen modes all use different scale factors). If a canvas's backing
// buffer is sized directly from its on-screen box, that buffer gets enlarged
// by the transform and the result is blurry / non-uniformly stretched.
//
// offsetWidth/Height define the logical size in the unscaled Slidev layout.
// getBoundingClientRect() is used only to measure Slidev's presentation scale
// (rect size ÷ logical size). The backing buffer is then enlarged by
// devicePixelRatio × presentation scale (clamped) for sharp high-DPI rendering,
// while the 2D context is scaled so drawing code keeps working in logical units.

const logicalSizes = new WeakMap()

/**
 * Size a canvas's backing buffer for sharp rendering under Slidev's slide-scaling
 * transform, and reset the 2D context transform so all drawing stays in logical
 * (unscaled) coordinates. Safe to call repeatedly (e.g. on resize) — it always
 * sets an absolute transform rather than compounding a relative one.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ sizeFrom?: HTMLElement, minScale?: number, maxScale?: number }} [opts]
 *   sizeFrom: element whose box defines the logical size (defaults to canvas.parentElement)
 * @returns {{ width: number, height: number, renderScale: number }} logical size + scale used
 */
export function setupHiDPICanvas(canvas, opts = {}) {
  const { sizeFrom, minScale = 2, maxScale = 4 } = opts
  const el = sizeFrom || canvas.parentElement

  const logicalWidth  = el.offsetWidth  || canvas.width  || 1
  const logicalHeight = el.offsetHeight || canvas.height || 1

  const rect = el.getBoundingClientRect()
  const slideScale = Math.max(
    (rect.width  || logicalWidth)  / logicalWidth,
    (rect.height || logicalHeight) / logicalHeight
  ) || 1

  const dpr = window.devicePixelRatio || 1
  const renderScale = Math.min(maxScale, Math.max(minScale, dpr * slideScale))

  canvas.width  = Math.round(logicalWidth * renderScale)
  canvas.height = Math.round(logicalHeight * renderScale)

  const ctx = canvas.getContext('2d')
  ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0)

  const size = { width: logicalWidth, height: logicalHeight, renderScale }
  logicalSizes.set(canvas, size)
  return size
}

/** Logical (unscaled) drawing size for a canvas previously set up above. */
export function getLogicalSize(canvas) {
  return logicalSizes.get(canvas) || { width: canvas.width, height: canvas.height, renderScale: 1 }
}

/** Convert a pointer/mouse event's client coordinates into the canvas's logical space. */
export function toLogicalPoint(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect()
  const { width, height } = getLogicalSize(canvas)
  return {
    x: (clientX - rect.left) * width  / rect.width,
    y: (clientY - rect.top)  * height / rect.height,
  }
}

/**
 * Re-run setupHiDPICanvas for a list of canvases on window resize (debounced to
 * one rAF), returning a cleanup function to remove the listener.
 *
 * @param {Array<() => HTMLCanvasElement | null>} getCanvases
 * @param {() => void} onResized called once per resize after all canvases are re-sized
 */
export function watchHiDPIResize(getCanvases, onResized) {
  let raf = null
  const handler = () => {
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      raf = null
      for (const getCanvas of getCanvases) {
        const c = getCanvas()
        if (c) setupHiDPICanvas(c)
      }
      onResized()
    })
  }
  window.addEventListener('resize', handler)
  return () => {
    window.removeEventListener('resize', handler)
    if (raf) cancelAnimationFrame(raf)
  }
}
