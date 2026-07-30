---
title: "Learning Koopman Representations with Controllability Guarantees"
authors:
  - "K Miao"
  - "H Wang"
  - "X Ding"
  - "K Gatsis"
  - "A Krause"
  - "A Papachristodoulou"
date: "2026-01-01T00:00:00Z"
publication: "The Fourteenth International Conference on Learning Representations, 2026"
status: "Published"
summary: "The Fourteenth International Conference on Learning Representations, 2026"
abstract: >-
  Learning nonlinear dynamical models from data is central to control. Two fundamental challenges exist: (1) how to learn accurate models from limited data, and (2) how to ensure the learned models are suitable for control design of the nominal system. We address both by enforcing a critical a priori property of the nominal system during learning: controllability. Controllability guarantees the existence of control policies that can drive the learned model from any initial state to any desired state. From a modeling perspective, it captures key structural features of the nominal system, thereby improving data efficiency. For downstream control, it enables the use of modern techniques such as model predictive control (MPC). Our approach is based on controllability-preserving Koopman representation learning. Rather than learning dynamics directly in the nominal state space, we learn in a latent space where the system admits a linear representation. We prove that controllability of the learned latent model implies controllability in the nominal state space. To enforce this property, we introduce a novel canonical parameterization of the latent dynamics matrices. We further incorporate Gramian-based regularization to shape the degree of controllability, yielding well-conditioned models for control. Implemented as an end-to-end Neural ODE framework, our method learns models that are both predictive and controllable from limited data. Experiments on nonlinear benchmarks demonstrate accurate long-horizon prediction, reliable MPC performance, and substantially improved data efficiency.
citations: "1"
tags: []
links:
  - name: Google Scholar
    url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=HxFJ_DQAAAAJ&pagesize=100&citation_for_view=HxFJ_DQAAAAJ:KlAtU1dfN6UC"
source: Google Scholar
image:
  filename: "featured.png"
---

The Fourteenth International Conference on Learning Representations, 2026
