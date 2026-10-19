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
subhead: Lecture 6
home: ../
---

# Geospatial Embeddings

## Explicit and Implicit Representations of Geographic Space

<!--
This is the final taught lecture. It builds on Lectures 3–5 (data, deep learning, generalization) and asks:
how can we learn representations that transfer beyond one supervised task?
Two answers: explicit embeddings from observations (Block 1) and implicit embeddings from location (Block 2).
-->

---

# Learning Outcomes

<div class="mt-5 flex flex-col gap-4">
  <div class="flex gap-4 items-start">
    <div class="text-[.7rem] font-bold text-blue-700 w-5 shrink-0 mt-0.5">1</div>
    <div class="text-[.82rem] leading-snug">Explain how <strong>self-supervised learning</strong> can produce reusable geospatial representations without task-specific labels.</div>
  </div>
  <div class="flex gap-4 items-start">
    <div class="text-[.7rem] font-bold text-blue-700 w-5 shrink-0 mt-0.5">2</div>
    <div class="text-[.82rem] leading-snug">Explain how <strong>geospatial foundation models</strong> produce explicit embeddings from observations such as images or time series.</div>
  </div>
  <div class="flex gap-4 items-start">
    <div class="text-[.7rem] font-bold text-blue-700 w-5 shrink-0 mt-0.5">3</div>
    <div class="text-[.82rem] leading-snug">Explain how <strong>geographic location itself</strong> can be mapped to an implicit embedding through coordinate-based neural models and location encoders.</div>
  </div>
</div>

<!--
Outcome 1 → Block 1 (SSL mechanics)
Outcome 2 → Block 1 (foundation models / explicit embeddings)
Outcome 3 → Block 2 (coordinate networks, INRs, location encoders)
-->

---
section: opening
---

# Where We Are in the Course

<div class="grid grid-cols-5 gap-3 mt-6">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3">
    <div class="text-[.58rem] font-bold uppercase tracking-wide text-gray-500 mb-1">Lectures 2–3</div>
    <div class="text-[.72rem] font-semibold text-gray-800">Geospatial Data</div>
    <div class="text-[.62rem] text-gray-500 mt-1">Images, maps, time series</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3">
    <div class="text-[.58rem] font-bold uppercase tracking-wide text-gray-500 mb-1">Lecture 3</div>
    <div class="text-[.72rem] font-semibold text-gray-800">Classical ML</div>
    <div class="text-[.62rem] text-gray-500 mt-1">ML on representations</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3">
    <div class="text-[.58rem] font-bold uppercase tracking-wide text-gray-500 mb-1">Lecture 4</div>
    <div class="text-[.72rem] font-semibold text-gray-800">Deep Learning</div>
    <div class="text-[.62rem] text-gray-500 mt-1">Models &amp; optimization</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3">
    <div class="text-[.58rem] font-bold uppercase tracking-wide text-gray-500 mb-1">Lecture 5</div>
    <div class="text-[.72rem] font-semibold text-gray-800">Generalization</div>
    <div class="text-[.62rem] text-gray-500 mt-1">Beyond the training set</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-3">
    <div class="text-[.58rem] font-bold uppercase tracking-wide text-blue-600 mb-1">Lecture 6 — today</div>
    <div class="text-[.72rem] font-semibold text-blue-900">Reusable Embeddings</div>
    <div class="text-[.62rem] text-blue-700 mt-1">Explicit &amp; implicit</div>
  </div>
</div>

<div class="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-5 py-3 text-[.82rem] text-blue-900 font-medium">
  Main question: How can we learn representations that are useful beyond one specific supervised task?
</div>

---
section: opening
---

# Two Ways to Obtain a Geospatial Embedding

<div class="grid grid-cols-2 gap-6 mt-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-4">Explicit Embedding</div>
    <div class="flex items-center gap-3 font-mono text-[.78rem] mb-4">
      <span class="rounded border border-gray-300 bg-white px-2 py-1">$x_{\text{observation}}$</span>
      <span class="text-gray-400">→</span>
      <span class="rounded border border-gray-300 bg-white px-2 py-1">$e_\theta(x)$</span>
      <span class="text-gray-400">→</span>
      <span class="rounded border border-blue-300 bg-blue-50 px-2 py-1">$z$</span>
    </div>
    <ul class="text-[.7rem] text-gray-600 space-y-1 list-disc pl-4 mb-3">
      <li>satellite image</li>
      <li>time series</li>
      <li>multimodal observation</li>
    </ul>
    <div class="text-[.72rem] text-gray-700 font-medium">The representation is computed from an observation.</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-4">Implicit Embedding</div>
    <div class="flex items-center gap-3 font-mono text-[.78rem] mb-4">
      <span class="rounded border border-blue-300 bg-white px-2 py-1">$p_{\text{location}}$</span>
      <span class="text-blue-400">→</span>
      <span class="rounded border border-blue-300 bg-white px-2 py-1">$e_\theta(p)$</span>
      <span class="text-blue-400">→</span>
      <span class="rounded border border-blue-400 bg-blue-100 px-2 py-1">$z$</span>
    </div>
    <ul class="text-[.7rem] text-blue-700 space-y-1 list-disc pl-4 mb-3">
      <li>geographic coordinates only</li>
    </ul>
    <div class="text-[.72rem] text-blue-900 font-medium">The representation is computed directly from geographic location.</div>
  </div>
</div>

<div class="mt-4 text-[.72rem] text-gray-500 text-center">This distinction structures the entire lecture.</div>

---
layout: bonn-section
sectionColor: "#00457c"
section: explicit-embeddings
sectionTitle: Explicit Geospatial Embeddings
---

# Explicit Geospatial Embeddings

<div class="text-[.9rem] text-gray-700 mt-4">
  From Self-Supervised Learning to Foundation Models
</div>

<div class="text-[.72rem] text-gray-500 mt-4">
  labels → self-supervision → representation learning → embeddings → pretrained encoders → foundation models
</div>

---
section: explicit-embeddings
---

# The Limitation of Supervised Learning

<div class="grid grid-cols-2 gap-6 mt-5">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      Supervised learning requires labeled data — but labels are:
    </div>
    <ul class="text-[.75rem] text-gray-600 space-y-2 list-disc pl-4 mb-5">
      <li><strong>Expensive</strong> — manual annotation is slow and costly</li>
      <li><strong>Task-specific</strong> — a land-cover label is useless for species prediction</li>
      <li><strong>Specializing</strong> — supervised representations may only encode what was asked</li>
    </ul>
    <div class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[.78rem] text-blue-900">
      Can we learn useful representations from the data itself?
    </div>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-6">
    <!-- TODO: add schematic: supervised pipeline (observation → label → model) vs. unlabeled data -->
    <div class="text-[.68rem] text-gray-400 text-center">[ supervised pipeline vs. unlabeled data ]</div>
  </div>
</div>

---
section: explicit-embeddings
---

# Self-Supervised Learning

<div class="mt-4 text-[.82rem] text-gray-700 mb-5">
  Create a learning signal from the <strong>structure of the data</strong> rather than from manually annotated labels.
</div>

<div class="flex items-center justify-center gap-5 my-6">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-[.8rem]">$x$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[.8rem]">self-supervised objective</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-[.8rem]">$e_\theta(x)$</div>
</div>

<div class="text-[.75rem] text-gray-600">
  The objective is constructed entirely from data — no human annotation needed. The network must learn meaningful internal structure to solve it.
</div>

---
section: explicit-embeddings
---

# Pretext Tasks

<div class="mt-4 text-[.82rem] text-gray-700 mb-5">
  A pretext task is designed so that solving it forces the model to learn useful internal representations.
</div>

<div class="grid grid-cols-2 gap-4 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Predict missing content</div>
    <div class="text-[.72rem] text-gray-600">Mask part of the input, predict the masked part</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Predict transformations</div>
    <div class="text-[.72rem] text-gray-600">Predict rotation, colorization, jigsaw order</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Predict context</div>
    <div class="text-[.72rem] text-gray-600">Predict spatial or temporal neighbours</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Distinguish pairs</div>
    <div class="text-[.72rem] text-gray-600">Distinguish related from unrelated samples</div>
  </div>
</div>

<div class="mt-5 text-[.74rem] text-gray-500">
  The pretext task is discarded after training — only the learned encoder is kept.
</div>

---
section: explicit-embeddings
---

# Contrastive Learning

<div class="grid grid-cols-2 gap-6 mt-5">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      Pull <strong>positive pairs</strong> together in embedding space; push <strong>negative pairs</strong> apart.
    </div>
    <div class="flex flex-col gap-3 mt-4">
      <div class="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[.74rem] text-green-900">
        <strong>Positive pair:</strong> two views of the same instance
      </div>
      <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[.74rem] text-red-900">
        <strong>Negative pair:</strong> views from different instances
      </div>
    </div>
    <div class="mt-4 text-[.74rem] text-gray-600">
      Similar observations → nearby embeddings; different observations → separated embeddings.
    </div>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-6">
    <!-- TODO: add embedding-space illustration (clusters of similar, gaps between different) -->
    <div class="text-[.68rem] text-gray-400 text-center">[ contrastive embedding space illustration ]</div>
  </div>
</div>

---
section: explicit-embeddings
---

# Learning Invariances

<div class="mt-4 text-[.82rem] text-gray-700 mb-4">
  The augmentations and positive-pair definition determine what the embedding should <strong>ignore</strong> and what it should <strong>preserve</strong>.
</div>

<div class="grid grid-cols-2 gap-5 mt-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Generic augmentations</div>
    <ul class="text-[.72rem] text-gray-600 space-y-1 list-disc pl-4">
      <li>crop</li>
      <li>color / spectral changes</li>
      <li>rotation / flip</li>
    </ul>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Geospatial-specific</div>
    <ul class="text-[.72rem] text-blue-800 space-y-1 list-disc pl-4">
      <li>temporal changes</li>
      <li>sensor differences</li>
      <li>seasonal variation</li>
      <li>viewing angle</li>
    </ul>
  </div>
</div>

<div class="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[.78rem] text-blue-900">
  Choosing the right positive-pair definition is a core design decision in SSL for Earth observation.
</div>

---
section: explicit-embeddings
---

# Masked Prediction

<div class="mt-4 text-[.82rem] text-gray-700 mb-5">
  A second major self-supervised paradigm: mask part of the input, predict the missing content.
</div>

<div class="flex items-center justify-center gap-5 my-6">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.8rem]">visible context</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[.8rem]">predict missing information</div>
</div>

<div class="grid grid-cols-3 gap-4 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-1">Images</div>
    <div class="text-[.68rem] text-gray-500">masked image patches</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-1">Tokens</div>
    <div class="text-[.68rem] text-gray-500">masked feature tokens</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-1">Time series</div>
    <div class="text-[.68rem] text-gray-500">masked temporal observations</div>
  </div>
</div>

---
section: explicit-embeddings
---

# Self-Supervision for Earth Observation

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      Earth observation provides natural structure for self-supervised objectives:
    </div>
    <ul class="text-[.75rem] text-gray-600 space-y-2 list-disc pl-4">
      <li>Multispectral observations across bands</li>
      <li>Spatial context — neighbouring patches</li>
      <li>Temporal observations — same place, different times</li>
      <li>Multiple sensors observing the same area</li>
      <li>Repeated coverage of the same location</li>
    </ul>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-6">
    <!-- TODO: add illustration: same location, different time/sensor = positive pair -->
    <div class="text-[.68rem] text-gray-400 text-center">[ same location, different observation → positive pair ]</div>
  </div>
</div>

<div class="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[.78rem] text-blue-900">
  Main question: What should count as two views of the same place?
</div>

---
section: explicit-embeddings
---

# From Encoder to Embedding

<div class="mt-4 text-[.82rem] text-gray-700 mb-5">
  After pretraining, the encoder maps any new observation to a reusable feature vector.
</div>

<div class="flex items-center justify-center gap-5 my-6 font-mono text-[.85rem]">
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">$x$</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">$e_\theta(x)$</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-blue-400 bg-blue-100 px-4 py-3">$z$</span>
</div>

<div class="grid grid-cols-2 gap-4 mt-4 text-[.74rem]">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <strong>$e_\theta$:</strong> the encoder, fixed after pretraining
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <strong>$z$:</strong> the embedding — a compact learned representation
  </div>
</div>

---
section: explicit-embeddings
---

# What Makes an Embedding Useful?

<div class="grid grid-cols-3 gap-4 mt-6">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Semantic similarity</div>
    <div class="text-[.68rem] text-gray-500">Similar scenes → similar $z$</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Invariance</div>
    <div class="text-[.68rem] text-gray-500">Robust to irrelevant variation</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Transferability</div>
    <div class="text-[.68rem] text-gray-500">Useful across downstream tasks</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Compactness</div>
    <div class="text-[.68rem] text-gray-500">High information density</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Linear separability</div>
    <div class="text-[.68rem] text-gray-500">Simple probes work</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Multi-task utility</div>
    <div class="text-[.68rem] text-gray-500">Useful for many downstream tasks</div>
  </div>
</div>

---
section: explicit-embeddings
---

# Exploring an Embedding Space

<div class="mt-4 text-[.82rem] text-gray-700 mb-5">
  Once computed, embedding spaces can be visualized, probed, and queried.
</div>

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="flex flex-col gap-3">
    <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.74rem]">Nearby observations share visual or semantic properties</div>
    <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.74rem]">Clusters correspond to semantic categories</div>
    <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.74rem]">Trajectories trace temporal change</div>
    <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.74rem]">Nearest-neighbour retrieval finds similar observations</div>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-6">
    <!-- TODO: add PCA / UMAP / retrieval example from a geospatial SSL model -->
    <div class="text-[.68rem] text-gray-400 text-center">[ PCA / UMAP of geospatial embeddings ]</div>
  </div>
</div>

---
section: explicit-embeddings
---

# From Pretraining to Transfer

<div class="flex items-center gap-4 font-mono text-[.78rem] mt-6 mb-6 flex-wrap">
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">large unlabeled dataset</span>
  <span class="text-gray-400">→</span>
  <span class="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">pretraining</span>
  <span class="text-gray-400">→</span>
  <span class="rounded-xl border border-blue-300 bg-blue-100 px-3 py-2 font-semibold">$e_\theta$</span>
  <span class="text-gray-400">→</span>
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">many downstream tasks</span>
</div>

<div class="grid grid-cols-3 gap-3">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-center text-[.7rem]">Classification</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-center text-[.7rem]">Regression</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-center text-[.7rem]">Retrieval</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-center text-[.7rem]">Segmentation</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-center text-[.7rem]">Change detection</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-center text-[.7rem]">Clustering</div>
</div>

---
section: explicit-embeddings
---

# Scaling Up Representation Learning

<div class="flex flex-col gap-4 mt-8">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 flex items-center gap-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 w-32 shrink-0">Small encoder</div>
    <div class="text-[.74rem] text-gray-600">Pretrained on a limited dataset; transferable within domain</div>
  </div>
  <div class="text-gray-300 text-center text-sm">↓ more data, larger model, broader objective</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 flex items-center gap-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 w-32 shrink-0">Large encoder</div>
    <div class="text-[.74rem] text-gray-600">Pretrained on many scenes and sensors; transfers broadly</div>
  </div>
  <div class="text-gray-300 text-center text-sm">↓ more data, larger model, broader objective</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 flex items-center gap-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 w-32 shrink-0">Foundation model</div>
    <div class="text-[.74rem] text-blue-800">Large pretrained model intended as a general-purpose geospatial encoder</div>
  </div>
</div>

---
section: explicit-embeddings
---

# Geospatial Foundation Models

<div class="mt-5 text-[.82rem] text-gray-700 mb-5">
  Large pretrained models intended to provide reusable representations across datasets, regions, sensors, or tasks.
</div>

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="flex flex-col gap-3">
    <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.74rem]">Pretrained on large-scale satellite or aerial data</div>
    <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.74rem]">Encoder output used directly as a feature</div>
    <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.74rem]">Fine-tuned on small labeled datasets for downstream tasks</div>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-6">
    <!-- TODO: insert selected model examples (SatMAE, Scale-MAE, Prithvi, GFM, etc.) -->
    <div class="text-[.68rem] text-gray-400 text-center">[ selected geospatial foundation model examples ]</div>
  </div>
</div>

---
section: explicit-embeddings
---

# What Does a Foundation Model Embedding Encode?

<div class="mt-4 text-[.82rem] text-gray-700 mb-5">
  The embedding $z$ may contain much more information than the downstream task explicitly requests.
</div>

<div class="grid grid-cols-3 gap-3 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Land cover</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Scene structure</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Season</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Climate zone</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Geographic context</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Sensor characteristics</div>
</div>

<div class="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[.78rem] text-blue-900">
  The representation may carry much more than the downstream task needs — or may omit what it needs.
</div>

---
section: explicit-embeddings
---

# Explicit Geospatial Embeddings

<div class="flex items-center justify-center gap-5 my-8 font-mono text-[.85rem]">
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">$x_{\text{observation}}$</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">$e_\theta(x)$</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-blue-400 bg-blue-100 px-4 py-3">$z$</span>
</div>

<div class="grid grid-cols-2 gap-4 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-[.7rem]"><strong>Image embedding:</strong> one satellite patch → one vector</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-[.7rem]"><strong>Patch embedding:</strong> sub-image patch → local descriptor</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-[.7rem]"><strong>Temporal embedding:</strong> time series → sequence representation</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-[.7rem]"><strong>Multimodal embedding:</strong> multiple sensors → joint representation</div>
</div>

<div class="mt-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[.78rem] text-amber-900">
  The observation must be available when the embedding is computed.
</div>

---
section: explicit-embeddings
---

# Using Explicit Embeddings

<div class="grid grid-cols-3 gap-4 mt-6">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Classification</div>
    <div class="text-[.68rem] text-gray-500">assign a category to each embedding</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Clustering</div>
    <div class="text-[.68rem] text-gray-500">group similar scenes without labels</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Retrieval</div>
    <div class="text-[.68rem] text-gray-500">find similar scenes in large archives</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Regression</div>
    <div class="text-[.68rem] text-gray-500">estimate continuous quantities</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Change analysis</div>
    <div class="text-[.68rem] text-gray-500">compare embeddings across time</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Diversity analysis</div>
    <div class="text-[.68rem] text-gray-500">measure coverage and variety</div>
  </div>
</div>

---
section: explicit-embeddings
---

# Block 1 Takeaway

<div class="mt-8 flex items-center justify-center mb-8">
  <div class="rounded-xl border-2 border-blue-300 bg-blue-50 px-8 py-5 text-blue-900">

$$\boxed{x_{\text{observation}} \rightarrow e_\theta(x) \rightarrow z}$$

  </div>
</div>

<div class="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-[.82rem] text-blue-900">
  <strong>Explicit geospatial embeddings</strong> summarize observed data into reusable learned representations. Self-supervised pretraining removes the need for labels; scaling up yields geospatial foundation models.
</div>

---
layout: bonn-section
sectionColor: "#00457c"
section: implicit-embeddings
sectionTitle: Implicit Geospatial Embeddings
---

# Implicit Geospatial Embeddings

<div class="text-[.9rem] text-gray-700 mt-4">
  From Location Encoders to Generic Representations of Geographic Space
</div>

<div class="text-[.72rem] text-gray-500 mt-4">
  location → continuous functions → coordinate networks → location encoders → implicit embeddings
</div>

---
section: implicit-embeddings
---

# Must an Embedding Start From an Observation?

<div class="grid grid-cols-2 gap-6 mt-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Observation-based</div>
    <div class="flex items-center gap-3 font-mono text-[.8rem] mb-3">
      <span>$x_{\text{image}}$</span>
      <span class="text-gray-400">→</span>
      <span>$z$</span>
    </div>
    <div class="text-[.72rem] text-gray-600">Requires an image or observation at query time.</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Location-based</div>
    <div class="flex items-center gap-3 font-mono text-[.8rem] mb-3">
      <span>$p_{\text{location}}$</span>
      <span class="text-blue-400">→</span>
      <span>$z$</span>
    </div>
    <div class="text-[.72rem] text-blue-800">Requires only geographic coordinates.</div>
  </div>
</div>

<div class="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-5 py-3 text-[.78rem] text-blue-900">
  Can we learn a representation of a place without observing an image at query time?
</div>

---
section: implicit-embeddings
---

# Discrete or Continuous Geographic Information?

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Discrete</div>
    <ul class="text-[.72rem] text-gray-600 space-y-1 list-disc pl-4 mb-3">
      <li>raster cells</li>
      <li>vector geometries</li>
      <li>point observations</li>
    </ul>
    <div class="text-[.68rem] text-gray-400">Store values at explicit spatial supports</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Continuous</div>
    <div class="font-mono text-[.78rem] bg-white border border-blue-100 rounded px-3 py-2 mb-3">
      $f : \mathcal{X} \rightarrow \mathcal{Y}$
    </div>
    <div class="text-[.72rem] text-blue-800">A continuous model stores parameters of a function instead of explicitly storing every spatial sample.</div>
  </div>
</div>

---
section: implicit-embeddings
---

# Functional Models of the Earth

<div class="mt-4 text-[.82rem] text-gray-700 mb-4">
  Large-scale Earth fields have long been represented as continuous functions — not stored pixel by pixel.
</div>

<div class="grid grid-cols-3 gap-4 mt-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Gravity</div>
    <div class="text-[.68rem] text-gray-500">EGM2008: degree 2190 spherical harmonic model</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Magnetic field</div>
    <div class="text-[.68rem] text-gray-500">IGRF: global spherical harmonic coefficients</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Geoid</div>
    <div class="text-[.68rem] text-gray-500">Physical sea-level surface as a functional model</div>
  </div>
</div>

<div class="mt-5 text-[.74rem] text-gray-600">
  The field is stored through <em>coefficients of a continuous function</em>, evaluated wherever needed.
</div>

---
section: implicit-embeddings
---

# Basis Functions

<div class="mt-4 text-[.82rem] text-gray-700 mb-4">
  A general functional model represents a field as a linear combination of basis functions:
</div>

<div class="flex items-center justify-center my-5">
  <div class="font-mono text-[.85rem] bg-gray-50 border border-gray-200 rounded px-6 py-4">
    $$f(x) = \sum_k a_k \, \phi_k(x)$$
  </div>
</div>

<div class="grid grid-cols-2 gap-4 mt-4 text-[.74rem]">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <strong>$\phi_k(x)$:</strong> basis functions — predefined shapes that span the function space
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <strong>$a_k$:</strong> coefficients — the learned or fitted parameters. The coefficients <em>are</em> the representation.
  </div>
</div>

---
section: implicit-embeddings
---

# Fourier Features

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      Sine and cosine are the simplest basis functions on a periodic domain:
    </div>
    <div class="font-mono text-[.78rem] bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-4">
      $\phi_k(x) = \sin(kx),\;\cos(kx)$
    </div>
    <div class="flex flex-col gap-2 mt-4">
      <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[.72rem]">
        <strong>Low $k$</strong> — broad spatial variation
      </div>
      <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[.72rem]">
        <strong>High $k$</strong> — fine spatial detail
      </div>
    </div>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add sinusoidal basis functions at several frequencies -->
    <div class="text-[.68rem] text-gray-400 text-center">[ sinusoidal basis functions at $k = 1, 2, 3, \ldots$ ]</div>
  </div>
</div>

<div class="mt-4 text-[.7rem] text-blue-700">
  → Connects directly to positional encoding in neural networks.
</div>

---
section: implicit-embeddings
---

# From Fourier Modes to Spherical Harmonics

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      Fourier functions work on periodic or Euclidean domains. The Earth is a sphere.
    </div>
    <div class="font-mono text-[.8rem] bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-4 text-center">
      $\sin, \cos \;\xrightarrow{\text{sphere}}\; Y_{\ell m}(\theta, \lambda)$
    </div>
    <div class="text-[.74rem] text-gray-600">
      Spherical harmonics are the natural generalization of sinusoidal basis functions to $S^2$.
    </div>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add circle → sphere transition figure -->
    <div class="text-[.68rem] text-gray-400 text-center">[ circle → sphere transition ]</div>
  </div>
</div>

<div class="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[.78rem] text-blue-900">
  The geometry of the domain matters.
</div>

---
section: implicit-embeddings
---

# Geometry-Aware Basis Functions

<div class="grid grid-cols-3 gap-4 mt-6">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Line / Periodic</div>
    <div class="font-mono text-[.75rem] bg-white border border-gray-200 rounded px-2 py-1 mb-2">$\sin(kx),\,\cos(kx)$</div>
    <div class="text-[.68rem] text-gray-500">Fourier modes</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-2">Sphere $S^2$</div>
    <div class="font-mono text-[.75rem] bg-white border border-blue-100 rounded px-2 py-1 mb-2">$Y_{\ell m}(\theta,\lambda)$</div>
    <div class="text-[.68rem] text-blue-700">Spherical harmonics</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">General domain</div>
    <div class="font-mono text-[.75rem] bg-white border border-gray-200 rounded px-2 py-1 mb-2">$\Delta\phi_k = \lambda_k\phi_k$</div>
    <div class="text-[.68rem] text-gray-500">Laplacian eigenfunctions</div>
  </div>
</div>

<div class="mt-5 text-[.75rem] text-gray-600 text-center">
  Each domain determines its own natural frequency basis through the geometry.
</div>

---
section: implicit-embeddings
---

# Neural Networks for Continuous Signal Modeling

<div class="mt-4 text-[.82rem] text-gray-700 mb-5">
  Instead of fixed basis functions, a neural network can parameterize the continuous function directly.
</div>

<div class="flex items-center justify-center gap-5 my-6 font-mono text-[.85rem]">
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">$p$</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">$f_\theta(p)$</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">$y$</span>
</div>

<div class="text-[.75rem] text-gray-600 text-center">
  The network parameters $\theta$ <em>are</em> the representation of the continuous function.
</div>

---
section: implicit-embeddings
---

# Coordinate Networks

<div class="mt-4 text-[.82rem] text-gray-700 mb-5">
  The simplest formulation: the input is the coordinate; the output is the signal at that coordinate.
</div>

<div class="flex items-center justify-center gap-5 my-6 font-mono text-[.85rem]">
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">$\mathbf{x}$</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">$f_\theta(\mathbf{x})$</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">$\mathbf{y}$</span>
</div>

<div class="grid grid-cols-2 gap-4 mt-3 text-[.74rem]">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <strong>Input:</strong> spatial coordinate
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <strong>Output:</strong> signal value at that coordinate
  </div>
</div>

---
section: implicit-embeddings
---

# An Image as a Function

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Discrete: pixel grid</div>
    <div class="text-center rounded bg-gray-100 px-4 py-6 text-[.68rem] text-gray-400">[ pixel grid ]</div>
    <div class="text-[.72rem] text-gray-600 mt-2">Store $H \times W \times 3$ values explicitly</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Continuous: neural function</div>
    <div class="font-mono text-[.8rem] bg-white border border-blue-100 rounded px-4 py-3 mb-2 text-center">
      $f_\theta(x, y) \rightarrow \mathrm{RGB}$
    </div>
    <div class="text-[.72rem] text-blue-800 mt-2">Store network weights; evaluate at any $(x,y)$</div>
  </div>
</div>

---
section: implicit-embeddings
---

# Positional Encoding

<div class="mt-4 text-[.82rem] text-gray-700 mb-4">
  Map coordinates to sinusoidal features before the MLP to represent fine spatial variation more easily.
</div>

<div class="flex items-center justify-center gap-4 my-6 font-mono text-[.8rem]">
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">$p$</span>
  <span class="text-gray-400">→</span>
  <span class="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">$\gamma(p)$</span>
  <span class="text-gray-400">→</span>
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">MLP</span>
  <span class="text-gray-400">→</span>
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">$y$</span>
</div>

<div class="text-[.74rem] text-gray-600">
  The encoding $\gamma(p) = [\sin(2\pi B p),\;\cos(2\pi B p)]$ injects multiple frequencies explicitly. The MLP only needs to combine them.
</div>

---
section: implicit-embeddings
---

# SIREN

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Fourier features</div>
    <div class="font-mono text-[.75rem] bg-white border border-gray-200 rounded px-3 py-2 mb-2">$p \rightarrow \gamma(p) \rightarrow \mathrm{MLP}$</div>
    <div class="text-[.72rem] text-gray-600">Sinusoids <em>before</em> the network</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">SIREN</div>
    <div class="font-mono text-[.75rem] bg-white border border-blue-100 rounded px-3 py-2 mb-2">$\sigma(x) = \sin(\omega_0 x)$</div>
    <div class="text-[.72rem] text-blue-800">Sinusoidal activations <em>inside</em> the network</div>
  </div>
</div>

<div class="mt-5 text-[.74rem] text-gray-500">
  Both address spectral bias; SIREN propagates sinusoidal structure through all layers.
</div>

<!-- TODO: cite Sitzmann et al. 2020 (SIREN) -->

---
section: implicit-embeddings
---

# Neural Fields Beyond Geography

<div class="mt-4 text-[.82rem] text-gray-700 mb-5">
  Coordinate-based neural functions appear across many domains — not only geospatial.
</div>

<div class="grid grid-cols-2 gap-4 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-[.72rem]"><strong>Images:</strong> $(x,y) \rightarrow$ RGB</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-[.72rem]"><strong>Signed-distance functions:</strong> $\mathbf{x} \rightarrow$ SDF (3D shape)</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-[.72rem]"><strong>Occupancy:</strong> $\mathbf{x} \rightarrow$ occupied / free</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-[.72rem]"><strong>Radiance fields (NeRF):</strong> $(\mathbf{x},\mathbf{d}) \rightarrow$ colour + density</div>
</div>

<div class="mt-5 text-[.72rem] text-gray-500">
  The same pattern — coordinate in, signal out — recurs across domains.
</div>

---
section: implicit-embeddings
---

# NeRF as an Example

<div class="flex items-center justify-center gap-5 my-8 font-mono text-[.85rem]">
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">$(\mathbf{x},\mathbf{d})$</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">$f_\theta$</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">$(\sigma, \mathbf{c})$</span>
</div>

<div class="grid grid-cols-2 gap-4 mt-4 text-[.74rem]">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <strong>$\mathbf{x}$:</strong> 3D position; <strong>$\mathbf{d}$:</strong> view direction
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <strong>$\sigma$:</strong> density; <strong>$\mathbf{c}$:</strong> colour
  </div>
</div>

<div class="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[.78rem] text-blue-900">
  Complex signals can be represented as continuous neural functions over coordinates.
</div>

---
section: implicit-embeddings
---

# Bring the Coordinate Network Back to Earth

<div class="mt-4 text-[.82rem] text-gray-700 mb-5">
  Using coordinate networks for geographic space introduces domain-specific challenges.
</div>

<div class="grid grid-cols-2 gap-4 mt-4">
  <div class="rounded-xl border border-amber-100 bg-amber-50 p-4 text-[.72rem] text-amber-900">
    <strong>Longitude discontinuity:</strong> $-180°$ and $+180°$ are the same location
  </div>
  <div class="rounded-xl border border-amber-100 bg-amber-50 p-4 text-[.72rem] text-amber-900">
    <strong>Poles:</strong> longitude becomes degenerate at $\pm 90°$ latitude
  </div>
  <div class="rounded-xl border border-amber-100 bg-amber-50 p-4 text-[.72rem] text-amber-900">
    <strong>Spherical geometry:</strong> Euclidean distances are not geographic distances
  </div>
  <div class="rounded-xl border border-amber-100 bg-amber-50 p-4 text-[.72rem] text-amber-900">
    <strong>Global scale:</strong> fine local and broad global structure must coexist
  </div>
</div>

---
section: implicit-embeddings
---

# Geographic Coordinate Encodings

<div class="mt-4 text-[.78rem] text-gray-700 mb-4">
  How we encode the location input matters.
</div>

<div class="flex flex-col gap-3 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.72rem]"><strong>Raw $(\phi, \lambda)$:</strong> discontinuity at $\pm 180°$; poles degenerate</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.72rem]"><strong>3D Cartesian $(x,y,z)$:</strong> continuous on the sphere; no discontinuity</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.72rem]"><strong>Fourier features:</strong> $[\sin(k\phi),\cos(k\phi),\ldots]$ — injects frequency</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.72rem]"><strong>Spherical harmonics:</strong> geometry-aware, no discontinuity</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[.72rem] text-blue-900"><strong>Geometry-aware spectral:</strong> designed for the sphere from the start</div>
</div>

---
section: implicit-embeddings
---

# Spherical Harmonics + Neural Network

<div class="flex items-center justify-center gap-4 my-8 font-mono text-[.8rem]">
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">$p$</span>
  <span class="text-gray-400">→</span>
  <span class="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">$Y_{\ell m}(p)$</span>
  <span class="text-gray-400">→</span>
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">MLP</span>
  <span class="text-gray-400">→</span>
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">$y(p)$</span>
</div>

<div class="text-[.78rem] text-gray-700 mb-3">
  The classical spherical harmonic basis becomes an input representation for a neural model.
</div>
<div class="text-[.74rem] text-gray-500">
  The MLP learns nonlinear combinations of spherical harmonic features — more expressive than a purely linear model.
</div>

---
section: implicit-embeddings
---

# Spherical Harmonics + SIREN

<div class="flex items-center justify-center gap-4 my-8 font-mono text-[.8rem]">
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">$p$</span>
  <span class="text-gray-400">→</span>
  <span class="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">$Y_{\ell m}(p)$</span>
  <span class="text-gray-400">→</span>
  <span class="rounded-xl border border-blue-300 bg-blue-100 px-3 py-2">$\mathrm{SIREN}_\theta$</span>
  <span class="text-gray-400">→</span>
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">$y(p)$</span>
</div>

<div class="grid grid-cols-2 gap-4 mt-3 text-[.72rem]">
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
    <strong>Spherical harmonics →</strong> geometry-aware input encoding
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
    <strong>SIREN →</strong> nonlinear high-frequency modeling
  </div>
</div>

<!-- TODO: add citation for SH+SIREN paper from paper-analysis deck (Session 2) -->

---
section: implicit-embeddings
---

# Residual and Multi-Network Variants

<div class="mt-5 grid grid-cols-2 gap-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Residual SIREN</div>
    <div class="text-[.7rem] text-gray-600">Skip connections through sinusoidal layers; better gradient flow</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Multiple local MLPs</div>
    <div class="text-[.7rem] text-gray-600">Different networks for different spatial regions</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Hierarchical models</div>
    <div class="text-[.7rem] text-gray-600">Coarse-to-fine scale decomposition</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Mixture approaches</div>
    <div class="text-[.7rem] text-gray-600">Soft partition of space into locally specialized experts</div>
  </div>
</div>

---
section: implicit-embeddings
---

# Geographic Neural Fields

<div class="flex items-center justify-center gap-4 my-6 font-mono text-[.8rem]">
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">$(p_i, y_i)$</span>
  <span class="text-gray-400">→</span>
  <span class="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">$f_\theta(p)$</span>
  <span class="text-gray-400">→</span>
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">$y$</span>
</div>

<div class="text-[.78rem] text-gray-700 mb-4">Target signals over geographic coordinates:</div>

<div class="grid grid-cols-3 gap-3">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Climate</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Elevation</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Land properties</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Population</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Biodiversity</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Vegetation</div>
</div>

---
section: implicit-embeddings
---

# Species Observations as a Spatial Signal

<div class="flex items-center justify-center gap-5 my-8 font-mono text-[.85rem]">
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">$p$</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">$P(\text{species} \mid p)$</span>
</div>

<div class="text-[.78rem] text-gray-700 mb-4">
  Georeferenced occurrence records form a spatial signal — presence at location $p$.
</div>

<div class="text-[.74rem] text-gray-500">
  A coordinate network can learn to predict species occurrence from location — effectively learning the spatial distribution of a taxon without explicit rasterization.
</div>

<!-- TODO: add species-distribution / spatial-INR paper example from Session 2 of paper-analysis deck -->

---
section: implicit-embeddings
---

# From Signal Prediction to Location Representation

<div class="grid grid-cols-2 gap-6 mt-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Signal model</div>
    <div class="flex items-center gap-3 font-mono text-[.8rem] mb-3">
      <span>$p$</span>
      <span class="text-gray-400">→</span>
      <span>$y$</span>
    </div>
    <div class="text-[.72rem] text-gray-600">The output is a signal value.</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Representation model</div>
    <div class="flex items-center gap-3 font-mono text-[.8rem] mb-3">
      <span>$p$</span>
      <span class="text-blue-400">→</span>
      <span class="underline">$e_\theta$</span>
      <span class="text-blue-400">→</span>
      <span class="text-blue-800">$z(p)$</span>
      <span class="text-blue-400">→</span>
      <span>$y$</span>
    </div>
    <div class="text-[.72rem] text-blue-800">The hidden representation itself is the object of interest.</div>
  </div>
</div>

---
section: implicit-embeddings
---

# Location Encoders

<div class="flex items-center justify-center gap-5 my-8 font-mono text-[.85rem]">
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">location</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-blue-300 bg-blue-100 px-4 py-3 font-semibold">$e_\theta$</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-blue-400 bg-blue-200 px-4 py-3">$\mathbb{R}^d$</span>
</div>

<div class="text-[.82rem] text-gray-700 text-center mb-4">
  A location encoder maps geographic coordinates directly to a reusable $d$-dimensional embedding.
</div>

<div class="text-[.74rem] text-gray-500 text-center">
  The embedding is implicit: spatial information is encoded in model parameters, not retrieved from local observations.
</div>

---
section: implicit-embeddings
---

# What Can a Location Embedding Encode?

<div class="grid grid-cols-3 gap-3 mt-6">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Climate</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Ecosystems</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Land use</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Biogeography</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Human activity</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center text-[.7rem]">Visual appearance</div>
</div>

<div class="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[.78rem] text-blue-900">
  The representation is <strong>implicit</strong>: information is encoded in model parameters, not retrieved from a local observation at query time.
</div>

---
section: implicit-embeddings
---

# SatCLIP / GeoCLIP-Like Models

<div class="mt-4 text-[.82rem] text-gray-700 mb-4">
  Train image and location encoders jointly so corresponding pairs become similar in embedding space.
</div>

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Image branch</div>
    <div class="font-mono text-[.78rem]">image $\rightarrow z_{\text{image}}$</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Location branch</div>
    <div class="font-mono text-[.78rem]">location $\rightarrow z_{\text{location}}$</div>
  </div>
</div>

<div class="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[.74rem] text-blue-900">
  Contrastive training aligns corresponding image–location pairs. The location encoder inherits visual semantics without needing an image at query time. Links to Block 1 contrastive learning.
</div>

<!-- TODO: link to SatCLIP / GeoCLIP papers in Session 4 of paper-analysis deck -->

---
section: implicit-embeddings
---

# The Two Blocks Meet

<div class="grid grid-cols-2 gap-6 mt-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Explicit branch</div>
    <div class="flex items-center gap-2 font-mono text-[.75rem] mb-3">
      <span>$x(p)$</span>
      <span class="text-gray-400">→</span>
      <span>$e_{\text{obs}}$</span>
      <span class="text-gray-400">→</span>
      <span>$z_{\text{explicit}}$</span>
    </div>
    <div class="text-[.7rem] text-gray-600">From observing the place</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Implicit branch</div>
    <div class="flex items-center gap-2 font-mono text-[.75rem] mb-3">
      <span>$p$</span>
      <span class="text-blue-400">→</span>
      <span>$e_{\text{loc}}$</span>
      <span class="text-blue-400">→</span>
      <span>$z_{\text{implicit}}$</span>
    </div>
    <div class="text-[.7rem] text-blue-800">From knowing where the place is</div>
  </div>
</div>

<div class="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[.78rem] text-blue-900 text-center">
  Contrastive learning can align them: $z_{\text{explicit}} \leftrightarrow z_{\text{implicit}}$
</div>

---
section: implicit-embeddings
---

# Explicit vs Implicit Geospatial Embeddings

<table class="w-full text-[.72rem] mt-6 border-collapse">
  <thead>
    <tr class="bg-gray-100">
      <th class="text-left px-3 py-2 border border-gray-200 text-gray-500 font-semibold uppercase text-[.6rem] tracking-wide"></th>
      <th class="text-left px-3 py-2 border border-gray-200 text-gray-700">Explicit</th>
      <th class="text-left px-3 py-2 border border-blue-200 bg-blue-50 text-blue-800">Implicit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="px-3 py-2 border border-gray-200 font-medium text-gray-500">Input</td>
      <td class="px-3 py-2 border border-gray-200">observation ($x$)</td>
      <td class="px-3 py-2 border border-blue-200 bg-blue-50">location ($p$)</td>
    </tr>
    <tr class="bg-gray-50">
      <td class="px-3 py-2 border border-gray-200 font-medium text-gray-500">Encoder</td>
      <td class="px-3 py-2 border border-gray-200 font-mono">$e(x)$</td>
      <td class="px-3 py-2 border border-blue-200 bg-blue-50 font-mono">$e(p)$</td>
    </tr>
    <tr>
      <td class="px-3 py-2 border border-gray-200 font-medium text-gray-500">Observation at query time</td>
      <td class="px-3 py-2 border border-gray-200">required</td>
      <td class="px-3 py-2 border border-blue-200 bg-blue-50">not required</td>
    </tr>
    <tr class="bg-gray-50">
      <td class="px-3 py-2 border border-gray-200 font-medium text-gray-500">Information source</td>
      <td class="px-3 py-2 border border-gray-200">local observation</td>
      <td class="px-3 py-2 border border-blue-200 bg-blue-50">learned spatial associations</td>
    </tr>
    <tr>
      <td class="px-3 py-2 border border-gray-200 font-medium text-gray-500">Output</td>
      <td class="px-3 py-2 border border-gray-200 font-mono">$z$</td>
      <td class="px-3 py-2 border border-blue-200 bg-blue-50 font-mono">$z$</td>
    </tr>
    <tr class="bg-gray-50">
      <td class="px-3 py-2 border border-gray-200 font-medium text-gray-500">Example</td>
      <td class="px-3 py-2 border border-gray-200">EO foundation-model embedding</td>
      <td class="px-3 py-2 border border-blue-200 bg-blue-50">SatCLIP location encoder</td>
    </tr>
  </tbody>
</table>

---
section: implicit-embeddings
---

# Two Views of the Same Place

<div class="grid grid-cols-2 gap-8 mt-8">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-4">Observation → embedding</div>
    <div class="font-mono text-[.85rem]">$x(p) \rightarrow z_{\text{explicit}}$</div>
    <div class="text-[.7rem] text-gray-500 mt-3">Requires sensing the place</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-4">Location → embedding</div>
    <div class="font-mono text-[.85rem]">$p \rightarrow z_{\text{implicit}}$</div>
    <div class="text-[.7rem] text-blue-700 mt-3">Only requires coordinates</div>
  </div>
</div>

<div class="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-5 py-3 text-[.78rem] text-blue-900 text-center">
  One embedding comes from observing the place; the other comes from knowing where it is.
</div>

---
section: implicit-embeddings
---

# Block 2 Takeaway

<div class="mt-8 flex items-center justify-center mb-8">
  <div class="rounded-xl border-2 border-blue-300 bg-blue-50 px-8 py-5 text-blue-900">

$$\boxed{p_{\text{location}} \rightarrow e_\theta(p) \rightarrow z}$$

  </div>
</div>

<div class="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-[.82rem] text-blue-900">
  <strong>Implicit geospatial embeddings</strong> generate representations directly from location using learned spatial structure. No observation is required at query time.
</div>

---
layout: bonn-section
sectionColor: "#00457c"
section: synthesis
sectionTitle: Course Synthesis
---

# Final Course Synthesis

---
section: synthesis
---

# What Can Be a Representation?

<div class="flex flex-col gap-5 mt-6">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Engineered representation</div>
    <div class="flex items-center gap-3 font-mono text-[.8rem] mb-2">
      <span>$x$</span>
      <span class="text-gray-400">→</span>
      <span>$\phi(x)$</span>
    </div>
    <div class="text-[.7rem] text-gray-500">Human design — hand-crafted features, spectral indices, kernels</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Explicit learned representation</div>
    <div class="flex items-center gap-3 font-mono text-[.8rem] mb-2">
      <span>$x$</span>
      <span class="text-gray-400">→</span>
      <span>$e_\theta(x)$</span>
      <span class="text-gray-400">→</span>
      <span>$z$</span>
    </div>
    <div class="text-[.7rem] text-gray-500">Learned from observations — deep learning, self-supervised, foundation models</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Implicit learned representation</div>
    <div class="flex items-center gap-3 font-mono text-[.8rem] mb-2">
      <span>$p$</span>
      <span class="text-blue-400">→</span>
      <span>$e_\theta(p)$</span>
      <span class="text-blue-400">→</span>
      <span>$z$</span>
    </div>
    <div class="text-[.7rem] text-blue-700">Learned from spatial supervision — coordinate networks, location encoders</div>
  </div>
</div>

---
section: synthesis
---

# Where Does the Information Come From?

<div class="grid grid-cols-3 gap-5 mt-6">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Engineered</div>
    <div class="text-[.75rem] text-gray-700 font-medium">Human design</div>
    <div class="text-[.68rem] text-gray-500 mt-2">Domain knowledge drives feature construction</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Explicit learned</div>
    <div class="text-[.75rem] text-gray-700 font-medium">Observations + learning objective</div>
    <div class="text-[.68rem] text-gray-500 mt-2">The data itself drives what is encoded</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Implicit learned</div>
    <div class="text-[.75rem] text-blue-900 font-medium">Spatial supervision + learned associations</div>
    <div class="text-[.68rem] text-blue-700 mt-2">Spatial structure in data drives geographic embedding</div>
  </div>
</div>

---
section: synthesis
---

# Geospatial Representation Learning

<div class="flex items-center justify-center gap-4 font-mono text-[.82rem] flex-wrap mt-8 mb-8">
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">data / location</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">learning</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-blue-300 bg-blue-100 px-4 py-3 font-semibold">representation</span>
  <span class="text-gray-400 text-xl">→</span>
  <span class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">downstream task</span>
</div>

<div class="rounded-xl border border-blue-200 bg-blue-50 px-6 py-5 text-[.82rem] text-blue-900">
  Geospatial representation learning is about deciding <strong>what information should be encoded</strong>, <strong>where that information comes from</strong>, and <strong>how reusable the resulting representation should be</strong>.
</div>

---
section: synthesis
---

# Course Takeaway

<div class="flex items-center justify-center h-[65%]">
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-10 py-8 text-center max-w-xl">
    <div class="text-[1rem] font-semibold text-blue-900 leading-relaxed">
      Good representations turn complex geospatial information into forms that make useful tasks easier.
    </div>
  </div>
</div>

<!-- OLD LECTURE 6 CONTENT - PRESERVED FOR REFERENCE -->
<!-- The slides below are the original Lecture 6 (Implicit Neural Representations). -->
<!-- They are kept here for reference and may be partially reused in future lectures. -->

---
addons:
  - "../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lecture 6
home: ../
---

# Implicit Neural Representations

## Representing geospatial information as a continuous learned function

<!--
This lecture bridges Lectures 4–5 (learning and generalization) to the question of how the signal itself is represented.
The key move: from storing observations explicitly to storing the parameters of a continuous function.
-->

---

# Learning Outcomes

<div class="mt-5 flex flex-col gap-4">
  <div class="flex gap-4 items-start">
    <div class="text-[.7rem] font-bold text-blue-700 w-5 shrink-0 mt-0.5">1</div>
    <div class="text-[.82rem] leading-snug">Explain how geospatial information can be represented as <strong>discrete data or continuous functions</strong>.</div>
  </div>
  <div class="flex gap-4 items-start">
    <div class="text-[.7rem] font-bold text-blue-700 w-5 shrink-0 mt-0.5">2</div>
    <div class="text-[.82rem] leading-snug">Explain how <strong>coordinate-based neural networks</strong> model continuous signals using positional encodings and sinusoidal features.</div>
  </div>
  <div class="flex gap-4 items-start">
    <div class="text-[.7rem] font-bold text-blue-700 w-5 shrink-0 mt-0.5">3</div>
    <div class="text-[.82rem] leading-snug">Explain how <strong>implicit neural representations</strong> can model geographic space and produce either spatial signals or location embeddings.</div>
  </div>
</div>

<!--
Three outcomes tracking the three blocks:
1 → Functional Models of the Earth
2 → Neural Networks for Continuous Signal Modeling
3 → Implicit Neural Representations of Geographic Space
-->

---

# Where We Are in the Course

<div class="grid grid-cols-3 gap-4 mt-6">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Lecture 4</div>
    <div class="text-[.78rem] font-semibold text-gray-800">Model &amp; Optimization</div>
    <div class="text-[.68rem] text-gray-500 mt-1">How does a neural network learn from labeled data?</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Lecture 5</div>
    <div class="text-[.78rem] font-semibold text-gray-800">Generalization</div>
    <div class="text-[.68rem] text-gray-500 mt-1">How does learned structure transfer beyond the training data?</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-600 mb-2">Lecture 6 — today</div>
    <div class="text-[.78rem] font-semibold text-blue-900">Representing Data as Functions</div>
    <div class="text-[.68rem] text-blue-700 mt-1">Can geospatial information be represented as a continuous learned function instead of discrete samples?</div>
  </div>
</div>

<div class="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-3 text-[.82rem] text-blue-900 font-medium">
  Main question: Can geospatial information be represented as a continuous learned function instead of only as discrete samples?
</div>

<!--
Lectures 4 and 5 treated the model and the data as given.
Lecture 6 asks a different question: what is the right form to store geospatial information in the first place?
-->

---

# Discrete or Continuous?

<div class="grid grid-cols-2 gap-6 mt-4">

  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-widest text-gray-500 mb-3">Discrete</div>
    <div class="text-[.75rem] text-gray-700 mb-3">Store observations explicitly at discrete spatial supports.</div>
    <div class="font-mono text-[.72rem] bg-white border border-gray-200 rounded px-3 py-2 mb-3">
      $\{(\mathbf{x}_i, y_i)\}_{i=1}^{N}$
    </div>
    <div class="text-[.7rem] text-gray-500">Examples: raster cells · vector geometries · point samples</div>
  </div>

  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-widest text-blue-600 mb-3">Continuous</div>
    <div class="text-[.75rem] text-blue-800 mb-3">Store the parameters of a function; evaluate wherever needed.</div>
    <div class="font-mono text-[.72rem] bg-white border border-blue-100 rounded px-3 py-2 mb-3">
      $f : \mathcal{X} \rightarrow \mathcal{Y}$
    </div>
    <div class="text-[.7rem] text-blue-700">
      Examples: Fourier representations · spherical harmonic models · interpolation functions · <strong>neural fields / implicit neural representations</strong>
    </div>
  </div>

</div>

<div class="mt-4 text-[.7rem] text-gray-500">
  Neural fields are one type of continuous functional model — not a separate category.
</div>

<!--
The key point: neural fields are not special or separate. They are one way to parameterize a continuous function.
Classical geodesy and signal processing have used continuous functional models for a long time.
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: functional-models
sectionTitle: Functional Models of the Earth
---

# Functional Models of the Earth

<div class="text-[.9rem] text-gray-700 mt-4">
  Geospatial analysis commonly discretizes space — but global physical fields have always been modeled as continuous functions.
</div>

<div class="text-[.72rem] text-gray-500 mt-4">
  discrete Earth data → basis functions → Fourier representations → spherical harmonics → Laplacian eigenfunctions
</div>

---
section: functional-models
---

# The Earth as Discrete Data

<div class="grid grid-cols-3 gap-4 mt-6">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Raster</div>
    <!-- TODO: add raster grid thumbnail -->
    <div class="text-[.68rem] text-gray-500 mt-2">Regular grid of cells, each holding a value</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Vector</div>
    <!-- TODO: add vector geometry thumbnail -->
    <div class="text-[.68rem] text-gray-500 mt-2">Points, lines, polygons with explicit geometry</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Point Observations</div>
    <!-- TODO: add scatter-point map thumbnail -->
    <div class="text-[.68rem] text-gray-500 mt-2">Irregular samples at measured locations</div>
  </div>
</div>

<div class="mt-6 text-[.78rem] text-gray-600">
  Most geospatial tools discretize: store values at explicit supports, then process those values.
</div>

---
section: functional-models
---

# What Happens at Global Scale?

<div class="grid grid-cols-2 gap-6 mt-5">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      Some geophysical quantities vary continuously over the entire Earth:
    </div>
    <ul class="text-[.75rem] text-gray-600 space-y-2 list-disc pl-4">
      <li>Gravity field</li>
      <li>Magnetic field</li>
      <li>Geoid (sea-level surface)</li>
      <li>Atmospheric pressure</li>
      <li>Temperature and precipitation</li>
    </ul>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-6">
    <!-- TODO: add global gravity or geoid field image -->
    <div class="text-[.68rem] text-gray-400 text-center">[ global field image ]</div>
  </div>
</div>

<div class="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-5 py-3 text-[.82rem] text-blue-900">
  Must a global field be stored as billions of individual pixels?
</div>

---
section: functional-models
---

# From Samples to Functions

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">General functional model:</div>
    <div class="font-mono text-[.8rem] bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-4">
      $f(x) = \sum_k a_k \, \phi_k(x)$
    </div>
    <ul class="text-[.75rem] text-gray-600 space-y-2 mt-4 list-disc pl-4">
      <li>$\phi_k$: basis functions — predefined shapes that span the space</li>
      <li>$a_k$: coefficients — the learned or fitted parameters</li>
      <li>The coefficients <em>are</em> the stored representation of the field</li>
    </ul>
  </div>
  <div class="flex flex-col gap-3">
    <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-1">Discrete</div>
      <div class="text-[.72rem] text-gray-600">Store $N$ values at $N$ locations</div>
    </div>
    <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-1">Functional</div>
      <div class="text-[.72rem] text-blue-800">Store $K$ coefficients; evaluate $f(x)$ anywhere</div>
    </div>
  </div>
</div>

---
section: functional-models
---

# Sine and Cosine as Basis Functions

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      The simplest basis functions on a periodic domain are sinusoids:
    </div>
    <div class="font-mono text-[.78rem] bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-4">
      $\phi_k(x) = \sin(k x), \quad \cos(k x)$
    </div>
    <ul class="text-[.75rem] text-gray-600 space-y-2 list-disc pl-4">
      <li>Each basis function oscillates at a different frequency $k$</li>
      <li>Together they can represent any square-integrable periodic signal</li>
    </ul>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add visual of sinusoidal basis functions at several frequencies -->
    <div class="text-[.68rem] text-gray-400 text-center">[ sinusoidal basis functions at $k = 1, 2, 3, \ldots$ ]</div>
  </div>
</div>

<div class="mt-4 text-[.7rem] text-gray-500">
  This prepares us for Fourier representations and, later, positional encoding in neural networks.
</div>

---
section: functional-models
---

# Fourier Representations

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-3">
      Any signal can be decomposed into components at different spatial frequencies:
    </div>
    <div class="font-mono text-[.78rem] bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-4">
      $f(x) = \sum_k \bigl(a_k \cos(kx) + b_k \sin(kx)\bigr)$
    </div>
    <div class="flex flex-col gap-2 mt-2">
      <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[.72rem]">
        <strong>Low frequencies</strong> — broad, smooth variation
      </div>
      <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[.72rem]">
        <strong>High frequencies</strong> — fine spatial detail
      </div>
    </div>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add frequency decomposition figure (signal = sum of waves) -->
    <div class="text-[.68rem] text-gray-400 text-center">[ Fourier decomposition figure ]</div>
  </div>
</div>

<div class="mt-4 text-[.7rem] text-blue-700">
  → This connects directly to <strong>spectral bias</strong> and <strong>positional encoding</strong> in Block 2.
</div>

---
section: functional-models
---

# From the Circle to the Sphere

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      Fourier functions work on periodic or Euclidean domains. The Earth is a sphere.
    </div>
    <div class="font-mono text-[.8rem] bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-4 text-center">
      $\sin, \cos \quad\xrightarrow{\text{sphere}}\quad Y_{\ell m}(\theta, \lambda)$
    </div>
    <div class="text-[.74rem] text-gray-600">
      Spherical harmonics are the natural generalization of sinusoidal basis functions to the sphere $S^2$.
    </div>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add side-by-side: sine wave on circle / spherical harmonic on globe -->
    <div class="text-[.68rem] text-gray-400 text-center">[ circle → sphere transition figure ]</div>
  </div>
</div>

---
section: functional-models
---

# Spherical Harmonics

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      A field on the sphere is modeled as:
    </div>
    <div class="font-mono text-[.78rem] bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-4">
      $f(\theta,\lambda) = \sum_{\ell,m} a_{\ell m} \, Y_{\ell m}(\theta,\lambda)$
    </div>
    <ul class="text-[.74rem] text-gray-600 space-y-2 list-disc pl-4">
      <li>$\ell$: degree — controls the spatial scale</li>
      <li>$m$: order — controls the longitudinal variation</li>
      <li>Increasing $\ell$ adds finer spatial detail</li>
    </ul>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add spherical harmonic visualization grid (degree × order) -->
    <div class="text-[.68rem] text-gray-400 text-center">[ spherical harmonic visualization $Y_{\ell m}$ ]</div>
  </div>
</div>

---
section: functional-models
---

# Modeling Global Earth Fields

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      Spherical harmonics are the standard representation in physical geodesy:
    </div>
    <ul class="text-[.74rem] text-gray-600 space-y-2 list-disc pl-4 mb-4">
      <li>Gravity field (e.g. EGM2008: degree 2190)</li>
      <li>Geomagnetic field (IGRF model)</li>
      <li>Earth's topography</li>
    </ul>
    <div class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-[.76rem] text-blue-900">
      The field is stored through coefficients of a continuous functional model — not as billions of pixels.
    </div>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add EGM geoid or magnetic field map -->
    <div class="text-[.68rem] text-gray-400 text-center">[ global field represented via spherical harmonics ]</div>
  </div>
</div>

---
section: functional-models
---

# Where Do the Basis Functions Come From?

<div class="mt-6 text-[.85rem] text-gray-700 mb-5">
  So far we chose basis functions by hand (sinusoids, spherical harmonics).
</div>

<div class="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-[.82rem] text-blue-900 mb-6">
  Can the <strong>geometry of the domain itself</strong> determine useful basis functions?
</div>

<div class="text-[.76rem] text-gray-600">
  The answer is yes — through the eigenfunctions of the Laplacian.
</div>

<!--
This slide is the hinge between Fourier/spherical harmonics (chosen by symmetry of the domain) and the general Laplacian eigenfunctions framework.
-->

---
section: functional-models
---

# The Laplacian

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      The Laplacian $\Delta$ measures local variation of a function on a domain.
    </div>
    <ul class="text-[.74rem] text-gray-600 space-y-2 list-disc pl-4">
      <li>On $\mathbb{R}^n$: $\Delta f = \sum_i \partial^2 f / \partial x_i^2$</li>
      <li>Captures local smoothness</li>
      <li>Generalizes naturally to manifolds and graphs</li>
      <li>Encodes the geometry of the domain</li>
    </ul>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add intuitive diagram: smooth vs. varying function, Laplacian large vs. small -->
    <div class="text-[.68rem] text-gray-400 text-center">[ Laplacian as local variation ]</div>
  </div>
</div>

---
section: functional-models
---

# Eigenfunctions of the Laplacian

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      Eigenfunctions $\phi_k$ satisfy:
    </div>
    <div class="font-mono text-[.82rem] bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-4">
      $\Delta \phi_k = \lambda_k \phi_k$
    </div>
    <ul class="text-[.74rem] text-gray-600 space-y-2 list-disc pl-4">
      <li>$\lambda_k$: eigenvalue — controls the spatial frequency</li>
      <li>$\phi_k$: eigenfunction — a basis shape adapted to the domain</li>
      <li>Together they form a geometry-aware basis for representing any function on the domain</li>
    </ul>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: show Laplacian eigenfunctions on a 2D surface or mesh -->
    <div class="text-[.68rem] text-gray-400 text-center">[ Laplacian eigenfunctions on a domain ]</div>
  </div>
</div>

---
section: functional-models
---

# Geometry Determines the Basis

<div class="grid grid-cols-3 gap-4 mt-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Line / Periodic</div>
    <div class="font-mono text-[.75rem] bg-white border border-gray-200 rounded px-2 py-1 mb-2">$\sin(kx),\,\cos(kx)$</div>
    <div class="text-[.68rem] text-gray-500">Fourier modes</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-2">Sphere $S^2$</div>
    <div class="font-mono text-[.75rem] bg-white border border-blue-100 rounded px-2 py-1 mb-2">$Y_{\ell m}(\theta,\lambda)$</div>
    <div class="text-[.68rem] text-blue-700">Spherical harmonics</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">General manifold / graph</div>
    <div class="font-mono text-[.75rem] bg-white border border-gray-200 rounded px-2 py-1 mb-2">$\Delta\phi_k = \lambda_k\phi_k$</div>
    <div class="text-[.68rem] text-gray-500">Laplacian eigenfunctions</div>
  </div>
</div>

<div class="mt-5 text-[.75rem] text-gray-600 text-center">
  Each domain determines its own natural frequency basis through the geometry.
</div>

---
section: functional-models
---

# Block 1 Takeaway

<div class="mt-8 rounded-xl border border-blue-200 bg-blue-50 px-6 py-5">
  <div class="text-[.95rem] font-semibold text-blue-900">
    A spatial field can be represented by the <em>parameters of a continuous function</em> rather than by explicitly storing every sample.
  </div>
  <div class="mt-3 text-[.76rem] text-blue-700">
    Classical geodesy and signal processing have exploited this for decades: spherical harmonic models of gravity, magnetic, and other global fields store coefficients, not pixels.
  </div>
</div>

<div class="mt-6 text-[.74rem] text-gray-500">
  Next: what if the continuous function is parameterized by a neural network?
</div>

---
layout: bonn-section
sectionColor: "#00457c"
section: coordinate-networks
sectionTitle: Neural Networks for Continuous Signal Modeling
---

# Neural Networks for Continuous Signal Modeling

<div class="text-[.9rem] text-gray-700 mt-4">
  Fixed functional models choose basis functions by hand. Neural networks learn the function directly from data.
</div>

<div class="text-[.72rem] text-gray-500 mt-4">
  fixed functional models → coordinate networks → spectral bias → Fourier features → SIREN → neural fields → NeRF
</div>

---
section: coordinate-networks
---

# From Fixed Functional Models to Neural Networks

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Classical: fixed basis</div>
    <div class="font-mono text-[.8rem] bg-white border border-gray-200 rounded px-4 py-3 mb-3">
      $f(x) = \sum_k a_k \, \phi_k(x)$
    </div>
    <div class="text-[.72rem] text-gray-600">Basis functions $\phi_k$ are fixed; only coefficients $a_k$ are learned.</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Neural: learned function</div>
    <div class="font-mono text-[.8rem] bg-white border border-blue-100 rounded px-4 py-3 mb-3">
      $f_\theta(x) = \mathrm{NN}_\theta(x)$
    </div>
    <div class="text-[.72rem] text-blue-800">The entire function is parameterized by network weights $\theta$.</div>
  </div>
</div>

<div class="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-5 py-3 text-[.82rem] text-blue-900">
  What if the continuous function itself is parameterized by a neural network?
</div>

---
section: coordinate-networks
---

# Coordinate-Based Neural Networks

<div class="mt-4 text-[.82rem] text-gray-700 mb-6">
  The most direct formulation: the input is a coordinate; the output is the signal at that coordinate.
</div>

<div class="flex items-center justify-center gap-6 my-6">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-[.82rem] font-mono">$\mathbf{x}$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-[.82rem] font-mono">$f_\theta(\mathbf{x})$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-[.82rem] font-mono">$\mathbf{y}$</div>
</div>

<div class="grid grid-cols-2 gap-4 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.72rem] text-gray-600">
    <strong>Input:</strong> spatial coordinate $\mathbf{x} \in \mathcal{X}$
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.72rem] text-gray-600">
    <strong>Output:</strong> signal value $\mathbf{y} \in \mathcal{Y}$ at that location
  </div>
</div>

---
section: coordinate-networks
---

# An Image as a Continuous Function

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Discrete: pixel grid</div>
    <!-- TODO: add pixel grid image -->
    <div class="text-center rounded bg-gray-100 px-4 py-6 text-[.68rem] text-gray-400">[ pixel grid ]</div>
    <div class="text-[.72rem] text-gray-600 mt-2">Store $H \times W \times 3$ values explicitly</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Continuous: neural function</div>
    <div class="font-mono text-[.8rem] bg-white border border-blue-100 rounded px-4 py-3 mb-2 text-center">
      $f_\theta(x, y) \rightarrow \mathrm{RGB}$
    </div>
    <div class="text-[.72rem] text-blue-800 mt-2">Store network weights $\theta$; evaluate at any $(x,y)$</div>
  </div>
</div>

---
section: coordinate-networks
---

# Fit the Samples, Query the Function

<div class="grid grid-cols-2 gap-6 mt-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Training</div>
    <div class="font-mono text-[.76rem] bg-white border border-gray-200 rounded px-4 py-3 mb-2">
      $\min_\theta \sum_i \| f_\theta(\mathbf{x}_i) - y_i \|^2$
    </div>
    <div class="text-[.72rem] text-gray-600 mt-2">Observed coordinates and values supervise the network.</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Inference</div>
    <div class="font-mono text-[.76rem] bg-white border border-blue-100 rounded px-4 py-3 mb-2">
      $y^* = f_\theta(\mathbf{x}^*)$
    </div>
    <div class="text-[.72rem] text-blue-800 mt-2">Evaluate the function at any arbitrary coordinate.</div>
  </div>
</div>

<div class="mt-4 text-[.72rem] text-gray-500">
  The network learns a continuous function from discrete observations — much like classical interpolation, but with a learned parametric form.
</div>

---
section: coordinate-networks
---

# Spectral Bias

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      Standard MLPs with ReLU activations preferentially fit <strong>low-frequency</strong> variation first.
    </div>
    <ul class="text-[.74rem] text-gray-600 space-y-2 list-disc pl-4 mb-4">
      <li>Smooth, broad patterns are learned quickly</li>
      <li>Fine high-frequency structure is learned slowly or not at all</li>
    </ul>
    <div class="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[.74rem] text-amber-900">
      Recall from Block 1: Fourier decomposition separates signals by frequency. Spectral bias is a neural analogue of truncating the Fourier series.
    </div>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add spectral bias figure: training loss vs. frequency component over time -->
    <div class="text-[.68rem] text-gray-400 text-center">[ spectral bias: MLP learns low frequencies first ]</div>
  </div>
</div>

---
section: coordinate-networks
---

# Positional Encoding and Fourier Features

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      Idea: map coordinates to explicit sinusoidal features before the MLP.
    </div>
    <div class="font-mono text-[.75rem] bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-3">
      $\gamma(\mathbf{x}) = \bigl[\sin(2\pi B\mathbf{x}),\;\cos(2\pi B\mathbf{x})\bigr]$
    </div>
    <div class="text-[.72rem] text-gray-600 mb-2">followed by an MLP on $\gamma(\mathbf{x})$.</div>
    <ul class="text-[.72rem] text-gray-500 space-y-1 list-disc pl-4">
      <li>$B$: frequency matrix (random or learned)</li>
      <li>Directly injects multiple frequency scales</li>
      <li>Overcomes spectral bias for fine detail</li>
    </ul>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add Fourier Features figure (Tancik et al. 2020 style) -->
    <div class="text-[.68rem] text-gray-400 text-center">[ Fourier feature encoding diagram ]<br><span class="text-gray-300">Tancik et al. 2020</span></div>
  </div>
</div>

---
section: coordinate-networks
---

# Why Fourier Features Help

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Raw coordinates</div>
    <div class="font-mono text-[.75rem] bg-white border border-gray-200 rounded px-3 py-2 mb-3">
      $(x, y) \rightarrow \mathrm{MLP}$
    </div>
    <div class="text-[.72rem] text-gray-600">MLP must learn all frequency content from scratch. Spectral bias limits high-frequency capacity.</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Fourier-encoded coordinates</div>
    <div class="font-mono text-[.75rem] bg-white border border-blue-100 rounded px-3 py-2 mb-3">
      $\gamma(x, y) \rightarrow \mathrm{MLP}$
    </div>
    <div class="text-[.72rem] text-blue-800">Multiple frequencies are already explicit in the input. MLP only needs to combine them.</div>
  </div>
</div>

<div class="mt-4 text-[.72rem] text-gray-500">
  Explicit frequency features make fine spatial variation much easier for the network to represent.
</div>

---
section: coordinate-networks
---

# SIREN

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      Alternative approach: use sinusoidal <em>activation functions</em> inside the network.
    </div>
    <div class="font-mono text-[.76rem] bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-4">
      $h_{l+1} = \sin(W_l h_l + b_l)$
    </div>
    <div class="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[.74rem] text-amber-900">
      <strong>Key distinction:</strong><br>
      Fourier features — sinusoidal <em>input encoding</em><br>
      SIREN — sinusoidal <em>activation functions inside the network</em>
    </div>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add SIREN architecture diagram (Sitzmann et al. 2020) -->
    <div class="text-[.68rem] text-gray-400 text-center">[ SIREN network diagram ]<br><span class="text-gray-300">Sitzmann et al. 2020</span></div>
  </div>
</div>

---
section: coordinate-networks
---

# Fourier Basis, Fourier Features, SIREN

<div class="grid grid-cols-3 gap-4 mt-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Classical signal processing</div>
    <div class="font-mono text-[.72rem] bg-white border border-gray-200 rounded px-3 py-2 mb-2">
      $f(x) = \sum_k a_k \phi_k(x)$
    </div>
    <div class="text-[.68rem] text-gray-500">Fourier basis: fixed sinusoidal functions</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-2">Neural input encoding</div>
    <div class="font-mono text-[.72rem] bg-white border border-blue-100 rounded px-3 py-2 mb-2">
      $\gamma(\mathbf{x}) = [\sin(B\mathbf{x}), \cos(B\mathbf{x})]$
    </div>
    <div class="text-[.68rem] text-blue-700">Fourier features: sinusoidal input to MLP</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-2">SIREN activations</div>
    <div class="font-mono text-[.72rem] bg-white border border-blue-100 rounded px-3 py-2 mb-2">
      $h_{l+1} = \sin(W_l h_l + b_l)$
    </div>
    <div class="text-[.68rem] text-blue-700">Sinusoidal activations inside the network</div>
  </div>
</div>

<div class="mt-4 text-[.76rem] text-gray-600 text-center">
  The same idea — spatial frequency decomposition — appears at every level of the representation.
</div>

---
section: coordinate-networks
---

# Continuous Neural Fields

<div class="mt-4 text-[.82rem] text-gray-700 mb-5">
  The coordinate-network idea generalizes across many signal types:
</div>

<div class="grid grid-cols-3 gap-3 mt-2">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.72rem] text-gray-700">Images<br><span class="text-gray-400 font-mono text-[.65rem]">$(x,y) \rightarrow \mathrm{RGB}$</span></div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.72rem] text-gray-700">Audio<br><span class="text-gray-400 font-mono text-[.65rem]">$t \rightarrow \text{amplitude}$</span></div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.72rem] text-gray-700">Signed-distance functions<br><span class="text-gray-400 font-mono text-[.65rem]">$(x,y,z) \rightarrow \mathrm{SDF}$</span></div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.72rem] text-gray-700">Occupancy fields<br><span class="text-gray-400 font-mono text-[.65rem]">$(x,y,z) \rightarrow \{0,1\}$</span></div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.72rem] text-gray-700">Physical fields<br><span class="text-gray-400 font-mono text-[.65rem]">$\mathbf{x} \rightarrow \text{temperature}$</span></div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[.72rem] text-blue-800">Radiance fields (NeRF)<br><span class="text-blue-400 font-mono text-[.65rem]">$(\mathbf{x},\mathbf{d}) \rightarrow (\sigma,\mathrm{RGB})$</span></div>
</div>

---
section: coordinate-networks
---

# NeRF

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      NeRF (Neural Radiance Field) models a 3D scene as a continuous function:
    </div>
    <div class="font-mono text-[.76rem] bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-4">
      $(\mathbf{x}, \mathbf{d}) \rightarrow (\sigma, \mathbf{c})$
    </div>
    <ul class="text-[.74rem] text-gray-600 space-y-1 list-disc pl-4">
      <li>$\mathbf{x}$: 3D position</li>
      <li>$\mathbf{d}$: viewing direction</li>
      <li>$\sigma$: volume density</li>
      <li>$\mathbf{c}$: RGB color</li>
    </ul>
    <div class="mt-4 text-[.7rem] text-gray-500">
      Novel views are rendered by ray-marching through the neural field.
    </div>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add NeRF overview figure (Mildenhall et al. 2020) -->
    <div class="text-[.68rem] text-gray-400 text-center">[ NeRF scene representation ]<br><span class="text-gray-300">Mildenhall et al. 2020</span></div>
  </div>
</div>

---
section: coordinate-networks
---

# A Scene as a Continuous Neural Field

<div class="mt-5 text-[.82rem] text-gray-700 mb-5">
  The conceptual key: a 3D scene is not stored as explicit geometry or a point cloud — it is the network itself.
</div>

<div class="flex items-center justify-center gap-6 my-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-[.8rem] font-mono">$(\mathbf{x}, \mathbf{d})$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-[.8rem] font-mono">$f_\theta$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-[.8rem] font-mono">$(\sigma, \mathbf{c})$</div>
</div>

<div class="text-[.72rem] text-gray-500">
  Any point in the scene can be queried through the neural function — no explicit mesh, voxel grid, or point set required.
</div>

---
section: coordinate-networks
---

# The Same Pattern Across Domains

<div class="mt-4 text-[.82rem] text-gray-700 mb-4">Common pattern:</div>

<div class="flex items-center justify-center gap-4 mb-6">
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-[.78rem] font-mono">coordinate</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-[.78rem] font-mono">$f_\theta$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-[.78rem] font-mono">signal</div>
</div>

<div class="grid grid-cols-3 gap-3">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-[.72rem] text-gray-700 text-center">$(x,y) \rightarrow \mathrm{RGB}$</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-[.72rem] text-gray-700 text-center">$(x,y,z) \rightarrow \mathrm{SDF}$</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-[.72rem] text-gray-700 text-center">$(\mathbf{x},\mathbf{d}) \rightarrow (\sigma, \mathrm{RGB})$</div>
</div>

---
section: coordinate-networks
---

# Block 2 Takeaway

<div class="mt-8 rounded-xl border border-blue-200 bg-blue-50 px-6 py-5">
  <div class="text-[.95rem] font-semibold text-blue-900">
    Neural networks can parameterize continuous functions and model signals directly from coordinates.
  </div>
  <div class="mt-3 text-[.76rem] text-blue-700">
    Spectral bias limits plain MLPs. Positional encodings (Fourier features) and sinusoidal activations (SIREN) overcome this by explicitly representing spatial frequencies — echoing Block 1's functional models.
  </div>
</div>

<div class="mt-6 text-[.74rem] text-gray-500">
  Next: what changes when the domain is the Earth?
</div>

---
layout: bonn-section
sectionColor: "#00457c"
section: geographic-inr
sectionTitle: Implicit Neural Representations of Geographic Space
---

# Implicit Neural Representations of Geographic Space

<div class="text-[.9rem] text-gray-700 mt-4">
  Synthesizing Blocks 1 and 2: geometry-aware coordinate encodings meet neural continuous functions.
</div>

<div class="text-[.72rem] text-gray-500 mt-4">
  Earth geometry → geographic coordinate encodings → spherical harmonic networks → geographic neural fields → location embeddings
</div>

---
section: geographic-inr
---

# What Changes When the Domain Is the Earth?

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Euclidean image plane</div>
    <ul class="text-[.73rem] text-gray-600 space-y-1 list-disc pl-4">
      <li>Flat, periodic domain</li>
      <li>Uniform distance metric</li>
      <li>$(x, y)$ coordinates well-defined</li>
      <li>Fourier features work directly</li>
    </ul>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">The sphere</div>
    <ul class="text-[.73rem] text-blue-800 space-y-1 list-disc pl-4">
      <li>Longitude is discontinuous (−180°/+180°)</li>
      <li>Poles have degenerate coordinates</li>
      <li>Spherical geometry, not Euclidean</li>
      <li>Distance in lat/lon is non-uniform</li>
    </ul>
  </div>
</div>

<div class="mt-4 text-[.74rem] text-gray-600">
  Coordinate encodings designed for flat space may fail or distort when applied naively to geographic coordinates.
</div>

---
section: geographic-inr
---

# Geographic Coordinates Are Not Just x and y

<div class="grid grid-cols-2 gap-4 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-1">Latitude / longitude</div>
    <div class="text-[.72rem] text-gray-600">Simple but discontinuous; non-uniform distances</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-1">3D Cartesian on sphere</div>
    <div class="text-[.72rem] text-gray-600">Continuous and uniform; constrains $x^2+y^2+z^2=1$</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-1">Fourier features</div>
    <div class="text-[.72rem] text-gray-600">Fast; may distort at poles and date line</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-1">Spherical harmonics / Laplacian</div>
    <div class="text-[.72rem] text-blue-800">Geometry-aware; respects spherical topology</div>
  </div>
</div>

<div class="mt-4 text-[.72rem] text-gray-500">
  The choice of coordinate encoding determines how well the model respects the geometry of geographic space.
</div>

---
section: geographic-inr
---

# Geometry-Aware Coordinate Encodings

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      Reconnecting to Block 1: spherical harmonics can serve not only as a complete field model, but also as a <strong>coordinate encoding</strong> for a neural network.
    </div>
    <div class="font-mono text-[.8rem] bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-3 text-center">
      $p \;\rightarrow\; Y_{\ell m}(p)$
    </div>
    <div class="text-[.73rem] text-gray-600">
      Map geographic location $p = (\theta, \lambda)$ to a vector of spherical harmonic values as features.
    </div>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add figure showing lat/lon coordinate → SH feature vector → MLP -->
    <div class="text-[.68rem] text-gray-400 text-center">[ geographic coord → SH encoding → MLP ]</div>
  </div>
</div>

---
section: geographic-inr
---

# Spherical Harmonics + Neural Network

<div class="mt-5 flex items-center justify-center gap-3 flex-wrap">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-[.8rem]">$p$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-mono text-[.78rem]">SH features<br>$Y_{\ell m}(p)$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-mono text-[.8rem]">$\mathrm{MLP}_\theta$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-[.8rem]">$y(p)$</div>
</div>

<div class="mt-8 text-[.76rem] text-gray-600">
  The spherical harmonic encoding provides a <strong>geometry-aware</strong> positional representation that respects spherical topology before the neural network processes it.
</div>

<div class="mt-3 text-[.7rem] text-gray-400">
  <!-- TODO: cite relevant papers (e.g. Rußwurm et al., SatCLIP, or geographic field prediction with SH encodings) -->
</div>

---
section: geographic-inr
---

# Spherical Harmonics + SIREN

<div class="mt-5 flex items-center justify-center gap-3 flex-wrap">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-[.8rem]">$p$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-mono text-[.78rem]">$Y_{\ell m}(p)$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-mono text-[.8rem]">$\mathrm{SIREN}_\theta$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-[.8rem]">$y(p)$</div>
</div>

<div class="grid grid-cols-2 gap-4 mt-6">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.72rem] text-gray-600">
    <strong>Spherical harmonics</strong><br>
    Geometry-aware positional features; respect spherical topology
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[.72rem] text-blue-800">
    <strong>SIREN</strong><br>
    Nonlinear high-frequency modeling capacity beyond the SH basis
  </div>
</div>

---
section: geographic-inr
---

# Residual Implicit Networks

<div class="mt-5 text-[.82rem] text-gray-700 mb-5">
  Residual coordinate network variants (e.g. ResIREN) extend the basic SIREN with skip connections:
</div>

<div class="flex items-center justify-center gap-3 my-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-[.78rem]">$p$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[.78rem]">encoding</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[.78rem]">residual SIREN</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-[.78rem]">$y(p)$</div>
</div>

<div class="text-[.74rem] text-gray-500">
  <!-- TODO: add figure comparing SIREN vs ResIREN convergence curves or frequency response -->
</div>

---
section: geographic-inr
---

# One Global Network or Many Local Networks?

<div class="grid grid-cols-2 gap-4 mt-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">One global MLP</div>
    <div class="text-[.72rem] text-gray-600">Single network for the entire Earth. Simple but may lack local resolution.</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Multiple local MLPs</div>
    <div class="text-[.72rem] text-gray-600">One network per tile or region. High resolution; costly to scale.</div>
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Hierarchical / multi-scale</div>
    <div class="text-[.72rem] text-gray-600">Coarse global + fine local network. Balanced capacity and resolution.</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-2">Mixture-of-experts</div>
    <div class="text-[.72rem] text-blue-800">Dynamic routing to specialized sub-networks per location or scale.</div>
  </div>
</div>

<div class="mt-4 text-[.72rem] text-gray-500">
  Scaling continuous neural fields to large geographic domains is an active research direction.
</div>

---
section: geographic-inr
---

# Geographic Neural Fields

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      General supervised formulation:
    </div>
    <div class="font-mono text-[.76rem] bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-4">
      $(p_i, y_i) \;\rightarrow\; f_\theta(p) \rightarrow y$
    </div>
    <div class="text-[.74rem] text-gray-600 mb-3">Possible output signals:</div>
    <ul class="text-[.72rem] text-gray-600 space-y-1 list-disc pl-4">
      <li>Climate variables</li>
      <li>Elevation</li>
      <li>Land cover / land use</li>
      <li>Population density</li>
      <li>Ecological observations</li>
    </ul>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add example: global temperature or elevation neural field prediction map -->
    <div class="text-[.68rem] text-gray-400 text-center">[ predicted geographic signal map ]</div>
  </div>
</div>

---
section: geographic-inr
---

# Species Observations as a Spatial Signal

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.78rem] text-gray-700 mb-4">
      Biodiversity observations (e.g. iNaturalist) provide sparse, presence-only spatial data:
    </div>
    <div class="font-mono text-[.76rem] bg-gray-50 border border-gray-200 rounded px-4 py-3 mb-4">
      $\text{location} \rightarrow P(\text{species} \mid \text{location})$
    </div>
    <div class="text-[.74rem] text-gray-600">
      A geographic neural field can estimate species distribution continuously from irregular observations.
    </div>
  </div>
  <div class="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-4">
    <!-- TODO: add iNaturalist observation map + predicted species distribution -->
    <div class="text-[.68rem] text-gray-400 text-center">[ species observation points → predicted distribution ]</div>
  </div>
</div>

---
section: geographic-inr
---

# From Signal Prediction to Location Representation

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Signal model</div>
    <div class="font-mono text-[.8rem] bg-white border border-gray-200 rounded px-4 py-3 mb-3">
      $f_\theta(p) \rightarrow y$
    </div>
    <div class="text-[.72rem] text-gray-600">Predict one specific output (temperature, species, elevation) at any location.</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Location encoder</div>
    <div class="font-mono text-[.8rem] bg-white border border-blue-100 rounded px-4 py-3 mb-3">
      $p \;\xrightarrow{e_\theta}\; z(p) \rightarrow y$
    </div>
    <div class="text-[.72rem] text-blue-800">Learn a <em>reusable</em> representation $z(p)$ that can support many downstream tasks.</div>
  </div>
</div>

---
section: geographic-inr
---

# Location Encoders

<div class="mt-4 flex items-center justify-center gap-4 my-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-[.8rem]">$p$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-mono text-[.8rem]">$e_\theta$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 font-mono text-[.8rem]">$z(p) \in \mathbb{R}^d$</div>
</div>

<div class="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-[.82rem] text-blue-900">
  The output is a <strong>reusable representation</strong> of geographic location, rather than a prediction for one particular signal.
</div>

<div class="mt-4 text-[.74rem] text-gray-600">
  This is analogous to how image encoders learn general visual features rather than predicting a fixed label. The downstream task uses $z(p)$ as input rather than the raw coordinate.
</div>

---
section: geographic-inr
---

# GeoCLIP-Like Location Representations

<div class="mt-5 text-[.82rem] text-gray-700 mb-5">
  Multimodal and contrastive learning approaches train location encoders by aligning geographic coordinates with other modalities (images, text, remote sensing).
</div>

<div class="flex items-center justify-center gap-4 my-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.78rem]">Location $p$</div>
  <div class="text-gray-400 text-xl">→</div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[.78rem]">$z(p)$</div>
  <div class="text-gray-400 text-xl">↕ align</div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[.78rem]">Image / text embedding</div>
</div>

<div class="text-[.72rem] text-gray-500">
  Contrastive learning details are covered in a later lecture. Here the key point is that the location encoder output is a general-purpose geographic embedding.
  <!-- TODO: cite GeoCLIP, SatCLIP, or related works -->
</div>

---
section: geographic-inr
---

# Signal Model or Representation Model?

<div class="grid grid-cols-3 gap-4 mt-5">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-gray-500 mb-3">Implicit signal model</div>
    <div class="font-mono text-[.78rem] bg-white border border-gray-200 rounded px-3 py-2 mb-2 text-center">
      $p \rightarrow y$
    </div>
    <div class="text-[.68rem] text-gray-500">One network, one output type. Train and use for a specific signal.</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Location encoder</div>
    <div class="font-mono text-[.78rem] bg-white border border-blue-100 rounded px-3 py-2 mb-2 text-center">
      $p \rightarrow z$
    </div>
    <div class="text-[.68rem] text-blue-700">Reusable embedding of location. Downstream task uses $z$.</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-600 mb-3">Downstream task</div>
    <div class="font-mono text-[.78rem] bg-white border border-blue-100 rounded px-3 py-2 mb-2 text-center">
      $z \rightarrow y$
    </div>
    <div class="text-[.68rem] text-blue-700">Lightweight head applied to the fixed location representation.</div>
  </div>
</div>

---
section: geographic-inr
---

# Design Space of Geographic INRs

<div class="grid grid-cols-3 gap-3 mt-4 text-[.7rem]">
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <div class="font-bold text-gray-500 uppercase tracking-wide text-[.6rem] mb-1">Domain</div>
    plane · sphere · manifold
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <div class="font-bold text-gray-500 uppercase tracking-wide text-[.6rem] mb-1">Coordinate encoding</div>
    raw lat/lon · Fourier · spherical harmonics · Laplacian
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <div class="font-bold text-gray-500 uppercase tracking-wide text-[.6rem] mb-1">Neural model</div>
    MLP · SIREN · residual network
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <div class="font-bold text-gray-500 uppercase tracking-wide text-[.6rem] mb-1">Scale</div>
    global · local · hierarchical
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <div class="font-bold text-gray-500 uppercase tracking-wide text-[.6rem] mb-1">Output</div>
    signal · probability · embedding
  </div>
  <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
    <div class="font-bold text-gray-500 uppercase tracking-wide text-[.6rem] mb-1">Training</div>
    supervised · multimodal · self-supervised
  </div>
</div>

---
section: geographic-inr
---

# Neural Fields of the Earth

<div class="mt-5 flex items-center justify-center">
  <div class="rounded-xl border border-blue-200 bg-blue-50 px-6 py-5 flex items-center gap-4 flex-wrap justify-center">
    <div class="font-mono text-[.82rem]">Earth coordinate</div>
    <div class="text-gray-400 text-xl">→</div>
    <div class="font-mono text-[.82rem]">geometry-aware encoding</div>
    <div class="text-gray-400 text-xl">→</div>
    <div class="font-mono text-[.82rem]">neural function</div>
    <div class="text-gray-400 text-xl">→</div>
    <div class="rounded-xl border border-blue-300 bg-white px-4 py-3 font-mono text-[.78rem]">
      geospatial signal<br>— or —<br>location embedding
    </div>
  </div>
</div>

<div class="mt-6 text-[.74rem] text-gray-500 text-center">
  <!-- TODO: add a large diagram connecting all three blocks visually -->
</div>

---
section: geographic-inr
---

# Lecture Synthesis

<div class="grid grid-cols-3 gap-4 mt-4">
  <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-2">Block 1</div>
    <div class="text-[.72rem] font-semibold text-gray-700 mb-2">Functional Models of the Earth</div>
    <div class="font-mono text-[.7rem] bg-white border border-gray-200 rounded px-3 py-2">
      $p \rightarrow \phi(p) \rightarrow y$
    </div>
    <div class="text-[.65rem] text-gray-500 mt-2">Fixed basis; fitted coefficients</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-600 mb-2">Block 2</div>
    <div class="text-[.72rem] font-semibold text-blue-800 mb-2">Neural Networks for Continuous Signals</div>
    <div class="font-mono text-[.7rem] bg-white border border-blue-100 rounded px-3 py-2">
      $p \rightarrow \gamma(p) \rightarrow f_\theta \rightarrow y$
    </div>
    <div class="text-[.65rem] text-blue-600 mt-2">Learned encoding; learned function</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-600 mb-2">Block 3</div>
    <div class="text-[.72rem] font-semibold text-blue-800 mb-2">Implicit Neural Representations of Geographic Space</div>
    <div class="font-mono text-[.7rem] bg-white border border-blue-100 rounded px-3 py-2">
      $p \rightarrow \text{geo encoding} \rightarrow f_\theta \rightarrow y \text{ or } z$
    </div>
    <div class="text-[.65rem] text-blue-600 mt-2">Geometry-aware; signal or embedding</div>
  </div>
</div>

<div class="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-5 py-3 text-[.8rem] text-blue-900">
  Geospatial information can be stored <strong>explicitly</strong> at discrete locations, or <strong>implicitly</strong> through the parameters of a continuous function that can be queried throughout space.
</div>

<!--
LEGACY SLIDES — original Lecture 6 opening content preserved below
-->

---

# Location Encoders &amp; Spatial Embeddings

## Representing space continuously

<!--
Original Lecture 6 title slide — preserved for reference.
-->

---

# In this lecture (original outline)

- Coordinates as model inputs
- Positional and coordinate encodings
- Location encoders
- Spatial embeddings
- Implicit neural representations and continuous spatial functions

<!--
Original opening outline — kept for reference as the new scaffold develops.
-->
