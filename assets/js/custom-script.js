document.addEventListener("DOMContentLoaded", () => {
  const systemInitiatedDark = window.matchMedia("(prefers-color-scheme: dark)");
  const themeToggleButton = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const themeText = document.getElementById("theme-text");
  let theme = sessionStorage.getItem('theme');

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      themeIcon.className = 'fa fa-sun'; // Change to sun icon for dark mode
      themeText.textContent = "Light Mode";
    } else {
      themeIcon.className = 'fa fa-moon'; // Moon icon for light mode
      themeText.textContent = "Dark Mode";
    }
  };

  const handleSystemPreference = () => {
    const preferredTheme = systemInitiatedDark.matches ? 'dark' : 'light';
    if (!theme) {
      applyTheme(preferredTheme);
      sessionStorage.setItem('theme', preferredTheme);
    } else {
      applyTheme(theme);
    }
  };

  const modeSwitcher = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    sessionStorage.setItem('theme', newTheme);
  };

  systemInitiatedDark.addEventListener('change', handleSystemPreference);
  themeToggleButton.addEventListener('click', modeSwitcher);

  handleSystemPreference(); // Apply theme based on initial preference
});
