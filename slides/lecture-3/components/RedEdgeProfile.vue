<script setup lang="ts">
// Curran et al. (1990) leaf reflectance spectra with the "typical red edge" marked.
// clicks: 0 plot only, 1 + red-edge marker
import plotUrl from '../figures/spectral/curran-red-edge.png'

const props = withDefaults(defineProps<{ clicks?: number }>(), { clicks: Infinity })
</script>

<template>
  <div class="relative w-full" style="height: 0; padding-top: 71.1000%">
    <img :src="plotUrl" class="absolute inset-0 w-full h-full" alt="Leaf reflectance spectra for two chlorophyll contents: low reflectance in blue and red, a peak in green and a steep rise into the near infrared" />
    <div class="absolute inset-0" :style="{ opacity: props.clicks >= 1 ? 1 : 0, transition: 'opacity .4s' }">
      <svg viewBox="0 0 100 71.1" style="position: absolute; inset: 0; width: 100%; height: 100%">
        <line x1="62.5" y1="53.47" x2="80.9" y2="5.55" stroke="#d62728" stroke-linecap="round" :style="{ strokeOpacity: 0.85, strokeWidth: 1.4 }" />
      </svg>
      <div class="absolute text-[#d62728] font-semibold leading-tight text-right" style="left: 36%; top: 50%; width: 25%; font-size: .9rem">
        Typical<br>red edge
      </div>
    </div>
  </div>
</template>
