---
addons:
  - "../"
defaults:
  layout: bonn-content
layout: bonn-cover
subhead: Paper Analysis
home: ../
---

# Paper Analysis

## From foundations to current research in representation learning

Four sessions, five papers per session, group presentations, and joint synthesis

<!--
Overview deck for the Paper Analysis phase of the GRL course.
Sessions: Nov 27, Dec 4, Dec 11, and Dec 18.
-->

---

# Four Paper Analysis Sessions

| Session | Topic | Focus |
| --- | --- | --- |
| **1 · Nov 27** | Implicit Neural Representations and Approximation | Continuous representations, function approximation, coordinate networks, Fourier features, neural fields |
| **2 · Dec 4** | Location Encoders | Geographic coordinates, spatial inductive biases, spherical geometry, learned location representations |
| **3 · Dec 11** | Self-Supervised Representation Learning | Contrastive learning, self-distillation, masked reconstruction, multimodal learning |
| **4 · Dec 18** | Geospatial Embeddings | Earth representations, explicit and implicit embeddings, global embedding systems, embedding spaces |

**Progression:** INRs → Location Encoders → Self-Supervised Learning → Geospatial Embeddings

---

# Your Paper Presentation

Each group presents one paper for approximately **20 minutes**. Explain the paper rather than only summarizing it.

1. **Problem and motivation:** What problem does the paper address, and why does it matter?
2. **Main idea:** What is the central contribution? Explain it in your own words.
3. **Technical method:** Explain the key mechanism, representation, architecture, or mathematical idea. Focus on why it works.
4. **Evidence and results:** Which experiments support the claims? What are the most important results?
5. **Limitations:** What does the method leave unresolved? Which assumptions or weaknesses matter?
6. **Technical impact:** What did the paper introduce, popularize, clarify, or enable? How does it connect to the other papers?
7. **Two exam questions:** Write open-ended questions with answer sketches that test concepts rather than facts.

> Prefer “Why does the method need this representation, and what would likely happen without it?” over “Which dataset did the authors use?”

---

# Paper Analysis Session Timeline

| Time | Activity |
| --- | --- |
| **10:00–10:10** | Topic framing and introduction |
| **10:10–10:40** | Group 1 presentation and discussion |
| **10:40–11:10** | Group 2 presentation and discussion |
| **11:10–11:40** | Group 3 presentation and discussion |
| **11:40–12:00** | Cross-paper discussion and buffer |
| **12:00–13:00** | Break |
| **13:00–13:30** | Group 4 presentation and discussion |
| **13:30–14:00** | Group 5 presentation and discussion |
| **14:00–14:50** | Synthesis across all five papers: shared findings, differences, and impact on the field |
| **14:50–15:00** | Wrap-up and assignment of the next session’s papers |

---

# Session 1: Implicit Neural Representations

**November 27**

*How can neural networks represent continuous signals, functions, and scenes?*

1. **Review:** [Neural Fields in Visual Computing and Beyond](https://doi.org/10.1111/cgf.14505)  
   Xie, Takikawa, Saito, Litany et al. *Computer Graphics Forum* 41(2), 2022.

2. **SIREN:** [Implicit Neural Representations with Periodic Activation Functions](https://arxiv.org/abs/2006.09661)  
   Sitzmann, Martel, Bergman, Lindell, Wetzstein. *NeurIPS 2020*.

3. **Fourier Features:** [Fourier Features Let Networks Learn High Frequency Functions in Low Dimensional Domains](https://arxiv.org/abs/2006.10739)  
   Tancik, Srinivasan, Mildenhall, Fridovich-Keil et al. *NeurIPS 2020*.

4. **NeRF:** [NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis](https://www.ecva.net/papers/eccv_2020/papers_ECCV/html/1473_ECCV_2020_paper.php)  
   Mildenhall, Srinivasan, Tancik, Barron, Ramamoorthi, Ng. *ECCV 2020*.

5. **Generalisation:** [Generalised Implicit Neural Representations](https://arxiv.org/abs/2205.15674)  
   Grattarola, Vandergheynst. 2022.

**Synthesis:** representation, frequency, architecture, application, and generalization

---

# Session 2: Location Encoders

**December 4**

*How should a machine-learning model represent a location on Earth?*

1. **Review:** [A Review of Location Encoding for GeoAI: Methods and Applications](https://doi.org/10.1080/13658816.2021.2004602)  
   Mai, Janowicz, Hu, Gao et al. *International Journal of Geographical Information Science* 36(4), 2022.

2. **Spherical Harmonics and SIREN:** [Geographic Location Encoding with Spherical Harmonics and Sinusoidal Representation Networks](https://proceedings.iclr.cc/paper_files/paper/2024/hash/073c8584ef86bee26fe9d639ec648e28-Abstract-Conference.html)  
   Rußwurm, Klemmer, Rolf, Zbinden, Tuia. *ICLR 2024*.

3. **Spatial INR:** [Spatial Implicit Neural Representations for Global-Scale Species Mapping](https://proceedings.mlr.press/v202/cole23a.html)  
   Cole, Van Horn, Lange, Shepard et al. *ICML 2023*, PMLR 202:6320–6342.

4. **Spherical Attention:** [Attention on the Sphere](https://proceedings.neurips.cc/paper_files/paper/2025/hash/58fb4d7e4e5e6e03ff244b5e39805e98-Abstract-Conference.html)  
   Bonev, Rietmann, Paris, Carpentieri, Kurth. *NeurIPS 2025*.

5. **To be announced:** Paper 5

**Synthesis:** Where should spatial geometry enter the model: encoding, representation, or architecture?

---

# Session 3: Self-Supervised Learning

**December 11**

*How can useful representations emerge without task-specific labels?*

1. **SimCLR:** [A Simple Framework for Contrastive Learning of Visual Representations](https://proceedings.mlr.press/v119/chen20j.html)  
   Chen, Kornblith, Norouzi, Hinton. *ICML 2020*, PMLR 119:1597–1607.

2. **DINO:** [Emerging Properties in Self-Supervised Vision Transformers](https://openaccess.thecvf.com/content/ICCV2021/html/Caron_Emerging_Properties_in_Self-Supervised_Vision_Transformers_ICCV_2021_paper.html)  
   Caron, Touvron, Misra, Jégou et al. *ICCV 2021*, pp. 9650–9660.

3. **MAE:** [Masked Autoencoders Are Scalable Vision Learners](https://openaccess.thecvf.com/content/CVPR2022/html/He_Masked_Autoencoders_Are_Scalable_Vision_Learners_CVPR_2022_paper.html)  
   He, Chen, Xie, Li, Dollár, Girshick. *CVPR 2022*, pp. 16000–16009.

4. **CLIP:** [Learning Transferable Visual Models From Natural Language Supervision](https://proceedings.mlr.press/v139/radford21a.html)  
   Radford, Kim, Hallacy, Ramesh et al. *ICML 2021*, PMLR 139:8748–8763.

5. **Analysis:** [What Do Self-Supervised Vision Transformers Learn?](https://openreview.net/forum?id=azCKuYyS74)  
   Park, Kim, Heo, Kim, Yun. *ICLR 2023*.

**Synthesis:** contrastive learning, self-distillation, masked reconstruction, multimodal learning, and representation analysis

---

# Session 4: Geospatial Embeddings

**December 18**

*Can information about the Earth be compressed into reusable embedding spaces?*

1. **Perspective:** [Earth Embeddings: Toward Artificial Intelligence-Centric Representations of Our Planet](https://doi.org/10.1109/MGRS.2026.3710416)  
   Klemmer, Rolf, Rußwurm, Camps-Valls et al. *IEEE Geoscience and Remote Sensing Magazine*, 2026.

2. **AlphaEarth:** [AlphaEarth Foundations: An Embedding Field Model for Accurate and Efficient Global Mapping from Sparse Label Data](https://arxiv.org/abs/2507.22291)  
   Brown, Kazmierski, Pasquarella et al. 2025.

3. **Analysis:** [Measuring the Intrinsic Dimension of Earth Representations](https://arxiv.org/abs/2511.02101)  
   Rao, Rußwurm, Klemmer, Rolf. 2025/2026.

4. **SatCLIP:** [SatCLIP: Global, General-Purpose Location Embeddings with Satellite Imagery](https://ojs.aaai.org/index.php/AAAI/article/view/32457)  
   Klemmer, Rolf, Robinson, Mackey, Rußwurm. *AAAI 2025*, 39(4):4347–4355.

5. **TESSERA:** [TESSERA: Temporal Embeddings of Surface Spectra for Earth Representation and Analysis](https://openaccess.thecvf.com/content/CVPR2026/papers/Feng_TESSERA_Temporal_Embeddings_of_Surface_Spectra_for_Earth_Representation_and_CVPR_2026_paper.pdf)  
   Feng, Atzberger, Jaffer, Knezevic et al. *CVPR 2026*.

**Synthesis:** What is an Earth embedding, what information does it contain, and how should we evaluate it?
