---
download: true
exportFilename: slides
export:
  waitUntil: load
  wait: 1000
  timeout: 120000
addons:
  - "../../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lab 2
home: ../../
---

# Geospatial Representation Learning

<div class="mt-4 text-2xl font-bold text-gray-800">
From Geodata to a Multimodal Dataset
</div>

<div class="mt-3 text-lg text-gray-500">
Build the data pipeline we will use in Lab 3.
</div>

<!--
Each team contributes a different measurement of the same study area. Together, the class builds a dataset that returns multiple variables at a geographic coordinate.
-->

---
layout: learning-outcomes
mode: before
meeting: lab-02
---

# Learning Outcomes

After this lab, you will be able to:

<LearningOutcome id="collect-prepare">
<strong>Collect and prepare</strong> geospatial data for use in a machine-learning pipeline.
</LearningOutcome>

<LearningOutcome id="pytorch-dataset">
<strong>Develop</strong> a custom PyTorch dataset that retrieves values from one geospatial source at specified coordinates.
</LearningOutcome>

<LearningOutcome id="github-contribute">
<strong>Contribute</strong> to a shared programming project through GitHub, using forks, commits, and pull requests.
</LearningOutcome>

<!--
The outcomes connect to the three roles. Students specialize but should explain their contribution to teammates so everyone understands the complete pipeline.
A PyTorch Dataset defines sample access; a DataLoader handles batching and iteration.
-->

---

# Our Study Area

<div class="grid grid-cols-2 gap-6 mt-4">

<div class="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-6 min-h-48 text-gray-400 text-sm text-center">
<div class="text-3xl mb-2">🗺</div>
<div class="font-semibold text-gray-500">Map placeholder</div>
<div class="mt-1">AOI boundary · geographic extent · example query point</div>
<div class="mt-3 italic text-xs text-amber-600">[ Study area map to be provided ]</div>
</div>

<div class="flex flex-col gap-3 text-sm">

<div class="p-4 rounded-xl border">
<div class="font-semibold text-gray-700 mb-1">Study area</div>
<div class="italic text-amber-600">[ NAME TO BE PROVIDED ]</div>
</div>

<div class="p-4 rounded-xl border">
<div class="font-semibold text-gray-700 mb-1">AOI boundary / bounding box</div>
<div class="italic text-amber-600">[ RESOURCE LINK TO BE PROVIDED ]</div>
</div>

<div class="p-4 rounded-xl border">
<div class="font-semibold text-gray-700 mb-1">Shared Drive folder</div>
<div class="italic text-amber-600">[ LINK TO BE PROVIDED ]</div>
</div>

<div class="p-4 rounded-xl border border-blue-100 bg-blue-50 text-blue-800 font-medium">
Every team collects data covering the same area.
</div>

</div>

</div>

<!--
The AOI will be small enough to keep prepared subsets below 50 MB per team. Teams document their source's date or observation period.
-->

---

# One Coordinate, Many Measurements

<div class="grid grid-cols-2 gap-6 mt-4">

<div>

<div class="text-sm text-gray-500 mb-2 font-semibold">Example query</div>

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

<div class="mt-4 text-xs text-gray-400 italic">
Query interface is illustrative — align with the actual repository when available.
</div>

</div>

<div class="flex flex-col gap-3 text-sm">

<div class="p-3 rounded-xl border border-green-200 bg-green-50">
<div class="font-semibold text-green-800 mb-2">PROVIDED EXAMPLES</div>
<div class="flex items-start gap-2">
<span>🗂</span>
<div><strong>Land-cover raster</strong><br><span class="text-gray-500 text-xs">containing pixel → class code</span></div>
</div>
<div class="flex items-start gap-2 mt-2">
<span>🏢</span>
<div><strong>Building polygons</strong><br><span class="text-gray-500 text-xs">point containment → 0 or 1</span></div>
</div>
</div>

<div class="p-3 rounded-xl border border-purple-200 bg-purple-50">
<div class="font-semibold text-purple-800 mb-1">TEAM CONTRIBUTIONS</div>
<div class="text-gray-600 text-xs">Additional assigned modalities — one per team. Teams adapt these examples to their source.</div>
</div>

</div>

</div>

<!--
Queries return point values, not image patches.
Sources can retain different resolutions, coordinate systems, and observation dates.
Missing or outside-coverage results must be distinguishable from valid zeros.
Building absence means no building recorded in the supplied dataset.
-->

---

# Teams and Data Sources

<div class="mt-3 text-sm">

| Team | Data Specialist | Data Loader Specialist | Integration Specialist | Modality / Source |
|------|----------------|----------------------|----------------------|------------------|
| 1 | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* |
| 2 | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* |
| 3 | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* |
| 4 | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* |
| 5 | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* |
| 6 | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* |
| 7 | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* |
| 8 | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* |
| 9 | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* | *[ to be provided ]* |

</div>

<!--
Nine rows assume a class of 27 students (three per team). Update when the final roster is confirmed.
Keep source links short and clickable; link the modality name rather than printing the full URL.
-->

---

# Data Specialist

<div class="grid grid-cols-[1fr_13rem] gap-5 mt-2">
<div class="flex flex-col gap-2 text-sm">

<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">1.</div>
<div>Find a suitable source for your team's assigned modality.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">2.</div>
<div>Download or export a subset covering the shared study area.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">3.</div>
<div>Inspect the data and confirm what its values represent.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">4.</div>
<div>Upload the prepared subset to the shared Google Drive folder.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">5.</div>
<div>Share the file link and essential metadata with your team.<br><span class="text-gray-400 text-xs">Variables, units/classes, CRS, observation date, and missing values.</span></div>
</div>

</div>
<div class="flex flex-col gap-3 text-sm">

<div class="p-3 rounded-xl border border-amber-200 bg-amber-50">
<div class="text-xs text-amber-700 mb-1 font-semibold">SHARED DRIVE FOLDER</div>
<div class="italic text-amber-700 text-xs">[ LINK TO BE PROVIDED ]</div>
</div>

<div class="p-3 rounded-xl border border-green-200 bg-green-50">
<div class="font-semibold text-green-800 text-xs mb-1">DELIVERABLE</div>
<div class="text-xs">A checked data subset on Drive, with its source and essential metadata.</div>
</div>

<div class="p-3 rounded-xl border bg-gray-50 text-xs text-gray-600">
<strong>Collaborate early:</strong> Agree on file format and variables with your Data Loader Specialist.
</div>

</div>
</div>

<!--
This role owns data preparation, spatial coverage, coordinate-system information, and interpretation.
Keep the subset below 50 MB.
-->

---

# Data Loader Specialist

<div class="grid grid-cols-[1fr_13rem] gap-5 mt-2">
<div class="flex flex-col gap-2 text-sm">

<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">1.</div>
<div>Fork the supplied repository once for your team and clone it into your working environment.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">2.</div>
<div>Copy the land-cover or building-footprint dataset as a starting point.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">3.</div>
<div>Adapt the download script to retrieve your Drive file and cache it in <code>data/</code>.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">4.</div>
<div>Adapt the dataset to return your variables at a requested coordinate.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">5.</div>
<div>Verify results at known locations and run the provided checks.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">6.</div>
<div>Commit your changes and push them to your team's fork.</div>
</div>

</div>
<div class="flex flex-col gap-3 text-sm">

<div class="p-3 rounded-xl border border-amber-200 bg-amber-50">
<div class="text-xs text-amber-700 mb-1 font-semibold">STARTING REPOSITORY</div>
<div class="italic text-amber-700 text-xs">[ LINK TO BE PROVIDED ]</div>
</div>

<div class="p-3 rounded-xl border border-green-200 bg-green-50">
<div class="font-semibold text-green-800 text-xs mb-1">DELIVERABLE</div>
<div class="text-xs">A working, committed point-query dataset for your modality in your team's fork.</div>
</div>

<div class="p-3 rounded-xl border bg-gray-50 text-xs text-gray-600">
<strong>Collaborate:</strong> Get data and metadata from your Data Specialist; agree on the interface with your Integration Specialist.
</div>

</div>
</div>

<!--
One fork per team.
Commits record changes in the working copy; pushing uploads them to GitHub.
Reuse the supplied download infrastructure and preserve the common query interface.
-->

---

# Integration Specialist

<div class="grid grid-cols-[1fr_13rem] gap-5 mt-2">
<div class="flex flex-col gap-2 text-sm">

<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">1.</div>
<div>Inspect the combined dataset script in your team's fork.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">2.</div>
<div>Understand how it calls individual datasets and combines their outputs.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">3.</div>
<div>Agree with your team on the interface and variable names.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">4.</div>
<div>Connect your team's dataset to the combined query and verify it works.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">5.</div>
<div>Coordinate a pull request to the central repository.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">6.</div>
<div>Review and integrate contributions with the instructor and other Integration Specialists.</div>
</div>

</div>
<div class="flex flex-col gap-3 text-sm">

<div class="p-3 rounded-xl border border-amber-200 bg-amber-50">
<div class="text-xs text-amber-700 mb-1 font-semibold">CENTRAL REPOSITORY</div>
<div class="italic text-amber-700 text-xs">[ LINK TO BE PROVIDED ]</div>
</div>

<div class="p-3 rounded-xl border border-green-200 bg-green-50">
<div class="font-semibold text-green-800 text-xs mb-1">DELIVERABLE</div>
<div class="text-xs">A reviewed pull request connecting your modality to the shared dataset.</div>
</div>

<div class="p-3 rounded-xl border bg-gray-50 text-xs text-gray-600">
<strong>Coordinate across teams</strong> so all contributions work together.
</div>

</div>
</div>

<!--
This role can start by inspecting the supplied examples and combined-loader skeleton while teammates prepare the new source.
The instructor and Integration Specialists jointly curate contributions and resolve compatibility issues.
Merge according to repository permissions; do not assume every student has merge access.
-->

---

# Collaborating with GitHub

<div class="grid grid-cols-2 gap-6 mt-4">

<div class="flex flex-col gap-2 text-sm">

<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">1.</div>
<div><strong>Fork</strong> the instructor's repository — your team's copy on GitHub.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">2.</div>
<div><strong>Clone</strong> your team's fork — working copy on your laptop or in Colab.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">3.</div>
<div>Develop, <strong>commit</strong>, and <strong>push</strong>.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">4.</div>
<div>Open a <strong>pull request</strong> — proposal to integrate changes into the central repository.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="font-semibold text-gray-400 min-w-5">5.</div>
<div>Review, revise, and merge.</div>
</div>

</div>

<div class="flex flex-col gap-4 text-sm">

<div class="p-4 rounded-xl border bg-gray-50 text-center">
<div class="text-xs text-gray-400 mb-3">contribution flow</div>
<div class="flex justify-center items-center gap-3">
<div class="px-3 py-2 rounded border bg-white text-xs font-mono">central repo</div>
<div class="flex flex-col items-center text-gray-400 text-xs">
<span>PR ↑</span>
<span>⇄</span>
<span>↓ clone</span>
</div>
<div class="px-3 py-2 rounded border bg-white text-xs font-mono">team fork</div>
</div>
</div>

<div class="p-3 rounded-xl border border-blue-100 bg-blue-50 text-blue-800">
Your team develops one modality. A pull request brings it into our shared dataset.
</div>

<div class="p-3 rounded-xl border text-xs text-gray-500">
The instructor and Integration Specialists review contributions and keep the shared dataset working.
</div>

</div>

</div>

<!--
Team members collaborate in one team fork.
Checks and reviews may lead to further commits before merging.
Do not turn this into a dense Git command reference.
-->

---

# Coding with AI Agents

<div class="grid grid-cols-2 gap-6 mt-4 text-sm">

<div class="flex flex-col gap-3">

<div class="p-3 rounded-xl border">
<div class="font-semibold text-gray-700 mb-2">Available tools (VS Code)</div>
<div class="flex flex-col gap-1 text-xs">
<div><a href="https://code.visualstudio.com/docs/setup/copilot" class="text-blue-600 underline">GitHub Copilot</a></div>
<div><a href="https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code" class="text-blue-600 underline">Claude Code</a></div>
<div><a href="https://marketplace.visualstudio.com/items?itemName=OpenAI.chatgpt" class="text-blue-600 underline">OpenAI Codex</a></div>
</div>
<div class="mt-2 text-xs text-amber-700 font-semibold">Install and sign into one option before the lab.</div>
</div>

<div class="p-3 rounded-xl border border-gray-100 bg-gray-50">
<div class="font-semibold text-gray-700 mb-1 text-xs">WORKING PATTERN</div>
<div class="text-xs text-gray-600">Give context → request a change → inspect → run and verify → commit</div>
</div>

</div>

<div class="flex flex-col gap-3">

<div class="p-3 rounded-xl border">
<div class="font-semibold text-gray-700 mb-2 text-xs">EXAMPLE PROMPT</div>
<div class="text-xs text-gray-600 italic">
"Read the example datasets. Adapt the appropriate example for our modality, preserve the point-query interface, and run the provided checks."
</div>
</div>

<div class="p-3 rounded-xl border border-red-100 bg-red-50 text-xs text-red-700">
<strong>You are responsible</strong> for understanding the data and verifying the result.
</div>

</div>

</div>

<!--
The instructor demonstrates an agent reading project files, editing code, and running a query.
Provide documentation and metadata as context.
Students need one suitable tool, not all three. Do not make pricing or access promises.
-->

---

# The Shared Workflow

<div class="grid grid-cols-3 gap-4 mt-4 text-xs">

<div class="flex flex-col gap-2">
<div class="font-semibold text-center p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">DATA SPECIALIST</div>
<div class="p-2 rounded border text-center">Find source</div>
<div class="text-center text-gray-400">↓</div>
<div class="p-2 rounded border text-center">Prepare subset<br><span class="text-gray-400">&lt; 50 MB</span></div>
<div class="text-center text-gray-400">↓</div>
<div class="p-2 rounded border bg-amber-50 text-center">Upload to Drive</div>
</div>

<div class="flex flex-col gap-2">
<div class="font-semibold text-center p-2 rounded-lg bg-green-50 border border-green-200 text-green-800">DATA LOADER SPECIALIST</div>
<div class="p-2 rounded border text-center">Adapt example</div>
<div class="text-center text-gray-400">↓</div>
<div class="p-2 rounded border text-center">Connect uploaded data<br><span class="text-gray-400">→ data/ cache</span></div>
<div class="text-center text-gray-400">↓</div>
<div class="p-2 rounded border bg-green-50 text-center">Verify point queries</div>
</div>

<div class="flex flex-col gap-2">
<div class="font-semibold text-center p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-800">INTEGRATION SPECIALIST</div>
<div class="p-2 rounded border text-center">Inspect combined dataset</div>
<div class="text-center text-gray-400">↓</div>
<div class="p-2 rounded border text-center">Connect contribution</div>
<div class="text-center text-gray-400">↓</div>
<div class="p-2 rounded border bg-purple-50 text-center">Review and merge PR</div>
</div>

</div>

<div class="mt-3 grid grid-cols-3 gap-3 text-xs">
<div class="p-2 rounded-lg border border-amber-200 bg-amber-50 text-center text-amber-800">
<strong>Drive</strong> — prepared data<br><span class="italic text-amber-600">[ LINK TO BE PROVIDED ]</span>
</div>
<div class="p-2 rounded-lg border text-center text-gray-600">
<strong>GitHub</strong> — code &amp; collaboration<br><span class="italic text-gray-400">[ CENTRAL REPO LINK TO BE PROVIDED ]</span>
</div>
<div class="p-2 rounded-lg border text-center text-gray-600">
<strong>Colab notebook</strong><br><span class="italic text-gray-400">[ LINK TO BE PROVIDED ]</span>
</div>
</div>

<!--
The roles work in parallel.
The developer can start with example data.
The Integration Specialist can start with the existing examples.
Downloads happen when needed during initialization, not for every point query.
Do not require students to commit datasets into Git.
-->

---

# Two Hours, Three Checkpoints

<div class="mt-8 grid grid-cols-3 gap-6 text-center">

<div class="p-6 rounded-xl border-2 border-blue-200 bg-blue-50">
<div class="font-mono text-2xl font-bold text-blue-700 mb-3">40 min</div>
<div class="text-sm text-gray-700">Data selected and prepared; loader and integration work underway.</div>
</div>

<div class="p-6 rounded-xl border-2 border-green-200 bg-green-50">
<div class="font-mono text-2xl font-bold text-green-700 mb-3">80 min</div>
<div class="text-sm text-gray-700">Your dataset returns values from your own data.</div>
</div>

<div class="p-6 rounded-xl border-2 border-purple-200 bg-purple-50">
<div class="font-mono text-2xl font-bold text-purple-700 mb-3">120 min</div>
<div class="text-sm text-gray-700">Your contribution is integrated and queried through the shared dataset.</div>
</div>

</div>

<!--
These are checkpoints for parallel work, not sequential phases.
-->

---

# What Counts as Done?

<div class="mt-4 flex flex-col gap-2 text-sm">

<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="text-green-600 font-bold min-w-5">✓</div>
<div>Prepared data cover the AOI and are accessible from Drive.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="text-green-600 font-bold min-w-5">✓</div>
<div>Dataset downloads missing files and caches them locally.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="text-green-600 font-bold min-w-5">✓</div>
<div>Coordinate queries return named values with documented meaning.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="text-green-600 font-bold min-w-5">✓</div>
<div>Missing and outside-coverage results are handled explicitly.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="text-green-600 font-bold min-w-5">✓</div>
<div>A pull request contributes the modality to the shared dataset.</div>
</div>
<div class="flex gap-3 p-3 rounded-xl border items-start">
<div class="text-green-600 font-bold min-w-5">✓</div>
<div>Checks pass and the combined query works.</div>
</div>

</div>

<div class="mt-4 grid grid-cols-2 gap-4 text-sm">
<div class="p-3 rounded-xl border border-blue-100 bg-blue-50 text-center text-blue-800">
<strong>Team deliverable:</strong> a working source contribution.
</div>
<div class="p-3 rounded-xl border border-green-100 bg-green-50 text-center text-green-800">
<strong>Class outcome:</strong> a working multimodal dataset.
</div>
</div>

<!--
The instructor and Integration Specialists coordinate review and merging.
Automated checks establish compatibility, while students verify the meaning and plausibility of results.
There is no student slide or presentation deliverable.
-->

---

# What We Built Together

<div class="mt-6 flex items-center justify-center gap-4 text-sm flex-wrap">

<div class="p-4 rounded-xl border text-center min-w-32">
<div class="text-xs text-gray-500 mb-1">one coordinate</div>
<div class="font-mono text-xs text-gray-700">lat, lon</div>
</div>

<div class="text-gray-400 text-2xl">→</div>

<div class="flex flex-col gap-1 text-xs font-mono p-4 rounded-xl border bg-gray-50 min-w-48">
<div>"land_cover":    …</div>
<div>"building":      …</div>
<div class="text-purple-600">"your_modality": …</div>
<div class="text-gray-400 italic">[ more teams … ]</div>
</div>

<div class="text-gray-400 text-2xl">→</div>

<div class="p-4 rounded-xl border border-green-300 bg-green-50 text-center min-w-36">
<div class="text-xs text-gray-500 mb-1">machine-learning sample</div>
<div class="font-bold text-green-800">multimodal<br>dataset</div>
</div>

</div>

<div class="mt-4 text-center text-sm font-semibold text-gray-700">
One coordinate → multiple modalities → a machine-learning sample
</div>

<div class="mt-6 p-4 rounded-xl border border-purple-200 bg-purple-50 text-sm text-center text-purple-700">
In Lab 3, we will use this dataset to build features and train machine-learning models.
</div>

<!--
Demonstrate the combined query if available.
Highlight how data collection, dataset development, and integration all contributed.
This is the connection to Lab 3; no separate teaser slide is needed.
-->
