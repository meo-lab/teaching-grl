---
addons:
  - "../../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lab 1
home: ../../
---

# Geospatial Representation Learning

<div class="mt-8 text-xl text-gray-600 font-semibold">
Lab 1: Why Geospatial Representation Learning?
</div>

---

# Lab 1 Overview

**Learning Objectives**

By the end of this lab, you will be able to:

1. Understand the mathematical intuition behind PCA and t-SNE
2. Explain your assigned method to a peer who studied the other one
3. Compare the two approaches and discuss when each is appropriate

---

# Expert Group Activity

This lab uses a **jigsaw learning** structure.

<div class="grid grid-cols-2 gap-6 mt-6">

<div class="p-5 rounded-xl border border-blue-300 bg-blue-50">
<h3 class="text-blue-800">Group A — PCA</h3>

Study **Principal Component Analysis** as a way to reduce high-dimensional geospatial data to a 2D embedding.

→ You will teach Group B what PCA does and when to use it.
</div>

<div class="p-5 rounded-xl border border-purple-300 bg-purple-50">
<h3 class="text-purple-800">Group B — t-SNE</h3>

Study **t-distributed Stochastic Neighbor Embedding** as a way to visualize geospatial feature spaces.

→ You will teach Group A what t-SNE does and when to use it.
</div>

</div>

---

# Peer Teaching Session

After studying your method, form pairs with one person from Group A and one from Group B.

<div class="grid grid-cols-2 gap-6 mt-4">

<div class="p-4 rounded-xl border">
<h3>Each person explains (~5 min):</h3>

1. What your method does — in plain language
2. The key mathematical idea behind it
3. One strength and one limitation for geospatial use
</div>

<div class="p-4 rounded-xl border">
<h3>Together, discuss (~5 min):</h3>

- Which method produced cleaner clusters in the examples you studied?
- Could you combine them? (e.g. PCA → t-SNE)
- Which would you use for a downstream ML task — and why?
</div>

</div>

---

# Submit Your Exam Questions

Based on what you learned and discussed, write **2 exam questions** — one on PCA and one on t-SNE.

<div class="grid grid-cols-2 gap-6 mt-6">

<div class="p-5 rounded-xl border border-blue-300 bg-blue-50">
<h3 class="text-blue-800">PCA question</h3>

Write a question that tests conceptual understanding — not just a definition.

*Example style: "Under what conditions would PCA fail to separate two land-cover classes that t-SNE separates cleanly?"*
</div>

<div class="p-5 rounded-xl border border-purple-300 bg-purple-50">
<h3 class="text-purple-800">t-SNE question</h3>

Write a question that probes a common misconception or a key limitation.

*Example style: "A student trains t-SNE on a dataset and wants to embed new satellite patches. What is the problem with this approach?"*
</div>

</div>

<div class="mt-6 text-sm text-gray-500">Submit via the course portal — best questions will appear in the quiz!</div>

---

# Live Quiz

<div class="mt-4 text-lg">
We'll work through the best submitted questions together as a class.
</div>

<div class="mt-6 grid grid-cols-1 gap-4">

<div class="p-4 rounded-xl border">
<strong>Format:</strong> Question appears on screen → 60 seconds to think → discuss with your neighbour → class vote / discussion
</div>

<div class="p-4 rounded-xl border">
<strong>Goal:</strong> Surface misconceptions and reinforce the key distinctions between PCA and t-SNE before the next lecture.
</div>

</div>
