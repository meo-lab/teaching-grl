<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const mapElement = ref(null)
const bounds = L.latLngBounds(
  [50.657954797311504, 7.010648159485404],
  [50.77143017888567, 7.222134975891654],
)

let map = null
let resizeObserver = null

onMounted(() => {
  if (!mapElement.value)
    return

  map = L.map(mapElement.value, {
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map)

  L.rectangle(bounds, {
    color: '#005171',
    weight: 3,
    fillColor: '#00a1c9',
    fillOpacity: 0.15,
  }).addTo(map)

  map.fitBounds(bounds, { padding: [20, 20] })
  resizeObserver = new ResizeObserver(() => map?.invalidateSize())
  resizeObserver.observe(mapElement.value)
  requestAnimationFrame(() => map?.invalidateSize())
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  map?.remove()
  map = null
})
</script>

<template>
  <div
    ref="mapElement"
    class="study-area-map"
    aria-label="OpenStreetMap map with the study area bounding box"
  />
</template>

<style scoped>
.study-area-map {
  width: 100%;
  height: 100%;
  border-radius: 0.75rem;
  overflow: hidden;
}

.study-area-map :deep(.leaflet-control-attribution) {
  font-size: 0.55rem;
}
</style>
