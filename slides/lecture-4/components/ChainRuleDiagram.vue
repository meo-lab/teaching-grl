<script setup lang="ts">
// Forward pass and backward (chain-rule) pass through logistic regression.
// clicks 0: forward; 1: local derivatives flowing back; 2: product = gradient
const props = withDefaults(defineProps<{ clicks?: number }>(), { clicks: 0 })

const W = 760
const H = 230
const nodes = [
  { x: 70, t: 'w, b, x', s: 'parameters, input' },
  { x: 270, t: 'z = wᵀx + b', s: 'linear part' },
  { x: 470, t: 'p = σ(z)', s: 'sigmoid' },
  { x: 670, t: 'L(p, y)', s: 'BCE loss' },
]
const back = [
  { x: 170, t: '∂z/∂w = x' },
  { x: 370, t: '∂p/∂z = p(1−p)' },
  { x: 570, t: '∂L/∂p = (p−y) / (p(1−p))' },
]
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto crd">
    <defs>
      <marker id="crd-f" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#00457c" /></marker>
      <marker id="crd-b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ff7900" /></marker>
    </defs>

    <text x="20" y="22" class="lf">forward pass: compute the prediction and the loss</text>
    <line v-for="i in [0, 1, 2]" :key="`f${i}`" :x1="nodes[i].x + 62" :x2="nodes[i + 1].x - 64" y1="62" y2="62" class="fw" marker-end="url(#crd-f)" />
    <g v-for="n in nodes" :key="n.t">
      <rect :x="n.x - 62" y="40" width="124" height="44" rx="8" class="node" />
      <text :x="n.x" y="67" class="nt">{{ n.t }}</text>
      <text :x="n.x" y="100" class="ns">{{ n.s }}</text>
    </g>

    <g :style="{ opacity: props.clicks >= 1 ? 1 : 0, transition: 'opacity .4s' }">
      <text x="20" y="128" class="lb">backward pass: multiply the local derivatives (chain rule)</text>
      <line v-for="i in [2, 1, 0]" :key="`b${i}`" :x1="nodes[i + 1].x - 10" :x2="nodes[i].x + 10" y1="146" y2="146" class="bw" marker-end="url(#crd-b)" />
      <text v-for="b in back" :key="b.t" :x="b.x" y="166" class="bt">{{ b.t }}</text>
    </g>

    <g :style="{ opacity: props.clicks >= 2 ? 1 : 0, transition: 'opacity .4s' }">
      <rect x="150" y="182" width="460" height="38" rx="8" class="res" />
      <text x="380" y="206" class="rt">∂L/∂w = ∂L/∂p · ∂p/∂z · ∂z/∂w = (p − y) · x</text>
    </g>
  </svg>
</template>

<style scoped>
.crd .lf { font: 600 11.5px "Exo 2", sans-serif; fill: #00457c; }
.crd .lb { font: 600 11.5px "Exo 2", sans-serif; fill: #c45f00; }
.crd .node { fill: #f1f6fb; stroke: #00457c; stroke-width: 1.4; }
.crd .nt { font: italic 14px 'Times New Roman', serif; fill: #222; text-anchor: middle; }
.crd .ns { font: 10.5px "Exo 2", sans-serif; fill: #5f625f; text-anchor: middle; }
.crd .fw { stroke: #00457c; stroke-width: 1.8; }
.crd .bw { stroke: #ff7900; stroke-width: 1.8; }
.crd .bt { font: italic 13px 'Times New Roman', serif; fill: #c45f00; text-anchor: middle; }
.crd .res { fill: #fff5ec; stroke: #ff7900; stroke-width: 1.5; }
.crd .rt { font: italic 15px 'Times New Roman', serif; fill: #222; text-anchor: middle; }
</style>
