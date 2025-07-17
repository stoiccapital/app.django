// Wartezimmer JavaScript

class WartezimmerManager {
    constructor() {
        this.waitingPatients = [];
        this.patients = []; // Available patients for check-in
        this.init();
    }

    init() {
        this.loadComponents();
        this.loadData();
        this.setupEventListeners();
        this.updateStatistics();
        this.renderWaitingRoomTable();
    }

    loadComponents() {
        // Components are now loaded via HTML fetch() calls
        // This method is kept for compatibility but no longer needed
    }

    loadData() {
        // Load saved data from localStorage
        this.loadSavedData();
        
        // Load sample patients if no saved data exists
        if (this.waitingPatients.length === 0) {
            this.loadSampleData();
        }
    }

    loadSavedData() {
        try {
            // Load waiting patients from localStorage
            const savedWaitingPatients = localStorage.getItem('wartezimmer_waiting_patients');
            if (savedWaitingPatients) {
                this.waitingPatients = JSON.parse(savedWaitingPatients);
                // Convert date strings back to Date objects
                this.waitingPatients.forEach(patient => {
                    patient.checkInTime = new Date(patient.checkInTime);
                });
            }

            // Load available patients from localStorage
            const savedPatients = localStorage.getItem('wartezimmer_patients');
            if (savedPatients) {
                this.patients = JSON.parse(savedPatients);
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
            this.loadSampleData();
        }
    }

    saveData() {
        try {
            // Save waiting patients to localStorage
            localStorage.setItem('wartezimmer_waiting_patients', JSON.stringify(this.waitingPatients));
            
            // Save available patients to localStorage
            localStorage.setItem('wartezimmer_patients', JSON.stringify(this.patients));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    loadSampleData() {
        // Sample patients available for check-in
        this.patients = [
            { id: 1, name: 'Luna', species: 'Hund', breed: 'Golden Retriever', owner: 'Max Mustermann', phone: '+49 123 456789' },
            { id: 2, name: 'Milo', species: 'Katze', breed: 'Perser', owner: 'Anna Schmidt', phone: '+49 987 654321' },
            { id: 3, name: 'Rocky', species: 'Hund', breed: 'Deutscher Schäferhund', owner: 'Peter Weber', phone: '+49 555 123456' },
            { id: 4, name: 'Bella', species: 'Katze', breed: 'Maine Coon', owner: 'Lisa Müller', phone: '+49 777 888999' },
            { id: 5, name: 'Charlie', species: 'Hund', breed: 'Labrador', owner: 'Tom Fischer', phone: '+49 111 222333' }
        ];

        // Sample waiting room data
        this.waitingPatients = [
            {
                id: 1,
                position: 1,
                patient: { name: 'Luna', species: 'Hund', breed: 'Golden Retriever' },
                owner: { name: 'Max Mustermann', phone: '+49 123 456789' },
                checkInTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                reason: 'Routineuntersuchung und Impfung',
                priority: 'normal',
                estimatedDuration: 45,
                status: 'wartend',
                notes: 'Patient ist sehr ruhig'
            },
            {
                id: 2,
                position: 2,
                patient: { name: 'Milo', species: 'Katze', breed: 'Perser' },
                owner: { name: 'Anna Schmidt', phone: '+49 987 654321' },
                checkInTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
                reason: 'Verdacht auf Ohrenentzündung',
                priority: 'hoch',
                estimatedDuration: 30,
                status: 'wartend',
                notes: 'Patient kratzt sich häufig am Ohr'
            },
            {
                id: 3,
                position: 3,
                patient: { name: 'Rocky', species: 'Hund', breed: 'Deutscher Schäferhund' },
                owner: { name: 'Peter Weber', phone: '+49 555 123456' },
                checkInTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
                reason: 'Notfall - Unfall mit Auto',
                priority: 'dringend',
                estimatedDuration: 60,
                status: 'wartend',
                notes: 'Patient hat Blutungen und Schmerzen'
            }
        ];

        // Save sample data
        this.saveData();
    }

    setupEventListeners() {
        // Modal controls
        const addPatientBtn = document.getElementById('addPatientBtn');
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const checkInModal = document.getElementById('checkInModal');
        const checkInForm = document.getElementById('checkInForm');

        if (addPatientBtn) {
            addPatientBtn.addEventListener('click', () => this.openCheckInModal());
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeCheckInModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeCheckInModal());
        }

        if (checkInModal) {
            checkInModal.addEventListener('click', (e) => {
                if (e.target === checkInModal) {
                    this.closeCheckInModal();
                }
            });
        }

        if (checkInForm) {
            checkInForm.addEventListener('submit', (e) => this.handleCheckIn(e));
        }

        // Search functionality
        const patientSearch = document.getElementById('patientSearch');
        if (patientSearch) {
            patientSearch.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Filter functionality
        const priorityFilter = document.getElementById('priorityFilter');
        const statusFilter = document.getElementById('statusFilter');

        if (priorityFilter) {
            priorityFilter.addEventListener('change', () => this.applyFilters());
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        // Empty state button
        const addFirstPatientBtn = document.getElementById('addFirstPatientBtn');
        if (addFirstPatientBtn) {
            addFirstPatientBtn.addEventListener('click', () => this.openCheckInModal());
        }

        // Set current time for check-in form
        this.setCurrentTime();
    }

    setCurrentTime() {
        const checkInTimeInput = document.getElementById('checkInTime');
        if (checkInTimeInput) {
            const now = new Date();
            const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            checkInTimeInput.value = localDateTime;
        }
    }

    openCheckInModal() {
        const modal = document.getElementById('checkInModal');
        const patientSelect = document.getElementById('patientSelect');
        
        if (modal && patientSelect) {
            this.populatePatientSelect();
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeCheckInModal() {
        const modal = document.getElementById('checkInModal');
        const form = document.getElementById('checkInForm');
        
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        if (form) {
            form.reset();
            this.setCurrentTime();
        }
    }

    populatePatientSelect() {
        const patientSelect = document.getElementById('patientSelect');
        if (!patientSelect) return;

        // Clear existing options except the first one
        patientSelect.innerHTML = '<option value="">Patient auswählen</option>';

        // Add patient options
        this.patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.name} (${patient.species}) - ${patient.owner}`;
            patientSelect.appendChild(option);
        });
    }

    handleCheckIn(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const patientId = parseInt(formData.get('patientSelect'));
        const checkInTime = new Date(formData.get('checkInTime'));
        const reason = formData.get('visitReason');
        const priority = formData.get('priority');
        const estimatedDuration = parseInt(formData.get('estimatedDuration')) || 30;
        const notes = formData.get('notes');
        const assignedVet = formData.get('assignedVet');

        // Find the selected patient
        const selectedPatient = this.patients.find(p => p.id === patientId);
        if (!selectedPatient) {
            alert('Bitte wählen Sie einen Patienten aus.');
            return;
        }

        // Create new waiting patient entry
        const newWaitingPatient = {
            id: Date.now(), // Simple ID generation
            position: this.waitingPatients.length + 1,
            patient: {
                name: selectedPatient.name,
                species: selectedPatient.species,
                breed: selectedPatient.breed
            },
            owner: {
                name: selectedPatient.owner,
                phone: selectedPatient.phone
            },
            checkInTime: checkInTime,
            reason: reason,
            priority: priority,
            estimatedDuration: estimatedDuration,
            status: 'wartend',
            notes: notes,
            assignedVet: assignedVet
        };

        // Add to waiting list
        this.waitingPatients.push(newWaitingPatient);

        // Save data and update UI
        this.saveData();
        this.updateStatistics();
        this.renderWaitingRoomTable();
        this.closeCheckInModal();

        // Show success message
        this.showNotification('Patient erfolgreich eingecheckt!', 'success');
    }

    handleSearch(searchTerm) {
        const filteredPatients = this.waitingPatients.filter(patient => {
            const searchLower = searchTerm.toLowerCase();
            return (
                patient.patient.name.toLowerCase().includes(searchLower) ||
                patient.owner.name.toLowerCase().includes(searchLower) ||
                patient.reason.toLowerCase().includes(searchLower)
            );
        });

        this.renderWaitingRoomTable(filteredPatients);
    }

    applyFilters() {
        const priorityFilter = document.getElementById('priorityFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        let filteredPatients = [...this.waitingPatients];

        if (priorityFilter && priorityFilter.value) {
            filteredPatients = filteredPatients.filter(patient => 
                patient.priority === priorityFilter.value
            );
        }

        if (statusFilter && statusFilter.value) {
            filteredPatients = filteredPatients.filter(patient => 
                patient.status === statusFilter.value
            );
        }

        this.renderWaitingRoomTable(filteredPatients);
    }

    refreshData() {
        // In a real application, this would fetch fresh data from the server
        this.updateStatistics();
        this.renderWaitingRoomTable();
        this.showNotification('Daten aktualisiert!', 'info');
    }

    updateStatistics() {
        const totalPatients = this.waitingPatients.length;
        const urgentPatients = this.waitingPatients.filter(p => p.priority === 'dringend').length;
        
        // Calculate average wait time
        const now = new Date();
        const totalWaitTime = this.waitingPatients.reduce((sum, patient) => {
            return sum + (now - patient.checkInTime);
        }, 0);
        const avgWaitTime = totalPatients > 0 ? Math.round(totalWaitTime / totalPatients / (1000 * 60)) : 0;

        // Update statistics display
        const totalPatientsEl = document.getElementById('totalPatients');
        const avgWaitTimeEl = document.getElementById('avgWaitTime');
        const urgentPatientsEl = document.getElementById('urgentPatients');

        if (totalPatientsEl) totalPatientsEl.textContent = totalPatients;
        if (avgWaitTimeEl) avgWaitTimeEl.textContent = avgWaitTime;
        if (urgentPatientsEl) urgentPatientsEl.textContent = urgentPatients;
    }

    renderWaitingRoomTable(patients = null) {
        const tableBody = document.getElementById('waitingRoomTableBody');
        const noPatients = document.getElementById('noPatients');
        
        if (!tableBody) return;

        const patientsToShow = patients || this.waitingPatients;

        if (patientsToShow.length === 0) {
            tableBody.innerHTML = '';
            if (noPatients) noPatients.style.display = 'block';
            return;
        }

        if (noPatients) noPatients.style.display = 'none';

        tableBody.innerHTML = patientsToShow.map((patient, index) => {
            const waitTime = this.calculateWaitTime(patient.checkInTime);
            const waitTimeClass = this.getWaitTimeClass(waitTime);
            
            return `
                <tr>
                    <td>
                        <div class="position-number ${patient.priority === 'dringend' ? 'urgent' : ''}">
                            ${patient.position}
                        </div>
                    </td>
                    <td>
                        <div class="patient-info">
                            <div class="patient-name">${patient.patient.name}</div>
                            <div class="patient-species">${patient.patient.species} - ${patient.patient.breed}</div>
                        </div>
                    </td>
                    <td>
                        <div class="owner-info">
                            <div class="owner-name">${patient.owner.name}</div>
                            <div class="owner-phone">${patient.owner.phone}</div>
                        </div>
                    </td>
                    <td>
                        <div class="checkin-time">
                            <div class="checkin-date">${this.formatDate(patient.checkInTime)}</div>
                            <div class="checkin-time-only">${this.formatTime(patient.checkInTime)}</div>
                        </div>
                    </td>
                    <td>
                        <div class="visit-reason" title="${patient.reason}">${patient.reason}</div>
                    </td>
                    <td>
                        <span class="priority-badge ${patient.priority}">${patient.priority}</span>
                    </td>
                    <td>
                        <div class="wait-time ${waitTimeClass}">
                            <span>⏱️</span>
                            <span>${waitTime}</span>
                        </div>
                    </td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-primary" onclick="wartezimmerManager.startTreatment(${patient.id})">
                                Start
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="wartezimmerManager.editPatient(${patient.id})">
                                Bearb.
                            </button>
                            <button class="btn btn-sm btn-error" onclick="wartezimmerManager.removePatient(${patient.id})">
                                Entf.
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    calculateWaitTime(checkInTime) {
        const now = new Date();
        const diffMs = now - checkInTime;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 60) {
            return `${diffMins} Min`;
        } else {
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            return `${hours}h ${mins} Min`;
        }
    }

    getWaitTimeClass(waitTime) {
        const minutes = parseInt(waitTime);
        if (waitTime.includes('h')) {
            return 'very-long';
        } else if (minutes > 30) {
            return 'long';
        }
        return '';
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

    startTreatment(patientId) {
        const patient = this.waitingPatients.find(p => p.id === patientId);
        if (patient) {
            patient.status = 'in-behandlung';
            this.saveData();
            this.updateStatistics();
            this.renderWaitingRoomTable();
            this.showNotification(`${patient.patient.name} wird jetzt behandelt.`, 'success');
        }
    }

    editPatient(patientId) {
        const patient = this.waitingPatients.find(p => p.id === patientId);
        if (patient) {
            // Open edit modal with patient data
            this.openEditModal(patient);
        }
    }

    openEditModal(patient) {
        // Create a simple edit modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.style.zIndex = '1004';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Patient bearbeiten</h2>
                    <button class="btn btn-ghost btn-icon btn-sm" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <div style="padding: var(--space-6);">
                    <div class="form-group">
                        <label>Patient</label>
                        <input type="text" value="${patient.patient.name}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Grund des Besuchs</label>
                        <textarea id="editReason" rows="3">${patient.reason}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Priorität</label>
                        <select id="editPriority">
                            <option value="niedrig" ${patient.priority === 'niedrig' ? 'selected' : ''}>Niedrig</option>
                            <option value="normal" ${patient.priority === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="hoch" ${patient.priority === 'hoch' ? 'selected' : ''}>Hoch</option>
                            <option value="dringend" ${patient.priority === 'dringend' ? 'selected' : ''}>Dringend</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Notizen</label>
                        <textarea id="editNotes" rows="3">${patient.notes || ''}</textarea>
                    </div>
                    <div style="display: flex; gap: var(--space-4); justify-content: flex-end; margin-top: var(--space-6);">
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Abbrechen</button>
                        <button class="btn btn-primary" onclick="wartezimmerManager.saveEdit(${patient.id}, this.closest('.modal'))">Speichern</button>
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

    saveEdit(patientId, modal) {
        const patient = this.waitingPatients.find(p => p.id === patientId);
        if (patient) {
            const reason = document.getElementById('editReason').value;
            const priority = document.getElementById('editPriority').value;
            const notes = document.getElementById('editNotes').value;
            
            patient.reason = reason;
            patient.priority = priority;
            patient.notes = notes;
            
            this.saveData();
            this.updateStatistics();
            this.renderWaitingRoomTable();
            modal.remove();
            this.showNotification('Patient erfolgreich bearbeitet!', 'success');
        }
    }

    removePatient(patientId) {
        if (confirm('Möchten Sie diesen Patienten wirklich aus dem Wartezimmer entfernen?')) {
            this.waitingPatients = this.waitingPatients.filter(p => p.id !== patientId);
            
            // Update positions
            this.waitingPatients.forEach((patient, index) => {
                patient.position = index + 1;
            });
            
            this.saveData();
            this.updateStatistics();
            this.renderWaitingRoomTable();
            this.showNotification('Patient aus dem Wartezimmer entfernt.', 'success');
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
            waitingPatients: this.waitingPatients,
            patients: this.patients,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wartezimmer_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import data from JSON
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.waitingPatients && data.patients) {
                this.waitingPatients = data.waitingPatients;
                this.patients = data.patients;
                
                // Convert date strings back to Date objects
                this.waitingPatients.forEach(patient => {
                    patient.checkInTime = new Date(patient.checkInTime);
                });
                
                this.saveData();
                this.updateStatistics();
                this.renderWaitingRoomTable();
                this.showNotification('Daten erfolgreich importiert!', 'success');
            }
        } catch (error) {
            console.error('Error importing data:', error);
            this.showNotification('Fehler beim Importieren der Daten.', 'error');
        }
    }
}

// Initialize the Wartezimmer manager when the page loads
let wartezimmerManager;

document.addEventListener('DOMContentLoaded', () => {
    wartezimmerManager = new WartezimmerManager();
});

// Make it globally available for button onclick handlers
window.wartezimmerManager = wartezimmerManager;
