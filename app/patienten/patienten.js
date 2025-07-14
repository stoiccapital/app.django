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
        
        // Form elements
        this.patientForm = document.getElementById('patientForm');
        this.formInputs = this.patientForm.querySelectorAll('input, select, textarea');
        
        // Action buttons
        this.addPatientBtn = document.getElementById('addPatientBtn');
        this.addFirstPatientBtn = document.getElementById('addFirstPatientBtn');
        
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
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        
        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
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
                            <div class="empty-icon">🔍</div>
                            <p>Keine Patienten gefunden</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        this.patientsTableBody.innerHTML = patients.map(patient => `
            <tr>
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
                    <div class="patient-actions">
                        <button class="btn btn-ghost btn-sm" onclick="patientenManager.editPatient('${patient.id}')" title="Bearbeiten">
                            ✏️
                        </button>
                        <button class="btn btn-error btn-sm" onclick="patientenManager.deletePatient('${patient.id}')" title="Löschen">
                            🗑️
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
