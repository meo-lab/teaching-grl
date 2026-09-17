---
addons:
  - "../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lecture 4
home: ../
---

<script setup>
import AspectsOfLearningDiagram from '../../components/AspectsOfLearningDiagram.vue'
import PixelReshape from '../../components/PixelReshape.vue'
import Lecture1AppleMatrixRepresentation from './components/Lecture1AppleMatrixRepresentation.vue'
import PlotlyHistogram from './components/PlotlyHistogram.vue'
import LinearDecisionBoundaryDemo from './components/LinearDecisionBoundaryDemo.vue'
import LogisticRegressionDemo from './components/LogisticRegressionDemo.vue'
</script>

# Deep Representation Learning I

## What is Learning?

<!--
This lecture formalizes supervised learning on structured inputs before introducing deep learning on raw data.
-->

---

# Two Questions for Lectures 3–4

<div class="grid grid-cols-2 gap-8 mt-8">
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-6">
    <div class="text-[.6rem] uppercase tracking-widest text-blue-600 font-bold mb-3">Lecture 3</div>
    <div class="text-[1.05rem] leading-snug font-semibold text-blue-900">How does a neural network learn?</div>
  </div>
  <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
    <div class="text-[.6rem] uppercase tracking-widest text-emerald-600 font-bold mb-3">Lecture 4</div>
    <div class="text-[1.05rem] leading-snug font-semibold text-emerald-900">Why should what it learns work beyond the training data?</div>
  </div>
</div>

<!--
Set up the Lecture 3 → Lecture 4 bridge before technical detail.
Lecture 3 asks how learning works; Lecture 4 asks why learned structure can generalize.
-->

---

# Learning Outcomes Roadmap

<div class="mt-3 text-[.64rem] leading-tight whitespace-nowrap">

| | Learning outcome | Block |
|---|---|---|
| ⬜ | Explain why representation choice determines task difficulty. | Why Learn Representations? |
| ⬜ | Interpret logistic regression as a linear decision boundary in feature space. | Why Learn Representations? |
| ⬜ | Explain how an MLP learns transformations of feature space. | Multilayer Perceptrons |
| ⬜ | Distinguish representation learner vs final decision layer in a network. | Multilayer Perceptrons |
| ⬜ | Explain the roles of loss, gradient descent, and backpropagation. | Gradient Descent &amp; Backpropagation |

</div>

<!--
This table is the map for today's three blocks.
We will revisit it as a progress tracker while moving through the lecture.
The ⬜ markers can be swapped to ✅ as outcomes are reached.
-->

---

# Today: Lecture Structure

<div class="text-[.85rem] text-gray-600 mb-5">Three major blocks guide the narrative.</div>

<div class="grid grid-cols-3 gap-4 mt-3">
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-700 mb-2">1</div>
    <div class="text-[.78rem] font-semibold">Why Learn Representations?</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-700 mb-2">2</div>
    <div class="text-[.78rem] font-semibold">Multilayer Perceptrons</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-700 mb-2">3</div>
    <div class="text-[.78rem] font-semibold">Gradient Descent &amp; Backpropagation</div>
  </div>
</div>

<div class="mt-4 text-[.7rem] text-gray-500">Start with representation quality and geometric separability.</div>

<!--
Zoom in on today's scope before the lecture becomes technical.
Students should track progress across the three blocks.
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

# Machine Learning needs good Features

## Recap Lecture 3

<img
  src="./assets/classic_ml.svg"
  class="w-full h-[170px] object-contain -mt-4"
  alt="The classic machine learning pipeline: raw data → feature engineering → feature vector → classifier → prediction"
/>

<div class="grid grid-cols-2 gap-3 mt-1 justify-center">
  <div>
    <div class="text-[.6rem] font-semibold text-gray-500 mb-1">Raw Band: Green</div>
    <div style="height: 140px; width: 300px;">
      <PlotlyHistogram dataset="green" x-label="Green reflectance" :show-legend="false" />
    </div>
  </div>
  <div class="mx-auto w-[280px]">
    <div class="text-[.6rem] font-semibold text-gray-500 mb-1">Engineered Feature: NDVI</div>
    <div style="height: 140px; width: 300px;">
      <PlotlyHistogram dataset="ndvi" x-label="NDVI" :show-legend="false" />
    </div>
  </div>
</div>

<div class="flex items-center gap-3 text-[.5rem] text-gray-500" style="position: absolute; left: 72px; bottom: 22px;">
  <div class="flex items-center gap-1"><span class="inline-block w-2 h-2 rounded-full" style="background:#2ca02c"></span>Vegetation</div>
  <div class="flex items-center gap-1"><span class="inline-block w-2 h-2 rounded-full" style="background:#d62728"></span>Urban/Built-up</div>
</div>

<!--
Brief recap of Lecture 3 before moving to deep learning.
In classic ML, features are hand-designed by domain experts; the model operates on those fixed representations.
Deep learning replaces hand-crafted features with learned representations — this lecture is about how and why that works.
-->


---
section: why-learn-representations
---

# Good Representations allow for Simple Models

<div class="mt-4">
  <LinearDecisionBoundaryDemo />
</div>

<!--
Feature space recap: NDVI vs. Green reflectance for 759 land-cover samples.
Drag the two handles to reshape the line and watch w1, w2, b update live.
This is the linear score w^T x + b; the sigmoid (logistic regression) comes next.
-->

---
section: why-learn-representations
---

# Logistic Regression for Classification

<div class="mt-4">
  <LogisticRegressionDemo />
</div>

<!--
Same feature space and boundary mechanic as the previous slide, but the linear score
z = w^T x + b is now passed through the sigmoid to become a probability P(y=1|x).
The boundary itself does not move: z = 0 is still exactly where P = 0.5.
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
        <td class="px-3 py-2 text-[.68rem] italic font-semibold" style="color:#00457c">Covered in Lectures 2 &amp; 3</td>
        <td class="px-3 py-2 border-l border-gray-200 text-[.68rem] italic font-semibold" style="color:#0f7d5c">Covered in Lectures 4 &amp; 5</td>
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
section: multilayer-perceptrons
---

# Image Classification

<img
  src="./assets/classification.svg"
  class="w-full h-[360px] object-contain"
  alt="An image classification model maps an image tensor to a vector of class probabilities"
/>

---
section: multilayer-perceptrons
---

# Image Segmentation

<img
  src="./assets/segmentation.svg"
  class="w-full h-[360px] object-contain"
  alt="An image segmentation model maps an image tensor to class predictions at each pixel"
/>

---
section: multilayer-perceptrons
---

# Object Detection

<img
  src="./assets/object_detection.svg"
  class="w-full h-[360px] object-contain"
  alt="An object detection model maps an image tensor to bounding boxes described by position, height, and width"
/>

---
section: multilayer-perceptrons
---

# Time Series Classification

<img
  src="./assets/time_series.svg"
  class="w-full h-[360px] object-contain"
  alt="Models classify time series and image time series using their temporal and channel dimensions"
/>


---
section: multilayer-perceptrons
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


---
layout: bonn-section
sectionColor: "#00457c"
section: multilayer-perceptrons
sectionTitle: Multilayer Perceptrons
---

# Multilayer Perceptrons

<img src="./assets/mlp_cover.svg" alt="An illustration of a multilayer perceptron neural network" />

<div class="text-[.9rem] text-gray-700 mt-4">
Learning the representation.
</div>

<div class="text-[.72rem] text-gray-500 mt-6">From linear decisions on fixed features to learned feature-space transformations.</div>

---
section: multilayer-perceptrons
---

# Linear Transformation

<img
  src="./assets/linear_transformation.svg"
  class="w-full h-[360px] object-contain"
  alt="An input vector is multiplied by a weight matrix to produce an output vector; GPU cores accelerate this computation through parallel processing"
/>

---
section: multilayer-perceptrons
---

# Linear Transformation with Bias

<img
  src="./assets/linear_transformation_bias.svg"
  class="w-full h-[360px] object-contain"
  alt="An input vector is multiplied by a weight matrix to produce an output vector; GPU cores accelerate this computation through parallel processing"
/>

---
section: multilayer-perceptrons
---

# Linear Transformation from 3D to 2D

<div class="grid grid-cols-2 gap-4 mt-2 items-center">

<img
  src="./assets/linear_transformation_2-3D.svg"
  class="w-full h-[360px] object-contain"
  alt="An input vector is multiplied by a weight matrix to produce an output vector; GPU cores accelerate this computation through parallel processing"
/>

<video
  src="./assets/2d_plot.mov"
  class="w-full h-[360px] rounded-lg border border-gray-200 object-contain bg-black"
  autoplay loop muted playsinline controls
/>

</div>

---
section: multilayer-perceptrons
---

# Linear Transformation from 2D to 3D

<div class="grid grid-cols-2 gap-4 mt-2 items-center">

<img
  src="./assets/linear_projection_2d_to_3d.svg"
  class="w-full h-[360px] object-contain"
  alt="An input vector is multiplied by a weight matrix to produce an output vector; GPU cores accelerate this computation through parallel processing"
/>

<video
  src="./assets/3d_plot.mov"
  class="w-full h-[360px] rounded-lg border border-gray-200 object-contain bg-black"
  autoplay loop muted playsinline controls
/>

</div>

---
section: multilayer-perceptrons
---

# Biological Interpretation of Adding Signals

<img
  src="./assets/biological_interpretation.svg"
  class="w-full h-[360px] object-contain"
/>

---
section: multilayer-perceptrons
---

# Activation Functions – Biological Interpretation

<img
  src="./assets/biological_interpretation_activation_functions.svg"
  class="w-full h-[360px] object-contain"
/>


---
section: multilayer-perceptrons
---

# Linear Alebra: Stacking Layers

## A 2D→3D Linear Projection moves data into 3D representation space

<div class="grid grid-cols-2 gap-4 mt-4 items-center">

<img
  src="./assets/2d-3d-figure-lef.svg"
  class="w-full h-[260px] object-contain"
/>

<img
  src="./assets/2d-3d-figure.svg"
  class="w-full h-[260px] object-contain"
/>

</div>

---
section: multilayer-perceptrons
---


# Linear Alebra: Stacking Layers

## Two Linear projections 2D→3D→2D in a 2-Layer network

<div class="grid grid-cols-2 gap-4 mt-4 items-center">

<img
  src="./assets/2d-3d-2d-figure-left.svg"
  class="w-full h-[260px] object-contain"
/>

<img
  src="./assets/2d-3d-2d-figure.svg"
  class="w-full h-[260px] object-contain"
/>

</div>


---
section: multilayer-perceptrons
---

# Linear Alebra: Stacking Layers

## Two Linear projections 2D→3D→2D without non-linearity is a single 2D → 2D projection

<div class="grid grid-cols-2 gap-4 mt-4 items-center">

<img
  src="./assets/2d-2d-figure-left.png"
  class="w-full h-[260px] object-contain"
/>


<img
  src="./assets/2d-2d-figure.svg"
  class="w-full h-[260px] object-contain"
/>

</div>

---
section: multilayer-perceptrons
---

# Linear Alebra: Stacking Layers
## Non-linear functions like ReLU are needed to transform feature space

<div class="grid grid-cols-2 gap-4 mt-4 items-center">

<img
  src="./assets/relu.svg"
  class="w-full h-[260px] object-contain"
/>


<video
  src="./assets/relu.mov"
  class="w-full h-[250px] rounded-lg border border-gray-200 object-contain bg-black"
  autoplay loop muted playsinline controls
/>

</div>

---
section: multilayer-perceptrons
---

# More layers → more complex transformations

<img
  src="./assets/transformations_in_an_MLP.png"
  class="w-full h-[360px] object-contain"
/>

---
section: multilayer-perceptrons
---

# Multi-Layer Perceptron - Implementation

<div class="grid grid-cols-2 gap-4 mt-4 items-center">

<img
  src="./assets/MLP_summary.svg"
  class="w-full h-[260px] object-contain"
/>

<style>
.mlp-impl-code pre { font-size: 9.5px !important; line-height: 1.4 !important; }
</style>

<div class="mlp-impl-code">

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class MLPClassifier(nn.Module):
    def __init__(
        self, input_dim, hidden_dim, num_classes
    ):
        super(MLPClassifier, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.fc3 = nn.Linear(hidden_dim, num_classes)

    def forward(self, x):
        x = F.relu(self.fc1(x))      # 1st layer ReLU
        x = F.relu(self.fc2(x))      # 2nd layer ReLU
        x = F.sigmoid(self.fc3(x))   # Output (probs)
        return x
```

</div>

</div>


---
section: multilayer-perceptrons
---

# Demo: Multi-Layer Perceptron Feature Space

<MlpFeatureSpaceDemo />

<div class="mt-1 text-xs text-gray-500">
Inspired by Andrej Karpathy's <a href="https://cs.stanford.edu/people/karpathy/convnetjs/demo/classify2d.html" target="_blank" rel="noopener noreferrer">ConvNetJS Classify2D</a> demo. Implemented with Claude and Codex.
</div>

---
layout: bonn-section
sectionColor: "#00457c"
section: gradient-descent-backpropagation
sectionTitle: Gradient Descent & Backpropagation
---

# Gradient Descent & Backpropagation

<div class="text-[.9rem] text-gray-700 mt-4">
Learning the parameters.
</div>

<div class="text-[.72rem] text-gray-500 mt-6">parameters → prediction → loss → gradient → update</div>

---
section: gradient-descent-backpropagation
---

# Training: Adjusting Weights to Minimize Loss

## Finding good parameters W

<img
  src="./assets/Loss-weights.svg"
  class="w-full h-[360px] object-contain"
  alt="A training dataset passes through the model f(x;W) to produce predictions, which are compared against the true labels by a loss function; the weights W are adjusted to minimize this loss"
/>

---
section: gradient-descent-backpropagation
---

# The Learning Objective: argmin

<img
  src="./assets/argmin.svg"
  class="w-full h-[360px] object-contain"
  alt="An input tensor passes through the model to produce a predicted tensor, which is compared to the target to compute an error or loss; training finds the model that minimizes this loss (argmin)"
/>

---
section: gradient-descent-backpropagation
---

# Loss Function: Mean Squared Error

<img
  src="./assets/MSE.svg"
  class="w-full h-[360px] object-contain"
  alt="Mean squared error penalizes the squared difference between the predicted value and the correct value, giving a low error when predictions are close and a high error when they are far off"
/>

---
section: gradient-descent-backpropagation
---

# Loss Function: Cross-Entropy

<img
  src="./assets/cross_entropy.svg"
  class="w-full h-[360px] object-contain"
  alt="Cross-entropy loss compares a predicted class probability vector against the true class vector, giving a low error for a confident correct prediction and a high error for a confident incorrect one"
/>

---
section: gradient-descent-backpropagation
---

# Loss Function: Cross-Entropy

<img
  src="./assets/gradient_descent2.png"
  class="w-full h-[360px] object-contain"
/>

---
section: gradient-descent-backpropagation
---

# Loss Surfaces

<img
  src="./assets/loss_surface.png"
  class="w-full h-[360px] object-contain"
/>


---
section: gradient-descent-backpropagation
---

# Gradient Descent vs Backpropagation

<div class="grid grid-cols-2 gap-5 mt-4 text-[.8rem]">
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="font-semibold text-blue-900 mb-2">Gradient Descent</div>
    <div>How to update parameters once gradients are known.</div>
    <img src="./assets/grad_descent_image.png"/>
  </div>
  <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
    <div class="font-semibold text-emerald-900 mb-2">Backpropagation</div>
    <div>How to compute gradients efficiently through many layers.</div>
    <img src="./assets/backprop_6.svg"/>
  </div>
</div>

<div class="mt-4 text-[.72rem] text-gray-600">Backprop gives the gradients; gradient descent uses them to step the parameters.</div>

<!--
Clarify the common confusion: optimization rule vs gradient-computation algorithm.
-->

---
section: gradient-descent-backpropagation
---

# Backpropagation 1

<img
  src="./assets/backprop_1.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 1: the network computes a forward pass from input to prediction"
/>

---
section: gradient-descent-backpropagation
---

# Backpropagation 2

<img
  src="./assets/backprop_2.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 2: the loss compares the prediction to the true label"
/>

---
section: gradient-descent-backpropagation
---

# Backpropagation 3

<img
  src="./assets/backprop_3.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 3: the gradient of the loss with respect to the output layer is computed"
/>

---
section: gradient-descent-backpropagation
---

# Backpropagation 4

<img
  src="./assets/backprop_4.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 4: the gradient is propagated backward through the network layer by layer using the chain rule"
/>

---
section: gradient-descent-backpropagation
---

# Backpropagation 5

<img
  src="./assets/backprop_5.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 5: each layer's weight gradients are computed from the gradient flowing back from the layer above"
/>

---
section: gradient-descent-backpropagation
---

# Backpropagation 6

<img
  src="./assets/backprop_6.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 6: gradients of earlier layers require only the gradient from the previous layer, so no recomputation of later layers is needed"
/>

---
section: gradient-descent-backpropagation
---

# Backpropagation 7

<img
  src="./assets/backprop_7.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 7: the same computation expressed in code as loss = MSE(y_pred, y), loss.backward(), and optimizer.step()"
/>
