// Data management for patient system

import { StorageUtils, PatientUtils } from './utils.js';

export class PatientDataManager {
    constructor() {
        this.patients = this.loadPatients();
        this.currentPatient = null;
        this.isEditing = false;
    }

    /**
     * Load patients from localStorage
     * @returns {Array} Array of patients
     */
    loadPatients() {
        return StorageUtils.load('vetmates_patients', []);
    }

    /**
     * Save patients to localStorage
     */
    savePatients() {
        return StorageUtils.save('vetmates_patients', this.patients);
    }

    /**
     * Add a new patient
     * @param {Object} patientData - Patient data
     * @returns {Object} Created patient
     */
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
        return newPatient;
    }

    /**
     * Update an existing patient
     * @param {string} patientId - Patient ID
     * @param {Object} patientData - Updated patient data
     * @returns {Object|null} Updated patient or null if not found
     */
    updatePatient(patientId, patientData) {
        const index = this.patients.findIndex(p => p.id === patientId);
        if (index === -1) return null;
        
        this.patients[index] = { 
            ...this.patients[index], 
            ...patientData,
            lastVisit: this.patients[index].lastVisit // Preserve last visit
        };
        
        this.savePatients();
        return this.patients[index];
    }

    /**
     * Delete a patient
     * @param {string} patientId - Patient ID
     * @returns {boolean} Success status
     */
    deletePatient(patientId) {
        const initialLength = this.patients.length;
        this.patients = this.patients.filter(p => p.id !== patientId);
        
        if (this.patients.length !== initialLength) {
            this.savePatients();
            return true;
        }
        return false;
    }

    /**
     * Get patient by ID
     * @param {string} patientId - Patient ID
     * @returns {Object|null} Patient or null if not found
     */
    getPatient(patientId) {
        return this.patients.find(p => p.id === patientId) || null;
    }

    /**
     * Get all patients
     * @returns {Array} All patients
     */
    getAllPatients() {
        return [...this.patients];
    }

    /**
     * Filter patients based on criteria
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered patients
     */
    filterPatients(filters = {}) {
        const {
            searchTerm = '',
            species = '',
            status = '',
            gender = ''
        } = filters;

        return this.patients.filter(patient => {
            // Search term filter
            const matchesSearch = !searchTerm || 
                patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.owner.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (patient.breed && patient.breed.toLowerCase().includes(searchTerm.toLowerCase()));

            // Species filter
            const matchesSpecies = !species || patient.species === species;

            // Status filter
            const matchesStatus = !status || PatientUtils.getPatientStatus(patient).label === status;

            // Gender filter
            const matchesGender = !gender || patient.gender === gender;

            return matchesSearch && matchesSpecies && matchesStatus && matchesGender;
        });
    }

    /**
     * Sort patients by column
     * @param {Array} patients - Patients to sort
     * @param {number} columnIndex - Column index to sort by
     * @param {string} direction - Sort direction ('asc' or 'desc')
     * @returns {Array} Sorted patients
     */
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

    /**
     * Add treatment to patient
     * @param {string} patientId - Patient ID
     * @param {Object} treatmentData - Treatment data
     * @returns {Object|null} Updated patient or null if not found
     */
    addTreatmentToPatient(patientId, treatmentData) {
        const patient = this.getPatient(patientId);
        if (!patient) return null;

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
        
        return this.updatePatient(patientId, patient);
    }

    /**
     * Delete treatment from patient
     * @param {string} patientId - Patient ID
     * @param {string} treatmentId - Treatment ID
     * @returns {Object|null} Updated patient or null if not found
     */
    deleteTreatmentFromPatient(patientId, treatmentId) {
        const patient = this.getPatient(patientId);
        if (!patient || !patient.treatments) return null;

        const initialLength = patient.treatments.length;
        patient.treatments = patient.treatments.filter(t => t.id !== treatmentId);
        
        if (patient.treatments.length !== initialLength) {
            // Update last visit to most recent treatment
            if (patient.treatments.length > 0) {
                patient.lastVisit = patient.treatments[0].date;
            } else {
                patient.lastVisit = null;
            }
            
            return this.updatePatient(patientId, patient);
        }
        
        return null;
    }

    /**
     * Get patient statistics
     * @param {Array} patients - Patients to analyze
     * @returns {Object} Statistics object
     */
    getPatientStatistics(patients = this.patients) {
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

    /**
     * Export patients to CSV
     * @param {Array} patients - Patients to export
     * @returns {string} CSV content
     */
    exportPatientsToCSV(patients) {
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

    /**
     * Set current patient
     * @param {Object} patient - Patient object
     */
    setCurrentPatient(patient) {
        this.currentPatient = patient;
    }

    /**
     * Get current patient
     * @returns {Object|null} Current patient
     */
    getCurrentPatient() {
        return this.currentPatient;
    }

    /**
     * Clear current patient
     */
    clearCurrentPatient() {
        this.currentPatient = null;
    }

    /**
     * Set editing mode
     * @param {boolean} isEditing - Editing state
     */
    setEditingMode(isEditing) {
        this.isEditing = isEditing;
    }

    /**
     * Get editing mode
     * @returns {boolean} Editing state
     */
    getEditingMode() {
        return this.isEditing;
    }
} 