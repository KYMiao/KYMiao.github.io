---
title: ""
summary: ""
date: 2026-05-11
type: landing

design:
  spacing: "5rem"

sections:
  - block: resume-biography-3
    content:
      username: me
      text: ""
      button:
        text: Download CV
        url: uploads/keyan-miao-cv.pdf
      headings:
        about: ""
        education: "Education"
        interests: "Research Interests"
    design:
      background:
        gradient_mesh:
          enable: true
      name:
        size: lg
      avatar:
        size: medium
        shape: circle

  - block: markdown
    content:
      title: "Research Themes"
      text: |
        <div class="theme-grid">
          <section class="research-theme">
            <h3>Learning-based control with guarantees</h3>
            <p>Safe and stable controllers that combine modern learning with Lyapunov, barrier, and robustness certificates.</p>
          </section>
          <section class="research-theme">
            <h3>Control-informed machine learning</h3>
            <p>Using control perspectives to improve training, inference, and structure in continuous-depth models.</p>
          </section>
          <section class="research-theme">
            <h3>Safe and reliable generative models</h3>
            <p>Learning systems whose generated behavior remains constrained, reliable, and useful for downstream decisions.</p>
          </section>
          <section class="research-theme">
            <h3>Neural ODEs and continuous-time learning</h3>
            <p>Continuous-time learning architectures for observers, controllers, and efficient representation learning.</p>
          </section>
        </div>
    design:
      columns: "1"

  - block: collection
    id: recent-publications
    content:
      title: "Recent Publications"
      text: "Selected recent work. Publication metadata is generated from BibTeX and can be polished with manual overrides."
      filters:
        folders:
          - publications
        featured_only: false
      count: 5
      order: desc
    design:
      view: citation

  - block: collection
    content:
      title: "Recent Writing"
      filters:
        folders:
          - blog
      count: 3
      order: desc
    design:
      view: article-grid
      columns: 3

  - block: collection
    content:
      title: "Photography"
      text: "Conference and travel series, organized as visual notes rather than a loose gallery."
      filters:
        folders:
          - photography
      count: 3
      order: desc
    design:
      view: article-grid
      columns: 3
---
