// Mahnungen JavaScript

class MahnungenManager {
    constructor() {
        this.mahnungen = [];
        this.customers = [];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateStatistics();
        this.renderMahnungenTable();
    }

    loadData() {
        // Load saved data from localStorage
        this.loadSavedData();
        
        // Load sample data if no saved data exists
        if (this.mahnungen.length === 0) {
            this.loadSampleData();
        }
    }

    loadSavedData() {
        try {
            // Load mahnungen from localStorage
            const savedMahnungen = localStorage.getItem('mahnungen_data');
            if (savedMahnungen) {
                this.mahnungen = JSON.parse(savedMahnungen);
                // Convert date strings back to Date objects
                this.mahnungen.forEach(mahnung => {
                    mahnung.firstReminderDate = new Date(mahnung.firstReminderDate);
                    mahnung.dueDate = new Date(mahnung.dueDate);
                });
            }

            // Load customers from localStorage
            const savedCustomers = localStorage.getItem('mahnungen_customers');
            if (savedCustomers) {
                this.customers = JSON.parse(savedCustomers);
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
            this.loadSampleData();
        }
    }

    saveData() {
        try {
            // Save mahnungen to localStorage
            localStorage.setItem('mahnungen_data', JSON.stringify(this.mahnungen));
            
            // Save customers to localStorage
            localStorage.setItem('mahnungen_customers', JSON.stringify(this.customers));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    loadSampleData() {
        // Sample customers
        this.customers = [
            { id: 1, name: 'Max Mustermann', email: 'max.mustermann@email.com', phone: '+49 123 456789' },
            { id: 2, name: 'Anna Schmidt', email: 'anna.schmidt@email.com', phone: '+49 987 654321' },
            { id: 3, name: 'Peter Weber', email: 'peter.weber@email.com', phone: '+49 555 123456' },
            { id: 4, name: 'Lisa Müller', email: 'lisa.mueller@email.com', phone: '+49 777 888999' },
            { id: 5, name: 'Tom Fischer', email: 'tom.fischer@email.com', phone: '+49 111 222333' }
        ];

        // Sample mahnungen data
        this.mahnungen = [
            {
                id: 1,
                customerId: 1,
                customerName: 'Max Mustermann',
                customerEmail: 'max.mustermann@email.com',
                invoiceNumber: 'RE-2024-001',
                invoiceAmount: 150.00,
                firstReminderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                numberOfReminders: 2,
                status: 'zweite',
                dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
                notes: 'Patient Luna - Routineuntersuchung'
            },
            {
                id: 2,
                customerId: 2,
                customerName: 'Anna Schmidt',
                customerEmail: 'anna.schmidt@email.com',
                invoiceNumber: 'RE-2024-002',
                invoiceAmount: 85.50,
                firstReminderDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
                numberOfReminders: 3,
                status: 'letzte',
                dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                notes: 'Patient Milo - Impfung'
            },
            {
                id: 3,
                customerId: 3,
                customerName: 'Peter Weber',
                customerEmail: 'peter.weber@email.com',
                invoiceNumber: 'RE-2024-003',
                invoiceAmount: 320.00,
                firstReminderDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
                numberOfReminders: 4,
                status: 'anwalt',
                dueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
                notes: 'Patient Rocky - Operation'
            },
            {
                id: 4,
                customerId: 4,
                customerName: 'Lisa Müller',
                customerEmail: 'lisa.mueller@email.com',
                invoiceNumber: 'RE-2024-004',
                invoiceAmount: 75.00,
                firstReminderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
                numberOfReminders: 1,
                status: 'erste',
                dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                notes: 'Patient Bella - Kontrolluntersuchung'
            }
        ];

        // Save sample data
        this.saveData();
    }

    setupEventListeners() {
        // Modal controls
        const createMahnungBtn = document.getElementById('createMahnungBtn');
        const createFirstMahnungBtn = document.getElementById('createFirstMahnungBtn');
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const createMahnungModal = document.getElementById('createMahnungModal');
        const createMahnungForm = document.getElementById('createMahnungForm');

        if (createMahnungBtn) {
            createMahnungBtn.addEventListener('click', () => this.openCreateModal());
        }

        if (createFirstMahnungBtn) {
            createFirstMahnungBtn.addEventListener('click', () => this.openCreateModal());
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeCreateModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeCreateModal());
        }

        if (createMahnungModal) {
            createMahnungModal.addEventListener('click', (e) => {
                if (e.target === createMahnungModal) {
                    this.closeCreateModal();
                }
            });
        }

        if (createMahnungForm) {
            createMahnungForm.addEventListener('submit', (e) => this.handleCreateMahnung(e));
        }

        // Search functionality
        const mahnungSearch = document.getElementById('mahnungSearch');
        if (mahnungSearch) {
            mahnungSearch.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Filter functionality
        const statusFilter = document.getElementById('statusFilter');
        const amountFilter = document.getElementById('amountFilter');

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }

        if (amountFilter) {
            amountFilter.addEventListener('change', () => this.applyFilters());
        }

        // Set current date for due date input
        this.setCurrentDate();
    }

    setCurrentDate() {
        const dueDateInput = document.getElementById('dueDate');
        if (dueDateInput) {
            const today = new Date();
            const localDate = today.toISOString().split('T')[0];
            dueDateInput.value = localDate;
        }
    }

    openCreateModal() {
        const modal = document.getElementById('createMahnungModal');
        const customerSelect = document.getElementById('customerSelect');
        
        if (modal && customerSelect) {
            this.populateCustomerSelect();
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeCreateModal() {
        const modal = document.getElementById('createMahnungModal');
        const form = document.getElementById('createMahnungForm');
        
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        if (form) {
            form.reset();
            this.setCurrentDate();
        }
    }

    populateCustomerSelect() {
        const customerSelect = document.getElementById('customerSelect');
        if (!customerSelect) return;

        // Clear existing options except the first one
        customerSelect.innerHTML = '<option value="">Kunde auswählen</option>';

        // Add customer options
        this.customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.name} (${customer.email})`;
            customerSelect.appendChild(option);
        });
    }

    handleCreateMahnung(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const customerId = parseInt(formData.get('customerSelect'));
        const invoiceNumber = formData.get('invoiceNumber');
        const invoiceAmount = parseFloat(formData.get('invoiceAmount'));
        const mahnungType = formData.get('mahnungType');
        const dueDate = new Date(formData.get('dueDate'));
        const mahnungText = formData.get('mahnungText');

        // Find the selected customer
        const selectedCustomer = this.customers.find(c => c.id === customerId);
        if (!selectedCustomer) {
            alert('Bitte wählen Sie einen Kunden aus.');
            return;
        }

        // Create new mahnung entry
        const newMahnung = {
            id: Date.now(), // Simple ID generation
            customerId: customerId,
            customerName: selectedCustomer.name,
            customerEmail: selectedCustomer.email,
            invoiceNumber: invoiceNumber,
            invoiceAmount: invoiceAmount,
            firstReminderDate: new Date(),
            numberOfReminders: 1,
            status: mahnungType,
            dueDate: dueDate,
            notes: mahnungText || ''
        };

        // Add to mahnungen list
        this.mahnungen.push(newMahnung);

        // Save data and update UI
        this.saveData();
        this.updateStatistics();
        this.renderMahnungenTable();
        this.closeCreateModal();

        // Show success message
        this.showNotification('Mahnung erfolgreich erstellt!', 'success');
    }

    handleSearch(searchTerm) {
        const filteredMahnungen = this.mahnungen.filter(mahnung => {
            const searchLower = searchTerm.toLowerCase();
            return (
                mahnung.customerName.toLowerCase().includes(searchLower) ||
                mahnung.invoiceNumber.toLowerCase().includes(searchLower) ||
                mahnung.customerEmail.toLowerCase().includes(searchLower)
            );
        });

        this.renderMahnungenTable(filteredMahnungen);
    }

    applyFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const amountFilter = document.getElementById('amountFilter');
        
        let filteredMahnungen = [...this.mahnungen];

        if (statusFilter && statusFilter.value) {
            filteredMahnungen = filteredMahnungen.filter(mahnung => 
                mahnung.status === statusFilter.value
            );
        }

        if (amountFilter && amountFilter.value) {
            filteredMahnungen = filteredMahnungen.filter(mahnung => {
                switch (amountFilter.value) {
                    case 'low':
                        return mahnung.invoiceAmount < 100;
                    case 'medium':
                        return mahnung.invoiceAmount >= 100 && mahnung.invoiceAmount <= 500;
                    case 'high':
                        return mahnung.invoiceAmount > 500;
                    default:
                        return true;
                }
            });
        }

        this.renderMahnungenTable(filteredMahnungen);
    }

    updateStatistics() {
        const totalMahnungen = this.mahnungen.length;
        const totalAmount = this.mahnungen.reduce((sum, mahnung) => sum + mahnung.invoiceAmount, 0);
        const urgentMahnungen = this.mahnungen.filter(m => m.status === 'letzte' || m.status === 'anwalt').length;
        
        // Calculate average days overdue
        const now = new Date();
        const totalDaysOverdue = this.mahnungen.reduce((sum, mahnung) => {
            const daysOverdue = Math.floor((now - mahnung.dueDate) / (1000 * 60 * 60 * 24));
            return sum + Math.max(0, daysOverdue);
        }, 0);
        const avgDaysOverdue = totalMahnungen > 0 ? Math.round(totalDaysOverdue / totalMahnungen) : 0;

        // Update statistics display
        const totalMahnungenEl = document.getElementById('totalMahnungen');
        const totalAmountEl = document.getElementById('totalAmount');
        const avgDaysOverdueEl = document.getElementById('avgDaysOverdue');
        const urgentMahnungenEl = document.getElementById('urgentMahnungen');

        if (totalMahnungenEl) totalMahnungenEl.textContent = totalMahnungen;
        if (totalAmountEl) totalAmountEl.textContent = `€${totalAmount.toFixed(2)}`;
        if (avgDaysOverdueEl) avgDaysOverdueEl.textContent = avgDaysOverdue;
        if (urgentMahnungenEl) urgentMahnungenEl.textContent = urgentMahnungen;
    }

    renderMahnungenTable(mahnungen = null) {
        const tableBody = document.getElementById('mahnungenTableBody');
        const noMahnungen = document.getElementById('noMahnungen');
        
        if (!tableBody) return;

        const mahnungenToShow = mahnungen || this.mahnungen;

        if (mahnungenToShow.length === 0) {
            tableBody.innerHTML = '';
            if (noMahnungen) noMahnungen.style.display = 'block';
            return;
        }

        if (noMahnungen) noMahnungen.style.display = 'none';

        tableBody.innerHTML = mahnungenToShow.map((mahnung) => {
            const daysOverdue = this.calculateDaysOverdue(mahnung.dueDate);
            const daysOverdueClass = this.getDaysOverdueClass(daysOverdue);
            
            return `
                <tr>
                    <td>
                        <div class="customer-info">
                            <div class="customer-name">${mahnung.customerName}</div>
                            <div class="customer-email">${mahnung.customerEmail}</div>
                        </div>
                    </td>
                    <td>
                        <div class="date-info">
                            <div class="date-primary">${this.formatDate(mahnung.firstReminderDate)}</div>
                            <div class="date-secondary">${this.formatTime(mahnung.firstReminderDate)}</div>
                        </div>
                    </td>
                    <td>
                        <div class="amount-info">
                            <div class="amount-primary">${mahnung.numberOfReminders}</div>
                            <div class="amount-secondary">Mahnungen</div>
                        </div>
                    </td>
                    <td>
                        <div class="amount-info">
                            <div class="amount-primary">€${mahnung.invoiceAmount.toFixed(2)}</div>
                            <div class="amount-secondary ${daysOverdueClass}">${daysOverdue > 0 ? `${daysOverdue} Tage überfällig` : 'Fällig'}</div>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${mahnung.status}">${this.getStatusText(mahnung.status)}</span>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-primary" onclick="mahnungenManager.downloadPDF(${mahnung.id})">
                                PDF
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="mahnungenManager.editMahnung(${mahnung.id})">
                                Bearb.
                            </button>
                            <button class="btn btn-sm btn-error" onclick="mahnungenManager.deleteMahnung(${mahnung.id})">
                                Löschen
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    calculateDaysOverdue(dueDate) {
        const now = new Date();
        const diffTime = now - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    getDaysOverdueClass(daysOverdue) {
        if (daysOverdue > 30) return 'very-overdue';
        if (daysOverdue > 15) return 'overdue';
        return '';
    }

    getStatusText(status) {
        const statusMap = {
            'erste': 'Erste Mahnung',
            'zweite': 'Zweite Mahnung',
            'letzte': 'Letzte Mahnung',
            'anwalt': 'An Anwalt'
        };
        return statusMap[status] || status;
    }

    formatDate(date) {
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatTime(date) {
        return date.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    downloadPDF(mahnungId) {
        const mahnung = this.mahnungen.find(m => m.id === mahnungId);
        if (!mahnung) return;

        // Create PDF content
        const pdfContent = this.generatePDFContent(mahnung);
        
        // Create and download PDF
        this.createAndDownloadPDF(pdfContent, `Mahnung_${mahnung.invoiceNumber}.pdf`);
        
        this.showNotification('PDF wird heruntergeladen...', 'info');
    }

    generatePDFContent(mahnung) {
        const today = new Date().toLocaleDateString('de-DE');
        const dueDate = this.formatDate(mahnung.dueDate);
        
        return `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .content { margin-bottom: 30px; }
                    .footer { margin-top: 50px; }
                    .amount { font-size: 18px; font-weight: bold; color: #ef4444; }
                    .due-date { color: #ef4444; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Mahnung</h1>
                    <p>Datum: ${today}</p>
                </div>
                
                <div class="content">
                    <p><strong>${mahnung.customerName}</strong><br>
                    ${mahnung.customerEmail}</p>
                    
                    <p>Sehr geehrte/r ${mahnung.customerName},</p>
                    
                    <p>wir möchten Sie daran erinnern, dass die Rechnung <strong>${mahnung.invoiceNumber}</strong> 
                    über einen Betrag von <span class="amount">€${mahnung.invoiceAmount.toFixed(2)}</span> 
                    zum <span class="due-date">${dueDate}</span> fällig war.</p>
                    
                    <p>Bitte überweisen Sie den offenen Betrag umgehend auf unser Konto.</p>
                    
                    ${mahnung.notes ? `<p><strong>Notiz:</strong> ${mahnung.notes}</p>` : ''}
                </div>
                
                <div class="footer">
                    <p>Mit freundlichen Grüßen<br>
                    Ihr Tierarzt-Team</p>
                </div>
            </body>
            </html>
        `;
    }

    createAndDownloadPDF(content, filename) {
        // Create a blob with the HTML content
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
    }

    editMahnung(mahnungId) {
        const mahnung = this.mahnungen.find(m => m.id === mahnungId);
        if (mahnung) {
            // Open edit modal with mahnung data
            this.openEditModal(mahnung);
        }
    }

    openEditModal(mahnung) {
        // Create a simple edit modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.style.zIndex = '1004';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Mahnung bearbeiten</h2>
                    <button class="btn btn-ghost btn-icon btn-sm" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <div style="padding: var(--space-6);">
                    <div class="form-group">
                        <label>Kunde</label>
                        <input type="text" value="${mahnung.customerName}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Rechnungsnummer</label>
                        <input type="text" value="${mahnung.invoiceNumber}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Rechnungsbetrag</label>
                        <input type="number" id="editAmount" value="${mahnung.invoiceAmount}" step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <select id="editStatus">
                            <option value="erste" ${mahnung.status === 'erste' ? 'selected' : ''}>Erste Mahnung</option>
                            <option value="zweite" ${mahnung.status === 'zweite' ? 'selected' : ''}>Zweite Mahnung</option>
                            <option value="letzte" ${mahnung.status === 'letzte' ? 'selected' : ''}>Letzte Mahnung</option>
                            <option value="anwalt" ${mahnung.status === 'anwalt' ? 'selected' : ''}>An Anwalt</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Notizen</label>
                        <textarea id="editNotes" rows="3">${mahnung.notes || ''}</textarea>
                    </div>
                    <div style="display: flex; gap: var(--space-4); justify-content: flex-end; margin-top: var(--space-6);">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Abbrechen</button>
                        <button class="btn btn-primary" onclick="mahnungenManager.saveEdit(${mahnung.id}, this.closest('.modal'))">Speichern</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    saveEdit(mahnungId, modal) {
        const mahnung = this.mahnungen.find(m => m.id === mahnungId);
        if (mahnung) {
            const amount = parseFloat(document.getElementById('editAmount').value);
            const status = document.getElementById('editStatus').value;
            const notes = document.getElementById('editNotes').value;
            
            mahnung.invoiceAmount = amount;
            mahnung.status = status;
            mahnung.notes = notes;
            
            this.saveData();
            this.updateStatistics();
            this.renderMahnungenTable();
            modal.remove();
            this.showNotification('Mahnung erfolgreich bearbeitet!', 'success');
        }
    }

    deleteMahnung(mahnungId) {
        if (confirm('Möchten Sie diese Mahnung wirklich löschen?')) {
            this.mahnungen = this.mahnungen.filter(m => m.id !== mahnungId);
            
            this.saveData();
            this.updateStatistics();
            this.renderMahnungenTable();
            this.showNotification('Mahnung erfolgreich gelöscht.', 'success');
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '1005';
        notification.style.padding = '1rem';
        notification.style.borderRadius = '0.5rem';
        notification.style.backgroundColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
        notification.style.color = 'white';
        notification.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Export data as JSON
    exportData() {
        const data = {
            mahnungen: this.mahnungen,
            customers: this.customers,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mahnungen_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import data from JSON
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.mahnungen && data.customers) {
                this.mahnungen = data.mahnungen;
                this.customers = data.customers;
                
                // Convert date strings back to Date objects
                this.mahnungen.forEach(mahnung => {
                    mahnung.firstReminderDate = new Date(mahnung.firstReminderDate);
                    mahnung.dueDate = new Date(mahnung.dueDate);
                });
                
                this.saveData();
                this.updateStatistics();
                this.renderMahnungenTable();
                this.showNotification('Daten erfolgreich importiert!', 'success');
            }
        } catch (error) {
            console.error('Error importing data:', error);
            this.showNotification('Fehler beim Importieren der Daten.', 'error');
        }
    }
}

// Initialize the Mahnungen manager when the page loads
let mahnungenManager;

document.addEventListener('DOMContentLoaded', () => {
    mahnungenManager = new MahnungenManager();
});

// Make it globally available for button onclick handlers
window.mahnungenManager = mahnungenManager; 