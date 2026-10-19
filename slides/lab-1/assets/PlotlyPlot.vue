<script>
import plotlyUrl from './plotly.min.js?url'

// Both plots (including presenter views) share a single runtime load.
let runtime
function loadPlotly() {
  if (!runtime) {
    runtime = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = plotlyUrl
      script.onload = () => resolve(window.Plotly)
      script.onerror = () => {
        script.remove()
        runtime = undefined
        reject(new Error('Could not load Plotly'))
      }
      document.head.appendChild(script)
    })
  }
  return runtime
}
</script>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps({ figure: { type: Object, required: true }, label: String, height: { type: Number, default: 300 } })
const container = ref(null)
const error = ref('')
let observer
let plotly
let disposed = false
let rendering = false

onMounted(() => {
  observer = new ResizeObserver(async ([entry]) => {
    if (!entry.contentRect.width || !entry.contentRect.height || rendering) return
    if (plotly) {
      plotly.Plots.resize(container.value)
      return
    }
    rendering = true
    try {
      const library = await loadPlotly()
      if (disposed) return
      await library.newPlot(container.value, structuredClone(props.figure.data), {
        ...structuredClone(props.figure.layout),
        autosize: true,
        margin: { l: 48, r: 10, t: 10, b: 85 },
        font: { size: 10 },
        legend: { orientation: 'h', y: -0.45, x: 0, title: { text: '' } },
      }, { responsive: false, displaylogo: false, scrollZoom: false })
      if (disposed) library.purge(container.value)
      else plotly = library
    }
    catch (cause) {
      error.value = cause.message
    }
    finally {
      rendering = false
    }
  })
  observer.observe(container.value)
})

onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  if (plotly) plotly.purge(container.value)
})
</script>

<template>
  <div class="relative w-full" :style="{ height: `${height}px` }" role="img" :aria-label="label">
    <div ref="container" class="w-full h-full" />
    <p v-if="error" class="absolute inset-0 p-4 text-red-700">{{ error }}</p>
  </div>
</template>
