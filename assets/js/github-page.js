(function () {
  const root = document.getElementById("github-page");
  if (!root) {
    return;
  }

  const username = root.dataset.username;
  if (!username) {
    return;
  }

  const nameEl = root.querySelector("[data-github-name]");
  const bioEl = root.querySelector("[data-github-bio]");
  const orgsSection = root.querySelector("[data-github-orgs]");
  const orgsList = root.querySelector("[data-github-orgs-list]");
  const contribImg = root.querySelector("[data-github-contrib]");
  const reposStatus = root.querySelector("[data-github-repos-status]");
  const reposGrid = root.querySelector("[data-github-repos-grid]");

  const apiBase = "https://api.github.com";

  function chartCacheStamp() {
    return new Date().toISOString().slice(0, 13);
  }

  function formatUpdated(iso) {
    if (!iso) {
      return "";
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  async function fetchJson(url) {
    const response = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!response.ok) {
      throw new Error("GitHub request failed");
    }
    return response.json();
  }

  if (contribImg) {
    contribImg.src = "https://ghchart.rshah.org/" + username + "?t=" + chartCacheStamp();
    contribImg.addEventListener("error", function () {
      const frame = contribImg.closest(".github-contrib-frame");
      if (frame) {
        frame.hidden = true;
      }
    });
  }

  fetchJson(apiBase + "/users/" + encodeURIComponent(username))
    .then(function (user) {
      if (nameEl && user.name) {
        nameEl.textContent = user.name;
      }
      if (bioEl && user.bio) {
        bioEl.textContent = user.bio;
        bioEl.hidden = false;
      }
      if (user.avatar_url) {
        const avatar = root.querySelector(".github-avatar");
        if (avatar) {
          avatar.src = user.avatar_url;
        }
      }
    })
    .catch(function () {
      // Keep the static fallback header.
    });

  fetchJson(apiBase + "/users/" + encodeURIComponent(username) + "/orgs")
    .then(function (orgs) {
      if (!Array.isArray(orgs) || orgs.length === 0 || !orgsSection || !orgsList) {
        return;
      }

      orgs.forEach(function (org) {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = "https://github.com/" + org.login;
        link.target = "_blank";
        link.rel = "noopener";
        link.title = org.login;

        const img = document.createElement("img");
        img.src = org.avatar_url;
        img.alt = org.login;
        img.width = 44;
        img.height = 44;

        const label = document.createElement("span");
        label.textContent = org.login;

        link.appendChild(img);
        link.appendChild(label);
        item.appendChild(link);
        orgsList.appendChild(item);
      });

      orgsSection.hidden = false;
    })
    .catch(function () {
      // Leave the organizations section hidden.
    });

  fetchJson(apiBase + "/users/" + encodeURIComponent(username) + "/repos?per_page=100&sort=updated")
    .then(function (repos) {
      if (!Array.isArray(repos) || repos.length === 0) {
        if (reposStatus) {
          reposStatus.textContent = "No public repositories found.";
        }
        return;
      }

      if (reposStatus) {
        reposStatus.textContent = repos.length + " public repositories, newest first.";
      }

      repos.forEach(function (repo) {
        const article = document.createElement("article");
        article.className = "github-repo-card card h-100";

        const body = document.createElement("div");
        body.className = "card-body d-flex flex-column";

        const title = document.createElement("h3");
        title.className = "card-title github-repo-title";
        const titleLink = document.createElement("a");
        titleLink.href = repo.html_url;
        titleLink.target = "_blank";
        titleLink.rel = "noopener";
        titleLink.textContent = repo.name;
        title.appendChild(titleLink);

        const meta = document.createElement("div");
        meta.className = "github-repo-meta";

        if (repo.fork) {
          const forkBadge = document.createElement("span");
          forkBadge.className = "github-repo-badge github-repo-badge--fork";
          forkBadge.textContent = "Fork";
          meta.appendChild(forkBadge);
        }

        if (repo.language) {
          const langBadge = document.createElement("span");
          langBadge.className = "github-repo-badge";
          langBadge.textContent = repo.language;
          meta.appendChild(langBadge);
        }

        const updated = formatUpdated(repo.updated_at);
        if (updated) {
          const dateBadge = document.createElement("span");
          dateBadge.className = "github-repo-badge";
          dateBadge.textContent = "Updated " + updated;
          meta.appendChild(dateBadge);
        }

        const description = document.createElement("p");
        description.className = "card-text github-repo-text";
        fillCardExcerpt(description, repo.description, repo.html_url);

        body.appendChild(title);
        body.appendChild(meta);
        body.appendChild(description);
        article.appendChild(body);
        reposGrid.appendChild(article);
      });
    })
    .catch(function () {
      if (reposStatus) {
        reposStatus.textContent = "Could not load repositories from GitHub right now.";
      }
    });
})();
