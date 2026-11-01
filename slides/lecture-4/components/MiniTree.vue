<script setup lang="ts">
// Small tree glyph for bags / forests. Node colours encode which feature a split uses:
// 'a' = most important feature (orange), 'b' = second feature (green), anything else = other feature (blue).
const props = withDefaults(defineProps<{
  root?: string
  left?: string
  right?: string
  label?: string
  sub?: string
  // features this tree may not use, drawn as coloured dots under the label
  without?: string[]
  size?: string
}>(), {
  root: 'o',
  left: 'o',
  right: 'o',
  without: () => [],
  size: '92px',
})

function color(f: string) {
  if (f === 'a') return 'var(--grl-data-orange)'
  if (f === 'b') return 'var(--grl-data-green)'
  return 'var(--bonn-blue)'
}

const leaves = [10, 30, 50, 70]
</script>

<template>
  <div class="mini-tree" :style="{ width: size }">
    <svg viewBox="0 0 80 66" class="glyph">
      <line x1="40" y1="10" x2="20" y2="32" class="edge" />
      <line x1="40" y1="10" x2="60" y2="32" class="edge" />
      <line v-for="(lx, i) in leaves" :key="i" :x1="i < 2 ? 20 : 60" y1="32" :x2="lx" y2="56" class="edge" />
      <circle cx="40" cy="10" r="6.5" :fill="color(root)" />
      <circle cx="20" cy="32" r="6.5" :fill="color(left)" />
      <circle cx="60" cy="32" r="6.5" :fill="color(right)" />
      <circle v-for="(lx, i) in leaves" :key="`l-${i}`" :cx="lx" cy="56" r="5.5" fill="var(--bonn-blue)" />
    </svg>
    <div v-if="label" class="label">{{ label }}</div>
    <div v-if="sub" class="sub">{{ sub }}</div>
    <div v-if="without.length" class="without">
      without
      <span v-for="f in without" :key="f" class="dot" :style="{ background: color(f) }" />
    </div>
  </div>
</template>

<style scoped>
.mini-tree {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.glyph {
  width: 100%;
  height: auto;
}

.edge {
  stroke: var(--bonn-blue);
  stroke-width: 1.6;
}

.label {
  margin-top: .15rem;
  color: var(--bonn-blue);
  font-family: 'Times New Roman', Times, serif;
  font-size: .78rem;
  font-style: italic;
  white-space: nowrap;
}

.sub {
  color: var(--bonn-text);
  font-size: .62rem;
  white-space: nowrap;
}

.without {
  display: flex;
  align-items: center;
  gap: .2rem;
  margin-top: .1rem;
  color: var(--bonn-muted);
  font-size: .55rem;
}

.dot {
  display: inline-block;
  width: .55rem;
  height: .55rem;
  border-radius: 50%;
}
</style>
