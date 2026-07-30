---
title: "Opt-ODENet: Neural ODE controller design with differentiable optimization layers for safety and stability"
authors:
  - "K Miao"
  - "L Zhao"
  - "H Wang"
  - "K Gatsis"
  - "A Papachristodoulou"
date: "2025-01-01T00:00:00Z"
publication: "Proceedings of the 7th Annual Learning for Dynamics and Control Conference, PMLR 283:1217–1229, 2025"
summary: "Proceedings of the 7th Annual Learning for Dynamics and Control Conference, PMLR 283:1217–1229, 2025"
abstract: >-
  Designing controllers that achieve task objectives while ensuring safety is a key challenge in control systems. This work introduces Opt-ODENet, a Neural ODE framework with a differentiable Quadratic Programming (QP) optimization layer to enforce constraints as hard requirements. Eliminating the reliance on nominal controllers or large datasets, our framework solves the optimal control problem directly using Neural ODEs. Stability and convergence are ensured through Control Lyapunov Functions (CLFs) in the loss function, while Control Barrier Functions (CBFs) embedded in the QP layer enforce real-time safety. By integrating the differentiable QP layer with Neural ODEs, we demonstrate compatibility with the adjoint method for gradient computation, enabling the learning of the CBF class-$\mathcal{K}$ function and control network parameters. Experiments validate its effectiveness in balancing safety and performance.
citations: "1"
tags: []
links:
  - name: PMLR
    url: "https://proceedings.mlr.press/v283/miao25a.html"
  - name: PDF
    url: "https://raw.githubusercontent.com/mlresearch/v283/main/assets/miao25a/miao25a.pdf"
  - name: Google Scholar
    url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=HxFJ_DQAAAAJ&pagesize=100&citation_for_view=HxFJ_DQAAAAJ:Se3iqnhoufwC"
source: Google Scholar
image:
  filename: "featured.png"
---

Proceedings of the 7th Annual Learning for Dynamics and Control Conference, PMLR 283:1217–1229, 2025
