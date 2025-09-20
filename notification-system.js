// Advanced Notification System for Community Hub
class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.settings = this.loadSettings();
    this.soundEnabled = this.settings.soundEnabled !== false;
    this.position = this.settings.position || 'top-right';
    this.maxNotifications = this.settings.maxNotifications || 5;
    this.autoHideDelay = this.settings.autoHideDelay || 5000;
    this.initialized = false;
    
    this.init();
  }
  
  init() {
    if (this.initialized) return;
    
    this.createNotificationCenter();
    this.createSoundEffects();
    this.injectStyles();
    this.setupEventListeners();
    
    this.initialized = true;
    console.log('🔔 Notification System initialized');
  }
  
  createNotificationCenter() {
    // Create notification container
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.className = `notification-container ${this.position}`;
    document.body.appendChild(this.container);
    
    // Create notification center toggle
    this.centerToggle = document.createElement('button');
    this.centerToggle.id = 'notification-center-toggle';
    this.centerToggle.className = 'notification-center-toggle';
    this.centerToggle.innerHTML = `
      <span class="notification-icon">🔔</span>
      <span class="notification-badge" style="display: none;">0</span>
    `;
    this.centerToggle.addEventListener('click', () => this.toggleNotificationCenter());
    
    // Create notification center panel
    this.centerPanel = document.createElement('div');
    this.centerPanel.id = 'notification-center';
    this.centerPanel.className = 'notification-center';
    this.centerPanel.innerHTML = `
      <div class="notification-center-header">
        <h3>📢 Notifications</h3>
        <div class="notification-center-actions">
          <button class="clear-all-btn" title="Clear all">🗑️</button>
          <button class="settings-btn" title="Settings">⚙️</button>
          <button class="close-center-btn" title="Close">✕</button>
        </div>
      </div>
      <div class="notification-center-content">
        <div class="no-notifications">
          <span class="no-notifications-icon">🔕</span>
          <p>No notifications yet</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.centerPanel);
    
    // Add event listeners
    this.centerPanel.querySelector('.clear-all-btn').addEventListener('click', () => this.clearAllNotifications());
    this.centerPanel.querySelector('.settings-btn').addEventListener('click', () => this.showSettingsModal());
    this.centerPanel.querySelector('.close-center-btn').addEventListener('click', () => this.toggleNotificationCenter());
    
    // Add toggle to header if available
    const header = document.querySelector('header .container, header .header-inner');
    if (header) {
      header.appendChild(this.centerToggle);
    } else {
      // Create floating button
      this.centerToggle.classList.add('floating-notification-toggle');
      document.body.appendChild(this.centerToggle);
    }
  }
  
  createSoundEffects() {
    this.sounds = {
      success: this.createSound('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjiR2O/If1gTRrjl6qZV'),
      error: this.createSound('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjiR2O/If1gTRrjl6qZV'),
      warning: this.createSound('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjiR2O/If1gTRrjl6qZV'),
      info: this.createSound('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaAjiR2O/If1gTRrjl6qZV')
    };
  }
  
  createSound(base64Data) {
    try {
      const audio = new Audio(base64Data);
      audio.volume = 0.3;
      return audio;
    } catch (e) {
      console.warn('Could not create notification sound:', e);
      return null;
    }
  }
  
  playSound(type = 'info') {
    if (!this.soundEnabled || !this.sounds[type]) return;
    
    try {
      this.sounds[type].currentTime = 0;
      this.sounds[type].play().catch(e => {
        console.warn('Could not play notification sound:', e);
      });
    } catch (e) {
      console.warn('Error playing notification sound:', e);
    }
  }
  
  show(options) {
    if (typeof options === 'string') {
      options = { message: options };
    }
    
    const notification = {
      id: Date.now() + Math.random(),
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      duration: options.duration || this.autoHideDelay,
      persistent: options.persistent || false,
      actions: options.actions || [],
      icon: options.icon || this.getDefaultIcon(options.type),
      timestamp: new Date(),
      ...options
    };
    
    this.notifications.unshift(notification);
    this.createToastNotification(notification);
    this.addToNotificationCenter(notification);
    this.updateBadge();
    this.playSound(notification.type);
    
    // Limit number of notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    return notification.id;
  }
  
  createToastNotification(notification) {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${notification.type}`;
    toast.setAttribute('data-notification-id', notification.id);
    
    toast.innerHTML = `
      <div class="toast-icon">${notification.icon}</div>
      <div class="toast-content">
        ${notification.title ? `<div class="toast-title">${notification.title}</div>` : ''}
        <div class="toast-message">${notification.message}</div>
        ${notification.actions.length > 0 ? `
          <div class="toast-actions">
            ${notification.actions.map(action => 
              `<button class="toast-action" data-action="${action.id}">${action.text}</button>`
            ).join('')}
          </div>
        ` : ''}
      </div>
      <button class="toast-close" title="Close">✕</button>
      ${!notification.persistent && notification.duration > 0 ? `
        <div class="toast-progress">
          <div class="toast-progress-bar" style="animation-duration: ${notification.duration}ms"></div>
        </div>
      ` : ''}
    `;
    
    // Add event listeners
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.removeToast(notification.id);
    });
    
    notification.actions.forEach(action => {
      const actionBtn = toast.querySelector(`[data-action="${action.id}"]`);
      if (actionBtn) {
        actionBtn.addEventListener('click', () => {
          action.handler && action.handler(notification);
          if (action.closeOnClick !== false) {
            this.removeToast(notification.id);
          }
        });
      }
    });
    
    // Add to container
    this.container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-hide
    if (!notification.persistent && notification.duration > 0) {
      setTimeout(() => {
        this.removeToast(notification.id);
      }, notification.duration);
    }
    
    // Limit visible toasts
    const visibleToasts = this.container.children;
    if (visibleToasts.length > this.maxNotifications) {
      for (let i = this.maxNotifications; i < visibleToasts.length; i++) {
        this.removeToast(visibleToasts[i].getAttribute('data-notification-id'));
      }
    }
  }
  
  removeToast(id) {
    const toast = this.container.querySelector(`[data-notification-id="${id}"]`);
    if (toast) {
      toast.classList.add('removing');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }
  
  addToNotificationCenter(notification) {
    const content = this.centerPanel.querySelector('.notification-center-content');
    const noNotifications = content.querySelector('.no-notifications');
    
    if (noNotifications) {
      noNotifications.style.display = 'none';
    }
    
    const item = document.createElement('div');
    item.className = `notification-item notification-${notification.type}`;
    item.setAttribute('data-notification-id', notification.id);
    
    item.innerHTML = `
      <div class="notification-item-icon">${notification.icon}</div>
      <div class="notification-item-content">
        ${notification.title ? `<div class="notification-item-title">${notification.title}</div>` : ''}
        <div class="notification-item-message">${notification.message}</div>
        <div class="notification-item-time">${this.formatTime(notification.timestamp)}</div>
      </div>
      <button class="notification-item-close" title="Remove">✕</button>
    `;
    
    item.querySelector('.notification-item-close').addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeFromCenter(notification.id);
    });
    
    content.insertBefore(item, content.firstChild);
  }
  
  removeFromCenter(id) {
    const item = this.centerPanel.querySelector(`[data-notification-id="${id}"]`);
    if (item) {
      item.classList.add('removing');
      setTimeout(() => {
        if (item.parentNode) {
          item.parentNode.removeChild(item);
        }
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.updateBadge();
        
        const content = this.centerPanel.querySelector('.notification-center-content');
        const items = content.querySelectorAll('.notification-item');
        if (items.length === 0) {
          content.querySelector('.no-notifications').style.display = 'flex';
        }
      }, 300);
    }
  }
  
  updateBadge() {
    const badge = this.centerToggle.querySelector('.notification-badge');
    const count = this.notifications.length;
    
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count.toString();
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }
  
  toggleNotificationCenter() {
    this.centerPanel.classList.toggle('show');
    
    if (this.centerPanel.classList.contains('show')) {
      // Mark all as read
      this.notifications.forEach(notification => {
        notification.read = true;
      });
      
      // Update times
      this.updateNotificationTimes();
    }
  }
  
  updateNotificationTimes() {
    const items = this.centerPanel.querySelectorAll('.notification-item');
    items.forEach((item, index) => {
      if (this.notifications[index]) {
        const timeEl = item.querySelector('.notification-item-time');
        if (timeEl) {
          timeEl.textContent = this.formatTime(this.notifications[index].timestamp);
        }
      }
    });
  }
  
  formatTime(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return timestamp.toLocaleDateString();
  }
  
  clearAllNotifications() {
    if (confirm('Clear all notifications?')) {
      this.notifications = [];
      this.updateBadge();
      
      const content = this.centerPanel.querySelector('.notification-center-content');
      const items = content.querySelectorAll('.notification-item');
      items.forEach(item => item.remove());
      
      content.querySelector('.no-notifications').style.display = 'flex';
      
      // Clear toasts
      const toasts = this.container.querySelectorAll('.toast-notification');
      toasts.forEach(toast => {
        const id = toast.getAttribute('data-notification-id');
        this.removeToast(id);
      });
      
      this.show({
        type: 'success',
        message: 'All notifications cleared',
        duration: 2000
      });
    }
  }
  
  showSettingsModal() {
    // Create settings modal
    const modal = document.createElement('div');
    modal.className = 'notification-settings-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>🔔 Notification Settings</h3>
          <button class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="setting-group">
            <label>
              <input type="checkbox" ${this.soundEnabled ? 'checked' : ''}> 
              Enable notification sounds
            </label>
          </div>
          <div class="setting-group">
            <label>Position:</label>
            <select class="position-select">
              <option value="top-right" ${this.position === 'top-right' ? 'selected' : ''}>Top Right</option>
              <option value="top-left" ${this.position === 'top-left' ? 'selected' : ''}>Top Left</option>
              <option value="bottom-right" ${this.position === 'bottom-right' ? 'selected' : ''}>Bottom Right</option>
              <option value="bottom-left" ${this.position === 'bottom-left' ? 'selected' : ''}>Bottom Left</option>
            </select>
          </div>
          <div class="setting-group">
            <label>Auto-hide delay (seconds):</label>
            <input type="range" min="1" max="10" value="${this.autoHideDelay / 1000}" class="delay-slider">
            <span class="delay-value">${this.autoHideDelay / 1000}s</span>
          </div>
          <div class="setting-group">
            <label>Max visible notifications:</label>
            <input type="range" min="1" max="10" value="${this.maxNotifications}" class="max-notifications-slider">
            <span class="max-notifications-value">${this.maxNotifications}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="save-settings-btn">Save Settings</button>
          <button class="cancel-btn">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const soundToggle = modal.querySelector('input[type="checkbox"]');
    const positionSelect = modal.querySelector('.position-select');
    const delaySlider = modal.querySelector('.delay-slider');
    const delayValue = modal.querySelector('.delay-value');
    const maxSlider = modal.querySelector('.max-notifications-slider');
    const maxValue = modal.querySelector('.max-notifications-value');
    
    delaySlider.addEventListener('input', () => {
      delayValue.textContent = `${delaySlider.value}s`;
    });
    
    maxSlider.addEventListener('input', () => {
      maxValue.textContent = maxSlider.value;
    });
    
    modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal(modal));
    modal.querySelector('.cancel-btn').addEventListener('click', () => this.closeModal(modal));
    modal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeModal(modal));
    
    modal.querySelector('.save-settings-btn').addEventListener('click', () => {
      this.soundEnabled = soundToggle.checked;
      this.position = positionSelect.value;
      this.autoHideDelay = parseInt(delaySlider.value) * 1000;
      this.maxNotifications = parseInt(maxSlider.value);
      
      this.saveSettings();
      this.updateContainerPosition();
      this.closeModal(modal);
      
      this.show({
        type: 'success',
        message: 'Settings saved successfully',
        duration: 2000
      });
    });
    
    setTimeout(() => modal.classList.add('show'), 10);
  }
  
  closeModal(modal) {
    modal.classList.add('hiding');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }
  
  updateContainerPosition() {
    this.container.className = `notification-container ${this.position}`;
  }
  
  getDefaultIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }
  
  setupEventListeners() {
    // Listen for theme changes to update styles
    window.addEventListener('themeChanged', () => {
      this.updateNotificationColors();
    });
    
    // Close notification center when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.centerPanel.contains(e.target) && !this.centerToggle.contains(e.target)) {
        this.centerPanel.classList.remove('show');
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        this.toggleNotificationCenter();
      }
    });
  }
  
  updateNotificationColors() {
    // Colors will be updated via CSS custom properties automatically
    console.log('🎨 Notification colors updated for theme');
  }
  
  saveSettings() {
    const settings = {
      soundEnabled: this.soundEnabled,
      position: this.position,
      autoHideDelay: this.autoHideDelay,
      maxNotifications: this.maxNotifications
    };
    
    try {
      localStorage.setItem('community-hub-notifications', JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save notification settings:', e);
    }
  }
  
  loadSettings() {
    try {
      const stored = localStorage.getItem('community-hub-notifications');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn('Could not load notification settings:', e);
      return {};
    }
  }
  
  injectStyles() {
    const styles = `
      <style id="notification-system-styles">
        .notification-container {
          position: fixed;
          z-index: 10000;
          max-width: 400px;
          width: 90%;
          pointer-events: none;
        }
        
        .notification-container.top-right {
          top: 1rem;
          right: 1rem;
        }
        
        .notification-container.top-left {
          top: 1rem;
          left: 1rem;
        }
        
        .notification-container.bottom-right {
          bottom: 1rem;
          right: 1rem;
        }
        
        .notification-container.bottom-left {
          bottom: 1rem;
          left: 1rem;
        }
        
        .toast-notification {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius, 12px);
          box-shadow: var(--shadow-xl);
          margin-bottom: 0.75rem;
          padding: 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.3s ease;
          pointer-events: auto;
          position: relative;
          overflow: hidden;
        }
        
        .notification-container.top-left .toast-notification,
        .notification-container.bottom-left .toast-notification {
          transform: translateX(-100%);
        }
        
        .toast-notification.show {
          opacity: 1;
          transform: translateX(0);
        }
        
        .toast-notification.removing {
          opacity: 0;
          transform: scale(0.8);
          margin-bottom: 0;
          padding-top: 0;
          padding-bottom: 0;
        }
        
        .toast-success {
          border-left: 4px solid #10b981;
        }
        
        .toast-error {
          border-left: 4px solid #ef4444;
        }
        
        .toast-warning {
          border-left: 4px solid #f59e0b;
        }
        
        .toast-info {
          border-left: 4px solid #3b82f6;
        }
        
        .toast-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        
        .toast-content {
          flex: 1;
          min-width: 0;
        }
        
        .toast-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        
        .toast-message {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        
        .toast-actions {
          margin-top: 0.75rem;
          display: flex;
          gap: 0.5rem;
        }
        
        .toast-action {
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .toast-action:hover {
          background: var(--primary-dark);
        }
        
        .toast-close {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          font-size: 1rem;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        
        .toast-close:hover {
          background: var(--surface-dark);
          color: var(--text-secondary);
        }
        
        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--border-light);
        }
        
        .toast-progress-bar {
          height: 100%;
          background: var(--primary);
          animation: toast-progress linear forwards;
        }
        
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .notification-center-toggle {
          background: var(--surface-dark);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 0.75rem 1rem;
          border-radius: var(--radius, 8px);
          font-family: inherit;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
        }
        
        .notification-center-toggle:hover {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        
        .floating-notification-toggle {
          position: fixed;
          bottom: 8rem;
          right: 2rem;
          z-index: 1000;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          padding: 0;
          box-shadow: var(--shadow-xl);
        }
        
        .notification-icon {
          font-size: 1.1rem;
        }
        
        .notification-badge {
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          position: absolute;
          top: -6px;
          right: -6px;
        }
        
        .notification-center {
          position: fixed;
          top: 0;
          right: -400px;
          width: 400px;
          height: 100vh;
          background: var(--surface);
          border-left: 1px solid var(--border);
          box-shadow: var(--shadow-xl);
          z-index: 10001;
          transition: right 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        
        .notification-center.show {
          right: 0;
        }
        
        .notification-center-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .notification-center-header h3 {
          margin: 0;
          font-size: 1.125rem;
          color: var(--text-primary);
        }
        
        .notification-center-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .notification-center-actions button {
          background: var(--surface-dark);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          border-radius: 6px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .notification-center-actions button:hover {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        
        .notification-center-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }
        
        .no-notifications {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--text-light);
          text-align: center;
        }
        
        .no-notifications-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        .notification-item {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: var(--radius, 8px);
          margin-bottom: 0.5rem;
          background: var(--surface-dark);
          border: 1px solid var(--border-light);
          transition: all 0.2s;
          position: relative;
        }
        
        .notification-item:hover {
          background: var(--surface-darker);
          transform: translateX(4px);
        }
        
        .notification-item.removing {
          opacity: 0;
          transform: translateX(100%);
          margin-bottom: 0;
          padding-top: 0;
          padding-bottom: 0;
        }
        
        .notification-item-icon {
          font-size: 1.125rem;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }
        
        .notification-item-content {
          flex: 1;
          min-width: 0;
        }
        
        .notification-item-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        
        .notification-item-message {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }
        
        .notification-item-time {
          font-size: 0.75rem;
          color: var(--text-light);
        }
        
        .notification-item-close {
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          font-size: 0.875rem;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        
        .notification-item-close:hover {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .notification-settings-modal {
          position: fixed;
          inset: 0;
          z-index: 10002;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .notification-settings-modal.show {
          opacity: 1;
          visibility: visible;
        }
        
        .notification-settings-modal.hiding {
          opacity: 0;
        }
        
        .modal-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }
        
        .modal-content {
          background: var(--surface);
          border-radius: var(--radius-lg, 16px);
          box-shadow: var(--shadow-xl);
          width: 90%;
          max-width: 500px;
          position: relative;
          z-index: 1;
        }
        
        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .modal-header h3 {
          margin: 0;
          color: var(--text-primary);
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          color: var(--text-light);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .modal-close:hover {
          background: var(--surface-dark);
          color: var(--text-secondary);
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .setting-group {
          margin-bottom: 1.5rem;
        }
        
        .setting-group label {
          display: block;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        
        .setting-group input[type="checkbox"] {
          margin-right: 0.5rem;
        }
        
        .setting-group select,
        .setting-group input[type="range"] {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: var(--radius, 8px);
          background: var(--surface);
          color: var(--text-primary);
          font-family: inherit;
        }
        
        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border);
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        
        .modal-footer button {
          padding: 0.75rem 1.5rem;
          border: 1px solid var(--border);
          border-radius: var(--radius, 8px);
          font-family: inherit;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .save-settings-btn {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        
        .save-settings-btn:hover {
          background: var(--primary-dark);
        }
        
        .cancel-btn {
          background: var(--surface-dark);
          color: var(--text-secondary);
        }
        
        .cancel-btn:hover {
          background: var(--surface-darker);
          color: var(--text-primary);
        }
        
        @media (max-width: 768px) {
          .notification-center {
            width: 100%;
            right: -100%;
          }
          
          .notification-container {
            max-width: calc(100% - 2rem);
          }
          
          .modal-content {
            margin: 1rem;
            width: calc(100% - 2rem);
          }
        }
      </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
  }
  
  // Public API methods
  success(message, options = {}) {
    return this.show({ ...options, type: 'success', message });
  }
  
  error(message, options = {}) {
    return this.show({ ...options, type: 'error', message });
  }
  
  warning(message, options = {}) {
    return this.show({ ...options, type: 'warning', message });
  }
  
  info(message, options = {}) {
    return this.show({ ...options, type: 'info', message });
  }
  
  remove(id) {
    this.removeToast(id);
    this.removeFromCenter(id);
  }
  
  clear() {
    this.clearAllNotifications();
  }
  
  // Progress notification
  showProgress(message, progress = 0) {
    const id = this.show({
      type: 'info',
      message: `${message} (${progress}%)`,
      persistent: true,
      icon: '⏳'
    });
    
    return {
      update: (newProgress) => {
        const toast = this.container.querySelector(`[data-notification-id="${id}"]`);
        if (toast) {
          const messageEl = toast.querySelector('.toast-message');
          if (messageEl) {
            messageEl.textContent = `${message} (${newProgress}%)`;
          }
        }
      },
      complete: () => {
        this.remove(id);
        this.success(`${message} completed!`);
      }
    };
  }
}

// Initialize notification system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.notifications = new NotificationSystem();
  });
} else {
  window.notifications = new NotificationSystem();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationSystem;
}