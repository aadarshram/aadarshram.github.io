function fillCardExcerpt(container, text, url, wordLimit) {
  const limit = wordLimit || 15;
  const trimmed = (text || "").trim();
  if (!trimmed) {
    container.textContent = "No description.";
    return;
  }

  const words = trimmed.split(/\s+/);
  if (words.length <= limit) {
    container.textContent = trimmed;
    return;
  }

  container.textContent = words.slice(0, limit).join(" ") + "... ";
  const more = document.createElement("a");
  more.href = url;
  more.className = "post-read-more";
  more.target = "_blank";
  more.rel = "noopener";
  more.textContent = "[Read More]";
  container.appendChild(more);
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }
  return systemPrefersDark() ? "dark" : "light";
}

function applyTheme(mode) {
  const isDark = mode === "dark";
  document.documentElement.classList.toggle("dark-mode", isDark);
  document.body.classList.toggle("dark-mode", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.setAttribute("content", isDark ? "#121212" : "#faf9f6");
  }
  document.querySelectorAll(".switch input").forEach((input) => {
    input.checked = isDark;
  });
}

function syncThemeSwitchUI() {
  applyTheme(resolveTheme());
}

function syncSiteNavHeight() {
  const shell = document.querySelector(".site-nav-shell");
  if (!shell) {
    return;
  }
  document.documentElement.style.setProperty(
    "--site-nav-height",
    `${shell.offsetHeight}px`
  );
}



/*
function isHomePage() {
  return document.body.classList.contains("is-home");
}

function getInitialLandingDocked() {
  return !isHomePage();
}

function setStoredLandingDocked(docked) {
  try {
    localStorage.setItem("landing-docked", String(docked));
  } catch (e) {}
}
*/

window.onload = function() {
  syncThemeSwitchUI();
  syncSiteNavHeight();
};

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".switch input").forEach((toggleSwitch) => {
    toggleSwitch.addEventListener("change", function() {
      const wantDark = this.checked;
      localStorage.setItem("theme", wantDark ? "dark" : "light");
      applyTheme(wantDark ? "dark" : "light");
    });
  });

  const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemThemeChange = (event) => {
    if (localStorage.getItem("theme")) {
      return;
    }
    applyTheme(event.matches ? "dark" : "light");
  };
  if (themeQuery.addEventListener) {
    themeQuery.addEventListener("change", onSystemThemeChange);
  } else if (themeQuery.addListener) {
    themeQuery.addListener(onSystemThemeChange);
  }

  syncThemeSwitchUI();
  syncSiteNavHeight();
  window.addEventListener("resize", syncSiteNavHeight);

  /*
  Temporarily disabled landing interaction (lightsaber dock / swipe / wheel).
  Restore by uncommenting this block.

  const landingHero = document.querySelector(".intro-header.big-img.landing-hero");
  if (landingHero) {
    const siteNav = landingHero.querySelector(".site-nav");
    const lightsaber = landingHero.querySelector(".lightsaber");
    const mobileShell = document.querySelector(".site-nav-shell--landing-mobile");
    const desktopMq = window.matchMedia("(min-width: 992px)");
    const IGNITE_MS = 950;
    const HERO_TRAVEL_MS = 650;
    const SABER_IDLE_RATIO = 0.85;
    let docked = false;
    let animating = false;
    let swipeStartX = null;
    let swipeStartY = null;
    let igniteTimer = null;
    let expandTimer = null;
    let edgeWatchRaf = null;

    const clearSaberTimers = () => {
      window.clearTimeout(igniteTimer);
      window.clearTimeout(expandTimer);
      if (edgeWatchRaf !== null) {
        window.cancelAnimationFrame(edgeWatchRaf);
        edgeWatchRaf = null;
      }
    };

    const resetSaberClasses = () => {
      if (!lightsaber) {
        return;
      }
      lightsaber.classList.remove("is-lit", "is-riding", "is-retracting");
    };

    const saberIdleX = () => window.innerWidth * SABER_IDLE_RATIO;

    // Instant left-mode swap when edge == idle X so attach/detach never eases sideways
    const setSaberRiding = (riding) => {
      if (!lightsaber) {
        return;
      }
      lightsaber.style.transition = "none";
      lightsaber.classList.toggle("is-riding", riding);
      if (!riding) {
        lightsaber.classList.remove("is-retracting");
      }
      void lightsaber.offsetWidth;
      lightsaber.style.transition = "";
    };

    const watchHeroEdge = (mode, onCross) => {
      const tick = () => {
        const width = landingHero.getBoundingClientRect().width;
        const target = saberIdleX();
        const crossed = mode === "attach" ? width <= target + 0.75 : width >= target - 0.75;
        if (crossed) {
          edgeWatchRaf = null;
          onCross();
          return;
        }
        edgeWatchRaf = window.requestAnimationFrame(tick);
      };
      edgeWatchRaf = window.requestAnimationFrame(tick);
    };

    const placeSiteNav = () => {
      if (!siteNav) {
        return;
      }

      if (desktopMq.matches) {
        if (siteNav.parentElement !== landingHero) {
          landingHero.appendChild(siteNav);
        }
        if (mobileShell) {
          mobileShell.hidden = true;
        }
        document.body.classList.add("has-landing-sidebar");
      } else {
        if (mobileShell) {
          mobileShell.hidden = false;
          if (siteNav.parentElement !== mobileShell) {
            mobileShell.appendChild(siteNav);
          }
        }
        document.body.classList.remove("has-landing-sidebar", "landing-docked");
        landingHero.classList.remove("is-docked");
        resetSaberClasses();
        docked = false;
        animating = false;
      }
    };

    const setLightsaberLabel = (isDocked) => {
      if (!lightsaber) {
        return;
      }
      lightsaber.setAttribute(
        "aria-label",
        isDocked ? "Expand hero" : "Activate lightsaber to enter site"
      );
    };

    const applyDockedState = (nextDocked, options = {}) => {
      const persist = options.persist !== false;

      if (!desktopMq.matches) {
        landingHero.classList.remove("is-docked");
        document.body.classList.remove("landing-docked");
        document.documentElement.classList.remove("preload-landing-docked");
        resetSaberClasses();
        setLightsaberLabel(false);
        return;
      }

      docked = nextDocked;
      landingHero.classList.toggle("is-docked", docked);
      document.body.classList.toggle("landing-docked", docked);

      if (options.syncSaber !== false) {
        if (docked || options.keepLit) {
          lightsaber?.classList.add("is-lit", "is-riding");
          lightsaber?.classList.remove("is-retracting");
        } else {
          resetSaberClasses();
        }
      }

      setLightsaberLabel(docked);

      if (persist) {
        setStoredLandingDocked(docked);
      }

      if (!docked && options.scrollTop !== false) {
        window.scrollTo({ top: 0, behavior: options.instant ? "auto" : "smooth" });
      }
    };

    const igniteThenDock = () => {
      if (!desktopMq.matches || docked || animating || !lightsaber) {
        return;
      }

      animating = true;
      clearSaberTimers();
      // Phase 1: parallel ignite at idle X
      lightsaber.classList.remove("is-riding", "is-retracting");
      lightsaber.classList.add("is-lit");

      igniteTimer = window.setTimeout(() => {
        // Continuous width collapse; attach when the edge reaches the saber
        let attached = false;
        applyDockedState(true, { syncSaber: false });
        lightsaber.classList.add("is-lit");
        lightsaber.classList.remove("is-riding", "is-retracting");

        watchHeroEdge("attach", () => {
          attached = true;
          setSaberRiding(true);
          lightsaber.classList.add("is-lit");
        });

        expandTimer = window.setTimeout(() => {
          if (!attached) {
            setSaberRiding(true);
            lightsaber.classList.add("is-lit");
          }
          animating = false;
        }, HERO_TRAVEL_MS);
      }, IGNITE_MS);
    };

    const extinguishAndExpand = () => {
      if (!desktopMq.matches || !docked || animating || !lightsaber) {
        return;
      }

      animating = true;
      clearSaberTimers();

      // Phase 1: glow shrinks + hilt rises on the docked edge
      lightsaber.classList.add("is-riding", "is-retracting");
      lightsaber.classList.remove("is-lit");

      igniteTimer = window.setTimeout(() => {
        // Continuous width expand while riding; detach when edge hits idle X
        let detached = false;
        applyDockedState(false, { syncSaber: false, scrollTop: false });
        lightsaber.classList.add("is-riding", "is-retracting");
        lightsaber.classList.remove("is-lit");

        watchHeroEdge("detach", () => {
          detached = true;
          setSaberRiding(false);
          setLightsaberLabel(false);
        });

        expandTimer = window.setTimeout(() => {
          if (!detached) {
            setSaberRiding(false);
            setLightsaberLabel(false);
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
          animating = false;
        }, HERO_TRAVEL_MS);
      }, IGNITE_MS);
    };

    const onSwipeStart = (x, y) => {
      swipeStartX = x;
      swipeStartY = y;
    };

    const onSwipeEnd = (x, y) => {
      if (swipeStartX === null || swipeStartY === null || !desktopMq.matches || animating) {
        swipeStartX = null;
        swipeStartY = null;
        return;
      }

      const dx = x - swipeStartX;
      const dy = y - swipeStartY;
      swipeStartX = null;
      swipeStartY = null;

      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.2) {
        return;
      }

      if (dx < 0 && !docked) {
        igniteThenDock();
      } else if (dx > 0 && docked) {
        extinguishAndExpand();
      }
    };

    placeSiteNav();
    applyDockedState(getInitialLandingDocked(), {
      persist: false,
      scrollTop: false,
      instant: true
    });
    document.documentElement.classList.remove("preload-landing-docked");
    syncThemeSwitchUI();

    if (lightsaber) {
      lightsaber.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!desktopMq.matches || animating) {
          return;
        }
        if (docked) {
          extinguishAndExpand();
        } else {
          igniteThenDock();
        }
      });
    }

    landingHero.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      if (event.target.closest(".site-nav, .lightsaber")) {
        return;
      }
      onSwipeStart(event.clientX, event.clientY);
    });

    window.addEventListener("pointerup", (event) => {
      onSwipeEnd(event.clientX, event.clientY);
    });

    window.addEventListener("pointercancel", () => {
      swipeStartX = null;
      swipeStartY = null;
    });

    window.addEventListener(
      "wheel",
      (event) => {
        if (!desktopMq.matches || animating || Math.abs(event.deltaX) < 40) {
          return;
        }
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
          return;
        }

        if (event.deltaX > 0 && !docked) {
          event.preventDefault();
          igniteThenDock();
        } else if (event.deltaX < 0 && docked) {
          event.preventDefault();
          extinguishAndExpand();
        }
      },
      { passive: false }
    );

    window.addEventListener("resize", () => {
      placeSiteNav();
      if (!desktopMq.matches) {
        applyDockedState(false, { persist: false, scrollTop: false });
      } else {
        applyDockedState(docked, { persist: false, scrollTop: false, instant: true });
      }
    });

    if (desktopMq.addEventListener) {
      desktopMq.addEventListener("change", () => {
        placeSiteNav();
        if (desktopMq.matches) {
          applyDockedState(getInitialLandingDocked(), {
            persist: false,
            scrollTop: false,
            instant: true
          });
        } else {
          applyDockedState(false, { persist: false, scrollTop: false });
        }
      });
    } else if (desktopMq.addListener) {
      desktopMq.addListener(() => {
        placeSiteNav();
        if (desktopMq.matches) {
          applyDockedState(getInitialLandingDocked(), {
            persist: false,
            scrollTop: false,
            instant: true
          });
        } else {
          applyDockedState(false, { persist: false, scrollTop: false });
        }
      });
    }
  }
  */

  const initContentFilters = (root) => {
    const itemSelector = root.dataset.filterItem;
    if (!itemSelector) {
      return;
    }

    const items = Array.from(document.querySelectorAll(itemSelector));
    const emptyState = root.parentElement
      ? root.parentElement.querySelector(".content-filter-empty")
      : null;
    const pager = root.parentElement
      ? root.parentElement.querySelector("[data-content-pager]")
      : null;
    const pageSize = parseInt(root.dataset.pageSize, 10) || 0;
    const groups = Array.from(root.querySelectorAll("[data-filter-group]"));
    const toggle = root.querySelector(".content-filter-toggle");
    const panel = root.querySelector(".content-filter-panel");
    const selected = {};
    let currentPage = 1;

    groups.forEach((group) => {
      selected[group.dataset.filterGroup] = "all";
    });

    const setPanelOpen = (open) => {
      if (!panel || !toggle) {
        return;
      }
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      root.classList.toggle("is-open", open);
    };

    const syncToggleState = () => {
      if (!toggle) {
        return;
      }
      const activeCount = Object.values(selected).filter((value) => value !== "all").length;
      toggle.classList.toggle("is-active", activeCount > 0);
    };

    const matchingItems = () => {
      return items.filter((item) => {
        return groups.every((group) => {
          const key = group.dataset.filterGroup;
          const value = selected[key];
          if (value === "all") {
            return true;
          }
          const itemValues = (item.dataset[key] || "").split(/\s+/).filter(Boolean);
          return itemValues.includes(value);
        });
      });
    };

    const renderPager = (totalPages) => {
      if (!pager) {
        return;
      }

      pager.innerHTML = "";
      pager.hidden = !pageSize || totalPages <= 1;
      if (pager.hidden) {
        return;
      }

      const addButton = (label, page, options) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "content-pager-btn";
        button.textContent = label;
        if (options.current) {
          button.classList.add("is-active");
          button.setAttribute("aria-current", "page");
        }
        if (options.disabled) {
          button.disabled = true;
        }
        button.addEventListener("click", () => {
          if (options.disabled || page === currentPage) {
            return;
          }
          currentPage = page;
          applyFilters({ resetPage: false });
          root.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        pager.appendChild(button);
      };

      addButton("Previous", currentPage - 1, { disabled: currentPage <= 1 });
      for (let page = 1; page <= totalPages; page += 1) {
        addButton(String(page), page, { current: page === currentPage });
      }
      addButton("Next", currentPage + 1, { disabled: currentPage >= totalPages });
    };

    const applyFilters = (options) => {
      const resetPage = !options || options.resetPage !== false;
      const matched = matchingItems();
      const totalPages = pageSize ? Math.max(1, Math.ceil(matched.length / pageSize)) : 1;

      if (resetPage) {
        currentPage = 1;
      }
      currentPage = Math.min(currentPage, totalPages);

      items.forEach((item) => {
        item.classList.add("is-hidden");
      });

      matched.forEach((item, index) => {
        const onPage = !pageSize || Math.floor(index / pageSize) + 1 === currentPage;
        item.classList.toggle("is-hidden", !onPage);
      });

      if (emptyState) {
        emptyState.hidden = matched.length !== 0;
      }
      renderPager(matched.length ? totalPages : 0);
      syncToggleState();
    };

    if (toggle && panel) {
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        setPanelOpen(panel.hidden);
      });

      document.addEventListener("click", (event) => {
        if (!root.contains(event.target)) {
          setPanelOpen(false);
        }
      });

      document.addEventListener("keyup", (event) => {
        if (event.key === "Escape") {
          setPanelOpen(false);
        }
      });
    }

    groups.forEach((group) => {
      const buttons = Array.from(group.querySelectorAll(".projects-filter-btn"));
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          selected[group.dataset.filterGroup] = button.dataset.filter;
          buttons.forEach((peer) => {
            peer.classList.toggle("is-active", peer === button);
          });
          applyFilters();
        });
      });
    });

    applyFilters();
  };

  document.querySelectorAll("[data-filter-root]").forEach(initContentFilters);
});
