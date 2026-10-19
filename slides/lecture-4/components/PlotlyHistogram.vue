<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import greenData from '../figures/green_histogram_data.json'
import ndviData from '../figures/ndvi_histogram_data.json'

const props = withDefaults(defineProps<{
  dataset: 'green' | 'ndvi'
  xLabel?: string
  showLegend?: boolean
}>(), {
  xLabel: '',
  showLegend: true,
})

const container = ref<HTMLDivElement>()
let plotted = false

declare global {
  interface Window {
    Plotly?: any
  }
}

let loadPromise: Promise<void> | null = null

function loadPlotly(): Promise<void> {
  if (window.Plotly)
    return Promise.resolve()
  if (loadPromise)
    return loadPromise
  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.plot.ly/plotly-2.35.2.min.js'
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
  return loadPromise
}

onMounted(async () => {
  await loadPlotly()
  if (!container.value)
    return

  const source = props.dataset === 'ndvi' ? ndviData : greenData

  const traces = [
    {
      histnorm: 'probability density',
      marker: { color: '#2ca02c' },
      name: 'Vegetation',
      opacity: 0.6,
      x: source.vegetation,
      xbins: { size: source.binSize },
      type: 'histogram',
    },
    {
      histnorm: 'probability density',
      marker: { color: '#d62728' },
      name: 'Urban/Built-up',
      opacity: 0.6,
      x: source.urban,
      xbins: { size: source.binSize },
      type: 'histogram',
    },
  ]

  // Use layout box size (offsetWidth/Height), not getBoundingClientRect: Slidev scales
  // the whole slide with a CSS transform, and getBoundingClientRect reports the already-
  // scaled on-screen size, which would then get scaled a second time by that transform.
  const width = container.value.offsetWidth
  const height = container.value.offsetHeight

  const layout = {
    width,
    height,
    autosize: false,
    margin: { l: 44, r: 12, t: props.showLegend ? 30 : 10, b: 38 },
    font: { size: 11, color: '#222222', family: 'Arial, Helvetica, sans-serif' },
    showlegend: props.showLegend,
    legend: { orientation: 'h', yanchor: 'bottom', y: 1.02, xanchor: 'right', x: 1, font: { size: 10 } },
    barmode: 'overlay',
    bargap: 0.05,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { title: { text: props.xLabel, font: { size: 11 } }, gridcolor: '#eee' },
    yaxis: { title: { text: 'Density', font: { size: 11 } }, gridcolor: '#eee' },
  }

  await window.Plotly.newPlot(container.value, traces, layout, { responsive: true, displayModeBar: false })
  plotted = true
})

onUnmounted(() => {
  if (plotted && container.value && window.Plotly)
    window.Plotly.purge(container.value)
})
</script>

<template>
  <div ref="container" style="width: 100%; height: 100%;" />
</template>
