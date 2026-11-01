<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import greenData from '../figures/green_histogram_data.json'
import ndviData from '../figures/ndvi_histogram_data.json'

const props = withDefaults(defineProps<{
  dataset: 'green' | 'ndvi'
  xLabel?: string
  showLegend?: boolean
  // fixed plot height in px; the plot never takes its height from the
  // (possibly still hidden, 0-height) container
  height?: number
}>(), {
  xLabel: '',
  showLegend: true,
  height: 120,
})

const container = ref<HTMLDivElement>()
let plotted = false
let observer: ResizeObserver | undefined

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

  const layout = {
    width: container.value.clientWidth || 300,
    height: props.height,
    autosize: false,
    margin: { l: 44, r: 12, t: props.showLegend ? 24 : 8, b: 36 },
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

  await window.Plotly.newPlot(container.value, traces, layout, { responsive: false, displayModeBar: false })
  plotted = true

  // Slidev mounts upcoming slides while they are hidden (width 0); re-fit the
  // width once the slide is visible, keeping the fixed height.
  observer = new ResizeObserver(() => {
    const w = container.value?.clientWidth
    if (plotted && w && window.Plotly)
      window.Plotly.relayout(container.value, { width: w, height: props.height })
  })
  observer.observe(container.value)
})

onUnmounted(() => {
  observer?.disconnect()
  if (plotted && container.value && window.Plotly)
    window.Plotly.purge(container.value)
})
</script>

<template>
  <div ref="container" :style="{ width: '100%', height: `${props.height}px`, overflow: 'hidden' }" />
</template>
