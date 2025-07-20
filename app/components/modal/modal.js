// Standardized Modal Manager for All Pages

class ModalManager {
    constructor() {
        this.activeModals = [];
        this.modalStack = [];
        this.defaultOptions = {
            size: 'md',
            theme: 'light',
            animation: 'fade-in',
            position: 'center',
            backdrop: true,
            closeOnEscape: true,
            closeOnBackdrop: true,
            focusTrap: true,
            autoFocus: true
        };
        
        this.init();
    }
    
    init() {
        this.bindGlobalEvents();
    }
    
    bindGlobalEvents() {
        // Global escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.length > 0) {
                const topModal = this.activeModals[this.activeModals.length - 1];
                if (topModal.options.closeOnEscape) {
                    this.close(topModal.id);
                }
            }
        });
        
        // Global click handler for backdrop
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') && this.activeModals.length > 0) {
                const topModal = this.activeModals[this.activeModals.length - 1];
                if (topModal.options.closeOnBackdrop) {
                    this.close(topModal.id);
                }
            }
        });
    }
    
    // Create and show a modal
    create(options = {}) {
        const modalId = this.generateId();
        const modalOptions = { ...this.defaultOptions, ...options };
        
        const modal = this.buildModal(modalId, modalOptions);
        document.body.appendChild(modal);
        
        const modalInstance = {
            id: modalId,
            element: modal,
            options: modalOptions,
            isOpen: false
        };
        
        this.modalStack.push(modalInstance);
        this.open(modalId);
        
        return modalInstance;
    }
    
    // Build modal HTML structure
    buildModal(id, options) {
        const modal = document.createElement('div');
        modal.className = `modal modal-${options.theme} modal-${options.animation} modal-${options.position}`;
        modal.id = id;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-hidden', 'true');
        
        const content = document.createElement('div');
        content.className = `modal-content modal-${options.size}`;
        
        // Build header
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const title = document.createElement('h2');
        title.className = 'modal-title';
        title.textContent = options.title || 'Modal';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.setAttribute('aria-label', 'Close modal');
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => this.close(id));
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        // Build body
        const body = document.createElement('div');
        body.className = 'modal-body';
        
        if (options.content) {
            if (typeof options.content === 'string') {
                body.innerHTML = options.content;
            } else if (options.content instanceof HTMLElement) {
                body.appendChild(options.content);
            }
        }
        
        // Build footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        
        if (options.buttons) {
            options.buttons.forEach(button => {
                const btn = document.createElement('button');
                btn.className = `btn ${button.class || 'btn-secondary'}`;
                btn.textContent = button.text;
                btn.addEventListener('click', () => {
                    if (button.action) {
                        button.action();
                    }
                    if (button.close !== false) {
                        this.close(id);
                    }
                });
                footer.appendChild(btn);
            });
        }
        
        content.appendChild(header);
        content.appendChild(body);
        if (options.buttons && options.buttons.length > 0) {
            content.appendChild(footer);
        }
        
        modal.appendChild(content);
        
        return modal;
    }
    
    // Open a modal
    open(modalId) {
        const modalInstance = this.modalStack.find(m => m.id === modalId);
        if (!modalInstance) return;
        
        const modal = modalInstance.element;
        
        // Set focus trap
        if (modalInstance.options.focusTrap) {
            this.setFocusTrap(modal);
        }
        
        // Auto focus
        if (modalInstance.options.autoFocus) {
            setTimeout(() => {
                const focusableElement = modal.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusableElement) {
                    focusableElement.focus();
                }
            }, 100);
        }
        
        // Show modal
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-active');
        
        modalInstance.isOpen = true;
        this.activeModals.push(modalInstance);
        
        // Trigger custom event
        this.triggerEvent('modal:opened', { modalId, modalInstance });
    }
    
    // Close a modal
    close(modalId) {
        const modalInstance = this.modalStack.find(m => m.id === modalId);
        if (!modalInstance || !modalInstance.isOpen) return;
        
        const modal = modalInstance.element;
        
        // Hide modal
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        
        // Remove from active modals
        this.activeModals = this.activeModals.filter(m => m.id !== modalId);
        
        // Restore body scroll and remove modal-active class if no more active modals
        if (this.activeModals.length === 0) {
            document.body.style.overflow = '';
            document.body.classList.remove('modal-active');
        }
        
        modalInstance.isOpen = false;
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            this.modalStack = this.modalStack.filter(m => m.id !== modalId);
        }, 300);
        
        // Trigger custom event
        this.triggerEvent('modal:closed', { modalId, modalInstance });
    }
    
    // Close all modals
    closeAll() {
        this.activeModals.forEach(modal => {
            this.close(modal.id);
        });
    }
    
    // Set focus trap for accessibility
    setFocusTrap(modal) {
        const focusableElements = modal.querySelectorAll(
            'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }
    
    // Update modal content
    updateContent(modalId, content) {
        const modalInstance = this.modalStack.find(m => m.id === modalId);
        if (!modalInstance) return;
        
        const body = modalInstance.element.querySelector('.modal-body');
        if (body) {
            if (typeof content === 'string') {
                body.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                body.innerHTML = '';
                body.appendChild(content);
            }
        }
    }
    
    // Update modal title
    updateTitle(modalId, title) {
        const modalInstance = this.modalStack.find(m => m.id === modalId);
        if (!modalInstance) return;
        
        const titleElement = modalInstance.element.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
    
    // Show loading state
    showLoading(modalId) {
        const modalInstance = this.modalStack.find(m => m.id === modalId);
        if (!modalInstance) return;
        
        const body = modalInstance.element.querySelector('.modal-body');
        if (body) {
            body.innerHTML = `
                <div class="modal-loading">
                    <div class="modal-empty-icon">⏳</div>
                    <div class="modal-empty-title">Laden...</div>
                </div>
            `;
        }
    }
    
    // Show empty state
    showEmpty(modalId, options = {}) {
        const modalInstance = this.modalStack.find(m => m.id === modalId);
        if (!modalInstance) return;
        
        const body = modalInstance.element.querySelector('.modal-body');
        if (body) {
            body.innerHTML = `
                <div class="modal-empty">
                    <div class="modal-empty-icon">${options.icon || '📭'}</div>
                    <div class="modal-empty-title">${options.title || 'Keine Daten'}</div>
                    <div class="modal-empty-description">${options.description || 'Es sind keine Daten verfügbar.'}</div>
                </div>
            `;
        }
    }
    
    // Create form modal
    createFormModal(options = {}) {
        const formOptions = {
            ...options,
            content: this.buildFormContent(options.formFields || []),
            buttons: options.buttons || [
                { text: 'Abbrechen', class: 'btn-secondary', action: () => {} },
                { text: 'Speichern', class: 'btn-primary', action: options.onSubmit || (() => {}) }
            ]
        };
        
        return this.create(formOptions);
    }
    
    // Build form content
    buildFormContent(fields) {
        const form = document.createElement('form');
        form.className = 'modal-form';
        
        fields.forEach(field => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            if (field.label) {
                const label = document.createElement('label');
                label.textContent = field.label;
                if (field.required) {
                    label.innerHTML += ' *';
                }
                formGroup.appendChild(label);
            }
            
            let input;
            switch (field.type) {
                case 'textarea':
                    input = document.createElement('textarea');
                    input.rows = field.rows || 3;
                    break;
                case 'select':
                    input = document.createElement('select');
                    if (field.options) {
                        field.options.forEach(option => {
                            const optionElement = document.createElement('option');
                            optionElement.value = option.value;
                            optionElement.textContent = option.label;
                            input.appendChild(optionElement);
                        });
                    }
                    break;
                default:
                    input = document.createElement('input');
                    input.type = field.type || 'text';
            }
            
            input.name = field.name;
            input.placeholder = field.placeholder || '';
            input.required = field.required || false;
            
            if (field.value) {
                input.value = field.value;
            }
            
            formGroup.appendChild(input);
            form.appendChild(formGroup);
        });
        
        return form;
    }
    
    // Create detail modal
    createDetailModal(options = {}) {
        const detailOptions = {
            ...options,
            content: this.buildDetailContent(options.details || []),
            buttons: options.buttons || [
                { text: 'Schließen', class: 'btn-secondary', action: () => {} }
            ]
        };
        
        return this.create(detailOptions);
    }
    
    // Build detail content
    buildDetailContent(details) {
        const container = document.createElement('div');
        container.className = 'modal-detail';
        
        details.forEach(section => {
            const detailSection = document.createElement('div');
            detailSection.className = 'detail-section';
            
            if (section.title) {
                const title = document.createElement('h3');
                title.className = 'detail-section-title';
                title.textContent = section.title;
                detailSection.appendChild(title);
            }
            
            if (section.items) {
                section.items.forEach(item => {
                    const row = document.createElement('div');
                    row.className = 'detail-row';
                    
                    const label = document.createElement('span');
                    label.className = 'detail-label';
                    label.textContent = item.label;
                    
                    const value = document.createElement('span');
                    value.className = 'detail-value';
                    value.textContent = item.value || '-';
                    
                    row.appendChild(label);
                    row.appendChild(value);
                    detailSection.appendChild(row);
                });
            }
            
            container.appendChild(detailSection);
        });
        
        return container;
    }
    
    // Create list modal
    createListModal(options = {}) {
        const listOptions = {
            ...options,
            content: this.buildListContent(options.items || []),
            buttons: options.buttons || [
                { text: 'Schließen', class: 'btn-secondary', action: () => {} }
            ]
        };
        
        return this.create(listOptions);
    }
    
    // Build list content
    buildListContent(items) {
        const container = document.createElement('div');
        container.className = 'modal-list';
        
        items.forEach(item => {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = item.content;
            
            if (item.onClick) {
                listItem.style.cursor = 'pointer';
                listItem.addEventListener('click', item.onClick);
            }
            
            container.appendChild(listItem);
        });
        
        return container;
    }
    
    // Utility methods
    generateId() {
        return 'modal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    triggerEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }
    
    // Get modal instance
    getModal(modalId) {
        return this.modalStack.find(m => m.id === modalId);
    }
    
    // Check if modal is open
    isOpen(modalId) {
        const modalInstance = this.getModal(modalId);
        return modalInstance ? modalInstance.isOpen : false;
    }
    
    // Get active modals count
    getActiveCount() {
        return this.activeModals.length;
    }
}

// Create global modal manager instance
window.ModalManager = ModalManager;
window.modalManager = new ModalManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalManager;
} 