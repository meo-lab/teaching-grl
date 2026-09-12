<script setup>
const props = defineProps({
  text: { type: String, default: 'Label' },
  variant: { type: String, default: 'default' },
  mono: { type: Boolean, default: false },
})
</script>

<template>
  <span class="badge-label" :class="[`variant-${props.variant}`, { mono: props.mono }]">
    {{ props.text }}
  </span>
</template>

<style scoped>
.badge-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 12rem;
  overflow: hidden;
  padding: .22rem .52rem;
  border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 5%, transparent);
  color: inherit;
  font-size: .56rem;
  font-weight: 800;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.variant-muted {
  opacity: .66;
}

.variant-accent {
  border-color: color-mix(in srgb, #3b82f6 48%, transparent);
  color: #3b82f6;
}

.variant-warning {
  border-color: color-mix(in srgb, #f59e0b 54%, transparent);
  color: #f59e0b;
}

.variant-success {
  border-color: color-mix(in srgb, #10b981 52%, transparent);
  color: #10b981;
}
</style>

