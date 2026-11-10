<script setup lang="ts">
// An artificial neuron: weighted sum of the inputs plus bias, then an activation.
const W = 560
const H = 230
const ins = [
  { y: 45, t: 'x₁', w: 'w₁' },
  { y: 95, t: 'x₂', w: 'w₂' },
  { y: 145, t: 'x₃', w: 'w₃' },
  { y: 195, t: '1', w: 'b', bias: true },
]
const sx = 270
const sy = 120
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto nd">
    <defs>
      <marker id="nd-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#5f625f" /></marker>
    </defs>
    <g v-for="i in ins" :key="i.t">
      <line :x1="62" :y1="i.y" :x2="sx - 34" :y2="sy" class="edge" />
      <circle cx="44" :cy="i.y" r="17" :class="i.bias ? 'bias' : 'in'" />
      <text x="44" :y="i.y + 5" :class="i.bias ? 'biast' : 'int'">{{ i.t }}</text>
      <text :x="62 + (sx - 34 - 62) * 0.45" :y="i.y + (sy - i.y) * 0.45 - 6" class="wt">{{ i.w }}</text>
    </g>
    <circle :cx="sx" :cy="sy" r="32" class="sum" />
    <text :x="sx" :y="sy - 2" class="sumt">Σ</text>
    <text :x="sx" :y="sy + 16" class="small">z = wᵀx + b</text>
    <line :x1="sx + 32" :y1="sy" :x2="sx + 92" :y2="sy" class="edge" marker-end="url(#nd-a)" />
    <rect :x="sx + 96" :y="sy - 26" width="82" height="52" rx="10" class="act" />
    <text :x="sx + 137" :y="sy - 2" class="actt">act(z)</text>
    <text :x="sx + 137" :y="sy + 15" class="small">σ, tanh, ReLU</text>
    <line :x1="sx + 178" :y1="sy" :x2="sx + 232" :y2="sy" class="edge" marker-end="url(#nd-a)" />
    <text :x="sx + 252" :y="sy + 5" class="out">a</text>
    <text x="44" y="226" class="small">inputs</text>
    <text :x="sx" y="226" class="small">weighted sum (block 1)</text>
    <text :x="sx + 137" y="226" class="small">activation (block 2)</text>
  </svg>
</template>

<style scoped>
.nd .edge { stroke: #5f625f; stroke-width: 1.5; }
.nd .in { fill: #00457c; }
.nd .bias { fill: #fff; stroke: #00457c; stroke-width: 1.5; }
.nd .int { font: 600 13px "Exo 2", sans-serif; fill: #fff; text-anchor: middle; }
.nd .biast { font: 600 13px "Exo 2", sans-serif; fill: #00457c; text-anchor: middle; }
.nd .wt { font: italic 13px 'Times New Roman', serif; fill: #c45f00; text-anchor: middle; }
.nd .sum { fill: #f1f6fb; stroke: #00457c; stroke-width: 1.6; }
.nd .sumt { font: 22px 'Times New Roman', serif; fill: #00457c; text-anchor: middle; }
.nd .act { fill: #fff5ec; stroke: #ff7900; stroke-width: 1.6; }
.nd .actt { font: italic 15px 'Times New Roman', serif; fill: #222; text-anchor: middle; }
.nd .small { font: 10.5px "Exo 2", sans-serif; fill: #5f625f; text-anchor: middle; }
.nd .out { font: italic 18px 'Times New Roman', serif; fill: #222; text-anchor: middle; }
</style>
