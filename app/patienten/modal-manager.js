// Modal management for patient system

import { PatientUtils } from './utils.js';

export class ModalManager {
    constructor() {
        this.activeModal = null;
        this.initializeModals();
        this.bindGlobalEvents();
    }

    /**
     * Initialize all modal elements
     */
    initializeModals() {
        this.modals = {
            patient: {
                element: PatientUtils.safeQuerySelector('#patientModal'),
                closeBtn: PatientUtils.safeQuerySelector('#closeModal'),
                cancelBtn: PatientUtils.safeQuerySelector('#cancelBtn'),
                title: PatientUtils.safeQuerySelector('#patientModal .modal-title')
            },
            detail: {
                element: PatientUtils.safeQuerySelector('#patientDetailModal'),
                closeBtn: PatientUtils.safeQuerySelector('#closeDetailModal'),
                content: PatientUtils.safeQuerySelector('#patientDetailContent')
            },
            behandlungsbuch: {
                element: PatientUtils.safeQuerySelector('#behandlungsbuchModal'),
                closeBtn: PatientUtils.safeQuerySelector('#closeBehandlungsbuchModal'),
                patientName: PatientUtils.safeQuerySelector('#behandlungsbuchPatientName')
            }
        };
    }

    /**
     * Bind global modal events
     */
    bindGlobalEvents() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeActiveModal();
            }
        });

        // Close modals on outside click
        Object.values(this.modals).forEach(modal => {
            if (modal.element) {
                modal.element.addEventListener('click', (e) => {
                    if (e.target === modal.element) {
                        this.closeModal(modal.element);
                    }
                });
            }
        });
    }

    /**
     * Open a modal
     * @param {string} modalType - Type of modal to open
     * @param {Object} options - Modal options
     */
    openModal(modalType, options = {}) {
        const modal = this.modals[modalType];
        if (!modal?.element) {
            console.error(`Modal ${modalType} not found`);
            return false;
        }

        // Set modal title if provided
        if (options.title && modal.title) {
            modal.title.textContent = options.title;
        }

        // Set patient name for behandlungsbuch modal
        if (modalType === 'behandlungsbuch' && options.patientName && modal.patientName) {
            modal.patientName.textContent = options.patientName;
        }

        modal.element.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.activeModal = modal.element;

        // Focus first input after animation
        setTimeout(() => {
            const firstInput = modal.element.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);

        return true;
    }

    /**
     * Close a specific modal
     * @param {Element} modalElement - Modal element to close
     */
    closeModal(modalElement) {
        if (!modalElement) return;

        modalElement.classList.remove('active');
        document.body.style.overflow = '';
        
        if (this.activeModal === modalElement) {
            this.activeModal = null;
        }
    }

    /**
     * Close the currently active modal
     */
    closeActiveModal() {
        if (this.activeModal) {
            this.closeModal(this.activeModal);
        }
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        Object.values(this.modals).forEach(modal => {
            if (modal.element) {
                this.closeModal(modal.element);
            }
        });
    }

    /**
     * Bind close events to modal buttons
     * @param {Function} onClose - Callback when modal closes
     */
    bindCloseEvents(onClose) {
        Object.values(this.modals).forEach(modal => {
            if (modal.closeBtn) {
                modal.closeBtn.addEventListener('click', () => {
                    this.closeModal(modal.element);
                    if (onClose) onClose();
                });
            }
            
            if (modal.cancelBtn) {
                modal.cancelBtn.addEventListener('click', () => {
                    this.closeModal(modal.element);
                    if (onClose) onClose();
                });
            }
        });
    }

    /**
     * Get modal element by type
     * @param {string} modalType - Type of modal
     * @returns {Element|null} Modal element
     */
    getModal(modalType) {
        return this.modals[modalType]?.element || null;
    }

    /**
     * Check if any modal is active
     * @returns {boolean} Is modal active
     */
    isModalActive() {
        return this.activeModal !== null;
    }
} 