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

<img class="bonn-section-image-sm" src="./figures/datacube.jpg" alt="Illustration of a geospatial data cube stacking heterogeneous layers" />

<div class="bonn-section-citation">
Image by <a href="https://www.researchgate.net/profile/Miguel-Mahecha-2?_tp=eyJjb250ZXh0Ijp7ImZpcnN0UGFnZSI6Il9kaXJlY3QiLCJwYWdlIjoicHVibGljYXRpb24ifX0" target="_blank" rel="noopener noreferrer">Miguel D. Mahecha</a>
</div>

<!--
Begin with the heterogeneous layers from Lecture 2.
This section will establish common coordinate support, stacking, and fixed feature extraction.
-->

---
section: geospatial-data-cubes
---

# Recap: Geospatial Data

<div class="grid grid-cols-5 gap-8 mt-4 items-start">

<div class="col-span-2">

- satellite imagery
- thematic rasters such as land cover
- vector geometries and attributes
- model and reanalysis fields
- observations collected at different times and scales

</div>

<div class="col-span-3">

<blockquote class="blockquote3">
Each source describes locations on its own spatial and temporal support.
</blockquote>

</div>

</div>

<div class="grid grid-cols-4 gap-4 mt-8">

<div class="text-center">
<img src="./figures/bonn_S2.png" class="w-full aspect-square object-cover rounded-xl border" alt="Sentinel-2 satellite image of Bonn" />
<div class="text-[.62rem] text-gray-500 mt-1">Satellite imagery (Bonn, Sentinel-2)</div>
</div>

<div class="text-center">
<img src="./figures/lulc-amsterdam.png" class="w-full aspect-square object-cover rounded-xl border" alt="Land cover map of Amsterdam" />
<div class="text-[.62rem] text-gray-500 mt-1">Thematic raster (land cover, Amsterdam)</div>
</div>

<div class="text-center">
<img src="./figures/osm_popp_db.png" class="w-full aspect-square object-cover rounded-xl border" alt="OpenStreetMap vector data near Poppelsdorfer Schloss" />
<div class="text-[.62rem] text-gray-500 mt-1">Vector geometries (OpenStreetMap)</div>
</div>

<div class="text-center">
<img src="./figures/population_density.png" class="w-full aspect-square object-cover rounded-xl border" alt="Population density raster" />
<div class="text-[.62rem] text-gray-500 mt-1">Model / reanalysis field (population density)</div>
</div>

</div>

<!--
Presenter note: Activate prior knowledge from Lecture 2 without repeating its details. Ask students what spatial and temporal support each source uses.
-->

---
section: geospatial-data-cubes
---

# Datacubes align Data Spatially and Temporally

<img src="./figures/datacube_alignment.webp" class="mt-8 h-[330px] w-full object-contain" alt="Alignment of geospatial datasets with different spatial and temporal supports" />

<div class="figure-copyright">
Source: Kopp et al. (2019), <a href="https://www.mdpi.com/2306-5729/4/3/94" target="_blank" rel="noopener noreferrer"><em>Achieving the Full Vision of Earth Observation Data Cubes</em></a>, <em>Data</em> 4(3), 94.
</div>

---
section: geospatial-data-cubes
---

# Rasterization and Interpolation

<div class="grid grid-cols-2 gap-10 mt-3">

<div>
<div class="text-sm font-semibold text-blue-800 mb-1 text-center">Rasterization</div>
<RasterizationDiagram />
<div class="mt-3 text-[.64rem] leading-relaxed text-gray-600 text-left">
Open-source tools:<br>
<code class="font-mono text-[.6rem] bg-gray-100 text-gray-700 rounded px-1">gdal_rasterize</code> (CLI)<br>
<code class="font-mono text-[.6rem] bg-gray-100 text-gray-700 rounded px-1">rasterio.features.rasterize</code> (Python)
</div>
</div>

<div>
<div class="text-sm font-semibold text-blue-800 mb-1 text-center">Interpolation</div>

<div class="flex items-center justify-center gap-8 mt-1">
<InterpolationDiagram />

<div class="text-[.75rem]">

<div class="text-[.66rem] font-semibold text-blue-800">Bilinear</div>
<div class="text-[.58rem] text-gray-500 -mt-0.5">2&times;2 neighborhood</div>

$$
\hat{z} = \frac{\sum_{i=1}^{4} z_i / d_i}{\sum_{i=1}^{4} 1 / d_i}
$$

<div class="text-[.66rem] font-semibold text-blue-800 mt-3">Cubic</div>
<div class="text-[.58rem] text-gray-500 -mt-0.5">4&times;4 neighborhood</div>

$$
\hat{z} = \frac{\sum_{i=1}^{16} z_i / d_i^{3}}{\sum_{i=1}^{16} 1 / d_i^{3}}
$$

</div>

</div>

<div class="mt-2 text-[.64rem] leading-relaxed text-gray-600 text-left">
Open-source tools:<br>
<code class="font-mono text-[.6rem] bg-gray-100 text-gray-700 rounded px-1">gdalwarp</code> /
<code class="font-mono text-[.6rem] bg-gray-100 text-gray-700 rounded px-1">gdal_translate</code> (CLI)<br>
<code class="font-mono text-[.6rem] bg-gray-100 text-gray-700 rounded px-1">rasterio.warp.reproject</code> (Python)
</div>
</div>


</div>

<!--
Presenter note: Rasterization converts vector geometries to grid cells using a majority-area rule.
Interpolation resamples values between misaligned grids using distance-weighted (linear) interpolation.
-->

---
section: geospatial-data-cubes
---

# From Data Cube to Feature Vector

<div class="grid grid-cols-5 gap-8 mt-4 items-center">

<div class="col-span-2">
  <img src="./figures/data.svg" class="h-[310px] w-full object-contain" alt="Geospatial data layers sampled at one location to form a feature vector" />
</div>

<div class="col-span-3 text-[.78rem] leading-snug">

Sampling all $p$ variables at location $i$ produces a fixed feature vector:

$$
\mathbf{x}_i = [x_{i1}, x_{i2}, \ldots, x_{ip}]
$$

For example:

$$
\begin{aligned}
\mathbf{x}_i = [&\text{elevation},\ \text{slope},\ \text{spectral bands},\\
                 &\text{temperature},\ \text{building density}]
\end{aligned}
$$

Repeating the extraction at $n$ locations creates a feature matrix:

$$
\mathbf{X} \in \mathbb{R}^{n \times p}
$$

<div class="mt-4 flex items-center justify-center gap-3 font-semibold text-blue-800">
  <span>features xᵢ</span>
  <span aria-hidden="true">&rarr;</span>
  <span>machine-learning model</span>
  <span aria-hidden="true">&rarr;</span>
  <span>prediction ŷᵢ</span>
</div>

<div class="mt-3 border-l-4 border-yellow-400 pl-3 text-[.66rem] text-gray-600">
Training target yᵢ: kept separate from the input features.
</div>

</div>

</div>

<!--
Presenter note: A time-dependent cube yields fixed-length vectors only after selecting a time, a fixed window, or temporal summary statistics.
TODO: Replace the placeholder with a cube-to-vector illustration and add a provisional prediction task.
-->

---
section: geospatial-data-cubes
---

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

<div style="height: 125px;">
<PlotlyHistogram dataset="green" x-label="Green reflectance" />
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

<div style="height: 110px;">
<PlotlyHistogram dataset="ndvi" x-label="NDVI" :show-legend="false" />
</div>

</div>

</div>

</div>

<!--
Presenter note: This slide is the bridge from geospatial images to tabular ML data.
Click 1: sample points on both the input image and the target map.
Click 2: collapse both into one tabular dataset, X columns plus y column, one row per point &mdash; the format every classic ML model in this lecture consumes.
-->

---
section: geospatial-data-cubes
---

# Classic Machine Learning Pipeline

<div class="mt-1 text-gray-700 text-[.82rem] text-center">
Good, hand-selected features combined with a suitable model determine the quality of the result.
</div>

<div class="relative mt-8">

<img src="./figures/classic_ml.svg" class="w-full object-contain" alt="Classic machine learning pipeline: hand-designed features such as NDVI, NDWI, and GLCM textures are extracted from an input tensor and passed to a linear/logistic regression or random forest model to produce predicted classes" />

<div class="absolute" style="left: 36.2%; top: 100%; transform: translate(0, 10px);">
<div class="flex items-center gap-1.5 text-[.68rem] font-semibold whitespace-nowrap" style="color: var(--grl-data-orange);">
<span class="w-2 h-2 rounded-full flex-shrink-0" style="background: var(--grl-data-orange);"></span>
Section 1 &middot; Geospatial Data Cubes
</div>
</div>

<div class="absolute" style="left: 73%; top: 100%; transform: translate(0, 10px);">
<div class="flex items-center gap-1.5 text-[.68rem] font-semibold whitespace-nowrap text-red-600">
<span class="w-2 h-2 rounded-full flex-shrink-0 bg-red-600"></span>
Sections 2&ndash;3 &middot; Linear Models &amp; Random Forests
</div>
</div>

</div>

<!--
Presenter note: This slide is the lecture map. Feature design (orange) is Section 1; the model (red) is what Sections 2-3 build, first as a linear model, then as a decision tree / random forest.
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: linear-models
sectionTitle: Linear Models
---

# Linear Regression

<img class="bonn-section-image-sm" src="./figures/LR.png" alt="Illustration of linear regression: data points, a fitted line, and vertical residuals" />

<div class="bonn-section-citation">
Figure: M. Rußwurm &amp; D. Tuia, <em>Linear Regression</em>, ENV-408 course materials, EPFL, 2023.
</div>

<!--
Move from constructed feature vectors to prediction.
This section will progress from continuous targets to categorical predictions and linear boundaries.
-->

---

# Why Linear Regression?

<ul>
<li>a simple, classical approach to supervised learning</li>
<li v-click>predicts a <strong>continuous</strong> response from one or more predictors</li>
<li v-click>around for a long time, yet still one of the most used tools in science</li>
<li v-click>a strong, interpretable baseline &mdash; and a stepping stone to more complex models</li>
</ul>

<blockquote v-click class="blockquote3 mt-4">
Learning linear regression helps understand more complex methods, and it is practically useful and easy to implement for many real-world problems.
</blockquote>

---

# Measuring Relationships Between Variables

<div class="grid grid-cols-2 gap-10 mt-6">

<div>
<div class="text-sm font-semibold text-blue-800 mb-2 text-center">Classic example</div>
<FeatureTargetDiagram
  :features="[
    { label: 'TV ads', symbol: 'x₁', width: 5 },
    { label: 'radio ads', symbol: 'x₂', width: 4 },
    { label: 'newspaper ads', symbol: 'x₃', width: 2.5 },
  ]"
  target="sales"
  target-symbol="y"
/>
</div>

<div>
<div class="text-sm font-semibold text-blue-800 mb-2 text-center">Geospatial example</div>
<FeatureTargetDiagram
  :features="[
    { label: 'elevation', symbol: 'x₁', width: 5 },
    { label: 'slope', symbol: 'x₂', width: 4 },
    { label: 'aspect', symbol: 'x₃', width: 2.5 },
  ]"
  target="surface temperature"
  target-symbol="y"
/>
</div>

</div>

<div class="mt-4 text-gray-700">
Linear regression models how one or more predictor variables (features) relate to a continuous target &mdash; exactly the fixed representations built in the previous section.
</div>

---

# A Closer Look at the Data

<div class="text-gray-700">

$\mathcal{D} = \{((x_{1,i}, x_{2,i}, x_{3,i}), y_i)\}_{i=1}^N$

</div>

<img src="./figures/advertisement_vs_sales.png" class="w-full h-[280px] object-contain rounded-xl mt-2" alt="Scatter plots of sales against TV, radio, and newspaper advertising budgets, each with a fitted regression line" />

<div class="grid grid-cols-3 gap-4 mt-1 text-center text-gray-700 text-sm">

<div>

$x_1 \mapsto y$ (TV &rarr; sales)

</div>

<div>

$x_2 \mapsto y$ (radio &rarr; sales)

</div>

<div>

$x_3 \mapsto y$ (newspaper &rarr; sales)

</div>

</div>

<div class="figure-copyright">
Figure: James, Witten, Hastie &amp; Tibshirani, <a href="https://www.statlearning.com/" target="_blank" rel="noopener noreferrer"><em>An Introduction to Statistical Learning</em></a>, Advertising dataset.
</div>

---

# Linear Regression Answers Important Questions

<div class="grid grid-cols-3 gap-8 mt-6 items-center">

<div class="col-span-2">

<ul>
<li>is there a relationship between advertising budget and sales?</li>
<li v-click>how strong is the relationship?</li>
<li v-click>is there synergy among the advertising media?</li>
</ul>

</div>

<div>
<img src="./figures/advertisement_vs_sales_1.png" class="w-full h-[260px] object-contain rounded-xl" alt="Scatter plot of sales against radio advertising budget with a fitted regression line" />
</div>

</div>

<div class="mt-4 text-gray-700">
The same questions apply to our geospatial example: is there a relationship between elevation and surface temperature &mdash; and how strong is it?
</div>

---

# Univariate Linear Regression

<div class="grid grid-cols-2 gap-8 mt-4 items-center">

<div class="flex items-center justify-center gap-3">
<div class="relative">
<img src="./figures/dem.png" class="h-[170px] object-contain rounded-xl" alt="Digital elevation model of a catchment" />
<div v-click="1" class="absolute w-2.5 h-2.5 rounded-full" style="top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--grl-data-orange); box-shadow: 0 0 0 2px white;"></div>
</div>
<div class="text-2xl text-blue-800">&rarr;</div>
<div class="relative">
<img src="./figures/tave.png" class="h-[170px] object-contain rounded-xl" alt="Average temperature raster" />
<div v-click="1" class="absolute w-2.5 h-2.5 rounded-full" style="top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--grl-data-orange); box-shadow: 0 0 0 2px white;"></div>
</div>
</div>

<div>

A simple (but powerful) linear model

$$
\hat{y} = f(x;\beta_0,\beta_1) = \beta_0 + x\beta_1
$$

maps an elevation $x$ to an estimated temperature $\hat{y}$, with $\beta_0$ the y-intercept and $\beta_1$ the slope.

</div>

</div>

<div class="figure-copyright">
Figure: M. Rußwurm &amp; D. Tuia, <em>Linear Regression</em>, ENV-408 course materials, EPFL, 2023.
</div>

---

# The Problem: Finding $\hat{\boldsymbol{\beta}}$

<div class="grid grid-cols-2 gap-8 mt-6 items-center">

<div class="flex justify-center">
<RegressionScatterDemo variant="points" x-label="elevation x" y-label="temperature y" :clicks="$clicks" />
</div>

<div>

We have a dataset of data samples $(x_i, y_i)$.

<blockquote v-click class="blockquote3 mt-4">

<strong>Problem:</strong> how do we find good model parameters $\hat{\boldsymbol{\beta}} = (\hat{\beta}_0, \hat{\beta}_1)$ for our linear model $f(x;\hat{\boldsymbol{\beta}}) = \hat{\beta}_0 + x\hat{\beta}_1$?

</blockquote>

</div>

</div>

---

# What Is a Good Model &mdash; Formally?

<div class="grid grid-cols-2 gap-8 mt-6 items-center">

<div class="flex justify-center">
<RegressionScatterDemo variant="error-band" x-label="elevation x" y-label="temperature y" />
</div>

<div>

$$
\begin{aligned}
y_i &= f(x_i;\hat{\boldsymbol{\beta}}) \pm \overbrace{\varepsilon}^{\text{error}} \\
\hat{y}_i &= f(x_i;\hat{\boldsymbol{\beta}})
\end{aligned}
$$

with the error $\varepsilon$ as a random variable &mdash; the model never fits the data perfectly.

</div>

</div>

---

# Residuals

<div class="grid grid-cols-2 gap-8 mt-6 items-center">

<div class="flex justify-center">
<RegressionScatterDemo variant="residual-segments" x-label="elevation x" y-label="temperature y" :clicks="$clicks" />
</div>

<div>

Concretely, the error &mdash; the "residual" $\varepsilon_i$ &mdash; for each sample $i$:

$$
\vert \hat{y}_i - y_i \vert = \varepsilon_i
$$

<div v-click>

We want to minimize the residuals over the whole dataset

$$
\min \frac{1}{N} \sum_{i=1}^N \varepsilon_i
$$

</div>

</div>

</div>

---

# Mean Absolute Error (MAE)

<div class="grid grid-cols-2 gap-8 mt-6 items-center">

<div class="flex justify-center">
<RegressionScatterDemo variant="residual-segments" x-label="x" y-label="y" />
</div>

<div>

$$
\text{MAE}(\mathcal{D}, \boldsymbol{\beta}) = \frac{1}{N} \sum_{i=1}^N \vert \hat{y}_i - y_i \vert
$$

over model $\boldsymbol{\beta}$ with $\hat{y}_i = f(x_i;\boldsymbol{\beta})$ and dataset $\mathcal{D} = \{x_i, y_i\}_{i=1}^N$

<blockquote class="blockquote1 mt-3">
Very intuitive &mdash; but does not punish large errors.
</blockquote>

</div>

</div>

---

# Mean Squared Error (MSE)

<div class="grid grid-cols-2 gap-8 mt-6 items-center">

<div class="flex justify-center">
<RegressionScatterDemo variant="residual-squares" x-label="x" y-label="y" />
</div>

<div>

$$
\text{MSE}(\mathcal{D}, \boldsymbol{\beta}) = \frac{1}{2N} \sum_{i=1}^N (\hat{y}_i - y_i)^2
$$

Punishes large errors with a square penalty.

<blockquote class="blockquote2 mt-3">
<strong>Geometric intuition:</strong> find a model that minimizes the total area of these squares.
</blockquote>

</div>

</div>

---
layout: bonn-two-cols-header
---

# Vertical vs. Perpendicular Error Offsets

Both measure a residual &mdash; but they disagree on what "error" means for a spatial variable.

::left::

<div class="text-center text-sm font-semibold text-blue-800 mb-2">Vertical offsets</div>

<RegressionScatterDemo variant="offsets-vertical" x-label="x" y-label="y" :clicks="$clicks" />

<div v-click.hide="1">

$$
\min \frac{1}{N}\sum_i \vert (\beta_0+x_i\beta_1) - y_i\vert
$$

</div>
<div v-click="1">

$$
\min \frac{1}{2N}\sum_i \left((\beta_0+x_i\beta_1) - y_i\right)^2
$$

</div>

- simple, and often sufficient (e.g. temperature vs. elevation)
- **but:** the error changes with how the axes are chosen

::right::

<div class="text-center text-sm font-semibold text-blue-800 mb-2">Perpendicular offsets</div>

<RegressionScatterDemo variant="offsets-perpendicular" x-label="x" y-label="y" :clicks="$clicks" />

<div v-click.hide="1">

$$
\min \frac{1}{N}\sum_i \frac{\vert (\beta_0+x_i\beta_1) - y_i\vert}{\sqrt{1+\beta_1^2}}
$$

</div>
<div v-click="1">

$$
\min \frac{1}{2N}\sum_i \frac{\left((\beta_0+x_i\beta_1) - y_i\right)^2}{1+\beta_1^2}
$$

</div>

- makes the error depend only on the fitted model, not the coordinate system
- useful when both axes represent comparable spatial quantities

<div class="figure-copyright mt-2">
Ordinary least squares (next) uses vertical offsets. See <a href="https://mathworld.wolfram.com/LeastSquaresFittingPerpendicularOffsets.html" target="_blank" rel="noopener noreferrer">Least Squares Fitting &mdash; Perpendicular Offsets</a>, MathWorld.
</div>

---

# Ordinary Least Squares (OLS) &mdash; Intuition

The closed-form solution $\hat{\beta}_0, \hat{\beta}_1$ for a linear model under MSE.

<blockquote class="blockquote3 mt-6">

<strong>Task:</strong> find $\hat{\beta}_0,\hat{\beta}_1$ that minimize the Mean Squared Error

</blockquote>

$$
\hat{\beta}_0,\hat{\beta}_1 = \operatorname*{arg\,min}_{\beta_0,\beta_1} \frac{1}{2N} \sum_{i=1}^N \left(\overbrace{\beta_0 + x_i \beta_1}^{\hat{y}_i} - y_i \right)^2
$$

<div v-click class="mt-6">

**Question:** how do we minimize a function with respect to its parameters?

</div>

<div v-click>

- calculate the partial derivatives $\frac{\partial \text{MSE}}{\partial \beta_0}$ and $\frac{\partial \text{MSE}}{\partial \beta_1}$
- set the derivatives to zero: $\frac{\partial \text{MSE}}{\partial \beta_0} = 0$, $\frac{\partial \text{MSE}}{\partial \beta_1} = 0$
- solve for $\beta_0$ and $\beta_1$

</div>

---

# Ordinary Least Squares (OLS) &mdash; Solution

Model $y = \beta_0 + x\beta_1$ on a dataset $\mathcal{D} = \{x_i, y_i\}_{i=1}^N$

Ordinary Least Squares objective

$$
\hat{\beta}_0,\hat{\beta}_1 = \operatorname*{arg\,min}_{\beta_0,\beta_1} \frac{1}{2N} \sum_{i=1}^N \left(\overbrace{\beta_0 + x_i \beta_1}^{\hat{y}_i} - y_i \right)^2
$$

Closed-form solution

$$
\begin{aligned}
\hat{\beta}_0 &= \frac{1}{N}\sum_{i=1}^N y_i - \hat{\beta}_1 \frac{1}{N}\sum_{i=1}^N x_i = \bar{y} - \hat{\beta}_1 \bar{x} \\[.3em]
\hat{\beta}_1 &= \frac{\text{Cov}[x,y]}{\text{Var}[x]} = \frac{\frac{1}{N}\sum_i (x_i - \bar{x})(y_i - \bar{y})}{\frac{1}{N}\sum_i (x_i - \bar{x})^2}
\end{aligned}
$$

<div class="figure-copyright">
See <a href="https://en.wikipedia.org/wiki/Ordinary_least_squares" target="_blank" rel="noopener noreferrer">Ordinary Least Squares</a>, Wikipedia.
</div>

---
layout: bonn-two-cols-header
---

# Limits of Univariate Models

Some relationships are well-described by a single variable &mdash; most are not.

::left::

<div class="text-center text-sm font-semibold text-blue-800 mb-2">Roughly linear</div>

<div class="flex items-center justify-center gap-2">
<img src="./figures/dem.png" class="h-[130px] object-contain rounded-xl" alt="Digital elevation model" />
<div class="text-lg text-blue-800">&rarr;</div>
<img src="./figures/tave.png" class="h-[130px] object-contain rounded-xl" alt="Average temperature raster" />
</div>

<div class="mt-3 text-center text-gray-700 text-sm">

elevation &rarr; average temperature, roughly $-0.006\frac{\text{°C}}{\text{m}}$

</div>

::right::

<div class="text-center text-sm font-semibold text-blue-800 mb-2">Clearly non-linear</div>

<div class="flex items-center justify-center gap-2">
<img src="./figures/dem.png" class="h-[130px] object-contain rounded-xl" alt="Digital elevation model" />
<div class="text-lg text-blue-800">?</div>
<img src="./figures/st.png" class="h-[130px] object-contain rounded-xl" alt="Surface temperature raster with local hot and cold spots" />
</div>

<div class="mt-3 text-center text-gray-700 text-sm">
elevation &rarr; surface temperature &mdash; shading, wind, and local terrain also matter
</div>

---

# Multivariate Models: Linearize With Good Feature Design

<div class="grid grid-cols-2 gap-8 mt-4 items-center">

<div class="flex justify-center">
<FeatureTargetDiagram
  :features="[
    { label: 'elevation', symbol: 'x₁' },
    { label: 'slope', symbol: 'x₂' },
    { label: 'aspect', symbol: 'x₃' },
  ]"
  target="surface temperature"
  target-symbol="y"
/>
</div>

<div>

Many non-linear relationships can be linearized with good feature design: elevation alone under-explains surface temperature, but elevation **and** slope **and** aspect together explain it much better.

<div class="mt-4 text-gray-700 text-sm">
Same pattern as classical feature extraction: extract informative features, then fit a simple model.
</div>

<img src="./figures/pipeline.png" class="w-full h-[70px] object-contain mt-3" alt="Generic pipeline: extract distinguishing features, then train and use a model" />

</div>

</div>

---

# From Uni- to Multivariate Linear Models

**Univariate model** $y = f(x;\beta_0,\beta_1)$ with scalar $x,y$ and two parameters

$$
y = \beta_0 + \overbrace{x_1}^{\text{e.g., elev.}}\beta_1
$$

**Multivariate linear model**

- one input sample $\mathbf{x}_i = (1, x_1, x_2, x_3, \dots, x_p)$ of $p$ features
- corresponding target $y_i$
- one weight per feature $\boldsymbol{\beta} = (\beta_0, \beta_1, \beta_2, \dots, \beta_p)$

$$
y_i = \beta_0 + \overbrace{x_1}^{\text{e.g., elev.}}\beta_1 + \overbrace{x_2}^{\text{e.g., slope}}\beta_2 + \overbrace{x_3}^{\text{e.g., aspect}}\beta_3 + \dots = \boldsymbol{\beta}^\top \mathbf{x}_i
$$

---

# Multivariate Linear Model in Matrix Form

<div class="grid grid-cols-2 gap-8 mt-4 items-center">

<div>

A multivariate dataset $\mathcal{D} = \{\mathbf{x}_i, y_i\}_{i=1}^n$ as matrix $\mathbf{X}$ and target vector $\mathbf{y}$, with $n$ samples and $p$ features

$$
\mathbf{X} =
\begin{pmatrix}
1 & \overbrace{x_{11}}^{\text{elev.}} & \overbrace{x_{21}}^{\text{slope}} & \overbrace{x_{31}}^{\text{aspect}} & \dots \\
1 & x_{12} & x_{22} & x_{32} & \dots \\
\vdots & \vdots & \vdots & \vdots & \ddots \\
1 & x_{1n} & x_{2n} & x_{3n} & \dots
\end{pmatrix}\!,\;\;
\mathbf{y} = \begin{pmatrix} y_1 \\ y_2 \\ \vdots \\ y_n \end{pmatrix}
$$

<div v-click>

And the model

$$
\mathbf{y} = \mathbf{X}\hat{\boldsymbol{\beta}} + \overbrace{\boldsymbol{\varepsilon}}^{\text{errors}}
$$

with $p{+}1$ parameters $\hat{\boldsymbol{\beta}} = (\hat{\beta}_0, \hat{\beta}_1, \dots, \hat{\beta}_p)$

</div>

<div v-click>

$$
\boldsymbol{\varepsilon} = \overbrace{\left\Vert \mathbf{X}\hat{\boldsymbol{\beta}} - \mathbf{y} \right\Vert^2}^{\text{MSE}}
$$

</div>

</div>

<div class="flex justify-center">
<img v-click="1" src="./figures/OLS_illustration.png" class="w-full max-h-[280px] object-contain" alt="Geometric illustration of ordinary least squares: y is projected onto the column space of X, and the residual is orthogonal to the fitted value" />
</div>

</div>

---

# Multivariate Ordinary Least Squares

$$
\hat{\boldsymbol{\beta}} = \operatorname*{arg\,min}_{\hat{\boldsymbol{\beta}}} \text{MSE}(\hat{\boldsymbol{\beta}}) = \operatorname*{arg\,min}_{\hat{\boldsymbol{\beta}}} \left\Vert \mathbf{X}\hat{\boldsymbol{\beta}} - \mathbf{y} \right\Vert^2
$$

<div v-click class="mt-8">

**Question:** how do we minimize a function with respect to its parameters &mdash; now a whole vector $\hat{\boldsymbol{\beta}}$?

</div>

<div v-click>

- calculate the partial derivatives $\frac{\partial \text{MSE}}{\partial \hat{\boldsymbol{\beta}}}$
- set the derivatives to zero: $\frac{\partial \text{MSE}}{\partial \hat{\boldsymbol{\beta}}} = 0$
- solve for $\hat{\boldsymbol{\beta}}$

</div>

---

# Multivariate OLS &mdash; Closed-form Derivation

With Mean Squared Error

$$
\text{MSE}(\hat{\boldsymbol{\beta}}) = \left\Vert \mathbf{y} - \mathbf{X}\hat{\boldsymbol{\beta}} \right\Vert^2 = \mathbf{y}^\top\mathbf{y} - 2\hat{\boldsymbol{\beta}}^\top\mathbf{X}^\top\mathbf{y} + \hat{\boldsymbol{\beta}}^\top\mathbf{X}^\top\mathbf{X}\hat{\boldsymbol{\beta}}
$$

and its derivative set to zero

$$
\begin{aligned}
\frac{\partial \text{MSE}(\hat{\boldsymbol{\beta}})}{\partial \hat{\boldsymbol{\beta}}} &= -2\mathbf{X}^\top\mathbf{y} + 2\mathbf{X}^\top\mathbf{X}\hat{\boldsymbol{\beta}} = 0 \\
\mathbf{X}^\top\mathbf{X}\hat{\boldsymbol{\beta}} &= \mathbf{X}^\top\mathbf{y} \\[.4em]
\hat{\boldsymbol{\beta}} &= \left(\mathbf{X}^\top\mathbf{X}\right)^{-1} \mathbf{X}^\top\mathbf{y}
\end{aligned}
$$

<blockquote class="blockquote2 mt-4">
This is the <strong>normal equation</strong> &mdash; a closed-form solution, no iterative optimization required.
</blockquote>

---

# Let's Appreciate the Elegance

<div class="grid grid-cols-2 gap-8 mt-6 items-center">

<div class="text-center">

<img src="./figures/before_fit.png" class="w-full h-[220px] object-contain rounded-xl" alt="Predictions of an untrained model with beta = 0, far from the true values" />

<div class="mt-2 text-sm text-gray-600">

$\boldsymbol{\beta} = (0,0,0,0,\dots)$

</div>

</div>

<div class="text-center">

<img src="./figures/after_fit.png" class="w-full h-[220px] object-contain rounded-xl" alt="Predictions of the fitted model closely tracking the true values" />

<div class="mt-2 text-sm text-gray-600">

$\boldsymbol{\beta} = (-.1,.2,.5,-.5,\dots)$

</div>

</div>

</div>

<blockquote class="blockquote3 mt-6 text-center">

$\hat{\boldsymbol{\beta}} = \left(\mathbf{X}^\top\mathbf{X}\right)^{-1} \mathbf{X}^\top\mathbf{y}$ &mdash; a single line of code, and blazing fast.

</blockquote>

---

# Interpretable Coefficients

<div class="grid grid-cols-2 gap-8 mt-4 items-center">

<div class="flex justify-center">
<FeatureTargetDiagram
  :features="[
    { label: 'elevation', symbol: 'x₁', width: 5 },
    { label: 'slope', symbol: 'x₂', width: 4 },
    { label: 'aspect', symbol: 'x₃', width: 2.5 },
  ]"
  target="surface temperature"
  target-symbol="y"
/>
</div>

<div>
<img src="./figures/coefficients.png" class="w-full max-h-[200px] object-contain rounded-xl" alt="Fitted coefficients table: y-intercept and one weight per terrain feature" />

<div class="mt-3 text-gray-700 text-sm">

Each $\hat{\beta}_j$ tells us how $\hat{y}$ changes per unit of $x_j$, holding the other features fixed.

</div>

<blockquote class="blockquote1 mt-2">
Caveat: coefficients are only directly comparable across features when the features share units &mdash; or are normalized.
</blockquote>

</div>

</div>

<div class="figure-copyright">
Figure: M. Rußwurm &amp; D. Tuia, <em>Linear Regression</em>, ENV-408 course materials, EPFL, 2023.
</div>

---

# Model Evaluation

<div class="grid grid-cols-2 gap-8 mt-4 items-center">

<div class="flex justify-center">
<RegressionScatterDemo variant="trainval-3" x-label="elevation x" y-label="temperature y" :clicks="$clicks" />
</div>

<div>

We can now fit a model $(\hat{\beta}_0, \hat{\beta}_1, \dots)$ to any set of data samples $\mathcal{D} = \{(x_i,y_i)\}_{i=1}^N$ &mdash; but different samples give different fits.

<div v-click="2">

$$
Y = \beta_0 + \beta_1 X_1 + \dots + \varepsilon
$$

**Did we capture the true, underlying relationship** $(\beta_0, \beta_1, \dots)$?

</div>

<ol>

<li v-click="3">

how large is the data error $\varepsilon$? &rarr; RSE

</li>

<li v-click="4">

does our model explain the target variable well? &rarr; R²

</li>

<li v-click="5">

how close is $\hat{\beta}$ to the true $\beta$? &rarr; $\text{SE}[\hat{\beta}]$

</li>

</ol>

</div>

</div>

<blockquote v-click="6" class="blockquote3 mt-2">
&rarr; a hypothesis test tells us whether the relationship is significant given the dataset size.
</blockquote>

---

# Residual Sum of Squares (RSS)

<div class="grid grid-cols-2 gap-8 mt-6 items-center">

<div>

$$
\text{RSS} = \sum_{i=1}^N (y_i - \hat{y}_i)^2
$$

RSS increases with the dataset size $N$.

<blockquote class="blockquote2 mt-3">
Idea: normalize by the number of data samples.
</blockquote>

</div>

<div class="flex justify-center">
<RegressionScatterDemo variant="residual-squares" x-label="x" y-label="y" />
</div>

</div>

---

# Residual Standard Error (RSE)

<div class="grid grid-cols-2 gap-8 mt-6 items-center">

<div>

$$
\text{RSE} = \sqrt{\frac{1}{\underbrace{N-M-1}_{\text{DoF}}} \text{RSS}}
$$

- normalized by the number of samples $N$
- and the degrees of freedom (DoF): $M$ slope parameters and one y-intercept

<blockquote v-click class="blockquote3 mt-3">

The RSE estimates $\text{std}(\varepsilon)$ and is a good measure of fit.

</blockquote>

<blockquote v-click class="blockquote3 mt-2">

&rarr; but it is in the <strong>units of the target variable</strong>: what number counts as a good fit?

</blockquote>

</div>

<div class="flex justify-center">
<RegressionScatterDemo variant="error-band" x-label="x" y-label="y" />
</div>

</div>

---

# R² Metric: Coefficient of Determination

The R² is a **unitless proportion**, typically between 0 and 1: it measures how much of the variability in $Y$ is explained by $\hat{Y}$.

<img  src="./figures/errors_r2.png" class="w-full h-[220px] object-contain rounded-xl mt-4" alt="Three scatter plots with low, medium, and high random error, each annotated with its R2 and RSE" />

<div v-click="1" class="mt-2 text-gray-700 text-sm">

In the univariate case, R² is the square of the <strong>Pearson correlation coefficient</strong>
$r(Y,\hat{Y}) = \dfrac{\text{Cov}[Y,\hat{Y}]}{\sigma_Y \sigma_{\hat{Y}}}$.

</div>

<div class="figure-copyright">
Figure: M. Rußwurm &amp; D. Tuia, <em>Linear Regression</em>, ENV-408 course materials, EPFL, 2023. See also <a href="https://en.wikipedia.org/wiki/Coefficient_of_determination" target="_blank" rel="noopener noreferrer">Coefficient of Determination</a>, Wikipedia.
</div>

---

# R²: Comparison to an Averaging Model

How much better is our model than a simple averaging model that always predicts $\bar{y}$, no matter the input $x$?

<div class="grid grid-cols-2 gap-8 mt-4 items-center">

<div>

$$
\text{R}^2 = 1 - \frac{\text{RSS}}{\text{TSS}}
$$

Residual Sum of Squares

$$
\text{RSS} = \sum_{i=1}^N (y_i-\hat{y}_i)^2
$$

Total Sum of Squares

$$
\text{TSS} = \sum_{i=1}^N (y_i-\bar{y})^2
$$

</div>

<img src="./figures/r2_figure.png" class="w-full max-h-[260px] object-contain" alt="Diagram comparing residuals of the fitted model to residuals of the averaging model that predicts the mean" />

</div>

---

# Estimating the Standard Error for Coefficients

In the underlying model

$$
Y = \beta_0 + \beta_1 X_1 + \dots + \varepsilon
$$

we can estimate the residual standard error $\sigma = \text{std}(\varepsilon) = \text{RSE}$ &mdash; the better the fit, the smaller the standard deviation of $\varepsilon$.

<div v-click>

<blockquote class="blockquote3 mt-4">

How close are the estimated coefficients $\hat{\boldsymbol{\beta}}$ to the true, underlying relationship $\boldsymbol{\beta}$?

</blockquote>

We can calculate the Standard Error (SE) for each coefficient:

$$
\text{SE}[\hat{\beta}_0] = \sigma^2\left[\frac{1}{N} + \frac{\bar{x}^2}{\sum_{i=1}^N (x_i-\bar{x})^2}\right], \qquad
\text{SE}[\hat{\beta}_1] = \frac{\sigma^2}{\sum_{i=1}^N (x_i-\bar{x})^2}
$$

</div>

---

# Student's t-test: Is Our Model Significant?

**Question:** is an estimated relationship a random artifact of the data?

<div class="grid grid-cols-2 gap-8 mt-4 items-center">

<div>

Model: $Y = \beta_0 + \beta_1 X_1 + \varepsilon$

Testing the slope $\beta_1$

$$
H_0: \beta_1 = 0 \qquad H_1: \beta_1 \neq 0
$$

<div v-click="1">

Test statistic

$$
t_0 = \frac{\hat{\beta}_1}{\text{SE}[\hat{\beta}_1]}
$$

</div>

<blockquote v-click="2" class="blockquote3 mt-2">

Reject $H_0$ if $t_0 < -t_{\alpha,N-2}$ or $t_0 > t_{\alpha,N-2}$

</blockquote>

</div>

<div v-click="2">

<img src="./figures/student_t.png" class="w-full max-h-[220px] object-contain" alt="Student's t probability density functions for different degrees of freedom" />

<div class="mt-2 text-sm text-gray-600">

$t_{\alpha,N-2}$ comes from the Student-t distribution with $\nu = N-2$ degrees of freedom.

</div>

</div>

</div>

<div class="figure-copyright">
Figure: Wikipedia, author Skbkekas, <a href="https://en.wikipedia.org/wiki/Student%27s_t-distribution" target="_blank" rel="noopener noreferrer">Student's t-distribution</a>. CC BY-SA.
</div>

---

# P-value: The Probability of a Lucky Shot

<div class="grid grid-cols-2 gap-8 mt-4 items-center">

<div>

The (two-sided) p-value integrates the Student-t distribution to $t_0$ on both sides.

<div v-click class="grid grid-cols-2 gap-3 mt-4">
<div class="p-3 rounded-xl border box-card box-2 text-center text-sm">high p-value &rarr; not enough data</div>
<div class="p-3 rounded-xl border box-card box-3 text-center text-sm">high p-value &rarr; no relationship</div>
</div>

<blockquote v-click class="blockquote3 mt-4">
We can use the p-value of different coefficients to select significant features.
</blockquote>

</div>

<div>
<img src="./figures/student_t_pdf_pvalue.png" class="w-full max-h-[220px] object-contain" alt="Student's t probability density function with the two-sided p-value shaded in red" />
<div class="mt-1 text-sm text-gray-600 text-center">p-value shown in red</div>
</div>

</div>

<div class="figure-copyright">
Figure modified from Wikipedia, original author Skbkekas, <a href="https://en.wikipedia.org/wiki/Student%27s_t-distribution" target="_blank" rel="noopener noreferrer">Student's t-distribution</a>. CC BY-SA.
</div>

---

# Recap: Linear Regression

This part covered how to:

<ul>
<li v-click>implement a univariate and multivariate linear model from scratch</li>
<li v-click>fit the parameters with the Ordinary Least Squares (OLS) method</li>
<li v-click>evaluate the goodness of fit with RSE and R²</li>
<li v-click>test individual parameters for significance with Student's t-test</li>
<li v-click>select features dynamically based on their significance</li>
</ul>

<blockquote v-click class="blockquote3 mt-6">
Next: logistic regression extends the same linear model to map a fixed representation to <strong>categories</strong> with a linear decision boundary.
</blockquote>

---
layout: bonn-section
sectionColor: "#00457c"
section: decision-trees-and-random-forests
sectionTitle: "Decision Trees & Random Forests"
---

# Non-linear models: Decision Trees & Random Forests

<img class="bonn-section-image-sm" src="./figures/decision_tree.png" alt="Illustration of a geospatial data cube stacking heterogeneous layers" />

<div class="bonn-section-citation">
Image by Bing Image Generator
</div>

<!--
Extend the linear-model view with recursive partitions and ensembles.
This section will end with random forests as robust predictors on fixed representations.
-->

---
layout: iframe
url: https://1drv.ms/p/c/8b5d216883cce16e/IQQADh2OcmK7TqSdcc_PDpWFAaMjdo22FykU8NLcOmcTGP0?wdAr=1.7777777777777777
---
