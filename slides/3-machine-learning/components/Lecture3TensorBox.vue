<script setup>
const props = defineProps({
  label: { type: String, default: 'Tensor' },
  shape: { type: String, default: '[H × W × C]' },
  icon: { type: String, default: '▦' },
  caption: { type: String, default: '' },
  variant: { type: String, default: 'default' },
})
</script>

<template>
  <div class="tensor-box" :class="`variant-${props.variant}`">
    <div class="tensor-head">
      <span class="tensor-icon">{{ props.icon }}</span>
      <span class="tensor-label">{{ props.label }}</span>
    </div>
    <div class="tensor-shape">{{ props.shape }}</div>
    <div v-if="props.caption" class="tensor-caption">{{ props.caption }}</div>
  </div>
</template>

<style scoped>
.tensor-box {
  display: inline-flex;
  flex-direction: column;
  gap: .34rem;
  min-width: 8.4rem;
  max-width: 14rem;
  padding: .68rem .78rem;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  border-left: 4px solid color-mix(in srgb, currentColor 34%, transparent);
  border-radius: .55rem;
  background: color-mix(in srgb, currentColor 4%, transparent);
  box-shadow: 0 8px 20px color-mix(in srgb, currentColor 8%, transparent);
  color: inherit;
}

.tensor-head {
  display: flex;
  align-items: center;
  gap: .42rem;
}

.tensor-icon {
  font-size: 1.15rem;
  line-height: 1;
}

.tensor-label {
  font-size: .82rem;
  font-weight: 700;
  line-height: 1.15;
}

.tensor-shape {
  padding: .24rem .38rem;
  border-radius: .34rem;
  background: color-mix(in srgb, currentColor 7%, transparent);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: .72rem;
  line-height: 1.1;
  white-space: nowrap;
}

.tensor-caption {
  color: color-mix(in srgb, currentColor 68%, transparent);
  font-size: .62rem;
  line-height: 1.25;
}

.variant-input {
  border-left-color: #3b82f6;
}

.variant-output {
  border-left-color: #10b981;
}

.variant-latent {
  border-left-color: #8b5cf6;
}

.variant-target {
  border-left-color: #f59e0b;
}
</style>

