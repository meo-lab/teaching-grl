<script setup lang="ts">
// PCA as a linear orthogonal transformation: translate by the mean mu and
// rotate by alpha so that the new axes p1, p2 follow the spread of the data.
const mx = 210
const my = 160
const alpha = 28
const rad = (alpha * Math.PI) / 180
const L = 170
const p1 = { x: mx + Math.cos(rad) * L, y: my - Math.sin(rad) * L }
const p2 = { x: mx - Math.sin(rad) * L * 0.75, y: my - Math.cos(rad) * L * 0.75 }
const pts = [
  [-90, -10], [-60, 12], [-30, -18], [0, 8], [35, -12], [70, 10], [100, 0], [-110, 6], [55, 22], [-20, 25], [20, -26], [85, -22], [-70, -24],
].map(([u, v]) => ({
  x: mx + u * Math.cos(rad) - v * Math.sin(rad),
  y: my - (u * Math.sin(rad) + v * Math.cos(rad)),
}))
</script>

<template>
  <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 71.4286%"><svg viewBox="0 0 420 300" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" aria-label="PCA translates the data to its mean and rotates the axes by angle alpha">
    <defs>
      <marker id="pg-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#00457c" /></marker>
      <marker id="pg-arrow-o" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#ff7900" /></marker>
    </defs>
    <!-- original axes -->
    <line x1="30" y1="280" x2="410" y2="280" stroke="#00457c" stroke-width="1.8" marker-end="url(#pg-arrow)" />
    <line x1="30" y1="280" x2="30" y2="10" stroke="#00457c" stroke-width="1.8" marker-end="url(#pg-arrow)" />
    <text x="404" y="296" style="font-size: 14px" font-style="italic" fill="#00457c">x&#8321;</text>
    <text x="38" y="20" style="font-size: 14px" font-style="italic" fill="#00457c">x&#8322;</text>

    <!-- centred axes -->
    <line x1="40" :y1="my" x2="395" :y2="my" stroke="#00457c" stroke-dasharray="4 4" />
    <line :x1="mx" y1="20" :x2="mx" y2="275" stroke="#00457c" stroke-dasharray="4 4" />
    <text x="392" :y="my - 6" style="font-size: 12px" font-style="italic" fill="#00457c" text-anchor="end">x&#8321; &#8722; &#956;&#8321;</text>
    <text :x="mx + 6" y="32" style="font-size: 12px" font-style="italic" fill="#00457c">x&#8322; &#8722; &#956;&#8322;</text>

    <!-- data cloud -->
    <ellipse :cx="mx" :cy="my" rx="145" ry="45" :transform="`rotate(${-alpha} ${mx} ${my})`" fill="#5ec8ec" stroke="#00457c" stroke-width="1.3" :style="{ fillOpacity: '.12' }" />
    <circle v-for="(p, i) in pts" :key="i" :cx="p.x" :cy="p.y" r="3.5" fill="#3b6ea5" />

    <!-- principal axes -->
    <line :x1="2 * mx - p1.x" :y1="2 * my - p1.y" :x2="p1.x" :y2="p1.y" stroke="#ff7900" stroke-width="2.5" marker-end="url(#pg-arrow-o)" />
    <line :x1="2 * mx - p2.x" :y1="2 * my - p2.y" :x2="p2.x" :y2="p2.y" stroke="#ff7900" stroke-width="2.5" marker-end="url(#pg-arrow-o)" />
    <text :x="p1.x + 4" :y="p1.y - 4" style="font-size: 15px" font-weight="700" font-style="italic" fill="#ff7900">p&#8321;</text>
    <text :x="p2.x - 18" :y="p2.y - 2" style="font-size: 15px" font-weight="700" font-style="italic" fill="#ff7900">p&#8322;</text>

    <path :d="`M ${mx + 95} ${my} A 95 95 0 0 0 ${mx + 95 * Math.cos(rad)} ${my - 95 * Math.sin(rad)}`" fill="none" stroke="#b02b37" stroke-width="2" />
    <text :x="mx + 102" :y="my - 18" style="font-size: 15px" font-style="italic" fill="#b02b37">&#945;</text>
    <circle :cx="mx" :cy="my" r="5" fill="#b02b37" />
    <text :x="mx - 10" :y="my + 20" style="font-size: 14px" font-weight="700" fill="#b02b37">&#956;</text>
  </svg></div>
</template>
