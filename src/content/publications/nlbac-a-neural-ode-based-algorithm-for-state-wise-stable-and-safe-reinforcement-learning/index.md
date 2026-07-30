---
title: "NLBAC: A neural ODE-based algorithm for state-wise stable and safe reinforcement learning"
authors:
  - "L Zhao"
  - "K Miao"
  - "H Cao"
  - "K Gatsis"
  - "A Papachristodoulou"
date: "2025-01-01T00:00:00Z"
publication: "Neurocomputing, Volume 638, Article 130041, 2025"
summary: "Neurocomputing, Volume 638, Article 130041, 2025"
abstract: >-
  Ensuring safety and stability is critical when using reinforcement learning (RL) to control safety-critical systems. However, model-free RL algorithms usually suffer from low sample efficiency, and employing widely-used methods like dual ascent to solve constrained RL problems may be challenging due to their sensitivity to hyperparameters. To address these difficulties, in this work, we first propose an augmented Lagrangian-based method to maintain safety and stability through state-wise control Lyapunov function (CLF) and pre-defined control barrier function (CBFs) constraints in non-constrained Markov decision process (non-CMDP) settings. To handle tasks without pre-defined CBFs, we extend this method by training a barrier certificate jointly with the control policy, supported by theoretical guarantees to ensure monotonically improved control performance. Moreover, we investigate the issue of infeasibility arising from the presence of multiple state-wise constraints. A practical algorithm, Neural ordinary differential equations-based Lyapunov-Barrier Actor-Critic (NLBAC), is further designed by integrating the proposed method with the Soft Actor-Critic (SAC) and leveraging neural ordinary differential equations (NODEs) for system modeling. Comparisons with baselines and ablation experiments demonstrate that our algorithm achieves superior performance in terms of safety and driving the system towards the desired state with higher sample efficiency.
citations: "13"
tags: []
links:
  - name: Publisher
    url: "https://doi.org/10.1016/j.neucom.2025.130041"
  - name: Google Scholar
    url: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=HxFJ_DQAAAAJ&pagesize=100&citation_for_view=HxFJ_DQAAAAJ:LkGwnXOMwfcC"
source: Google Scholar
image:
  filename: "featured.png"
---

Neurocomputing, Volume 638, Article 130041, 2025
