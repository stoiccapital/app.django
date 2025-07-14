// Sidebar Component JavaScript

class Sidebar {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.hamburgerMenu = document.getElementById('hamburgerMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.overlay = null;
        
        console.log('Sidebar constructor called');
        console.log('Sidebar element:', this.sidebar);
        console.log('Hamburger menu element:', this.hamburgerMenu);
        
        // Debug hamburger menu
        if (this.hamburgerMenu) {
            console.log('Hamburger menu found');
        } else {
            console.error('Hamburger menu not found!');
        }
        
        this.init();
    }

    init() {
        this.createOverlay();
        this.updateNavigationPaths();
        this.bindEvents();
        this.setActivePage();
        this.handleResize();
    }

    updateNavigationPaths() {
        // Get current page path to determine the correct relative paths
        const currentPath = window.location.pathname;
        const isInSubdirectory = currentPath.includes('/app/');
        
        // Determine which subdirectory we're in
        let currentSubdirectory = '';
        if (currentPath.includes('/patienten/')) {
            currentSubdirectory = 'patienten';
        } else if (currentPath.includes('/termine/')) {
            currentSubdirectory = 'termine';
        } else if (currentPath.includes('/mitarbeiter/')) {
            currentSubdirectory = 'mitarbeiter';
        } else if (currentPath.includes('/finanzen/')) {
            currentSubdirectory = 'finanzen';
        } else if (currentPath.includes('/einstellungen/')) {
            currentSubdirectory = 'einstellungen';
        }
        
        // Define the base paths for different pages based on current location
        const paths = {
            dashboard: isInSubdirectory ? '../../index.html' : 'index.html',
            patienten: isInSubdirectory ? 
                (currentSubdirectory === 'patienten' ? 'patienten.html' : '../patienten/patienten.html') : 
                'app/patienten/patienten.html',
            termine: isInSubdirectory ? 
                (currentSubdirectory === 'termine' ? 'termine.html' : '../termine/termine.html') : 
                'app/termine/termine.html',
            mitarbeiter: isInSubdirectory ? 
                (currentSubdirectory === 'mitarbeiter' ? 'mitarbeiter.html' : '../mitarbeiter/mitarbeiter.html') : 
                'app/mitarbeiter/mitarbeiter.html',
            finanzen: isInSubdirectory ? 
                (currentSubdirectory === 'finanzen' ? 'finanzen.html' : '../finanzen/finanzen.html') : 
                'app/finanzen/finanzen.html',
            einstellungen: isInSubdirectory ? 
                (currentSubdirectory === 'einstellungen' ? 'einstellungen.html' : '../einstellungen/einstellungen.html') : 
                'app/einstellungen/einstellungen.html'
        };
        
        // Update each navigation link with the correct path
        this.navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page && paths[page]) {
                link.href = paths[page];
            }
        });
    }

    createOverlay() {
        // Create overlay for mobile
        this.overlay = document.createElement('div');
        this.overlay.className = 'sidebar-overlay';
        document.body.appendChild(this.overlay);
    }

    bindEvents() {
        // Hamburger menu event
        if (this.hamburgerMenu) {
            console.log('Hamburger menu found, adding click listener');
            this.hamburgerMenu.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Hamburger clicked!');
                console.log('Event target:', e.target);
                console.log('Event currentTarget:', e.currentTarget);
                this.toggleSidebar();
            });
            
            // Also add mousedown event for better responsiveness
            this.hamburgerMenu.addEventListener('mousedown', (e) => {
                console.log('Hamburger mousedown!');
            });
        } else {
            console.error('Hamburger menu not found!');
        }

        // Navigation link events
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Overlay click to close sidebar
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeSidebar());
        }

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSidebar();
            }
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (this.sidebar && this.sidebar.classList.contains('active') && 
                !this.sidebar.contains(e.target) && 
                !this.hamburgerMenu.contains(e.target)) {
                this.closeSidebar();
            }
        });
    }

    toggleSidebar() {
        console.log('Toggle sidebar called');
        const isOpen = this.sidebar.classList.contains('active');
        console.log('Sidebar is open:', isOpen);
        console.log('Sidebar element:', this.sidebar);
        console.log('Hamburger menu element:', this.hamburgerMenu);
        
        if (isOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
        
        // Prevent any default behavior
        return false;
    }

    openSidebar() {
        this.sidebar.classList.add('active');
        this.hamburgerMenu.classList.add('active');
        this.overlay.classList.add('active');
        document.querySelector('.main-content').classList.add('sidebar-open');
        document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
        this.sidebar.classList.remove('active');
        this.hamburgerMenu.classList.remove('active');
        this.overlay.classList.remove('active');
        document.querySelector('.main-content').classList.remove('sidebar-open');
        document.body.style.overflow = '';
    }

    handleNavClick(e) {
        const targetLink = e.currentTarget;
        const targetPage = targetLink.getAttribute('data-page');
        
        // Update active state before navigation
        this.setActiveLink(targetLink);
        
        // Close sidebar
        setTimeout(() => this.closeSidebar(), 300);
        
        // Emit custom event for page change
        this.emitPageChange(targetPage);
    }

    setActiveLink(activeLink) {
        // Remove active class from all links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to clicked link
        activeLink.classList.add('active');
    }

    setActivePage() {
        // Get current page path
        const currentPath = window.location.pathname;
        
        // Determine current page based on path
        let currentPage = 'dashboard';
        
        if (currentPath.includes('/patienten/')) {
            currentPage = 'patienten';
        } else if (currentPath.includes('/termine/')) {
            currentPage = 'termine';
        } else if (currentPath.includes('/mitarbeiter/')) {
            currentPage = 'mitarbeiter';
        } else if (currentPath.includes('/finanzen/')) {
            currentPage = 'finanzen';
        } else if (currentPath.includes('/einstellungen/')) {
            currentPage = 'einstellungen';
        }
        
        const targetLink = document.querySelector(`[data-page="${currentPage}"]`);
        
        if (targetLink) {
            this.setActiveLink(targetLink);
        }
    }

    handleResize() {
        // Keep sidebar behavior consistent across all screen sizes
        // No auto-close on resize
    }

    emitPageChange(page) {
        // Create and dispatch custom event
        const event = new CustomEvent('pageChange', {
            detail: { page: page }
        });
        document.dispatchEvent(event);
    }

    // Public methods for external use
    show() {
        this.openSidebar();
    }

    hide() {
        this.closeSidebar();
    }

    isOpen() {
        return this.sidebar.classList.contains('active');
    }

    // Method to programmatically navigate
    navigateTo(page) {
        const targetLink = document.querySelector(`[data-page="${page}"]`);
        if (targetLink) {
            this.handleNavClick({ 
                preventDefault: () => {}, 
                currentTarget: targetLink 
            });
        }
    }
}

// Make Sidebar class globally available
window.Sidebar = Sidebar;

// Example: Listen for page changes
document.addEventListener('pageChange', (e) => {
    console.log('Page changed to:', e.detail.page);
    // Here you can add logic to load different content based on the page
});

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Sidebar;
} 