<script setup lang="ts">
// Principal components "densify" information: 13 Sentinel-2 bands -> k PCs ->
// reconstructed 13 bands. clicks step through k = 2, 3, 6.
import { computed } from 'vue'
import rgbUrl from '../figures/pca/s2-rgb.png'
import rec2 from '../figures/pca/s2-reconstruction-2pc.png'
import rec3 from '../figures/pca/s2-reconstruction-3pc.png'
import rec6 from '../figures/pca/s2-reconstruction-6pc.png'

const props = withDefaults(defineProps<{ clicks?: number }>(), { clicks: 0 })

const steps = [
  { k: 2, ev: 93, img: rec2 },
  { k: 3, ev: 96, img: rec3 },
  { k: 6, ev: 99, img: rec6 },
]
const step = computed(() => steps[Math.max(0, Math.min(steps.length - 1, props.clicks))])
const bands = ['1', '2', '3', '4', '5', '6', '7', '8', '8A', '9', '10', '11', '12']
const H = 300
const pcY = (i: number, k: number) => H / 2 - (k * 22) / 2 + i * 22
</script>

<template>
  <div>
    <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 36.6667%"><svg viewBox="0 0 900 330" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" aria-label="Sentinel-2 bands compressed to a few principal components and reconstructed">
      <!-- column headers -->
      <g style="font-size: 14px" text-anchor="middle" fill="#333">
        <text x="232" y="14" font-style="italic" font-weight="700">x</text>
        <text x="232" y="30">original bands</text>
        <text x="450" y="14" font-style="italic" font-weight="700">p</text>
        <text x="450" y="30">principal components</text>
        <text x="668" y="14" font-style="italic" font-weight="700">x&#770;</text>
        <text x="668" y="30">reconstructed bands</text>
      </g>
      <image :href="rgbUrl" x="0" y="55" width="200" height="200" />
      <image :href="step.img" x="700" y="55" width="200" height="200" />

      <g v-for="(b, i) in bands" :key="`a${b}`">
        <rect x="222" :y="45 + i * 19" width="20" height="16" rx="3" fill="#6b7075" />
        <text x="232" :y="57 + i * 19" text-anchor="middle" style="font-size: 9px" fill="#fff">{{ b }}</text>
        <rect x="658" :y="45 + i * 19" width="20" height="16" rx="3" fill="#6b7075" />
        <text x="668" :y="57 + i * 19" text-anchor="middle" style="font-size: 9px" fill="#fff">{{ b }}</text>
      </g>

      <!-- encoder / decoder trapezoids -->
      <path d="M 268 80 L 390 125 L 390 185 L 268 230 Z" fill="#00457c" />
      <text x="322" y="160" text-anchor="middle" style="font-size: 15px" font-weight="700" fill="#fff">PCT</text>
      <path d="M 510 125 L 632 80 L 632 230 L 510 185 Z" fill="#00457c" />
      <text x="578" y="152" text-anchor="middle" style="font-size: 12px" fill="#fff">inverse</text>
      <text x="578" y="169" text-anchor="middle" style="font-size: 15px" font-weight="700" fill="#fff">PCT</text>

      <g v-for="i in step.k" :key="`pc${i}`">
        <rect x="430" :y="pcY(i - 1, step.k) + 5" width="40" height="18" rx="4" fill="#2eb82e" style="transition: y .4s" />
        <text x="450" :y="pcY(i - 1, step.k) + 18" text-anchor="middle" style="font-size: 10px" fill="#fff" font-weight="700">PC{{ i }}</text>
      </g>
    </svg></div>
    <div class="mx-auto w-fit -mt-4 px-4 py-1.5 rounded-lg border-2 border-[#00457c] text-[.78rem] text-[#00457c]">
      <strong>{{ step.k }} principal components</strong> reconstruct the 13-band image with
      <strong>{{ step.ev }}&#8239;% &#8220;explained variance&#8221;</strong>
    </div>
  </div>
</template>
