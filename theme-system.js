// Advanced Theme System for Community Hub
class ThemeSystem {
  constructor() {
    this.themes = {
      light: {
        name: 'Light',
        icon: '☀️',
        colors: {
          '--primary': '#22c55e',
          '--primary-light': '#4ade80',
          '--primary-dark': '#15803d',
          '--accent': '#3b82f6',
          '--accent-light': '#60a5fa',
          '--surface': '#ffffff',
          '--surface-dark': '#f8fafc',
          '--surface-darker': '#f1f5f9',
          '--text-primary': '#1f2937',
          '--text-secondary': '#6b7280',
          '--text-light': '#9ca3af',
          '--border': '#e5e7eb',
          '--border-light': '#f3f4f6',
          '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          '--shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
        }
      },
      dark: {
        name: 'Dark',
        icon: '🌙',
        colors: {
          '--primary': '#4ade80',
          '--primary-light': '#86efac',
          '--primary-dark': '#22c55e',
          '--accent': '#60a5fa',
          '--accent-light': '#93c5fd',
          '--surface': '#1f2937',
          '--surface-dark': '#111827',
          '--surface-darker': '#0f172a',
          '--text-primary': '#f9fafb',
          '--text-secondary': '#d1d5db',
          '--text-light': '#9ca3af',
          '--border': '#374151',
          '--border-light': '#4b5563',
          '--shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.2)',
          '--shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
          '--shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
          '--shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)'
        }
      },
      auto: {
        name: 'Auto',
        icon: '🌗',
        colors: {} // Will use system preference
      }
    };
    
    this.currentTheme = this.getStoredTheme() || 'auto';
    this.systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.init();
  }
  
  init() {
    this.createThemeToggle();
    this.applyTheme(this.currentTheme);
    this.setupMediaQueryListener();
    this.setupKeyboardShortcuts();
  }
  
  createThemeToggle() {
    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.id = 'themeToggle';
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle theme');
    themeToggle.innerHTML = `
      <span class="theme-icon">${this.getThemeIcon(this.currentTheme)}</span>
      <span class="theme-text">${this.getThemeName(this.currentTheme)}</span>
    `;
    
    // Add click event
    themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // Add to header or create floating button
    const header = document.querySelector('header .container, header .header-inner');
    if (header) {
      header.appendChild(themeToggle);
    } else {
      // Create floating toggle button
      themeToggle.classList.add('floating-theme-toggle');
      document.body.appendChild(themeToggle);
    }
    
    // Add CSS styles
    this.injectThemeToggleStyles();
  }
  
  injectThemeToggleStyles() {
    const styles = `
      <style id="theme-toggle-styles">
        .theme-toggle {
          background: var(--surface-dark);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 0.75rem 1rem;
          border-radius: var(--radius, 8px);
          font-family: inherit;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
        }
        
        .theme-toggle:hover {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        
        .theme-toggle:active {
          transform: translateY(0);
        }
        
        .theme-toggle::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: radial-gradient(circle, var(--primary-light) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.3s ease;
          opacity: 0;
        }
        
        .theme-toggle:hover::before {
          width: 100px;
          height: 100px;
          opacity: 0.1;
        }
        
        .theme-icon {
          font-size: 1.1rem;
          transition: transform 0.3s ease;
        }
        
        .theme-toggle:hover .theme-icon {
          transform: scale(1.1) rotate(15deg);
        }
        
        .floating-theme-toggle {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          padding: 0;
          box-shadow: var(--shadow-xl);
        }
        
        .floating-theme-toggle .theme-text {
          display: none;
        }
        
        .floating-theme-toggle .theme-icon {
          font-size: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .theme-toggle .theme-text {
            display: none;
          }
          
          .theme-toggle {
            padding: 0.75rem;
            min-width: 44px;
            justify-content: center;
          }
        }
        
        /* Theme transition animation */
        .theme-transition {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
        }
        
        /* Dark theme specific adjustments */
        [data-theme="dark"] {
          color-scheme: dark;
        }
        
        [data-theme="dark"] body {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        }
        
        [data-theme="dark"] .card {
          background: var(--surface) !important;
        }
        
        /* Auto theme indicator */
        .theme-toggle[data-theme="auto"]::after {
          content: '🔄';
          position: absolute;
          top: -2px;
          right: -2px;
          font-size: 0.7rem;
          background: var(--primary);
          color: white;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: scale(0);
          transition: transform 0.2s ease;
        }
        
        .theme-toggle[data-theme="auto"]:hover::after {
          transform: scale(1);
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }
  
  toggleTheme() {
    const themes = Object.keys(this.themes);
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const newTheme = themes[nextIndex];
    
    this.setTheme(newTheme);
    
    // Add visual feedback
    this.showThemeChangeNotification(newTheme);
  }
  
  setTheme(theme) {
    this.currentTheme = theme;
    this.storeTheme(theme);
    this.applyTheme(theme);
    this.updateToggleButton();
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme, colors: this.getEffectiveColors(theme) }
    }));
  }
  
  applyTheme(theme) {
    const colors = this.getEffectiveColors(theme);
    const root = document.documentElement;
    
    // Add transition class
    document.body.classList.add('theme-transition');
    
    // Set theme attribute
    root.setAttribute('data-theme', theme);
    
    // Apply colors
    Object.entries(colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Remove transition class after animation
    setTimeout(() => {
      document.body.classList.remove('theme-transition');
    }, 300);
  }
  
  getEffectiveColors(theme) {
    if (theme === 'auto') {
      return this.systemPrefersDark ? this.themes.dark.colors : this.themes.light.colors;
    }
    return this.themes[theme].colors;
  }
  
  getThemeIcon(theme) {
    if (theme === 'auto') {
      return this.systemPrefersDark ? this.themes.dark.icon : this.themes.light.icon;
    }
    return this.themes[theme].icon;
  }
  
  getThemeName(theme) {
    return this.themes[theme].name;
  }
  
  updateToggleButton() {
    const toggleButton = document.getElementById('themeToggle');
    if (toggleButton) {
      const icon = toggleButton.querySelector('.theme-icon');
      const text = toggleButton.querySelector('.theme-text');
      
      if (icon) icon.textContent = this.getThemeIcon(this.currentTheme);
      if (text) text.textContent = this.getThemeName(this.currentTheme);
      
      toggleButton.setAttribute('data-theme', this.currentTheme);
      toggleButton.setAttribute('aria-label', `Current theme: ${this.getThemeName(this.currentTheme)}. Click to change.`);
    }
  }
  
  setupMediaQueryListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      this.systemPrefersDark = e.matches;
      if (this.currentTheme === 'auto') {
        this.applyTheme('auto');
        this.updateToggleButton();
      }
    });
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + T to toggle theme
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }
  
  showThemeChangeNotification(theme) {
    const notification = document.createElement('div');
    notification.className = 'theme-notification';
    notification.innerHTML = `
      <span class="theme-notification-icon">${this.getThemeIcon(theme)}</span>
      <span class="theme-notification-text">Switched to ${this.getThemeName(theme)} theme</span>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius, 8px);
      padding: 1rem 1.5rem;
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      font-family: inherit;
      font-weight: 500;
      color: var(--text-primary);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }
  
  storeTheme(theme) {
    try {
      localStorage.setItem('community-hub-theme', theme);
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }
  }
  
  getStoredTheme() {
    try {
      return localStorage.getItem('community-hub-theme');
    } catch (e) {
      console.warn('Could not load theme preference:', e);
      return null;
    }
  }
  
  // Public API methods
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  getAvailableThemes() {
    return Object.keys(this.themes);
  }
  
  isSystemDark() {
    return this.systemPrefersDark;
  }
  
  // Export current theme colors (useful for external libraries)
  exportColors() {
    return this.getEffectiveColors(this.currentTheme);
  }
}

// Initialize theme system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeSystem = new ThemeSystem();
  });
} else {
  window.themeSystem = new ThemeSystem();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeSystem;
}