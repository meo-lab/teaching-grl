<script setup lang="ts">
// Principal Component Transformation of one Sentinel-2 pixel:
// 12-band vector x -> centre -> multiply by the P x D loading matrix -> P scores.
import rgbUrl from '../figures/pca/s2-rgb.png'
import pcaUrl from '../figures/pca/s2-pca-rgb.png'

const bands = ['1', '2', '3', '4', '5', '6', '7', '8', '8A', '9', '11', '12']
const pcs = [
  { label: 'PC1', fill: '#e8706f' },
  { label: 'PC2', fill: '#5fbf6a' },
  { label: 'PC3', fill: '#7fb0de' },
]
</script>

<template>
  <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 33.3333%"><svg viewBox="0 0 900 300" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" aria-label="Principal component transformation of a single Sentinel-2 pixel">
    <defs>
      <marker id="pct-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#00457c" /></marker>
    </defs>
    <!-- input image and pixel -->
    <image :href="rgbUrl" x="0" y="40" width="170" height="170" />
    <rect x="118" y="88" width="14" height="14" fill="none" stroke="#ff7900" stroke-width="3" />
    <text x="85" y="232" text-anchor="middle" style="font-size: 13px" fill="#333">Sentinel-2 image</text>

    <!-- pixel vector -->
    <g transform="translate(200 22)">
      <text x="10" y="-6" style="font-size: 14px" font-style="italic" font-weight="700" text-anchor="middle" fill="#222">x</text>
      <g v-for="(b, i) in bands" :key="b">
        <rect x="0" :y="i * 19" width="20" height="16" rx="3" fill="#6b7075" />
        <text x="10" :y="i * 19 + 12" style="font-size: 9px" text-anchor="middle" fill="#fff">{{ b }}</text>
      </g>
      <text x="10" y="248" style="font-size: 11px" text-anchor="middle" fill="#555">D &#215; 1</text>
    </g>
    <line x1="132" y1="95" x2="194" y2="95" stroke="#ff7900" stroke-width="2" stroke-dasharray="4 3" />

    <!-- PCT box -->
    <path d="M 245 30 L 650 60 L 650 220 L 245 250 Z" fill="#f2f6fa" stroke="#00457c" stroke-width="2" />
    <text x="450" y="64" style="font-size: 15px" font-weight="700" fill="#00457c" text-anchor="middle">Principal Component Transformation</text>

    <rect x="272" y="96" width="140" height="58" rx="8" fill="#fff" stroke="#00457c" />
    <text x="342" y="118" style="font-size: 13px" text-anchor="middle" fill="#00457c" font-weight="700">1. center</text>
    <text x="342" y="140" style="font-size: 14px" text-anchor="middle" fill="#222" font-style="italic">x&#771; = x &#8722; &#956;</text>

    <line x1="414" y1="125" x2="436" y2="125" stroke="#00457c" stroke-width="2" marker-end="url(#pct-arrow)" />

    <rect x="440" y="80" width="196" height="122" rx="8" fill="#fff" stroke="#00457c" />
    <text x="538" y="100" style="font-size: 13px" text-anchor="middle" fill="#00457c" font-weight="700">2. linear transform</text>
    <text x="538" y="120" style="font-size: 14px" text-anchor="middle" fill="#222" font-style="italic">p = P x&#771;</text>
    <g transform="translate(470 132)">
      <g v-for="r in 3" :key="r">
        <text x="-6" :y="(r - 1) * 16 + 11" style="font-size: 10px" text-anchor="end" font-style="italic" fill="#333">p{{ r }}</text>
        <rect v-for="c in 8" :key="c" :x="(c - 1) * 15" :y="(r - 1) * 16" width="13" height="14" rx="2" fill="#ffb877" />
      </g>
      <text x="136" y="28" style="font-size: 11px" fill="#555">P &#215; D</text>
    </g>

    <line x1="652" y1="140" x2="700" y2="140" stroke="#00457c" stroke-width="3" marker-end="url(#pct-arrow)" />

    <!-- PC scores -->
    <g transform="translate(712 108)">
      <text x="16" y="-10" style="font-size: 14px" font-style="italic" font-weight="700" text-anchor="middle" fill="#222">p</text>
      <g v-for="(p, i) in pcs" :key="p.label">
        <rect x="0" :y="i * 22" width="32" height="18" rx="4" :fill="p.fill" />
        <text x="16" :y="i * 22 + 13" style="font-size: 10px" text-anchor="middle" fill="#fff" font-weight="700">{{ p.label }}</text>
      </g>
      <text x="16" y="84" style="font-size: 11px" text-anchor="middle" fill="#555">P &#215; 1</text>
    </g>

    <image :href="pcaUrl" x="765" y="70" width="135" height="135" />
    <text x="832" y="228" text-anchor="middle" style="font-size: 13px" fill="#333">PC1&#8211;3 as RGB</text>

    <text x="245" y="285" style="font-size: 13px" fill="#555">correlated bands (D = 12)</text>
    <text x="650" y="285" style="font-size: 13px" fill="#555" text-anchor="end">uncorrelated components (P = 3)</text>
  </svg></div>
</template>
