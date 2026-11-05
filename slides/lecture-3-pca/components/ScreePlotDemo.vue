<script setup lang="ts">
// How many principal components? Eigenvalue spectrum (explained variance per PC)
// plus the cumulative curve. A threshold slider selects the smallest P that
// reaches the requested share of the variance.
import { computed, ref } from 'vue'

const spectra = [
  {
    label: 'Sentinel-2 bands (highly correlated)',
    // explained-variance ratios approximating the Wageningen scene (74 / 91 / 94 %)
    ev: [0.74, 0.17, 0.03, 0.016, 0.011, 0.009, 0.007, 0.006, 0.004, 0.003, 0.002, 0.002],
  },
  {
    label: 'weakly correlated features',
    ev: [0.2, 0.16, 0.13, 0.11, 0.09, 0.08, 0.06, 0.05, 0.045, 0.035, 0.025, 0.015],
  },
]
const si = ref(0)
const threshold = ref(90)

const ev = computed(() => spectra[si.value].ev)
const cum = computed(() => {
  let s = 0
  return ev.value.map((v) => { s += v; return s })
})
const P = computed(() => cum.value.findIndex(c => c * 100 >= threshold.value - 1e-9) + 1)

const W = 460
const H = 230
const pad = { l: 40, r: 40, t: 14, b: 36 }
const bw = (W - pad.l - pad.r) / 12
const Y = (v: number) => H - pad.b - v * (H - pad.t - pad.b)
</script>

<template>
  <div class="scree-demo" @pointerdown.stop @keydown.stop>
    <div class="flex gap-2 flex-wrap">
      <button v-for="(s, i) in spectra" :key="s.label" class="demo-btn" :class="{ active: si === i }" @click="si = i">{{ s.label }}</button>
    </div>
    <div class="flex items-center gap-3 mt-2 text-[.72rem]">
      <span class="w-44">keep at least <strong>{{ threshold }}&#8239;%</strong> of the variance</span>
      <input v-model.number="threshold" type="range" min="70" max="99" step="1" class="flex-1">
    </div>
    <div class="svg-fit mt-1" :style="{ position: 'relative', width: '100%', height: 0, paddingTop: `${(H) / (W) * 100}%` }"><svg :viewBox="`0 0 ${W} ${H}`" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block">
      <line :x1="pad.l" :y1="H - pad.b" :x2="W - pad.r" :y2="H - pad.b" stroke="#00457c" />
      <line :x1="pad.l" :y1="pad.t" :x2="pad.l" :y2="H - pad.b" stroke="#00457c" />
      <g v-for="t in [0, 0.25, 0.5, 0.75, 1]" :key="t">
        <line :x1="pad.l" :y1="Y(t)" :x2="W - pad.r" :y2="Y(t)" stroke="#eceeef" />
        <text :x="pad.l - 4" :y="Y(t) + 3" style="font-size: 10px" fill="#777" text-anchor="end">{{ t * 100 }}%</text>
      </g>
      <line :x1="pad.l" :y1="Y(threshold / 100)" :x2="W - pad.r" :y2="Y(threshold / 100)" stroke="#b02b37" stroke-dasharray="5 4" />
      <text :x="W - pad.r + 3" :y="Y(threshold / 100) + 4" style="font-size: 10px" fill="#b02b37">{{ threshold }}%</text>

      <g v-for="(v, i) in ev" :key="i">
        <rect :x="pad.l + i * bw + 4" :y="Y(v)" :width="bw - 8" :height="H - pad.b - Y(v)"
          :fill="i < P ? '#ff7900' : '#c9ced3'" style="transition: all .35s" />
        <text :x="pad.l + i * bw + bw / 2" :y="H - pad.b + 13" style="font-size: 10px" fill="#555" text-anchor="middle">{{ i + 1 }}</text>
      </g>
      <polyline :points="cum.map((c, i) => `${pad.l + i * bw + bw / 2},${Y(c)}`).join(' ')" fill="none" stroke="#00457c" stroke-width="2" style="transition: all .35s" />
      <circle v-for="(c, i) in cum" :key="`c${i}`" :cx="pad.l + i * bw + bw / 2" :cy="Y(c)" r="3" fill="#00457c" />
      <text :x="(W + pad.l - pad.r) / 2" :y="H - 4" style="font-size: 11px" fill="#333" text-anchor="middle">principal component (sorted by eigenvalue &#955;)</text>
    </svg></div>
    <div class="text-[.64rem] text-gray-700 -mt-1">
      <span class="inline-block w-3 h-3 bg-[#ff7900] align-middle" /> explained variance ratio &#955;<sub>i</sub> / &#931; &#955;
      <span class="inline-block w-5 h-0.5 bg-[#00457c] align-middle ml-3" /> cumulative
      &#8594; keep <strong class="text-[#b02b37]">P = {{ P }}</strong> of 12 components
    </div>
  </div>
</template>

<style scoped>
.scree-demo input[type='range'] { accent-color: #00457c; }
.demo-btn {
  border: 1.5px solid #00457c;
  border-radius: 6px;
  padding: 2px 8px;
  color: #00457c;
  background: #fff;
  font-size: .66rem;
}
.demo-btn.active,
.demo-btn:hover {
  background: #00457c;
  color: #fff;
}
</style>
