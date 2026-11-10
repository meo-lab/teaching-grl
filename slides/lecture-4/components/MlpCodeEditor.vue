<script setup lang="ts">
// Editable PyTorch nn.Sequential; the graph (StackedLogisticGraph with :from-code) redraws from it.
// Keys are stopped so typing does not navigate the slides.
import { DEFAULT_MLP_CODE, mlp, mlpCode } from '../lib/mlpView'

const lines = () => mlpCode.value.split('\n').length
</script>

<template>
  <div class="mce" @click.stop @dblclick.stop>
    <div class="head">
      <span>PyTorch: add nn.Linear / nn.Sigmoid lines, the graph follows</span>
      <button @click.stop="mlpCode = DEFAULT_MLP_CODE">reset</button>
    </div>
    <textarea
      v-model="mlpCode" spellcheck="false" autocapitalize="off" autocomplete="off"
      :rows="Math.min(9, Math.max(7, lines()))" @keydown.stop @keyup.stop @keypress.stop
    />
    <div v-if="mlp.errors.length" class="err">{{ mlp.errors[0] }}</div>
  </div>
</template>

<style scoped>
.mce { display: flex; flex-direction: column; gap: .2rem; }
.head { display: flex; justify-content: space-between; align-items: center; font: 600 11px "Exo 2", sans-serif; color: #5f6368; }
.head button { font: 600 10px "Exo 2", sans-serif; padding: .05rem .45rem; border-radius: 4px; border: 1px solid #00457c; background: transparent; color: #00457c; }
.mce textarea {
  width: 100%; resize: none; border: 1px solid #d0d4d8 !important; border-radius: 6px; padding: .45rem .6rem !important;
  background: #f6f8fa !important; color: #1f2328; font: 11.5px/1.4 ui-monospace, "Fira Code", Menlo, monospace; outline: none; tab-size: 4;
}
.mce textarea:focus { border-color: #00457c !important; box-shadow: 0 0 0 2px rgba(0, 69, 124, .15); }
.err { font: 11px "Exo 2", sans-serif; color: #d62728; }
</style>
