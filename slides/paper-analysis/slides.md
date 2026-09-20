---
addons:
  - "../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Paper Analysis
home: ../
---

# Paper Analysis

## From foundations to current research in representation learning

<div class="mt-6 text-[.72rem] text-gray-400 tracking-wide">
Four sessions · Five papers · Group presentations · Joint synthesis
</div>

<!--
Overview deck for the Paper Analysis phase (Phase 2) of the GRL course.
Sessions: Nov 27 · Dec 4 · Dec 11 · Dec 18
-->

---

# Four Paper Analysis Sessions

<div class="grid grid-cols-4 gap-3 mt-5">

  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.55rem] font-bold uppercase tracking-widest text-blue-500 mb-1">Session 1 · Nov 27</div>
    <div class="text-[.73rem] font-semibold text-blue-900 mb-2 leading-snug">Implicit Neural Representations & Approximation</div>
    <ul class="text-[.62rem] text-blue-700 space-y-0.5 list-disc pl-3">
      <li>Continuous neural representations</li>
      <li>Function approximation</li>
      <li>Coordinate-based networks</li>
      <li>Fourier features and neural fields</li>
    </ul>
  </div>

  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.55rem] font-bold uppercase tracking-widest text-blue-500 mb-1">Session 2 · Dec 4</div>
    <div class="text-[.73rem] font-semibold text-blue-900 mb-2 leading-snug">Location Encoders</div>
    <ul class="text-[.62rem] text-blue-700 space-y-0.5 list-disc pl-3">
      <li>Representing geographic coordinates</li>
      <li>Spatial inductive biases</li>
      <li>Spherical geometry</li>
      <li>Learned location representations</li>
    </ul>
  </div>

  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.55rem] font-bold uppercase tracking-widest text-blue-500 mb-1">Session 3 · Dec 11</div>
    <div class="text-[.73rem] font-semibold text-blue-900 mb-2 leading-snug">Self-Supervised Representation Learning</div>
    <ul class="text-[.62rem] text-blue-700 space-y-0.5 list-disc pl-3">
      <li>Contrastive learning</li>
      <li>Self-distillation</li>
      <li>Masked reconstruction</li>
      <li>Multimodal representation learning</li>
    </ul>
  </div>

  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.55rem] font-bold uppercase tracking-widest text-blue-500 mb-1">Session 4 · Dec 18</div>
    <div class="text-[.73rem] font-semibold text-blue-900 mb-2 leading-snug">Geospatial Embeddings</div>
    <ul class="text-[.62rem] text-blue-700 space-y-0.5 list-disc pl-3">
      <li>Earth representations</li>
      <li>Explicit and implicit embeddings</li>
      <li>Global embedding systems</li>
      <li>Understanding embedding spaces</li>
    </ul>
  </div>

</div>

<div class="mt-5 flex items-center gap-2 justify-center text-[.65rem] text-gray-500 flex-wrap">
  <span class="rounded bg-blue-100 text-blue-700 px-2 py-0.5 font-medium">INRs</span>
  <span class="text-gray-300">→</span>
  <span class="rounded bg-blue-100 text-blue-700 px-2 py-0.5 font-medium">Location Encoders</span>
  <span class="text-gray-300">→</span>
  <span class="rounded bg-blue-100 text-blue-700 px-2 py-0.5 font-medium">Self-Supervised Learning</span>
  <span class="text-gray-300">→</span>
  <span class="rounded bg-blue-100 text-blue-700 px-2 py-0.5 font-medium">Geospatial Embeddings</span>
</div>

---

# Your Paper Presentation

<div class="text-[.74rem] text-gray-600 mt-1 mb-4">Each group presents one paper · ~20 minutes · explain, don't just summarize</div>

<div class="grid grid-cols-2 gap-3">

  <div class="flex flex-col gap-2">
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-0.5">1 — Problem &amp; Motivation</div>
      <div class="text-[.66rem] text-gray-600">What problem is this paper addressing? Why does it matter?</div>
    </div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-0.5">2 — Main Idea</div>
      <div class="text-[.66rem] text-gray-600">What is the central contribution? Explain it in your own words.</div>
    </div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-0.5">3 — Technical Method</div>
      <div class="text-[.66rem] text-gray-600">Key mechanism, representation, architecture, or mathematical idea. Focus on why it works.</div>
    </div>
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-0.5">4 — Evidence &amp; Results</div>
      <div class="text-[.66rem] text-gray-600">Which experiments support the claims? Most important results?</div>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      <div class="text-[.6rem] font-bold uppercase tracking-wide text-gray-500 mb-0.5">5 — Limitations</div>
      <div class="text-[.66rem] text-gray-600">What does the method not solve? What assumptions or weaknesses should we know?</div>
    </div>
    <div class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
      <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-600 mb-0.5">6 — Technical Impact</div>
      <div class="text-[.66rem] text-blue-800">What did this paper introduce, popularize, clarify, or enable? How does it connect to the other session papers?</div>
    </div>
    <div class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
      <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-600 mb-0.5">7 — Two Exam Questions</div>
      <div class="text-[.66rem] text-blue-800">Open-ended understanding questions + answer sketch. Test concepts, not facts.</div>
    </div>
    <div class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
      <div class="text-[.6rem] font-bold uppercase tracking-wide text-amber-700 mb-0.5">Avoid → Prefer</div>
      <div class="text-[.63rem] text-amber-800 italic mb-0.5">"Which dataset did the authors use?"</div>
      <div class="text-[.63rem] text-amber-900 font-medium">"Why does the method need this representation, and what would likely happen without it?"</div>
    </div>
  </div>

</div>

---

# Paper Analysis — Session Timeline

<div class="grid grid-cols-2 gap-4 mt-3">

  <!-- Morning block -->
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.6rem] font-bold uppercase tracking-widest text-blue-600 mb-3">Morning · 10:00–12:00</div>
    <div class="flex flex-col gap-1.5">
      <div class="flex gap-2 items-start">
        <div class="shrink-0 font-mono text-[.6rem] text-blue-400 w-16 pt-0.5">10:00–10:10</div>
        <div class="rounded bg-blue-100 text-blue-800 text-[.64rem] px-2 py-1 flex-1">Topic framing / introduction</div>
      </div>
      <div class="flex gap-2 items-start">
        <div class="shrink-0 font-mono text-[.6rem] text-blue-400 w-16 pt-0.5">10:10–10:40</div>
        <div class="rounded bg-white border border-blue-200 text-blue-800 text-[.64rem] px-2 py-1 flex-1">Group 1 <span class="text-blue-400 text-[.58rem]">~20 min + ~10 min discussion</span></div>
      </div>
      <div class="flex gap-2 items-start">
        <div class="shrink-0 font-mono text-[.6rem] text-blue-400 w-16 pt-0.5">10:40–11:10</div>
        <div class="rounded bg-white border border-blue-200 text-blue-800 text-[.64rem] px-2 py-1 flex-1">Group 2 <span class="text-blue-400 text-[.58rem]">~20 min + ~10 min discussion</span></div>
      </div>
      <div class="flex gap-2 items-start">
        <div class="shrink-0 font-mono text-[.6rem] text-blue-400 w-16 pt-0.5">11:10–11:40</div>
        <div class="rounded bg-white border border-blue-200 text-blue-800 text-[.64rem] px-2 py-1 flex-1">Group 3 <span class="text-blue-400 text-[.58rem]">~20 min + ~10 min discussion</span></div>
      </div>
      <div class="flex gap-2 items-start">
        <div class="shrink-0 font-mono text-[.6rem] text-blue-400 w-16 pt-0.5">11:40–12:00</div>
        <div class="rounded bg-blue-100 text-blue-800 text-[.64rem] px-2 py-1 flex-1">Cross-paper discussion / buffer</div>
      </div>
    </div>
  </div>

  <!-- Right column: break + afternoon -->
  <div class="flex flex-col gap-3">

    <div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-center">
      <div class="text-[.6rem] font-bold uppercase tracking-widest text-gray-400">Break · 12:00–13:00</div>
    </div>

    <div class="rounded-xl border border-blue-200 bg-blue-50 p-4 flex-1">
      <div class="text-[.6rem] font-bold uppercase tracking-widest text-blue-600 mb-3">Afternoon · 13:00–15:00</div>
      <div class="flex flex-col gap-1.5">
        <div class="flex gap-2 items-start">
          <div class="shrink-0 font-mono text-[.6rem] text-blue-400 w-16 pt-0.5">13:00–13:30</div>
          <div class="rounded bg-white border border-blue-200 text-blue-800 text-[.64rem] px-2 py-1 flex-1">Group 4 <span class="text-blue-400 text-[.58rem]">~20 min + ~10 min discussion</span></div>
        </div>
        <div class="flex gap-2 items-start">
          <div class="shrink-0 font-mono text-[.6rem] text-blue-400 w-16 pt-0.5">13:30–14:00</div>
          <div class="rounded bg-white border border-blue-200 text-blue-800 text-[.64rem] px-2 py-1 flex-1">Group 5 <span class="text-blue-400 text-[.58rem]">~20 min + ~10 min discussion</span></div>
        </div>
        <div class="flex gap-2 items-start">
          <div class="shrink-0 font-mono text-[.6rem] text-blue-400 w-16 pt-0.5">14:00–14:50</div>
          <div class="rounded bg-blue-700 text-white text-[.64rem] px-2 py-1.5 flex-1 font-medium">
            Synthesis discussion across all five papers
            <div class="text-[.58rem] text-blue-200 font-normal mt-0.5">What do the five papers collectively tell us? How do they differ? How did they advance the field?</div>
          </div>
        </div>
        <div class="flex gap-2 items-start">
          <div class="shrink-0 font-mono text-[.6rem] text-blue-400 w-16 pt-0.5">14:50–15:00</div>
          <div class="rounded bg-blue-100 text-blue-800 text-[.64rem] px-2 py-1 flex-1">Wrap-up + assignment of next session's papers</div>
        </div>
      </div>
    </div>

  </div>

</div>

---

# Session 1 — Implicit Neural Representations & Approximation

<div class="flex items-baseline gap-3 mb-1">
  <div class="text-[.65rem] font-bold uppercase tracking-widest text-blue-500">November 27</div>
  <div class="text-[.7rem] text-gray-500 italic">How can neural networks represent continuous signals, functions, and scenes?</div>
</div>

<div class="flex flex-col gap-1.5 mt-2">

  <!-- 1 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-gray-200 text-gray-600 rounded px-1.5 py-0.5">1 · Review</span></div>
    <div class="min-w-0">
      <a href="https://doi.org/10.1111/cgf.14505" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">Neural Fields in Visual Computing and Beyond</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Xie, Takikawa, Saito, Litany et al. · <em>Computer Graphics Forum</em> 41(2), 2022</div>
      <!-- Full: Xie, Y., Takikawa, T., Saito, S., Litany, O., Yan, S., Khan, N., Tombari, F., Tompkin, J., Sitzmann, V., & Sridhar, S. (2022). -->
    </div>
  </div>

  <!-- 2 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">2 · SIREN</span></div>
    <div class="min-w-0">
      <a href="https://arxiv.org/abs/2006.09661" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">Implicit Neural Representations with Periodic Activation Functions</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Sitzmann, Martel, Bergman, Lindell, Wetzstein · <em>NeurIPS 2020</em></div>
    </div>
  </div>

  <!-- 3 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">3 · Fourier Features</span></div>
    <div class="min-w-0">
      <a href="https://arxiv.org/abs/2006.10739" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">Fourier Features Let Networks Learn High Frequency Functions in Low Dimensional Domains</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Tancik, Srinivasan, Mildenhall, Fridovich-Keil et al. · <em>NeurIPS 2020</em></div>
      <!-- Full: Tancik, M., Srinivasan, P. P., Mildenhall, B., Fridovich-Keil, S., Raghavan, N., Singhal, U., Ramamoorthi, R., Barron, J. T., & Ng, R. -->
    </div>
  </div>

  <!-- 4 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">4 · NeRF</span></div>
    <div class="min-w-0">
      <a href="https://www.ecva.net/papers/eccv_2020/papers_ECCV/html/1473_ECCV_2020_paper.php" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Mildenhall, Srinivasan, Tancik, Barron, Ramamoorthi, Ng · <em>ECCV 2020</em></div>
    </div>
  </div>

  <!-- 5 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-gray-200 text-gray-600 rounded px-1.5 py-0.5">5 · Generalisation</span></div>
    <div class="min-w-0">
      <a href="https://arxiv.org/abs/2205.15674" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">Generalised Implicit Neural Representations</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Grattarola, Vandergheynst · 2022</div>
    </div>
  </div>

</div>

<div class="mt-3 text-[.6rem] text-gray-400">
  Synthesis theme: representation → frequency → architecture → application → generalization
</div>

---

# Session 2 — Location Encoders

<div class="flex items-baseline gap-3 mb-1">
  <div class="text-[.65rem] font-bold uppercase tracking-widest text-blue-500">December 4</div>
  <div class="text-[.7rem] text-gray-500 italic">How should a machine-learning model represent a location on Earth?</div>
</div>

<div class="flex flex-col gap-1.5 mt-2">

  <!-- 1 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-gray-200 text-gray-600 rounded px-1.5 py-0.5">1 · Review</span></div>
    <div class="min-w-0">
      <a href="https://doi.org/10.1080/13658816.2021.2004602" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">A Review of Location Encoding for GeoAI: Methods and Applications</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Mai, Janowicz, Hu, Gao et al. · <em>Int. J. Geographical Information Science</em> 36(4), 2022</div>
      <!-- Full: Mai, G., Janowicz, K., Hu, Y., Gao, S., Yan, B., Zhu, R., Cai, L., & Lao, N. -->
    </div>
  </div>

  <!-- 2 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">2 · SH + SIREN</span></div>
    <div class="min-w-0">
      <a href="https://proceedings.iclr.cc/paper_files/paper/2024/hash/073c8584ef86bee26fe9d639ec648e28-Abstract-Conference.html" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">Geographic Location Encoding with Spherical Harmonics and Sinusoidal Representation Networks</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Rußwurm, Klemmer, Rolf, Zbinden, Tuia · <em>ICLR 2024</em></div>
    </div>
  </div>

  <!-- 3 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">3 · Spatial INR</span></div>
    <div class="min-w-0">
      <a href="https://proceedings.mlr.press/v202/cole23a.html" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">Spatial Implicit Neural Representations for Global-Scale Species Mapping</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Cole, Van Horn, Lange, Shepard et al. · <em>ICML 2023</em>, PMLR 202:6320–6342</div>
      <!-- Full: Cole, E., Van Horn, G., Lange, C., Shepard, A., Leary, P., Perona, P., Loarie, S., & Mac Aodha, O. -->
    </div>
  </div>

  <!-- 4 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">4 · Spherical Attn</span></div>
    <div class="min-w-0">
      <a href="https://proceedings.neurips.cc/paper_files/paper/2025/hash/58fb4d7e4e5e6e03ff244b5e39805e98-Abstract-Conference.html" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">Attention on the Sphere</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Bonev, Rietmann, Paris, Carpentieri, Kurth · <em>NeurIPS 2025</em></div>
    </div>
  </div>

  <!-- 5 TBA -->
  <div class="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-gray-100 text-gray-400 rounded px-1.5 py-0.5">5 · TBA</span></div>
    <div class="min-w-0">
      <div class="text-[.72rem] text-gray-400 italic">Paper 5 — to be announced</div>
    </div>
  </div>

</div>

<div class="mt-3 text-[.6rem] text-gray-400">
  Synthesis theme: where should spatial geometry enter the model — encoding, representation, or architecture?
</div>

---

# Session 3 — Self-Supervised Representation Learning

<div class="flex items-baseline gap-3 mb-1">
  <div class="text-[.65rem] font-bold uppercase tracking-widest text-blue-500">December 11</div>
  <div class="text-[.7rem] text-gray-500 italic">How can useful representations emerge without task-specific labels?</div>
</div>

<div class="flex flex-col gap-1.5 mt-2">

  <!-- 1 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">1 · SimCLR</span></div>
    <div class="min-w-0">
      <a href="https://proceedings.mlr.press/v119/chen20j.html" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">A Simple Framework for Contrastive Learning of Visual Representations</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Chen, Kornblith, Norouzi, Hinton · <em>ICML 2020</em>, PMLR 119:1597–1607</div>
    </div>
  </div>

  <!-- 2 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">2 · DINO</span></div>
    <div class="min-w-0">
      <a href="https://openaccess.thecvf.com/content/ICCV2021/html/Caron_Emerging_Properties_in_Self-Supervised_Vision_Transformers_ICCV_2021_paper.html" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">Emerging Properties in Self-Supervised Vision Transformers</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Caron, Touvron, Misra, Jégou et al. · <em>ICCV 2021</em>, pp. 9650–9660</div>
      <!-- Full: Caron, M., Touvron, H., Misra, I., Jégou, H., Mairal, J., Bojanowski, P., & Joulin, A. -->
    </div>
  </div>

  <!-- 3 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">3 · MAE</span></div>
    <div class="min-w-0">
      <a href="https://openaccess.thecvf.com/content/CVPR2022/html/He_Masked_Autoencoders_Are_Scalable_Vision_Learners_CVPR_2022_paper.html" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">Masked Autoencoders Are Scalable Vision Learners</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">He, Chen, Xie, Li, Dollár, Girshick · <em>CVPR 2022</em>, pp. 16000–16009</div>
    </div>
  </div>

  <!-- 4 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">4 · CLIP</span></div>
    <div class="min-w-0">
      <a href="https://proceedings.mlr.press/v139/radford21a.html" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">Learning Transferable Visual Models From Natural Language Supervision</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Radford, Kim, Hallacy, Ramesh et al. · <em>ICML 2021</em>, PMLR 139:8748–8763</div>
      <!-- Full: Radford, A., Kim, J. W., Hallacy, C., Ramesh, A., Goh, G., Agarwal, S., Sastry, G., Askell, A., Mishkin, P., Clark, J., Krueger, G., & Sutskever, I. -->
    </div>
  </div>

  <!-- 5 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-gray-200 text-gray-600 rounded px-1.5 py-0.5">5 · Analysis</span></div>
    <div class="min-w-0">
      <a href="https://openreview.net/forum?id=azCKuYyS74" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">What Do Self-Supervised Vision Transformers Learn?</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Park, Kim, Heo, Kim, Yun · <em>ICLR 2023</em></div>
    </div>
  </div>

</div>

<div class="mt-3 flex items-center gap-1.5 text-[.6rem] text-gray-400 flex-wrap">
  <span>contrastive</span><span class="text-gray-300">→</span>
  <span>self-distillation</span><span class="text-gray-300">→</span>
  <span>masked reconstruction</span><span class="text-gray-300">→</span>
  <span>multimodal contrastive</span><span class="text-gray-300">→</span>
  <span>representation analysis</span>
</div>

---

# Session 4 — Geospatial Embeddings

<div class="flex items-baseline gap-3 mb-1">
  <div class="text-[.65rem] font-bold uppercase tracking-widest text-blue-500">December 18</div>
  <div class="text-[.7rem] text-gray-500 italic">Can information about the Earth be compressed into reusable embedding spaces?</div>
</div>

<div class="flex flex-col gap-1.5 mt-2">

  <!-- 1 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-gray-200 text-gray-600 rounded px-1.5 py-0.5">1 · Perspective</span></div>
    <div class="min-w-0">
      <a href="https://doi.org/10.1109/MGRS.2026.3710416" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">Earth Embeddings: Toward Artificial Intelligence-Centric Representations of Our Planet</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Klemmer, Rolf, Rußwurm, Camps-Valls et al. · <em>IEEE Geoscience and Remote Sensing Magazine</em>, 2026</div>
      <!-- Full: Klemmer, K., Rolf, E., Rußwurm, M., Camps-Valls, G., Czerkawski, M., Ermon, S., Francis, A., Jacobs, N., Kerner, H., Mackey, L., Mai, G., Mac Aodha, O., Reichstein, M., Robinson, C., Rolnick, D., Shelhamer, E., Sitzmann, V., Tuia, D., & Zhu, X. -->
    </div>
  </div>

  <!-- 2 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">2 · AlphaEarth</span></div>
    <div class="min-w-0">
      <a href="https://arxiv.org/abs/2507.22291" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">AlphaEarth Foundations: An Embedding Field Model for Accurate and Efficient Global Mapping from Sparse Label Data</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Brown, Kazmierski, Pasquarella et al. · 2025</div>
      <!-- Full: Brown, C. F., Kazmierski, M. R., Pasquarella, V. J., Rucklidge, W. J., Samsikova, M., Zhang, C., Shelhamer, E., Lahera, E., Wiles, O., Ilyushchenko, S., Gorelick, N., Zhang, L. L., Alj, S., Schechter, E., Askay, S., Guinan, O., Moore, R., Boukouvalas, A., & Kohli, P. -->
    </div>
  </div>

  <!-- 3 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-gray-200 text-gray-600 rounded px-1.5 py-0.5">3 · Analysis</span></div>
    <div class="min-w-0">
      <a href="https://arxiv.org/abs/2511.02101" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">Measuring the Intrinsic Dimension of Earth Representations</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Rao, Rußwurm, Klemmer, Rolf · 2025/2026</div>
    </div>
  </div>

  <!-- 4 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">4 · SatCLIP</span></div>
    <div class="min-w-0">
      <a href="https://ojs.aaai.org/index.php/AAAI/article/view/32457" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">SatCLIP: Global, General-Purpose Location Embeddings with Satellite Imagery</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Klemmer, Rolf, Robinson, Mackey, Rußwurm · <em>AAAI 2025</em>, 39(4):4347–4355</div>
    </div>
  </div>

  <!-- 5 -->
  <div class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 flex gap-3 items-start">
    <div class="shrink-0 mt-0.5"><span class="text-[.55rem] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">5 · TESSERA</span></div>
    <div class="min-w-0">
      <a href="https://openaccess.thecvf.com/content/CVPR2026/papers/Feng_TESSERA_Temporal_Embeddings_of_Surface_Spectra_for_Earth_Representation_and_CVPR_2026_paper.pdf" target="_blank" class="text-[.72rem] font-semibold text-blue-700 hover:underline leading-snug block">TESSERA: Temporal Embeddings of Surface Spectra for Earth Representation and Analysis</a>
      <div class="text-[.6rem] text-gray-500 mt-0.5">Feng, Atzberger, Jaffer, Knezevic et al. · <em>CVPR 2026</em></div>
      <!-- Full: Feng, Z., Atzberger, C., Jaffer, S., Knezevic, J., Sormunen, S., Young, R., Lisaius, M. C., Immitzer, M., Jackson, T., Ball, J., Coomes, D. A., Madhavapeddy, A., Blake, A., & Keshav, S. -->
    </div>
  </div>

</div>

<div class="mt-3 text-[.6rem] text-gray-400">
  Synthesis theme: What is an Earth embedding, what information does it contain, and how should we evaluate it?
</div>
