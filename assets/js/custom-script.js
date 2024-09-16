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

  toggleSwitch.addEventListener("change", function() {
    toggleDarkMode();
  });
});
