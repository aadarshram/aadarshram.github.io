---
layout: page
permalink: /projects/
title: Projects
subtitle: Selected projects I've worked on.
description: Selected projects
full-width: true

# Projects data structure
# Each project can have:
# - title: Project name
# - image: Cover image path
# - description: Technical description
# - report: Link to blog post, GitHub readme, PDF, or any documentation (can be relative or absolute URL)
# - github: GitHub repo link

projects:
  - title: Overtone (Course Project)
    date: 2026
    categories: [hardware]
    image: /assets/img/overtone.webp
    description: Built a complete OFDM transceiver with differential QPSK (DQPSK) for indoor acoustic communication. Achieved a ~7.2 kbps bit rate at ~1.3% BER on commodity laptop hardware.
    report: "https://github.com/aadarshram/overtone/blob/main/docs/report.pdf"
    github: "https://github.com/aadarshram/overtone"
  - title: SPCTOM (Course Project)
    date: 2026
    categories: [control]
    image: /assets/img/spctom.jpg
    description: Implemented a smooth and path-constrained time optimal trajectory planner with both torque and torque rate constraints for industrial robots.
    report: "https://github.com/aadarshram/SPCTOM/blob/main/docs/spctom_report.pdf"
    github: "https://github.com/aadarshram/SPCTOM"
  - title: Swarm-rescue
    date: 2026
    categories: [robotics]
    image: /assets/img/swarm_rescue.png
    description: Built a frontier based exploration and pure pursuit control for a swarm of drones to autonomously explore and rescue people in simulated environments. Models and handles real-world constraints.
    github: "https://github.com/aadarshram/swarm-rescue"
  - title: Agnirath
    date: 2024
    categories: [control]
    image: /assets/img/agnirath.jpg
    description: Race strategy for solar car racing at World Solar Challenge 2025, Australia. Built constrained optimization models to optimize time and energy efficiency. 
    report: "/2026-08-22-On-Race-Strategy-for-the-World-Solar-Challenge/"
  - title: LeX-O
    date: 2025
    categories: [robotics]
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
    categories: [robotics]
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
    categories: [ai, software]
    image: /assets/img/consumerwise_cover.jpg
    description: AI-powered nutrient analysis tool that helps interpret food labels and make healthier choices. Integrates an OCR model to extract nutritional information from food labels and a chatbot for interactive Q/A.
    report: "/2024-10-03-ConsumerWise-An-AI-Powered-Nutrient-Analysis-Tool/"
    github: "https://github.com/aadarshram/Google-GenAI-ConsumerWise"
  - title: Route Optimizer for Google Maps
    date: 2024
    categories: [software]
    image: /assets/img/maps.jpg
    description: Built a chrome extension that automatically optimizes the order of stops on Google Maps. The extension reads the locations from your route, calculates the optimal order, and reloads the map with the optimized route.
    report: "/2024-09-08-Simplifying-Multi-Stop-Travel-with-a-Route-Optimizer-Chrome-Extension-for-Google-Maps/"
    github: "https://github.com/aadarshram/RouteOptimizer"
  - title: Automatic Waste Segregator
    date: 2024
    categories: [ai, hardware]
    image: /assets/img/aws.png
    description: Built a waste segregation system based on material type using computer vision . Integrated the model into a physical waste bin prototype and deployed it at the Centre for Innovation (CFI), IIT Madras.
    report: "https://github.com/aadarshram/AWS-Image-Classification-Model/blob/master/README.md"
    github: "https://github.com/aadarshram/AWS-Image-Classification-Model"
---

{% assign project_years = "" %}
{% for project in page.projects %}
  {% if project.date %}
    {% assign project_years = project_years | append: project.date | append: "," %}
  {% endif %}
{% endfor %}
{% assign project_year_list = project_years | split: "," | uniq | sort | reverse %}

<div class="content-filters" data-filter-root data-filter-item=".project-card" data-page-size="6">
  <button type="button" class="content-filter-toggle" aria-expanded="false" aria-controls="projects-filter-panel">
    <span class="fa fa-filter" aria-hidden="true"></span>
    <span>Filter</span>
  </button>
  <div id="projects-filter-panel" class="content-filter-panel" hidden>
    <div class="content-filter-row" data-filter-group="topic">
      <span class="content-filter-label">Topic</span>
      <div class="projects-filter-bar" role="tablist" aria-label="Project categories">
        <button type="button" class="projects-filter-btn is-active" data-filter="all">All</button>
        <button type="button" class="projects-filter-btn" data-filter="robotics">Robotics</button>
        <button type="button" class="projects-filter-btn" data-filter="control">Control</button>
        <button type="button" class="projects-filter-btn" data-filter="ai">AI</button>
        <button type="button" class="projects-filter-btn" data-filter="hardware">Hardware</button>
        <button type="button" class="projects-filter-btn" data-filter="software">Software</button>
      </div>
    </div>
    <div class="content-filter-row" data-filter-group="year">
      <span class="content-filter-label">Year</span>
      <div class="projects-filter-bar" role="tablist" aria-label="Project years">
        <button type="button" class="projects-filter-btn is-active" data-filter="all">All</button>
        {% for year in project_year_list %}
          {% if year != "" %}
            <button type="button" class="projects-filter-btn" data-filter="{{ year }}">{{ year }}</button>
          {% endif %}
        {% endfor %}
      </div>
    </div>
  </div>
</div>
<p class="content-filter-empty" hidden>No projects match these filters.</p>

<div class="projects-grid">
  {% for project in page.projects %}
    <article class="project-card card h-100" data-topic="{% if project.categories %}{{ project.categories | join: ' ' }}{% endif %}" data-year="{{ project.date }}">
      {% assign project_image = project.image | default: "/assets/img/thumb.png" %}
      <div class="project-card-cover" style="background-image: url('{{ project_image | relative_url }}');">
        <div class="project-card-overlay">
          <h3 class="project-card-title">{{ project.title }}</h3>
          <div class="project-card-meta">
            {% if project.date %}
              <span class="project-date-badge">{{ project.date }}</span>
            {% endif %}
            {% if project.categories %}
              {% for category in project.categories %}
                <span class="project-category-badge">{{ category | replace: "robotics", "Robotics" | replace: "control", "Control" | replace: "ai", "AI" | replace: "hardware", "Hardware" | replace: "software", "Software" }}</span>
              {% endfor %}
            {% endif %}
          </div>
        </div>
      </div>
      <div class="card-body d-flex flex-column">
        {% assign more_url = project.report | default: project.github | default: "" %}
        {% assign desc_word_count = project.description | number_of_words %}
        <p class="card-text project-card-text">
          {% if desc_word_count > 15 %}
            {{ project.description | truncatewords: 15 }}
            {% if more_url != "" %}
              {% if more_url contains "http" %}
                <a class="post-read-more" href="{{ more_url }}" target="_blank" rel="noopener">[Read More]</a>
              {% else %}
                <a class="post-read-more" href="{{ more_url | relative_url }}">[Read More]</a>
              {% endif %}
            {% endif %}
          {% else %}
            {{ project.description }}
          {% endif %}
        </p>
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
<nav class="content-pager" data-content-pager hidden aria-label="Project pages"></nav>
