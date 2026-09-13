---
addons:
  - "../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lecture 3
home: ../
---

# Deep Learning I

## What is Learning?

<!--
This lecture formalizes supervised learning on structured inputs before introducing deep learning on raw data.
-->

---

# In this lecture

- Inputs, targets, and supervised learning
- Classification and regression
- Train / validation / test splits
- Decision trees and ensemble methods
- Random forests as the main model

<!--
This lecture defines what learning means operationally and sets up the contrast to supervised deep learning in Lecture 4.
-->

---
section: model
sectionTitle: Model
---

# Model

<img
  src="./assets/model.svg"
  class="w-full h-[360px] object-contain"
  alt="A model transforms an input tensor into an output tensor through layers that change the tensor dimensions"
/>

---
section: model
---

# Tensors

<img
  src="./assets/tensors.svg"
  class="w-full h-[360px] object-contain"
  alt="Scalars, vectors, matrices, images, and image time series represented as tensors with zero to four dimensions"
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
section: model
---

# Multilayer Perceptron

<img
  src="./assets/mlp.svg"
  class="w-full h-[360px] object-contain"
  alt="A multilayer perceptron with connected neurons arranged in successive layers"
/>

---
section: model
---

# Biological Interpretation

<img
  src="./assets/MLP_biological.svg"
  class="w-full h-[360px] object-contain"
  alt="Biological interpretation of connected neurons in a multilayer perceptron"
/>

---
section: model
---

# Neuron Inputs and Outputs

<img
  src="./assets/MLP_bio_detail.svg"
  class="w-full h-[360px] object-contain"
  alt="Two illustrated biological neurons combining three input values into two outputs, with summation symbols and labeled inputs and outputs"
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
