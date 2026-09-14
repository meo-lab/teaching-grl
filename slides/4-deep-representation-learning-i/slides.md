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
Set up the two-lecture arc before any technical detail.
Lecture 4 is about the mechanics of learning; Lecture 5 is about why it generalises.
-->

---

# Learning Outcomes Roadmap

<div class="mt-3 text-[.64rem] leading-tight whitespace-nowrap">

| | Learning outcome | Lecture | Block |
|---|---|---|---|
| ⬜ | Explain how neural networks learn representations that simplify tasks. | <span class="text-blue-700 font-semibold">Lecture 4</span> | Models and Representations |
| ⬜ | Explain layers, parameters, biases, and nonlinear activations in an MLP. | <span class="text-blue-700 font-semibold">Lecture 4</span> | Models and Representations |
| ⬜ | Explain forward passes, losses, gradients, backpropagation, and updates. | <span class="text-blue-700 font-semibold">Lecture 4</span> | Learning and Optimization |
| ⬜ | Explain the inductive biases of CNNs, RNNs, GNNs, Transformers, and common losses. | <span class="text-amber-700 font-semibold">Lab 4</span> | Expert Jigsaw |
| ⬜ | Distinguish finite datasets from samples of an underlying distribution. | <span class="text-emerald-700 font-semibold">Lecture 5</span> | Samples and Distributions |
| ⬜ | Explain generalization, overfitting, bias–variance, and train/validation/test evaluation. | <span class="text-emerald-700 font-semibold">Lecture 5</span> | Classical Generalization |
| ⬜ | Explain interpolation thresholds, double descent, and overparameterization. | <span class="text-emerald-700 font-semibold">Lecture 5</span> | Modern Generalization |

</div>

<!--
This table is the shared map for Lectures 4 and 5.
We will revisit it mid-lecture to mark what has been covered, and again at the start of Lecture 5.
The ⬜ markers can be swapped to ✅ as outcomes are reached.
-->

---

# Today: How Do Neural Networks Learn Useful Representations?

<div class="text-[.85rem] text-gray-600 mb-5">Focusing on the first three outcomes from the roadmap.</div>

<div class="grid grid-cols-2 gap-5">
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-700 mb-2">Block 1 — Models and Representations</div>

<img src="./assets/model.svg" class="w-full h-[190px] object-contain" alt="A deep learning model transforms an input tensor through layers into an output tensor" />

  </div>
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
    <div class="text-[.6rem] font-bold uppercase tracking-wide text-blue-700 mb-2">Block 2 — Learning and Optimization</div>
    <img src="./assets/min.png" class="w-[120px] h-[120px] object-contain" alt="Loss surface over weight space with multiple minima" />
  </div>
</div>

<div class="mt-4 text-[.7rem] text-gray-500">Next: what does learning actually mean for a system?</div>

<!--
Zoom in on today's scope before the lecture becomes technical.
Students should track these two blocks as the lecture progresses.
-->

---
section: overview
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
section: overview
sectionTitle: Overview
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
section: overview
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
section: overview
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
section: models-and-representations
sectionTitle: Models and Representations
---

# Models and Representations

<div class="text-[.9rem] text-gray-700 mt-4">
How model architecture shapes internal representations of geospatial data.
</div>

---
section: models-and-representations
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
section: models-and-representations
---

# Deep Learning Model

<img
  src="./assets/model.svg"
  class="w-full h-[360px] object-contain"
  alt="A model transforms an input tensor into an output tensor through layers that change the tensor dimensions"
/>

---
section: models-and-representations
---

# Sentinel-2 as an Image Tensor

<img
  src="./assets/S2-image-tensor.svg"
  class="w-full h-[360px] object-contain"
  alt="Sentinel-2 spectral bands arranged as the 13 channels of an image tensor"
/>

---
section: models-and-representations
---

# Image Classification

<img
  src="./assets/classification.svg"
  class="w-full h-[360px] object-contain"
  alt="An image classification model maps an image tensor to a vector of class probabilities"
/>

---
section: models-and-representations
---

# Image Segmentation

<img
  src="./assets/segmentation.svg"
  class="w-full h-[360px] object-contain"
  alt="An image segmentation model maps an image tensor to class predictions at each pixel"
/>

---
section: models-and-representations
---

# Object Detection

<img
  src="./assets/object_detection.svg"
  class="w-full h-[360px] object-contain"
  alt="An object detection model maps an image tensor to bounding boxes described by position, height, and width"
/>

---
section: models-and-representations
---

# Time Series Classification

<img
  src="./assets/time_series.svg"
  class="w-full h-[360px] object-contain"
  alt="Models classify time series and image time series using their temporal and channel dimensions"
/>

---
section: models-and-representations
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
section: models-and-representations
---

# Linear Transformation

<img
  src="./assets/linear_transformation.svg"
  class="w-full h-[360px] object-contain"
  alt="An input vector is multiplied by a weight matrix to produce an output vector; GPU cores accelerate this computation through parallel processing"
/>

---
section: models-and-representations
---

# Linear Transformation with a Bias Term

<img
  src="./assets/bias_linear.svg"
  class="w-full h-[360px] object-contain"
  alt="An input vector is multiplied by a weight matrix and a bias vector is added to produce the output vector; GPU cores accelerate this computation through parallel processing"
/>

---
section: models-and-representations
---

# Weighted Connections

<img
  src="./assets/MLP_math.svg"
  class="w-full h-[360px] object-contain"
  alt="A network with two inputs, three hidden units, and two outputs, connected by lines of varying thickness"
/>

---
section: models-and-representations
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
section: models-and-representations
---

# How an MLP transforms feature space

<MlpFeatureSpaceDemo />

<div class="mt-1 text-xs text-gray-500">
Inspired by Andrej Karpathy's <a href="https://cs.stanford.edu/people/karpathy/convnetjs/demo/classify2d.html" target="_blank" rel="noopener noreferrer">ConvNetJS Classify2D</a> demo. Implemented with Claude and Codex.
</div>

---
section: models-and-representations
---

# Machine Learning and Deep Learning

<img
  src="./assets/classic_vs_deep_learning.svg"
  class="w-full h-[360px] object-contain"
  alt="Comparison of designed features with a complex classifier and learned features with a simple classifier"
/>

---
section: models-and-representations
---

# Feature Learning

<img
  src="./assets/feature_learning.svg"
  class="w-full h-[360px] object-contain"
  alt="Training data guides a deep learning model to learn feature representations for classification"
/>

---
section: models-and-representations
---

# Foundation Models

<img
  src="./assets/foundation_models.svg"
  class="w-full h-[360px] object-contain"
  alt="A remote sensing foundation model produces embeddings that support multiple downstream classification tasks"
/>

---
layout: bonn-section
sectionColor: "#00457c"
section: learning-and-optimization
sectionTitle: Learning and Optimization
---

# Learning and Optimization

<div class="text-[.9rem] text-gray-700 mt-4">
From predictions to loss, gradients, and parameter updates.
</div>

---
section: learning-and-optimization
---

# Training: Adjusting Weights to Minimize Loss

<img
  src="./assets/Loss-weights.svg"
  class="w-full h-[360px] object-contain"
  alt="A training dataset passes through the model f(x;W) to produce predictions, which are compared against the true labels by a loss function; the weights W are adjusted to minimize this loss"
/>

---
section: learning-and-optimization
---

# The Learning Objective: argmin

<img
  src="./assets/argmin.svg"
  class="w-full h-[360px] object-contain"
  alt="An input tensor passes through the model to produce a predicted tensor, which is compared to the target to compute an error or loss; training finds the model that minimizes this loss (argmin)"
/>

---
section: learning-and-optimization
---

# Loss Function: Mean Squared Error

<img
  src="./assets/MSE.svg"
  class="w-full h-[360px] object-contain"
  alt="Mean squared error penalizes the squared difference between the predicted value and the correct value, giving a low error when predictions are close and a high error when they are far off"
/>

---
section: learning-and-optimization
---

# Loss Function: Cross-Entropy

<img
  src="./assets/cross_entropy.svg"
  class="w-full h-[360px] object-contain"
  alt="Cross-entropy loss compares a predicted class probability vector against the true class vector, giving a low error for a confident correct prediction and a high error for a confident incorrect one"
/>

---
section: learning-and-optimization
---

# Loss Surfaces

<img
  src="./assets/loss_surfaces.svg"
  class="w-full h-[360px] object-contain"
  alt="The loss function traces a surface over the space of possible weights; training searches this surface for the minimum (argmin), and more complex models have more complex loss surfaces"
/>

---
section: learning-and-optimization
---

# Gradient Descent

<img
  src="./assets/gradient_descent.svg"
  class="w-full h-[360px] object-contain"
  alt="Gradients of the loss function with respect to the weights point in the direction of steepest increase; training data is used to repeatedly step the weights in the opposite direction to descend the loss surface"
/>

---
section: learning-and-optimization
---

# Backpropagation

<img
  src="./assets/backprop_1.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 1: the network computes a forward pass from input to prediction"
/>

---
section: learning-and-optimization
---

# Backpropagation

<img
  src="./assets/backprop_2.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 2: the loss compares the prediction to the true label"
/>

---
section: learning-and-optimization
---

# Backpropagation

<img
  src="./assets/backprop_3.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 3: the gradient of the loss with respect to the output layer is computed"
/>

---
section: learning-and-optimization
---

# Backpropagation

<img
  src="./assets/backprop_4.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 4: the gradient is propagated backward through the network layer by layer using the chain rule"
/>

---
section: learning-and-optimization
---

# Backpropagation

<img
  src="./assets/backprop_5.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 5: each layer's weight gradients are computed from the gradient flowing back from the layer above"
/>

---
section: learning-and-optimization
---

# Backpropagation

<img
  src="./assets/backprop_6.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 6: gradients of earlier layers require only the gradient from the previous layer, so no recomputation of later layers is needed"
/>

---
section: learning-and-optimization
---

# Backpropagation

<img
  src="./assets/backprop_7.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 7: the same computation expressed in code as loss = MSE(y_pred, y), loss.backward(), and optimizer.step()"
/>
