<script setup lang="ts">
// Backpropagation step by step on a tiny network (graphical-model style of the deck):
//   x (2) → W → z = Wᵀx, h = ReLU(z) (3) → w → ŷ = wᵀh → L = (y − ŷ)²
// step 1 forward pass · 2 loss and ∂L/∂ŷ · 3 output weights ∂L/∂w_j · 4 back to the hidden neurons ∂L/∂h_j
// step 5 input weights ∂L/∂W_ij · 6 the whole backward pass · 7 update every weight, forward again: lower loss
import { computed } from 'vue'

const props = withDefaults(defineProps<{ step?: number, eta?: number }>(), { step: 1, eta: 0.1 })

const x = [1.0, 0.5]
const W0 = [[0.5, -0.2, 0.8], [0.4, 0.6, -0.3]] // W0[i][j]: x_i → h_j
const w0 = [0.8, -0.4, 0.3]
const y = 1
const relu = (v: number) => Math.max(0, v)
function forward(W: number[][], w: number[]) {
  const z = [0, 1, 2].map(j => x[0] * W[0][j] + x[1] * W[1][j])
  const h = z.map(relu)
  const yh = h.reduce((a, hj, j) => a + w[j] * hj, 0)
  return { z, h, yh, L: (y - yh) ** 2 }
}
const f = forward(W0, w0)
const dY = -2 * (y - f.yh)
const dw = f.h.map(h => dY * h)
const dh = w0.map(wj => dY * wj)
const dz = dh.map((d, j) => d * (f.z[j] > 0 ? 1 : 0))
const dW = x.map(xi => dz.map(d => xi * d))
const W1 = W0.map((r, i) => r.map((v, j) => v - props.eta * dW[i][j]))
const w1 = w0.map((v, j) => v - props.eta * dw[j])
const f1 = forward(W1, w1)

const s = computed(() => props.step)
const updated = computed(() => s.value >= 7)
const cur = computed(() => (updated.value ? f1 : f))

// geometry
const XS = [{ x: 60, y: 95 }, { x: 60, y: 205 }]
const HS = [{ x: 235, y: 55 }, { x: 235, y: 150 }, { x: 235, y: 245 }]
const YH = { x: 400, y: 150 }
const YT = { x: 490, y: 150 }
const R = 19
const fmt = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : (v < 0 ? '−' : '') + (Math.abs(v) + 1e-9).toFixed(2))
const along = (a: { x: number, y: number }, b: { x: number, y: number }, t: number) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })

// which layer is in focus
const outFocus = computed(() => s.value === 3)
const inFocus = computed(() => s.value === 5)
const BLUE = '#00457c'
const RED = '#d62728'
const GREEN = '#1e7a1e'
const it = 'font-family:serif;font-style:italic;line-height:1'
const lab = 'font-family:inherit;font-style:normal;line-height:1'
const halo = ';paint-order:stroke;stroke:white;stroke-width:4px'

// edge label for input weight W_ij: value (steps 1–2, 4), gradient (5–6), updated value (7)
function inLabel(i: number, j: number) {
  if (s.value === 0)
    return { t: '', c: BLUE }
  if (s.value >= 7)
    return { t: fmt(W1[i][j]), c: GREEN }
  if (s.value >= 5)
    return { t: fmt(dW[i][j]), c: RED }
  return { t: fmt(W0[i][j]), c: BLUE }
}
function outLabel(j: number) {
  if (s.value === 0)
    return { t: '', c: BLUE }
  if (s.value >= 7)
    return { t: fmt(w1[j]), c: GREEN }
  if (s.value >= 3)
    return { t: fmt(dw[j]), c: RED }
  return { t: fmt(w0[j]), c: BLUE }
}
// the one weight each step talks about (yellow glow + symbol): w₁ in steps 3–4, W₁₁ in step 5
const hlOut = computed(() => s.value === 3 || s.value === 4)
const hlIn = computed(() => s.value === 5)
const hlH = computed(() => s.value === 4 || s.value === 5)
const inT = (_i: number, _j: number) => 0.68 // labels near the hidden neuron, so crossing edges do not collide
</script>

<template>
  <svg :viewBox="step === 0 ? '20 20 510 330' : '20 20 510 290'" class="bps" role="img" :aria-label="`Backpropagation, step ${step} of 7, on a network with inputs x1, x2, three ReLU hidden neurons and output y-hat compared to the target y`">
    <defs>
      <marker id="bps-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#00457c" /></marker>
      <marker id="bps-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#d62728" /></marker>
    </defs>

    <!-- step 0 (overview): both directions, no numbers -->
    <template v-if="step === 0">
      <line x1="70" y1="296" x2="470" y2="296" stroke="#00457c" stroke-width="3" marker-end="url(#bps-a)" />
      <text :style="`font-size:15px;font-weight:700;${lab}`" x="270" y="288" text-anchor="middle" fill="#00457c">forward pass: prediction and loss</text>
      <line x1="470" y1="322" x2="70" y2="322" stroke="#d62728" stroke-width="3" marker-end="url(#bps-r)" />
      <text :style="`font-size:15px;font-weight:700;${lab}`" x="270" y="342" text-anchor="middle" fill="#d62728">backward pass: gradients for all weights</text>
    </template>

    <!-- forward / backward arrows -->
    <line v-if="step === 1" x1="70" y1="298" x2="390" y2="298" stroke="#00457c" stroke-width="3" marker-end="url(#bps-a)" />
    <text v-if="step === 1" :style="`font-size:12px;font-weight:700;${lab}`" x="150" y="292" text-anchor="middle" fill="#00457c">forward pass</text>
    <line v-if="step === 6" x1="470" y1="298" x2="70" y2="298" stroke="#d62728" stroke-width="3" marker-end="url(#bps-r)" />
    <text v-if="step === 6" :style="`font-size:12px;font-weight:700;${lab}`" x="320" y="292" text-anchor="middle" fill="#d62728">backward pass: one sweep, all gradients</text>

    <!-- highlight: glow under the weight in focus -->
    <line v-if="hlOut" :x1="HS[0].x + R" :y1="HS[0].y" :x2="YH.x - R" :y2="YH.y" style="stroke: #ffd400; stroke-width: 11; stroke-opacity: 0.55; stroke-linecap: round" />
    <line v-if="hlIn" :x1="XS[0].x + R" :y1="XS[0].y" :x2="HS[0].x - R" :y2="HS[0].y" style="stroke: #ffd400; stroke-width: 11; stroke-opacity: 0.55; stroke-linecap: round" />
    <circle v-if="hlH" :cx="HS[0].x" :cy="HS[0].y" :r="R + 6" style="fill: #ffd400; fill-opacity: 0.45" />

    <!-- input → hidden edges -->
    <template v-for="(xn, i) in XS" :key="`ie${i}`">
      <line
        v-for="(hn, j) in HS" :key="`e${i}${j}`" :x1="xn.x + R" :y1="xn.y" :x2="hn.x - R" :y2="hn.y"
        :style="{ stroke: step >= 5 && step <= 6 ? RED : BLUE, strokeWidth: inFocus ? 2.6 : 1.8, strokeOpacity: outFocus ? 0.25 : 0.8 }"
      />
    </template>
    <!-- hidden → output edges -->
    <line
      v-for="(hn, j) in HS" :key="`oe${j}`" :x1="hn.x + R" :y1="hn.y" :x2="YH.x - R" :y2="YH.y"
      :style="{ stroke: step >= 3 && step <= 6 ? RED : BLUE, strokeWidth: outFocus ? 3 : 2.2, strokeOpacity: inFocus ? 0.3 : 0.9 }"
    />

    <!-- edge labels -->
    <template v-for="(xn, i) in XS" :key="`il${i}`">
      <text
        v-for="(hn, j) in HS" :key="`l${i}${j}`" :style="`font-size:12px;font-weight:700;${lab}${halo};opacity:${outFocus ? 0.3 : 1}`"
        :x="along(xn, hn, inT(i, j)).x" :y="along(xn, hn, inT(i, j)).y + 4" text-anchor="middle"
        :fill="inLabel(i, j).c"
      >{{ inLabel(i, j).t }}</text>
    </template>
    <text
      v-for="(hn, j) in HS" :key="`ol${j}`" :style="`font-size:13px;font-weight:700;${lab}${halo};opacity:${inFocus ? 0.35 : 1}`"
      :x="along(hn, YH, 0.5).x" :y="along(hn, YH, 0.5).y - 6" text-anchor="middle"
      :fill="outLabel(j).c"
    >{{ outLabel(j).t }}</text>

    <!-- inputs -->
    <g v-for="(n, i) in XS" :key="`x${i}`">
      <circle :cx="n.x" :cy="n.y" :r="R" fill="#e8f0f8" stroke="#00457c" stroke-width="2.5" />
      <text :style="`font-size:16px;${it}`" :x="n.x" :y="n.y + 5" text-anchor="middle" fill="#00457c">x<tspan baseline-shift="sub" style="font-size:10px">{{ i + 1 }}</tspan></text>
      <text v-if="step > 0" :style="`font-size:11px;font-weight:700;${lab}`" :x="n.x - R - 6" :y="n.y + 4" text-anchor="end" fill="#00457c">{{ x[i].toFixed(1) }}</text>
    </g>

    <!-- symbol of the weight in focus -->
    <text v-if="hlOut" :style="`font-size:17px;font-weight:700;${it}${halo}`" :x="along(HS[0], YH, 0.3).x + (step === 4 ? 30 : 10)" :y="along(HS[0], YH, 0.3).y - (step === 4 ? 20 : 12)" text-anchor="middle" fill="#00457c">w<tspan baseline-shift="sub" style="font-size:11px">1</tspan><tspan v-if="step === 4" style="font-size:13px;font-style:normal"> = {{ fmt(w0[0]) }}</tspan></text>
    <text v-if="hlIn" :style="`font-size:17px;font-weight:700;${it}${halo}`" :x="along(XS[0], HS[0], 0.45).x" :y="along(XS[0], HS[0], 0.45).y - 10" text-anchor="middle" fill="#00457c">W<tspan baseline-shift="sub" style="font-size:11px">11</tspan></text>

    <!-- hidden -->
    <g v-for="(n, j) in HS" :key="`h${j}`">
      <circle :cx="n.x" :cy="n.y" :r="R" fill="#fff1e5" stroke="#ff7900" stroke-width="2.5" />
      <path :d="`M${n.x - 10},${n.y + 6} H${n.x} L${n.x + 10},${n.y - 7}`" fill="none" stroke="#b35500" stroke-width="2" />
      <text :style="`font-size:12px;${it}${halo}`" :x="n.x - R - 2" :y="n.y - R + 2" text-anchor="end" fill="#b35500">h<tspan baseline-shift="sub" style="font-size:9px">{{ j + 1 }}</tspan></text>
      <text v-if="step > 0" :style="`font-size:12px;font-weight:700;${lab}${halo}`" :x="n.x" :y="n.y + R + 14" text-anchor="middle" :fill="updated ? GREEN : '#b35500'">{{ fmt(cur.h[j]) }}</text>
      <text v-if="step >= 4 && step <= 6" :style="`font-size:12px;font-weight:700;${lab}${halo}`" :x="n.x + R + 4" :y="n.y - R + 2" fill="#d62728">∂ {{ fmt(dh[j]) }}</text>
    </g>

    <!-- output -->
    <circle :cx="YH.x" :cy="YH.y" :r="R + 2" fill="#e9f5e9" stroke="#2ca02c" stroke-width="2.5" />
    <text :style="`font-size:16px;${it}`" :x="YH.x" :y="YH.y + 5" text-anchor="middle" fill="#1e7a1e">ŷ</text>
    <text v-if="step > 0" :style="`font-size:11.5px;font-weight:700;${lab}`" :x="YH.x" :y="YH.y + R + 16" text-anchor="middle" :fill="updated ? GREEN : '#1e7a1e'">{{ cur.yh.toFixed(3) }}</text>
    <text v-if="step >= 2 && step <= 6" :style="`font-size:11px;font-weight:700;${lab}${halo}`" :x="YH.x" :y="YH.y - R - 10" text-anchor="middle" fill="#d62728">∂ {{ fmt(dY) }}</text>

    <!-- target and loss -->
    <template v-if="step >= 2 || step === 0">
      <line :x1="YH.x + R + 4" :y1="YH.y" :x2="YT.x - R - 4" :y2="YT.y" stroke="#5f6368" stroke-width="1.8" stroke-dasharray="5 4" />
      <rect :x="YT.x - 17" :y="YT.y - 17" width="34" height="34" rx="5" fill="#00457c" />
      <text :style="`font-size:16px;${it}`" :x="YT.x" :y="YT.y + 5" text-anchor="middle" fill="#fff">y</text>
      <text v-if="step > 0" :style="`font-size:11.5px;font-weight:700;${lab}`" :x="YT.x" :y="YT.y + 34" text-anchor="middle" fill="#00457c">{{ y.toFixed(1) }}</text>
      <text :style="`font-size:13px;font-weight:700;${lab}`" :x="(YH.x + YT.x) / 2" :y="YH.y - 48" text-anchor="middle" :fill="updated ? GREEN : '#00457c'">{{ step === 0 ? 'L(ŷ, y)' : `L = ${cur.L.toFixed(3)}` }}</text>
      <text v-if="updated" :style="`font-size:11px;${lab}`" :x="(YH.x + YT.x) / 2" :y="YH.y - 34" text-anchor="middle" fill="#5f6368">before: {{ f.L.toFixed(3) }}</text>
    </template>
  </svg>
</template>

<style scoped>
.bps { width: 100%; height: auto; }
</style>
