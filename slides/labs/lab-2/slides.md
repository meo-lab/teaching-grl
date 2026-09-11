---
addons:
  - "../../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lab 2
home: ../../
---

# Geospatial Representation Learning

<div class="mt-8 text-xl text-gray-600 font-semibold">
Lab 2: Geodata Scavenger Hunt
</div>

<!--
Everyone works independently on a different source, but the class collectively builds a multimodal dataset for the same place. By the end of the session, the room holds a shared, multi-layer view of the same patch of Earth.
-->

---

# The Challenge

<div class="mt-10 text-center text-3xl font-semibold text-gray-700">
Find one way of measuring our area of interest on Earth.
</div>

<div class="mt-6 text-center text-lg text-gray-500">
Each of you will acquire one different geospatial data modality<br>and contribute it to our shared class dataset.
</div>

<!--
The challenge is deliberately open-ended. There is no single correct portal or file format. The difficulty is understanding what you have, not just downloading it.
-->

---

# Same Place — Many Measurements

<div class="mt-6 flex items-start gap-10">

<div class="text-2xl font-bold text-gray-700 pt-2 min-w-max">AOI</div>

<div class="text-3xl text-gray-400 pt-1">→</div>

<div class="grid grid-cols-2 gap-x-8 gap-y-2 text-base text-gray-700">
  <div>📡 radar backscatter</div>
  <div>🌡 surface temperature</div>
  <div>🛰 optical reflectance</div>
  <div>🌧 precipitation</div>
  <div>🏔 elevation</div>
  <div>🌱 land cover</div>
  <div>👥 population</div>
  <div>🛣 road network</div>
  <div>🌊 soil moisture</div>
  <div class="text-gray-400 italic">… and more</div>
</div>

</div>

<div class="mt-8 text-sm text-gray-500">
The same coordinates can carry many different measurements. Each student contributes one layer.
</div>

<!--
The point is that geographic coordinates act as a key: many independent measurement systems share the same spatial index. This is the core concept behind multimodal geospatial datasets and will be revisited in Lab 3.
-->

---

# Your Assignment

<div class="grid grid-cols-2 gap-6 mt-6">

<div class="p-5 rounded-xl border">

**Every student receives:**

- One assigned data modality or source
- The same Area of Interest (AOI)
- The same required output CRS

Work on your assigned source only.

</div>

<div class="p-5 rounded-xl border border-amber-200 bg-amber-50">

**Assignment table**

<div class="mt-2 text-sm text-amber-700 italic">
⚠ Instructor: insert or link to the student–dataset assignment table here.
</div>

<div class="mt-3 text-sm text-gray-500">
AOI: <span class="italic text-amber-700">[ to be provided ]</span><br>
Required output CRS: <span class="italic text-amber-700">[ e.g. EPSG:XXXXX ]</span><br>
Shared Drive folder: <span class="italic text-amber-700">[ link ]</span><br>
Shared Google Slides: <span class="italic text-amber-700">[ link ]</span>
</div>

</div>

</div>

<!--
Assignments should be predetermined by name. Students should not all choose the easiest dataset. Having one student per modality also means the class discussion will cover a wide range of data ecosystems.
-->

---

# What You Need to Deliver

<div class="mt-4 grid grid-cols-1 gap-3">

<div class="p-4 rounded-xl border flex gap-4 items-start">
<div class="text-xl font-semibold text-gray-400">①</div>
<div>One geospatial data file covering the AOI</div>
</div>

<div class="p-4 rounded-xl border flex gap-4 items-start">
<div class="text-xl font-semibold text-gray-400">②</div>
<div>Data kept at its <strong>native spatial resolution</strong> — do not resample</div>
</div>

<div class="p-4 rounded-xl border flex gap-4 items-start">
<div class="text-xl font-semibold text-gray-400">③</div>
<div>Data reprojected to the required output CRS</div>
</div>

<div class="p-4 rounded-xl border flex gap-4 items-start">
<div class="text-xl font-semibold text-gray-400">④</div>
<div>File uploaded to the shared Google Drive folder</div>
</div>

<div class="p-4 rounded-xl border flex gap-4 items-start">
<div class="text-xl font-semibold text-gray-400">⑤</div>
<div>One completed slide in the shared Google Slides deck</div>
</div>

</div>

<!--
The important requirement is a usable, georeferenced data product that can later be sampled spatially. GeoTIFF is preferred for raster data; GeoJSON or GeoPackage for vector data. Do not force all modalities into the same representation if it is unreasonable for that data type.
-->

---

# Your Slide (Template)

<div class="mt-4 p-5 rounded-xl border text-sm">

<div class="font-bold text-base mb-3">[ Dataset / product name ]</div>

<div class="grid grid-cols-2 gap-6">

<div class="rounded-lg border bg-gray-100 h-32 flex items-center justify-center text-gray-400 text-xs">
screenshot or map of your data over the AOI
</div>

<div class="grid grid-cols-1 gap-1 text-xs text-gray-700">
<div><strong>What does it measure?</strong> …</div>
<div><strong>Provider / source</strong> …</div>
<div><strong>Native spatial resolution</strong> …</div>
<div><strong>Temporal reference</strong> …</div>
<div><strong>Native CRS</strong> …</div>
<div><strong>Final CRS</strong> …</div>
<div><strong>File format</strong> …</div>
</div>

</div>

<div class="mt-4 border-t pt-3">
<strong>How did you get it?</strong> (2–3 short steps)<br>
<strong>One difficulty or surprise</strong> (one sentence)
</div>

</div>

<!--
The slide should focus on acquisition and geospatial properties. A long scientific description of the product is not expected. The class learns from the acquisition stories, not from product specs.
-->

---

# The Workflow

<div class="mt-8 flex items-center justify-center gap-2 text-base flex-wrap">

<div class="px-4 py-2 rounded-lg border font-semibold">Find</div>
<div class="text-gray-400">→</div>
<div class="px-4 py-2 rounded-lg border font-semibold">Understand</div>
<div class="text-gray-400">→</div>
<div class="px-4 py-2 rounded-lg border font-semibold">Download</div>
<div class="text-gray-400">→</div>
<div class="px-4 py-2 rounded-lg border font-semibold">Clip</div>
<div class="text-gray-400">→</div>
<div class="px-4 py-2 rounded-lg border font-semibold">Reproject</div>
<div class="text-gray-400">→</div>
<div class="px-4 py-2 rounded-lg border font-semibold">Check</div>
<div class="text-gray-400">→</div>
<div class="px-4 py-2 rounded-lg border font-semibold">Upload</div>

</div>

<div class="mt-8 p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm">

**Before downloading anything, determine:**

- What does this dataset actually represent?
- What is its CRS?
- What is its spatial resolution?
- What is its temporal meaning?
- What are the nodata / missing-value conventions?

</div>

<!--
The workflow is deliberately generic because every provider exposes data differently. Some use APIs, some use download portals, some require account registration. That variability is part of the exercise.
-->

---

# Coordinate Systems Matter

<div class="mt-6 flex items-center justify-center gap-6">

<div class="p-4 rounded-xl border text-center">
<div class="text-sm text-gray-500 mb-1">source dataset</div>
<div class="font-semibold">native CRS</div>
<div class="text-xs text-gray-400 mt-1">(e.g. geographic WGS 84)</div>
</div>

<div class="text-center text-gray-400">
<div class="text-2xl">↓</div>
<div class="text-xs">coordinate transformation</div>
</div>

<div class="p-4 rounded-xl border text-center border-blue-300 bg-blue-50">
<div class="text-sm text-gray-500 mb-1">required output</div>
<div class="font-semibold text-blue-800">class CRS</div>
<div class="text-xs text-gray-400 mt-1 italic">[ EPSG:XXXXX ]</div>
</div>

</div>

<div class="mt-8 grid grid-cols-2 gap-4 text-sm">

<div class="p-4 rounded-xl border">
Reprojection changes the <strong>coordinate representation</strong>.<br>
It should not change the <strong>spatial resolution</strong>.
</div>

<div class="p-4 rounded-xl border border-amber-200 bg-amber-50">
After reprojection: verify that the data still overlaps the AOI.<br>
<span class="text-gray-500 text-xs">Plot it. Do not assume.</span>
</div>

</div>

<!--
This is the practical application of the CRS section of Lecture 2. Reprojection is not resampling. A common mistake is accepting whatever grid GDAL or rasterio produces without checking whether the extent and pixel size are still sensible.
-->

---

# Native Resolution Is Intentional

<div class="mt-4 text-center text-xl font-semibold text-gray-700">
Do not make the datasets look the same yet.
</div>

<div class="mt-6 grid grid-cols-3 gap-4 text-sm text-center">

<div class="p-4 rounded-xl border">
<div class="font-semibold">elevation</div>
<div class="text-gray-500">~30 m</div>
</div>

<div class="p-4 rounded-xl border">
<div class="font-semibold">optical imagery</div>
<div class="text-gray-500">10 m</div>
</div>

<div class="p-4 rounded-xl border">
<div class="font-semibold">population</div>
<div class="text-gray-500">100 m</div>
</div>

<div class="p-4 rounded-xl border">
<div class="font-semibold">land cover</div>
<div class="text-gray-500">native categorical grid</div>
</div>

<div class="p-4 rounded-xl border">
<div class="font-semibold">climate</div>
<div class="text-gray-500">kilometres</div>
</div>

<div class="p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 italic">
your modality
</div>

</div>

<div class="mt-6 text-center text-base font-medium text-gray-600">
The resolution mismatch is part of the problem.
</div>

<!--
The next lab will deal with how heterogeneous datasets can be sampled at common point locations. We want to preserve the native differences now. Resampling everything to a common grid would discard information and pre-empt the design decision that belongs to Lab 3.
-->

---

# A Teaser for Lab 3

<div class="mt-6 grid grid-cols-2 gap-8">

<div class="p-5 rounded-xl border">
<div class="font-semibold mb-3 text-gray-700">Continuous values</div>

- elevation
- surface temperature
- spectral reflectance

<div class="mt-3 text-sm text-gray-500">interpolation between pixels is meaningful</div>
</div>

<div class="p-5 rounded-xl border">
<div class="font-semibold mb-3 text-gray-700">Categorical values</div>

- land-cover class
- soil type

<div class="mt-3 text-sm text-gray-500">interpolation between pixels is not meaningful</div>
</div>

</div>

<div class="mt-6 p-4 rounded-xl border border-purple-200 bg-purple-50 text-sm text-center">

**What should the value be between two pixels?**<br>
<span class="text-gray-500">This depends on what the values mean.</span>

</div>

<!--
This is a teaser for Lab 3. Students will later build a point-sampling dataset from their modality. The appropriate sampling method depends on what the pixel values represent. Do not explain interpolation methods yet — just plant the question.
-->

---

# If You Get Stuck

<div class="mt-4 grid grid-cols-1 gap-3 text-sm">

<div class="p-4 rounded-xl border flex gap-4">
<div class="font-semibold text-gray-400 w-4">1.</div>
<div>Read the dataset / product documentation</div>
</div>

<div class="p-4 rounded-xl border flex gap-4">
<div class="font-semibold text-gray-400 w-4">2.</div>
<div>Check the CRS and spatial extent of the file you downloaded</div>
</div>

<div class="p-4 rounded-xl border flex gap-4">
<div class="font-semibold text-gray-400 w-4">3.</div>
<div>Inspect the downloaded file locally — open it, plot it</div>
</div>

<div class="p-4 rounded-xl border flex gap-4">
<div class="font-semibold text-gray-400 w-4">4.</div>
<div>Ask a neighbour what they would check first</div>
</div>

<div class="p-4 rounded-xl border flex gap-4">
<div class="font-semibold text-gray-400 w-4">5.</div>
<div>Ask the instructor</div>
</div>

</div>

<div class="mt-4 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
Do not spend 45 minutes fighting a broken download portal.<br>
If a source is inaccessible or genuinely broken, flag it early.
</div>

<!--
The difficulty should come from understanding geodata, not from wasting the whole session on a dead service. Students should escalate quickly rather than silently struggle.
-->

---

# Timeline

<div class="mt-4 grid grid-cols-1 gap-2 text-sm">

<div class="grid grid-cols-[7rem_1fr] gap-4 p-3 rounded-lg border">
<div class="font-mono text-gray-500">00:00–00:10</div>
<div>Briefing and assignments</div>
</div>

<div class="grid grid-cols-[7rem_1fr] gap-4 p-3 rounded-lg border">
<div class="font-mono text-gray-500">00:10–00:25</div>
<div>Find your source — understand the product and its metadata</div>
</div>

<div class="grid grid-cols-[7rem_1fr] gap-4 p-3 rounded-lg border">
<div class="font-mono text-gray-500">00:25–01:10</div>
<div>Download / access the data</div>
</div>

<div class="grid grid-cols-[7rem_1fr] gap-4 p-3 rounded-lg border">
<div class="font-mono text-gray-500">01:10–01:30</div>
<div>Clip to AOI, reproject to class CRS, verify</div>
</div>

<div class="grid grid-cols-[7rem_1fr] gap-4 p-3 rounded-lg border">
<div class="font-mono text-gray-500">01:30–01:40</div>
<div>Upload data file and complete your slide</div>
</div>

<div class="grid grid-cols-[7rem_1fr] gap-4 p-3 rounded-lg border bg-blue-50 border-blue-200">
<div class="font-mono text-gray-500">01:40–02:10</div>
<div><strong>Lightning presentations</strong></div>
</div>

</div>

<!--
Students should move to processing as soon as they understand their source, rather than endlessly comparing alternative portals. The processing steps are short if the download works — most time goes to finding and understanding the data.
-->

---

# Lightning Presentations

<div class="mt-4 text-center text-xl font-semibold text-gray-600">60–90 seconds per student</div>

<div class="mt-6 grid grid-cols-2 gap-4 text-sm">

<div class="p-5 rounded-xl border">
<div class="font-semibold mb-3">Answer only:</div>

1. What does your dataset measure?
2. Where did you get it?
3. What did you have to do to make it usable?
4. What was the hardest or most surprising part?

</div>

<div class="p-5 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 text-xs">

No deep dives into the science behind the modality.<br><br>
No live demos unless everything already works.<br><br>
The variety of acquisition stories — APIs, portals, registration walls, 4 GB files — is itself the learning content.

</div>

</div>

<!--
Keep presentations short. The purpose is to expose the class to many different data ecosystems and acquisition workflows. The variety of experiences is the learning content.
-->

---

# What We Built Together

<div class="mt-8 flex items-start justify-center gap-8">

<div class="p-5 rounded-xl border text-center min-w-36">
<div class="text-sm text-gray-500 mb-2">one place</div>
<div class="font-bold text-lg">AOI</div>
</div>

<div class="text-gray-400 text-3xl pt-6">+</div>

<div class="p-5 rounded-xl border text-center min-w-36">
<div class="text-sm text-gray-500 mb-2">N independent modalities</div>
<div class="font-bold text-lg">your datasets</div>
</div>

<div class="text-gray-400 text-3xl pt-6">=</div>

<div class="p-5 rounded-xl border border-green-300 bg-green-50 text-center min-w-36">
<div class="text-sm text-gray-500 mb-2">shared result</div>
<div class="font-bold text-lg text-green-800">multimodal<br>geospatial dataset</div>
</div>

</div>

<div class="mt-8 p-4 rounded-xl border text-sm text-center">
Keep your data and code. We will use them again in Lab 3.
</div>

<div class="mt-4 p-4 rounded-xl border border-purple-200 bg-purple-50 text-sm text-center text-purple-700">

**Next step:** coordinates → sampled values → machine-learning dataset

</div>

<!--
This lab is intentionally the first stage of a multi-lab workflow. In Lab 3, students will use the same modality and build a point-based data loader around it. The heterogeneity we preserved here becomes the challenge to solve there.
-->
