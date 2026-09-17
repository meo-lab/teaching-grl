---
addons:
  - "../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lecture 5
home: ../
---

# Deep Representation Learning II

## How Can a Model Generalize?

<!--
Lecture 4 ended with gradient-based learning and minimizing a training loss.
Lecture 5 continues directly from there: what does it mean to truly learn, not just memorize?
-->

---

# Learning Outcomes

<div class="mt-5 flex flex-col gap-4">
  <div class="flex gap-4 items-start">
    <div class="text-[.7rem] font-bold text-blue-700 w-5 shrink-0 mt-0.5">1</div>
    <div class="text-[.82rem] leading-snug">Explain <strong>generalization</strong> as the difference between optimizing a finite training sample and performing well on the underlying data distribution.</div>
  </div>
  <div class="flex gap-4 items-start">
    <div class="text-[.7rem] font-bold text-blue-700 w-5 shrink-0 mt-0.5">2</div>
    <div class="text-[.82rem] leading-snug">Explain how <strong>model capacity, data, and regularization</strong> determine underfitting and overfitting in the classical regime.</div>
  </div>
  <div class="flex gap-4 items-start">
    <div class="text-[.7rem] font-bold text-blue-700 w-5 shrink-0 mt-0.5">3</div>
    <div class="text-[.82rem] leading-snug">Explain why the <strong>interpolation threshold, double descent, and grokking</strong> challenge the classical bias–variance picture and motivate the modern overparameterized learning regime.</div>
  </div>
</div>

<!--
Three outcomes, two lectures worth of contrast: classical view vs. modern view.
Outcome 1 sets up the core concept; Outcome 2 is the classical story; Outcome 3 is the modern twist.
-->

---

# We Know How to Minimize a Loss

<div class="grid grid-cols-2 gap-8 mt-6">
  <div>
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-700 mb-3">What we have from Lecture 4</div>
    <ul class="text-[.8rem] leading-8">
      <li>Forward pass</li>
      <li>Loss computation</li>
      <li>Backpropagation</li>
      <li>Gradient-based parameter updates</li>
    </ul>
  </div>
  <div class="flex flex-col justify-center">
    <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
      <div class="text-[.9rem] font-semibold text-blue-900 leading-snug">We now know how to minimize training loss.</div>
    </div>
    <div class="mt-4 text-[.75rem] text-gray-500">But is minimizing training loss the same as learning?</div>
  </div>
</div>

<!--
Short recap of Lecture 4. The key statement — "we now know how to minimize training loss" — sets up the central question of this lecture.
Do not expand on the mechanics here; that was Lecture 4.
-->

---

# Is Imitation the Same as Learning?

<div class="flex flex-col items-center justify-center h-[78%] gap-6">
  <video
    src="./assets/pizza.mp4"
    controls
    class="rounded-xl shadow-lg max-h-[300px]"
    style="max-width: 560px;"
  ></video>
  <div class="text-[1.1rem] font-semibold text-gray-800 mt-2">What is wrong here?</div>
  <div class="text-[.8rem] text-gray-500">Is this person learning — or only copying?</div>
</div>

<!--
Interactive discussion starter. Play the video and ask students to discuss in pairs before revealing the answer on the next slide.
The pizza maker perfectly reproduces the demonstrated motions but fails when the situation changes — an analogy for a model that has memorized training examples but cannot generalize.
Do not explain the answer here; let the next slide resolve it.
-->

---

# The Missing Ingredient: Generalization

<div class="mt-6 flex flex-col gap-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.75rem] font-semibold text-gray-500 uppercase tracking-wide mb-2">What we have</div>
    <div class="text-[.9rem]">A model that fits the training examples — low training loss.</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.75rem] font-semibold text-blue-700 uppercase tracking-wide mb-2">What we need</div>
    <div class="text-[.9rem] font-semibold text-blue-900">A model that performs well on situations it has not seen during training.</div>
  </div>
</div>

<div class="mt-6 text-[.82rem] text-gray-600">
  Fitting observed examples is not the same as learning something that transfers to new situations.<br>
  <strong>Generalization</strong> is the missing ingredient.
</div>

<!--
Resolve the pizza discussion. The conceptual message is simple: low training loss is necessary but not sufficient.
Keep this slide minimal — one contrast, one key word: generalization.
-->

---

# What Does a Learning System Need?

<div class="grid grid-cols-4 gap-4 mt-6">
  <div class="rounded-xl border-2 border-gray-200 p-4 text-center">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-400 mb-2">Lecture 4</div>
    <div class="text-[.88rem] font-semibold text-gray-800">Model</div>
    <div class="text-[.68rem] text-gray-500 mt-2 leading-snug">architectures, parameters, activations</div>
  </div>
  <div class="rounded-xl border-2 border-blue-300 bg-blue-50 p-4 text-center">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-600 mb-2">Lecture 5 ↓</div>
    <div class="text-[.88rem] font-semibold text-blue-900">Data &amp; Experience</div>
    <div class="text-[.68rem] text-blue-700 mt-2 leading-snug">finite samples from a distribution</div>
  </div>
  <div class="rounded-xl border-2 border-gray-200 p-4 text-center">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-400 mb-2">Lecture 4</div>
    <div class="text-[.88rem] font-semibold text-gray-800">Learning Algorithm</div>
    <div class="text-[.68rem] text-gray-500 mt-2 leading-snug">loss, gradients, backprop, updates</div>
  </div>
  <div class="rounded-xl border-2 border-blue-300 bg-blue-50 p-4 text-center">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-600 mb-2">Lecture 5 ↓</div>
    <div class="text-[.88rem] font-semibold text-blue-900">Generalization</div>
    <div class="text-[.68rem] text-blue-700 mt-2 leading-snug">performance on unseen situations</div>
  </div>
</div>

<div class="mt-5 text-[.75rem] text-gray-600 text-center">
  Lecture 4 covered the <strong>model</strong> and the <strong>learning algorithm</strong>. Lecture 5 focuses on <strong>data</strong> and <strong>generalization</strong>.
</div>

<!--
Conceptual map for the whole lecture. Use this to orient students before diving into Block 1.
The four boxes mirror the AspectsOfLearning framework from earlier in the course.
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: classical-generalization
sectionTitle: Classical Generalization
---

# Block 1 — Classical Generalization

<div class="text-[.88rem] text-gray-200 mt-4">
From finite training sets to expected loss — the classical view of generalization.
</div>

<!--
Block 1 placeholder. Topics to develop: finite datasets vs. underlying distribution, training vs. population loss, train/val/test splits, generalization gap, model capacity, underfitting/overfitting, bias–variance trade-off, regularization.
-->

---
section: classical-generalization
---

# The Training Set Is Only a Sample

<div class="grid grid-cols-[1fr_1.4fr] gap-8 mt-6 items-start">
  <div>
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-700 mb-3">What the model sees</div>
    <div class="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
      <div class="grid grid-cols-4 gap-2">
        <div v-for="i in 12" class="w-7 h-7 rounded-full bg-blue-400 opacity-80 flex items-center justify-center text-white text-[.55rem] font-bold">{{ i }}</div>
      </div>
      <div class="mt-3 text-[.65rem] text-blue-700 font-semibold text-center">n observed examples</div>
    </div>
  </div>
  <div>
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-3">The world it should learn to handle</div>
    <div class="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 flex flex-col items-center justify-center min-h-[120px]">
      <div class="text-[.75rem] text-gray-400 text-center leading-6">Vast space of possible inputs<br>the model will never see during training</div>
      <div class="mt-2 text-gray-300 text-[2rem]">···</div>
    </div>
  </div>
</div>

<div class="mt-5 rounded-lg bg-gray-100 px-4 py-2 text-[.78rem] text-gray-700 text-center">
  The model only sees one finite sample — but must work on the rest.
</div>

<!--
Key intuition before any formalism: training data is a small, finite window onto a much larger world.
Use this to motivate why fitting the training set perfectly is not the same as learning.
-->

---
section: classical-generalization
---

# Data Come From an Underlying Distribution

<div class="grid grid-cols-2 gap-8 mt-6 items-start">
  <div>
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Underlying distribution</div>
    <div class="rounded-xl border border-gray-200 bg-gray-50 p-5 flex flex-col items-center">
      <div class="text-[1.1rem] font-mono text-gray-700">p(x, y)</div>
      <div class="mt-3 text-[.7rem] text-gray-500 text-center leading-6">The true, unknown joint distribution<br>over inputs and targets</div>
    </div>
  </div>
  <div>
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-700 mb-3">Observed dataset</div>
    <div class="rounded-xl border border-blue-200 bg-blue-50 p-5 flex flex-col items-center">
      <div class="text-[1.1rem] font-mono text-blue-800">𝒟 ~ p(x, y)</div>
      <div class="mt-3 text-[.7rem] text-blue-700 text-center leading-6">A finite collection of n samples<br>drawn i.i.d. from p</div>
    </div>
  </div>
</div>

<div class="mt-6 text-[.78rem] text-gray-600 text-center">
  The dataset is a finite sample from an underlying distribution. The distribution does not change — but each sample will differ.
</div>

<!--
Introduce the statistical framing. Keep mathematics minimal.
The key idea: there is a true distribution p(x,y) we cannot directly access; we only ever observe a finite 𝒟.
-->

---
section: classical-generalization
---

# Different Samples, Different Models

<div class="mt-4 text-[.8rem] text-gray-600 mb-4 text-center">
  Three datasets sampled from the same distribution → three different fitted models.
</div>

<div class="grid grid-cols-3 gap-5">
  <div v-for="i in 3" class="rounded-xl border border-gray-200 p-3 flex flex-col items-center gap-2">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-400">Sample {{ i }}</div>
    <div class="w-full h-[140px] bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-[.65rem]">
      scatter + fitted curve placeholder
    </div>
    <div class="text-[.65rem] font-mono text-gray-500">θ̂<sub>{{ i }}</sub></div>
  </div>
</div>

<div class="mt-5 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-[.78rem] text-blue-800 text-center font-medium">
  If we collected the data again, would we learn the same model?
</div>

<!--
Motivate variance. Even if the model class and algorithm are fixed, the specific learned parameters depend on the particular sample.
This is the seed of the bias–variance decomposition.
-->

---
section: classical-generalization
---

# What Do We Actually Want to Minimize?

<div class="grid grid-cols-2 gap-8 mt-6">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-3">What we optimize</div>
    <div class="text-[1rem] font-mono text-gray-700 text-center mb-3">L<sub>train</sub>(θ)</div>
    <div class="text-[.72rem] text-gray-500 leading-6 text-center">Empirical risk — averaged over the finite training set 𝒟</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-700 mb-3">What we care about</div>
    <div class="text-[1rem] font-mono text-blue-800 text-center mb-3">L<sub>𝒟</sub>(θ) = 𝔼<sub>p(x,y)</sub>[ℓ(f<sub>θ</sub>(x), y)]</div>
    <div class="text-[.72rem] text-blue-700 leading-6 text-center">Expected risk — performance on the full underlying distribution</div>
  </div>
</div>

<div class="mt-5 text-[.78rem] text-gray-600 text-center">
  We optimize performance on the <strong>sample</strong>. We care about performance on the <strong>distribution</strong>.
</div>

<!--
The fundamental tension in supervised learning. Keep equations minimal — the concept matters more than the notation here.
-->

---
section: classical-generalization
---

# Underfitting and Overfitting

<div class="grid grid-cols-3 gap-5 mt-4">
  <div class="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 flex flex-col items-center gap-3">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-amber-700">Underfitting</div>
    <div class="w-full h-[150px] bg-white rounded-lg border border-dashed border-amber-200 flex items-center justify-center text-amber-300 text-[.65rem] text-center px-2">
      low-capacity model —<br>misses the structure
    </div>
    <div class="text-[.7rem] text-amber-800 text-center leading-snug">High bias. Cannot capture the pattern even on training data.</div>
  </div>
  <div class="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 flex flex-col items-center gap-3">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-emerald-700">Good fit</div>
    <div class="w-full h-[150px] bg-white rounded-lg border border-dashed border-emerald-200 flex items-center justify-center text-emerald-300 text-[.65rem] text-center px-2">
      appropriate capacity —<br>captures the structure
    </div>
    <div class="text-[.7rem] text-emerald-800 text-center leading-snug">Generalizes. Fits the pattern without fitting the noise.</div>
  </div>
  <div class="rounded-xl border-2 border-red-200 bg-red-50 p-4 flex flex-col items-center gap-3">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-red-700">Overfitting</div>
    <div class="w-full h-[150px] bg-white rounded-lg border border-dashed border-red-200 flex items-center justify-center text-red-300 text-[.65rem] text-center px-2">
      high-capacity model —<br>fits sample noise
    </div>
    <div class="text-[.7rem] text-red-800 text-center leading-snug">High variance. Excellent on training data, poor on new data.</div>
  </div>
</div>

<!--
Use a simple regression curve sketch in the placeholder areas when developing this slide further.
The three-column structure maps cleanly onto the bias–variance slide that follows.
-->

---
section: classical-generalization
---

# Bias and Variance

<div class="grid grid-cols-2 gap-8 mt-5">
  <div class="rounded-xl border border-amber-200 bg-amber-50 p-5">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-amber-700 mb-2">Bias</div>
    <div class="text-[.82rem] text-amber-900 leading-7">
      Systematic error from a model that is <strong>too restricted</strong> to capture the true pattern.<br>
      <span class="text-[.7rem] text-amber-700">→ Underfitting. Present even if trained on infinite data.</span>
    </div>
  </div>
  <div class="rounded-xl border border-red-200 bg-red-50 p-5">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-red-700 mb-2">Variance</div>
    <div class="text-[.82rem] text-red-900 leading-7">
      Sensitivity of the learned model to the <strong>particular training sample</strong>.<br>
      <span class="text-[.7rem] text-red-700">→ Overfitting. Different samples produce very different models.</span>
    </div>
  </div>
</div>

<div class="mt-6 rounded-lg bg-gray-100 px-4 py-3 text-[.78rem] text-gray-700 text-center">
  A model with high bias always makes the same kind of mistake. A model with high variance makes different mistakes depending on which data it saw.
</div>

<!--
Keep this intuitive. Bias = systematic; Variance = sampling-dependent.
The repeated-samples framing from slide 3 is useful here as a callback.
-->

---
section: classical-generalization
---

# Model Capacity Changes the Trade-off

<div class="grid grid-cols-[1.2fr_1fr] gap-8 mt-5 items-start">
  <div>
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Classical error curve</div>
    <div class="w-full h-[220px] bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-[.65rem] text-center px-4">
      bias–variance / test-error curve placeholder<br>(U-shaped generalisation error vs. model complexity)
    </div>
  </div>
  <div class="flex flex-col gap-4 mt-1">
    <div class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[.75rem] text-amber-800">↑ Capacity → ↓ Bias</div>
    <div class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[.75rem] text-red-800">↑ Capacity → ↑ Variance <span class="text-[.65rem] text-red-600">(in the classical regime)</span></div>
    <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[.75rem] text-emerald-800 font-medium">There is an intermediate complexity that generalizes best.</div>
  </div>
</div>

<div class="mt-4 text-[.7rem] text-gray-500 text-center">Classical intuition only — double descent will revise this picture in Block 2.</div>

<!--
Establish the classical U-shaped generalisation curve before Block 2 overturns it.
Explicitly flag that this is the classical view so students know a revision is coming.
-->

---
section: classical-generalization
---

# A Geometric View: Loss Surfaces

<div class="grid grid-cols-2 gap-8 mt-5 items-start">
  <div>
    <img
      src="../4-deep-representation-learning-i/assets/loss_surfaces.svg"
      class="w-full h-[260px] object-contain"
      alt="Loss surface over parameter space with a basin of minimum training loss"
    />
  </div>
  <div class="flex flex-col gap-4 mt-2">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-1">Recap from Lecture 4</div>
    <ul class="text-[.78rem] leading-8 text-gray-700">
      <li>Gradient descent navigates the loss surface</li>
      <li>The surface shape is determined by the training data</li>
      <li>Training selects parameters by finding a low point</li>
    </ul>
    <div class="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-[.78rem] text-blue-800">
      The loss surface is induced by the <strong>training data</strong> — a different sample gives a different surface.
    </div>
  </div>
</div>

<!--
Transition from statistical to geometric framing. Reuse the loss_surfaces.svg from Lecture 4 to maintain visual consistency.
Sets up the next slide which shows multiple surfaces from different samples.
-->

---
section: classical-generalization
---

# Different Data, Different Loss Surfaces

<div class="mt-4 text-[.78rem] text-gray-600 mb-4 text-center">
  Three finite samples from the same distribution → three slightly different loss surfaces.
</div>

<div class="grid grid-cols-3 gap-5">
  <div v-for="i in 3" class="rounded-xl border border-gray-200 p-3 flex flex-col items-center gap-2">
    <div class="text-[.65rem] font-mono text-gray-500">L<sub>D{{ i }}</sub>(θ)</div>
    <div class="w-full h-[150px] bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-[.65rem] text-center px-2">
      loss surface {{ i }}<br>placeholder
    </div>
  </div>
</div>

<div class="mt-5 rounded-lg bg-gray-100 px-4 py-3 text-[.78rem] text-gray-700 text-center">
  A solution that perfectly fits one sample may not be stable across other samples from the same distribution.
</div>

<!--
Connect sampling variance to optimization geometry.
The minimum of L_D1 is not necessarily the minimum of L_D2 — each sample produces its own empirical loss surface.
-->

---
section: classical-generalization
---

# Regularization Changes Which Solution We Prefer

<div class="grid grid-cols-[1.2fr_1fr] gap-8 mt-5 items-start">
  <div>
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Many low-loss solutions exist</div>
    <div class="w-full h-[200px] bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-[.65rem] text-center px-4">
      flat loss basin — many θ achieve<br>similarly low training loss
    </div>
  </div>
  <div class="flex flex-col gap-3 mt-1">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-1">Regularization biases toward simpler solutions</div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[.72rem] text-gray-700">Smaller model (fewer parameters)</div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[.72rem] text-gray-700">L2 / weight decay — penalizes large weights</div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[.72rem] text-gray-700">Early stopping — halt before overfitting</div>
    <div class="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-[.72rem] text-blue-800">
      Regularization is not only about reducing training loss — it changes <strong>which solution we prefer</strong>.
    </div>
  </div>
</div>

<!--
Regularization as a preference over solutions, not just a constraint on loss.
Connects nicely to the implicit regularization discussion in Block 2.
-->

---
section: classical-generalization
---

# Three Ways to Improve Generalization

<div class="grid grid-cols-3 gap-5 mt-5">
  <div class="rounded-xl border-2 border-gray-200 p-5">
    <div class="text-[.62rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Restrict the model</div>
    <div class="text-[.8rem] font-semibold text-gray-800 mb-3">Use a smaller or simpler model.</div>
    <ul class="text-[.7rem] text-gray-500 leading-7">
      <li>Fewer parameters</li>
      <li>Shallower network</li>
      <li>Lower model complexity</li>
    </ul>
  </div>
  <div class="rounded-xl border-2 border-gray-200 p-5">
    <div class="text-[.62rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Restrict the solution</div>
    <div class="text-[.8rem] font-semibold text-gray-800 mb-3">Keep the model flexible — constrain what it learns.</div>
    <ul class="text-[.7rem] text-gray-500 leading-7">
      <li>L2 weight decay</li>
      <li>Sparsity constraints</li>
      <li>Early stopping</li>
    </ul>
  </div>
  <div class="rounded-xl border-2 border-blue-200 bg-blue-50 p-5">
    <div class="text-[.62rem] font-bold uppercase tracking-wide text-blue-700 mb-3">Increase the data</div>
    <div class="text-[.8rem] font-semibold text-blue-900 mb-3">Train on more examples.</div>
    <div class="text-[.7rem] text-blue-700 leading-7">More data reduces dependence on the peculiarities of one finite sample — and allows larger models to be trained more reliably.</div>
  </div>
</div>

<div class="mt-5 rounded-lg bg-gray-100 px-4 py-3 text-[.78rem] text-gray-600 text-center">
  What happens if, instead of keeping the model small, we make <strong>both the model and the dataset much larger</strong>?
</div>

<!--
Block 1 closing slide. The three columns summarise the classical toolkit.
The closing question is the transition into Block 2: overparameterization, double descent, grokking.
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: modern-generalization
sectionTitle: Modern Generalization
---

# Block 2 — Generalization in the Overparameterized Regime

<div class="text-[.88rem] text-gray-200 mt-4">
Classical intuition suggests that increasing capacity beyond the interpolation threshold should hurt generalization. Modern deep learning often behaves differently.
</div>

<!--
Block 2 placeholder. Topics to develop: interpolation threshold, double descent, grokking, implicit regularization, overparameterization, scaling laws, connection to foundation models.
-->

---
section: modern-generalization
---

# Block 2 — Coming Soon

<div class="text-[.85rem] text-gray-500 mt-6">
  Placeholder — content will be developed here.
</div>

<div class="mt-8 text-[.75rem] text-gray-400 leading-7">
  Planned topics:
  <ul class="mt-2">
    <li>Interpolation threshold</li>
    <li>Double descent</li>
    <li>Grokking</li>
    <li>Implicit regularization</li>
    <li>Overparameterization</li>
    <li>Scaling model capacity and data</li>
    <li>Connection to foundation models</li>
  </ul>
</div>

---
layout: bonn-section
sectionColor: "#00457c"
section: beyond-interpolation
sectionTitle: Beyond the Interpolation Threshold
---

# Block 3 — Beyond the Interpolation Threshold

<div class="text-[.88rem] text-gray-200 mt-4">
Modern overparameterized networks can fit training data perfectly and still generalize. Why?
</div>

<!--
Block 3: moves from the classical capacity story into the modern overparameterized regime.
Key thread: which function does learning select, and why does that selection generalize?
-->

---
section: beyond-interpolation
---

# Beyond the Interpolation Threshold

<div class="grid grid-cols-[1.3fr_1fr] gap-8 mt-5 items-start">
  <div>
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Recall from Block 1</div>
    <div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-[.75rem] text-gray-500 text-center leading-7">
      Overparameterized polynomial placeholder —<br>wiggly curve interpolating all training points perfectly
    </div>
    <div class="mt-3 text-[.72rem] text-gray-500 text-center">A high-degree polynomial that perfectly fits the training set can behave pathologically between samples.</div>
  </div>
  <div class="flex flex-col gap-4">
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-[.75rem] text-gray-700">
      <strong>Interpolation threshold</strong> — the model capacity at which training loss can reach zero.
    </div>
    <div class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-[.78rem] text-blue-800 font-medium leading-snug">
      Why don't overparameterized neural networks necessarily behave like pathological high-degree polynomials?
    </div>
  </div>
</div>

<!--
Opening question for Block 3. Reconnect to the overfitting intuition from Block 1 and set up the modern puzzle.
-->

---
section: beyond-interpolation
---

# The Classical Prediction Breaks Down

<div class="mt-5 flex flex-col gap-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Classical expectation</div>
    <ul class="text-[.78rem] leading-8 text-gray-700">
      <li>Increasing capacity reduces bias</li>
      <li>After some point, variance increases</li>
      <li>The test-error curve has a U-shape</li>
      <li>Beyond the apparent optimum, generalization deteriorates</li>
    </ul>
  </div>
  <div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-gray-300 text-[.68rem]">
    U-shaped test-error curve placeholder (classical regime only)
  </div>
</div>

<div class="mt-4 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-[.78rem] text-blue-800 text-center">
  But is this what we actually observe in modern deep learning?
</div>

<!--
Recap the classical story from Block 1 before overturning it.
End on an open question to motivate the next slide.
-->

---
section: beyond-interpolation
---

# Double Descent

<div class="grid grid-cols-[1.4fr_1fr] gap-8 mt-5 items-start">
  <div>
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Conceptual error curve</div>
    <div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-gray-300 text-[.68rem] leading-7">
      train error + test error vs. model capacity<br>
      mark interpolation threshold<br>
      test error rises near threshold, then falls again<br>
      (double descent curve placeholder)
    </div>
  </div>
  <div class="flex flex-col gap-4">
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-[.75rem] text-gray-700">Train error reaches zero at the interpolation threshold.</div>
    <div class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[.75rem] text-amber-800">Test error peaks near the threshold.</div>
    <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[.75rem] text-emerald-800">Then test error decreases again in the overparameterized regime.</div>
    <div class="mt-1 text-[.7rem] text-gray-500">The classical U-shaped curve can be incomplete.</div>
  </div>
</div>

<!--
Introduce double descent at a conceptual level. Do not explain why yet — that comes in the following slides.
Belkin et al. 2019 is the key reference to add later.
-->

---
section: beyond-interpolation
---

# Many Functions Can Fit the Training Data

<div class="mt-5 flex flex-col gap-5">
  <div class="text-[.78rem] text-gray-600 text-center">
    Once the model is large enough to interpolate, many different functions all achieve zero training loss.
  </div>
  <div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-gray-300 text-[.68rem] leading-7">
    placeholder: several very different curves, all passing exactly through the same training points
  </div>
  <div class="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-[.8rem] text-blue-900 text-center font-mono">
    { f ∈ ℋ : L<sub>train</sub>(f) = 0 }
  </div>
</div>

<div class="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-[.78rem] text-gray-700 text-center">
  If many functions fit the data perfectly, which one does learning select?
</div>

<!--
Shift the question from capacity to function selection. The set of interpolating solutions is large — what determines which one gradient descent finds?
-->

---
section: beyond-interpolation
---

# Parameter Space Is Not Function Space

<div class="grid grid-cols-2 gap-8 mt-6 items-start">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5 flex flex-col items-center gap-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500">Parameter space</div>
    <div class="text-[1rem] font-mono text-gray-700">θ ∈ ℝ<sup>P</sup></div>
    <div class="text-[.7rem] text-gray-400 text-center">Many distinct weight vectors</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5 flex flex-col items-center gap-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-700">Function space</div>
    <div class="text-[1rem] font-mono text-blue-800">f<sub>θ</sub>(x)</div>
    <div class="text-[.7rem] text-blue-700 text-center">The input–output mapping induced by θ</div>
  </div>
</div>

<div class="mt-5 text-[.78rem] text-gray-600 text-center">
  Many different θ may produce the same or very similar function. The mapping θ → f<sub>θ</sub> is not one-to-one.
</div>

<div class="mt-3 rounded-lg bg-gray-100 px-4 py-3 text-[.78rem] text-gray-700 text-center">
  A large parameter space does not imply that every function is equally likely.
</div>

<!--
Distinguish weight space from function space. This is the conceptual foundation for simplicity bias and inductive bias arguments.
-->

---
section: beyond-interpolation
---

# Overparameterization Does Not Mean Random Functions

<div class="mt-5 flex flex-col gap-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Intuition</div>
    <ul class="text-[.78rem] leading-8 text-gray-700">
      <li>An enormous parameter space maps very unevenly into function space</li>
      <li>Some functions correspond to many different parameter configurations</li>
      <li>Simple or structured functions may be easier to reach from typical initializations</li>
    </ul>
  </div>
  <div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-gray-300 text-[.68rem]">
    conceptual: many θ → one simple function vs. few θ → one complex function (placeholder)
  </div>
</div>

<div class="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-[.78rem] text-blue-800 text-center">
  More parameters increase what the model can represent, but do not imply uniform sampling over functions.
</div>

<!--
Simplicity bias — keep intuitive. The formal version involves measure theory and is not needed here.
-->

---
section: beyond-interpolation
---

# Inductive Bias Selects Among Interpolating Solutions

<div class="mt-5 flex flex-col gap-4">
  <div class="text-[.78rem] text-gray-600 text-center mb-2">
    The hypothesis space may be huge, but learning has preferences.
  </div>
  <div class="grid grid-cols-3 gap-4">
    <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-[.72rem] text-gray-700 text-center">
      <div class="font-semibold mb-1">Architecture</div>
      <div class="text-gray-400">convolutional, recurrent, equivariant</div>
    </div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-[.72rem] text-gray-700 text-center">
      <div class="font-semibold mb-1">Equivariances</div>
      <div class="text-gray-400">translation, rotation, scale</div>
    </div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-[.72rem] text-gray-700 text-center">
      <div class="font-semibold mb-1">Optimization</div>
      <div class="text-gray-400">SGD, Adam, learning rate schedule</div>
    </div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-[.72rem] text-gray-700 text-center">
      <div class="font-semibold mb-1">Initialization</div>
      <div class="text-gray-400">affects which minimum is found</div>
    </div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-[.72rem] text-gray-700 text-center">
      <div class="font-semibold mb-1">Regularization</div>
      <div class="text-gray-400">explicit and implicit</div>
    </div>
    <div class="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-[.7rem] text-gray-300 text-center">
      …
    </div>
  </div>
</div>

<!--
No single mechanism fully explains modern generalization — several interact.
This slide is deliberately non-committal to reflect genuine scientific uncertainty.
-->

---
section: beyond-interpolation
---

# Similarity and Smoothness in Learned Representations

<div class="grid grid-cols-2 gap-8 mt-5 items-start">
  <div>
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-3">What the network learns</div>
    <div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-gray-300 text-[.68rem] leading-7">
      input space → representation space placeholder<br>
      similar inputs cluster together
    </div>
  </div>
  <div class="flex flex-col gap-4">
    <ul class="text-[.78rem] leading-8 text-gray-700">
      <li>Inputs are mapped to a learned representation</li>
      <li>Nearby representations can lead to similar predictions</li>
      <li>The learned similarity structure shapes generalization</li>
    </ul>
    <div class="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-[.78rem] text-blue-800">
      Generalization depends not only on fitting the samples, but on the geometry of the learned representation.
    </div>
  </div>
</div>

<div class="mt-4 text-[.7rem] text-gray-400 text-center">
  This prepares the transition to location encodings and continuous spatial functions (Lecture 6).
</div>

<!--
Connect representation learning to generalization geometry. Sets up coordinate networks, location encodings, and the spatial interpolation framing of Lecture 6.
-->

---
section: beyond-interpolation
---

# Grokking: Fitting Comes Before Generalizing

<div class="grid grid-cols-[1.4fr_1fr] gap-8 mt-5 items-start">
  <div>
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Empirical observation</div>
    <div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-gray-300 text-[.68rem] leading-7">
      train accuracy vs. test accuracy over training steps placeholder —<br>train reaches ~100% early; test lags, then sharply improves much later
    </div>
  </div>
  <div class="flex flex-col gap-4">
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-[.75rem] text-gray-700">Training accuracy → near-perfect quickly</div>
    <div class="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[.75rem] text-amber-800">Test accuracy remains poor for much longer</div>
    <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[.75rem] text-emerald-800">Then test accuracy improves sharply</div>
  </div>
</div>

<div class="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-[.78rem] text-gray-700 text-center">
  Memorization and discovering a reusable rule are not the same event.
</div>

<!--
Keep compact. Power et al. 2022 (Grokking) is the reference to add later.
The takeaway is empirical: fitting and generalizing can decouple over training time.
-->

---
section: beyond-interpolation
---

# What Do We Actually Know?

<div class="mt-5 flex flex-col gap-4">
  <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[.78rem] text-amber-800 leading-snug">
    There is no single complete, universally accepted explanation for why highly overparameterized deep networks generalize so well.
  </div>
  <div class="text-[.72rem] font-bold uppercase tracking-wide text-gray-500 mt-1 mb-1">Current useful perspectives</div>
  <div class="grid grid-cols-3 gap-3">
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[.7rem] text-gray-700 text-center">Simplicity bias</div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[.7rem] text-gray-700 text-center">Architectural inductive bias</div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[.7rem] text-gray-700 text-center">Optimization bias</div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[.7rem] text-gray-700 text-center">Representation geometry</div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[.7rem] text-gray-700 text-center">Data scale</div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[.7rem] text-gray-700 text-center">Explicit &amp; implicit regularization</div>
  </div>
</div>

<div class="mt-4 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-[.78rem] text-blue-800 text-center font-medium">
  Modern generalization remains an active research topic.
</div>

<!--
Epistemic honesty slide. Do not claim a single clean answer — the field does not have one.
-->

---
section: beyond-interpolation
---

# From Generalization to Learned Spatial Functions

<div class="grid grid-cols-[1fr_1.2fr] gap-8 mt-5 items-start">
  <div class="flex flex-col gap-4">
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-1">Generic learned function</div>
      <div class="font-mono text-[.9rem] text-gray-700">f<sub>θ</sub>(x)</div>
    </div>
    <div class="text-[1.2rem] text-gray-300 text-center">↓</div>
    <div class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
      <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-700 mb-1">Location-dependent function</div>
      <div class="font-mono text-[.9rem] text-blue-800">f<sub>θ</sub>(location)</div>
    </div>
  </div>
  <div class="flex flex-col gap-3">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-1">Topics in Lecture 6</div>
    <ul class="text-[.75rem] leading-8 text-gray-700">
      <li>Location encodings</li>
      <li>Coordinate networks</li>
      <li>Interpolation between spatial observations</li>
      <li>Learned geospatial signals</li>
    </ul>
    <div class="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-[.78rem] text-blue-800">
      What function does a neural network learn between observed locations?
    </div>
  </div>
</div>

<!--
Final slide of Block 3. Transition from generalization theory to spatial/geospatial representation learning.
The move from f(x) to f(location) is the conceptual bridge to Lecture 6.
-->

<!-- ============================================================
     LEGACY SLIDES — retained from previous Lecture 5 draft
     Preserved unchanged for later reuse or reference.
     ============================================================ -->

---
layout: bonn-cover
subhead: Lecture 5 (legacy)
home: ../
---

# Deep Representation Learning II

## Learning beyond Memorization

<!--
Legacy cover — original Lecture 5 draft. Retained for reference.
-->

---

# In this lecture (legacy)

- Neural networks and learned representations
- Supervised training and optimization
- Learning useful intermediate features directly from data
- Convolutional neural networks
- Geospatial and remote-sensing examples

<!--
Keep this conceptual and practical; transformers are intentionally deferred to Lecture 7.
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: loss-surfaces-and-regularization
sectionTitle: Loss Surfaces and Regularization
---

# Loss Surfaces and Regularization

<div class="text-[.9rem] text-gray-700 mt-4">
Why the shape of the loss landscape matters, and how regularization keeps models from overfitting it.
</div>

---
layout: iframe
url: https://1drv.ms/p/c/8b5d216883cce16e/IQQNXkVvl-n0QJo9UPt7idSOAZrvayDlhdhwKcyHrndyLNU?em=2&wdAr=1.7777777777777777
---

---
section: models-and-representations
---

# Data and Experience

<figure class="bonn-section-image" style="display: flex; flex-direction: column; align-items: center; justify-self: center; width: calc(100% - 80px); max-height: 500px; margin: 0;">
  <img
    src="./assets/window.jpg"
    style="width: auto; height: 380px; max-height: 380px; object-fit: contain; opacity: 1;"
    alt="A sunlit window overlooking a city with cushions on the window seat"
  />
  <figcaption style="max-width: 440px; margin-top: 10px; color: var(--bonn-text); font-size: .68rem; line-height: 1.3; text-align: center;">
    Data is the window through which a learner experiences the world.
    <span style="display: block; margin-top: 4px; color: var(--bonn-muted); font-size: .48rem;">
      Shalev-Shwartz, S., &amp; Ben-David, S. (2014). <em>Understanding Machine Learning: From Theory to Algorithms</em>.
    </span>
  </figcaption>
</figure>

<div class="bonn-section-citation">
  Photo by <a href="https://www.pexels.com/@d-ng-nhan-324384/" target="_blank" rel="noopener noreferrer">Dương Nhân</a> on <a href="https://www.pexels.com/photo/a-pillows-on-the-couch-near-the-glass-window-with-a-city-view-4389953/" target="_blank" rel="noopener noreferrer">Pexels</a>
</div>

---
section: models-and-representations
---

# Data as blocks of numbers - E.g., Tensors

<img
  src="./assets/tensors.svg"
  class="w-full h-[360px] object-contain"
  alt="Scalars, vectors, matrices, images, and image time series represented as tensors with zero to four dimensions"
/>

---
section: models-and-representations
---

# Data samples from a distribution
