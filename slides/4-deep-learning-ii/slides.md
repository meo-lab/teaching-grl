---
addons:
  - "../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lecture 4
home: ../
---

# Deep Learning II

## Learning beyond Memorization

<!--
This lecture extends the ML setup to end-to-end representation learning from raw inputs with labels.
-->

---

# In this lecture

- Neural networks and learned representations
- Supervised training and optimization
- Learning useful intermediate features directly from data
- Convolutional neural networks
- Geospatial and remote-sensing examples

<!--
Keep this conceptual and practical; transformers are intentionally deferred to Lecture 6.
-->

---
<<<<<<< HEAD
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
=======
layout: bonn-section
sectionColor: "#00457c"
section: data
sectionTitle: Data
>>>>>>> ec4af56b9d56102eb9155c9fc74e74190f225da3
---

# Data as blocks of numbers - E.g., Tensors

<img
<<<<<<< HEAD
  src="./assets/tensors.svg"
=======
  src="../3-deep-learning-i/assets/tensors.svg"
>>>>>>> ec4af56b9d56102eb9155c9fc74e74190f225da3
  class="w-full h-[360px] object-contain"
  alt="Scalars, vectors, matrices, images, and image time series represented as tensors with zero to four dimensions"
/>

---
<<<<<<< HEAD
section: models-and-representations
=======
section: data
>>>>>>> ec4af56b9d56102eb9155c9fc74e74190f225da3
---

# Data samples from a distribution
