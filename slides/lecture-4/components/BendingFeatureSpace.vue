<script setup lang="ts">
// Why non-linear activations: a 2D grid and circular two-class data (red disk inside a green ring)
// sent through the same network 2 → 6 → 2 with act = identity / tanh / ReLU:
//   h = act(W₁x + b₁) (6 units, directions 60° apart), o = act(W₂h + b₂) (2 outputs)
// Without activation everything collapses onto one line (W₂W₁ has rank 1 here): the classes overlap.
// With tanh or ReLU the disk is pulled away from the ring: a horizontal line separates them.
// The slider only morphs the picture from input (0) to output (1); it is not a network parameter.
import { computed, ref } from 'vue'

type Mode = 'none' | 'tanh' | 'relu'
const mode = ref<Mode>('tanh')
const t = ref(1)

const U = [0, 1, 2, 3, 4, 5].map(k => [Math.cos(k * Math.PI / 3), Math.sin(k * Math.PI / 3)])
const act = (v: number, m: Mode) => (m === 'tanh' ? Math.tanh(v) : m === 'relu' ? Math.max(0, v) : v)
function net(p: number[], m: Mode) {
  // layer 1: six half-plane detectors, active outside a hexagon of radius 1
  const h = U.map(u => act(2 * (u[0] * p[0] + u[1] * p[1]) - 2, m))
  // layer 2: o₁ spreads the points left/right, o₂ = "how far outside" (sum of all detectors)
  const o1 = 0.8 * (h[0] - h[3] + 0.5 * (h[1] - h[2] - h[4] + h[5]))
  const o2 = 1.5 * (h.reduce((a, b) => a + b, 0) + 4.3)
  return [act(o1, m), act(o2, m)]
}

const R = 2 // input range [-R, R]
const LINES = 13
const STEPS = 48
const lines = (() => {
  const out: { pts: number[][], dir: 'h' | 'v' }[] = []
  for (let i = 0; i < LINES; i++) {
    const c = -R + 2 * R * i / (LINES - 1)
    out.push({ dir: 'h', pts: Array.from({ length: STEPS + 1 }, (_, k) => [-R + 2 * R * k / STEPS, c]) })
    out.push({ dir: 'v', pts: Array.from({ length: STEPS + 1 }, (_, k) => [c, -R + 2 * R * k / STEPS]) })
  }
  return out
})()
// data: red disk (r < 0.8) and green ring (1.3 < r < 1.8), fixed seed
const data = (() => {
  let seed = 42
  const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
  return Array.from({ length: 80 }, (_, i) => {
    const c = i % 2
    const a = rand() * 2 * Math.PI
    const r = c ? 1.3 + rand() * 0.5 : Math.sqrt(rand()) * 0.8
    return { p: [r * Math.cos(a), r * Math.sin(a)], c }
  })
})()

// transformed points, each axis rescaled so the DATA fills the box (the grid may extend beyond and is clipped)
const mapped = computed(() => {
  const all = [...lines.flatMap(l => l.pts), ...data.map(d => d.p)]
  const out = all.map(p => net(p, mode.value))
  const nd = data.length
  const ext = [0, 1].map((k) => {
    const v = out.slice(-nd).map(o => o[k])
    const lo = Math.min(...v)
    const hi = Math.max(...v)
    return { c: (lo + hi) / 2, s: hi - lo > 1e-6 ? 0.8 * R / ((hi - lo) / 2) : 1 }
  })
  const norm = new Map<number[], number[]>()
  all.forEach((p, i) => norm.set(p, [0, 1].map(k => (out[i][k] - ext[k].c) * ext[k].s)))
  return norm
})
const morphed = (p: number[]) => {
  const q = mapped.value.get(p)!
  return [(1 - t.value) * p[0] + t.value * q[0], (1 - t.value) * p[1] + t.value * q[1]]
}

// separating line in the output (horizontal, on o₂) if the classes do not overlap
const sep = computed(() => {
  const y = (c: number) => data.filter(d => d.c === c).map(d => mapped.value.get(d.p)![1])
  const red = y(0)
  const green = y(1)
  if (Math.max(...red) < Math.min(...green) - 1e-6)
    return (Math.max(...red) + Math.min(...green)) / 2
  return null
})

const S = 230 // panel size
const PAD = 12
const toPx = (p: number[]) => [PAD + (p[0] + R) / (2 * R) * (S - 2 * PAD), S - PAD - (p[1] + R) / (2 * R) * (S - 2 * PAD)]
const pathOf = (pts: number[][], morph: boolean) => pts.map((p, k) => {
  const [x, y] = toPx(morph ? morphed(p) : p)
  return `${k ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
}).join('')

const MODES: { key: Mode, label: string }[] = [
  { key: 'none', label: 'none' },
  { key: 'tanh', label: 'tanh' },
  { key: 'relu', label: 'ReLU' },
]
const caption = computed(() => ({
  none: 'one linear map: the classes overlap, no line separates them',
  tanh: 'the grid bends: a line now separates the classes',
  relu: 'the grid folds: a line now separates the classes',
}[mode.value]))
</script>

<template>
  <div class="bfs select-none" @click.stop @dblclick.stop>
    <div class="panels">
      <div class="panel">
        <div class="ttl">input space x</div>
        <svg :viewBox="`0 0 ${S} ${S}`" role="img" aria-label="Input space: a straight square grid; red points form a disk, green points a ring around it">
          <rect :x="PAD" :y="PAD" :width="S - 2 * PAD" :height="S - 2 * PAD" fill="#fafbfc" />
          <path v-for="(l, i) in lines" :key="i" :d="pathOf(l.pts, false)" fill="none" :stroke="l.dir === 'h' ? '#1f77b4' : '#ff7900'" stroke-width="0.9" stroke-opacity="0.45" />
          <circle v-for="(d, i) in data" :key="`d${i}`" :cx="toPx(d.p)[0]" :cy="toPx(d.p)[1]" r="3.6" :fill="d.c ? '#159653' : '#d33748'" stroke="#fff" stroke-width="0.9" />
        </svg>
      </div>
      <div class="arrow">
        <span>2 layers</span>
        <svg viewBox="0 0 40 20" width="40" height="20"><path d="M2,10 H32 M26,4 L36,10 L26,16" fill="none" stroke="#00457c" stroke-width="2.5" /></svg>
      </div>
      <div class="panel">
        <div class="ttl">after the network</div>
        <svg :viewBox="`0 0 ${S} ${S}`" role="img" :aria-label="`Transformed space with ${mode}: ${caption}`">
          <rect :x="PAD" :y="PAD" :width="S - 2 * PAD" :height="S - 2 * PAD" fill="#fafbfc" />
          <defs><clipPath id="bfs-clip"><rect :x="PAD" :y="PAD" :width="S - 2 * PAD" :height="S - 2 * PAD" /></clipPath></defs>
          <path v-for="(l, i) in lines" :key="i" clip-path="url(#bfs-clip)" :d="pathOf(l.pts, true)" fill="none" :stroke="l.dir === 'h' ? '#1f77b4' : '#ff7900'" stroke-width="0.9" stroke-opacity="0.45" />
          <circle v-for="(d, i) in data" :key="`m${i}`" :cx="toPx(morphed(d.p))[0]" :cy="toPx(morphed(d.p))[1]" r="3.6" :fill="d.c ? '#159653' : '#d33748'" stroke="#fff" stroke-width="0.9" />
          <line v-if="sep !== null && t > 0.98" :x1="PAD" :x2="S - PAD" :y1="toPx([0, sep])[1]" :y2="toPx([0, sep])[1]" stroke="#00457c" stroke-width="2" stroke-dasharray="6 4" />
        </svg>
      </div>
    </div>
    <div class="ctl">
      <button v-for="m in MODES" :key="m.key" :class="{ on: mode === m.key }" @click.stop="mode = m.key">{{ m.label }}</button>
      <label class="tl">
        <span>transform</span>
        <input v-model.number="t" class="stp" type="range" min="0" max="1" step="0.01" @pointerdown.stop @keydown.stop>
      </label>
    </div>
    <div class="cap">{{ caption }}</div>
  </div>
</template>

<style scoped>
.bfs { display: flex; flex-direction: column; align-items: center; gap: .3rem; }
.panels { display: flex; align-items: center; gap: .35rem; }
.panel { display: flex; flex-direction: column; align-items: center; }
.panel svg { width: 172px; height: 172px; border: 1px solid #e3e6e8; border-radius: 4px; }
.ttl { font: 600 12px "Exo 2", sans-serif; color: #00457c; margin-bottom: .15rem; }
.arrow { display: flex; flex-direction: column; align-items: center; font: 11px "Exo 2", sans-serif; color: #00457c; }
.ctl { display: flex; align-items: center; gap: .35rem; }
.ctl button { font: 600 11px "Exo 2", sans-serif; padding: .15rem .55rem; border-radius: 5px; border: 1px solid #00457c; background: transparent; color: #00457c; }
.ctl button.on { background: #00457c; color: #fff; }
.tl { display: flex; align-items: center; gap: .4rem; margin-left: .5rem; font: 11px "Exo 2", sans-serif; color: #00457c; }
.bfs .tl input.stp { width: 110px; accent-color: #00457c; appearance: auto !important; -webkit-appearance: auto !important; border: none !important; background: transparent !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; height: 18px !important; min-height: 0 !important; }
.cap { font: 600 12px "Exo 2", sans-serif; color: #5f625f; }
</style>
