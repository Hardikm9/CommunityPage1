/**
 * Global Enhancements - Modern Loading States and Micro-interactions
 * Enhances user experience across all pages with consistent interactions
 */

// Global state
window.globalEnhancements = {
  initialized: false,
  loadingElements: new Set(),
  observers: new Map()
};

// Initialize enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  if (window.globalEnhancements.initialized) return;
  
  initializeGlobalEnhancements();
  window.globalEnhancements.initialized = true;
});

function initializeGlobalEnhancements() {
  setupLoadingStates();
  setupMicroInteractions();
  setupAccessibilityEnhancements();
  setupPerformanceOptimizations();
}

/**
 * Modern Loading States
 */
function setupLoadingStates() {
  // Enhanced button loading states
  document.addEventListener('click', function(e) {
    const button = e.target.closest('button[type="submit"], .btn-primary, .action-btn');
    if (button && !button.disabled && !button.classList.contains('loading')) {
      const form = button.closest('form');
      if (form && form.checkValidity && form.checkValidity()) {
        addLoadingState(button);
      }
    }
  });
  
  // Form submission loading overlay
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.tagName === 'FORM') {
      addFormLoadingOverlay(form);
    }
  });
  
  // Link loading states
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href]:not([href^="#"]):not([href^="mailto"]):not([href^="tel"])');
    if (link && !e.ctrlKey && !e.metaKey) {
      addLinkLoadingState(link);
    }
  });
}

function addLoadingState(element) {
  if (window.globalEnhancements.loadingElements.has(element)) return;
  
  window.globalEnhancements.loadingElements.add(element);
  
  const originalText = element.innerHTML;
  const loadingText = element.dataset.loadingText || 'Loading...';
  
  element.classList.add('loading');
  element.disabled = true;
  element.innerHTML = `<span class="loading-spinner"></span> ${loadingText}`;
  
  // Store original state
  element.dataset.originalText = originalText;
  
  // Auto-remove after 10 seconds (fallback)
  setTimeout(() => {
    removeLoadingState(element);
  }, 10000);
}

function removeLoadingState(element) {
  if (!window.globalEnhancements.loadingElements.has(element)) return;
  
  window.globalEnhancements.loadingElements.delete(element);
  
  element.classList.remove('loading');
  element.disabled = false;
  element.innerHTML = element.dataset.originalText || element.innerHTML;
  
  delete element.dataset.originalText;
}

function addFormLoadingOverlay(form) {
  // Remove existing overlay
  const existingOverlay = form.querySelector('.form-loading-overlay');
  if (existingOverlay) existingOverlay.remove();
  
  // Create loading overlay
  const overlay = document.createElement('div');
  overlay.className = 'form-loading-overlay';
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner large"></div>
      <p>Processing your request...</p>
    </div>
  `;
  
  form.style.position = 'relative';
  form.appendChild(overlay);
  
  // Remove overlay after 15 seconds (fallback)
  setTimeout(() => {
    overlay.remove();
  }, 15000);
}

function addLinkLoadingState(link) {
  const spinner = document.createElement('span');
  spinner.className = 'loading-spinner small';
  spinner.style.marginLeft = '0.5rem';
  
  link.appendChild(spinner);
  link.style.pointerEvents = 'none';
  
  // Remove after 3 seconds (fallback)
  setTimeout(() => {
    spinner.remove();
    link.style.pointerEvents = '';
  }, 3000);
}

/**
 * Micro-interactions
 */
function setupMicroInteractions() {
  // Button press effects
  document.addEventListener('mousedown', function(e) {
    const button = e.target.closest('button, .btn, .card, .action-btn');
    if (button && !button.disabled) {
      button.classList.add('pressed');
      
      setTimeout(() => {
        button.classList.remove('pressed');
      }, 150);
    }
  });
  
  // Hover effects with delay
  let hoverTimeout;
  document.addEventListener('mouseover', function(e) {
    const hoverable = e.target.closest('.card, .problem-item, .resolution-item, .stat-card');
    if (hoverable) {
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        hoverable.classList.add('hovered');
      }, 100);
    }
  });
  
  document.addEventListener('mouseout', function(e) {
    const hoverable = e.target.closest('.card, .problem-item, .resolution-item, .stat-card');
    if (hoverable) {
      clearTimeout(hoverTimeout);
      hoverable.classList.remove('hovered');
    }
  });
  
  // Input focus enhancements
  document.addEventListener('focus', function(e) {
    if (e.target.matches('input, textarea, select')) {
      e.target.closest('.form-group')?.classList.add('focused');
      
      // Add floating label effect
      const label = e.target.closest('.form-group')?.querySelector('label');
      if (label) {
        label.classList.add('floating');
      }
    }
  }, true);
  
  document.addEventListener('blur', function(e) {
    if (e.target.matches('input, textarea, select')) {
      e.target.closest('.form-group')?.classList.remove('focused');
      
      // Remove floating label if no value
      if (!e.target.value) {
        const label = e.target.closest('.form-group')?.querySelector('label');
        if (label) {
          label.classList.remove('floating');
        }
      }
    }
  }, true);
  
  // Smooth scrolling for internal links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href^="#"]');
    if (link && link.getAttribute('href') !== '#') {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
}

/**
 * Accessibility Enhancements
 */
function setupAccessibilityEnhancements() {
  // Keyboard navigation improvements
  document.addEventListener('keydown', function(e) {
    // Enhanced Tab navigation
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
    
    // Escape key handling
    if (e.key === 'Escape') {
      // Close modals
      const modal = document.querySelector('.modal.show, .nav-overlay.show');
      if (modal) {
        modal.classList.remove('show');
      }
      
      // Remove focus from current element if it's a button
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') {
        document.activeElement.blur();
      }
    }
    
    // Enter key for button-like elements
    if (e.key === 'Enter') {
      const clickable = e.target.closest('.card, .clickable');
      if (clickable && clickable.tagName !== 'BUTTON' && clickable.tagName !== 'A') {
        clickable.click();
      }
    }
  });
  
  // Mouse usage detection
  document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
  });
  
  // Screen reader announcements
  window.announceToScreenReader = function(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };
  
  // Skip link functionality
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.focus();
        target.scrollIntoView();
      }
    });
  }
}

/**
 * Performance Optimizations
 */
function setupPerformanceOptimizations() {
  // Intersection Observer for animations
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        animationObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '50px'
  });
  
  // Observe elements that should animate in
  document.querySelectorAll('.card, .problem-item, .resolution-item, .stat-card').forEach(el => {
    el.classList.add('animate-ready');
    animationObserver.observe(el);
  });
  
  // Lazy loading for images
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
          imageObserver.unobserve(img);
        }
      }
    });
  });
  
  // Observe lazy images
  document.querySelectorAll('img[data-src]').forEach(img => {
    img.classList.add('lazy-loading');
    imageObserver.observe(img);
  });
  
  // Debounced resize handler
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Trigger custom resize event for components
      window.dispatchEvent(new Event('debouncedResize'));
    }, 250);
  });
  
  // Preload critical resources
  preloadCriticalResources();
}

function preloadCriticalResources() {
  // Preload next likely page
  const currentPage = window.location.pathname;
  let nextPage = '';
  
  if (currentPage.includes('Index.html') || currentPage === '/') {
    nextPage = 'request.html';
  } else if (currentPage.includes('request.html')) {
    nextPage = 'listed.html';
  } else if (currentPage.includes('listed.html')) {
    nextPage = 'progress.html';
  }
  
  if (nextPage) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = nextPage;
    document.head.appendChild(link);
  }
}

/**
 * Utility Functions
 */
window.showToastNotification = function(message, type = 'info', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Close">&times;</button>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Show toast
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  // Auto-hide
  const hideTimer = setTimeout(() => {
    hideToast(toast);
  }, duration);
  
  // Manual close
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(hideTimer);
    hideToast(toast);
  });
  
  function hideToast(toastElement) {
    toastElement.classList.remove('show');
    setTimeout(() => {
      if (toastElement.parentNode) {
        toastElement.parentNode.removeChild(toastElement);
      }
    }, 300);
  }
};

// Global error handler
window.addEventListener('error', function(e) {
  console.error('Global error:', e.error);
  // Could send to error tracking service here
});

window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled promise rejection:', e.reason);
  // Could send to error tracking service here
});

// Expose global utilities
window.globalUtils = {
  addLoadingState,
  removeLoadingState,
  showToastNotification,
  announceToScreenReader: window.announceToScreenReader
};

console.log('🚀 Global enhancements initialized');