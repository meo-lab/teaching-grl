<script setup lang="ts">
import GradientSection from './GradientSection.vue'
import { computed, nextTick, reactive, ref, useId } from 'vue'
import { checkedParameterGradients, parameters, type ParameterId } from './parameterGradients'

type Item = {
  id: string
  symbol: string
  expected: number
  parameter?: ParameterId
  x: number
  y: number
  r?: number // node radius; chips have no radius
  w?: number // chip width
}

type Section = 'output' | 'relu' | 'first'

const props = withDefaults(defineProps<{ mode?: 'forward' | 'backward', section?: Section }>(), { mode: 'forward' })
const backward = computed(() => props.mode === 'backward')
const uid = useId()
const marker = (name: string) => uid + '-' + name

const tolerance = 0.002
const p = 1 / (1 + Math.exp(1))
const dz2 = p - 1
const dh2 = -1.5 * dz2

const nodes = [
  { id: 'z11', symbol: 'z₁,₁', x: 305, y: 104, r: 28, expected: -0.5 },
  { id: 'z12', symbol: 'z₁,₂', x: 305, y: 224, r: 28, expected: 1 },
  { id: 'h1', symbol: 'h₁', x: 465, y: 104, r: 27, expected: 0 },
  { id: 'h2', symbol: 'h₂', x: 465, y: 224, r: 27, expected: 1 },
  { id: 'z2', symbol: 'z₂', x: 665, y: 164, r: 26, expected: -1 },
  { id: 'p', symbol: 'p', x: 789, y: 164, r: 26, expected: p },
  { id: 'L', symbol: 'L', x: 893, y: 164, r: 25, expected: -Math.log(p) },
] satisfies Item[]

const chipWidth = (symbol: string) => Math.round(symbol.length * 8.2 + 18)
const chip = (id: string, symbol: string, x: number, y: number, expected: number): Item =>
  ({ id, symbol, x, y, expected, w: chipWidth(symbol) })

const localGradients: Item[] = [
  chip('dz11', '∂L/∂z₁,₁', 305, 146, 0),
  chip('dz12', '∂L/∂z₁,₂', 305, 266, dh2),
  chip('relu1', '∂h₁/∂z₁,₁', 386, 121, 0),
  chip('relu2', '∂h₂/∂z₁,₂', 386, 241, 1),
  chip('dh1', '∂L/∂h₁', 465, 146, dz2),
  chip('dh2', '∂L/∂h₂', 465, 266, dh2),
  chip('dz2', '∂L/∂z₂', 665, 204, dz2),
  chip('sig', 'dp/dz₂', 727, 180, p * (1 - p)),
  chip('dp', '∂L/∂p', 789, 204, -1 / p),
]

function parameterChip(id: ParameterId, x: number, y: number): Item {
  const { symbol, gradient } = parameters[id]
  return { ...chip(id, '∂L/∂' + symbol, x, y, gradient), parameter: id }
}

const parameterGradients = [
  parameterChip('dW11', 151, 334),
  parameterChip('dW12', 271, 334),
  parameterChip('dW21', 151, 364),
  parameterChip('dW22', 271, 364),
  parameterChip('db11', 406, 334),
  parameterChip('db12', 406, 364),
  parameterChip('dw21', 609, 334),
  parameterChip('dw22', 609, 364),
  parameterChip('db2', 744, 334),
]

const sectionItems: Record<Section, Item[]> = {
  output: [
    chip('dz2', '∂L/∂z₂', 203, 177, dz2),
    chip('sig', 'dp/dz₂', 251, 149, p * (1 - p)),
    chip('dp', '∂L/∂p', 298, 177, -1 / p),
    parameterChip('dw21', 172, 220),
    parameterChip('dw22', 172, 249),
    parameterChip('db2', 299, 220),
  ],
  relu: [
    chip('dz11', '∂L/∂z₁,₁', 64, 111, 0),
    chip('dz12', '∂L/∂z₁,₂', 64, 197, dh2),
    chip('relu1', '∂h₁/∂z₁,₁', 130, 83, 0),
    chip('relu2', '∂h₂/∂z₁,₂', 130, 169, 1),
    chip('dh1', '∂L/∂h₁', 196, 111, dz2),
    chip('dh2', '∂L/∂h₂', 196, 197, dh2),
  ],
  first: [
    parameterChip('dW11', 78, 222),
    parameterChip('dW12', 196, 222),
    parameterChip('dW21', 78, 251),
    parameterChip('dW22', 196, 251),
    parameterChip('db11', 324, 222),
    parameterChip('db12', 324, 251),
  ],
}

const items = computed<Item[]>(() => {
  if (props.section) return sectionItems[props.section]
  return backward.value ? [...localGradients, ...parameterGradients] : nodes
})
const viewBox = computed(() => {
  if (props.section) return props.section === 'relu' ? '0 16 440 200' : '0 18 440 250'
  return backward.value ? '0 0 940 383' : '0 0 940 262'
})

const answers = reactive<Record<string, string>>({})
const results = reactive<Partial<Record<string, boolean>>>({})
const showNumber = reactive<Record<string, boolean>>({})
const editing = ref<string | null>(null)
const inputs: Record<string, HTMLInputElement | null> = {}
const previous = ref('')

function parse(answer: string) {
  const value = answer.trim().replace('−', '-').replace(',', '.')
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) ? Number(value) : Number.NaN
}

function display(answer: string) {
  return answer.trim().replace(/^-/, '−').replace(',', '.')
}

async function edit(item: Item) {
  previous.value = answers[item.id] ?? ''
  editing.value = item.id
  await nextTick()
  inputs[item.id]?.focus()
  inputs[item.id]?.select()
}

function onClick(item: Item) {
  if (editing.value === item.id) return
  if (results[item.id] === undefined) edit(item)
  else showNumber[item.id] = !showNumber[item.id]
}

function commit(item: Item) {
  if (editing.value !== item.id) return
  editing.value = null
  const answer = answers[item.id]?.trim()
  if (!props.section && item.parameter) delete checkedParameterGradients[item.parameter]
  if (!answer) {
    delete results[item.id]
    showNumber[item.id] = false
    return
  }
  const value = parse(answer)
  results[item.id] = Math.abs(value - item.expected) <= tolerance
  if (!props.section && item.parameter && results[item.id]) checkedParameterGradients[item.parameter] = value.toFixed(3)
  showNumber[item.id] = true
}

function cancel(item: Item) {
  answers[item.id] = previous.value
  editing.value = null
}

const allNumbers = ref(false)
function toggleAll() {
  allNumbers.value = !allNumbers.value
  for (const item of items.value) if (results[item.id] !== undefined) showNumber[item.id] = allNumbers.value
}

function reset() {
  for (const item of items.value) {
    if (!props.section && item.parameter) delete checkedParameterGradients[item.parameter]
    delete answers[item.id]
    delete results[item.id]
    showNumber[item.id] = false
  }
  editing.value = null
  allNumbers.value = false
}

function stateClass(id: string) {
  return { correct: results[id] === true, incorrect: results[id] === false }
}

function ariaLabel(item: Item) {
  if (results[item.id] === undefined) return item.symbol + ': enter a value'
  return item.symbol + ': ' + display(answers[item.id] ?? '') + (results[item.id] ? ', correct' : ', incorrect')
}

const inputWidth = (item: Item) => Math.max(item.w ?? 0, 80)
</script>

<template>
  <div class="interactive-network" :class="[mode, { focused: section }]" @click.stop @keydown.stop @keyup.stop>
    <svg :viewBox="viewBox" role="group" :aria-label="section ? 'Group calculation. Click a blue label or matrix entry to check it.' : 'Fully connected 2–2–1 network. Click a ' + (backward ? 'blue gradient label' : 'red node') + ' to enter its value.'">
      <GradientSection v-if="section" :section="section" width="440" height="235" />
      <template v-else>
        <defs>
          <marker :id="marker('parameter')" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0 0L8 4L0 8Z" fill="#6e2692" />
          </marker>
          <marker :id="marker('forward')" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0 0L8 4L0 8Z" fill="#b42318" />
          </marker>
          <marker :id="marker('gradient')" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0 0L8 4L0 8Z" fill="#0059b3" />
          </marker>
        </defs>

        <g class="legend" :transform="backward ? undefined : 'translate(112 0)'">
          <g class="forward"><circle cx="188" cy="13" r="5" /><text x="201" y="18">Features &amp; forward values</text></g>
          <g class="parameter"><circle cx="447" cy="13" r="5" /><text x="460" y="18">Weights &amp; biases</text></g>
          <g v-if="backward" class="gradient"><circle cx="644" cy="13" r="5" /><text x="657" y="18">Gradients &amp; derivatives</text></g>
        </g>

        <g class="heading">
          <text x="54" y="56">Input features</text>
          <text x="305" y="56">Hidden pre-activations</text>
          <text x="465" y="56">Hidden activations</text>
          <text x="665" y="56">Output logit</text>
          <text x="789" y="56">Prediction</text>
          <text x="893" y="56">Target</text>
        </g>

        <g class="edge" stroke="#6e2692" :marker-end="'url(#' + marker('parameter') + ')'">
          <path d="M94 104H276" />
          <path d="M89 117L280 211" />
          <path d="M89 211L280 117" />
          <path d="M94 224H276" />
          <path d="M492 104L638 155" />
          <path d="M492 224L638 173" />
        </g>
        <g class="edge" stroke="#b42318" :marker-end="'url(#' + marker('forward') + ')'">
          <path d="M334 104H437" />
          <path d="M334 224H437" />
          <path d="M692 164H762" />
          <path d="M815 164H867" />
          <path d="M893 109V138" />
        </g>

        <g class="parameter edge-label">
          <text x="180" y="96">W₁[1,1] = 0.5</text>
          <text x="156" y="136">W₁[2,1] = 1</text>
          <text x="156" y="194">W₁[1,2] = −0.5</text>
          <text x="180" y="242">W₁[2,2] = 0.5</text>
          <text x="305" y="75">b₁[1] = 0</text>
          <text x="305" y="195">b₁[2] = −1</text>
          <text x="567" y="119">w₂[1] = 1</text>
          <text x="567" y="221">w₂[2] = −1.5</text>
          <text x="665" y="130">b₂ = 0.5</text>
        </g>

        <g class="forward">
          <g class="node">
            <rect x="15" y="82" width="79" height="44" rx="22" />
            <rect x="15" y="202" width="79" height="44" rx="22" />
            <rect x="860" y="68" width="66" height="41" rx="20" />
            <template v-if="backward">
              <circle v-for="node in nodes" :key="node.id" :cx="node.x" :cy="node.y" :r="node.r" />
            </template>
          </g>
          <g class="value">
            <text x="54" y="111">x₁ = 1</text>
            <text x="54" y="231">x₂ = 2</text>
            <text x="893" y="95">y = 1</text>
            <template v-if="backward">
              <text v-for="node in nodes" :key="node.id" :x="node.x" :y="node.y + 7">{{ node.symbol }}</text>
            </template>
          </g>
          <text x="386" y="96" class="edge-label">ReLU</text>
          <text x="386" y="216" class="edge-label">ReLU</text>
          <text x="727" y="154" class="edge-label">Sigmoid</text>
          <text x="842" y="154" class="edge-label">BCE</text>
        </g>

        <g v-if="backward" class="gradient">
          <path d="M893 288H15" fill="none" stroke="#0059b3" stroke-width="1.8" :marker-end="'url(#' + marker('gradient') + ')'" />
          <rect x="322" y="278" width="260" height="20" fill="white" />
          <text x="452" y="293" class="edge-label">Backpropagation from the loss</text>
          <g class="parameter-gradient-heading">
            <text x="211" y="313">∂L/∂𝐖₁</text>
            <text x="406" y="313">∂L/∂𝐛₁</text>
            <text x="609" y="313">∂L/∂𝐰₂</text>
            <text x="744" y="313">∂L/∂b₂</text>
          </g>
          <path class="gradient-brackets" d="M97 321H89V377H97 M325 321H333V377H325 M355 321H347V377H355 M457 321H465V377H457 M558 321H550V377H558 M660 321H668V377H660" />
        </g>

      </template>

      <g v-if="section === 'output'" class="gradient parameter-gradient-heading">
        <text x="172" y="201">∂L/∂𝐰₂</text>
        <text x="299" y="201">∂L/∂b₂</text>
        <path class="gradient-brackets" d="M123 207H115V262H123 M221 207H229V262H221" />
      </g>
      <g v-else-if="section === 'first'" class="gradient parameter-gradient-heading">
        <text x="137" y="202">∂L/∂𝐖₁</text>
        <text x="324" y="202">∂L/∂𝐛₁</text>
        <path class="gradient-brackets" d="M23 209H15V264H23 M251 209H259V264H251 M275 209H267V264H275 M373 209H381V264H373" />
      </g>

      <g
        v-for="item in items"
        :key="item.id"
        class="interactive"
        :class="[stateClass(item.id), item.r ? 'is-node' : 'is-chip']"
        tabindex="0"
        role="button"
        :aria-label="ariaLabel(item)"
        @click="onClick(item)"
        @dblclick="edit(item)"
        @keydown.enter.prevent="editing === item.id || onClick(item)"
      >
        <circle v-if="item.r" class="shape" :cx="item.x" :cy="item.y" :r="item.r" />
        <rect v-else class="shape" :x="item.x - item.w! / 2" :y="item.y - 12" :width="item.w" height="24" rx="12" />
        <foreignObject v-if="editing === item.id" :x="item.x - inputWidth(item) / 2" :y="item.y - 16" :width="inputWidth(item)" height="32">
          <input
            :ref="el => (inputs[item.id] = el as HTMLInputElement | null)"
            v-model="answers[item.id]"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            spellcheck="false"
            :aria-label="'Value of ' + item.symbol"
            @keydown.enter.prevent.stop="commit(item)"
            @keydown.esc.prevent.stop="cancel(item)"
            @blur="commit(item)"
          />
        </foreignObject>
        <text v-else-if="showNumber[item.id]" class="number" :x="item.x" :y="item.y + 5">{{ display(answers[item.id] ?? '') }}</text>
        <text v-else class="symbol" :x="item.x" :y="item.y + (item.r ? 7 : 5)">{{ item.symbol }}</text>
      </g>
    </svg>

    <div v-if="!section" class="controls">
      <span>Click a {{ backward ? 'blue gradient' : 'node' }} to enter a value · click again to toggle symbol / number · double-click to edit</span>
      <button type="button" @click="toggleAll">{{ allNumbers ? 'Show symbols' : 'Show numbers' }}</button>
      <button type="button" @click="reset">Reset</button>
    </div>
  </div>
</template>

<style scoped>
.interactive-network svg {
  display: block;
  width: 100%;
}
text {
  font-family: system-ui, sans-serif;
  text-anchor: middle;
}
.forward { fill: #b42318; }
.parameter { fill: #6e2692; }
.gradient { fill: #0059b3; }
.heading { fill: #334155; font-size: 14px; font-weight: 600; }
.legend text { font-size: 15px; font-weight: 600; text-anchor: start; }
.node, .is-node .shape { fill: #fff0ee; stroke: #b42318; stroke-width: 2; }
.value, .is-node .symbol { font: italic 21px serif; fill: #b42318; }
.edge-label { font-size: 16px; paint-order: stroke; stroke: white; stroke-width: 6px; stroke-linejoin: round; }
.edge { fill: none; stroke-width: 2.1; }
.parameter-gradient-heading { font-size: 15px; }
.gradient-brackets { fill: none; stroke: #0059b3; stroke-width: 1.6; }

.is-chip .shape { fill: #eef5fc; stroke: #0059b3; stroke-width: 1.4; }
.is-chip text { font-size: 15px; fill: #0059b3; }
.number { font-weight: 700; font-variant-numeric: tabular-nums; }
.is-node .number { font-size: 15px; fill: #b42318; }

.interactive { cursor: pointer; outline: none; }
.interactive text { pointer-events: none; }
.interactive:hover .shape,
.interactive:focus-visible .shape { stroke-width: 3; }
.interactive.correct .shape { fill: #def5e5; stroke: #237544; }
.interactive.correct text { fill: #176436; }
.interactive.incorrect .shape { fill: #fde7e7; stroke: #a62b2b; }
.interactive.incorrect text { fill: #8c2222; }

foreignObject input {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0 .3rem;
  border: 2px solid #b42318;
  border-radius: 6px;
  background: white;
  color: #1f2937;
  font: 600 16px system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
  text-align: center;
}
.backward foreignObject input, .focused foreignObject input { border-color: #0059b3; }

.controls {
  display: flex;
  align-items: center;
  gap: .6rem;
  margin-top: .5rem;
  color: #64748b;
  font-size: .75rem;
}
.controls span { flex: 1; }
.controls button {
  padding: .15rem .6rem;
  border: 1px solid #00457c;
  border-radius: .25rem;
  background: white;
  color: #00457c;
  font-size: .75rem;
  font-weight: 600;
  cursor: pointer;
}
</style>
