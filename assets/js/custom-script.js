// Function to toggle dark/light mode
function toggleDarkMode() {
  const body = document.body;

  // Toggle dark-mode class on body
  body.classList.toggle("dark-mode");

  // Save the user's preference in localStorage
  const newMode = body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("theme", newMode);
}

// Check local storage to maintain the user's theme preference
window.onload = function() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    document.querySelector('.switch input').checked = true;
  } else {
    document.body.classList.remove("dark-mode");
    document.querySelector('.switch input').checked = false;
  }
};

// Add event listener to the checkbox for the theme switch
document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.querySelector(".switch input");

  if (toggleSwitch) {
    toggleSwitch.addEventListener("change", function() {
      toggleDarkMode();
    });
  }

  const landingHero = document.querySelector(".intro-header.big-img.landing-hero");
  if (landingHero) {
    const syncLandingHeroState = () => {
      landingHero.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    syncLandingHeroState();
    window.addEventListener("scroll", syncLandingHeroState, { passive: true });
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
