export const researchDirections = [
  {
    slug: "learning-with-constraints",
    title: "Learning With Constraints/Guarantees",
    kicker: "Constraints · Verification · Guarantees",
    image: "/uploads/research/koopman-paper-overview.png",
    imageCredit: {
      label: "Miao et al., Learning Koopman Representations with Controllability Guarantees",
      source: "/publications/learning-koopman-representations-with-controllability-guarantees/",
    },
    summary:
      "Building constraints, structure, and formal guarantees directly into learning.",
    intro:
      "This direction studies how constraints and guarantees can be incorporated into learning itself. Rather than checking desired properties only after training, the learning process can encode them through structured parameterizations, optimization layers, regularization, verification, or other principled mechanisms. The broader goal is to develop learning systems whose behavior is reliable by construction.",
    keywords: ["constraints", "guarantees", "verification", "structure", "reliability", "learning"],
    publications: [
      "learning-koopman-representations-with-controllability-guarantees",
      "learning-neural-controllers-with-optimality-and-stability-guarantees-using-input-output-dissipativity",
      "opt-odenet-neural-ode-controller-design-with-differentiable-optimization-layers-for-safety-and-stability",
      "how-deep-do-we-need-accelerating-training-and-inference-of-neural-odes-via-control-perspective",
    ],
  },
  {
    slug: "control-informed-machine-learning",
    title: "Control-Informed Machine Learning",
    kicker: "Models · Training · Optimization",
    image: "/uploads/research/public-control-for-learning.png",
    imageCredit: {
      label: "Chen et al., Nature Communications (2024), Fig. 1 · CC BY-NC-ND 4.0",
      source: "https://www.nature.com/articles/s41467-024-54451-3/figures/1",
    },
    summary:
      "Using control perspectives to understand and improve learning models, training, and optimization.",
    intro:
      "This direction uses ideas and viewpoints from control to study learning more broadly. Learning models, training procedures, and optimization algorithms can all be understood as dynamical processes, opening up new ways to reason about their stability, efficiency, convergence, and reliability.",
    keywords: ["control", "learning", "models", "training", "optimization", "stability", "efficiency"],
    publications: [
      "how-deep-do-we-need-accelerating-training-and-inference-of-neural-odes-via-control-perspective",
      "towards-optimal-network-depths-control-inspired-acceleration-of-training-and-inference-in-neural-odes",
    ],
  },
  {
    slug: "learning-based-control",
    title: "Learning-Based Control",
    kicker: "Learning · Modeling · Control",
    image: "/uploads/research/public-machine-learning-control.png",
    imageCredit: {
      label: "Zhai et al., Nature Communications (2023), Fig. 2 · CC BY 4.0",
      source: "https://www.nature.com/articles/s41467-023-41379-3/figures/2",
    },
    summary:
      "Integrating learning with modeling, estimation, prediction, and control of dynamical systems.",
    intro:
      "This direction explores the broad interface between learning and control. Learning can help represent, model, estimate, predict, and control complex dynamical systems, while systems and control principles provide structure for making these learned components more dependable in closed-loop operation.",
    keywords: ["learning", "control", "dynamical systems", "modeling", "estimation", "prediction"],
    publications: [
      "learning-koopman-representations-with-controllability-guarantees",
      "learning-neural-controllers-with-optimality-and-stability-guarantees-using-input-output-dissipativity",
      "opt-odenet-neural-ode-controller-design-with-differentiable-optimization-layers-for-safety-and-stability",
      "learning-robust-state-observers-using-neural-odes",
    ],
  },
];

export function publicationsForDirection(entries, direction) {
  const allowed = new Set(direction.publications ?? []);
  return entries.filter((entry) => allowed.has(entry.id.replace(/\/index\.md$/, "").replace(/\/index$/, "")));
}
