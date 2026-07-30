---
title: "NLBAC: A Neural Ordinary Differential Equations-based Framework for Stable and Safe Reinforcement Learning"
authors:
  - "L Zhao"
  - "K Miao"
  - "K Gatsis"
  - "A Papachristodoulou"
date: "2024-01-01T00:00:00Z"
publication: "arXiv preprint arXiv:2401.13148, 2024"
summary: "arXiv preprint arXiv:2401.13148, 2024"
abstract: >-
  Reinforcement learning (RL) excels in applications such as video games and robotics, but ensuring safety and stability remains challenging when using RL to control real-world systems where using model-free algorithms suffering from low sample efficiency might be prohibitive. This paper first provides safety and stability definitions for the RL system, and then introduces a Neural ordinary differential equations-based Lyapunov-Barrier Actor-Critic (NLBAC) framework that leverages Neural Ordinary Differential Equations (NODEs) to approximate system dynamics and integrates the Control Barrier Function (CBF) and Control Lyapunov Function (CLF) frameworks with the actor-critic method to assist in maintaining the safety and stability for the system. Within this framework, we employ the augmented Lagrangian method to update the RL-based controller parameters. Additionally, we introduce an extra backup controller in situations where CBF constraints for safety and the CLF constraint for stability cannot be satisfied simultaneously. Simulation results demonstrate that the framework leads the system to approach the desired state and allows fewer violations of safety constraints with better sample efficiency compared to other methods.
citations: ""
tags: []
links:
  - name: Google Scholar
    url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=HxFJ_DQAAAAJ&pagesize=100&citation_for_view=HxFJ_DQAAAAJ:5nxA0vEk-isC"
source: Google Scholar
draft: true
image:
  filename: "featured.png"
---

arXiv preprint arXiv:2401.13148, 2024
