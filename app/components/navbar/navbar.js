// Navbar Component JavaScript

class Navbar {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.notificationBtn = document.getElementById('notificationBtn');
        
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Notification button event
        if (this.notificationBtn) {
            this.notificationBtn.addEventListener('click', () => this.handleNotificationClick());
        }

        // Fahrly link event
        const fahrlyLink = document.getElementById('fahrlyLink');
        if (fahrlyLink) {
            fahrlyLink.addEventListener('click', (e) => this.handleFahrlyClick(e));
        }

        // Handle scroll for navbar effects
        window.addEventListener('scroll', () => this.handleScroll());
    }

    handleNotificationClick() {
        console.log('Notifications clicked');
        
        // Emit custom event for notification click
        this.emitNotificationClick();
        
        // You can add notification panel logic here
        this.showNotificationPanel();
    }

    handleFahrlyClick(e) {
        e.preventDefault();
        
        // Determine the correct path based on current location
        const currentPath = window.location.pathname;
        let targetPath = 'index.html';
        
        if (currentPath.includes('/fahrer/')) {
            targetPath = '../../index.html';
        } else if (currentPath.includes('/fahrzeuge/')) {
            targetPath = '../../index.html';
        } else if (currentPath.includes('/fahrtenarchiv/')) {
            targetPath = '../../index.html';
        } else if (currentPath.includes('/finanzen/')) {
            targetPath = '../../index.html';
        } else if (currentPath.includes('/werkzeuge/')) {
            targetPath = '../../index.html';
        } else if (currentPath.includes('/einstellungen/')) {
            targetPath = '../../index.html';
        }
        
        // Navigate to the correct path
        window.location.href = targetPath;
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow effect on scroll
        if (scrollTop > 10) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    showNotificationPanel() {
        // Create notification panel if it doesn't exist
        let notificationPanel = document.getElementById('notificationPanel');
        
        if (!notificationPanel) {
            notificationPanel = document.createElement('div');
            notificationPanel.id = 'notificationPanel';
            notificationPanel.className = 'notification-panel';
            notificationPanel.innerHTML = `
                <div class="notification-header">
                    <h3>Benachrichtigungen</h3>
                    <button class="close-notifications" id="closeNotifications">×</button>
                </div>
                <div class="notification-content">
                    <div class="notification-item">
                        <p>Neue Fahrzeugregistrierung verfügbar</p>
                        <span class="notification-time">vor 5 Minuten</span>
                    </div>
                    <div class="notification-item">
                        <p>Fahrer John Doe hat seinen Status aktualisiert</p>
                        <span class="notification-time">vor 15 Minuten</span>
                    </div>
                    <div class="notification-item">
                        <p>Neue Wartung für Fahrzeug #1234 geplant</p>
                        <span class="notification-time">vor 1 Stunde</span>
                    </div>
                </div>
            `;
            document.body.appendChild(notificationPanel);
            
            // Add close button event
            const closeBtn = notificationPanel.querySelector('#closeNotifications');
            closeBtn.addEventListener('click', () => this.hideNotificationPanel());
        }
        
        // Show panel
        notificationPanel.classList.add('active');
        
        // Add overlay
        this.createNotificationOverlay();
    }

    hideNotificationPanel() {
        const notificationPanel = document.getElementById('notificationPanel');
        const overlay = document.getElementById('notificationOverlay');
        
        if (notificationPanel) {
            notificationPanel.classList.remove('active');
        }
        
        if (overlay) {
            overlay.remove();
        }
    }

    createNotificationOverlay() {
        // Remove existing overlay
        const existingOverlay = document.getElementById('notificationOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Create new overlay
        const overlay = document.createElement('div');
        overlay.id = 'notificationOverlay';
        overlay.className = 'notification-overlay';
        document.body.appendChild(overlay);
        
        // Add click event to close
        overlay.addEventListener('click', () => this.hideNotificationPanel());
    }

    emitNotificationClick() {
        // Create and dispatch custom event
        const event = new CustomEvent('notificationClick', {
            detail: { timestamp: new Date() }
        });
        document.dispatchEvent(event);
    }

    // Public methods for external use
    show() {
        this.navbar.style.display = 'flex';
    }

    hide() {
        this.navbar.style.display = 'none';
    }

    isVisible() {
        return this.navbar.style.display !== 'none';
    }
}

// Make Navbar class globally available
window.Navbar = Navbar;

// Example: Listen for notification clicks
document.addEventListener('notificationClick', (e) => {
    console.log('Notification clicked at:', e.detail.timestamp);
});

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navbar;
} 