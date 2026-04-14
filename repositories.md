---
layout: page
permalink: /projects/
title: Projects
subtitle: Selected projects I've worked on.
description: Selected projects
nav: true
nav_order: 3
full-width: true

# Projects data structure
# Each project can have:
# - title: Project name
# - image: Cover image path
# - description: Technical description
# - report: Link to blog post, GitHub readme, PDF, or any documentation (can be relative or absolute URL)
# - github: GitHub repo link

projects:
  - title: Swarm-rescue
    date: 2026
    categories: [robotics-control]
    image: /assets/img/swarm_rescue.png
    description: Built a frontier based exploration and pure pursuit control for a swarm of drones to autonomously explore and rescue people in simulated environments. Models and handles real-world constraints.
    github: "https://github.com/aadarshram/swarm-rescue"
  - title: Agnirath
    date: 2024
    categories: [robotics-control]
    image: /assets/img/agnirath.jpg
    description: Race strategy for solar car racing at World Solar Challenge 2025, Australia. Built constrained optimization models to optimize time and energy efficiency. (Report compiled by teammates)
    report: "/assets/docs/agnirath_report.pdf"
  - title: LeX-O
    date: 2025
    categories: [robotics-control]
    image: /assets/img/lerobot.jpeg
    description: Built a robot that plays tic-tac-toe in 48hrs in Lerobot Worldwide Hackathon. Developed a hierarchical LLM + ACT model and deployed in So-100 arms.
    report: "/2025-07-29-Le-X-O/"
    github: "https://github.com/aadarshram/lerobot/tree/LeX-O_TicTacToe"
  - title: LightSoundSync (Course Project)
    date: 2025
    categories: [hardware]
    image: /assets/img/analog.jpeg
    description: Explored synchronizing light with sound by changing the brightness of an LED with sound level using a composite analog system.
    github: "https://github.com/aadarshram/LightSoundSync"
  - title: S.A.M.V.I.D
    date: 2024
    categories: [robotics-control]
    image: /assets/img/samvid.jpeg
    description: Built a semi-autonomous museum tour guide robot for India's first Constitution Museum at O.P Jindal University.
    report: "https://www.thehindu.com/news/national/tamil-nadu/iit-m-students-develop-robot-for-op-jindal-universitys-constitution-museum/article68863807.ece"
  - title: Microprocessors Lab (Course Project)
    date: 2024
    categories: [hardware]
    image: /assets/img/mup.jpeg
    description: Designed and implemented digital systems using Verilog (FPGA) and Assembly (AVR & ARM). Built combinational/sequential circuits, hardware interfacing, and interrupt handling across different architectures.
    github: "https://github.com/aadarshram/MicroProcessorsLab_EE2016"
  - title: ConsumerWise
    date: 2024
    categories: [miscellaneous]
    image: /assets/img/consumerwise_cover.jpg
    description: AI-powered nutrient analysis tool that helps interpret food labels and make healthier choices. Integrates an OCR model to extract nutritional information from food labels and a chatbot for interactive Q/A.
    report: "/2024-10-03-ConsumerWise-An-AI-Powered-Nutrient-Analysis-Tool/"
    github: "https://github.com/aadarshram/Google-GenAI-ConsumerWise"
  - title: Route Optimizer for Google Maps
    date: 2024
    categories: [miscellaneous]
    image: /assets/img/maps.jpg
    description: Built a chrome extension that automatically optimizes the order of stops on Google Maps. The extension reads the locations from your route, calculates the optimal order, and reloads the map with the optimized route.
    report: "/2024-09-08-Simplifying-Multi-Stop-Travel-with-a-Route-Optimizer-Chrome-Extension-for-Google-Maps/"
    github: "https://github.com/aadarshram/RouteOptimizer"
  - title: Automatic Waste Segregator
    date: 2024
    categories: [miscellaneous]
    image: /assets/img/aws.png
    description: Built a waste segregation system based on material type using computer vision . Integrated the model into a physical waste bin prototype and deployed it at the Centre for Innovation (CFI), IIT Madras.
    report: "https://github.com/aadarshram/AWS-Image-Classification-Model/blob/master/README.md"
    github: "https://github.com/aadarshram/AWS-Image-Classification-Model"
---

<div class="projects-filter-bar" role="tablist" aria-label="Project categories">
  <button type="button" class="projects-filter-btn is-active" data-filter="all">All</button>
  <button type="button" class="projects-filter-btn" data-filter="robotics-control">Robotics and Control</button>
  <button type="button" class="projects-filter-btn" data-filter="hardware">Hardware</button>
  <button type="button" class="projects-filter-btn" data-filter="miscellaneous">Miscellaneous</button>
</div>

<div class="projects-grid">
  {% for project in page.projects %}
    <article class="project-card card h-100" data-categories="{% if project.categories %}{{ project.categories | join: ' ' }}{% endif %}" data-date="{{ project.date }}">
      {% assign project_image = project.image | default: "/assets/img/thumb.png" %}
      <img class="card-img-top project-card-img" src="{{ project_image | relative_url }}" alt="{{ project.title }}">
      <div class="card-body d-flex flex-column">
        <h3 class="card-title project-card-title">{{ project.title }}</h3>
        <div class="project-card-meta">
          {% if project.date %}
            <span class="project-date-badge">{{ project.date }}</span>
          {% endif %}
          {% if project.categories %}
            {% for category in project.categories %}
              <span class="project-category-badge">{{ category | replace: "robotics-control", "Robotics and Control" | replace: "hardware", "Hardware" | replace: "miscellaneous", "Miscellaneous" }}</span>
            {% endfor %}
          {% endif %}
        </div>
        <p class="card-text project-card-text">{{ project.description }}</p>
        <div class="project-card-links mt-auto">
          {% if project.report %}
            {% if project.report contains "http" %}
              <a class="btn btn-sm btn-dark mr-2" href="{{ project.report }}" target="_blank" rel="noopener">Report</a>
            {% else %}
              <a class="btn btn-sm btn-dark mr-2" href="{{ project.report | relative_url }}">Report</a>
            {% endif %}
          {% endif %}
          {% assign github_link = project.github | default: "" %}
          <a class="btn btn-sm btn-outline-dark {% if github_link == "" %}disabled{% endif %}" href="{% if github_link != "" %}{{ github_link }}{% else %}#{% endif %}" {% if github_link != "" %}target="_blank" rel="noopener"{% else %}aria-disabled="true" tabindex="-1"{% endif %}>GitHub</a>
        </div>
      </div>
    </article>
  {% endfor %}
</div>
