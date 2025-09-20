// theme.js - Manual dark mode toggle and theme persistence
(function () {
  const KEY = 'ceh_theme';
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  function applyTheme(theme) {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    const icon = document.getElementById('themeIcon');
    const label = document.getElementById('themeLabel');
    if (icon && label) {
      if (theme === 'dark') {
        icon.textContent = '🌞';
        label.textContent = 'Light';
      } else {
        icon.textContent = '🌙';
        label.textContent = 'Dark';
      }
    }
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(KEY);
    } catch (_) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(KEY, theme);
    } catch (_) {
      // ignore storage errors
    }
  }

  function init() {
    const saved = getSavedTheme();
    const initial = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(initial);

    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        saveTheme(next);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
