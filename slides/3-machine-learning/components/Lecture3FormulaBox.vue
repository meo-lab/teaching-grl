<script setup>
const props = defineProps({
  formula: { type: String, default: 'z = fθ(x)' },
  label: { type: String, default: '' },
  caption: { type: String, default: '' },
})
</script>

<template>
  <div class="formula-box">
    <div v-if="props.label" class="label">{{ props.label }}</div>
    <div class="formula">{{ props.formula }}</div>
    <div v-if="props.caption" class="caption">{{ props.caption }}</div>
  </div>
</template>

<style scoped>
.formula-box {
  display: inline-flex;
  flex-direction: column;
  gap: .28rem;
  min-width: 8rem;
  max-width: 18rem;
  padding: .72rem .86rem;
  border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
  border-radius: .58rem;
  background: color-mix(in srgb, currentColor 4%, transparent);
  box-shadow: 0 8px 18px color-mix(in srgb, currentColor 8%, transparent);
  color: inherit;
}

.label {
  color: color-mix(in srgb, currentColor 62%, transparent);
  font-size: .55rem;
  font-weight: 800;
  line-height: 1;
  text-transform: uppercase;
}

.formula {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: .88rem;
  font-weight: 700;
  line-height: 1.22;
}

.caption {
  color: color-mix(in srgb, currentColor 66%, transparent);
  font-size: .58rem;
  line-height: 1.25;
}
</style>

