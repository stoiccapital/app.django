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
        } else if (currentPath.includes('/kalender/')) {
            currentSubdirectory = 'kalender';
        } else if (currentPath.includes('/wartezimmer/')) {
            currentSubdirectory = 'wartezimmer';
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
            kalender: isInSubdirectory ? 
                (currentSubdirectory === 'kalender' ? 'kalender.html' : '../kalender/kalender.html') : 
                'app/kalender/kalender.html',
            wartezimmer: isInSubdirectory ? 
                (currentSubdirectory === 'wartezimmer' ? 'wartezimmer.html' : '../wartezimmer/wartezimmer.html') : 
                'app/wartezimmer/wartezimmer.html',
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
        // Hamburger menu event (mobile only)
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

        // Overlay click to close sidebar (optional - since overlay is now transparent)
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeSidebar());
        }

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Handle escape key (mobile only)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && window.innerWidth <= 768) {
                this.closeSidebar();
            }
        });

        // Close sidebar when clicking outside (mobile only)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                this.sidebar && this.sidebar.classList.contains('active') && 
                !this.sidebar.contains(e.target) && 
                !this.hamburgerMenu.contains(e.target)) {
                this.closeSidebar();
            }
        });
    }

    toggleSidebar() {
        // Only toggle on mobile devices
        if (window.innerWidth <= 768) {
            console.log('Toggle sidebar called on mobile');
            const isOpen = this.sidebar.classList.contains('active');
            console.log('Sidebar is open:', isOpen);
            
            if (isOpen) {
                this.closeSidebar();
            } else {
                this.openSidebar();
            }
        }
        
        // Prevent any default behavior
        return false;
    }

    openSidebar() {
        // Only open on mobile devices
        if (window.innerWidth <= 768) {
            this.sidebar.classList.add('active');
            this.hamburgerMenu.classList.add('active');
            this.overlay.classList.add('active');
        }
    }

    closeSidebar() {
        // Only close on mobile devices
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('active');
            this.hamburgerMenu.classList.remove('active');
            this.overlay.classList.remove('active');
        }
    }

    handleNavClick(e) {
        const targetLink = e.currentTarget;
        const targetPage = targetLink.getAttribute('data-page');
        
        // Update active state before navigation
        this.setActiveLink(targetLink);
        
        // Close sidebar only on mobile
        if (window.innerWidth <= 768) {
            setTimeout(() => this.closeSidebar(), 300);
        }
        
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
        } else if (currentPath.includes('/kalender/')) {
            currentPage = 'kalender';
        } else if (currentPath.includes('/wartezimmer/')) {
            currentPage = 'wartezimmer';
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
        // Handle transition between desktop and mobile
        if (window.innerWidth > 768) {
            // On desktop, ensure sidebar is always visible and hamburger is hidden
            this.sidebar.classList.remove('active');
            this.hamburgerMenu.classList.remove('active');
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            // On mobile, close sidebar if it was open
            this.closeSidebar();
        }
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