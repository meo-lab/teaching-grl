<script setup lang="ts">
// Data matrix X (N pixels x D bands) with the variables used by the current
// statistic highlighted: one band (1), two bands (2) or all D bands ('D').
const props = withDefaults(defineProps<{ dims?: 1 | 2 | 'D' }>(), { dims: 1 })

const cols = ['1', '2', '3', '…', 'D']
const colX = (j: number) => 70 + j * 44
const rows = 5
const hl = (j: number) => {
  if (j === 3) return null
  if (props.dims === 'D') return j === 0 ? '#d64545' : j === 1 ? '#2eb82e' : '#6aa86a'
  if (props.dims === 2) return j === 0 ? '#d64545' : j === 1 ? '#2eb82e' : null
  return j === 0 ? '#d64545' : null
}
const label = (j: number) => {
  if (props.dims === 'D') return j === 0 ? '1' : j === 1 ? '2' : j === 4 ? 'D' : ''
  if (props.dims === 2) return j === 0 ? '1' : j === 1 ? '2' : ''
  return j === 0 ? ' ' : ''
}
const shades = ['#6b7075', '#e5a46e', '#7cc47c', '#fff', '#a8acb0']
</script>

<template>
  <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 72%"><svg viewBox="0 0 300 216" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" aria-label="Data matrix with N pixel rows and D band columns; the bands used by the statistic are highlighted">
    <rect x="30" y="4" width="262" height="208" rx="10" fill="#fff" stroke="#00457c" stroke-width="1.5" />
    <text x="44" y="24" style="font-size: 14px" font-weight="700" fill="#00457c">Data matrix X</text>
    <text x="282" y="24" style="font-size: 11px" font-style="italic" fill="#555" text-anchor="end">N × D</text>

    <g v-for="(c, j) in cols" :key="c">
      <!-- column header: band / dimension -->
      <text :x="colX(j) + 12" y="46" text-anchor="middle" style="font-size: 12px" font-style="italic" font-weight="700" fill="#333"><template v-if="c === '…'">…</template><template v-else>x<tspan dy="3" style="font-size: 9px">{{ c }}</tspan></template></text>
      <template v-if="j !== 3">
        <rect v-for="r in rows" :key="r" :x="colX(j)" :y="52 + (r - 1) * 26 + (r === rows ? 8 : 0)" width="24" height="22" rx="3" :fill="shades[j]" />
      </template>
      <text v-else :x="colX(j) + 12" y="110" text-anchor="middle" style="font-size: 15px" fill="#555">…</text>
      <!-- highlight -->
      <rect v-if="hl(j)" :x="colX(j) - 4" y="49" width="32" height="146" rx="6" :fill="hl(j)!" :stroke="hl(j)!" stroke-width="2.5" :style="{ fillOpacity: 0.28 }" />
      <text v-if="label(j)" :x="colX(j) + 12" y="208" text-anchor="middle" style="font-size: 12px" font-weight="700" font-style="italic" :fill="hl(j) || '#6aa86a'">d<tspan v-if="label(j).trim()" dy="3" style="font-size: 9px">{{ label(j) }}</tspan></text>
    </g>
    <text x="57" y="160" text-anchor="middle" style="font-size: 14px" fill="#555">⋮</text>

    <!-- iterate through pixels -->
    <g fill="#00457c">
      <path v-for="r in 3" :key="r" :d="`M 8 ${60 + (r - 1) * 26} l 14 0 m -5 -4 l 5 4 l -5 4`" stroke="#00457c" stroke-width="2" fill="none" />
    </g>
    <text x="10" y="196" style="font-size: 10px" fill="#00457c" transform="rotate(-90 10 196)">iterate through pixels n</text>
  </svg></div>
</template>
