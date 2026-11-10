<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useIsSlideActive } from '@slidev/client'
import * as tf from '@tensorflow/tfjs'

const active = useIsSlideActive()
const canvas = ref(null)
// The architecture is written as a PyTorch nn.Sequential; every nn.Linear except the last is a hidden block,
// an activation module after it sets that block's activation. The last nn.Linear must output 2 logits.
const DEFAULT_CODE = `model = nn.Sequential(
    nn.Linear(2, 6),
    nn.Tanh(),
    nn.Linear(6, 2),
    nn.Tanh(),
    nn.Linear(2, 2),
)`
const code = ref(DEFAULT_CODE)
const codeError = ref('')
const blocks = ref([{ width: 6, activation: 'tanh' }, { width: 2, activation: 'tanh' }])
function parseCode(text) {
  const linears = []
  const re = /nn\.Linear\s*\(\s*(\d+)\s*,\s*(\d+)[^)]*\)|(?:nn\.)?(Tanh|ReLU|Sigmoid|Identity|GELU|LeakyReLU|Sine)\s*\([^)]*\)/g
  for (const m of text.matchAll(re)) {
    if (m[1]) linears.push({ fin: Number(m[1]), width: Number(m[2]), activation: 'linear' })
    else if (linears.length) linears[linears.length - 1].activation = m[3] === 'Identity' ? 'linear' : m[3] === 'LeakyReLU' ? 'leaky' : m[3].toLowerCase()
  }
  if (!linears.length) return { error: 'Write at least one nn.Linear.' }
  if (linears[0].fin !== 2) return { error: `The first nn.Linear needs 2 inputs (x₁, x₂), not ${linears[0].fin}.` }
  for (let i = 1; i < linears.length; i++)
    if (linears[i].fin !== linears[i - 1].width) return { error: `nn.Linear(${linears[i].fin}, ${linears[i].width}) expects ${linears[i].fin} inputs, but the previous layer has ${linears[i - 1].width}.` }
  const out = linears[linears.length - 1]
  if (out.width !== 2) return { error: `The last nn.Linear must output 2 logits (classes A, B), not ${out.width}.` }
  if (out.activation !== 'linear') return { error: 'Leave the last nn.Linear without activation: it outputs logits for softmax.' }
  const hidden = linears.slice(0, -1)
  if (hidden.length > 4) return { error: 'At most 4 hidden layers in this demo.' }
  if (hidden.some(b => b.width < 1 || b.width > 16)) return { error: 'Hidden layers need 1 to 16 neurons in this demo.' }
  return { blocks: hidden.map(b => ({ width: b.width, activation: b.activation })) }
}
let codeTimer = 0
watch(code, () => {
  clearTimeout(codeTimer)
  codeTimer = setTimeout(() => {
    const r = parseCode(code.value)
    codeError.value = r.error || ''
    if (r.blocks && JSON.stringify(r.blocks) !== JSON.stringify(blocks.value)) { blocks.value = r.blocks; rebuild() }
  }, 350)
})
function resetCode() { code.value = DEFAULT_CODE }
const selected = ref(0), pairIndex = ref(0), preset = ref('Circle')
const running = ref(false), ready = ref(false), step = ref(0), loss = ref(0), rate = ref(0.03)
const inspected = ref(null), revision = ref(0), error = ref('')
let weights = [], optimizer, samples = [], values = [], probabilities = [], frame = 0, last = 0, nextId = 0, disposed = false
const N = 25, W = 448, H = 270, pad = 30
const grid = Array.from({ length: N * N }, (_, i) => [-1.5 + 3 * (i % N) / (N - 1), -1.5 + 3 * Math.floor(i / N) / (N - 1)])
let bounds = { x: -1.7, y: -1.7, scale: 80 }
const stages = computed(() => [
  { label: 'Input', width: 2 },
  ...blocks.value.flatMap((b, i) => [{ label: `Linear ${i + 1}`, width: b.width }, { label: `${b.activation} ${i + 1}`, width: b.width }]),
  { label: 'Output logits', width: 2 },
])
const stage = computed(() => stages.value[selected.value] || stages.value[0])
const pairs = computed(() => Array.from({ length: stage.value.width }, (_, i) => Array.from({ length: stage.value.width - i - 1 }, (_, j) => [i, i + j + 1])).flat())
const pair = computed(() => pairs.value[pairIndex.value] || [0, 1])
const caption = computed(() => `${stage.value.label} — neurons ${pair.value[0] + 1} and ${pair.value[1] + 1} of ${stage.value.width}`)
const detail = computed(() => {
  revision.value
  const i = samples.findIndex(s => s.id === inspected.value)
  if (i < 0 || !values[selected.value]) return 'Hover a sample to follow it through the network.'
  const s = samples[i], v = values[selected.value][i]
  return `#${s.id} · ${s.c ? 'B (green)' : 'A (red)'} · x = (${s.x.map(n => n.toFixed(2)).join(', ')}) · shown = (${pair.value.map(j => v[j].toFixed(2)).join(', ')}) · P(B) = ${(probabilities[i][1] * 100).toFixed(1)}%`
})
function rng(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 } }
function makeData(name) {
  preset.value = name
  const rand = rng(42)
  nextId = 0
  samples = Array.from({ length: 80 }, (_, i) => {
    const c = i % 2
    let x
    if (name === 'Circle') { const a = rand() * Math.PI * 2, r = c ? 0.85 + rand() * 0.4 : Math.sqrt(rand()) * 0.48; x = [r * Math.cos(a), r * Math.sin(a)] }
    else if (name === 'XOR') { const a = i % 4; x = [(a < 2 ? -1 : 1) * (0.3 + rand() * 0.8), (a % 2 ? -1 : 1) * (0.3 + rand() * 0.8)]; return { id: nextId++, x, c: Number(x[0] * x[1] > 0) } }
    else x = [(c ? 0.65 : -0.65) + (rand() - 0.5) * 0.8, (rand() - 0.5) * 1.3]
    return { id: nextId++, x, c }
  })
  rebuild()
}
// GELU (tanh approximation, as in PyTorch's approximate='tanh')
function gelu(x) { return x.mul(0.5).mul(x.add(x.pow(3).mul(0.044715)).mul(Math.sqrt(2 / Math.PI)).tanh().add(1)) }
// Every selectable stage is retained; logits and probabilities stay separate.
function forward(input) {
  let h = input
  const stages = [h]
  blocks.value.forEach((b, i) => {
    h = h.matMul(weights[i].w).add(weights[i].b); stages.push(h)
    h = b.activation === 'tanh' ? h.tanh() : b.activation === 'relu' ? h.relu() : b.activation === 'sigmoid' ? h.sigmoid() : b.activation === 'leaky' ? tf.leakyRelu(h, 0.1) : b.activation === 'gelu' ? gelu(h) : b.activation === 'sine' ? h.sin() : h.clone(); stages.push(h)
  })
  const out = weights[weights.length - 1]
  const logits = h.matMul(out.w).add(out.b)
  stages.push(logits)
  return { stages, logits, probabilities: logits.softmax() }
}
function release() { weights.forEach(({ w, b }) => { w.dispose(); b.dispose() }); weights = []; optimizer?.dispose(); optimizer = undefined }
function rebuild() {
  running.value = false; cancelAnimationFrame(frame)
  if (!ready.value) return
  release()
  const widths = [2, ...blocks.value.map(b => b.width), 2]
  weights = tf.tidy(() => widths.slice(1).map((width, i) => ({
    w: tf.variable(tf.randomNormal([widths[i], width], 0, Math.sqrt(2 / (widths[i] + width)), 'float32', 170 + i)),
    b: tf.variable(tf.zeros([width])),
  })))
  optimizer = tf.train.adam(Number(rate.value))
  step.value = 0; selected.value = 0; pairIndex.value = 0; inspected.value = null
  evaluate()
}
function evaluate() {
  tf.tidy(() => {
    const result = forward(tf.tensor2d([...samples.map(s => s.x), ...grid]))
    values = result.stages.map(t => t.arraySync())
    probabilities = result.probabilities.arraySync()
    const labels = tf.oneHot(tf.tensor1d(samples.map(s => s.c), 'int32'), 2)
    loss.value = tf.losses.softmaxCrossEntropy(labels, result.logits.slice([0, 0], [samples.length, 2])).dataSync()[0]
  })
  revision.value++; draw()
}
function trainOnce() {
  if (!ready.value || !active.value) return
  tf.tidy(() => {
    const x = tf.tensor2d(samples.map(s => s.x)), y = tf.oneHot(tf.tensor1d(samples.map(s => s.c), 'int32'), 2)
    optimizer.minimize(() => tf.losses.softmaxCrossEntropy(y, forward(x).logits), false, weights.flatMap(w => [w.w, w.b]))
  })
  step.value++
}
function singleStep() { running.value = false; trainOnce(); evaluate() }
function tick(time) {
  if (!running.value || !active.value || disposed) return
  if (time - last > 60) { for (let i = 0; i < 4; i++) trainOnce(); evaluate(); last = time }
  frame = requestAnimationFrame(tick)
}
watch([running, active], () => { cancelAnimationFrame(frame); if (running.value && active.value) frame = requestAnimationFrame(tick) })
watch(rate, () => { if (optimizer) { optimizer.dispose(); optimizer = tf.train.adam(Number(rate.value)) } })
function select(i) { selected.value = i; pairIndex.value = 0; draw() }
function cycle() { pairIndex.value = (pairIndex.value + 1) % pairs.value.length; draw() }
function xy(v) { return [pad + (v[pair.value[0]] - bounds.x) * bounds.scale, H - pad - (v[pair.value[1]] - bounds.y) * bounds.scale] }
function draw() {
  const ctx = canvas.value?.getContext('2d'), data = values[selected.value]
  if (!ctx || !data) return
  // Robust bounds with equal units on both axes. Clip only extreme tails.
  const ranges = pair.value.map(j => {
    const sorted = data.map(v => v[j]).filter(Number.isFinite).sort((a,b) => a-b)
    return [sorted[Math.floor(sorted.length * 0.01)], sorted[Math.ceil(sorted.length * 0.99) - 1]]
  })
  const dx = Math.max(0.15, ranges[0][1] - ranges[0][0]) * 1.15, dy = Math.max(0.15, ranges[1][1] - ranges[1][0]) * 1.15
  const scale = Math.min((W - 2 * pad) / dx, (H - 2 * pad) / dy)
  bounds = { x: (ranges[0][0] + ranges[0][1]) / 2 - (W - 2 * pad) / scale / 2, y: (ranges[1][0] + ranges[1][1]) / 2 - (H - 2 * pad) / scale / 2, scale }
  ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#fafbfc'; ctx.fillRect(0, 0, W, H)
  ctx.save(); ctx.beginPath(); ctx.rect(pad, pad, W - 2 * pad, H - 2 * pad); ctx.clip()
  const offset = samples.length
  for (let row = 0; row < N - 1; row++) for (let col = 0; col < N - 1; col++) {
    const ids = [row*N+col, row*N+col+1, (row+1)*N+col+1, (row+1)*N+col]
    const p = ids.reduce((sum, i) => sum + probabilities[offset+i][1], 0) / 4
    ctx.fillStyle = p > 0.5 ? `rgba(20,150,83,${0.06 + (p-0.5)*0.3})` : `rgba(210,55,65,${0.06 + (0.5-p)*0.3})`
    ctx.beginPath(); ids.forEach((id, i) => { const [x,y] = xy(data[offset+id]); i ? ctx.lineTo(x,y) : ctx.moveTo(x,y) }); ctx.closePath(); ctx.fill()
  }
  ctx.strokeStyle = '#00000030'; ctx.lineWidth = 0.6
  for (let i = 0; i < N; i++) for (const vertical of [false, true]) {
    ctx.beginPath()
    for (let j = 0; j < N; j++) { const [x,y] = xy(data[offset + (vertical ? j*N+i : i*N+j)]); j ? ctx.lineTo(x,y) : ctx.moveTo(x,y) }
    ctx.stroke()
  }
  samples.forEach((s, i) => {
    const [x,y] = xy(data[i]); ctx.beginPath(); ctx.arc(x,y, s.id === inspected.value ? 6 : 3.8, 0, Math.PI*2)
    ctx.fillStyle = s.c ? '#159653' : '#d33748'; ctx.fill(); ctx.strokeStyle = s.id === inspected.value ? '#00457c' : '#ffffff'; ctx.lineWidth = s.id === inspected.value ? 2.5 : 1; ctx.stroke()
  })
  ctx.restore(); ctx.fillStyle = '#5f625f'; ctx.font = '11px "Exo 2"'
  ctx.fillText(`${bounds.x.toFixed(1)}`, pad, H-12)
  ctx.textAlign = 'right'; ctx.fillText((bounds.x + (W-2*pad)/scale).toFixed(1), W-pad, H-12)
  ctx.textAlign = 'center'; ctx.fillText(selected.value === 0 ? 'x₁' : `neuron ${pair.value[0]+1}`, W/2,H-8)
  ctx.save(); ctx.translate(12,H/2); ctx.rotate(-Math.PI/2); ctx.fillText(selected.value === 0 ? 'x₂' : `neuron ${pair.value[1]+1}`,0,0); ctx.restore(); ctx.textAlign = 'left'
  ctx.fillText((bounds.y+(H-2*pad)/scale).toFixed(1),pad,20); ctx.fillText(bounds.y.toFixed(1),pad,H-pad-4)
}
function pointer(event, click = false) {
  const rect = canvas.value.getBoundingClientRect(), x = (event.clientX-rect.left)*W/rect.width, y = (event.clientY-rect.top)*H/rect.height
  if (!values[selected.value]) return
  let nearest = -1, distance = Infinity
  samples.forEach((s,i) => { const p = xy(values[selected.value][i]), d = Math.hypot(p[0]-x,p[1]-y); if(d < distance) { nearest=i; distance=d } })
  if (click && selected.value === 0 && x >= pad && x <= W-pad && y >= pad && y <= H-pad) {
    if (event.ctrlKey || event.metaKey) { if (samples.length > 2) samples.splice(nearest,1) }
    else samples.push({ id: nextId++, x: [bounds.x+(x-pad)/bounds.scale, bounds.y+(H-pad-y)/bounds.scale], c: Number(event.shiftKey) })
    evaluate()
  } else if (distance < 14) { inspected.value = samples[nearest].id; draw() }
}
onMounted(async () => {
  try { await tf.ready(); if (disposed) return; ready.value = true; makeData('Circle') }
  catch (e) { error.value = 'Unable to initialize training. Reload this slide.'; console.error(e) }
})
onBeforeUnmount(() => { disposed = true; clearTimeout(codeTimer); cancelAnimationFrame(frame); release(); values = []; probabilities = [] })
// Read-only diagnostics for browser regression checks, never shown in the slide.
defineExpose({ diagnostics: () => ({ tensors: tf.memory().numTensors, step: step.value, loss: loss.value, samples: samples.length, stages: values.length, inspected: inspected.value, running: running.value, active: active.value, values: values.map(s => s.slice(0, samples.length)), probabilities: probabilities.slice(0, samples.length) }) })
</script>

<template>
  <div class="mlp-demo" @click.stop @dblclick.stop @pointerdown.stop @keydown="e => { if (['INPUT','SELECT','BUTTON','TEXTAREA'].includes(e.target.tagName)) e.stopPropagation() }">
    <div class="controls">
      <div class="row presets"><button v-for="name in ['Circle', 'XOR', 'Two clusters']" :key="name" :class="{ chosen: preset === name }" @click="makeData(name)">{{ name }}</button></div>
      <div class="row"><button class="primary" :disabled="!ready" @click="running = !running">{{ running ? 'Pause' : 'Train' }}</button><button :disabled="!ready" @click="singleStep">Step</button><button :disabled="!ready" @click="rebuild">Reset model</button></div>
      <div class="row metrics"><label>Rate <select v-model="rate" aria-label="Learning rate"><option :value="0.01">0.01</option><option :value="0.03">0.03</option><option :value="0.1">0.1</option></select></label><span>Step {{ step }} · loss {{ loss.toFixed(3) }}</span></div>
      <div class="code-head"><span>PyTorch model (edit me)</span><button @click="resetCode">reset</button></div>
      <textarea v-model="code" class="code" spellcheck="false" autocapitalize="off" autocomplete="off" rows="8" aria-label="PyTorch model definition" />
      <div v-if="codeError" class="code-error">{{ codeError }}</div>
      <div class="note">Show layer:</div>
      <div class="chips">
        <button v-for="(st, i) in stages" :key="i" :class="{ chosen: selected === i }" @click="select(i)">{{ i === 0 ? 'input' : i === stages.length - 1 ? 'logits' : st.label }}</button>
      </div>
    </div>
    <div class="visual">
      <div class="plot-heading"><strong>{{ caption }}</strong><button :disabled="pairs.length === 1" @click="cycle">Cycle pair</button></div>
      <canvas ref="canvas" :width="W*2" :height="H*2" aria-label="Transformed feature space: red class A and green class B" @pointermove="pointer($event)" @pointerdown="pointer($event,true)" @contextmenu.prevent />
      <div class="detail">{{ error || detail }}</div>
      <div class="note">{{ selected === 0 ? 'Click: add A · Shift+click: add B · Ctrl/⌘+click: remove nearest' : 'Hover or click: inspect a sample · Select Input to edit data' }}<br><span class="red">● A</span> <span class="green">● B</span> · Background: final prediction · Lines: transformed input grid</div>
    </div>
  </div>
</template>

<style scoped>
.mlp-demo { display: grid; grid-template-columns: 258px minmax(0,1fr); gap: 18px; height: 350px; font: 12px/1.25 "Exo 2", sans-serif; color: #222; }
.controls, .visual { min-width: 0; }
.row { display: flex; gap: 5px; align-items: center; margin-bottom: 6px; }
button, select { font: inherit; color: #00457c; background: white; border: 1px solid #cbd5dd; border-radius: 3px; min-height: 25px; padding: 3px 7px; cursor: pointer; }
button:hover { background: #edf3f8; }
button:focus-visible, select:focus-visible { outline: 2px solid #f2c300; outline-offset: 1px; }
button:disabled { opacity: .4; cursor: default; }
.primary { background: #00457c; color: white; min-width: 54px; }
.chosen { background: #e9f1f7; border-color: #00457c !important; box-shadow: inset 3px 0 #f2c300; }
.presets button { flex: 1; padding-inline: 4px; }
.metrics { justify-content: space-between; font-size: 11px; }
.metrics select { padding: 1px; min-height: 23px; }
.code-head { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #5f625f; font-weight: 600; margin-top: 2px; }
.code-head button { min-height: 20px; padding: 0 6px; font-size: 10px; }
textarea.code { width: 100%; resize: none; margin-top: 2px; border: 1px solid #cbd5dd !important; border-radius: 4px; padding: 5px 7px !important; background: #f6f8fa !important; color: #1f2328; font: 11px/1.35 ui-monospace, "Fira Code", Menlo, monospace; outline: none; }
textarea.code:focus { border-color: #00457c !important; }
.code-error { font-size: 10px; color: #d33748; line-height: 1.2; margin-top: 1px; }
.chips { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 2px; }
.chips button { min-height: 20px; padding: 1px 6px; font-size: 10.5px; }
.plot-heading { display: flex; justify-content: space-between; align-items: center; height: 29px; gap: 5px; color: #00457c; }
.plot-heading strong { font-size: 12px; }
.plot-heading button { white-space: nowrap; font-size: 11px; }
canvas { width: 100%; height: 270px; display: block; border: 1px solid #d7d9d8; cursor: crosshair; }
.detail { font-size: 10px; min-height: 14px; padding-top: 2px; }
.note { font-size: 10px; color: #5f625f; margin-top: 1px; line-height: 1.2; }
.red { color: #d33748; font-weight: bold; }.green { color: #159653; font-weight: bold; }
</style>
