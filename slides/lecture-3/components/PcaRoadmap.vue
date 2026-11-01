<script setup lang="ts">
// "Rabbit hole" roadmap of the PCA block: four nested levels from the
// application view (remote sensing) down to the linear algebra.
// `level` highlights one level (1-4); 0 shows all levels equally.
// `showPath` draws the "in" and "back out" arrows.
const props = withDefaults(defineProps<{
  level?: number
  showPath?: boolean
}>(), {
  level: 0,
  showPath: true,
})

const levels = [
  { x: 110, y: 46, fill: '#d9efd9', stroke: '#2e8b3a', kicker: 'Remote Sensing', title: 'Multi-spectral image visualization' },
  { x: 230, y: 112, fill: '#dbe9f6', stroke: '#00457c', kicker: 'Data Science / Machine Learning', title: 'Dimensionality reduction (curse of dimensionality)' },
  { x: 350, y: 178, fill: '#ececec', stroke: '#5f625f', kicker: '(Image) Statistics', title: 'Covariances & correlations' },
  { x: 470, y: 244, fill: '#fbd9c8', stroke: '#c4581c', kicker: 'Linear Algebra', title: 'Eigenvalue decomposition (EVD)' },
]

function opacity(i: number) {
  if (!props.level)
    return 1
  return i + 1 === props.level ? 1 : 0.35
}
</script>

<template>
  <div class="svg-fit" style="position: relative; width: 100%; height: 0; padding-top: 38.8889%"><svg viewBox="0 0 900 350" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" aria-label="Nested roadmap of the PCA block: remote sensing, machine learning, statistics, linear algebra">
    <defs>
      <marker id="pca-roadmap-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#00457c" />
      </marker>
    </defs>
    <rect x="10" y="8" width="880" height="334" rx="22" fill="#f5f6f7" stroke="#00457c" stroke-width="1.5" />
    <text x="450" y="32" text-anchor="middle" style="font-size: 16px" font-weight="700" fill="#00457c">PCA &#8212; the universal data analysis tool</text>

    <g v-for="(l, i) in levels" :key="l.kicker" style="transition: opacity .4s" :style="{ opacity: opacity(i) }">
      <rect :x="l.x" :y="l.y" :width="880 - l.x" :height="298 - l.y" rx="20" :fill="l.fill" :stroke="l.stroke" :stroke-width="props.level === i + 1 ? 3 : 1.5" />
      <text :x="l.x + (890 - l.x) / 2" :y="l.y + 24" text-anchor="middle" style="font-size: 14px" fill="#333">{{ l.kicker }}</text>
      <text :x="l.x + (890 - l.x) / 2" :y="l.y + 44" text-anchor="middle" style="font-size: 15px" font-weight="700" fill="#222">{{ l.title }}</text>
    </g>

    <g v-if="props.showPath">
      <path d="M 135 150 L 452 282" stroke="#00457c" stroke-width="3" fill="none" stroke-dasharray="7 5" marker-end="url(#pca-roadmap-arrow)" />
      <text x="190" y="158" style="font-size: 14px" font-style="italic" font-weight="700" fill="#00457c" transform="rotate(22.6 190 158)">we jump into the rabbit hole &#8230;</text>
      <path d="M 470 320 L 45 320" stroke="#00457c" stroke-width="3" fill="none" marker-end="url(#pca-roadmap-arrow)" />
      <text x="258" y="336" style="font-size: 14px" font-style="italic" font-weight="700" fill="#00457c" text-anchor="middle">&#8230; and back out again</text>
    </g>
  </svg></div>
</template>
