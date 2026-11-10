<script setup lang="ts">
// Linear / logistic regression as the "head" of a model.
// clicks 0: fixed features x -> head (Lecture 4)
// clicks >= 1: a learned representation h = g(x) is inserted (Lecture 5)
import { computed } from 'vue'

const props = withDefaults(defineProps<{ clicks?: number }>(), { clicks: 0 })
const deep = computed(() => props.clicks >= 1)

const W = 760
const H = 250
const xs = [52, 92, 132, 172]
const inX = 60
const hidX = 300
const headX = 470
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto mhd">
    <defs>
      <marker id="mhd-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#5f625f" />
      </marker>
    </defs>

    <!-- input features -->
    <text :x="inX" y="24" class="ttl">features x</text>
    <circle v-for="(y, i) in xs" :key="i" :cx="inX" :cy="y + 20" r="13" class="xin" />
    <text v-for="(y, i) in xs" :key="`t${i}`" :x="inX" :y="y + 24" class="nodet">{{ ['x₁', 'x₂', '⋮', 'x_d'][i] }}</text>
    <text :x="inX" y="232" class="note">fixed representation</text>
    <text :x="inX" y="246" class="note">(data cube, Lecture 3)</text>

    <!-- hidden layers (Lecture 5) -->
    <g :style="{ opacity: deep ? 1 : 0, transition: 'opacity .4s' }">
      <rect :x="hidX - 95" y="40" width="190" height="150" rx="10" class="hid" />
      <text :x="hidX" y="64" class="ttlg">learned layers g(x)</text>
      <g v-for="c in [0, 1, 2]" :key="`c${c}`">
        <circle v-for="r in [0, 1, 2]" :key="`r${r}`" :cx="hidX - 50 + c * 50" :cy="98 + r * 32" r="10" class="hn" />
      </g>
      <text :x="hidX" y="232" class="note">learned representation h</text>
      <text :x="hidX" y="246" class="note lec5">learned by the MLP (block 3)</text>
      <line :x1="inX + 18" y1="115" :x2="hidX - 100" y2="115" class="arr" marker-end="url(#mhd-a)" />
      <line :x1="hidX + 96" y1="115" :x2="headX - 8" y2="70" class="arr" marker-end="url(#mhd-a)" />
      <line :x1="hidX + 96" y1="115" :x2="headX - 8" y2="170" class="arr" marker-end="url(#mhd-a)" />
    </g>
    <g :style="{ opacity: deep ? 0 : 1, transition: 'opacity .4s' }">
      <line :x1="inX + 18" y1="115" :x2="headX - 8" y2="70" class="arr" marker-end="url(#mhd-a)" />
      <line :x1="inX + 18" y1="115" :x2="headX - 8" y2="170" class="arr" marker-end="url(#mhd-a)" />
      <text :x="hidX" y="128" class="today">today: the model sees x directly</text>
    </g>

    <!-- heads -->
    <rect :x="headX" y="30" width="276" height="82" rx="10" class="head lin" />
    <text :x="headX + 14" y="54" class="hh">linear head → regression</text>
    <text :x="headX + 14" y="78" class="hf">ŷ = wᵀ{{ deep ? 'h' : 'x' }} + b</text>
    <text :x="headX + 14" y="100" class="hl">loss: MSE · output: a number</text>

    <rect :x="headX" y="130" width="276" height="82" rx="10" class="head log" />
    <text :x="headX + 14" y="154" class="hh">logistic head → classification</text>
    <text :x="headX + 14" y="178" class="hf">p = σ(wᵀ{{ deep ? 'h' : 'x' }} + b)</text>
    <text :x="headX + 14" y="200" class="hl">loss: BCE · output: a probability</text>
  </svg>
</template>

<style scoped>
.mhd .ttl { font: 600 12px "Exo 2", sans-serif; fill: #00457c; text-anchor: middle; }
.mhd .ttlg { font: 600 12px "Exo 2", sans-serif; fill: #2a7a2a; text-anchor: middle; }
.mhd .xin { fill: #00457c; }
.mhd .nodet { font: 600 11px "Exo 2", sans-serif; fill: #fff; text-anchor: middle; }
.mhd .note { font: 10.5px "Exo 2", sans-serif; fill: #5f625f; text-anchor: middle; }
.mhd .lec5 { fill: #2a7a2a; font-weight: 600; }
.mhd .today { font: italic 11px "Exo 2", sans-serif; fill: #5f625f; text-anchor: middle; }
.mhd .hid { fill: #eef8ee; stroke: #2eb82e; stroke-dasharray: 5 4; }
.mhd .hn { fill: #a9e5aa; stroke: #2eb82e; }
.mhd .arr { stroke: #5f625f; stroke-width: 1.6; }
.mhd .head { stroke-width: 1.5; }
.mhd .lin { fill: #f1f6fb; stroke: #00457c; }
.mhd .log { fill: #fff5ec; stroke: #ff7900; }
.mhd .hh { font: 700 12.5px "Exo 2", sans-serif; fill: #00457c; }
.mhd .hf { font: 13px 'Times New Roman', serif; font-style: italic; fill: #222; }
.mhd .hl { font: 10.5px "Exo 2", sans-serif; fill: #5f625f; }
</style>
