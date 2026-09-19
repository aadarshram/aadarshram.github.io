---
layout: page
title: Github
subtitle: Live Index of Public Repositories
permalink: /github/
js:
  - "/assets/js/github-page.js"
---

<div id="github-page" data-username="{{ site.social-network-links.github }}">
  <p class="github-intro">
    Curated works are on <a href="{{ '/projects/' | relative_url }}">Projects</a>.
    Snippets are on <a href="{{ '/gists/' | relative_url }}">Gists</a>.
  </p>

  <section class="github-profile" aria-labelledby="github-profile-heading">
    <h2 id="github-profile-heading" class="sr-only">Profile</h2>
    <div class="github-profile-inner">
      <img class="github-avatar" src="https://avatars.githubusercontent.com/u/142728380?v=4" alt="GitHub profile photo of Aadarsh Ramachandiran" width="112" height="112">
      <div class="github-profile-meta">
        <p class="github-name" data-github-name>Aadarsh Ramachandiran</p>
        <a class="github-handle" href="https://github.com/{{ site.social-network-links.github }}" target="_blank" rel="noopener">@{{ site.social-network-links.github }}</a>
        <p class="github-bio" data-github-bio hidden></p>
      </div>
    </div>
  </section>

  <section class="github-orgs" data-github-orgs hidden aria-labelledby="github-orgs-heading">
    <h2 id="github-orgs-heading">Organizations</h2>
    <ul class="github-orgs-list" data-github-orgs-list></ul>
  </section>

  <section class="github-contrib" aria-labelledby="github-contrib-heading">
    <h2 id="github-contrib-heading">Activity</h2>
    <div class="github-contrib-frame">
      <img class="github-contrib-img" data-github-contrib alt="GitHub contribution calendar for {{ site.social-network-links.github }}" src="https://ghchart.rshah.org/{{ site.social-network-links.github }}">
    </div>
  </section>

  <section class="github-repos" aria-labelledby="github-repos-heading">
    <h2 id="github-repos-heading">Repositories</h2>
    <p class="github-repos-status" data-github-repos-status>Loading repositories…</p>
    <div class="github-repos-grid" data-github-repos-grid></div>
  </section>
</div>
