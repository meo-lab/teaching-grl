---
addons:
  - "../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Lecture 5
home: ../
---

# Deep Representation Learning II

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
Keep this conceptual and practical; transformers are intentionally deferred to Lecture 7.
-->

---
layout: bonn-section
sectionColor: "#00457c"
section: loss-surfaces-and-regularization
sectionTitle: Loss Surfaces and Regularization
---

# Loss Surfaces and Regularization

<div class="text-[.9rem] text-gray-700 mt-4">
Why the shape of the loss landscape matters, and how regularization keeps models from overfitting it.
</div>

---
layout: iframe
url: https://1drv.ms/p/c/8b5d216883cce16e/IQQNXkVvl-n0QJo9UPt7idSOAZrvayDlhdhwKcyHrndyLNU?em=2&wdAr=1.7777777777777777
---

---
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
---

# Data as blocks of numbers - E.g., Tensors

<img
  src="./assets/tensors.svg"
  class="w-full h-[360px] object-contain"
  alt="Scalars, vectors, matrices, images, and image time series represented as tensors with zero to four dimensions"
/>

---
section: models-and-representations
---

# Data samples from a distribution
