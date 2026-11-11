<script setup lang="ts">
import { reactive } from 'vue'
import { checkedParameterGradients, parameters, type ParameterId } from './parameterGradients'

const groups = [
  { label: 'Group 1 · Output layer', ids: ['dw21', 'dw22', 'db2'] },
  { label: 'Group 2 · Hidden unit 1', ids: ['dW11', 'dW12', 'db11'] },
  { label: 'Group 3 · Hidden unit 2', ids: ['dW21', 'dW22', 'db12'] },
] satisfies { label: string, ids: ParameterId[] }[]

const learningRate = 0.5
const tolerance = 0.001
const manualGradients = reactive<Partial<Record<ParameterId, string>>>({})
const newValues = reactive<Partial<Record<ParameterId, string>>>({})
const checks = reactive<Partial<Record<ParameterId, { gradient: string, correct: boolean }>>>({})

function gradientValue(id: ParameterId) {
  return manualGradients[id] ?? checkedParameterGradients[id] ?? ''
}

function editGradient(id: ParameterId, event: Event) {
  manualGradients[id] = (event.target as HTMLInputElement).value
  delete checks[id]
}
function parseDecimal(text: string) {
  const value = text.trim().replace('−', '-').replace(',', '.')
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) ? Number(value) : Number.NaN
}

function checkUpdate(id: ParameterId) {
  const answer = newValues[id]?.trim()
  if (!answer) return

  const gradient = gradientValue(id)
  const expected = parameters[id].initial - learningRate * parseDecimal(gradient)
  checks[id] = { gradient, correct: Math.abs(parseDecimal(answer) - expected) <= tolerance }
}

function checkedResult(id: ParameterId) {
  const check = checks[id]
  return check?.gradient === gradientValue(id) ? check.correct : undefined
}
</script>

<template>
  <div class="update-groups" @click.stop @keydown.stop @keyup.stop>
    <section v-for="group in groups" :key="group.label">
      <h2>{{ group.label }}</h2>
      <table>
        <thead>
          <tr><th scope="col">Original</th><th scope="col">Loss gradient</th><th scope="col">New value</th></tr>
        </thead>
        <tbody>
          <tr v-for="id in group.ids" :key="id">
            <td class="parameter">{{ parameters[id].symbol }} = {{ parameters[id].initial }}</td>
            <td>
              <label class="gradient">
                <span>∂L/∂{{ parameters[id].symbol }}</span>
                <input
                  type="text"
                  inputmode="decimal"
                  autocomplete="off"
                  spellcheck="false"
                  :aria-label="'Gradient for ' + parameters[id].symbol"
                  :value="gradientValue(id)"
                  @input="editGradient(id, $event)"
                />
              </label>
            </td>
            <td>
              <form class="new-value" @submit.prevent="checkUpdate(id)">
                <input
                  v-model="newValues[id]"
                  type="text"
                  inputmode="decimal"
                  autocomplete="off"
                  spellcheck="false"
                  :aria-label="'New value for ' + parameters[id].symbol"
                  :aria-invalid="checkedResult(id) === false || undefined"
                  :class="{ correct: checkedResult(id) === true, incorrect: checkedResult(id) === false }"
                  @input="delete checks[id]"
                />
                <span class="result" aria-hidden="true">{{ checkedResult(id) === true ? '✓' : checkedResult(id) === false ? '×' : '' }}</span>
                <span class="sr-only" role="status">{{ checkedResult(id) === true ? 'Correct' : checkedResult(id) === false ? 'Try again' : '' }}</span>
              </form>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.update-groups {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: .8rem;
  margin: .85rem 0;
}
.update-groups h2 {
  margin-bottom: .25rem;
  color: #00457c;
}
.update-groups th,
.update-groups td {
  padding: .27rem .12rem;
  font-size: .68rem;
  white-space: nowrap;
}
.update-groups td {
  vertical-align: middle;
}
.parameter { color: #6e2692; }
.gradient {
  display: grid;
  grid-template-columns: 1fr 2.55rem;
  align-items: center;
  gap: .16rem;
  color: #0059b3;
}
.update-groups input {
  width: 100%;
  padding: .13rem .16rem;
  border: 1px solid #6b8298;
  border-radius: .2rem;
  background: white;
  color: inherit;
  font: inherit;
  font-variant-numeric: tabular-nums;
}
.new-value {
  position: relative;
  width: 2.95rem;
}
.new-value input.correct {
  border-color: #237544;
  background: #def5e5;
  color: #176436;
}
.new-value input.incorrect {
  border-color: #a62b2b;
  background: #fde7e7;
  color: #8c2222;
}
.result {
  position: absolute;
  top: 0;
  right: .12rem;
  transform: translateY(-55%);
  background: white;
  line-height: 1;
  color: #176436;
  pointer-events: none;
}
.incorrect + .result { color: #8c2222; }
</style>
