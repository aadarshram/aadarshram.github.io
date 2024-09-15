<script>
  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    // Update button icon based on the theme
    const themeIcon = document.getElementById("theme-toggle-icon");
    themeIcon.className = newTheme === "dark" ? "fa fa-sun-o" : "fa fa-moon-o";
  };

  // Apply saved theme from localStorage or default to light
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Update button icon based on the theme
  const themeIcon = document.getElementById("theme-toggle-icon");
  themeIcon.className = savedTheme === "dark" ? "fa fa-sun-o" : "fa fa-moon-o";

  // Attach the toggle function to the button
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
</script>
