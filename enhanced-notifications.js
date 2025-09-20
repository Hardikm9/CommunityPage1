// Enhanced Notification System
class NotificationManager {
    constructor() {
        this.createToastContainer();
        this.setupNotificationPermissions();
    }

    createToastContainer() {
        if (document.getElementById('toast-container')) return;
        
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }

    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const colors = {
            success: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
            error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' },
            warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
            info: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' }
        };
        
        const color = colors[type] || colors.info;
        
        toast.style.cssText = `
            background: ${color.bg};
            border: 2px solid ${color.border};
            border-left: 4px solid ${color.border};
            color: ${color.text};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-weight: 500;
            font-size: 0.9rem;
            line-height: 1.4;
            transform: translateX(100%);
            transition: all 0.3s ease;
            pointer-events: auto;
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            position: relative;
            overflow: hidden;
        `;
        
        toast.innerHTML = `
            <span style="font-size: 1.2rem;">${icons[type]}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: none; 
                border: none; 
                color: ${color.text}; 
                font-size: 1.2rem; 
                cursor: pointer; 
                opacity: 0.7;
                padding: 0;
                margin-left: 0.5rem;
                transition: opacity 0.2s ease;
            " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">&times;</button>
        `;
        
        document.getElementById('toast-container').appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        return toast;
    }

    async setupNotificationPermissions() {
        if ('Notification' in window) {
            const permission = Notification.permission;
            
            if (permission === 'default') {
                // Show custom notification prompt
                this.showNotificationPrompt();
            }
        }
    }

    showNotificationPrompt() {
        const lastPrompt = localStorage.getItem('notificationPromptShown');
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        if (lastPrompt && parseInt(lastPrompt) > oneWeekAgo) {
            return; // Don't show again this week
        }
        
        setTimeout(() => {
            const modal = this.createNotificationModal();
            document.body.appendChild(modal);
            
            // Show with animation
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.querySelector('.notification-modal').style.transform = 'translate(-50%, -50%) scale(1)';
            }, 10);
        }, 3000);
    }

    createNotificationModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            z-index: 10001;
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div class="notification-modal" style="
                background: white;
                border-radius: 16px;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                transform: translate(-50%, -50%) scale(0.9);
                transition: transform 0.3s ease;
                position: absolute;
                top: 50%;
                left: 50%;
            ">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔔</div>
                    <h3 style="color: #1f2937; margin: 0 0 0.5rem 0; font-size: 1.3rem; font-weight: 600;">Stay Updated</h3>
                    <p style="color: #6b7280; margin: 0; line-height: 1.5; font-size: 0.95rem;">Get notified when your reports are processed or when important updates are available.</p>
                </div>
                
                <div style="display: flex; gap: 0.75rem; flex-direction: column;">
                    <button id="enableNotifications" style="
                        background: linear-gradient(135deg, #059669, #0891b2);
                        color: white;
                        border: none;
                        padding: 0.875rem 1.5rem;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-size: 0.95rem;
                    ">Enable Notifications</button>
                    
                    <button id="dismissNotifications" style="
                        background: transparent;
                        color: #6b7280;
                        border: 1px solid #d1d5db;
                        padding: 0.875rem 1.5rem;
                        border-radius: 8px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-size: 0.95rem;
                    ">Maybe Later</button>
                </div>
                
                <div style="text-align: center; margin-top: 1rem;">
                    <small style="color: #9ca3af; font-size: 0.8rem;">You can change this anytime in settings</small>
                </div>
            </div>
        `;
        
        // Add event listeners
        modal.querySelector('#enableNotifications').addEventListener('click', async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    this.showToast('🔔 Notifications enabled! You\'ll receive updates about your reports.', 'success');
                    localStorage.setItem('notificationsEnabled', 'true');
                } else {
                    this.showToast('Notifications were not enabled. You can enable them anytime in your browser settings.', 'info');
                }
            } catch (error) {
                this.showToast('Could not enable notifications. Please check your browser settings.', 'error');
            }
            localStorage.setItem('notificationPromptShown', Date.now().toString());
            modal.remove();
        });
        
        modal.querySelector('#dismissNotifications').addEventListener('click', () => {
            this.showToast('You can enable notifications anytime from the settings menu.', 'info');
            localStorage.setItem('notificationPromptShown', Date.now().toString());
            modal.remove();
        });
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                localStorage.setItem('notificationPromptShown', Date.now().toString());
            }
        });
        
        return modal;
    }

    sendNotification(title, body, options = {}) {
        const notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';
        const notificationsDisabled = localStorage.getItem('notificationsDisabled') === 'true';
        
        if (notificationsDisabled || !notificationsEnabled) {
            // Show toast instead
            this.showToast(`${title}: ${body}`, 'info');
            return;
        }
        
        if (Notification.permission === 'granted') {
            const defaultOptions = {
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23059669"/><text x="50" y="65" font-size="60" text-anchor="middle" fill="white">🌱</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23059669"/><text x="50" y="65" font-size="60" text-anchor="middle" fill="white">🌱</text></svg>',
                tag: 'community-hub',
                requireInteraction: false,
                silent: false,
                ...options
            };
            
            try {
                const notification = new Notification(title, {
                    body,
                    ...defaultOptions
                });
                
                // Auto close after 5 seconds
                setTimeout(() => {
                    notification.close();
                }, 5000);
                
                return notification;
            } catch (error) {
                console.warn('Could not send notification:', error);
                this.showToast(`${title}: ${body}`, 'info');
            }
        } else {
            // Fallback to toast
            this.showToast(`${title}: ${body}`, 'info');
        }
    }
}

// Initialize notification manager
window.notificationManager = new NotificationManager();

// Export for global use
window.showToast = (message, type, duration) => window.notificationManager.showToast(message, type, duration);
window.sendNotification = (title, body, options) => window.notificationManager.sendNotification(title, body, options);