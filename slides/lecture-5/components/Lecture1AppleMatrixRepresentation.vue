<script setup>
const props = defineProps({
  clickIndex: {
    type: Number,
    default: 1,
  },
})

const apple = [
  [255, 255, 255, 255, 255, 35, 35, 255, 255, 255, 255, 255],
  [255, 255, 255, 255, 35, 35, 255, 35, 35, 255, 255, 255],
  [255, 255, 255, 70, 170, 170, 70, 170, 170, 70, 255, 255],
  [255, 255, 70, 200, 200, 200, 200, 200, 200, 200, 70, 255],
  [255, 70, 200, 200, 200, 200, 200, 200, 200, 200, 200, 70],
  [255, 70, 200, 200, 200, 200, 200, 200, 200, 200, 200, 70],
  [255, 70, 200, 200, 200, 200, 200, 200, 200, 200, 200, 70],
  [255, 70, 200, 200, 200, 200, 200, 200, 200, 200, 200, 70],
  [255, 255, 70, 200, 200, 200, 200, 200, 200, 200, 70, 255],
  [255, 255, 70, 200, 200, 200, 200, 200, 200, 200, 70, 255],
  [255, 255, 255, 70, 200, 200, 200, 200, 200, 70, 255, 255],
  [255, 255, 255, 255, 70, 70, 70, 70, 70, 255, 255, 255],
]

const cells = apple.flat()
</script>

<template>
  <div class="apple-matrix">
    <div class="apple-matrix-grid apple-matrix-numbers">
      <div
        v-for="(value, index) in cells"
        :key="`number-${index}`"
        class="apple-matrix-cell"
      >
        {{ value }}
      </div>
    </div>

    <div class="apple-matrix-grid apple-matrix-pixels" v-click="props.clickIndex">
      <div
        v-for="(value, index) in cells"
        :key="`pixel-${index}`"
        class="apple-matrix-cell"
        :style="{ backgroundColor: `rgb(${value}, ${value}, ${value})` }"
      >
        <span>{{ value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.apple-matrix {
  position: relative;
  width: min(100%, 220px);
  aspect-ratio: 1;
  margin: .75rem auto 0;
}

.apple-matrix-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-template-rows: repeat(12, minmax(0, 1fr));
  border: 1px solid #d7d9d8;
}

.apple-matrix-numbers {
  z-index: 1;
}

.apple-matrix-pixels {
  z-index: 2;
  animation: apple-pixels-fade-in .7s ease forwards;
}

.apple-matrix-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border: .5px solid #e4e6e5;
  background: #ffffff;
  color: #00457c;
  font-size: .34rem;
  font-weight: 700;
  line-height: 1;
  transition:
    background-color .45s ease,
    color .45s ease,
    opacity .45s ease;
}

.apple-matrix-pixels .apple-matrix-cell {
  border-color: rgba(255, 255, 255, .18);
}

.apple-matrix-pixels .apple-matrix-cell span {
  color: #00457c;
  opacity: .9;
  text-shadow:
    0 1px 1px rgba(255, 255, 255, .75),
    0 -1px 1px rgba(255, 255, 255, .55);
}

@keyframes apple-pixels-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
