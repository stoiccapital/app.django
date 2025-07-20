// Utility functions for patient management

export class PatientUtils {
    /**
     * Safely escape HTML content to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML
     */
    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Format date to German locale
     * @param {string|Date} dateString - Date to format
     * @returns {string} Formatted date
     */
    static formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE');
    }

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    static isValidEmail(email) {
        if (!email) return true; // Optional field
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone format
     * @param {string} phone - Phone to validate
     * @returns {boolean} Is valid phone
     */
    static isValidPhone(phone) {
        if (!phone) return false; // Required field
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Get species icon
     * @param {string} species - Species name
     * @returns {string} Emoji icon
     */
    static getSpeciesIcon(species) {
        const icons = {
            'hund': '🐕',
            'katze': '🐱',
            'pferd': '🐎',
            'kleintier': '🐰',
            'vogel': '🦜',
            'exot': '🦎',
            'sonstiges': '🐾'
        };
        return icons[species] || '🐾';
    }

    /**
     * Get treatment type label
     * @param {string} type - Treatment type
     * @returns {string} Human readable label
     */
    static getTreatmentTypeLabel(type) {
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

    /**
     * Get patient status class and label
     * @param {Object} patient - Patient object
     * @returns {Object} Status class and label
     */
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

    /**
     * Safe DOM element selector with null check
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (optional)
     * @returns {Element|null} DOM element or null
     */
    static safeQuerySelector(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return null;
        }
    }

    /**
     * Safe DOM element selector all with null check
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (optional)
     * @returns {NodeList|[]} DOM elements or empty array
     */
    static safeQuerySelectorAll(selector, parent = document) {
        try {
            return parent.querySelectorAll(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return [];
        }
    }
}

export class StorageUtils {
    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Parsed data or default value
     */
    static load(key, defaultValue = []) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {*} data - Data to save
     * @returns {boolean} Success status
     */
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

export class ValidationUtils {
    /**
     * Validate patient form data
     * @param {Object} formData - Form data object
     * @returns {Object} Validation result with errors
     */
    static validatePatientForm(formData) {
        const errors = {};
        
        // Required fields
        const requiredFields = ['patientName', 'patientSpecies', 'ownerName', 'ownerPhone'];
        requiredFields.forEach(fieldName => {
            if (!formData[fieldName]?.trim()) {
                errors[fieldName] = 'Dieses Feld ist erforderlich';
            }
        });
        
        // Email validation
        if (formData.ownerEmail?.trim() && !PatientUtils.isValidEmail(formData.ownerEmail)) {
            errors.ownerEmail = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
        }
        
        // Phone validation
        if (formData.ownerPhone?.trim() && !PatientUtils.isValidPhone(formData.ownerPhone)) {
            errors.ownerPhone = 'Bitte geben Sie eine gültige Telefonnummer ein';
        }
        
        // Weight validation
        if (formData.patientWeight && (isNaN(formData.patientWeight) || parseFloat(formData.patientWeight) < 0)) {
            errors.patientWeight = 'Bitte geben Sie ein gültiges Gewicht ein';
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Validate treatment form data
     * @param {Object} formData - Treatment form data
     * @returns {Object} Validation result with errors
     */
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