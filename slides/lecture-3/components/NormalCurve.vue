<script setup lang="ts">
// Normal distribution with mean mu and standard deviation sigma: shaded 1, 2, 3 sigma
// bands and the share of the data within each band.
const W = 460
const H = 210
const x0 = 30
const x1 = W - 20
const yb = H - 34
const sx = (z: number) => x0 + ((z + 3.6) / 7.2) * (x1 - x0)
const pdf = (z: number) => Math.exp(-0.5 * z * z)
const sy = (p: number) => yb - p * 150
function area(a: number, b: number) {
  const pts: string[] = [`${sx(a)},${yb}`]
  for (let z = a; z <= b + 1e-9; z += 0.05) pts.push(`${sx(z)},${sy(pdf(z))}`)
  pts.push(`${sx(b)},${yb}`)
  return pts.join(' ')
}
const curve = Array.from({ length: 145 }, (_, i) => -3.6 + i * 0.05).map(z => `${sx(z)},${sy(pdf(z))}`).join(' ')
const bands = [
  { a: -1, b: 1, fill: '#00457c', op: 0.95 },
  { a: -2, b: -1, fill: '#3b7fb5', op: 0.85 },
  { a: 1, b: 2, fill: '#3b7fb5', op: 0.85 },
  { a: -3, b: -2, fill: '#8db8db', op: 0.85 },
  { a: 2, b: 3, fill: '#8db8db', op: 0.85 },
]
const labels = [
  { z: -0.5, t: '34.1%', y: 0.55, c: '#fff' }, { z: 0.5, t: '34.1%', y: 0.55, c: '#fff' },
  { z: -1.5, t: '13.6%', y: 0.12, c: '#fff' }, { z: 1.5, t: '13.6%', y: 0.12, c: '#fff' },
  { z: -2.45, t: '2.1%', y: 0.16, c: '#333' }, { z: 2.45, t: '2.1%', y: 0.16, c: '#333' },
  { z: -3.25, t: '0.1%', y: 0.1, c: '#333' }, { z: 3.25, t: '0.1%', y: 0.1, c: '#333' },
]
const ticks = [-3, -2, -1, 0, 1, 2, 3]
</script>

<template>
  <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 45.65%"><svg :viewBox="`0 0 ${W} ${H}`" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" aria-label="Normal distribution: 68 percent of values lie within one standard deviation of the mean, 95 percent within two">
    <polygon v-for="(b, i) in bands" :key="i" :points="area(b.a, b.b)" :fill="b.fill" :style="{ fillOpacity: b.op }" stroke="#fff" stroke-width="1" />
    <polyline :points="curve" fill="none" stroke="#1d2b36" stroke-width="1.6" />
    <line :x1="x0" :y1="yb" :x2="x1" :y2="yb" stroke="#1d2b36" />
    <text v-for="l in labels" :key="l.z" :x="sx(l.z)" :y="sy(l.y)" text-anchor="middle" style="font-size: 11px" :fill="l.c">{{ l.t }}</text>
    <g v-for="t in ticks" :key="t">
      <line :x1="sx(t)" :y1="yb" :x2="sx(t)" :y2="yb + 5" stroke="#1d2b36" />
      <text :x="sx(t)" :y="yb + 18" text-anchor="middle" style="font-size: 12px" fill="#1d2b36">{{ t === 0 ? 'μ' : `${t > 0 ? '+' : '−'}${Math.abs(t) === 1 ? '' : Math.abs(t)}σ` }}</text>
    </g>
    <text :x="sx(0)" :y="H - 2" text-anchor="middle" style="font-size: 11px" fill="#555">mean μ<tspan dy="3" style="font-size: 8px">d</tspan><tspan dy="-3"> and standard deviation σ</tspan><tspan dy="3" style="font-size: 8px">d</tspan><tspan dy="-3"> of band d</tspan></text>
  </svg></div>
</template>
