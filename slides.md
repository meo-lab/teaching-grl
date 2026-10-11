---
title: Geospatial Representation Learning
author: Marc Rußwurm
license: CC BY-NC 4.0
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Course Overview
---

# Geospatial Representation Learning

## Course Structure and Format

Winter Semester 2026/27  
Mobile Robotics, Geodesy and Geoinformation & Geodetic Engineering

---
section: course-format
sectionTitle: Course organization
---

# Course Learning Outcomes

After completing the course, you will be able to:

1. Explain the principles of geospatial representation learning, how geospatial embeddings are created, and their potential and limitations for different applications.

2. Compare geospatial data sources and create and curate datasets from satellite imagery, time series, GIS layers, and other environmental and socio-economic data.

3. Implement Python-based machine-learning workflows using both fixed representations of existing geospatial data and representations learned through modern deep-learning methods.

4. Evaluate and compare models and representations for environmental and socio-ecological applications, considering predictive performance, generalization, and suitability for the task.

5. Critically assess and discuss research papers on geospatial representation learning, foundation models, and Earth embeddings, examining their methods, evidence, and limitations.

6. Design and conduct a research-oriented geospatial analysis project in a student group, and communicate its methods, results, and limitations through scientific writing and oral presentations.

---

# Three Phases: 

<div class="grid grid-cols-3 gap-4 mt-8">

<div class="p-4 rounded-xl border box-card box-1">
<h3>Phase 1: Lectures &amp; Labs <span class="box-icon i-carbon:education"></span></h3>

<div class="box-body">Build conceptual and technical foundations through lectures and hands-on exercises.</div>

<div class="box-body"><strong>Examination:</strong> final written exam on the course content.</div>
</div>

<div class="p-4 rounded-xl border box-card box-2">
<h3>Phase 2: Paper Analysis <span class="box-icon i-carbon:search-locate"></span></h3>

<div class="box-body">Analyze and review recent research papers in student groups.</div>

<div class="box-body"><strong>Examination:</strong> pass/fail paper presentation with questions.</div>
</div>

<div class="p-4 rounded-xl border box-card box-3">
<h3>Phase 3: Group Projects <span class="box-icon i-carbon:code"></span></h3>

<div class="box-body">Develop code and conduct a research-oriented geospatial analysis project in groups.</div>

<div class="box-body"><strong>Examination:</strong> written project report.</div>
</div>

</div>

<div class="mt-8 text-xs">
<div class="mb-2 font-semibold">Bloom's cognitive levels across the course</div>

<div class="grid grid-cols-6 gap-1">
<div class="rounded border px-2 py-1 text-center course-bloom-level course-phase-1">Remember</div>
<div class="rounded border px-2 py-1 text-center course-bloom-level course-phase-1">Understand</div>
<div class="rounded border px-2 py-1 text-center course-bloom-level course-phase-1">Apply</div>
<div class="rounded border px-2 py-1 text-center course-bloom-level course-phase-2">Analyze</div>
<div class="rounded border px-2 py-1 text-center course-bloom-level course-phase-2">Evaluate</div>
<div class="rounded border px-2 py-1 text-center course-bloom-level course-phase-3">Create</div>
</div>

</div>


---

# Timeline at a Glance

<p class="course-meeting-times"><strong>Fridays:</strong> Lectures 10:00–12:00, labs 13:00–15:00.</p>

<div class="course-gantt">

<div class="course-gantt-grid course-gantt-weeks">
<div class="course-gantt-axis-label">Course week</div>
<div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div>
<div>8</div><div>9</div><div>10</div><div>11</div><div>12</div><div>13</div><div>14</div><div>15</div>
</div>

<div class="course-gantt-grid course-gantt-calendar course-gantt-dates">
<div class="course-gantt-axis-label">Event date</div>
<div>Oct 16</div><div>Oct 23</div><div>Oct 30</div><div>Nov 6</div><div>Nov 13</div><div>Nov 20</div><div>Nov 27</div>
<div>Dec 4</div><div>Dec 11</div><div>Dec 18</div><div class="course-gantt-break">Christmas<br>+ Jan 8</div><div>Jan 15</div><div>Jan 22</div><div>Jan 29</div><div>Feb 5</div>
</div>

<div class="course-gantt-grid course-gantt-row">
<div class="course-gantt-label">Phase 1: Lectures</div>
<div class="course-gantt-bar course-gantt-event phase-1" style="grid-column: 2;" title="Course introduction">Intro</div>
<a href="./1-why-geospatial-representation-learning/" class="course-gantt-bar course-gantt-event phase-1" style="grid-column: 3;" title="Lecture 1">L1</a>
<a href="./2-geospatial-data-images-maps-time-series/" class="course-gantt-bar course-gantt-event phase-1" style="grid-column: 4;" title="Lecture 2">L2</a>
<a href="./3-machine-learning-on-data-representations/" class="course-gantt-bar course-gantt-event phase-1" style="grid-column: 5;" title="Lecture 3">L3</a>
<a href="./4-deep-representation-learning-i/" class="course-gantt-bar course-gantt-event phase-1" style="grid-column: 6;" title="Lecture 4">L4</a>
<div class="course-gantt-cancelled" style="grid-column: 7;">No class</div>
<a href="./5-deep-representation-learning-ii/" class="course-gantt-bar course-gantt-event phase-1" style="grid-column: 8;" title="Lecture 5">L5</a>
<a href="./8-geospatial-embeddings/" class="course-gantt-bar course-gantt-event phase-1" style="grid-column: 9;" title="Lecture 6">L6</a>
</div>

<div class="course-gantt-grid course-gantt-row">
<div class="course-gantt-label">Phase 1: Labs</div>
<a href="./labs/lab-1/" class="course-gantt-bar course-gantt-event phase-1" style="grid-column: 3;" title="Lab 1">Lab 1</a>
<a href="./labs/lab-2/" class="course-gantt-bar course-gantt-event phase-1" style="grid-column: 4;" title="Lab 2">Lab 2</a>
<a href="./labs/lab-3/" class="course-gantt-bar course-gantt-event phase-1" style="grid-column: 5;" title="Lab 3">Lab 3</a>
<a href="./labs/lab-4/" class="course-gantt-bar course-gantt-event phase-1" style="grid-column: 6;" title="Lab 4">Lab 4</a>
<div class="course-gantt-cancelled" style="grid-column: 7;" aria-hidden="true"></div>
</div>

<div class="course-gantt-grid course-gantt-row">
<div class="course-gantt-label">Phase 2: Papers</div>
<div class="course-gantt-cancelled" style="grid-column: 7;" aria-hidden="true"></div>
<div class="course-gantt-bar course-gantt-event phase-2" style="grid-column: 8;" title="Paper analysis 1">P1</div>
<div class="course-gantt-bar course-gantt-event phase-2" style="grid-column: 9;" title="Paper analysis 2">P2</div>
<div class="course-gantt-bar course-gantt-event phase-2" style="grid-column: 10;" title="Paper analysis 3">P3</div>
<div class="course-gantt-bar course-gantt-event phase-2" style="grid-column: 11;" title="Paper analysis 4">P4</div>
</div>

<div class="course-gantt-grid course-gantt-row">
<div class="course-gantt-label">Phase 3: Projects</div>
<div class="course-gantt-cancelled" style="grid-column: 7;" aria-hidden="true"></div>
<div class="course-gantt-bar phase-3" style="grid-column: 13 / span 4;">Group Projects</div>
</div>

<div class="course-section-spacer"></div>

## Presence and Examination Events

<div class="course-gantt-exams">
  <div class="course-gantt-exam phase-2">
    <strong>Paper Presentations pass/fail</strong>
    <span>Nov 27, Dec 4, 11 &amp; 18, 2026</span>
  </div>
  <div class="course-gantt-exam phase-1">
    <strong>Phase 1 Written exam</strong>
    <span>February 5th, 2027</span>
  </div>
  <div class="course-gantt-exam phase-3">
    <strong>Phase 3 report deadline</strong>
    <span>Date: TBD</span>
  </div>
</div>

</div>

---

# Phase 1: Lectures and Labs

<div class="grid grid-cols-2 gap-6 mt-6">

<div class="p-5 rounded-xl border">
<h3>Lectures</h3>

**1-2 hours**

Presentation slides introduce the core concepts, terminology, and research context.

They provide the shared conceptual foundation for the hands-on work.
</div>

<div class="p-5 rounded-xl border">
<h3>Labs</h3>

**Remaining 2 hours**

Interactive activities reinforce the lecture through self-directed, collaborative, and hands-on learning:

- Explore representations using PCA and t-SNE
- Collect, clean, and combine geodata
- Train and evaluate machine-learning models
- Investigate model architectures and explain them through peer teaching
</div>

</div>

---

# Phase 1: Overview - Lectures & Labs

<div class="phase-content-grid lecture-overview-grid">

<a href="./1-why-geospatial-representation-learning/" class="phase-content-tile no-underline text-current hover:bg-gray-50">
<h3>Lecture 1</h3>
<strong>Representations</strong><br><span class="text-[.58rem] leading-snug text-gray-500 italic font-normal">What is a representation?</span>
</a>

<a href="./2-geospatial-data-images-maps-time-series/" class="phase-content-tile no-underline text-current hover:bg-gray-50">
<h3>Lecture 2</h3>
<strong>Geospatial Data</strong><br><span class="text-[.58rem] leading-snug text-gray-500 italic font-normal">What is geodata?</span>
</a>

<a href="./3-machine-learning-on-data-representations/" class="phase-content-tile no-underline text-current hover:bg-gray-50">
<h3>Lecture 3</h3>
<strong>Machine Learning on Data Representations</strong><br><span class="text-[.58rem] leading-snug text-gray-500 italic font-normal">Learning on fixed representations</span>
</a>

<a href="./4-deep-representation-learning-i/" class="phase-content-tile no-underline text-current hover:bg-gray-50">
<h3>Lecture 4</h3>
<strong>Deep Representation Learning I</strong><br><span class="text-[.58rem] leading-snug text-gray-500 italic font-normal">Learning the representation itself</span>
</a>

<a href="./5-deep-representation-learning-ii/" class="phase-content-tile no-underline text-current hover:bg-gray-50">
<h3>Lecture 5</h3>
<strong>Deep Representation Learning II</strong><br><span class="text-[.58rem] leading-snug text-gray-500 italic font-normal">Learning beyond memorization</span>
</a>

<a href="./8-geospatial-embeddings/" class="phase-content-tile no-underline text-current hover:bg-gray-50">
<h3>Lecture 6</h3>
<strong>Geospatial Embeddings</strong><br><span class="text-[.58rem] leading-snug text-gray-500 italic font-normal">Giving location a meaning</span>
</a>


</div>


<div class="phase-content-grid lab-overview-grid">


<a href="./labs/lab-1/" class="phase-content-tile no-underline text-current hover:bg-gray-50">
<h3>Lab 1</h3>
Visualizing high-dimensional representations
</a>

<a href="./labs/lab-2/" class="phase-content-tile no-underline text-current hover:bg-gray-50">
<h3>Lab 2</h3>
Geodata Scavanger Hunt
</a>

<a href="./labs/lab-3/" class="phase-content-tile no-underline text-current hover:bg-gray-50">
<h3>Lab 3</h3>
Machine Learning on Geospatial Data.
</a>

<a href="./labs/lab-4/" class="phase-content-tile no-underline text-current hover:bg-gray-50">
<h3>Lab 4</h3>
Practical: Supervised Deep Learning
</a>


</div>



---
layout: bonn-two-cols-header
---


# Phase 2: Paper Analysis

<div class="phase-content-grid paper-analysis-resources">

<a href="./slides/paper-analysis/" class="phase-content-tile paper-analysis-resource no-underline text-current hover:bg-gray-50">
<carbon-presentation-file class="paper-analysis-resource-icon" aria-hidden="true" />
<span><strong>Paper Analysis slides</strong><br><span class="paper-analysis-resource-detail">Open the session deck</span></span>
</a>

<div class="phase-content-tile paper-analysis-resource paper-analysis-resource-pending">
<carbon-template class="paper-analysis-resource-icon" aria-hidden="true" />
<span><strong>PowerPoint presentation template</strong><br><span class="paper-analysis-resource-detail">Coming soon</span></span>
</div>

</div>

::left::

## Format

Each topical session introduces a new research area and assigns papers to the student groups.

1. **Read (between classes):** Study the assigned paper with your group.
2. **Analyze (between classes):** Identify the problem, method, evidence, limitations, and impact, and prepare your presentation.
3. **Present (in class):** Present your analysis, answer questions, and discuss the paper with the class.



::right::

## Four Topics

| Session | Topic |
| --- | --- |
| **1** | Implicit Neural Representations and Approximation |
| **2** | Location Encoders |
| **3** | Self-Supervised Representation Learning |
| **4** | Geospatial Embeddings |

---

# Phase 3: Group Project

<div class="grid grid-cols-2 gap-6 mt-6">

<div>

## Core project idea

Students investigate geospatial questions by **conducting a research study** or **developing GeoAI agents**.

Example themes:

- Deforestation monitoring
- Marine litter monitoring
- Urban expansion
- Agricultural change
- Flood or drought impacts
- Biodiversity and habitat suitability
- Land-cover and land-use change
- Climate-risk indicators
- Infrastructure and mobility patterns
- Human-environment interactions

</div>

<div>


## Examination Method: Short Research Paper

<div class="grid grid-cols-2 gap-3 mt-4 text-sm">

<div class="p-4 rounded-lg border">
<div class="i-carbon:document mx-auto text-4xl mb-2 opacity-70"></div>
<h3 class="text-center">Application Paper</h3>
<p>An in-depth study of a specific environmental or socio-economic phenomenon using geospatial AI models and representations.</p>
</div>

<div class="p-4 rounded-lg border">
<div class="i-carbon:document-tasks mx-auto text-4xl mb-2 opacity-70"></div>
<h3 class="text-center">Method Paper</h3>
<p>A methodology paper describing how the group developed an AI agent to dynamically study a specific environmental or socio-economic phenomenon.</p>
</div>

</div>


</div>

</div>

---

# Live Understanding Pulse

<div class="mt-2 text-lg leading-relaxed max-w-3xl">
Throughout this course, I will show this widget to touch base on your level of understanding. It synchronizes across all devices, including in-class and virtual participants.
</div>

<div class="mt-1 text-l font-bold">
Try it out - click on the line:
</div>

<div class="mt-0 flex justify-center">
  <UnderstandingPulse
    session-id="rootslide-demo"
    poll-id="understanding-pulse-test"
    left-label="I am completely lost"
    right-label="I fully understand"
    instruction="Click on the line to vote."
    :kernel-amplitude="12"
  />
</div>

<div class="mt-1 text-lg leading-relaxed max-w-3xl">
This gives me feedback during class and also tracks the general understandability of the slides, so I can improve them in future iterations.
</div>

<!--
<UnderstandingPulse
  session-id="lecture-01-test"
  poll-id="ready-check"
  left-label="Not ready"
  right-label="Ready"
  instruction="Are you ready to continue?"
/>
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: why-this-course
sectionTitle: Why this course?
---

# Why this course?

---
class: course-intro
---

# The Earth faces global challenges

<div class="intro-challenges">
  <figure><img src="./assets/course-introduction/image3.gif" alt="Animated satellite time series of urban expansion" /><figcaption>Urbanization</figcaption></figure>
  <img class="intro-earth" src="./assets/course-introduction/image5.png" alt="The Earth viewed from space" />
  <figure><img src="./assets/course-introduction/image4.gif" alt="Animated satellite time series of deforestation" /><figcaption>Deforestation</figcaption></figure>
</div>

<div class="intro-message"><strong>We need to analyze geodata at large scale</strong><br />to inform policies on biodiversity, food security, human health, and livelihoods.</div>

<div class="intro-credit">Images: Google Earth Engine Time Series Gallery · Adapted from the Open Earth Monitor talk, October 2026.</div>

<!-- Source: why_need_representations.pptx, slide 1. Original GIFs retained. -->

---
class: course-intro
---

# Observing the Earth at unprecedented scales

<div class="intro-satellite-archive">
  <img src="./assets/course-introduction/image6.jpeg" alt="Timeline of Earth observation missions from ESA" />
  <div class="intro-archive-caption">Sentinel-2 archive: <strong>45 petabytes</strong><br />Growing by <strong>4 PB per year</strong><small>Figures reported in the October 2026 talk</small></div>
</div>

<div class="intro-credit">Image: European Space Agency · Archive figures reproduced from the source talk.</div>

<!-- Source: why_need_representations.pptx, slide 2. Figures are source-talk values, not a live estimate. -->

---
class: course-intro
---

# Pollution monitoring

<div class="intro-two-images">
  <figure><img src="./assets/course-introduction/image7.png" alt="Plastic litter at Cuttings Beach, Durban" /><figcaption>Cuttings Beach, Durban, South Africa<br />Image: Lisa Guastella</figcaption></figure>
  <figure><img src="./assets/course-introduction/image8.png" alt="Examples of entangled plastics and free-floating plastics among water hyacinths" /></figure>
</div>
<div class="intro-person"><img src="./assets/course-introduction/image9.png" alt="Giel Hagenbeek" /><span>Giel Hagenbeek · Wageningen University &amp; Research</span></div>
<div class="intro-credit">Hagenbeek, G. W., van Emmerik, et al., including Rußwurm, M. (2026). Exploring transferability of plastic-water hyacinth interaction and detection in rivers. <em>iScience</em>, 29(6).</div>

<!-- Source: why_need_representations.pptx, slide 3. -->

---
class: course-intro
---

# Finding meteorites in Antarctic blue ice

<div class="intro-antarctica">
  <div><div class="intro-person"><img src="./assets/course-introduction/image12.png" alt="Veronica Tollenaar" /><span>Veronica Tollenaar<br />Vrije Universiteit Brussel</span></div><img class="intro-ice-detail" src="./assets/course-introduction/image11.png" alt="Blue-ice prediction, uncertainty, radar backscatter, and satellite imagery" /></div>
  <img class="intro-ice-map" src="./assets/course-introduction/image10.png" alt="Antarctic blue-ice mapping results and regional detail maps" />
</div>
<div class="intro-credit">Tollenaar, V., Zekollari, H., Pattyn, F., Rußwurm, M., Kellenberger, B., Lhermitte, S., Izeboud, M., &amp; Tuia, D. (2024). Where the White Continent Is Blue: Deep Learning Locates Bare Ice in Antarctica. <em>Geophysical Research Letters</em>, 51(3), e2023GL106285. <a href="https://doi.org/10.1029/2023GL106285">doi:10.1029/2023GL106285</a></div>

<!-- Source: why_need_representations.pptx, slide 4. -->

---
class: course-intro
---

# Detecting litter in open waters

<div class="intro-marine">
  <figure><img src="./assets/course-introduction/image7.png" alt="Marine litter washed ashore at Cuttings Beach" /><figcaption>Cuttings Beach, Durban · Image: Lisa Guastella</figcaption><div class="intro-satellite-label"><img src="./assets/course-introduction/image14.svg" alt="Satellite" />Sentinel-2 satellite</div></figure>
  <video controls muted loop playsinline preload="none" poster="./assets/course-introduction/image13.png" aria-label="Marine debris detection demonstration"><source src="./assets/course-introduction/marine-debris.mp4" type="video/mp4" /></video>
</div>
<div class="intro-credit">Rußwurm, M., Venkatesa, S. J., &amp; Tuia, D. (2023). Large-scale detection of marine debris in coastal areas with Sentinel-2. <em>iScience</em>, 26(12). <a href="https://go.epfl.ch/marinedebrisdetector">Marine debris detector</a></div>

<!-- Source: why_need_representations.pptx, slide 5. Original movie remuxed without re-encoding; controls allow deliberate playback. -->

---
class: course-intro
---

# Tracking litter patches across sensors

<div class="intro-person intro-person-right"><img src="./assets/course-introduction/image17.png" alt="Gabrielė Tijūnaitytė" /><span>Gabrielė Tijūnaitytė · Wageningen, Bonn</span></div>
<div class="intro-tracking"><img src="./assets/course-introduction/image16.png" alt="Marine litter patches observed in overlapping satellite acquisitions" /><img src="./assets/course-introduction/image15.png" alt="Dual-encoder model for matching patches across sensors" /></div>
<div class="intro-credit">Tijūnaitytė, G., Dalsasso, E., &amp; Rußwurm, M. (2026). Cross-Sensor Matching of Marine Litter Patches in Satellite Double Acquisitions. ECCV Marine Vision Workshop (MaVi).</div>

<!-- Source: why_need_representations.pptx, slide 6. -->

---
class: course-intro
---

# Text-based image retrieval on camera traps

<div class="intro-retrieval">
  <div><p>Trained on the Snapshot Serengeti camera-trap dataset (Swanson et al., 2015) with more than <strong>seven million images</strong>.</p><div class="intro-person"><img src="./assets/course-introduction/image19.jpg" alt="Valentin Gabeff" /><span>Valentin Gabeff · EPFL</span></div></div>
  <img src="./assets/course-introduction/image18.png" alt="WildCLIP models connect camera-trap images with text descriptions for retrieval" />
</div>
<div class="intro-credit">Gabeff, V., Rußwurm, M., Tuia, D., &amp; Mathis, A. (2024). WildCLIP: Scene and animal attribute retrieval from camera trap data with domain-adapted vision-language models. <em>International Journal of Computer Vision</em>, 132(9), 3770–3786.</div>

<!-- Source: why_need_representations.pptx, slide 7. -->

---
class: course-intro
---

# Tree species classification

<div class="intro-person intro-person-right"><img src="./assets/course-introduction/image21.jpeg" alt="Takayuki Ishikawa" /><span>Takayuki Ishikawa · WUR MSc student</span></div>
<div class="intro-trees"><img src="./assets/course-introduction/tree-species-chart.svg" alt="Comparison of tree-species classification results using deep embeddings" /><img src="./assets/course-introduction/image22.png" alt="Detailed tree-species map of a forest region" /><img src="./assets/course-introduction/image20.png" alt="Dutch Forest Inventory locations and the detailed study region" /></div>
<div class="intro-credit">Ishikawa, T., Bonannella, C., Lerink, B. J. W., &amp; Rußwurm, M. (2026). Assessing the effectiveness of deep embeddings for tree species classification in the Dutch Forest Inventory. <em>Science of Remote Sensing</em>, 14, 100498. <a href="https://doi.org/10.1016/j.srs.2026.100498">doi:10.1016/j.srs.2026.100498</a></div>

<!-- Source: why_need_representations.pptx, slide 8. Source chart recovered from the PDF embedded in image23.emf and converted to SVG; original EMF also retained. -->

---
class: course-intro
---

# Forest change in the Swiss Alps

<div class="intro-forest">
  <div><p>Historic aerial photos (1946–2020) reveal forest gains at high altitudes as the tree line advances upwards with a warming climate.</p><p class="intro-data">Data: 2,660 tiles of 1 km × 1 km, with 12–20 time steps.</p><img src="./assets/course-introduction/image26.png" alt="Locations of historic aerial-photo tiles in the Swiss Alps" /></div>
  <img src="./assets/course-introduction/image25.png" alt="Forest gains across a sequence of aerial photographs from 1946 to 2020" />
</div>
<div class="intro-credit">Thien-Anh Nguyen · EPFL · Research example reproduced from the source talk, slide 9.</div>

<!-- Source: why_need_representations.pptx, slide 9. -->

---
class: course-intro
---

# Effective representations of geodata

<div class="intro-representation-flow">
  <img class="intro-flow-earth" src="./assets/course-introduction/image5.png" alt="The Earth" />
  <div class="intro-flow-arrow" aria-hidden="true"></div>
  <div class="intro-geodata"><strong>Geodata</strong><div class="intro-stack"><img src="./assets/course-introduction/image28.png" alt="Geospatial image tile" /><img src="./assets/course-introduction/image29.png" alt="Additional geospatial observations" /><img src="./assets/course-introduction/image30.png" alt="Geospatial data layer" /><img src="./assets/course-introduction/image31.png" alt="Map data layer" /></div></div>
  <div class="intro-embedding"><strong>Effective geospatial<br />representations</strong><img src="./assets/course-introduction/image33.gif" alt="Animated globe of geospatial representations" /></div>
  <strong class="intro-decisions">Informed<br />decisions</strong>
</div>
<div class="intro-flow-captions"><span>Satellite and weather data<br />at enormous scale</span><span>Effective geospatial<br />data representations</span></div>

<!-- Source: why_need_representations.pptx, slide 10. Original images and animated globe retained. Source data-store and arrow geometry reconstructed in editable HTML/CSS. Source describes thousands of petabytes; phrased qualitatively here without introducing a new estimate. -->
