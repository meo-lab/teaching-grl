<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useIsSlideActive } from '@slidev/client'
import * as tf from '@tensorflow/tfjs'

const active = useIsSlideActive()

// --- Deterministic data: 10 training points + 10 held-out test points -----
// sampled from the same noisy sine signal, with test x's interleaved between
// training x's so the demo measures interpolation/generalization, not extrapolation.
function rng(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
}
const DOMAIN = [0, 2 * Math.PI]
const N = 10
const STEP = (DOMAIN[1] - DOMAIN[0]) / N
const rand = rng(20240516)
const trainX = Array.from({ length: N }, (_, i) => DOMAIN[0] + (i + 0.5) * STEP)
const trainY = trainX.map(x => Math.sin(x) + (rand() - 0.5) * 1.2)
const testX = Array.from({ length: N }, (_, i) => DOMAIN[0] + (i + 1) * STEP)
const testY = testX.map(x => Math.sin(x) + (rand() - 0.5) * 1.2)

// Normalization: x -> [-1, 1]; y -> zero mean / unit std (computed on training data only).
const xMean = (DOMAIN[0] + DOMAIN[1]) / 2, xHalfRange = (DOMAIN[1] - DOMAIN[0]) / 2
const yMean = trainY.reduce((a, b) => a + b, 0) / N
const yStd = Math.sqrt(trainY.reduce((a, b) => a + (b - yMean) ** 2, 0) / N) || 1
const normX = x => (x - xMean) / xHalfRange
const normY = y => (y - yMean) / yStd
const denormY = y => y * yStd + yMean

// --- Plot geometry ----------------------------------------------------------
const MW = 420, MH = 190, mpad = { l: 30, r: 10, t: 10, b: 24 }
const LW = 420, LH = 78, lpad = { l: 34, r: 10, t: 8, b: 18 }
const yDomain = [-1.8, 1.8]
function toMainPx(x, y) {
  return {
    x: mpad.l + (x - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0]) * (MW - mpad.l - mpad.r),
    y: MH - mpad.b - (y - yDomain[0]) / (yDomain[1] - yDomain[0]) * (MH - mpad.t - mpad.b),
  }
}

// --- State -------------------------------------------------------------------
const mainCanvas = ref(null)
const lossCanvas = ref(null)
const training = ref(false)
const trained = ref(false)
const showTest = ref(false)
const status = ref('')
const trainLoss = ref(null)
const testLoss = ref(null)

let model = null
let curve = null // dense prediction curve, [{x, y}]
let lossHistory = []
let testLossHistory = [] // computed every step (monitoring only, never trained on)
let stopRequested = false
let disposed = false

function buildModel() {
  model?.dispose()
  model = tf.sequential({
    layers: [
      tf.layers.dense({ inputShape: [1], units: 64, activation: 'tanh' }),
      tf.layers.dense({ units: 64, activation: 'tanh' }),
      tf.layers.dense({ units: 48, activation: 'tanh' }),
      tf.layers.dense({ units: 1, activation: 'linear' }),
    ],
  })
  model.compile({ optimizer: tf.train.adam(0.02), loss: 'meanSquaredError' })
}

function updateCurve() {
  if (!model) return
  const gridX = Array.from({ length: 120 }, (_, i) => DOMAIN[0] + (DOMAIN[1] - DOMAIN[0]) * i / 119)
  const pred = tf.tidy(() => model.predict(tf.tensor2d(gridX.map(normX), [gridX.length, 1])).dataSync())
  curve = gridX.map((x, i) => ({ x, y: denormY(pred[i]) }))
}

async function fitModel() {
  if (training.value || !active.value) return
  training.value = true
  trained.value = false
  showTest.value = false
  testLoss.value = null
  status.value = 'Training…'
  lossHistory = []
  testLossHistory = []
  stopRequested = false
  buildModel()

  const xs = tf.tensor2d(trainX.map(normX), [N, 1])
  const ys = tf.tensor2d(trainY.map(normY), [N, 1])
  // Test tensors are only ever used to *monitor* generalization in the background
  // during training (never for gradients/fitting) so the loss chart can later show
  // the full test-loss curve, not just its final value.
  const xsTest = tf.tensor2d(testX.map(normX), [N, 1])
  const ysTest = tf.tensor2d(testY.map(normY), [N, 1])
  const maxEpochs = 6000
  const batch = 2
  let epoch = 0
  try {
    while (epoch < maxEpochs && !stopRequested && active.value) {
      const h = await model.fit(xs, ys, { epochs: batch, shuffle: false, verbose: 0 })
      if (disposed) return
      epoch += batch
      const l = h.history.loss[h.history.loss.length - 1]
      lossHistory.push(l)
      testLossHistory.push(tf.tidy(() => tf.losses.meanSquaredError(ysTest, model.predict(xsTest)).dataSync()[0]))
      updateCurve()
      drawMain()
      drawLoss()
      // Train (almost) to zero, so the prediction curve visibly passes through
      // every training point, not just close to them.
      if (l < 1e-6) break
      // Deliberately paced (not just a raf yield) so the curve visibly bends
      // toward the training points during a live presentation.
      await new Promise(resolve => setTimeout(resolve, 30))
    }
    if (lossHistory.length) trainLoss.value = lossHistory[lossHistory.length - 1]
    trained.value = true
    status.value = 'Training complete.'
  }
  finally {
    xs.dispose(); ys.dispose(); xsTest.dispose(); ysTest.dispose()
    training.value = false
  }
}

function revealTest() {
  if (!trained.value || !model) return
  showTest.value = true
  if (testLossHistory.length) testLoss.value = testLossHistory[testLossHistory.length - 1]
  drawMain()
  drawLoss()
}

// --- Rendering ----------------------------------------------------------------
function drawMain() {
  const ctx = mainCanvas.value?.getContext('2d')
  if (!ctx) return
  ctx.setTransform(2, 0, 0, 2, 0, 0)
  ctx.clearRect(0, 0, MW, MH)
  ctx.fillStyle = '#fafbfc'; ctx.fillRect(0, 0, MW, MH)
  ctx.save(); ctx.beginPath(); ctx.rect(mpad.l, mpad.t, MW - mpad.l - mpad.r, MH - mpad.t - mpad.b); ctx.clip()

  // true signal (subtle dashed reference)
  ctx.strokeStyle = '#b7bcc4'; ctx.lineWidth = 1.4; ctx.setLineDash([4, 3]); ctx.beginPath()
  for (let i = 0; i <= 120; i++) {
    const x = DOMAIN[0] + (DOMAIN[1] - DOMAIN[0]) * i / 120
    const p = toMainPx(x, Math.sin(x))
    i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)
  }
  ctx.stroke(); ctx.setLineDash([])

  // model prediction
  if (curve) {
    ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2.2; ctx.beginPath()
    curve.forEach((pt, i) => { const p = toMainPx(pt.x, pt.y); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y) })
    ctx.stroke()
  }

  // test points (triangles), drawn under training dots
  if (showTest.value) {
    ctx.fillStyle = 'rgba(21,150,83,0.85)'
    testX.forEach((x, i) => {
      const p = toMainPx(x, testY[i]), r = 4.6
      ctx.beginPath(); ctx.moveTo(p.x, p.y - r); ctx.lineTo(p.x + r, p.y + r * 0.8); ctx.lineTo(p.x - r, p.y + r * 0.8); ctx.closePath()
      ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.stroke()
    })
  }

  // training points
  ctx.fillStyle = '#00457c'
  trainX.forEach((x, i) => {
    const p = toMainPx(x, trainY[i])
    ctx.beginPath(); ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.stroke()
  })
  ctx.restore()

  // axes
  ctx.strokeStyle = '#8b8f8d'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(mpad.l, MH - mpad.b); ctx.lineTo(MW - mpad.r, MH - mpad.b); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(mpad.l, mpad.t); ctx.lineTo(mpad.l, MH - mpad.b); ctx.stroke()
  ctx.fillStyle = '#5f625f'; ctx.font = '10px Arial'
  ctx.textAlign = 'center'; ctx.fillText('x', (mpad.l + MW - mpad.r) / 2, MH - 4)
  ctx.save(); ctx.translate(10, (mpad.t + MH - mpad.b) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('y', 0, 0); ctx.restore()
  ctx.textAlign = 'left'
}

function drawLoss() {
  const ctx = lossCanvas.value?.getContext('2d')
  if (!ctx) return
  ctx.setTransform(2, 0, 0, 2, 0, 0)
  ctx.clearRect(0, 0, LW, LH)
  ctx.fillStyle = '#fafbfc'; ctx.fillRect(0, 0, LW, LH)
  const plotW = LW - lpad.l - lpad.r, plotH = LH - lpad.t - lpad.b
  const logMin = -4, logMax = 0.5 // log10(loss) range
  const toY = l => lpad.t + plotH - (Math.log10(Math.max(l, 1e-5)) - logMin) / (logMax - logMin) * plotH

  ctx.strokeStyle = '#e4e6e5'; ctx.lineWidth = 1
  for (let l = logMin; l <= logMax; l++) {
    const y = toY(10 ** l)
    ctx.beginPath(); ctx.moveTo(lpad.l, y); ctx.lineTo(LW - lpad.r, y); ctx.stroke()
    ctx.fillStyle = '#8b8f8d'; ctx.font = '8px Arial'; ctx.textAlign = 'right'
    ctx.fillText(l === 0 ? '1' : `1e${l}`, lpad.l - 4, y + 3)
  }
  ctx.textAlign = 'left'

  if (lossHistory.length > 1) {
    ctx.strokeStyle = '#00457c'; ctx.lineWidth = 1.6; ctx.beginPath()
    lossHistory.forEach((l, i) => {
      const x = lpad.l + plotW * i / (lossHistory.length - 1)
      const y = toY(l)
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
    })
    ctx.stroke()
  }

  // Test loss was tracked every step during training but only shown once "Show
  // test data" is clicked, so it appears as a full curve, not just a final value.
  if (showTest.value && testLossHistory.length > 1) {
    ctx.strokeStyle = '#159653'; ctx.lineWidth = 1.6; ctx.setLineDash([3, 2]); ctx.beginPath()
    testLossHistory.forEach((l, i) => {
      const x = lpad.l + plotW * i / (testLossHistory.length - 1)
      const y = toY(l)
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
    })
    ctx.stroke(); ctx.setLineDash([])
  }

  ctx.fillStyle = '#5f625f'; ctx.font = '9px Arial'; ctx.textAlign = 'center'
  ctx.fillText('epoch', (lpad.l + LW - lpad.r) / 2, LH - 3)
  ctx.textAlign = 'left'
}

watch(active, (isActive) => { if (isActive) { drawMain(); drawLoss() } else { stopRequested = true } })

onMounted(() => { drawMain(); drawLoss() })
onBeforeUnmount(() => {
  disposed = true
  stopRequested = true
  model?.dispose()
  model = null
})

defineExpose({ diagnostics: () => ({ tensors: tf.memory().numTensors, training: training.value, trained: trained.value, trainLoss: trainLoss.value, testLoss: testLoss.value, showTest: showTest.value }) })
</script>

<template>
  <div class="of-demo" @click.stop @dblclick.stop @pointerdown.stop @keydown="e => { if (['BUTTON'].includes(e.target.tagName)) e.stopPropagation() }">
    <div class="row">
      <button class="primary" :disabled="training" @click="fitModel">{{ trained ? 'Fit again' : 'Fit the model' }}</button>
      <button :disabled="!trained || showTest" @click="revealTest">Show test data</button>
      <span class="status">{{ status }}</span>
    </div>

    <div class="legend">
      <span><i class="sw sw-line sw-signal"></i>True signal</span>
      <span><i class="sw sw-dot sw-train"></i>Training data</span>
      <span><i class="sw sw-line sw-pred"></i>Model prediction</span>
      <span :class="{ dim: !showTest }"><i class="sw sw-tri sw-test"></i>Test data</span>
    </div>

    <canvas ref="mainCanvas" :width="MW * 2" :height="MH * 2" class="main-canvas" aria-label="Sine regression demo: training points, true signal, and model prediction curve" />

    <div class="loss-row">
      <canvas ref="lossCanvas" :width="LW * 2" :height="LH * 2" class="loss-canvas" aria-label="Training loss curve on a logarithmic scale" />
      <div class="loss-readout">
        <div v-if="trainLoss != null">Train MSE <strong>{{ trainLoss.toFixed(4) }}</strong></div>
        <div v-if="testLoss != null" class="test-loss">Test MSE <strong>{{ testLoss.toFixed(4) }}</strong></div>
      </div>
    </div>

    <div class="takeaway">A perfect training fit can still generalize poorly.</div>
  </div>
</template>

<style scoped>
.of-demo { display: flex; flex-direction: column; gap: 6px; font: 12px/1.25 Arial, Helvetica, sans-serif; color: #222; }
.row { display: flex; align-items: center; gap: 8px; }
button { font: inherit; font-size: 11px; color: #00457c; background: white; border: 1px solid #cbd5dd; border-radius: 3px; min-height: 24px; padding: 3px 9px; cursor: pointer; }
button:hover:not(:disabled) { background: #edf3f8; }
button:focus-visible { outline: 2px solid #f2c300; outline-offset: 1px; }
button:disabled { opacity: .45; cursor: default; }
.primary { background: #00457c; color: white; }
.primary:hover:not(:disabled) { background: #003a68; }
.status { font-size: 10.5px; color: #5f625f; }

.legend { display: flex; flex-wrap: wrap; gap: 10px; font-size: 9.5px; color: #5f625f; }
.legend .dim { opacity: .4; }
.sw { display: inline-block; width: 12px; height: 8px; margin-right: 3px; vertical-align: middle; }
.sw-line { height: 2px; margin-bottom: 2px; }
.sw-signal { background: repeating-linear-gradient(90deg, #b7bcc4 0 3px, transparent 3px 5px); }
.sw-pred { background: #d97706; }
.sw-dot { width: 8px; height: 8px; border-radius: 50%; background: #00457c; }
.sw-tri { width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 8px solid #159653; background: none; }

.main-canvas { width: 100%; height: 178px; display: block; border: 1px solid #d7d9d8; background: #fafbfc; }
.loss-row { display: flex; align-items: center; gap: 8px; }
.loss-canvas { flex: 1 1 auto; min-width: 0; height: 66px; display: block; border: 1px solid #d7d9d8; background: #fafbfc; }
.loss-readout { flex: 0 0 auto; font-size: 10px; color: #222; white-space: nowrap; }
.loss-readout strong { color: #00457c; }
.loss-readout .test-loss strong { color: #159653; }

.takeaway { font-size: 10.5px; font-weight: 700; color: #00457c; border-left: 3px solid #f2c300; padding-left: 7px; line-height: 1.25; }
</style>
