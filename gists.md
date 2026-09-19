---
layout: page
title: Gists
subtitle: Live index of public Gists
permalink: /gists/
js:
  - "/assets/js/gists-page.js"
---

<div id="gists-page" data-username="{{ site.social-network-links.github }}">
  <p class="github-intro">
    Notes and snippets. Repositories are on <a href="{{ '/github/' | relative_url }}">Github</a>.
    Curated works are on <a href="{{ '/projects/' | relative_url }}">Projects</a>.
  </p>

  <section class="github-profile" aria-labelledby="gists-profile-heading">
    <h2 id="gists-profile-heading" class="sr-only">Profile</h2>
    <div class="github-profile-inner">
      <img class="github-avatar" src="https://avatars.githubusercontent.com/u/142728380?v=4" alt="GitHub profile photo of Aadarsh Ramachandiran" width="112" height="112">
      <div class="github-profile-meta">
        <p class="github-name" data-github-name>Aadarsh Ramachandiran</p>
        <a class="github-handle" href="https://gist.github.com/{{ site.social-network-links.github }}" target="_blank" rel="noopener">gist.github.com/{{ site.social-network-links.github }}</a>
        <p class="github-bio" data-github-bio hidden></p>
      </div>
    </div>
  </section>

  <section class="github-repos" aria-labelledby="gists-list-heading">
    <h2 id="gists-list-heading">Gists</h2>
    <p class="github-repos-status" data-gists-status>Loading gists…</p>
    <div class="github-repos-grid" data-gists-grid></div>
  </section>
</div>
