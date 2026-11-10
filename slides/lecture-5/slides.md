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
subhead: Lecture 5
home: ../
---

<script setup>
import AspectsOfLearningDiagram from '../../components/AspectsOfLearningDiagram.vue'
import PixelReshape from '../../components/PixelReshape.vue'
import Lecture1AppleMatrixRepresentation from './components/Lecture1AppleMatrixRepresentation.vue'
</script>

# Deep Representation Learning I

## What is Learning?

<!--
This lecture formalizes supervised learning on structured inputs before introducing deep learning on raw data.
-->

---

# Two Questions for Lectures 4–5

<div class="grid grid-cols-2 gap-8 mt-8">
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-6">
    <div class="text-[.6rem] uppercase tracking-widest text-blue-600 font-bold mb-3">Lecture 4</div>
    <div class="text-[1.05rem] leading-snug font-semibold text-blue-900">How does a neural network learn?</div>
  </div>
  <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
    <div class="text-[.6rem] uppercase tracking-widest text-emerald-600 font-bold mb-3">Lecture 5</div>
    <div class="text-[1.05rem] leading-snug font-semibold text-emerald-900">Why should what it learns work beyond the training data?</div>
  </div>
</div>

<!--
Set up the Lecture 4 → Lecture 5 bridge before technical detail.
Lecture 4 asks how learning works; Lecture 5 asks why learned structure can generalize.
-->

---

# Learning Outcomes Roadmap

<div class="mt-3 text-[.64rem] leading-tight whitespace-nowrap">

| | Learning outcome | Block |
|---|---|---|
| ⬜ | Explain why representation choice determines task difficulty. | Why Learn Representations? |
| ⬜ | Distinguish representation learner vs final decision layer in a network. | Why Learn Representations? |

</div>

<!--
This table is the map for today's three blocks.
We will revisit it as a progress tracker while moving through the lecture.
The ⬜ markers can be swapped to ✅ as outcomes are reached.
-->

---

# Today: Lecture Structure

<div class="text-[.85rem] text-gray-600 mb-5">Builds on Lecture 4: linear and logistic regression, MLPs, gradient descent and backpropagation.</div>

<div class="grid grid-cols-3 gap-4 mt-3">
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-700 mb-2">1</div>
    <div class="text-[.78rem] font-semibold">Why Learn Representations?</div>
  </div>
</div>

<div class="mt-4 text-[.7rem] text-gray-500">Start with representation quality and geometric separability.</div>

<!--
MLPs, gradient descent and backpropagation moved to Lecture 4 (block 3). This lecture builds on them.
TODO: add the further blocks of this lecture.
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: why-learn-representations
sectionTitle: Why Learn Representations?
---

# Why Learn Representations?

<div class="text-[.9rem] text-gray-700 mt-4">
Good representations make hard problems easy.
</div>

<div class="text-[.72rem] text-gray-500 mt-6">From manual feature design to learned representations.</div>

---
section: why-learn-representations
---

# A difficult task is easy in the right form.

## Recap Lecture 1

<div class="grid grid-cols-[2fr_1fr] gap-6 items-start mt-5">

<div class="flex flex-col gap-3">
  <div v-click="1" class="grid grid-cols-[90px_1fr] items-center gap-5 border-b border-gray-200 pb-2">
    <div class="text-[.55rem] font-bold uppercase tracking-wide text-gray-500">Chinese</div>
    <div lang="zh" class="text-[1.05rem] leading-snug text-gray-800">我们的心智已经学会理解这个句子。</div>
  </div>

  <div v-click="2" class="grid grid-cols-[90px_1fr] items-center gap-5 border-b border-gray-200 pb-2">
    <div class="text-[.55rem] font-bold uppercase tracking-wide text-gray-500">Arabic</div>
    <div lang="ar" dir="rtl" class="text-[1.05rem] leading-snug text-gray-800">لقد تعلّم عقلنا أن يفهم هذه الجملة.</div>
  </div>

  <div v-click="3" class="grid grid-cols-[90px_1fr] items-center gap-5 border-b border-gray-200 pb-2">
    <div class="text-[.55rem] font-bold uppercase tracking-wide text-gray-500">Hebrew</div>
    <div lang="he" dir="rtl" class="text-[1.05rem] leading-snug text-gray-800">המוח שלנו למד להבין את המשפט הזה.</div>
  </div>

  <div v-click="4" class="grid grid-cols-[90px_1fr] items-center gap-5 border-b border-gray-200 pb-2">
    <div class="text-[.55rem] font-bold uppercase tracking-wide text-gray-500">Korean</div>
    <div lang="ko" class="text-[1.05rem] leading-snug text-gray-800">우리의 마음은 이 문장을 이해하는 법을 배웠습니다.</div>
  </div>

  <div v-click="5" class="grid grid-cols-[90px_1fr] items-center gap-5 pb-2">
    <div class="text-[.55rem] font-bold uppercase tracking-wide text-gray-500">Latin</div>
    <div lang="en" class="text-[1.05rem] leading-snug text-gray-800">Our mind has learned to understand this sentence.</div>
  </div>
</div>

<div class="flex flex-col items-center">
  <img src="./assets/reading.jpg" class="w-full rounded-lg object-cover max-h-[320px]" alt="A person reading a book, effortlessly parsing a complex language" />
  <div class="text-[.5rem] text-gray-400 mt-2 text-center leading-tight">
    Photo by <a href="https://www.pexels.com/@silverkblack/" target="_blank" rel="noopener noreferrer">Vitaly Gariev</a> on <a href="https://www.pexels.com/@silverkblack/" target="_blank" rel="noopener noreferrer">Pexels</a>
  </div>
</div>

</div>

---
section: why-learn-representations
---

# Choosing Suitable Data Representations

## Recap Lecture 1

<div class="mt-8 grid grid-cols-3 gap-5">
  <div class="min-h-[300px] rounded-xl border p-4">
    <h3>Images</h3>
    <Lecture1AppleMatrixRepresentation :click-index="1" />
  </div>

  <div class="min-h-[300px] rounded-xl border p-4">
    <h3>Math</h3>
    <div class="flex min-h-[238px] flex-col text-center">
      <div class="flex flex-1 flex-col items-center justify-center">
        <div v-click="2" class="rounded border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm tracking-wide text-gray-700">
          XLVII + LXXVIII = ?
        </div>
        <div v-click="3" class="mt-5 font-mono text-sm text-blue-800">
          47 + 78 = 125
        </div>
      </div>
    </div>
  </div>

  <div class="min-h-[300px] rounded-xl border p-4">
    <h3>Places</h3>
    <div v-click="4" class="flex min-h-[238px] flex-col items-center text-center">
      <div class="mt-3 text-xs uppercase tracking-wide text-gray-500">
        Coordinates
      </div>
      <div class="mt-1 break-all font-mono text-sm leading-tight text-gray-700">
        50°43′57.73″ N,<br />
        7°06′16.63″ E
      </div>
      <div v-click="5" class="mt-5">
        <div class="text-xs uppercase tracking-wide text-gray-500">
          Place
        </div>
        <div class="mt-1 text-lg font-semibold text-blue-800">
          Hofgarten, Bonn, Germany
        </div>
      </div>
    </div>
  </div>
</div>

<!--
Let me show this with a few examples. A computer usually sees an image as a matrix of numbers, often between 0 and 255.
[click]
But when we represent those numbers as intensities of light, it becomes much easier for us to see structure in the raw data. Both are valid representations of the same underlying object.
[click]
What is the result of this addition in Roman numerals?
[click]
It is much easier to do math with Arabic numerals. And the shift from Roman numerals to Arabic numerals took roughly 300 to 600 years in the Western world. That gives us a sense of how hard it can be to move to a better but unfamiliar representation.
[click]
Similarly, coordinates are great for databases, but they are hard to read. Place descriptions are easier for people to understand, but they can be ambiguous.
-->

---
section: why-learn-representations
---

# Learning Feature Representations

<img
  src="./assets/feature_learning.svg"
  class="w-full h-[360px] object-contain"
  alt="Training data guides a deep learning model to learn feature representations for classification"
/>

---
section: why-learn-representations
---

# Timeline and Evolution of Deep Learning

<div class="mt-4">
  <div class="flex items-center mb-4">
    <div class="flex-1 bg-[#00457c] text-white text-[.72rem] font-semibold px-4 py-1.5 rounded-l">&lt;2012</div>
    <div class="flex-1 bg-[#0f7d5c] text-white text-[.72rem] font-semibold px-4 py-1.5 text-center border-l border-white/30">2015 onwards</div>
    <div class="flex-1 bg-[#6f2d7f] text-white text-[.72rem] font-semibold px-4 py-1.5 text-right rounded-r border-l border-white/30">&gt;2020 →</div>
  </div>

  <table class="w-full text-[.75rem] border-collapse">
    <thead>
      <tr>
        <th class="bg-[#00457c] !text-white text-left px-3 py-2 font-semibold w-1/3">Classic Machine Learning</th>
        <th class="bg-[#0f7d5c] !text-white text-left px-3 py-2 font-semibold w-1/3 border-l border-white/30">Supervised Deep Learning</th>
        <th class="bg-[#6f2d7f] !text-white text-left px-3 py-2 font-semibold w-1/3 border-l border-white/30">Self-Supervised Learning</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-gray-200">
        <td class="px-3 py-2 align-top bg-[#00457c]/5"><strong>Feature Design:</strong> Which features extract the most information?</td>
        <td class="px-3 py-2 align-top border-l border-gray-200 bg-[#0f7d5c]/5"><strong>Model Design:</strong> Which architecture is best for my tensors?</td>
        <td class="px-3 py-2 align-top border-l border-gray-200 bg-[#6f2d7f]/5"><strong>Loss Design:</strong> Which loss function or training strategy?</td>
      </tr>
      <tr class="border-b border-gray-200">
        <td class="px-3 py-2 bg-[#00457c]/10"><strong>Data:</strong> small labelled</td>
        <td class="px-3 py-2 border-l border-gray-200 bg-[#0f7d5c]/10"><strong>Data:</strong> large labelled</td>
        <td class="px-3 py-2 border-l border-gray-200 bg-[#6f2d7f]/10"><strong>Data:</strong> large unlabelled</td>
      </tr>
      <tr class="border-b border-gray-200">
        <td class="px-3 py-2 bg-[#00457c]/5"><strong>Models:</strong> Random Forest, Boosting, Lin. Regression</td>
        <td class="px-3 py-2 border-l border-gray-200 bg-[#0f7d5c]/5"><strong>Models:</strong> MLPs, CNNs, RNNs</td>
        <td class="px-3 py-2 border-l border-gray-200 bg-[#6f2d7f]/5"><strong>Model:</strong> Transformers</td>
      </tr>
      <tr>
        <td class="px-3 py-2 text-[.68rem] italic font-semibold" style="color:#00457c">Covered in Lectures 3 &amp; 4</td>
        <td class="px-3 py-2 border-l border-gray-200 text-[.68rem] italic font-semibold" style="color:#0f7d5c">Covered in Lectures 5 &amp; 6</td>
        <td class="px-3 py-2 border-l border-gray-200 text-[.68rem] italic font-semibold" style="color:#6f2d7f">Covered from Lecture 7 onwards</td>
      </tr>
    </tbody>
  </table>
</div>

<!--
Historical framing: three eras of machine learning, defined by the central design question.
Classic ML: features are hand-designed. Supervised DL: architecture is the design choice. Self-supervised: the loss/training strategy is the key decision.
-->

---
section: why-learn-representations
---

# Image Classification

<img
  src="./assets/classification.svg"
  class="w-full h-[360px] object-contain"
  alt="An image classification model maps an image tensor to a vector of class probabilities"
/>

---
section: why-learn-representations
---

# Image Segmentation

<img
  src="./assets/segmentation.svg"
  class="w-full h-[360px] object-contain"
  alt="An image segmentation model maps an image tensor to class predictions at each pixel"
/>

---
section: why-learn-representations
---

# Object Detection

<img
  src="./assets/object_detection.svg"
  class="w-full h-[360px] object-contain"
  alt="An object detection model maps an image tensor to bounding boxes described by position, height, and width"
/>

---
section: why-learn-representations
---

# Time Series Classification

<img
  src="./assets/time_series.svg"
  class="w-full h-[360px] object-contain"
  alt="Models classify time series and image time series using their temporal and channel dimensions"
/>


---
section: why-learn-representations
---

# Overview: Deep Model Architectures

## Lab 4 Content

<img src="./assets/architectures.svg" />

---
section: why-learn-representations
---

# Recap: Learned Representations

<div class="grid grid-cols-2 gap-8 mt-6 items-center">

<ul class="flex flex-col gap-4 text-[.85rem] leading-snug">
  <li>Good representations make difficult problems easier.</li>
  <li>In classic machine learning, we manually select data and engineer features to be a good representation of the problem.</li>
  <li>Deep learning models learn a feature representation that is then well-suited for a final linear classification with logistic regression.</li>
</ul>

<img
  src="./assets/model.svg"
  class="w-full h-[300px] object-contain"
  alt="A deep learning model transforms an input tensor through layers into an output tensor"
/>

</div>
