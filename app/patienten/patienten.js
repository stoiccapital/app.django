// Patienten Page JavaScript - Optimized Version

// Import modules (these will be loaded as separate files in production)
// import { PatientUtils, ValidationUtils } from './utils.js';
// import { ModalManager } from './modal-manager.js';
// import { PatientDataManager } from './data-manager.js';
// import { PatientUIRenderer } from './ui-renderer.js';

// Utility functions (inlined for compatibility)
class PatientUtils {
    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE');
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static isValidEmail(email) {
        if (!email) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPhone(phone) {
        if (!phone) return false;
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        return phoneRegex.test(phone);
    }

    static getSpeciesIcon(species) {
        const icons = {
            'hund': '🐕', 'katze': '🐱', 'pferd': '🐎', 'kleintier': '🐰',
            'vogel': '🦜', 'exot': '🦎', 'sonstiges': '🐾'
        };
        return icons[species] || '🐾';
    }

    static getTreatmentTypeLabel(type) {
        const labels = {
            'untersuchung': 'Untersuchung', 'impfung': 'Impfung', 'operation': 'Operation',
            'medikament': 'Medikament', 'labor': 'Labor', 'röntgen': 'Röntgen',
            'ultraschall': 'Ultraschall', 'chirurgie': 'Chirurgie', 'zahnbehandlung': 'Zahnbehandlung',
            'sonstiges': 'Sonstiges'
        };
        return labels[type] || type;
    }

    static getPatientStatus(patient) {
        if (!patient.lastVisit) {
            return { class: 'info', label: 'Neu' };
        }
        
        const lastVisit = new Date(patient.lastVisit);
        const now = new Date();
        const daysSinceLastVisit = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastVisit <= 30) {
            return { class: 'active', label: 'Aktiv' };
        } else if (daysSinceLastVisit <= 365) {
            return { class: 'warning', label: 'Inaktiv' };
        } else {
            return { class: 'inactive', label: 'Sehr inaktiv' };
        }
    }

    static safeQuerySelector(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return null;
        }
    }
}

class ValidationUtils {
    static validatePatientForm(formData) {
        const errors = {};
        
        const requiredFields = ['patientName', 'patientSpecies', 'ownerName', 'ownerPhone'];
        requiredFields.forEach(fieldName => {
            if (!formData[fieldName]?.trim()) {
                errors[fieldName] = 'Dieses Feld ist erforderlich';
            }
        });
        
        if (formData.ownerEmail?.trim() && !PatientUtils.isValidEmail(formData.ownerEmail)) {
            errors.ownerEmail = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
        }
        
        if (formData.ownerPhone?.trim() && !PatientUtils.isValidPhone(formData.ownerPhone)) {
            errors.ownerPhone = 'Bitte geben Sie eine gültige Telefonnummer ein';
        }
        
        if (formData.patientWeight && (isNaN(formData.patientWeight) || parseFloat(formData.patientWeight) < 0)) {
            errors.patientWeight = 'Bitte geben Sie ein gültiges Gewicht ein';
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    static validateTreatmentForm(formData) {
        const errors = {};
        
        if (!formData.treatmentPatient) {
            errors.treatmentPatient = 'Bitte wählen Sie einen Patienten aus';
        }
        
        if (!formData.treatmentDate) {
            errors.treatmentDate = 'Bitte wählen Sie ein Datum aus';
        }
        
        if (!formData.treatmentType) {
            errors.treatmentType = 'Bitte wählen Sie einen Behandlungstyp aus';
        }
        
        if (!formData.treatmentTitle?.trim()) {
            errors.treatmentTitle = 'Bitte geben Sie einen Titel ein';
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

class StorageUtils {
    static load(key, defaultValue = []) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return defaultValue;
        }
    }

    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    }
}

class PatientenManager {
    constructor() {
        // Initialize data
        this.patients = StorageUtils.load('vetmates_patients', []);
        this.currentPatient = null;
        this.isEditing = false;
        
        // Initialize DOM elements
        this.initializeElements();
        
        // Bind events
        this.bindEvents();
        
        // Initial render
        this.renderPatients();
        this.updateEmptyState();
    }
    
    initializeElements() {
        // Modal elements
        this.modal = PatientUtils.safeQuerySelector('#patientModal');
        this.modalContent = this.modal?.querySelector('.modal-content');
        this.closeModalBtn = PatientUtils.safeQuerySelector('#closeModal');
        this.cancelBtn = PatientUtils.safeQuerySelector('#cancelBtn');
        
        // Patient detail modal elements
        this.detailModal = PatientUtils.safeQuerySelector('#patientDetailModal');
        this.closeDetailModalBtn = PatientUtils.safeQuerySelector('#closeDetailModal');
        this.patientDetailContent = PatientUtils.safeQuerySelector('#patientDetailContent');
        
        // Behandlungsbuch modal elements
        this.behandlungsbuchModal = PatientUtils.safeQuerySelector('#behandlungsbuchModal');
        this.closeBehandlungsbuchModalBtn = PatientUtils.safeQuerySelector('#closeBehandlungsbuchModal');
        this.behandlungsbuchPatientName = PatientUtils.safeQuerySelector('#behandlungsbuchPatientName');
        this.treatmentForm = PatientUtils.safeQuerySelector('#treatmentForm');
        this.treatmentList = PatientUtils.safeQuerySelector('#treatmentList');
        this.noTreatments = PatientUtils.safeQuerySelector('#noTreatments');
        
        // Detail modal action buttons
        this.viewPatientBtn = PatientUtils.safeQuerySelector('#viewPatientBtn');
        this.editPatientBtn = PatientUtils.safeQuerySelector('#editPatientBtn');
        this.behandlungsbuchBtn = PatientUtils.safeQuerySelector('#behandlungsbuchBtn');
        this.bookAppointmentBtn = PatientUtils.safeQuerySelector('#bookAppointmentBtn');
        this.sendReminderBtn = PatientUtils.safeQuerySelector('#sendReminderBtn');
        
        // Form elements
        this.patientForm = PatientUtils.safeQuerySelector('#patientForm');
        this.formInputs = this.patientForm?.querySelectorAll('input, select, textarea') || [];
        
        // Action buttons
        this.addPatientBtn = PatientUtils.safeQuerySelector('#addPatientBtn');
        this.addFirstPatientBtn = PatientUtils.safeQuerySelector('#addFirstPatientBtn');
        this.addBehandlungsbuchBtn = PatientUtils.safeQuerySelector('#addBehandlungsbuchBtn');
        
        // Search and filter
        this.searchInput = PatientUtils.safeQuerySelector('#patientSearch');
        this.speciesFilter = PatientUtils.safeQuerySelector('#speciesFilter');
        
        // Table elements
        this.patientsTable = PatientUtils.safeQuerySelector('#patientsTable');
        this.patientsTableBody = PatientUtils.safeQuerySelector('#patientsTableBody');
        this.noPatients = PatientUtils.safeQuerySelector('#noPatients');
        
        // New table elements
        this.patientSearchFilter = PatientUtils.safeQuerySelector('#patientSearchFilter');
        this.statusFilter = PatientUtils.safeQuerySelector('#statusFilter');
        this.genderFilter = PatientUtils.safeQuerySelector('#genderFilter');
        this.exportPatientsBtn = PatientUtils.safeQuerySelector('#exportPatients');
        this.printPatientsBtn = PatientUtils.safeQuerySelector('#printPatients');
        this.generateReportBtn = PatientUtils.safeQuerySelector('#generateReport');
        this.tablePaginationInfo = PatientUtils.safeQuerySelector('#tablePaginationInfo');
        this.tablePaginationControls = PatientUtils.safeQuerySelector('#tablePaginationControls');
        
        // Alert container
        this.alertContainer = PatientUtils.safeQuerySelector('#alertContainer');
    }
    
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
        
        // Modal events
        this.bindModalEvents();
        
        // Keyboard shortcuts
        this.bindKeyboardEvents();
    }

    /**
     * Bind action button events
     */
    bindActionButtonEvents() {
        if (this.addPatientBtn) {
            this.addPatientBtn.addEventListener('click', () => this.openModal());
        }
        
        if (this.addFirstPatientBtn) {
            this.addFirstPatientBtn.addEventListener('click', () => this.openModal());
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
        if (this.patientForm) {
            this.patientForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        if (this.treatmentForm) {
            this.treatmentForm.addEventListener('submit', (e) => this.handleTreatmentFormSubmit(e));
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

    /**
     * Bind modal events
     */
    bindModalEvents() {
        // Close modal on outside click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }
        
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Patient detail modal events
        if (this.detailModal) {
            this.detailModal.addEventListener('click', (e) => {
                if (e.target === this.detailModal) {
                    this.closeDetailModal();
                }
            });
        }
        
        if (this.closeDetailModalBtn) {
            this.closeDetailModalBtn.addEventListener('click', () => this.closeDetailModal());
        }
        
        // Behandlungsbuch modal events
        if (this.behandlungsbuchModal) {
            this.behandlungsbuchModal.addEventListener('click', (e) => {
                if (e.target === this.behandlungsbuchModal) {
                    this.closeBehandlungsbuchModal();
                }
            });
        }
        
        if (this.closeBehandlungsbuchModalBtn) {
            this.closeBehandlungsbuchModalBtn.addEventListener('click', () => this.closeBehandlungsbuchModal());
        }
    }

    /**
     * Bind keyboard events
     */
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.modal?.classList.contains('active')) {
                    this.closeModal();
                } else if (this.detailModal?.classList.contains('active')) {
                    this.closeDetailModal();
                } else if (this.behandlungsbuchModal?.classList.contains('active')) {
                    this.closeBehandlungsbuchModal();
                }
            }
        });
    }
    
    // Modal Management
    openModal(patient = null) {
        this.currentPatient = patient;
        this.isEditing = !!patient;
        
        if (!this.modal) {
            this.showAlert('Modal konnte nicht geöffnet werden', 'error');
            return;
        }
        
        if (this.isEditing) {
            this.fillFormWithPatient(patient);
            const titleElement = this.modal.querySelector('.modal-title');
            if (titleElement) {
                titleElement.textContent = 'Patient bearbeiten';
            }
        } else {
            this.clearForm();
            const titleElement = this.modal.querySelector('.modal-title');
            if (titleElement) {
                titleElement.textContent = 'Neuen Patienten hinzufügen';
            }
        }
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = this.patientForm?.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
    
    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
        }
        document.body.style.overflow = '';
        this.currentPatient = null;
        this.isEditing = false;
        this.clearForm();
    }
    
    openBehandlungsbuchModal(patientId = null) {
        if (!this.behandlungsbuchModal) {
            this.showAlert('Modal konnte nicht geöffnet werden', 'error');
            return;
        }
        
        let patient = null;
        let patientName = 'Neue Behandlung';

        if (patientId) {
            patient = this.patients.find(p => p.id === patientId);
            if (patient) {
                patientName = patient.name;
                this.currentPatient = patient;
            }
        }

        // Clear form and set default date
        this.clearTreatmentForm();
        
        // Set patient name
        if (this.behandlungsbuchPatientName) {
            this.behandlungsbuchPatientName.textContent = patientName;
        }
        
        // Populate patient dropdown
        this.populatePatientDropdown(patientId);
        
        // Show the modal
        this.behandlungsbuchModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = this.behandlungsbuchModal.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
    
    clearForm() {
        if (!this.patientForm) return;
        
        this.formInputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
        
        // Remove error states
        this.patientForm.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error', 'success');
        });
    }
    
    fillFormWithPatient(patient) {
        if (!this.patientForm || !patient) return;
        
        const formData = {
            patientName: patient.name,
            patientSpecies: patient.species,
            patientBreed: patient.breed || '',
            patientGender: patient.gender || '',
            patientBirthDate: patient.birthDate || '',
            patientWeight: patient.weight || '',
            patientColor: patient.color || '',
            patientMicrochip: patient.microchip || '',
            ownerName: patient.owner.name,
            ownerPhone: patient.owner.phone,
            ownerEmail: patient.owner.email || '',
            ownerAddress: patient.owner.address || '',
            patientAllergies: patient.allergies || '',
            patientMedications: patient.medications || '',
            patientNotes: patient.notes || ''
        };
        
        Object.keys(formData).forEach(key => {
            const input = this.patientForm.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = formData[key];
            }
        });
    }
    
    // Form Validation and Submission
    handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.patientForm) return;
        
        const formData = this.getFormData();
        
        // Validate form using utility
        const validation = ValidationUtils.validatePatientForm(formData);
        if (!validation.isValid) {
            this.displayFormErrors(validation.errors);
            return;
        }
        
        // Transform form data
        const patientData = this.transformPatientFormData(formData);
        
        // Save patient
        if (this.isEditing) {
            this.updatePatient(this.currentPatient.id, patientData);
            this.showAlert('Patient erfolgreich aktualisiert!', 'success');
        } else {
            this.addPatient(patientData);
            this.showAlert('Patient erfolgreich hinzugefügt!', 'success');
        }
        
        this.closeModal();
        this.renderPatients();
        this.updateEmptyState();
    }
    
    getFormData() {
        if (!this.patientForm) return {};
        
        const formData = {};
        this.formInputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.name] = input.checked;
            } else {
                formData[input.name] = input.value.trim();
            }
        });
        
        return formData;
    }
    
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
    
    displayFormErrors(errors) {
        if (!this.patientForm) return;
        
        // Clear previous errors
        this.patientForm.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
            const errorMessage = group.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
        
        // Display new errors
        Object.keys(errors).forEach(fieldName => {
            const input = this.patientForm.querySelector(`[name="${fieldName}"]`);
            if (input) {
                const formGroup = input.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.add('error');
                    
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = errors[fieldName];
                    formGroup.appendChild(errorMessage);
                }
            }
        });
    }
    
    // Patient Data Management
    addPatient(patientData) {
        const newPatient = {
            id: PatientUtils.generateId(),
            ...patientData,
            createdAt: new Date().toISOString(),
            lastVisit: null,
            treatments: []
        };
        
        this.patients.unshift(newPatient);
        this.savePatients();
        this.renderPatients();
        this.updateEmptyState();
    }
    
    updatePatient(patientId, patientData) {
        const index = this.patients.findIndex(p => p.id === patientId);
        if (index !== -1) {
            this.patients[index] = { 
                ...this.patients[index], 
                ...patientData,
                lastVisit: this.patients[index].lastVisit // Preserve last visit
            };
            this.savePatients();
            this.renderPatients();
        }
    }
    
    deletePatient(patientId) {
        if (confirm('Sind Sie sicher, dass Sie diesen Patienten löschen möchten?')) {
            const initialLength = this.patients.length;
            this.patients = this.patients.filter(p => p.id !== patientId);
            
            if (this.patients.length !== initialLength) {
                this.savePatients();
                this.renderPatients();
                this.updateEmptyState();
                this.showAlert('Patient erfolgreich gelöscht!', 'success');
            }
        }
    }
    
    // Search and Filter
    handleSearch() {
        this.filterPatients();
    }
    
    handleFilter() {
        this.filterPatients();
    }
    
    filterPatients() {
        const filters = {
            searchTerm: this.patientSearchFilter?.value || this.searchInput?.value || '',
            species: this.speciesFilter?.value || '',
            status: this.statusFilter?.value || '',
            gender: this.genderFilter?.value || ''
        };

        const filteredPatients = this.patients.filter(patient => {
            // Search term filter
            const searchTerm = filters.searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                patient.name.toLowerCase().includes(searchTerm) ||
                patient.owner.name.toLowerCase().includes(searchTerm) ||
                patient.owner.phone.toLowerCase().includes(searchTerm) ||
                (patient.breed && patient.breed.toLowerCase().includes(searchTerm));

            // Species filter
            const matchesSpecies = !filters.species || patient.species === filters.species;

            // Status filter
            const matchesStatus = !filters.status || PatientUtils.getPatientStatus(patient).label === filters.status;

            // Gender filter
            const matchesGender = !filters.gender || patient.gender === filters.gender;

            return matchesSearch && matchesSpecies && matchesStatus && matchesGender;
        });
        
        this.renderPatientsTable(filteredPatients);
        this.updateTablePagination(filteredPatients.length);
    }
    
    // Rendering
    renderPatients() {
        const patients = this.patients;
        this.renderPatientsTable(patients);
        this.updateEmptyState();
    }
    
    renderPatientsTable(patients) {
        if (!this.patientsTableBody) return;
        
        if (patients.length === 0) {
            this.patientsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="table-empty">
                        <div class="table-empty-icon">🐾</div>
                        <h3 class="table-empty-title">Keine Patienten gefunden</h3>
                        <p class="table-empty-description">Versuchen Sie andere Suchkriterien oder fügen Sie einen neuen Patienten hinzu.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        this.patientsTableBody.innerHTML = patients.map(patient => {
            const status = PatientUtils.getPatientStatus(patient);
            const speciesIcon = PatientUtils.getSpeciesIcon(patient.species);
            
            return `
                <tr class="patient-row" data-patient-id="${patient.id}" onclick="patientenManager.openPatientDetail('${patient.id}')">
                    <td class="avatar-cell">
                        <div class="avatar">${patient.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <div>${PatientUtils.escapeHtml(patient.name)}</div>
                            <small>ID: #${patient.id}</small>
                        </div>
                    </td>
                    <td>
                        <div class="species-cell">
                            <span class="species-icon">${speciesIcon}</span>
                            <span>${PatientUtils.escapeHtml(patient.species)}</span>
                        </div>
                    </td>
                    <td>${PatientUtils.escapeHtml(patient.breed || '-')}</td>
                    <td>${PatientUtils.escapeHtml(patient.owner.name)}</td>
                    <td>${PatientUtils.escapeHtml(patient.owner.phone)}</td>
                    <td>${patient.lastVisit ? PatientUtils.formatDate(patient.lastVisit) : '-'}</td>
                    <td><span class="status-cell ${status.class}">${status.label}</span></td>
                    <td class="action-cell">
                        <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); patientenManager.viewPatientBehandlungsbuch('${patient.id}')" title="Behandlungsbuch">
                            Behandlungsbuch
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); patientenManager.editPatient('${patient.id}')" title="Bearbeiten">
                            Bearbeiten
                        </button>
                        <button class="btn btn-sm btn-error" onclick="event.stopPropagation(); patientenManager.deletePatient('${patient.id}')" title="Löschen">
                            Löschen
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    editPatient(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (patient) {
            this.openModal(patient);
        }
    }
    
    // Patient Detail Modal Methods
    openPatientDetail(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (patient) {
            this.currentPatient = patient;
            this.renderPatientDetail(patient);
            if (this.detailModal) {
                this.detailModal.classList.add('active');
            }
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeDetailModal() {
        if (this.detailModal) {
            this.detailModal.classList.remove('active');
        }
        document.body.style.overflow = '';
        this.currentPatient = null;
    }
    
    // Behandlungsbuch Modal Methods
    openBehandlungsbuch() {
        if (!this.currentPatient) return;
        
        if (this.behandlungsbuchPatientName) {
            this.behandlungsbuchPatientName.textContent = this.currentPatient.name;
        }
        this.renderTreatmentHistory();
        if (this.behandlungsbuchModal) {
            this.behandlungsbuchModal.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        const dateInput = this.treatmentForm?.querySelector('[name="treatmentDate"]');
        if (dateInput) {
            dateInput.value = today;
        }
    }
    
    viewPatientBehandlungsbuch(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) {
            this.showAlert('Patient nicht gefunden', 'error');
            return;
        }
        
        // Set the current patient for the modal
        this.currentPatient = patient;
        
        // Update modal title with patient name
        if (this.behandlungsbuchPatientName) {
            this.behandlungsbuchPatientName.textContent = patient.name;
        }
        
        // Pre-select the patient in the dropdown
        const patientSelect = PatientUtils.safeQuerySelector('#treatmentPatient');
        if (patientSelect) {
            patientSelect.value = patient.id;
        }
        
        // Render treatment history for this patient
        this.renderTreatmentHistory();
        
        // Show the modal
        if (this.behandlungsbuchModal) {
            this.behandlungsbuchModal.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        const dateInput = this.treatmentForm?.querySelector('[name="treatmentDate"]');
        if (dateInput) {
            dateInput.value = today;
        }
    }
    
    closeBehandlungsbuchModal() {
        if (this.behandlungsbuchModal) {
            this.behandlungsbuchModal.classList.remove('active');
        }
        document.body.style.overflow = '';
        this.clearTreatmentForm();
    }
    
    clearTreatmentForm() {
        if (!this.treatmentForm) return;
        
        this.treatmentForm.reset();
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        const dateInput = this.treatmentForm.querySelector('[name="treatmentDate"]');
        if (dateInput) {
            dateInput.value = today;
        }
    }
    
    populatePatientDropdown(selectedId = '') {
        const patientSelect = PatientUtils.safeQuerySelector('#treatmentPatient');
        if (!patientSelect) return;
        
        // Clear existing options
        patientSelect.innerHTML = '<option value="">Patient auswählen</option>';
        
        // Add patient options
        this.patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.name} (${patient.species}) - ${patient.owner.name}`;
            if (patient.id === selectedId) {
                option.selected = true;
            }
            patientSelect.appendChild(option);
        });
    }
    

    
    renderPatientDetail(patient) {
        if (!this.patientDetailContent || !patient) return;
        
        const content = `
            <div class="patient-detail-grid">
                <div class="detail-section">
                    <h3>Patienteninformationen</h3>
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${PatientUtils.escapeHtml(patient.name)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tierart:</span>
                        <span class="detail-value">${PatientUtils.escapeHtml(patient.species)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Rasse:</span>
                        <span class="detail-value">${PatientUtils.escapeHtml(patient.breed || '-')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Geschlecht:</span>
                        <span class="detail-value">${PatientUtils.escapeHtml(patient.gender || '-')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Geburtsdatum:</span>
                        <span class="detail-value">${patient.birthDate ? PatientUtils.formatDate(patient.birthDate) : '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Gewicht:</span>
                        <span class="detail-value">${patient.weight ? `${patient.weight} kg` : '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Farbe:</span>
                        <span class="detail-value">${PatientUtils.escapeHtml(patient.color || '-')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Chip-Nummer:</span>
                        <span class="detail-value">${PatientUtils.escapeHtml(patient.microchip || '-')}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Besitzerinformationen</h3>
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${PatientUtils.escapeHtml(patient.owner.name)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Telefon:</span>
                        <span class="detail-value">${PatientUtils.escapeHtml(patient.owner.phone)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">E-Mail:</span>
                        <span class="detail-value">${PatientUtils.escapeHtml(patient.owner.email || '-')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Adresse:</span>
                        <span class="detail-value">${PatientUtils.escapeHtml(patient.owner.address || '-')}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Medizinische Informationen</h3>
                    <div class="detail-row">
                        <span class="detail-label">Allergien:</span>
                        <span class="detail-value">${PatientUtils.escapeHtml(patient.allergies || '-')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Aktuelle Medikamente:</span>
                        <span class="detail-value">${PatientUtils.escapeHtml(patient.medications || '-')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Notizen:</span>
                        <span class="detail-value">${PatientUtils.escapeHtml(patient.notes || '-')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Letzter Besuch:</span>
                        <span class="detail-value">${patient.lastVisit ? PatientUtils.formatDate(patient.lastVisit) : '-'}</span>
                    </div>
                </div>
            </div>
        `;
        
        this.patientDetailContent.innerHTML = content;
    }
    
    viewPatientData() {
        this.showAlert('Patientendaten werden angezeigt', 'info');
    }
    
    editFromDetail() {
        this.closeDetailModal();
        this.openModal(this.currentPatient);
    }
    
    bookAppointment() {
        if (this.currentPatient) {
            this.showAlert(`Terminbuchung wird für ${this.currentPatient.name} geöffnet...`, 'info');
        }
    }
    
    sendReminder() {
        if (this.currentPatient) {
            this.showAlert(`Erinnerung wird an ${this.currentPatient.owner.name} gesendet`, 'success');
        }
    }
    
    // Treatment Form Methods
    handleTreatmentFormSubmit(e) {
        e.preventDefault();
        
        if (!this.treatmentForm) return;
        
        const formData = new FormData(this.treatmentForm);
        const treatmentData = {
            patientId: formData.get('treatmentPatient'),
            date: formData.get('treatmentDate'),
            type: formData.get('treatmentType'),
            title: formData.get('treatmentTitle'),
            description: formData.get('treatmentDescription') || '',
            medication: formData.get('treatmentMedication') || '',
            dosage: formData.get('treatmentDosage') || '',
            vet: formData.get('treatmentVet') || '',
            cost: parseFloat(formData.get('treatmentCost')) || 0,
            notes: formData.get('treatmentNotes') || ''
        };
        
        // Validate form using utility
        const validation = ValidationUtils.validateTreatmentForm(treatmentData);
        if (!validation.isValid) {
            this.showAlert('Bitte füllen Sie alle erforderlichen Felder aus', 'error');
            return;
        }
        
        // Add treatment to patient
        const result = this.addTreatmentToPatient(treatmentData.patientId, treatmentData);
        if (result) {
            this.showAlert('Behandlung erfolgreich hinzugefügt', 'success');
            
            // Update current patient if it's the same
            if (this.currentPatient && this.currentPatient.id === treatmentData.patientId) {
                this.currentPatient = result;
            }
            
            // Re-render treatment history
            this.renderTreatmentHistory();
        } else {
            this.showAlert('Fehler beim Hinzufügen der Behandlung', 'error');
        }
    }
    
    addTreatmentToPatient(patientId, treatmentData) {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) {
            this.showAlert('Patient nicht gefunden', 'error');
            return null;
        }

        // Initialize treatments array if it doesn't exist
        if (!patient.treatments) {
            patient.treatments = [];
        }

        const treatment = {
            id: PatientUtils.generateId(),
            ...treatmentData,
            createdAt: new Date().toISOString()
        };

        patient.treatments.unshift(treatment);
        
        // Update last visit
        patient.lastVisit = treatment.date;
        
        // Update patient in the main list
        const patientIndex = this.patients.findIndex(p => p.id === patientId);
        if (patientIndex !== -1) {
            this.patients[patientIndex] = patient;
            this.savePatients();
            return patient;
        }
        
        return null;
    }
    
    renderTreatmentHistory() {
        if (!this.treatmentList || !this.noTreatments) return;
        
        if (!this.currentPatient || !this.currentPatient.treatments || this.currentPatient.treatments.length === 0) {
            this.treatmentList.style.display = 'none';
            this.noTreatments.style.display = 'block';
            return;
        }
        
        this.treatmentList.style.display = 'block';
        this.noTreatments.style.display = 'none';
        
        const treatments = this.currentPatient.treatments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.treatmentList.innerHTML = treatments.map(treatment => `
            <div class="treatment-item">
                <div class="treatment-header">
                    <div class="treatment-date">${PatientUtils.formatDate(treatment.date)}</div>
                    <div class="treatment-type-badge treatment-type-${treatment.type}">${PatientUtils.getTreatmentTypeLabel(treatment.type)}</div>
                </div>
                <div class="treatment-content">
                    <h4 class="treatment-title">${PatientUtils.escapeHtml(treatment.title)}</h4>
                    ${treatment.description ? `<p class="treatment-description">${PatientUtils.escapeHtml(treatment.description)}</p>` : ''}
                    
                    <div class="treatment-details">
                        ${treatment.medication ? `
                            <div class="treatment-detail">
                                <strong>Medikamente:</strong> ${PatientUtils.escapeHtml(treatment.medication)}
                            </div>
                        ` : ''}
                        ${treatment.dosage ? `
                            <div class="treatment-detail">
                                <strong>Dosierung:</strong> ${PatientUtils.escapeHtml(treatment.dosage)}
                            </div>
                        ` : ''}
                        ${treatment.vet ? `
                            <div class="treatment-detail">
                                <strong>Tierarzt:</strong> ${PatientUtils.escapeHtml(treatment.vet)}
                            </div>
                        ` : ''}
                        ${treatment.cost > 0 ? `
                            <div class="treatment-detail">
                                <strong>Kosten:</strong> ${treatment.cost.toFixed(2)} €
                            </div>
                        ` : ''}
                        ${treatment.notes ? `
                            <div class="treatment-detail">
                                <strong>Notizen:</strong> ${PatientUtils.escapeHtml(treatment.notes)}
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="treatment-actions">
                    <button class="btn btn-sm btn-secondary" onclick="patientenManager.editTreatment('${treatment.id}')">
                        Bearbeiten
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="patientenManager.deleteTreatment('${treatment.id}')">
                        Löschen
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    editTreatment(treatmentId) {
        // TODO: Implement treatment editing
        this.showAlert('Behandlung bearbeiten - Feature in Entwicklung', 'info');
    }
    
    deleteTreatment(treatmentId) {
        if (!this.currentPatient || !this.currentPatient.treatments) return;
        
        if (confirm('Sind Sie sicher, dass Sie diese Behandlung löschen möchten?')) {
            const initialLength = this.currentPatient.treatments.length;
            this.currentPatient.treatments = this.currentPatient.treatments.filter(t => t.id !== treatmentId);
            
            if (this.currentPatient.treatments.length !== initialLength) {
                // Update last visit to most recent treatment
                if (this.currentPatient.treatments.length > 0) {
                    this.currentPatient.lastVisit = this.currentPatient.treatments[0].date;
                } else {
                    this.currentPatient.lastVisit = null;
                }
                
                // Update patient in the main list
                const patientIndex = this.patients.findIndex(p => p.id === this.currentPatient.id);
                if (patientIndex !== -1) {
                    this.patients[patientIndex] = this.currentPatient;
                    this.savePatients();
                }
                
                this.renderTreatmentHistory();
                this.showAlert('Behandlung erfolgreich gelöscht', 'success');
            }
        }
    }
    
    updateEmptyState() {
        if (!this.patientsTable || !this.noPatients) return;
        
        if (this.patients.length === 0) {
            this.patientsTable.style.display = 'none';
            this.noPatients.style.display = 'block';
        } else {
            this.patientsTable.style.display = 'table';
            this.noPatients.style.display = 'none';
        }
    }
    
    updateTablePagination(totalItems) {
        if (!this.tablePaginationInfo || !this.tablePaginationControls) return;
        
        this.tablePaginationInfo.textContent = `Zeige 1-${totalItems} von ${totalItems} Ergebnissen`;
        
        this.tablePaginationControls.innerHTML = `
            <button class="table-pagination-btn" disabled>‹</button>
            <button class="table-pagination-btn active">1</button>
            <button class="table-pagination-btn" disabled>›</button>
        `;
    }
    
    showAlert(message, type = 'info') {
        if (!this.alertContainer) return;
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span class="alert-message">${PatientUtils.escapeHtml(message)}</span>
            <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        this.alertContainer.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }
    
    // Local Storage
    savePatients() {
        return StorageUtils.save('vetmates_patients', this.patients);
    }



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
        
        const filteredPatients = this.patients.filter(patient => {
            const searchTerm = filters.searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                patient.name.toLowerCase().includes(searchTerm) ||
                patient.owner.name.toLowerCase().includes(searchTerm) ||
                patient.owner.phone.toLowerCase().includes(searchTerm) ||
                (patient.breed && patient.breed.toLowerCase().includes(searchTerm));

            const matchesSpecies = !filters.species || patient.species === filters.species;
            const matchesStatus = !filters.status || PatientUtils.getPatientStatus(patient).label === filters.status;
            const matchesGender = !filters.gender || patient.gender === filters.gender;

            return matchesSearch && matchesSpecies && matchesStatus && matchesGender;
        });
        
        const sortedPatients = this.sortPatients(filteredPatients, columnIndex, direction);
        this.renderPatientsTable(sortedPatients);
    }

    sortPatients(patients, columnIndex, direction) {
        const sortedPatients = [...patients];
        
        sortedPatients.sort((a, b) => {
            let aValue, bValue;
            
            switch(columnIndex) {
                case 0: // Patient Name
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 1: // Species
                    aValue = a.species.toLowerCase();
                    bValue = b.species.toLowerCase();
                    break;
                case 2: // Breed
                    aValue = (a.breed || '').toLowerCase();
                    bValue = (b.breed || '').toLowerCase();
                    break;
                case 3: // Owner
                    aValue = a.owner.name.toLowerCase();
                    bValue = b.owner.name.toLowerCase();
                    break;
                case 4: // Phone
                    aValue = a.owner.phone.toLowerCase();
                    bValue = b.owner.phone.toLowerCase();
                    break;
                case 5: // Last Visit
                    aValue = new Date(a.lastVisit || 0).getTime();
                    bValue = new Date(b.lastVisit || 0).getTime();
                    break;
                case 6: // Status
                    aValue = PatientUtils.getPatientStatus(a).label.toLowerCase();
                    bValue = PatientUtils.getPatientStatus(b).label.toLowerCase();
                    break;
                default:
                    return 0;
            }
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return direction === 'asc' 
                    ? aValue.localeCompare(bValue, 'de-DE')
                    : bValue.localeCompare(aValue, 'de-DE');
            } else {
                return direction === 'asc' ? aValue - bValue : bValue - aValue;
            }
        });
        
        return sortedPatients;
    }



    exportPatients() {
        const filters = {
            searchTerm: this.patientSearchFilter?.value || this.searchInput?.value || '',
            species: this.speciesFilter?.value || '',
            status: this.statusFilter?.value || '',
            gender: this.genderFilter?.value || ''
        };
        
        const filteredPatients = this.patients.filter(patient => {
            const searchTerm = filters.searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                patient.name.toLowerCase().includes(searchTerm) ||
                patient.owner.name.toLowerCase().includes(searchTerm) ||
                patient.owner.phone.toLowerCase().includes(searchTerm) ||
                (patient.breed && patient.breed.toLowerCase().includes(searchTerm));

            const matchesSpecies = !filters.species || patient.species === filters.species;
            const matchesStatus = !filters.status || PatientUtils.getPatientStatus(patient).label === filters.status;
            const matchesGender = !filters.gender || patient.gender === filters.gender;

            return matchesSearch && matchesSpecies && matchesStatus && matchesGender;
        });
        
        const csvContent = this.generatePatientCSV(filteredPatients);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `patienten_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }

    generatePatientCSV(patients) {
        const headers = ['Name', 'Tierart', 'Rasse', 'Geschlecht', 'Besitzer', 'Telefon', 'E-Mail', 'Letzter Besuch', 'Status'];
        const rows = patients.map(patient => [
            patient.name,
            patient.species,
            patient.breed || '',
            patient.gender || '',
            patient.owner.name,
            patient.owner.phone,
            patient.owner.email || '',
            patient.lastVisit ? PatientUtils.formatDate(patient.lastVisit) : '',
            PatientUtils.getPatientStatus(patient).label
        ]);
        
        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }

    printPatients() {
        const filters = {
            searchTerm: this.patientSearchFilter?.value || this.searchInput?.value || '',
            species: this.speciesFilter?.value || '',
            status: this.statusFilter?.value || '',
            gender: this.genderFilter?.value || ''
        };
        
        const filteredPatients = this.patients.filter(patient => {
            const searchTerm = filters.searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                patient.name.toLowerCase().includes(searchTerm) ||
                patient.owner.name.toLowerCase().includes(searchTerm) ||
                patient.owner.phone.toLowerCase().includes(searchTerm) ||
                (patient.breed && patient.breed.toLowerCase().includes(searchTerm));

            const matchesSpecies = !filters.species || patient.species === filters.species;
            const matchesStatus = !filters.status || PatientUtils.getPatientStatus(patient).label === filters.status;
            const matchesGender = !filters.gender || patient.gender === filters.gender;

            return matchesSearch && matchesSpecies && matchesStatus && matchesGender;
        });
        
        this.printPatientList(filteredPatients);
    }

    generateReport() {
        const filters = {
            searchTerm: this.patientSearchFilter?.value || this.searchInput?.value || '',
            species: this.speciesFilter?.value || '',
            status: this.statusFilter?.value || '',
            gender: this.genderFilter?.value || ''
        };
        
        const filteredPatients = this.patients.filter(patient => {
            const searchTerm = filters.searchTerm.toLowerCase();
            const matchesSearch = !searchTerm || 
                patient.name.toLowerCase().includes(searchTerm) ||
                patient.owner.name.toLowerCase().includes(searchTerm) ||
                patient.owner.phone.toLowerCase().includes(searchTerm) ||
                (patient.breed && patient.breed.toLowerCase().includes(searchTerm));

            const matchesSpecies = !filters.species || patient.species === filters.species;
            const matchesStatus = !filters.status || PatientUtils.getPatientStatus(patient).label === filters.status;
            const matchesGender = !filters.gender || patient.gender === filters.gender;

            return matchesSearch && matchesSpecies && matchesStatus && matchesGender;
        });
        
        const reportData = this.analyzePatientData(filteredPatients);
        this.generatePatientReport(reportData);
    }

    analyzePatientData(patients) {
        const totalPatients = patients.length;
        const activePatients = patients.filter(p => PatientUtils.getPatientStatus(p).class === 'active').length;
        const newPatients = patients.filter(p => PatientUtils.getPatientStatus(p).class === 'info').length;
        
        const speciesCount = new Set(patients.map(p => p.species)).size;
        const speciesDistribution = {};
        
        patients.forEach(patient => {
            speciesDistribution[patient.species] = (speciesDistribution[patient.species] || 0) + 1;
        });
        
        return {
            totalPatients,
            activePatients,
            newPatients,
            speciesCount,
            speciesDistribution
        };
    }

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
