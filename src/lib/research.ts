export const researchDirections = [
  {
    slug: "learning-with-constraints",
    title: "Learning with Constraints/Guarantees",
    kicker: "Constraints · Verification · Guarantees",
    image: "/uploads/research/learning-with-constraints-generated-v2.png",
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
    title: "Control-informed machine learning",
    kicker: "Models · Training · Optimization",
    image: "/uploads/research/control-informed-machine-learning-generated-v2.png",
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
    title: "Learning-based control",
    kicker: "Learning · Modeling · Control",
    image: "/uploads/research/learning-based-control-generated.png",
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
