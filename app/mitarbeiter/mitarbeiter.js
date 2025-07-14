// Mitarbeiter Management JavaScript

class MitarbeiterManagement {
    constructor() {
        this.drivers = this.loadDrivers();
        this.currentDriver = null;
        this.isEditing = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderDrivers();
        this.updateStats();
        this.initializeSidebar();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchDrivers');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Add driver button
        const addDriverBtn = document.getElementById('addDriverBtn');
        if (addDriverBtn) {
            addDriverBtn.addEventListener('click', () => this.openAddModal());
        }

        // Filter button
        const filterBtn = document.getElementById('filterBtn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => this.showFilterOptions());
        }

        // Modal events
        const modal = document.getElementById('driverModal');
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const driverForm = document.getElementById('driverForm');

        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }

        if (driverForm) {
            driverForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // Sample data
    loadDrivers() {
        const savedDrivers = localStorage.getItem('fahrly_drivers');
        if (savedDrivers) {
            return JSON.parse(savedDrivers);
        }

        // Default sample data
        return [
            {
                id: 1,
                firstName: 'Hans',
                lastName: 'Müller',
                employeeId: 'F001',
                position: 'Senior Fahrer',
                status: 'Aktiv',
                startDate: '2020-03-15',
                phone: '+49 30 12345678',
                email: 'hans.mueller@fahrly.de',
                address: 'Musterstraße 1, 10115 Berlin'
            },
            {
                id: 2,
                firstName: 'Anna',
                lastName: 'Schmidt',
                employeeId: 'F002',
                position: 'Fahrer',
                status: 'Urlaub',
                startDate: '2021-06-20',
                phone: '+49 40 87654321',
                email: 'anna.schmidt@fahrly.de',
                address: 'Beispielweg 5, 20095 Hamburg'
            },
            {
                id: 3,
                firstName: 'Michael',
                lastName: 'Weber',
                employeeId: 'F003',
                position: 'Teamleiter',
                status: 'Aktiv',
                startDate: '2019-11-10',
                phone: '+49 89 11223344',
                email: 'michael.weber@fahrly.de',
                address: 'Teststraße 12, 80331 München'
            },
            {
                id: 4,
                firstName: 'Sarah',
                lastName: 'Fischer',
                employeeId: 'F004',
                position: 'Fahrer',
                status: 'Krank',
                startDate: '2022-01-08',
                phone: '+49 221 55667788',
                email: 'sarah.fischer@fahrly.de',
                address: 'Datenweg 8, 50667 Köln'
            },
            {
                id: 5,
                firstName: 'Thomas',
                lastName: 'Wagner',
                employeeId: 'F005',
                position: 'Ausbilder',
                status: 'Aktiv',
                startDate: '2018-09-22',
                phone: '+49 69 99887766',
                email: 'thomas.wagner@fahrly.de',
                address: 'Infoallee 15, 60311 Frankfurt'
            }
        ];
    }

    saveDrivers() {
        localStorage.setItem('fahrly_drivers', JSON.stringify(this.drivers));
    }

    renderDrivers(filteredDrivers = null) {
        const tbody = document.getElementById('driversTableBody');
        if (!tbody) return;

        const driversToRender = filteredDrivers || this.drivers;
        
        tbody.innerHTML = driversToRender.map(driver => `
            <tr>
                <td>${driver.firstName} ${driver.lastName}</td>
                <td>${driver.employeeId}</td>
                <td>${driver.position}</td>
                <td><span class="status-badge status-${this.getStatusClass(driver.status)}">${driver.status}</span></td>
                <td>${this.formatDate(driver.startDate)}</td>
                <td>${driver.phone || '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-small btn-view" onclick="mitarbeiterManagement.viewDriver(${driver.id})">Ansehen</button>
                        <button class="btn btn-small btn-edit" onclick="mitarbeiterManagement.editDriver(${driver.id})">Bearbeiten</button>
                        <button class="btn btn-small btn-delete" onclick="mitarbeiterManagement.deleteDriver(${driver.id})">Löschen</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getStatusClass(status) {
        const statusMap = {
            'Aktiv': 'active',
            'Inaktiv': 'inactive',
            'Urlaub': 'vacation',
            'Krank': 'sick'
        };
        return statusMap[status] || 'active';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE');
    }

    updateStats() {
        const stats = {
            active: this.drivers.filter(d => d.status === 'Aktiv').length,
            vacation: this.drivers.filter(d => d.status === 'Urlaub').length,
            sick: this.drivers.filter(d => d.status === 'Krank').length,
            applications: 5 // Mock data
        };

        // Update stat cards
        const statCards = document.querySelectorAll('.stat-value');
        if (statCards.length >= 4) {
            statCards[0].textContent = stats.active;
            statCards[1].textContent = stats.vacation;
            statCards[2].textContent = stats.sick;
            statCards[3].textContent = stats.applications;
        }
    }

    handleSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.renderDrivers();
            return;
        }

        const filteredDrivers = this.drivers.filter(driver => 
            driver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.position.toLowerCase().includes(searchTerm.toLowerCase())
        );

        this.renderDrivers(filteredDrivers);
    }

    showFilterOptions() {
        // Simple filter implementation - could be expanded
        const statusFilter = prompt('Status filtern (Aktiv, Urlaub, Krank, Inaktiv):');
        if (statusFilter) {
            const filteredDrivers = this.drivers.filter(driver => 
                driver.status.toLowerCase() === statusFilter.toLowerCase()
            );
            this.renderDrivers(filteredDrivers);
        }
    }

    openAddModal() {
        this.isEditing = false;
        this.currentDriver = null;
        this.resetForm();
        this.showModal('Neuen Fahrer hinzufügen');
    }

    editDriver(driverId) {
        const driver = this.drivers.find(d => d.id === driverId);
        if (!driver) return;

        this.isEditing = true;
        this.currentDriver = driver;
        this.populateForm(driver);
        this.showModal('Fahrer bearbeiten');
    }

    viewDriver(driverId) {
        const driver = this.drivers.find(d => d.id === driverId);
        if (!driver) return;

        // Create a detailed view modal
        const modalContent = `
            <div class="modal-header">
                <h2 class="modal-title">Fahrer Details</h2>
                <button class="close-modal" onclick="mitarbeiterManagement.closeModal()">&times;</button>
            </div>
            <div style="padding: 1rem 0;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div><strong>Name:</strong> ${driver.firstName} ${driver.lastName}</div>
                    <div><strong>Personalnummer:</strong> ${driver.employeeId}</div>
                    <div><strong>Position:</strong> ${driver.position}</div>
                    <div><strong>Status:</strong> <span class="status-badge status-${this.getStatusClass(driver.status)}">${driver.status}</span></div>
                    <div><strong>Eintrittsdatum:</strong> ${this.formatDate(driver.startDate)}</div>
                    <div><strong>Telefon:</strong> ${driver.phone || '-'}</div>
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>E-Mail:</strong> ${driver.email || '-'}
                </div>
                <div>
                    <strong>Adresse:</strong> ${driver.address || '-'}
                </div>
            </div>
        `;

        const modal = document.getElementById('driverModal');
        const modalContentDiv = modal.querySelector('.modal-content');
        modalContentDiv.innerHTML = modalContent;
        this.showModal('Fahrer Details');
    }

    deleteDriver(driverId) {
        if (confirm('Sind Sie sicher, dass Sie diesen Fahrer löschen möchten?')) {
            this.drivers = this.drivers.filter(d => d.id !== driverId);
            this.saveDrivers();
            this.renderDrivers();
            this.updateStats();
        }
    }

    populateForm(driver) {
        document.getElementById('firstName').value = driver.firstName;
        document.getElementById('lastName').value = driver.lastName;
        document.getElementById('employeeId').value = driver.employeeId;
        document.getElementById('position').value = driver.position;
        document.getElementById('startDate').value = driver.startDate;
        document.getElementById('status').value = driver.status;
        document.getElementById('phone').value = driver.phone || '';
        document.getElementById('email').value = driver.email || '';
        document.getElementById('address').value = driver.address || '';
    }

    resetForm() {
        document.getElementById('driverForm').reset();
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            employeeId: document.getElementById('employeeId').value,
            position: document.getElementById('position').value,
            startDate: document.getElementById('startDate').value,
            status: document.getElementById('status').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value
        };

        if (this.isEditing && this.currentDriver) {
            // Update existing driver
            Object.assign(this.currentDriver, formData);
        } else {
            // Add new driver
            const newDriver = {
                id: Date.now(), // Simple ID generation
                ...formData
            };
            this.drivers.push(newDriver);
        }

        this.saveDrivers();
        this.renderDrivers();
        this.updateStats();
        this.closeModal();

        // Show success message
        this.showNotification(this.isEditing ? 'Fahrer erfolgreich aktualisiert!' : 'Fahrer erfolgreich hinzugefügt!');
    }

    showModal(title) {
        const modal = document.getElementById('driverModal');
        const modalTitle = document.getElementById('modalTitle');
        
        if (modalTitle) {
            modalTitle.textContent = title;
        }
        
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal() {
        const modal = document.getElementById('driverModal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Reset form if not editing
        if (!this.isEditing) {
            this.resetForm();
        }
    }

    showNotification(message) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #48bb78;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1005;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Public methods for external use
    getDrivers() {
        return this.drivers;
    }

    addDriver(driverData) {
        const newDriver = {
            id: Date.now(),
            ...driverData
        };
        this.drivers.push(newDriver);
        this.saveDrivers();
        this.renderDrivers();
        this.updateStats();
    }

    updateDriver(driverId, driverData) {
        const driverIndex = this.drivers.findIndex(d => d.id === driverId);
        if (driverIndex !== -1) {
            this.drivers[driverIndex] = { ...this.drivers[driverIndex], ...driverData };
            this.saveDrivers();
            this.renderDrivers();
            this.updateStats();
        }
    }

    removeDriver(driverId) {
        this.drivers = this.drivers.filter(d => d.id !== driverId);
        this.saveDrivers();
        this.renderDrivers();
        this.updateStats();
    }

    initializeSidebar() {
        // Initialize sidebar functionality manually (like fahrtenarchiv.js)
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const sidebar = document.getElementById('sidebar');
        const navLinks = document.querySelectorAll('.nav-link');
        const body = document.body;
        
        console.log('Initializing sidebar manually...');
        console.log('Hamburger menu:', hamburgerMenu);
        console.log('Sidebar:', sidebar);
        
        // Ensure initial state is correct
        if (sidebar && sidebar.classList.contains('active')) {
            body.classList.add('sidebar-open');
        } else {
            body.classList.remove('sidebar-open');
        }
        
        // Function to toggle sidebar state
        function toggleSidebar() {
            const isActive = sidebar.classList.contains('active');
            console.log('Toggle sidebar called, isActive:', isActive);
            
            if (isActive) {
                // Close sidebar
                sidebar.classList.remove('active');
                hamburgerMenu.classList.remove('active');
                body.classList.remove('sidebar-open');
            } else {
                // Open sidebar
                sidebar.classList.add('active');
                hamburgerMenu.classList.add('active');
                body.classList.add('sidebar-open');
            }
        }
        
        // Hamburger menu toggle
        if (hamburgerMenu && sidebar) {
            hamburgerMenu.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation(); // Prevent event bubbling
                console.log('Hamburger clicked!');
                toggleSidebar();
            });
        } else {
            console.error('Hamburger menu or sidebar not found!');
        }
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
            if (sidebar && sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !hamburgerMenu.contains(e.target)) {
                toggleSidebar();
            }
        });
        
        // Close sidebar on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                toggleSidebar();
            }
        });
        
        // Handle navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                // Add active class to clicked link
                this.classList.add('active');
                
                // Close sidebar on mobile after navigation
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        toggleSidebar();
                    }, 300); // Small delay for smooth transition
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            // Close sidebar on mobile when switching to desktop
            if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
                body.classList.remove('sidebar-open');
            }
        });
    }


}

// Initialize Mitarbeiter Management when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mitarbeiterManagement = new MitarbeiterManagement();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 