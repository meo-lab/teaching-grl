<script setup>
const props = defineProps({
  title: { type: String, default: 'Model' },
  subtitle: { type: String, default: 'fθ' },
  icon: { type: String, default: '🧠' },
  chips: { type: Array, default: () => [] },
  variant: { type: String, default: 'default' },
})
</script>

<template>
  <div class="model-block" :class="`variant-${props.variant}`">
    <div class="model-main">
      <span class="model-icon">{{ props.icon }}</span>
      <div>
        <div class="model-title">{{ props.title }}</div>
        <div class="model-subtitle">{{ props.subtitle }}</div>
      </div>
    </div>
    <div v-if="props.chips.length" class="model-chips">
      <span v-for="chip in props.chips" :key="chip" class="model-chip">{{ chip }}</span>
    </div>
  </div>
</template>

<style scoped>
.model-block {
  display: inline-flex;
  flex-direction: column;
  gap: .55rem;
  min-width: 9.5rem;
  max-width: 16rem;
  padding: .82rem .92rem;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  border-top: 4px solid color-mix(in srgb, currentColor 30%, transparent);
  border-radius: .7rem;
  background: color-mix(in srgb, currentColor 4%, transparent);
  box-shadow: 0 10px 24px color-mix(in srgb, currentColor 9%, transparent);
  color: inherit;
}

.model-main {
  display: flex;
  align-items: center;
  gap: .62rem;
}

.model-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: .55rem;
  background: color-mix(in srgb, currentColor 7%, transparent);
  font-size: 1.2rem;
}

.model-title {
  font-size: .9rem;
  font-weight: 800;
  line-height: 1.12;
}

.model-subtitle {
  margin-top: .12rem;
  color: color-mix(in srgb, currentColor 68%, transparent);
  font-size: .66rem;
  line-height: 1.2;
}

.model-chips {
  display: flex;
  flex-wrap: wrap;
  gap: .28rem;
}

.model-chip {
  padding: .16rem .38rem;
  border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 5%, transparent);
  font-size: .52rem;
  font-weight: 700;
  line-height: 1;
}

.variant-encoder {
  border-top-color: #3b82f6;
}

.variant-decoder {
  border-top-color: #10b981;
}

.variant-classifier {
  border-top-color: #f59e0b;
}

.variant-foundation {
  border-top-color: #8b5cf6;
}
</style>

