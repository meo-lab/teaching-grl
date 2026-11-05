<script setup lang="ts">
// Block diagram of the eigenvalue decomposition C = V L V^T.
// variant 'decomp'    : full D x D decomposition (+ rotation/scaling captions)
// variant 'truncated' : keep only the P largest eigenpairs -> C ~ P^T L_P P
// `geometry` adds the bottom row: circle -> rotate -> scale -> rotate back.
const props = withDefaults(defineProps<{
  variant?: 'decomp' | 'truncated'
  geometry?: boolean
}>(), {
  variant: 'decomp',
  geometry: false,
})

const cell = 18
const gap = 3
const grey = ['#7d7f81', '#b9bbbd', '#d4d6d8', '#e4e5e6']
// covariance: darker on the diagonal, lighter off-diagonal
const covShade = (i: number, j: number) => (i === j ? grey[0] : grey[Math.min(3, Math.abs(i - j))])
const n = 5 // drawn cells per dimension (last row/col stands for "D")
const label = (i: number) => (i === n - 1 ? 'D' : String(i + 1))

const P = 2
</script>

<template>
  <div class="svg-fit" :style="{ position: 'relative', width: '100%', height: 0, paddingTop: `${(props.geometry ? 372 : 196) / (900) * 100}%` }"><svg :viewBox="`0 0 900 ${props.geometry ? 372 : 196}`" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block" role="img" aria-label="Eigenvalue decomposition of the covariance matrix into eigenvectors and eigenvalues">
    <!-- C -->
    <g transform="translate(20 20)">
      <rect x="-10" y="-14" width="160" height="186" rx="10" fill="#fff" stroke="#00457c" stroke-width="1.5" />
      <text x="0" y="4" style="font-size: 14px" font-weight="700" fill="#00457c">Covariance C</text>
      <text x="140" y="4" style="font-size: 11px" fill="#555" text-anchor="end" font-style="italic">D &#215; D</text>
      <g transform="translate(22 32)">
        <template v-for="i in n" :key="i">
          <rect v-for="j in n" :key="`${i}-${j}`" :x="(j - 1) * (cell + gap) + (j === n ? 8 : 0)" :y="(i - 1) * (cell + gap) + (i === n ? 8 : 0)" :width="cell" :height="cell" rx="2" :fill="covShade(i, j)" />
        </template>
      </g>
      <text x="70" y="164" style="font-size: 11px" fill="#555" text-anchor="middle">bands &#215; bands</text>
    </g>

    <!-- equals / approx -->
    <text x="205" y="120" style="font-size: 44px" font-weight="700" fill="#00457c" text-anchor="middle">{{ props.variant === 'truncated' ? '&#8776;' : '=' }}</text>

    <!-- V (eigenvectors as rows) -->
    <g transform="translate(250 20)">
      <rect x="-10" y="-14" width="190" height="186" rx="10" fill="#fff" stroke="#00457c" stroke-width="1.5" />
      <text x="0" y="4" style="font-size: 14px" font-weight="700" fill="#00457c">{{ props.variant === 'truncated' ? 'Loadings P' : 'Eigenvectors V' }}</text>
      <text x="170" y="4" style="font-size: 11px" fill="#555" text-anchor="end" font-style="italic">{{ props.variant === 'truncated' ? 'P &#215; D' : 'D &#215; D' }}</text>
      <g transform="translate(36 32)">
        <template v-for="i in (props.variant === 'truncated' ? P : n)" :key="i">
          <text x="-8" :y="(i - 1) * (cell + gap) + (i === n ? 8 : 0) + 13" style="font-size: 11px" text-anchor="end" font-style="italic" fill="#333">{{ props.variant === 'truncated' ? 'p' : 'v' }}{{ props.variant === 'truncated' ? i : label(i - 1) }}</text>
          <rect v-for="j in n" :key="`${i}-${j}`" :x="(j - 1) * (cell + gap) + (j === n ? 8 : 0)" :y="(i - 1) * (cell + gap) + (i === n ? 8 : 0)" :width="cell" :height="cell" rx="2" fill="#ffb877" />
        </template>
      </g>
      <text x="85" y="160" style="font-size: 11px" fill="#555" text-anchor="middle">orthogonal: a <tspan font-weight="700">rotation</tspan></text>
    </g>

    <!-- L (eigenvalues, diagonal) -->
    <g transform="translate(470 20)">
      <rect x="-10" y="-14" width="160" height="186" rx="10" fill="#fff" stroke="#00457c" stroke-width="1.5" />
      <text x="0" y="4" style="font-size: 14px" font-weight="700" fill="#00457c">Eigenvalues L</text>
      <text x="140" y="4" style="font-size: 11px" fill="#555" text-anchor="end" font-style="italic">{{ props.variant === 'truncated' ? 'P &#215; P' : 'D &#215; D' }}</text>
      <g transform="translate(22 32)">
        <template v-for="i in (props.variant === 'truncated' ? P : n)" :key="i">
          <template v-for="j in (props.variant === 'truncated' ? P : n)" :key="`${i}-${j}`">
            <rect :x="(j - 1) * (cell + gap) + (j === n ? 8 : 0)" :y="(i - 1) * (cell + gap) + (i === n ? 8 : 0)" :width="cell" :height="cell" rx="2"
              :fill="i === j ? grey[1] : '#fff'" stroke="#c9ccce" stroke-width=".8" />
            <text v-if="i === j" :x="(j - 1) * (cell + gap) + (j === n ? 8 : 0) + 9" :y="(i - 1) * (cell + gap) + (i === n ? 8 : 0) + 13" style="font-size: 9px" text-anchor="middle" font-style="italic" fill="#222">&#955;{{ label(i - 1) === 'D' ? 'D' : i }}</text>
          </template>
        </template>
      </g>
      <text x="70" y="160" style="font-size: 11px" fill="#555" text-anchor="middle"><tspan font-weight="700">scaling</tspan> of each axis</text>
    </g>

    <!-- V^T -->
    <g transform="translate(660 20)">
      <rect x="-10" y="-14" width="190" height="186" rx="10" fill="#fff" stroke="#00457c" stroke-width="1.5" />
      <text x="0" y="4" style="font-size: 14px" font-weight="700" fill="#00457c">{{ props.variant === 'truncated' ? 'Inverse Pᵀ' : 'Inverse Vᵀ' }}</text>
      <text x="170" y="4" style="font-size: 11px" fill="#555" text-anchor="end" font-style="italic">{{ props.variant === 'truncated' ? 'D &#215; P' : 'D &#215; D' }}</text>
      <g transform="translate(36 32)">
        <template v-for="j in (props.variant === 'truncated' ? P : n)" :key="j">
          <text :x="(j - 1) * (cell + gap) + (j === n ? 8 : 0) + 9" y="-4" style="font-size: 11px" text-anchor="middle" font-style="italic" fill="#333">{{ props.variant === 'truncated' ? 'p' : 'v' }}{{ props.variant === 'truncated' ? j : label(j - 1) }}</text>
          <rect v-for="i in n" :key="`${i}-${j}`" :x="(j - 1) * (cell + gap) + (j === n ? 8 : 0)" :y="(i - 1) * (cell + gap) + (i === n ? 8 : 0)" :width="cell" :height="cell" rx="2" fill="#ffb877" />
        </template>
      </g>
      <text x="85" y="160" style="font-size: 11px" fill="#555" text-anchor="middle">the <tspan font-weight="700">inverse rotation</tspan></text>
    </g>

    <!-- geometry: circle -> rotate -> scale -> rotate back -->
    <g v-if="props.geometry" transform="translate(0 212)">
      <g v-for="(s, k) in [
        { x: 120, rx: 38, ry: 38, rot: -35, label: 'a on the unit circle' },
        { x: 340, rx: 38, ry: 38, rot: 0, label: 'rotate: Vᵀa' },
        { x: 560, rx: 62, ry: 22, rot: 0, label: 'scale: L Vᵀa' },
        { x: 780, rx: 62, ry: 22, rot: -35, label: 'rotate back: V L Vᵀa = C a' },
      ]" :key="k">
        <line :x1="s.x - 70" y1="60" :x2="s.x + 70" y2="60" stroke="#c0c4c8" />
        <line :x1="s.x" y1="0" :x2="s.x" y2="120" stroke="#c0c4c8" />
        <g :transform="`rotate(${s.rot} ${s.x} 60)`">
          <ellipse :cx="s.x" cy="60" :rx="s.rx" :ry="s.ry" fill="#ff7900" stroke="#00457c" stroke-width="1.6" :style="{ fillOpacity: '.1' }" />
          <line :x1="s.x" y1="60" :x2="s.x + s.rx" y2="60" stroke="#2eb82e" stroke-width="2.5" />
          <line :x1="s.x" y1="60" :x2="s.x" :y2="60 - s.ry" stroke="#b02b37" stroke-width="2.5" />
        </g>
        <text :x="s.x" y="138" style="font-size: 13px" text-anchor="middle" fill="#333">{{ s.label }}</text>
      </g>
      <text v-for="ax in [230, 450, 670]" :key="ax" :x="ax" y="68" style="font-size: 26px" fill="#ff7900" text-anchor="middle">&#10142;</text>
    </g>
  </svg></div>
</template>
