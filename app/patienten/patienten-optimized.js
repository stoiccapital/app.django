// Optimized Patienten Manager - Main Class

import { PatientUtils, ValidationUtils } from './utils.js';
import { ModalManager } from './modal-manager.js';
import { PatientDataManager } from './data-manager.js';
import { PatientUIRenderer } from './ui-renderer.js';

export class PatientenManager {
    constructor() {
        // Initialize managers
        this.modalManager = new ModalManager();
        this.dataManager = new PatientDataManager();
        this.uiRenderer = new PatientUIRenderer();
        
        // Initialize DOM elements
        this.initializeElements();
        
        // Bind events
        this.bindEvents();
        
        // Initial render
        this.renderPatients();
        this.updateEmptyState();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        // Action buttons
        this.addPatientBtn = PatientUtils.safeQuerySelector('#addPatientBtn');
        this.addFirstPatientBtn = PatientUtils.safeQuerySelector('#addFirstPatientBtn');
        this.addBehandlungsbuchBtn = PatientUtils.safeQuerySelector('#addBehandlungsbuchBtn');
        
        // Detail modal action buttons
        this.viewPatientBtn = PatientUtils.safeQuerySelector('#viewPatientBtn');
        this.editPatientBtn = PatientUtils.safeQuerySelector('#editPatientBtn');
        this.behandlungsbuchBtn = PatientUtils.safeQuerySelector('#behandlungsbuchBtn');
        this.bookAppointmentBtn = PatientUtils.safeQuerySelector('#bookAppointmentBtn');
        this.sendReminderBtn = PatientUtils.safeQuerySelector('#sendReminderBtn');
        
        // Search and filter elements
        this.searchInput = PatientUtils.safeQuerySelector('#patientSearch');
        this.speciesFilter = PatientUtils.safeQuerySelector('#speciesFilter');
        this.patientSearchFilter = PatientUtils.safeQuerySelector('#patientSearchFilter');
        this.statusFilter = PatientUtils.safeQuerySelector('#statusFilter');
        this.genderFilter = PatientUtils.safeQuerySelector('#genderFilter');
        
        // Export/print buttons
        this.exportPatientsBtn = PatientUtils.safeQuerySelector('#exportPatients');
        this.printPatientsBtn = PatientUtils.safeQuerySelector('#printPatients');
        this.generateReportBtn = PatientUtils.safeQuerySelector('#generateReport');
        
        // Table elements
        this.patientsTable = PatientUtils.safeQuerySelector('#patientsTable');
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Action button events
        this.bindActionButtonEvents();
        
        // Form events
        this.bindFormEvents();
        
        // Search and filter events
        this.bindSearchFilterEvents();
        
        // Table events
        this.bindTableEvents();
        
        // Export events
        this.bindExportEvents();
        
        // Modal close events
        this.modalManager.bindCloseEvents(() => {
            this.dataManager.clearCurrentPatient();
            this.dataManager.setEditingMode(false);
        });
    }

    /**
     * Bind action button events
     */
    bindActionButtonEvents() {
        if (this.addPatientBtn) {
            this.addPatientBtn.addEventListener('click', () => this.openPatientModal());
        }
        
        if (this.addFirstPatientBtn) {
            this.addFirstPatientBtn.addEventListener('click', () => this.openPatientModal());
        }
        
        if (this.addBehandlungsbuchBtn) {
            this.addBehandlungsbuchBtn.addEventListener('click', () => this.openBehandlungsbuchModal());
        }

        // Detail modal action buttons
        if (this.viewPatientBtn) {
            this.viewPatientBtn.addEventListener('click', () => this.viewPatientData());
        }
        
        if (this.editPatientBtn) {
            this.editPatientBtn.addEventListener('click', () => this.editFromDetail());
        }
        
        if (this.behandlungsbuchBtn) {
            this.behandlungsbuchBtn.addEventListener('click', () => this.openBehandlungsbuch());
        }
        
        if (this.bookAppointmentBtn) {
            this.bookAppointmentBtn.addEventListener('click', () => this.bookAppointment());
        }
        
        if (this.sendReminderBtn) {
            this.sendReminderBtn.addEventListener('click', () => this.sendReminder());
        }
    }

    /**
     * Bind form events
     */
    bindFormEvents() {
        const patientForm = this.uiRenderer.elements.patientForm;
        const treatmentForm = this.uiRenderer.elements.treatmentForm;

        if (patientForm) {
            patientForm.addEventListener('submit', (e) => this.handlePatientFormSubmit(e));
        }

        if (treatmentForm) {
            treatmentForm.addEventListener('submit', (e) => this.handleTreatmentFormSubmit(e));
        }
    }

    /**
     * Bind search and filter events
     */
    bindSearchFilterEvents() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.handleSearch());
        }
        
        if (this.speciesFilter) {
            this.speciesFilter.addEventListener('change', () => this.handleFilter());
        }
        
        if (this.patientSearchFilter) {
            this.patientSearchFilter.addEventListener('input', () => this.filterPatients());
        }
        
        if (this.statusFilter) {
            this.statusFilter.addEventListener('change', () => this.filterPatients());
        }
        
        if (this.genderFilter) {
            this.genderFilter.addEventListener('change', () => this.filterPatients());
        }
    }

    /**
     * Bind table events
     */
    bindTableEvents() {
        if (this.patientsTable) {
            this.patientsTable.addEventListener('click', (e) => {
                if (e.target.tagName === 'TH') {
                    this.sortTable(e.target);
                }
            });
        }
    }

    /**
     * Bind export events
     */
    bindExportEvents() {
        if (this.exportPatientsBtn) {
            this.exportPatientsBtn.addEventListener('click', () => this.exportPatients());
        }
        
        if (this.printPatientsBtn) {
            this.printPatientsBtn.addEventListener('click', () => this.printPatients());
        }
        
        if (this.generateReportBtn) {
            this.generateReportBtn.addEventListener('click', () => this.generateReport());
        }
    }

    // Modal Management Methods

    /**
     * Open patient modal for adding/editing
     * @param {Object} patient - Patient to edit (optional)
     */
    openPatientModal(patient = null) {
        this.dataManager.setCurrentPatient(patient);
        this.dataManager.setEditingMode(!!patient);

        const options = {
            title: patient ? 'Patient bearbeiten' : 'Neuen Patienten hinzufügen'
        };

        if (this.modalManager.openModal('patient', options)) {
            const form = this.uiRenderer.elements.patientForm;
            if (form) {
                if (patient) {
                    this.uiRenderer.fillFormWithPatient(form, patient);
                } else {
                    this.uiRenderer.clearForm(form);
                }
            }
        }
    }

    /**
     * Open patient detail modal
     * @param {string} patientId - Patient ID
     */
    openPatientDetail(patientId) {
        const patient = this.dataManager.getPatient(patientId);
        if (!patient) return;

        this.dataManager.setCurrentPatient(patient);
        
        const detailModal = this.modalManager.getModal('detail');
        if (detailModal) {
            const contentContainer = detailModal.querySelector('#patientDetailContent');
            if (contentContainer) {
                this.uiRenderer.renderPatientDetail(patient, contentContainer);
            }
        }

        this.modalManager.openModal('detail');
    }

    /**
     * Open behandlungsbuch modal
     * @param {string} patientId - Patient ID (optional)
     */
    openBehandlungsbuchModal(patientId = null) {
        let patient = null;
        let patientName = 'Neue Behandlung';

        if (patientId) {
            patient = this.dataManager.getPatient(patientId);
            if (patient) {
                patientName = patient.name;
                this.dataManager.setCurrentPatient(patient);
            }
        }

        const options = { patientName };
        
        if (this.modalManager.openModal('behandlungsbuch', options)) {
            // Clear form and set default date
            const form = this.uiRenderer.elements.treatmentForm;
            if (form) {
                this.uiRenderer.clearForm(form);
                const dateInput = form.querySelector('[name="treatmentDate"]');
                if (dateInput) {
                    dateInput.value = new Date().toISOString().split('T')[0];
                }
            }

            // Populate patient dropdown
            const patientSelect = PatientUtils.safeQuerySelector('#treatmentPatient');
            if (patientSelect) {
                this.uiRenderer.populatePatientDropdown(patientSelect, this.dataManager.getAllPatients(), patientId);
            }

            // Render treatment history if patient is selected
            if (patient) {
                this.uiRenderer.renderTreatmentHistory(patient.treatments || []);
            }
        }
    }

    /**
     * Open behandlungsbuch for current patient
     */
    openBehandlungsbuch() {
        const patient = this.dataManager.getCurrentPatient();
        if (!patient) return;

        this.openBehandlungsbuchModal(patient.id);
    }

    // Form Handling Methods

    /**
     * Handle patient form submission
     * @param {Event} e - Form submit event
     */
    handlePatientFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const formData = this.uiRenderer.getFormData(form);

        // Validate form
        const validation = ValidationUtils.validatePatientForm(formData);
        if (!validation.isValid) {
            this.uiRenderer.displayFormErrors(form, validation.errors);
            return;
        }

        // Transform form data
        const patientData = this.transformPatientFormData(formData);

        // Save patient
        if (this.dataManager.getEditingMode()) {
            const currentPatient = this.dataManager.getCurrentPatient();
            if (currentPatient) {
                this.dataManager.updatePatient(currentPatient.id, patientData);
                this.uiRenderer.showAlert('Patient erfolgreich aktualisiert!', 'success');
            }
        } else {
            this.dataManager.addPatient(patientData);
            this.uiRenderer.showAlert('Patient erfolgreich hinzugefügt!', 'success');
        }

        // Close modal and refresh
        this.modalManager.closeActiveModal();
        this.renderPatients();
        this.updateEmptyState();
    }

    /**
     * Handle treatment form submission
     * @param {Event} e - Form submit event
     */
    handleTreatmentFormSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const formData = this.uiRenderer.getFormData(form);

        // Validate form
        const validation = ValidationUtils.validateTreatmentForm(formData);
        if (!validation.isValid) {
            this.uiRenderer.showAlert('Bitte füllen Sie alle erforderlichen Felder aus', 'error');
            return;
        }

        // Transform form data
        const treatmentData = this.transformTreatmentFormData(formData);

        // Add treatment to patient
        const result = this.dataManager.addTreatmentToPatient(formData.treatmentPatient, treatmentData);
        if (result) {
            this.uiRenderer.showAlert('Behandlung erfolgreich hinzugefügt', 'success');
            
            // Update current patient if it's the same
            const currentPatient = this.dataManager.getCurrentPatient();
            if (currentPatient && currentPatient.id === formData.treatmentPatient) {
                this.dataManager.setCurrentPatient(result);
            }
            
            // Re-render treatment history
            const updatedPatient = this.dataManager.getPatient(formData.treatmentPatient);
            if (updatedPatient) {
                this.uiRenderer.renderTreatmentHistory(updatedPatient.treatments || []);
            }
        } else {
            this.uiRenderer.showAlert('Fehler beim Hinzufügen der Behandlung', 'error');
        }
    }

    /**
     * Transform patient form data
     * @param {Object} formData - Raw form data
     * @returns {Object} Transformed patient data
     */
    transformPatientFormData(formData) {
        return {
            name: formData.patientName,
            species: formData.patientSpecies,
            breed: formData.patientBreed,
            gender: formData.patientGender,
            birthDate: formData.patientBirthDate,
            weight: formData.patientWeight ? parseFloat(formData.patientWeight) : null,
            color: formData.patientColor,
            microchip: formData.patientMicrochip,
            owner: {
                name: formData.ownerName,
                phone: formData.ownerPhone,
                email: formData.ownerEmail,
                address: formData.ownerAddress
            },
            allergies: formData.patientAllergies,
            medications: formData.patientMedications,
            notes: formData.patientNotes
        };
    }

    /**
     * Transform treatment form data
     * @param {Object} formData - Raw form data
     * @returns {Object} Transformed treatment data
     */
    transformTreatmentFormData(formData) {
        return {
            patientId: formData.treatmentPatient,
            date: formData.treatmentDate,
            type: formData.treatmentType,
            title: formData.treatmentTitle,
            description: formData.treatmentDescription || '',
            medication: formData.treatmentMedication || '',
            dosage: formData.treatmentDosage || '',
            vet: formData.treatmentVet || '',
            cost: parseFloat(formData.treatmentCost) || 0,
            notes: formData.treatmentNotes || ''
        };
    }

    // Patient Management Methods

    /**
     * Edit patient
     * @param {string} patientId - Patient ID
     */
    editPatient(patientId) {
        const patient = this.dataManager.getPatient(patientId);
        if (patient) {
            this.openPatientModal(patient);
        }
    }

    /**
     * Delete patient
     * @param {string} patientId - Patient ID
     */
    deletePatient(patientId) {
        if (confirm('Sind Sie sicher, dass Sie diesen Patienten löschen möchten?')) {
            if (this.dataManager.deletePatient(patientId)) {
                this.uiRenderer.showAlert('Patient erfolgreich gelöscht!', 'success');
                this.renderPatients();
                this.updateEmptyState();
            } else {
                this.uiRenderer.showAlert('Fehler beim Löschen des Patienten', 'error');
            }
        }
    }

    /**
     * View patient behandlungsbuch
     * @param {string} patientId - Patient ID
     */
    viewPatientBehandlungsbuch(patientId) {
        this.openBehandlungsbuchModal(patientId);
    }

    // Search and Filter Methods

    /**
     * Handle search input
     */
    handleSearch() {
        this.filterPatients();
    }

    /**
     * Handle filter changes
     */
    handleFilter() {
        this.filterPatients();
    }

    /**
     * Filter and render patients
     */
    filterPatients() {
        const filters = {
            searchTerm: this.patientSearchFilter?.value || this.searchInput?.value || '',
            species: this.speciesFilter?.value || '',
            status: this.statusFilter?.value || '',
            gender: this.genderFilter?.value || ''
        };

        const filteredPatients = this.dataManager.filterPatients(filters);
        this.renderPatientsTable(filteredPatients);
        this.uiRenderer.updateTablePagination(filteredPatients.length);
    }

    /**
     * Sort table by column
     * @param {Element} header - Table header element
     */
    sortTable(header) {
        const isAsc = header.classList.contains('sort-asc');
        const isDesc = header.classList.contains('sort-desc');
        
        // Remove existing sort classes
        header.parentElement.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        
        // Add new sort class
        if (!isAsc && !isDesc) {
            header.classList.add('sort-asc');
        } else if (isAsc) {
            header.classList.add('sort-desc');
        } else {
            header.classList.add('sort-asc');
        }
        
        // Get column index and sort direction
        const columnIndex = Array.from(header.parentElement.children).indexOf(header);
        const direction = isAsc ? 'desc' : 'asc';
        
        // Get current filtered patients and sort them
        const filters = {
            searchTerm: this.patientSearchFilter?.value || this.searchInput?.value || '',
            species: this.speciesFilter?.value || '',
            status: this.statusFilter?.value || '',
            gender: this.genderFilter?.value || ''
        };
        
        const filteredPatients = this.dataManager.filterPatients(filters);
        const sortedPatients = this.dataManager.sortPatients(filteredPatients, columnIndex, direction);
        
        this.renderPatientsTable(sortedPatients);
    }

    // Rendering Methods

    /**
     * Render all patients
     */
    renderPatients() {
        const patients = this.dataManager.getAllPatients();
        this.renderPatientsTable(patients);
        this.updateEmptyState();
    }

    /**
     * Render patients table
     * @param {Array} patients - Patients to render
     */
    renderPatientsTable(patients) {
        this.uiRenderer.renderPatientsTable(patients);
        this.uiRenderer.updateTablePagination(patients.length);
    }

    /**
     * Update empty state visibility
     */
    updateEmptyState() {
        const hasPatients = this.dataManager.getAllPatients().length > 0;
        this.uiRenderer.updateEmptyState(hasPatients);
    }

    // Treatment Management Methods

    /**
     * Edit treatment
     * @param {string} treatmentId - Treatment ID
     */
    editTreatment(treatmentId) {
        this.uiRenderer.showAlert('Behandlung bearbeiten - Feature in Entwicklung', 'info');
    }

    /**
     * Delete treatment
     * @param {string} treatmentId - Treatment ID
     */
    deleteTreatment(treatmentId) {
        const currentPatient = this.dataManager.getCurrentPatient();
        if (!currentPatient) return;

        if (confirm('Sind Sie sicher, dass Sie diese Behandlung löschen möchten?')) {
            const result = this.dataManager.deleteTreatmentFromPatient(currentPatient.id, treatmentId);
            if (result) {
                this.dataManager.setCurrentPatient(result);
                this.uiRenderer.renderTreatmentHistory(result.treatments || []);
                this.uiRenderer.showAlert('Behandlung erfolgreich gelöscht', 'success');
            }
        }
    }

    // Detail Modal Action Methods

    /**
     * View patient data
     */
    viewPatientData() {
        this.uiRenderer.showAlert('Patientendaten werden angezeigt', 'info');
    }

    /**
     * Edit from detail modal
     */
    editFromDetail() {
        const currentPatient = this.dataManager.getCurrentPatient();
        if (currentPatient) {
            this.modalManager.closeActiveModal();
            this.openPatientModal(currentPatient);
        }
    }

    /**
     * Book appointment
     */
    bookAppointment() {
        const currentPatient = this.dataManager.getCurrentPatient();
        if (currentPatient) {
            this.uiRenderer.showAlert(`Terminbuchung wird für ${currentPatient.name} geöffnet...`, 'info');
        }
    }

    /**
     * Send reminder
     */
    sendReminder() {
        const currentPatient = this.dataManager.getCurrentPatient();
        if (currentPatient) {
            this.uiRenderer.showAlert(`Erinnerung wird an ${currentPatient.owner.name} gesendet`, 'success');
        }
    }

    // Export Methods

    /**
     * Export patients to CSV
     */
    exportPatients() {
        const filters = {
            searchTerm: this.patientSearchFilter?.value || this.searchInput?.value || '',
            species: this.speciesFilter?.value || '',
            status: this.statusFilter?.value || '',
            gender: this.genderFilter?.value || ''
        };
        
        const filteredPatients = this.dataManager.filterPatients(filters);
        const csvContent = this.dataManager.exportPatientsToCSV(filteredPatients);
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `patienten_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    /**
     * Print patients
     */
    printPatients() {
        const filters = {
            searchTerm: this.patientSearchFilter?.value || this.searchInput?.value || '',
            species: this.speciesFilter?.value || '',
            status: this.statusFilter?.value || '',
            gender: this.genderFilter?.value || ''
        };
        
        const filteredPatients = this.dataManager.filterPatients(filters);
        this.printPatientList(filteredPatients);
    }

    /**
     * Generate report
     */
    generateReport() {
        const filters = {
            searchTerm: this.patientSearchFilter?.value || this.searchInput?.value || '',
            species: this.speciesFilter?.value || '',
            status: this.statusFilter?.value || '',
            gender: this.genderFilter?.value || ''
        };
        
        const filteredPatients = this.dataManager.filterPatients(filters);
        const reportData = this.dataManager.getPatientStatistics(filteredPatients);
        this.generatePatientReport(reportData);
    }

    /**
     * Print patient list
     * @param {Array} patients - Patients to print
     */
    printPatientList(patients) {
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Patienten Übersicht</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                    .info { background-color: #e3f2fd; color: #1976d2; }
                    .active { background-color: #e8f5e8; color: #2e7d32; }
                    .warning { background-color: #fff3e0; color: #f57c00; }
                    .inactive { background-color: #ffebee; color: #c62828; }
                </style>
            </head>
            <body>
                <h1>Patienten Übersicht</h1>
                <p>Erstellt am: ${new Date().toLocaleDateString('de-DE')}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Tierart</th>
                            <th>Rasse</th>
                            <th>Besitzer</th>
                            <th>Telefon</th>
                            <th>Letzter Besuch</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${patients.map(patient => {
                            const status = PatientUtils.getPatientStatus(patient);
                            return `
                                <tr>
                                    <td>${patient.name}</td>
                                    <td>${patient.species}</td>
                                    <td>${patient.breed || '-'}</td>
                                    <td>${patient.owner.name}</td>
                                    <td>${patient.owner.phone}</td>
                                    <td>${patient.lastVisit ? PatientUtils.formatDate(patient.lastVisit) : '-'}</td>
                                    <td><span class="status ${status.class}">${status.label}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }

    /**
     * Generate patient report
     * @param {Object} reportData - Report data
     */
    generatePatientReport(reportData) {
        const reportWindow = window.open('', '_blank');
        
        reportWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Patienten Bericht</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .report-section { margin-bottom: 30px; }
                    .report-title { font-size: 24px; margin-bottom: 20px; }
                    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
                    .stat-card { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
                    .stat-number { font-size: 32px; font-weight: bold; color: #2563eb; }
                    .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1 class="report-title">Patienten Bericht</h1>
                <p>Erstellt am: ${new Date().toLocaleDateString('de-DE')}</p>
                
                <div class="report-section">
                    <h2>Übersicht</h2>
                    <div class="stat-grid">
                        <div class="stat-card">
                            <div class="stat-number">${reportData.totalPatients}</div>
                            <div class="stat-label">Gesamt Patienten</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${reportData.activePatients}</div>
                            <div class="stat-label">Aktive Patienten</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${reportData.newPatients}</div>
                            <div class="stat-label">Neue Patienten</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${reportData.speciesCount}</div>
                            <div class="stat-label">Verschiedene Tierarten</div>
                        </div>
                    </div>
                </div>
                
                <div class="report-section">
                    <h2>Verteilung nach Tierarten</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Tierart</th>
                                <th>Anzahl</th>
                                <th>Prozent</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(reportData.speciesDistribution).map(([species, count]) => `
                                <tr>
                                    <td>${species}</td>
                                    <td>${count}</td>
                                    <td>${((count / reportData.totalPatients) * 100).toFixed(1)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `);
        
        reportWindow.document.close();
    }
}

// Initialize the patient manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.patientenManager = new PatientenManager();
}); 