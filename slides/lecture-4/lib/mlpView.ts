// Shared state between the editable PyTorch code (MlpCodeEditor) and the graph (StackedLogisticGraph).
import { computed, ref } from 'vue'

export const DEFAULT_MLP_CODE = `model = nn.Sequential(
    nn.Linear(2, 3),
    nn.Sigmoid(),
    nn.Linear(3, 1),
    nn.Sigmoid(),
)`

export const mlpCode = ref(DEFAULT_MLP_CODE)

export type Act = 'sigmoid' | 'relu' | 'tanh' | 'gelu' | 'leakyrelu' | 'sine' | null
export interface MlpLayer { size: number, act: Act }

// Parse nn.Linear(in, out) and activation modules in order.
// Returns the node layers (input first) and any shape problems.
export const mlp = computed(() => {
  const layers: MlpLayer[] = []
  const errors: string[] = []
  const re = /nn\.(Linear)\s*\(\s*(\d+)\s*,\s*(\d+)[^)]*\)|(?:nn\.)?(Sigmoid|ReLU|Tanh|GELU|LeakyReLU|Sine)\s*\([^)]*\)/g
  for (const m of mlpCode.value.matchAll(re)) {
    if (m[1]) {
      const fin = Number(m[2])
      const fout = Number(m[3])
      if (!layers.length)
        layers.push({ size: fin, act: null })
      else if (layers[layers.length - 1].size !== fin)
        errors.push(`nn.Linear(${fin}, ${fout}) expects ${fin} inputs, but the previous layer has ${layers[layers.length - 1].size}`)
      layers.push({ size: fout, act: null })
    }
    else if (m[4]) {
      if (layers.length < 2)
        errors.push(`nn.${m[4]}() needs a nn.Linear before it`)
      else
        layers[layers.length - 1].act = m[4].toLowerCase() as Act
    }
  }
  if (!layers.length)
    errors.push('no nn.Linear layer found')
  return { layers, errors }
})
