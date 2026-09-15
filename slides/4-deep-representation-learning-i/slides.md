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

# What is a representation?

- Same information can be represented in more or less useful ways.
- Utility depends on whether structure is exposed for the task.
- Learning often succeeds or fails because of representation choice.

<!--
Keep this intuitive and non-technical.
Representation quality is the anchor idea for the full lecture.
-->

---
section: why-learn-representations
---

# 784 numbers. One digit.

<div class="text-[.78rem] text-gray-600 mb-2">
Can you find a representation that reveals the structure?
</div>

<PixelReshape />

<!--
These are 784 fixed grayscale values from one MNIST sample.
Ask students to move through multiple column counts; at 28, the spatial structure appears.
Emphasize that values and ordering never changed.
-->

---
section: why-learn-representations
---

# Same data. Different representation.

<div class="text-[.95rem] mt-4 mb-5">
\[
x \in \mathbb{R}^{784}
\quad\longleftrightarrow\quad
X \in \mathbb{R}^{28\times 28}
\]
</div>

<div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[.8rem]">
No information was added.<br>
The representation exposed spatial structure.
</div>

<div class="mt-4 text-[.74rem] text-gray-600">
An MLP can still process the same image as a 784-dimensional vector.
</div>

<!--
Interpret the demo immediately: same values and order, different arrangement.
Bridge forward to feature-space geometry and MLP representation learning.
-->

---
section: why-learn-representations
---

# Bridge from Lecture 3

<div class="rounded-xl border border-gray-200 p-4 mt-3 text-[.8rem]">
<strong>Lecture 3 workflow:</strong><br>
data → manually designed representation → model → prediction
</div>

<div class="mt-4 text-[.8rem]">
Students improved performance by:
</div>

- choosing features,
- engineering NDVI,
- adding complementary variables.

<div class="mt-3 text-[.74rem] text-gray-600">In Lecture 3, we designed the representation ourselves.</div>

<!--
Make continuity explicit so this lecture feels like a direct extension.
-->

---
section: why-learn-representations
---

# Logistic Regression in Feature Space

<div class="text-[.85rem] mt-2">\(x \rightarrow w^\top x + b \rightarrow \sigma(\cdot) \rightarrow \hat{y}\)</div>

<div class="grid grid-cols-2 gap-5 mt-4 text-[.78rem]">
  <div class="rounded-lg border border-gray-200 p-3">
    <strong>Samples</strong> are points in feature space.
  </div>
  <div class="rounded-lg border border-gray-200 p-3">
    <strong>Coordinates</strong> are feature values.
  </div>
  <div class="rounded-lg border border-gray-200 p-3">
    Logistic regression learns a <strong>linear decision boundary</strong>.
  </div>
  <div class="rounded-lg border border-gray-200 p-3">
    In 2D: line. In higher dimensions: hyperplane.
  </div>
</div>

<!--
Anchor geometric interpretation before introducing learned representations.
-->

---
section: why-learn-representations
---

# Representation Determines Difficulty

<div class="grid grid-cols-2 gap-6 mt-4">
  <div class="rounded-xl border border-red-200 bg-red-50 p-4">
    <div class="text-[.62rem] font-semibold uppercase tracking-wide text-red-700 mb-2">Poor representation</div>
    <div class="text-[.8rem]">Classes overlap in awkward geometry.</div>
    <div class="text-[.72rem] text-red-800 mt-2">Simple linear boundary struggles.</div>
  </div>
  <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
    <div class="text-[.62rem] font-semibold uppercase tracking-wide text-emerald-700 mb-2">Useful representation</div>
    <div class="text-[.8rem]">Classes become easier to separate.</div>
    <div class="text-[.72rem] text-emerald-800 mt-2">Simple linear classifier can be sufficient.</div>
  </div>
</div>

<!--
This is the conceptual pivot: geometry in feature space controls model difficulty.
-->

---
section: why-learn-representations
---

# What if we learn the representation?

<div class="grid grid-cols-2 gap-6 mt-5 text-[.8rem]">
  <div class="rounded-xl border border-gray-200 p-4">
    <div class="font-semibold mb-2">Lecture 3</div>
    <div>\(x\) → feature engineering → logistic regression</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="font-semibold mb-2 text-blue-900">Lecture 4</div>
    <div>\(x\) → learned representation → decision layer</div>
  </div>
</div>

<div class="mt-5 text-[.72rem] text-gray-600">Next block: Multilayer Perceptrons.</div>

<!--
Explicit transition from manual feature design to representation learning.
-->

---
section: why-learn-representations
---

# Two Core Topics in This Lecture

<div class="grid grid-cols-2 gap-8 mt-5">
  <div>
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-700 mb-2">Deep Learning Model</div>
    <ol class="text-[.8rem] leading-8 mb-4">
      <li><strong>Architectures</strong> — MLP, CNN, Transformer</li>
      <li><strong>Tasks</strong> — Classification &amp; Segmentation</li>
    </ol>
    <img src="./assets/model.svg" class="w-full h-[190px] object-contain" alt="A deep learning model transforms an input tensor through layers into an output tensor" />
  </div>
  <div>
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-700 mb-2">Model Training</div>
    <ol class="text-[.8rem] leading-8 mb-4">
      <li><strong>Loss surfaces</strong> and gradient descent</li>
      <li>Forward pass → Loss → Backprop → Update</li>
    </ol>
    <img src="./assets/min.png" class="w-full h-[190px] object-contain" alt="Stylized loss surface with multiple minima and gradient descent paths" />
  </div>
</div>

<!--
Transition slide before diving into Block 1.
Left previews the model block (architectures, tasks, MLPs).
Right previews the training block (loss, gradient descent, backprop).
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: why-learn-representations
sectionTitle: Why Learn Representations?
---

# The Aspects of Learning
<div class="flex flex-col items-center justify-center h-full">
  <iframe
    src="https://giphy.com/embed/MmozymbZc0RdC"
    width="300"
    height="300"
    class="rounded-xl shadow"
    frameBorder="0"
    allowFullScreen>
  </iframe>
    <p class="mt-2 text-xs text-gray-500">
    via
    <a href="https://giphy.com/gifs/MmozymbZc0RdC" target="_blank" rel="noopener noreferrer" class="underline">GIPHY</a>,
    original source
    <a href="https://imgur.com/gallery/FBMm2DO" target="_blank" rel="noopener noreferrer" class="underline">imgur.com/gallery/FBMm2DO</a>
  </p>
</div>


---
section: why-learn-representations
---

# What Does a System Need to Learn?

<AspectsOfLearningDiagram />

<!--
Brainstorm live with the class, one question at a time, clicking to reveal each answer:

1. What does a system need in order to learn? (opening prompt in the slide title)
2. What is doing the learning? -> reveal Learnable model (click 1)
   Expected: it needs adjustable parameters and enough capacity to represent the task.
3. What can it learn from? -> reveal Experiences (click 2)
   Expected: experiences supply the information the model learns from (already covered in Lecture 2 as data).
4. What turns experience into changes in the model? -> reveal Learning algorithm (click 3)
   Expected: the learning algorithm determines how experience changes the model's parameters.
5. How do we know it learned rather than memorized? -> reveal Generalization (click 4)
   Land the distinction: experiences, model, and algorithm are the ingredients for learning;
   generalization to unseen situations is the success criterion.
-->

---
section: why-learn-representations
---

# Recap: The Classic ML Pipeline

<img
  src="./assets/classic_ml.svg"
  class="w-full h-[380px] object-contain"
  alt="The classic machine learning pipeline: raw data → feature engineering → feature vector → classifier → prediction"
/>

<!--
Brief recap of Lecture 3 before moving to deep learning.
In classic ML, features are hand-designed by domain experts; the model operates on those fixed representations.
Deep learning replaces hand-crafted features with learned representations — this lecture is about how and why that works.
-->

---
section: why-learn-representations
---

# Timeline and Evolution of Deep Learning

<div class="mt-4">
  <div class="flex items-center mb-4">
    <div class="flex-1 bg-[#00457c] text-white text-[.72rem] font-semibold px-4 py-1.5 rounded-l">&lt;2012</div>
    <div class="flex-1 bg-[#00457c] text-white text-[.72rem] font-semibold px-4 py-1.5 text-center border-l border-white/30">2015 onwards</div>
    <div class="flex-1 bg-[#00457c] text-white text-[.72rem] font-semibold px-4 py-1.5 text-right rounded-r border-l border-white/30">&gt;2020 →</div>
  </div>

  <table class="w-full text-[.75rem] border-collapse">
    <thead>
      <tr>
        <th class="bg-[#00457c] text-white text-left px-3 py-2 font-semibold w-1/3">Classic Machine Learning</th>
        <th class="bg-[#00457c] text-white text-left px-3 py-2 font-semibold w-1/3 border-l border-white/30">Supervised Deep Learning</th>
        <th class="bg-[#00457c] text-white text-left px-3 py-2 font-semibold w-1/3 border-l border-white/30">Self-Supervised Learning</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-gray-200">
        <td class="px-3 py-2 align-top"><strong>Feature Design:</strong> Which features extract the most information?</td>
        <td class="px-3 py-2 align-top border-l border-gray-200"><strong>Model Design:</strong> Which architecture is best for my tensors?</td>
        <td class="px-3 py-2 align-top border-l border-gray-200"><strong>Loss Design:</strong> Which loss function or training strategy?</td>
      </tr>
      <tr class="border-b border-gray-200 bg-gray-50">
        <td class="px-3 py-2"><strong>Data:</strong> small labelled</td>
        <td class="px-3 py-2 border-l border-gray-200"><strong>Data:</strong> large labelled</td>
        <td class="px-3 py-2 border-l border-gray-200"><strong>Data:</strong> large unlabelled</td>
      </tr>
      <tr>
        <td class="px-3 py-2"><strong>Models:</strong> Random Forest, Boosting, Lin. Regression</td>
        <td class="px-3 py-2 border-l border-gray-200"><strong>Models:</strong> MLPs, CNNs, RNNs</td>
        <td class="px-3 py-2 border-l border-gray-200"><strong>Model:</strong> Transformers</td>
      </tr>
    </tbody>
  </table>
</div>

<!--
Historical framing: three eras of machine learning, defined by the central design question.
Classic ML: features are hand-designed. Supervised DL: architecture is the design choice. Self-supervised: the loss/training strategy is the key decision.
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: multilayer-perceptrons
sectionTitle: Multilayer Perceptrons
---

# Multilayer Perceptrons

<div class="text-[.9rem] text-gray-700 mt-4">
Learning the representation.
</div>

<div class="text-[.72rem] text-gray-500 mt-6">From linear decisions on fixed features to learned feature-space transformations.</div>

---
section: multilayer-perceptrons
---

# From Logistic Regression to a Learned Representation

<div class="grid grid-cols-2 gap-6 mt-5 text-[.8rem]">
  <div class="rounded-xl border border-gray-200 p-4">
    <div class="font-semibold mb-2">Familiar baseline</div>
    <div>\(x \rightarrow w^\top x + b \rightarrow \sigma(\cdot) \rightarrow \hat{y}\)</div>
  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="font-semibold mb-2 text-blue-900">MLP perspective</div>
    <div>\(x \rightarrow h_\theta(x) \rightarrow\) decision layer \(\rightarrow \hat{y}\)</div>
  </div>
</div>

<div class="mt-4 text-[.72rem] text-gray-600">Separate the representation learner from the final decision layer.</div>

<!--
Start Block 2 from logistic regression so students keep a stable anchor.
Then introduce the learned representation idea explicitly.
-->

---
section: multilayer-perceptrons
---

# Why Nonlinear Activations?

<div class="rounded-xl border border-amber-200 bg-amber-50 p-4 mt-3 text-[.82rem]">
If every layer were only linear, stacking layers would still be one linear transformation.
</div>

<div class="mt-4 text-[.8rem]">
Nonlinear activations let the network reshape feature geometry,
so classes can become easier to separate with a simple final boundary.
</div>

<!--
This motivates activations without long derivations.
Connect directly to representation geometry.
-->

---
section: multilayer-perceptrons
---

# Our Learned Understanding

<div class="mt-5 flex flex-col gap-3">
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


---
section: multilayer-perceptrons
---

# Deep Learning Model

<img
  src="./assets/model.svg"
  class="w-full h-[360px] object-contain"
  alt="A model transforms an input tensor into an output tensor through layers that change the tensor dimensions"
/>

---
section: multilayer-perceptrons
---

# Sentinel-2 as an Image Tensor

<img
  src="./assets/S2-image-tensor.svg"
  class="w-full h-[360px] object-contain"
  alt="Sentinel-2 spectral bands arranged as the 13 channels of an image tensor"
/>

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

<div class="mt-3">
  <div class="flex items-center mb-4">
    <div class="flex-1 bg-[#00457c] text-white text-[.68rem] font-semibold px-3 py-1.5 rounded-l">1950s</div>
    <div class="flex-1 bg-[#00457c] text-white text-[.68rem] font-semibold px-3 py-1.5 border-l border-white/30">1990s</div>
    <div class="flex-1 bg-[#00457c] text-white text-[.68rem] font-semibold px-3 py-1.5 border-l border-white/30">2015</div>
    <div class="flex-1 bg-[#00457c] text-white text-[.68rem] font-semibold px-3 py-1.5 rounded-r border-l border-white/30">2020s →</div>
  </div>

  <div class="grid grid-cols-4 gap-4">
    <div>
      <div class="text-[.85rem] font-bold text-[#00457c] mb-1">MLP</div>
      <ul class="text-[.72rem] leading-6 text-gray-700">
        <li>Linear Projections</li>
        <li>Activation Functions</li>
        <li>Linear Algebra &amp; Biological Analogy</li>
        <li>Parallelism on GPUs</li>
      </ul>
    </div>
    <div>
      <div class="text-[.85rem] font-bold text-[#00457c] mb-1">CNN</div>
      <ul class="text-[.72rem] leading-6 text-gray-700">
        <li>Convolutions</li>
        <li>Pooling</li>
        <li>Recep. Fields</li>
      </ul>
    </div>
    <div>
      <div class="text-[.85rem] font-bold text-[#00457c] mb-1">ResNet</div>
      <ul class="text-[.72rem] leading-6 text-gray-700">
        <li>Deeper Networks</li>
        <li>Batch Normalization</li>
        <li>Skip Connections</li>
        <li>Classification &amp; Segmentation Tasks</li>
      </ul>
    </div>
    <div>
      <div class="text-[.85rem] font-bold text-[#00457c] mb-1">Transformers</div>
      <ul class="text-[.72rem] leading-6 text-gray-700">
        <li>Attention Mechanism</li>
        <li>Self-Attention (SA)</li>
        <li>Multi-Head SA</li>
        <li>Transformer Layers</li>
      </ul>
    </div>
  </div>
</div>

<!--
Historical arc before diving into the MLP in detail.
Each era introduced a new inductive bias: MLPs — universal approximation; CNNs — locality and translation equivariance; ResNets — depth with trainability; Transformers — global context via attention.
-->

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

# Linear Transformation with a Bias Term

<img
  src="./assets/bias_linear.svg"
  class="w-full h-[360px] object-contain"
  alt="An input vector is multiplied by a weight matrix and a bias vector is added to produce the output vector; GPU cores accelerate this computation through parallel processing"
/>

---
section: multilayer-perceptrons
---

# Weighted Connections

<img
  src="./assets/MLP_math.svg"
  class="w-full h-[360px] object-contain"
  alt="A network with two inputs, three hidden units, and two outputs, connected by lines of varying thickness"
/>

---
section: multilayer-perceptrons
---

# More "Deeper" Layers → more Complex Transformations

<img
  src="./assets/mlp_deeper_layers.jpg"
  class="w-full h-[360px] object-contain"
  alt="A two-layer MLP maps input space (a) through a linear projection (b) and non-linear tanh distortion (c) to output class probabilities (d)"
/>

<!--
Key insight: the first layer (W1) linearly projects the input into a higher-dimensional space; the activation (tanh) then non-linearly distorts that space so a simple linear classifier in the final layer can separate the classes.
(a) Input space x=(x1,x2); (b) linear projection into R^3; (c) non-linear distortion with tanh; (d) output class probabilities.
-->

---
section: multilayer-perceptrons
---

# How an MLP transforms feature space

<MlpFeatureSpaceDemo />

<div class="mt-1 text-xs text-gray-500">
Inspired by Andrej Karpathy's <a href="https://cs.stanford.edu/people/karpathy/convnetjs/demo/classify2d.html" target="_blank" rel="noopener noreferrer">ConvNetJS Classify2D</a> demo. Implemented with Claude and Codex.
</div>

---
section: multilayer-perceptrons
---

# Machine Learning and Deep Learning

<img
  src="./assets/classic_vs_deep_learning.svg"
  class="w-full h-[360px] object-contain"
  alt="Comparison of designed features with a complex classifier and learned features with a simple classifier"
/>

---
section: multilayer-perceptrons
---

# Feature Learning

<img
  src="./assets/feature_learning.svg"
  class="w-full h-[360px] object-contain"
  alt="Training data guides a deep learning model to learn feature representations for classification"
/>

---
section: multilayer-perceptrons
---

# Foundation Models

<img
  src="./assets/foundation_models.svg"
  class="w-full h-[360px] object-contain"
  alt="A remote sensing foundation model produces embeddings that support multiple downstream classification tasks"
/>

---
section: multilayer-perceptrons
---

# Block 2 Takeaway

<div class="rounded-xl border border-blue-200 bg-blue-50 p-4 mt-3 text-[.82rem]">
The final classifier can stay simple.
<br>
The network learns a representation in which the task becomes simple.
</div>

<div class="mt-5 text-[.8rem] text-gray-700 font-semibold">
But how are all these parameters learned?
</div>

<!--
Summary transition from learned representations to parameter learning.
This opens Block 3.
-->

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

# Loss Surfaces

<img
  src="./assets/loss_surfaces.svg"
  class="w-full h-[360px] object-contain"
  alt="The loss function traces a surface over the space of possible weights; training searches this surface for the minimum (argmin), and more complex models have more complex loss surfaces"
/>

---
section: gradient-descent-backpropagation
---

# Gradient Descent

<img
  src="./assets/gradient_descent.svg"
  class="w-full h-[360px] object-contain"
  alt="Gradients of the loss function with respect to the weights point in the direction of steepest increase; training data is used to repeatedly step the weights in the opposite direction to descend the loss surface"
/>

---
section: gradient-descent-backpropagation
---

# Gradient Descent vs Backpropagation

<div class="grid grid-cols-2 gap-5 mt-4 text-[.8rem]">
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="font-semibold text-blue-900 mb-2">Gradient Descent</div>
    <div>How to update parameters once gradients are known.</div>
  </div>
  <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
    <div class="font-semibold text-emerald-900 mb-2">Backpropagation</div>
    <div>How to compute gradients efficiently through many layers.</div>
  </div>
</div>

<div class="mt-4 text-[.72rem] text-gray-600">Backprop gives the gradients; gradient descent uses them to step the parameters.</div>

<!--
Clarify the common confusion: optimization rule vs gradient-computation algorithm.
-->

---
section: gradient-descent-backpropagation
---

# Backpropagation

<img
  src="./assets/backprop_1.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 1: the network computes a forward pass from input to prediction"
/>

---
section: gradient-descent-backpropagation
---

# Backpropagation

<img
  src="./assets/backprop_2.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 2: the loss compares the prediction to the true label"
/>

---
section: gradient-descent-backpropagation
---

# Backpropagation

<img
  src="./assets/backprop_3.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 3: the gradient of the loss with respect to the output layer is computed"
/>

---
section: gradient-descent-backpropagation
---

# Backpropagation

<img
  src="./assets/backprop_4.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 4: the gradient is propagated backward through the network layer by layer using the chain rule"
/>

---
section: gradient-descent-backpropagation
---

# Backpropagation

<img
  src="./assets/backprop_5.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 5: each layer's weight gradients are computed from the gradient flowing back from the layer above"
/>

---
section: gradient-descent-backpropagation
---

# Backpropagation

<img
  src="./assets/backprop_6.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 6: gradients of earlier layers require only the gradient from the previous layer, so no recomputation of later layers is needed"
/>

---
section: gradient-descent-backpropagation
---

# Backpropagation

<img
  src="./assets/backprop_7.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 7: the same computation expressed in code as loss = MSE(y_pred, y), loss.backward(), and optimizer.step()"
/>

---
section: gradient-descent-backpropagation
---

# Close the Representation-Learning Loop

<div class="grid grid-cols-3 gap-2 mt-4 text-[.7rem]">
  <div class="rounded border border-gray-300 p-2 text-center">Input</div>
  <div class="rounded border border-gray-300 p-2 text-center">Current representation</div>
  <div class="rounded border border-gray-300 p-2 text-center">Prediction</div>
  <div class="rounded border border-gray-300 p-2 text-center">Loss</div>
  <div class="rounded border border-gray-300 p-2 text-center">Backpropagation</div>
  <div class="rounded border border-gray-300 p-2 text-center">Parameter update</div>
</div>

<div class="mt-4 text-[.8rem] text-gray-700">
Training changes parameters; changed parameters change the representation.
</div>

<!--
End Block 3 by closing the full loop from representation to updates and back.
-->
