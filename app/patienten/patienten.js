// Patienten Page JavaScript

class PatientenManager {
    constructor() {
        this.patients = this.loadPatients();
        this.currentPatient = null;
        this.isEditing = false;
        
        this.initializeElements();
        this.bindEvents();
        this.renderPatients();
        this.updateEmptyState();
    }
    
    initializeElements() {
        // Modal elements
        this.modal = document.getElementById('patientModal');
        this.modalContent = this.modal.querySelector('.modal-content');
        this.closeModalBtn = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        
        // Patient detail modal elements
        this.detailModal = document.getElementById('patientDetailModal');
        this.closeDetailModalBtn = document.getElementById('closeDetailModal');
        this.patientDetailContent = document.getElementById('patientDetailContent');
        
        // Behandlungsbuch modal elements
        this.behandlungsbuchModal = document.getElementById('behandlungsbuchModal');
        this.closeBehandlungsbuchModalBtn = document.getElementById('closeBehandlungsbuchModal');
        this.behandlungsbuchPatientName = document.getElementById('behandlungsbuchPatientName');
        this.treatmentForm = document.getElementById('treatmentForm');
        this.treatmentList = document.getElementById('treatmentList');
        this.noTreatments = document.getElementById('noTreatments');
        
        // Inline Behandlungsbuch elements
        this.behandlungsbuchSection = document.getElementById('behandlungsbuchSection');
        this.showBehandlungsbuchBtn = document.getElementById('showBehandlungsbuchBtn');
        this.hideBehandlungsbuchBtn = document.getElementById('hideBehandlungsbuchBtn');
        this.treatmentFormInline = document.getElementById('treatmentFormInline');
        this.treatmentListInline = document.getElementById('treatmentListInline');
        this.noTreatmentsInline = document.getElementById('noTreatmentsInline');
        
        // Detail modal action buttons
        this.viewPatientBtn = document.getElementById('viewPatientBtn');
        this.editPatientBtn = document.getElementById('editPatientBtn');
        this.behandlungsbuchBtn = document.getElementById('behandlungsbuchBtn');
        this.bookAppointmentBtn = document.getElementById('bookAppointmentBtn');
        this.sendReminderBtn = document.getElementById('sendReminderBtn');
        
        // Form elements
        this.patientForm = document.getElementById('patientForm');
        this.formInputs = this.patientForm.querySelectorAll('input, select, textarea');
        
        // Action buttons
        this.addPatientBtn = document.getElementById('addPatientBtn');
        this.addFirstPatientBtn = document.getElementById('addFirstPatientBtn');
        this.addBehandlungsbuchBtn = document.getElementById('addBehandlungsbuchBtn');
        
        // Search and filter
        this.searchInput = document.getElementById('patientSearch');
        this.speciesFilter = document.getElementById('speciesFilter');
        
        // Table elements
        this.patientsTable = document.getElementById('patientsTable');
        this.patientsTableBody = document.getElementById('patientsTableBody');
        this.noPatients = document.getElementById('noPatients');
        
        // Alert container
        this.alertContainer = document.getElementById('alertContainer');
    }
    
    bindEvents() {
        // Modal events
        this.addPatientBtn.addEventListener('click', () => this.openModal());
        this.addFirstPatientBtn.addEventListener('click', () => this.openModal());
        this.addBehandlungsbuchBtn.addEventListener('click', () => this.openBehandlungsbuchModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        
        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Patient detail modal events
        this.closeDetailModalBtn.addEventListener('click', () => this.closeDetailModal());
        this.detailModal.addEventListener('click', (e) => {
            if (e.target === this.detailModal) {
                this.closeDetailModal();
            }
        });
        
        // Behandlungsbuch modal events
        this.closeBehandlungsbuchModalBtn.addEventListener('click', () => this.closeBehandlungsbuchModal());
        this.behandlungsbuchModal.addEventListener('click', (e) => {
            if (e.target === this.behandlungsbuchModal) {
                this.closeBehandlungsbuchModal();
            }
        });
        
        // Treatment form submission
        this.treatmentForm.addEventListener('submit', (e) => this.handleTreatmentFormSubmit(e));
        
        // Inline Behandlungsbuch events
        this.showBehandlungsbuchBtn.addEventListener('click', () => this.showInlineBehandlungsbuch());
        this.hideBehandlungsbuchBtn.addEventListener('click', () => this.hideInlineBehandlungsbuch());
        this.treatmentFormInline.addEventListener('submit', (e) => this.handleInlineTreatmentFormSubmit(e));
        
        // Detail modal action buttons
        this.viewPatientBtn.addEventListener('click', () => this.viewPatientData());
        this.editPatientBtn.addEventListener('click', () => this.editFromDetail());
        this.behandlungsbuchBtn.addEventListener('click', () => this.openBehandlungsbuch());
        this.bookAppointmentBtn.addEventListener('click', () => this.bookAppointment());
        this.sendReminderBtn.addEventListener('click', () => this.sendReminder());
        
        // Form submission
        this.patientForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Search and filter
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.speciesFilter.addEventListener('change', () => this.handleFilter());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
            if (e.key === 'Escape' && this.detailModal.classList.contains('active')) {
                this.closeDetailModal();
            }
            if (e.key === 'Escape' && this.behandlungsbuchModal.classList.contains('active')) {
                this.closeBehandlungsbuchModal();
            }
        });
    }
    
    // Modal Management
    openModal(patient = null) {
        this.currentPatient = patient;
        this.isEditing = !!patient;
        
        if (this.isEditing) {
            this.fillFormWithPatient(patient);
            this.modal.querySelector('.modal-title').textContent = 'Patient bearbeiten';
        } else {
            this.clearForm();
            this.modal.querySelector('.modal-title').textContent = 'Neuen Patienten hinzufügen';
        }
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        setTimeout(() => {
            this.patientForm.querySelector('input').focus();
        }, 100);
    }
    
    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentPatient = null;
        this.isEditing = false;
        this.clearForm();
    }
    
    openBehandlungsbuchModal() {
        // Clear any existing treatment form
        this.clearTreatmentForm();
        
        // Set the patient name to indicate it's a new treatment
        this.behandlungsbuchPatientName.textContent = 'Neue Behandlung';
        
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
        
        // Clear inline treatments
        this.inlineTreatments = [];
        this.hideInlineBehandlungsbuch();
    }
    
    fillFormWithPatient(patient) {
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
    validateForm() {
        let isValid = true;
        const errors = {};
        
        // Required fields
        const requiredFields = ['patientName', 'patientSpecies', 'ownerName', 'ownerPhone'];
        
        requiredFields.forEach(fieldName => {
            const input = this.patientForm.querySelector(`[name="${fieldName}"]`);
            const value = input.value.trim();
            
            if (!value) {
                errors[fieldName] = 'Dieses Feld ist erforderlich';
                isValid = false;
            }
        });
        
        // Email validation
        const emailInput = this.patientForm.querySelector('[name="ownerEmail"]');
        if (emailInput.value.trim() && !this.isValidEmail(emailInput.value)) {
            errors.ownerEmail = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
            isValid = false;
        }
        
        // Phone validation
        const phoneInput = this.patientForm.querySelector('[name="ownerPhone"]');
        if (phoneInput.value.trim() && !this.isValidPhone(phoneInput.value)) {
            errors.ownerPhone = 'Bitte geben Sie eine gültige Telefonnummer ein';
            isValid = false;
        }
        
        // Weight validation
        const weightInput = this.patientForm.querySelector('[name="patientWeight"]');
        if (weightInput.value && (isNaN(weightInput.value) || parseFloat(weightInput.value) < 0)) {
            errors.patientWeight = 'Bitte geben Sie ein gültiges Gewicht ein';
            isValid = false;
        }
        
        this.displayFormErrors(errors);
        return isValid;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        return phoneRegex.test(phone);
    }
    
    displayFormErrors(errors) {
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
                formGroup.classList.add('error');
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = errors[fieldName];
                formGroup.appendChild(errorMessage);
            }
        });
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        const formData = this.getFormData();
        
        if (this.isEditing) {
            this.updatePatient(this.currentPatient.id, formData);
        } else {
            this.addPatient(formData);
        }
        
        this.closeModal();
        this.showAlert('Patient erfolgreich gespeichert!', 'success');
    }
    
    getFormData() {
        const formData = {};
        this.formInputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.name] = input.checked;
            } else {
                formData[input.name] = input.value.trim();
            }
        });
        
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
            notes: formData.patientNotes,
            treatments: this.inlineTreatments || [],
            createdAt: this.isEditing ? this.currentPatient.createdAt : new Date().toISOString(),
            lastVisit: this.isEditing ? this.currentPatient.lastVisit : null
        };
    }
    
    // Patient Data Management
    addPatient(patientData) {
        const newPatient = {
            id: this.generateId(),
            ...patientData
        };
        
        this.patients.unshift(newPatient);
        this.savePatients();
        this.renderPatients();
        this.updateEmptyState();
    }
    
    updatePatient(patientId, patientData) {
        const index = this.patients.findIndex(p => p.id === patientId);
        if (index !== -1) {
            this.patients[index] = { ...this.patients[index], ...patientData };
            this.savePatients();
            this.renderPatients();
        }
    }
    
    deletePatient(patientId) {
        if (confirm('Sind Sie sicher, dass Sie diesen Patienten löschen möchten?')) {
            this.patients = this.patients.filter(p => p.id !== patientId);
            this.savePatients();
            this.renderPatients();
            this.updateEmptyState();
            this.showAlert('Patient erfolgreich gelöscht!', 'success');
        }
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Search and Filter
    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase();
        this.filterPatients();
    }
    
    handleFilter() {
        this.filterPatients();
    }
    
    filterPatients() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const speciesFilter = this.speciesFilter.value;
        
        const filteredPatients = this.patients.filter(patient => {
            const matchesSearch = !searchTerm || 
                patient.name.toLowerCase().includes(searchTerm) ||
                patient.owner.name.toLowerCase().includes(searchTerm) ||
                patient.breed?.toLowerCase().includes(searchTerm) ||
                patient.owner.phone.includes(searchTerm);
            
            const matchesSpecies = !speciesFilter || patient.species === speciesFilter;
            
            return matchesSearch && matchesSpecies;
        });
        
        this.renderPatientsTable(filteredPatients);
    }
    
    // Rendering
    renderPatients() {
        this.filterPatients();
    }
    
    renderPatientsTable(patients) {
        if (patients.length === 0) {
            this.patientsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data">
                        <div class="empty-state">
                            <p>Keine Patienten gefunden</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        this.patientsTableBody.innerHTML = patients.map(patient => `
            <tr class="patient-row" data-patient-id="${patient.id}" onclick="patientenManager.openPatientDetail('${patient.id}')">
                <td>
                    <span class="patient-name">${this.escapeHtml(patient.name)}</span>
                </td>
                <td>
                    <span class="patient-species">${this.escapeHtml(patient.species)}</span>
                </td>
                <td>${this.escapeHtml(patient.breed || '-')}</td>
                <td>${this.escapeHtml(patient.owner.name)}</td>
                <td>${this.escapeHtml(patient.owner.phone)}</td>
                <td>${patient.lastVisit ? this.formatDate(patient.lastVisit) : '-'}</td>
                <td>
                    <div class="patient-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-ghost btn-sm" onclick="patientenManager.editPatient('${patient.id}')" title="Bearbeiten">
                            Bearbeiten
                        </button>
                        <button class="btn btn-error btn-sm" onclick="patientenManager.deletePatient('${patient.id}')" title="Löschen">
                            Löschen
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
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
            this.detailModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeDetailModal() {
        this.detailModal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentPatient = null;
    }
    
    // Behandlungsbuch Modal Methods
    openBehandlungsbuch() {
        if (!this.currentPatient) return;
        
        this.behandlungsbuchPatientName.textContent = this.currentPatient.name;
        this.renderTreatmentHistory();
        this.behandlungsbuchModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        this.treatmentForm.querySelector('[name="treatmentDate"]').value = today;
    }
    
    closeBehandlungsbuchModal() {
        this.behandlungsbuchModal.classList.remove('active');
        document.body.style.overflow = '';
        this.clearTreatmentForm();
    }
    
    clearTreatmentForm() {
        this.treatmentForm.reset();
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        this.treatmentForm.querySelector('[name="treatmentDate"]').value = today;
    }
    
    // Inline Behandlungsbuch Methods
    showInlineBehandlungsbuch() {
        this.behandlungsbuchSection.style.display = 'block';
        this.showBehandlungsbuchBtn.style.display = 'none';
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        this.treatmentFormInline.querySelector('[name="treatmentDate"]').value = today;
        
        // Initialize empty treatments array for new patient
        this.inlineTreatments = [];
        this.renderInlineTreatmentHistory();
    }
    
    hideInlineBehandlungsbuch() {
        this.behandlungsbuchSection.style.display = 'none';
        this.showBehandlungsbuchBtn.style.display = 'inline-block';
        this.inlineTreatments = [];
    }
    
    handleInlineTreatmentFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.treatmentFormInline);
        const treatmentData = {
            id: this.generateId(),
            date: formData.get('treatmentDate'),
            type: formData.get('treatmentType'),
            title: formData.get('treatmentTitle'),
            description: formData.get('treatmentDescription') || '',
            medication: formData.get('treatmentMedication') || '',
            dosage: formData.get('treatmentDosage') || '',
            vet: formData.get('treatmentVet') || '',
            cost: parseFloat(formData.get('treatmentCost')) || 0,
            notes: formData.get('treatmentNotes') || '',
            createdAt: new Date().toISOString()
        };
        
        // Validate required fields
        if (!treatmentData.date || !treatmentData.type || !treatmentData.title) {
            this.showAlert('Bitte füllen Sie alle erforderlichen Felder aus', 'error');
            return;
        }
        
        // Add treatment to inline treatments
        this.addInlineTreatment(treatmentData);
        
        // Clear form and re-render
        this.clearInlineTreatmentForm();
        this.renderInlineTreatmentHistory();
        this.showAlert('Behandlung erfolgreich hinzugefügt', 'success');
    }
    
    addInlineTreatment(treatmentData) {
        if (!this.inlineTreatments) {
            this.inlineTreatments = [];
        }
        
        this.inlineTreatments.unshift(treatmentData);
    }
    
    clearInlineTreatmentForm() {
        this.treatmentFormInline.reset();
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        this.treatmentFormInline.querySelector('[name="treatmentDate"]').value = today;
    }
    
    renderInlineTreatmentHistory() {
        if (!this.inlineTreatments || this.inlineTreatments.length === 0) {
            this.treatmentListInline.style.display = 'none';
            this.noTreatmentsInline.style.display = 'block';
            return;
        }
        
        this.treatmentListInline.style.display = 'block';
        this.noTreatmentsInline.style.display = 'none';
        
        const treatments = this.inlineTreatments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.treatmentListInline.innerHTML = treatments.map(treatment => `
            <div class="treatment-item-inline">
                <div class="treatment-header-inline">
                    <div class="treatment-date-inline">${this.formatDate(treatment.date)}</div>
                    <div class="treatment-type-badge treatment-type-${treatment.type}">${this.getTreatmentTypeLabel(treatment.type)}</div>
                </div>
                <div class="treatment-content-inline">
                    <h5 class="treatment-title-inline">${this.escapeHtml(treatment.title)}</h5>
                    ${treatment.description ? `<p class="treatment-description-inline">${this.escapeHtml(treatment.description)}</p>` : ''}
                    
                    <div class="treatment-details-inline">
                        ${treatment.medication ? `
                            <div class="treatment-detail-inline">
                                <strong>Medikamente:</strong> ${this.escapeHtml(treatment.medication)}
                            </div>
                        ` : ''}
                        ${treatment.dosage ? `
                            <div class="treatment-detail-inline">
                                <strong>Dosierung:</strong> ${this.escapeHtml(treatment.dosage)}
                            </div>
                        ` : ''}
                        ${treatment.vet ? `
                            <div class="treatment-detail-inline">
                                <strong>Tierarzt:</strong> ${this.escapeHtml(treatment.vet)}
                            </div>
                        ` : ''}
                        ${treatment.cost > 0 ? `
                            <div class="treatment-detail-inline">
                                <strong>Kosten:</strong> ${treatment.cost.toFixed(2)} €
                            </div>
                        ` : ''}
                        ${treatment.notes ? `
                            <div class="treatment-detail-inline">
                                <strong>Notizen:</strong> ${this.escapeHtml(treatment.notes)}
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="treatment-actions-inline">
                    <button class="btn btn-sm btn-danger" onclick="patientenManager.deleteInlineTreatment('${treatment.id}')">
                        Löschen
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    deleteInlineTreatment(treatmentId) {
        if (!this.inlineTreatments) return;
        
        if (confirm('Sind Sie sicher, dass Sie diese Behandlung löschen möchten?')) {
            this.inlineTreatments = this.inlineTreatments.filter(t => t.id !== treatmentId);
            this.renderInlineTreatmentHistory();
            this.showAlert('Behandlung erfolgreich gelöscht', 'success');
        }
    }
    
    renderPatientDetail(patient) {
        const content = `
            <div class="patient-detail-grid">
                <div class="detail-section">
                    <h3>Patienteninformationen</h3>
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${this.escapeHtml(patient.name)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tierart:</span>
                        <span class="detail-value">${this.escapeHtml(patient.species)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Rasse:</span>
                        <span class="detail-value">${this.escapeHtml(patient.breed || '-')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Geschlecht:</span>
                        <span class="detail-value">${this.escapeHtml(patient.gender || '-')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Geburtsdatum:</span>
                        <span class="detail-value">${patient.birthDate ? this.formatDate(patient.birthDate) : '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Gewicht:</span>
                        <span class="detail-value">${patient.weight ? `${patient.weight} kg` : '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Farbe:</span>
                        <span class="detail-value">${this.escapeHtml(patient.color || '-')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Chip-Nummer:</span>
                        <span class="detail-value">${this.escapeHtml(patient.microchip || '-')}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Besitzerinformationen</h3>
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${this.escapeHtml(patient.owner.name)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Telefon:</span>
                        <span class="detail-value">${this.escapeHtml(patient.owner.phone)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">E-Mail:</span>
                        <span class="detail-value">${this.escapeHtml(patient.owner.email || '-')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Adresse:</span>
                        <span class="detail-value">${this.escapeHtml(patient.owner.address || '-')}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Medizinische Informationen</h3>
                    <div class="detail-row">
                        <span class="detail-label">Allergien:</span>
                        <span class="detail-value">${this.escapeHtml(patient.allergies || '-')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Aktuelle Medikamente:</span>
                        <span class="detail-value">${this.escapeHtml(patient.medications || '-')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Notizen:</span>
                        <span class="detail-value">${this.escapeHtml(patient.notes || '-')}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Letzter Besuch:</span>
                        <span class="detail-value">${patient.lastVisit ? this.formatDate(patient.lastVisit) : '-'}</span>
                    </div>
                </div>
            </div>
        `;
        
        this.patientDetailContent.innerHTML = content;
    }
    
    viewPatientData() {
        // This method can be used to show more detailed patient information
        // For now, we'll just show an alert
        this.showAlert('Patientendaten werden angezeigt', 'info');
    }
    
    editFromDetail() {
        this.closeDetailModal();
        this.openModal(this.currentPatient);
    }
    
    bookAppointment() {
        // This would typically redirect to the appointments page
        this.showAlert('Terminbuchung wird geöffnet...', 'info');
        // In a real application, you might redirect to the appointments page
        // window.location.href = '../termine/termine.html?patient=' + this.currentPatient.id;
    }
    
    sendReminder() {
        // This would typically send a reminder to the patient's owner
        this.showAlert('Erinnerung wird an ' + this.currentPatient.owner.name + ' gesendet', 'success');
    }
    
    // Treatment Form Methods
    handleTreatmentFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.treatmentForm);
        const treatmentData = {
            id: this.generateId(),
            date: formData.get('treatmentDate'),
            type: formData.get('treatmentType'),
            title: formData.get('treatmentTitle'),
            description: formData.get('treatmentDescription') || '',
            medication: formData.get('treatmentMedication') || '',
            dosage: formData.get('treatmentDosage') || '',
            vet: formData.get('treatmentVet') || '',
            cost: parseFloat(formData.get('treatmentCost')) || 0,
            notes: formData.get('treatmentNotes') || '',
            createdAt: new Date().toISOString()
        };
        
        // Validate required fields
        if (!treatmentData.date || !treatmentData.type || !treatmentData.title) {
            this.showAlert('Bitte füllen Sie alle erforderlichen Felder aus', 'error');
            return;
        }
        
        // Add treatment to patient
        this.addTreatmentToPatient(treatmentData);
        
        // Clear form and re-render
        this.clearTreatmentForm();
        this.renderTreatmentHistory();
        this.showAlert('Behandlung erfolgreich hinzugefügt', 'success');
    }
    
    addTreatmentToPatient(treatmentData) {
        if (!this.currentPatient) return;
        
        // Initialize treatments array if it doesn't exist
        if (!this.currentPatient.treatments) {
            this.currentPatient.treatments = [];
        }
        
        // Add treatment
        this.currentPatient.treatments.unshift(treatmentData); // Add to beginning
        
        // Update patient in the main list
        const patientIndex = this.patients.findIndex(p => p.id === this.currentPatient.id);
        if (patientIndex !== -1) {
            this.patients[patientIndex] = this.currentPatient;
            this.savePatients();
        }
    }
    
    renderTreatmentHistory() {
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
                    <div class="treatment-date">${this.formatDate(treatment.date)}</div>
                    <div class="treatment-type-badge treatment-type-${treatment.type}">${this.getTreatmentTypeLabel(treatment.type)}</div>
                </div>
                <div class="treatment-content">
                    <h4 class="treatment-title">${this.escapeHtml(treatment.title)}</h4>
                    ${treatment.description ? `<p class="treatment-description">${this.escapeHtml(treatment.description)}</p>` : ''}
                    
                    <div class="treatment-details">
                        ${treatment.medication ? `
                            <div class="treatment-detail">
                                <strong>Medikamente:</strong> ${this.escapeHtml(treatment.medication)}
                            </div>
                        ` : ''}
                        ${treatment.dosage ? `
                            <div class="treatment-detail">
                                <strong>Dosierung:</strong> ${this.escapeHtml(treatment.dosage)}
                            </div>
                        ` : ''}
                        ${treatment.vet ? `
                            <div class="treatment-detail">
                                <strong>Tierarzt:</strong> ${this.escapeHtml(treatment.vet)}
                            </div>
                        ` : ''}
                        ${treatment.cost > 0 ? `
                            <div class="treatment-detail">
                                <strong>Kosten:</strong> ${treatment.cost.toFixed(2)} €
                            </div>
                        ` : ''}
                        ${treatment.notes ? `
                            <div class="treatment-detail">
                                <strong>Notizen:</strong> ${this.escapeHtml(treatment.notes)}
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
    
    getTreatmentTypeLabel(type) {
        const labels = {
            'untersuchung': 'Untersuchung',
            'impfung': 'Impfung',
            'operation': 'Operation',
            'medikament': 'Medikament',
            'labor': 'Labor',
            'röntgen': 'Röntgen',
            'ultraschall': 'Ultraschall',
            'chirurgie': 'Chirurgie',
            'zahnbehandlung': 'Zahnbehandlung',
            'sonstiges': 'Sonstiges'
        };
        return labels[type] || type;
    }
    
    editTreatment(treatmentId) {
        // TODO: Implement treatment editing
        this.showAlert('Behandlung bearbeiten - Feature in Entwicklung', 'info');
    }
    
    deleteTreatment(treatmentId) {
        if (!this.currentPatient || !this.currentPatient.treatments) return;
        
        if (confirm('Sind Sie sicher, dass Sie diese Behandlung löschen möchten?')) {
            this.currentPatient.treatments = this.currentPatient.treatments.filter(t => t.id !== treatmentId);
            
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
    
    updateEmptyState() {
        if (this.patients.length === 0) {
            this.patientsTable.style.display = 'none';
            this.noPatients.style.display = 'block';
        } else {
            this.patientsTable.style.display = 'table';
            this.noPatients.style.display = 'none';
        }
    }
    
    // Utility Methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE');
    }
    
    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span class="alert-message">${message}</span>
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
    loadPatients() {
        try {
            const stored = localStorage.getItem('vetmates_patients');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading patients:', error);
            return [];
        }
    }
    
    savePatients() {
        try {
            localStorage.setItem('vetmates_patients', JSON.stringify(this.patients));
        } catch (error) {
            console.error('Error saving patients:', error);
        }
    }
}

// Initialize the patient manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.patientenManager = new PatientenManager();
});
