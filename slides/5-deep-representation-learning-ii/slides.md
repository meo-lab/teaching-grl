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

# Block 1 — Coming Soon

<div class="text-[.85rem] text-gray-500 mt-6">
  Placeholder — content will be developed here.
</div>

<div class="mt-8 text-[.75rem] text-gray-400 leading-7">
  Planned topics:
  <ul class="mt-2">
    <li>Finite datasets as samples from an underlying distribution</li>
    <li>Training loss vs. population / expected loss</li>
    <li>Train / validation / test splits</li>
    <li>Generalization gap</li>
    <li>Model capacity, underfitting, overfitting</li>
    <li>Bias–variance trade-off</li>
    <li>Classical regularization</li>
  </ul>
</div>

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
