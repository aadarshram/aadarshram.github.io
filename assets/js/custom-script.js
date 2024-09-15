document.addEventListener("DOMContentLoaded", () => {
  const systemInitiatedDark = window.matchMedia("(prefers-color-scheme: dark)");
  const themeToggleButton = document.getElementById("theme-toggle");
  let theme = sessionStorage.getItem('theme');

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggleButton.innerHTML = theme === 'dark' ? "Light Mode" : "Dark Mode";
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
