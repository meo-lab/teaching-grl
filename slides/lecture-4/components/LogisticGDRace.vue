<script setup lang="ts">
// Several gradient-descent runs on the logistic loss surface, side by side and in
// lockstep (e.g. momentum 0 / 0.8 / 1). Click any surface to change the shared start.
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { LOG_RANGE, lossImage, logLoss, runLogGD } from '../lib/lossSurface'

type Cfg = { label: string, lr: number, momentum?: number, weightDecay?: number }
const props = withDefaults(defineProps<{
  configs: Cfg[]
  init?: [number, number]
  epochs?: number
}>(), {
  init: () => [-7, 7],
  epochs: 150,
})

const S = 150
const CH = 48
const gap = 34
const padL = 30
const W = padL + props.configs.length * (S + gap)
const H = 20 + S + 16 + CH + 22
const ox = (k: number) => padL + k * (S + gap)
const mX = (k: number, w: number) => ox(k) + (w - LOG_RANGE.w1[0]) / 20 * S
const mY = (w: number) => 20 + (LOG_RANGE.w2[1] - w) / 20 * S
const cTop = 20 + S + 16
const uid = `lgr-${Math.random().toString(36).slice(2, 8)}`

const surf = shallowRef<string>()
onMounted(() => {
  surf.value = lossImage((a, b) => logLoss(a, b), LOG_RANGE.w1, LOG_RANGE.w2, { bands: 16, gamma: 0.6 }).url
})

const init = ref<[number, number]>([...props.init])
const runs = computed(() => props.configs.map(c => runLogGD({ init: init.value, lr: c.lr, momentum: c.momentum, weightDecay: c.weightDecay, epochs: props.epochs })))
const t = ref(0)
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
function stop() {
  playing.value = false
  if (timer)
    clearInterval(timer)
  timer = undefined
}
function step() {
  if (t.value < props.epochs)
    t.value++
  else stop()
}
function play() {
  if (playing.value)
    return stop()
  if (t.value >= props.epochs)
    t.value = 0
  playing.value = true
  timer = setInterval(step, 40)
}
function reset() {
  stop()
  t.value = 0
}
onUnmounted(stop)

const lMax = computed(() => Math.max(...runs.value.map(r => r[0].L), 0.8) * 1.05)
const cX = (k: number, i: number) => ox(k) + i / props.epochs * S
const cY = (v: number) => cTop + CH - Math.min(v / lMax.value, 1) * CH
const path = (k: number) => runs.value[k].slice(0, t.value + 1).map(s => `${mX(k, s.w1)},${mY(s.w2)}`).join(' ')
const curve = (k: number) => runs.value[k].slice(0, t.value + 1).map((s, i) => `${cX(k, i)},${cY(s.L)}`).join(' ')
const outside = (k: number) => {
  const s = runs.value[k][t.value]
  return Math.abs(s.w1) > 10 || Math.abs(s.w2) > 10
}

const svg = ref<SVGSVGElement>()
function onClick(e: PointerEvent) {
  const el = svg.value
  if (!el)
    return
  const pt = el.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const p = pt.matrixTransform(el.getScreenCTM()!.inverse())
  for (let k = 0; k < props.configs.length; k++) {
    if (p.x >= ox(k) && p.x <= ox(k) + S && p.y >= 20 && p.y <= 20 + S) {
      init.value = [LOG_RANGE.w1[0] + (p.x - ox(k)) / S * 20, LOG_RANGE.w2[1] - (p.y - 20) / S * 20]
      reset()
    }
  }
}
</script>

<template>
  <div class="lgr select-none">
    <svg ref="svg" :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto" @pointerdown="onClick">
      <g v-for="(c, k) in configs" :key="k">
        <clipPath :id="`${uid}-${k}`"><rect :x="ox(k)" y="20" :width="S" :height="S" /></clipPath>
        <text :x="ox(k) + S / 2" y="13" class="ttl">{{ c.label }}</text>
        <image v-if="surf" :href="surf" :x="ox(k)" y="20" :width="S" :height="S" preserveAspectRatio="none" />
        <rect :x="ox(k)" y="20" :width="S" :height="S" class="frame" style="cursor: crosshair" />
        <g :clip-path="`url(#${uid}-${k})`" pointer-events="none">
          <polyline :points="path(k)" class="path" />
          <circle :cx="mX(k, runs[k][t].w1)" :cy="mY(runs[k][t].w2)" r="5" class="cur" />
        </g>
        <text v-if="outside(k)" :x="ox(k) + S / 2" :y="20 + S - 8" class="warn">left the plot: ({{ runs[k][t].w1.toFixed(0) }}, {{ runs[k][t].w2.toFixed(0) }})</text>
        <text v-if="k === 0" :x="ox(k) - 6" :y="mY(0) + 3.5" class="tick" text-anchor="end">w₂</text>
        <text :x="ox(k) + S / 2" :y="20 + S + 11" class="tick">w₁</text>

        <rect :x="ox(k)" :y="cTop" :width="S" :height="CH" class="frame" />
        <polyline :points="curve(k)" class="curve" />
        <text :x="ox(k) + S / 2" :y="cTop + CH + 13" class="tick">epoch {{ t }} · L = {{ runs[k][t].L.toFixed(3) }}</text>
        <text v-if="k === 0" :transform="`translate(${ox(k) - 8},${cTop + CH / 2}) rotate(-90)`" class="tick">loss</text>
      </g>
    </svg>
    <div class="ctrl">
      <button @click.stop="step">step</button>
      <button @click.stop="play">{{ playing ? 'pause' : 'run' }}</button>
      <button class="ghostbtn" @click.stop="reset">reset</button>
      <span>all runs start at w = ({{ init[0].toFixed(1) }}, {{ init[1].toFixed(1) }}) · click a surface to change it</span>
    </div>
  </div>
</template>

<style scoped>
.lgr .frame { fill: none; stroke: #9aa1a6; }
.lgr .ttl { font: 600 12px "Exo 2", sans-serif; fill: #00457c; text-anchor: middle; }
.lgr .tick { font: 9.5px "Exo 2", sans-serif; fill: #555; text-anchor: middle; }
.lgr .path { fill: none; stroke: #b02b37; stroke-width: 2; }
.lgr .cur { fill: #ff7900; stroke: #fff; stroke-width: 1.6; }
.lgr .curve { fill: none; stroke: #00457c; stroke-width: 2; }
.lgr .warn { font: 600 10px "Exo 2", sans-serif; fill: #fff; text-anchor: middle; paint-order: stroke; stroke: #b02b37; stroke-width: 3px; }
.ctrl { display: flex; flex-wrap: wrap; gap: .45rem; align-items: center; justify-content: center; font-size: .66rem; color: #333; margin-top: .2rem; }
.ctrl button { padding: .12rem .6rem; border-radius: 4px; background: #00457c; color: #fff; font-size: .66rem; }
.ctrl button.ghostbtn { background: transparent; color: #00457c; border: 1px solid #00457c; }
</style>
