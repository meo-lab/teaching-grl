<script setup lang="ts">
// Two-layer McCulloch–Pitts network (2 inputs → 2 hidden → 1 output) as an XOR exercise.
// Everything is set by hand, as in 1943:
// - click x₁ / x₂ to toggle the inputs
// - click a weight to cycle +1 → −1 → 0
// - click a threshold θ to cycle 0 → 1 → 2
// A neuron fires if Σ w·input ≥ θ. The truth table checks all four inputs against XOR.
import { computed, ref } from 'vue'

const x = ref([1, 0])
const W1 = ref([[1, 1], [1, 1]]) // W1[j][i]: input i → hidden j
const T1 = ref([1, 1])
const W2 = ref([1, 1]) // hidden j → output
const T2 = ref(1)

const fire = (s: number, t: number) => (s >= t ? 1 : 0)
function net(xi: number[]) {
  const h = W1.value.map((row, j) => fire(row[0] * xi[0] + row[1] * xi[1], T1.value[j]))
  const y = fire(W2.value[0] * h[0] + W2.value[1] * h[1], T2.value)
  return { h, y }
}
const cur = computed(() => net(x.value))
const ROWS = [[0, 0], [0, 1], [1, 0], [1, 1]]
const table = computed(() => ROWS.map((r) => {
  const o = net(r)
  return { x: r, h: o.h, y: o.y, target: r[0] ^ r[1] }
}))
const correct = computed(() => table.value.filter(r => r.y === r.target).length)

const cyc = (v: number) => (v === 1 ? -1 : v === -1 ? 0 : 1)
const cycT = (v: number) => (v + 1) % 3
const fmtW = (v: number) => (v === 1 ? '+1' : v === -1 ? '−1' : '0')
const col = (v: number) => (v === 1 ? '#00457c' : v === -1 ? '#d62728' : '#c3c7cb')

function reset() {
  W1.value = [[1, 1], [1, 1]]
  T1.value = [1, 1]
  W2.value = [1, 1]
  T2.value = 1
}
function solve() {
  W1.value = [[1, 1], [1, 1]]
  T1.value = [1, 2] // h₁ = OR, h₂ = AND
  W2.value = [1, -1]
  T2.value = 1 // y = h₁ AND NOT h₂
}

// geometry
const IX = 60
const HX = 225
const OX = 385
const YA = 70
const YB = 180
const YO = 125
const R = 20
const IN = [{ x: IX, y: YA }, { x: IX, y: YB }]
const HID = [{ x: HX, y: YA }, { x: HX, y: YB }]
// badge position along an edge (t from source)
const along = (a: { x: number, y: number }, b: { x: number, y: number }, t: number) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
const tFor = (i: number, j: number) => (i === j ? 0.5 : 0.27)
const it = 'font-family:serif;font-style:italic;line-height:1'
const lab = 'font-family:inherit;font-style:normal;line-height:1'
</script>

<template>
  <div class="xor select-none" @click.stop @dblclick.stop>
    <svg viewBox="0 0 440 250" class="net" role="img" aria-label="Two-layer McCulloch-Pitts network with inputs x1 and x2, hidden neurons h1 and h2 and output y; all weights and thresholds can be clicked to change them; the goal is to compute XOR">
      <!-- edges input → hidden -->
      <template v-for="(h, j) in HID" :key="`hj${j}`">
        <line
          v-for="(n, i) in IN" :key="`e${i}${j}`" :x1="n.x + R" :y1="n.y" :x2="h.x - R" :y2="h.y"
          :style="{ stroke: col(W1[j][i]), strokeWidth: cur.h !== undefined && x[i] && W1[j][i] ? 4 : 2, strokeDasharray: W1[j][i] === 0 ? '4 4' : 'none', strokeOpacity: x[i] && W1[j][i] ? 1 : 0.5 }"
        />
      </template>
      <!-- edges hidden → output -->
      <line
        v-for="(h, j) in HID" :key="`o${j}`" :x1="h.x + R" :y1="h.y" :x2="OX - R" :y2="YO"
        :style="{ stroke: col(W2[j]), strokeWidth: cur.h[j] && W2[j] ? 4 : 2, strokeDasharray: W2[j] === 0 ? '4 4' : 'none', strokeOpacity: cur.h[j] && W2[j] ? 1 : 0.5 }"
      />

      <!-- weight badges -->
      <template v-for="(h, j) in HID" :key="`bj${j}`">
        <g v-for="(n, i) in IN" :key="`b${i}${j}`" class="click" @click.stop="W1[j][i] = cyc(W1[j][i])">
          <rect :x="along(n, h, tFor(i, j)).x - 4" :y="along(n, h, tFor(i, j)).y - 10" width="34" height="20" rx="5" fill="#fff" :stroke="col(W1[j][i])" stroke-width="1.5" />
          <text :style="`font-size:12px;font-weight:700;${lab}`" :x="along(n, h, tFor(i, j)).x + 13" :y="along(n, h, tFor(i, j)).y + 4" text-anchor="middle" :fill="col(W1[j][i])">{{ fmtW(W1[j][i]) }}</text>
        </g>
      </template>
      <g v-for="(h, j) in HID" :key="`bo${j}`" class="click" @click.stop="W2[j] = cyc(W2[j])">
        <rect :x="along(h, { x: OX, y: YO }, 0.45).x - 17" :y="along(h, { x: OX, y: YO }, 0.45).y - 10" width="34" height="20" rx="5" fill="#fff" :stroke="col(W2[j])" stroke-width="1.5" />
        <text :style="`font-size:12px;font-weight:700;${lab}`" :x="along(h, { x: OX, y: YO }, 0.45).x" :y="along(h, { x: OX, y: YO }, 0.45).y + 4" text-anchor="middle" :fill="col(W2[j])">{{ fmtW(W2[j]) }}</text>
      </g>

      <!-- inputs -->
      <g v-for="(n, i) in IN" :key="`x${i}`" class="click" @click.stop="x[i] = 1 - x[i]">
        <circle :cx="n.x" :cy="n.y" :r="R" :fill="x[i] ? '#00457c' : '#e8f0f8'" stroke="#00457c" stroke-width="2.5" />
        <text :style="`font-size:17px;${it}`" :x="n.x" :y="n.y + 6" text-anchor="middle" :fill="x[i] ? '#fff' : '#00457c'">x<tspan baseline-shift="sub" style="font-size:11px">{{ i + 1 }}</tspan></text>
        <text :style="`font-size:15px;font-weight:700;${lab}`" :x="n.x - 28" :y="n.y + 5" text-anchor="end" :fill="x[i] ? '#00457c' : '#9aa0a6'">{{ x[i] }}</text>
      </g>

      <!-- hidden neurons -->
      <g v-for="(h, j) in HID" :key="`h${j}`">
        <circle :cx="h.x" :cy="h.y" :r="R" :fill="cur.h[j] ? '#ff7900' : '#fff1e5'" stroke="#ff7900" stroke-width="2.5" />
        <text :style="`font-size:17px;${it}`" :x="h.x" :y="h.y + 6" text-anchor="middle" :fill="cur.h[j] ? '#fff' : '#b35500'">h<tspan baseline-shift="sub" style="font-size:11px">{{ j + 1 }}</tspan></text>
        <g class="click" @click.stop="T1[j] = cycT(T1[j])">
          <rect :x="h.x - 22" :y="j === 0 ? h.y - R - 26 : h.y + R + 6" width="44" height="20" rx="5" fill="#f1f3f4" stroke="#9aa0a6" stroke-width="1.5" />
          <text :style="`font-size:12px;font-weight:700;${lab}`" :x="h.x" :y="(j === 0 ? h.y - R - 26 : h.y + R + 6) + 14" text-anchor="middle" fill="#5f6368">θ = {{ T1[j] }}</text>
        </g>
      </g>

      <!-- output -->
      <circle :cx="OX" :cy="YO" :r="R + 2" :fill="cur.y ? '#2ca02c' : '#e9f5e9'" stroke="#2ca02c" stroke-width="2.5" />
      <text :style="`font-size:17px;${it}`" :x="OX" :y="YO + 6" text-anchor="middle" :fill="cur.y ? '#fff' : '#1e7a1e'">y</text>
      <text :style="`font-size:15px;font-weight:700;${lab}`" :x="OX + 32" :y="YO + 5" :fill="cur.y ? '#1e7a1e' : '#9aa0a6'">{{ cur.y }}</text>
      <g class="click" @click.stop="T2 = cycT(T2)">
        <rect :x="OX - 22" :y="YO + R + 8" width="44" height="20" rx="5" fill="#f1f3f4" stroke="#9aa0a6" stroke-width="1.5" />
        <text :style="`font-size:12px;font-weight:700;${lab}`" :x="OX" :y="YO + R + 22" text-anchor="middle" fill="#5f6368">θ = {{ T2 }}</text>
      </g>

      <text :style="`font-size:11px;${lab}`" :x="IX" y="242" text-anchor="middle" fill="#5f6368">input</text>
      <text :style="`font-size:11px;${lab}`" :x="HX" y="242" text-anchor="middle" fill="#5f6368">hidden layer</text>
      <text :style="`font-size:11px;${lab}`" :x="OX" y="242" text-anchor="middle" fill="#5f6368">output</text>
    </svg>

    <div class="side">
      <table>
        <thead>
          <tr><th>x₁</th><th>x₂</th><th class="hc">h₁</th><th class="hc">h₂</th><th>y</th><th>XOR</th><th /></tr>
        </thead>
        <tbody>
          <tr v-for="r in table" :key="r.x.join()" :class="{ cur: r.x[0] === x[0] && r.x[1] === x[1] }">
            <td>{{ r.x[0] }}</td><td>{{ r.x[1] }}</td>
            <td class="hc">{{ r.h[0] }}</td><td class="hc">{{ r.h[1] }}</td>
            <td class="yc">{{ r.y }}</td><td>{{ r.target }}</td>
            <td :class="r.y === r.target ? 'ok' : 'bad'">{{ r.y === r.target ? '✓' : '✗' }}</td>
          </tr>
        </tbody>
      </table>
      <div class="score" :class="{ solved: correct === 4 }">
        {{ correct === 4 ? 'XOR solved!' : `${correct} / 4 correct` }}
      </div>
      <div class="btns">
        <button @click.stop="reset">reset</button>
        <button class="ghost" @click.stop="solve">solution</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.xor { display: flex; align-items: center; gap: 1rem; }
.net { flex: 1.7; min-width: 0; height: auto; }
.click { cursor: pointer; }
.side { flex: 1; display: flex; flex-direction: column; align-items: center; gap: .4rem; font: 12px "Exo 2", sans-serif; color: #333; }
table { border-collapse: collapse; }
th, td { padding: .12rem .45rem; text-align: center; border-bottom: 1px solid #e3e6e8; }
th { color: #00457c; font-weight: 700; }
.hc { color: #b35500; }
.yc { color: #1e7a1e; font-weight: 700; }
tr.cur td { background: #eef4fa; }
td.ok { color: #2ca02c; font-weight: 700; }
td.bad { color: #d62728; font-weight: 700; }
.score { font-weight: 700; color: #00457c; }
.score.solved { color: #fff; background: #2ca02c; padding: .1rem .6rem; border-radius: 5px; }
.btns { display: flex; gap: .35rem; }
.btns button { font: 600 11px "Exo 2", sans-serif; padding: .15rem .55rem; border-radius: 5px; border: 1px solid #00457c; background: #00457c; color: #fff; }
.btns button.ghost { background: transparent; color: #00457c; }
</style>
