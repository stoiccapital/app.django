// Navbar Component JavaScript

class Navbar {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.notificationBtn = document.getElementById('notificationBtn');
        this.profileBtn = document.getElementById('profileBtn');
        
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

        // Profile button event
        if (this.profileBtn) {
            this.profileBtn.addEventListener('click', () => this.handleProfileClick());
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

    handleProfileClick() {
        console.log('Profile clicked');
        
        // Emit custom event for profile click
        this.emitProfileClick();
        
        // Show profile panel
        this.showProfilePanel();
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
                        <p>Keine neuen Benachrichtigungen</p>
                        <span class="notification-time">Alle auf dem neuesten Stand</span>
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

    emitProfileClick() {
        // Create and dispatch custom event
        const event = new CustomEvent('profileClick', {
            detail: { timestamp: new Date() }
        });
        document.dispatchEvent(event);
    }

    showProfilePanel() {
        // Create profile panel if it doesn't exist
        let profilePanel = document.getElementById('profilePanel');
        
        if (!profilePanel) {
            profilePanel = document.createElement('div');
            profilePanel.id = 'profilePanel';
            profilePanel.className = 'profile-panel';
            profilePanel.innerHTML = `
                <div class="profile-header">
                    <div class="profile-info">
                        <div class="profile-avatar-large">
                            <span class="profile-initials-large">JD</span>
                        </div>
                        <div class="profile-details">
                            <h3>Dr. John Doe</h3>
                            <p>Veterinär</p>
                        </div>
                    </div>
                    <button class="close-profile" id="closeProfile">×</button>
                </div>
                <div class="profile-content">
                    <div class="profile-menu-item" id="profileSettings">
                        <span class="menu-icon">⚙️</span>
                        <span>Einstellungen</span>
                    </div>
                    <div class="profile-menu-item" id="profileHelp">
                        <span class="menu-icon">❓</span>
                        <span>Hilfe</span>
                    </div>
                    <div class="profile-menu-item" id="profileLogout">
                        <span class="menu-icon">🚪</span>
                        <span>Abmelden</span>
                    </div>
                </div>
            `;
            document.body.appendChild(profilePanel);
            
            // Add close button event
            const closeBtn = profilePanel.querySelector('#closeProfile');
            closeBtn.addEventListener('click', () => this.hideProfilePanel());
            
            // Add menu item events
            const settingsBtn = profilePanel.querySelector('#profileSettings');
            const helpBtn = profilePanel.querySelector('#profileHelp');
            const logoutBtn = profilePanel.querySelector('#profileLogout');
            
            settingsBtn.addEventListener('click', () => this.handleProfileSettings());
            helpBtn.addEventListener('click', () => this.handleProfileHelp());
            logoutBtn.addEventListener('click', () => this.handleProfileLogout());
        }
        
        // Show panel
        profilePanel.classList.add('active');
        
        // Add overlay
        this.createProfileOverlay();
    }

    hideProfilePanel() {
        const profilePanel = document.getElementById('profilePanel');
        const overlay = document.getElementById('profileOverlay');
        
        if (profilePanel) {
            profilePanel.classList.remove('active');
        }
        
        if (overlay) {
            overlay.remove();
        }
    }

    createProfileOverlay() {
        // Remove existing overlay
        const existingOverlay = document.getElementById('profileOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Create new overlay
        const overlay = document.createElement('div');
        overlay.id = 'profileOverlay';
        overlay.className = 'profile-overlay';
        document.body.appendChild(overlay);
        
        // Add click event to close
        overlay.addEventListener('click', () => this.hideProfilePanel());
    }

    handleProfileSettings() {
        console.log('Profile settings clicked');
        this.hideProfilePanel();
        // Navigate to settings page
        window.location.href = 'einstellungen/einstellungen.html';
    }

    handleProfileHelp() {
        console.log('Profile help clicked');
        this.hideProfilePanel();
        // Add help functionality here
    }

    async handleProfileLogout() {
        console.log('Profile logout clicked');
        this.hideProfilePanel();
        
        // Check if authManager is available
        if (window.authManager) {
            try {
                // Use authManager to sign out properly
                await window.authManager.signOut();
                // User will be redirected to login by signOut()
            } catch (error) {
                console.error('Logout error:', error);
                // Fallback to direct redirect if auth fails
                window.location.href = '../login/login.html';
            }
        } else {
            // Fallback if authManager is not available
            console.warn('AuthManager not available, using fallback logout');
            window.location.href = '../login/login.html';
        }
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

// Example: Listen for profile clicks
document.addEventListener('profileClick', (e) => {
    console.log('Profile clicked at:', e.detail.timestamp);
});

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navbar;
} 