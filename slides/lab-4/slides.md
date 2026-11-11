---
download: true
exportFilename: slides
export:
  waitUntil: load
  wait: 1000
  timeout: 120000
addons:
  - "../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lab 4
home: ../../
---

# Backprop by Hand

<div class="mt-8 text-xl text-gray-600 font-semibold">
Understanding Gradient Descent - one gradient at a time
</div>

<figure class="lab-cover-photo">
  <img src="./figures/human-computers.jpg" alt="Harvard Observatory’s human computers examining astronomical plates and working at desks." />
  <figcaption class="lab-history-caption">
    Harvard Computers, c. 1890. <a href="https://rarehistoricalphotos.com/human-computer-women-profession/">Rare Historical Photos</a>
  </figcaption>
</figure>

<style>
.lab-cover-photo {
  position: absolute;
  left: 105%;
  bottom: 42px;
  width: 88%;
  margin: 0;
}
.lab-cover-photo img {
  display: block;
  width: 100%;
}
.lab-history-caption {
  margin-top: .25rem;
  color: #475569;
  font-size: .65rem;
}
</style>

---
layout: bonn-two-cols-header
columns: "minmax(0, 1.05fr) minmax(0, 1fr)"
---

# Today’s lab

## We are the Computer

::left::

<div class="lab-phases">

### 1 · Forward pass and loss together

`p = model(x)`<br />
`loss = F.binary_cross_entropy(p, y)`

### 2 · Calculate gradients by hand in groups

`loss.backward()`

### 3 · Update the parameters together

`optimizer.step()`

</div>

<style>
.lab-workflow text {
  font-size: 14px;
}
.lab-workflow .lab-workflow-groups text {
  font-size: 13px;
}
.lab-phases h3 {
  margin: 0 0 .15rem;
}
.lab-phases p {
  margin: .15rem 0 .7rem;
}
.lab-history-reference p {
  margin: 0;
}
.lab-history-reference p + p {
  margin-top: .25rem;
  font-size: .72rem;
}
</style>

::right::

<svg class="lab-workflow block w-full" viewBox="0 0 450 244" role="img" aria-labelledby="lab-workflow-title lab-workflow-description">
  <title id="lab-workflow-title">How the class will work</title>
  <desc id="lab-workflow-description">From minute 0 to 30, the class computes the forward pass and loss together. From minute 30 to 100, three groups compute gradients in parallel. From minute 100 to 120, the groups bring their gradients back to the class for a gradient descent step.</desc>

  <g fill="none" stroke="#00457c" stroke-width="2">
    <path d="M225 48V65 M75 65H375 M75 65V101 M225 65V101 M375 65V101" />
    <path d="M75 151V172 M225 151V184 M375 151V172 M75 172H375" />
    <path d="M220 179L225 184L230 179" />
  </g>

  <g fill="#e8f1f9" stroke="#00457c" stroke-width="1.6">
    <rect x="100" y="2" width="250" height="46" rx="6" />
    <rect x="100" y="187" width="250" height="48" rx="6" />
  </g>
  <g fill="#f5effa" stroke="#6e2692" stroke-width="1.6">
    <rect x="6" y="101" width="138" height="50" rx="6" />
    <rect x="156" y="101" width="138" height="50" rx="6" />
    <rect x="306" y="101" width="138" height="50" rx="6" />
  </g>
  <rect x="106" y="75" width="238" height="20" fill="white" />

  <g text-anchor="middle" fill="#00457c" font-size="14">
    <text x="225" y="20" font-weight="700">Together · 0–30 min</text>
    <text x="225" y="37">Forward pass and loss</text>
    <text x="225" y="205" font-weight="700">Together · 100–120 min</text>
    <text x="225" y="222">Gradient descent with group results</text>
  </g>
  <g class="lab-workflow-groups" text-anchor="middle" fill="#6e2692">
    <text x="225" y="90" font-weight="700">Gradients in groups · 30–100 min</text>
    <text x="75" y="121" font-weight="700">Group 1</text>
    <text x="75" y="139">Output layer</text>
    <text x="225" y="121" font-weight="700">Group 2</text>
    <text x="225" y="139">Through ReLU</text>
    <text x="375" y="121" font-weight="700">Group 3</text>
    <text x="375" y="139">First layer</text>
  </g>
</svg>

::bottom::

<div class="lab-history-reference">

Repeated updates reduce the loss and let hidden layers learn useful features from data. This is central to representation learning.

David Rumelhart, Geoffrey Hinton, and Ronald Williams. [*Learning representations by back-propagating errors*](https://www.nature.com/articles/323533a0). *Nature* (1986).

</div>

---
layout: bonn-two-cols-header
columns: "minmax(0, 1fr) minmax(0, 1.1fr)"
---

<script setup>
import ExpertNetwork from './components/ExpertNetwork.vue'
</script>

<div class="flex items-start justify-between gap-4">
  <h1>Phase 1 · Forward pass</h1>

<div class="shrink-0 text-right">

$L=-\ln\Bigl(\underbrace{\sigma\bigl(\overbrace{\mathbf{w}_2^\top\underbrace{\operatorname{ReLU}(\overbrace{\mathbf{W}_1\mathbf{x}+\mathbf{b}_1}^{\mathbf{z}_1})}_{\mathbf{h}}+b_2}^{z_2}\bigr)}_{p}\Bigr)$

</div>
</div>

::left::

<div class="flex h-full items-center">
  <ExpertNetwork role="A" />
</div>

::right::

Use $\mathbf{x}=(1,2)^\top$, $y=1$, and the parameters in the diagram.

1. **Hidden layer.** Compute $\mathbf{z}_1=\mathbf{W}_1\mathbf{x}+\mathbf{b}_1$ and $\mathbf{h}=\operatorname{ReLU}(\mathbf{z}_1)$.
2. **Output layer.** Compute $z_2=\mathbf{w}_2^\top\mathbf{h}+b_2$ and $p=\sigma(z_2)$.
3. **Loss.** Compute $L=-\ln p$ for $y=1$.

::bottom::

Record $\mathbf{z}_1$, $\mathbf{h}$, $z_2$, $p$, and $L$ to three decimal places for the group calculations.

---

# Phase 1: Let's calculate the Forward Pass together

<script setup>
import InteractiveNetwork from './components/InteractiveNetwork.vue'
</script>

Use $\mathbf{x}=(1,2)^\top$ and $y=1$. Round to three decimal places.

<InteractiveNetwork class="mt-6" />

---

<script setup>
import networkUrl from './figures/full-network.svg'
</script>

# Phase 2 · Calculate gradients in three groups

Open your group’s slide and use its starting values. All three groups can begin at the same time.

<svg class="lab-group-network" viewBox="0 0 940 332" role="img" aria-labelledby="group-network-title group-network-description">
  <title id="group-network-title">Three groups work on one network</title>
  <desc id="group-network-description">Group 1 computes gradients for the output layer. Group 2 propagates the loss gradient through the hidden ReLUs. Group 3 computes gradients for the first-layer weights and biases.</desc>
  <image :href="networkUrl" width="940" height="298" />

  <g class="group-first">
    <rect class="group-box" x="108" y="63" width="230" height="214" rx="9" />
    <circle class="group-badge" cx="125" cy="63" r="10" />
    <text class="group-number" x="125" y="68">3</text>
    <text x="223" y="320">Group 3 · First layer</text>
  </g>
  <g class="group-relu">
    <rect class="group-box" x="344" y="63" width="170" height="214" rx="9" />
    <circle class="group-badge" cx="361" cy="63" r="10" />
    <text class="group-number" x="361" y="68">2</text>
    <text x="429" y="320">Group 2 · Through ReLU</text>
  </g>
  <g class="group-output">
    <rect class="group-box" x="520" y="63" width="411" height="214" rx="9" />
    <circle class="group-badge" cx="537" cy="63" r="10" />
    <text class="group-number" x="537" y="68">1</text>
    <text x="725" y="320">Group 1 · Output layer</text>
  </g>
</svg>

Bring your derivation and results to the whole-class discussion.

<style>
.lab-group-network {
  display: block;
  width: min(100%, 790px);
  margin: .25rem auto;
}
.lab-group-network .group-first { color: #0f766e; }
.lab-group-network .group-relu { color: #a54a0a; }
.lab-group-network .group-output { color: #1554a2; }
.lab-group-network .group-box {
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-dasharray: 6 4;
}
.lab-group-network .group-badge { fill: currentColor; }
.lab-group-network text {
  fill: currentColor;
  font-size: 16px;
  font-weight: 700;
  text-anchor: middle;
}
.lab-group-network .group-number { fill: white; font-size: 14px; }
</style>

---
layout: bonn-two-cols-header
columns: "minmax(0, 1fr) minmax(0, 1.1fr)"
---

<script setup>
import InteractiveNetwork from './components/InteractiveNetwork.vue'
</script>

<div class="flex items-start justify-between gap-4">
<h1>Group 1 · Output layer</h1>

<div class="shrink-0 text-right">

$L=\operatorname{BCE}\Bigl(\underbrace{\sigma\bigl(\overbrace{\mathbf{w}_2^\top\mathbf{h}+b_2}^{z_2}\bigr)}_{p},\,y\Bigr)$

</div>
</div>

From the loss $L$ to $\partial L/\partial z_2$ and the gradients for $\mathbf{w}_2$ and $b_2$.

::left::

<div class="flex h-full items-center">
  <InteractiveNetwork section="output" />
</div>

::right::

**Start with** $\mathbf{h}=(0,1)^\top$, $p\approx 0.269$, and $y=1$.

1. Find $\partial L/\partial p$ for binary cross-entropy and $dp/dz_2$ for the sigmoid.
2. Multiply and simplify for general binary $y$ to get $\partial L/\partial z_2$. Then substitute the starting values.
3. Differentiate $z_2=\mathbf{w}_2^\top \mathbf{h}+b_2$ with respect to each output weight and the output bias. Apply the chain rule.

::bottom::

**Expected outputs** · $\partial L/\partial p$, $dp/dz_2$, $\partial L/\partial z_2$, both entries of $\partial L/\partial\mathbf{w}_2$, and $\partial L/\partial b_2$. Click a blue label or matrix entry, then press **Enter** to check. Double-click to edit.

---
layout: bonn-two-cols-header
columns: "minmax(0, 1fr) minmax(0, 1.1fr)"
---

<script setup>
import InteractiveNetwork from './components/InteractiveNetwork.vue'
</script>

<div class="flex items-start justify-between gap-4">
<h1>Group 2 · Through ReLU</h1>

<div class="shrink-0 text-right">

$z_2=\mathbf{w}_2^\top\underbrace{\operatorname{ReLU}(\mathbf{z}_1)}_{\mathbf{h}}+b_2$

</div>
</div>

From $\partial L/\partial z_2$ back through the hidden activations to $\partial L/\partial \mathbf{z}_1$.

::left::

<div class="flex h-full items-center">
  <InteractiveNetwork section="relu" />
</div>

::right::

**Start with** $\partial L/\partial z_2\approx -0.731$, $\mathbf{z}_1=(-0.5,1)^\top$, $\mathbf{w}_2=(1,-1.5)^\top$, and $b_2=0.5$.

1. Differentiate $z_2=\mathbf{w}_2^\top \mathbf{h}+b_2$ with respect to each entry of $\mathbf{h}$. Use $\partial L/\partial z_2$ to get $\partial L/\partial \mathbf{h}$.
2. Find the two ReLU derivatives, $\partial h_1/\partial z_{1,1}$ and $\partial h_2/\partial z_{1,2}$, at the given pre-activations.
3. Multiply each unit’s loss gradient by its ReLU derivative to get $\partial L/\partial\mathbf{z}_1$.

::bottom::

**Expected outputs** · Both ReLU slopes and both entries of each gradient, $\partial L/\partial\mathbf{h}$ and $\partial L/\partial\mathbf{z}_1$. Click a blue label or matrix entry, then press **Enter** to check. Double-click to edit.

---
layout: bonn-two-cols-header
columns: "minmax(0, 1fr) minmax(0, 1.1fr)"
---

<script setup>
import InteractiveNetwork from './components/InteractiveNetwork.vue'
</script>

<div class="flex items-start justify-between gap-4">
<h1>Group 3 · First layer</h1>

<div class="shrink-0 text-right">

$\underbrace{\mathbf{W}_1\mathbf{x}+\mathbf{b}_1}_{\mathbf{z}_1}=(z_{1,1},z_{1,2})^\top$

</div>
</div>

From $\partial L/\partial \mathbf{z}_1$ to the gradients for the first-layer weights and biases.

::left::

<div class="flex h-full items-center">
  <InteractiveNetwork section="first" />
</div>

::right::

**Start with** $\partial L/\partial \mathbf{z}_1\approx (0,1.097)^\top$ and $\mathbf{x}=(1,2)^\top$.

1. For hidden unit $j$, write $z_{1,j}$ in terms of row $j$ of $\mathbf{W}_1$ and its bias.
2. Use the local derivatives and $\partial L/\partial z_{1,j}$ to find both weight gradients and the bias gradient for that unit. Repeat for the other unit.

::bottom::

**Expected outputs** · All four entries of $\partial L/\partial\mathbf{W}_1$ and both entries of $\partial L/\partial\mathbf{b}_1$. Click a blue label or matrix entry, then press **Enter** to check. Double-click to edit.

---

# Phase 2 · Assemble the gradients

<!-- Ask Groups 1–3 to report their results in order. Enter all nine parameter gradients before updating. -->

<script setup>
import InteractiveNetwork from './components/InteractiveNetwork.vue'
</script>

<InteractiveNetwork mode="backward" />

---

<script setup>
import NetworkUpdate from './components/NetworkUpdate.vue'
</script>

# Phase 3 · Update and recompute together

$$
\Large\boxed{\theta_{\mathrm{new}}=\theta-0.5\,\frac{\partial L}{\partial\theta}}
$$

Each group updates its three parameters. Fill any missing gradients, then enter each new value and press **Enter** to check it.

<NetworkUpdate />

Combine the nine updated parameters and run a fresh forward pass together. Compare the new loss and ReLU states with the original ones.
