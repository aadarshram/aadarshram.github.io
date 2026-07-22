// Function to toggle dark/light mode
function toggleDarkMode() {
  const body = document.body;

  body.classList.toggle("dark-mode");

  const newMode = body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("theme", newMode);

  document.querySelectorAll(".switch input").forEach((input) => {
    input.checked = newMode === "dark";
  });
}

function syncThemeSwitchUI() {
  const savedTheme = localStorage.getItem("theme");
  const isDark = savedTheme === "dark";

  if (isDark) {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }

  document.querySelectorAll(".switch input").forEach((input) => {
    input.checked = isDark;
  });
}

function isHomePage() {
  return document.body.classList.contains("is-home");
}

function getInitialLandingDocked() {
  // Home stays expanded on first land; all other pages open docked.
  return !isHomePage();
}

function setStoredLandingDocked(docked) {
  try {
    localStorage.setItem("landing-docked", String(docked));
  } catch (e) {}
}

window.onload = function() {
  syncThemeSwitchUI();
};

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".switch input").forEach((toggleSwitch) => {
    toggleSwitch.addEventListener("change", function() {
      const wantDark = this.checked;
      document.body.classList.toggle("dark-mode", wantDark);
      localStorage.setItem("theme", wantDark ? "dark" : "light");
      document.querySelectorAll(".switch input").forEach((input) => {
        input.checked = wantDark;
      });
    });
  });

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

    /* Instant left-mode swap when edge == idle X so attach/detach never eases sideways */
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
        // Keep in-session expand/collapse; don't force re-dock on resize
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

  const filterBar = document.querySelector(".projects-filter-bar");
  if (!filterBar) {
    return;
  }

  const filterButtons = Array.from(filterBar.querySelectorAll(".projects-filter-btn"));
  const cards = Array.from(document.querySelectorAll(".project-card"));

  const applyFilter = (filterValue) => {
    filterButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.filter === filterValue);
    });

    cards.forEach((card) => {
      const categories = (card.dataset.categories || "").split(/\s+/).filter(Boolean);
      const showCard = filterValue === "all" || categories.includes(filterValue);
      card.classList.toggle("is-hidden", !showCard);
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter));
  });
});
