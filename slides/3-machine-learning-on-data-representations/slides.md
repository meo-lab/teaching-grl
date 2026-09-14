---
addons:
  - "../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lecture 3
home: ../
---

# Machine Learning on Data Representations

## Learning on fixed representations

<!--
Connect the heterogeneous data collected in Lecture 2 to classical machine learning.
Frame the lecture question: how can many data sources become one representation for prediction?
-->

---

# Learning Outcome Roadmap

<div class="mt-3 text-[.58rem] leading-tight whitespace-nowrap">

| | Learning outcome | Lecture | Block |
|---|---|---|---|
| ⬜ | Explain how heterogeneous datasets align to a common coordinate support and form a geospatial data cube. | <span class="text-blue-700 font-semibold">Lecture 3</span> | Geospatial Data Cubes |
| ⬜ | Represent locations as fixed feature vectors extracted from a geospatial data cube. | <span class="text-blue-700 font-semibold">Lecture 3</span> | Geospatial Data Cubes |
| ⬜ | Explain how linear regression maps a fixed representation to a continuous target. | <span class="text-blue-700 font-semibold">Lecture 3</span> | Linear Models |
| ⬜ | Explain how logistic regression maps a fixed representation to categories with a linear decision boundary. | <span class="text-blue-700 font-semibold">Lecture 3</span> | Linear Models |
| ⬜ | Explain how decision trees partition a fixed representation space into nonlinear decision regions. | <span class="text-blue-700 font-semibold">Lecture 3</span> | Decision Trees &amp; Random Forests |
| ⬜ | Explain how random forests combine trees for robust predictions from fixed representations. | <span class="text-blue-700 font-semibold">Lecture 3</span> | Decision Trees &amp; Random Forests |

</div>

<!--
Establish the three-block route from heterogeneous data to robust nonlinear prediction.
Emphasize that every model in this lecture learns on a representation that we construct first.
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: geospatial-data-cubes
sectionTitle: Geospatial Data Cubes
---

# Geospatial Data Cubes

<div class="text-[.9rem] text-gray-700 mt-4">
Many heterogeneous geospatial datasets become one consistent representation.
</div>

<!--
Begin with the heterogeneous layers from Lecture 2.
This section will establish common coordinate support, stacking, and fixed feature extraction.
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: linear-models
sectionTitle: Linear Models
---

# Linear Models

<div class="text-[.9rem] text-gray-700 mt-4">
A fixed representation becomes input to a simple parametric mapping.
</div>

<!--
Move from constructed feature vectors to prediction.
This section will progress from continuous targets to categorical predictions and linear boundaries.
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: decision-trees-and-random-forests
sectionTitle: "Decision Trees & Random Forests"
---

# Decision Trees & Random Forests

<div class="text-[.9rem] text-gray-700 mt-4">
The same fixed representation supports nonlinear predictive rules.
</div>

<!--
Extend the linear-model view with recursive partitions and ensembles.
This section will end with random forests as robust predictors on fixed representations.
-->

---
section: decision-trees-and-random-forests
---

# Fixed and Learned Representations

<div style="display: grid; grid-template-columns: 1fr 1px 1fr; align-items: stretch; gap: 2rem; margin-top: 2.5rem;">
  <div>
    <div style="font-size: .62rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #1d4ed8; margin-bottom: .75rem;">Lecture 3</div>
    <div style="font-size: 1.05rem; line-height: 1.35; font-weight: 600; color: #1f2937;">Construct representation &rarr; learn prediction</div>
    <div style="margin-top: 1rem; font-size: .72rem; line-height: 1.6; color: #4b5563;">We align heterogeneous data, extract fixed features, and fit a predictive model.</div>
  </div>
  <div style="width: 1px; background: #d1d5db;"></div>
  <div>
    <div style="font-size: .62rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #047857; margin-bottom: .75rem;">Lectures 4–5</div>
    <div style="font-size: 1.05rem; line-height: 1.35; font-weight: 600; color: #1f2937;">Learn representation &rarr; learn prediction</div>
    <div style="margin-top: 1rem; font-size: .72rem; line-height: 1.6; color: #4b5563;">Deep models learn useful internal features directly from data.</div>
  </div>
</div>

<div style="margin-top: 2.5rem; border-top: 1px solid #d1d5db; padding-top: 1rem; text-align: center; font-size: .82rem; font-weight: 600; color: #00457c;">
  Lecture 3 learns on a representation. Lectures 4–5 learn the representation itself.
</div>

<!--
Close Lecture 3 by naming the course-level distinction.
Use this slide to hand off from fixed representations to deep representation learning.
-->
