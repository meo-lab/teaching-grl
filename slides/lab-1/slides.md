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
subhead: Lab 1
home: ../../
---

# Geospatial Representation Learning

<div class="mt-8 text-xl text-gray-600 font-semibold">
Visualizing high-dimensional representation spaces
</div>

---

# Recap: Lecture 1

<script setup>
import PcaEmbeddingDemo from '../lecture-1/components/PcaEmbeddingDemo.vue'
import TsneEmbeddingDemo from '../lecture-1/components/TsneEmbeddingDemo.vue'
</script>

<div class="grid grid-cols-2 gap-6 mt-4">
<div>

## PCA

A linear projection that captures variance.

<PcaEmbeddingDemo />

</div>
<div>

## t-SNE

A nonlinear embedding that preserves local neighborhoods.

<TsneEmbeddingDemo />

</div>
</div>

---
layout: learning-outcomes
mode: before
meeting: lab-01
---

# Learning outcomes

<LearningOutcome id="explain-methods">
<strong>Explain</strong> the core intuition behind PCA and t-SNE
</LearningOutcome>

<LearningOutcome id="apply-methods">
<strong>Apply</strong> both methods to visualize high-dimensional embeddings
</LearningOutcome>

<LearningOutcome id="interpret-plots">
<strong>Interpret</strong> the resulting plots and discuss each method’s limitations
</LearningOutcome>

<LearningOutcome id="teach-method">
<strong>Teach</strong> your assigned method and develop two exam questions with proposed answers
</LearningOutcome>

---

# Expert Group Activity

Each group becomes an expert in **one method**, then teaches a group studying the other topic.

<div class="grid grid-cols-2 gap-10 mt-6">
<div>

## PCA

**Groups 1, 3, 5, 7, 9**

Principal Component Analysis

</div>
<div>

## t-SNE

**Groups 2, 4, 6, 8, 10**

t-distributed Stochastic Neighbor Embedding

</div>
</div>

<div class="mt-8">

**Teaching pairs:** 1 & 2, 3 & 4, 5 & 6, 7 & 8, 9 & 10

</div>

---

# Lab schedule

| Time | Activity | Result |
|---|---|---|
| **60 min** | Self-teaching in expert groups | Understand your method and prepare your group’s slides |
| **45 min** | Teach the group studying the other method | Both methods, with time for questions and comparison |
| **15 min** | Class-wise synthesis | Discuss exam questions selected by the teacher |

<div class="mt-8">

**Total: 120 minutes**

</div>

---

# Expert group preparation

During the **60-minute preparation phase**, use the notebook and your group’s slide deck.

- Explain your method’s core idea and how it constructs a low-dimensional representation
- Explore the GloVe embeddings and include plots that support your explanation
- Discuss what the plots reveal, the method’s limitations and when to use it
- Develop **two exam questions with proposed answers** and add them to your deck

<div class="mt-6">

**The teacher will select questions from your decks for the final class discussion.**

Share the teaching across your group. You have 45 minutes together with your partner group.

</div>

---

# Word embeddings with GloVe

[Open the Google Colab notebook](https://colab.research.google.com/drive/1sQ6h_pFu_yGb-rksiR8LNGIHrcHSsE3m?usp=sharing) to **explore PCA and t-SNE in practice**.

GloVe represents words as vectors. Here, both methods project **300-dimensional word embeddings into 2D**.

<script setup>
import PlotlyPlot from './assets/PlotlyPlot.vue'
import pcaFigure from './assets/glove_pca.json'
import tsneFigure from './assets/globe_tsne.json'
</script>

<div class="grid grid-cols-2 gap-6 mt-2">
  <div class="min-w-0">
    <h3 class="text-xl text-blue-800">Principal Component Analysis (PCA)</h3>
    <PlotlyPlot :figure="pcaFigure" :height="240" label="Interactive PCA plot of word embeddings" />
  </div>
  <div class="min-w-0">
    <h3 class="text-xl text-purple-800">t-distr. Stochastic Neighborhood Embedding</h3>
    <PlotlyPlot :figure="tsneFigure" :height="240" label="Interactive t-SNE plot of word embeddings" />
  </div>
</div>

---

# Group slide decks

Open your assigned deck and add your group’s explanations, plots and exam questions directly in Google Slides.

[Shared Google Drive folder](https://drive.google.com/drive/folders/1cTFMCpW4UemNovjLg2S-lg0cWyIv_S6T?usp=sharing)

| Group | Method | Slides | Group | Method | Slides |
|---|---|---|---|---|---|
| 1 | PCA | [Edit slides](https://docs.google.com/presentation/d/1baVgxHVeH84bjTQ5ZPwIXz3ZnUgb8ySSVZokca8atic/edit) | 2 | t-SNE | [Edit slides](https://docs.google.com/presentation/d/1fyb7l6_EnoHId_3HBeLJJmEYIxqo6axkTreFtKxU4UA/edit) |
| 3 | PCA | [Edit slides](https://docs.google.com/presentation/d/1R0cHHMU-07BllTep-F3L0lm_GhHT8nbM7Kly6S09ukQ/edit) | 4 | t-SNE | [Edit slides](https://docs.google.com/presentation/d/1uJHGMFdhLJN91SnfxdoWfLlotUC17IELK2Fqi5gU4v0/edit) |
| 5 | PCA | [Edit slides](https://docs.google.com/presentation/d/1vQQxXc7Ed-GbF1OBMASSxP_TU4lUSKaYN3PXi9TVfMQ/edit) | 6 | t-SNE | [Edit slides](https://docs.google.com/presentation/d/1JIZ3XeC7VTGT3UMTSUo9061MxwSN4WHwOgFjIS3oWwA/edit) |
| 7 | PCA | [Edit slides](https://docs.google.com/presentation/d/186lB2BMZSb9AFEZeY_PtEvz-IHs4T_X4d5Kgr6OftbQ/edit) | 8 | t-SNE | [Edit slides](https://docs.google.com/presentation/d/1PIrqXVpJ4BO_vDLZlO8MHFDwCihhutaMS3FBncydp2M/edit) |
| 9 | PCA | [Edit slides](https://docs.google.com/presentation/d/1_yUrjzyNeap0i3PZ2t9s70SNOKgWgry1lkgUObuuT1I/edit) | 10 | t-SNE | [Edit slides](https://docs.google.com/presentation/d/1G3xR6MthK7KBO2dwafUJj-q4Nu_c4RGbe7jRev9evG0/edit) |

---

# Phase 1: Self-teaching

**13:00–14:00 · 60 minutes**

Work on your group’s slide deck. Use the notebook to explore your method and prepare your explanation and plots.

**Add two exam questions with proposed answers.** The teacher will select questions for the final discussion.

<div class="text-base mt-4">

| Group | Method | Slides | Group | Method | Slides |
|---|---|---|---|---|---|
| 1 | PCA | [Edit slides](https://docs.google.com/presentation/d/1baVgxHVeH84bjTQ5ZPwIXz3ZnUgb8ySSVZokca8atic/edit) | 2 | t-SNE | [Edit slides](https://docs.google.com/presentation/d/1fyb7l6_EnoHId_3HBeLJJmEYIxqo6axkTreFtKxU4UA/edit) |
| 3 | PCA | [Edit slides](https://docs.google.com/presentation/d/1R0cHHMU-07BllTep-F3L0lm_GhHT8nbM7Kly6S09ukQ/edit) | 4 | t-SNE | [Edit slides](https://docs.google.com/presentation/d/1uJHGMFdhLJN91SnfxdoWfLlotUC17IELK2Fqi5gU4v0/edit) |
| 5 | PCA | [Edit slides](https://docs.google.com/presentation/d/1vQQxXc7Ed-GbF1OBMASSxP_TU4lUSKaYN3PXi9TVfMQ/edit) | 6 | t-SNE | [Edit slides](https://docs.google.com/presentation/d/1JIZ3XeC7VTGT3UMTSUo9061MxwSN4WHwOgFjIS3oWwA/edit) |
| 7 | PCA | [Edit slides](https://docs.google.com/presentation/d/186lB2BMZSb9AFEZeY_PtEvz-IHs4T_X4d5Kgr6OftbQ/edit) | 8 | t-SNE | [Edit slides](https://docs.google.com/presentation/d/1PIrqXVpJ4BO_vDLZlO8MHFDwCihhutaMS3FBncydp2M/edit) |
| 9 | PCA | [Edit slides](https://docs.google.com/presentation/d/1_yUrjzyNeap0i3PZ2t9s70SNOKgWgry1lkgUObuuT1I/edit) | 10 | t-SNE | [Edit slides](https://docs.google.com/presentation/d/1G3xR6MthK7KBO2dwafUJj-q4Nu_c4RGbe7jRev9evG0/edit) |

</div>

---

# Phase 2: Teach the other group

**14:00–14:45 · 45 minutes**

<div class="grid grid-cols-2 gap-12 mt-6">
<div>

## Teaching pairs

| PCA group | t-SNE group |
|---|---|
| 1 | 2 |
| 3 | 4 |
| 5 | 6 |
| 7 | 8 |
| 9 | 10 |

</div>
<div>

## Both groups teach

- Use your slides to explain your method and demonstrate your plots
- Give each group time to teach and answer questions
- Compare what PCA and t-SNE reveal and discuss their limitations

</div>
</div>

---

# Phase 3: Class-wise synthesis

**14:45–15:00 · 15 minutes**

The teacher asks selected exam questions from the group decks.

- Discuss the questions together as a class
- Explain the reasoning behind your answers
- Connect the answers to the strengths and limitations of PCA and t-SNE

<div class="mt-8">

**Use this discussion to clarify anything that remains unclear.**

</div>

---
layout: learning-outcomes
mode: after
meeting: lab-01
---

# Revisit the learning outcomes
