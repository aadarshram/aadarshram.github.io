// Function to toggle dark/light mode
function toggleDarkMode() {
  const body = document.body;
  const currentMode = body.classList.contains("dark-mode") ? "dark" : "light";

  // Toggle dark-mode class on body
  body.classList.toggle("dark-mode");

  // Update the icons (sun/moon)
  const slider = document.querySelector(".slider:before");
  const isChecked = document.querySelector(".switch input").checked;

  if (isChecked) {
    slider.style.content = "\f186"; // Font Awesome sun
  } else {
    slider.style.content = "\f185"; // Font Awesome moon
  }

  // Save the user's preference in localStorage
  const newMode = currentMode === "light" ? "dark" : "light";
  localStorage.setItem("theme", newMode);
}

// Check local storage to maintain the user's theme preference
window.onload = function() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    document.querySelector('.switch input').checked = true;
    document.querySelector(".slider:before").style.content = "\f186"; // Sun icon
  } else {
    document.body.classList.remove("dark-mode");
    document.querySelector('.switch input').checked = false;
    document.querySelector(".slider:before").style.content = "\f185"; // Moon icon
  }
};

// Add event listener to the checkbox for the theme switch
document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.querySelector(".switch input");

  toggleSwitch.addEventListener("change", function() {
    toggleDarkMode();
  });
});
