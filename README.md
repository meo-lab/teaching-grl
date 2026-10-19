# Geospatial Representation Learning — Implementation Plan

This checklist tracks the remaining work required to prepare the course.

## General tasks

- [x] Set up the website and platform
- [ ] Fix the dates of the lectures and course phases
- [ ] Implement the evaluation pipeline
- [ ] Revise Learning Outcomes and Align with Teaching Materials

## Lectures

- [x] Lecture 1 — Representations
- [x] Lecture 2 — Geospatial Data
- [x] Lecture 3 — Machine Learning on Data Representations
- [x] Lecture 4 — Deep Representation Learning I
- [x] Lecture 5 — Deep Representation Learning II
- [ ] Lecture 6 — Implicit Neural Representations
- [ ] Lecture 7 — Self-Supervised Deep Learning
- [ ] Lecture 8 — Geospatial Embeddings
- [ ] Lecture 9 — Synthesis: Choosing the Right Representation (confirm course scope)

## Labs

- [ ] Lab 1 — Why Geospatial Representation Learning?
- [ ] Lab 2 — Geodata Scavenger Hunt
- [ ] Lab 3 — Machine Learning on Data Representations
- [ ] Lab 4 — Self-Supervised Learning and Foundation Models
- [ ] Lab 5 — Neural Networks as Knowledge Bases
- [ ] Lab 6 — Geospatial Embedding Representations
- [ ] Lab 7 — Geospatial AI Agents and Dynamic Prompting
- [ ] Lab 8 — Final Project Preparation

## Literature analysis

- [ ] Create slides for the literature phase
- [ ] Create a list of papers for the literature phase

## Project phase

- [ ] Define 4 Application Projects
- [ ] Define 4 Method Projects

# Exam

- [ ] Repare Literature Evaluation Rubrik
- [ ] Prepare Exam
- [ ] Prepare Paper evaluation rubrik

## Slide decks

All deck sources live under `slides/`:

- `course-overview/slides.md` — course landing deck
- `lecture-1/slides.md` through `lecture-9/slides.md`
- `lab-1/slides.md` through `lab-8/slides.md`
- `paper-analysis/slides.md`

Run `npm run dev` for the course overview, or `npx slidev slides/lecture-1/slides.md` for an individual deck. `npm run build` builds the full site, including paper analysis. Published URLs are preserved so existing bookmarks keep working; the build script maps the new source folders to those URLs. Lecture folder numbers retain their original numbering (the overview's Lecture 6 links to the embeddings deck in `lecture-8`).

Enable course links in `data/course-releases.js` (Lectures 1–2 and Labs 1–2 are enabled). Shared components, layouts, styles, and assets stay at the repository root.
