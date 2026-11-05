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

# Lab 3 — Improve a Land-Cover Classifier

<div class="mt-8 text-[.95rem] text-gray-600 font-semibold">
Start from the provided notebook and improve its accuracy.
</div>

<!--
Two-hour lab in the Lab 2 groups. Everyone starts from the same Sentinel-2 random forest notebook.
The task: improve the accuracy by any means (more data, PCA, domain features, tuning), re-run the evaluation and report the accuracy.
At the end, groups report their accuracies for a leaderboard.
-->

---

# Task: Land-Cover Classification in Bonn

<div class="grid grid-cols-[5fr_6fr] gap-8 mt-3 items-center">

<div>
<img src="./figures/lc.png" class="w-full h-[300px] object-contain rounded-xl" alt="Land cover classification map of Bonn" />
</div>

<div class="text-[.8rem]">

Build a **random forest** that predicts the land-cover class at each location &mdash; and improve its test accuracy **by any means necessary**:

<div class="flex flex-col gap-2 mt-3">
<div class="rounded-lg border-2 border-[#00457c] px-3 py-1.5"><strong class="text-[#00457c]">1 &middot; More data</strong> &mdash; add geodata from Lab 2</div>
<div class="rounded-lg border-2 border-[#00457c] px-3 py-1.5"><strong class="text-[#00457c]">2 &middot; Decorrelated data</strong> &mdash; PCA on the input variables</div>
<div class="rounded-lg border-2 border-[#00457c] px-3 py-1.5"><strong class="text-[#00457c]">3 &middot; Domain-specific features</strong> &mdash; e.g. NDVI</div>
<div class="rounded-lg border-2 border-[#ff7900] px-3 py-1.5"><strong class="text-[#ff7900]">4 &middot; Better-tuned random forests</strong> &mdash; hyperparameters</div>
</div>

</div>

</div>

<!--
The four options follow the four sections of Lecture 3: more data, less redundant data (PCA), more descriptive data (domain knowledge), better models (random forests).
Blue = feature side, orange = model side, as in the lecture's machine learning pipeline.
-->

---

<script setup>
import PlotlyHistogram from './components/PlotlyHistogram.vue'
</script>

# Dataset

<div class="relative mt-1">

<div v-click-hide="2" class="grid grid-cols-2 gap-8">

<div>
<div class="text-sm font-semibold text-blue-800 mb-1 text-center">Input X <span class="font-normal text-gray-500">(e.g., Sentinel-2 pixel reflectances)</span></div>

<div class="relative" style="height: 195px;">
<img v-click-hide="1" src="./figures/s2.png" class="absolute inset-0 w-full h-full object-contain rounded-xl" alt="Sentinel-2 satellite image of Bonn" />
<img v-click="1" src="./figures/s2_pts.png" class="absolute inset-0 w-full h-full object-contain rounded-xl" alt="Sentinel-2 image with sampled points overlaid" />
</div>

<div v-click="1" class="compact-table mt-2">

| Pt | Red | Green | Blue | NIR |
|---|---|---|---|---|
| Pt1 | 0.08 | 0.11 | 0.09 | 0.42 |
| Pt2 | 0.21 | 0.19 | 0.15 | 0.05 |
| &vellip; | &vellip; | &vellip; | &vellip; | &vellip; |

</div>
</div>

<div>
<div class="text-sm font-semibold text-blue-800 mb-1 text-center">Target y <span class="font-normal text-gray-500">(e.g., land cover labels)</span></div>

<div class="relative" style="height: 195px;">
<img v-click-hide="1" src="./figures/lc.png" class="absolute inset-0 w-full h-full object-contain rounded-xl" alt="Land cover classification map of Bonn" />
<img v-click="1" src="./figures/lc_pts.png" class="absolute inset-0 w-full h-full object-contain rounded-xl" alt="Land cover map with sampled points overlaid" />
</div>

<div v-click="1" class="compact-table mt-2">

| Pt | Land Cover |
|---|---|
| Pt1 | Vegetation |
| Pt2 | Built-up |
| &vellip; | &vellip; |

</div>
</div>

</div>

<div v-click="2" class="absolute inset-0 top-0">

<div class="grid grid-cols-3 gap-3 items-center">

<div class="col-span-2">
<div class="text-[.66rem] font-semibold text-gray-500 mb-1">Raw bands</div>

<div class="compact-table">

| Pt | Red | Green | Blue | NIR | Land Cover |
|---|---|---|---|---|---|
| Pt1 | 0.08 | 0.11 | 0.09 | 0.42 | **Vegetation** |
| Pt2 | 0.21 | 0.19 | 0.15 | 0.05 | **Built-up** |
| &vellip; | &vellip; | &vellip; | &vellip; | &vellip; | &vellip; |

</div>
</div>

<div style="height: 145px;">
<PlotlyHistogram dataset="green" x-label="Green reflectance" :height="145" />
</div>

</div>

<div v-click="3" class="grid grid-cols-3 gap-3 items-center mt-4">

<div class="col-span-2">
<div class="text-[.66rem] font-semibold text-gray-500 mb-1">Engineered feature</div>

<div class="text-[.68rem] text-gray-600 mb-1">

$$
\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}
$$

</div>

<div class="compact-table">

| Pt | NDVI | Land Cover |
|---|---|---|
| Pt1 | 0.68 | **Vegetation** |
| Pt2 | -0.62 | **Built-up** |
| &vellip; | &vellip; | &vellip; |

</div>
</div>

<div style="height: 120px;">
<PlotlyHistogram dataset="ndvi" x-label="NDVI" :show-legend="false" :height="120" />
</div>

</div>

</div>

</div>

<!--
Presenter note: This slide is the bridge from geospatial images to tabular ML data.
Click 1: sample points on both the input image and the target map.
Click 2: collapse both into one tabular dataset, X columns plus y column, one row per point &mdash; the format every classic ML model consumes.
Click 3: combine red and NIR into NDVI. The new feature separates vegetation from built-up more clearly than green reflectance alone, making the classification easier.
-->

---

# Your Task in Four Steps

<div class="grid grid-cols-4 gap-4 mt-6 text-[.78rem]">

<div class="rounded-xl border-2 border-[#00457c] p-3">
<div class="text-[1.4rem] font-bold text-[#00457c]">1</div>
<strong>Study</strong> the provided notebook
</div>

<div class="rounded-xl border-2 border-[#00457c] p-3">
<div class="text-[1.4rem] font-bold text-[#00457c]">2</div>
<strong>Improve</strong> the classifier by any of the four means
</div>

<div class="rounded-xl border-2 border-[#00457c] p-3">
<div class="text-[1.4rem] font-bold text-[#00457c]">3</div>
<strong>Run</strong> the evaluation and note the accuracy
</div>

<div class="rounded-xl border-2 border-[#ff7900] p-3">
<div class="text-[1.4rem] font-bold text-[#ff7900]">4</div>
<strong>Report</strong> your accuracy with your group number for the leaderboard
</div>

</div>

<div class="mt-6 text-[.8rem]">

- **Notebook:** [Lab 3 land-cover classification notebook](https://drive.google.com/file/d/1Hie8H-nR5DAvS5pawNaKaO_DTFgiqWz6/view?usp=drive_link) &mdash; make a copy for your group
- **Lab 3 files:** [Sentinel-2 image, land-cover raster and sample coordinates](https://drive.google.com/drive/folders/1EeJd6xvcZpgvdPJ8TgLOrogf_2n-Jg9q?usp=sharing)
- **Additional geodata:** [Lab 2 data collection](https://drive.google.com/drive/folders/10w5toFK7Hv9QeXCRJTYN4MgWE2TDqgeT)

</div>

<div class="mt-3 text-[.72rem] text-gray-600">
Stay in your Lab 2 groups. Work with pandas; a CPU runtime is sufficient.
</div>

---

# Step 1 &middot; Study the Provided Notebook

Open the [notebook](https://drive.google.com/file/d/1Hie8H-nR5DAvS5pawNaKaO_DTFgiqWz6/view?usp=drive_link), save a copy, and run it once from top to bottom with the [Lab 3 files](https://drive.google.com/drive/folders/1EeJd6xvcZpgvdPJ8TgLOrogf_2n-Jg9q?usp=sharing). Find out:

<div class="grid grid-cols-2 gap-6 mt-4 text-[.78rem]">

<div>

- **Locations:** where are the sample coordinates loaded, and which rows are <code>train</code> and <code>test</code>?
- **Features:** how are the Sentinel-2 bands sampled at these locations?
- **Labels:** how is the land-cover class sampled as the target?

</div>

<div>

- **DataFrame:** which columns form the features X and the target y?
- **Model:** how is the random forest fitted?
- **Evaluation:** where are the test accuracy and the confusion matrix computed?

</div>

</div>

<div class="mt-5 rounded-lg border border-gray-200 p-3 text-[.75rem]">
Write down the <strong>baseline accuracy</strong> of the unchanged notebook. You will compare against it in Step 3.
</div>

---

# Step 2 &middot; Improve the Classifier

Try one or more of the four means &mdash; one change at a time, so you know what helped.

<div class="grid grid-cols-2 gap-3 mt-3 text-[.72rem]">

<div class="rounded-lg border-2 border-[#00457c] px-3 py-1.5">
<strong class="text-[#00457c]">1 &middot; More data</strong><br>
sample sources from the <a href="https://drive.google.com/drive/folders/10w5toFK7Hv9QeXCRJTYN4MgWE2TDqgeT" target="_blank" rel="noopener noreferrer">Lab 2 data collection</a> at the same coordinates; add them as new columns, matched by <code>sample_id</code>
</div>

<div class="rounded-lg border-2 border-[#00457c] px-3 py-1.5">
<strong class="text-[#00457c]">2 &middot; Decorrelated data</strong><br>
transform the input columns with <code>sklearn.decomposition.PCA</code>; fit it on the <code>train</code> rows only
</div>

<div class="rounded-lg border-2 border-[#00457c] px-3 py-1.5">
<strong class="text-[#00457c]">3 &middot; Domain-specific features</strong><br>
compute indices such as NDVI from the bands; S2 bands: <strong>B2, B3, B4, B8</strong> (blue, green, red, NIR)
</div>

<div class="rounded-lg border-2 border-[#ff7900] px-3 py-1.5">
<strong class="text-[#ff7900]">4 &middot; Better-tuned random forests</strong><br>
e.g. <code>n_estimators</code>, <code>max_depth</code>, <code>max_features</code>; tune with cross-validation on the <code>train</code> rows
</div>

</div>

<div class="mt-3 text-[.7rem] text-gray-600">
Checks: transform coordinates to each source's CRS (S2: EPSG:32632, land cover: EPSG:4326) &middot; check missing values &middot; never use the land-cover label or the <code>test</code> rows to build features or tune the model.
</div>

---

# Step 3 &middot; Run the Evaluation

Re-run the notebook's evaluation with your improved model.

- keep the supplied <code>train</code> / <code>test</code> split unchanged
- if your new data has gaps, evaluate the baseline and your model on the **same rows**

<div class="compact-table mt-4 text-[.8rem]">

| Model | Train rows | Test rows | Test accuracy |
| --- | --- | --- | --- |
| Baseline (Sentinel-2 only) | &hellip; | &hellip; | &hellip; |
| Your improved model (what you changed: &hellip;) | &hellip; | &hellip; | &hellip; |

</div>

<div class="mt-3 text-[.72rem] text-gray-600">
Look at the confusion matrix: which classes improve, and which errors remain?
</div>
