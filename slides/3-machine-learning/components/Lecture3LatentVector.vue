<script setup>
const props = defineProps({
  label: { type: String, default: 'Embedding' },
  length: { type: Number, default: 8 },
  caption: { type: String, default: '' },
  variant: { type: String, default: 'default' },
})
</script>

<template>
  <div class="latent-vector" :class="`variant-${props.variant}`">
    <div class="label">{{ props.label }}</div>
    <div class="cells">
      <span
        v-for="index in Math.max(1, props.length)"
        :key="index"
        class="cell"
        :style="{ opacity: 0.42 + ((index % 5) * 0.11) }"
      />
    </div>
    <div v-if="props.caption" class="caption">{{ props.caption }}</div>
  </div>
</template>

<style scoped>
.latent-vector {
  display: inline-flex;
  flex-direction: column;
  gap: .34rem;
  min-width: 7.8rem;
  max-width: 18rem;
  padding: .62rem .72rem;
  border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
  border-radius: .55rem;
  background: color-mix(in srgb, currentColor 4%, transparent);
  box-shadow: 0 8px 18px color-mix(in srgb, currentColor 8%, transparent);
  color: inherit;
}

.label {
  font-size: .72rem;
  font-weight: 800;
  line-height: 1.1;
}

.cells {
  display: flex;
  align-items: center;
  gap: .18rem;
}

.cell {
  width: .52rem;
  height: 1.35rem;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  border-radius: .18rem;
  background: currentColor;
}

.caption {
  color: color-mix(in srgb, currentColor 66%, transparent);
  font-size: .56rem;
  line-height: 1.2;
}

.variant-latent .cell,
.variant-accent .cell {
  color: #8b5cf6;
}
</style>

