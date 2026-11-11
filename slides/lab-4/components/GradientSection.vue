<script setup lang="ts">
defineProps<{ section: 'output' | 'relu' | 'first' }>()

const descriptions = {
  output: 'The two hidden activations feed the weighted sum z two, then the sigmoid prediction and binary cross-entropy loss. This group works from the loss back to the output-layer parameters.',
  relu: 'Two pre-activations pass through ReLU and become hidden activations. The output gradient travels from the weighted sum z two back through both ReLUs.',
  first: 'Two input features connect to both hidden pre-activations. The gradients at the two hidden pre-activations are used to calculate the first-layer weight and bias gradients.',
}
</script>

<template>
  <svg class="gradient-section" viewBox="0 0 440 235" role="img" :aria-label="descriptions[section]">
    <g v-if="section === 'output'">
      <g class="parameter-edge">
        <path d="M66 74L181 111 M66 157L181 128" />
      </g>
      <g class="forward-edge">
        <path d="M225 120H276 M320 120H376 M398 60V98" />
      </g>
      <g class="parameter">
        <text x="119" y="87">w₂[1] = 1</text>
        <text x="119" y="154">w₂[2] = −1.5</text>
        <text x="203" y="88">b₂ = 0.5</text>
      </g>
      <g class="forward">
        <circle cx="44" cy="74" r="22" /><text x="44" y="80">h₁</text>
        <circle cx="44" cy="157" r="22" /><text x="44" y="163">h₂</text>
        <circle cx="203" cy="120" r="22" /><text x="203" y="126">z₂</text>
        <circle cx="298" cy="120" r="22" /><text x="298" y="126">p</text>
        <circle cx="398" cy="120" r="22" /><text x="398" y="126">L</text>
        <rect x="368" y="34" width="60" height="26" rx="13" /><text x="398" y="52">y = 1</text>
        <text class="operation" x="250" y="111">Sigmoid</text>
        <text class="operation" x="348" y="111">BCE</text>
      </g>

    </g>

    <g v-else-if="section === 'relu'">
      <g class="forward-edge"><path d="M86 66H174 M86 151H174" /></g>
      <g class="parameter-edge"><path d="M218 66L352 101 M218 151L352 117" /></g>
      <g class="parameter">
        <text x="284" y="76">w₂[1] = 1</text>
        <text x="284" y="145">w₂[2] = −1.5</text>
        <text x="374" y="77">b₂ = 0.5</text>
      </g>
      <g class="forward">
        <circle cx="64" cy="66" r="22" /><text x="64" y="72">z₁,₁</text>
        <circle cx="64" cy="151" r="22" /><text x="64" y="157">z₁,₂</text>
        <circle cx="196" cy="66" r="22" /><text x="196" y="72">h₁</text>
        <circle cx="196" cy="151" r="22" /><text x="196" y="157">h₂</text>
        <circle cx="374" cy="109" r="22" /><text x="374" y="115">z₂</text>
        <text class="operation" x="130" y="57">ReLU</text>
        <text class="operation" x="130" y="142">ReLU</text>
      </g>
      <g class="gradient"><text x="374" y="150">∂L/∂z₂</text></g>
    </g>

    <g v-else>
      <g class="parameter-edge">
        <path d="M84 62H329 M81 72L332 150 M81 150L332 72 M84 160H329" />
      </g>
      <g class="parameter">
        <text x="207" y="53">W₁[1,1] = 0.5</text>
        <text x="159" y="91">W₁[2,1] = 1</text>
        <text x="159" y="134">W₁[1,2] = −0.5</text>
        <text x="207" y="179">W₁[2,2] = 0.5</text>
        <text x="351" y="28">b₁[1] = 0</text>
        <text x="351" y="126">b₁[2] = −1</text>
      </g>
      <g class="forward">
        <rect x="12" y="40" width="72" height="44" rx="22" /><text x="48" y="68">x₁ = 1</text>
        <rect x="12" y="138" width="72" height="44" rx="22" /><text x="48" y="166">x₂ = 2</text>
        <circle cx="351" cy="62" r="22" /><text x="351" y="68">z₁,₁</text>
        <circle cx="351" cy="160" r="22" /><text x="351" y="166">z₁,₂</text>
      </g>
      <g class="gradient">
        <text x="351" y="103">∂L/∂z₁,₁</text>
        <text x="402" y="193">∂L/∂z₁,₂</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.gradient-section {
  display: block;
  width: 100%;
}
.gradient-section text {
  font-size: 15px;
  text-anchor: middle;
}
.forward {
  fill: #b42318;
}
.forward circle, .forward rect {
  fill: #fff0ee;
  stroke: #b42318;
  stroke-width: 2;
}
.forward text {
  font: italic 18px serif;
}
.forward .operation {
  font: 13px system-ui, sans-serif;
}
.forward-edge, .parameter-edge {
  fill: none;
  stroke-width: 2;
}
.forward-edge { stroke: #b42318; }
.parameter-edge { stroke: #6e2692; }
.parameter {
  fill: #6e2692;
  paint-order: stroke;
  stroke: white;
  stroke-width: 5;
  stroke-linejoin: round;
}
.gradient { fill: #0059b3; }
</style>
