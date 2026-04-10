---
layout: page
permalink: /projects-old/
title: Projects
subtitle: Selected work, prototypes, and reports
description: Selected projects
nav: false
nav_order: 3
full-width: true
projects:
  - title: LeX-O
    image: /assets/img/lerobot.jpeg
    date: 2025-07-29
    categories: [robotics-control]
    description: Hierarchical robot agent combining Vision-Language-Action (VLA) models for board perception and planning with Action Chunking Transformer (ACT) for multi-task pick-and-place control across 9 grid positions. Built for LeRobot Hackathon using task instruction embeddings for conditional imitation learning.
    report: "/2025-07-29-Le-X-O/"
    github: ""
  - title: Robotics Foundation Models
    image: /assets/img/robots.png
    date: 2025-05-14
    categories: [robotics-control]
    description: Comprehensive analysis of Vision-Language-Action (VLA) models, RT-1/RT-2 architectures, and the shift from classical robotics to embodied AI. Explores end-to-end learning from pixels-to-actions, semantic grounding, and cross-task generalization in physical AI systems.
    report: "/2025-05-14-How-Robotics-Got-Smart-Physical-AI,-Robotic-Foundation-Models,-and-the-path-to-Embodied-Intelligence/"
    github: ""
  - title: ConsumerWise
    image: /assets/img/consumerwise_cover.jpg
    date: 2024-10-03
    categories: [miscellaneous]
    description: End-to-end OCR + LLM pipeline using GPT-4o Vision API for nutritional label extraction, FastAPI backend for context-aware NutriBot chatbot, and interactive data visualization. Built with Flask, deployed on Google Cloud App Engine & Cloud SQL with personalized recommendations based on user dietary preferences.
    report: "/2024-10-03-ConsumerWise-An-AI-Powered-Nutrient-Analysis-Tool/"
    github: ""
  - title: Route Optimizer
    image: /assets/img/maps.jpg
    date: 2024-09-08
    categories: [miscellaneous]
    description: Chrome extension solving Traveling Salesman Problem (TSP) via Google OR-Tools solver with support for one-way and round-trip routes. Frontend extracts locations from Google Maps; FastAPI backend optimizes order; Nominatim geocoding & OSRM distance matrix for coordinate conversion and routing.
    report: "/2024-09-08-Simplifying-Multi-Stop-Travel-with-a-Route-Optimizer-Chrome-Extension-for-Google-Maps/"
    github: ""
---

<div class="projects-intro">
  <p>
    A small selection of things I’ve built, explored, or written about. Use the category bar to filter by theme, and the date tag to see when each project was published or completed.
  </p>
</div>

<div class="projects-filter-bar" role="tablist" aria-label="Project categories">
  <button type="button" class="projects-filter-btn is-active" data-filter="all">All</button>
  <button type="button" class="projects-filter-btn" data-filter="robotics-control">Robotics and Control</button>
  <button type="button" class="projects-filter-btn" data-filter="hardware">Hardware</button>
  <button type="button" class="projects-filter-btn" data-filter="miscellaneous">Miscellaneous</button>
</div>

<div class="projects-grid">
  {% for project in page.projects %}
    <article class="project-card card h-100" data-categories="{% if project.categories %}{{ project.categories | join: ' ' }}{% endif %}" data-date="{{ project.date }}">
      <img class="card-img-top project-card-img" src="{{ project.image | relative_url }}" alt="{{ project.title }}">
      <div class="card-body d-flex flex-column">
        <h3 class="card-title project-card-title">{{ project.title }}</h3>
        <div class="project-card-meta">
          {% if project.date %}
            <span class="project-date-badge">{{ project.date | date: "%b %Y" }}</span>
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
            <a class="btn btn-sm btn-dark mr-2" href="{{ project.report | relative_url }}">Report</a>
          {% endif %}
          {% assign github_link = project.github | default: "" %}
          <a class="btn btn-sm btn-outline-dark {% if github_link == "" %}disabled{% endif %}" href="{% if github_link != "" %}{{ github_link }}{% else %}#{% endif %}" {% if github_link != "" %}target="_blank" rel="noopener"{% else %}aria-disabled="true" tabindex="-1"{% endif %}>GitHub</a>
        </div>
      </div>
    </article>
  {% endfor %}
</div>
