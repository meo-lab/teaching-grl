<script setup>
const props = defineProps({
  label: { type: String, default: '' },
  size: { type: String, default: 'md' },
  variant: { type: String, default: 'default' },
})
</script>

<template>
  <span class="connector-dot" :class="[`size-${props.size}`, `variant-${props.variant}`]">
    <span v-if="props.label" class="label">{{ props.label }}</span>
  </span>
</template>

<style scoped>
.connector-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid color-mix(in srgb, currentColor 42%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 7%, transparent);
  box-shadow: 0 6px 14px color-mix(in srgb, currentColor 9%, transparent);
  color: inherit;
}

.size-sm {
  width: 1rem;
  height: 1rem;
}

.size-md {
  width: 1.35rem;
  height: 1.35rem;
}

.size-lg {
  width: 1.85rem;
  height: 1.85rem;
}

.label {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: .58rem;
  font-weight: 800;
  line-height: 1;
}

.variant-accent {
  border-color: #3b82f6;
  color: #3b82f6;
}

.variant-muted {
  opacity: .62;
}
</style>

