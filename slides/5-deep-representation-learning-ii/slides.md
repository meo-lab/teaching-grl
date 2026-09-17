---
addons:
  - "../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lecture 5
home: ../
---

<script setup>
import OverfittingDemo from './components/OverfittingDemo.vue'
import AspectsOfLearningDiagram from '../../components/AspectsOfLearningDiagram.vue'
import LinearHypothesisDemo from './components/LinearHypothesisDemo.vue'
import BiasVarianceDemo from './components/BiasVarianceDemo.vue'
import PolynomialBiasVarianceDemo from './components/PolynomialBiasVarianceDemo.vue'
import PolynomialBiasVarianceDemo2 from './components/PolynomialBiasVarianceDemo2.vue'
import PolynomialBiasVarianceDemo3 from './components/PolynomialBiasVarianceDemo3.vue'
</script>


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
section: approximation
layout: bonn-two-cols-header
---

# Recap Lecture 4 Deep Learning I
 
::left::

## Deep Model Architectures

<img
        src="./assets/model.svg"
        class="w-full h-[150px] object-contain"
        alt="A deep learning model transforms an input tensor through layers into an output tensor"
      />

::right::

## Parameter Optimization

<img
        src="./assets/grad_descent_image.png"
        class="w-full h-[150px] object-contain"
        alt="Gradient descent iteratively updates parameters to reduce the training loss"
      />

::bottom::

<div v-click class="rounded-xl border border-blue-200 bg-blue-50 p-4">
  <div class="text-[.9rem] font-semibold text-blue-900">Takeaway: We can now approximate any function with a neural network.</div>
</div>

<div v-click class="mt-3 text-[.78rem] text-gray-500">But is function approximation enough?</div>

---
section: approximation
layout: bonn-two-cols-header
---

::left:: 

# What is wrong here?

<div v-click class="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
  <div class="text-[.9rem] font-semibold text-blue-900">🧑‍🍳 Takeaway: The Pizza Baker Apprentice does not need to hold 📦 boxes to pick up a 🍕 pizza.</div>
</div>

::right::

<div class="flex flex-col items-center justify-center h-[100%] gap-6">
  <video
    src="./assets/pizza.mp4"
    controls
    class="rounded-xl shadow-lg max-h-[400px]"
    style="max-width: 230px;"
  ></video>
</div>

---
section: approximation
layout: bonn-two-cols-header
---

# Approximation vs Generalization

::left::

## Approximation

When training, we minimize the empirical risk

$$
\widehat{\mathcal{R}}(\theta)
= \frac{1}{N}\sum_{i=1}^{N}
\mathcal{L}\bigl(f_{\theta}(\mathbf{x}_i), \mathbf{y}_i\bigr)
$$

## Generalization

But in practice, we want the population (test) risk to be small

$$
\mathcal{R}(\theta)
= \mathbb{E}_{(\mathbf{x},\mathbf{y}) \sim \mathcal{P}}
\mathcal{L}\bigl(f_\theta(\mathbf{x}),\mathbf{y}\bigr)
$$

::right::

<div class="flex flex-col justify-center">
    <OverfittingDemo />
</div>

---
section: approximation
---

# What is needed for a system to learn?

<AspectsOfLearningDiagram/>

---
layout: bonn-section
sectionColor: "#00457c"
section: data
sectionTitle: Data
---

# Data Samples and Distributions

<div class="flex flex-col items-center justify-center h-[100%] gap-6">
  <img
    src="./assets/window.jpg"
  ></img>
</div>

---
section: data
---

# Reality → Distribution → Dataset

<img src="./assets/data_1.svg">

---
section: data
---

# Reality → Distribution: Generative Perspective

<img src="./assets/data_2.svg">

---
section: data
---

# Reality → Distribution: Discriminative Perspective

<img src="./assets/data_3.svg">

---
section: data
---

# Data as Samples from a Distribution

<img src="./assets/data_4.svg">

---
section: data
---

# Distribution → Dataset: I.I.D Assumption

<img src="./assets/data_5.svg">

---
section: data
---

# Distribution → Dataset: In-Distribution Generalization

<img src="./assets/data_6.svg">

---
section: data
---

# In Practice: Training, Validation, Test Data

<img src="./assets/data_7.svg">

---
section: data
---

# Distribution → Dataset: Random Sampling

<img src="./assets/data_8.svg">

---
section: data
---

# Real-World Models need to generalize Out-of-Distribution

<img src="./assets/data_9.svg">

---
section: data
---

# Chanes between Development and Deployment

<img src="./assets/data_10.svg">

---
section: data
---

# Geospatial Models Need to Generalize Out-of-Distribution

<img src="./assets/data_11.svg">

---
section: data
layout: bonn-image-right
image: ./assets/window.jpg
---

# Takeaway: Data

* We model our world as distributions from which we sample (i.e., collect) datasets
* We use training data to train model weights, validation data for experimentation, and test data for final evaluation
* Random sampling of train, val, test data measures in-distribution accuracy and is sufficient for model comparisons
* Real-world deployments must consider distribution shifts 𝑃(𝑋│𝑌)≠𝑄(𝑋│𝑌) and assessing out-of-distribution accuracy on separately collected test data



---
layout: bonn-section
sectionColor: "#00457c"
section: classical-generalization
sectionTitle: Classical Generalization
---

# Classical Generalization Theory


<img src="./assets/bias_variance_belkin.svg" />

<!--
Block 1 placeholder. Topics to develop: finite datasets vs. underlying distribution, training vs. population loss, train/val/test splits, generalization gap, model capacity, underfitting/overfitting, bias–variance trade-off, regularization.
-->



---
section: classical-generalization
layout: bonn-two-cols-header
---

# The Hypothesis Space $\mathcal H$

::left::

A **hypothesis** is a prediction function:

$$
h:\mathcal X\rightarrow\mathcal Y
$$

The **hypothesis space** is the set of functions the model can represent:

$$
\mathcal H=\{h_\theta:\theta\in\Theta\}
$$

- $\Theta$ is the **parameter space**
- $\theta\in\Theta$ is one parameter choice
- $h_\theta\in\mathcal H$ is the corresponding prediction function
- Training selects a hypothesis from $\mathcal H$

$$
\boxed{\text{parameters }\theta
\quad\longrightarrow\quad
\text{hypothesis }h_\theta}
$$

::right::

<img src="./assets/hypothesis_space.svg">


---
section: classical-generalization
layout: bonn-two-cols-header
---

# Example $\mathcal H_\text{linear}$

::left::

A **hypothesis** is a prediction function:

$$
h:\mathcal X\rightarrow\mathcal Y
$$

The **hypothesis space** is the set of functions the model can represent:

$$
\mathcal H=\{h_\theta:\theta\in\Theta\}
$$

- $\Theta$ is the **parameter space**
- $\theta\in\Theta$ is one parameter choice
- $h_\theta\in\mathcal H$ is the corresponding prediction function
- Training selects a hypothesis from $\mathcal H$

$$
\boxed{\text{parameters }\theta
\quad\longrightarrow\quad
\text{hypothesis }h_\theta}
$$

::right::

<div class="flex flex-col h-full gap-2">

**Example:** $\mathcal H_{\text{linear}} = \{h_{w,b}(x) = wx+b : (w,b) \in \mathbb{R}^2\}$

<div class="flex-1 min-h-0">
<LinearHypothesisDemo />
</div>

</div>


---
section: classical-generalization
layout: bonn-two-cols-header
---

# Parameter Space and Hypothesis Space

## Two parameter sets can map to the same Hypothesis

::left::

The **parameter space** contains the numerical values optimized during training:

$$
\theta\in\Theta
$$

The **hypothesis space** contains the prediction functions the model can represent:

$$
h_\theta\in\mathcal H
$$

A parameterization maps parameter values to hypotheses:

$$
\Phi:\Theta\rightarrow\mathcal H,
\qquad
\theta\mapsto h_\theta
$$

This mapping does not have to be one-to-one:

$$
\theta_1\neq\theta_2
\qquad\text{but}\qquad
\Phi(\theta_1)=\Phi(\theta_2)
$$

::right::

<img src="./assets/parameter_hypothesis_space.svg">



<div class="mt-5 rounded-lg bg-gray-100 px-4 py-3">

**Training moves through parameter space, but predictions are determined by the corresponding hypothesis.**

</div>

---
section: classical-generalization
layout: bonn-two-cols-header
---

# From Optimization to a Learned Hypothesis


::left::

## Navigate parameter space

Gradient descent updates the parameters in a direction that aims to reduce the empirical risk:

<img src="./assets/grad_descent_image.png" class="w-full mt-3">

::right::

## Induce a path through $\mathcal H$

Every parameter value represents a prediction function:


$$
h_{\theta^{(0)}}
\rightarrow
h_{\theta^{(1)}}
\rightarrow\cdots\rightarrow
h_{\theta^{(T)}}\text{, so that } 
\hat h_D=h_{\theta^{(T)}}\in\mathcal H
$$

<img src="./assets/optimize.svg" width="250px" class="mt-2">

<div class="mt-2 rounded-lg bg-gray-100 px-3 py-2 text-center text-sm">

</div>

---
section: classical-generalization
layout: bonn-two-cols-header
---

# Occam's Razor Idea

## Simpler functions should generalize better.

::left::

Willian of Ockham (c. 1287 – 9/10 April 1347)
<img width="200px" src="./assets/William_of_Ockham.png">

::right::

<img src="./assets/occams_razor.svg">

---
section: classical-generalization
layout: bonn-two-cols-header
---

# Bias and Variance

$$
\text{test risk}
=
\underbrace{\text{training risk}}_{\text{related to bias}}
+
\underbrace{
\left(\text{test risk}-\text{training risk}\right)
}_{\text{related to variance}}
$$

::left::

## Bias

**How systematically wrong is the model?**

$$
\operatorname{Bias}(x)
=
\mathbb E_D[\hat f_D(x)]-f^*(x)
$$

- Difference between the average learned model and the true function
- Often caused by a restrictive hypothesis space
- High bias leads to underfitting
- Both training and test error are typically high

::right::

## Variance

**How much does the model depend on the dataset?**

$$
\operatorname{Var}(x)
=
\mathbb E_D\!\left[
\left(
\hat f_D(x)-\mathbb E_D[\hat f_D(x)]
\right)^2
\right]
$$

- Measures variation across different training datasets
- Often increases with model flexibility
- High variance leads to overfitting
- Test error can be much higher than training error


---
section: classical-generalization
layout: bonn-two-cols-header
---

# Example: Linear Regression 

<div style="height: 74%">
  <BiasVarianceDemo />
</div>

::left::

<div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
  <div class="text-[.9rem] font-semibold text-blue-900">Task 1: Discuss the bias and variance of Linear Regression models.</div>
</div>


::right::

<div class="rounded-xl border border-blue-200 bg-blue-50 p-4">
  <div class="text-[.9rem] font-semibold text-blue-900">Task 2: Increase and Decrease the dataset size N, how does the variance change?</div>
</div>


---
section: classical-generalization
layout: bonn-two-cols-header
---

# Controlling Bias and Variance

::left::

## Strategy 1: Introduce Inductive Bias

Use domain knowledge to **restrict or prioritize** hypotheses:

- choose informative features;
- select an appropriate architecture;
- encode known invariances;
- regularize model complexity.

## Strategy 2: Reduce Variance by more Data

Use additional information to rule out hypotheses that fit only by chance:

- collect more labelled data;
- apply valid data augmentation;
- exploit unlabelled data through pretraining.


::right::

<div class="flex items-center justify-center h-full">
<img width=250px src="./assets/inductive_bias2.svg">
</div>


---
section: classical-generalization
layout: bonn-two-cols-header
---

# Bias Variance Trade-Off

::left::

- **Under-fitting of simpler models** have high bias: they do not fit the training data well. Their predictions are fairly consistent across different training sets, so they have low variance.

- **Over-fitting of complex models** have lower bias: they fit the training data closely, sometimes perfectly. Their predictions depend more strongly on the training sample, so they have high variance and may perform poorly on new data.

- The classical **sweet spot** balances bias and variance to minimize test risk.

::right::

<img
  src="./assets/bias_variance_belkin.svg"
  alt="Classical bias–variance trade-off"
  class="w-full max-h-[430px] object-contain"
/>

---
section: classical-generalization
---

# Example Polynomial Regression: 
## Increasing Polynomial Degree D: ↓ Bias ↑ Variance

<div class="h-[220px]">
  <PolynomialBiasVarianceDemo2 />
</div>

---
section: classical-generalization
layout: bonn-two-cols-header
---

# Takeaways Classical Generalization Theory

::left::

- Training minimizes **training risk**, while the goal is low **testing risk**.
- Simpler models are more stable but may underfit because of high bias.
- More flexible models reduce bias but may overfit because of high variance.
- When overfitting, reduce model complexity, increase regularization, or use more data.
- When underfitting, increase model capacity or reduce regularization.
- Use validation data to find the model complexity that best balances bias and variance.

::right::

<img width=300px src="./assets/bias_variance_belkin.svg">

---
layout: bonn-section
sectionColor: "#00457c"
section: modern-generalization
sectionTitle: Modern Generalization
---

# Generalization beyond the Interpolation Threshold

<img src="./assets/interpolation_regime_belkin.svg" />


<!--
Block 2 placeholder. Topics to develop: interpolation threshold, double descent, grokking, implicit regularization, overparameterization, scaling laws, connection to foundation models.
-->

---
section: modern-generalization
---

# Beyond the Threshold: Double Descent in Polynomial Regression

<div class="h-[220px]">
  <PolynomialBiasVarianceDemo3 />
</div>

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
