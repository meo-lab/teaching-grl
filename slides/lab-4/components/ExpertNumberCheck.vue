<script setup lang="ts">
import { computed, reactive } from 'vue'

type Role = 'A' | 'B' | 'C' | 'D'
type Field = { label: string, expected: number, parameterLabel?: string }

const props = defineProps<{ role: Role, parameterSummary?: boolean }>()
const answers = reactive<Record<string, string>>({})
const results = reactive<Partial<Record<string, boolean>>>({})

const tolerance = 0.002
const p = 1 / (1 + Math.exp(1))
const outputGradient = p - 1
const hiddenGradient = -1.5 * outputGradient

const fieldsByRole: Record<Role, Field[]> = {
  A: [
    { label: 'Hidden pre-activation 1 · z₁,₁', expected: -0.5 },
    { label: 'Hidden pre-activation 2 · z₁,₂', expected: 1 },
    { label: 'Hidden activation 1 · h₁', expected: 0 },
    { label: 'Hidden activation 2 · h₂', expected: 1 },
    { label: 'Output logit · z₂', expected: -1 },
    { label: 'Prediction · p', expected: p },
    { label: 'Loss · L', expected: -Math.log(p) },
  ],
  B: [
    { label: 'Loss derivative · ∂L/∂p', expected: -1 / p },
    { label: 'Sigmoid derivative · dp/dz₂', expected: p * (1 - p) },
    { label: 'Logit gradient · ∂L/∂z₂', expected: outputGradient },
    { label: 'Output weight 1 gradient · ∂L/∂w₂₁', parameterLabel: '∂L/∂w₂[1]', expected: 0 },
    { label: 'Output weight 2 gradient · ∂L/∂w₂₂', parameterLabel: '∂L/∂w₂[2]', expected: outputGradient },
    { label: 'Output bias gradient · ∂L/∂b₂', parameterLabel: '∂L/∂b₂', expected: outputGradient },
  ],
  C: [
    { label: 'Incoming gradient 1 · ∂L/∂h₁', expected: outputGradient },
    { label: 'Incoming gradient 2 · ∂L/∂h₂', expected: hiddenGradient },
    { label: 'ReLU derivative 1 · ∂h₁/∂z₁,₁', expected: 0 },
    { label: 'ReLU derivative 2 · ∂h₂/∂z₁,₂', expected: 1 },
    { label: 'Pre-activation gradient 1 · ∂L/∂z₁,₁', expected: 0 },
    { label: 'Pre-activation gradient 2 · ∂L/∂z₁,₂', expected: hiddenGradient },
  ],
  D: [
    { label: '∂L/∂W₁ · row 1, column 1', parameterLabel: '∂L/∂W₁[1,1]', expected: 0 },
    { label: '∂L/∂W₁ · row 1, column 2', parameterLabel: '∂L/∂W₁[1,2]', expected: 0 },
    { label: '∂L/∂W₁ · row 2, column 1', parameterLabel: '∂L/∂W₁[2,1]', expected: hiddenGradient },
    { label: '∂L/∂W₁ · row 2, column 2', parameterLabel: '∂L/∂W₁[2,2]', expected: 2 * hiddenGradient },
    { label: '∂L/∂b₁ · entry 1', parameterLabel: '∂L/∂b₁[1]', expected: 0 },
    { label: '∂L/∂b₁ · entry 2', parameterLabel: '∂L/∂b₁[2]', expected: hiddenGradient },
  ],
}

const fields = computed(() => props.parameterSummary
  ? fieldsByRole[props.role].filter(field => field.parameterLabel)
  : fieldsByRole[props.role])
const idPrefix = computed(() => (props.parameterSummary ? 'parameter-' : 'answer-') + props.role + '-')

function check(field: Field) {
  const answer = answers[field.label]?.trim()
  if (answer) results[field.label] = isCorrect(answer, field.expected)
}

function isCorrect(answer: string, expected: number) {
  const value = answer.trim().replace('−', '-').replace(',', '.')
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) return false
  return Math.abs(Number(value) - expected) <= tolerance
}
</script>

<template>
  <div :class="{ 'parameter-summary': parameterSummary }" @click.stop @keydown.stop @keyup.stop>
    <h2 v-if="parameterSummary">{{ role === 'D' ? 'First-layer gradients' : 'Output-layer gradients' }}</h2>
    <div class="check-fields">
      <form
        v-for="(field, index) in fields"
        :key="field.label"
        class="check-field"
        @submit.prevent="check(field)"
      >
        <label :for="idPrefix + index">{{ parameterSummary ? field.parameterLabel : field.label }}</label>
        <div class="check-entry">
          <input
            :id="idPrefix + index"
            v-model="answers[field.label]"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            spellcheck="false"
            :aria-invalid="results[field.label] === false || undefined"
            :class="parameterSummary ? { correct: results[field.label] === true, incorrect: results[field.label] === false } : undefined"
            @input="delete results[field.label]"
          />
          <span v-if="parameterSummary && results[field.label] !== undefined" class="parameter-result" aria-hidden="true">
            {{ results[field.label] ? '✓' : '×' }}
          </span>
          <button
            v-if="!parameterSummary"
            type="submit"
            :aria-label="'Check ' + field.label"
            :disabled="!answers[field.label]?.trim()"
            :class="{ correct: results[field.label] === true, incorrect: results[field.label] === false }"
          >
            {{ results[field.label] === true ? '✓ Correct' : results[field.label] === false ? 'Try again' : 'Check' }}
          </button>
        </div>
        <span class="sr-only" role="status">{{ results[field.label] === true ? 'Correct' : results[field.label] === false ? 'Try again' : '' }}</span>
      </form>
    </div>
  </div>
</template>

<style scoped>
.check-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .55rem 1.5rem;
  margin-top: .75rem;
}
.check-field label {
  display: block;
  margin-bottom: .25rem;
  font-size: .9rem;
}
.check-entry {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 6.5rem;
  gap: .5rem;
}
.check-entry input,
.check-entry button {
  padding: .25rem .55rem;
  border: 1px solid #687b8d;
  border-radius: .25rem;
  background: white;
  color: #1f2937;
  font-size: .85rem;
}
.check-entry input {
  font-variant-numeric: tabular-nums;
}
.check-entry button {
  border-color: #00457c;
  color: #00457c;
  font-weight: 600;
  cursor: pointer;
}
.check-entry button:disabled {
  opacity: .55;
  cursor: default;
}
.check-entry button.correct {
  border-color: #237544;
  background: #237544;
  color: white;
}
.check-entry button.incorrect {
  border-color: #a62b2b;
  background: #a62b2b;
  color: white;
}
.parameter-summary h2 {
  margin: 0 0 .15rem;
  color: #0059b3;
  font-size: .85rem;
}
.parameter-summary .check-fields {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: .25rem .6rem;
  margin-top: 0;
}
.parameter-summary label {
  margin-bottom: .05rem;
  color: #0059b3;
  font-size: .78rem;
}
.parameter-summary .check-entry {
  position: relative;
  display: block;
}
.parameter-summary input {
  width: 100%;
  padding: .12rem 1.25rem .12rem .4rem;
  font-size: .78rem;
}
.parameter-summary input.correct {
  border-color: #237544;
  background: #def5e5;
  color: #176436;
}
.parameter-summary input.incorrect {
  border-color: #a62b2b;
  background: #fde7e7;
  color: #8c2222;
}
.parameter-result {
  position: absolute;
  top: 50%;
  right: .4rem;
  transform: translateY(-50%);
  color: #237544;
  font-size: .85rem;
  pointer-events: none;
}
.incorrect + .parameter-result {
  color: #a62b2b;
}
</style>
