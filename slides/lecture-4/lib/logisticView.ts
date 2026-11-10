import { ref } from 'vue'

// Shared between LogisticGraph (clickable nodes) and LogisticPlanesDemo (3D view):
// 'z' = show the linear part z = wᵀx + b, 'p' = show p(vegetation) = σ(z)
export const logiNode = ref<'z' | 'p'>('z')
