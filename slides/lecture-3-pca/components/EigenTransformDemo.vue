<script setup lang="ts">
// The covariance matrix as a linear transformation x = C a.
// Points on the unit circle are mapped onto an ellipse. Rotate the probe
// vector a: only along the eigenvectors does C a stay on the same line as a
// (it is merely scaled by the eigenvalue lambda).
import { computed, ref } from 'vue'

const presets = [
  { label: '(2, 0.5; 0.5, 2)', C: [2, 0.5, 2] },
  { label: '(2, 0; 0, 1)', C: [2, 0, 1] },
  { label: '(3, 1.2; 1.2, 1)', C: [3, 1.2, 1] },
]
const pi = ref(0)
const angle = ref(20)
const showEig = ref(false)

const C = computed(() => presets[pi.value].C)
const apply = (v: number[]) => [C.value[0] * v[0] + C.value[1] * v[1], C.value[1] * v[0] + C.value[2] * v[1]]

const eig = computed(() => {
  const [a, b, d] = C.value
  const tr = (a + d) / 2
  const disc = Math.sqrt(((a - d) / 2) ** 2 + b * b)
  const th = 0.5 * Math.atan2(2 * b, a - d)
  return [
    { l: tr + disc, v: [Math.cos(th), Math.sin(th)] },
    { l: tr - disc, v: [-Math.sin(th), Math.cos(th)] },
  ]
})

const circle = Array.from({ length: 24 }, (_, k) => {
  const t = (2 * Math.PI * k) / 24
  return [Math.cos(t), Math.sin(t)]
})
const mapped = computed(() => circle.map(apply))

const probe = computed(() => {
  const t = (angle.value * Math.PI) / 180
  const a = [Math.cos(t), Math.sin(t)]
  const x = apply(a)
  const cross = a[0] * x[1] - a[1] * x[0]
  const norm = Math.hypot(...x)
  const parallel = Math.abs(cross) / norm < 0.035
  return { a, x, parallel, scale: (a[0] * x[0] + a[1] * x[1]) }
})

const S = 300
const R = 3.8
const sc = S / 2 / R
const X = (v: number) => S / 2 + v * sc
const Y = (v: number) => S / 2 - v * sc
const fmt = (v: number) => v.toFixed(2)
</script>

<template>
  <div class="eig-demo flex gap-5 items-start" @pointerdown.stop @keydown.stop>
    <svg :viewBox="`0 0 ${S} ${S}`" class="w-[270px] h-[270px] flex-shrink-0">
      <defs>
        <marker id="eig-arr-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#1f5fa8" /></marker>
        <marker id="eig-arr-o" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#ff7900" /></marker>
      </defs>
      <rect x="0" y="0" :width="S" :height="S" fill="#fafbfc" stroke="#d7d9d8" />
      <g stroke="#eceeef">
        <line v-for="k in 7" :key="`v${k}`" :x1="X(k - 4)" y1="0" :x2="X(k - 4)" :y2="S" />
        <line v-for="k in 7" :key="`h${k}`" x1="0" :y1="Y(k - 4)" :x2="S" :y2="Y(k - 4)" />
      </g>
      <line :x1="0" :y1="Y(0)" :x2="S" :y2="Y(0)" stroke="#9aa3aa" />
      <line :x1="X(0)" :y1="0" :x2="X(0)" :y2="S" stroke="#9aa3aa" />

      <g v-if="showEig">
        <line v-for="(e, i) in eig" :key="i" :x1="X(-e.v[0] * R * 1.2)" :y1="Y(-e.v[1] * R * 1.2)" :x2="X(e.v[0] * R * 1.2)" :y2="Y(e.v[1] * R * 1.2)"
          stroke="#2eb82e" stroke-width="2" stroke-dasharray="6 4" />
        <text v-for="(e, i) in eig" :key="`t${i}`" :x="X(e.v[0] * e.l) + 6" :y="Y(e.v[1] * e.l) - 6" style="font-size: 12px" font-weight="700" fill="#1f8a2b">v{{ i + 1 }} (&#955;={{ fmt(e.l) }})</text>
      </g>

      <circle :cx="X(0)" :cy="Y(0)" :r="sc" fill="none" stroke="#1f5fa8" stroke-dasharray="4 3" />
      <polygon :points="mapped.map(p => `${X(p[0])},${Y(p[1])}`).join(' ')" fill="#ff7900" :style="{ fillOpacity: 0.08 }" stroke="#ff7900" stroke-width="1.2" />
      <g v-for="(p, i) in circle" :key="i">
        <line :x1="X(p[0])" :y1="Y(p[1])" :x2="X(mapped[i][0])" :y2="Y(mapped[i][1])" stroke="#c7ccd1" stroke-width=".8" />
        <circle :cx="X(p[0])" :cy="Y(p[1])" r="2.5" fill="#1f5fa8" />
        <circle :cx="X(mapped[i][0])" :cy="Y(mapped[i][1])" r="2.5" fill="#ff7900" />
      </g>

      <line :x1="X(0)" :y1="Y(0)" :x2="X(probe.x[0])" :y2="Y(probe.x[1])" stroke="#ff7900" stroke-width="3" marker-end="url(#eig-arr-o)" />
      <line :x1="X(0)" :y1="Y(0)" :x2="X(probe.a[0])" :y2="Y(probe.a[1])" stroke="#1f5fa8" stroke-width="3" marker-end="url(#eig-arr-b)" />
      <text :x="X(probe.a[0]) + 4" :y="Y(probe.a[1]) + 14" style="font-size: 13px" font-weight="700" fill="#1f5fa8">a</text>
      <text :x="X(probe.x[0]) + 4" :y="Y(probe.x[1]) - 4" style="font-size: 13px" font-weight="700" fill="#ff7900">Ca</text>
    </svg>

    <div class="flex-1 text-[.7rem] text-gray-700">
      <div class="font-semibold text-[#00457c]">Covariance matrix C</div>
      <div class="flex gap-2 mt-1 flex-wrap">
        <button v-for="(p, i) in presets" :key="p.label" class="demo-btn font-mono" :class="{ active: pi === i }" @click="pi = i">{{ p.label }}</button>
      </div>

      <div class="grid items-center gap-x-2 mt-3" style="grid-template-columns: 6rem 1fr 2.4rem">
        <span>direction of <strong class="text-[#1f5fa8]">a</strong></span>
        <input v-model.number="angle" type="range" min="0" max="180" step="1">
        <span class="font-mono">{{ angle }}&#176;</span>
      </div>

      <div class="mt-3 font-mono text-[.74rem]">
        a = ({{ fmt(probe.a[0]) }}, {{ fmt(probe.a[1]) }})<br>
        Ca = ({{ fmt(probe.x[0]) }}, {{ fmt(probe.x[1]) }})
      </div>
      <div class="mt-2 px-2 py-1 rounded border-2 transition-colors"
        :class="probe.parallel ? 'border-[#2eb82e] bg-[#e7f7e7] text-[#1f6b26]' : 'border-gray-200 text-gray-500'">
        <template v-if="probe.parallel">
          <strong>Eigenvector!</strong> Ca = &#955;a with &#955; &#8776; {{ fmt(probe.scale) }}: only scaled, not rotated.
        </template>
        <template v-else>
          Ca points in a different direction than a.
        </template>
      </div>
      <label class="flex items-center gap-1 mt-3"><input v-model="showEig" type="checkbox"> show eigenvectors</label>
    </div>
  </div>
</template>

<style scoped>
.eig-demo input[type='range'] { accent-color: #00457c; }
.demo-btn {
  border: 1.5px solid #00457c;
  border-radius: 6px;
  padding: 2px 6px;
  color: #00457c;
  background: #fff;
  font-size: .64rem;
}
.demo-btn.active,
.demo-btn:hover {
  background: #00457c;
  color: #fff;
}
</style>
