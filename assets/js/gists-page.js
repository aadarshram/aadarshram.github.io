(function () {
  const root = document.getElementById("gists-page");
  if (!root) {
    return;
  }

  const username = root.dataset.username;
  if (!username) {
    return;
  }

  const nameEl = root.querySelector("[data-github-name]");
  const bioEl = root.querySelector("[data-github-bio]");
  const statusEl = root.querySelector("[data-gists-status]");
  const gridEl = root.querySelector("[data-gists-grid]");
  const apiBase = "https://api.github.com";

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

  function gistTitle(gist) {
    let text = (gist.description || "").trim();
    text = text.replace(/\s*\([^)]*https?:\/\/[^)]+\)/g, "").trim();
    text = text.replace(/https?:\/\/\S+/g, "").trim();
    if (!text) {
      const files = Object.keys(gist.files || {});
      return files[0] || "Untitled gist";
    }
    if (text.length > 110) {
      const cut = text.slice(0, 110);
      const lastSpace = cut.lastIndexOf(" ");
      return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut) + "…";
    }
    return text;
  }

  function gistLanguages(gist) {
    const languages = [];
    Object.keys(gist.files || {}).forEach(function (filename) {
      const language = gist.files[filename] && gist.files[filename].language;
      if (language && languages.indexOf(language) === -1) {
        languages.push(language);
      }
    });
    return languages;
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

  fetchJson(apiBase + "/users/" + encodeURIComponent(username) + "/gists?per_page=100")
    .then(function (gists) {
      if (!Array.isArray(gists) || gists.length === 0) {
        if (statusEl) {
          statusEl.textContent = "No public gists found.";
        }
        return;
      }

      gists.sort(function (a, b) {
        return new Date(b.updated_at) - new Date(a.updated_at);
      });

      if (statusEl) {
        statusEl.textContent = gists.length + " public gists, newest first.";
      }

      gists.forEach(function (gist) {
        const files = Object.keys(gist.files || {});
        const article = document.createElement("article");
        article.className = "github-repo-card card h-100";

        const body = document.createElement("div");
        body.className = "card-body d-flex flex-column";

        const title = document.createElement("h3");
        title.className = "card-title github-repo-title";
        const titleLink = document.createElement("a");
        titleLink.href = gist.html_url;
        titleLink.target = "_blank";
        titleLink.rel = "noopener";
        titleLink.textContent = gistTitle(gist);
        title.appendChild(titleLink);

        const meta = document.createElement("div");
        meta.className = "github-repo-meta";

        const fileBadge = document.createElement("span");
        fileBadge.className = "github-repo-badge";
        fileBadge.textContent = files.length === 1 ? "1 file" : files.length + " files";
        meta.appendChild(fileBadge);

        gistLanguages(gist).forEach(function (language) {
          const langBadge = document.createElement("span");
          langBadge.className = "github-repo-badge";
          langBadge.textContent = language;
          meta.appendChild(langBadge);
        });

        const updated = formatUpdated(gist.updated_at);
        if (updated) {
          const dateBadge = document.createElement("span");
          dateBadge.className = "github-repo-badge";
          dateBadge.textContent = "Updated " + updated;
          meta.appendChild(dateBadge);
        }

        const description = document.createElement("p");
        description.className = "card-text github-repo-text";
        fillCardExcerpt(description, gist.description, gist.html_url);

        body.appendChild(title);
        body.appendChild(meta);
        body.appendChild(description);
        article.appendChild(body);
        gridEl.appendChild(article);
      });
    })
    .catch(function () {
      if (statusEl) {
        statusEl.textContent = "Could not load gists from GitHub right now.";
      }
    });
})();
