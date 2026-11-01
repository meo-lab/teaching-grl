<script setup lang="ts">
import { computed } from 'vue'

// AdaBoost, step by step. Sample chips grow with their weight; stumps in the ensemble
// are drawn with a size proportional to their say (alpha).
// clicks 0: equal weights · 1..3: after adding stump 1..3
const props = withDefaults(defineProps<{ clicks?: number }>(), { clicks: Infinity })

interface Stage {
  weights: number[]
  stumps: number[]
  correct: number[]
  incorrect: number[]
}

const STAGES: Stage[] = [
  { weights: [1, 1, 1, 1], stumps: [], correct: [], incorrect: [] },
  { weights: [1, 1, 1, 1], stumps: [1.0], correct: [1, 2], incorrect: [3, 4] },
  { weights: [0.75, 0.75, 1.3, 1.3], stumps: [1.0, 0.65], correct: [1, 2, 3], incorrect: [4] },
  { weights: [0.65, 0.6, 0.9, 1.7], stumps: [1.0, 0.65, 1.2], correct: [1, 2, 3, 4], incorrect: [] },
]

const s = computed(() => Math.min(3, props.clicks === Infinity ? 3 : props.clicks))
const st = computed(() => STAGES[s.value])
// the weights shown are the ones the *next* stump is trained on
const shownWeights = computed(() => {
  const next = STAGES[Math.min(3, s.value + 1)]
  return s.value === 0 ? STAGES[0].weights : (s.value < 3 ? next.weights : STAGES[3].weights)
})
</script>

<template>
  <div class="adaboost">
    <div class="row-label">training data — weights for the next stump</div>
    <div class="samples">
      <span
        v-for="(w, i) in shownWeights" :key="i" class="chip chip-blue"
        :style="{ fontSize: `${0.8 * Math.sqrt(w) + 0.15}rem` }"
      >(x<sub>{{ i + 1 }}</sub>, y<sub>{{ i + 1 }}</sub>)</span>
    </div>

    <div class="ensemble">
      <div class="ensemble-title">AdaBoost ensemble<span v-if="s > 0"> after {{ s }} stump{{ s > 1 ? 's' : '' }}</span></div>
      <div class="stumps">
        <svg v-for="(a, i) in st.stumps" :key="i" viewBox="0 0 40 34" :style="{ width: `${46 * a}px` }">
          <line x1="20" y1="9" x2="10" y2="25" stroke="var(--bonn-blue)" stroke-width="2" />
          <line x1="20" y1="9" x2="30" y2="25" stroke="var(--bonn-blue)" stroke-width="2" />
          <circle cx="20" cy="9" r="7" fill="var(--bonn-blue)" />
          <circle cx="10" cy="25" r="7" fill="var(--grl-data-orange)" />
          <circle cx="30" cy="25" r="7" fill="var(--grl-data-orange)" />
        </svg>
        <span v-if="!st.stumps.length" class="empty">empty</span>
      </div>
    </div>

    <div class="outcome">
      <div>
        <div class="row-label">correct</div>
        <span v-for="i in st.correct" :key="`c-${i}`" class="chip chip-green">(x<sub>{{ i }}</sub>, y<sub>{{ i }}</sub>)</span>
      </div>
      <div>
        <div class="row-label">incorrect</div>
        <span v-for="i in st.incorrect" :key="`w-${i}`" class="chip chip-red">(x<sub>{{ i }}</sub>, y<sub>{{ i }}</sub>)</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.adaboost {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .45rem;
  width: 100%;
}

.row-label {
  margin-bottom: .2rem;
  color: var(--bonn-muted);
  font-size: .72rem;
  text-align: center;
}

.samples {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .35rem;
  min-height: 2.6rem;
}

.chip {
  display: inline-block;
  margin: .12rem;
  padding: .12em .45em;
  border-radius: .3rem;
  font-family: 'Times New Roman', Times, serif;
  font-size: .9rem;
  font-style: italic;
  transition: font-size .4s ease;
}

.chip-blue {
  background: var(--bonn-blue);
  color: #ffffff;
}

.chip-green {
  background: var(--grl-data-green);
  color: #ffffff;
}

.chip-red {
  background: var(--grl-link-red);
  color: #ffffff;
}

.ensemble {
  width: 19rem;
  padding: .4rem .6rem .6rem;
  border: 2px solid var(--bonn-blue);
  border-radius: .8rem;
  text-align: center;
}

.ensemble-title {
  color: var(--bonn-blue);
  font-size: .78rem;
  font-weight: 700;
}

.stumps {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: .4rem;
  min-height: 2.6rem;
  margin-top: .3rem;
}

.empty {
  color: var(--bonn-muted);
  font-size: .6rem;
}

.outcome {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 19rem;
  text-align: center;
}
</style>
