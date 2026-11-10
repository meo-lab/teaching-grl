<script setup lang="ts">
// The logistic function and its inverse, the logit ("logistic unit", Berkson 1944).
//   step 1: p = σ(z) maps any real number z to a probability in (0, 1)
//   step 2: the inverse z = logit(p) = ln(p / (1 − p)): z is measured in logits (log-odds)
//   step 3: +1 logit multiplies the odds by e: 50% → 73% → 88%
import { computed } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 3 })
const s = computed(() => props.step)

const W = 560
const H = 310
const pad = { l: 52, r: 16, t: 46, b: 44 }
const X0 = pad.l
const X1 = W - pad.r
const Y0 = pad.t
const Y1 = H - pad.b
const ZD = [-6, 6]
const sx = (z: number) => X0 + (z - ZD[0]) / (ZD[1] - ZD[0]) * (X1 - X0)
const sy = (p: number) => Y1 - p * (Y1 - Y0)
const sig = (z: number) => 1 / (1 + Math.exp(-z))

let d = ''
for (let i = 0; i <= 240; i++) {
  const z = ZD[0] + (ZD[1] - ZD[0]) * i / 240
  d += `${i ? 'L' : 'M'}${sx(z).toFixed(1)},${sy(sig(z)).toFixed(1)}`
}
const curve = d

// two consecutive "+1 logit" steps: 50% → 73% → 88%
const steps = [0, 1].map(z0 => ({ z0, z1: z0 + 1, p0: sig(z0), p1: sig(z0 + 1) }))
const pct = (p: number) => `${Math.round(p * 100)}%`
// second x axis: the same z expressed as odds e^z : 1
const ODDS_Y = 26
const oddsTicks = [-4, -2, -1, 0, 1, 2, 4].map((z) => {
  const o = Math.exp(Math.abs(z))
  const v = o >= 10 ? Math.round(o).toString() : o.toFixed(1).replace(/\.0$/, '')
  return { z, label: z === 0 ? '1 : 1' : z > 0 ? `${v} : 1` : `1 : ${v}` }
})

const tex = (x: string) => katex.renderToString(x, { throwOnError: false })
const logitTex = tex(String.raw`z = \operatorname{logit}(p) = \ln\frac{p}{1 - p}`)
const stepTex = tex(String.raw`+1 \text{ logit} \;\Rightarrow\; \text{odds} \times e`)
</script>

<template>
  <div class="lgs select-none">
    <svg :viewBox="`0 0 ${W} ${H}`" class="plot">
      <!-- axes -->
      <line :x1="X0" :y1="Y1" :x2="X1" :y2="Y1" class="ax" />
      <line :x1="X0" :y1="Y0" :x2="X0" :y2="Y1" class="ax" />
      <g v-for="z in [-6, -4, -2, 0, 2, 4, 6]" :key="`z${z}`">
        <line :x1="sx(z)" :x2="sx(z)" :y1="Y1" :y2="Y1 + 4" class="ax" />
        <text :x="sx(z)" :y="Y1 + 17" text-anchor="middle" style="font-size: 11px" class="tk">{{ z }}</text>
      </g>
      <g v-for="p in [0, 0.5, 1]" :key="`p${p}`">
        <line :x1="X0" :x2="X1" :y1="sy(p)" :y2="sy(p)" class="grid" :class="{ half: p === 0.5 }" />
        <line :x1="X0 - 4" :x2="X0" :y1="sy(p)" :y2="sy(p)" class="ax" />
        <text :x="X0 - 8" :y="sy(p) + 4" text-anchor="end" style="font-size: 11px" class="tk">{{ p }}</text>
      </g>
      <text :x="(X0 + X1) / 2" :y="H - 6" text-anchor="middle" style="font-size: 12px" class="ttl">z</text>
      <text :x="(X0 + X1) / 2 + 10" :y="H - 6" style="font-size: 12px" class="ttl fade" :style="{ opacity: s >= 2 ? 1 : 0 }">[logits]</text>
      <text :x="16" :y="(Y0 + Y1) / 2" text-anchor="middle" style="font-size: 12px" class="ttl" :transform="`rotate(-90 16 ${(Y0 + Y1) / 2})`">p = σ(z)</text>

      <!-- step 2: odds axis on top -->
      <g class="fade" :style="{ opacity: s >= 2 ? 1 : 0 }">
        <line :x1="X0" :x2="X1" :y1="ODDS_Y" :y2="ODDS_Y" class="ax" />
        <g v-for="t in oddsTicks" :key="`o${t.z}`">
          <line :x1="sx(t.z)" :x2="sx(t.z)" :y1="ODDS_Y" :y2="ODDS_Y + 4" class="ax" />
          <line :x1="sx(t.z)" :x2="sx(t.z)" :y1="ODDS_Y + 4" :y2="Y1" class="oddsGrid" />
          <text :x="sx(t.z)" :y="ODDS_Y - 6" text-anchor="middle" style="font-size: 10.5px" class="tk">{{ t.label }}</text>
        </g>
        <text :x="X0 - 8" :y="ODDS_Y - 6" text-anchor="end" style="font-size: 12px" class="ttl">odds</text>
      </g>

      <path :d="curve" fill="none" stroke="#00457c" stroke-width="2.8" />

      <!-- step 3: one logit = one unit on z; each unit multiplies the odds by e -->
      <g class="fade" :style="{ opacity: s >= 3 ? 1 : 0 }">
        <line v-for="z in [0, 1, 2]" :key="`g${z}`" :x1="sx(z)" :x2="sx(z)" :y1="ODDS_Y" :y2="Y1" class="unitGuide" />
        <g v-for="st in steps" :key="`u${st.z0}`">
          <!-- +1 on the logit axis -->
          <path :d="`M${sx(st.z0) + 3},${Y1 - 3} Q${(sx(st.z0) + sx(st.z1)) / 2},${Y1 - 24} ${sx(st.z1) - 3},${Y1 - 3}`" class="arc" />
          <text :x="(sx(st.z0) + sx(st.z1)) / 2" :y="Y1 - 18" text-anchor="middle" class="arcLbl">+1</text>
          <!-- ×e on the odds axis -->
          <path :d="`M${sx(st.z0) + 3},${ODDS_Y + 3} Q${(sx(st.z0) + sx(st.z1)) / 2},${ODDS_Y + 24} ${sx(st.z1) - 3},${ODDS_Y + 3}`" class="arc" />
          <text :x="(sx(st.z0) + sx(st.z1)) / 2" :y="ODDS_Y + 26" text-anchor="middle" class="arcLbl">×e</text>
        </g>
        <g v-for="z in [0, 1, 2]" :key="`d${z}`">
          <circle :cx="sx(z)" :cy="sy(sig(z))" r="4.5" fill="#ff7900" stroke="#fff" stroke-width="1.2" />
          <text :x="sx(z) + 7" :y="sy(sig(z)) + 15" style="font-size: 12px; fill: #ff7900; font-weight: 700">{{ pct(sig(z)) }}</text>
        </g>
      </g>
    </svg>

    <div class="side">
      <div class="box inv fade" :style="{ opacity: s >= 2 ? 1 : 0 }">
        <div class="hd">Inverse: logit = <u>log</u>istic un<u>it</u></div>
        <div class="big" v-html="logitTex" />
        <div class="note">term coined by J. Berkson (1944) · z measures p on the log-odds scale</div>
      </div>
      <div class="fade one" :style="{ opacity: s >= 3 ? 1 : 0 }">
        <div v-html="stepTex" />
        <div class="note">equal steps in z, equal factors in the odds,<br>but shrinking steps in p: 50% → 73% → 88%</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lgs { display: flex; gap: 1.2rem; align-items: center; justify-content: center; }
.plot { width: 450px; height: 249px; flex: none; overflow: visible; }
.ax { stroke: #8b8f8d; stroke-width: 1; }
.grid { stroke: #e3e6e8; stroke-width: 1; }
.grid.half { stroke-dasharray: 3 3; }
.oddsGrid { stroke: #eceef0; stroke-width: 1; stroke-dasharray: 2 3; }
.tk { fill: #5f625f; }
.ttl { fill: #00457c; font-weight: 600; }
.fade { transition: opacity .6s ease; }
.stepH { stroke: #ff7900; stroke-width: 2; stroke-dasharray: 4 3; }
.stepV { stroke: #ff7900; stroke-width: 2.4; }
.side { display: flex; flex-direction: column; gap: .55rem; width: 300px; }
.box .note { font-size: 10px; }
.box { border-left: 4px solid #00457c; background: #eef5fa; border-radius: 0 6px 6px 0; padding: .4rem .6rem; }
.box.inv { border-left-color: #8b8f8d; background: #f3f4f5; }
.hd { font: 700 11px "Exo 2", sans-serif; text-transform: uppercase; letter-spacing: .04em; color: #00457c; }
.hd u { text-decoration-thickness: 2px; text-decoration-color: #ff7900; }
.big { font-size: 17px; color: #1a1a1a; white-space: nowrap; }
.unitGuide { stroke: #ff7900; stroke-width: 1; stroke-dasharray: 2 3; opacity: .6; }
.arc { fill: none; stroke: #ff7900; stroke-width: 1.8; }
.arcLbl { font-size: 11px; fill: #ff7900; font-weight: 700; }
.foot { font: 10px "Exo 2", sans-serif; color: #999; margin-top: .4rem; }
.one { font-size: 14px; color: #ff7900; padding-left: .7rem; }
.note { font: 11px "Exo 2", sans-serif; color: #666; }
</style>
