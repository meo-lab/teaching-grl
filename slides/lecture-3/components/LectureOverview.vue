<script setup lang="ts">
// Lecture 3 roadmap: four blocks as cards.
// - without `next`: all blocks, revealed one per click (first overview)
// - with `next` = 5: recap at the end, all blocks done (check marks)
// - with `next` (1-4): reprise between blocks; finished blocks get a check mark,
//   the transition "previous -> next" is highlighted, later blocks are faded.
import { computed } from 'vue'
import rgbCube from '../figures/datacube.jpg'
import pcaImg from '../figures/pca/bonn-pca-rgb.jpg'
import ndviImg from '../figures/pca/bonn-ndvi.jpg'
import forestImg from '../figures/dt_ai_forest.jpg'

const props = withDefaults(defineProps<{ next?: number, clicks?: number }>(), { next: 0, clicks: Infinity })

const blocks = [
  { title: 'More Data', caption: 'Curse of Dimensionality', color: '#00457c', bg: '#e8eff6', img: rgbCube, alt: 'Geospatial data cube of stacked layers' },
  { title: 'Less Redundant Data', caption: 'Decorrelation through PCA', color: '#00457c', bg: '#e8eff6', img: pcaImg, alt: 'First three principal components of Bonn as RGB' },
  { title: 'More Descriptive Data', caption: 'Domain Knowledge', color: '#00457c', bg: '#e8eff6', img: ndviImg, alt: 'NDVI of Bonn' },
  { title: 'Better (Non-linear) Models', caption: 'Random Forests', color: '#ff7900', bg: '#fff1e6', img: forestImg, alt: 'Illustration of a forest of decision trees' },
]

const reprise = computed(() => props.next > 0)

function cardStyle(i: number) {
  const b = blocks[i]
  if (!reprise.value) {
    return { borderColor: b.color, background: b.bg, opacity: props.clicks >= i ? 1 : 0, transition: 'opacity .4s' }
  }
  if (props.next > blocks.length) // recap: all blocks done
    return { borderColor: b.color, background: b.bg }
  const n = props.next - 1
  const isNext = i === n
  return {
    borderColor: b.color,
    background: b.bg,
    opacity: i < n ? 0.55 : isNext ? 1 : 0.3,
    boxShadow: isNext ? `0 0 0 4px ${b.color}33` : 'none',
    transform: isNext ? 'scale(1.04)' : 'none',
  }
}

function arrowStyle(i: number) {
  // arrow between card i-1 and card i
  if (!reprise.value)
    return { opacity: props.clicks >= i ? 1 : 0, transition: 'opacity .4s', color: '#00457c' }
  if (props.next > blocks.length)
    return { color: blocks[i].color }
  const isActive = i === props.next - 1
  return { opacity: isActive ? 1 : 0.35, color: isActive ? blocks[i].color : '#00457c', transform: isActive ? 'scale(1.6)' : 'none' }
}
</script>

<template>
  <div class="grid gap-2" style="grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr">
    <template v-for="(b, i) in blocks" :key="b.title">
      <div v-if="i > 0" class="self-center text-xl font-bold" :style="arrowStyle(i)">&rarr;</div>
      <div class="flex flex-col rounded-xl border-2 overflow-hidden" :style="cardStyle(i)">
        <div class="px-2.5 py-1.5 text-white text-[.68rem] font-bold flex justify-between items-center gap-1 leading-tight" :style="{ background: b.color, height: '2.9em' }">
          <span>{{ i + 1 }} &middot; {{ b.title }}</span>
          <span v-if="reprise && i < next - 1" aria-label="done">&check;</span>
        </div>
        <img :src="b.img" class="w-full h-[165px] object-cover" :alt="b.alt">
        <div class="px-2 text-[.74rem] font-semibold text-center leading-tight flex items-center justify-center" :style="{ color: b.color, height: '3.2em' }">
          {{ b.caption }}
        </div>
      </div>
    </template>
  </div>
</template>
