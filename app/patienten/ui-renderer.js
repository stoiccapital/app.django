// UI rendering for patient system

import { PatientUtils } from './utils.js';

export class PatientUIRenderer {
    constructor() {
        this.initializeElements();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.elements = {
            // Forms
            patientForm: PatientUtils.safeQuerySelector('#patientForm'),
            treatmentForm: PatientUtils.safeQuerySelector('#treatmentForm'),
            
            // Tables
            patientsTable: PatientUtils.safeQuerySelector('#patientsTable'),
            patientsTableBody: PatientUtils.safeQuerySelector('#patientsTableBody'),
            
            // Lists
            treatmentList: PatientUtils.safeQuerySelector('#treatmentList'),
            noTreatments: PatientUtils.safeQuerySelector('#noTreatments'),
            
            // Empty states
            noPatients: PatientUtils.safeQuerySelector('#noPatients'),
            
            // Pagination
            tablePaginationInfo: PatientUtils.safeQuerySelector('#tablePaginationInfo'),
            tablePaginationControls: PatientUtils.safeQuerySelector('#tablePaginationControls'),
            
            // Alerts
            alertContainer: PatientUtils.safeQuerySelector('#alertContainer')
        };
    }

    /**
     * Render patients table
     * @param {Array} patients - Patients to render
     */
    renderPatientsTable(patients) {
        if (!this.elements.patientsTableBody) return;

        if (patients.length === 0) {
            this.renderEmptyTable();
            return;
        }

        this.elements.patientsTableBody.innerHTML = patients.map(patient => 
            this.createPatientTableRow(patient)
        ).join('');
    }

    /**
     * Create a single patient table row
     * @param {Object} patient - Patient data
     * @returns {string} HTML row
     */
    createPatientTableRow(patient) {
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
    }

    /**
     * Render empty table state
     */
    renderEmptyTable() {
        if (!this.elements.patientsTableBody) return;

        this.elements.patientsTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="table-empty">
                    <div class="table-empty-icon">🐾</div>
                    <h3 class="table-empty-title">Keine Patienten gefunden</h3>
                    <p class="table-empty-description">Versuchen Sie andere Suchkriterien oder fügen Sie einen neuen Patienten hinzu.</p>
                </td>
            </tr>
        `;
    }

    /**
     * Render patient detail modal
     * @param {Object} patient - Patient data
     * @param {Element} container - Container element
     */
    renderPatientDetail(patient, container) {
        if (!container) return;

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
        
        container.innerHTML = content;
    }

    /**
     * Render treatment history
     * @param {Array} treatments - Treatments to render
     */
    renderTreatmentHistory(treatments) {
        if (!this.elements.treatmentList || !this.elements.noTreatments) return;

        if (!treatments || treatments.length === 0) {
            this.elements.treatmentList.style.display = 'none';
            this.elements.noTreatments.style.display = 'block';
            return;
        }

        this.elements.treatmentList.style.display = 'block';
        this.elements.noTreatments.style.display = 'none';

        const sortedTreatments = treatments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.elements.treatmentList.innerHTML = sortedTreatments.map(treatment => 
            this.createTreatmentItem(treatment)
        ).join('');
    }

    /**
     * Create a single treatment item
     * @param {Object} treatment - Treatment data
     * @returns {string} HTML treatment item
     */
    createTreatmentItem(treatment) {
        return `
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
        `;
    }

    /**
     * Update table pagination
     * @param {number} totalItems - Total number of items
     */
    updateTablePagination(totalItems) {
        if (!this.elements.tablePaginationInfo || !this.elements.tablePaginationControls) return;

        this.elements.tablePaginationInfo.textContent = `Zeige 1-${totalItems} von ${totalItems} Ergebnissen`;
        
        this.elements.tablePaginationControls.innerHTML = `
            <button class="table-pagination-btn" disabled>‹</button>
            <button class="table-pagination-btn active">1</button>
            <button class="table-pagination-btn" disabled>›</button>
        `;
    }

    /**
     * Update empty state visibility
     * @param {boolean} hasPatients - Whether there are patients
     */
    updateEmptyState(hasPatients) {
        if (!this.elements.patientsTable || !this.elements.noPatients) return;

        if (hasPatients) {
            this.elements.patientsTable.style.display = 'table';
            this.elements.noPatients.style.display = 'none';
        } else {
            this.elements.patientsTable.style.display = 'none';
            this.elements.noPatients.style.display = 'block';
        }
    }

    /**
     * Show alert message
     * @param {string} message - Alert message
     * @param {string} type - Alert type (success, error, warning, info)
     */
    showAlert(message, type = 'info') {
        if (!this.elements.alertContainer) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span class="alert-message">${PatientUtils.escapeHtml(message)}</span>
            <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        this.elements.alertContainer.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }

    /**
     * Clear form
     * @param {Element} form - Form element
     */
    clearForm(form) {
        if (!form) return;

        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });

        // Remove error states
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error', 'success');
        });
    }

    /**
     * Fill form with patient data
     * @param {Element} form - Form element
     * @param {Object} patient - Patient data
     */
    fillFormWithPatient(form, patient) {
        if (!form || !patient) return;

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
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = formData[key];
            }
        });
    }

    /**
     * Display form errors
     * @param {Element} form - Form element
     * @param {Object} errors - Error object
     */
    displayFormErrors(form, errors) {
        if (!form) return;

        // Clear previous errors
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
            const errorMessage = group.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });

        // Display new errors
        Object.keys(errors).forEach(fieldName => {
            const input = form.querySelector(`[name="${fieldName}"]`);
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

    /**
     * Populate patient dropdown
     * @param {Element} select - Select element
     * @param {Array} patients - Patients array
     * @param {string} selectedId - Selected patient ID
     */
    populatePatientDropdown(select, patients, selectedId = '') {
        if (!select) return;

        // Clear existing options
        select.innerHTML = '<option value="">Patient auswählen</option>';

        // Add patient options
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.name} (${patient.species}) - ${patient.owner.name}`;
            if (patient.id === selectedId) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    /**
     * Get form data
     * @param {Element} form - Form element
     * @returns {Object} Form data object
     */
    getFormData(form) {
        if (!form) return {};

        const formData = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.name] = input.checked;
            } else {
                formData[input.name] = input.value.trim();
            }
        });

        return formData;
    }
} 