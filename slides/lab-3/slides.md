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
subhead: Lab 3
home: ../../
---

# Lab 3 — Build and Use the Shared Dataset

<div class="mt-8 text-[.95rem] text-gray-600 font-semibold">
Turn the files collected in Lab 2 into point queries, combine sources, then test representations.
</div>

<!--
Lab 2 supplied checked files and source documentation. Lab 3 builds the code that reads them.
-->

---

# Lab 3 Workflow

1. Fork the supplied repository once per group and clone your fork.
2. Connect your Lab 2 file to a download script and a PyTorch dataset.
3. Query named values at coordinates and handle missing or outside-coverage results.
4. Integrate your source into the combined dataset and open a pull request.
5. Use the combined data to compare feature representations and models.

<div class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-[.75rem]">
<strong>Inputs from Lab 2:</strong> the uploaded GeoTIFF, GeoJSON, or shapefile ZIP and your group's two explanatory slides.
</div>

---

# Collaborating with GitHub

- <strong>Fork</strong> the instructor's repository once per group.
- <strong>Clone</strong> the group fork into your working environment.
- Develop together; <strong>commit</strong> and <strong>push</strong> working changes.
- Open a <strong>pull request</strong> to the central repository.
- Review, revise, and merge with the instructor.

<div class="mt-4 rounded-lg border border-gray-200 p-3 text-[.75rem]">
Starting repository: <span class="italic text-amber-700">[ LINK TO BE PROVIDED ]</span>
</div>

<!--
One group fork contains the source-specific implementation. Do not commit the source data into Git.
-->

---

# Make Your Source Queryable

1. Read your group's two Lab 2 slides and download the uploaded subset.
2. Adapt the supplied download script to retrieve the file and cache it in <code>data/</code>.
3. Adapt the land-cover or building example into a PyTorch dataset for your source.
4. Return named variables for a requested latitude and longitude.
5. Transform coordinates as needed; distinguish missing values from valid zeros.
6. Check known locations against the original map or source data.

<div class="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-[.75rem]">
The file is downloaded when needed, then queried locally. A point query should not download it again.
</div>

---

# Integrate the Group Contribution

1. Agree on variable names and the point-query interface.
2. Connect your dataset to the combined dataset script.
3. Confirm the combined query returns your source alongside the supplied examples.
4. Run the repository checks and inspect plausible results at known points.
5. Push the change, open a pull request, and respond to review.

<div class="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-3 text-[.75rem]">
<strong>Technical deliverable:</strong> a reviewed contribution that makes your Lab 2 source available through the shared query.
</div>

<!--
The instructor coordinates integration and merging. Students should not assume they have merge access.
-->

---

# Combined Point Query

<div class="grid grid-cols-2 gap-6 mt-4">

<div>

```python
dataset.query(latitude=..., longitude=...)
```

```python
{
    "land_cover":    ...,
    "building":      ...,
    "your_modality": ...
}
```

</div>

<div class="text-sm text-gray-700">
<p>Each source may have its own resolution, CRS, and observation date.</p>
<p>Keep variable meanings and missing-data conventions from the Lab 2 slides.</p>
<p>Use the repository's actual query interface; this example is illustrative.</p>
</div>

</div>

---

# The Task

- Classify land cover from the dataset assembled in this lab
- Work with point-based samples from raster/geospatial layers
- Use one dataset consistently across all experiments
- Evaluate predictions on held-out data

<div class="mt-4 rounded-lg border border-gray-200 p-3 text-[.75rem] text-gray-700">
For the model comparison, use Python in <strong>Google Colab</strong>, <strong>VS Code</strong>, or local Jupyter. CPU is enough.
</div>

<!--
Set practical scope and constraints quickly.
Emphasize that students own implementation details, but comparison logic is fixed.
-->

---

# Experimental Questions

<div class="grid grid-cols-3 gap-4 mt-3">
  <div class="rounded-lg border border-gray-200 p-3">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-700">Q1</div>
    <div class="mt-1 text-[.8rem]">Does feature engineering help?</div>
  </div>
  <div class="rounded-lg border border-gray-200 p-3">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-700">Q2</div>
    <div class="mt-1 text-[.8rem]">Does complementary information help?</div>
  </div>
  <div class="rounded-lg border border-gray-200 p-3">
    <div class="text-[.65rem] font-bold uppercase tracking-wide text-blue-700">Q3</div>
    <div class="mt-1 text-[.8rem]">When do we need a nonlinear model?</div>
  </div>
</div>

<div class="mt-4 text-[.78rem] text-gray-600">
Treat this as an experiment: hold conditions fixed and change one conceptual factor at a time.
</div>

<!--
Frame the lab as hypothesis testing.
Students should reason about effects, not just run models.
-->

---

# Build the Dataset Once

- Choose/extract labeled sample locations
- Build one table: <strong>rows = locations</strong>, <strong>columns = features</strong>
- Target column: land-cover class
- Create one fixed train / validation / test split

<div class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-[.75rem]">
<strong>Important:</strong> Do the split once and reuse it for every experiment.
</div>

<!--
Core scientific control: fixed split.
This lets students attribute performance changes to representation/model choices.
-->

---

# Baseline: Logistic Regression

- Use <code>LogisticRegression</code> as the linear baseline
- Input: feature vector per sample
- Learns a linear decision boundary
- Fast, simple, and interpretable reference model

<div class="mt-4 text-[.82rem] font-semibold text-blue-800">
Key question: How good is your representation if linear separation is all you allow?
</div>

<!--
Keep this tied to Lecture 3 terminology: linear decision boundary and features.
Avoid deeper derivations here.
-->

---

# Change the Representation (Model Fixed)

<div class="text-[.8rem] mb-2">Retrain the same <code>LogisticRegression</code> while changing features:</div>

1. Small raw feature set (e.g., Red + NIR)
2. Raw features + engineered feature (e.g., NDVI)
3. Several Sentinel-2 bands
4. Bands + complementary variables from the combined dataset (if available)

<div class="mt-4 text-[.75rem] text-gray-600">
Prompt: What changes when the model stays fixed but the representation changes?
</div>

<!--
This slide expresses the feature-design learning outcome.
Stress incremental changes rather than arbitrary feature dumping.
-->

---

# Compare with Random Forest

- Run <code>RandomForestClassifier</code> on the same representations
- Keep the exact same train/validation/test split
- Compare against logistic regression fairly

<div class="grid grid-cols-2 gap-4 mt-4 text-[.76rem]">
  <div class="rounded-lg border border-gray-200 p-3">
    <strong>Logistic Regression</strong><br>
    Linear decision boundary
  </div>
  <div class="rounded-lg border border-gray-200 p-3">
    <strong>Random Forest</strong><br>
    Nonlinear decision boundaries
  </div>
</div>

<!--
Interpretation frame: RF outperforming LR can indicate representation is not linearly convenient.
Do not present RF as universally better.
-->

---

# Ablation Table

| Representation | Logistic Regression | Random Forest |
| --- | --- | --- |
| Raw baseline | … | … |
| + NDVI | … | … |
| + additional bands | … | … |
| + complementary features | … | … |

<div class="mt-3 text-[.74rem] text-gray-600">
Use accuracy (and optionally macro-F1). Focus on interpreting changes, not maximizing one score.
</div>

<!--
This is the central artifact students should produce.
Same split + controlled representation changes + model comparison.
-->

---

# Interpret the Experiment

- Which representation change helped most?
- When did logistic regression approach random-forest performance?
- What does the model gap suggest about feature-space geometry?

<div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[.75rem]">
<strong>Caution:</strong> More dimensions are not automatically better. Useful, complementary information matters.
</div>

<!--
Drive conceptual interpretation, not just reporting metrics.
Link outcomes to representation quality and decision-boundary shape.
-->

---

# Takeaway → Lecture 4

1. Feature engineering changes the representation.
2. Complementary information can make classification easier.
3. A strong representation can make simple linear models surprisingly powerful.

<div class="mt-6 rounded-xl border-2 border-blue-300 bg-blue-50 p-4 text-center">
  <div class="text-[.78rem] uppercase tracking-wide text-blue-700 font-semibold">Next</div>
  <div class="mt-1 text-[.95rem] font-semibold text-blue-900">
    In Lab 3 you designed representations manually.<br>
    In Lecture 4: what if the model learns the representation itself?
  </div>
</div>

<!--
Close with explicit bridge to Deep Representation Learning I.
This transition is the pedagogical handoff to Lecture 4.
-->
