<script setup lang="ts">
// Chlorophyll-a/b absorbance with the first 11 Sentinel-3 OLCI bands overlaid.
// Bar positions are taken from the original lecture slide (percent of the image width).
// Colours: blue / red = bands inside the chlorophyll absorption peaks, green = low absorption, grey = beyond.
import chartUrl from '../figures/spectral/olci-chl-absorbance.png'

const bands = [
  { n: 'b1', x: 7.94, c: '#0432ff' }, { n: 'b2', x: 9.91, c: '#0432ff' }, { n: 'b3', x: 19.07, c: '#0432ff' },
  { n: 'b4', x: 29.33, c: '#5fcf5f' }, { n: 'b5', x: 34.56, c: '#5fcf5f' }, { n: 'b6', x: 45.91, c: '#5fcf5f' },
  { n: 'b7', x: 67.07, c: '#ff0000' }, { n: 'b8', x: 77.55, c: '#ff0000' }, { n: 'b9', x: 81.91, c: '#ff0000' },
  { n: 'b10', x: 84.96, c: '#ff0000' }, { n: 'b11', x: 93.47, c: '#9a9a9a' },
]
const W = 1.27
</script>

<template>
  <div class="relative w-full mt-8" style="height: 0; padding-top: 45.6429%">
    <div v-for="b in bands" :key="b.n" class="absolute" :style="{ left: `${b.x}%`, width: `${W}%`, top: '4.38%', height: '79.39%', background: b.c, opacity: 0.42 }" />
    <img :src="chartUrl" class="absolute inset-0 w-full h-full" style="mix-blend-mode: multiply" alt="Absorbance spectra of chlorophyll a and b between 400 and 700 nm" />
    <div v-for="(b, i) in bands" :key="`l${b.n}`" class="absolute text-[#00457c] text-center leading-none" :style="{ left: `${b.x + W / 2}%`, top: i % 2 ? '-0.95rem' : '-1.75rem', transform: 'translateX(-50%)', fontSize: '.62rem' }">{{ b.n }}</div>
  </div>
</template>
