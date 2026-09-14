---
addons:
  - "../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lecture 3
home: ../
---

<script setup>
import AspectsOfLearningDiagram from '../../components/AspectsOfLearningDiagram.vue'
</script>

# Deep Learning I

## What is Learning?

<!--
This lecture formalizes supervised learning on structured inputs before introducing deep learning on raw data.
-->

---

# In this lecture

<div class="grid grid-cols-2 gap-6 mt-4">
  <div>
    <div class="text-[.62rem] font-bold uppercase tracking-wide text-blue-700 mb-2">Model</div>
    <ul class="text-[.8rem] leading-7">
      <li>Deep learning architectures (MLP, CNN, Transformer)</li>
      <li>Tasks: classification &amp; segmentation</li>
      <li>Representations and feature learning</li>
    </ul>
  </div>
  <div>
    <div class="text-[.62rem] font-bold uppercase tracking-wide text-blue-700 mb-2">Training</div>
    <ul class="text-[.8rem] leading-7">
      <li>Loss surfaces and gradient descent</li>
      <li>Forward pass, backpropagation, parameter updates</li>
    </ul>
  </div>
</div>

<!--
Two blocks today: first the model (architecture and representations), then training (loss, gradients, backprop).
-->

---

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

# Two Questions for Lectures 3–4

<div class="grid grid-cols-2 gap-6 mt-6">
  <div class="rounded-xl border border-blue-200 bg-blue-50 p-5">
    <div class="text-[.55rem] uppercase tracking-wide text-blue-700 font-bold">Lecture 3</div>
    <div class="mt-2 text-[.95rem] leading-snug font-semibold">How does a neural network learn?</div>
  </div>
  <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
    <div class="text-[.55rem] uppercase tracking-wide text-emerald-700 font-bold">Lecture 4</div>
    <div class="mt-2 text-[.95rem] leading-snug font-semibold">Why should what it learns work beyond the training data?</div>
  </div>
</div>

<!--
Set up a two-lecture arc before technical details.
Lecture 3 focuses on learning mechanics; Lecture 4 focuses on generalization.
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: overview
sectionTitle: Overview
---

# Learning Outcomes Roadmap

| Status | Learning outcome | Lecture | Block |
| --- | --- | --- | --- |
| ⬜ | Explain how networks turn inputs into representations that simplify tasks. | <span class="text-blue-700 font-semibold">Lecture 3</span> | Model |
| ⬜ | Explain layers, parameters, biases, and nonlinear activations in an MLP. | <span class="text-blue-700 font-semibold">Lecture 3</span> | Model |
| ⬜ | Explain forward pass, loss, gradients, backpropagation, and parameter updates. | <span class="text-blue-700 font-semibold">Lecture 3</span> | Training |
| ⬜ | Explain inductive biases in CNNs, RNNs, GNNs, Transformers, and common losses. | <span class="text-amber-700 font-semibold">Lab 3</span> | Expert Jigsaw |
| ⬜ | Explain finite datasets vs. samples from an underlying data distribution. | <span class="text-emerald-700 font-semibold">Lecture 4</span> | Samples and Distributions |
| ⬜ | Explain generalization, overfitting, bias–variance, and train/validation/test evaluation. | <span class="text-emerald-700 font-semibold">Lecture 4</span> | Classical Generalization |
| ⬜ | Explain how interpolation threshold, double descent, and overparameterization revise the classical view. | <span class="text-emerald-700 font-semibold">Lecture 4</span> | Modern Generalization |

<!--
This table is a reusable map.
We will revisit it later in Lecture 3 and again at the start of Lecture 4.
-->

---
section: overview
---

# Today: How Networks Learn Useful Representations

<div class="text-[.9rem] mb-4">
Today’s focus: <span class="font-semibold">representations</span>, <span class="font-semibold">MLP building blocks</span>, and <span class="font-semibold">learning + optimization</span>.
</div>

<div class="grid grid-cols-2 gap-5">
  <div class="rounded-xl border border-gray-200 p-4">
    <div class="text-[.62rem] font-semibold mb-2">Block 1 — Model</div>
    <ul class="leading-7 text-[.75rem]">
      <li>representations</li>
      <li>MLPs</li>
      <li>hidden spaces</li>
      <li>nonlinearities</li>
    </ul>
  </div>
  <div class="rounded-xl border border-gray-200 p-4">
    <div class="text-[.62rem] font-semibold mb-2">Block 2 — Training</div>
    <ul class="leading-7 text-[.75rem]">
      <li>forward pass</li>
      <li>loss</li>
      <li>gradients</li>
      <li>backpropagation</li>
      <li>parameter updates</li>
    </ul>
  </div>
</div>

<div class="mt-4 text-[.72rem] text-gray-600">Next: start with representations, models, and what can be learned from data.</div>

<!--
Zoom in on the Lecture 3 goals so students know what to track today.
Use this as the transition into the existing model/representation content.
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
    <img src="./assets/mlp_cover.svg" class="w-full h-[190px] object-contain" alt="MLP model transforming an input tensor into an output tensor through layers" />
  </div>
  <div>
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-700 mb-2">Model Training</div>
    <ol class="text-[.8rem] leading-8 mb-4">
      <li><strong>Loss surfaces</strong> and gradient descent</li>
      <li>Forward pass → Loss → Backprop → Update</li>
    </ol>
    <img src="./assets/loss_surfaces.svg" class="w-full h-[190px] object-contain" alt="Loss surface over weight space with multiple minima" />
  </div>
</div>

<!--
Transition slide before diving into Block 1.
Left side previews the model block (architectures, tasks, MLPs).
Right side previews the training block (loss, gradient descent, backprop).
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: model
sectionTitle: Model
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
layout: bonn-section
sectionColor: "#00457c"
section: model
sectionTitle: Model
---

# The Learnable Model

<img src="./assets/reading.jpg" alt="An adult and child reading a book together" />

<div class="bonn-section-citation">
  Photo by <a href="https://www.pexels.com/@silverkblack/" target="_blank" rel="noopener noreferrer">Vitaly Gariev</a> on <a href="https://www.pexels.com/photo/mother-and-son-lying-down-on-carpet-with-book-23224850/" target="_blank" rel="noopener noreferrer">Pexels</a>
</div>

---
section: model
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
section: model
---

# Deep Learning Model

<img
  src="./assets/model.svg"
  class="w-full h-[360px] object-contain"
  alt="A model transforms an input tensor into an output tensor through layers that change the tensor dimensions"
/>

---
section: model
---

# Sentinel-2 as an Image Tensor

<img
  src="./assets/S2-image-tensor.svg"
  class="w-full h-[360px] object-contain"
  alt="Sentinel-2 spectral bands arranged as the 13 channels of an image tensor"
/>

---
section: model
---

# Image Classification

<img
  src="./assets/classification.svg"
  class="w-full h-[360px] object-contain"
  alt="An image classification model maps an image tensor to a vector of class probabilities"
/>

---
section: model
---

# Image Segmentation

<img
  src="./assets/segmentation.svg"
  class="w-full h-[360px] object-contain"
  alt="An image segmentation model maps an image tensor to class predictions at each pixel"
/>

---
section: model
---

# Object Detection

<img
  src="./assets/object_detection.svg"
  class="w-full h-[360px] object-contain"
  alt="An object detection model maps an image tensor to bounding boxes described by position, height, and width"
/>

---
section: model
---

# Time Series Classification

<img
  src="./assets/time_series.svg"
  class="w-full h-[360px] object-contain"
  alt="Models classify time series and image time series using their temporal and channel dimensions"
/>

---
layout: bonn-section
sectionColor: "#00457c"
section: model
sectionTitle: Model
---

# The Multi-Layer Perceptron (MLP) Model

<img src="./assets/mlp_cover.svg" alt="An illustration of a multilayer perceptron transforming inputs into outputs" />

---
section: model
---

# Linear Transformation

<img
  src="./assets/linear_transformation.svg"
  class="w-full h-[360px] object-contain"
  alt="An input vector is multiplied by a weight matrix to produce an output vector; GPU cores accelerate this computation through parallel processing"
/>

---
section: model
---

# Linear Transformation with a Bias Term

<img
  src="./assets/bias_linear.svg"
  class="w-full h-[360px] object-contain"
  alt="An input vector is multiplied by a weight matrix and a bias vector is added to produce the output vector; GPU cores accelerate this computation through parallel processing"
/>

---
section: model
---

# Weighted Connections

<img
  src="./assets/MLP_math.svg"
  class="w-full h-[360px] object-contain"
  alt="A network with two inputs, three hidden units, and two outputs, connected by lines of varying thickness"
/>

---
section: model
---

# How an MLP transforms feature space

<MlpFeatureSpaceDemo />

<div class="mt-1 text-xs text-gray-500">
Inspired by Andrej Karpathy's <a href="https://cs.stanford.edu/people/karpathy/convnetjs/demo/classify2d.html" target="_blank" rel="noopener noreferrer">ConvNetJS Classify2D</a> demo. Implemented with Claude and Codex.
</div>

---
section: model
---

# Machine Learning and Deep Learning

<img
  src="./assets/classic_vs_deep_learning.svg"
  class="w-full h-[360px] object-contain"
  alt="Comparison of designed features with a complex classifier and learned features with a simple classifier"
/>

---
section: model
---

# Feature Learning

<img
  src="./assets/feature_learning.svg"
  class="w-full h-[360px] object-contain"
  alt="Training data guides a deep learning model to learn feature representations for classification"
/>

---
section: model
---

# Foundation Models

<img
  src="./assets/foundation_models.svg"
  class="w-full h-[360px] object-contain"
  alt="A remote sensing foundation model produces embeddings that support multiple downstream classification tasks"
/>

---
section: training
sectionTitle: Training
---

# Training: Adjusting Weights to Minimize Loss

<img
  src="./assets/Loss-weights.svg"
  class="w-full h-[360px] object-contain"
  alt="A training dataset passes through the model f(x;W) to produce predictions, which are compared against the true labels by a loss function; the weights W are adjusted to minimize this loss"
/>

---
section: training
---

# The Learning Objective: argmin

<img
  src="./assets/argmin.svg"
  class="w-full h-[360px] object-contain"
  alt="An input tensor passes through the model to produce a predicted tensor, which is compared to the target to compute an error or loss; training finds the model that minimizes this loss (argmin)"
/>

---
section: training
---

# Loss Function: Mean Squared Error

<img
  src="./assets/MSE.svg"
  class="w-full h-[360px] object-contain"
  alt="Mean squared error penalizes the squared difference between the predicted value and the correct value, giving a low error when predictions are close and a high error when they are far off"
/>

---
section: training
---

# Loss Function: Cross-Entropy

<img
  src="./assets/cross_entropy.svg"
  class="w-full h-[360px] object-contain"
  alt="Cross-entropy loss compares a predicted class probability vector against the true class vector, giving a low error for a confident correct prediction and a high error for a confident incorrect one"
/>

---
section: training
---

# Loss Surfaces

<img
  src="./assets/loss_surfaces.svg"
  class="w-full h-[360px] object-contain"
  alt="The loss function traces a surface over the space of possible weights; training searches this surface for the minimum (argmin), and more complex models have more complex loss surfaces"
/>

---
section: training
---

# Gradient Descent

<img
  src="./assets/gradient_descent.svg"
  class="w-full h-[360px] object-contain"
  alt="Gradients of the loss function with respect to the weights point in the direction of steepest increase; training data is used to repeatedly step the weights in the opposite direction to descend the loss surface"
/>

---
section: training
---

# Backpropagation

<img
  src="./assets/backprop_1.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 1: the network computes a forward pass from input to prediction"
/>

---
section: training
---

# Backpropagation

<img
  src="./assets/backprop_2.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 2: the loss compares the prediction to the true label"
/>

---
section: training
---

# Backpropagation

<img
  src="./assets/backprop_3.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 3: the gradient of the loss with respect to the output layer is computed"
/>

---
section: training
---

# Backpropagation

<img
  src="./assets/backprop_4.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 4: the gradient is propagated backward through the network layer by layer using the chain rule"
/>

---
section: training
---

# Backpropagation

<img
  src="./assets/backprop_5.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 5: each layer's weight gradients are computed from the gradient flowing back from the layer above"
/>

---
section: training
---

# Backpropagation

<img
  src="./assets/backprop_6.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 6: gradients of earlier layers require only the gradient from the previous layer, so no recomputation of later layers is needed"
/>

---
section: training
---

# Backpropagation

<img
  src="./assets/backprop_7.svg"
  class="w-full h-[360px] object-contain"
  alt="Backpropagation step 7: the same computation expressed in code as loss = MSE(y_pred, y), loss.backward(), and optimizer.step()"
/>
