---
title: "Opt-ODENet: A neural ODE framework with differentiable QP layers for safe and stable control design (longer version)"
authors:
  - "K Miao"
  - "L Zhao"
  - "H Wang"
  - "K Gatsis"
  - "A Papachristodoulou"
date: "2025-01-01T00:00:00Z"
publication: "arXiv preprint arXiv:2504.17139, 2025"
summary: "arXiv preprint arXiv:2504.17139, 2025"
abstract: >-
  Designing controllers that achieve task objectives while ensuring safety is a key challenge in control systems. This work introduces Opt-ODENet, a Neural ODE framework with a differentiable Quadratic Programming (QP) optimization layer to enforce constraints as hard requirements. Eliminating the reliance on nominal controllers or large datasets, our framework solves the optimal control problem directly using Neural ODEs. Stability and convergence are ensured through Control Lyapunov Functions (CLFs) in the loss function, while Control Barrier Functions (CBFs) embedded in the QP layer enforce real-time safety. By integrating the differentiable QP layer with Neural ODEs, we demonstrate compatibility with the adjoint method for gradient computation, enabling the learning of the CBF class-$\mathcal{K}$ function and control network parameters. Experiments validate its effectiveness in balancing safety and performance.
citations: "1"
tags: []
links:
  - name: Google Scholar
    url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=HxFJ_DQAAAAJ&pagesize=100&citation_for_view=HxFJ_DQAAAAJ:ufrVoPGSRksC"
source: Google Scholar
draft: true
image:
  filename: "featured.png"
---

arXiv preprint arXiv:2504.17139, 2025
