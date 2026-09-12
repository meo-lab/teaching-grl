<script setup>
const props = defineProps({
  label: { type: String, default: '' },
  direction: { type: String, default: 'right' },
  dashed: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
})
</script>

<template>
  <div class="arrow-label" :class="[`direction-${props.direction}`, `size-${props.size}`]">
    <svg class="arrow-svg" viewBox="0 0 120 32" aria-hidden="true">
      <line
        x1="8"
        y1="16"
        x2="102"
        y2="16"
        :class="{ dashed: props.dashed }"
      />
      <path d="M96 7 L110 16 L96 25" />
    </svg>
    <div v-if="props.label" class="arrow-text">{{ props.label }}</div>
  </div>
</template>

<style scoped>
.arrow-label {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .08rem;
  color: inherit;
}

.arrow-svg {
  display: block;
  overflow: visible;
}

.arrow-svg line,
.arrow-svg path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.arrow-svg line.dashed {
  stroke-dasharray: 7 7;
}

.arrow-text {
  padding: .1rem .32rem;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 6%, transparent);
  color: color-mix(in srgb, currentColor 72%, transparent);
  font-size: .55rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.size-sm .arrow-svg {
  width: 3.8rem;
  height: 1rem;
}

.size-md .arrow-svg {
  width: 5.5rem;
  height: 1.4rem;
}

.size-lg .arrow-svg {
  width: 7.4rem;
  height: 1.8rem;
}

.direction-left .arrow-svg {
  transform: rotate(180deg);
}

.direction-up .arrow-svg {
  transform: rotate(-90deg);
}

.direction-down .arrow-svg {
  transform: rotate(90deg);
}
</style>

