import { reactive } from 'vue'

const outputGradient = 1 / (1 + Math.exp(1)) - 1
const hiddenGradient = -1.5 * outputGradient

export const parameters = {
  dW11: { symbol: 'W₁[1,1]', initial: 0.5, gradient: 0 },
  dW12: { symbol: 'W₁[1,2]', initial: -0.5, gradient: 0 },
  dW21: { symbol: 'W₁[2,1]', initial: 1, gradient: hiddenGradient },
  dW22: { symbol: 'W₁[2,2]', initial: 0.5, gradient: 2 * hiddenGradient },
  db11: { symbol: 'b₁[1]', initial: 0, gradient: 0 },
  db12: { symbol: 'b₁[2]', initial: -1, gradient: hiddenGradient },
  dw21: { symbol: 'w₂[1]', initial: 1, gradient: 0 },
  dw22: { symbol: 'w₂[2]', initial: -1.5, gradient: outputGradient },
  db2: { symbol: 'b₂', initial: 0.5, gradient: outputGradient },
} as const

export type ParameterId = keyof typeof parameters

export const checkedParameterGradients = reactive<Partial<Record<ParameterId, string>>>({})
