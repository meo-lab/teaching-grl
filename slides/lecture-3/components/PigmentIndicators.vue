<script setup lang="ts">
// Reflectance spectra of two cyanobacteria genera and water (modified from Legleiter et al., 2022)
// with spectral-shape indicators for phycocyanin (PC) and chlorophyll-a (CHL-a).
// clicks: 0 spectra (+ Anabaena inset), 1 + PC indicator, 2 + CHL-a indicator
import { useId } from 'vue'
import plotUrl from '../figures/spectral/legleiter-cyanobacteria-spectra.svg'
import anabaenaUrl from '../figures/spectral/anabaena.jpg'

const props = withDefaults(defineProps<{ clicks?: number }>(), { clicks: Infinity })
const uid = useId()
const red = `pi-red-${uid}`
const green = `pi-green-${uid}`
const show = (k: number) => ({ opacity: props.clicks >= k ? 1 : 0, transition: 'opacity .4s' })
</script>

<template>
  <div class="relative w-full" style="height: 0; padding-top: 53.8125%">
    <img :src="plotUrl" class="absolute inset-0 w-full h-full" alt="Reflectance spectra of Anabaena, Eucapsis and water between 400 and 800 nm" />

    <!-- Anabaena inset -->
    <div class="absolute" style="left: 48%; top: 4.7%; width: 48.1%">
      <img :src="anabaenaUrl" class="w-full" alt="Microscope image of an Anabaena filament" />
      <div class="text-[#00457c]" style="font-size: .6rem">Anabaena, image: Wikipedia</div>
    </div>

    <svg viewBox="0 0 130 69.9562" style="position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible">
      <defs>
        <marker :id="red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto" markerUnits="strokeWidth"><path d="M0 0 L10 5 L0 10 z" fill="#e3242b" /></marker>
        <marker :id="green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto" markerUnits="strokeWidth"><path d="M0 0 L10 5 L0 10 z" fill="#2ca02c" /></marker>
      </defs>
      <g :style="show(1)">
        <line x1="65.52" y1="45.33" x2="78.26" y2="52.4" stroke="#e3242b" style="stroke-width: .5; stroke-dasharray: 1.4 .9" />
        <line x1="70.46" y1="47.29" x2="70.46" y2="43.65" stroke="#e3242b" style="stroke-width: .5" :marker-end="`url(#${red})`" />
      </g>
      <g :style="show(2)">
        <line x1="71.89" y1="43.37" x2="85.28" y2="43.37" stroke="#2ca02c" style="stroke-width: .5; stroke-dasharray: 1.4 .9" />
        <line x1="78.26" y1="43.37" x2="78.26" y2="51.77" stroke="#2ca02c" style="stroke-width: .5" :marker-end="`url(#${green})`" />
      </g>
    </svg>
    <div class="absolute text-[#00457c] leading-tight" style="left: 46%; top: 46%; font-size: .72rem" :style="show(1)">PC<br>indicator</div>
    <div class="absolute text-[#2ca02c] leading-tight" style="left: 59%; top: 54.5%; font-size: .72rem" :style="show(2)">CHL-a indicator</div>
  </div>
</template>
